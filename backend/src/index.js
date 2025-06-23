
// const express = require('express');
// const cors = require('cors');
// const { PrismaClient } = require('@prisma/client');
// const dotenv = require('dotenv');
// const { z } = require('zod'); 
// const { createProductSchema } = require('./schemas/product.schema');
// const { createPackagingSchema } = require('./schemas/packaging.schema');
// const { createFillerSchema } = require('./schemas/filler.schema.js');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// dotenv.config();

// const app = express();
// const prisma = new PrismaClient();
// const PORT = process.env.PORT || 8888;

// const corsOptions = { origin: 'http://localhost:5173', optionsSuccessStatus: 200 };

// app.use(cors(corsOptions));
// app.use(express.json());


// // --- AUTHENTICATION ENDPOINTS ---

// // Register a new user
// app.post('/api/auth/register', async (req, res) => {
//   const { email, password } = req.body;
//   if (!password || password.length < 5) {
//     return res.status(400).json({ message: "Password must be at least 5 characters long." });
//   }

//   try {
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ message: "User with this email already exists." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = await prisma.user.create({
//       data: { email, password: hashedPassword },
//     });

//     res.status(201).json({ message: "User created successfully", userId: newUser.id });
//   } catch (error) {
//     res.status(500).json({ message: "Error creating user", error: error.message });
//   }
// });

// // Login a user
// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isPasswordCorrect = await bcrypt.compare(password, user.password);
//     if (!isPasswordCorrect) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Create JWT token
//     const token = jwt.sign(
//       { userId: user.id, email: user.email },
//       process.env.JWT_SECRET || 'YOUR_FALLBACK_SECRET_KEY', // IMPORTANT: Set JWT_SECRET in your .env file
//       { expiresIn: '1h' }
//     );

//     res.status(200).json({ token, userId: user.id, email: user.email });
//   } catch (error) {
//     res.status(500).json({ message: "Error logging in", error: error.message });
//   }
// });



// // --- MIDDLEWARE to verify JWT token ---
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer TOKEN"

//   if (token == null) return res.sendStatus(401); // No token, unauthorized

//   jwt.verify(token, process.env.JWT_SECRET || 'YOUR_FALLBACK_SECRET_KEY', (err, user) => {
//     if (err) return res.sendStatus(403); // Token is invalid or expired
//     req.user = user; // Add the user payload (e.g., { userId, email }) to the request object
//     next(); // Proceed to the next function in the chain
//   });
// };


// app.get('/', (req, res) => res.send('The PackZero kitchen is open!'));


// app.post('/api/products', async (req, res) => {
//   try {

//     const validatedData = createProductSchema.parse(req.body);


//     const newProduct = await prisma.product.create({
//       data: {
//         name: validatedData.name,
//         length: validatedData.length,
//         width: validatedData.width,
//         height: validatedData.height,
//         weight: validatedData.weight,
//         isFragile: validatedData.isFragile,
//       }
//     });

//     res.status(201).json(newProduct);

//   } catch (error) {
    
//     console.error("PRODUCT CREATE FAILED:", error);
//     res.status(500).json({
//       message: "The backend crashed while creating the product.",
//       exact_error: error.message, 
//     });
//   }
// });


// // app.get('/api/products', async (req, res) => {
// //   const products = await prisma.product.findMany();
// //   res.status(200).json(products);
// // });


// app.get('/api/products', authenticateToken, async (req, res) => {
//   const products = await prisma.product.findMany({
//     where: { userId: req.user.userId }, // Filter by logged-in user's ID
//   });
//   res.status(200).json(products);
// });

// app.delete('/api/products/:id', async (req, res) => {
//   const { id } = req.params;
//   await prisma.product.delete({ where: { id: id } });
//   res.status(204).send();
// });


// app.post('/api/packaging', async (req, res) => {
//   try {
//     const packagingData = createPackagingSchema.parse(req.body);
//     const newPackaging = await prisma.packaging.create({ data: packagingData });
//     res.status(201).json(newPackaging);
//   } catch (error) {
//     res.status(500).json({ message: "An error occurred while creating packaging." });
//   }
// });

// app.post('/api/packaging/bulk', async (req, res) => {
//   // Define a schema for an array of packaging objects
//   const bulkCreatePackagingSchema = z.array(createPackagingSchema);

//   try {
//     // 1. Validate the entire incoming array against the schema
//     const validatedData = bulkCreatePackagingSchema.parse(req.body);

//     // 2. Use Prisma's 'createMany' for efficient bulk insertion
//     const result = await prisma.packaging.createMany({
//       data: validatedData,
//       skipDuplicates: true, // Optional: useful if you want to avoid errors on duplicate names
//     });

//     // 3. Send a success response
//     res.status(201).json({
//       message: 'Bulk import successful.',
//       count: result.count, // 'count' is the number of records actually created
//     });

//   } catch (error) {
//     // Handle validation errors from Zod
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({
//         message: 'Invalid data format.',
//         details: error.errors,
//       });
//     }
//     // Handle other potential errors
//     console.error("BULK IMPORT FAILED:", error);
//     res.status(500).json({
//       message: "An error occurred during the bulk import.",
//       exact_error: error.message,
//     });
//   }
// });


// app.get('/api/packaging', async (req, res) => {
//   const packagingItems = await prisma.packaging.findMany();
//   res.status(200).json(packagingItems);
// });

// app.delete('/api/packaging/:id', async (req, res) => {
//   const { id } = req.params;
//   await prisma.packaging.delete({ where: { id: id } });
//   res.status(204).send();
// });


// app.post('/api/fillers', async (req, res) => {
//   try {
//     const fillerData = createFillerSchema.parse(req.body);
//     const newFiller = await prisma.protectiveFiller.create({ data: fillerData });
//     res.status(201).json(newFiller);
//   } catch (error) {
//     res.status(500).json({ message: "An error occurred while creating filler." });
//   }
// });

// app.post('/api/fillers/bulk', async (req, res) => {
//   // Use the existing schema and wrap it in an array validator
//   const bulkCreateFillerSchema = z.array(createFillerSchema);

//   try {
//     // 1. Validate the incoming array
//     const validatedData = bulkCreateFillerSchema.parse(req.body);

//     // 2. Use Prisma's 'createMany' for efficient insertion
//     const result = await prisma.protectiveFiller.createMany({
//       data: validatedData,
//       skipDuplicates: true,
//     });

//     // 3. Send a success response
//     res.status(201).json({
//       message: 'Bulk import successful.',
//       count: result.count,
//     });

//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({
//         message: 'Invalid data format.',
//         details: error.errors,
//       });
//     }
//     console.error("FILLER BULK IMPORT FAILED:", error);
//     res.status(500).json({
//       message: "An error occurred during the filler bulk import.",
//       exact_error: error.message,
//     });
//   }
// });

// app.get('/api/fillers', async (req, res) => {
//   const fillers = await prisma.protectiveFiller.findMany();
//   res.status(200).json(fillers);
// });

// app.delete('/api/fillers/:id', async (req, res) => {
//   const { id } = req.params;
//   await prisma.protectiveFiller.delete({ where: { id: id } });
//   res.status(204).send();
// });



// app.put('/api/products/:id', async (req, res) => {

//   const { id } = req.params;

//   try {

//     const productData = createProductSchema.parse(req.body);

//     const updatedProduct = await prisma.product.update({
//       where: { id: id },
//       data: productData,
//     });


//     res.status(200).json(updatedProduct);

//   } catch (error) {

//     console.error("Failed to update product:", error);
//     res.status(500).json({ message: "An error occurred while updating the product." });
//   }
// });

// app.post('/api/recommend', async (req, res) => {
//   const { productIds } = req.body;
//   if (!productIds || productIds.length === 0) {
//     return res.status(400).json({ message: "No products selected." });
//   }
//   try {
   
//     const productsInOrder = await prisma.product.findMany({ where: { id: { in: productIds } } });
//     const allPackaging = await prisma.packaging.findMany();
//     const isOrderFragile = productsInOrder.some(p => p.isFragile);
//     const totalWeight = productsInOrder.reduce((sum, p) => sum + p.weight, 0);

   
//     const suitablePackaging = allPackaging.filter(pkg => {
//       if (pkg.maxWeight < totalWeight) return false;
//       if (isOrderFragile && pkg.type === 'MAILER') return false;
//       for (const product of productsInOrder) {
//         const sortedProductDims = [product.length, product.width, product.height].sort((a, b) => b - a);
//         const sortedPackageDims = [pkg.length, pkg.width, pkg.height].sort((a, b) => b - a);
//         if (sortedProductDims[0] > sortedPackageDims[0] || sortedProductDims[1] > sortedPackageDims[1] || sortedProductDims[2] > sortedPackageDims[2]) {
//           return false;
//         }
//       }
//       return true;
//     });

//     if (suitablePackaging.length === 0) {
//       return res.status(404).json({ message: "No suitable packaging found for this combination of items." });
//     }

    
//     let bestPackage = suitablePackaging.sort((a, b) => a.cost - b.cost)[0];
    
    
//     let recommendedFillers = [];
//     if (isOrderFragile) {
//         const availableFillers = await prisma.protectiveFiller.findMany();
//         if (availableFillers.length > 0) recommendedFillers.push(availableFillers[0]);
//     }
//     res.status(200).json({
//         recommendedPackage: bestPackage,
//         recommendedFillers: recommendedFillers,
//     });
//   } catch (error) {
//     console.error("Recommendation engine error:", error);
//     res.status(500).json({ message: "An error occurred in the recommendation engine." });
//   }
// });


// app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));



const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const { z } = require('zod'); 
const { createProductSchema } = require('./schemas/product.schema');
const { createPackagingSchema } = require('./schemas/packaging.schema');
const { createFillerSchema } = require('./schemas/filler.schema.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');


dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8888;

const corsOptions = { origin: 'http://localhost:5173', optionsSuccessStatus: 200 };

app.use(cors(corsOptions));
app.use(express.json());


// --- AUTHENTICATION ENDPOINTS ---

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!password || password.length < 5) {
    return res.status(400).json({ message: "Password must be at least 5 characters long." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({ message: "User created successfully", userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
});

// Login a user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'YOUR_FALLBACK_SECRET_KEY',
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, userId: user.id, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});


// --- MIDDLEWARE to verify JWT token ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'YOUR_FALLBACK_SECRET_KEY', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


// --- SECURED PRODUCT ENDPOINTS ---
app.get('/api/products', authenticateToken, async (req, res) => {
  const products = await prisma.product.findMany({
    where: { userId: req.user.userId },
  });
  res.status(200).json(products);
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const newProduct = await prisma.product.create({
      data: {
        ...validatedData,
        userId: req.user.userId,
      }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating product.", error: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.userId !== req.user.userId) {
        return res.status(403).json({ message: "Forbidden or product not found" });
    }
    const productData = createProductSchema.parse(req.body);
    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: productData,
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "An error occurred while updating the product." });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (product && product.userId === req.user.userId) {
        await prisma.product.delete({ where: { id: id } });
        res.status(204).send();
    } else {
        res.status(403).json({ message: "Forbidden or product not found" });
    }
});


// --- SECURED PACKAGING ENDPOINTS ---
app.get('/api/packaging', authenticateToken, async (req, res) => {
  const packagingItems = await prisma.packaging.findMany({
    where: { userId: req.user.userId }
  });
  res.status(200).json(packagingItems);
});

app.post('/api/packaging', authenticateToken, async (req, res) => {
  try {
    const packagingData = createPackagingSchema.parse(req.body);
    const newPackaging = await prisma.packaging.create({ 
        data: {
            ...packagingData,
            userId: req.user.userId
        }
    });
    res.status(201).json(newPackaging);
  } catch (error) {
    res.status(500).json({ message: "An error occurred while creating packaging." });
  }
});

app.post('/api/packaging/bulk', authenticateToken, async (req, res) => {
  const bulkCreatePackagingSchema = z.array(createPackagingSchema);
  try {
    const validatedData = bulkCreatePackagingSchema.parse(req.body);
    const dataWithUserId = validatedData.map(item => ({
        ...item,
        userId: req.user.userId
    }));
    const result = await prisma.packaging.createMany({
      data: dataWithUserId,
      skipDuplicates: true,
    });
    res.status(201).json({ message: 'Bulk import successful.', count: result.count });
  } catch (error) {
    res.status(500).json({ message: "An error occurred during the bulk import.", error: error.message });
  }
});

app.delete('/api/packaging/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const packaging = await prisma.packaging.findUnique({ where: { id } });
    if (packaging && packaging.userId === req.user.userId) {
        await prisma.packaging.delete({ where: { id } });
        res.status(204).send();
    } else {
        res.status(403).json({ message: "Forbidden or packaging not found" });
    }
});


// --- SECURED FILLER ENDPOINTS ---
app.get('/api/fillers', authenticateToken, async (req, res) => {
    const fillers = await prisma.protectiveFiller.findMany({
        where: { userId: req.user.userId }
    });
    res.status(200).json(fillers);
});

app.post('/api/fillers', authenticateToken, async (req, res) => {
  try {
    const fillerData = createFillerSchema.parse(req.body);
    const newFiller = await prisma.protectiveFiller.create({ 
        data: {
            ...fillerData,
            userId: req.user.userId
        }
     });
    res.status(201).json(newFiller);
  } catch (error) {
    res.status(500).json({ message: "An error occurred while creating filler." });
  }
});

app.post('/api/fillers/bulk', authenticateToken, async (req, res) => {
  const bulkCreateFillerSchema = z.array(createFillerSchema);
  try {
    const validatedData = bulkCreateFillerSchema.parse(req.body);
    const dataWithUserId = validatedData.map(item => ({
        ...item,
        userId: req.user.userId
    }));
    const result = await prisma.protectiveFiller.createMany({
      data: dataWithUserId,
      skipDuplicates: true,
    });
    res.status(201).json({ message: 'Bulk import successful.', count: result.count });
  } catch (error) {
    res.status(500).json({ message: "An error occurred during the filler bulk import.", error: error.message });
  }
});

app.delete('/api/fillers/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const filler = await prisma.protectiveFiller.findUnique({ where: { id } });
    if (filler && filler.userId === req.user.userId) {
        await prisma.protectiveFiller.delete({ where: { id } });
        res.status(204).send();
    } else {
        res.status(403).json({ message: "Forbidden or filler not found" });
    }
});


// --- SECURED RECOMMENDATION & LIBRARY ENDPOINTS ---
app.get('/api/library/packaging', authenticateToken, (req, res) => {
    try {
        const libraryPath = path.join(__dirname, 'masterPackagingLibrary.json');
        const libraryData = fs.readFileSync(libraryPath, 'utf8');
        res.status(200).json(JSON.parse(libraryData));
    } catch (error) {
        res.status(500).json({ message: "Could not load packaging library." });
    }
});

app.post('/api/recommend', authenticateToken, async (req, res) => {
  const { productIds } = req.body;
  if (!productIds || productIds.length === 0) {
    return res.status(400).json({ message: "No products selected." });
  }
  try {
    const userId = req.user.userId;
    const productsInOrder = await prisma.product.findMany({ 
      where: { 
        id: { in: productIds },
        userId: userId
      } 
    });
    
    // Ensure all requested products were found and belong to the user
    if (productsInOrder.length !== productIds.length) {
        return res.status(404).json({ message: "One or more products not found in your inventory." });
    }

    const allPackaging = await prisma.packaging.findMany({ where: { userId } });
    const isOrderFragile = productsInOrder.some(p => p.isFragile);
    const totalWeight = productsInOrder.reduce((sum, p) => sum + p.weight, 0);

    const suitablePackaging = allPackaging.filter(pkg => {
      if (pkg.maxWeight < totalWeight) return false;
      if (isOrderFragile && pkg.type === 'MAILER') return false;
      for (const product of productsInOrder) {
        const sortedProductDims = [product.length, product.width, product.height].sort((a, b) => b - a);
        const sortedPackageDims = [pkg.length, pkg.width, pkg.height].sort((a, b) => b - a);
        if (sortedProductDims[0] > sortedPackageDims[0] || sortedProductDims[1] > sortedPackageDims[1] || sortedProductDims[2] > sortedPackageDims[2]) {
          return false;
        }
      }
      return true;
    });

    if (suitablePackaging.length === 0) {
      return res.status(404).json({ message: "No suitable packaging found for this combination of items." });
    }

    let bestPackage = suitablePackaging.sort((a, b) => a.cost - b.cost)[0];
    
    let recommendedFillers = [];
    if (isOrderFragile) {
        const availableFillers = await prisma.protectiveFiller.findMany({ where: { userId } });
        if (availableFillers.length > 0) recommendedFillers.push(availableFillers[0]);
    }
    res.status(200).json({
        recommendedPackage: bestPackage,
        recommendedFillers: recommendedFillers,
    });
  } catch (error) {
    console.error("Recommendation engine error:", error);
    res.status(500).json({ message: "An error occurred in the recommendation engine." });
  }
});


app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));