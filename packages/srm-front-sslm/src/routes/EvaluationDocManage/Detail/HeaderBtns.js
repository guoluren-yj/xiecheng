/*
 * @Date: 2024-03-26 15:57:58
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

const permissionList = [
  {
    name: 'quality',
    meaning: '考评档案管理-发起质量整改',
    code: 'srm.partner.evaluation-manage.eval-doc.ps.edit.quality',
  },
  {
    name: 'invalid',
    meaning: '考评档案管理-作废',
    code: 'srm.partner.evaluation-manage.eval-doc.button.discard',
  },
  {
    name: 'graderTransfer',
    meaning: '考评档案管理-评分人转交',
    code: 'srm.partner.evaluation-manage.eval-doc.ps.transform',
  },
];

const HeaderBtns = ({
  isPub,
  isEdit,
  onSave,
  loading,
  onScore,
  onViewLog,
  onPublish,
  onDestroy,
  onSumCheck,
  onBackScore,
  sumDisabled,
  invalidFlag,
  onRecalculate,
  onSubmitReview,
  submitDisabled,
  saveBtnDisabled,
  showExecuteFlag,
  recalculateFlag,
  onGraderTransfer,
  scoreSumSelected,
  backScoreDisabled,
  customizeBtnGroup,
  showSubmitNewflag,
  publishBtnDisabled,
  graderTransferFlag,
  onSubmitNewApproval,
  onQualityRectification,
  qualityRectifyDisabled,
}) => {
  const showBtn = isEdit && !isPub;
  const buttons = [
    {
      name: 'save',
      hidden: saveBtnDisabled,
      child: intl.get(`hzero.common.button.save`).d('保存'),
      btnProps: {
        icon: 'save',
        color: 'primary',
        onClick: () => onSave(true),
      },
    },
    {
      name: 'submitNewApproval',
      hidden: !(showBtn && showSubmitNewflag),
      child: intl.get(`sslm.supplierDocManage.view.button.submitNewApproval`).d('提交新建审批'),
      btnProps: {
        icon: 'check',
        onClick: () => onSubmitNewApproval(),
      },
    },
    {
      name: 'execute',
      hidden: !(showBtn && showExecuteFlag),
      child: intl.get(`sslm.supplierDocManage.view.button.execute`).d('执行评分'),
      btnProps: {
        icon: 'check',
        onClick: () => onScore(),
      },
    },
    {
      name: 'sum',
      hidden: !(showBtn && !sumDisabled),
      child: intl.get(`sslm.supplierDocManage.view.button.sum`).d('汇总统计'),
      btnProps: {
        icon: 'bar_chart',
        onClick: () => onSumCheck(),
      },
    },
    {
      name: 'backScore',
      hidden: !(showBtn && !backScoreDisabled),
      child: intl.get(`sslm.supplierDocManage.view.button.backScore`).d('退回评分'),
      btnProps: {
        icon: 'reply',
        onClick: () => onBackScore(),
      },
    },
    {
      name: 'recalculate',
      hidden: !(showBtn && recalculateFlag),
      child: intl.get(`sslm.supplierDocManage.view.button.recalculate`).d('重新计算'),
      btnProps: {
        icon: 'update',
        onClick: () => onRecalculate(),
        help: intl
          .get('sslm.supplierDocManage.view.tooltip.recalculateWarn')
          .d('重新计算所有系统计算指标的得分，已完成的手工评分指标不受影响'),
      },
    },
    {
      name: 'submitReview',
      hidden: !(showBtn && !submitDisabled),
      child: intl.get(`sslm.commonApplication.view.button.submitReview`).d('提交审批'),
      btnProps: {
        icon: 'check',
        onClick: () => onSubmitReview(),
      },
    },
    {
      name: 'releaseLines',
      hidden: !(showBtn && publishBtnDisabled),
      child: scoreSumSelected
        ? intl.get(`sslm.supplierDocManage.view.button.releaseCheckedLines`).d('发布勾选行')
        : intl.get(`sslm.supplierDocManage.view.button.releaseAllLines`).d('发布全部行'),
      btnProps: {
        icon: 'rocket',
        color: 'primary',
        onClick: () => onPublish(),
        help: intl
          .get('sslm.supplierDocManage.view.tooltip.releaseLinesWarn')
          .d('仅针对行状态为“待发布”的考评结果进行发布'),
      },
    },
    {
      name: 'quality',
      hidden: !(showBtn && !qualityRectifyDisabled),
      child: intl.get('sslm.supplierDocManage.view.button.qualityRectification').d('发起质量整改'),
      btnProps: {
        icon: 'link',
        onClick: () => onQualityRectification(),
      },
    },
    {
      name: 'invalid',
      hidden: !(showBtn && invalidFlag),
      child: intl.get(`sslm.supplierDocManage.view.button.invalid`).d('作废'),
      btnProps: {
        icon: 'delete',
        onClick: () => onDestroy(),
      },
    },
    {
      name: 'operationRecord',
      hidden: !isEdit,
      child: intl.get(`sslm.supplierDocManage.view.button.log`).d('操作记录'),
      btnProps: {
        icon: 'operation_service_request',
        onClick: () => onViewLog(),
      },
    },
    {
      name: 'graderTransfer',
      hidden: !(showBtn && graderTransferFlag),
      child: intl.get('sslm.supplierDocManage.view.button.graderTransfer').d('评分人转交'),
      btnProps: {
        icon: 'transfer_within_a_station',
        onClick: () => onGraderTransfer(),
      },
    },
  ].map(btn => ({ ...btn, btnProps: { ...btn.btnProps, loading } }));

  return customizeBtnGroup(
    {
      code: 'SSLM.EVALUATION_DOC_MANAGE_DETAIL.HEADER_BTNGROUP',
      pro: true,
    },
    <DynamicButtons
      maxNum={5}
      trigger="hover"
      buttons={buttons}
      defaultBtnType="c7n-pro"
      permissions={permissionList}
    />
  );
};

export default HeaderBtns;
