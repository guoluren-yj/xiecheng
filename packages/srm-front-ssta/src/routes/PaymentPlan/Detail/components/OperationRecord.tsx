/*
 * @Description: 付款计划操作记录
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-10-31 17:30:16
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React from 'react';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import Operation from '../../../../components/HistoryRecord/OperationRecord';
import { OperationIconType } from '../../../../components/HistoryRecord/enum';

interface OperationRecordProps {
  planNum: string,
}

const actionEnum = {
  NEW: {
    icon: OperationIconType.Add,
  },
};


const OperationRecord = (props: OperationRecordProps) => {

  const { planNum } = props;

  return (
    <Operation
      autoSort
      primaryKey='recordId'
      actionEnum={actionEnum}
      documentName={intl.get(`ssta.paymentPlan.view.title.paymentPlanWhole`).d('付款计划')}
      fieldsConfig={{
        userName: { alias: 'processUserName' },
        typeCode: { alias: 'processTypeCode' },
        typeName: { alias: 'processTypeCodeMeaning' },
        time: { alias: 'processDate' },
      }}
      readTransport={{
        url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/plan-records/${planNum}`,
        method: 'GET',
      }}
    />
  );
};

export default OperationRecord;
