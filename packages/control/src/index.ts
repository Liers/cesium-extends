import type { Viewer } from 'cesium';

export default class Control {
    private _viewer: Viewer;

    constructor(viewer: Viewer) {
        if (!viewer) throw Error("viewer can't be empty!");
        this._viewer = viewer;
    }

    private _sunControl(state: boolean) {
        this._viewer.scene.globe.enableLighting = state;
        this._viewer.shadows = state;
    }

    openSun() {
        this._sunControl(true);
    }

    closeSun() {
        this._sunControl(false);
    }
}