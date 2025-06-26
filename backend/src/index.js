// const express = require('express');
// const cors = require('cors');
// const { PrismaClient } = require('@prisma/client');
// const dotenv = require('dotenv');
// const { z } = require('zod');
// const { createProductSchema } = require('./schemas/product.schema');
// const { createPackagingSchema } = require('./schemas/packaging.schema');
// const { createFillerSchema } = require('./schemas/filler.schema.js');
// const { Packer, Bin, Item } = require('bp3d');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const fs = require('fs');
// const path = require('path');

// console.log("--- ✅ SERVER SCRIPT STARTED ---");

// dotenv.config();

// const app = express();
// const prisma = new PrismaClient();
// const PORT = process.env.PORT || 8890;

// app.use(cors());
// app.use(express.json());

// // --- AUTHENTICATION & MIDDLEWARE ---
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
//     const token = jwt.sign(
//       { userId: user.id, email: user.email },
//       process.env.JWT_SECRET || 'YOUR_FALLBACK_SECRET_KEY',
//       { expiresIn: '1h' }
//     );
//     res.status(200).json({ token, userId: user.id, email: user.email });
//   } catch (error) {
//     res.status(500).json({ message: "Error logging in", error: error.message });
//   }
// });

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (token == null) return res.sendStatus(401);

//   jwt.verify(token, process.env.JWT_SECRET || 'YOUR_FALLBACK_SECRET_KEY', (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// };


// // --- CRUD ENDPOINTS ---

// // Products
// app.get('/api/products', authenticateToken, async (req, res) => {
//   const products = await prisma.product.findMany({ where: { userId: req.user.userId } });
//   res.status(200).json(products);
// });
// app.post('/api/products', authenticateToken, async (req, res) => {
//   try {
//     const validatedData = createProductSchema.parse(req.body);
//     const newProduct = await prisma.product.create({ data: { ...validatedData, userId: req.user.userId } });
//     res.status(201).json(newProduct);
//   } catch (error) {
//     res.status(500).json({ message: "Error creating product.", error: error.message });
//   }
// });
// app.put('/api/products/:id', authenticateToken, async (req, res) => {
//     const { id } = req.params;
//     try {
//         const product = await prisma.product.findUnique({ where: { id } });
//         if (!product || product.userId !== req.user.userId) {
//             return res.status(403).json({ message: "Forbidden or product not found" });
//         }
//         const productData = createProductSchema.parse(req.body);
//         const updatedProduct = await prisma.product.update({ where: { id: id }, data: productData });
//         res.status(200).json(updatedProduct);
//     } catch (error) {
//         res.status(500).json({ message: "An error occurred while updating the product." });
//     }
// });
// app.delete('/api/products/:id', authenticateToken, async (req, res) => {
//     const { id } = req.params;
//     const product = await prisma.product.findUnique({ where: { id } });
//     if (product && product.userId === req.user.userId) {
//         await prisma.product.delete({ where: { id: id } });
//         res.status(204).send();
//     } else {
//         res.status(403).json({ message: "Forbidden or product not found" });
//     }
// });

// // Packaging
// app.post('/api/packaging', authenticateToken, async (req, res) => {
//   // This console.log is added for our final debugging step.
//   console.log("--- ✅ REACHED /api/packaging ROUTE ---"); 
//   try {
//     const packagingData = createPackagingSchema.parse(req.body);
//     const newPackaging = await prisma.packaging.create({
//       data: {
//         ...packagingData,
//         userId: req.user.userId
//       }
//     });
//     res.status(201).json(newPackaging);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       console.error("PACKAGING VALIDATION FAILED:", error.flatten().fieldErrors);
//       return res.status(400).json({
//         message: 'Validation failed. Please check the form fields.',
//         details: error.flatten().fieldErrors,
//       });
//     }
//     console.error("CREATE PACKAGING FAILED:", error);
//     res.status(500).json({ message: "An error occurred while creating packaging.", error: error.message });
//   }
// });

// app.get('/api/packaging', authenticateToken, async (req, res) => {
//     const items = await prisma.packaging.findMany({ where: { userId: req.user.userId } });
//     res.status(200).json(items);
// });
// app.post('/api/packaging/bulk', authenticateToken, async (req, res) => {
//     const bulkSchema = z.array(createPackagingSchema);
//     try {
//         const data = bulkSchema.parse(req.body);
//         const result = await prisma.packaging.createMany({ data: data.map(item => ({ ...item, userId: req.user.userId })), skipDuplicates: true });
//         res.status(201).json({ message: 'Bulk import successful.', count: result.count });
//     } catch (error) {
//         res.status(500).json({ message: "An error occurred during bulk import." });
//     }
// });
// app.delete('/api/packaging/:id', authenticateToken, async (req, res) => {
//     const { id } = req.params;
//     const item = await prisma.packaging.findUnique({ where: { id } });
//     if (item && item.userId === req.user.userId) {
//         await prisma.packaging.delete({ where: { id } });
//         res.status(204).send();
//     } else {
//         res.status(403).json({ message: "Forbidden or packaging not found" });
//     }
// });

