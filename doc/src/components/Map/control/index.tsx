import { Viewer } from 'cesium';
import React, { useEffect, useRef } from 'react';
import { Control } from 'cesium-163-extends';

import { initMap } from '@/utils/initMap';
import './index.less';

interface MapProps {}

const Map: React.FC<MapProps> = () => {
  const viewer = useRef<Viewer>();
  const control = useRef<Control>();

  useEffect(() => {
    viewer.current = initMap('cesiumContainer', {home: [116.3, 39.9, 25000000]});

    return () => {
      viewer.current?.destroy();
    };
  }, []);

  return (
    <div id="cesiumContainer">
      <div className="draw-tools">
        <button
          onClick={() => {
            if (!control.current) {
              control.current = new Control(viewer.current as Viewer);
            }
            control.current.openSun();
          }}
        >
          开启光照
        </button>
        <button
          onClick={() => {
            if (!control.current) {
              control.current = new Control(viewer.current as Viewer);
            }
            control.current.closeSun();
          }}
        >
          关闭光照
        </button>
      </div>
    </div>
  );
};

export default Map;