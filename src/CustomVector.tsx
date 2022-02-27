import { useContext, useEffect, useState } from "react";
import { debounce } from "lodash-es";
import { Feature, Map, MapBrowserEvent } from "ol";
import VectorSource from "ol/source/Vector";
import LineString from "ol/geom/LineString";
import { Coordinate } from "ol/coordinate";
import VectorLayer from "ol/layer/Vector";
import { Fill, Stroke, Style } from "ol/style";
import Geometry from "ol/geom/Geometry";

import { MapContext } from "./MapProvider";
import Circle from "ol/geom/Circle";
import CircleStyle from "ol/style/Circle";
import Point from "ol/geom/Point";

type MousePosition = Coordinate | null;

type CustomLayer = VectorLayer<VectorSource<Geometry>> | undefined;

const LINE_LAYER = "lineLayer";
const POINT_LAYER = "pointLayer";

const FILL_COLOR = "fuchsia";
const STROKE_COLOR = "white";

const lineLayer = new VectorLayer({
  className: LINE_LAYER,
  source: new VectorSource(),
  style: [
    new Style({
      stroke: new Stroke({
        color: STROKE_COLOR,
        width: 5,
      }),
    }),
    new Style({
      stroke: new Stroke({
        color: FILL_COLOR,
        width: 3,
      }),
    }),
  ],
});

const pointLayer = new VectorLayer({
  className: POINT_LAYER,
  source: new VectorSource({}),
  style: new Style({
    image: new CircleStyle({
      fill: new Fill({ color: FILL_COLOR }),
      stroke: new Stroke({ color: STROKE_COLOR, width: 1.5 }),
      radius: 6,
    }),
  }),
});

/**
 * Render two custom vector layers on the map on mount and remove on unmount.
 * One vector layer source is a LineString with the start point at the map
 * center, and the end point updated to the current mouse position. The second
 * vector layer source is a Point at the current mouse position.
 */
const CustomVector = ({ center }: { center: Coordinate }) => {
  const { map } = useContext(MapContext);

  const mousePosition = useMousePosition({ map });

  /* Update the layers with new source reflecting the latest mouse position. */
  useEffect(() => {
    if (!map || !mousePosition) {
      return;
    }

    const mapLayers = map.getLayers().getArray();

    const mapLineLayer = mapLayers.find(
      (layer) => layer.getClassName() === LINE_LAYER
    ) as CustomLayer;

    if (mapLineLayer) {
      const source = makeSource(new LineString([center, mousePosition]));
      mapLineLayer.setSource(source);
    }

    const mapPointLayer = mapLayers.find(
      (layer) => layer.getClassName() === POINT_LAYER
    ) as CustomLayer;

    if (mapPointLayer) {
      const source = makeSource(new Point(mousePosition));
      mapPointLayer.setSource(source);
    }
  }, [center, mousePosition]);

  useEffect(() => {
    if (!map) {
      return;
    }

    map.addLayer(lineLayer);
    map.addLayer(pointLayer);

    return () => {
      map.removeLayer(lineLayer);
      map.removeLayer(pointLayer);
    };
  }, [map]);

  return null;
};

export default CustomVector;

/**
 * A React hook for accessing the map coordinates at the current mouse position with optional debouncing.
 */
const useMousePosition = ({
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

/**
 * Construct a vector source with a single feature with the provided geometry.
 */
function makeSource(geometry: Geometry) {
  return new VectorSource({
    features: [
      new Feature({
        geometry,
      }),
    ],
  });
}
