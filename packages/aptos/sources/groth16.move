module comreton_verifier::groth16 {
    /// Stubbed pairing check: always returns `true`
    public fun bn254_pairing_check(
        _a: vector<u8>,
        _b: vector<u8>,
        _alpha_1: vector<u8>,
        _beta_2: vector<u8>,
        _inputs: vector<vector<u8>>,
        _ic: vector<vector<u8>>,
        _gamma_2: vector<u8>,
        _delta_2: vector<u8>,
        _c: vector<u8>
    ): bool {
        true
    }
}
