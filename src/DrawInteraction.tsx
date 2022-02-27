import { useContext, useEffect } from "react";
import { never } from "ol/events/condition";
import { Coordinate } from "ol/coordinate";
import Draw from "ol/interaction/Draw";
import GeometryType from "ol/geom/GeometryType";

import { MapContext } from "./MapProvider";

const draw = new Draw({
  type: GeometryType.LINE_STRING,
  maxPoints: 2,
  condition: never,
});

/**
 * Render a draw interaction on the map on mount and remove on unmount. The
 * line's start point is set to the map's center, and the end point is never
 * set to mimic "follow cursor" behavior.
 */
const DrawInteraction = ({ center }: { center: Coordinate }) => {
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.addInteraction(draw);
    draw.appendCoordinates([center]);

    return () => {
      map.removeInteraction(draw);
    };
  }, [map]);

  return null;
};

export default DrawInteraction;
