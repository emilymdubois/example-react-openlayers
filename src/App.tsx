import { useEffect, useState } from "react";
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
 * The default blue OpenLayers uses:
 * https://github.com/openlayers/openlayers/blob/0c23e17e138b091daab06d07230b46527c9c9076/src/ol/style/Style.js#L504.
 */
const DEFAULT_FILL_COLOR = "#0099FF";

/**
 * Render an OpenLayers map with a permanent basemap layer and a leader line
 * between the map center and the current mouse position using two different
 * implementations: (1) OpenLayer `Draw` interaction, and (2) with custom
 * `VectorSource`s and `VectorLayer`s.
 */
const App = () => {
  const [mode, setMode] = useState<Mode>("drawInteraction");

  const [drawColor, setDrawColor] = useState(DEFAULT_FILL_COLOR);
  const [lastValidDrawColor, setLastValidDrawColor] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (isColor(drawColor)) {
      setLastValidDrawColor(drawColor);
    }
  }, [drawColor]);

  return (
    <div>
      <MapProvider center={center}>
        <BasemapLayer />
        {mode === "drawInteraction" && (
          <DrawInteraction center={center} color={lastValidDrawColor} />
        )}
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

        {mode === "drawInteraction" && (
          <div className="input input-color">
            <form>
              <input
                type="text"
                id="drawInteractionColor"
                name="drawInteractionColor"
                value={drawColor}
                onChange={(event) => setDrawColor(event.target.value)}
              />

              <input
                type="reset"
                value="Reset"
                onClick={() => setDrawColor(DEFAULT_FILL_COLOR)}
              />
            </form>
          </div>
        )}

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

/**
 * Check if provided string is a valid color.
 */
const isColor = (color: string): boolean => {
  const s = new Option().style;
  s.color = color;
  return s.color !== "";
};
