/*
 * @Date: 2022-11-09 10:44:46
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { forEach, isEmpty } from 'lodash';
import G6 from '@antv/g6';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';

import conditionBg from '@/assets/lifeConfig/condition-bg.svg';
import nodeBg from '@/assets/lifeConfig/node-bg.svg';
import branchBg from '@/assets/lifeConfig/branch-bg.svg';
import actionBlock from '@/assets/lifeConfig/action-block.svg'; // 后置动作
import nodeBlock from '@/assets/lifeConfig/node-block.svg'; // 节点
import conditionBlock from '@/assets/lifeConfig/condition-block.svg'; // 判断条件

export const getNodeConfig = () => ({
  node: {
    stroke: '#3AB545',
    img: nodeBlock,
    title: intl.get('sslm.supplierLifePolicyConfig.view.title.node').d('节点'),
    titleFill: '#3AB545',
    label: intl.get('sslm.supplierLifePolicyConfig.view.label.node').d('请设置节点'),
    modalTitle: intl.get('sslm.supplierLifePolicyConfig.view.leftContent.editNode').d('编辑节点'),
  },
  condition: {
    stroke: '#1984F7',
    img: conditionBlock,
    title: intl.get('sslm.common.model.condition').d('判断条件'),
    titleFill: '#1984F7',
    label: intl.get('sslm.supplierLifePolicyConfig.view.label.condition').d('请设置判断条件'),
    conditionDesc: intl
      .get('sslm.supplierLifePolicyConfig.view.label.defaultCondition')
      .d('默认允许手工发起'),
    modalTitle: intl
      .get('sslm.supplierLifePolicyConfig.view.leftContent.editCondition')
      .d('编辑判断条件'),
    orderSeqTitle: intl.get('sslm.supplierLifePolicyConfig.view.label.priority').d('优先级'),
  },
  action: {
    stroke: '#3E4EB3',
    img: actionBlock,
    title: intl.get('sslm.common.model.action').d('后置动作'),
    titleFill: '#3E4EB3',
    label: intl.get('sslm.supplierLifePolicyConfig.view.label.action').d('请设置动作'),
    modalTitle: intl
      .get('sslm.supplierLifePolicyConfig.view.leftContent.editAction')
      .d('编辑后置动作'),
  },
});

export const startNodeWidth = 160; // 起始节点宽度
export const startNodeHeight = 50; // 起始节点高度
export const nodeWidth = 200; // 节点宽度
export const nodeHeight = 78; // 节点高度
export const nodePadding = 40; // 节点的水平间隙
export const nodeYPadding = 68; // 节点的垂直间隙
export const addImgWidth = 18; // ➕号图片的宽度
export const addImgHeight = 18; // ➕号图片的高度
let nodeList = []; // 节点集合
let edgeList = []; // 边集合
let maxCount = 0; // Y轴子节点最大数量
let startNodeY; // 逻辑上的开始节点
let startNodeX;
let rootX;

// 处理节点位置
export const handleNodePosition = (dataSource, graphWidth, sourceKey) => {
  const {
    startStage,
    addBranch,
    branches: { branchConfigs, actionConfig },
    endStage,
  } = dataSource;
  const childrenSize = branchConfigs.length; // 最大子节点数，最大的分支个数
  // 先计算起始节点位置
  rootX = (childrenSize * nodeWidth + childrenSize * nodePadding) / 2;
  let totalWidth;
  if (childrenSize * nodeWidth + childrenSize * nodePadding > graphWidth) {
    rootX = (childrenSize * nodeWidth + childrenSize * nodePadding) / 2;
    startNodeX = 0;
  } else {
    if (childrenSize === 0 || childrenSize === 1) {
      totalWidth = nodeWidth + nodePadding;
    } else {
      totalWidth = childrenSize * nodeWidth + childrenSize * nodePadding;
    }
    rootX = graphWidth / 2;
    startNodeX = (graphWidth - totalWidth) / 2;
  }

  // const rootX = (graphWidth+(childrenSize * nodeWidth + childrenSize * nodePadding) / 2)/2;
  const rootY = startNodeHeight / 2;
  nodeList.push({ ...startStage, x: rootX, y: rootY, type: 'process-stage-node' });
  if (isEmpty(branchConfigs) || branchConfigs.length === 1) {
    startNodeY = startNodeHeight + nodeYPadding / 2;
  } else {
    startNodeY = startNodeHeight + (nodeYPadding * 3) / 2;
    if (sourceKey !== 'workbench') {
      nodeList.push({
        ...addBranch,
        id: uuidv4(),
        type: 'add-branch-node',
        x: rootX - addImgWidth / 2,
        y: rootY + nodeYPadding / 2 + startNodeHeight / 2 - addImgHeight / 2,
      });
    }
  }
  maxCount = 0; // maxCount重置，防止删除节点时，maxCount为删除前的值
  if (!isEmpty(branchConfigs)) {
    for (let index = 0; index < branchConfigs.length; index++) {
      const children = branchConfigs[index];
      // 比如四个节点，那整个宽度，就可以认为是8个半个节点加上8个间隙，每个节点的x位置，就是一个间隙，加半个加点
      // halfChildX 半个child+一个间隙的宽度
      const halfChildX = ((rootX - startNodeX) * 2) / (childrenSize * 2); // rootX * 2= 画布宽度， childrenSize*2=间隙+节点宽度一半
      const childX = (2 * (index + 1) - 1) * halfChildX + startNodeX; // 每个节点的位置
      for (let yIndex = 0; yIndex < children.length; yIndex++) {
        if (yIndex > maxCount) {
          maxCount = yIndex;
        }

        const childY = startNodeY + (nodeYPadding / 2 + nodeHeight / 2) * ((yIndex + 1) * 2 - 1);
        nodeList.push({
          ...children[yIndex],
          x: childX,
          y: childY,
          type: 'condition-node',
          childrenIndex: index,
        });
      }
    }
  }

  let actionY; // 后置动作y
  let endY;
  if (branchConfigs.length === 0) {
    actionY = startNodeY + (nodeYPadding / 2 + nodeHeight / 2);
    endY = actionY + nodeYPadding + nodeHeight / 2 + startNodeHeight / 2;
  } else if (branchConfigs.length === 1) {
    actionY =
      startNodeY +
      ((maxCount + 1) * 2 - 1) * (nodeYPadding / 2 + nodeHeight / 2) +
      nodeHeight / 2 +
      nodeYPadding +
      nodeHeight / 2;
    endY = actionY + nodeYPadding + nodeHeight / 2 + startNodeHeight / 2;
  } else {
    actionY =
      startNodeY +
      ((maxCount + 1) * 2 - 1) * (nodeYPadding / 2 + nodeHeight / 2) +
      nodeHeight / 2 +
      nodeYPadding +
      nodeYPadding +
      nodeHeight / 2;
    endY = actionY + nodeYPadding + nodeHeight / 2 + startNodeHeight / 2;
  }

  nodeList.push({
    ...actionConfig,
    x: rootX,
    y: actionY,
    type: 'condition-node',
  });

  nodeList.push({
    ...endStage,
    x: rootX,
    y: endY,
    type: 'process-stage-node',
  });

  return nodeList;
};

// 处理边位置
export const handleEdgePosition = dataSource => {
  const {
    startStage,
    branches: { branchConfigs, actionConfig },
    endStage,
  } = dataSource;
  if (isEmpty(branchConfigs)) {
    edgeList.push({
      source: startStage.id,
      target: actionConfig.id,
      childrenIndex: 0, // 分支序号
      startNodeX,
      sourceNodeType: startStage.nodeType,
      targetNodeType: actionConfig.nodeType,
    });
  } else {
    forEach(branchConfigs, (children, childrenIndex, childrenCollection) => {
      forEach(children, (child, childIndex, collection) => {
        if (child.nodeType === 'virtual') {
          edgeList.push({
            source: startStage.id,
            target: actionConfig.id,
            edgeNodeType: 'virtual', // 边的类型
            childrenIndex,
            startNodeX,
            targetNodeType: actionConfig.nodeType,
            controlPoints: [
              {
                x: rootX,
                y: startNodeHeight + nodeYPadding,
              },
              {
                x: startNodeX + ((childrenIndex + 1) * 2 - 1) * (nodePadding / 2 + nodeWidth / 2),
                y: startNodeHeight + nodeYPadding,
              },
              {
                x: startNodeX + ((childrenIndex + 1) * 2 - 1) * (nodePadding / 2 + nodeWidth / 2),
                y:
                  startNodeHeight +
                  (nodeYPadding * 2 * 3) / 4 +
                  ((maxCount + 1) * 2 - 1) * (nodeYPadding / 2 + nodeHeight / 2) +
                  (nodeYPadding + nodeHeight / 2),
              },
              {
                x: rootX,
                y:
                  startNodeHeight +
                  (nodeYPadding * 2 * 3) / 4 +
                  ((maxCount + 1) * 2 - 1) * (nodeYPadding / 2 + nodeHeight / 2) +
                  (nodeYPadding + nodeHeight / 2),
              },
            ],
            style: {
              lineAppendWidth: 5,
              radius:
                childrenIndex === 0 || childrenIndex === childrenCollection.length - 1 ? 6 : 0,
            },
          });
        } else {
          if (childIndex === 0) {
            const sourceNode = nodeList.find(node => node.id === startStage.id);
            const targetNode = nodeList.find(node => node.id === child.id);
            edgeList.push({
              source: startStage.id,
              target: child.id,
              childrenIndex,
              startNodeX,
              sourceNodeType: sourceNode.nodeType,
              targetNodeType: targetNode.nodeType,
              controlPoints: [
                { x: sourceNode.x, y: sourceNode.y + startNodeHeight / 2 + nodeYPadding },
                { x: targetNode.x, y: sourceNode.y + startNodeHeight / 2 + nodeYPadding },
              ],
              style: {
                radius:
                  childrenIndex === 0 || childrenIndex === childrenCollection.length - 1 ? 6 : 0,
              },
            });
          } else {
            edgeList.push({
              source: collection[childIndex - 1].id,
              target: child.id,
              childrenIndex,
              startNodeX,
              sourceNodeType: collection[childIndex - 1].nodeType,
              targetNodeType: child.nodeType,
            });
          }
          if (childIndex === collection.length - 1) {
            const sourceNode = nodeList.find(node => node.id === child.id);
            const targetNode = nodeList.find(node => node.id === actionConfig.id);
            edgeList.push({
              source: child.id,
              target: actionConfig.id,
              childrenIndex,
              startNodeX,
              sourceNodeType: sourceNode.nodeType,
              targetNodeType: targetNode.nodeType,
              controlPoints: [
                {
                  x: sourceNode.x,
                  y:
                    startNodeHeight +
                    (nodeYPadding * 2 * 3) / 4 +
                    ((maxCount + 1) * 2 - 1) * (nodeYPadding / 2 + nodeHeight / 2) +
                    (nodeYPadding + nodeHeight / 2),
                },
                {
                  x: targetNode.x,
                  y:
                    startNodeHeight +
                    (nodeYPadding * 2 * 3) / 4 +
                    ((maxCount + 1) * 2 - 1) * (nodeYPadding / 2 + nodeHeight / 2) +
                    (nodeYPadding + nodeHeight / 2),
                },
              ],
              style: {
                radius:
                  childrenIndex === 0 || childrenIndex === childrenCollection.length - 1 ? 6 : 0,
              },
            });
          }
        }
      });
    });
  }

  edgeList.push({
    source: actionConfig.id,
    target: endStage.id,
    type: 'polyline',
    style: {
      endArrow: {
        path: G6.Arrow.triangle(6, 6, 26),
        d: 26,
        fill: '#868D9C',
        stroke: '#868D9C',
      },
    },
  });
};

let newGraphWidth;

// 处理画布数据源
export const handleData = (dataSource, graphWidth, sourceKey) => {
  nodeList = []; // 每次重新计算，清空上次的计算值
  edgeList = [];
  if (graphWidth) {
    newGraphWidth = graphWidth;
  }
  handleNodePosition(dataSource, newGraphWidth, sourceKey);
  handleEdgePosition(dataSource);

  const nodes = nodeList
    .map(node => ({ ...node, anchorPoints: [[0.5, 0], [0.5, 1]] }))
    .filter(n => n.nodeType !== 'virtual');
  const edges = edgeList.map(edge => ({ ...edge, sourceAnchor: 1, targetAnchor: 0 }));
  const data = { nodes, edges };
  return data;
};

/**
 * isNode 添加菜单的按钮是节点还是边
 * sourceEdge 初始的第一条边
 * sourceNodeType 起始节点类型
 * targetNodeType 目的节点类型
 * firstNodeType 各个分支的第一个节点的类型
 * firstNodeType !=="condition" 类型不为判断条件时，才显示判断条件选项
 * sourceNodeType==="fixNode" 起始节点是阶段
 */
