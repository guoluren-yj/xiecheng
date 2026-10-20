/*
 * @Date: 2022-11-02 10:24:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import classnames from 'classnames';
import { Spin } from 'choerodon-ui/pro';
import Draggable from 'react-draggable';
import { forEach, isEmpty, head, isObject } from 'lodash';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import {
  searchStageNodes,
  queryStageProcess,
  queryProcessDetail,
  queryProcessNode,
} from '@/services/workbenchService';
import { ReactComponent as NoStrategy } from '@/assets/lifeConfig/no-strategy.svg';
import { dealVirtualLine } from '@/routes/components/SupplierLifeConfig/StageComponent/utils';

import styles from '../../index.less';
import ApplyStage from './ApplyStage';
import ApplyNode from './ApplyNode';
import ApplyDetail from './ApplyDetail';

/**
 * 目前主要用于兼容 策略配置 历史记录的样式问题
 * @param applyStrategyStyle 最外层dev样式
 * @param strategyNodeDetailStyle -- 明细外层包裹的dev样式
 * @param strategyContentStyle -- 明细滚动dev的样式
 */
const Index = ({
  dispatch,
  record,
  primaryColor = '#00B8CC',
  applyStrategyStyle = {},
  strategyNodeDetailStyle = {},
  strategyContentStyle = {},
}) => {
  // 判断是否处于升降级中
  const isUpgradeOrDegrade = record.get('gradeType') ? record.get('gradeType') !== 'NO' : false;
  const containerRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  // 是否展开
  const [expansion, setExpansion] = useState(false);
  // 阶段数据源
  const [stageDataSource, setStageDataSource] = useState([]);
  // 当前流程线
  const [curProcess, setCurProcess] = useState({});
  // 当前流程线详情
  const [curProcessDetail, setCurProcessDetail] = useState({});
  // 当前流程明细
  const [processDetailData, setProcessDetailData] = useState({});
  // 当前流程节点
  const [processNodeData, setProcessNodeData] = useState([]);
  // 明细-默认选择项
  const [activeValue, setActiveValue] = useState('processNode');
  // 存储哪些流程已经查询过
  let loadList = {};
  // 保存所需的所有流程数据
  let allProcessDetail = [];

  const [resizSize, setResizSize] = useState(null);
  const initialLeftBoxWidth = 348; // 左边区块初始宽度
  const leftBoxMinWidth = 300; // 左边区块最小宽度
  const rightBoxMinWidth = 500; // 右侧区块最小宽度
  const containerWidth = useMemo(() => containerRef.current?.scrollWidth, [containerRef.current]); // 整个容器宽度
  const [leftBoxWidth, setLeftBoxWidth] = useState(initialLeftBoxWidth); // 左侧区块宽度

  useEffect(() => {
    handleStage();
  }, []);

  // 查询阶段
  const handleStage = useCallback(() => {
    const { stageId, strategyId, currentProcId } = record.get([
      'stageId',
      'strategyId',
      'currentProcId',
    ]);
    setSpinning(true);
    searchStageNodes({ stageId, strategyId, currentProcId })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const newData = dealVirtualLine(res);
          setStageDataSource(newData);
          if (isUpgradeOrDegrade && head(newData)) {
            // 处于升降级中，则展示当前流程
            const { targetStageProcList = [] } = head(newData);
            const process = targetStageProcList[0];
            handelVisibleProcess(process);
          }
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, [isUpgradeOrDegrade]);

  // 处理流程详情数据，使其每个节点都有独立的id
  const dealData = useCallback(data => {
    const {
      startStage,
      endStage,
      strategyStageProcId,
      branches: { actionConfig: { config = {}, ...actionOthers } = {}, branchConfigs = [] } = {},
    } = data;
    const newBranchConfigs = [];
    forEach(branchConfigs, (branchConfig, branchConfigIndex) => {
      newBranchConfigs[branchConfigIndex] = [];
      forEach(branchConfig, configItem => {
        newBranchConfigs[branchConfigIndex].push({ ...configItem, id: uuidv4() });
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
          config: {
            ...config,
            stageDescription: intl.get('sslm.common.model.action').d('后置动作'),
          },
          ...actionOthers,
        },
        branchConfigs: newBranchConfigs,
      },
    };
    setCurProcessDetail(processDetail);
    allProcessDetail = [...allProcessDetail, processDetail];
    loadList = { ...loadList, [strategyStageProcId]: true };
  }, []);

  // 查看流程
  const handelVisibleProcess = useCallback((curEdgeData = {}) => {
    const { strategyStageProcId = '' } = curEdgeData;
    setCurProcess(curEdgeData);
    if (curEdgeData._local) {
      setProcessDetailData({}); // 虚拟线没有流程明细
      setExpansion(false); // 明细的展开收起设为收起，用于重新计算宽度
      setResizSize(false); // 触发画布重新渲染
    } else {
      if (strategyStageProcId) {
        handleProcessNode(strategyStageProcId);
        handelProcessDetail(strategyStageProcId);
      }
      if (!loadList[strategyStageProcId]) {
        if (strategyStageProcId) {
          setSpinning(true);
          queryStageProcess({ strategyStageProcId })
            .then(response => {
              const res = getResponse(response);
              if (res) {
                dealData(res);
              }
            })
            .finally(() => setSpinning(false));
        }
      } else {
        const newData = allProcessDetail.find(
          item => item.strategyStageProcId === curEdgeData.strategyStageProcId
        );
        setCurProcessDetail(newData);
      }
    }
  }, []);

  // 查询流程明细
  const handelProcessDetail = useCallback(currentProcId => {
    setSpinning(true);
    queryProcessDetail({ currentProcId })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          setProcessDetailData(res);
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  // 查询流程节点
  const handleProcessNode = useCallback(currentProcId => {
    const {
      supplierCompanyId: recordSupplierCompanyId,
      dimensionCode,
      companyId: recordCompanyId,
    } = record.get(['supplierCompanyId', 'dimensionCode', 'companyId']);
    const supplierCompanyId = isObject(recordSupplierCompanyId)
      ? recordSupplierCompanyId.supplierCompanyId
      : recordSupplierCompanyId;
    const companyId = isObject(recordCompanyId) ? recordCompanyId.companyId : recordCompanyId;
    setSpinning(true);
    queryProcessNode({
      currentProcId,
      supplierCompanyId,
      companyId: dimensionCode === 'COMPANY' ? companyId : null,
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const data = res.map(item => ({ ...item, id: uuidv4() }));
          setProcessNodeData(data);
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  //
  const handleSelectBoxChange = useCallback(value => {
    setActiveValue(value);
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

  // 处理展开收起
  const handleExpansion = useCallback(() => {
    setExpansion(!expansion);
    setResizSize(!expansion); // 触发画布重新渲染
  }, [expansion]);

  const strategyRightWidth = expansion
    ? `calc(100% - ${leftBoxWidth}px - 300px)`
    : `calc(100% - ${leftBoxWidth}px)`;

  // 判断当前策略是否有流程线
  const hasProcFlag = stageDataSource.some(data => !isEmpty(data.targetStageProcList));
  return (
    <Spin spinning={spinning}>
      {!hasProcFlag ? (
        <div className={styles['no-strategy']}>
          <div>
            <span className={styles['no-strategy-svg']}>
              <NoStrategy />
            </span>
            <div>{intl.get('sslm.workbench.view.message.noStrategyMsg').d('暂无适用策略')}</div>
          </div>
        </div>
      ) : (
        <div className={styles['apply-strategy']} ref={containerRef} style={applyStrategyStyle}>
          <div className="strategy-left" style={{ width: leftBoxWidth }}>
            <ApplyStage
              resizSize={resizSize}
              curProcess={curProcess}
              primaryColor={primaryColor}
              dataSource={stageDataSource}
              onVisible={handelVisibleProcess}
              isUpgradeOrDegrade={isUpgradeOrDegrade}
            />
          </div>
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
          <div className="strategy-right" style={{ width: strategyRightWidth }}>
            <ApplyNode
              resizSize={resizSize}
              curProcess={curProcess}
              dataSource={curProcessDetail}
              primaryColor={primaryColor}
              isUpgradeOrDegrade={isUpgradeOrDegrade}
              handleExpansion={handleExpansion}
              handleSelectBoxChange={handleSelectBoxChange}
            />
          </div>
          {!isEmpty(processDetailData) && (
            <div className="strategy-node-detail">
              <div
                style={strategyNodeDetailStyle}
                className={classnames('strategy-node-detail-content', {
                  'strategy-node-detail-content-pick': !expansion,
                })}
              >
                <ApplyDetail
                  dispatch={dispatch}
                  activeValue={activeValue}
                  detailDataSource={processDetailData}
                  nodeDataSource={processNodeData}
                  isUpgradeOrDegrade={isUpgradeOrDegrade}
                  strategyContentStyle={strategyContentStyle}
                  handleSelectBoxChange={handleSelectBoxChange}
                />
              </div>
              <div
                className={classnames('strategy-node-detail-fold', {
                  'strategy-node-detail-pick': !expansion,
                })}
                onClick={handleExpansion}
              />
            </div>
          )}
        </div>
      )}
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
})(Index);
