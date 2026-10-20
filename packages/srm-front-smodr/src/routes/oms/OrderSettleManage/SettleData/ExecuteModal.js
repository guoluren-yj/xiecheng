import React, { useMemo, useEffect, useState } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import HeadLine from '@/routes/components/HeadLine';
import intl from 'utils/intl';

import { statementDs, invoiceDs } from './settleDs';
import styles from './modal.less';

function ExecuteModal(props) {
  const { recordData } = props;
  const [value, setValue] = useState(recordData);
  const statementDS = useMemo(() => new DataSet(statementDs(recordData?.settlementEntryId)), [
    recordData.settlementEntryId,
  ]);
  const invoiceDS = useMemo(() => new DataSet(invoiceDs(recordData?.settlementEntryId)), [
    recordData.settlementEntryId,
  ]);
  const statmentColumns = useMemo(
    () => [
      { name: 'statementsStatusMeaning' },
      { name: 'statementsCode' },
      { name: 'ecStatementsCode' },
      { name: 'quantityMeaning' },
      { name: 'lastUpdateDate' },
    ],
    []
  );
  const invoiceColumns = useMemo(
    () => [
      { name: 'requestStatusMeaning' },
      { name: 'applicationNo' },
      { name: 'srmApplicationNo' },
      { name: 'quantityMeaning' },
      { name: 'lastUpdateDate' },
    ],
    []
  );

  useEffect(() => {
    setValue(recordData);
  }, [recordData.settlementEntryId]);
  return (
    <div className={styles['execute-modal-content']}>
      <div className="execute-modal-right">
        <div className="execute-right-content">
          <div className="execute-right-top">
            <div className="execute-right-img">
              <img src={value?.primaryUrl} alt="" width={80} height={80} />
            </div>
            <div className="execute-right-label">
              <div className="execute-right-title">{1}</div>
              <div className="execute-right-code">
                {intl.get('smodr.settle.model.orderCode').d('商城订单编码')}：{value?.orderCode}
              </div>
              <div className="execute-right-sku">
                {intl.get('smodr.settle.model.skuCode').d('商品编码')}：{value?.skuCode}
              </div>
            </div>
          </div>
          <HeadLine title={intl.get('smodr.settle.model.statementBlock').d('对账模块')} />
          <Table dataSet={statementDS} columns={statmentColumns} />
          <HeadLine title={intl.get('smodr.settle.model.inviceBlock').d('开票模块')} />
          <Table dataSet={invoiceDS} columns={invoiceColumns} />
        </div>
      </div>
    </div>
  );
}

export default ExecuteModal;
