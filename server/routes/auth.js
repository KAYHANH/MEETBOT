import express from 'express';
import jwt from 'jsonwebtoken';
import * as googleService from '../services/googleService.js';
import * as tokenStore from '../utils/tokenStore.js';
import { UserSettings } from '../models/UserSettings.js';
import { authMiddleware } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/google', authLimiter, (req, res) => {
  const authUrl = googleService.getAuthUrl();
  res.json({ authUrl });
});

const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  try {
    const tokens = await googleService.getTokensFromCode(code);
    const userInfo = await googleService.getUserInfo(tokens.access_token);

    await tokenStore.storeTokens(userInfo.id, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: new Date(tokens.expiry_date)
    });

    await UserSettings.findOneAndUpdate(
      { userId: userInfo.id },
      { userEmail: userInfo.email },
      { upsert: true }
    );

    const jwtToken = jwt.sign({
      userId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.redirect(`${process.env.APP_URL}/auth/callback?token=${jwtToken}`);
  } catch (error) {
    res.redirect(`${process.env.APP_URL}/auth/callback?error=${encodeURIComponent(error.message)}`);
  }
};

router.get('/google/callback', handleGoogleCallback);
router.get('/callback', handleGoogleCallback);

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