export const getAddItemMenuContent = ({
  isNode,
  sourceEdge,
  firstNodeType,
  sourceNodeType,
  targetNodeType,
}) => {
  return `<div class='add-node-menu-warp'>
    <div class='add-node-menu-warp-item' style=display:${
      sourceNodeType === 'fixNode' && firstNodeType !== 'condition' ? 'flex' : 'none'
    }>
      <img src=${conditionBg} alt='' id="condition" style="cursor:pointer"/>
      <div class="add-node-menu-warp-item-title">${intl
        .get('sslm.common.model.condition')
        .d('判断条件')}</div>
    </div>
    <div class='add-node-menu-warp-item' style=display:${
      (!isNode || sourceEdge) && targetNodeType !== 'condition' ? 'flex' : 'none'
    }>
      <img src=${nodeBg} alt='' id="node"style="cursor:pointer"/>
      <div class="add-node-menu-warp-item-title">${intl
        .get('sslm.common.view.node')
        .d('节点')}</div>
    </div>
    <div class='add-node-menu-warp-item' style=display:${isNode || sourceEdge ? 'flex' : 'none'}>
    <img src=${branchBg} alt='' id="branch" style="cursor:pointer"/>
    <div class="add-node-menu-warp-item-title">${intl
      .get('sslm.supplierLifePolicyConfig.model.menu.branch')
      .d('分支')}</div>
  </div>
  </div>`;
};
