import React, { useMemo } from 'react';
import {
  Button,
  DataSet,
  // Form,
  // TextField,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

import { productDs } from './ds';

const organizationId = getCurrentOrganizationId();

export default function Product(props) {
  const {
    modal,
    applyHeaderId,
    applyType,
    supplierCompanyId,
    handleViewDetail = (e) => e,
    onOk = (e) => e,
  } = props;
  modal.handleOk(() => {
    onOk(ds.selected);
  });

  const ds = useMemo(() => new DataSet(productDs(applyHeaderId, applyType, supplierCompanyId)), []);

  const columns = useMemo(() => {
    return [
      {
        name: 'purSkuStatusMeaning',
        width: 100,
      },
      {
        name: 'skuCode',
        width: 150,
      },
      {
        name: 'skuName',
        width: 150,
      },
      {
        name: 'supplier',
        width: 200,
      },
      {
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'catalogName',
        width: 120,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        renderer: ({ record }) => (
          <span>
            <Button funcType="link" color="primary" onClick={() => handleViewDetail(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
          </span>
        ),
      },
    ];
  }, []);

  return (
    <SearchBarTable
      dataSet={ds}
      columns={columns}
      searchCode="SMPC.SHELF_APPLY.SKU.SEARCH_BAR"
      searchBarConfig={{
        // defaultExpand: false,
        closeFilterSelector: true,
        fieldProps: {
          catalogId: { lovPara: { tenantId: organizationId } },
          categoryId: { lovPara: { tenantId: organizationId } },
        },
      }}
    />
  );
}
