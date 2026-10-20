/*
 * @Date: 2023-08-18 11:27:42
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useContext } from 'react';
import { Form, Output, useDataSet } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import { dateRender, yesOrNoRender } from 'utils/renderer';

import { Context } from '@/routes/SupplierDetailNew/Context';
import { fetchOtherInfo } from '@/services/supplierDetailService';
import { getOtherInfoDS } from '../stores/getOtherInfoDS';

const customizeUnitCode = 'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.OTHERS';

const OtherInfo = () => {
  const dataSet = useDataSet(() => getOtherInfoDS(), []);
  const context = useContext(Context);
  const { companyId, customizeForm, partnerTenantId, supplierCompanyId } = context;

  useEffect(() => {
    if (companyId && supplierCompanyId) {
      // 手动调用，处理后端返回204，前端数据不重新加载问题
      fetchOtherInfo({
        companyId,
        customizeUnitCode,
        supplierCompanyId,
        supplierTenantId: partnerTenantId,
      }).then(response => {
        const res = getResponse(response);
        if (res) {
          dataSet.create(res);
        }
      });
    }
  }, [companyId]);

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
    {
      name: 'tempFlag',
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'tempEndDate',
      renderer: ({ value }) => dateRender(value),
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
