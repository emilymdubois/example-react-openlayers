import { useContext, useEffect } from "react";
import OLTileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";

import { MapContext } from "./MapProvider";

const Z_INDEX = 0;

/**
 * Render a tiled OpenStreetMap basemap layer.
 */
const BasemapLayer = () => {
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map) {
      return;
    }

    let tileLayer = new OLTileLayer({
      source: new OSM(),
      zIndex: Z_INDEX,
    });

    map.addLayer(tileLayer);
    tileLayer.setZIndex(Z_INDEX);

    return () => {
      map.removeLayer(tileLayer);
    };
  }, [map]);

  return null;
};

export default BasemapLayer;
