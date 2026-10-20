import React from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const btnsPermissions = [
  {
    name: 'create',
    meaning: '供应商配额管理-新建',
    code: 'srm.partner.supplier-quota-manage.manage.ps.btn-new',
  },
  {
    name: 'release',
    meaning: '供应商配额管理-发布',
    code: 'srm.partner.supplier-quota-manage.manage.ps.btn-release',
  },
  {
    name: 'disable',
    meaning: '供应商配额管理-禁用',
    code: 'srm.partner.supplier-quota-manage.manage.api.btn-batchForbidden',
  },
  {
    name: 'exportPro',
    meaning: '供应商配额管理-新导出',
    code: 'srm.partner.supplier-quota-manage.manage.ps.list.export.new',
  },
  {
    name: 'commonImport',
    meaning: '供应商配额管理-新导入',
    code: 'srm.partner.supplier-quota-manage.manage.ps.import.model',
  },
  {
    name: 'export',
    meaning: '供应商配额管理-导出',
    code: 'srm.partner.supplier-quota-manage.manage.ps.list.export.old',
  },
  {
    name: 'import',
    meaning: '供应商配额管理-导入',
    code: 'srm.partner.supplier-quota-manage.manage.ps.import.old',
  },
];

const HeaderBtns = ({
  loading,
  onQuery,
  onCreate,
  onRelease,
  queryParams,
  selectedRows,
  onBatchExport,
  onBatchForbidden,
  customizeBtnGroup,
}) => {
  const buttons = [
    {
      name: 'create',
      btnProps: {
        loading,
        icon: 'add',
        color: 'primary',
        onClick: () => onCreate(),
      },
      child: intl.get(`hzero.common.button.create`).d('新建'),
    },
    {
      name: 'release',
      btnProps: {
        loading,
        icon: 'rocket',
        type: 'c7n-pro',
        funcType: 'flat',
        disabled: isEmpty(selectedRows),
        onClick: () => onRelease(),
      },
      child: intl.get('hzero.common.button.release').d('发布'),
    },
    {
      name: 'disable',
      child: intl.get('hzero.common.status.disable').d('禁用'),
      btnProps: {
        loading,
        icon: 'block',
        funcType: 'flat',
        disabled: isEmpty(selectedRows),
        onClick: () => onBatchForbidden(),
        help: intl
          .get('sslm.supplierQuotaManage.view.message.disableMsg')
          .d('历史版本单据不允许禁用'),
      },
    },
    {
      name: 'exportPro',
      btnComp: ExcelExportPro,
      btnProps: {
        requestUrl: `${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/list/export`,
        queryParams: () => queryParams(),
        templateCode: 'SRM_C_SRM_SSLM_SUPPLIER_QUOTA_HEADER_EXPORT',
        buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
        otherButtonProps: {
          loading,
          funcType: 'flat',
        },
      },
    },
    {
      name: 'commonImport',
      btnComp: CommonImport,
      btnProps: {
        buttonText: intl.get('hzero.common.button.newImport').d('(新)导入'),
        businessObjectTemplateCode: 'SSLM.SUPPLIER_QUOTA_IMPORT',
        prefixPatch: SRM_SSLM,
        refreshButton: true,
        successCallBack: () => {
          onQuery();
        },
        buttonProps: {
          loading,
          funcType: 'flat',
        },
      },
    },
    {
      name: 'export',
      btnComp: ExcelExport,
      btnProps: {
        requestUrl: `${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/list/export`,
        queryParams: () => queryParams(),
        otherButtonProps: {
          loading,
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'unarchive',
        },
      },
    },
    {
      name: 'import',
      btnProps: {
        loading,
        type: 'c7n-pro',
        icon: 'archive',
        funcType: 'flat',
        onClick: () => onBatchExport(),
      },
      child: intl.get('hzero.common.button.import').d('导入'),
    },
  ];

  return customizeBtnGroup(
    {
      code: 'SSLM.SUPPLIER_QUOTA_MANAGE.LIST.BTN_GROUP',
      pro: true,
    },
    <DynamicButtons
      maxNum={5}
      trigger="hover"
      buttons={buttons}
      defaultBtnType="c7n-pro"
      permissions={btnsPermissions}
    />
  );
};

export default HeaderBtns;
