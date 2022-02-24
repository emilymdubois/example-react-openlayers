import { useContext, useEffect, useState } from "react";
import { debounce } from "lodash-es";
import { Feature, Map, MapBrowserEvent } from "ol";
import VectorSource from "ol/source/Vector";
import LineString from "ol/geom/LineString";
import { Coordinate } from "ol/coordinate";
import VectorLayer from "ol/layer/Vector";
import { Stroke, Style } from "ol/style";
import Geometry from "ol/geom/Geometry";

import { MapContext } from "./MapProvider";

export type MousePosition = Coordinate | null;

const LAYER_CLASS_NAME = "centerToCursor";
const BLUE = "#0099ff";

/**
 * Render a vector layer with a LineString source on the map on mount and remove
 * on unmount. The line's start point is set to the map's center, and the end
 * point is updated to the current mouse position.
 */
const CenterToCursorLayer = ({
  center,
  onMousePositionChange,
  onUnmount,
}: {
  center: Coordinate;
  // The following two lifecycle events are only being used to send mouse
  // position updates to the parent (e.g., to display coordinates in a map
  // overlay). They are not necessary for the core LineString rendering logic
  // encapsulated by the CenterToCursorLayer component.
  onMousePositionChange?: (mousePosition: MousePosition) => void;
  onUnmount?: () => void;
}) => {
  const { map } = useContext(MapContext);

  const mousePosition = useMousePosition({ map });

  useEffect(() => {
    if (onMousePositionChange) {
      onMousePositionChange(mousePosition);
    }
  }, [onMousePositionChange, mousePosition]);

  const layer = new VectorLayer({
    className: LAYER_CLASS_NAME,
    source: new VectorSource(),
    style: [
      new Style({
        stroke: new Stroke({
          color: "#ffffff",
          width: 6,
        }),
      }),
      new Style({
        stroke: new Stroke({
          color: BLUE,
          width: 4,
        }),
      }),
    ],
  });

  /* Update the center-to-cursor layer with a new source with the latest mouse
  position as the end point. */
  useEffect(() => {
    if (!map || !mousePosition) {
      return;
    }

    const mapLayer = map
      .getLayers()
      .getArray()
      .find((layer) => layer.getClassName() === LAYER_CLASS_NAME);

    if (mapLayer) {
      const source = new VectorSource({
        features: [
          new Feature({
            geometry: new LineString([center, mousePosition]),
          }),
        ],
      });

      (mapLayer as VectorLayer<VectorSource<Geometry>>).setSource(source);
    }
  }, [center, mousePosition]);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);

      if (onUnmount) {
        onUnmount();
      }
    };
  }, [map]);

  return null;
};

export default CenterToCursorLayer;

/**
 * A React hook for accessing the map coordinates at the current mouse position with optional debouncing.
 */
export const useMousePosition = ({
  map,
  interval,
}: {
  map: Map | null;
  interval?: number;
}) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>(null);

  const updateMousePosition = (event: MapBrowserEvent<MouseEvent>) => {
    setMousePosition(event.coordinate);
  };

  const debouncedUpdateMousePosition = debounce(
    updateMousePosition,
    interval ?? 0
  );

  useEffect(() => {
    if (!map) {
      return;
    }

    map.on("pointermove", debouncedUpdateMousePosition);

    return () => {
      map.un("pointermove", debouncedUpdateMousePosition);
    };
  }, [map]);

  return mousePosition;
};
