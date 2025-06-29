
const { z } = require('zod');

const createPackagingSchema = z.object({
  name: z.string().min(3),
  type: z.enum(['BOX', 'MAILER']),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  maxWeight: z.number().positive(),
  cost: z.number().positive(), 
   packagingWeight: z.number().positive(),
   quantity: z.number().int().min(0),
});

module.exports = { createPackagingSchema };