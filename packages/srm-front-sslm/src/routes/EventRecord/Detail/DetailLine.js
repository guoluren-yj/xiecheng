/**
 *
 * @date: 2020/7/21
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React from 'react';
import { Table } from 'choerodon-ui/pro';
import { numberSeparatorRender } from '@/routes/components/Precision/helps';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

const DetailLine = props => {
  const { line, isEdit, customizeTable, isDisabled } = props;
  const button = isEdit && !isDisabled ? ['add', 'delete'] : [];
  const columns = [
    {
      name: 'categoryCode',
      tooltip: 'overflow',
      editor: false,
    },
    {
      name: 'categoryNameLov',
      tooltip: 'overflow',
    },
    {
      name: 'itemCode',
      editor: false,
      tooltip: 'overflow',
    },
    {
      name: 'itemCodeLov',
      tooltip: 'overflow',
    },
    {
      name: 'specification',
      tooltip: 'overflow',
    },
    {
      name: 'model',
      tooltip: 'overflow',
    },
    {
      name: 'uomIdLov',
      tooltip: 'overflow',
    },
    {
      name: 'quantity',
      tooltip: 'overflow',
      editor: record =>
        isEdit &&
        !isDisabled && <C7nPrecisionInputNumber name="quantity" record={record} uom="uomId" />,
      renderer: ({ record, value }) => numberSeparatorRender(value, record.getState('precision')),
    },
    {
      name: 'remark',
      tooltip: 'always',
    },
  ].map(item => ({
    editor: isEdit && !isDisabled,
    ...item,
  }));
  return customizeTable(
    {
      code: 'SSLM.EVALUATION_EVENT_RECORD.DETAIL.LINE_TABLE',
      readOnly: !isEdit || isDisabled,
    },
    <Table
      buttons={button}
      dataSet={line}
      columns={columns}
      selectionMode={isEdit ? 'rowbox' : 'none'}
    />
  );
};

export default DetailLine;
