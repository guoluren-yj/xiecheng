import React, { useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
import { dateTimeRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

const ByOrgList = ({
  customizeTable,
  handleGoDetail,
  tableDs,
}) => {
  useEffect(() => {
    tableDs.query();
  }, [tableDs]);

  const columns = [
    {
      name: 'itemCode',
      width: 150,
      renderer: ({ value, record }) => <a onClick={() => handleGoDetail(record?.get('itemId'))}>{value}</a>,
    },
    {
      name: 'itemName',
      width: 200,
    },
    {
      width: 150,
      name: 'primaryUomId',
      renderer: ({ record }) => record?.get('uomName'),
    },
    {
      width: 100,
      align: 'center',
      name: 'externalSystemCode',
    },
    {
      width: 75,
      align: 'center',
      name: 'enabledFlag',
      renderer: ({ record }) => record?.get('enabledFlagMeaning'),
    },
    {
      width: 150,
      name: 'lastUpdateDate',
      renderer: ({ value }) => dateTimeRender(value),
    },
    {
      width: 150,
      name: 'itemAllOrgFlag',
      renderer: ({ record }) => record?.get('itemAllOrgFlagMeaning'),
    },
    {
      width: 150,
      name: 'itemCategoryCode',
    },
    {
      width: 150,
      name: 'itemCategoryName',
    },
    {
      width: 150,
      name: 'organizationCode',
    },
    {
      width: 200,
      name: 'organizationName',
    },
    {
      name: 'minPackQuantity',
      width: 150,
    },
    {
      name: 'leadDays',
      width: 150,
    },
    {
      name: 'allowExcessType',
      width: 150,
    },
    {
      name: 'allowExcessAmount',
      width: 150,
    },
    {
      name: 'minOrderQuantity',
      width: 150,
    },
    {
      name: 'demandExecutorBy',
      width: 200,
      renderer: ({ record }) => record?.get('demandExecutor'),
    },
    {
      name: 'orderExecutor',
      width: 200,
    },
    {
      name: 'sourceExecutor',
      width: 200,
    },
    {
      name: 'forPurchaseFlag',
      width: 100,
      renderer: ({ record }) => record?.get('forPurchaseFlagMeaning'),
    },
    {
      name: 'internalBatchFlag',
      width: 100,
      renderer: ({ record }) => record?.get('internalBatchFlagMeaning'),
    },
    {
      name: 'dimensionQc',
      width: 100,
      renderer: ({ record }) => record?.get('dimensionQcMeaning'),
    },
    {
      name: 'validPeriodFlag',
      width: 100,
      renderer: ({ record }) => record?.get('validPeriodFlagMeaning'),
    },
    {
      name: 'externalBatchFlag',
      width: 100,
      renderer: ({ record }) => record?.get('externalBatchFlagMeaning'),
    },
    {
      name: 'orgEnabledFlagMeaning',
      width: 150,
    },
    {
      name: 'consignmentFlag',
      width: 100,
      renderer: ({ record }) => record?.get('consignmentFlagMeaning'),
    },
    {
      name: 'exemptInspectionFlag',
      width: 100,
      renderer: ({ record }) => record?.get('exemptInspectionFlagMeaning'),
    },
  ];

  return customizeTable(
    {
      code: 'SMDM_MATERIELQUERY_LIST.ORG_LIST',
      filterCode: 'SMDM_MATERIELQUERY_LIST.ORG_SEARCH',
    },
    <Table
      dataSet={tableDs}
      columns={columns}
      queryFieldsLimit={3}
      queryBar='professionalBar'
      queryBarProps={{
        formProps: { labelLayout: 'horizontal', labelWidth: 130 },
      }}
      style={{ maxHeight: 'calc(100vh - 300px)' }}
    />
  );
};

export default withCustomize({
  unitCode: ['SMDM_MATERIELQUERY_LIST.ORG_SEARCH', 'SMDM_MATERIELQUERY_LIST.ORG_LIST'],
})(ByOrgList);
