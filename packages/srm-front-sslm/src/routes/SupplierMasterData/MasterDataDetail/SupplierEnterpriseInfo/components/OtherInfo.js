/*
 * @Date: 2023-08-18 11:27:42
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useContext } from 'react';
import { Form, Output, useDataSet } from 'choerodon-ui/pro';
import { dateRender } from 'utils/renderer';
import { Context } from '@/routes/SupplierMasterData/Context';
import { getOtherInfoDS } from '../stores/getOtherInfoDS';

const customizeUnitCode = 'SUPPLIER_MASTER_DATA.ENTERPRISE_OTHERS';

const OtherInfo = () => {
  const dataSet = useDataSet(() => getOtherInfoDS(), []);
  const context = useContext(Context);
  const { supplierCompanyInfo = {}, customizeForm, purchaserCompanyInfo = {} } = context;

  const { companyId } = purchaserCompanyInfo;
  const { supplierCompanyId, supplierTenantId } = supplierCompanyInfo;

  useEffect(() => {
    if (companyId && supplierCompanyId) {
      dataSet.setQueryParameter('params', {
        companyId,
        customizeUnitCode,
        supplierCompanyId,
        supplierTenantId,
      });
      dataSet.query();
    }
  }, [companyId, supplierCompanyId]);

  const fields = [
    {
      name: 'blacklistExpiryDate',
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'termName',
    },
    {
      name: 'typeName',
    },
  ];

  return customizeForm(
    {
      code: customizeUnitCode,
    },
    <Form
      columns={3}
      dataSet={dataSet}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
    >
      {fields.map(field => (
        <Output {...field} />
      ))}
    </Form>
  );
};

export default OtherInfo;
