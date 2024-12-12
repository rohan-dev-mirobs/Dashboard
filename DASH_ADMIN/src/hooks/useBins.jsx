import { useState, useEffect } from 'react';

const useBins = () => {
  const [binData, setBinData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch the latest bin data
  const getLatestData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/bins'); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch bin data');
      }
      const rawData = await response.json();
      // console.log(rawData[0].batteryAlarm) //For debugging
      // Preprocess the data to extract relevant fields
      const processedData = rawData.map((item) => ({
        key: item.key || 'Unknown', // Use _id as the unique key
        deviceId: item.deviceId || 'N/A', // Use token_id as the deviceId
        height: item.height || 'N/A',
        longitude: item.longitude || 'N/A',
        latitude: item.latitude || 'N/A',
        temperature: item.temperature || 'N/A',
        fullAlarm: item.fullAlarm || 0,
        fireAlarm: item.fireAlarm || 0,
        tiltAlarm: item.tiltAlarm || 0,
        batteryAlarm: item.batteryAlarm || 0,
        volt: item.volt || 'N/A',
        angle: item.angle || 'N/A',
        rsrp: item.rsrp || 'N/A',
        frameCounter: item.frameCounter || 'N/A',
        timestamp: item.timestamp || 'N/A',
      }));

      setBinData(processedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Call getLatestData once when the hook is first used
  useEffect(() => {
    getLatestData();
  }, []); // Empty dependency array means it runs once on component mount

  return { binData, loading, error, getLatestData };
};

export default useBins;
