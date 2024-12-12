import React, { createContext, useContext, useState } from "react";

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [selectedBin, setSelectedBin] = useState(null);

  return (
    <MapContext.Provider value={{ selectedBin, setSelectedBin }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);
