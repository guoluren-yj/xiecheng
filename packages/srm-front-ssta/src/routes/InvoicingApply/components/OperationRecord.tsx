import React, { memo } from 'react';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import styles from '../index.less';

import Operation from '../../../components/HistoryRecord/OperationRecord';
import { OperationIconType } from '../../../components/HistoryRecord/enum';

interface OperationRecordProps {
  applyHeaderId: string,
}

const actionEnum = {
  UPDATE: {
    icon: OperationIconType.Update,
  },
  UPDATE_LINE: {
    icon: OperationIconType.Update,
  },
};


const OperationRecord = (props: OperationRecordProps) => {

  const { applyHeaderId } = props;

  const basicRender = (record) => {
    const { processStatus, processUser, processStatusMeaning } = record.get(['processStatus', 'processUser', 'processStatusMeaning']) || {};
    return (
      <div className={styles['custom-basic-render']}>
        <span>{processUser}</span>
        <span>{processStatusMeaning}</span>
        {processStatus === 'UPDATE' && <span>【{intl.get('ssta.directPoolSupply.view.button.invoiceDoc').d('开票申请单')}】</span>}
      </div>
    );
  };

  const extraRender = (record) => {
    const { processRemark } = record?.get(['processRemark']) || {};
    return (
      <div className={styles['operation-item-extra']}>
        <span className={styles['operation-item-remark']}>{processRemark}</span>
      </div>
    );
  };

  return (
    <Operation
      autoSort
      primaryKey='recordId'
      actionEnum={actionEnum}
      documentName=''
      basicRender={basicRender}
      extraRender={extraRender}
      fieldsConfig={{
        userName: { alias: 'processUser' },
        typeCode: { alias: 'processStatus' },
        typeName: { alias: 'processStatusMeaning' },
        time: { alias: 'processDate' },
      }}
      readTransport={{
        url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/sdim-apply-actions/list?applyHeaderId=${applyHeaderId}`,
        method: 'GET',
      }}
    />
  );
};

export default memo(OperationRecord);
