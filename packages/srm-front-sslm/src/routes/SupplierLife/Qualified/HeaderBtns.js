/*
 * @Date: 2024-01-22 19:06:13
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isFunction } from 'lodash';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/common/intelligentReview.svg';

const btnsPermissions = [
  {
    name: 'print',
    meaning: '合格申请单查看-打印',
    code: `srm.partner.suplier-lifecycle.management.ps.button.qualified.print`,
  },
  {
    name: 'delete',
    meaning: '合格申请单-删除',
    code: `srm.partner.suplier-lifecycle.management.ps.button.qualified.delete`,
  },
  {
    name: 'cancel',
    meaning: '合格申请单-废弃',
    code: `srm.partner.suplier-lifecycle.management.ps.button.qualified.obsolete`,
  },
];

const HeaderBtns = ({
  qualifiedInfo,
  jump360,
  sourceType,
  customizeBtnGroup,
  loading,
  saveFlag,
  processStatus,
  backScoreFlag,
  readOnly,
  deleteFlag,
  reviewFlag,
  submitFlag,
  onSave,
  onOperat,
  onBackScore,
  onPrint,
  onDelete,
  onObsoleted,
  obsoletedFlag,
  qualifiedRemote,
  handleQuery,
  basicInfo,
  setLoading,
  aiApproveStatus,
  onIntelligentReview,
}) => {
  let buttons = [
    {
      name: 'save',
      hidden: !saveFlag,
      child: intl.get(`hzero.common.button.save`).d('保存'),
      btnProps: {
        loading,
        icon: 'save',
        type: 'primary',
        onClick: () => onSave('save'),
      },
    },
    {
      name: 'delete',
      hidden: !deleteFlag,
      child: intl.get('hzero.common.button.delete').d('删除'),
      btnProps: {
        loading,
        icon: 'delete',
        onClick: onDelete,
      },
    },
    {
      name: 'initiateReview',
      hidden: !reviewFlag,
      child: intl.get('sslm.commonApplication.view.button.initiateReview').d('发起评审'),
      btnProps: {
        loading,
        icon: 'solution',
        onClick: () => onSave('review'),
      },
    },
    {
      name: 'backScore',
      hidden: !backScoreFlag,
      child: intl.get('sslm.common.view.button.backScore').d('退回评分'),
      btnProps: {
        loading,
        icon: 'reply',
        onClick: onBackScore,
      },
    },
    {
      name: 'submitReview',
      hidden: !submitFlag,
      child: intl.get('sslm.commonApplication.view.button.submitReview').d('提交审批'),
      btnProps: {
        loading,
        icon: 'check',
        onClick: () => onSave('submit'),
      },
    },
    {
      name: 'cancel',
      hidden: !obsoletedFlag,
      child: intl.get('sslm.commonApplication.view.button.cancel').d('废弃'),
      btnProps: {
        loading,
        icon: 'close',
        onClick: onObsoleted,
      },
    },
    {
      name: 'intelligentReview',
      hidden: !processStatus,
      child: (
        <span style={{ display: !loading ? 'flex' : 'initial', alignItems: 'center' }}>
          {!loading && <IntelligentReviewIcon style={{ marginRight: '4px' }} />}
          {intl.get('sslm.common.button.intelligentReview').d('智能预审')}
        </span>
      ),
      btnProps: {
        loading,
        funcType: 'flat',
        disabled: aiApproveStatus === 'APPROVING',
        onClick: onIntelligentReview,
      },
    },
    {
      name: 'print',
      hidden: !readOnly,
      child: intl.get('hzero.common.button.print').d('打印'),
      btnProps: {
        loading,
        icon: 'printer',
        type: 'primary',
        onClick: onPrint,
      },
    },
    {
      name: 'supplierInfo',
      hidden: !processStatus,
      child: intl.get('sslm.supplierReview.view.button.supplierInfo').d('查看供应商360信息'),
      btnProps: {
        loading,
        icon: 'file-text',
        onClick: () => jump360({ ...qualifiedInfo, sourceType }, true),
      },
    },
    {
      name: 'operating',
      hidden: !processStatus,
      child: intl.get('hzero.common.button.operating').d('操作记录'),
      btnProps: {
        loading,
        icon: 'file-text',
        onClick: onOperat,
      },
    },
  ];
  const { handleButtons = undefined } = qualifiedRemote?.props?.process || {};
  buttons = isFunction(handleButtons)
    ? handleButtons(buttons, handleQuery, basicInfo, loading, setLoading, readOnly)
    : buttons;
  return customizeBtnGroup(
    {
      code: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_HEADER_BTNGROUP',
      pro: true,
    },
    <DynamicButtons
      buttons={buttons}
      permissions={btnsPermissions}
      unitCode="SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_HEADER_BTNGROUP"
    />
  );
};

export default HeaderBtns;
