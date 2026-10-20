/*
 * @Description: 发票头操作记录
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-10-31 17:30:16
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { useEffect, useCallback } from 'react';
import { Spin, Icon, Tooltip } from 'choerodon-ui/pro';
import { Timeline } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

import { queryInvoiceOperation } from './api';
import { useSetState } from '../../../../hooks';
import styles from './index.less';

const { Item: TimeItem } = Timeline;

const actionIconMap = {
  CANCEL: 'cancel', // 新建
  PC_CREATE: 'how_to_vote-o', // 变更
  UPLOAD_ATTACHMENT: 'attach_file', // 取消
};

interface OperationRecordProps {
  invoiceHeaderId: string | number,
}

const OperationRecord = (props: OperationRecordProps) => {

  const { invoiceHeaderId } = props;

  const [operationState, setOperationState] = useSetState({
    loading: true,
    operationData: [],
  });

  const { loading, operationData } = operationState;

  const getOperationData = useCallback(async () => {
    const res = getResponse(await queryInvoiceOperation(invoiceHeaderId));
    const newOperationState: Record<string, any> = { loading: false };
    if (res) newOperationState.operationData = res.content || [];
    setOperationState(newOperationState);
  }, [setOperationState, invoiceHeaderId]);

  useEffect(() => {
    getOperationData();
  }, [getOperationData]);

  return (
    <Spin spinning={loading}>
      <div className={styles['ssta-operation-record-invoice']}>
        {isEmpty(operationData) ? (
          <div className="invoice-record-empty">
            <span>{intl.get('ssta.common.view.message.noData').d('暂无数据')}</span>
          </div>
        ) : (
          <Timeline className="invoice-record-timeline">
            {
              operationData.map((item) => {
                const {
                  recordId,
                  processUser,
                  processDate,
                  processStatus,
                  processRemark,
                  invoiceImportMethod,
                  processStatusMeaning,
                  invoiceImportMethodMeaning,
                } = item;
                return (
                  <TimeItem color="#E5E5E5" key={recordId}>
                    <Icon type={actionIconMap[processStatus] || 'autorenew'} className="invoice-record-action-icon" />
                    <Tooltip placement="topLeft" title={processUser}>
                      <span className="invoice-record-action-operator">{processUser}</span>
                    </Tooltip>
                    <span className="invoice-record-action-text">
                      {intl.get('ssta.common.view.message.alreadyOperated', { operationName: processStatusMeaning }).d('{operationName}了')}
                    </span>
                    <span className="paymentPlan-record-action-doc">
                      【
                      {['CREATE_LINE', 'DELETE_LINE', 'UPDATE_LINE'].includes(processStatus)
                        ? intl.get(`ssta.common.view.message.invoiceLine`).d('发票行')
                        : intl.get('ssta.common.view.message.invoice').d('发票')}
                      】
                    </span>
                    {processRemark && (
                      <div className="invoice-record-action-remark">
                        <div className="record-action-remark-label">
                          <Tooltip placement="topLeft" title={processUser}>
                            <span>{processUser}</span>
                          </Tooltip>
                          <span className="invoice-record-action-text">
                            {intl.get('ssta.common.view.message.remarked').d('备注了')}
                          </span>
                          <span>{processRemark}</span>
                        </div>
                      </div>
                    )}
                    {invoiceImportMethod && (
                      <div className="invoice-record-action-remark">
                        <span className="record-action-remark-label">
                          {intl.get('ssta.common.model.invoice.importType').d('导入方式')}
                          :
                          {invoiceImportMethodMeaning}
                        </span>
                      </div>
                    )}
                    <div className="invoice-record-action-time">{dateTimeRender(processDate)}</div>
                    <div className="invoice-record-action-divide" />
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