// // Fillers
// app.get('/api/fillers', authenticateToken, async (req, res) => {
//     const items = await prisma.protectiveFiller.findMany({ where: { userId: req.user.userId } });
//     res.status(200).json(items);
// });
// app.post('/api/fillers', authenticateToken, async (req, res) => {
//     try {
//         const data = createFillerSchema.parse(req.body);
//         const newItem = await prisma.protectiveFiller.create({ data: { ...data, userId: req.user.userId } });
//         res.status(201).json(newItem);
//     } catch (error) {
//         res.status(500).json({ message: "Error creating filler." });
//     }
// });
// app.post('/api/fillers/bulk', authenticateToken, async (req, res) => {
//     const bulkSchema = z.array(createFillerSchema);
//     try {
//         const data = bulkSchema.parse(req.body);
//         const result = await prisma.protectiveFiller.createMany({ data: data.map(item => ({ ...item, userId: req.user.userId })), skipDuplicates: true });
//         res.status(201).json({ message: 'Bulk import successful.', count: result.count });
//     } catch (error) {
//         res.status(500).json({ message: "An error occurred during bulk import." });
//     }
// });
// app.delete('/api/fillers/:id', authenticateToken, async (req, res) => {
//     const { id } = req.params;
//     const item = await prisma.protectiveFiller.findUnique({ where: { id } });
//     if (item && item.userId === req.user.userId) {
//         await prisma.protectiveFiller.delete({ where: { id } });
//         res.status(204).send();
//     } else {
//         res.status(403).json({ message: "Forbidden or filler not found" });
//     }
// });

// // --- RECOMMENDATION ENDPOINT ---
// app.post('/api/recommend', authenticateToken, async (req, res) => {
//     const { productIds } = req.body;
//     if (!productIds || productIds.length === 0) {
//         return res.status(400).json({ message: "No products selected." });
//     }

//     try {
//         const userId = req.user.userId;
//         const uniqueProductIds = [...new Set(productIds)];

//         const uniqueProductsFound = await prisma.product.findMany({
//             where: { id: { in: uniqueProductIds }, userId: userId }
//         });

//         if (uniqueProductsFound.length !== uniqueProductIds.length) {
//             return res.status(404).json({ message: "One or more products not found in your inventory." });
//         }





//         const productsInOrder = productIds.map(id => {
//             return uniqueProductsFound.find(p => p.id === id);
//         });

//         const allPackaging = await prisma.packaging.findMany({ where: { userId } });
//         const isOrderFragile = productsInOrder.some(p => p.isFragile);
//         const totalWeight = productsInOrder.reduce((sum, p) => sum + p.weight, 0);

//         let suitablePackages = [];

//         for (const pkg of allPackaging) {
//           //  const itemsToPack = productsInOrder.map(p => new Item(p.name, p.width, p.height, p.length, p.weight));
//             if (pkg.maxWeight < totalWeight) continue;
//             if (isOrderFragile && pkg.type === 'MAILER') continue;

//             const packer = new Packer();
//             const bin = new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight);
//             packer.addBin(bin);
//              const itemsToPack = productsInOrder.map(p => new Item(p.name, p.width, p.height, p.length, p.weight));
//             itemsToPack.forEach(item => packer.addItem(item));
            
//             packer.pack();


//             if (packer.unfitItems.length === 0) {
//                 suitablePackages.push(pkg);
//             }
//         }

//         if (suitablePackages.length === 0) {
//             return res.status(404).json({ message: "No single packaging found that can fit all items." });
//         }

//         let bestPackage = suitablePackages.sort((a, b) => a.cost - b.cost)[0];

//         let volumeSaved = 0;
//         let costSaved = 0;
//         let co2Saved = 0;

//         const sortedSuitablePackages = suitablePackages.sort((a, b) => (a.length * a.width * a.height) - (b.length * b.width * b.height));
//         const bestPackageIndex = sortedSuitablePackages.findIndex(p => p.id === bestPackage.id);

//         if (bestPackageIndex < sortedSuitablePackages.length - 1) {
//             const wastefulPackage = sortedSuitablePackages[bestPackageIndex + 1];
            
//             const bestPackageVolume = bestPackage.length * bestPackage.width * bestPackage.height;
//             const wastefulPackageVolume = wastefulPackage.length * wastefulPackage.width * wastefulPackage.height;

//             volumeSaved = wastefulPackageVolume - bestPackageVolume;
//             costSaved = wastefulPackage.cost - bestPackage.cost;
            
