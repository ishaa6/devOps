import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import {db} from '#config/database.js';
import {users} from '#models/user.model.js';
import {eq} from 'drizzle-orm';

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
};

export const createUser = async (name, email, password, role='user') => {
  try {
    const existingUser =  await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    const password_hash = await hashPassword(password);
    
    const newUser = {
      name,
      email,
      password: password_hash,
      role
    };  

    await db
      .insert(users).values(newUser)
      .returning({id: users.id, email: users.email, role: users.role, name: users.name, createdAt: users.createdAt});

    logger.info(`User created successfully: ${email} (${role})`);
    return newUser;
  } catch(error){
    logger.error('Error creating user:', error);
    throw error;
  }
};