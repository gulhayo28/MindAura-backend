const express = require('express');
const router = express.Router();
const Psychologist = require('../models/Psychologist');

// Get all psychologists
router.get('/', async (req, res) => {
    try {
        const psychologists = await Psychologist.find();
        res.json(psychologists);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one psychologist
router.get('/:id', async (req, res) => {
    try {
        const psychologist = await Psychologist.findById(req.params.id);
        if (!psychologist) {
            return res.status(404).json({ message: 'Psychologist not found' });
        }
        res.json(psychologist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a psychologist
router.post('/', async (req, res) => {
    const psychologist = new Psychologist({
        name: req.body.name,
        specialization: req.body.specialization,
        experience: req.body.experience,
        phone: req.body.phone,
        description: req.body.description,
        image: req.body.image
    });

    try {
        const newPsychologist = await psychologist.save();
        res.status(201).json(newPsychologist);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 