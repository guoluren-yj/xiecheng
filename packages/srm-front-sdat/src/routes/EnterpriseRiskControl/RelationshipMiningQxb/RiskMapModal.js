import React, { useEffect, useRef, useState } from 'react';
import G6 from '@antv/g6';
import moment from 'moment';
import intl from 'utils/intl';
import { Button, Tooltip } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { buildQxbGraphModels, ensureQxbGraphShapes } from './graphUtils';

const EXPORT_IMAGE_MAX_WIDTH = 5200;
const EXPORT_IMAGE_MAX_HEIGHT = 5200;
const EXPORT_IMAGE_PADDING = 80;
const EXPORT_IMAGE_PIXEL_RATIO = 2;

/**
 * 等待浏览器完成一帧绘制，确保离屏图谱已完成渲染。
 * @returns {Promise<void>}
 */
function waitForNextFrame() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => resolve());
      return;
    }
    setTimeout(resolve, 16);
  });
}

/**
 * 获取图谱画布分组矩阵。
 * @param {object} graph 图谱实例
 * @returns {Array<number> | null}
 */
function getGraphMatrix(graph) {
  const graphGroup = graph?.get && graph.get('group');
  const matrix = graphGroup?.getMatrix ? graphGroup.getMatrix() : null;
  return matrix ? [...matrix] : null;
}

/**
 * 恢复图谱画布分组矩阵。
 * @param {object} graph 图谱实例
 * @param {Array<number> | null} matrix 画布矩阵
 * @returns {boolean}
 */
function applyGraphMatrix(graph, matrix) {
  const graphGroup = graph?.get && graph.get('group');
  if (!graphGroup?.setMatrix || !matrix) {
    return false;
  }
  graphGroup.setMatrix([...matrix]);
  return true;
}

/**
 * 将图模型坐标转换为当前画布坐标。
 * @param {object} graph 图谱实例
 * @param {object} point 图模型坐标
 * @returns {{x: number, y: number}}
 */
function getCanvasPoint(graph, point = {}) {
  if (graph?.getCanvasByPoint) {
    return graph.getCanvasByPoint(point.x, point.y);
  }
  return {
    x: point.x || 0,
    y: point.y || 0,
  };
}

/**
 * 根据节点 ID 查询图谱节点。
 * @param {object} graph 图谱实例
 * @param {string} nodeId 节点 ID
 * @returns {object | null}
 */
function findGraphNode(graph, nodeId) {
  if (!graph?.findById || !nodeId) {
    return null;
  }
  return graph.findById(nodeId);
}

/**
 * 判断是否点击了展开控制按钮。
 * @param {object} shape 当前点击图形
 * @returns {boolean}
 */
function isToggleControlShape(shape) {
  if (!shape?.get) {
    return false;
  }
  return (
    ['qxb-toggle-control'].includes(shape.get('name')) ||
    ['qxb-toggle-control'].includes(shape.get('className'))
  );
}

/**
 * 通过离屏图谱生成全量展开后的导出图片。
 * @param {object} data 图谱原始数据
 * @returns {Promise<string>}
 */
