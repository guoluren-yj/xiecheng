import React, { Fragment, useCallback, useMemo } from 'react';
import { compose } from 'lodash';
import { observer } from 'mobx-react-lite';

import { Modal, DataSet, Form, Table, TextField, NumberField, Currency } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { header, line } from './store';

const CostInformation = (props) => {
  console.log(props);
  const { record, name = 'costInformation', displayPoNum, viewOnly } = props;
  const field = useMemo(() => record.getField(name), [record]);
  const { quantity, poLineId, displayLineNum, poHeaderId } = record.get([
    'quantity',
    'poLineId',
    'displayLineNum',
    'poHeaderId',
  ]);
  const headerDs = useMemo(() => new DataSet(header({ poLineId, poHeaderId })), [
    poLineId,
    poHeaderId,
  ]);
  const lineDs = useMemo(() => new DataSet(line({ viewOnly, quantity })), [quantity, viewOnly]);
  const text =
    field.get('label') ||
    intl.get('sodr.costInformation.model.common.costInformation').d('费用信息');
  const columns = useMemo(
    () => [
      {
        name: '',
      },
    ],
    []
  );
  const viewModal = useCallback(() => {
    Modal.open({
      drawer: true,
      style: { width: 742 },
      title: `${displayPoNum}-${displayLineNum}`,
      children: (
        <Fragment>
          <Form dataSet={headerDs} columns={2} labelLayout="float" style={{ marginBottom: 16 }}>
            <TextField name="itemCode" disabled />
            <TextField name="itemName" disabled />
            <NumberField name="quantity" disabled />
            <TextField name="currencyCode" disabled />
            <Currency name="taxIncludedLineAmount" disabled />
            <Currency name="lineAmount" disabled />
            <Currency name="expenseTaxIncludedLineAmount" disabled />
            <Currency name="expenseLineAmount" disabled />
          </Form>
          <Table dataSet={lineDs} />
        </Fragment>
      ),
    });
  }, [displayPoNum, displayLineNum, headerDs, lineDs, columns]);
  return <a onClick={viewModal}>{text}</a>;
};

export default compose(
  formatterCollections({ code: ['sodr.costInformation'] }),
  observer
)(CostInformation);