//             const CO2_FACTOR = 0.9;
//             const weightSaved = wastefulPackage.packagingWeight - bestPackage.packagingWeight;
//             if (weightSaved > 0) {
//                 co2Saved = weightSaved * CO2_FACTOR;
//             }
//         }

//         await prisma.shipment.create({
//             data: {
//                 userId: userId,
//                 recommendedPackagingId: bestPackage.id,
//                 products: {
//                     connect: productIds.map(id => ({ id: id }))
//                 }
//             }
//         });

//         let recommendedFillers = [];
//         if (isOrderFragile) {
//             const availableFillers = await prisma.protectiveFiller.findMany({ where: { userId } });
//             if (availableFillers.length > 0) {
//                 recommendedFillers.push(availableFillers[0]);
//             }
//         }

//         res.status(200).json({
//             recommendedPackage: bestPackage,
//             recommendedFillers: recommendedFillers,
//         });

//     } catch (error) {
//         console.error("Recommendation engine error:", error);
//         res.status(500).json({ message: "An error occurred in the recommendation engine." });
//     }
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
const { Packer, Bin, Item } = require('bp3d');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

console.log("--- ✅ SERVER SCRIPT STARTED ---");

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8890;

app.use(cors());
app.use(express.json());

// --- AUTHENTICATION & MIDDLEWARE ---
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


// --- CRUD ENDPOINTS ---

// Products
app.get('/api/products', authenticateToken, async (req, res) => {
  const products = await prisma.product.findMany({ where: { userId: req.user.userId } });
  res.status(200).json(products);
});
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const newProduct = await prisma.product.create({ data: { ...validatedData, userId: req.user.userId } });
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
        const updatedProduct = await prisma.product.update({ where: { id: id }, data: productData });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while updating the product." });
    }
});
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (product && product.userId === req.user.userId) {
        // First, dissociate this product from any shipments
        await prisma.shipment.updateMany({
            where: { products: { some: { id: id } } },
            data: { products: { disconnect: { id: id } } }
        });
        await prisma.product.delete({ where: { id: id } });
        res.status(204).send();
    } else {
        res.status(403).json({ message: "Forbidden or product not found" });
    }
});

// Packaging
app.post('/api/packaging', authenticateToken, async (req, res) => {
  try {
    const packagingData = createPackagingSchema.parse(req.body);
    const newPackaging = await prisma.packaging.create({
      data: { ...packagingData, userId: req.user.userId }
    });
    res.status(201).json(newPackaging);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("PACKAGING VALIDATION FAILED:", error.flatten().fieldErrors);
      return res.status(400).json({
        message: 'Validation failed. Please check the form fields.',
        details: error.flatten().fieldErrors,
      });
    }
    console.error("CREATE PACKAGING FAILED:", error);
    res.status(500).json({ message: "An error occurred while creating packaging.", error: error.message });
  }
});

app.get('/api/packaging', authenticateToken, async (req, res) => {
    const items = await prisma.packaging.findMany({ where: { userId: req.user.userId } });
    res.status(200).json(items);
});
app.post('/api/packaging/bulk', authenticateToken, async (req, res) => {
    const bulkSchema = z.array(createPackagingSchema);
    try {
        const data = bulkSchema.parse(req.body);
        const result = await prisma.packaging.createMany({ data: data.map(item => ({ ...item, userId: req.user.userId })), skipDuplicates: true });
        res.status(201).json({ message: 'Bulk import successful.', count: result.count });
    } catch (error) {
        res.status(500).json({ message: "An error occurred during bulk import." });
    }
});
app.delete('/api/packaging/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const item = await prisma.packaging.findUnique({ where: { id } });
        if (item && item.userId === req.user.userId) {
            await prisma.shipment.updateMany({
                where: { recommendedPackagingId: id },
                data: { recommendedPackagingId: null }
            });
            await prisma.packaging.delete({ where: { id } });
            res.status(204).send();
        } else {
            res.status(403).json({ message: "Forbidden or packaging not found" });
        }
    } catch(error) {
        res.status(500).json({ message: "Error deleting packaging." });
    }
});

// Fillers
app.get('/api/fillers', authenticateToken, async (req, res) => {
    const items = await prisma.protectiveFiller.findMany({ where: { userId: req.user.userId } });
    res.status(200).json(items);
});
app.post('/api/fillers', authenticateToken, async (req, res) => {
    try {
        const data = createFillerSchema.parse(req.body);
        const newItem = await prisma.protectiveFiller.create({ data: { ...data, userId: req.user.userId } });
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: "Error creating filler." });
    }
});
app.post('/api/fillers/bulk', authenticateToken, async (req, res) => {
    const bulkSchema = z.array(createFillerSchema);
    try {
        const data = bulkSchema.parse(req.body);
        const result = await prisma.protectiveFiller.createMany({ data: data.map(item => ({ ...item, userId: req.user.userId })), skipDuplicates: true });
        res.status(201).json({ message: 'Bulk import successful.', count: result.count });
    } catch (error) {
        res.status(500).json({ message: "An error occurred during bulk import." });
    }
});
app.delete('/api/fillers/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const item = await prisma.protectiveFiller.findUnique({ where: { id } });
    if (item && item.userId === req.user.userId) {
        await prisma.protectiveFiller.delete({ where: { id } });
        res.status(204).send();
    } else {
        res.status(403).json({ message: "Forbidden or filler not found" });
    }
});

