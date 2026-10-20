/*
 * @Date: 2023-07-06 13:38:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Button } from 'components/Permission';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';

import { headerBtnCode } from './utils';

const tenantId = getCurrentOrganizationId();

const HeaderBtns = observer(
  ({ dataSet, activeKey, onCreate, onDelete, customizeBtnGroup, onExportParams }) => {
    const isDisabled = isEmpty(dataSet.selected);
    const btnCode = headerBtnCode[activeKey];
    const buttons = [
      {
        name: 'create',
        btnComp: Button,
        btnProps: {
          icon: 'add',
          type: 'c7n-pro',
          color: 'primary',
          onClick: onCreate,
        },
        child: intl.get('hzero.common.button.create').d('新建'),
      },
      {
        name: 'batchDelete',
        btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'delete_sweep',
          disabled: isDisabled,
          onClick: () => onDelete(dataSet),
        },
        hidden: activeKey !== 'waitSubmit',
        child: intl.get('sslm.common.button.batchDelete').d('批量删除'),
      },
      {
        name: 'buyerUpdateImport',
        btnComp: CommonImport,
        btnProps: {
          tenantId,
          refreshButton: true,
          prefixPatch: SRM_SSLM,
          businessObjectTemplateCode: 'SRM_C_SRM_SSLM_SUPPLIER_CHANGE_REQ_PURCHASE_AGENT_IMPORT',
          buttonTooltip: intl
            .get('sslm.supplierInform.view.message.buyerUpdateImportMsg')
            .d(
              '该导入成功后会直接依据导入表格数据从上到下依次按行数据修改供应商主数据信息，不产生单据不触发审批！'
            ),
          buttonText: intl
            .get('sslm.supplierInform.button.buyerUpdateImport')
            .d('供应商信息更新导入'),
          buttonProps: {
            funcType: 'flat',
            permissionList: [
              {
                code: 'srm.partner.my-partner.supplier-inform-change-new.button.purchase.agent',
                type: 'button',
                meaning: '供应商信息变更-供应商信息更新导入',
              },
            ],
          },
        },
      },
      {
        name: 'categoryImport',
        btnComp: CommonImport,
        btnProps: {
          tenantId,
          refreshButton: true,
          prefixPatch: SRM_SSLM,
          businessObjectTemplateCode: 'SRM_C_SRM_SSLM_SUPPLIER_CTG_ALTER_IMPORT',
          successCallBack: () => {
            dataSet.query();
          },
          buttonText: intl
            .get('sslm.supplierInform.button.SupplierCategorydateImport')
            .d('供应商分类变更导入'),
          buttonProps: {
            funcType: 'flat',
            permissionList: [
              {
                code: 'srm.partner.my-partner.supplier-inform-change-new.button.import.category',
                type: 'button',
                meaning: '供应商信息变更-供应商分类变更导入',
              },
            ],
          },
        },
      },
      {
        name: 'excelExport',
        btnComp: ExcelExportPro,
        hidden: activeKey !== 'all',
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${tenantId}/supplier-change-reqs/export_new`,
          queryParams: () => onExportParams(),
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
          },
          buttonText: isDisabled
            ? intl.get('hzero.common.button.export').d('导出')
            : intl.get('hzero.common.button.selectedExport').d('勾选导出'),
          templateCode: 'SRM_C_SRM_SSLM_SUPPLIER_CHANGE_REQ_EXPORT_NEW',
        },
      },
    ];
    return customizeBtnGroup(
      {
        code: btnCode,
        pro: true,
      },
      <DynamicButtons buttons={buttons} key={btnCode} />
    );
  }
);

export default HeaderBtns;
