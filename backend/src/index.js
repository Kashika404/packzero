const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { Packer, Bin, Item } = require('bp3d');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();
const { Shippo } = require('shippo');

const shippo = new Shippo({ apiKeyHeader: process.env.SHIPPO_API_KEY });

const { createProductSchema } = require('./schemas/product.schema');
const { createPackagingSchema } = require('./schemas/packaging.schema');
const { createFillerSchema } = require('./schemas/filler.schema.js');


console.log("--- ✅ SERVER SCRIPT STARTED ---");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8890;

app.use(cors());
app.use(express.json());


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
app.post('/api/user/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Basic validation
    if (!currentPassword || !newPassword || newPassword.length < 5) {
        return res.status(400).json({ message: "New password must be at least 5 characters long." });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

       
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Incorrect current password." });
        }

        
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });

        res.status(200).json({ message: "Password updated successfully." });

    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "An error occurred while changing the password." });
    }
});




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

    try {
        const product = await prisma.product.findUnique({
            where: { id: id },
        });

        if (!product || product.userId !== req.user.userId) {
            return res.status(403).json({ message: "Forbidden or product not found" });
        }

     
        await prisma.$transaction(async (tx) => {
           
            await tx.$executeRawUnsafe(
                'DELETE FROM "_ProductToShipment" WHERE "A" = $1',
                id
            );

          
            await tx.product.delete({
                where: { id: id },
            });
        });

        res.status(204).send();

    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "An error occurred while deleting the product." });
    }
});

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



// app.post('/api/recommend', authenticateToken, async (req, res) => {
//     const { productIds } = req.body;
//     if (!productIds || productIds.length === 0) {
//         return res.status(400).json({ message: "No products selected." });
//     }

//     try {
//         const userId = req.user.userId;
//         const productsInOrder = await prisma.product.findMany({
//             where: { id: { in: productIds }, userId: userId }
//         });

//         if (productsInOrder.length !== productIds.length) {
//             return res.status(404).json({ message: "One or more products not found." });
//         }

//         const allPackaging = await prisma.packaging.findMany({ where: { userId } });
//         const isOrderFragile = productsInOrder.some(p => p.isFragile);
//         const totalWeight = productsInOrder.reduce((sum, p) => sum + p.weight, 0);

//         const itemsToPack = productsInOrder.map(p => new Item(p.name, p.width, p.height, p.length, p.weight));

//         let suitableSinglePackages = [];
//         for (const pkg of allPackaging) {
//             if (pkg.maxWeight < totalWeight) continue;
//             if (isOrderFragile && pkg.type === 'MAILER') continue;

//             const packer = new Packer();
//             packer.addBin(new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight));
//             itemsToPack.forEach(item => packer.addItem(item));
//             packer.pack();

//             if (packer.unfitItems.length === 0) {
//                 const packedItems = packer.bins[0].items.map(packedItem => {
//                     const originalProduct = productsInOrder.find(p => p.name === packedItem.name);
//                     return { ...originalProduct, position: packedItem.position, rotationType: packedItem.rotationType, width: packedItem.width, height: packedItem.height, depth: packedItem.depth };
//                 });
//                 suitableSinglePackages.push({ packaging: pkg, packedItems });
//             }
//         }

//         if (suitableSinglePackages.length > 0) {
//             const bestPackageData = suitableSinglePackages.sort((a, b) => a.packaging.cost - b.packaging.cost)[0];
//             const bestPackage = bestPackageData.packaging;

//             let volumeSaved = 0, costSaved = 0, co2Saved = 0;
//             if (suitableSinglePackages.length > 1) {
//                 const sortedByVolume = suitableSinglePackages.sort((a, b) => 
//                     (a.packaging.length * a.packaging.width * a.packaging.height) - 
//                     (b.packaging.length * b.packaging.width * b.packaging.height)
//                 );
//                 const bestPackageIndex = sortedByVolume.findIndex(p => p.packaging.id === bestPackage.id);

//                 // --- THIS IS THE CRITICAL FIX ---
//                 // We must check that there is a package at the next index before trying to access it.
//                 if (bestPackageIndex < sortedByVolume.length - 1) {
//                     const wastefulPackageData = sortedByVolume[bestPackageIndex + 1];
//                     const wastefulPackage = wastefulPackageData.packaging;
                    
//                     volumeSaved = (wastefulPackage.length * wastefulPackage.width * wastefulPackage.height) - (bestPackage.length * bestPackage.width * bestPackage.height);
//                     costSaved = wastefulPackage.cost - bestPackage.cost;
                    
