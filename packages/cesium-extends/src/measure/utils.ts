import {
  Cartographic,
  Cesium3DTileFeature,
  Cesium3DTileset,
  EllipsoidTerrainProvider,
  Model,
  Math as CMath,
  Ellipsoid,
  Cartesian3,
} from 'cesium';
import type { Cartesian2, HeightReference, Viewer } from 'cesium';
import { MeasureUnits } from './Measure';

export type PickResult = {
  cartesian: Cartesian3;
  CartesianModel: Cartesian3;
  cartesianTerrain: Cartesian3;
  windowCoordinates: Cartesian2;
  altitudeMode: HeightReference;
};

/***
 * 坐标转换 84转笛卡尔
 *
 * @param {Object} {lng,lat,alt} 地理坐标
 *
 * @return {Object} Cartesian3 三维位置坐标
 */
export function transformWGS84ToCartesian(
  position: { lon?: number; lat: number; alt: number; lng?: number },
  alt?: number,
): Cartesian3 {
  return position
    ? Cartesian3.fromDegrees(
        position.lng !== undefined ? position.lng : position.lon || 0,
        position.lat,
        (position.alt = alt || position.alt),
        Ellipsoid.WGS84,
      )
    : Cartesian3.ZERO;
}

/***
 * 坐标转换 笛卡尔转84
 *
 * @param {Object} Cartesian3 三维位置坐标
 *
 * @return {Object} {lng,lat,alt} 地理坐标
 */
export function transformCartesianToWGS84(cartesian: Cartesian3): { lng: number; lat: number; alt: number } {
  const ellipsoid = Ellipsoid.WGS84;
  const cartographic = ellipsoid.cartesianToCartographic(cartesian);
  return {
    lng: CMath.toDegrees(cartographic.longitude),
    lat: CMath.toDegrees(cartographic.latitude),
    alt: cartographic.height,
  };
}

export function pickCartesian3(viewer: Viewer, position: Cartesian2): Cartesian3 | undefined {
  // We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
  // we get the correct point when mousing over terrain.
  // const ray = viewer.camera.getPickRay(position);
  // if (ray) return viewer.scene.globe.pick(ray, viewer.scene);
  // return undefined;

  const picks = viewer.scene.drillPick(position);
  let cartesian = null;
  let isOn3dtiles = false;
  let isOnTerrain = false;
  // drillPick
  for (let i in picks) {
    let pick = picks[i];

    if (
      (pick && pick.primitive instanceof Cesium3DTileFeature) ||
      (pick && pick.primitive instanceof Cesium3DTileset) ||
      (pick && pick.primitive instanceof Model)
    ) {
      //模型上拾取
      isOn3dtiles = true;
    }
    // 3dtilset
    if (isOn3dtiles) {
      viewer.scene.pick(position); // pick
      cartesian = viewer.scene.pickPosition(position);
      if (cartesian) {
        let cartographic = Cartographic.fromCartesian(cartesian);
        if (cartographic.height < 0) cartographic.height = 0;
        const lon = CMath.toDegrees(cartographic.longitude);
        const lat = CMath.toDegrees(cartographic.latitude);
        const height = cartographic.height;
        cartesian = transformWGS84ToCartesian({ lng: lon, lat: lat, alt: height });
      }
    }
  }
  // 地形
  let boolTerrain = viewer.terrainProvider instanceof EllipsoidTerrainProvider;
  // Terrain
  if (!isOn3dtiles && !boolTerrain) {
    var ray = viewer.scene.camera.getPickRay(position);
    if (!ray) return undefined;
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    isOnTerrain = true;
  }
  // 地球
  if (!isOn3dtiles && !isOnTerrain && boolTerrain) {
    cartesian = viewer.scene.camera.pickEllipsoid(position, viewer.scene.globe.ellipsoid);
  }
  if (cartesian) {
    let position = transformCartesianToWGS84(cartesian);
    if (position.alt < 0) {
      cartesian = transformWGS84ToCartesian(position, 0.1);
    }
    return cartesian;
  }
  return undefined;
}

export function getBounds(points: Cartesian2[]): number[] {
  const left = Math.min(...points.map(item => item.x));
  const right = Math.max(...points.map(item => item.x));
  const top = Math.max(...points.map(item => item.y));
  const bottom = Math.min(...points.map(item => item.y));

  const bounds = [left, top, right, bottom];
  return bounds;
}

export function formatAngle(angle: number) {
  return `Angle: ${angle}°`;
}

/**
 * 格式化显示长度
 * @param length 单位米
 * @param unit 目标单位
 */
export function formatLength(length: number, unitedLength: number, unit: MeasureUnits) {
  if (length < 1000) {
    return length + 'meters';
  }
  return unitedLength + unit;
}

/**
 * 格式化显示面积
 * @param area 单位米
 * @param unit 目标单位
 */
export function formatArea(area: number, unitedArea: number, unit: MeasureUnits) {
  if (area < 1000000) {
    return area + ' square meters ';
  }
  return unitedArea + ' square ' + unit;
}

export function mean(array: number[]): number {
  return array.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / array.length;
}

/**
   * 计算两点之间的中间点
   * @param {Cartesian3} start 点位1
   * @param {Cartesian3} end 点位2
   */
export function getMiddlePoint(start: Cartesian3, end: Cartesian3): Cartesian3 {
  return Cartesian3.midpoint(start, end, new Cartesian3());
}

/**
 * 获得两点之间的高度差
 * @param {Cartesian3} start 点位1
 * @param {Cartesian3} end 点位2
 * @returns {number} 高度差/米
 */
export function getHeightDifference(start: Cartesian3, end: Cartesian3): number {
  if (!start && !end) return 0;
  if (Cartesian3.equals(start, end)) return 0;
  let cartographic = Cartographic.fromCartesian(start);
  let cartographic2 = Cartographic.fromCartesian(end);
  return cartographic2.height - cartographic.height;
}

/**
 * 计算两点之间的距离
 * @param {Cartesian3} start 点位1
 * @param {Cartesian3} end 点位2
 * @returns {number} 距离/米
 */
export function getDistance(start: Cartesian3, end: Cartesian3): number {
  return Cartesian3.distance(start, end);
}

/**
 * 计算两点连线与水平线的夹角
 * @param positions 
 * @returns {string} 夹角
 */
export function getAngleDeflectToHorizontal(positions: Cartesian3[]): string {
  const start = positions[0];
  const end = positions[2];
  const heightDifference = getHeightDifference(start, end);
  const distance = getDistance(start, end);
  const angle = Math.atan(heightDifference / distance) * (180 / Math.PI);
  return `${angle.toFixed(2)}°`;
}
