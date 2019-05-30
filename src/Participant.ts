import Block from "./Block";

export default class Participant {
    name: string;
    power: number;
    block: Block;
    constructor(name: string, power = 1) {
        this.name = name;
        this.power = power;
    }
  
    public generateBlock(previous: Block, difficulty: number) {
        this.block = new Block(previous.index + 1, previous.id, difficulty, this.name);
    }
  
    public tick(): Block {
      for (let i: number = 0; i < this.power; i++) {
        if (this.block.isValid()) {
          return this.block;
        } else {
          this.block.nonce++;
          this.block.id = this.block.getHash();
        }
      }
      return null;
    }
  }