async function exportFullGraphImage(data) {
  const exportGraphModel = buildQxbGraphModels(data, {
    width: 1,
    height: 1,
    centerName: data?.CompanyName || data?.companyName || data?.Name || '',
    defaultVisibleDepth: Number.MAX_SAFE_INTEGER,
  });

  if (!exportGraphModel?.nodes?.length) {
    return '';
  }

  const naturalWidth = Math.max(exportGraphModel.graphWidth + EXPORT_IMAGE_PADDING * 2, 1);
  const naturalHeight = Math.max(exportGraphModel.graphHeight + EXPORT_IMAGE_PADDING * 2, 1);
  const scaleRatio = Math.min(
    EXPORT_IMAGE_MAX_WIDTH / naturalWidth,
    EXPORT_IMAGE_MAX_HEIGHT / naturalHeight,
    1
  );
  const exportWidth = Math.max(Math.round(naturalWidth * scaleRatio), 1200);
  const exportHeight = Math.max(Math.round(naturalHeight * scaleRatio), 900);
  const tempContainer = document.createElement('div');
  tempContainer.style.cssText = `
    position: fixed;
    left: -99999px;
    top: -99999px;
    width: ${exportWidth}px;
    height: ${exportHeight}px;
    background: transparent;
    pointer-events: none;
    opacity: 0;
    overflow: hidden;
  `;
  document.body.appendChild(tempContainer);

  let exportGraph = null;

  try {
    ensureQxbGraphShapes(G6);
    exportGraph = new G6.Graph({
      container: tempContainer,
      width: exportWidth,
      height: exportHeight,
      pixelRatio: EXPORT_IMAGE_PIXEL_RATIO,
      modes: {
        default: [],
      },
    });

    exportGraph.read(exportGraphModel);
    if (exportGraph.fitView) {
      exportGraph.fitView(EXPORT_IMAGE_PADDING);
    }
    if (exportGraph.paint) {
      exportGraph.paint();
    }
    await waitForNextFrame();
    return exportGraph.toDataURL('image/png');
  } finally {
    if (exportGraph) {
      exportGraph.destroy();
    }
    if (tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
}

const RiskMapModal = ({ record }) => {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const matrixRef = useRef(null);
  const anchorNodeIdRef = useRef('');
  const [expandedNodeIds, setExpandedNodeIds] = useState([]);

  useEffect(() => {
    if (!containerRef.current) return;
    ensureQxbGraphShapes(G6);

    const obj = record && record.toData ? record?.toData() : { ...record } || {};
    const width = containerRef.current.scrollWidth || 800;
    const height = containerRef.current.scrollHeight || 600;
    const graphModel = buildQxbGraphModels(obj, {
      width,
      height,
      centerName: obj?.CompanyName || obj?.companyName || obj?.Name || '',
      expandedNodeIds,
    });

    if (!graphModel?.nodes?.length) {
      return undefined;
    }

    const graph = new G6.Graph({
      container: containerRef.current,
      width: graphModel.graphWidth || width,
      height: graphModel.graphHeight || height,
      modes: {
        default: ['drag-canvas', 'zoom-canvas'],
      },
    });

    graph.node((model) => ({
      ...model,
    }));

    graph.edge((model) => ({
      type: 'line',
      ...model,
    }));

    graph.read(graphModel);
    graphRef.current = graph;
    graph.on('node:click', (ev) => {
      const nodeModel = ev?.item?.getModel() || {};
      const nodeId = nodeModel.id || '';
      const clickedShape = ev?.shape || ev?.target;
      const isToggleControl = isToggleControlShape(clickedShape);

      if (nodeModel.canToggleExpand && isToggleControl) {
        anchorNodeIdRef.current = nodeId;
        setExpandedNodeIds((prevState) =>
          prevState.includes(nodeId)
            ? prevState.filter((item) => item !== nodeId)
            : [...prevState, nodeId]
        );
      }
    });
    if (!applyGraphMatrix(graph, matrixRef.current)) {
      const primaryNodes = graphModel.nodes.filter((node) => (node.depth || 0) <= 1);
      const targetNodes = primaryNodes.length ? primaryNodes : graphModel.nodes.slice(0, 1);
      const nodeBBoxes = targetNodes
        .map((node) => findGraphNode(graph, node?.id))
        .map((item) => (item?.getBBox ? item.getBBox() : null))
        .filter(Boolean);
      const dom = containerRef.current;

      if (nodeBBoxes.length && dom) {
        const bbox = nodeBBoxes.reduce(
          (acc, current) => ({
            minX: Math.min(acc.minX, current.minX),
            minY: Math.min(acc.minY, current.minY),
            maxX: Math.max(acc.maxX, current.maxX),
            maxY: Math.max(acc.maxY, current.maxY),
          }),
          {
            minX: nodeBBoxes[0].minX,
            minY: nodeBBoxes[0].minY,
            maxX: nodeBBoxes[0].maxX,
            maxY: nodeBBoxes[0].maxY,
          }
        );
        const viewportWidth = dom.clientWidth || dom.scrollWidth || 0;
        const viewportHeight = dom.clientHeight || dom.scrollHeight || 0;
        const availableWidth = Math.max(viewportWidth - 120, 240);
        const availableHeight = Math.max(viewportHeight - 180, 240);
        const boxWidth = Math.max(bbox.maxX - bbox.minX, 1);
        const boxHeight = Math.max(bbox.maxY - bbox.minY, 1);
        const fitRatio = Math.min(availableWidth / boxWidth, availableHeight / boxHeight, 1);

        if (fitRatio < 1 && graph.zoom) {
          graph.zoom(fitRatio, {
            x: (bbox.minX + bbox.maxX) / 2,
            y: (bbox.minY + bbox.maxY) / 2,
          });
        }

        const topLeft = getCanvasPoint(graph, { x: bbox.minX, y: bbox.minY });
        const bottomRight = getCanvasPoint(graph, { x: bbox.maxX, y: bbox.maxY });
        const currentCenterX = (topLeft.x + bottomRight.x) / 2;
        const dx = viewportWidth / 2 - currentCenterX;
        const dy = 36 - topLeft.y;

        if ((dx || dy) && graph.translate) {
          graph.translate(dx, dy);
        }
      }
    }
    if (anchorNodeIdRef.current) {
      const anchorNode = findGraphNode(graph, anchorNodeIdRef.current);
      const bbox = anchorNode?.getBBox ? anchorNode.getBBox() : null;
      const dom = containerRef.current;
      if (bbox && dom) {
        const topLeft = getCanvasPoint(graph, { x: bbox.minX, y: bbox.minY });
        const bottomRight = getCanvasPoint(graph, { x: bbox.maxX, y: bbox.maxY });
        const viewportWidth = dom.clientWidth || dom.scrollWidth || 0;
        const viewportHeight = dom.clientHeight || dom.scrollHeight || 0;
        let dx = 0;
        let dy = 0;

        if (topLeft.x < 48) {
          dx = 48 - topLeft.x;
        } else if (bottomRight.x > viewportWidth - 48) {
          dx = viewportWidth - 48 - bottomRight.x;
        }

        if (topLeft.y < 40) {
          dy = 40 - topLeft.y;
        } else if (bottomRight.y > viewportHeight - 180) {
          dy = viewportHeight - 180 - bottomRight.y;
        }

        if ((dx || dy) && graph.translate) {
          graph.translate(dx, dy);
        }
      }
      anchorNodeIdRef.current = '';
    }

    return () => {
      if (graphRef.current) {
        matrixRef.current = getGraphMatrix(graphRef.current);
        graphRef.current.destroy();
        graphRef.current = null;
      }
    };
  }, [expandedNodeIds, record]);

  /**
   * 导出当前弹窗图谱。
   */
  const handleExportChart = async () => {
    const data = record && record.toData ? record.toData() : { ...record } || {};
    if (!data?.Data?.length) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl.get('sdat.common.view.message.noDataToExport').d('暂无可导出的图谱'),
      });
      return;
    }

    try {
      const dataURL = await exportFullGraphImage(data);
      if (!dataURL) {
        notification.error({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl.get('sdat.common.view.message.noDataToExport').d('暂无可导出的图谱'),
        });
        return;
      }

      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${intl
        .get('sdat.supplier.view.title.relationShootingMap')
        .d('关系排查图谱')}${moment().format('YYYY-MM-DD HH:mm:ss')}.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      notification.error({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl
          .get('sdat.supplier.view.message.exportGraphError')
          .d('图谱导出失败，请稍后重试'),
      });
    }
  };

  return (
    <div
      style={{ position: 'relative', height: '100%', background: '#EEF1F7', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 9 }}>
        <Tooltip title={intl.get('sdat.supplier.view.message.exportGraph').d('下载图谱')}>
          <Button
            funcType="flat"
            icon="file_download"
            onClick={handleExportChart}
            style={{ background: '#fff' }}
          >
            {intl.get('sdat.supplier.view.message.exportGraph').d('下载图谱')}
          </Button>
        </Tooltip>
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'space-around',
          justifyContent: 'space-around',
          pointerEvents: 'none',
          opacity: 1,
          padding: '24px',
        }}
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={`modal-watermark-item-${index + 1}`}
            style={{
              width: '180px',
              transform: 'rotate(-24deg)',
              color: 'rgba(114, 132, 171, 0.12)',
              fontSize: '24px',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {intl.get('sdat.supplier.view.title.relationShootingMap').d('关系排查图谱')}
          </span>
        ))}
      </div>
      <div
        ref={containerRef}
        style={{ height: '600px', width: '100%', position: 'relative', zIndex: 2 }}
      />
    </div>
  );
};

export default RiskMapModal;
