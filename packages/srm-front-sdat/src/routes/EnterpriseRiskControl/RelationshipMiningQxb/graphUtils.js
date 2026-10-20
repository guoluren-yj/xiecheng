/**
 * 创建时间：2026-04-29 14:37:23
 * 文件名：graphUtils.js
 * 文件描述：关系图谱数据转换、纵向分层布局与折叠展开工具
 * 版本号：v1.0.0
 * 最后更新时间：2026-05-14 00:00:00
 */

const DEFAULT_VISIBLE_DEPTH = 3;
const ROOT_TOP_OFFSET = 96;
const LEVEL_GAP = 272;
const SIBLING_GAP = 52;
const HORIZONTAL_PADDING = 80;
const ROOT_COMPANY_NODE_STYLE = {
  fill: '#F7933A',
  stroke: '#F7933A',
  shadowColor: 'rgba(247, 147, 58, 0.28)',
  shadowBlur: 22,
};
const RELATED_COMPANY_NODE_STYLE = {
  fill: '#FFF3E8',
  stroke: '#FFB36B',
  shadowColor: 'rgba(255, 179, 107, 0.2)',
  shadowBlur: 14,
};
const DEFAULT_COMPANY_NODE_STYLE = {
  fill: '#FDFEFF',
  stroke: '#69AFFF',
  shadowColor: 'rgba(79, 128, 247, 0.08)',
  shadowBlur: 10,
};
let hasRegisteredQxbShapes = false;

/**
 * 注册关系图谱自定义节点，提供独立的展开图标视觉。
 * @param {object} G6 图谱实例
 */
export function ensureQxbGraphShapes(G6) {
  if (hasRegisteredQxbShapes || !G6?.registerNode) {
    return;
  }

  /**
   * 绘制独立展开图标。
   * @param {object} group 图形分组
   * @param {object} model 节点模型
   * @param {number} height 节点高度
   */
  const drawToggleIcon = (group, model, height) => {
    if (!model.canToggleExpand) {
      return;
    }

    const offsetY = height / 2 + 8;
    const symbol = model.isExpanded ? '-' : '+';
    group.addShape('circle', {
      className: 'qxb-toggle-control',
      name: 'qxb-toggle-control',
      attrs: {
        x: 0,
        y: offsetY,
        r: 12,
        fill: '#FFFFFF',
        stroke: '#2E90FA',
        lineWidth: 2,
      },
    });
    group.addShape('text', {
      className: 'qxb-toggle-control',
      name: 'qxb-toggle-control',
      attrs: {
        x: 0,
        y: offsetY + 1,
        text: symbol,
        fill: '#2E90FA',
        fontSize: 16,
        fontWeight: 700,
        textAlign: 'center',
        textBaseline: 'middle',
      },
    });
  };

  G6.registerNode(
    'qxb-company-node',
    {
      /**
       * 在企业节点绘制完成后补充展开/收起按钮。
       * @param {object} cfg 节点配置
       * @param {object} group 节点图形分组
       */
      afterDraw(cfg, group) {
        const size = cfg.size || [186, 60];
        const height = Array.isArray(size) ? size[1] : size;
        drawToggleIcon(group, cfg, height);
      },
    },
    'rect'
  );

  G6.registerNode(
    'qxb-person-node',
    {
      /**
       * 在自然人节点绘制完成后补充展开/收起按钮。
       * @param {object} cfg 节点配置
       * @param {object} group 节点图形分组
       */
      afterDraw(cfg, group) {
        const size = cfg.size || 78;
        const diameter = Array.isArray(size) ? size[0] : size;
        drawToggleIcon(group, cfg, diameter);
      },
    },
    'circle'
  );

  hasRegisteredQxbShapes = true;
}

/**
 * 生成关系属性的展示文案。
 * @param {Array} propertyList 关系属性列表
 * @returns {string}
 */
