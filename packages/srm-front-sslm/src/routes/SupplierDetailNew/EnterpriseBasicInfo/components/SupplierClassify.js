/*
 * SupplierClassify - 供应商分类
 * @Date: 2023-08-17 10:35:47
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext, useEffect } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { enableRender } from 'utils/renderer';
import { Context } from '@/routes/SupplierDetailNew/Context';
import { getSupplierClassifyDS } from '../stores/getSupplierClassifyDS';

const customizeUnitCode = 'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.CLASSIFY';

const SupplierClassify = () => {
  const dataSet = useDataSet(() => getSupplierClassifyDS(), []);
  const context = useContext(Context);
  const { customizeTable, partnerTenantId, supplierCompanyId, tableMaxHeight } = context;

  useEffect(() => {
    dataSet.setQueryParameter('params', {
      isAssignFlag: 1,
      customizeUnitCode,
      supplierCompanyId,
      supplierTenantId: partnerTenantId,
    });
    dataSet.query();
  }, [partnerTenantId, supplierCompanyId]);

  const columns = [
    {
      name: 'categoryCode',
    },
    {
      name: 'categoryDescription',
    },
    {
      name: 'evaluationLevel',
    },
    {
      name: 'evaluationScore',
    },
    {
      width: 120,
      name: 'enabledFlag',
      renderer: ({ value }) => enableRender(value),
    },
  ];
  return customizeTable(
    {
      code: customizeUnitCode,
    },
    <Table dataSet={dataSet} columns={columns} style={{ maxHeight: tableMaxHeight }} />
  );
};

export default SupplierClassify;
