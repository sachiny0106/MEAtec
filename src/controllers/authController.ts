import { Request, Response } from 'express';
import User from '../models/User';
import generateToken from '../utils/generateToken';

/*
 * Register new user
 * POST /api/auth/register
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // check if email already taken
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // create user - password gets hashed in the model pre-save hook
    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/*
 * Login user & get token
 * POST /api/auth/login
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // find user and verify password
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
