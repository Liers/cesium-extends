---
title: over-viewer（鹰眼图）
nav: 指南
group: 扩展
order: 2
---

# @cesium-extends/over-viewer

`@cesium-extends/over-viewer` 是一个用于加载鹰眼图控件的 npm 包。

## 安装

```bash
npm install @cesium-extends/over-viewer
```

## 使用

```js
import { Viewer } from 'cesium';
import OverViewer from '@cesium-extends/over-viewer';

const leftViewer = new Viewer('left-container');
// 鹰眼图HTML容器
const overViewerContainerID = 'overview-container';

const syncViewer = new OverViewer(parentViewer.current, overViewerContainerID);

// 销毁
syncViewer.destroy();
```

## 示例

下面的示例演示了鹰眼图效果

<code src="@/components/Map/over-viewer.tsx"></code>

### `SyncViewProps`

| 属性名            | 类型     | 描述                                              |
| ----------------- | -------- | ------------------------------------------------- |
| percentageChanged | `number` | 相机 zoom 改变时距离改变的百分比，默认为 `0.01`。 |

### `OverViewer`

#### 构造函数

```ts
constructor(parentViewer: Viewer, overViewerContainerID: string, options?: SyncViewProps)
```

- `parentViewer`: 父 Viewer 实例。
- `overViewerContainerID`: 鹰眼图 Viewer 承载容器ID。
- `options` (可选): 配置项，包括：
  - `percentageChanged`: 相机 zoom 改变时距离改变的百分比，默认为 `0.01`。

#### 方法

##### `start()`

开始同步左右 Viewer 视图。

```ts
start(): void
```

##### `destroy()`

销毁实例，并解除视图同步。

```ts
destroy(): void
```

#### 属性

##### `synchronous`

获取或设置是否进行视图同步。

```ts
synchronous: boolean;
```

##### `isDestory`

获取实例是否已销毁。

```ts
get isDestory(): boolean
```
