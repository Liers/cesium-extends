import {
  BoundingRectangle,
  Cartesian2,
  Cartesian3,
  Matrix4,
  SceneMode,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  ViewportQuad,
  Color,
  defined,
  SceneTransforms,
  Rectangle,
} from 'cesium';

import type { Viewer } from 'cesium';

interface SyncViewProps {
  percentageChanged?: number;
}
export default class SyncViewer {
  private _leftViewer: Viewer;
  private _rightViewer: Viewer;
  private _options: SyncViewProps;
  private _leftHandler: ScreenSpaceEventHandler;
  private _rightHandler: ScreenSpaceEventHandler;
  private _currentOperation: 'left' | 'right' = 'left';
  private _originRate: {
    left: number;
    right: number;
  };
  private _destroyed = false;
  private _centerRect: ViewportQuad;
  synchronous: boolean;

  get isDestory() {
    return this._destroyed;
  }

  constructor(leftViewer: Viewer, rightViewer: Viewer, options: SyncViewProps = {}) {
    if (!leftViewer || !rightViewer) throw Error("viewer can't be empty!");
    this._leftViewer = leftViewer;
    this._rightViewer = rightViewer;
    this._options = options;

    this._limitOverView(rightViewer);

    this._leftHandler = new ScreenSpaceEventHandler(leftViewer.scene.canvas);
    this._rightHandler = new ScreenSpaceEventHandler(rightViewer.scene.canvas);
    this.synchronous = true;
    const leftCamera = this._leftViewer.camera;
    const rightCamera = this._rightViewer.camera;
    this._originRate = {
      left: leftCamera.percentageChanged,
      right: rightCamera.percentageChanged,
    };

    this._centerRect = new ViewportQuad(new BoundingRectangle(150, 100, 100, 50));
    this._centerRect.show = false;
    this._centerRect.material.uniforms.color = Color.RED.withAlpha(0.5);
    rightViewer.scene.primitives.add(this._centerRect);

    leftCamera.percentageChanged = this._options.percentageChanged ?? 0.01;
    rightCamera.percentageChanged = this._options.percentageChanged ?? 0.01;
    this.start();
  }

  getViewPoint(viewer: Viewer) {
    const camera = viewer.camera;
    // The center of the view is the point that the 3D camera is focusing on
    const viewCenter = new Cartesian2(
      Math.floor(viewer.canvas.clientWidth / 2),
      Math.floor(viewer.canvas.clientHeight / 2),
    );
    // Given the pixel in the center, get the world position
    const worldPosition = viewer.scene.camera.pickEllipsoid(viewCenter);

    return {
      worldPosition,
      height: camera.positionCartographic.height,
      destination: camera.position.clone(),
      orientation: {
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll,
      },
    };
  }

  private _limitOverView = (viewer: Viewer) => {
    const control = viewer.scene.screenSpaceCameraController;
    control.enableRotate = false;
    control.enableTranslate = false;
    control.enableZoom = false;
    control.enableTilt = false;
    control.enableLook = false;

    viewer.scene.mode = SceneMode.SCENE2D;
    viewer.scene.highDynamicRange = false;
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.showWaterEffect = false;
    viewer.scene.globe.depthTestAgainstTerrain = false;
    viewer.scene.skyAtmosphere.show = false;
    viewer.scene.fog.enabled = false;
    viewer.scene.skyBox.show = false;
    viewer.scene.sun.show = false;
    viewer.scene.moon.show = false;
    viewer.scene.highDynamicRange = false;
    viewer.scene.globe.showGroundAtmosphere = false;
  };

  rectangleExpand = (rectangle: Rectangle, widthFactor: number, heightFactor: number) => {
    const result = rectangle.clone()
    widthFactor = (rectangle.width * (1 - widthFactor)) / 2
    heightFactor = (rectangle.height * (1 - heightFactor)) / 2

    result.west += widthFactor
    result.south += heightFactor
    result.east -= widthFactor
    result.north -= heightFactor
    result.west = result.west < -Math.PI ? -Math.PI : result.west
    result.east = result.east > Math.PI ? Math.PI : result.east
    result.north = result.north > Math.PI / 2 ? Math.PI / 2 : result.north
    result.south = result.south < -Math.PI / 2 ? -Math.PI / 2 : result.south

    return result
  };

