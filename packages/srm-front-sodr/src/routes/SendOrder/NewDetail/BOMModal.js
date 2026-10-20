import React, { useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, TextField, useDataSet } from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import ExcelExport from 'components/ExcelExport';
import { SRM_SPUC } from '_utils/config';
import { useTable } from './hooks';
import { Store } from './stores';
import BOMDs from './stores/BOMDs';

const BOMModal = function BOMModal(props) {
  const { record, customizeTable } = props;
  const { itemCode, itemName, poLineId, poLineLocationId } = record.get([
    'itemCode',
    'itemName',
    'poLineId',
    'poLineLocationId',
  ]);
  const { organizationId, poHeaderId } = useContext(Store);
  const dataSet = useDataSet(
    () =>
      BOMDs({
        organizationId,
        poHeaderId,
        // itemCode,
        // itemName,
        poLineId,
        poLineLocationId,
      }),
    [
      organizationId,
      poHeaderId,
      // itemCode, itemName,
      poLineId,
      poLineLocationId,
    ]
  );
  const columns = useMemo(
    () => [
      {
        name: 'orderSeq',
        width: 60,
      },
      {
        name: 'itemCode',
        width: 100,
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        title: intl.get(`entity.item.type`).d('物料类型'),
        width: 120,
        name: 'categoryName',
      },
      {
        width: 100,
        name: 'quantity',
      },
      {
        width: 120,
        name: 'uomName',
        renderer: ({ record: r }) => r.get('uomCodeAndName'),
      },
      {
        width: 120,
        name: 'invOrganizationName',
      },
      {
        width: 120,
        name: 'needByDate',
      },
    ],
    []
  );
  return (
    <>
      <Form columns={3}>
        <TextField name="itemName" disabled value={itemName} />
        <TextField name="itemCode" disabled value={itemCode} />
        <ExcelExport
          key="export"
          otherButtonProps={{
            icon: 'export',
            type: 'primary',
          }}
          requestUrl={`${SRM_SPUC}/v1/${organizationId}/po-item-boms/export`}
          queryParams={{ poHeaderId, poLineId }}
        />
      </Form>
      {customizeTable(
        {
          code: 'SODR.SEND_ORDER_DETAIL.BOM_MODAL',
        },
        useTable(dataSet, columns)
      )}
    </>
  );
};

export default withCustomize({
  unitCode: ['SODR.SEND_ORDER_DETAIL.BOM_MODAL'],
})(observer(BOMModal));
