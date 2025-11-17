import { Router, Request, Response } from 'express';
import { deckRepository } from '../database/repositories/DeckRepository';

const router = Router();

// Get all decks for a user
router.get('/user/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const decks = deckRepository.findByUserId(userId);
    res.json(decks);
  } catch (error) {
    console.error('Get decks error:', error);
    res.status(500).json({ error: 'Failed to get decks' });
  }
});

// Get specific deck
router.get('/:deckId', (req: Request, res: Response) => {
  try {
    const { deckId } = req.params;
    const deck = deckRepository.findById(deckId);

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    res.json(deck);
  } catch (error) {
    console.error('Get deck error:', error);
    res.status(500).json({ error: 'Failed to get deck' });
  }
});

// Create new deck
router.post('/', (req: Request, res: Response) => {
  try {
    const { user_id, name, format, cards, sideboard } = req.body;

    if (!user_id || !name || !cards) {
      return res.status(400).json({ error: 'user_id, name, and cards are required' });
    }

    const deck = deckRepository.create({
      user_id,
      name,
      format,
      cards,
      sideboard,
    });

    res.status(201).json(deck);
  } catch (error) {
    console.error('Create deck error:', error);
    res.status(500).json({ error: 'Failed to create deck' });
  }
});

// Update deck
router.put('/:deckId', (req: Request, res: Response) => {
  try {
    const { deckId } = req.params;
    const { name, format, cards, sideboard } = req.body;

    const deck = deckRepository.update(deckId, {
      name,
      format,
      cards,
      sideboard,
    });

    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    res.json(deck);
  } catch (error) {
    console.error('Update deck error:', error);
    res.status(500).json({ error: 'Failed to update deck' });
  }
});

// Delete deck
router.delete('/:deckId', (req: Request, res: Response) => {
  try {
    const { deckId } = req.params;
    const success = deckRepository.delete(deckId);

    if (!success) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete deck error:', error);
    res.status(500).json({ error: 'Failed to delete deck' });
  }
});

export default router;