//                     const CO2_FACTOR = 0.9;
//                     const weightSaved = wastefulPackage.packagingWeight - bestPackage.packagingWeight;
//                     if (weightSaved > 0) {
//                         co2Saved = weightSaved * CO2_FACTOR;
//                     }
//                 }
//             }

//             await prisma.shipment.create({
//                 data: {
//                     userId,
//                     recommendedPackagingId: bestPackage.id,
//                     products: { connect: productIds.map(id => ({ id })) },
//                     volumeSaved: parseFloat(volumeSaved.toFixed(2)),
//                     costSaved: parseFloat(costSaved.toFixed(2)),
//                     co2Saved: parseFloat(co2Saved.toFixed(2))
//                 }
//             });

            
//              let recommendedFillers = [];
//             let voidFillVolume = 0;
//             if (isOrderFragile) {
//                 const availableFillers = await prisma.protectiveFiller.findMany({ where: { userId } });
//                 if (availableFillers.length > 0) {
//                     recommendedFillers.push(availableFillers[0]);
//                     const totalProductVolume = productsInOrder.reduce((sum, p) => sum + (p.length * p.width * p.height), 0);
//                     const packageVolume = bestPackage.length * bestPackage.width * bestPackage.height;
//                     voidFillVolume = packageVolume - totalProductVolume;
//                 }
//             }
            
//             const finalRecommendation = { ...bestPackageData, containedProductIds: productIds };

//             // The 'recommendedFillers' and 'voidFillVolume' are now included in the final JSON response.
//             return res.status(200).json({
//                 recommendedPackages: [finalRecommendation],
//                 recommendedFillers,
//                 voidFillVolume,
//             });

//         }

      
//         return res.status(404).json({ message: "No single packaging found for all items." });

//     } catch (error) {
//         console.error("Recommendation engine error:", error);
//         res.status(500).json({ message: "An error occurred in the recommendation engine." });
//     }
// });

// backend/src/index.js

// app.post('/api/recommend', authenticateToken, async (req, res) => {
//     const { productIds, packagingPreference } = req.body;
//     if (!productIds || productIds.length === 0) {
//         return res.status(400).json({ message: "No products selected." });
//     }

//     try {
//         const userId = req.user.userId;
//         const productsInOrder = await prisma.product.findMany({
//             where: { id: { in: productIds }, userId: userId }
//         });

//         if (productsInOrder.length !== productIds.length) {
//             return res.status(404).json({ message: "One or more products not found." });
//         }

//         const allPackaging = await prisma.packaging.findMany({ where: { userId } });
//         const isOrderFragile = productsInOrder.some(p => p.isFragile);
//         const totalWeight = productsInOrder.reduce((sum, p) => sum + p.weight, 0);

//         const itemsToPack = productsInOrder.map(p => new Item(p.name, p.width, p.height, p.length, p.weight));

//         let finalRecommendedPackages = [];

       
//         if (packagingPreference !== 'eco') {
//             let suitableSinglePackages = [];
//             for (const pkg of allPackaging) {
//                 if (pkg.maxWeight < totalWeight) continue;
//                 if (isOrderFragile && pkg.type === 'MAILER') continue;

//                 const packer = new Packer();
//                 packer.addBin(new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight));
                
//                 // Correctly add items to the packer
//                 itemsToPack.forEach(item => packer.addItem(item));
                
//                 packer.pack();

//                 if (packer.unfitItems.length === 0) {
//                     const packedItems = packer.bins[0].items.map(packedItem => {
//                         const originalProduct = productsInOrder.find(p => p.name === packedItem.name);
//                         return { ...originalProduct, position: packedItem.position, rotationType: packedItem.rotationType, width: packedItem.width, height: packedItem.height, depth: packedItem.depth };
//                     });
//                     suitableSinglePackages.push({ packaging: pkg, packedItems, containedProductIds: productIds });
//                 }
//             }

//             if (suitableSinglePackages.length > 0) {
//                 const bestPackageData = suitableSinglePackages.sort((a, b) => a.packaging.cost - b.packaging.cost)[0];
//                 finalRecommendedPackages.push(bestPackageData);
//             }
//         }
        
      
//         if (finalRecommendedPackages.length === 0) {
//             console.log("Attempting multi-package packing...");
//             let itemsToBePacked = [...itemsToPack];
//             while(itemsToBePacked.length > 0) {
//                 itemsToBePacked.sort((a, b) => b.getVolume() - a.getVolume());
//                 const currentItem = itemsToBePacked[0];
                
//                 let bestFit = null;
//                 for (const pkg of allPackaging) {
//                     if (pkg.maxWeight < currentItem.weight) continue;
//                     if (isOrderFragile && pkg.type === 'MAILER') continue;

