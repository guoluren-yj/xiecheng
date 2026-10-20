/*
 * SupplierClassify - 供应商分类
 * @Date: 2023-08-17 10:35:47
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext, useEffect } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { enableRender } from 'utils/renderer';
import { Context } from '@/routes/SupplierMasterData/Context';
import { getSupplierClassifyDS } from '../stores/getSupplierClassifyDS';

const SupplierClassify = () => {
  const dataSet = useDataSet(() => getSupplierClassifyDS(), []);
  const context = useContext(Context);
  const { customizeTable, supplierCompanyInfo = {}, tableMaxHeight } = context;

  const { supplierCompanyId, supplierTenantId } = supplierCompanyInfo;

  useEffect(() => {
    if (supplierCompanyId && supplierTenantId) {
      dataSet.setQueryParameter('params', {
        isAssignFlag: 1,
        supplierCompanyId,
        supplierTenantId,
      });
      dataSet.query();
    }
  }, [supplierTenantId, supplierCompanyId]);

  const columns = [
    {
      name: 'categoryCode',
    },
    {
      name: 'categoryDescription',
    },
    {
      width: 120,
      name: 'enabledFlag',
      renderer: ({ value }) => enableRender(value),
    },
  ];
  return customizeTable(
    {
      code: '',
    },
    <Table dataSet={dataSet} columns={columns} style={{ maxHeight: tableMaxHeight }} />
  );
};

export default SupplierClassify;
