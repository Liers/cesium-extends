import {
  ArcType,
  ClassificationType,
  CallbackProperty,
  Cartesian3,
  Entity,
  PolylineGraphics,
  defined,
  Cartographic,
  Math,
} from 'cesium';
import BasicGraphices from '../base';

import type { LifeCycle } from '../base';
import type { EventArgs } from '@cesium-163-extends/subscriber';

export default class Triangle extends BasicGraphices implements LifeCycle {
  
  /**
   * 计算两点之间的高度偏移点
   * @param {Cartesian3} start 点位1
   * @param {Cartesian3} end 点位2
   * @returns {Cartesian3} 高度偏移点
   */
  private computeHorizontalLine(start: Cartesian3, end: Cartesian3): Cartesian3 {
    let cartographic = Cartographic.fromCartesian(start);
    let cartographic2 = Cartographic.fromCartesian(end);
    return Cartesian3.fromDegrees(
      Math.toDegrees(cartographic.longitude),
      Math.toDegrees(cartographic.latitude),
      cartographic2.height,
    );
  }

  dropPoint(event: EventArgs): void {
    this._dropPoint(event, this.createShape.bind(this));

    // 判断当前点位是否为第三个点位，如果是则结束绘制
    if (this.painter.breakPointEntities.length === 2) {
      this.isComplete = true;
    }
  }

  moving(event: EventArgs): void {
    if (!event.endPosition || this.painter._activeShapePoints.length === 0) return;
    const earthPosition = this.painter.pickCartesian3(event.endPosition);
    if (earthPosition && defined(earthPosition)) {
      const startPosition = this.painter._activeShapePoints[0].clone();
      const newActiveShapePoints = [startPosition];
      const tempPosition = this.computeHorizontalLine(startPosition, earthPosition);
      newActiveShapePoints.push(tempPosition);
      newActiveShapePoints.push(earthPosition);
      newActiveShapePoints.push(startPosition);
      this.painter._activeShapePoints = newActiveShapePoints
      if (this._onPointsChange) this._onPointsChange([...this.painter._activeShapePoints]);
    }
    this.painter._viewer.scene.requestRender();
  }

  playOff(): Entity {
    return this._playOff(this.createShape.bind(this));
  }

  cancel(): void {
    // this._cancel(this.createShape.bind(this));
    return;
  }

  createShape(positions: Cartesian3[] | CallbackProperty, isDynamic = false): Entity {
    const polyline: PolylineGraphics.ConstructorOptions = Object.assign(
      {},
      isDynamic && !this.sameStyle ? this.dynamicOptions : this.finalOptions,
      {
        positions,
        arcType: ArcType.RHUMB,
        classificationType: this.painter._model ? ClassificationType.CESIUM_3D_TILE : undefined,
      },
    );

    return new Entity({ polyline });
  }
}