//                     const bin = new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight);
//                     if (bin.putItem(currentItem, [0,0,0])) {
//                         if (!bestFit || (pkg.width * pkg.height * pkg.length < bestFit.width * bestFit.height * bestFit.length)) {
//                             bestFit = pkg;
//                         }
//                     }
//                 }

//                 if (!bestFit) {
//                     return res.status(404).json({ message: `No package found for item: ${currentItem.name}`});
//                 }

//                 const shipmentPacker = new Packer();
//                 shipmentPacker.addBin(new Bin(bestFit.name, bestFit.width, bestFit.height, bestFit.length, bestFit.maxWeight));
//                 itemsToBePacked.forEach(item => shipmentPacker.addItem(item));
//                 shipmentPacker.pack();

//                 const packedItemNames = new Set(shipmentPacker.bins[0].items.map(i => i.name));
//                 const packedProducts = productsInOrder.filter(p => packedItemNames.has(p.name));
                
//                 finalRecommendedPackages.push({
//                     packaging: bestFit,
//                     packedItems: shipmentPacker.bins[0].items.map(pi => ({...productsInOrder.find(p => p.name === pi.name), position: pi.position, rotationType: pi.rotationType})),
//                     containedProductIds: packedProducts.map(p => p.id)
//                 });
                
//                 itemsToBePacked = itemsToBePacked.filter(item => !packedItemNames.has(item.name));
//             }
//         }

//         // --- FINAL DATA PREPARATION ---
//         if (finalRecommendedPackages.length === 0) {
//             return res.status(404).json({ message: "No suitable packaging solution found." });
//         }

//         await prisma.shipment.create({
//             data: { userId, products: { connect: productIds.map(id => ({ id })) } }
//         });
        
//         let recommendedFillers = [];
//         let voidFillVolume = 0;
//         if (isOrderFragile) {
//             const availableFillers = await prisma.protectiveFiller.findMany({ where: { userId } });
//             if (availableFillers.length > 0) {
//                 recommendedFillers.push(availableFillers[0]);
//                 const totalProductVolume = productsInOrder.reduce((sum, p) => sum + (p.length * p.width * p.height), 0);
//                 const totalPackageVolume = finalRecommendedPackages.reduce((sum, s) => sum + (s.packaging.length * s.packaging.width * s.packaging.height), 0);
//                 voidFillVolume = totalPackageVolume - totalProductVolume;
//             }
//         }

//         return res.status(200).json({
//             recommendedPackages: finalRecommendedPackages,
//             recommendedFillers,
//             voidFillVolume,
//         });

//     } catch (error) {
//         console.error("Recommendation engine error:", error);
//         res.status(500).json({ message: "An error occurred in the recommendation engine." });
//     }
// });


// app.post('/api/recommend', authenticateToken, async (req, res) => {
//     const { productIds, packagingPreference } = req.body;
//     if (!productIds || productIds.length === 0) {
//         return res.status(400).json({ message: "No products selected." });
//     }

//     try {
//         const userId = req.user.userId;
//         const productsInOrder = await prisma.product.findMany({
//             where: { id: { in: productIds }, userId: userId }
//         });

//         if (productsInOrder.length !== productIds.length) {
//             return res.status(404).json({ message: "One or more products not found." });
//         }

//         const allPackaging = await prisma.packaging.findMany({ where: { userId } });
//         const isOrderFragile = productsInOrder.some(p => p.isFragile);
//         const totalWeight = productsInOrder.reduce((sum, p) => sum + p.weight, 0);

//         const itemsToPack = productsInOrder.map(p => new Item(p.name, p.width, p.height, p.length, p.weight));

//         let finalRecommendedPackages = [];

//         // --- SINGLE-PACKAGE LOGIC ---
//         if (packagingPreference !== 'eco') {
//             let suitableSinglePackages = [];
//             for (const pkg of allPackaging) {
//                 if (pkg.maxWeight < totalWeight) continue;
//                 if (isOrderFragile && pkg.type === 'MAILER') continue;

//                 const packer = new Packer();
//                 packer.addBin(new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight));
                
//                 // Correctly add items to the packer
//                 itemsToPack.forEach(item => packer.addItem(item));
                
//                 packer.pack();

//                 if (packer.unfitItems.length === 0) {
//                     const packedItems = packer.bins[0].items.map(packedItem => {
//                         const originalProduct = productsInOrder.find(p => p.name === packedItem.name);
//                         return { ...originalProduct, position: packedItem.position, rotationType: packedItem.rotationType, width: packedItem.width, height: packedItem.height, depth: packedItem.depth };
//                     });
//                     suitableSinglePackages.push({ packaging: pkg, packedItems, containedProductIds: productIds });
//                 }
//             }

