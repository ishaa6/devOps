import logger from '#config/logger.js';
import { signUpSchema } from '#validations/auth.validations.js';
import { createUser } from '#services/auth.service.js';
import jwttoken from '#utils/jwt.js';
import cookies from '#utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);

    if (!validationResult.success) {
      logger.warn('Validation failed during signup:', validationResult.error);
      return res
        .status(400)
        .json({
          error: 'Invalid input data',
          details: validationResult.error.errors,
        });
    }

    const { name, email, password, role } = validationResult.data;
    const user = await createUser(name, email, password, role);
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token);

    logger.info(`User signed up successfully: ${email} (${role})`);
    return res.status(201).json({
      message: 'User signed up successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error during signup:', error);

    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already in use' });
    }

    next(error);
  }
};
