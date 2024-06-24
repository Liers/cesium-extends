import { Viewer } from 'cesium';
import React, { useEffect, useRef } from 'react';
import { OverViewer } from 'cesium163-extends';

import { initMap } from '../../utils/initMap';

interface MapProps {}

const Map: React.FC<MapProps> = () => {
  const parentViewer = useRef<Viewer>();
  const overView = useRef<OverViewer>();

  useEffect(() => {
    parentViewer.current = initMap('parent-container');
    const overViewerContainerID = 'overview-container';

    if (parentViewer.current && overViewerContainerID) {
      overView.current = new OverViewer(
        parentViewer.current,
        overViewerContainerID,
      );
      overView.current.start();
    }

    return () => {
      parentViewer.current?.destroy();
      overView.current?.destroy();
    };
  }, []);

  return (
    <div
      className="over-viewer"
      style={{ width: '100%', height: '100%', display: 'flex' }}
    >
      <div id="parent-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div
          id="overview-container"
          style={{
            position: 'absolute',
            zIndex: 9,
            width: '150px',
            height: '150px',
            bottom: '10px',
            right: '10px',
            padding: '10px',
            background: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            borderRadius: '5px',
          }}
        />
      </div>
    </div>
  );
};

export default Map;
