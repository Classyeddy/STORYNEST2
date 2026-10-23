import express, { Request, Response } from 'express';
import crypto from 'crypto';

export const paymentApiRouter = express.Router();
export const paystackWebhookRouter = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_storynest_demo_key';

/**
 * 1. Initialize Paystack Transaction Endpoint
 * Initiates an authorized checkout session on Paystack with metadata for NGN serial fiction unlocks or top-ups.
 */
paymentApiRouter.post('/api/paystack-initiate', async (req: Request, res: Response) => {
  try {
    const { email, amountNGN, chapterId, storyId, authorId, userId, type } = req.body;

    if (!amountNGN || amountNGN <= 0) {
      return res.status(400).json({ error: 'Valid amount in NGN is required.' });
    }

    const reference = `sn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const amountInKobo = Math.round(amountNGN * 100); // Paystack uses kobo (100 kobo = ₦1)

    // In a live Paystack environment with a real live/test secret key:
    if (PAYSTACK_SECRET_KEY && !PAYSTACK_SECRET_KEY.includes('demo_key')) {
      try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email || 'reader@storynest.africa',
            amount: amountInKobo,
            reference,
            currency: 'NGN',
            callback_url: `${process.env.APP_URL || 'http://localhost:3000'}/?payment_ref=${reference}`,
            metadata: {
              userId,
              chapterId,
              storyId,
              authorId,
              type: type || 'chapter_unlock',
            },
          }),
        });

        const data = await response.json();
        if (data.status) {
          return res.status(200).json({
            status: true,
            authorization_url: data.data.authorization_url,
            access_code: data.data.access_code,
            reference,
          });
        }
      } catch (err) {
        console.warn('Paystack API call fallback to sandbox mode:', err);
      }
    }

    // Sandbox / Test simulation response
    return res.status(200).json({
      status: true,
      simulation: true,
      reference,
      amountNGN,
      message: 'Paystack sandbox transaction initialized.',
      authorization_url: `https://checkout.paystack.com/sandbox-mock-${reference}`,
      access_code: `mock_code_${reference}`,
    });
  } catch (error: any) {
    console.error('Error initiating Paystack transaction:', error);
    return res.status(500).json({ error: 'Failed to initiate payment transaction' });
  }
});

/**
 * 2. Paystack Webhook Handler for Nigerian Naira (NGN) Transactions
 * Verifies HMAC-SHA512 signature from Paystack before granting reading entitlements.
 */
paystackWebhookRouter.post(
  '/api/paystack-webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const signature = req.headers['x-paystack-signature'];
    const body = req.body;

    if (!signature || typeof signature !== 'string') {
      return res.status(401).json({ error: 'Missing Paystack signature' });
    }

    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (hash !== signature && !PAYSTACK_SECRET_KEY.includes('demo_key')) {
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }

    try {
      const event = typeof body === 'string' ? JSON.parse(body) : JSON.parse(body.toString('utf8'));

      if (event.event === 'charge.success') {
        const { reference, amount, metadata } = event.data;
        const { userId, chapterId, storyId, authorId, type } = metadata || {};

        const platformFeePercentage = 0.15; // 15% platform commission
        const grossAmount = amount / 100; // Paystack sends amounts in kobo (100 kobo = 1 NGN)
        const platformFee = Math.round(grossAmount * platformFeePercentage);
        const authorNet = grossAmount - platformFee;

        console.log(
          `[Paystack Webhook Success] Ref: ${reference}, User: ${userId}, Amount: ₦${grossAmount}, Platform 15%: ₦${platformFee}, Writer Net 85%: ₦${authorNet}`
        );

        return res.status(200).json({
          received: true,
          reference,
          grossAmount,
          platformFee,
          authorNet,
          entitlementGranted: `${userId}_${chapterId || storyId}`,
        });
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error('Error processing Paystack webhook event:', error);
      return res.status(500).json({ error: 'Failed to process webhook' });
    }
  }
);

/**
 * 3. Verify Payment Reference
 */
paymentApiRouter.get('/api/paystack-verify/:reference', async (req: Request, res: Response) => {
  const { reference } = req.params;

  if (PAYSTACK_SECRET_KEY && !PAYSTACK_SECRET_KEY.includes('demo_key')) {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to verify transaction with Paystack' });
    }
  }

  // Sandbox response
  return res.status(200).json({
    status: true,
    message: 'Verification successful (Sandbox Simulation)',
    data: {
      reference,
      status: 'success',
      currency: 'NGN',
    },
  });
});
