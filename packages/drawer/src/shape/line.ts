import { ArcType, ClassificationType, Color, Entity, PolylineArrowMaterialProperty } from 'cesium';
import BasicGraphices from '../base';

import type { LifeCycle } from '../base';
import type { CallbackProperty, Cartesian3, PolylineGraphics } from 'cesium';
import type { EventArgs } from '@cesium-163-extends/subscriber';

export default class Line extends BasicGraphices implements LifeCycle {
  dropPoint(event: EventArgs): void {
    this._dropPoint(event, this.createShape.bind(this));

    // 判断当前点位是否为第二个点位，如果是则结束绘制
    if (this.painter.breakPointEntities.length === 2) {
      this.isComplete = true;
    }
  }

  playOff(): Entity {
    return this._playOff(this.createShape.bind(this));
  }

  cancel(): void {
    this._cancel(this.createShape.bind(this));
  }

  createShape(
    positions: Cartesian3[] | CallbackProperty,
    isDynamic = false,
  ): Entity {
    const polyline: PolylineGraphics.ConstructorOptions = Object.assign(
      {},
      isDynamic && !this.sameStyle ? this.dynamicOptions : this.finalOptions,
      {
        positions,
        arcType: ArcType.RHUMB,
        classificationType: this.painter._model ? ClassificationType.CESIUM_3D_TILE : undefined,
        // @ts-ignore
        material: new PolylineArrowMaterialProperty(Color.YELLOW),
        width: 10,
      },
    );

    return new Entity({ polyline });
  }
}
