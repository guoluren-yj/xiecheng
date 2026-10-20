/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-12-10 11:00:58
 * @LastEditors: yanglin
 * @LastEditTime: 2021-12-16 19:51:36
 */
import React, { useMemo } from 'react';
import intl from 'utils/intl';
import { Table, DataSet } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';

import { orderDS } from './contactDocumentDS';
// import { statusTagRender } from './render';

const ContactDocument = ({ budgetOccupyId }) => {
  const orderDs = useMemo(() => new DataSet(orderDS(budgetOccupyId)), [budgetOccupyId]);

  const ExecuteNum = observer(({ ds, label }) => {
    return (
      <div
        style={{
          width: '188px',
          display: 'flex',
          justifyContent: 'space-between',
          height: '32px',
          background: '#F5F5F5',
          lineHeight: '22px',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            padding: '8px 10px',
            fontSize: '12px',
            color: 'rgba(0,0,0,0.65)',
            lineHeight: '18px',
            fontWeight: 400,
          }}
        >
          {label}
        </span>
        <span style={{ padding: '5px 10px', fontWeight: 600 }}>
          {ds.toData()[0]?.totalAmount || 0}
        </span>
      </div>
    );
  });

  const columns = React.useMemo(() => {
    return [
      {
        name: 'lastUpdateDate',
        width: 200,
      },
      { name: 'documentTypeMeaning', width: 200 },
      { name: 'documentNum', width: 150 },
      { name: 'operatorName', width: 150 },
      { name: 'finalizedAmount', width: 120 },
      { name: 'quantity', width: 90 },
    ];
  });

  return (
    <div>
      <ExecuteNum
        ds={orderDs}
        label={intl.get(`sbud.budgeting.model.budgeting.orderTotalAmount`).d('订单累计占用金额')}
      />

      <Table dataSet={orderDs} columns={columns} />
    </div>
  );
};

export default compose(
  formatterCollections({
    code: ['sodr.workspace'],
  })
)(ContactDocument);