//             if (suitableSinglePackages.length > 0) {
//                 const bestPackageData = suitableSinglePackages.sort((a, b) => a.packaging.cost - b.packaging.cost)[0];
//                 finalRecommendedPackages.push(bestPackageData);
//             }
//         }
        
//         // --- MULTI-PACKAGE LOGIC ---
//         if (finalRecommendedPackages.length === 0) {
//             console.log("Attempting multi-package packing...");
//             let itemsToBePacked = [...itemsToPack];
//             while(itemsToBePacked.length > 0) {
//                 itemsToBePacked.sort((a, b) => b.getVolume() - a.getVolume());
//                 const currentItem = itemsToBePacked[0];
                
//                 let bestFit = null;
//                 for (const pkg of allPackaging) {
//                     if (pkg.maxWeight < currentItem.weight) continue;
//                     if (isOrderFragile && pkg.type === 'MAILER') continue;

//                     const bin = new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight);
//                     if (bin.putItem(currentItem, [0,0,0])) {
//                         if (!bestFit || (pkg.width * pkg.height * pkg.length < bestFit.width * bestFit.height * bestFit.length)) {
//                             bestFit = pkg;
//                         }
//                     }
//                 }

//                 if (!bestFit) {
//                     return res.status(404).json({ message: `No package found for item: ${currentItem.name}`});
//                 }

//                 const shipmentPacker = new Packer();
//                 shipmentPacker.addBin(new Bin(bestFit.name, bestFit.width, bestFit.height, bestFit.length, bestFit.maxWeight));
//                 itemsToBePacked.forEach(item => shipmentPacker.addItem(item));
//                 shipmentPacker.pack();

//                 const packedItemNames = new Set(shipmentPacker.bins[0].items.map(i => i.name));
//                 const packedProducts = productsInOrder.filter(p => packedItemNames.has(p.name));
                
//                 const packedItemsData = shipmentPacker.bins[0].items.map(pi => {
//                     const originalProduct = productsInOrder.find(p => p.name === pi.name);
//                     return {...originalProduct, position: pi.position, rotationType: pi.rotationType, width: pi.width, height: pi.height, depth: pi.depth };
//                 });

//                 finalRecommendedPackages.push({
//                     packaging: bestFit,
//                     packedItems: packedItemsData,
//                     containedProductIds: packedProducts.map(p => p.id)
//                 });
                
//                 itemsToBePacked = itemsToBePacked.filter(item => !packedItemNames.has(item.name));
//             }
//         }

//         // --- FINAL DATA PREPARATION ---
//         if (finalRecommendedPackages.length === 0) {
//             return res.status(404).json({ message: "No suitable packaging solution found." });
//         }

//         await prisma.shipment.create({
//             data: { userId, products: { connect: productIds.map(id => ({ id })) } }
//         });
        
//         let recommendedFillers = [];
//         let voidFillVolume = 0;
//         if (isOrderFragile) {
//             const availableFillers = await prisma.protectiveFiller.findMany({ where: { userId } });
//             if (availableFillers.length > 0) {
//                 recommendedFillers.push(availableFillers[0]);
//                 const totalProductVolume = productsInOrder.reduce((sum, p) => sum + (p.length * p.width * p.height), 0);
//                 const totalPackageVolume = finalRecommendedPackages.reduce((sum, s) => sum + (s.packaging.length * s.packaging.width * s.packaging.height), 0);
//                 voidFillVolume = totalPackageVolume - totalProductVolume;
//             }
//         }

//         return res.status(200).json({
//             recommendedPackages: finalRecommendedPackages,
//             recommendedFillers,
//             voidFillVolume,
//         });

//     } catch (error) {
//         console.error("Recommendation engine error:", error);
//         res.status(500).json({ message: "An error occurred in the recommendation engine." });
//     }
// });

// app.post('/api/recommend', authenticateToken, async (req, res) => {
//     const { productIds, packagingPreference } = req.body;
//     if (!productIds || productIds.length === 0) {
//         return res.status(400).json({ message: "No products selected." });
//     }

//     try {
//         const userId = req.user.userId;
//         const productsInOrder = await prisma.product.findMany({
//             where: { id: { in: productIds }, userId: userId }
//         });

//         if (productsInOrder.length !== productIds.length) {
//             return res.status(404).json({ message: "One or more products not found." });
//         }

//         const allPackaging = await prisma.packaging.findMany({ where: { userId } });
//         const isOrderFragile = productsInOrder.some(p => p.isFragile);
//         const totalWeight = productsInOrder.reduce((sum, p) => sum + p.weight, 0);

//         const itemsToPack = productsInOrder.map(p => new Item(p.name, p.width, p.height, p.length, p.weight));

