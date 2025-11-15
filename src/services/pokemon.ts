import type { Card } from '../types/card';

interface PokemonCard {
  id: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
  hp?: string;
  types?: string[];
  attacks?: Array<{
    name: string;
    damage?: string;
    cost?: string[];
  }>;
  rarity?: string;
  set?: {
    name: string;
  };
  number?: string;
}

export async function searchPokemonCards(query: string): Promise<Card[]> {
  try {
    const response = await fetch(
      `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(query)}*`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cards from Pokemon TCG API');
    }

    const data = await response.json();
    return data.data.map((card: PokemonCard) => convertPokemonCard(card));
  } catch (error) {
    console.error('Error fetching Pokemon cards:', error);
    return [];
  }
}

export async function getPokemonCardById(id: string): Promise<Card | null> {
  try {
    const response = await fetch(`https://api.pokemontcg.io/v2/cards/${id}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return convertPokemonCard(data.data);
  } catch (error) {
    console.error('Error fetching Pokemon card:', error);
    return null;
  }
}

function convertPokemonCard(card: PokemonCard): Card {
  return {
    id: `pokemon-${card.id}`,
    name: card.name,
    imageUrl: card.images.large,
    game: 'pokemon',
    hp: card.hp,
    types: card.types,
    attacks: card.attacks,
    rarity: card.rarity,
    set: card.set?.name,
    number: card.number,
  };
}
