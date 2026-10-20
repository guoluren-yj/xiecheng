import React, { useMemo, useEffect } from 'react';
import { Form, TextField, Table } from 'choerodon-ui/pro';
import ExcelExport from 'components/ExcelExport';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import { formatAumont } from '../../components/utils';

const organizationId = getCurrentOrganizationId();

const BOMModal = (props) => {
  const {
    searchDs,
    BOMTableDs,
    customizeTable,
    itemCode,
    itemName,
    poHeaderId,
    poLineId,
    poLineLocationId,
  } = props;
  const otherButtonProps = {
    icon: 'export',
    type: 'primary',
  };

  useEffect(() => {
    BOMTableDs.setQueryParameter('poLineId', poLineId);
    BOMTableDs.setQueryParameter('poHeaderId', poHeaderId);
    BOMTableDs.setQueryParameter('poLineLocationId', poLineLocationId);
    BOMTableDs.setQueryParameter('itemCode', itemCode);
    BOMTableDs.setQueryParameter('itemName', itemName);
    BOMTableDs.query();
  }, []);

  useEffect(() => {
    searchDs.create({
      itemCode,
      itemName,
    });
  }, [itemCode, itemName]);

  const columns = useMemo(
    () => [
      {
        name: 'orderSeq',
        width: 60,
      },
      {
        name: 'itemCode',
        width: 100,
        align: 'center',
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'quantity',
        width: 100,
        renderer: ({ value }) => formatAumont(value),
      },
      {
        name: 'uomName',
        width: 120,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'invOrganizationName',
        width: 120,
      },
      {
        name: 'needByDate',
        width: 120,
        renderer: ({ value }) => (value ? moment(value).format(DEFAULT_DATE_FORMAT) : value),
      },
    ],
    []
  );
  return (
    <React.Fragment>
      <Form dataSet={searchDs} columns={3}>
        <TextField disabled name="itemCode" />
        <TextField disabled name="itemName" />
        <ExcelExport
          otherButtonProps={otherButtonProps}
          requestUrl={`${SRM_SPUC}/v1/${organizationId}/po-item-boms/export`}
          queryParams={{ poHeaderId, poLineId }}
        />
      </Form>
      {customizeTable(
        {
          code: 'SODR.SEND_ORDER_DETAIL.BOM_MODAL',
          dataSet: BOMTableDs,
        },
        <Table columns={columns} dataSet={BOMTableDs} />
      )}
    </React.Fragment>
  );
};

export default WithCustomizeC7N({
  unitCode: ['SODR.SEND_ORDER_DETAIL.BOM_MODAL'],
})(BOMModal);
