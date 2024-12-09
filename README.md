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

## Example with Smart Contract Integration

```solidity
// Example Solidity verification
contract MerkleVerifier {
    bytes32 public root;

    constructor(bytes32 _root) {
        root = _root;
    }

    function verify(
        bytes32[] memory proof,
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

        return computedHash == root;
    }
}
```

## License

MIT
