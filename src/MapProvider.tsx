import React, { createContext, useRef, useState, useEffect } from "react";
import { Map, View } from "ol";
import { Coordinate } from "ol/coordinate";

import "./MapProvider.css";

export const MapContext = createContext<{ map: Map | null }>({ map: null });

/**
 * Render an OpenLayers map and subscribe children to a context provider with
 * the map object stored in the context value.
 */
const MapProvider = ({
  children,
  center,
}: {
  children: React.ReactNode;
  center: Coordinate;
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    const options = {
      view: new View({ zoom: 16, center }),
      layers: [],
      controls: [],
      overlays: [],
    };

    const mapObject = new Map(options);
    mapObject.setTarget(mapRef.current ?? undefined);
    setMap(mapObject);

    return () => {
      mapObject.setTarget(undefined);
    };
  }, []);

  return (
    <MapContext.Provider value={{ map }}>
      <div ref={mapRef} className="ol-map">
        {children}
      </div>
    </MapContext.Provider>
  );
};

export default MapProvider;
