---
title: control（控件）
nav: 控件
group: 扩展
order: 3
---

# @cesium163-extends/control

一款基于 [@cesium163-extends/common](https://www.npmjs.com/package/@cesium163-extends/common) 库的[Cesium](https://cesium.com/)控件插件。

## 安装

```bash
npm install @cesium163-extends/control
```

## 使用方法

`Control` 可在 Cesium 应用程序中用于开启/关闭光照效果。要使用该小部件，首先将其导入到您的项目中：

```javascript
import Control from '@cesium163-extends/control';
```

接下来，创建小部件的一个新实例并将其传递给您的 Cesium Viewer 实例：

```javascript
const viewer = new Cesium.Viewer('cesiumContainer');
const Control = new Control(viewer);
```

## 示例

下面的示例中添加了一个开启/关闭光照效果的控件

<code src="@/components/Map/control/index.tsx"></code>

## API

### `constructor(viewer: Cesium.Viewer)`

创建一个新的 `Control` 小部件实例并将其附加到指定的 Cesium Viewer。

#### 参数

- `viewer`: 要将小部件附加到的 Cesium Viewer 实例。

### `openSun()`

开启光照效果。

### `closeSun()`

关闭光照效果。

## 选项
