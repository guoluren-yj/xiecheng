/*
 * @Date: 2023-08-17 20:13:04
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import qs from 'querystring';
import React from 'react';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import { checkPrintWindow, getPdfPreviewUrl } from '_utils/utils';

import { riskScan } from '@/routes/LifeCycleManage/utils';
import { handlePrint } from '@/services/supplierDetailService';
import { openRelationChart } from '@/routes/components/EnterpriseRelationSearch';

const HeaderBtns = ({
  loading,
  companyId,
  partnerId,
  setLoading,
  customizeBtnGroup,
  supplierCompanyId,
  basic = {},
  supplierTenantId,
}) => {
  const { companyName, domesticForeignRelation } = basic || {};
  // 打印回调
  const dealPrint = () => {
    setLoading(true);
    handlePrint({ companyId, supplierCompanyId })
      .then(async response => {
        const res = getResponse(response);
        if (res) {
          const flag = checkPrintWindow();
          if (flag) {
            if (res.type.indexOf('application/json') > -1) {
              notification.warning({
                description: intl
                  .get(`sslm.common.view.printwarning.noTemplate`)
                  .d('未设置打印模板，不可打印'),
              });
              return;
            }
            const file = new Blob([res], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const printWindow = window.open(fileURL);
            if (printWindow) {
              printWindow.print();
            }
          } else {
            const { fileUrl, bucketName, fileToken } = res;
            const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
            window.open(url);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  // 跳转关联单据
  const handleRelatedDoc = () => {
    openTab({
      title: 'hzero.common.view.title.supplierRelatedDoc',
      key: '/sslm/supplier-related-doc/list',
      path: '/sslm/supplier-related-doc/list',
      search: qs.stringify({
        companyId,
        supplierCompanyId,
        supplierTenantId, // src-31940 用于关联单据查询供应商分类
        customizeUnitCode: 'SSLM.SUPPLIER_360_PAGE_RELATED_DOC.TABS',
        isLifeCyclesSummaryFlag: 1,
        partnerId,
        sourceKey: 'NEW360QUERY',
      }),
    });
  };

  const buttons = [
    {
      name: 'relationSearch',
      child: intl.get('sslm.common.view.common.relationSearch').d('关系排查'),
      btnProps: {
        icon: 'relate',
        funcType: 'flat',
        onClick: () =>
          openRelationChart({
            domesticForeignRelation,
            supplierCompanyName: companyName,
            businessType: '360',
          }),
      },
    },
    {
      name: 'riskScan',
      child: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
      btnProps: {
        loading,
        icon: 'document_scanner-o',
        funcType: 'flat',
        onClick: () => riskScan({ ...basic, companyId }, true),
      },
    },
    {
      name: 'print',
      child: intl.get('hzero.common.button.print').d('打印'),
      btnProps: {
        loading,
        icon: 'print',
        funcType: 'flat',
        onClick: dealPrint,
      },
    },
    {
      name: 'supplierRelatedDoc',
      child: intl.get('sslm.common.view.title.supplierRelatedDoc').d('供应商关联业务单据'),
      btnProps: {
        loading,
        icon: 'relate',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: handleRelatedDoc,
      },
    },
  ];

  return customizeBtnGroup(
    {
      code: 'SSLM.SUPPLIER_360_PAGE_COLLECT.HEADER_BTNS',
      pro: true,
    },
    <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />
  );
};

export default HeaderBtns;
