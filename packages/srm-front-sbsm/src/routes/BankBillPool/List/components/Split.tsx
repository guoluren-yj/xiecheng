import React, { Fragment, useMemo, useEffect, useCallback } from 'react';
import { Form, Table, DataSet, TextField, NumberField, Select } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import type { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { billPoolHandle } from '../../utils/api';
import { SplitCustCode } from '../../utils/type';
import { headerDS } from '../../Detail/stores/detailDS';
import { getSelectedNegActConfirmMsg } from '../../../../utils/utils';

interface SplitProps {
  topRecord: DSRecord;
  okCallback: () => void;
}

const Split = withCustomize({
  unitCode: [ SplitCustCode ],
})((props) => {

  const { modal, topRecord, okCallback, customizeTable } = props;

  const splitListDs = useMemo(() => new DataSet(headerDS()), []);

  const handleOk = useCallback(async () => {
    if (splitListDs.totalCount < 1) return true;
    const validRes = await splitListDs.validate();
    if (!validRes) return false;
    const res = await billPoolHandle('split', {
      body: { ...topRecord.toJSONData(), splitBankPaperList: splitListDs.toJSONData()},
      query: { customizeUnitCode: SplitCustCode },
    });
    if (!res) return false;
    if (okCallback) okCallback();
  }, [topRecord, splitListDs, okCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk]);

  const paperSystemStatusOptionsFilter = useCallback((record) => {
    return ['NEW', 'NO_NEED_USE'].includes(record.get('value'));
  }, []);

  const columns = useMemo(() => [
    { name: 'paperNum', editor: true, width: 150 },
    { name: 'companyLov', editor: true, width: 150 },
    { name: 'companyName', width: 150 },
    { name: 'dataSource', editor: true, width: 150 },
    { name: 'paperType', editor: true, width: 150 },
    { name: 'paperStatus', editor: true, width: 150 },
    { name: 'paperSystemStatus', editor: <Select optionsFilter={paperSystemStatusOptionsFilter} />, width: 150 },
    { name: 'bankName', editor: true, width: 150 },
    { name: 'drawer', editor: true, width: 150 },
    { name: 'acceptor', editor: true, width: 150 },
    { name: 'payer', editor: true, width: 150 },
    { name: 'invoiceDate', editor: true, width: 150 },
    { name: 'issueDate', editor: true, width: 150 },
    { name: 'draftsDeadLine', editor: true, width: 150 },
    { name: 'paperAmount', editor: true, width: 150 },
  ], [paperSystemStatusOptionsFilter]);

  const handleAddLine = useCallback(() => {
    splitListDs.create({}, 0);
  }, [splitListDs]);

  const handleDeleteLine = useCallback(() => {
    splitListDs.delete(splitListDs.selected, getSelectedNegActConfirmMsg('delete', splitListDs));
  }, [splitListDs]);

  const buttons = useMemo<Buttons[]>(() => [
    [TableButtonType.add, { onClick: handleAddLine }],
    [TableButtonType.delete, { onClick: handleDeleteLine }],
  ], [handleAddLine, handleDeleteLine]);

  return (
    <Fragment>
      <Form
        columns={3}
        record={topRecord}
        style={{ marginBottom: 16 }}
        labelLayout={LabelLayout.float}
      >
        <TextField name='paperNum' disabled />
        <NumberField name='paperAmount' disabled />
      </Form>
      {customizeTable(
        { code: SplitCustCode },
        <Table
          columns={columns}
          buttons={buttons}
          dataSet={splitListDs}
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        />
      )}
    </Fragment>
  );
}) as React.FC<SplitProps>;

export default Split;