function getRelationText(propertyList = []) {
  const labelList = (propertyList || []).map((item) => item?.LabelText).filter(Boolean);
  return labelList.join(' / ');
}

/**
 * 根据同级 PathNodeList.type 或节点原始类型字段推断节点类型。
 * @param {object} node 节点对象
 * @param {string} explicitType 显式类型
 * @param {'company' | 'person'} fallbackType 兜底类型
 * @returns {'company' | 'person'}
 */
function inferNodeType(node = {}, explicitType = '', fallbackType = 'company') {
  const rawType = `${
    explicitType ||
    node.type ||
    node.Type ||
    node.SubjectType ||
    node.EntityType ||
    node.NodeType ||
    ''
  }`
    .trim()
    .toUpperCase();

  if (['P'].includes(rawType)) {
    return 'person';
  }

  if (['E'].includes(rawType)) {
    return 'company';
  }

  return fallbackType === 'person' ? 'person' : 'company';
}

/**
 * 将长文本切分为适合图谱节点显示的多行文本。
 * @param {string} label 节点名称
 * @param {number} lineLength 每行字数
 * @param {number} maxLines 最大行数
 * @returns {string}
 */
function formatLabel(label = '', lineLength = 6, maxLines = 4) {
  const text = `${label || ''}`.trim();
  if (!text) {
    return '';
  }

  const charList = text.split('');
  const rows = [];
  for (let i = 0; i < charList.length; i += lineLength) {
    rows.push(charList.slice(i, i + lineLength).join(''));
  }

  if (rows.length <= maxLines) {
    return rows.join('\n');
  }

  const limitedRows = rows.slice(0, maxLines);
  const lastRow = limitedRows[maxLines - 1];
  limitedRows[maxLines - 1] = `${lastRow.slice(0, Math.max(0, lineLength - 1))}…`;
  return limitedRows.join('\n');
}

/**
 * 生成与 RelationList 同级 PathNodeList 的名称类型映射。
 * @param {Array} dataList 图谱数据列表
 * @returns {Map<string, string>}
 */
function buildPathNodeTypeMap(dataList = []) {
  const typeMap = new Map();

  dataList.forEach((item) => {
    const pathNodeList = Array.isArray(item?.PathNodeList) ? item.PathNodeList : [];
    pathNodeList.forEach((pathNode) => {
      const nodeName = `${pathNode?.name || ''}`.trim();
      const nodeType = `${pathNode?.type || ''}`.trim().toUpperCase();
      if (nodeName && nodeType) {
        typeMap.set(nodeName, nodeType);
      }
    });
  });

  return typeMap;
}

/**
 * 生成需要特殊着色的关联企业名称集合。
 * @param {Array} dataList 图谱数据列表
 * @returns {Set<string>}
 */
function buildHighlightCompanyNameSet(dataList = []) {
  const highlightCompanyNameSet = new Set();

  dataList.forEach((item) => {
    const companyName = `${item?.CompanyName || item?.companyName || ''}`.trim();
    const relatedCompanyName = `${
      item?.RelatedCompanyName || item?.relatedCompanyName || ''
    }`.trim();

    if (companyName) {
      highlightCompanyNameSet.add(companyName);
    }

    if (relatedCompanyName) {
      highlightCompanyNameSet.add(relatedCompanyName);
    }
  });

  return highlightCompanyNameSet;
}

/**
 * 将接口返回数据标准化为节点与边。
 * @param {object} payload 图谱原始数据
 * @param {object} options 布局配置
 * @returns {{nodes: Array, edges: Array, centerId: string}}
 */
