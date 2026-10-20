import React, { useCallback, useRef } from 'react';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import HistoryRecord from '.';
import { OperationIconType } from "./enum";

const actionEnum = {
  NEW: {
    icon: OperationIconType.Add,
  },
  SUBMIT: {
    icon: OperationIconType.Submit,
  },
  RETURN: {
    icon: OperationIconType.Return,
    // text:'退回'
  },
  CANCEL: {
    icon: OperationIconType.Cancel,
    // text:'取消'
  },
  EC_INVOICING: {
    icon: 'near_me-o',
    // text:'电商开票中'
  },
  EC_INVOICE_SUCCESS: {
    icon: 'near_me-o',
    // text:'电商开票成功'
  },

  EC_INVOICE_FAIL: {
    icon: 'cancel',
    // text:'电商开票失败'
  },
  SYNCHRONIZING: {
    icon: 'near_me-o',
    // text:'同步'
  },
  CANCELING: {
    icon: 'cancel',
    // text:'取消中'
  },
  CONFIRM: {
    icon: 'authorize',
    // text:'确认'
  },
  REVOKE: {
    color: 'red',
    icon: 'authorize',
    // text:'审批流程-撤销'
  },
  APPROVE: {
    icon: 'authorize',
    color: 'green',
    // text:'审批流程-通过'
  },
  REJECT: {
    icon: 'authorize',
    // text:'	审批流程-拒绝'
  },
  WITHOUT_SYNC: {
    icon: 'person_pin_circle',
    // text:'	无需同步'
  },
  UNSYNCHRONIZED: {
    icon: 'authorize',
    // text:'未同步'
  },
  SYNC_FAILURE: {
    icon: 'authorize',
    // text:'同步失败'
  },
  SYNC_SUCCESS: {
    icon: 'authorize',
    // text:'同步成功'
  },
  ERP_RETURN: {
    icon: 'reply',
    // text:'退回'
  },
  ERP_CANCELING: {
    icon: 'reply',
    // text:'取消中'
  },
  ERP_CANCEL_FAILURE: {
    icon: 'reply',
    // text:'	取消失败'
  },
  ERP_CANCEL_SUCCESS: {
    icon: 'check_circle',
    // text:'	取消成功'
  },
  RECALL: {
    icon: 'reply',
    // text:'	撤回'
  },
  WAIT_SUPPLIER_CONFIRM: {
    icon: 'authorize',
    // text:'	等待供应商确认'
  },
  DOC_FORWARD: {
    icon: 'call_missed_outgoing',
    // text:'单据转交'
  },
  EXTERNAL_RETURN: {
    icon: 'authorize',
  },
  EXTERNAL_CONFIRM: {
    icon: 'authorize',
    color: 'green',
  },
  DIRECT_CANCEL: {
    icon: OperationIconType.Cancel,
  },
};

const fieldsConfig = {
  userName: {
    alias: 'processUser',
    renderer: (rendererProps, defaultRenderer) => {
      const { record } = rendererProps;
      if (record.get('typeCode') === 'EC_INVOICE_FAIL') {
        return intl.get('ssta.costSheet.view.message.theThirdEcer').d('第三方电商');
      } else {
        return defaultRenderer(rendererProps);
      }
    },
  },
  typeCode: {
    alias: 'processStatus',
  },
  typeName: {
    alias: 'processStatusMeaning',
    renderer: (rendererProps, defaultRenderer) => {
      const { record } = rendererProps;
      const typeCode = record.get('typeCode');
      if (typeCode === 'EC_INVOICE_FAIL') {
        return intl.get('ssta.costSheet.view.message.invoiceFail').d('开票失败了');
      } else if (['RETURN', 'CONFIRM', 'CANCEL'].includes(typeCode)) {
        return intl.get('ssta.costSheet.view.message.approve').d('最终审批了');
      } else {
        return defaultRenderer(rendererProps);
      }
    },
  },
  time: {
    alias: 'processDate',
  },
  remark: {
    alias: 'processRemark',
  },
};

const extraRender = (record, defautRender) => {
  const { typeCode, remark } = record.get(['typeCode', 'remark']);
  if (typeCode === 'EC_INVOICE_FAIL') {
    return intl
      .get(`ssta.costSheet.view.message.faileReason`, { reason: remark })
      .d(`失败原因是{reason}`);
  } else {
    return defautRender(record);
  }
};

const Example = ({ settleHeaderId }) => {

  const historyRef = useRef<any>();

  const basicRender = useCallback((record, defautRender) => {
    const { color, typeCode, processStatusMeaning } = record.get(['color', 'typeCode', 'processStatusMeaning']);
    if (['RETURN', 'CONFIRM', 'CANCEL'].includes(record.get('typeCode'))) {
      return (
        <div style={{ display: 'flex' }}>
          {defautRender(record)}，
          <span>
            {intl.get('ssta.costSheet.model.approvedResult').d('审批结果为')}：
          </span>
          <span style={{ color: typeCode === 'CONFIRM' ? 'green' : 'red' }}>
            【{processStatusMeaning}】
          </span>
        </div>
      );
    } else if (color) {
      return (
        <a style={{ color }} onClick={() => historyRef.current?.setActiveKey('approval')}>
          {record.get('typeName')}
        </a>
      );
    } else {
      return defautRender(record);
    }
  }, []);

  return (
    <HistoryRecord
      ref={historyRef}
      approvalProps={{ documentId: settleHeaderId, documentType: 'SSTA.SETTLE_HEADER' }}
      operationProps={{
        actionEnum,
        extraRender,
        basicRender,
        primaryKey: 'recordId',
        documentName: '结算单',
        fieldsConfig,
        readTransport: {
          url: `/ssta/v1/${getCurrentOrganizationId()}/settle-header-actions/${settleHeaderId}`,
          method: 'GET',
        },
      }}
    />
  );

};

export default Example;