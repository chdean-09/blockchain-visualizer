import SHA256 from 'crypto-js/sha256';

export class Block {
  public index: number;
  public timestamp: number;
  public data: string = $state('');
  public previousHash: string = $state('');
  public hash: string = $state('');
  public nonce: number = $state(0);
  public mineTime: number | null = $state(null);
  public isMining: boolean = $state(false);

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

  async mineBlock(difficulty: number, onProgress?: () => void): Promise<void> {
    const target = Array(difficulty + 1).join('0');
    const updateSpeedArray = [1, 3, 50, 500];

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();

      if (this.nonce % updateSpeedArray[difficulty - 1] === 0) {
        if (onProgress) onProgress();
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
  }

  mineBlockSync(difficulty: number) {
    const target = Array(difficulty + 1).join('0');

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

export class Blockchain {
  public chain: Block[] = $state([]);
  public difficulty: number = $state(2);

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
  }

  createGenesisBlock(): Block {
    const genesisBlock = new Block(0, Date.now(), 'Genesis Block', '0');

    genesisBlock.mineBlockSync(this.difficulty);
    return genesisBlock;
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data: string): void {
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      data,
      this.getLatestBlock().hash
    );

    newBlock.mineBlockSync(this.difficulty);
    this.chain.push(newBlock);
  }

  isChainValid(difficulty: number): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
        return false;
      }

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