function normalizeGraphData(payload = {}, options = {}) {
  const { centerName = '' } = options;
  const dataList = Array.isArray(payload?.Data)
    ? payload.Data
    : payload?.SubjectList
    ? [payload]
    : [];
  const nodeMap = new Map();
  const edgeMap = new Map();
  const degreeMap = new Map();
  const pathNodeTypeMap = buildPathNodeTypeMap(dataList);
  const highlightCompanyNameSet = buildHighlightCompanyNameSet(dataList);
  let centerId = '';

  dataList.forEach((item) => {
    const subjectList = Array.isArray(item?.SubjectList) ? item.SubjectList : [];
    const relationList = Array.isArray(item?.RelationList) ? item.RelationList : [];

    subjectList.forEach((subject) => {
      const id = `${subject?.NodeId || subject?.id || subject?.Name || ''}`.trim();
      const name = `${subject?.Name || subject?.name || ''}`.trim();

      if (!id || !name) {
        return;
      }

      const current = nodeMap.get(id) || {
        ...subject,
        id,
        name,
        nodeType: inferNodeType(subject, pathNodeTypeMap.get(name), 'company'),
        degree: 0,
      };

      current.name = name;
      current.nodeType = inferNodeType(subject, pathNodeTypeMap.get(name), current.nodeType);
      current.isHighlightedCompany = highlightCompanyNameSet.has(name);
      nodeMap.set(id, current);

      if (!centerId && centerName && name === centerName) {
        centerId = id;
      }
    });

    relationList.forEach((relation) => {
      const sourceId = `${relation?.StartNodeId || relation?.source || ''}`.trim();
      const targetId = `${relation?.EndNodeId || relation?.target || ''}`.trim();
      if (!sourceId || !targetId || !nodeMap.has(sourceId) || !nodeMap.has(targetId)) {
        return;
      }

      const relationText = getRelationText(relation?.PropertyList);
      const edgeKey = `${sourceId}-${targetId}-${relationText}`;
      if (edgeMap.has(edgeKey)) {
        return;
      }

      degreeMap.set(sourceId, (degreeMap.get(sourceId) || 0) + 1);
      degreeMap.set(targetId, (degreeMap.get(targetId) || 0) + 1);

      edgeMap.set(edgeKey, {
        ...relation,
        id: edgeKey,
        source: sourceId,
        target: targetId,
        relationText,
        isDashed: relation?.lineStyle?.normal?.type === 'dashed',
      });
    });
  });

  const nodes = Array.from(nodeMap.values()).map((node) => ({
    ...node,
    degree: degreeMap.get(node.id) || 0,
  }));

  const edges = Array.from(edgeMap.values());

  if (!centerId) {
    const matchedNode = nodes.find((node) => node.name === centerName);
    if (matchedNode) {
      centerId = matchedNode.id;
    }
  }

  if (!centerId && nodes.length) {
    const sortedNodes = [...nodes].sort((a, b) => b.degree - a.degree);
    centerId = sortedNodes[0]?.id || nodes[0]?.id || '';
  }

  return {
    nodes: nodes.map((node) => ({
      ...node,
      isRoot: node.id === centerId,
    })),
    edges,
    centerId,
  };
}

/**
 * 计算节点的默认尺寸，根节点和企业节点会更大。
 * @param {object} node 节点对象
 * @returns {Array|number}
 */
function getNodeSize(node = {}) {
  if (node.isRoot) {
    return node.nodeType === 'company' ? [210, 72] : 96;
  }

  if (node.nodeType === 'company') {
    return [186, 60];
  }

  return 78;
}

/**
 * 生成节点的默认视觉样式，所有节点始终保持高亮显示。
 * @param {object} node 节点对象
 * @returns {object}
 */
function getNodeStyle(node = {}) {
  const opacity = 1;
  const lineWidth = node.canToggleExpand ? 3 : 1;

  if (node.isRoot) {
    return {
      ...ROOT_COMPANY_NODE_STYLE,
      radius: 6,
      cursor: 'pointer',
      opacity,
      lineWidth,
    };
  }

  if (node.nodeType === 'company') {
    const companyNodeStyle = node.isHighlightedCompany
      ? RELATED_COMPANY_NODE_STYLE
      : DEFAULT_COMPANY_NODE_STYLE;

    return {
      ...companyNodeStyle,
      radius: 4,
      cursor: 'pointer',
      opacity,
      lineWidth,
    };
  }

  return {
    fill: '#F46A93',
    stroke: '#F46A93',
    shadowColor: 'rgba(244, 106, 147, 0.14)',
    shadowBlur: 8,
    cursor: 'pointer',
    opacity,
    lineWidth,
  };
}

