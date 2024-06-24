import { Cartesian3, Matrix4, Transforms } from 'cesium';
import { convertLength } from '@turf/helpers';

import Measure from './Measure';

import type { PolylineGraphics } from 'cesium';

/**
 * 距离测量类
 */
class AzimuthAndDistanceMeasure extends Measure {
  protected _updateLabelFunc(positions: Cartesian3[]) {
    this._labels.removeAll();
    positions.forEach(position => {
      const newLabel = {
        position,
        ...this._labelStyle,
      };
      this._labels.add(newLabel);
    });
    this._updateLabelTexts(positions);
  }

  /**
   * 计算两点之间的距离
   * @param {Cartesian3} start 点位1
   * @param {Cartesian3} end 点位2
   * @returns {number} 距离/米
   */
  getDistance(start: Cartesian3, end: Cartesian3): number {
    return Cartesian3.distance(start, end);
  }

  /**
   * 计算两点连线与正北方向的夹角
   * @param {Cartesian3} start 点位1
   * @param {Cartesian3} end 点位2
   * @returns {number} 夹角/弧度
   */
  getAngleDeflectToNorth(start: Cartesian3, end: Cartesian3): number {
    //以a点为原点建立局部坐标系（东方向为x轴,北方向为y轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵
    const localToWorld = Transforms.eastNorthUpToFixedFrame(start);
    //求世界坐标到局部坐标的变换矩阵
    const worldToLocal = Matrix4.inverse(localToWorld, new Matrix4());
    //A点在局部坐标的位置，其实就是局部坐标原点
    const localPosition_A = Matrix4.multiplyByPoint(worldToLocal, start, new Cartesian3());
    //B点在以A点为原点的局部的坐标位置
    const localPosition_B = Matrix4.multiplyByPoint(worldToLocal, end, new Cartesian3());
    //弧度
    const angle = Math.atan2(
      localPosition_B.x - localPosition_A.x,
      localPosition_B.y - localPosition_A.y,
    );
    //角度
    let angleDegrees = angle * (180 / Math.PI);
    if (angleDegrees < 0) {
      angleDegrees = angleDegrees + 360;
    }
    return angleDegrees;
  }

  protected _updateLabelTexts(positions: Cartesian3[]) {
    const num = positions.length;
    let distance = 0;
    for (let i = 0; i < num; i += 1) {
      const label = this._labels.get(i);
      if (i === 0) {
        // label.text = this._locale.start;
        continue;
      } else {
        const newDis = +this.getDistance(positions[i - 1], positions[i]).toFixed(2);
        const unitedNewDis = +convertLength(newDis, 'meters', this._units).toFixed(2);
        const newAngle = +this.getAngleDeflectToNorth(positions[i - 1], positions[i]).toFixed(2);

        distance += newDis;
        distance = +distance.toFixed(2);
        // const unitedDistance = +convertLength(distance, 'meters', this._units).toFixed(2);

        label.text =
          `${this._locale.formatAngle(newAngle)}` +
          `\n${this._locale.formatLength(newDis, unitedNewDis, this._units)}`;
      }
    }
  }

  start(style: PolylineGraphics.ConstructorOptions = {}) {
    this._start('POLYLINE', {
      style,
      clampToGround: false,
    });
  }
}

export default AzimuthAndDistanceMeasure;
