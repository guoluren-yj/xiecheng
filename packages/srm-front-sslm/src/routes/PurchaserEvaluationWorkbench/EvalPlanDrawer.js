/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-03 17:12:16
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/EvalPlanDrawer.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import SearchBarTable from '_components/SearchBarTable';

import { tableHeight } from '@/routes/components/utils';
import { yesOrNoRender } from 'utils/renderer';

const EvalPlanDrawer = ({ dataSet, customizeTable = e => e }) => {
  const columns = [
    {
      name: 'evalPlanNumAndLineNumber',
      width: 160,
      renderer: ({ record }) => {
        const { evalPlanNum, lineNumber } = record?.get(['evalPlanNum', 'lineNumber']);
        return `${evalPlanNum}-${lineNumber}`;
      },
    },
    { name: 'supplierCompanyName', width: 180 },
    { name: 'supplierCompanyNum', width: 180 },
    { name: 'supplierNum', width: 180 },
    { name: 'categoryCode', width: 120 },
    { name: 'categoryName', width: 120 },
    { name: 'itemCode', width: 120 },
    { name: 'itemName', width: 120 },
    { name: 'strategyName', width: 120 },
    { name: 'investigationTypeMeaning', width: 120 },
    { name: 'assessTypeMeaning', width: 120 },
    { name: 'planMonth', width: 120 },
    { name: 'planDateFrom', width: 120 },
    { name: 'planDateTo', width: 120 },
    { name: 'groupFlag', width: 120, renderer: ({ value }) => yesOrNoRender(value) },
    { name: 'companyName', width: 180 },
    { name: 'ouName', width: 120 },
    { name: 'invOrganizationName', width: 120 },
    { name: 'inventoryName', width: 120 },
    { name: 'evalPrincipalName', width: 120 },
    { name: 'supplierContacts', width: 120 },
    { name: 'telephone', width: 120 },
    { name: 'email', width: 120 },
    { name: 'supplierAddress', width: 120 },
    { name: 'evalRemark', width: 120 },
    { name: 'createdByName', width: 120 },
    { name: 'creationDate', width: 140 },
  ];
  return (
    <div style={{ height: tableHeight.fixedHeight }}>
      {customizeTable(
        {
          code: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.REF_EVA_PLAN_TABLE',
        },
        <SearchBarTable
          dataSet={dataSet}
          columns={columns}
          searchCode="SSLM.PURCHASER_ASSESS_LIST.MANAGE.REF_EVA_PLAN_CRE_NEW"
          searchBarConfig={{
            closeFilterSelector: true,
            expandable: false,
            autoQuery: true,
            fieldProps: {
              supplierIdCombine: {
                valueField: 'supplierCompanyId',
                transformRequest: value => {
                  const params = value?.map(({ supplierCompanyId, supplierId, ...others }) => {
                    return {
                      ...others,
                      supplierCompanyId: supplierCompanyId || supplierId,
                      supplierId,
                    };
                  });
                  return params;
                },
              },
            },
          }}
          autoHeight={{ type: 'maxHeight', diff: 0 }}
        />
      )}
    </div>
  );
};

export default EvalPlanDrawer;