//         let finalRecommendedPackages = [];

//         // --- SINGLE-PACKAGE LOGIC ---
//         if (packagingPreference !== 'eco') {
//             let suitableSinglePackages = [];
//             for (const pkg of allPackaging) {
//                 if (pkg.maxWeight < totalWeight) continue;
//                 if (isOrderFragile && pkg.type === 'MAILER') continue;

//                 const packer = new Packer();
//                 packer.addBin(new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight));
                
//                 // Correctly add items to the packer
//                 itemsToPack.forEach(item => packer.addItem(item));
                
//                 packer.pack();

//                 if (packer.unfitItems.length === 0) {
//                     const packedItems = packer.bins[0].items.map(packedItem => {
//                         const originalProduct = productsInOrder.find(p => p.name === packedItem.name);
//                         return { ...originalProduct, position: packedItem.position, rotationType: packedItem.rotationType, width: packedItem.width, height: packedItem.height, depth: packedItem.depth };
//                     });
//                     suitableSinglePackages.push({ packaging: pkg, packedItems, containedProductIds: productIds });
//                 }
//             }

//             if (suitableSinglePackages.length > 0) {
//                 const bestPackageData = suitableSinglePackages.sort((a, b) => a.packaging.cost - b.packaging.cost)[0];
//                 finalRecommendedPackages.push(bestPackageData);
//             }
//         }
        
//         // --- MULTI-PACKAGE LOGIC ---
//         if (finalRecommendedPackages.length === 0) {
//             console.log("Attempting multi-package packing...");
//             let itemsToBePacked = [...itemsToPack];
//             while(itemsToBePacked.length > 0) {
//                 itemsToBePacked.sort((a, b) => b.getVolume() - a.getVolume());
//                 const currentItem = itemsToBePacked[0];
                
//                 let bestFit = null;
//                 for (const pkg of allPackaging) {
//                     if (pkg.maxWeight < currentItem.weight) continue;
//                     if (isOrderFragile && pkg.type === 'MAILER') continue;

//                     const bin = new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight);
//                     if (bin.putItem(currentItem, [0,0,0])) {
//                         if (!bestFit || (pkg.width * pkg.height * pkg.length < bestFit.width * bestFit.height * bestFit.length)) {
//                             bestFit = pkg;
//                         }
//                     }
//                 }

//                 if (!bestFit) {
//                     return res.status(404).json({ message: `No package found for item: ${currentItem.name}`});
//                 }

//                 const shipmentPacker = new Packer();
//                 shipmentPacker.addBin(new Bin(bestFit.name, bestFit.width, bestFit.height, bestFit.length, bestFit.maxWeight));
//                 itemsToBePacked.forEach(item => shipmentPacker.addItem(item));
//                 shipmentPacker.pack();

//                 const packedItemNames = new Set(shipmentPacker.bins[0].items.map(i => i.name));
//                 const packedProducts = productsInOrder.filter(p => packedItemNames.has(p.name));
                
//                 const packedItemsData = shipmentPacker.bins[0].items.map(pi => {
//                     const originalProduct = productsInOrder.find(p => p.name === pi.name);
//                     return {...originalProduct, position: pi.position, rotationType: pi.rotationType, width: pi.width, height: pi.height, depth: pi.depth };
//                 });

//                 finalRecommendedPackages.push({
//                     packaging: bestFit,
//                     packedItems: packedItemsData,
//                     containedProductIds: packedProducts.map(p => p.id)
//                 });
                
//                 itemsToBePacked = itemsToBePacked.filter(item => !packedItemNames.has(item.name));
//             }
//         }

//         // --- FINAL DATA PREPARATION ---
//         if (finalRecommendedPackages.length === 0) {
//             return res.status(404).json({ message: "No suitable packaging solution found." });
//         }

//         await prisma.shipment.create({
//             data: { userId, products: { connect: productIds.map(id => ({ id })) } }
//         });
        
//         let recommendedFillers = [];
//         let voidFillVolume = 0;
//         if (isOrderFragile) {
//             const availableFillers = await prisma.protectiveFiller.findMany({ where: { userId } });
//             if (availableFillers.length > 0) {
//                 recommendedFillers.push(availableFillers[0]);
//                 const totalProductVolume = productsInOrder.reduce((sum, p) => sum + (p.length * p.width * p.height), 0);
//                 const totalPackageVolume = finalRecommendedPackages.reduce((sum, s) => sum + (s.packaging.length * s.packaging.width * s.packaging.height), 0);
//                 voidFillVolume = totalPackageVolume - totalProductVolume;
//             }
//         }

//         return res.status(200).json({
//             recommendedPackages: finalRecommendedPackages,
//             recommendedFillers,
//             voidFillVolume,
//         });

