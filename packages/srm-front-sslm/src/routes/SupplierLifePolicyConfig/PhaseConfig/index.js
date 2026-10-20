/*
 * @Date: 2022-09-26 13:12:46
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import G6 from '@antv/g6';
import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import { isEmpty, forEach, findIndex } from 'lodash';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Row, Col, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import ZoomToolbar from '@/routes/components/ZoomToolbar';
import { registerStageNode } from '@/routes/SupplierLifePolicyConfig/utils';
import { checkStageNodes } from '@/services/supplierLifePolicyConfigService';
import { getAddEdge, stageTooltip } from '@/routes/components/SupplierLifeConfig/utils';
import styles from './index.less';
import EmptyPage from './EmptyPage';
import StageForm from './StageForm';

const PhaseConfig = ({ dataSet, dataSource, primaryColor = '#00B8CC' }) => {
  const ref = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [currentNode, setCurrentNode] = useState({});
  const [stageGraph, setStageGraph] = useState(null);

  const registerShape = useCallback(() => {
    registerStageNode({ primaryColor });

    G6.registerEdge('phase-edge', {
      draw(cfg, group) {
        const keyShape = getAddEdge({ cfg, group, name: 'phase-add-edge' });
        return keyShape;
      },
      setState(name, value, node) {
        if (name === 'hover') {
          const group = node.getContainer();
          const addImage = group.find(element => element.get('name') === 'phase-add-edge-text');
          const textFill = value ? primaryColor : '#868D9C';
          addImage.attr({ fill: textFill });
        }
      },
    });
  }, [primaryColor]);

  // 处理graph数据源
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

  const deleteStage = useCallback(
    (curStage, graph) => {
      const delDataIndex = findIndex(dataSource, item => item.id === curStage.id);
      dataSource.splice(delDataIndex, 1);
      const graphData = handleData();
      graph.changeData(graphData);
      const delStage =
        dataSet.records.filter(record => record.get('stageId') === curStage.stageId) || [];
      dataSet.remove(delStage[0]);
      setCurrentNode({});
    },
    [dataSource]
  );

  // 删除阶段
  const handleDeleteStage = useCallback(
    (curStage, graph) => {
      const { _local, stageId } = curStage;
      if (_local) {
        deleteStage(curStage, graph);
      } else {
        setSpinning(true);
        checkStageNodes({ stageId })
          .then(response => {
            const res = getResponse(response);
            if (res) {
              deleteStage(curStage, graph);
            }
          })
          .finally(() => {
            setSpinning(false);
          });
      }
    },
    [dataSource]
  );

  // 添加阶段
  const hanldeCreateStage = useCallback(
    (curEdge, graph) => {
      const sourceId = curEdge.source;
      const sourceIndex = findIndex(dataSource, item => item.id === sourceId);
      const addStageId = uuidv4();
      const newStage = {
        id: addStageId,
        stageId: addStageId,
        stageDescription: intl
          .get('sslm.supplierLifePolicyConfig.view.message.createStage')
          .d('新增阶段'),
        _local: true,
      };
      dataSource.splice(sourceIndex + 1, 0, newStage);
      const newGraphData = handleData();
      graph.changeData(newGraphData);
      dataSet.create(newStage, sourceIndex + 1);
      handleEditStage(newStage, graph);
    },
    [dataSource]
  );

  // 更新阶段
  const handleEditStage = useCallback((curStage, graph) => {
    const nodes = graph.getNodes();
    forEach(nodes, node => {
      const nodeData = node.getModel();
      if (nodeData.stageId === curStage.stageId) {
        graph.setItemState(node, 'active', true);
      } else {
        graph.setItemState(node, 'active', false);
      }
    });
    setCurrentNode(curStage);
  }, []);

  useEffect(() => {
    const { current } = ref;
    if (current) {
      const { parentElement, scrollWidth, scrollHeight } = current;
      registerShape();
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
          type: 'phase-edge',
        },
        plugins: [stageTooltip()],
        modes: {
          default: ['drag-canvas', 'scroll-canvas'],
        },
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
        switch (name) {
          case 'stage-rect':
          case 'stage-text': {
            handleEditStage(curStage, newStageGraph);
            break;
          }
          case 'stage-delete-icon':
            handleDeleteStage(curStage, newStageGraph);
            break;
          default:
            break;
        }
      });
      newStageGraph.on('edge:mouseover', evt => {
        newStageGraph.setItemState(evt.item, 'hover', true);
      });
      newStageGraph.on('edge:mouseleave', evt => {
        newStageGraph.setItemState(evt.item, 'hover', false);
      });
      newStageGraph.on('edge:click', evt => {
        const name = evt.target.get('name');
        const curEdge = evt.item.getModel();
        if (['phase-add-edge-rect', 'phase-add-edge-text'].includes(name)) {
          hanldeCreateStage(curEdge, newStageGraph);
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
  }, [dataSource]);

  const curRecord = dataSet.records.filter(record => {
    return record.get('stageId') === currentNode.stageId;
  });

  return (
    <Spin spinning={spinning}>
      <Row className={styles['life-stage-canvas']}>
        <Col span={18}>
          <div style={{ position: 'relative', top: 16, marginRight: 32 }}>
            <ZoomToolbar graph={stageGraph} />
          </div>
          <div className={styles['life-stage-canvas-container']} ref={ref} />
        </Col>
        <Col span={6}>
          {isEmpty(currentNode) || isEmpty(curRecord) ? (
            <EmptyPage />
          ) : (
            <StageForm record={curRecord[0]} />
          )}
        </Col>
      </Row>
    </Spin>
  );
};

export default connect(({ user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
  } = themeConfigVO;
  if (enableThemeConfig) {
    return {
      primaryColor: colorCode,
    };
  }
  return {};
})(PhaseConfig);
