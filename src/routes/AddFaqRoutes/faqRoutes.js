// routes/faqRoutes.js
const express = require('express');
const router = express.Router();
const { uploadHandler } = require("../../Image/multerSetup");

const FaqController = require('../../controllers/FaqController/FaqController');  // Adjust the import path based on your project structure

// Create a new FAQ
router.post('/addfaq', uploadHandler, FaqController.createFaq);

// Get all FAQs
router.get('/allfaq', FaqController.getAllFaqs);

// Get a specific FAQ by ID
router.get('/faq/:id', FaqController.getFaqById);

// Update a specific FAQ by ID
router.put('/faq/:id',uploadHandler, FaqController.updateFaq);

// Delete a specific FAQ by ID
router.delete('/faq/:id', FaqController.deleteFaq);

module.exports = router;
