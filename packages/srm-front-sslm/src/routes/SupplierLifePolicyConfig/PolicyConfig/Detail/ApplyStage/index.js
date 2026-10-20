/*
 * @Date: 2022-09-30 10:16:29
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import G6 from '@antv/g6';
import { forEach } from 'lodash';
import React, { useEffect, useRef, useCallback, useState } from 'react';

import ZoomToolbar from '@/routes/components/ZoomToolbar';
import { registerStageNode } from '@/routes/SupplierLifePolicyConfig/utils';
import { stageTooltip } from '@/routes/components/SupplierLifeConfig/utils';

const ApplyStage = ({ dataSource, onDeleteStage, primaryColor, isEdit = true }) => {
  const ref = useRef(null);
  const [stageGraph, setStageGraph] = useState(null);

  // 处理数据源
  const handleData = useCallback(() => {
    const edges = [];
    const nodes = [];
    const width = ref.current?.scrollWidth;
    forEach(dataSource, (value, index, collection) => {
      nodes.push({ ...value, x: width / 2, y: 118 * index + 50 });
      if (index + 1 < collection.length) {
        const { id } = value;
        const { id: nextId } = collection[index + 1];
        edges.push({
          id: index,
          source: id,
          target: nextId,
        });
      }
    });
    const data = { nodes, edges };
    return data;
  }, [dataSource]);

  useEffect(() => {
    const { current } = ref;
    if (current) {
      registerStageNode({ primaryColor, isEdit });
      const { parentElement, scrollWidth, scrollHeight } = current;
      const data = handleData();
      const newStageGraph = new G6.Graph({
        container: current,
        width: scrollWidth,
        height: scrollHeight,
        linkCenter: true,
        defaultNode: {
          type: 'stage-node',
        },
        defaultEdge: {
          style: {
            fill: '#868D9C',
            stroke: '#868D9C',
            endArrow: {
              path: G6.Arrow.triangle(6, 6, 26),
              d: 26,
              fill: '#868D9C',
              stroke: '#868D9C',
            },
          },
        },
        plugins: [stageTooltip()],
        modes: { default: ['drag-canvas', 'scroll-canvas'] },
      });
      setStageGraph(newStageGraph);
      newStageGraph.read(data);
      newStageGraph.on('node:mouseover', evt => {
        newStageGraph.setItemState(evt.item, 'hover', true);
      });
      newStageGraph.on('node:mouseleave', evt => {
        newStageGraph.setItemState(evt.item, 'hover', false);
      });
      newStageGraph.on('node:click', evt => {
        const name = evt.target.get('name');
        const curStage = evt.item.getModel();
        if (name === 'stage-delete-icon') {
          onDeleteStage(curStage);
        }
      });
      // 调整画布大小,修复窗口变化时画布大小未变化问题
      const resize = () => {
        if (parentElement && parentElement.offsetParent) {
          newStageGraph.changeSize(parentElement.offsetWidth, parentElement.offsetHeight);
        }
      };
      window.addEventListener('resize', resize);
      return () => {
        newStageGraph.destroy();
        window.removeEventListener('resize', resize);
      };
    }
  }, [dataSource, primaryColor, isEdit]);
  return (
    <div
      style={{
        height: 'calc(100vh - 234px)',
        background: '#F7F8FA',
      }}
    >
      <div style={{ position: 'relative', top: 16, marginRight: 16 }}>
        <ZoomToolbar graph={stageGraph} />
      </div>
      <div style={{ height: '100%', marginTop: -16 }} ref={ref} />
    </div>
  );
};

export default ApplyStage;
