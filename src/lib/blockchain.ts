import SHA256 from 'crypto-js/sha256';

export class Block {
  public index: number;
  public timestamp: number;
  public data: string;
  public previousHash: string;
  public hash: string;
  public nonce: number;
  public isValid: boolean = true; 

  constructor(index: number, timestamp: number, data: string, previousHash: string = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return SHA256(
      this.index +
      this.previousHash +
      this.timestamp +
      this.data +
      this.nonce
    ).toString();
  }

  mineBlock(difficulty: number): void {
    const target = Array(difficulty + 1).join('0');

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log("Block mined: " + this.hash);
  }
}

export class Blockchain {
  public chain: Block[];
  public difficulty: number;

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
  }

  createGenesisBlock(): Block {
    return new Block(0, Date.now(), "Genesis Block", "0");
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data: string): void {
    const previousBlock = this.getLatestBlock();
    
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      data,
      previousBlock.hash
    );

    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}