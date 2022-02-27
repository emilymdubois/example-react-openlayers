import { useState } from "react";
import { fromLonLat } from "ol/proj";

import MapProvider from "./MapProvider";
import BasemapLayer from "./BasemapLayer";
import DrawInteraction from "./DrawInteraction";
import CustomVector from "./CustomVector";

import "./App.css";

type Mode = "drawInteraction" | "customVector";

/* Center on Wellington, New Zealand. */
const center = fromLonLat([174.7744, -41.2851]);

/**
 * Render an OpenLayers map with a permanent basemap layer and a leader line
 * between the map center and the current mouse position using two different
 * implementations: (1) OpenLayer `Draw` interaction, and (2) with custom
 * `VectorSource`s and `VectorLayer`s.
 */
const App = () => {
  const [mode, setMode] = useState<Mode>("drawInteraction");

  return (
    <div>
      <MapProvider center={center}>
        <BasemapLayer />
        {mode === "drawInteraction" && <DrawInteraction center={center} />}
        {mode === "customVector" && <CustomVector center={center} />}
      </MapProvider>

      <div className="inputs">
        <div className="input">
          <input
            type="radio"
            id="drawInteraction"
            name="drawInteraction"
            value="drawInteraction"
            checked={mode === "drawInteraction"}
            onChange={() => setMode("drawInteraction")}
          />
          <label htmlFor="drawInteraction">
            <code>Draw</code> interaction ({makeCodeAnchor("DrawInteraction")})
          </label>
        </div>

        <div className="input">
          <input
            type="radio"
            id="customVector"
            name="customVector"
            value="customVector"
            checked={mode === "customVector"}
            onChange={() => setMode("customVector")}
          />
          <label htmlFor="customVector">
            Custom vectors ({makeCodeAnchor("CustomVector")})
          </label>
        </div>
      </div>
    </div>
  );
};

export default App;

/**
 * Function to create a GitHub repository URL for a file.
 */
function makeCodeAnchor(fileName: string): JSX.Element {
  return (
    <a
      href={`https://github.com/emilymdubois/example-react-openlayers/blob/main/src/${fileName}.tsx`}
      target="_blank"
    >
      code
    </a>
  );
}
