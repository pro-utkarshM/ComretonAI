// converter.mjs (Definitive Final Version)
import * as fs from 'fs';

const vkeyPath = './packages/circuits/verification_key.json';
const vkey = JSON.parse(fs.readFileSync(vkeyPath));

function toMoveHex(value) {
  // 1. Flatten any nested arrays into a single array of hex strings.
  const flatArray = Array.isArray(value) ? value.flat(Infinity) : [value];

  // 2. Process EACH hex string individually.
  const processedParts = flatArray.map(s => {
    // Remove '0x' prefix
    let part = s.startsWith('0x') ? s.substring(2) : s;
    // Pad with a leading zero if its length is odd. THIS IS THE CRITICAL FIX.
    if (part.length % 2 !== 0) {
      part = '0' + part;
    }
    return part;
  });

  // 3. Join the correctly-padded parts and format for Move.
  return `x"${processedParts.join('')}"`;
}

console.log('// --- AUTO-GENERATED VERIFICATION KEY ---');
console.log(`const VK_ALPHA_1: vector<u8> = ${toMoveHex(vkey.vk_alpha_1)};`);
console.log(`const VK_BETA_2: vector<u8> = ${toMoveHex(vkey.vk_beta_2)};`);
console.log(`const VK_GAMMA_2: vector<u8> = ${toMoveHex(vkey.vk_gamma_2)};`);
console.log(`const VK_DELTA_2: vector<u8> = ${toMoveHex(vkey.vk_delta_2)};\n`);

const ic = vkey.IC.map((c, i) => `        // IC[${i}]
        ${toMoveHex(c)}`).join(',\n');

console.log('fun get_ic(): vector<vector<u8>> {');
console.log('    vector[\n' + ic + '\n    ]');
console.log('}');
console.log('// --- END AUTO-GENERATED VERIFICATION KEY ---');