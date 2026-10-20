/* eslint-disable react/no-array-index-key */
/**
 * 关系挖掘页面
 */
import React, { useState, useEffect, useRef } from 'react';
import { Header } from 'components/Page';
import withProps from 'utils/withProps';
import moment from 'moment';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { queryIdpValue } from 'services/api';
import G6 from '@antv/g6';
import formatterCollections from 'utils/intl/formatterCollections';
import { Row, Col, DataSet, Table, Button, Icon, Modal, TextField, Spin } from 'choerodon-ui/pro';
import { Popover, Tabs } from 'choerodon-ui';
import notification from 'utils/notification';

import ToggleBtn from '@/components/ToggleBtn';
import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import {
  fetchRelationMining,
  fetchExportPath,
  fetchMiningHisData, // 历史数据挖掘
  fetchExportContract,
} from '@/services/riskControl/miningMenuService';

import { RelationMiningDS } from './stores/relationMiningDS';
import { SettingDS } from './stores/settingDS';
import RiskMapModal from './RiskMapModal';
import MiningHistory from './MiningHistory';
import { buildQxbGraphModels, ensureQxbGraphShapes } from './graphUtils';
import MiningSetting from '../RelationshipMiningQxb/MiningSetting';
import styles from './index.less';

const defaultUrl = require('@/assets/illustrate01.svg');
const noneSrc = require('@/assets/no_search_result.svg');

const { TabPane } = Tabs;

let modal = null;
let hasHisMap = false;

let statusMap = {
  noData: true, // 查询无数据
  noQuery: true, // 未查询
};

const EXPORT_IMAGE_MAX_WIDTH = 5200;
const EXPORT_IMAGE_MAX_HEIGHT = 5200;
const EXPORT_IMAGE_PADDING = 80;
const EXPORT_IMAGE_PIXEL_RATIO = 2;
const RELATION_TYPE_FIELD_LIST = [
  'SH',
  'SH_percent_greater',
  'SH_percent_less',
  'HSH',
  'HSH_percent_greater',
  'HSH_percent_less',
  'branch',
  'LR',
  'HLR',
  'DIR',
  'HDIR',
  'SUP',
  'HSUP',
  'EXE',
  'HEXE',
  'djg_same_name',
  'same_controller',
  'control',
  'group',
  'guarantee',
  'same_phone',
  'same_email',
  'same_address',
  'same_history_phone',
  'same_history_email',
  'same_history_address',
  'public',
  'gov',
  'fund',
  'bank',
  'financial',
  'status2',
  'status3',
  'status4',
  'status7',
];
const RELATION_MINING_TARGET_MAX_COUNT = 20;
const RELATION_MINING_TARGET_MIN_COUNT = 2;
const DEFAULT_LEVEL_VALUE = 10;
const DEFAULT_SETTING_VALUES = {
  equity: true,
  SH: true,
  stake_threshold: 10,
  SH_percent_greater: true,
  SH_percent_less: true,
  HSH: true,
  stake_threshold_history: 10,
  HSH_percent_greater: true,
  HSH_percent_less: true,
  branch: true,
  djg: true,
  LR: true,
  HLR: true,
  DIR: true,
  HDIR: true,
  SUP: true,
  HSUP: true,
  EXE: true,
  HEXE: true,
  djg_same_name: true,
  control_guarantee: false,
  same_controller: false,
  control: false,
  group: false,
  guarantee: false,
  contact: true,
  same_phone: true,
  same_email: true,
  same_address: true,
  same_history_phone: true,
  same_history_email: true,
  same_history_address: true,
  whitelist: false,
  public: false,
  gov: false,
  fund: false,
  bank: false,
  financial: false,
  status: false,
  status2: false,
  status3: false,
  status4: false,
  status7: false,
};

/**
 * 获取图谱画布分组的变换矩阵。
 * @param {object} graph 图谱实例
 * @returns {Array<number> | null}
 */
const getGraphMatrix = (graph) => {
  const graphGroup = graph?.get && graph.get('group');
  const matrix = graphGroup?.getMatrix ? graphGroup.getMatrix() : null;
  return matrix ? [...matrix] : null;
};

/**
 * 恢复图谱画布分组的变换矩阵。
 * @param {object} graph 图谱实例
 * @param {Array<number> | null} matrix 画布矩阵
 * @returns {boolean}
 */
const applyGraphMatrix = (graph, matrix) => {
  const graphGroup = graph?.get && graph.get('group');
  if (!graphGroup?.setMatrix || !matrix) {
    return false;
  }
  graphGroup.setMatrix([...matrix]);
  return true;
};

/**
 * 将图模型坐标转换为当前画布坐标。
 * @param {object} graph 图谱实例
 * @param {object} point 图模型坐标
 * @returns {{x: number, y: number}}
 */
const getCanvasPoint = (graph, point = {}) => {
  if (graph?.getCanvasByPoint) {
    return graph.getCanvasByPoint(point.x, point.y);
  }
  return {
    x: point.x || 0,
    y: point.y || 0,
  };
};

