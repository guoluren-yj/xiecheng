/*
 * BusinessInfo - 业务信息
 * @Date: 2023-08-16 19:09:20
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext, useEffect } from 'react';
import { Form, Output, useDataSet } from 'choerodon-ui/pro';
import { forEach } from 'lodash';

import { Context } from '@/routes/SupplierDetailNew/Context';
import { serviceTypeList } from '@/routes/components/utils/constants';

import { getBusinessInfoDS } from '../stores/getBusinessInfoDS';

const customizeCode = 'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.BUSINESS';

const BusinessInfo = () => {
  const context = useContext(Context);
  const { business = {}, customizeForm } = context;
  const dataSet = useDataSet(() => getBusinessInfoDS(), []);

  useEffect(() => {
    dataSet.loadData([business]);
  });

  const fields = [
    {
      name: 'businessNature',
      renderer: ({ record }) => {
        if (record) {
          const serviceType = serviceTypeList();
          const {
            manufacturerFlag,
            traderFlag,
            servicerFlag,
            agentFlag,
            integrationFlag,
            contractorFlag,
            dealerFlag,
          } = record.get([
            'manufacturerFlag',
            'traderFlag',
            'servicerFlag',
            'agentFlag',
            'integrationFlag',
            'contractorFlag',
            'dealerFlag',
          ]);
          const businessNatureList = [
            manufacturerFlag ? 'manufacturer' : null,
            traderFlag ? 'trader' : null,
            servicerFlag ? 'servicer' : null,
            agentFlag ? 'agent' : null,
            integrationFlag ? 'integration' : null,
            contractorFlag ? 'contractor' : null,
            dealerFlag ? 'dealer' : null,
          ].filter(Boolean);
          const displayList = [];
          forEach(businessNatureList, n => {
            displayList.push(serviceType[n]);
          });
          return displayList.join('、');
        }
      },
    },
    {
      name: 'industryName',
      renderer: ({ record }) => {
        if (record) {
          const industryList = record.get('industryList') || [];
          const industryName = industryList.map(n => n.industryName);
          return industryName.join('、');
        }
      },
    },
    {
      name: 'categoryName',
      renderer: ({ record }) => {
        if (record) {
          const industryCategoryList = record.get('industryCategoryList') || [];
          const categoryName = industryCategoryList.map(n => n.categoryName);
          return categoryName.join('、');
        }
      },
    },
    {
      name: 'serviceArea',
      renderer: ({ record }) => {
        if (record) {
          const serviceAreaList = record.get('serviceAreaList') || [];
          const serviceArea = serviceAreaList.map(n => n.serviceAreaMeaning);
          return serviceArea.join('、');
        }
      },
    },
    {
      name: 'website',
    },
    {
      name: 'description',
      newLine: true,
      rows: 3,
      cols: 2,
      colSpan: 2,
    },
  ];

  return customizeForm(
    {
      code: customizeCode,
      readOnly: true,
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

export default BusinessInfo;
