import { createHash } from 'crypto';

export default class Block {
    
    index : number;
    data: string;
    previous: string;
    id: string;
    difficulty: number;
    nonce: number;
    constructor(index: number, previous: string, difficulty: number, data: string){
        this.index = index;
        this.data = data;
        this.previous = previous;
        this.difficulty = difficulty;
        this.nonce = 0;
        this.id = null;
    }

    public getHash(): string{
        const serialized_payload: string = `${this.index}${this.previous}${this.data}${this.nonce}`;
        return createHash('sha256')
            .update(serialized_payload, 'utf8')
            .digest('hex');
    }

    public isValid(): boolean{
        if(this.id !== this.getHash() || (! this.id.startsWith( '0'.repeat(this.difficulty)))){
            return false;
        }
        return true;
    }

    public miner(){
        let hash: string = this.getHash()
        while (! hash.startsWith( '0'.repeat(this.difficulty))){
            this.nonce += 1;
            hash = this.getHash();
        }
        this.id = hash;
    }

}