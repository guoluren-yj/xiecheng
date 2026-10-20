/*
 * @Date: 2022-11-28 15:21:55
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { head, isEmpty } from 'lodash';
import Draggable from 'react-draggable';
import { Spin } from 'choerodon-ui/pro';
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import ZoomToolbar from '@/routes/components/ZoomToolbar';
import { batchQueryProcess } from '@/services/supplierLifePolicyConfigService';
import StageComponent from '@/routes/components/SupplierLifeConfig/StageComponent';
import styles from '../SetProcess/index.less';
import NodeContent from '../SetProcess/NodeContent';

const sourceKey = 'batchEdit';

const Detail = ({ strategyId, primaryColor, processRef, batchProcIds, checkedValue }) => {
  const containerRef = useRef(null); // 包裹容器ref
  const customRef = useRef(null); // 阶段ref
  const [spinning, setSpinning] = useState(false);
  const [nodeDataSource, setNodeDataSource] = useState({}); // 节点数据源
  const [stageDataSource, setStageDataSource] = useState([]); // 阶段数据源
  const [curProcess, setCurProcess] = useState({}); // 默认流程 用于查询初始流程节点

  // 拖拽相关属性
  const [resizSize, setResizSize] = useState(null);
  const initialLeftBoxWidth = 400; // 左边区块初始宽度
  const leftBoxMinWidth = 300; // 左边区块最小宽度
  const rightBoxMinWidth = 600; // 右侧区块最小宽度
  const containerWidth = useMemo(() => containerRef.current?.scrollWidth, [containerRef.current]); // 整个容器宽度
  const [leftBoxWidth, setLeftBoxWidth] = useState(initialLeftBoxWidth); // 左侧区块宽度

  useEffect(() => {
    // 处理画布数据源
    setSpinning(true);
    batchQueryProcess({ strategyId, procIds: batchProcIds })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          handleCurrentProc(res); // 处理当前流程节点
          const dataSource = res.map(item => ({
            ...item,
            id: item.stageCode,
            label: item.stageDescription,
          }));
          setStageDataSource(dataSource);
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, [resizSize, batchProcIds]);

  // 处理当前流程节点 - 默认取第一个流程
  const handleCurrentProc = useCallback(
    async dataList => {
      const processStage = dataList.find(data => !isEmpty(data.targetStageProcList));
      if (!isEmpty(processStage)) {
        const { targetStageProcList } = processStage;
        const defaultProcess = head(targetStageProcList) || {};
        setCurProcess(defaultProcess);
        const { strategyStageProcId } = defaultProcess;
        const data = await processRef.current.onQuery({ strategyStageProcId, sourceKey });
        if (data) {
          const { endStage, startStage } = data;
          const dataSource = {
            ...data,
            endStage:
              checkedValue === 'initialStage'
                ? {
                    ...endStage,
                    stageDescription: intl
                      .get('sslm.supplierLifePolicyConfig.view.leftContent.targetStage')
                      .d('目标阶段'),
                  }
                : endStage,
            startStage:
              checkedValue === 'initialStage'
                ? startStage
                : {
                    ...startStage,
                    stageDescription: intl
                      .get('sslm.supplierLifePolicyConfig.view.batchEdit.initialStage')
                      .d('初始阶段'),
                  },
          };
          setNodeDataSource(dataSource);
        }
      }
    },
    [checkedValue]
  );

  // 拖拽中回调
  const onDrag = useCallback((_, data) => {
    const newLeftBoxWidth = data.x + initialLeftBoxWidth;
    setLeftBoxWidth(newLeftBoxWidth);
  }, []);

  // 拖拽结束回调
  const onDragStop = useCallback((_, data) => {
    setResizSize(data.x);
  }, []);

  return (
    <Spin spinning={spinning}>
      <div
        ref={containerRef}
        className={styles.process}
        style={{ minHeight: 'calc(100vh - 112px)', marginTop: 0, overflow: 'hidden' }}
      >
        <div className="process-left" style={{ width: leftBoxWidth }}>
          <div className={styles['process-stage']}>
            {intl.get('sslm.common.view.stage').d('阶段')}
            <ZoomToolbar customRef={customRef} />
          </div>
          <StageComponent
            readOnly
            highlight
            ref={customRef}
            resizSize={resizSize}
            strategyId={strategyId}
            dataSource={stageDataSource}
            curProcess={curProcess}
            primaryColor={primaryColor}
            style={{ height: 'calc(100vh - 168px)', padding: '0 16px' }}
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
        <div className="process-right" style={{ width: `calc(100% - ${leftBoxWidth}px)` }}>
          <NodeContent
            curProcess={curProcess}
            primaryColor={primaryColor}
            dataSource={nodeDataSource}
            resizSize={resizSize}
            sourceKey={sourceKey}
          />
        </div>
      </div>
    </Spin>
  );
};

export default Detail;
