import React, { memo, useEffect, useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { Tooltip } from 'choerodon-ui';

const unitCodes = [
  'SAGM.SALE_WORKBENCH.DETAIL.INVOICE.TABLE_READONLY',
  'SAGM.SALE_WORKBENCH.DETAIL.INVOICE.TABLE',
];

export const MultiButton = observer(({ children, dataSet, disabled, ...props }) => {
  return (
    <Tooltip
      title={
        dataSet.selected < 1
          ? intl.get('hzero.common.message.selectAtLeastOne').d('请至少选择一条数据')
          : ''
      }
    >
      <Button dataSet={dataSet} disabled={disabled || dataSet.selected < 1} {...props}>
        {children}
      </Button>
    </Tooltip>
  );
});

export default memo(function Invoice(props) {
  const { dataSet, _dataSet, agreementHeaderId, readOnly, refresh, customizeTable } = props;

  useEffect(() => {
    if (agreementHeaderId) {
      dataSet.setQueryParameter('agreementHeaderId', agreementHeaderId);
      dataSet.setQueryParameter('customizeUnitCode', unitCodes[1]);
      dataSet.getField('membelLabelLov').setLovPara('agreementHeaderId', agreementHeaderId);
      dataSet.query();
      dataSet.paging = true;
    }
    if (agreementHeaderId && readOnly) {
      _dataSet.setQueryParameter('agreementHeaderId', agreementHeaderId);
      _dataSet.setQueryParameter('customizeUnitCode', unitCodes[0]);
      _dataSet.getField('membelLabelLov').setLovPara('agreementHeaderId', agreementHeaderId);
      _dataSet.query();
      _dataSet.paging = true;
      _dataSet.selection = false;
    }
  }, [refresh, agreementHeaderId, readOnly]);

  async function handleDelete() {
    const addRecords = dataSet.selected.filter(f => !f.get('invoicingRuleId'));
    const updateRecords = dataSet.selected.filter(f => f.get('invoicingRuleId'));
    if (updateRecords.length > 0) {
      await dataSet.delete(updateRecords).then(res => res && dataSet.remove(addRecords));
    } else {
      dataSet.remove(addRecords);
    }
  }

  const columns = useMemo(
    () =>
      [
        { name: 'membelLabelLov', editor: !readOnly },
        { name: 'invoiceEntityLov', editor: !readOnly },
        { name: 'inventoryLov', editor: !readOnly },
        { name: 'purchaseLov', editor: !readOnly },
      ].filter(f => f.show || !('show' in f)),
    [readOnly]
  );
  const buttons = useMemo(() => {
    if (readOnly) return [];
    return [
      <Button icon="playlist_add" onClick={() => dataSet.create({}, 0)}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <MultiButton icon="delete_sweep" dataSet={dataSet} disabled={readOnly} onClick={handleDelete}>
        {intl.get('sagm.common.button.batchDelete').d('批量删除')}
      </MultiButton>,
    ];
  }, [readOnly]);

  return customizeTable(
    {
      code: readOnly ? unitCodes[0] : unitCodes[1],
    },
    <Table
      dataSet={readOnly ? _dataSet : dataSet}
      columns={columns}
      buttons={buttons}
      style={{ maxHeight: 450 }}
    />
  );
});
