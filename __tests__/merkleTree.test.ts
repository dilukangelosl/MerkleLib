import { MerkleTree, LeafNode } from '../src';

describe('MerkleTree', () => {
  describe('Basic Functionality', () => {
    let merkleTree: MerkleTree;
    const testData: LeafNode[] = [
      { value: '0x1234567890123456789012345678901234567890', type: 'address' },
      { value: '1000000000000000000', type: 'uint256' },
      { value: true, type: 'bool' },
      { value: 'Hello World', type: 'string' }
    ];

    beforeEach(() => {
      merkleTree = new MerkleTree(testData);
    });

    test('should create a Merkle tree with valid root', () => {
      const root = merkleTree.getRoot();
      expect(root).toBeDefined();
      expect(root.startsWith('0x')).toBe(true);
      expect(root.length).toBe(66); // 0x + 64 chars (32 bytes)
    });

    test('should generate valid proof for each leaf', () => {
      testData.forEach((_, index) => {
        const proof = merkleTree.getProof(index);
        expect(proof).toBeDefined();
        expect(proof.proof).toBeInstanceOf(Array);
        expect(proof.root).toBe(merkleTree.getRoot());
        expect(merkleTree.verify(proof)).toBe(true);
      });
    });

    test('should fail verification with invalid proof', () => {
      const proof = merkleTree.getProof(0);
      // Modify the proof to make it invalid
      proof.proof[0] = '0x' + '1'.repeat(64);
      expect(merkleTree.verify(proof)).toBe(false);
    });
  });

  describe('Solidity Data Types', () => {
    test('should handle address type correctly', () => {
      const addresses: LeafNode[] = [
        { value: '0x1234567890123456789012345678901234567890', type: 'address' },
        { value: '0x2345678901234567890123456789012345678901', type: 'address' }
      ];
      const tree = new MerkleTree(addresses);
      const proof = tree.getProof(0);
      expect(tree.verify(proof)).toBe(true);
    });

    test('should handle uint256 type correctly', () => {
      const numbers: LeafNode[] = [
        { value: '1000000000000000000', type: 'uint256' },
        { value: '2000000000000000000', type: 'uint256' }
      ];
      const tree = new MerkleTree(numbers);
      const proof = tree.getProof(0);
      expect(tree.verify(proof)).toBe(true);
    });

    test('should handle bool type correctly', () => {
      const bools: LeafNode[] = [
        { value: true, type: 'bool' },
        { value: false, type: 'bool' }
      ];
      const tree = new MerkleTree(bools);
      const proof = tree.getProof(0);
      expect(tree.verify(proof)).toBe(true);
    });

    test('should handle string type correctly', () => {
      const strings: LeafNode[] = [
        { value: 'Hello', type: 'string' },
        { value: 'World', type: 'string' }
      ];
      const tree = new MerkleTree(strings);
      const proof = tree.getProof(0);
      expect(tree.verify(proof)).toBe(true);
    });
  });

  describe('NFT Whitelist Use Case', () => {
    const whitelistAddresses: LeafNode[] = [
      { value: '0x1234567890123456789012345678901234567890', type: 'address' },
      { value: '0x2345678901234567890123456789012345678901', type: 'address' },
      { value: '0x3456789012345678901234567890123456789012', type: 'address' },
      { value: '0x4567890123456789012345678901234567890123', type: 'address' }
    ];

    let merkleTree: MerkleTree;

    beforeEach(() => {
      merkleTree = new MerkleTree(whitelistAddresses);
    });

    test('should generate valid root for whitelist', () => {
      const root = merkleTree.getRoot();
      expect(root).toBeDefined();
      expect(root.startsWith('0x')).toBe(true);
    });

    test('should generate valid proof for whitelisted address', () => {
      const proof = merkleTree.getProof(0);
      expect(merkleTree.verify(proof)).toBe(true);
    });

    test('should handle multiple proof verifications', () => {
      whitelistAddresses.forEach((_, index) => {
        const proof = merkleTree.getProof(index);
        expect(merkleTree.verify(proof)).toBe(true);
      });
    });

    test('should maintain consistent root with same data', () => {
      const tree1 = new MerkleTree(whitelistAddresses);
      const tree2 = new MerkleTree(whitelistAddresses);
      expect(tree1.getRoot()).toBe(tree2.getRoot());
    });
  });

  describe('Error Handling', () => {
    test('should throw error for empty data', () => {
      expect(() => new MerkleTree([])).toThrow();
    });

    test('should throw error for invalid index in getProof', () => {
      const tree = new MerkleTree([
        { value: '0x1234567890123456789012345678901234567890', type: 'address' }
      ]);
      expect(() => tree.getProof(-1)).toThrow();
      expect(() => tree.getProof(1)).toThrow();
    });

    test('should throw error for invalid data type', () => {
      expect(() => new MerkleTree([
        { value: '0x1234567890123456789012345678901234567890', type: 'invalid' as any }
      ])).toThrow();
    });
  });
});
