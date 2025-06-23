// backend/src/schemas/filler.schema.js
const { z } = require('zod');

const createFillerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long" }),
});

module.exports = { createFillerSchema };