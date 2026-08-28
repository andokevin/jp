/**
 * S9.2 — l'aperçu de lien
 *
 * C'est la seule raison d'être du rendu serveur ici : à Madagascar, le
 * partage passe par WhatsApp et Messenger.
 */
import { describe, expect, it } from 'vitest';
import { balisesApercu, PAGES_PARTAGEABLES } from './index.js';

const base = {
  titre: 'Boutique Miora',
  description: 'Robes et accessoires à Antananarivo',
  image: 'https://jp.mg/i/miora.jpg',
  url: 'https://jp.mg/v/miora',
  type: 'website',
  langue: 'fr',
} as const;

describe('métadonnées d’aperçu', () => {
  it('produit les balises que Facebook et WhatsApp lisent', () => {
    const html = balisesApercu(base);
    for (const attendu of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']) {
      expect(html, attendu).toContain(attendu);
    }
    expect(html).toContain('<title>Boutique Miora</title>');
  });

  it('ÉCHAPPE — un nom de boutique ne doit pas pouvoir injecter du balisage', () => {
    const html = balisesApercu({
      ...base,
      titre: 'Chez "Miora" <script>alert(1)</script>',
    });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&quot;Miora&quot;');
  });

  it('déclare la locale selon la langue', () => {
    expect(balisesApercu(base)).toContain('fr_MG');
    expect(balisesApercu({ ...base, langue: 'en' })).toContain('en_US');
  });

  it('couvre les cinq pages partageables', () => {
    expect(PAGES_PARTAGEABLES).toHaveLength(5);
    const chemins = PAGES_PARTAGEABLES.map((p) => p.chemin);
    expect(chemins).toContain('/v/:slug');
    expect(chemins).toContain('/cadeau/:jeton');
  });
});
