import Block from "./Block";
import Blockchain from "./Blockchain"
import Participant from "./Participant"

export default class Simulation {
    DIFFICULTY: number;
    NB_BLOCK_TO_MINE: number;
    blockchain: Blockchain;
    participants: Array<Participant>    
    constructor(DIFFICULTY: number = 2, NB_BLOCK_TO_MINE: number = 1000) {
      this.DIFFICULTY = DIFFICULTY;
      this.NB_BLOCK_TO_MINE = NB_BLOCK_TO_MINE;
  
      // premier block de la chaîne.
      const genesis = new Block(0, null, this.DIFFICULTY, "I am groot!");
      genesis.miner();
      this.blockchain = new Blockchain();
      this.blockchain.add(genesis);
  
      this.participants = [
        new Participant("Philibert"),
        new Participant("Bernadette", 2),
        new Participant("Christophe", 3),
        new Participant("Julie", 4),
        new Participant("Fred", 5)
      ]
    }
  
    // Annnonce aux participants qu'il y a un nouveau block
    initParticipants() {
      this.participants.forEach((p) => {
        p.generateBlock(this.blockchain.getLastBlock(), this.DIFFICULTY)
      })
    }
  
    // Simule un calcule de hash par tous les participants
    tick() {
      return this.participants.reduce((block, p) => {
        if (block) {
          return block;
        } else {
          return p.tick();
        }
      }, null)
    }
  
    // Lance la simulation
    simulate(debug: boolean = false) {
      console.log("Lancement de la simulation");
      const startSim = Date.now();
      const target = this.blockchain.chain.length + this.NB_BLOCK_TO_MINE;
  
      while (this.blockchain.chain.length < target) {
        if(debug)
          console.log("Recherche du block", this.blockchain.chain.length);
        const startBlock = Date.now();
        this.initParticipants(); // on initialise les participants
  
        let block;
  
        do {
          block = this.tick();
        } while (!block);
  
        const endBlock = Date.now();
        this.blockchain.add(block);
        if(debug)
          console.log(`Nouveau block trouvé en ${endBlock - startBlock} millisecondes :`, block);
      }
  
      const endSim = Date.now();
      const durationSim = endSim - startSim;
  
      console.log(`Simulation effectué en ${durationSim} millisecondes.`);
      console.log(`Moyenne ${durationSim/this.NB_BLOCK_TO_MINE} millisecondes par block.`);
  
      console.log(this.blockchain.chain.reduce((acc, block) => {
        acc[block.data] = 1 + (acc[block.data] || 0);
        return acc;
      }, {}));
    }
  }