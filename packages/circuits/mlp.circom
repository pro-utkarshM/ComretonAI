// mlp.circom (Corrected Version 3 - Quadratic Constraints)
pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

// ReLU activation function: max(0, in)
template ReLU() {
    signal input in;
    signal output out;

    component lt = LessThan(252);
    lt.in[0] <== 0;
    lt.in[1] <== in;

    out <== in * lt.out;
}

template MLP() {
    // === Inputs ===
    signal input weights_L1[2][3];
    signal input biases_L1[3];
    signal input weights_L2[3][1];
    signal input biases_L2[1];
    signal input model_input[2];
    signal input model_output;
    
    // === Intermediate Signals ===
    signal hidden_layer[3];
    signal hidden_layer_activated[3];
    signal output_layer;

    // We need intermediate signals for our matrix multiplication steps
    signal L1_prod[2][3];
    signal L2_prod[3];

    // === Components ===
    component relu[3];

    var SCALING_FACTOR = 1000;

    // === Circuit Logic ===
    // --- Layer 1 Computations (Fixed for Quadratic Constraints) ---
    for (var i = 0; i < 3; i++) {
        // Step 1: Perform multiplications and store in intermediate signals
        L1_prod[0][i] <== weights_L1[0][i] * model_input[0];
        L1_prod[1][i] <== weights_L1[1][i] * model_input[1];
        
        // Step 2: Sum the intermediate products and the scaled bias. This is now a linear combination.
        hidden_layer[i] <== L1_prod[0][i] + L1_prod[1][i] + (biases_L1[i] * SCALING_FACTOR);
        
        // Step 3: Apply ReLU
        relu[i] = ReLU();
        relu[i].in <== hidden_layer[i];
        hidden_layer_activated[i] <== relu[i].out;
    }

    // --- Layer 2 Computations (Fixed for Quadratic Constraints) ---
    // Step 1: Perform multiplications
    L2_prod[0] <== weights_L2[0][0] * hidden_layer_activated[0];
    L2_prod[1] <== weights_L2[1][0] * hidden_layer_activated[1];
    L2_prod[2] <== weights_L2[2][0] * hidden_layer_activated[2];

    // Step 2: Sum the products and the scaled bias
    output_layer <== L2_prod[0] + L2_prod[1] + L2_prod[2] + (biases_L2[0] * SCALING_FACTOR * SCALING_FACTOR);

    // --- Final Constraint ---
    model_output * SCALING_FACTOR * SCALING_FACTOR === output_layer;
}

// Instantiate the main component
component main {public [model_output]} = MLP();