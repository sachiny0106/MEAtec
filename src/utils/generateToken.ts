import jwt from 'jsonwebtoken';

// generate jwt token that expires in 30 days
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });
};

export default generateToken;
