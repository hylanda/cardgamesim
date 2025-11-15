import type { Card } from '../types/card';

interface ScryfallCard {
  id: string;
  name: string;
  image_uris?: {
    normal: string;
    large: string;
    small: string;
  };
  card_faces?: Array<{
    image_uris?: {
      normal: string;
      large: string;
    };
  }>;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  rarity?: string;
  set_name?: string;
  collector_number?: string;
}

export async function searchScryfallCards(query: string): Promise<Card[]> {
  try {
    const response = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cards from Scryfall');
    }

    const data = await response.json();
    return data.data.map((card: ScryfallCard) => convertScryfallCard(card));
  } catch (error) {
    console.error('Error fetching Scryfall cards:', error);
    return [];
  }
}

export async function getScryfallCardByName(name: string): Promise<Card | null> {
  try {
    const response = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`
    );

    if (!response.ok) {
      return null;
    }

    const card: ScryfallCard = await response.json();
    return convertScryfallCard(card);
  } catch (error) {
    console.error('Error fetching Scryfall card:', error);
    return null;
  }
}

function convertScryfallCard(card: ScryfallCard): Card {
  // Handle double-faced cards
  const imageUrl =
    card.image_uris?.normal ||
    card.card_faces?.[0]?.image_uris?.normal ||
    '';

  return {
    id: `scryfall-${card.id}`,
    name: card.name,
    imageUrl,
    game: 'magic',
    manaCost: card.mana_cost,
    type: card.type_line,
    oracleText: card.oracle_text,
    power: card.power,
    toughness: card.toughness,
    rarity: card.rarity,
    set: card.set_name,
    number: card.collector_number,
  };
}
