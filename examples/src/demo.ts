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

  // Method 1: Generate proof using index
  const proofIndex = 0;
  console.log(
    `\nMethod 1 - Generating proof using index ${proofIndex} (${data[proofIndex].value})`
  );

  const proofByIndex = merkleTree.getProof(proofIndex);
  console.log("Proof by index:", {
    leaf: proofByIndex.leaf,
    proofElements: proofByIndex.proof,
    root: proofByIndex.root,
  });

  // Method 2: Generate proof using value
  const valueToProve = "Hello Merkle Tree";
  console.log(
    `\nMethod 2 - Generating proof using value "${valueToProve}"`
  );

  const proofByValue = merkleTree.getProofByValue(valueToProve, "string");
  console.log("Proof by value:", {
    leaf: proofByValue.leaf,
    proofElements: proofByValue.proof,
    root: proofByValue.root,
  });

  // Verify both proofs
  const isValidIndex = merkleTree.verify(proofByIndex);
  const isValidValue = merkleTree.verify(proofByValue);
  
  console.log("\nProof Verifications:");
  console.log("Index-based proof:", isValidIndex ? "Valid ✅" : "Invalid ❌");
  console.log("Value-based proof:", isValidValue ? "Valid ✅" : "Invalid ❌");

  // Example of generating proofs for all elements using values
  console.log("\nGenerating and verifying proofs for all elements using values:");
  data.forEach((item) => {
    const itemProof = merkleTree.getProofByValue(item.value, item.type);
    const isValidProof = merkleTree.verify(itemProof);
    console.log(`Value "${item.value}": ${isValidProof ? "Valid ✅" : "Invalid ❌"}`);
  });
}

main().catch(console.error);
