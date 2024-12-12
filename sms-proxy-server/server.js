const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
const port = 4001;

// Enable CORS for all origins (adjust if needed)
app.use(cors());

// Twilio Credentials (replace with your own Twilio credentials)
const accountSid = 'AC1a8260d4e4701793944da4cda95f5bcb';
const authToken = '0e0fa0633cb9e849c17bd3ec59ffedd0';
const fromPhoneNumber = '+12184323480';
const phoneNumbers = ['+918825583644', '+919445278543','+919994476504']; // Add multiple phone numbers here

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Proxy route for sending SMS
app.get('/send-sms', async (req, res) => {
  const { deviceId, binLevel, location } = req.query;

  let latitude, longitude;

  // Check if location is an object or a JSON string
  if (typeof location === 'string') {
    try {
      const parsedLocation = JSON.parse(location);
      latitude = parsedLocation.latitude;
      longitude = parsedLocation.longitude;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid location format' });
    }
  } else if (typeof location === 'object' && location.latitude && location.longitude) {
    latitude = location.latitude;
    longitude = location.longitude;
  } else {
    return res.status(400).json({ error: 'Location data is missing or malformed' });
  }

  // Create the SMS text
  const smsText = `Alert: Bin ID: ${deviceId} is Full (${binLevel}%). Please arrange for clearance.
Location: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  console.log("Sending SMS with location:", { latitude, longitude });

  try {
    // Send SMS to all phone numbers
    const promises = phoneNumbers.map((to) =>
      client.messages.create({
        body: smsText,
        from: fromPhoneNumber, // Twilio phone number
        to,                   // Current phone number in the list
      })
    );

    // Wait for all SMS messages to be sent
    const results = await Promise.all(promises);

    console.log("All messages sent:", results);
    res.json({ message: 'SMS sent successfully to all recipients', data: results });
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    res.status(500).json({ error: 'Error sending SMS', details: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
