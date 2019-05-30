import RSATools from "./RSAtools"
import * as crypto from "crypto"
import { access } from "fs";

export class Transaction {

    // @params inputs : un tableau de Input
    // @params outputs : un tableau de Output
    id: string;
    inputs: Array<Input>;
    outputs: Array<Output>;
    constructor(inputs: Array<Input>, outputs: Array<Output>) {
        this.inputs = inputs;
        this.outputs = outputs;
        const serialized: string = this.serialize(); 
        this.id = crypto.createHash('sha256').update(serialized, 'utf8').digest('hex'); // ...
    }
  
    private serializeOutputs(): string {
        return this.outputs.map((output) => {return output.serialize}).join('');
    }

    private serializeInputs(): string {
        return this.inputs.map((input) => {return input.serialize}).join('');
    }

    public serialize(): string {
        return `${this.serializeInputs}${this.serializeOutputs}` 
    }

    // Retourne le hash du Tx : hash des inputs + hash des outputs
    public getHash(): string {
        const hashInputs: string = this.inputs.map((input) => {return input.getHash}).join('');
        const hashOutputs: string = this.outputs.map((output) => {return output.getHash}).join('');
        const serialized: string = `${hashInputs}${hashOutputs}`;
        return crypto.createHash('sha256').update(serialized, 'utf8').digest('hex');
    }
}

export class UnspentOutput {
    tx: Transaction;
    index: number;
    constructor(tx: Transaction, index: number){
        this.tx = tx;
        this.index = index;
    }
}
  
export class Input {
    // @params tx : transaction dans laquelle est le Output que j'utilise
    // @params index : index du Output dans le outputs de la transaction
    // @params signature : signature du destinataire du Output
    tx: Transaction;
    index: number;
    hash: string;
    signature: string;
    constructor(tx: Transaction, index: number, signature = undefined) {
        this.tx = tx;
        this.index = index;
        this.hash = this.getHash();
        this.signature = signature;
    }

    public serialize(): string {
      return `${this.tx.id}${this.index}${this.signature}`;
    }
  
    // Calcule la signature : tx.id + index
    public sign(privateKeyString: string) {
        const serialized: string = `${this.tx.id}${this.index}`;
        this.signature = RSATools.sign(serialized, privateKeyString);
    }
  
    // Retourne le hash du Input : tx.id + index
    public getHash(): string{
        const serialized = `${this.tx.id}${this.index}`;
        return crypto.createHash('sha256').update(serialized, 'utf8').digest('hex');
    }
  
    // Retourne le montant de l'output utilisé
    public getMontant(): number{
      return this.tx.outputs.reduce((a, b) => {return a + b.montant; }, 0);
    }
}
  
export class Output {
    montant: number;
    destinataire: string;
    constructor(montant: number, destinataire: string) {
        this.montant = montant;
        this.destinataire = destinataire;
    }

    public serialize(): string {
        return `${this.montant}${this.destinataire}`;
    }

    // Retourne le hash du Output : montant + destinataire
    public getHash(): string {
        const serialized: string = `${this.montant}${this.destinataire}`;
        return crypto.createHash('sha256').update(serialized, 'utf8').digest('hex');
    }
}


export function buildSimpleTransaction(privateKeyStringSender: string, publicKeyStringDestinataire: string, montant: number, unspentOutputs: Array<UnspentOutput>): Transaction {
    
    const publicKeyStringSender: string = RSATools.privateToPublic(privateKeyStringSender);
    const unspentOutputsForMontant: Array<UnspentOutput> = calcUnspentOutputsForMontant(montant, unspentOutputs, publicKeyStringSender);
    
    const inputs : Array<Input> = unspentOutputsForMontant.map((unspentOutput) => {
        const input = new Input(unspentOutput.tx, unspentOutput.index);
        input.sign(privateKeyStringSender);
        return input;
    });
  
    const sommeInputs: number = inputs.reduce((somme, input) => {
        return somme + input.getMontant();
    }, 0);
  
    const outputs: Array<Output> = [new Output(montant, publicKeyStringDestinataire)];

    if (sommeInputs !== montant) {
        outputs.push(new Output(montant, publicKeyStringSender));
    }

    return new Transaction(inputs, outputs);
}
  
  
// Sélection des unspentOutputs m'appartenant jusqu'à atteindre le montant souhaité
function calcUnspentOutputsForMontant(montant: number, unspentOutputs: Array<UnspentOutput>, publicKeyStringSender: string): Array<UnspentOutput> {
    let unspentOutputsForMontant: Array<UnspentOutput> = [];
    let valueUnspentOutputsForMontant: number = 0;

    //console.log(unspentOutputs, montant);

    for (let i = 0; i < unspentOutputs.length; i++) {
        const unspentOutput: UnspentOutput = unspentOutputs[i];
        const output: Output = unspentOutput.tx.outputs[unspentOutput.index];
        //console.log(output);

        // Je ne sélectionne que les transactions qui m'appartiennent
        if(output.destinataire === publicKeyStringSender) {
            unspentOutputsForMontant.push(unspentOutput);
            valueUnspentOutputsForMontant += output.montant;

            if (valueUnspentOutputsForMontant >= montant) {
                // Quand j'atteind le montant souhaité, j'arrête.
                return unspentOutputsForMontant;
            }
        }
    }

    // Quand on n'a pas assez d'argent, on lance une exception
    throw new Error("Vous n'avez pas assez.");
}