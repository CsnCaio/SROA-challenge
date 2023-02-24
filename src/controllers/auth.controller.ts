import { addMinutes } from 'date-fns';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import uuid from 'uuid';
import { RegisterUserDTO } from '../dtos/register-user.dto';
import { hashPassword } from '../helpers/hash.helper';
import { UserModel } from '../models/user';
import { registerUserDTO } from './dtos/register-user.dto';

const createToken = (user: any) => {
  return jwt.sign(user, process.env['JWT_SECRET'], {
    expiresIn: process.env['TOKEN_EXPIRES_IN'],
  });
};

export const login = async (
  email: string,
  password: string,
  clientInfo: ClientInfo
) => {
  // Your solution here
  return {
    exists: true
  }

};

export const refreshToken = async (refreshToken: string) => {
  // Your solution here

};

export const register = async (user: RegisterUserDTO) => {
  try {
    const userExists = await UserModel.exists({ email: user.email })
    if (userExists) {
      return userExists
    }

    return UserModel.add(user)
  } catch (error) {
    throw error
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const existingUser = await UserModel.getByEmail(email);
    if (!existingUser) {
      throw createError(403, 'There was a problem. User does not exist');
    }
    const now = new Date();
    const passwordResetTokenExpires = addMinutes(now, 10);
    const passwordResetToken = uuid.v4();
    await existingUser.updateOne({
      passwordResetTokenExpires,
      passwordResetToken,
      updatedAt: now,
    });
    console.log('reset token:', passwordResetToken);
    console.log('reset token:', email);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string, password: string, token: string) => {
  try {
    const user = await UserModel.getByEmail(email);
    if (!user) {
      throw createError(403, 'There was a problem resetting your password. User does not exist');
    }
    if (user.passwordResetToken !== token) {
      throw createError(403, 'There was a problem resetting your password. Invalid Token');
    }
    if (user.passwordResetTokenExpires < new Date()) {
      throw createError(403, 'There was a problem resetting your password. Token expired');
    }
    const hashedPassword = hashPassword(password);
    await user.updateOne({ password: hashedPassword });
    return { success: true };
  } catch (error) {
    throw error;
  }
};
