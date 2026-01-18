import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPERIES_IN = '1d';

export const jwttoken = {
  sign: payload => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPERIES_IN });
    } catch (error) {
      logger.error('Error signing JWT token:', error);
      throw new Error('Error signing JWT token: ' + error.message);
    }
  },

  verify: token => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('Error verifying JWT token:', error);
      throw new Error('Error verifying JWT token: ' + error.message);
    }
  },
};

export default jwttoken;
