import { MerkleTree } from '@dilukangelo/merklelib';
import type { LeafNode, SolidityType } from '@dilukangelo/merklelib';

// Example data with different Solidity types
const data: LeafNode[] = [
  { value: "0x1234567890123456789012345678901234567890", type: "address" },
  { value: "1000000000000000000", type: "uint256" }, // 1 ETH in wei
  { value: "Hello Merkle Tree", type: "string" },
  { value: true, type: "bool" },
  {
    value: "0x1234567890123456789012345678901234567890123456789012345678901234",
    type: "bytes32",
  },
];

async function main() {
  // Create a new Merkle Tree
  console.log("Creating Merkle Tree with the following leaves:");
  data.forEach((item, index) => {
    console.log(`Leaf ${index}: ${item.value} (${item.type})`);
  });

  const merkleTree = new MerkleTree(data);

  // Get and display the Merkle root
  const root = merkleTree.getRoot();
  console.log("\nMerkle Root:", root);

  // Generate and verify a proof for the first element
  const proofIndex = 0;
  console.log(
    `\nGenerating proof for leaf ${proofIndex} (${data[proofIndex].value})`
  );

  const proof = merkleTree.getProof(proofIndex);
  console.log("Proof:", {
    leaf: proof.leaf,
    proofElements: proof.proof,
    root: proof.root,
  });

  // Verify the proof
  const isValid = merkleTree.verify(proof);
  console.log("\nProof verification:", isValid ? "Valid ✅" : "Invalid ❌");

  // Example of generating proofs for all elements
  console.log("\nGenerating and verifying proofs for all elements:");
  data.forEach((_, index) => {
    const itemProof = merkleTree.getProof(index);
    const isValidProof = merkleTree.verify(itemProof);
    console.log(`Leaf ${index}: ${isValidProof ? "Valid ✅" : "Invalid ❌"}`);
  });
}

main().catch(console.error);
