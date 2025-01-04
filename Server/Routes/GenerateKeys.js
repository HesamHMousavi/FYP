const forge = require("node-forge");

// Generate key pair

const generateRSAKeys = () => {
  const rsa = forge.pki.rsa;
  const keypair = rsa.generateKeyPair({ bits: 2048 });
  return {
    publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
    privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
  };
};
module.exports = generateRSAKeys;
