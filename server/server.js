const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Schema and Model for the `devices` collection
const deviceSchema = new mongoose.Schema({
  height: Number,
  longitude: Number,
  latitude: Number,
  temperature: Number,
  full_alarm: Number,
  fire_alarm: Number,
  tilt_alarm: Number,
  battery_alarm: Number,
  volt: Number,
  angle: Number,
  rsrp: Number,
  frame_counter: Number,
  token_id: String,
  timestamp: Date
}, { collection: 'device3' }); // Explicitly specify the collection name

const Device = mongoose.model('Device', deviceSchema);

// Routes
app.get('/bins', async (req, res) => {
  try {
    const devices = await Device.find(); // Fetch all documents from the 'devices' collection

    // Transform data to match desired format
    const processedDevices = devices.map(device => ({
      key: device._id, // Use _id as the key
      deviceId: device.token_id || device.deviceid ||'N/A', // Map token_id to deviceId
      height: device.height || 'N/A',
      longitude: device.longitude || 'N/A',
      latitude: device.latitude || 'N/A',
      temperature: device.temperature || 'N/A',
      fullAlarm: device.full_alarm || 0,
      fireAlarm: device.fire_alarm || 0,
      tiltAlarm: device.tilt_alarm || 0,
      batteryAlarm: device.battery_alarm || 0,
      volt: device.volt || 'N/A',
      angle: device.angle || 'N/A',
      rsrp: device.rsrp || 'N/A',
      frameCounter: device.frame_counter || 'N/A',
      timestamp: device.timestamp || 'N/A'
    }));

    res.json(processedDevices); // Return the transformed data as JSON
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
