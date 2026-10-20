import React, { useMemo, useCallback } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import styles from './index.less';

import type { DocType } from '.';
import { batchEditCodeMap } from '.';

interface SelectStepProps {
  selectDs: DataSet;
  documentType: DocType,
  customizeTable: Function,
}

const SelectStep = (props: SelectStepProps) => {

  const { selectDs, documentType, customizeTable } = props;

  const selectedCount = selectDs.selected.length;

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      { name: 'settleNum', width: 200 },
      { name: 'companyName', width: 250 },
      { name: 'supplierCompanyName', width: 250 },
      { name: 'currencyCode', width: 100 },
      (documentType === 'PAYMENT' && { name: 'paymentAmount', width: 120 }) as ColumnProps,
      (documentType === 'PREPAYMENT' && { name: 'prepaymentAmount', width: 120 }) as ColumnProps,
    ];
  }, [documentType]);

  const footer = useCallback(() => {
    return (
      <div className={styles['settle-selected-tips']}>
        {intl.get('ssta.common.view.message.selectedSeveralDataItems', { selectedCount }).d('已勾选 {selectedCount} 条数据')}
      </div>
    );
  }, [selectedCount]);

  return customizeTable(
    { code: batchEditCodeMap[documentType].SELECT },
    <Table
      dataSet={selectDs}
      columns={columns}
      footer={footer}
      style={{ maxHeight: `calc(100% - 50px)` }}
    />
  );
};

export default SelectStep;