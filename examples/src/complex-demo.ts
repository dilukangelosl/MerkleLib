import { MerkleTree } from '@dilukangelo/merklelib';
import type { SolidityType } from '@dilukangelo/merklelib';
import { ethers } from 'ethers';
import keccak256 from 'keccak256';

// Example of handling complex leaf types (address, uint256, uint256)
interface ComplexData {
  address: string;
  amount1: string;
  amount2: string;
}

// Helper function to hash complex data into a single value
function hashComplexData(data: ComplexData): string {
  // Encode each value according to its type
  const encodedAddress = Buffer.from(ethers.getAddress(data.address).slice(2), 'hex');
  const encodedAmount1 = Buffer.from(ethers.toBigInt(data.amount1).toString(16).padStart(64, '0'), 'hex');
  const encodedAmount2 = Buffer.from(ethers.toBigInt(data.amount2).toString(16).padStart(64, '0'), 'hex');
  
  // Concatenate all encoded values
  const concatenated = Buffer.concat([encodedAddress, encodedAmount1, encodedAmount2]);
  
  // Hash the concatenated values
  return '0x' + keccak256(concatenated).toString('hex');
}

async function main() {
  // Example complex data
  const complexData = [
    {
      address: "0x1234567890123456789012345678901234567890",
      amount1: "1000000000000000000", // 1 ETH
      amount2: "2000000000000000000"  // 2 ETH
    },
    {
      address: "0x2234567890123456789012345678901234567890",
      amount1: "3000000000000000000", // 3 ETH
      amount2: "4000000000000000000"  // 4 ETH
    }
  ];

  // Convert complex data into leaf nodes
  const leafType: SolidityType = 'bytes32';
  const leaves = complexData.map(data => ({
    value: hashComplexData(data),
    type: leafType
  }));

  // Create Merkle tree
  const merkleTree = new MerkleTree(leaves);
  
  console.log("Merkle Root:", merkleTree.getRoot());

  // Generate and verify proof for the first complex data entry
  const firstLeafHash = hashComplexData(complexData[0]);
  const proof = merkleTree.getProofByValue(firstLeafHash, leafType);
  
  console.log("\nProof for first entry:", {
    originalData: complexData[0],
    hashedValue: firstLeafHash,
    proof: proof.proof,
    isValid: merkleTree.verify(proof)
  });
}

main().catch(console.error);
