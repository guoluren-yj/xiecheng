/*
 * @Date: 2022-10-08 11:15:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import G6 from '@antv/g6';
import { isEmpty, remove, head, cloneDeep } from 'lodash';
import { Modal, DataSet } from 'choerodon-ui/pro';
import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import notification from 'utils/notification';

import deleteWhiteIcon from '@/assets/lifeConfig/delete-white.svg';
import styles from './index.less';
import NodeForm from './NodeForm';
import ActionForm from './ActionForm';
import ConditionForm from './ConditionForm';
import { stageTooltip, registerShape } from '../utils';
import { conditionDS, nodeDS, actionDS } from './stores/getNodeConfigDS';
import { getAddItemMenuContent, handleData, getNodeConfig } from './utils';

/**
 * @param {readOnly} 是否只读
 * @param {resizSize} 父级容器width变化
 * @param {dataSource} 后端返回的数据源
 * @param {primaryColor} 主题色
 * @param {style} 样式
 * @param {sourceKey} 引入组件的入口
 * @param {handleNodeClick} 点击节点的回调
 */
const Index = (
  {
    remote,
    readOnly = false,
    resizSize,
    dataSource = [],
    primaryColor,
    style,
    sourceKey = '',
    handleNodeClick = () => {},
  },
  customRef
) => {
  const containerRef = useRef(null);
  const nodeRuleRef = useRef(null);

  const nodeDs = useMemo(() => new DataSet(nodeDS()), []);
  const actionDs = useMemo(() => new DataSet(actionDS()), []);
  const conditionDs = useMemo(() => new DataSet(conditionDS()), []);
  const [customGraph, setCustomGraph] = useState(null);
  const [regulationFlag, setRegulationFlag] = useState(false);

  useImperativeHandle(customRef, () => ({
    customGraph,
  }));

  // 新增分支
  const handleAddBranch = (item, graph) => {
    const {
      branches: { branchConfigs },
    } = dataSource;
    const nodeType = 'condition';
    const nodeConfig = getNodeConfig();
    // 默认条件
    const defaultCondition = {
      nodeType,
      _local: true,
      validateFlag: true,
      stageDescription: nodeConfig[nodeType].label,
      config: {
        authManualFlag: 1,
        orderSeq: 1,
        conditionDesc: nodeConfig[nodeType].conditionDesc,
        conditionJson: '{"conditionType":"TRUE"}',
      },
    };
    // 新增分支默认生成判断条件
    const branchList = [
      [
        {
          id: uuidv4(),
          ...defaultCondition,
          config: {
            id: uuidv4(),
            ...defaultCondition.config,
          },
        },
      ],
      [
        {
          id: uuidv4(),
          ...defaultCondition,
          config: {
            id: uuidv4(),
            ...defaultCondition.config,
          },
        },
      ],
    ];
    if (branchConfigs.length === 0) {
      branchConfigs.push(...branchList);
    } else {
      branchConfigs.push(branchList[0]);
    }
    const newList = handleData(dataSource);
    graph.read(newList);
  };

  // 删除分支
  const handleDeleteBranch = (item, graph) => {
    const {
      branches: { branchConfigs },
    } = dataSource;
    const curEdgeIndex = item.getModel()?.childrenIndex;
    remove(branchConfigs, (_, index) => index === curEdgeIndex); // 删除选中分支
    // 如果剩余分支长度为1，且为虚拟分支，则一并删除
    if (branchConfigs.length === 1 && branchConfigs[0][0].nodeType === 'virtual') {
      remove(branchConfigs, value => {
        return value[0].nodeType === 'virtual';
      });
    }
    const newList = handleData(dataSource);
    graph.read(newList);
  };

  // 新增判断条件、节点
  const handleConditionAndNode = useCallback(
    ({ item, graph, type }) => {
      const {
        branches: { branchConfigs },
      } = dataSource;
      const targetNodeData = item.getTarget()?.getModel();
      const { nodeType: targetNodeType, id: targetId } = targetNodeData;
      const nodeConfig = getNodeConfig();
      const curEdge = item.getModel();
      const { edgeNodeType, childrenIndex } = curEdge;
      const nodeId = uuidv4();
      const addNode = {
        id: nodeId,
        nodeType: type,
        validateFlag: false,
        _local: true,
        config: {
          id: nodeId,
          childrenIndex,
        },
        childrenIndex, // 分支序号
        stageDescription: nodeConfig[type].label,
      };
      if (isEmpty(branchConfigs)) {
        branchConfigs[childrenIndex] = [];
        branchConfigs[childrenIndex].push(addNode);
      } else if (edgeNodeType === 'virtual') {
        // 说明是新建出来的边
        if (
          branchConfigs[childrenIndex].length === 1 &&
          branchConfigs[childrenIndex][0].nodeType === 'virtual'
        ) {
          // 说明只有一个虚拟节点
          branchConfigs[childrenIndex] = [];
          branchConfigs[childrenIndex].push(addNode);
        }
      } else if (targetNodeType !== 'action') {
        const curNodeIndex = branchConfigs[childrenIndex].findIndex(node => node.id === targetId);
        if (curNodeIndex !== -1) {
          branchConfigs[childrenIndex].splice(curNodeIndex, 0, addNode);
        }
      } else {
        branchConfigs[childrenIndex].push(addNode);
      }

      const newList = handleData(dataSource);
      graph.read(newList);
    },
    [dataSource, conditionDs]
  );

  // 删除节点
  const hanldeDeleteNode = useCallback(
    (nodeData, graph) => {
      const { childrenIndex, id } = nodeData;
      const {
        branches: { branchConfigs },
      } = dataSource;
      // 先删除选中节点
      remove(branchConfigs[childrenIndex], value => value.id === id);
      // 选中节点删除完以后，判断对应的分支是否为空，若为空，则过滤掉
      if (isEmpty(branchConfigs[childrenIndex])) {
        if (branchConfigs.length === 1) {
          remove(branchConfigs, (_, index) => index === childrenIndex);
        } else {
          branchConfigs[childrenIndex].splice(childrenIndex, 0, {
            id: uuidv4(),
            nodeType: 'virtual', // 虚拟节点
          });
        }
      }
      const newList = handleData(dataSource);
      graph.read(newList);
    },
    [dataSource]
  );

  // 更新数据源中的配置
  const dealDataSource = useCallback(
    (curRecord, nodeData, validateFlag, graph) => {
      const {
        branches: { actionConfig, branchConfigs },
      } = dataSource;
      const { id, childrenIndex } = nodeData;
      const data = curRecord.toData();
      const dataIndex = branchConfigs[childrenIndex].findIndex(item => item.id === id);
      branchConfigs[childrenIndex].splice(dataIndex, 1, {
        ...nodeData,
        validateFlag,
        config: data,
      });
      // isRegulation判断节点配置中，是否含有节点类型为“规则”的节点
      const isRegulation = branchConfigs.some(branchConfig =>
        branchConfig.some(item => item.config && item.config.nodeType === 'REGULATION')
      );
      if (isRegulation && actionConfig.config) {
        // 若isRegulation为true,后置动作勾选且不可编辑
        actionConfig.config.actionContinueFlag = 1;
        actionConfig.config.autoUpgradeFlag = 1;
      }
      setRegulationFlag(isRegulation);
      const newList = handleData(dataSource);
      graph.read(newList);
    },
    [dataSource]
  );

  // 编辑配置弹框确认回调
  const handleEditNodeOk = useCallback(
    async (nodeData, curRecord, graph, dataSet) => {
      const { nodeType } = nodeData;
      const {
        branches: { actionConfig },
      } = dataSource;
      let validateFlag;
      if (nodeType !== 'action') {
        if (nodeRuleRef.current) {
          const {
            paramTableDs,
            conditionRuleDs,
            conditionJsonDs,
            customizeConditionCombinationDs,
          } = nodeRuleRef.current;
          validateFlag =
            (await curRecord.validate()) &&
            (await conditionRuleDs.validate()) &&
            (await conditionJsonDs.validate()) &&
            (await customizeConditionCombinationDs.validate());
          if (validateFlag) {
            const paramTableData = paramTableDs?.toData() || []; // lov-config接口查出的数据
            const conditionData = conditionJsonDs?.toData() || []; // 整个策略配置数据
            const { conditionType } = conditionRuleDs?.current?.toData() || {};
            const { customizeConditionCombination } =
              customizeConditionCombinationDs?.current?.toData() || {};
            const conditionLines =
              conditionType === 'TRUE'
                ? []
                : conditionData.map(condition => {
                    // 处理新增的条件，关闭弹框后在打开，特性值任可选择
                    const fieldDefinition = paramTableData.find(
                      paramData => condition.leftValue === paramData.name
                    );
                    return { ...condition, fieldDefinition };
                  }) || [];
            const params = {
              ...(conditionRuleDs?.current?.toData() || {}),
              conditionLines,
              customizeConditionCombination:
                conditionType === 'TRUE' ? '' : customizeConditionCombination,
            };
            if (conditionType !== 'TRUE' && isEmpty(conditionLines)) {
              validateFlag = false;
              notification.error({
                message: intl
                  .get('sslm.supplierLifePolicyConfig.view.message.atLeastOneRules')
                  .d('至少维护一行策略逻辑'),
              });
              return false;
            }
            curRecord.set('conditionJson', JSON.stringify(params));
            dealDataSource(curRecord, nodeData, validateFlag, graph);
          }
        } else {
          validateFlag = await curRecord.validate();
          if (validateFlag) {
            curRecord.set('conditionJson', JSON.stringify({ conditionType: 'TRUE' }));
            dealDataSource(curRecord, nodeData, validateFlag, graph);
          }
        }
      } else {
        validateFlag = await dataSet?.current?.validate();
        if (validateFlag) {
          const data = dataSet?.current?.toJSONData();
          // eslint-disable-next-line no-param-reassign
          dataSource.branches.actionConfig = { ...actionConfig, config: data };
        }
      }
      return validateFlag;
    },
    [dataSource, nodeRuleRef]
  );

  // 获取编辑配置弹框的children
  const getChildren = useCallback(
    (nodeData, record, dataSet) => {
      const { nodeType } = nodeData;
      switch (nodeType) {
        case 'node':
          return <NodeForm record={record} ref={nodeRuleRef} remote={remote} />;
        case 'condition':
          return <ConditionForm record={record} ref={nodeRuleRef} />;
        case 'action':
          return (
            <ActionForm dataSet={dataSet} regulationFlag={regulationFlag} dataSource={dataSource} />
          );
        default:
          break;
      }
    },
    [regulationFlag, dataSource, remote]
  );

  // 获取当前操作的ds
  const getEditDataSet = useCallback(nodeType => {
    let dataSet;
    switch (nodeType) {
      case 'node':
        dataSet = nodeDs;
        break;
      case 'condition':
        dataSet = conditionDs;
        break;
      case 'action':
        dataSet = actionDs;
        break;
      default:
        break;
    }
    return dataSet;
  }, []);

  // 编辑配置
  const editNodeInfo = useCallback(
    (nodeData, graph) => {
      const { nodeType, id, childrenIndex, config: oldConfig = {} } = nodeData;
      const dataSet = getEditDataSet(nodeType);
      const {
        branches: { actionConfig: { config } = {}, branchConfigs = [] },
      } = dataSource;
      let curRecord;
      const newBranchConfigs = cloneDeep(branchConfigs || []);
      const conditionLine = (newBranchConfigs[childrenIndex] || []).find(
        item => item.nodeType === 'condition'
      );
      const authManualFlag = conditionLine?.config?.authManualFlag; // 是否允许手工发起
      if (nodeType !== 'action') {
        // 指定位置，为了find的时候找到的是最新的数据，解决弹框取消时保留的还是之前的数据
        dataSet.create({ ...oldConfig, id, authManualFlag }, 0);
        curRecord = dataSet?.records?.find(record => {
          return record.get('id') === id;
        });
      } else {
        dataSet.create(config);
      }
      if (['node', 'condition', 'action'].includes(nodeType)) {
        Modal.open({
          key: Modal.key(),
          drawer: true,
          destroyOnClose: true,
          style: { width: nodeType === 'action' ? 380 : 742 },
          title: getNodeConfig()[nodeType].modalTitle,
          children: getChildren(nodeData, curRecord, dataSet),
          onOk: () => handleEditNodeOk(nodeData, curRecord, graph, dataSet),
        });
      }
    },
    [nodeDs, conditionDs, actionDs, dataSource, nodeRuleRef, regulationFlag, remote]
  );

  const addItemMenu = new G6.Menu({
    offsetX: 20,
    offsetY: -10,
    itemTypes: ['node', 'edge'],
    trigger: 'click',
    className: 'add-node-menu',
    getContent(evt) {
      const itemType = evt.item.getType();
      const isNode = itemType === 'node'; // 是否新增分支
      const isEdge = itemType === 'edge'; // 是否是连接开始阶段的边
      const { childrenIndex, sourceNodeType, targetNodeType } = evt.item.getModel() || {};
      const {
        branches: { branchConfigs },
      } = dataSource;
      // 获取各个分支的第一个节点类型
      const firstNodeType = (head(branchConfigs[childrenIndex] || []) || {}).nodeType;
      let sourceEdge = false;
      if (isEdge) {
        sourceEdge =
          evt.item.getSource()?.getModel()?.nodeType === 'fixNode' && branchConfigs.length < 2;
      }
      const menuItem = getAddItemMenuContent({
        isNode,
        sourceEdge,
        firstNodeType,
        sourceNodeType,
        targetNodeType,
      });
      return menuItem;
    },
    shouldBegin: evt =>
      ['add-branch', 'add-branch-text', 'add-item-icon-rect', 'add-item-icon-text'].includes(
        evt.target.get('name')
      ),
    handleMenuClick: (target, item, graph) => {
      const targetId = target.id;
      switch (targetId) {
        case 'condition':
          handleConditionAndNode({ item, graph, type: 'condition' });
          break;
        case 'node':
          handleConditionAndNode({ item, graph, type: 'node' });
          break;
        case 'branch':
          handleAddBranch(item, graph);
          break;
        default:
          break;
      }
    },
  });

  const edgeMenu = new G6.Menu({
    offsetX: 10,
    offsetY: 10,
    itemTypes: ['edge'],
    trigger: 'click',
    className: 'stage-edge-menu',
    getContent() {
      return `<div><img src=${deleteWhiteIcon} alt='' id="delete"></div>`;
    },
    shouldBegin: evt => {
      const virtualFlag = evt.item.getModel()?.edgeNodeType === 'virtual'; // 虚拟边才可删除
      const targetName = !['add-item-icon-rect', 'add-item-icon-text'].includes(
        evt.target.get('name')
      ); // 不是点击+号
      return virtualFlag && targetName;
    },
    handleMenuClick: (target, item, graph) => {
      const targetId = target.id;
      switch (targetId) {
        case 'delete':
          handleDeleteBranch(item, graph);
          break;
        default:
          break;
      }
    },
  });

  useEffect(() => {
    const { current } = containerRef;
    if (!isEmpty(dataSource) && current) {
      registerShape({ primaryColor, dataSource });
      const { parentElement, scrollWidth, scrollHeight } = current;
      const data = handleData(dataSource, scrollWidth);
      const nodeGraph = new G6.Graph({
        container: current,
        width: scrollWidth,
        height: scrollHeight,
        linkCenter: true,
        defaultNode: {
          type: 'process-stage-node',
        },
        defaultEdge: {
          type: readOnly ? 'polyline' : 'condition-edge',
          style: {
            stroke: '#868D9C',
            cursor: 'pointer',
          },
        },
        plugins: [addItemMenu, edgeMenu, stageTooltip(200, 18)],
        modes: {
          default: ['drag-canvas', 'scroll-canvas'],
        },
      });
      setCustomGraph(nodeGraph);
      nodeGraph.read(data);

      if (!readOnly) {
        nodeGraph.on('node:mouseover', evt => {
          nodeGraph.setItemState(evt.item, 'hover', true);
        });
        nodeGraph.on('node:mouseleave', evt => {
          nodeGraph.setItemState(evt.item, 'hover', false);
        });
        nodeGraph.on('edge:mouseover', evt => {
          nodeGraph.setItemState(evt.item, 'hover', true);
        });
        nodeGraph.on('edge:mouseleave', evt => {
          nodeGraph.setItemState(evt.item, 'hover', false);
        });
        nodeGraph.on('node:click', evt => {
          const nodeData = evt.item.getModel();
          const targetName = evt.target.get('name');
          switch (targetName) {
            case 'condition-content':
            case 'desc-rect':
              editNodeInfo(nodeData, nodeGraph);
              break;
            case 'condition-del':
              hanldeDeleteNode(nodeData, nodeGraph);
              break;
            default:
              break;
          }
        });
      }

      if (sourceKey === 'workbench') {
        // 工作台查看
        nodeGraph.on('node:click', evt => {
          const nodeData = evt.item.getModel();
          handleNodeClick(nodeData);
        });
      }

      // 调整画布大小,修复窗口变化时画布大小未变化问题
      const resize = () => {
        if (parentElement && parentElement.offsetParent) {
          nodeGraph.changeSize(parentElement.offsetWidth, parentElement.offsetHeight);
        }
      };
      window.addEventListener('resize', resize);
      return () => {
        nodeGraph.destroy();
        window.removeEventListener('resize', resize);
      };
    }
  }, [resizSize, primaryColor, dataSource, readOnly, regulationFlag, remote]);

  return <div style={style} ref={containerRef} className={styles['node-canvas']} />;
};

export default forwardRef(Index);
