---
title: measure（测量工具）
nav: 指南
group: 扩展
order: 1
---

# @cesium-extends/measure

@cesium-extends/measure 是一个基于 Cesium 实现的测量工具，支持方位角测量和三角测量。

## 安装

通过 npm 安装：

```bash
npm install @cesium-extends/measure --save
```

## 使用

在项目中引入`@cesium-extends/measure`模块，然后实例化对应的测量类即可进行测量。

### AzimuthAndDistanceMeasure

用于方位角距离测量。

```typescript
import { Viewer } from 'cesium';
import { AzimuthAndDistanceMeasure } from '@cesium-extends/measure';

const viewer = new Viewer('cesiumContainer');
const azimuthAndDistanceMeasure = new AzimuthAndDistanceMeasure(viewer, {
  onEnd: (entity) => {
    console.log(entity); // 测量完成回调函数，返回测量结果
  },
});

// 开始绘制
azimuthAndDistanceMeasure.start();
```

### TriangleMeasure

用于三角测量。

```typescript
import { Viewer } from 'cesium';
import { TriangleMeasure } from '@cesium-extends/measure';

const viewer = new Viewer('cesiumContainer');
const TriangleMeasure = new TriangleMeasure(viewer, {
  onEnd: (entity) => {
    console.log(entity); // 测量完成回调函数，返回测量结果
  },
});

// 开始绘制
TriangleMeasure.start();
```

## 示例

你可以通过下面的示例体验测量工具

<code src="@/components/Map/measure/index.tsx"></code>

## API

### MeasureOptions

| 参数          | 类型     | 描述                     |
| ------------- | -------- | ------------------------ |
| labelStyle    | object   | 标签样式                 |
| units         | string   | 测量单位，默认为'meters' |
| locale        | string   | 国际化内容               |
| onEnd         | function | 测量完成回调函数         |
| drawerOptions | object   | 绘制工具### Measure      |

测量基类，其他测量类继承自该类。

#### 构造函数

##### `constructor(viewer: Viewer, options?: MeasureOptions)`

创建一个测量工具实例。

参数：

- `viewer`：Cesium.Viewer 对象。
- `options`（可选）：配置项，类型为`MeasureOptions`。

#### 属性

##### `destroyed: boolean`

返回当前测量工具是否已销毁。

##### `mouseTooltip: MouseTooltip`

鼠标提示工具实例。

##### `drawer: Drawer`

绘制工具实例。

#### 方法

##### `start(): void`

开始测量操作。

##### `end(): void`

结束测量操作，并清除测量结果。

##### `destroy(): void`

销毁测量工具。

### AzimuthAndDistanceMeasure

用于方位角和距离测量。

#### 构造函数

##### `constructor(viewer: Viewer, options?: MeasureOptions)`

创建一个 AzimuthAndDistanceMeasure 实例。

参数：

- `viewer`：Cesium.Viewer 对象。
- `options`（可选）：配置项，类型为`MeasureOptions`。

#### 方法

##### `getDistance(start: Cartesian3, end: Cartesian3): number`

计算两点之间的距离。

参数：

- `start`：起点坐标，Cartesian3 类型。
- `end`：终点坐标，Cartesian3 类型。

返回值：两点之间的距离，单位由配置项指定，默认为米。

### TriangleMeasure

用于三角测量。

#### 构造函数

##### `constructor(viewer: Viewer, options?: MeasureOptions)`

创建一个 TriangleMeasure 实例。

参数：

- `viewer`：Cesium.Viewer 对象。
- `options`（可选）：配置项，类型为`MeasureOptions`。

## 注意事项

- 本工具基于 Cesium 实现，需要在项目中引入 Cesium 库。
- 使用前请确保了解 Cesium 的基础知识，如何创建 Viewer 等。
- 应当在使用测量工具前先停止其他可能影响交互的操作，例如相机漫游、场景旋转等。
- 在使用过程中请注意浏览器的性能，过多的绘制可能会导致浏览器崩溃或卡顿。
