/**
 * Hors ligne — S8.4
 *
 * **Ce qui doit rester consultable sans réseau** *(F13.5)* :
 *
 *   · mes commandes
 *   · **le code de retrait**
 *   · la fiche du point relais
 *
 * Le deuxième est celui qui compte vraiment. Une acheteuse arrivée au point
 * relais sans réseau et sans son code repart **sans son colis** — et elle a
 * payé.
 *
 * Les écritures faites hors ligne sont mises en file avec **leur clé
 * d'idempotence**, fabriquée au moment du geste. Au retour du réseau, la file
 * est rejouée : si une requête était en fait passée avant la coupure, le
 * serveur reconnaît la clé et ne refait rien *(RB10)*.
 */

export const CONSULTABLE_HORS_LIGNE = [
  'mes commandes',
  'le code de retrait',
  'la fiche du point relais',
] as const;

export interface EcritureEnAttente {
  readonly id: string;
  readonly methode: string;
  readonly chemin: string;
  readonly corps: unknown;
  /** Fabriquée au moment du GESTE, pas au moment de l'envoi. */
  readonly cleIdempotence: string;
  readonly creeeLe: number;
  readonly essais: number;
}

export interface MagasinFile {
  lire(): Promise<readonly EcritureEnAttente[]>;
  ecrire(file: readonly EcritureEnAttente[]): Promise<void>;
}

/** Magasin en mémoire. `apps/mobile` branchera le stockage de l'appareil. */
export class MagasinMemoire implements MagasinFile {
  private file: readonly EcritureEnAttente[] = [];
  async lire() {
    return this.file;
  }
  async ecrire(f: readonly EcritureEnAttente[]) {
    this.file = f;
  }
}

export class FileEcritures {
  constructor(private readonly magasin: MagasinFile = new MagasinMemoire()) {}

  async empiler(
    e: Omit<EcritureEnAttente, 'id' | 'creeeLe' | 'essais' | 'cleIdempotence'> & {
      cleIdempotence?: string;
    },
  ): Promise<EcritureEnAttente> {
    const entree: EcritureEnAttente = {
      id: crypto.randomUUID(),
      methode: e.methode,
      chemin: e.chemin,
      corps: e.corps,
      // Fabriquée MAINTENANT : c'est ce qui rend le rejeu sûr. Une clé
      // fabriquée à l'envoi changerait à chaque tentative, et le serveur
      // verrait autant de requêtes différentes.
      cleIdempotence: e.cleIdempotence ?? crypto.randomUUID(),
      creeeLe: Date.now(),
      essais: 0,
    };
    await this.magasin.ecrire([...(await this.magasin.lire()), entree]);
    return entree;
  }

  async enAttente(): Promise<readonly EcritureEnAttente[]> {
    return this.magasin.lire();
  }

  /**
   * Rejoue la file au retour du réseau.
   *
   * **S'arrête à la première erreur réseau** : l'ordre compte. Rejouer la
   * troisième écriture avant la deuxième produirait un état incohérent — une
   * confirmation de réception avant la commande qu'elle confirme.
   */
  async rejouer(
    envoyer: (e: EcritureEnAttente) => Promise<void>,
  ): Promise<{ envoyees: number; restantes: number }> {
    const file = [...(await this.magasin.lire())];
    let envoyees = 0;

    while (file.length > 0) {
      const premiere = file[0]!;
      try {
        await envoyer(premiere);
        file.shift();
        envoyees++;
      } catch (e) {
        if (e instanceof Error && e.name === 'HorsLigne') break; // toujours coupé
        // Une erreur métier ne se répare pas en réessayant : on retire
        // l'écriture pour ne pas bloquer la file derrière elle.
        file.shift();
      }
    }

    await this.magasin.ecrire(file);
    return { envoyees, restantes: file.length };
  }
}