/**
 * 生成节点连接锚点，优先支持纵向树形连线。
 * @returns {number[][]}
 */
function getNodeAnchorPoints() {
  return [
    [0.5, 0],
    [0.5, 1],
    [0, 0.5],
    [1, 0.5],
  ];
}

/**
 * 生成边的默认视觉样式，所有关系线统一显示。
 * @param {object} edge 边对象
 * @returns {object}
 */
function getEdgeStyle(edge = {}) {
  return {
    stroke: '#8E99AB',
    lineWidth: 1.4,
    opacity: 0.96,
    endArrow: true,
    lineDash: edge.isDashed ? [6, 4] : undefined,
  };
}

/**
 * 构建邻接关系，供布局和分层逻辑复用。
 * @param {Array} edges 边列表
 * @returns {Map<string, Array>}
 */
function buildAdjacencyMap(edges = []) {
  const adjacencyMap = new Map();

  edges.forEach((edge) => {
    if (!adjacencyMap.has(edge.source)) {
      adjacencyMap.set(edge.source, []);
    }
    if (!adjacencyMap.has(edge.target)) {
      adjacencyMap.set(edge.target, []);
    }

    adjacencyMap.get(edge.source).push({
      targetId: edge.target,
      edgeId: edge.id,
    });
    adjacencyMap.get(edge.target).push({
      targetId: edge.source,
      edgeId: edge.id,
    });
  });

  return adjacencyMap;
}

/**
 * 基于根节点计算树形分层信息，为纵向布局提供基础数据。
 * @param {Array} nodes 节点列表
 * @param {Array} edges 边列表
 * @param {string} centerId 中心节点ID
 * @returns {{depthMap: Map, parentMap: Map, childrenMap: Map, adjacencyMap: Map}}
 */
function buildTreeMeta(nodes = [], edges = [], centerId = '') {
  const adjacencyMap = buildAdjacencyMap(edges);
  const nodeIdSet = new Set(nodes.map((node) => node.id));
  const depthMap = new Map();
  const parentMap = new Map();
  const childrenMap = new Map();
  const queue = [];

  if (centerId && nodeIdSet.has(centerId)) {
    depthMap.set(centerId, 0);
    queue.push(centerId);
  }

  while (queue.length) {
    const currentId = queue.shift();
    const currentDepth = depthMap.get(currentId) || 0;
    const nextNodes = adjacencyMap.get(currentId) || [];

    nextNodes.forEach(({ targetId }) => {
      if (depthMap.has(targetId) || !nodeIdSet.has(targetId)) {
        return;
      }

      depthMap.set(targetId, currentDepth + 1);
      parentMap.set(targetId, currentId);
      if (!childrenMap.has(currentId)) {
        childrenMap.set(currentId, []);
      }
      childrenMap.get(currentId).push(targetId);
      queue.push(targetId);
    });
  }

  nodes.forEach((node) => {
    if (!depthMap.has(node.id)) {
      depthMap.set(node.id, Number.MAX_SAFE_INTEGER);
    }
    if (!childrenMap.has(node.id)) {
      childrenMap.set(node.id, []);
    }
  });

  return {
    depthMap,
    parentMap,
    childrenMap,
    adjacencyMap,
  };
}

