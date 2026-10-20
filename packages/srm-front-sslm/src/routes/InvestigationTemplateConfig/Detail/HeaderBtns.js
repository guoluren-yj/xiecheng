/*
 * @Date: 2023-04-20 11:15:01
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { Button, Dropdown, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import HistoryVersion from '../components/HistoryVersion';

const HeaderBtns = ({
  isEdit,
  loading,
  headerInfo = {},
  showHistoryBtn,
  historyVersionFlag,
  headerDs,
  dispatch,
  sourceNewTemplateId,
  sourceOldTemplateId,
  handleRelease = () => {},
  handleSave = () => {},
  handlePreview = () => {},
  handleAllocateReference = () => {},
  handleAllocateCompany = () => {},
  handleEdit = () => {},
  handleExport = () => {},
}) => {
  const HistoryVersionBtn = () => (
    <Dropdown
      overlay={
        <HistoryVersion
          record={headerDs.current}
          dispatch={dispatch}
          showSubMenuFlag={false}
          sourceNewTemplateId={sourceNewTemplateId}
          sourceOldTemplateId={sourceOldTemplateId}
        />
      }
    >
      <Button icon="schedule" funcType="flat" loading={loading}>
        <span>{intl.get('hzero.common.button.historyVersion').d('历史版本')}</span>
        <Icon type="expand_more" style={{ fontSize: 16, marginTop: -2, marginRight: 0 }} />
      </Button>
    </Dropdown>
  );

  const { enabledFlag, versionNumber } = headerInfo;
  // 查看页面，未禁用, 不是历史记录 可以编辑
  const showEditBtn = !isEdit && enabledFlag === 1 && !historyVersionFlag;
  // 历史版本
  const showHistoryFlag = showHistoryBtn || (!isEdit && versionNumber > 1);
  // 头按钮集合
  const buttons = [
    {
      name: 'release',
      child: intl.get('hzero.common.button.release').d('发布'),
      hidden: !isEdit,
      btnProps: {
        icon: 'publish2',
        type: 'c7n-pro',
        color: 'primary',
        onClick: handleRelease,
      },
    },
    {
      name: 'save',
      child: intl.get('hzero.common.button.save').d('保存'),
      hidden: !isEdit,
      btnProps: {
        icon: 'save',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: handleSave,
      },
    },
    {
      name: 'preview',
      child: intl.get('hzero.common.button.preview').d('预览'),
      hidden: !isEdit,
      btnProps: {
        icon: 'find_in_page',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: handlePreview,
      },
    },
    {
      name: 'referenceTempt',
      child: intl.get('hzero.common.button.qutote').d('引用其他模板'),
      hidden: !isEdit,
      btnProps: {
        icon: 'application_allocation',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: handleAllocateReference,
      },
    },
    {
      name: 'allocateCompany',
      child: intl.get('sslm.investTempConfig.view.button.allocateCompany').d('分配公司'),
      hidden: !isEdit || isEmpty(headerInfo),
      btnProps: {
        icon: 'auto_complete',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: handleAllocateCompany,
      },
    },
    {
      name: 'edit',
      child: intl.get('hzero.common.view.button.edit').d('编辑'),
      hidden: !showEditBtn,
      btnProps: {
        icon: 'mode_edit',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: handleEdit,
      },
    },
    {
      name: 'export',
      child: intl.get('hzero.common.button.export').d('导出'),
      btnProps: {
        icon: 'unarchive',
        type: 'c7n-pro',
        funcType: 'flat',
        onClick: handleExport,
        hidden: isEdit,
      },
    },
    {
      name: 'historyVersion',
      btnComp: HistoryVersionBtn,
      hidden: !showHistoryFlag,
    },
  ].map(btn => ({
    ...btn,
    btnProps: {
      ...btn.btnProps,
      loading,
      wait: 300,
      waitType: 'throttle',
    },
  }));

  const getBtnsPermissions = () => {
    const permissionsList = [
      {
        name: 'export',
        code: 'srm.partner.investigation-template-config-workbench.button.print',
        meaning: '调查表模板配置-明细导出',
      },
    ];
    return permissionsList;
  };

  return (
    <DynamicButtons
      trigger="hover"
      defaultBtnType="c7n-pro"
      buttons={buttons}
      permissions={getBtnsPermissions()}
    />
  );
};

export default HeaderBtns;
