// Module: Payments & Commercial Checkout (Razorpay).
import { z } from "zod";
import { authenticate } from "../../middleware.js";
import {
  PaymentError,
  createCheckoutOrder,
  processWebhook,
  verifyCheckoutPayment,
} from "./payments.service.js";

const createOrderSchema = z.object({ courseId: z.string().trim().min(1).max(200) }).strict();
const verifyPaymentSchema = z.object({
  orderId: z.string().trim().min(1).max(200),
  paymentId: z.string().trim().min(1).max(200),
  signature: z.string().regex(/^[a-f0-9]{64}$/i),
  courseId: z.string().trim().min(1).max(200).optional(),
}).strict();

const sendError = (res, error) => {
  if (error instanceof PaymentError) return res.status(error.status).json({ error: error.message });
  throw error;
};

export function registerPayments(app) {
  app.post("/api/payments/create-order", authenticate, async (req, res, next) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    try {
      return res.json(await createCheckoutOrder({ user: req.user, courseId: parsed.data.courseId }));
    } catch (error) {
      try { return sendError(res, error); } catch (unexpected) { return next(unexpected); }
    }
  });

  app.post("/api/payments/verify", authenticate, async (req, res, next) => {
    const parsed = verifyPaymentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    try {
      return res.json(await verifyCheckoutPayment({ actor: req.user, ...parsed.data }));
    } catch (error) {
      try { return sendError(res, error); } catch (unexpected) { return next(unexpected); }
    }
  });

  app.post("/api/payments/webhook", (req, res, next) => {
    try {
      return res.json(processWebhook({
        rawBody: req.rawBody,
        body: req.body,
        signature: req.headers["x-razorpay-signature"],
        eventId: req.headers["x-razorpay-event-id"],
      }));
    } catch (error) {
      try { return sendError(res, error); } catch (unexpected) { return next(unexpected); }
    }
  });
}
