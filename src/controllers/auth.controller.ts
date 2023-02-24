import { addMinutes } from 'date-fns';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import uuid from 'uuid';
import { RegisterUserDTO } from '../dtos/register-user.dto';
import { hashPassword } from '../helpers/hash.helper';
import { UserModel } from '../models/user';

const createToken = (user: any) => {
  return jwt.sign(user.toJSON(), process.env['JWT_SECRET'], {
    expiresIn: process.env['TOKEN_EXPIRES_IN'],
  });
};

export const login = async (
  email: string,
  password: string
): Promise<string> => {
  try {
    const user = await UserModel.getByEmail(email)
    if (!user) {
      throw createError(400, 'E-mail not found! Please, check it and try again')
    }

    if (user.failLoginAttempts >= 3) {
      throw createError(
        400,
        `Still here? 
        You\'ve reached your login attempts. 
        Please, reset your password by making a POST to api/reset-password`
      )
    }

    if (user.password !== password) {
      if (user.failLoginAttempts === 2) {
        await user.updateOne({
          failLoginAttempts: Number(user.failLoginAttempts) + 1
        })

        throw createError(
          400,
          `You\'ve reached your login attempts. 
          Please, reset your password by making a POST to api/reset-password`
        )
      }

      await user.updateOne({
        failLoginAttempts: Number(user.failLoginAttempts) + 1
      })

      throw createError(
        400,
        `Wrong password!
        Please, check it and try again. 
        PS: You have three chances!`
      )
    }

    const navigationToken = createToken(user)
    await user.updateOne({ navigationToken })

    return navigationToken
  } catch (error) {
    throw error
  }
};


export const register = async (user: RegisterUserDTO) => {
  try {
    const userExists = await UserModel.exists({ email: user.email })
    if (userExists) {
      throw createError(403, 'User already exists')
    }

    return UserModel.add(user)
  } catch (error) {
    throw error
  }
};

export const validateToken = async (token: string): Promise<{ token: string, userId: string } | null> => {
  try {
    const tokenVerificationResult = jwt.verify(token, process.env['JWT_SECRET'])    
    return { token, userId: tokenVerificationResult['id'] }
  } catch (error) {
    throw createError(400, error.message)
  }
}

export const refreshToken = async (refreshToken: string) => {
  // Your solution here
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
