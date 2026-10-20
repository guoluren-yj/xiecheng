/*
 * @Date: 2024-07-06 13:38:15
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';

const organizationId = getCurrentOrganizationId();

const HeaderBtns = ({
  eventConfigDS,
  activeKey,
  customizeBtnGroup,
  handleOpenModal = () => {},
  getEventConfigExportParams = () => {},
  interfaceLoading = false,
  handleImportAgain = () => {},
  handleReloadQuery = () => {},
  getInterfaceQueryExportParams = () => {},
}) => {
  const showEventConfig = activeKey === 'eventConfig';
  const buttons = [
    {
      name: 'create',
      hidden: !showEventConfig,
      btnProps: {
        icon: 'add',
        type: 'c7n-pro',
        color: 'primary',
        onClick: handleOpenModal,
      },
      child: intl.get('hzero.common.button.create').d('新建'),
    },
    {
      name: 'eventConfigExportPro',
      btnComp: ExcelExportPro,
      hidden: !showEventConfig,
      btnProps: {
        requestUrl: `${SRM_SSLM}/v1/${organizationId}/export-cf-headers/export`,
        queryParams: () => getEventConfigExportParams(),
        otherButtonProps: {
          icon: 'unarchive',
          type: 'c7n-pro',
          funcType: 'flat',
        },
        buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
        templateCode: 'SRM_C_SRM_SSLM_EXPORT_CF_HEAD_EXPORT',
      },
    },
    {
      name: 'eventConfigImport',
      btnComp: CommonImport,
      hidden: !showEventConfig,
      btnProps: {
        refreshButton: true,
        prefixPatch: SRM_SSLM,
        businessObjectTemplateCode: 'SRM_C_SRM_SSLM_EXPORT_CF_HEADER_IMPORT',
        buttonText: intl.get('hzero.common.button.newImport').d('(新)导入'),
        buttonProps: {
          funcType: 'flat',
        },
        successCallBack: () => {
          eventConfigDS.query();
        },
      },
    },
    // 接口查询
    {
      name: 'importAgain',
      hidden: showEventConfig,
      btnProps: {
        icon: 'archive',
        type: 'c7n-pro',
        color: 'primary',
        loading: interfaceLoading,
        onClick: handleImportAgain,
      },
      child: intl.get('spfm.importErp.view.button.importAgain').d('重新导入'),
    },
    {
      name: 'reload',
      hidden: showEventConfig,
      btnProps: {
        icon: 'cached',
        type: 'c7n-pro',
        loading: interfaceLoading,
        funcType: 'flat',
        onClick: handleReloadQuery,
      },
      child: intl.get('spfm.importErp.view.button.reload').d('重新查询'),
    },
    {
      name: 'interfaceQueryExportPro',
      btnComp: ExcelExportPro,
      hidden: showEventConfig,
      btnProps: {
        requestUrl: `${SRM_SSLM}/v1/${organizationId}/export-cf-results/export`,
        queryParams: () => getInterfaceQueryExportParams(),
        otherButtonProps: {
          icon: 'unarchive',
          type: 'c7n-pro',
          funcType: 'flat',
        },
        buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
        templateCode: 'SSLM_INTERFACE_QUERY_EXPORT',
      },
    },
  ];
  return customizeBtnGroup(
    {
      code: showEventConfig
        ? 'SSLM.SUPPLIER_EVENT_CONFIG_LIST.BTN'
        : 'SSLM.SUPPLIER_EVENT_INTERFACE_QUERY.BTN',
      pro: true,
    },
    <DynamicButtons buttons={buttons} permissions={getBtnsPermissions()} defaultBtnType="c7n-pro" />
  );
};

// 头按钮权限集
const getBtnsPermissions = () => [
  {
    name: 'create',
    code: 'srm.bg.business-rule.supplierexport.ps.change.button',
    meaning: '供应商事件配置-新建',
  },
  {
    name: 'eventConfigExportPro',
    code: 'srm.bg.business-rule.supplierexport.api.export',
    meaning: '供应商事件配置-新导出',
  },
  {
    name: 'eventConfigImport',
    code: 'srm.bg.business-rule.supplierexport.api.import',
    meaning: '供应商事件配置-导入',
  },
];

export default HeaderBtns;