/**
 * 根据节点 ID 查询图谱元素。
 * @param {object} graph 图谱实例
 * @param {string} nodeId 节点 ID
 * @returns {object | null}
 */
const findGraphNode = (graph, nodeId) => {
  if (!graph?.findById || !nodeId) {
    return null;
  }
  return graph.findById(nodeId);
};

/**
 * 判断当前点击的图形是否为展开控制按钮。
 * @param {object} shape 当前点击图形
 * @returns {boolean}
 */
const isToggleControlShape = (shape) => {
  if (!shape?.get) {
    return false;
  }
  return (
    ['qxb-toggle-control'].includes(shape.get('name')) ||
    ['qxb-toggle-control'].includes(shape.get('className'))
  );
};

/**
 * 等待浏览器完成一帧绘制，确保离屏图谱已完成渲染。
 * @returns {Promise<void>}
 */
const waitForNextFrame = () =>
  new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => resolve());
      return;
    }
    setTimeout(resolve, 16);
  });

const RelationshipMining = (props) => {
  const { hisRoadListDS, qxbListDS, settingDS } = props;

  const [activeKey, setActiveKey] = useState('road');
  const [refresh, setRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [selected, setSelected] = useState(null);
  const [syncFlag, setSyncFlag] = useState('');
  const [loading, setChangeLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(
    intl.get('sdat.supplier.view.title.inputEnterprise').d('左侧输入企业后进行排查')
  );
  const [startMsg, setStartMsg] = useState(
    intl.get('sdat.supplier.view.title.startMiningRelation').d('开启关系排查')
  );
  const [levelValue, setLevel] = useState(10);
  const [miningGraphData, setMiningGraphData] = useState({
    Data: [],
  });
  const [hisGraphData, setHisGraphData] = useState({
    Data: [],
  });
  const [expandedNodeIds, setExpandedNodeIds] = useState([]);
  const [hisExpandedNodeIds, setHisExpandedNodeIds] = useState([]);
  const [number1, setNumber1] = useState(10);
  const [number2, setNumber2] = useState(10);
  const [typeList, setTypeList] = useState([]);
  const [companyList, setCompanyList] = useState(['', '']);
  const settingsSnapshotRef = useRef(null);
  const settingsModalRef = useRef(null);

  const graphRef = useRef({
    road: null,
    his: null,
  });

  const graphMatrixRef = useRef({
    road: null,
    his: null,
  });

  const graphAnchorNodeRef = useRef({
    road: '',
    his: '',
  });

  /**
   * 同步更新已打开的排查设置弹窗内容，保证受控值实时刷新。
   */
  useEffect(() => {
    if (settingsModalRef.current?.update) {
      settingsModalRef.current.update({
        children: renderSettingsModalContent(),
      });
    }
  }, [levelValue, number1, number2, typeList]);

  /**
   * 销毁指定图谱实例，避免重复渲染造成内存泄漏。
   * @param {'road' | 'his'} graphKey 图谱标识
   */
  const destroyGraph = (graphKey) => {
    const currentGraph = graphRef.current[graphKey];
    if (currentGraph) {
      graphMatrixRef.current[graphKey] = getGraphMatrix(currentGraph);
      currentGraph.destroy();
      graphRef.current[graphKey] = null;
    }
  };

  /**
   * 恢复图谱矩阵，避免重绘后视口跳回左上角。
   * @param {'road' | 'his'} graphKey 图谱标识
   * @param {object} graph 图谱实例
   */
  const restoreGraphMatrix = (graphKey, graph) => {
    const matrix = graphMatrixRef.current[graphKey];
    return applyGraphMatrix(graph, matrix);
  };

  /**
   * 首次渲染时默认展示根节点与第一层子节点。
   * @param {object} graph 图谱实例
   * @param {HTMLElement} dom 图谱容器
   * @param {object} graphModel 图谱模型
   */
  const positionGraphToPrimaryLayers = (graph, dom, graphModel) => {
    if (!graph || !dom || !graphModel?.nodes?.length) {
      return;
    }

    const primaryNodes = graphModel.nodes.filter((node) => (node.depth || 0) <= 1);
    const targetNodes = primaryNodes.length ? primaryNodes : graphModel.nodes.slice(0, 1);
    const nodeBBoxes = targetNodes
      .map((node) => findGraphNode(graph, node?.id))
      .map((item) => (item?.getBBox ? item.getBBox() : null))
      .filter(Boolean);

    if (!nodeBBoxes.length) {
      return;
    }

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

    const topLeft = getCanvasPoint(graph, {
      x: bbox.minX,
      y: bbox.minY,
    });
    const bottomRight = getCanvasPoint(graph, {
      x: bbox.maxX,
      y: bbox.maxY,
    });
    const currentCenterX = (topLeft.x + bottomRight.x) / 2;
    const targetCenterX = viewportWidth / 2;
    const targetTopY = 36;
    const dx = targetCenterX - currentCenterX;
    const dy = targetTopY - topLeft.y;

    if ((dx || dy) && graph.translate) {
      graph.translate(dx, dy);
    }
  };

  /**
   * 将当前操作节点尽量保持在可视区域内，并为向下展开预留空间。
   * @param {'road' | 'his'} graphKey 图谱标识
   * @param {object} graph 图谱实例
   * @param {HTMLElement} dom 图谱容器
   */
  const keepAnchorNodeInViewport = (graphKey, graph, dom) => {
    const anchorNodeId = graphAnchorNodeRef.current[graphKey];
    if (!anchorNodeId || !graph || !dom) {
      return;
    }

    const anchorNode = findGraphNode(graph, anchorNodeId);
    if (!anchorNode || !anchorNode.getBBox) {
      graphAnchorNodeRef.current[graphKey] = '';
      return;
    }

    const bbox = anchorNode.getBBox();
    const topLeft = getCanvasPoint(graph, {
      x: bbox.minX,
      y: bbox.minY,
    });
    const bottomRight = getCanvasPoint(graph, {
      x: bbox.maxX,
      y: bbox.maxY,
    });
    const viewportWidth = dom.clientWidth || dom.scrollWidth || 0;
    const viewportHeight = dom.clientHeight || dom.scrollHeight || 0;
    const horizontalPadding = 48;
    const topPadding = 40;
    const bottomPadding = 180;
    let dx = 0;
    let dy = 0;

    if (topLeft.x < horizontalPadding) {
      dx = horizontalPadding - topLeft.x;
    } else if (bottomRight.x > viewportWidth - horizontalPadding) {
      dx = viewportWidth - horizontalPadding - bottomRight.x;
    }

    if (topLeft.y < topPadding) {
      dy = topPadding - topLeft.y;
    } else if (bottomRight.y > viewportHeight - bottomPadding) {
      dy = viewportHeight - bottomPadding - bottomRight.y;
    }

    if ((dx || dy) && graph.translate) {
      graph.translate(dx, dy);
    }

    graphAnchorNodeRef.current[graphKey] = '';
  };

  useEffect(() => {
    document.title = intl.get('sdat.supplier.view.title.relationShooting').d('关系排查');
    queryIdpValue('SDAT.RELATION_MINING_TYPE_QXB').then((res) => {
      if (getResponse(res)) {
        setTypeList([...res]);
      }
    });

    return () => {
      destroyGraph('road');
      destroyGraph('his');
      hasHisMap = false;
      statusMap = {};
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (activeKey === 'map' && (activeTab === '1' || activeTab === '2')) {
      refreshChart();
    }
  }, [activeKey, activeTab, miningGraphData, expandedNodeIds, companyList]);

  useEffect(() => {
    if (activeKey === 'map' && activeTab === '3') {
      refreshHisChart();
    }
  }, [activeKey, activeTab, hisGraphData, hisExpandedNodeIds, companyList, selected]);

  /**
   * 渲染启信宝风格图谱，并挂载节点展开交互。
   * @param {string} containerId 容器ID
   * @param {object} graphData 图谱原始数据
   * @param {string} centerName 中心节点名称
   * @returns {object | null}
   */
  const renderG6Graph = (
    graphKey,
    containerId,
    graphData,
    centerName,
    currentExpandedNodeIds,
    onExpandToggle = () => {}
  ) => {
    const dom = document.getElementById(containerId);
    if (!dom) {
      return null;
    }
    ensureQxbGraphShapes(G6);

    const width = dom.scrollWidth || 800;
    const height = dom.scrollHeight || 600;
    const graphModel = buildQxbGraphModels(graphData, {
      width,
      height,
      centerName,
      expandedNodeIds: currentExpandedNodeIds,
    });

    if (!graphModel?.nodes?.length) {
      return null;
    }

    const graph = new G6.Graph({
      container: containerId,
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
    graph.on('node:click', (ev) => {
      const nodeModel = ev?.item?.getModel() || {};
      const nodeId = nodeModel.id || '';
      const clickedShape = ev?.shape || ev?.target;
      const isToggleControl = isToggleControlShape(clickedShape);

      if (nodeModel.canToggleExpand && isToggleControl) {
        onExpandToggle(nodeId);
      }
    });
    const hasRestoredMatrix = restoreGraphMatrix(graphKey, graph);
    if (!hasRestoredMatrix) {
      positionGraphToPrimaryLayers(graph, dom, graphModel);
    }
    keepAnchorNodeInViewport(graphKey, graph, dom);

    return graph;
  };

  /**
   * 刷新当前查询图谱。
   */
  const refreshChart = () => {
    const chartMiningDom = document.getElementById('supplier-relation-ship-mining');
    if (chartMiningDom) {
      destroyGraph('road');
      graphRef.current.road = renderG6Graph(
        'road',
        'supplier-relation-ship-mining',
        miningGraphData,
        companyList?.[0] || '',
        expandedNodeIds,
        (nodeId) => {
          graphAnchorNodeRef.current.road = nodeId;
          setExpandedNodeIds((prevState) =>
            prevState.includes(nodeId)
              ? prevState.filter((item) => item !== nodeId)
              : [...prevState, nodeId]
          );
        }
      );
    }
  };

  /**
   * 刷新历史记录图谱。
   */
  const refreshHisChart = () => {
    const hisMiningDom = document.getElementById('supplier-relation-his-mining');
    if (hisMiningDom) {
      destroyGraph('his');
      graphRef.current.his = renderG6Graph(
        'his',
        'supplier-relation-his-mining',
        hisGraphData,
        selected?.searchKey || companyList?.[0] || '',
        hisExpandedNodeIds,
        (nodeId) => {
          graphAnchorNodeRef.current.his = nodeId;
          setHisExpandedNodeIds((prevState) =>
            prevState.includes(nodeId)
              ? prevState.filter((item) => item !== nodeId)
              : [...prevState, nodeId]
          );
        }
      );
    }
  };

  /**
   * 重置当前图谱并清空节点聚焦状态。
   */
  const resetChart = () => {
    if (activeTab === '3') {
      setHisExpandedNodeIds([]);
      destroyGraph('his');
      graphRef.current.his = renderG6Graph(
        'his',
        'supplier-relation-his-mining',
        hisGraphData,
        selected?.searchKey || companyList?.[0] || '',
        [],
        (nodeId) => {
          graphAnchorNodeRef.current.his = nodeId;
          setHisExpandedNodeIds((prevState) =>
            prevState.includes(nodeId)
              ? prevState.filter((item) => item !== nodeId)
              : [...prevState, nodeId]
          );
        }
      );
    } else {
      setExpandedNodeIds([]);
      destroyGraph('road');
      graphRef.current.road = renderG6Graph(
        'road',
        'supplier-relation-ship-mining',
        miningGraphData,
        companyList?.[0] || '',
        [],
        (nodeId) => {
          graphAnchorNodeRef.current.road = nodeId;
          setExpandedNodeIds((prevState) =>
            prevState.includes(nodeId)
              ? prevState.filter((item) => item !== nodeId)
              : [...prevState, nodeId]
          );
        }
      );
    }
  };

  const list = () => {
    return [
      {
        id: 'road',
        title: intl.get('sdat.supplier.view.btn.road').d('路径'),
      },
      {
        id: 'map',
        title: intl.get('sdat.supplier.view.btn.map').d('图谱'),
      },
    ].filter(Boolean);
  };

  const handleModeChange = (key) => {
    setActiveKey(key);
  };

  /**
   * 查看关系图谱
   * @param {*} record
   */
  const handleView = (record) => {
    if (modal) {
      modal.close();
    }

    const handleCloseModal = () => {
      modal.close();
    };

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.title.relationDetails').d('关系详情'),
      children: <RiskMapModal record={record} />,
      closable: true,
      drawer: true,
      style: { width: '800px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  const columns = () => {
    return [
      {
        name: 'serialNumber',
        header: intl.get('sdat.supplier.view.title.serialNumber').d('序号'),
        width: 60,
        renderer: ({ record }) => {
          const { currentPage, pageSize } = qxbListDS;
          return record.index + 1 + (currentPage - 1) * pageSize;
        },
      },
      {
        name: 'relationshipDetails',
        width: 80,
        renderer: ({ record }) => {
          return (
            <a onClick={() => handleView(record)}>
              {intl.get('hzero.common.view.title.view').d('查看')}
            </a>
          );
        },
      },
      {
        name: 'CompanyName',
        width: 150,
      },
      { name: 'RelatedCompanyName', width: 150 },
      { name: 'RelatedName', width: 200 },
      {
        name: 'affiliatedRoad',
        width: 1200,
        tooltip: 'none',
        renderer: ({ record }) => {
          const pathStr = record?.get('Path') ?? '';
          return (
            <Popover
              content={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    overflowX: 'hidden',
                    maxWidth: 1000,
                    flexWrap: 'wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {pathStr}
                </div>
              }
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  overflowX: 'hidden',
                }}
              >
                {pathStr}
              </div>
            </Popover>
          );
        },
      },
    ];
  };

  /**
   * 启信宝关系挖掘
   */
  const handleQXBMining = async () => {
    const validCompanyList = companyList.map((item) => `${item}`.trim()).filter(Boolean);

    if (validCompanyList.length < 2) {
      setAlertMsg(
        intl.get('sdat.supplier.view.title.selectedBigThenTwo').d('请在左侧至少选择两家供应商')
      );
      setStartMsg('');
      return;
    }

    const settingValues = settingDS.current.toJSONData();
    const relationTypeList = RELATION_TYPE_FIELD_LIST.filter(
      (fieldName) => settingValues[fieldName]
    );

    const fetchParam = {
      tenantId: getCurrentOrganizationId(),
      level: levelValue,
      companyList: validCompanyList,
      relationTypeList,
      stakeThreshold: number1,
      stakeThresholdHistory: number2,
      businessType: '-',
      businessIdentity: '-',
      businessNumber: '-',
      standardFlag: true,
    };

    const result = await fetchRelationMining({
      ...fetchParam,
    });
    if (result.success) {
      formatResData(result?.data ?? {}, 'default');
      const dataArr = result?.data?.Data ?? [];
      if (dataArr.length) {
        // 有数据
        statusMap.noData = false;
        statusMap.noQuery = false;
        setRefresh(true);
      } else {
        statusMap.noData = true;
        statusMap.noQuery = false;
        setRefresh(true);
      }
    } else {
      notification.error({
        message: result?.message ?? result?.msg ?? '',
      });
      statusMap.noData = true;
      statusMap.noQuery = true;
      resetChart();
      setRefresh(true);
    }
  };

  /**
   * 接口返回数据解析
   * @param {*} result
   * @param {*} type
   */
  const formatResData = (result, type) => {
    const data = result?.Data ?? [];
    const dataArr = Array.isArray(data) ? [...data] : [];

    // 去重
    if (type === 'default') {
      qxbListDS.data = dataArr;
      setMiningGraphData({
        ...result,
        Data: dataArr,
      });
      setExpandedNodeIds([]);
    } else {
      // 历史记录数据
      hisRoadListDS.data = dataArr;
      setHisGraphData({
        ...result,
        Data: dataArr,
      });
      setHisExpandedNodeIds([]);
    }
  };

  /**
   * 导出路径
   */
  const handleExportPath = (hisTag = '') => {
    const pathExportList = [];

    const data = hisTag === 'his' ? hisRoadListDS.toData() : qxbListDS.toData();

    if (activeTab === '1' || activeTab === '2') {
      data.forEach((item) => {
        pathExportList.push(item.Path);
      });
    }

    if (activeTab === '3') {
      if (!['MOBILE', 'ADDRESS', 'EMAIL'].includes(selected?.dataType)) {
        data.forEach((item) => {
          pathExportList.push(item.Path);
        });
      } else {
        data.forEach((item) => {
          pathExportList.push({
            ...item,
            companyName: item.CompanyName,
            relationList: item.RelationList,
            relatedCompanyName: item.RelatedCompanyName,
            relatedName: item.RelatedName,
            relatedType: item.RelatedType,
          });
        });
      }
    }

    if (pathExportList.length) {
      if (activeTab === '3' && ['MOBILE', 'ADDRESS', 'EMAIL'].includes(selected?.dataType)) {
        fetchExportContract({
          contactList: pathExportList,
        });
      } else {
        fetchExportPath({ paths: pathExportList });
      }
    } else {
      notification.warning({
        message: intl.get('sdat.common.view.message.noDataToExport').d('暂无可导出数据'),
      });
    }
  };

  /**
   * 变更排查目标输入值。
   * @param {number} index 排查目标下标
   * @param {object|string} event 输入事件或输入值
   */
  const handleChangeCompany = (index, event) => {
    const nextValue = typeof event === 'string' ? event : event?.target?.value ?? '';
    setCompanyList((prevState) =>
      prevState.map((item, currentIndex) => (currentIndex === index ? nextValue : item))
    );
  };

  /**
   * 新增排查目标输入框。
   */
  const handleAddCompany = () => {
    setCompanyList((prevState) => {
      if (prevState.length >= RELATION_MINING_TARGET_MAX_COUNT) {
        return prevState;
      }
      return [...prevState, ''];
    });
  };

  /**
   * 删除指定排查目标。
   * @param {number} index 排查目标下标
   */
  const handleDeleteCompany = (index) => {
    setCompanyList((prevState) => prevState.filter((_, currentIndex) => currentIndex !== index));
  };

  /**
   * 渲染排查目标输入列表。
   */
  const renderCompanyTargets = () => {
    return (
      <div className={styles['target-container']}>
        <div className={styles['target-list']}>
          {companyList.map((company, index) => (
            <div key={`target-${index}`} className={styles['target-item']}>
              <TextField
                clearButton={false}
                value={company}
                placeholder={intl
                  .get('sdat.supplier.view.placeholder.companyNameOrCreditCodeOrPerson')
                  .d('企业名称/统一社会信用代码')}
                className={styles['target-input']}
                onInput={(event) => handleChangeCompany(index, event)}
              />
              {companyList.length > RELATION_MINING_TARGET_MIN_COUNT ? (
                <Icon
                  type="close"
                  className={styles['target-delete-icon']}
                  onClick={() => handleDeleteCompany(index)}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleChangeTab = (key) => {
    setActiveTab(key);
    if (key === '3') {
      setSyncFlag(new Date().getTime());
    }
    setRefresh(true);
  };

  /**
   * 挖掘历史记录
   * @param {object} item
   */
  const selectHistoryItem = (item) => {
    setSelected({ ...item });
    if (item && item?.reportKey) {
      setChangeLoading(true);
      fetchMiningHisData({
        searchKey: item?.reportKey || '',
        relationTxtFlag: true,
        tenantId: getCurrentOrganizationId(),
      }).then((result) => {
        setChangeLoading(false);
        if (getResponse(result)) {
          const relationData = result && result.relationData ? JSON.parse(result.relationData) : {};
          formatResData(relationData, 'hisChart');
          const dataArr = relationData && relationData.Data ? relationData.Data : [];
          hasHisMap = !!dataArr.length;
        } else {
          hasHisMap = false;
        }
        refreshHisChart();
        setRefresh(true);
      });
    } else {
      hasHisMap = false;
      refreshHisChart();
      setRefresh(true);
    }
  };

  /**
   * 穿透层级改变值
   * @param {*} value
   */
  const handleChange = (value) => {
    setLevel(value);
  };

  /**
   * 获取当前处于激活状态的图谱实例。
   * @returns {object | null}
   */
  const getCurrentGraph = () => {
    return activeTab === '3' ? graphRef.current.his : graphRef.current.road;
  };

  /**
   * 获取当前导出场景对应的图谱原始数据。
   * @returns {{graphData: object, centerName: string}}
   */
  const getCurrentExportContext = () => {
    if (activeTab === '3') {
      return {
        graphData: hisGraphData,
        centerName: selected?.searchKey || companyList?.[0] || '',
      };
    }

    return {
      graphData: miningGraphData,
      centerName: companyList?.[0] || '',
    };
  };

  /**
   * 通过离屏图谱生成全量展开后的导出图片。
   * @returns {Promise<string>}
   */
  const exportFullGraphImage = async () => {
    const { graphData, centerName } = getCurrentExportContext();
    const exportGraphModel = buildQxbGraphModels(graphData, {
      width: 1,
      height: 1,
      centerName,
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
  };

  /**
   * 对图谱执行缩放操作。
   * @param {'in' | 'out'} type 缩放方向
   */
  const handleGraphZoom = (type) => {
    const currentGraph = getCurrentGraph();
    if (!currentGraph) {
      return;
    }

    currentGraph.zoom(type === 'in' ? 1.12 : 0.88);
  };

  /**
   * 导出当前图谱为图片。
   */
  const handleDownloadGraph = async () => {
    const { graphData } = getCurrentExportContext();
    if (!graphData?.Data?.length) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl.get('sdat.common.view.message.noDataToExport').d('暂无可导出的图谱'),
      });
      return;
    }

    try {
      const dataUrl = await exportFullGraphImage();
      if (!dataUrl) {
        notification.warning({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl.get('sdat.common.view.message.noDataToExport').d('暂无可导出的图谱'),
        });
        return;
      }
      const link = document.createElement('a');
      link.href = dataUrl;
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

  /**
   * 渲染图谱工具栏与图例说明。
   * @returns {JSX.Element}
   */
  const renderGraphToolbar = () => {
    return (
      <div className={styles['graph-toolbar']}>
        <div className={styles['graph-toolbar-actions']}>
          <Button funcType="flat" onClick={() => handleGraphZoom('in')}>
            {intl.get('sdat.supplier.view.tooltip.zoomIn').d('放大')}
          </Button>
          <Button funcType="flat" onClick={() => handleGraphZoom('out')}>
            {intl.get('sdat.supplier.view.tooltip.zoomOut').d('缩小')}
          </Button>
          <Button funcType="flat" onClick={handleDownloadGraph}>
            {intl.get('hzero.common.view.button.exportAll').d('导出')}
          </Button>
        </div>
      </div>
    );
  };

  const renderGraphCanvas = (containerId) => {
    return (
      <div className={styles['graph-panel']}>
        {renderGraphToolbar()}
        <div className={styles['graph-stage']}>
          <div className={styles['graph-watermark-layer']}>
            {Array.from({ length: 18 }).map((_, index) => (
              <span
                key={`watermark-${containerId}-${index}`}
                className={styles['graph-watermark-item']}
              >
                {intl.get('sdat.supplier.view.title.relationShootingMap').d('关系排查图谱')}
              </span>
            ))}
          </div>
          <div id={containerId} className={styles['graph-canvas']} />
        </div>
      </div>
    );
  };

  /**
   * 同步股比阈值本地状态，保证弹窗文案与输入框数值一致。
   * @param {object} record 设置记录
   */
  const syncThresholdValueState = (record = settingDS.current) => {
    setNumber1(record?.get('stake_threshold') ?? DEFAULT_SETTING_VALUES.stake_threshold);
    setNumber2(
      record?.get('stake_threshold_history') ?? DEFAULT_SETTING_VALUES.stake_threshold_history
    );
  };

  /**
   * 获取当前排查设置快照，用于取消弹窗时回滚。
   * @returns {{levelValue: number, settingValues: object}}
   */
  const getCurrentSettingsSnapshot = () => {
    return {
      levelValue,
      settingValues: settingDS.current?.toJSONData?.() || {},
    };
  };

  /**
   * 应用排查设置值。
   * @param {{levelValue?: number, settingValues?: object}} snapshot 设置快照
   */
  const applySettingsSnapshot = (snapshot) => {
    const currentRecord = settingDS.current;
    if (!currentRecord || !snapshot) {
      return;
    }

    const settingValues = snapshot.settingValues || {};
    Object.keys(settingValues).forEach((fieldName) => {
      currentRecord.set(fieldName, settingValues[fieldName]);
    });
    setLevel(snapshot.levelValue ?? DEFAULT_LEVEL_VALUE);
    syncThresholdValueState(currentRecord);
  };

  /**
   * 重置排查设置为默认值。
   */
  const resetSettingsToDefault = () => {
    const currentRecord = settingDS.current;
    if (!currentRecord) {
      return;
    }

    Object.keys(DEFAULT_SETTING_VALUES).forEach((fieldName) => {
      currentRecord.set(fieldName, DEFAULT_SETTING_VALUES[fieldName]);
    });
    setLevel(DEFAULT_LEVEL_VALUE);
    syncThresholdValueState(currentRecord);
  };

  /**
   * 渲染排查设置弹窗内容，供打开和更新弹窗时复用。
   * @returns {JSX.Element}
   */
  const renderSettingsModalContent = () => {
    return (
      <div className={styles['settings-modal-body']}>
        <MiningSetting
          isModal
          settingDS={settingDS}
          typeList={typeList}
          levelValue={levelValue}
          number1={number1}
          number2={number2}
          onLevelChange={handleChange}
          onNumber1Change={setNumber1}
          onNumber2Change={setNumber2}
        />
      </div>
    );
  };

  const handleSettingClick = () => {
    let isSaved = false;
    settingsSnapshotRef.current = getCurrentSettingsSnapshot();
    syncThresholdValueState();

    const handleClose = () => {
      if (settingsModalRef.current?.close) {
        settingsModalRef.current.close();
      }
    };

    /**
     * 关闭弹窗后根据操作类型恢复或保留设置。
     */
    const handleAfterClose = () => {
      if (!isSaved && settingsSnapshotRef.current) {
        applySettingsSnapshot(settingsSnapshotRef.current);
      }
      settingsSnapshotRef.current = null;
      settingsModalRef.current = null;
    };

    /**
     * 保存排查设置。
     */
    const handleSave = async () => {
      const isValid = await settingDS.validate();
      if (isValid) {
        isSaved = true;
        syncThresholdValueState();
        handleClose();
      }
      return false;
    };

    /**
     * 恢复默认排查设置。
     */
    const handleReset = () => {
      resetSettingsToDefault();
    };

    settingsModalRef.current = Modal.open({
      title: intl.get('sdat.supplier.view.title.companyMiningSetting').d('排查设置'),
      children: renderSettingsModalContent(),
      drawer: true,
      closable: true,
      destroyOnClose: true,
      maskClosable: false,
      keyboard: false,
      className: styles['settings-modal'],
      style: { width: '520px' },
      afterClose: handleAfterClose,
      footer: (
        <div className={styles['settings-modal-footer']}>
          <Button onClick={handleClose}>{intl.get(`hzero.common.button.close`).d('取消')}</Button>
          <Button onClick={handleReset}>
            {intl.get(`sdat.supplier.view.button.reset`).d('恢复默认')}
          </Button>
          <Button color="primary" onClick={handleSave}>
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        </div>
      ),
    });
  };

  const canAddTarget = companyList.length < RELATION_MINING_TARGET_MAX_COUNT;

  return (
    <div className={styles['relationship-mining-basic']}>
      <Header title={intl.get('sdat.supplier.view.title.relationShooting').d('关系排查')} />
      <div className={styles['relationship-mining-container']}>
        <Row
          style={{
            height: 'calc(100vh - 152px)',
            overflow: 'hidden',
          }}
        >
          <Col
            span={5}
            style={{
              height: '100%',
              padding: '20px 0',
              borderRight: '1px solid rgba(242,242,242,1)',
            }}
          >
            <Tabs activeKey={activeTab} onChange={handleChangeTab}>
              <TabPane
                tab={intl.get('sdat.supplier.view.title.troubleshootingTarget').d('排查目标')}
                key="1"
              >
                <div
                  style={{
                    padding: '20px',
                    height: 'calc(100vh - 214px)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: 'calc(100vh - 300px)',
                      overflow: 'hidden',
                    }}
                  >
                    {renderCompanyTargets()}
                    <div className={styles['relation-mining-btn-span']}>
                      <Button
                        style={{
                          width: '100%',
                          marginBottom: '16px',
                        }}
                        disabled={!canAddTarget}
                        onClick={handleAddCompany}
                      >
                        <Icon type="add" style={{ marginRight: '4px' }} />
                        {intl
                          .get('sdat.supplier.view.button.addTroubleshootingTarget')
                          .d('新增排查目标')}
                        &nbsp;&nbsp;
                        {companyList.length}/{RELATION_MINING_TARGET_MAX_COUNT}
                      </Button>
                      <Button color="primary" style={{ width: '100%' }} onClick={handleQXBMining}>
                        <Icon type="play_arrow" style={{ marginRight: '4px' }} />
                        {intl.get('sdat.supplier.view.title.startShooting').d('开始排查')}
                      </Button>
                    </div>
                  </div>
                  <div className={styles['relation-mining-btn-span']}>
                    <Button
                      style={{
                        width: '100%',
                        fontSize: '12px',
                        fontWeight: '400',
                      }}
                      onClick={handleSettingClick}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon
                          type="settings"
                          style={{
                            fontSize: '12px',
                            marginRight: '4px',
                          }}
                        />
                        {intl.get('sdat.supplier.view.title.companyMiningSetting').d('排查设置')}
                      </div>
                    </Button>
                  </div>
                </div>
              </TabPane>

              <TabPane
                tab={intl.get('sdat.supplier.view.title.historyRecord').d('历史记录')}
                key="3"
              >
                <MiningHistory onSelect={selectHistoryItem} syncFlag={syncFlag} />
              </TabPane>
            </Tabs>
          </Col>
          <Col
            span={19}
            style={{
              backgroundColor: activeKey === 'road' ? '#fff' : '#f7f8fa',
              paddingLeft: activeKey === 'road' ? '16px' : '0',
            }}
          >
            {activeTab === '1' || activeTab === '2' ? (
              <>
                {!statusMap.noData ? ( // 有数据（已经执行查询）
                  <div>
                    <div
                      style={{
                        backgroundColor: '#fff',
                        padding: '16px 8px 8px 0',
                      }}
                    >
                      <div style={{ display: 'inline-block' }}>
                        {activeKey === 'road' && (
                          <Button
                            icon="unarchive"
                            color="primary"
                            funcType="link"
                            onClick={handleExportPath}
                          >
                            {intl.get('sdat.common.view.button.export').d('导出')}
                          </Button>
                        )}
                      </div>
                      <ToggleBtn
                        style={{ float: 'right' }}
                        toggleList={list()}
                        key="tab1"
                        onSelect={handleModeChange}
                      />
                    </div>
                    {activeKey === 'road' ? (
                      <div
                        style={{
                          height: 'calc(100vh - 180px)',
                          overflow: 'hidden',
                          overflowY: 'scroll',
                        }}
                      >
                        <Table dataSet={qxbListDS} border={false} columns={columns()} />
                      </div>
                    ) : (
                      renderGraphCanvas('supplier-relation-ship-mining')
                    )}
                  </div>
                ) : (
                  <>
                    {statusMap.noQuery ? (
                      <div
                        style={{
                          height: 'calc(100vh - 100px)',
                          display: 'flex',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <img alt="noContent" src={defaultUrl} />
                        {startMsg ? (
                          <div
                            style={{
                              marginTop: '10px',
                              fontSize: '16px',
                              fontWeight: '600',
                              lineHeight: '24px',
                              color: '#0C0E12',
                            }}
                          >
                            {startMsg}
                          </div>
                        ) : null}
                        <div
                          style={{
                            marginTop: '10px',
                            fontSize: '14px',
                            color: '#868D9C',
                            lineHeight: '22px',
                          }}
                        >
                          {alertMsg}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          height: 'calc(100vh - 100px)',
                          display: 'flex',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <img alt="noneSrc" style={{ width: '160px' }} src={noneSrc} />
                        <div
                          style={{
                            fontSize: '16px',
                            color: '#1D2129',
                            fontWeight: '500',
                            lineHeight: '24px',
                            marginTop: '10px',
                          }}
                        >
                          {intl.get('sdat.supplier.view.title.queryNoData').d('未查询到关联关系')}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {hasHisMap ? ( // 有数据
                  <div>
                    <div
                      style={{
                        backgroundColor: '#fff',
                        padding: '16px 8px 8px 0',
                      }}
                    >
                      <div style={{ display: 'inline-block' }}>
                        {activeKey === 'road' && (
                          <>
                            <Button
                              icon="unarchive"
                              color="primary"
                              funcType="flat"
                              onClick={() => handleExportPath('his')}
                            >
                              {intl.get('sdat.common.view.button.export').d('导出')}
                            </Button>
                          </>
                        )}
                      </div>
                      <ToggleBtn
                        style={{ float: 'right' }}
                        toggleList={list()}
                        key="tab2"
                        onSelect={handleModeChange}
                      />
                    </div>
                    {activeKey === 'road' ? (
                      <div
                        style={{
                          height: 'calc(100vh - 180px)',
                          overflow: 'hidden',
                          overflowY: 'scroll',
                        }}
                      >
                        <Spin spinning={loading}>
                          <Table dataSet={hisRoadListDS} border={false} columns={columns()} />
                        </Spin>
                      </div>
                    ) : (
                      renderGraphCanvas('supplier-relation-his-mining')
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      height: 'calc(100vh - 100px)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          textAlign: 'center',
                          height: '40px',
                        }}
                      >
                        <NoContent
                          style={{
                            width: '40px',
                            height: '40px',
                          }}
                        />
                      </div>
                      <div className={styles['chart-no-mining-result']}>
                        {intl.get('sdat.supplier.view.title.noMiningResult').d('无排查结果')}
                      </div>
                      <div className={styles['chart-no-mining-result-msg']}>
                        {intl.get('sdat.supplier.view.title.noMiningResultMsg').d('无排查结果')}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.supplier', 'sdat.common', 'sdat.monitorBusiness'],
})(
  withProps(
    () => {
      const hisRoadListDS = new DataSet(RelationMiningDS()); // 挖掘历史路径列表
      const qxbListDS = new DataSet(RelationMiningDS()); // 启信宝关系挖掘列表吧
      const settingDS = new DataSet(SettingDS()); // 排查设置 DS
      return { hisRoadListDS, qxbListDS, settingDS };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(RelationshipMining)
);
