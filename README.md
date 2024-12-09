# MerkleLib

A TypeScript library for generating Merkle trees and proofs with Solidity data types support. This library makes it easy to create Merkle trees with various Solidity data types and generate proofs for verification.

## Installation

```bash
npm install @dilukangelo/merklelib
```

## Usage

```typescript
import { MerkleTree, LeafNode } from '@dilukangelo/merklelib';

// Example with different Solidity types
const data: LeafNode[] = [
  { value: '0x1234567890123456789012345678901234567890', type: 'address' },
  { value: '1000000000000000000', type: 'uint256' },
  { value: true, type: 'bool' },
  { value: 'Hello World', type: 'string' }
];

// Create a new Merkle Tree
const merkleTree = new MerkleTree(data);

// Get the Merkle root
const root = merkleTree.getRoot();
console.log('Merkle Root:', root);

// Get proof for the first element (index 0)
const proof = merkleTree.getProof(0);
console.log('Proof:', proof);

// Verify the proof
const isValid = merkleTree.verify(proof);
console.log('Proof is valid:', isValid);
```

## NFT Whitelist Example

Here's a complete example of implementing an NFT whitelist using MerkleLib:

### TypeScript Setup (Frontend/Scripts)

```typescript
import { MerkleTree, LeafNode } from '@dilukangelo/merklelib';

// Whitelist addresses
const whitelistAddresses = [
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  // ... more addresses
];

// Convert addresses to LeafNode format
const leaves: LeafNode[] = whitelistAddresses.map(address => ({
  value: address,
  type: 'address'
}));

// Create Merkle Tree
const merkleTree = new MerkleTree(leaves);

// Get root for contract deployment
const root = merkleTree.getRoot();
console.log('Merkle Root:', root);

// Generate proof for a specific address (example for first address)
const proof = merkleTree.getProof(0);
console.log('Proof for address:', proof);

// Verify the proof
const isValid = merkleTree.verify(proof);
console.log('Proof is valid:', isValid);
```

### Solidity Smart Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WhitelistNFT is ERC721, Ownable {
    bytes32 public merkleRoot;
    uint256 public maxSupply = 1000;
    uint256 public currentTokenId;
    mapping(address => bool) public claimed;

    constructor(bytes32 _merkleRoot) ERC721("WhitelistNFT", "WNFT") {
        merkleRoot = _merkleRoot;
    }

    function mint(bytes32[] calldata proof) external {
        require(!claimed[msg.sender], "Already claimed");
        require(currentTokenId < maxSupply, "Max supply reached");
        require(
            verifyProof(proof, keccak256(abi.encodePacked(msg.sender))),
            "Invalid proof"
        );

        claimed[msg.sender] = true;
        _safeMint(msg.sender, currentTokenId);
        currentTokenId++;
    }

    function verifyProof(
        bytes32[] calldata proof,
        bytes32 leaf
    ) public view returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == merkleRoot;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }
}
```

### Using the Whitelist (Frontend Example)

```typescript
// Example using ethers.js
import { ethers } from 'ethers';
import { MerkleTree, LeafNode } from '@dilukangelo/merklelib';

async function mintNFT(
    contractAddress: string,
    userAddress: string,
    whitelistAddresses: string[]
) {
    // Create Merkle Tree
    const leaves: LeafNode[] = whitelistAddresses.map(addr => ({
        value: addr,
        type: 'address'
    }));
    const merkleTree = new MerkleTree(leaves);

    // Find index of user address
    const userIndex = whitelistAddresses.indexOf(userAddress);
    if (userIndex === -1) throw new Error('Address not whitelisted');

    // Get proof for user
    const proof = merkleTree.getProof(userIndex);

    // Connect to contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, ABI, signer);

    // Mint NFT
    const tx = await contract.mint(proof.proof);
    await tx.wait();

    console.log('NFT minted successfully!');
}
```

## Supported Solidity Types

- `address`
- `uint256`
- `uint128`
- `uint64`
- `uint32`
- `uint16`
- `uint8`
- `string`
- `bytes32`
- `bool`

## API Reference

### MerkleTree Class

#### Constructor

```typescript
constructor(data: LeafNode[], options?: MerkleTreeOptions)
```

- `data`: Array of leaf nodes with values and their Solidity types
- `options`: Optional configuration
  - `sortPairs`: Boolean to determine if pairs should be sorted before hashing (default: true)

#### Methods

##### `getRoot(): string`
Returns the Merkle root as a hex string.

##### `getProof(index: number): MerkleProof`
Generates a Merkle proof for the leaf at the specified index.
- Returns: `MerkleProof` object containing:
  - `leaf`: The leaf value
  - `proof`: Array of proof elements
  - `root`: The Merkle root

##### `verify(proof: MerkleProof): boolean`
Verifies a Merkle proof.
- Returns: Boolean indicating if the proof is valid

## License

MIT
