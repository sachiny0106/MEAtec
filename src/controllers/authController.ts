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

    // see if user already exists
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // create user (password will be hashed by model)
    const createdUser = await User.create({ name, email, password });

    if (createdUser) {
      res.status(201).json({
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        token: generateToken(createdUser._id.toString()),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err) {
    // console.log('Register error:', err);
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

    // try to find user and check password
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // success
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
    // console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