//     } catch (error) {
//         console.error("Recommendation engine error:", error);
//         res.status(500).json({ message: "An error occurred in the recommendation engine." });
//     }
// });



// app.post('/api/recommend', authenticateToken, async (req, res) => {
//     const { productIds, packagingPreference } = req.body;
//     if (!productIds || productIds.length === 0) {
//         return res.status(400).json({ message: "No products selected." });
//     }

//     try {
//         const userId = req.user.userId;
//         const productsInOrder = await prisma.product.findMany({
//             where: { id: { in: productIds }, userId: userId }
//         });

//         if (productsInOrder.length !== productIds.length) {
//             return res.status(404).json({ message: "One or more products not found." });
//         }

//         const allPackaging = await prisma.packaging.findMany({ where: { userId } });
//         const isOrderFragile = productsInOrder.some(p => p.isFragile);
//         const totalWeight = productsInOrder.reduce((sum, p) => sum + p.weight, 0);

//         // Create Item instances once. This is a critical step.
//         const itemsToPack = productsInOrder.map(p => new Item(p.name, p.width, p.height, p.length, p.weight));

//         let finalRecommendedPackages = [];

//         // --- SINGLE-PACKAGE LOGIC ('standard' preference) ---
//         if (packagingPreference !== 'eco') {
//             let suitableSinglePackages = [];
//             for (const pkg of allPackaging) {
//                 if (pkg.maxWeight < totalWeight) continue;
//                 if (isOrderFragile && pkg.type === 'MAILER') continue;

//                 const packer = new Packer();
//                 packer.addBin(new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight));
                
//                 // *** THE DEFINITIVE FIX IS HERE ***
//                 // We add the already-created items directly to the packer.
//                 // We do NOT create `new Item()` again inside this loop.
//                 itemsToPack.forEach(item => packer.addItem(item));
                
//                 packer.pack();

//                 if (packer.unfitItems.length === 0) {
//                     const packedItems = packer.bins[0].items.map(packedItem => {
//                         const originalProduct = productsInOrder.find(p => p.name === packedItem.name);
//                         return { ...originalProduct, position: packedItem.position, rotationType: packedItem.rotationType, width: packedItem.width, height: packedItem.height, depth: packedItem.depth };
//                     });
//                     suitableSinglePackages.push({ packaging: pkg, packedItems, containedProductIds: productIds });
//                 }
//             }

//             if (suitableSinglePackages.length > 0) {
//                 const bestPackageData = suitableSinglePackages.sort((a, b) => a.packaging.cost - b.packaging.cost)[0];
//                 finalRecommendedPackages.push(bestPackageData);
//             }
//         }
        
//         // --- MULTI-PACKAGE LOGIC ('eco' preference or if single fails) ---
//         if (finalRecommendedPackages.length === 0) {
//             console.log("Attempting multi-package packing...");
//             let itemsToBePacked = [...itemsToPack];
//             while(itemsToBePacked.length > 0) {
//                 itemsToBePacked.sort((a, b) => b.getVolume() - a.getVolume());
//                 const currentItem = itemsToBePacked[0];
                
//                 let bestFit = null;
//                 for (const pkg of allPackaging) {
//                     if (pkg.maxWeight < currentItem.weight) continue;
//                     if (isOrderFragile && pkg.type === 'MAILER') continue;

//                     const bin = new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight);
//                     if (bin.putItem(currentItem, [0,0,0])) {
//                         if (!bestFit || (pkg.width * pkg.height * pkg.length < bestFit.width * bestFit.height * bestFit.length)) {
//                             bestFit = pkg;
//                         }
//                     }
//                 }

//                 if (!bestFit) {
//                     return res.status(404).json({ message: `No package found for item: ${currentItem.name}`});
//                 }

//                 const shipmentPacker = new Packer();
//                 shipmentPacker.addBin(new Bin(bestFit.name, bestFit.width, bestFit.height, bestFit.length, bestFit.maxWeight));
                
//                 // Also apply the fix here for the multi-package packer
//                 itemsToBePacked.forEach(item => shipmentPacker.addItem(item));
                
//                 shipmentPacker.pack();

//                 const packedItemNames = new Set(shipmentPacker.bins[0].items.map(i => i.name));
//                 const packedProducts = productsInOrder.filter(p => packedItemNames.has(p.name));
                
//                 const packedItemsData = shipmentPacker.bins[0].items.map(pi => {
//                     const originalProduct = productsInOrder.find(p => p.name === pi.name);
//                     return {...originalProduct, position: pi.position, rotationType: pi.rotationType, width: pi.width, height: pi.height, depth: pi.depth };
//                 });

