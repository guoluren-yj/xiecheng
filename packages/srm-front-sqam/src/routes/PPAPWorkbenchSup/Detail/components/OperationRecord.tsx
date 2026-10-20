import React, { useEffect, useCallback } from 'react';
import { Spin, Icon, Tooltip } from 'choerodon-ui/pro';
import { Timeline } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import styles from '../../../PPAPWorkbench/Detail/index.less';
import { useSetState } from '../../../PPAPTemplate/utils/utils';
import { fetchDetailRecord } from '../../utils/api';

const { Item: TimeItem } = Timeline;

const actionColorMap = {

};

const actioniconMap = {
  NEW: 'add', // 新建
  CHANGE: 'mode_edit', // 变更
  CANCEL: 'cancel', // 取消
  ALTER: 'mode_edit',
  CLOSED: 'not_interested',
  PUBLISH: 'publish2',
  IN_PROGRESS: 'finished',
  COMPLETED: 'check_circle',
  SUBMITTED: 'check',
  CLOSE: 'not_interested',
};

interface OperationRecordProps {
  id: string,
  type: string,
}

const OperationRecord = (props: OperationRecordProps) => {

  const { id, type } = props;

  const [operationState, setOperationState] = useSetState({
    loading: true,
    operationData: [],
  });

  const { loading, operationData } = operationState;

  const getOperationData = useCallback(async () => {
    if (!id) return;
    const res = getResponse(await fetchDetailRecord(id, type));
    const newOperationState: Record<string, any> = { loading: false };
    if (res) newOperationState.operationData = res.content || [];
    setOperationState(newOperationState);
  }, [setOperationState, id, type]);

  useEffect(() => {
    getOperationData();
  }, [getOperationData]);

  const formatRenderRemark = useCallback(item => {
    const { processRemark, processStatus } = item;
    if (processStatus === 'ALTER' && processRemark) {
      return (
        <div className="reamks">
          <span className="operator gray_remarks">
            {intl.get('sqam.ppap.model.template.alterRemark').d('变更意见')}:
          </span>
          <span className="result gray_remarks">{processRemark}</span>
        </div>
      );
    }
    return null;
  }, []);

  return (
    <Spin spinning={loading}>
      <div className={styles['sqam-operation-record']}>
        {isEmpty(operationData) ? (
          <div className="record-empty">
            <span>{intl.get('sqam.ppap.view.message.noData').d('暂无数据')}</span>
          </div>
        ) : (
          <Timeline className="record-timeline">
            {operationData.map(item => {
              const { processDate, processUserName, processStatus, processStatusMeaning } = item;
              return (
                <TimeItem color={actionColorMap[processStatus] || '#E5E5E5'}>
                  <Icon
                    type={actioniconMap[processStatus] || 'authorize'}
                    className="record-icon"
                  />
                  <Tooltip placement="topLeft" title={processUserName}>
                    <span className="record-action-operator">{processUserName}</span>
                  </Tooltip>
                  <span className="record-action-text">
                    {intl
                      .get('sqam.ppap.view.message.alreadyOperated', {
                        operationName: processStatusMeaning,
                      })
                      .d('{operationName}了')}
                  </span>
                  <span className="record-action-doc">
                    【{intl.get('sqam.ppap.view.title.ppap').d('PPAP')}】
                  </span>
                  {formatRenderRemark(item)}
                  <div className="record-action-time">{processDate}</div>
                  <div className="record-action-divide" />
                </TimeItem>
              );
            })}
          </Timeline>
        )}
      </div>
    </Spin>
  );
};

export default OperationRecord;
