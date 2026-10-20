/*
 * utils - 阶段工具类
 * @Date: 2022-10-08 14:16:31
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import uuidv4 from 'uuid/v4';
import { map, forEach, reverse, isEqual, cloneDeep } from 'lodash';

export const nodeWidth = 160;

// 处理后端返回数据
export const dealData = stageDataSource => {
  const dataSource = map(stageDataSource, curData => {
    const { targetStageProcList, ...others } = curData;
    // 获取当前节点的位置下标
    const curNodeIndex = stageDataSource.findIndex(item => item.stageCode === curData.stageCode);
    // 获取当前节点的前一个节点
    const previousNode = stageDataSource[curNodeIndex - 1] || {};
    // 获取当前节点的后一个节点
    const nextNode = stageDataSource[curNodeIndex + 1] || {};
    const nodeObject = { ...others, id: curData.stageCode };
    // 当前节点到其他节点的集合
    const targetStageCodeList = targetStageProcList?.map(item => item.endStageCode);
    // 当前节点的前一个节点
    nodeObject.previousNode = targetStageCodeList?.includes(previousNode.stageCode)
      ? targetStageProcList?.find(item => item.endStrategyStageId === previousNode.strategyStageId)
      : null;
    // 当前节点的后一个节点
    nodeObject.nextNode = targetStageCodeList?.includes(nextNode.stageCode)
      ? targetStageProcList?.find(item => item.endStrategyStageId === nextNode.strategyStageId)
      : null;
    // 除去前后节点的剩余节点
    const restStageList = targetStageProcList?.filter(
      n => ![previousNode?.stageCode, nextNode?.stageCode].includes(n.endStageCode)
    );
    const curNodeBefore = [];
    const curNodeAfter = [];
    forEach(restStageList, value => {
      const curValueIndex = stageDataSource.findIndex(
        item => item.stageCode === value.endStageCode
      );
      if (curValueIndex !== -1) {
        if (curValueIndex > curNodeIndex) {
          curNodeAfter.push(value);
        } else {
          curNodeBefore.push(value);
        }
      }
    });
    nodeObject.curNodeBefore = curNodeBefore;
    nodeObject.curNodeAfter = reverse(curNodeAfter);
    return nodeObject;
  });
  return dataSource;
};

// 处理节点的锚点
export const handleAnchorPoint = stageDataSource => {
  const dataSource = dealData(stageDataSource);
  const dataLength = dataSource.length;
  const step = 1 / dataLength;
  const leftAnchorList = [];
  const rigthAnchorList = [];
  const bottomAnchorList = [[0.25, 1], [0.5, 1], [0.75, 1]];
  const topAnchorList = [[0.25, 0], [0.5, 0], [0.75, 0]];
  for (let i = step; i < 1; i = parseFloat((i + step).toFixed(10))) {
    leftAnchorList.push([0, i]);
    rigthAnchorList.push([1, i]);
  }
  return {
    topAnchorList,
    bottomAnchorList,
    rigthAnchorList,
    leftAnchorList: reverse(leftAnchorList),
  };
};

// 处理graph数据源
export const hanldeGraphData = (stageDataSource, graphWidth) => {
  const { topAnchorList, bottomAnchorList, rigthAnchorList, leftAnchorList } = handleAnchorPoint(
    stageDataSource
  );
  const allAnchorPoint = [
    ...topAnchorList,
    ...bottomAnchorList,
    ...rigthAnchorList,
    ...leftAnchorList,
  ];
  const nodes = [];
  const middleEdges = [];
  const rightFirstAnchorIndex = allAnchorPoint.findIndex(anchor =>
    isEqual(anchor, rigthAnchorList[0])
  );
  const rightLastAnchorIndex = allAnchorPoint.findIndex(anchor =>
    isEqual(anchor, rigthAnchorList[rigthAnchorList.length - 1])
  );
  const leftFirstAnchorIndex = allAnchorPoint.findIndex(anchor =>
    isEqual(anchor, leftAnchorList[0])
  );
  const leftEdges = [];
  const rightEdges = [];
  const dataSource = dealData(stageDataSource);
  forEach(dataSource, (value, index, collection) => {
    const { previousNode, nextNode, curNodeBefore, curNodeAfter } = value;
    const y = 120 * index + 26;
    const nodeObject = {
      ...value,
      x: graphWidth / 2,
      y,
      anchorPoints: allAnchorPoint,
    };
    nodes.push(nodeObject);
    const nodeEdges = [];
    forEach(curNodeBefore, (curBeforeValue, curBeforeIndex) => {
      nodeEdges.unshift({
        ...curBeforeValue,
        id: uuidv4(),
        source: value.id,
        target: curBeforeValue.endStageCode,
        sourceAnchor: leftFirstAnchorIndex + curBeforeIndex,
        targetAnchor: leftFirstAnchorIndex - 1 + index,
      });
    });
    leftEdges.push(...nodeEdges);
    forEach(curNodeAfter, (curAfterValue, curAfterIndex) => {
      rightEdges.push({
        ...curAfterValue,
        id: uuidv4(),
        source: value.id,
        target: curAfterValue.endStageCode,
        sourceAnchor: rightFirstAnchorIndex + curAfterIndex,
        targetAnchor: rightLastAnchorIndex - index,
      });
    });
    if (previousNode) {
      const isNext = collection[index - 1]?.nextNode;
      middleEdges.push({
        ...previousNode,
        id: uuidv4(),
        source: value.id,
        target: previousNode.endStageCode,
        sourceAnchor: isNext ? 0 : 1,
        targetAnchor: isNext ? 3 : 4,
        style: {
          offset: 0,
        },
      });
    }
    if (nextNode) {
      const isPrevious = collection[index + 1]?.previousNode;
      middleEdges.push({
        ...nextNode,
        id: uuidv4(),
        source: value.id,
        target: nextNode.endStageCode,
        sourceAnchor: isPrevious ? 5 : 4,
        targetAnchor: isPrevious ? 2 : 1,
        style: {
          offset: 0,
        },
      });
    }
  });

  const leftEdgesMap = leftEdges.map((edge, edgeIndex) => ({
    style: { offset: (edgeIndex + 1) * 10 },
    ...edge,
  }));
  const rightEdgesMap = reverse(cloneDeep(rightEdges)).map((edge, edgeIndex) => ({
    style: { offset: (edgeIndex + 1) * 10 },
    ...edge,
  }));
  const allEdges = [...leftEdgesMap, ...rightEdgesMap, ...middleEdges];
  const graphData = { nodes, edges: allEdges };
  return graphData;
};

// 数据中未返回strategyStageProcId的线，是虚拟线
export const dealVirtualLine = dataSource => {
  const newData = dataSource.map(data => {
    const { targetStageProcList } = data;
    const newTargetStageProcList = (targetStageProcList || []).map(stageProc => {
      if (stageProc.strategyStageProcId) {
        return stageProc;
      } else {
        return {
          ...stageProc,
          strategyStageProcId: uuidv4(),
          _local: true,
        };
      }
    });
    return {
      ...data,
      targetStageProcList: newTargetStageProcList,
    };
  });
  return newData;
};