//                 finalRecommendedPackages.push({
//                     packaging: bestFit,
//                     packedItems: packedItemsData,
//                     containedProductIds: packedProducts.map(p => p.id)
//                 });
                
//                 itemsToBePacked = itemsToBePacked.filter(item => !packedItemNames.has(item.name));
//             }
//         }

//         if (finalRecommendedPackages.length === 0) {
//             return res.status(404).json({ message: "No suitable packaging solution found." });
//         }

//         await prisma.shipment.create({
//             data: { userId, products: { connect: productIds.map(id => ({ id })) } }
//         });
        
//         let recommendedFillers = [];
//         let voidFillVolume = 0;
//         if (isOrderFragile) {
//             const availableFillers = await prisma.protectiveFiller.findMany({ where: { userId } });
//             if (availableFillers.length > 0) {
//                 recommendedFillers.push(availableFillers[0]);
//                 const totalProductVolume = productsInOrder.reduce((sum, p) => sum + (p.length * p.width * p.height), 0);
//                 const totalPackageVolume = finalRecommendedPackages.reduce((sum, s) => sum + (s.packaging.length * s.packaging.width * s.packaging.height), 0);
//                 voidFillVolume = totalPackageVolume - totalProductVolume;
//             }
//         }

//         return res.status(200).json({
//             recommendedPackages: finalRecommendedPackages,
//             recommendedFillers,
//             voidFillVolume,
//         });

//     } catch (error) {
//         console.error("Recommendation engine error:", error);
//         res.status(500).json({ message: "An error occurred in the recommendation engine." });
//     }
// });





app.post('/api/recommend', authenticateToken, async (req, res) => {
    const { productIds, packagingPreference } = req.body;
    if (!productIds || productIds.length === 0) {
        return res.status(400).json({ message: "No products selected." });
    }

    try {
        const userId = req.user.userId;
        const productsInOrder = await prisma.product.findMany({
            where: { id: { in: productIds }, userId: userId }
        });

        if (productsInOrder.length !== productIds.length) {
            return res.status(404).json({ message: "One or more products not found." });
        }

        const allPackaging = await prisma.packaging.findMany({ where: { userId } });
        const isOrderFragile = productsInOrder.some(p => p.isFragile);
        const totalWeight = productsInOrder.reduce((sum, p) => sum + p.weight, 0);

        // Create Item instances once. This is a critical step.
        const itemsToPack = productsInOrder.map(p => new Item(p.name, p.width, p.height, p.length, p.weight));

        let finalRecommendedPackages = [];

        // --- SINGLE-PACKAGE LOGIC ('standard' preference) ---
        if (packagingPreference !== 'eco') {
            let suitableSinglePackages = [];
            for (const pkg of allPackaging) {
                if (pkg.maxWeight < totalWeight) continue;
                if (isOrderFragile && pkg.type === 'MAILER') continue;

                const packer = new Packer();
                packer.addBin(new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight));
                
                // *** THE DEFINITIVE FIX IS HERE ***
                // We add the already-created items directly to the packer.
                // We do NOT create `new Item()` again inside this loop.
                itemsToPack.forEach(item => packer.addItem(item));
                
                packer.pack();

                if (packer.unfitItems.length === 0) {
                    const packedItems = packer.bins[0].items.map(packedItem => {
                        const originalProduct = productsInOrder.find(p => p.name === packedItem.name);
                        return { ...originalProduct, position: packedItem.position, rotationType: packedItem.rotationType, width: packedItem.width, height: packedItem.height, depth: packedItem.depth };
                    });
                    suitableSinglePackages.push({ packaging: pkg, packedItems, containedProductIds: productIds });
                }
            }

            if (suitableSinglePackages.length > 0) {
                const bestPackageData = suitableSinglePackages.sort((a, b) => a.packaging.cost - b.packaging.cost)[0];
                finalRecommendedPackages.push(bestPackageData);
            }
        }
        
        // --- MULTI-PACKAGE LOGIC ('eco' preference or if single fails) ---
        if (finalRecommendedPackages.length === 0) {
            console.log("Attempting multi-package packing...");
            let itemsToBePacked = [...itemsToPack];
            while(itemsToBePacked.length > 0) {
                itemsToBePacked.sort((a, b) => b.getVolume() - a.getVolume());
                const currentItem = itemsToBePacked[0];
                
                let bestFit = null;
                for (const pkg of allPackaging) {
                    if (pkg.maxWeight < currentItem.weight) continue;
                    if (isOrderFragile && pkg.type === 'MAILER') continue;

                    const bin = new Bin(pkg.name, pkg.width, pkg.height, pkg.length, pkg.maxWeight);
                    if (bin.putItem(currentItem, [0,0,0])) {
                        if (!bestFit || (pkg.width * pkg.height * pkg.length < bestFit.width * bestFit.height * bestFit.length)) {
                            bestFit = pkg;
                        }
                    }
                }

                if (!bestFit) {
                    return res.status(404).json({ message: `No package found for item: ${currentItem.name}`});
                }

                const shipmentPacker = new Packer();
                shipmentPacker.addBin(new Bin(bestFit.name, bestFit.width, bestFit.height, bestFit.length, bestFit.maxWeight));
                
                // Also apply the fix here for the multi-package packer
                itemsToBePacked.forEach(item => shipmentPacker.addItem(item));
                
                shipmentPacker.pack();

                const packedItemNames = new Set(shipmentPacker.bins[0].items.map(i => i.name));
                const packedProducts = productsInOrder.filter(p => packedItemNames.has(p.name));
                
                const packedItemsData = shipmentPacker.bins[0].items.map(pi => {
                    const originalProduct = productsInOrder.find(p => p.name === pi.name);
                    return {...originalProduct, position: pi.position, rotationType: pi.rotationType, width: pi.width, height: pi.height, depth: pi.depth };
                });

                finalRecommendedPackages.push({
                    packaging: bestFit,
                    packedItems: packedItemsData,
                    containedProductIds: packedProducts.map(p => p.id)
                });
                
                itemsToBePacked = itemsToBePacked.filter(item => !packedItemNames.has(item.name));
            }
        }

        if (finalRecommendedPackages.length === 0) {
            return res.status(404).json({ message: "No suitable packaging solution found." });
        }

        await prisma.shipment.create({
            data: { userId, products: { connect: productIds.map(id => ({ id })) } }
        });
        
        let recommendedFillers = [];
        let voidFillVolume = 0;
        if (isOrderFragile) {
            const availableFillers = await prisma.protectiveFiller.findMany({ where: { userId } });
            if (availableFillers.length > 0) {
                recommendedFillers.push(availableFillers[0]);
                const totalProductVolume = productsInOrder.reduce((sum, p) => sum + (p.length * p.width * p.height), 0);
                const totalPackageVolume = finalRecommendedPackages.reduce((sum, s) => sum + (s.packaging.length * s.packaging.width * s.packaging.height), 0);
                voidFillVolume = totalPackageVolume - totalProductVolume;
            }
        }

        return res.status(200).json({
            recommendedPackages: finalRecommendedPackages,
            recommendedFillers,
            voidFillVolume,
        });

    } catch (error) {
        console.error("Recommendation engine error:", error);
        res.status(500).json({ message: "An error occurred in the recommendation engine." });
    }
});