  private _updateOverView = () => {
    const parentViewer = this._leftViewer;
    const overviewViewer = this._rightViewer;
    if (overviewViewer) {
    const parentCameraRectangle = parentViewer.camera.computeViewRectangle();
    if (!parentCameraRectangle) {
      return;
    }
    const rectangle = this.rectangleExpand(parentCameraRectangle, 2, 2);

    overviewViewer.camera.flyTo({
      destination: rectangle.clone(),
      orientation: {
        heading: parentViewer.camera.heading,
        pitch: parentViewer.camera.pitch,
        roll: parentViewer.camera.roll,
      },
      duration: 0.0,
    });
    const wnPosition = Cartesian3.fromRadians(
      parentCameraRectangle.west,
      parentCameraRectangle.north,
    );
    const enPosition = Cartesian3.fromRadians(
      parentCameraRectangle.east,
      parentCameraRectangle.north,
    );
    const wsPosition = Cartesian3.fromRadians(
      parentCameraRectangle.west,
      parentCameraRectangle.south,
    );
    const esPosition = Cartesian3.fromRadians(
      parentCameraRectangle.east,
      parentCameraRectangle.south,
    );
    const scene = overviewViewer.scene;
    const wnWindowPosition = SceneTransforms.wgs84ToWindowCoordinates(scene, wnPosition);
    const enWindowPosition = SceneTransforms.wgs84ToWindowCoordinates(scene, enPosition);
    const wsWindowPosition = SceneTransforms.wgs84ToWindowCoordinates(scene, wsPosition);
    const esWindowPosition = SceneTransforms.wgs84ToWindowCoordinates(scene, esPosition);

    if (
      !defined(wnWindowPosition) ||
      !defined(enWindowPosition) ||
      !defined(wsWindowPosition) ||
      !defined(esWindowPosition)
    ) {
      return;
    }

    const width = enWindowPosition.x - wnWindowPosition.x;
    const height = wsWindowPosition.y - wnWindowPosition.y;
    const x = (wnWindowPosition.x + enWindowPosition.x) / 2 - width / 2;
    const y = (wnWindowPosition.y + wsWindowPosition.y) / 2 - height / 2;

    if (width <= 0 || height <= 0) {
      return;
    }
    console.log('width', width, 'height', height, 'x', x, 'y', y);
    const boundingRectangle = new BoundingRectangle(x, y, width, height);
    this._centerRect.rectangle = boundingRectangle;
    this._centerRect.show = true;
  }
  };

  private leftChangeEvent = () => {
    if (this._currentOperation === 'left' && this.synchronous) {
      const viewPoint = this.getViewPoint(this._leftViewer);
      if (this._leftViewer.scene.mode !== SceneMode.SCENE3D && viewPoint.worldPosition) {
        this._rightViewer.scene.camera.lookAt(
          viewPoint.worldPosition,
          new Cartesian3(0, 0, viewPoint.height),
        );
      } else {
        // this._rightViewer.scene.camera.setView({
        //   destination: viewPoint.destination,
        //   orientation: viewPoint.orientation,
        // });
        this._updateOverView();
      }
    }
  };

  private rightChangeEvent = () => {
    if (this._currentOperation === 'right' && this.synchronous) {
      const viewPoint = this.getViewPoint(this._rightViewer);
      if (this._rightViewer.scene.mode !== SceneMode.SCENE3D && viewPoint.worldPosition) {
        this._leftViewer.scene.camera.lookAt(
          viewPoint.worldPosition,
          new Cartesian3(0, 0, viewPoint.height),
        );
      } else {
        this._leftViewer.scene.camera.setView({
          destination: viewPoint.destination,
          orientation: viewPoint.orientation,
        });
      }
    }
  };

  private leftViewerMouseMove = () => {
    this._currentOperation = 'left';
    // 解除lookAt视角锁定
    if (this._rightViewer.scene.mode !== SceneMode.MORPHING)
      this._rightViewer.scene.camera.lookAtTransform(Matrix4.IDENTITY);
  };

  private rightViewerMouseMove = () => {
    this._currentOperation = 'right';
    // 解除lookAt视角锁定
    if (this._leftViewer.scene.mode !== SceneMode.MORPHING)
      this._leftViewer.scene.camera.lookAtTransform(Matrix4.IDENTITY);
  };

  start() {
    this.synchronous = true;
    // 视图同步

    this._leftHandler.setInputAction(this.leftViewerMouseMove, ScreenSpaceEventType.MOUSE_MOVE);
    this._rightHandler.setInputAction(this.rightViewerMouseMove, ScreenSpaceEventType.MOUSE_MOVE);

    this._leftViewer.camera.changed.addEventListener(this.leftChangeEvent);
    this._rightViewer.camera.changed.addEventListener(this.rightChangeEvent);
  }

  destroy() {
    this.synchronous = false;
    if (!this._leftViewer.isDestroyed()) {
      this._leftViewer.camera.percentageChanged = this._originRate.left;
      this._leftViewer.camera.changed.removeEventListener(this.leftChangeEvent);
      this._leftHandler.destroy();
    }
    if (!this._rightViewer.isDestroyed()) {
      this._rightViewer.camera.percentageChanged = this._originRate.right;
      this._rightViewer.camera.changed.removeEventListener(this.rightChangeEvent);
      this._rightHandler.destroy();
    }
    this._destroyed = true;
  }
}
