import React, { useEffect, useCallback } from 'react';
import { Icon, Timeline, Spin, Tooltip } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

import styles from './index.less';
import { useSetState } from '../../../hooks';
import { queryGoodsInfoActions, queryGoodsMappingActions } from './api';

const { Item: TimeItem } = Timeline;

const actionIconMap = {
  NEW: 'add',
  SUBMIT: 'check',
  REVOKE: 'near_me-o',
  APPROVE: 'check',
  REJECT: 'person_pin_circle',
  EC_CONFIRM: 'check_circle',
  RETURNED: 'reply',
  RETURN: 'reply',
  REVERSED: 'near_me-o',
  COMPLETED: 'near_me-o',
  CANCEL: 'cancel',
  CONFIRM: 'check',
  CANCELING: 'cancel',
  WAIT_EXTERNAL_SYSTEM_APPROVING: 'authorize',
  RECALL: 'reply',
  EC_CONFIRM_FAIL: 'near_me-o',
  SYNC: 'near_me-o',
  DOC_FORWARD: 'call_missed_outgoing',
  UPDATE: 'sync',
};

const queryOprDataRequestMap = {
  info: queryGoodsInfoActions,
  mapping: queryGoodsMappingActions,
};

interface GoodsInfoOperationProps {
  type: 'info' | 'mapping',
  queryParams: Record<string, any>,
};

const GoodsInfoOperation = (props: GoodsInfoOperationProps) => {

  const { queryParams = {}, type } = props;


  const [operationState, setOperationState] = useSetState({
    loading: true,
    operationData: [],
  });
  const { loading, operationData } = operationState;

  const getOperationData = useCallback(async () => {
    ;
    const queryOprDataRequest = queryOprDataRequestMap[type];
    const res = getResponse(await queryOprDataRequest(queryParams));
    const newOperationState: Record<string, any> = { loading: false };
    if (res) newOperationState.operationData = res.content || [];
    setOperationState(newOperationState);
  }, [setOperationState, type, queryParams]);

  useEffect(() => {
    getOperationData();
  }, [getOperationData]);

  return (
    <Spin spinning={loading}>
      <div className={styles['ssta-operation-record-invoicedGoods']}>
        {isEmpty(operationData) ? (
          <div className="invoicedGoods-record-empty">
            <span>{intl.get('ssta.common.view.message.noData').d('暂无数据')}</span>
          </div>
        ) : (
          <Timeline className="invoicedGoods-record-timeline">
            {
              operationData.map((item) => {
                const {
                  processUser,
                  processDate,
                  processStatus,
                  processRemark,
                  processStatusMeaning,
                } = item;
                return (
                  <TimeItem color="#E5E5E5">
                    <Icon type={actionIconMap[processStatus] || 'authorize'} className="invoicedGoods-record-action-icon" />
                    <Tooltip placement="topLeft" title={processUser}>
                      <span className="invoicedGoods-record-action-operator">{processUser}</span>
                    </Tooltip>
                    <span className="invoicedGoods-record-action-text">
                      {processStatusMeaning}
                    </span>
                    {processRemark && (
                      <div className="invoicedGoods-record-action-remark">
                        <div className="record-action-remark-label">
                          {intl.get('hzero.common.components.operationAudit.operationRemark').d('操作说明')}
                          :
                        </div>
                        <div className="record-action-remark-value">{processRemark}</div>
                      </div>
                    )}
                    <div className="invoicedGoods-record-action-time">{dateTimeRender(processDate)}</div>
                    <div className="invoicedGoods-record-action-divide" />
                  </TimeItem>
                );
              })
            }
          </Timeline>
        )}
      </div>
    </Spin>
  );
};

export default GoodsInfoOperation;