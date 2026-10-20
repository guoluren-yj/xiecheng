import { compact } from 'lodash';
import notification from 'utils/notification';

// 事务处理流保存时，节点保存逻辑判断
const flowNodesSave = (graphData, nodeArr, graph) => {
  // 边
  const edges = graphData.cells.filter((item) => item.shape === 'edge');
  // 普通节点，包含条件节点
  const regularNodes = graphData.cells.filter(
    (item) => item.shape !== 'edge' && item.shape !== 'circle'
  );
  const startNodes = graphData.cells.filter((item) => item.nodeCode === 'START');
  // 结束节点
  const endNodes = graphData.cells.filter((item) => item.nodeCode === 'END');
  // 条件节点
  const conditionNodes = graphData.cells.filter((item) => item.shape === 'polygon');
  // 条件边
  const conditionEdges: any[] = compact(
    edges.map((item) => {
      if (conditionNodes.find((i) => i.id === item.source.cell)) {
        return item;
      } else {
        return null;
      }
    })
  );
  const nodes = graphData.cells.filter((item) => item.shape !== 'edge');

  const edgeResult = nodes.map((item) => {
    if (
      graph.current.model.getOutgoingEdges(item) &&
      item.nodeCode !== 'CONDITION' &&
      graph.current.model.getOutgoingEdges(item).length > 1
    ) {
      return false;
    }
    return true;
  });

  if (edgeResult.includes(false)) {
    notification.error({
      description: '除条件节点外，其他节点不可有多条输出边',
    } as any);
    return false;
  }

  console.log('file: useUpdateData.ts ~ line 11 ~ flowNodesSave ~ conditionNodes', conditionNodes);
  // 所有边的source
  const sources = [...new Set(edges.map((item) => item?.source?.cell))];

  // 所有边的target
  const targets = [...new Set(edges.map((item) => item?.target?.cell))];

  if (startNodes.length > 1) {
    notification.error({
      description: '流程中只能有一个开始节点',
    } as any);
    return false;
  }
  if (endNodes.length > 1) {
    notification.error({
      description: '流程中只能有一个结束节点',
    } as any);
    return false;
  }

  if (!sources.includes(startNodes?.[0]?.id)) {
    notification.error({
      description: '开始节点未接入事件流',
    } as any);
    return false;
  }
  if (endNodes.length === 0) {
    notification.error({
      description: '必须有结束节点',
    } as any);
    return false;
  }
  for (let i = 0; i < endNodes.length; i++) {
    if (!edges.find((item) => item?.target?.cell === endNodes[i].id)) {
      notification.error({
        description: '结束节点未接入事件流',
      } as any);
      return false;
    }
  }
  for (const item of regularNodes) {
    // 普通节点必须存在下级节点
    if (!sources.find((i) => i === item.id)) {
      // 没找到当前节点，说明这个节点没有下级节点
      notification.error({
        description: '普通节点必须存在下级节点',
      } as any);
      return false;
    }
    // 普通节点必须存在上级节点
    if (!targets.find((i) => i === item.id)) {
      // 没找到当前节点，说明这个节点没有上级节点
      notification.error({
        description: '普通节点必须存在上级节点',
      } as any);
      return false;
    }
  }

  // 必须先保存节点，才能保存图
  for (const item of regularNodes) {
    if (!nodeArr.current.get(item?.id)) {
      // 没找到当前节点，说明这个节点没有下级节点
      notification.error({
        description: '请先保存节点',
      } as any);
      return false;
    }
  }
  // 条件边必须选择分支
  for (const item of conditionEdges) {
    const label: any = item?.labels?.[0];
    if (label && !label?.attrs?.branchCode) {
      notification.error({
        description: '条件边必须选择分支',
      } as any);
      return false;
    }
  }
  if (targets.includes(startNodes?.[0].id)) {
    notification.error({
      description: '开始节点不可有输入线条',
    } as any);
    return false;
  }
  if (sources.includes(endNodes?.[0].id)) {
    notification.error({
      description: '结束节点不可有输出线条',
    } as any);
    return false;
  }

  // 节点是否循环校验
  const result = nodes.map((node) => {
    const cell = graph.current.model.getCell(node?.id);
    const nextArray = graph.current.model.getSuccessors(cell)?.map((i) => i?.id);
    const preArray = graph.current.model.getPredecessors(cell)?.map((i) => i?.id);
    const res = preArray.map((item) => {
      return !nextArray.includes(item);
    });
    if (res.length !== 0 && res.includes(false)) {
      return false;
    }
    return true;
  });
  if (result.includes(false)) {
    notification.error({
      description: '流程不可出现循环',
    } as any);
    return false;
  }
  return true;
};

export { flowNodesSave };
