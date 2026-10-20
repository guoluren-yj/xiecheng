/*
 * @Date: 2022-10-08 11:14:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import G6 from '@antv/g6';
import { forEach } from 'lodash';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import deleteIcon from '@/assets/lifeConfig/delete-white.svg';
import editIcon from '@/assets/lifeConfig/edit-icon.svg';
import { deleteStageProcess } from '@/services/supplierLifePolicyConfigService';
import { getRectShape, getText } from '../utils';
import { hanldeGraphData } from './utils';
import styles from './index.less';
import CreateForm from './CreateForm';
import { getCreateFormDS } from './stores/getCreateFormDS';

/**
 * @param {strategyId} 策略id
 * @param {onClear} 清空当前流程
 * @param {onVisible} 查看当前流程
 * @param {resizSize} 父级容器width变化
 * @param {dataSource} 后端返回的数据源
 * @param {onQueryStage} 查询所有阶段
 * @param {curProcess} 当前流程
 * @param {primaryColor} 主题色
 * @param {hasProc} 是否过滤无节点的流程
 * @param {style} 样式
 * @param {readOnly} 画布只读
 * @param {highlight} 流程线是否全部高亮显示
 * @param {sourceKey} 引入组件的入口
 */
const Index = (
  {
    strategyId = '',
    onClear = () => {},
    onVisible = () => {},
    resizSize,
    dataSource = [],
    onQueryStage = () => {},
    curProcess = {},
    primaryColor,
    hasProc = false,
    style = {},
    readOnly = false,
    highlight = false,
    sourceKey = '',
  },
  customRef
) => {
  const containerRef = useRef(null);
  const [customGraph, setCustomGraph] = useState(null);

  useImperativeHandle(customRef, () => ({
    customGraph,
  }));

  const registerShape = useCallback(() => {
    G6.registerNode('process-left-stage-node', {
      draw(cfg, group) {
        const { stageDescription = '' } = cfg;
        const keyShape = getRectShape({ group, name: 'process-left-rect', isShadow: true });
        getText({ group, label: stageDescription, name: 'process-left-text' });
        const text = getText({
          group,
          x: -10,
          opacity: 0,
          fill: primaryColor,
          name: 'create-process-text',
          label: intl
            .get('sslm.supplierLifePolicyConfig.view.leftContent.createProcess')
            .d('创建流程'),
        });
        const textBBox = text.getBBox();
        group.addShape('text', {
          attrs: {
            text: '>',
            fill: '#000',
            x: textBBox.x + 80,
            y: textBBox.y + 16,
            fontSize: 18,
            fontWeight: 500,
            cursor: 'pointer',
            opacity: 0,
          },
          name: 'arrow-right',
        });
        return keyShape;
      },
      setState(name, value, node) {
        if (name === 'hover') {
          const group = node.getContainer();
          const keyShape = group.find(element => element.get('name') === 'process-left-rect');
          const rectTextShape = group.find(element => element.get('name') === 'process-left-text');
          const createProcessText = group.find(
            element => element.get('name') === 'create-process-text'
          );
          const arrowRight = group.find(element => element.get('name') === 'arrow-right');
          const stroke = value ? primaryColor : '#fff';
          const rectTextShapeOpacity = value ? 0 : 1;
          const createProcessTextOpacity = value ? 1 : 0;
          keyShape.attr({ stroke, lineWidth: value ? 1 : 0 });
          rectTextShape.attr('opacity', rectTextShapeOpacity);
          createProcessText.attr('opacity', createProcessTextOpacity);
          arrowRight.attr({
            opacity: createProcessTextOpacity,
            fill: value ? primaryColor : '#00B8CC',
          });
          const curNodeOutEdges = node.getOutEdges(); // 与当前节点有关的出边
          forEach(curNodeOutEdges, edge => {
            edge.setState('hover', value);
          });
        }
      },
    });
  }, [primaryColor]);

  // 创建流程
  const handleCreateProcess = useCallback(
    curNodeData => {
      const dataSet = new DataSet(getCreateFormDS({ strategyId }));
      dataSet.create({ strategyId, startStrategyStageId: curNodeData.strategyStageId });
      Modal.open({
        key: Modal.key(),
        title: intl.get('sslm.supplierLifePolicyConfig.view.leftContent.addProcess').d('添加流程'),
        drawer: true,
        style: { width: 380 },
        closable: false,
        children: (
          <CreateForm
            dataSet={dataSet}
            startStrategyStageDescription={curNodeData.stageDescription}
          />
        ),
        onOk: async () => {
          return dataSet.submit().then(async res => {
            if (res && res.success) {
              const curEdgeData = res.content[0] || {};
              await onQueryStage();
              onVisible(curEdgeData);
            }
          });
        },
      });
    },
    [strategyId]
  );

  // 删除流程
  const handleDeleteProcess = useCallback(
    curEdgeData => {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('sslm.supplierLifePolicyConfig.view.leftContent.deleteProcessMsg')
          .d('是否确认删除该流程？'),
        onOk: () => {
          return deleteStageProcess({ strategyStageProcId: curEdgeData.strategyStageProcId }).then(
            response => {
              const res = getResponse(response);
              if (res) {
                notification.success();
                onClear(curProcess, curEdgeData);
                onQueryStage({ hasProc });
              }
            }
          );
        },
      });
    },
    [curProcess, hasProc]
  );

  const menu = new G6.Menu({
    offsetX: 2,
    offsetY: 0,
    itemTypes: ['edge'],
    trigger: 'click',
    className: 'stage-edge-menu',
    getContent() {
      return `<div>
                <img src=${editIcon} alt='' id="visibility"/>
                <img src=${deleteIcon} alt='' id="delete"/>
              </div>`;
    },
    handleMenuClick: (target, item) => {
      const targetId = target.id;
      const curEdgeData = item.getModel();
      switch (targetId) {
        case 'visibility':
          onVisible(curEdgeData);
          break;
        case 'delete':
          handleDeleteProcess(curEdgeData);
          break;
        default:
          break;
      }
    },
  });

  // 状态样式
  const stateStyle = {
    stroke: primaryColor,
    lineDash: 0,
    cursor: 'pointer',
    endArrow: {
      path: G6.Arrow.triangle(6, 6),
      fill: primaryColor,
      stroke: primaryColor,
      lineDash: 0,
    },
  };

  useEffect(() => {
    const { current } = containerRef;
    if (current) {
      registerShape();
      const { parentElement, scrollWidth, scrollHeight } = current;
      const data = hanldeGraphData(dataSource, scrollWidth);
      const stageGraph = new G6.Graph({
        container: current,
        width: scrollWidth,
        height: scrollHeight,
        defaultNode: {
          type: 'process-left-stage-node',
        },
        defaultEdge: {
          type: 'polyline',
          style: {
            stroke: '#C9CDD4',
            radius: 8,
            lineDash: [4, 4],
            lineAppendWidth: 10,
            endArrow: {
              path: G6.Arrow.triangle(6, 6),
              fill: '#C9CDD4',
              stroke: '#C9CDD4',
              lineDash: [],
            },
          },
        },
        edgeStateStyles: {
          active: stateStyle,
          hover: stateStyle,
        },
        plugins: readOnly ? [] : [menu],
        modes: {
          default: ['drag-canvas', 'scroll-canvas'],
        },
      });
      setCustomGraph(stageGraph);
      stageGraph.read(data);

      if (!readOnly) {
        stageGraph.on('node:mouseenter', evt => {
          stageGraph.setItemState(evt.item, 'hover', true);
        });
        stageGraph.on('node:mouseleave', evt => {
          stageGraph.setItemState(evt.item, 'hover', false);
        });
        stageGraph.on('edge:mouseenter', evt => {
          stageGraph.setItemState(evt.item, 'hover', true);
        });
        stageGraph.on('edge:mouseleave', evt => {
          stageGraph.setItemState(evt.item, 'hover', false);
        });
        stageGraph.on('node:click', evt => {
          const curNodeData = evt.item.getModel();
          handleCreateProcess(curNodeData);
        });
      }

      if (sourceKey === 'workbench') {
        // 工作台过来的
        stageGraph.on('edge:mouseover', evt => {
          stageGraph.setItemState(evt.item, 'hover', true);
        });
        stageGraph.on('edge:mouseleave', evt => {
          stageGraph.setItemState(evt.item, 'hover', false);
        });
        stageGraph.on('edge:click', evt => {
          const curEdgeData = evt.item.getModel();
          onVisible(curEdgeData);
        });
      }

      const edges = stageGraph.getEdges();
      forEach(edges, edge => {
        if (highlight) {
          stageGraph.setItemState(edge, 'active', true);
        } else {
          // 默认当前操作流程线高亮
          const edgeData = edge.getModel();
          if (edgeData.strategyStageProcId === curProcess.strategyStageProcId) {
            stageGraph.setItemState(edge, 'active', true);
          } else {
            stageGraph.setItemState(edge, 'active', false);
          }
        }
      });

      // 调整画布大小,修复窗口变化时画布大小未变化问题
      const resize = () => {
        if (parentElement && parentElement.offsetParent) {
          stageGraph.changeSize(parentElement.offsetWidth, parentElement.offsetHeight);
        }
      };
      window.addEventListener('resize', resize);

      return () => {
        stageGraph.destroy();
        window.removeEventListener('resize', resize);
      };
    }
  }, [resizSize, dataSource, curProcess, primaryColor]);

  return <div style={style} ref={containerRef} className={styles['stage-canvas']} />;
};

export default forwardRef(Index);
