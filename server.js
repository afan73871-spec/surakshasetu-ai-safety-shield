
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import db from './database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * RAZORPAY INITIALIZATION
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_S4zPaC0dtQMdsc',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'EFodIIAiOVcfIphLXFnioi8o'
});

app.use(cors());
app.use(bodyParser.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'LIVE', message: 'SurakshaSetu API Active' });
});

// --- SUBSCRIPTIONS ---

app.post('/api/subscriptions/create', async (req, res) => {
  const { plan_id, email } = req.body;

  if (!plan_id || !email) {
    return res.status(400).json({ success: false, message: "Missing required plan or email." });
  }

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: plan_id,
      customer_notify: 1,
      total_count: 12,
      notes: {
        email: email
      }
    });

    console.log(`[SUBSCRIPTION] Created ID: ${subscription.id} for ${email}`);
    res.json({
      success: true,
      subscription_id: subscription.id
    });
  } catch (error) {
    console.error('Razorpay SDK Error:', error);
    res.status(500).json({
      success: false,
      message: error.description || "Could not initialize subscription link."
    });
  }
});

app.post('/api/auth/upgrade', (req, res) => {
  const { email, plan_type } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required." });

  const user = db.updateUserSubscription(email, 'active', 'manual_upgrade_' + Date.now());
  if (user) {
    console.log(`[AUTH] User upgraded to PRO: ${email}`);
    const { password, ...userSafe } = user;
    res.json({ success: true, user: userSafe });
  } else {
    res.status(404).json({ success: false, message: "User not found." });
  }
});

// --- WEBHOOK LISTENER ---

app.post('/api/webhooks/razorpay', (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret';
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    const event = req.body.event;
    const payload = req.body.payload.subscription?.entity || req.body.payload.payment?.entity;
    const email = payload.notes?.email;

    if (email && (event === 'subscription.activated' || event === 'payment.captured')) {
      db.updateUserSubscription(email, 'active', payload.id);
    }

    res.json({ status: 'ok' });
  } else {
    res.status(403).json({ status: 'invalid signature' });
  }
});

// --- AUTHENTICATION (Bypassing Security PIN) ---

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (db.findUserByEmail(email)) {
    return res.status(400).json({ success: false, message: "Email already registered." });
  }

  // Directly create the user without OTP verification
  const newUser = db.saveUser({
    id: 'u_' + Date.now(),
    name,
    email,
    password,
    isVerified: true,
    securityLevel: 'Standard',
    isPro: false,
    planSelected: false
  });

  console.log(`[AUTH] New user registered directly: ${email}`);
  const { password: _, ...userSafe } = newUser;
  res.json({ success: true, user: userSafe, message: "Account created successfully." });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.findUserByEmail(email);

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }

  // Directly login without OTP verification
  console.log(`[AUTH] User logged in directly: ${email}`);
  const { password: _, ...userSafe } = user;
  res.json({ success: true, user: userSafe, message: "Login successful." });
});

// --- SCAM REGISTRY ---

app.get('/api/scams', (req, res) => {
  const { query } = req.query;
  const results = db.getScamRegistry(query);
  res.json(results);
});

app.post('/api/scams/report', (req, res) => {
  const { type, value, description } = req.body;
  const newReport = db.addScamReport({ identifier: value, type: type.toUpperCase(), description });
  res.status(201).json({ success: true, data: newReport });
});

app.listen(PORT, () => {
  console.log(`🛡️ SurakshaSetu Backend LIVE on http://localhost:${PORT}`);
});
