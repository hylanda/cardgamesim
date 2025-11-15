import type { Card } from '../types/card';
import { getScryfallCardByName } from './scryfall';

// Cube Cobra API endpoint
const CUBECOBRA_API = 'https://cubecobra.com/cube/api/cubelist';

export async function importFromCubeCobra(cubeId: string): Promise<Card[]> {
  try {
    const response = await fetch(`${CUBECOBRA_API}/${cubeId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch cube from Cube Cobra');
    }

    const text = await response.text();
    const cardNames = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('//'));

    // Fetch cards from Scryfall
    const cards: Card[] = [];
    let successCount = 0;

    for (const cardName of cardNames.slice(0, 100)) { // Limit to 100 cards to avoid rate limiting
      try {
        const card = await getScryfallCardByName(cardName);
        if (card) {
          cards.push(card);
          successCount++;
        }
        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to fetch card: ${cardName}`, error);
      }
    }

    console.log(`Successfully imported ${successCount} out of ${cardNames.length} cards`);
    return cards;
  } catch (error) {
    console.error('Error importing from Cube Cobra:', error);
    throw error;
  }
}

export async function importFromDecklistText(decklistText: string): Promise<Card[]> {
  try {
    // Parse decklist format (supports various formats)
    const lines = decklistText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('//') && !line.startsWith('#'));

    const cardNames: string[] = [];

    for (const line of lines) {
      // Skip section headers (Sideboard, Maybeboard, etc.)
      if (line.match(/^(Sideboard|Maybeboard|Commander|Companion):/i)) {
        continue;
      }

      // Match patterns like: "4 Lightning Bolt" or "1x Sol Ring" or just "Ancestral Recall"
      const match = line.match(/^(\d+x?\s+)?(.+)$/);
      if (match) {
        const quantity = parseInt(match[1]) || 1;
        const cardName = match[2].trim();

        // Add card multiple times based on quantity
        for (let i = 0; i < quantity; i++) {
          cardNames.push(cardName);
        }
      }
    }

    // Fetch cards from Scryfall
    const cards: Card[] = [];
    let successCount = 0;

    for (const cardName of cardNames.slice(0, 100)) { // Limit to prevent abuse
      try {
        const card = await getScryfallCardByName(cardName);
        if (card) {
          cards.push(card);
          successCount++;
        }
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to fetch card: ${cardName}`, error);
      }
    }

    console.log(`Successfully imported ${successCount} out of ${cardNames.length} cards`);
    return cards;
  } catch (error) {
    console.error('Error importing decklist:', error);
    throw error;
  }
}
