/*
 * @Description: 寻源费用操作记录
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-10-31 17:30:16
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { useEffect, useCallback, useMemo } from 'react';
import { Spin, Icon, Tooltip } from 'choerodon-ui/pro';
import { Timeline } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { useSetState } from '../../../../hooks';
import { queryTenderOperation, queryDepositOperation, queryServiceOperation } from '../../utils/api';
import styles from './index.less';

interface OperationRecordProps {
  tenderFeesId?: string | number,
  depositId?: string | number,
  serverFeesId?: string | number,
}

const { Item: TimeItem } = Timeline;
const actionColorMap = {};
const actionIconMap = {
  // 已作废
  INVALID: 'cancel',
  // 已生效
  EFFECTIVE: 'verified_user-o',
  // 未缴纳
  NO_PAY: 'access_alarms',
  // 缴纳中
  PAYING: 'schedule',
  // 已缴纳
  PAID: 'check_circle',
  // 已退款
  REFUNDED: 'check_circle',
  // 缴纳失败
  PAY_FAIL: 'cancel',
  // 退款中
  REFUNDING: 'reply',
  // 退款失败
  REFUND_FAIL: 'cancel',
  // 未开票
  NO_INVOICE: 'access_alarms',
  // 开票中
  INVOICING: 'test_planning',
  // 开票失败
  INVOICE_FAIL: 'cancel',
  // 已开票
  INVOICED: 'check_circle',
  // 退票中
  RETURN_INVOICING: 'reply',
  // 退票失败
  RETURN_INVOICE_FAIL: 'cancel',
  // 已退票
  RETURN_INVOICED: 'check_circle',
  // 审批流程-撤销
  REVOKE: 'reply',
  // 审批流程-通过
  APPROVE: 'check_circle',
  // 审批流程-拒绝
  REJECT: 'cancel',
  // 发起转出
  TRANSFER_START: 'publish2',
  // 转出成功
  TRANSFER_SUCCESS: 'check_circle',
  // 转出失败
  TRANSFER_FAIL: 'cancel',
};

const OperationRecord = (props: OperationRecordProps) => {

  const { tenderFeesId, depositId, serverFeesId } = props;

  const [operationState, setOperationState] = useSetState({
    loading: true,
    operationData: [],
  });

  const { loading, operationData } = operationState;

  const docData = useMemo<Record<string, any>>(() => {
    const docDataList = [
      [
        tenderFeesId,
        queryTenderOperation,
        'tenderOperateRecordId',
        intl.get(`ssta.sourcingCost.view.title.tenderFileFee`).d('招标文件费'),
      ],
      [
        depositId,
        queryDepositOperation,
        'depositOperateRecordId',
        intl.get(`ssta.sourcingCost.view.title.securityDeposit`).d('保证金'),
      ],
      [
        serverFeesId,
        queryServiceOperation,
        'serverOperateRecordId',
        intl.get(`ssta.sourcingCost.view.title.serviceFee`).d('服务费'),
      ],
    ];
    const [docKey, requertFunc, keyName, docName] = docDataList.find(([docKey]) => Boolean(docKey)) || [];
    return { docKey, requertFunc, keyName, docName };
  }, [tenderFeesId, depositId, serverFeesId]);

  const getOperationData = useCallback(async () => {
    if (isEmpty(docData)) return;
    const { docKey, requertFunc } = docData;
    const res = getResponse(await requertFunc(docKey));
    const newOperationState: Record<string, any> = { loading: false };
    if (res) newOperationState.operationData = res.content || [];
    setOperationState(newOperationState);
  }, [setOperationState, docData]);

  useEffect(() => {
    getOperationData();
  }, [getOperationData]);

  const { keyName, docName } = docData;

  return (
    <Spin spinning={loading}>
      <div className={styles['ssta-operation-record-sourcingCost']}>
        {isEmpty(operationData) ? (
          <div className="sourcingCost-record-empty">
            <span>{intl.get('ssta.common.view.message.noData').d('暂无数据')}</span>
          </div>
        ) : (
          <Timeline className="sourcingCost-record-timeline">
            {
              operationData.map((item) => {
                const {
                  processDate,
                  processRemark,
                  processUserName,
                  processStatus,
                  processStatusMeaning,
                  [keyName]: feeOperateRecordId,
                } = item;
                return (
                  <TimeItem key={feeOperateRecordId} color={actionColorMap[processStatus] || '#E5E5E5'}>
                    <Icon type={actionIconMap[processStatus] || 'authorize'} className="sourcingCost-record-action-icon" />
                    <div className="sourcingCost-record-action-content">
                      <Tooltip placement="topLeft" title={processUserName}>
                        <span className="sourcingCost-record-action-operator">{processUserName}</span>
                      </Tooltip>
                      <span className="sourcingCost-record-action-text">
                        {intl.get('ssta.common.view.message.alreadyOperated', { operationName: processStatusMeaning }).d('{operationName}了')}
                      </span>
                      <span className="sourcingCost-record-action-doc">
                        【{docName}】
                      </span>
                      {processRemark && (
                        <div className="sourcingCost-record-action-remark">
                          <div className="record-action-remark-label">
                            {intl.get('hzero.common.components.operationAudit.operationRemark').d('操作说明')}
                            ：
                          </div>
                          <div className="record-action-remark-value">{processRemark}</div>
                        </div>
                      )}
                      <div className="sourcingCost-record-action-time">{processDate}</div>
                      <div className="sourcingCost-record-action-divide" />
                    </div>
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

export default OperationRecord;