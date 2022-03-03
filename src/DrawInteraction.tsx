import { useContext, useEffect, useMemo } from "react";
import GeometryType from "ol/geom/GeometryType";
import { never } from "ol/events/condition";
import { Coordinate } from "ol/coordinate";

import { MapContext } from "./MapProvider";
import { StyledDraw } from "./StyledDraw";

/**
 * Render a draw interaction on the map on mount and remove on unmount. The
 * line's start point is set to the map's center, and the end point is never
 * set to mimic "follow cursor" behavior.
 */
const DrawInteraction = ({
  center,
  color,
}: {
  center: Coordinate;
  color?: string;
}) => {
  const { map } = useContext(MapContext);

  const draw = useMemo(() => {
    return new StyledDraw({
      type: GeometryType.LINE_STRING,
      maxPoints: 2,
      condition: never,
      color,
    });
  }, [color]);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.addInteraction(draw);
    draw.appendCoordinates([center]);

    return () => {
      map.removeInteraction(draw);
    };
  }, [map, draw]);

  return null;
};

export default DrawInteraction;
