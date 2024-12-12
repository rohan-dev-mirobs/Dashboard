import { useState, useEffect } from "react";
import useBins from "../hooks/useBins"; // Custom hook for fetching bin data

// Function to get the latest data
const getLatestData = (data) => {
  const latestData = {};
  data.forEach((item) => {
    const existingItem = latestData[item.deviceId];
    if (!existingItem || new Date(item.lastUpdated) > new Date(existingItem.lastUpdated)) {
      latestData[item.deviceId] = item;
    }
  });
  return Object.values(latestData);
};

// Function to send SMS (you can customize this based on your API)
const sendSMS = async (deviceId, binLevel, location) => {
  try {
    // Convert location object to a JSON string or encode as query parameters
    const locationQuery = encodeURIComponent(JSON.stringify(location));

    const response = await fetch(
      `http://localhost:4001/send-sms?deviceId=${deviceId}&binLevel=${binLevel}&location=${locationQuery}`
    );
    const data = await response.json();
    console.log("SMS Sent:", data);
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};


export const CheckBinThresholds = () => {
  const [smsStatus, setSmsStatus] = useState(null);
  const { binData } = useBins(); // Assuming this hook fetches bin data

  // Function to check thresholds and send SMS if conditions are met
  useEffect(() => {
    if (binData && binData.length > 0) {
      const latestData = getLatestData(binData); // Get the latest data

      latestData.forEach((bin) => {
        const { deviceId, binLevel, location } = bin;

        // Define your threshold (example: bin level above 80)
        if (binLevel > 180) {
          sendSMS(deviceId, binLevel, location);
          console.log(location.latitude) // Send SMS if bin level exceeds threshold
        }
      });
    }
  }, [binData]);

  return (
    <div>
      <h2>Bin Level Check</h2>
      {smsStatus && <p>{smsStatus}</p>} {/* Display SMS status if needed */}
      <p>{smsStatus}</p>
    </div>
  );
};

export default CheckBinThresholds;
