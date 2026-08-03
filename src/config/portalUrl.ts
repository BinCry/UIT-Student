const OBFUSCATION_KEY = 37;
const ENCODED_PORTAL_URL = [
  77, 81, 81, 85, 86, 31, 10, 10, 85, 74, 87, 81, 68, 73, 11, 80, 76, 81, 11,
  64, 65, 80, 11, 83, 75,
];

// Build the URL at runtime so the domain is not stored as a plaintext literal.
export const portalUrl = String.fromCharCode(
  ...ENCODED_PORTAL_URL.map((code) => code ^ OBFUSCATION_KEY),
);
