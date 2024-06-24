import {
  Cartesian2,
  Cartesian3,
  Matrix4,
  SceneMode,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Color,
  Rectangle,
  RectangleGraphics,
  CallbackProperty,
} from 'cesium';

import type { Viewer } from 'cesium';
import { initMap } from './initMap';

interface SyncViewProps {
  percentageChanged?: number;
}
export default class OverViewer {
  private _parentViewer: Viewer;
  private _overViewer: Viewer;
  private _options: SyncViewProps;
  private _parentHandler: ScreenSpaceEventHandler;
  private _overViewHandler: ScreenSpaceEventHandler;
  private _currentOperation: 'parent' | 'overView' = 'parent';
  private _originRate: {
    parent: number;
    overView: number;
  };
  private _destroyed = false;
  private _centerRect: Rectangle = new Rectangle();
  synchronous: boolean;

  get isDestory() {
    return this._destroyed;
  }

  constructor(parentViewer: Viewer, overViewerContainerID: string, options: SyncViewProps = {}) {
    if (!parentViewer) throw Error("viewer can't be empty!");
    this._parentViewer = parentViewer;
    this._options = options;

    this._overViewer = this._initOverView(overViewerContainerID);

    this._parentHandler = new ScreenSpaceEventHandler(parentViewer.scene.canvas);
    this._overViewHandler = new ScreenSpaceEventHandler(this._overViewer.scene.canvas);
    this.synchronous = true;
    const parentCamera = this._parentViewer.camera;
    const overViewCamera = this._overViewer.camera;
    this._originRate = {
      parent: parentCamera.percentageChanged,
      overView: overViewCamera.percentageChanged,
    };

    const centerRect = new RectangleGraphics({
      coordinates: new CallbackProperty(() => {
        return this._centerRect;
      }, false),
      material: Color.RED.withAlpha(0.5),
      outline: true,
      outlineColor: Color.RED,
      show: true,
    });
    this._overViewer.entities.add({
      rectangle: centerRect,
    });

    parentCamera.percentageChanged = this._options.percentageChanged ?? 0.01;
    overViewCamera.percentageChanged = this._options.percentageChanged ?? 0.01;
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

  private _initOverView = (overViewerContainerID: string) => { 
    const viewer = initMap(overViewerContainerID);;
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

    return viewer;
  };

  rectangleExpand = (rectangle: Rectangle, widthFactor: number, heightFactor: number) => {
    const result = rectangle.clone();
    widthFactor = (rectangle.width * (1 - widthFactor)) / 2;
    heightFactor = (rectangle.height * (1 - heightFactor)) / 2;

    result.west += widthFactor;
    result.south += heightFactor;
    result.east -= widthFactor;
    result.north -= heightFactor;
    result.west = result.west < -Math.PI ? -Math.PI : result.west;
    result.east = result.east > Math.PI ? Math.PI : result.east;
    result.north = result.north > Math.PI / 2 ? Math.PI / 2 : result.north;
    result.south = result.south < -Math.PI / 2 ? -Math.PI / 2 : result.south;

    return result;
  };

  private _updateOverView = () => {
    const parentViewer = this._parentViewer;
    const overviewViewer = this._overViewer;
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
      this._centerRect = parentCameraRectangle;
    }
  };

  private parentChangeEvent = () => {
    if (this._currentOperation === 'parent' && this.synchronous) {
      // const viewPoint = this.getViewPoint(this._parentViewer);
      // if (this._parentViewer.scene.mode !== SceneMode.SCENE3D && viewPoint.worldPosition) {
      //   this._overViewer.scene.camera.lookAt(
      //     viewPoint.worldPosition,
      //     new Cartesian3(0, 0, viewPoint.height),
      //   );
      // } else {
      //   this._overViewer.scene.camera.setView({
      //     destination: viewPoint.destination,
      //     orientation: viewPoint.orientation,
      //   });
      // }
      this._updateOverView();
    }
  };

  private overViewChangeEvent = () => {
    if (this._currentOperation === 'overView' && this.synchronous) {
      const viewPoint = this.getViewPoint(this._overViewer);
      if (this._overViewer.scene.mode !== SceneMode.SCENE3D && viewPoint.worldPosition) {
        this._parentViewer.scene.camera.lookAt(
          viewPoint.worldPosition,
          new Cartesian3(0, 0, viewPoint.height),
        );
      } else {
        this._parentViewer.scene.camera.setView({
          destination: viewPoint.destination,
          orientation: viewPoint.orientation,
        });
      }
    }
  };

  private parentViewerMouseMove = () => {
    this._currentOperation = 'parent';
    // 解除lookAt视角锁定
    // if (this._overViewer.scene.mode !== SceneMode.MORPHING)
    //   this._overViewer.scene.camera.lookAtTransform(Matrix4.IDENTITY);
  };

  private overViewerMouseMove = () => {
    this._currentOperation = 'overView';
    // 解除lookAt视角锁定
    // if (this._parentViewer.scene.mode !== SceneMode.MORPHING)
    //   this._parentViewer.scene.camera.lookAtTransform(Matrix4.IDENTITY);
  };

  start() {
    this.synchronous = true;
    // 视图同步

    this._parentHandler.setInputAction(this.parentViewerMouseMove, ScreenSpaceEventType.MOUSE_MOVE);
    this._overViewHandler.setInputAction(this.overViewerMouseMove, ScreenSpaceEventType.MOUSE_MOVE);

    this._parentViewer.camera.changed.addEventListener(this.parentChangeEvent);
    // this._overViewer.camera.changed.addEventListener(this.overViewChangeEvent);
  }

  destroy() {
    this.synchronous = false;
    if (!this._parentViewer.isDestroyed()) {
      this._parentViewer.camera.percentageChanged = this._originRate.parent;
      this._parentViewer.camera.changed.removeEventListener(this.parentChangeEvent);
      this._parentHandler.destroy();
    }
    if (!this._overViewer.isDestroyed()) {
      this._overViewer.camera.percentageChanged = this._originRate.overView;
      this._overViewer.camera.changed.removeEventListener(this.overViewChangeEvent);
      this._overViewer.entities.removeAll();
      this._overViewHandler.destroy();
      this._overViewer.destroy();
    }
    this._destroyed = true;
  }
}
