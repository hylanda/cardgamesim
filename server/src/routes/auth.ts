import { Router, Request, Response } from 'express';
import { userRepository } from '../database/repositories/UserRepository';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if username already exists
    const existing = userRepository.findByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const user = await userRepository.create({ username, password, email });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = userRepository.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await userRepository.verifyPassword(user, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get user profile
router.get('/profile/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

export default router;
