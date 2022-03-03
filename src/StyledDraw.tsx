import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import GeometryType from "ol/geom/GeometryType";
import Draw, { Options as DrawOptions } from "ol/interaction/Draw";
import RenderFeature from "ol/render/Feature";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

type StyledDrawOptions = DrawOptions & { color?: string };

/**
 * An extension of the OpenLayers Draw interaction with a configurable fill color.
 */
export class StyledDraw extends Draw {
  constructor(options: StyledDrawOptions) {
    if (options.color) {
      const styleFunction = getStyleFunction(options.color);
      if (styleFunction) {
        options.style = styleFunction;
      }
    }

    super(options);
  }
}

/**
 * Make a styling function.
 *
 * Forked from OpenLayers:
 * https://github.com/openlayers/openlayers/blob/0c23e17e138b091daab06d07230b46527c9c9076/src/ol/interaction/Draw.js#L1155-L1163.
 *
 * @param color Fill color.
 * @returns A function that returns an OpenLayers Style for the given feature's geometry type.
 */
function getStyleFunction(color: string) {
  const styles = createStyles(color);
  return function (feature: Feature<Geometry> | RenderFeature) {
    return styles[feature.getGeometry()?.getType()];
  };
}

type StyleByGeometry = { [geometryType: string]: Style[] };

/**
 * Default styles for editing features.
 *
 * Forked from OpenLayers and modified to accept color argument:
 * https://github.com/openlayers/openlayers/blob/0c23e17e138b091daab06d07230b46527c9c9076/src/ol/style/Style.js#L496-L557.
 *
 * @param color Fill color.
 * @returns OpenLayers Style indexed by geometry type.
 */
export function createStyles(color: string) {
  const styles: StyleByGeometry = {};
  const white = [255, 255, 255, 1];
  const width = 3;

  styles[GeometryType.POLYGON] = [
    new Style({
      fill: new Fill({
        color: [255, 255, 255, 0.5],
      }),
    }),
  ];
  styles[GeometryType.MULTI_POLYGON] = styles[GeometryType.POLYGON];

  styles[GeometryType.LINE_STRING] = [
    new Style({
      stroke: new Stroke({
        color: white,
        width: width + 2,
      }),
    }),
    new Style({
      stroke: new Stroke({
        color,
        width: width,
      }),
    }),
  ];
  styles[GeometryType.MULTI_LINE_STRING] = styles[GeometryType.LINE_STRING];

  styles[GeometryType.CIRCLE] = styles[GeometryType.POLYGON].concat(
    styles[GeometryType.LINE_STRING]
  );

  styles[GeometryType.POINT] = [
    new Style({
      image: new CircleStyle({
        radius: width * 2,
        fill: new Fill({
          color,
        }),
        stroke: new Stroke({
          color: white,
          width: width / 2,
        }),
      }),
      zIndex: Infinity,
    }),
  ];
  styles[GeometryType.MULTI_POINT] = styles[GeometryType.POINT];

  styles[GeometryType.GEOMETRY_COLLECTION] = styles[
    GeometryType.POLYGON
  ].concat(styles[GeometryType.LINE_STRING], styles[GeometryType.POINT]);

  return styles;
}
