export type SolidityType = 'address' | 'uint256' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'string' | 'bytes32' | 'bool';

export interface LeafNode {
  value: any;
  type: SolidityType;
}

export interface MerkleTreeOptions {
  sortPairs?: boolean;
}

export interface MerkleProof {
  leaf: string;
  proof: string[];
  root: string;
}

export interface IMerkleTree {
  getRoot(): string;
  getProof(index: number): MerkleProof;
  getProofByValue(value: any, type: SolidityType): MerkleProof;
  verify(proof: MerkleProof): boolean;
}
