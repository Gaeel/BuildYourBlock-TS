import * as NodeRSA from "node-rsa";

export default class RSATools {

    // Retourne la clé publique associée à la clé privée
    static privateToPublic(privateKeyString: string): string {
        const rsa: NodeRSA = new NodeRSA(privateKeyString);
        return rsa.exportKey('public');
    }

    // Retourne la signature du message par la clé privée
    // https://github.com/rzcoder/node-rsa#signingverifying
    static sign(msg: string, privateKeyString: string): string{
        const rsa: NodeRSA = new NodeRSA(privateKeyString);
        return rsa.sign(Buffer.from(msg, 'utf-8'), 'base64').toString();
    }

    // Vérifie la signature du message par la clé publique
    // Retourne un booléen à true si la signature est bonne
    // https://github.com/rzcoder/node-rsa#signingverifying
    static verify(msg: string, signature: string, publicKeyString: string): boolean {
        const rsa: NodeRSA = new NodeRSA(publicKeyString);
        return rsa.verify(Buffer.from(msg), Buffer.from(signature, 'base64'))
    }
}