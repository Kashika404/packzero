// backend/src/schemas/product.schema.js
const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  weight: z.number().positive(),
  isFragile: z.boolean().optional(),
  quantity: z.number().int().min(0),
});

module.exports = { createProductSchema };