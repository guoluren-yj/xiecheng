/*
 * HeaderBtns - 按钮组
 * @date: 2023/04/19 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { isNil } from 'lodash';

import { Icon, Button, Dropdown } from 'choerodon-ui/pro';
import DynamicButtons from '_components/DynamicButtons';
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import ExcelExportPro from 'components/ExcelExportPro';
import CommonImport from 'components/Import';
import { getCurrentOrganizationId } from 'utils/utils';

import HistoryVersion from './HistoryVersion';

const organizationId = getCurrentOrganizationId();

const HeaderBtns = ({
  loading = false,
  isEdit = false,
  handlePublish = () => {},
  handleSaveAndPublish = () => {},
  handleUnlock = () => {},
  hanldeImportSuccessCallBack = () => {},
  handleVersionDetailModal = () => {},
  assignId,
  headerId,
  versionNum,
  historyVersionHidden = false,
  hanldeHistoryVersionHidden = () => {},
}) => {
  const buttonHidden = isNil(assignId);
  const commonProps = {
    loading,
    wait: 500,
    waitType: 'throttle',
  };

  const historyVersionProps = {
    record: {
      assignId,
      tenantId: organizationId,
    },
    showSubMenuFlag: false,
    isPlatform: false,
    handleVersionClick: handleVersionDetailModal,
    handleMenuHidden: hanldeHistoryVersionHidden,
  };

  const HistoryVersionComp = () => {
    return (
      <Dropdown
        overlay={() => (historyVersionHidden ? null : <HistoryVersion {...historyVersionProps} />)}
      >
        <Button icon="schedule" funcType="flat" {...commonProps}>
          <span>{intl.get('hzero.common.button.historyVersion').d('历史版本')}</span>
          <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
        </Button>
      </Dropdown>
    );
  };

  const btns = [
    {
      name: 'export',
      btnComp: ExcelExportPro,
      childFor: 'buttonText',
      child: intl.get('hzero.common.button.export').d('导出'),
      hidden: isEdit,
      btnProps: {
        templateCode: 'SRM_C_SPFM_STRATEGY_CF_BASIC_EXPORT',
        requestUrl: `${SRM_PLATFORM}/v1/${organizationId}/strategy-cf-basics/strategyExport/${headerId}`,
        otherButtonProps: {
          funcType: 'flat',
          ...commonProps,
        },
      },
    },
    {
      name: 'import',
      btnComp: CommonImport,
      childFor: 'buttonText',
      child: intl.get('hzero.common.button.import').d('导入'),
      btnProps: {
        refreshButton: true,
        prefixPatch: SRM_PLATFORM,
        businessObjectTemplateCode: 'SRM_C_SPFM_STRATEGY_CF_BASIC_IMPORT',
        successCallBack: hanldeImportSuccessCallBack,
        buttonProps: {
          funcType: 'flat',
          ...commonProps,
        },
      },
    },
    {
      name: 'historyVersion',
      hidden: buttonHidden || versionNum < 2,
      btnComp: HistoryVersionComp,
    },
    {
      name: 'unlock',
      child: intl.get('hzero.common.button.edit').d('编辑'),
      hidden: isEdit || buttonHidden,
      btnProps: {
        icon: 'mode_edit',
        funcType: 'flat',
        onClick: handleUnlock,
        ...commonProps,
      },
    },
    {
      name: 'save',
      child: intl.get('hzero.common.button.save').d('保存'),
      hidden: !isEdit || buttonHidden,
      btnProps: {
        icon: 'save',
        funcType: 'flat',
        onClick: () => handleSaveAndPublish(false),
        ...commonProps,
      },
    },
    {
      name: 'release',
      child: intl.get('hzero.common.button.publish').d('发布'),
      hidden: !isEdit || buttonHidden,
      btnProps: {
        icon: 'publish2',
        color: 'primary',
        onClick: handlePublish,
        ...commonProps,
      },
    },
  ];

  const btnsPermissions = [
    {
      name: 'import',
      code: 'srm.partner.my-partner.policy-config.api.strategy.import',
      meaning: '注册策略导入',
    },
    {
      name: 'export',
      code: 'srm.partner.my-partner.policy-config.api.strategy.export',
      meaning: '注册策略导出',
    },
  ];

  return (
    <DynamicButtons
      trigger="hover"
      defaultBtnType="c7n-pro"
      buttons={btns}
      permissions={btnsPermissions}
    />
  );
};

export default HeaderBtns;
