require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const jpeg = require('jpeg-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Scan = require('./models/Scan');
const authMiddleware = require('./middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'ecoscan_super_secret_key_2026';

let model;
(async () => {
    try {
        console.log('Loading MobileNet model...');
        model = await mobilenet.load({ version: 2, alpha: 1.0 });
        console.log('MobileNet model loaded successfully!');
    } catch (err) {
        console.error('Error loading model:', err);
    }
})();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Set up Multer for image uploads (store in memory for easy proxying to Flask)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Connect to MongoDB (Mocked for demo)
// mongoose.connect(process.env.MONGODB_URI)
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.error('MongoDB connection error:', err));
const mockScans = [];
const mockUsers = [];

// Helper Functions
const getEcoScoreRange = (type) => {
    switch(type) {
        case 'Organic': return { min: 90, max: 100 };
        case 'Paper': return { min: 70, max: 85 };
        case 'Glass': return { min: 65, max: 80 };
        case 'Metal': return { min: 60, max: 75 };
        case 'Clothing': return { min: 50, max: 70 };
        case 'Plastic': return { min: 30, max: 50 };
        case 'E-Waste': return { min: 10, max: 30 };
        case 'Hazardous': return { min: 0, max: 20 };
        default: return { min: 0, max: 0 };
    }
};

const getPoints = (type) => {
    switch(type) {
        case 'Organic': return 10;
        case 'Paper': return 7;
        case 'Glass': return 6;
        case 'Metal': return 5;
        case 'Clothing': return 4;
        case 'Plastic': return 2;
        case 'E-Waste': return 1;
        case 'Hazardous': return 0;
        default: return 0;
    }
};

const getSuggestion = (type) => {
    switch(type) {
        case 'Plastic': return 'Avoid single-use plastic';
        case 'Organic': return 'Compost it';
        case 'Paper': return 'Reuse or recycle';
        case 'Metal': return 'Send to recycling center';
        case 'Glass': return 'Clean and recycle in glass bins';
        case 'Clothing': return 'Donate or upcycle';
        case 'E-Waste': return 'Take to an e-waste dropoff';
        case 'Hazardous': return 'Dispose at hazardous waste facility';
        default: return '';
    }
};

const getLevel = (score) => {
    if (score <= 40) return { label: 'Poor', emoji: '❌' };
    if (score <= 60) return { label: 'Average', emoji: '⚠️' };
    if (score <= 80) return { label: 'Good', emoji: '✅' };
    return { label: 'Eco Pro', emoji: '🌿' };
};

const getMotivationalMessage = (score) => {
    if (score <= 40) return 'Try reducing plastic usage and sort your waste better.';
    if (score <= 60) return 'You are improving! Keep up the good work.';
    if (score <= 80) return 'Great eco habits! You are making a difference.';
    return 'Amazing! You are a true environmental hero!';
};

// --- AUTH ROUTES ---

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (mockUsers.find(u => u.email === email)) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword
        };
        mockUsers.push(newUser);

        const payload = { user: { id: newUser.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- SCAN ROUTES ---

// POST /api/upload
app.post('/api/upload', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        let wasteType = 'Plastic';
        let confidence = parseFloat((Math.random() * (98.5 - 75.0) + 75.0).toFixed(2));

        if (model && req.file.mimetype === 'image/jpeg') {
            try {
                // Decode jpeg to tensor
                const rawImageData = jpeg.decode(req.file.buffer, { useTArray: true });
                const numChannels = 3;
                const numPixels = rawImageData.width * rawImageData.height;
                const values = new Int32Array(numPixels * numChannels);

                for (let i = 0; i < numPixels; i++) {
                    for (let c = 0; c < numChannels; c++) {
                        values[i * numChannels + c] = rawImageData.data[i * 4 + c];
                    }
                }

                const tensor3d = tf.tensor3d(values, [rawImageData.height, rawImageData.width, numChannels], 'int32');
                const predictions = await model.classify(tensor3d);
                tensor3d.dispose();

                if (predictions && predictions.length > 0) {
                    const topPrediction = predictions[0].className.toLowerCase();
                    console.log('MobileNet Top Prediction:', topPrediction);
                    confidence = parseFloat((predictions[0].probability * 100).toFixed(2));
                    
                    // Expanded Heuristic mapping from ImageNet 1000 to our 8 categories
                    if (topPrediction.includes('bottle') || topPrediction.includes('plastic') || topPrediction.includes('cup') || topPrediction.includes('bag') || topPrediction.includes('wrapper') || topPrediction.includes('pacifier')) {
                        wasteType = 'Plastic';
                    } else if (topPrediction.includes('paper') || topPrediction.includes('book') || topPrediction.includes('envelope') || topPrediction.includes('carton') || topPrediction.includes('box') || topPrediction.includes('tissue')) {
                        wasteType = 'Paper';
                    } else if (topPrediction.includes('can') || topPrediction.includes('metal') || topPrediction.includes('aluminum') || topPrediction.includes('pot') || topPrediction.includes('pan') || topPrediction.includes('nail') || topPrediction.includes('screw')) {
                        wasteType = 'Metal';
                    } else if (topPrediction.match(/(glass|wine bottle|beer bottle|beaker|goblet|vase|pitcher|jug)/)) {
                        wasteType = 'Glass';
                    } else if (topPrediction.match(/(computer|laptop|mouse|keyboard|monitor|phone|ipod|tv|television|remote|radio|modem|speaker|printer|switch)/)) {
                        wasteType = 'E-Waste';
                    } else if (topPrediction.match(/(shirt|pants|jacket|suit|dress|shoe|sock|cloth|jersey|vest|sweater|jeans|tie)/)) {
                        wasteType = 'Clothing';
                    } else if (topPrediction.match(/(syringe|battery|paint|chemical|pill|medicine|lighter)/)) {
                        wasteType = 'Hazardous';
                    } else if (topPrediction.includes('plant') || topPrediction.includes('flower') || topPrediction.includes('daisy') || topPrediction.includes('fruit') || topPrediction.includes('vegetable') || topPrediction.includes('person') || topPrediction.includes('face') || topPrediction.includes('animal') || topPrediction.includes('dog') || topPrediction.includes('cat') || topPrediction.includes('food') || topPrediction.includes('wood') || topPrediction.includes('leaf')) {
                        wasteType = 'Organic';
                    } else {
                        // Fallback simple keyword match
                        if (topPrediction.match(/(ceramic|pottery)/)) wasteType = 'Glass'; 
                        else wasteType = 'Plastic';
                    }
                }
            } catch(e) {
                console.error("TFJS Inference error", e);
            }
        } else if (req.file.mimetype !== 'image/jpeg') {
            console.log('Image is not a JPEG, using fallback classification.');
        }

        // Calculate Eco Score and Points
        const { min, max } = getEcoScoreRange(wasteType);
        const ecoScore = Math.floor(Math.random() * (max - min + 1)) + min;
        const points = getPoints(wasteType);

        // Save to DB (Mocked)
        const newScan = {
            _id: Date.now().toString(),
            userId: req.user.id,
            wasteType,
            confidence,
            ecoScore,
            points,
            timestamp: new Date()
        };
        mockScans.push(newScan);

        // Prepare response
        const level = getLevel(ecoScore);
        res.json({
            wasteType,
            confidence,
            ecoScore,
            points,
            suggestion: getSuggestion(wasteType),
            level: level.label,
            levelEmoji: level.emoji,
            message: getMotivationalMessage(ecoScore),
            timestamp: newScan.timestamp
        });

    } catch (error) {
        console.error('Error in /api/upload:', error.message);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

// GET /api/history
app.get('/api/history', authMiddleware, async (req, res) => {
    try {
        const userScans = mockScans.filter(s => s.userId === req.user.id);
        const history = [...userScans].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// GET /api/analytics
app.get('/api/analytics', authMiddleware, async (req, res) => {
    try {
        const userScans = mockScans.filter(s => s.userId === req.user.id);
        
        // Calculate counts for graph
        const counts = { Plastic: 0, Paper: 0, Metal: 0, Organic: 0, Glass: 0, 'E-Waste': 0, Clothing: 0, Hazardous: 0 };
        let totalEcoScore = 0;
        let totalPoints = 0;

        userScans.forEach(scan => {
            if (counts[scan.wasteType] !== undefined) {
                counts[scan.wasteType]++;
            } else {
                // For any legacy scans that somehow don't match, or if it wasn't initialized
                counts[scan.wasteType] = 1;
            }
            totalEcoScore += scan.ecoScore;
            totalPoints += scan.points;
        });

        const totalScans = userScans.length;
        const avgEcoScore = totalScans > 0 ? Math.round(totalEcoScore / totalScans) : 0;
        
        // Find most frequent
        let mostFrequent = 'N/A';
        let maxCount = 0;
        for (const [type, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                mostFrequent = type;
            }
        }

        // Format chart data dynamically, excluding 0 counts for better visualization or including all
        const colors = {
            Plastic: '#ef4444',
            Paper: '#3b82f6',
            Metal: '#94a3b8',
            Organic: '#22c55e',
            Glass: '#06b6d4',      // Cyan
            'E-Waste': '#8b5cf6',   // Purple
            Clothing: '#f59e0b',    // Amber
            Hazardous: '#dc2626'    // Red
        };

        const chartData = Object.keys(counts).map(key => ({
            name: key,
            count: counts[key] || 0,
            fill: colors[key] || '#94a3b8'
        }));

        // Level & Badge
        const overallLevel = getLevel(avgEcoScore);
        
        let badge = 'Eco Beginner';
        if (totalPoints > 100) badge = 'Eco Learner';
        if (totalPoints > 250) badge = 'Eco Saver';
        if (totalPoints > 500) badge = 'Eco Hero';

        res.json({
            chartData,
            totalScans,
            mostFrequent,
            avgEcoScore,
            overallLevel: overallLevel.label,
            totalPoints,
            badge
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
