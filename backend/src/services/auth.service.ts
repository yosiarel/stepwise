import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../util/Jwt.js';
import type { RegisterBody, LoginBody } from '../../types/auth.js';

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const registerService = async (body: RegisterBody) => {
  const { name, email, password, category } = body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw { status: 409, message: 'Email sudah terdaftar' };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, category: category as any },
    select: { id: true, name: true, email: true, category: true, createdAt: true },
  });

  return user;
};

export const loginService = async (body: LoginBody) => {
  const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw { status: 401, message: 'Email atau password salah' };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw { status: 401, message: 'Email atau password salah' };
  }

  const rawRefreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  const tokenRecord = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: hashToken(rawRefreshToken),
      expiresAt,
    },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, tokenId: tokenRecord.id });

  return {
    accessToken,
    refreshToken: rawRefreshToken, 
    user: { id: user.id, name: user.name, email: user.email, category: user.category },
  };
};

export const refreshService = async (rawRefreshToken: string, refreshJwt: string) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshJwt);
  } catch {
    throw { status: 401, message: 'Refresh token tidak valid atau sudah expired' };
  }
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { id: payload.tokenId },
    include: { user: true },
  });

  if (
    !tokenRecord ||
    tokenRecord.isRevoked ||
    tokenRecord.expiresAt < new Date() ||
    tokenRecord.token !== hashToken(rawRefreshToken)
  ) {
    throw { status: 401, message: 'Refresh token tidak valid atau sudah digunakan' };
  }

  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { isRevoked: true },
  });

  const newRawRefreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  const newTokenRecord = await prisma.refreshToken.create({
    data: {
      userId: tokenRecord.userId,
      token: hashToken(newRawRefreshToken),
      expiresAt,
    },
  });

  const newAccessToken  = signAccessToken({ sub: tokenRecord.user.id, email: tokenRecord.user.email });
  const newRefreshToken = signRefreshToken({ sub: tokenRecord.user.id, tokenId: newTokenRecord.id });

  return {
    accessToken: newAccessToken,
    refreshToken: newRawRefreshToken,
    refreshJwt: newRefreshToken,
  };
};

export const logoutService = async (refreshJwt: string, rawRefreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshJwt);

    await prisma.refreshToken.updateMany({
      where: {
        id: payload.tokenId,
        token: hashToken(rawRefreshToken),
        isRevoked: false,
      },
      data: { isRevoked: true },
    });
  } catch {
  }
};