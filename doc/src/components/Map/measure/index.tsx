import { Cartesian3, Viewer, Math as CMath } from 'cesium';
import React, { useEffect, useRef, useState } from 'react';

import { initMap } from '@/utils/initMap';
import { AzimuthAndDistanceMeasure, TriangleMeasure, Measure } from 'cesium-extends';
import './index.less';

interface MapProps { }

const measureOptions: {
  label: string;
  key: string;
  tool: typeof Measure;
}[] = [
  {
    label: '方位角距离测量',
    key: 'Distance',
    tool: AzimuthAndDistanceMeasure,
  },
  {
    label: '三角测量',
    key: 'Triangle',
    tool: TriangleMeasure,
  },
];

const Map: React.FC<MapProps> = () => {
  const viewer = useRef<Viewer>()
  const measure = useRef<Measure>();

  const onChangeTool = (name: string | null, Tool: typeof Measure | null = null) => {
    if (!viewer.current) return;

    if (name && Tool) {
      measure.current = new Tool(viewer.current, {
        units: 'kilometers',
        locale: {
          start: '起点',
          formatAngle: (angle) => {
            return `角度: ${angle}°`;
          },
          formatLength: (length, unitedLength) => {
            const prefix = '距离:';
            if (length < 1000) {
              return prefix + length + '米';
            }
            return prefix + unitedLength + '公里';
          },
        },
        drawerOptions: {
          tips: {
            init: '点击绘制',
            start: '左键添加点，双击结束绘制',
          }
        }
      });
      measure.current.start();
    }
  };

  useEffect(() => {
    viewer.current = initMap('cesiumContainer');
    
    viewer.current.camera.setView({
      destination: Cartesian3.fromDegrees(138.43, 35.21, 5000),
      orientation: {
        heading: CMath.toRadians(0),
        pitch: CMath.toRadians(-15),
        roll: CMath.toRadians(0),
      },
    });


    return () => {
      measure.current?.destroy();
      measure.current = undefined;
      viewer.current?.destroy()
    }
  }, []);

  const clear = () => {
    measure.current?.end()
  }

  return <div id="cesiumContainer">
    <div className='draw-tools'>
      {measureOptions.map((item) => (
        <button key={item.key} onClick={() => onChangeTool(item.key, item.tool)}>
          {item.label}
        </button>
      ))}
      <button onClick={clear}>清除</button>
    </div>
  </div>
};

export default Map;
