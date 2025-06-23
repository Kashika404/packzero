// backend/src/schemas/packaging.schema.js
const { z } = require('zod');

const createPackagingSchema = z.object({
  name: z.string().min(3),
  type: z.enum(['BOX', 'MAILER']),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  maxWeight: z.number().positive(),
});

module.exports = { createPackagingSchema };