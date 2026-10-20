/**
 * DocInfo
 * 单据流单据信息 - 执行进度
 * @date: 2021-11-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useState } from 'react';
import { Icon } from 'choerodon-ui';
import { Spin } from 'choerodon-ui/pro';
import { Icon as HzeroIcon } from 'hzero-ui';
import classnames from 'classnames';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { queryNodeProcess } from './docFlowService';

interface ProgressProps {
  nodeDataId: string;
  currentOrganizationId: number;
}


// SplitStoreType interface
interface SplitStoreType {
  type: string;
  data: any[];
}

function Progress(props: ProgressProps) {
  const { nodeDataId, currentOrganizationId } = props;
  const [processLoading, handleProcessLoading] = useState(true);
  const [processData, setProcessData] = useState([]);

  useEffect(() => {
    queryNodeProcess({
      nodeDataId,
      currentOrganizationId,
    })
      .then((res) => {
        if (getResponse(res)) {
          setProcessData(res);
        }
      })
      .finally(() => handleProcessLoading(false));
  }, []);

  /**
   * 渲染表格行
   * @param tableData 表格数据
   * @param dataType 数据类型
   * @returns
   */
  const renderProgressTable = (tableData, dataType) => {
    let classColor: string | null = null;
    let statusTitle = null;
    switch (dataType) {
      case 'FINISH':
        classColor = 'green';
        statusTitle = intl.get('component.docFlow.view.docInfo.progress.finish').d('完成');
        break;
      case 'BEGIN':
        classColor = 'blue';
        statusTitle = intl.get('component.docFlow.view.docInfo.progress.begin').d('开始处理');

        break;
      case 'PROCESS':
        classColor = 'yellow';
        statusTitle = intl.get('component.docFlow.view.docInfo.progress.process').d('处理中');
        break;
      case 'CANCEL':
          classColor = 'grey';
          statusTitle = intl.get('component.docFlow.view.docInfo.progress.canceled').d('已取消');
        break;
      default:
        classColor = 'grey';
        statusTitle = intl.get('component.docFlow.view.docInfo.progress.exception').d('异常节点');
        break;
    }
    return (
      <div className={classnames('progress-table', `progress-table-${classColor}`)}>
        <div className="progress-table-left">{statusTitle}</div>
        <div className="progress-table-right">
          {tableData.map((data) => {
            return (
              <div className="progress-table-right-row">
                <div className="progress-table-right-row-content">
                  <div className="content-icon" style={{ background: data.iconColor || '#47b881' }}>
                    <Icon type={data.icon || 'account_tree'} />
                  </div>
                  <div className="content-info">
                    <div className="info-title">
                      <span>{data.actionSummary || ' '}</span>
                      {
                        data.residenceTime && (
                          <span className='info-title-deadline'>
                            <HzeroIcon type="clock-circle-o" />
                            {data.residenceTime}
                          </span>
                        )
                      }
                    </div>
                    <div className="info-content">
                      <span className="operator">{data.operator}</span>
                      <span className="action-description">{data.actionDescription}</span>
                      <span className="node-type-name">【{data.documentName}】</span>
                    </div>
                  </div>
                </div>
                <div className="progress-table-right-row-date">{data.createDate}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * 切割处理渲染流程
   * 循环判断如果前一个状态为 stage 的已经存在，就对数据进行push，如果不存在，说明没有进行 splitStore 的创建，创建然后添加数据。
   * @param nodeProcess 节点流程
   * @returns
   */
  const splitAndRenderProcess = (nodeProcess) => {
    const splitStore = [] as SplitStoreType[];
    for (let i = 0; i < nodeProcess.length; i++) {
      if (
        splitStore.length > 0 &&
        splitStore[splitStore.length - 1].type === nodeProcess[i].stage
      ) {
        splitStore[splitStore.length - 1].data.push(nodeProcess[i]);
      } else {
        splitStore.push({
          type: nodeProcess[i].stage,
          data: [nodeProcess[i]],
        });
      }
    }
    return splitStore.map((store) => renderProgressTable(store.data, store.type));
  };

  const renderProcess = (nodeProcess) => {
    const ProgressHeader = (
      <div className="progress-table-header">
        <span>
          {intl.get('component.docFlow.view.docInfo.progress.table.title.process').d('处理进度')}
        </span>
        <span>
          {intl.get('component.docFlow.view.docInfo.progress.table.title.status').d('动作')}
        </span>
        <span>
          {intl.get('component.docFlow.view.collapse.action.createDate').d('执行时间')}
        </span>
      </div>
    );
    const isEmpty = nodeProcess.length <= 0;
    return (
      <>
        {ProgressHeader}
        {isEmpty ? (
          <div className="progress-table-empty">
            {intl.get('component.docFlow.Table.emptyText').d('暂无数据')}
          </div>
        ) : (
          splitAndRenderProcess(nodeProcess)
        )}
      </>
    );
  };

  return (
    <div className="doc-flow-info-modal-progress">
      <Spin spinning={processLoading}>
        <div className="modal-group-head-title">
          <span>{intl.get('component.docFlow.view.docInfo.tab.docProcess').d('处理进度')}</span>
        </div>
        {renderProcess(processData)}
      </Spin>
    </div>
  );
}

export default Progress;