app.get('/api/analytics/summary', authenticateToken, async (req, res) => {
    try {
        const summary = await prisma.shipment.aggregate({
            where: {
                userId: req.user.userId, 
            },
            _sum: {
                volumeSaved: true,
                costSaved: true,
                co2Saved: true,
            },
        });
       
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




app.post('/api/shipping/rates', authenticateToken, async (req, res) => {
   
    const { package: pkg, fromAddress, toAddress } = req.body;


    if (!pkg || !fromAddress || !toAddress) {
        return res.status(400).json({ message: "Missing required shipping information." });
    }

    try {
       

    const parcel = {
            length: String(pkg.length),
            width: String(pkg.width),
            height: String(pkg.height),
            distanceUnit: 'cm', 
            weight: String(pkg.packagingWeight),
            massUnit: 'kg'     
        };

      
        const shipmentDetails = {
            addressFrom: fromAddress, 
            addressTo: toAddress,     
            parcels: [parcel],
            async: false
        };
const shipment = await shippo.shipments.create(shipmentDetails);


        const relevantRates = shipment.rates.map(rate => ({
            provider: rate.provider,
            service: rate.servicelevel.name,
            estimatedDays: rate.estimated_days,
            amount: rate.amount,
            currency: rate.currency
        }));

        res.status(200).json(relevantRates);

    } catch (error) {
        const errorMessage = error.detail || error.message || "An error occurred while fetching shipping rates.";
        console.error("Shippo API Error:", error);
        res.status(500).json({ message: errorMessage });
    }
});

app.get('/api/shipments', authenticateToken, async (req, res) => {
    try {
        const shipments = await prisma.shipment.findMany({
            where: {
                userId: req.user.userId,
            },
        
            include: {
                recommendedPackaging: true, 
                products: true,             
            },
            
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json(shipments);
    } catch (error) {
        console.error("Error fetching shipment history:", error);
        res.status(500).json({ message: "An error occurred while fetching shipment history." });
    }
});


app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

