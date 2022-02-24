import { useState } from "react";
import { fromLonLat } from "ol/proj";

import MapProvider from "./MapProvider";
import BasemapLayer from "./BasemapLayer";
import CenterToCursorLayer, { MousePosition } from "./CenterToCursorLayer";

import "./App.css";

/* Center on Wellington, New Zealand. */
const center = fromLonLat([174.7744, -41.2851]);

/**
 * Render an OpenLayers map with a permanent basemap layer and a conditional
 * LineString layer between the map's center and the user's mouse position.
 */
const App = () => {
  const [showCenterToCursorLayer, setShowCenterToCursorLayer] = useState(true);

  /* An external store of the mouse position for demonstrating the `pointermove`
  events don't fire when the center-to-cursor layer isn't shown. */
  const [mousePositionExt, setMousePositionExt] = useState<MousePosition>(null);

  return (
    <div>
      <MapProvider center={center}>
        {/* Always show basemap layer. */}
        <BasemapLayer />

        {/* Only show leader line when mode is enabled. */}
        {showCenterToCursorLayer && (
          <CenterToCursorLayer
            center={center}
            onMousePositionChange={(mousePosition: MousePosition) => {
              setMousePositionExt(mousePosition);
            }}
            onUnmount={() => {
              setMousePositionExt(null);
            }}
          />
        )}
      </MapProvider>

      <div className="inputs">
        <div className="input">
          <input
            type="checkbox"
            id="showCenterToCursorLayer"
            name="showCenterToCursorLayer"
            checked={showCenterToCursorLayer}
            onChange={(event) => {
              setShowCenterToCursorLayer(event.target.checked);
            }}
          />
          <label htmlFor="showCenterToCursorLayer">
            Show center-to-cursor layer
          </label>
        </div>

        <pre>
          {mousePositionExt?.map((c) => c.toFixed(4)).join(", ") ??
            "No cursor coordinates"}
        </pre>
      </div>
    </div>
  );
};

export default App;
