const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    wasteType: {
        type: String,
        required: true,
        enum: ['Plastic', 'Paper', 'Metal', 'Organic']
    },
    confidence: {
        type: Number,
        required: true
    },
    ecoScore: {
        type: Number,
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Scan', scanSchema);
