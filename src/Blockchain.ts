import Block from "./Block";

export default class Blockchain {

    chain: Array<Block>;
    constructor(){
        this.chain = [];
    }

    public add(block: Block) {
        this.chain.push(block);
    }

    public getLastBlock() {
        if (this.chain.length > 0) {
          return this.chain[this.chain.length - 1];
        } else {
          throw new Error("Blockchain is empty");
        }
    }

    public isValid(): boolean {
        let previous: string = null;
        let status: boolean = true;

        this.chain.forEach( (block) => {
            if (previous !== block.previous || ! block.isValid())
                status = false;
            previous = block.id;
        });

        return status;
    }


}