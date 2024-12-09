import { ethers } from 'ethers';
import keccak256 from 'keccak256';
import { SolidityType, LeafNode, MerkleTreeOptions, MerkleProof, IMerkleTree } from './types';

export class MerkleTree implements IMerkleTree {
  private leaves: string[];
  private readonly sortPairs: boolean;

  constructor(private readonly data: LeafNode[], options: MerkleTreeOptions = {}) {
    if (!data || data.length === 0) {
      throw new Error('Data array cannot be empty');
    }
    this.sortPairs = options.sortPairs ?? true;
    this.leaves = this.generateLeaves();
  }

  private generateLeaves(): string[] {
    return this.data.map(item => this.hashLeaf(item));
  }

  private hashLeaf(leaf: LeafNode): string {
    const value = this.encodeSolidityValue(leaf.value, leaf.type);
    return '0x' + keccak256(value).toString('hex');
  }

  private encodeSolidityValue(value: any, type: SolidityType): Buffer {
    switch (type) {
      case 'address':
        return Buffer.from(ethers.getAddress(value).slice(2), 'hex');
      case 'uint256':
      case 'uint128':
      case 'uint64':
      case 'uint32':
      case 'uint16':
      case 'uint8':
        return Buffer.from(ethers.toBigInt(value).toString(16).padStart(64, '0'), 'hex');
      case 'string':
        return Buffer.from(value);
      case 'bytes32':
        return Buffer.from(value.slice(2), 'hex');
      case 'bool':
        return Buffer.from(value ? '01' : '00', 'hex');
      default:
        throw new Error(`Unsupported Solidity type: ${type}`);
    }
  }

  private hashPair(left: string, right: string): string {
    let leftBuf = Buffer.from(left.slice(2), 'hex');
    let rightBuf = Buffer.from(right.slice(2), 'hex');

    if (this.sortPairs && left > right) {
      [leftBuf, rightBuf] = [rightBuf, leftBuf];
    }

    const concat = Buffer.concat([leftBuf, rightBuf]);
    return '0x' + keccak256(concat).toString('hex');
  }

  public getRoot(): string {
    if (this.leaves.length === 0) {
      throw new Error('No leaves in the tree');
    }

    let level = this.leaves;

    while (level.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        if (i + 1 === level.length) {
          nextLevel.push(level[i]);
        } else {
          nextLevel.push(this.hashPair(level[i], level[i + 1]));
        }
      }
      level = nextLevel;
    }

    return level[0];
  }

  public getProofByValue(value: any, type: SolidityType): MerkleProof {
    const leafToFind = { value, type };
    const leafHash = this.hashLeaf(leafToFind);
    const index = this.leaves.findIndex(leaf => leaf === leafHash);
    
    if (index === -1) {
      throw new Error('Value not found in the Merkle tree');
    }

    return this.getProof(index);
  }

  public getProof(index: number): MerkleProof {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error('Index out of bounds');
    }

    let currentIndex = index;
    const proof: string[] = [];
    let level = this.leaves;

    while (level.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        if (i + 1 === level.length) {
          nextLevel.push(level[i]);
        } else {
          nextLevel.push(this.hashPair(level[i], level[i + 1]));
          if (i === currentIndex || i + 1 === currentIndex) {
            proof.push(i === currentIndex ? level[i + 1] : level[i]);
          }
        }
      }
      currentIndex = Math.floor(currentIndex / 2);
      level = nextLevel;
    }

    return {
      leaf: this.leaves[index],
      proof,
      root: this.getRoot()
    };
  }

  public verify(proof: MerkleProof): boolean {
    let current = proof.leaf;
    
    for (const proofElement of proof.proof) {
      current = this.hashPair(current, proofElement);
    }

    return current === proof.root;
  }
}
