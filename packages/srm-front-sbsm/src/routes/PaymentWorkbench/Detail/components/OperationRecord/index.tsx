import React, { useRef, useMemo } from 'react';
import { isArray } from 'lodash';

import intl from 'utils/intl';
import { SRM_SBDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import styles from './index.less';
import HistoryRecord from '../../../../../components/HistoryRecord';
import { OperationIconType } from "../../../../../components/HistoryRecord/enum";

const actionEnum = {
  NEW: { icon: OperationIconType.Add },
  SUBMITTED: { icon: OperationIconType.Submit },
  CANCEL: { icon: OperationIconType.Cancel },
  REVERSED: { icon: OperationIconType.Cancel },
  WORKFLOW_APPROVE: { icon: OperationIconType.Approve },
  WORKFLOW_REJECT: { icon: OperationIconType.Fail },
  BEP_PAY_CONFIRM: { icon: OperationIconType.Confirm },
  BEP_PAY_CANCEL: { icon: OperationIconType.Cancel },
  BEP_PAY_CALLBACK_SUCCESS: { icon: OperationIconType.Payment },
  BEP_PAY_CALLBACK_FAILURE: { icon: OperationIconType.Fail },
  BANK_PAPER_PAY_CONFIRM: { icon: OperationIconType.Confirm },
  BANK_PAPER_PAY_CANCEL: { icon: OperationIconType.Cancel },
  OFFLINE_PAY_CONFIRM: { icon: OperationIconType.Confirm },
  OFFLINE_PAY_CANCEL: { icon: OperationIconType.Cancel },
  REVERSE_WFL_SUCCESS: { icon: OperationIconType.Approve },
  REVERSE_WFL_FAILURE: { icon: OperationIconType.Fail },
};

const fieldsConfig = {
  userName: {
    alias: 'processUserName',
  },
  typeCode: {
    alias: 'processStatus',
  },
  typeName: {
    alias: 'processStatusMeaning',
  },
  time: {
    alias: 'processDate',
  },
  remark: {
    alias: 'processRemark',
  },
};

const basicRender = (record, defaultRender) => {
  const typeCode = record.get('typeCode');
  if (typeCode === 'WORKFLOW_APPROVE') {
    return intl.get('sbsm.paymentWorkbench.view.operationRecord.submitFlowApproved').d('提交工作流审批通过');
  }
  if (typeCode === 'WORKFLOW_REJECT') {
    return intl.get('sbsm.paymentWorkbench.view.operationRecord.submitFlowRejected').d('提交工作流审批拒绝');
  }
  if (typeCode === 'BEP_PAY_CALLBACK_SUCCESS') {
    return intl.get('sbsm.paymentWorkbench.view.operationRecord.externalSystemReturnPayResultSuccess').d('外部系统返回支付结果，结果为【支付成功】');
  }
  if (typeCode === 'BEP_PAY_CALLBACK_FAILURE') {
    return intl.get('sbsm.paymentWorkbench.view.operationRecord.externalSystemReturnPayResultFailure').d('外部系统返回支付结果，结果为【支付失败】');
  }
  if (typeCode === 'REVERSE_WFL_SUCCESS') {
    return intl.get('sbsm.paymentWorkbench.view.operationRecord.reverseFlowApprovedAndStatusToReversed').d('冲销工作流审批通过，支付单状态为【已冲销】');
  }
  if (typeCode === 'REVERSE_WFL_FAILURE') {
    return intl.get('sbsm.paymentWorkbench.view.operationRecord.reverseFlowRejected').d('冲销工作流审批拒绝');
  }
  return defaultRender();

};

const extraRender = (record) => {
  const {
    remark,
    typeCode,
    userName,
    statementHandleMap,
  } = record?.get([
    'remark',
    'typeCode',
    'userName',
    'statementHandleMap',
  ]) || {};
  const labelRender = () => {
    if (['WORKFLOW_REJECT', 'REVERSE_WFL_FAILURE'].includes(typeCode)) {
      return intl.get('sbsm.paymentWorkbench.view.operationRecord.rejectReasonIs').d('拒绝原因：');
    }
    if (typeCode === 'BEP_PAY_CALLBACK_FAILURE') {
      return intl.get('sbsm.paymentWorkbench.view.operationRecord.failureReasonIs').d('失败原因：');
    }
    if (['OFFLINE_PAY_CONFIRM', 'BANK_PAPER_PAY_CONFIRM'].includes(typeCode)) {
      return intl.get('sbsm.paymentWorkbench.view.operationRecord.paymentStatusIs').d('支付情况：');
    }
    if (typeCode === 'REVERSED') {
      return intl.get('sbsm.paymentWorkbench.view.operationRecord.reverseReasonIs').d('冲销原因：');
    }
    return null;
  };
  const remarkRender = () => {
    if (['CANCEL', 'BEP_PAY_CANCEL', 'BANK_PAPER_PAY_CANCEL', 'OFFLINE_PAY_CANCEL'].includes(typeCode)) {
      return intl.get('sbsm.paymentWorkbench.view.operationRecord.payStatusUpdatedToCanceled').d('支付单状态更新为【已取消】');
    }
    if (typeCode === 'WORKFLOW_APPROVE') {
      return intl.get('sbsm.paymentWorkbench.view.operationRecord.payStatusUpdatedToApproved').d('支付单状态更新为【已审核】');
    }
    if (typeCode === 'BEP_PAY_CONFIRM') {
      return intl.get('sbsm.paymentWorkbench.view.operationRecord.userNameInitiatedPay', { userName }).d('{userName}发起支付');
    }
    if (['OFFLINE_PAY_CONFIRM', 'BANK_PAPER_PAY_CONFIRM'].includes(typeCode)) {
      const { PAY_SUCCESS, PAY_CANCEL } = statementHandleMap || {};
      const remarkList: any[] = [];
      if (PAY_SUCCESS) remarkList.push(intl.get('sbsm.paymentWorkbench.view.operationRecord.confirmPayedStatementLineNums', { lineNums: PAY_SUCCESS.join() }).d('确认支付了流水行【{lineNums}】'));
      if (PAY_CANCEL) remarkList.push(intl.get('sbsm.paymentWorkbench.view.operationRecord.cancelPayedStatementLineNums', { lineNums: PAY_CANCEL.join() }).d('取消支付了流水行【{lineNums}】'));
      return remarkList.length > 0? remarkList.join() : null;
    }
    if (typeCode === 'REVERSE_WFL_SUCCESS') {
      return intl.get('sbsm.paymentWorkbench.view.operationRecord.payStatusUpdatedToReversed').d('支付单状态更新为【已冲销】');
    }
    return remark;
  };
  const remarkContent = remarkRender();
  return remarkContent && (
    <div className={styles['operation-item-extra']}>
      <span>{labelRender()}</span>
      <span className={styles['operation-item-remark']}>{remarkContent}</span>
    </div>
  );
};

const onOperationBeforeLoad = ({ data }) => {
  data.forEach(item => {
    const { statementLineList } = item;
    if (isArray(statementLineList)) {
      const statementHandleMap = {};
      statementLineList.forEach(item => {
        const { lineNum, payStatus, reverseBeforeStatus } = item;
        const relPayStatus = reverseBeforeStatus || payStatus;
        if (!statementHandleMap[relPayStatus]) statementHandleMap[relPayStatus] = [];
        statementHandleMap[relPayStatus].push(lineNum);
      });
      item.statementHandleMap = statementHandleMap;
    }
  });
};

interface OperationRecordProps {
  payHeaderId: string | number;
}

const OperationRecord = (props: OperationRecordProps) => {

  const historyRef = useRef<any>();
  const { payHeaderId } = props;

  const operationProps = useMemo(() => {
    return {
      actionEnum,
      primaryKey: 'recordId',
      documentName: intl.get('sbsm.common.view.message.payDoc').d('支付单'),
      fieldsConfig,
      basicRender,
      extraRender,
      readTransport: {
        url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-header-actions/${payHeaderId}/list`,
        method: 'GET',
      } as const,
      onBeforeLoad: onOperationBeforeLoad,
    };
  }, [payHeaderId]);

  const approvalProps = useMemo(() => {
    return {
      categoryLovCode: 'SBSM.APPROVE_CATEGORY',
      readTransport: {
        url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/workflow-approval-history/${payHeaderId}`,
        method: 'GET',
      } as const,
    };
  }, [payHeaderId]);

  return (
    <HistoryRecord
      ref={historyRef}
      approvalProps={approvalProps}
      operationProps={operationProps}
    />
  );

};

export default OperationRecord;