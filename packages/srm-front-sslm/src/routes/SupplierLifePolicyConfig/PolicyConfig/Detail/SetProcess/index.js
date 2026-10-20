/*
 * @Date: 2022-09-24 12:43:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import uuidv4 from 'uuid/v4';
import classnames from 'classnames';
import { forEach, uniqBy, isEmpty } from 'lodash';
import Draggable from 'react-draggable';
import { Spin } from 'choerodon-ui/pro';
import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useRef,
  useMemo,
} from 'react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { queryStageProcess, queryProcessDetail } from '@/services/supplierLifePolicyConfigService';
import StageContent from './StageContent';
import NodeContent from './NodeContent';
import ProcessDetail from './ProcessDetail';
import styles from './index.less';

// 保存所需的所有流程数据
let allProcessDetail = [];

const SetProcess = (
  { remote, stageDataSource, strategyId, onQueryStage, primaryColor, isEdit },
  ref
) => {
  const containerRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  // 是否展开
  const [expansion, setExpansion] = useState(false);
  // 当前流程线
  const [curProcess, setCurProcess] = useState({});
  // 当前流程线详情
  const [curProcessDetail, setCurProcessDetail] = useState({});
  // 当前流程线明细汇总
  const [curProcessDetailSum, setCurProcessDetailSum] = useState({});
  // 当前流程线明细汇总-默认展开页签
  const [defaultActiveKey, setDefaultActiveKey] = useState([]);
  const [resizSize, setResizSize] = useState(null);
  const initialLeftBoxWidth = 400; // 左边区块初始宽度
  const leftBoxMinWidth = 300; // 左边区块最小宽度
  const rightBoxMinWidth = 600; // 右侧区块最小宽度
  const containerWidth = useMemo(() => containerRef.current?.scrollWidth, [containerRef.current]); // 整个容器宽度
  const [leftBoxWidth, setLeftBoxWidth] = useState(initialLeftBoxWidth); // 左侧区块宽度
  // 存储哪些流程已经查询过
  let loadList = {};

  useImperativeHandle(ref, () => ({
    getSaveParams,
    setCurProcess,
    onQuery: (params = {}) =>
      queryProcess({ strategyStageProcId: curProcess.strategyStageProcId, ...params }),
  }));

  // 解决子级只读页面点编辑变更为可编辑时，【明细】隐藏，节点所占宽度未改变
  useEffect(() => {
    setExpansion(false);
  }, [isEdit]);

  // 策略id变更时，重新初始化数据（解决已发布只读界面直接点击编辑生成子级时，id改变，但数据缓存问题）
  useEffect(() => {
    setCurProcess({});
    setExpansion(false);
    setDefaultActiveKey([]);
    setCurProcessDetail({});
    setCurProcessDetailSum({});
    setLeftBoxWidth(initialLeftBoxWidth);
    allProcessDetail = [];
  }, [strategyId]);

  /**
   * 删除当前流程线时，当前流程线置空
   * process 当前流程线
   * deleteProcess 要删除的流程线
   */
  const handleClearProcess = useCallback((process, deleteProcess) => {
    if (process.strategyStageProcId === deleteProcess.strategyStageProcId) {
      setCurProcess({});
    }
  }, []);

  const getSaveParams = useCallback(async () => {
    let validateFlag = true;
    let branchFlag = false;
    forEach(allProcessDetail, process => {
      const { branches: { branchConfigs = [] } = {} } = process;
      forEach(branchConfigs, branchConfig => {
        forEach(branchConfig, item => {
          if (item.nodeType === 'virtual') {
            branchFlag = true;
          } else if (!item.validateFlag) {
            validateFlag = false;
          }
        });
      });
    });
    if (branchFlag) {
      notification.error({
        message: intl.get('sslm.common.view.title.error').d('错误'),
        description: intl
          .get('sslm.supplierLifePolicyConfig.view.branchError.errorMsg')
          .d('分支上必须要有节点'),
      });
      return false;
    }
    if (!validateFlag) {
      notification.error({
        message: intl.get('sslm.common.view.title.error').d('错误'),
        description: intl
          .get('sslm.supplierLifePolicyConfig.view.error.errorMsg')
          .d('请检查是否有必输字段未维护'),
      });
      return false;
    } else {
      forEach(allProcessDetail, processDetail => {
        const { branches: { actionConfig = {}, branchConfigs = [] } = {} } = processDetail;
        // 如果流程上没有节点，后置动作取消勾选（处理有节点的情况下勾选后置动作，后来又把节点删除了）
        const nodeFlag = branchConfigs.some(branchConfig =>
          branchConfig.some(n => n.nodeType === 'node')
        );
        if (!nodeFlag) {
          const newActionConfig = actionConfig;
          newActionConfig.config.actionContinueFlag = 0;
          newActionConfig.config.autoUpgradeFlag = 0;
        }
      });
      return allProcessDetail;
    }
  }, [allProcessDetail]);

  // 处理流程详情数据，使其每个节点都有独立的id
  const dealData = (data, sourceKey) => {
    const {
      startStage,
      endStage,
      strategyStageProcId,
      branches: { actionConfig: { config = {} } = {}, branchConfigs = [] } = {},
    } = data;
    const newBranchConfigs = [];
    forEach(branchConfigs, (branchConfig, branchConfigIndex) => {
      newBranchConfigs[branchConfigIndex] = [];
      forEach(branchConfig, configItem => {
        newBranchConfigs[branchConfigIndex].push({
          ...configItem,
          id: uuidv4(),
          validateFlag: true,
        });
      });
    });
    const processDetail = {
      ...data,
      startStage: { ...startStage, nodeType: 'fixNode', id: uuidv4() },
      endStage: { ...endStage, nodeType: 'fixNode', id: uuidv4() },
      addBranch: {
        nodeType: 'branch',
      },
      branches: {
        actionConfig: {
          id: uuidv4(),
          nodeType: 'action',
          config: {
            ...config,
            stageDescription: intl.get('sslm.common.model.action').d('后置动作'),
          },
        },
        branchConfigs: newBranchConfigs,
      },
    };
    setCurProcessDetail(processDetail);
    // 批量编辑过滤此操作，否则批量编辑时默认查询的流程会被缓存住
    if (sourceKey !== 'batchEdit') {
      loadList = { ...loadList, [strategyStageProcId]: true };
      allProcessDetail = uniqBy([processDetail, ...allProcessDetail], 'strategyStageProcId');
    } else {
      loadList = {};
      allProcessDetail = [processDetail];
    }
    return processDetail;
  };

  // 查询流程明细
  const queryProcess = ({ strategyStageProcId, sourceKey = '', ...rest }) => {
    if (strategyStageProcId) {
      setSpinning(true);
      const processData = queryStageProcess({ strategyStageProcId, ...rest })
        .then(response => {
          const res = getResponse(response);
          if (res) {
            return dealData(res, sourceKey);
          }
        })
        .finally(() => setSpinning(false));
      return processData; // return出去的值供批量编辑使用
    }
  };

  // 查看流程
  const handelVisibleProcess = (curEdgeData = {}) => {
    const { strategyStageProcId = '' } = curEdgeData;
    setCurProcess(curEdgeData);
    // 只读状态下查询明细汇总
    if (curEdgeData.strategyStageProcId && !isEdit) {
      queryProcessDetail({ currentProcId: curEdgeData.strategyStageProcId }).then(response => {
        const res = getResponse(response);
        if (res) {
          // 处理折叠栏默认展开
          const conditionIds = (res.lifeCycleStrategyConditions || []).map(n =>
            String(n.strategyConditionId)
          );
          const nodeIds = (res.lifeCycleStrategyNodes || []).map(n => String(n.strategyNodeId));
          const actionId = String(res.lifeCycleStrategyAction?.strategyActionId);
          const defaultKey = [...conditionIds, ...nodeIds, actionId];
          setCurProcessDetailSum(res);
          setDefaultActiveKey(defaultKey);
        }
      });
    }
    if (!loadList[strategyStageProcId]) {
      queryProcess({ strategyStageProcId });
    } else {
      const newData = allProcessDetail.find(
        item => item.strategyStageProcId === curEdgeData.strategyStageProcId
      );
      setCurProcessDetail(newData);
    }
  };

  // 过滤无节点的流程
  const hanldeFilterStage = useCallback(params => {
    onQueryStage(params);
    setCurProcess({});
  }, []);

  // 拖拽中回调
  const onDrag = useCallback((_, data) => {
    const newLeftBoxWidth = data.x + initialLeftBoxWidth;
    setLeftBoxWidth(newLeftBoxWidth);
  }, []);

  // 拖拽结束回调
  const onDragStop = useCallback((_, data) => {
    setResizSize(data.x);
  }, []);

  // 处理展开、收起
  const handleExpansion = useCallback(() => {
    setExpansion(!expansion);
    setResizSize(!expansion); // 触发画布重新渲染
  }, [expansion]);

  const centerContentWidth = useMemo(() => (expansion ? leftBoxWidth + 300 : leftBoxWidth), [
    expansion,
    leftBoxWidth,
  ]);

  return (
    <div style={{ marginTop: -16 }}>
      <Spin spinning={spinning}>
        <div className={styles.process} ref={containerRef}>
          <div className="process-left" style={{ width: leftBoxWidth }}>
            <StageContent
              isEdit={isEdit}
              curProcess={curProcess}
              primaryColor={primaryColor}
              onVisible={handelVisibleProcess}
              strategyId={strategyId}
              dataSource={stageDataSource}
              onQueryStage={onQueryStage}
              resizSize={resizSize}
              onClear={handleClearProcess}
              onFilter={hanldeFilterStage}
            />
            <Draggable
              axis="x"
              onDrag={onDrag}
              onStop={onDragStop}
              bounds={{
                left: leftBoxMinWidth - initialLeftBoxWidth,
                right: containerWidth - initialLeftBoxWidth - rightBoxMinWidth,
              }}
            >
              <div className="drage-wrap" style={{ marginLeft: initialLeftBoxWidth - 12 }} />
            </Draggable>
          </div>
          <div className="process-right" style={{ width: `calc(100% - ${centerContentWidth}px)` }}>
            <NodeContent
              isEdit={isEdit}
              remote={remote}
              resizSize={resizSize}
              curProcess={curProcess}
              primaryColor={primaryColor}
              dataSource={curProcessDetail}
              handleExpansion={handleExpansion}
            />
          </div>
          {!isEmpty(curProcessDetailSum) && !isEdit && (
            <div className={styles['process-detail-wrap']} id="processDetailWrap">
              <div
                className={classnames('process-detail-content', {
                  'process-detail-content-pick': !expansion,
                })}
              >
                <ProcessDetail
                  dataSource={curProcessDetailSum}
                  defaultActiveKey={defaultActiveKey}
                />
              </div>
              <div
                className={classnames('process-detail-fold', {
                  'process-detail-pick': !expansion,
                })}
                onClick={handleExpansion}
              />
            </div>
          )}
        </div>
      </Spin>
    </div>
  );
};

export default forwardRef(SetProcess);
