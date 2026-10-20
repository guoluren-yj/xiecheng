/*
 * @Date: 2024-02-27 14:21:54
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { useObserver } from 'mobx-react-lite';
import DynamicButtons from '_components/DynamicButtons';

import { handleJoinedMointor } from '@/routes/components/utils/utils';
import { handleRevokeApprova, handleApprove } from '@/routes/components/WorkFlowApproval';
import { openRelationChart } from '@/routes/components/EnterpriseRelationSearch';

const permissionList = [
  {
    name: 'print',
    meaning: '我发出的调查表-打印',
    code: `srm.partner.purchaser-investigation-workbench.api.ps.print`,
  },
  {
    name: 'approval',
    code: 'srm.partner.purchaser-investigation-workbench.button.detail.approval',
    meaning: '审批',
  },
  {
    name: 'revokeApproval',
    code: 'srm.partner.purchaser-investigation-workbench.button.detail.repeal-approval',
    meaning: '撤销审批',
  },
];

const HeaderBtns = ({
  remote,
  isPub,
  onSave,
  onAgree,
  onCancel,
  onOperate,
  onRelease,
  onDelete,
  onPrint,
  loading,
  headerDs,
  location,
  editFlag,
  inviteBtn,
  sourceKey,
  dispatch,
  investRef,
  setLoading,
  compareFlag,
  cancelBtnFlag,
  showCompareBtn,
  customizeCode,
  onInviteReject,
  customizeBtnGroup,
  onVersionCompare,
  onInvestigateReject,
  approvalBtnInfo = {},
  handleQuery = () => {},
}) => {
  const {
    domesticForeignRelation,
    businessKey,
    investgHeaderId,
    partnerCompanyName: supplierCompanyName,
  } = useObserver(
    () =>
      headerDs?.current?.get([
        'domesticForeignRelation',
        'businessKey',
        'investgHeaderId',
        'partnerCompanyName',
      ]) || {}
  );

  // 审批，撤销审批按钮
  const { approvalDataMap, revokeDataMap } = approvalBtnInfo || {};
  const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};

  // 风险扫描
  const handleScan = () => {
    const basicInfo = headerDs?.current?.toData() || {};
    const { companyId, partnerCompanyId, partnerCompanyName } = basicInfo;
    handleJoinedMointor({
      setLoading,
      companyId,
      supplierCompanyId: partnerCompanyId,
      companyName: partnerCompanyName,
    });
  };

  const btns = [
    {
      name: 'release',
      hidden: !editFlag || sourceKey !== 'waitRelease',
      child: intl.get('hzero.common.button.release').d('发布'),
      btnProps: {
        icon: 'near_me',
        color: 'primary',
        onClick: () => onRelease(),
      },
    },
    {
      name: 'save',
      hidden: !editFlag || sourceKey !== 'waitRelease',
      child: intl.get('hzero.common.button.save').d('保存'),
      btnProps: {
        icon: 'save',
        funcType: 'flat',
        onClick: () => onSave(),
      },
    },
    {
      name: 'delete',
      hidden: !editFlag || sourceKey !== 'waitRelease',
      child: intl.get('hzero.common.button.delete').d('删除'),
      btnProps: {
        icon: 'delete',
        funcType: 'flat',
        onClick: () => onDelete(),
      },
    },
    {
      name: 'agree',
      hidden: isPub || sourceKey !== 'waitApprove',
      child: intl.get('hzero.common.button.agree').d('同意'),
      btnProps: {
        icon: 'check',
        color: 'primary',
        onClick: () => onAgree(),
      },
    },
    {
      name: 'investeApprovalRefuse',
      hidden: isPub || sourceKey !== 'waitApprove',
      child: intl
        .get('sslm.investigCorrelat.view.button.investigateApprovalRefuse')
        .d('调查表审批拒绝'),
      btnProps: {
        icon: 'close',
        funcType: 'flat',
        onClick: () => onInvestigateReject(),
      },
    },
    {
      name: 'inviteRefuse',
      hidden: !inviteBtn || isPub || sourceKey !== 'waitApprove',
      child: intl.get('sslm.investigCorrelat.view.button.inviteRefuse').d('邀约拒绝'),
      btnProps: {
        icon: 'close',
        funcType: 'flat',
        onClick: () => onInviteReject(),
      },
    },
    {
      name: 'cancel',
      hidden: sourceKey !== 'all' || cancelBtnFlag,
      child: intl.get('hzero.common.button.cancel').d('取消'),
      btnProps: {
        icon: 'close',
        funcType: 'flat',
        onClick: () => onCancel(),
      },
    },
    {
      name: 'print',
      hidden: sourceKey !== 'all',
      child: intl.get('hzero.common.button.print').d('打印'),
      btnProps: {
        icon: 'print',
        funcType: 'flat',
        onClick: () => onPrint(),
      },
    },
    {
      name: 'operation',
      hidden: sourceKey === 'waitRelease',
      child: intl.get('hzero.common.button.operating').d('操作记录'),
      btnProps: {
        icon: 'operation_service_request',
        funcType: 'flat',
        onClick: () => onOperate(),
      },
    },
    {
      name: 'versionComparison',
      hidden: sourceKey === 'waitRelease' || !showCompareBtn,
      child: compareFlag
        ? intl.get('hzero.common.button.cancelComparison').d('取消对比')
        : intl.get('hzero.common.button.versionComparison').d('版本对比'),
      btnProps: {
        icon: 'compare',
        funcType: 'flat',
        onClick: () => onVersionCompare(),
      },
    },
    {
      name: 'scan',
      hidden: domesticForeignRelation !== 1,
      child: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
      btnProps: {
        icon: 'document_scanner-o',
        funcType: 'flat',
        onClick: () => handleScan(),
      },
    },
    {
      name: 'approval',
      hidden: isEmpty(approvalDataMap) || sourceKey !== 'all' || isPub,
      child: intl.get('hzero.common.button.approval').d('审批'),
      btnProps: {
        funcType: 'flat',
        icon: 'authorize',
        onClick: () =>
          handleApprove({
            approveProps: {
              ...approvalBtnProps,
              onSuccess: () => handleQuery(investgHeaderId),
            },
          }),
      },
    },
    {
      name: 'revokeApproval',
      hidden: isEmpty(revokeDataMap) || sourceKey !== 'all' || isPub,
      child: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
      btnProps: {
        funcType: 'flat',
        icon: 'reply',
        onClick: () =>
          handleRevokeApprova({
            businessKey,
            onSuccess: () => handleQuery(investgHeaderId),
          }),
      },
    },
    {
      name: 'relationSearch',
      hidden: sourceKey !== 'waitApprove',
      child: intl.get('sslm.common.view.common.relationSearch').d('关系排查'),
      btnProps: {
        icon: 'relate',
        funcType: 'flat',
        onClick: () => openRelationChart({ supplierCompanyName, businessType: 'QUESTIONNAIRE' }),
      },
    },
  ].map(btn => ({
    ...btn,
    btnProps: { ...btn.btnProps, loading, wait: 500, waitType: 'throttle' },
  }));
  const buttons = remote
    ? remote.process('SSLM_PURCHASER_INVESTIGATION_DETAIL_HEADER_BTNS', btns, {
        headerDs,
        isPub,
        dispatch,
        location,
        sourceKey,
        handleQuery,
        loading,
        investRef,
        setLoading,
      })
    : btns;

  return customizeBtnGroup(
    {
      code: customizeCode,
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