// --- RECOMMENDATION ENDPOINT ---
app.post('/api/recommend', authenticateToken, async (req, res) => {
    const { productIds } = req.body;
    if (!productIds || productIds.length === 0) {
        return res.status(400).json({ message: "No products selected." });
    }

    try {
        const userId = req.user.userId;
        const uniqueProductIds = [...new Set(productIds)];
        const uniqueProductsFound = await prisma.product.findMany({
            where: { id: { in: uniqueProductIds }, userId: userId }
        });

        if (uniqueProductsFound.length !== uniqueProductIds.length) {
            return res.status(404).json({ message: "One or more products not found in your inventory." });
        }

        const productsInOrder = productIds.map(id => uniqueProductsFound.find(p => p.id === id));
        const allPackaging = await prisma.packaging.findMany({ where: { userId } });
        const isOrderFragile = productsInOrder.some(p => p.isFragile);
        const totalWeight = productsInOrder.reduce((sum, p) => sum + p.weight, 0);

        let suitablePackages = [];
        for (const pkg of allPackaging) {
            if (pkg.maxWeight < totalWeight) continue;
            if (isOrderFragile && pkg.type === 'MAILER') continue;

            const packer = new Packer();
            packer.addBin(new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight));
            
            const itemsToPack = productsInOrder.map(p => new Item(p.name, p.width, p.height, p.length, p.weight));
            // Correctly add items one-by-one
            itemsToPack.forEach(item => packer.addItem(item));
            
            packer.pack();

            if (packer.unfitItems.length === 0) {
                suitablePackages.push(pkg);
            }
        }

        if (suitablePackages.length === 0) {
            return res.status(404).json({ message: "No single packaging found that can fit all items." });
        }

        let bestPackage = suitablePackages.sort((a, b) => a.cost - b.cost)[0];

        let volumeSaved = 0, costSaved = 0, co2Saved = 0;

        if (suitablePackages.length > 1) {
            const sortedSuitablePackages = suitablePackages.sort((a, b) => (a.length * a.width * a.height) - (b.length * b.width * b.height));
            const bestPackageIndex = sortedSuitablePackages.findIndex(p => p.id === bestPackage.id);

            if (bestPackageIndex < sortedSuitablePackages.length - 1) {
                const wastefulPackage = sortedSuitablePackages[bestPackageIndex + 1];
                
                const bestPackageVolume = bestPackage.length * bestPackage.width * bestPackage.height;
                const wastefulPackageVolume = wastefulPackage.length * wastefulPackage.width * wastefulPackage.height;

                volumeSaved = wastefulPackageVolume - bestPackageVolume;
                costSaved = wastefulPackage.cost - bestPackage.cost;
                
                const CO2_FACTOR = 0.9;
                const weightSaved = wastefulPackage.packagingWeight - bestPackage.packagingWeight;
                if (weightSaved > 0) {
                    co2Saved = weightSaved * CO2_FACTOR;
                }
            }
        }

        await prisma.shipment.create({
            data: {
                userId: userId,
                recommendedPackagingId: bestPackage.id,
                products: { connect: productIds.map(id => ({ id: id })) },
                volumeSaved: parseFloat(volumeSaved.toFixed(2)),
                costSaved: parseFloat(costSaved.toFixed(2)),
                co2Saved: parseFloat(co2Saved.toFixed(2))
            }
        });

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


app.get('/api/analytics/summary', authenticateToken, async (req, res) => {
    try {
        // Use Prisma's aggregate function to sum up the savings fields
        const summary = await prisma.shipment.aggregate({
            where: {
                userId: req.user.userId, // Ensures we only get data for the logged-in user
            },
            _sum: {
                volumeSaved: true,
                costSaved: true,
                co2Saved: true,
            },
        });

        // The result is in summary._sum. Default to 0 if null.
        const totals = {
            volumeSaved: summary._sum.volumeSaved || 0,
            costSaved: summary._sum.costSaved || 0,
            co2Saved: summary._sum.co2Saved || 0,
        };

        res.status(200).json(totals);

    } catch (error) {
        console.error("Analytics summary error:", error);
        res.status(500).json({ message: "An error occurred while fetching the analytics summary." });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
