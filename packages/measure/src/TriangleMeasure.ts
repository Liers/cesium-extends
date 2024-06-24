import {
  Cartesian3,
  PolylineGraphics,
  Color,
  Cartesian2,
  HeightReference,
  NearFarScalar,
} from 'cesium';
import Measure from './Measure';
import Label from 'cesium/Source/Scene/Label';
import { getAngleDeflectToHorizontal, getDistance, getHeightDifference, getMiddlePoint } from './utils';

/**
 * 三角测量类
 */
class TriangleMeasure extends Measure {
  protected _updateLabelFunc(positions: Cartesian3[]) {
    this._labels.removeAll();
    const num = positions.length;
    if (num < 4) return;
    // positions中第一点为起点，第二点为高度差点，第三点为终点
    // 分别计算起点到高度差点的距离和高度差以及水平距离
    const distance = this.formateDistance(getDistance(positions[0], positions[2]));
    const heightDifference = this.formateDistance(getHeightDifference(positions[0], positions[1]));
    const horizontalDistance = this.formateDistance(getDistance(positions[1], positions[2]));

    // 计算夹角
    const angle = getAngleDeflectToHorizontal(positions);
    for (let i = 0; i < 3; i += 1) {
      // @ts-ignore
      const label: Label = {
        ...this._labelStyle,
        heightReference: HeightReference.NONE,
      }
      switch (i) {
        case 0:
          label.position = getMiddlePoint(positions[0], positions[2]);
          label.text = `空间距离: ${distance}`;
          break;
        case 1:
          label.position = getMiddlePoint(positions[0], positions[1]);
          label.text = `高度差: ${heightDifference}` + `\n角度: ${angle}`;
          break;
        case 2:
          label.position = getMiddlePoint(positions[1], positions[2]);
          label.text = `水平距离: ${horizontalDistance}`;
          break;
        default:
          break;
      }
      this._labels.add(label);
    }
  }

  formateDistance(distance: number): string {
    if (distance < 1000) {
      return distance.toFixed(2) + '米';
    }
    return (distance / 1000).toFixed(2) + '公里';
  }

  start(style: PolylineGraphics.ConstructorOptions = {}) {
    this._start('TRIANGLE', {
      style,
      clampToGround: false,
    });
  }
}

export default TriangleMeasure;
