import Razorpay from 'razorpay';
import crypto from 'crypto';
import { AppError } from '../../utils/AppError.js';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const RazorpayService = {
    createOrder: async (amount: number, currency: string = 'INR') => {
        try {
            const options = {
                amount: amount * 100, // Convert to paise
                currency,
                receipt: `receipt_${Date.now()}`,
            };
            const order = await razorpay.orders.create(options);
            return order;
        } catch (error) {
            console.error('Razorpay Create Order Error:', error);
            throw new AppError('Failed to create payment order', 500);
        }
    },

     // Verify Payment Signature
     // @param orderId Razorpay Order ID
     // @param paymentId Razorpay Payment ID
     // @param signature Razorpay Signature
    verifySignature: (orderId: string, paymentId: string, signature: string) => {
        const text = `${orderId}|${paymentId}`;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!) 
            .update(text)
            .digest('hex');

        if (generated_signature === signature) {
            return true;
        } else {
            throw new AppError('Payment verification failed: Invalid signature', 400);
        }
    },
};