/**
 * 构建节点的默认可见状态，支持按层级默认展开并按节点逐步展开更多分支。
 * @param {string} centerId 根节点ID
 * @param {Map} depthMap 深度映射
 * @param {Map} childrenMap 子节点映射
 * @param {Set<string>} expandedNodeSet 已展开节点ID集合
 * @param {number} defaultVisibleDepth 默认可见层级
 * @returns {{visibleNodeSet: Set<string>, expandableNodeSet: Set<string>, expandedVisibleNodeSet: Set<string>}}
 */
function buildVisibleState(
  centerId,
  depthMap,
  childrenMap,
  expandedNodeSet,
  defaultVisibleDepth = DEFAULT_VISIBLE_DEPTH
) {
  const visibleNodeSet = new Set();
  const expandableNodeSet = new Set();
  const expandedVisibleNodeSet = new Set();

  if (!centerId) {
    return {
      visibleNodeSet,
      expandableNodeSet,
      expandedVisibleNodeSet,
    };
  }

  const walk = (nodeId) => {
    visibleNodeSet.add(nodeId);
    const currentDepth = depthMap.get(nodeId) || 0;
    const childIds = childrenMap.get(nodeId) || [];

    if (!childIds.length) {
      return;
    }

    const visibleChildIds = childIds.filter((childId) => {
      const childDepth = depthMap.get(childId) || currentDepth + 1;
      return childDepth <= defaultVisibleDepth || expandedNodeSet.has(nodeId);
    });

    if (currentDepth < defaultVisibleDepth && visibleChildIds.length < childIds.length) {
      expandableNodeSet.add(nodeId);
    }

    if (currentDepth >= defaultVisibleDepth && childIds.length) {
      expandableNodeSet.add(nodeId);
    }

    if (expandedNodeSet.has(nodeId) && childIds.length) {
      expandedVisibleNodeSet.add(nodeId);
    }

    visibleChildIds.forEach((childId) => {
      walk(childId);
    });
  };

  walk(centerId);

  return {
    visibleNodeSet,
    expandableNodeSet,
    expandedVisibleNodeSet,
  };
}

/**
 * 计算节点在树形布局中的占位宽度。
 * @param {object} node 节点对象
 * @returns {number}
 */
function getNodeUnitWidth(node = {}) {
  if (node.nodeType === 'company') {
    return node.isRoot ? 260 : 220;
  }

  return node.isRoot ? 150 : 126;
}

/**
 * 根据可见树结构计算每个节点子树宽度，避免节点重叠。
 * @param {string} nodeId 节点ID
 * @param {Map} childrenMap 子节点映射
 * @param {Map} nodeMap 节点映射
 * @param {Map} widthCache 宽度缓存
 * @returns {number}
 */
function measureSubtreeWidth(nodeId, childrenMap, nodeMap, widthCache) {
  if (widthCache.has(nodeId)) {
    return widthCache.get(nodeId);
  }

  const currentNode = nodeMap.get(nodeId) || {};
  const childIds = childrenMap.get(nodeId) || [];
  const selfWidth = getNodeUnitWidth(currentNode);

  if (!childIds.length) {
    widthCache.set(nodeId, selfWidth);
    return selfWidth;
  }

  const childrenWidth = childIds.reduce((total, childId, index) => {
    const childWidth = measureSubtreeWidth(childId, childrenMap, nodeMap, widthCache);
    return total + childWidth + (index > 0 ? SIBLING_GAP : 0);
  }, 0);

  const finalWidth = Math.max(selfWidth, childrenWidth);
  widthCache.set(nodeId, finalWidth);
  return finalWidth;
}

/**
 * 基于树结构递归计算每个节点的坐标。
 * @param {string} nodeId 节点ID
 * @param {Map} childrenMap 子节点映射
 * @param {Map} nodeMap 节点映射
 * @param {Map} widthCache 宽度缓存
 * @param {Map} depthMap 深度映射
 * @param {Map} positionMap 坐标缓存
 * @param {number} leftBound 当前子树左边界
 */
