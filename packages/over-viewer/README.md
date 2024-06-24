# @cesium-163-extends/over-viewer

`@cesium-163-extends/over-viewer` is an npm package for synchronizing two Cesium Viewer instances.
[中文 Readme](./README_CN.md)

## Installation

```bash
npm install @cesium-163-extends/over-viewer
```

## Usage

```js
import { Viewer } from "cesium";
import OverViewer from "@cesium-163-extends/over-viewer";

const leftViewer = new Viewer("left-container");
const rightViewer = new Viewer("right-container");

const syncViewer = new OverViewer(leftViewer, rightViewer);

// Destroy
syncViewer.destroy();
```

## API

### `SyncViewProps`

| Property Name     | Type     | Description                                                  |
| ----------------- | -------- | ------------------------------------------------------------ |
| percentageChanged | `number` | The percentage of distance changed when the camera zooms in. |

### `OverViewer`

#### Constructor

```ts
constructor(leftViewer: Viewer, rightViewer: Viewer, options?: SyncViewProps)
```

- `leftViewer`: A Cesium Viewer instance on the left.
- `rightViewer`: A Cesium Viewer instance on the right.
- `options` (optional): An object containing options:
  - `percentageChanged`: The percentage of distance changed when the camera zooms in, default to `0.01`.

#### Methods

##### `start()`

Start synchronizing the views of the left and right viewers.

```ts
start(): void
```

##### `destroy()`

Destroy the instance and unsynchronize the views of the left and right viewers.

```ts
destroy(): void
```

#### Properties

##### `synchronous`

Get or set whether to synchronize the views.

```ts
synchronous: boolean;
```

##### `isDestory`

Get whether the instance has been destroyed.

```ts
get isDestory(): boolean
```

#### Events

##### `leftChangeEvent()`

Triggered when the view of the left viewer changes, used to synchronize the view of the right viewer.

##### `rightChangeEvent()`

Triggered when the view of the right viewer changes, used to synchronize the view of the left viewer.
