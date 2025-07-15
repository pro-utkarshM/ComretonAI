import { groth16 } from 'snarkjs';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function run() {
    const circuitName = "mlp";

    // --- 1. COMPILE THE CIRCUIT ---
    console.log("Compiling circuit...");
    // This command is fast and still necessary
    await execAsync(`circom ${circuitName}.circom --r1cs --wasm --sym -l node_modules`);
    console.log("Circuit compiled.");

    // --- 2. USE PRE-COMPUTED TRUSTED SETUP ---
    console.log("\nUsing pre-computed Powers of Tau file...");
    // We point to the file we just downloaded.
    const ptauFile = "powersOfTau28_hez_final_12.ptau";
    if (!fs.existsSync(ptauFile)) {
        console.error(`Error: Powers of Tau file not found at ${ptauFile}. Please run the wget command again.`);
        process.exit(1);
    }
    console.log("  Found Powers of Tau file.");
    
    // THE SLOW STEPS ARE NOW SKIPPED!
    // console.log("\nStarting trusted setup...");
    // await execAsync(`npx snarkjs powersoftau new bn128 12 pot12_0000.ptau -v`);
    // await execAsync(`npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="ComretonAI Setup" -v`);

    // --- 3. GENERATE PROVING & VERIFICATION KEYS ---
    console.log("\nGenerating proving and verification keys...");
    const zkeyFile = `${circuitName}.zkey`;
    const vkeyFile = "verification_key.json";
    // This step is fast. It uses the downloaded .ptau file.
    await execAsync(`npx snarkjs groth16 setup ${circuitName}.r1cs ${ptauFile} ${zkeyFile}`);
    await execAsync(`npx snarkjs zkey export verificationkey ${zkeyFile} ${vkeyFile}`);
    console.log("Keys generated.");

    // --- 4. PREPARE INPUTS & GENERATE PROOF ---
    console.log("\nCalculating witness and generating proof...");
    const scalingFactor = 1000;

    const inputs = {
        weights_L1: [[100, -100, 50], [200, -50, 150]], 
        biases_L1: [10, 20, -10],
        weights_L2: [[300], [-200], [500]],
        biases_L2: [50],
        model_input: [1500, -2000],
    };

    let hidden = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
        const z = (inputs.weights_L1[0][i] * inputs.model_input[0]) + 
                  (inputs.weights_L1[1][i] * inputs.model_input[1]) + 
                  (inputs.biases_L1[i] * scalingFactor);
        hidden[i] = Math.max(0, z);
    }
    
    const outputLayer = (hidden[0] * inputs.weights_L2[0][0]) + 
                        (hidden[1] * inputs.weights_L2[1][0]) + 
                        (hidden[2] * inputs.weights_L2[2][0]) + 
                        (inputs.biases_L2[0] * scalingFactor * scalingFactor);

    const finalOutput = Math.round(outputLayer / (scalingFactor * scalingFactor));
    
    console.log(`  Calculated Output: ${finalOutput}`);
    inputs.model_output = finalOutput;

    const { proof, publicSignals } = await groth16.fullProve(inputs, `${circuitName}_js/${circuitName}.wasm`, zkeyFile);
    console.log("  Proof generated.");
    fs.writeFileSync('proof.json', JSON.stringify(proof, null, 1));
    fs.writeFileSync('public.json', JSON.stringify(publicSignals, null, 1));


    // --- 5. VERIFY THE PROOF ---
    console.log("\nVerifying proof...");
    const vKey = JSON.parse(fs.readFileSync(vkeyFile));
    const isValid = await groth16.verify(vKey, publicSignals, proof);

    if (isValid) {
        console.log("✅ Verification OK");
    } else {
        console.error("❌ Invalid Proof");
        process.exit(1);
    }
    
    console.log("\n🎉 Phase 0 Complete! Core ZKP components are working correctly. 🎉");
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