function assignTreePosition(
  nodeId,
  childrenMap,
  nodeMap,
  widthCache,
  depthMap,
  positionMap,
  leftBound
) {
  const subtreeWidth = widthCache.get(nodeId) || getNodeUnitWidth(nodeMap.get(nodeId));
  const depth = depthMap.get(nodeId) || 0;
  const currentX = leftBound + subtreeWidth / 2;
  const currentY = ROOT_TOP_OFFSET + depth * LEVEL_GAP;

  positionMap.set(nodeId, {
    x: currentX,
    y: currentY,
    depth,
  });

  const childIds = childrenMap.get(nodeId) || [];
  let childLeftBound = leftBound;
  childIds.forEach((childId) => {
    const childWidth = widthCache.get(childId) || getNodeUnitWidth(nodeMap.get(childId));
    assignTreePosition(
      childId,
      childrenMap,
      nodeMap,
      widthCache,
      depthMap,
      positionMap,
      childLeftBound
    );
    childLeftBound += childWidth + SIBLING_GAP;
  });
}

/**
 * 将节点按照纵向树状结构进行分层布局。
 * @param {Array} nodes 节点列表
 * @param {Map} depthMap 深度映射
 * @param {Map} childrenMap 子节点映射
 * @param {string} centerId 中心节点ID
 * @returns {{positionedNodes: Array, contentWidth: number, contentHeight: number}}
 */
function layoutNodes(nodes = [], depthMap, childrenMap, centerId = '') {
  if (!nodes.length || !centerId) {
    return {
      positionedNodes: nodes,
      contentWidth: 0,
      contentHeight: 0,
    };
  }

  const sortedNodes = [...nodes].sort((a, b) => {
    const depthDiff = (depthMap.get(a.id) || 0) - (depthMap.get(b.id) || 0);
    if (depthDiff !== 0) {
      return depthDiff;
    }

    return b.degree - a.degree;
  });
  const nodeMap = new Map(sortedNodes.map((node) => [node.id, node]));
  const sortedChildrenMap = new Map();

  childrenMap.forEach((childIds, parentId) => {
    const sortedChildIds = [...childIds].sort((leftId, rightId) => {
      const leftNode = nodeMap.get(leftId) || {};
      const rightNode = nodeMap.get(rightId) || {};
      if ((leftNode.nodeType || '') !== (rightNode.nodeType || '')) {
        return leftNode.nodeType === 'company' ? -1 : 1;
      }
      return (rightNode.degree || 0) - (leftNode.degree || 0);
    });
    sortedChildrenMap.set(parentId, sortedChildIds);
  });

  const widthCache = new Map();
  const positionMap = new Map();
  const treeWidth = measureSubtreeWidth(centerId, sortedChildrenMap, nodeMap, widthCache);
  assignTreePosition(
    centerId,
    sortedChildrenMap,
    nodeMap,
    widthCache,
    depthMap,
    positionMap,
    HORIZONTAL_PADDING
  );

  const maxDepth = sortedNodes.reduce((maxDepthValue, node) => {
    return Math.max(maxDepthValue, depthMap.get(node.id) || 0);
  }, 0);

  return {
    positionedNodes: sortedNodes.map((node) => ({
      ...node,
      x: positionMap.get(node.id)?.x || HORIZONTAL_PADDING + treeWidth / 2,
      y: positionMap.get(node.id)?.y || ROOT_TOP_OFFSET,
      depth: positionMap.get(node.id)?.depth || 0,
    })),
    contentWidth: treeWidth + HORIZONTAL_PADDING * 2,
    contentHeight: ROOT_TOP_OFFSET + maxDepth * LEVEL_GAP + 220,
  };
}

/**
 * 构建可直接交给 G6 渲染的节点与边模型。
 * @param {object} payload 图谱原始数据
 * @param {object} options 渲染配置
 * @returns {{nodes: Array, edges: Array, centerId: string, graphWidth: number, graphHeight: number}}
 */
export function buildQxbGraphModels(payload = {}, options = {}) {
  const {
    width = 1200,
    height = 720,
    centerName = '',
    expandedNodeIds = [],
    defaultVisibleDepth = DEFAULT_VISIBLE_DEPTH,
  } = options;
  const { nodes, edges, centerId } = normalizeGraphData(payload, { centerName });
  const { depthMap, childrenMap } = buildTreeMeta(nodes, edges, centerId);
  const expandedNodeSet = new Set(expandedNodeIds);
  const { visibleNodeSet, expandableNodeSet, expandedVisibleNodeSet } = buildVisibleState(
    centerId,
    depthMap,
    childrenMap,
    expandedNodeSet,
    defaultVisibleDepth
  );
  const visibleNodes = nodes.filter((node) => visibleNodeSet.has(node.id));
  const visibleEdges = edges.filter(
    (edge) => visibleNodeSet.has(edge.source) && visibleNodeSet.has(edge.target)
  );
  const { positionedNodes, contentWidth, contentHeight } = layoutNodes(
    visibleNodes,
    depthMap,
    new Map(
      Array.from(childrenMap.entries()).map(([parentId, childIds]) => [
        parentId,
        childIds.filter((childId) => visibleNodeSet.has(childId)),
      ])
    ),
    centerId
  );
  return {
    centerId,
    graphWidth: Math.max(width, contentWidth),
    graphHeight: Math.max(height, contentHeight),
    nodes: positionedNodes.map((node) => {
      const canToggleExpand = expandableNodeSet.has(node.id) || expandedVisibleNodeSet.has(node.id);
      return {
        ...node,
        canToggleExpand,
        isExpanded: expandedVisibleNodeSet.has(node.id),
        label: `${formatLabel(
          node.name,
          node.nodeType === 'company' ? 6 : 4,
          node.isRoot ? 4 : 3
        )}`,
        labelCfg: {
          style: {
            fill: node.nodeType === 'company' && !node.isRoot ? '#2E3642' : '#FFFFFF',
            fontSize: node.isRoot ? 15 : 12,
            fontWeight: node.isRoot ? 600 : 500,
            textAlign: 'center',
            textBaseline: 'middle',
            lineHeight: node.isRoot ? 19 : 16,
          },
        },
        type: node.nodeType === 'company' ? 'qxb-company-node' : 'qxb-person-node',
        size: getNodeSize(node),
        anchorPoints: getNodeAnchorPoints(),
        style: getNodeStyle(node),
      };
    }),
    edges: visibleEdges.map((edge) => {
      const sourceDepth = depthMap.get(edge.source) || 0;
      const targetDepth = depthMap.get(edge.target) || 0;
      const sourceNode = positionedNodes.find((node) => node.id === edge.source);
      const targetNode = positionedNodes.find((node) => node.id === edge.target);
      let sourceAnchor = 1;
      let targetAnchor = 0;

      if (sourceDepth > targetDepth) {
        sourceAnchor = 0;
        targetAnchor = 1;
      } else if (sourceDepth === targetDepth) {
        const isSourceAtLeft = (sourceNode?.x || 0) <= (targetNode?.x || 0);
        sourceAnchor = isSourceAtLeft ? 3 : 2;
        targetAnchor = isSourceAtLeft ? 2 : 3;
      }

      return {
        ...edge,
        type: 'line',
        sourceAnchor,
        targetAnchor,
        label: edge.relationText,
        labelCfg: {
          style: {
            fill: '#434B57',
            fontSize: 12,
            fontWeight: 600,
            background: {
              fill: 'rgba(255,255,255,0.98)',
              stroke: '#D8DEE8',
              lineWidth: 1,
              padding: [3, 6, 3, 6],
              radius: 10,
            },
          },
        },
        style: getEdgeStyle(edge),
      };
    }),
  };
}
