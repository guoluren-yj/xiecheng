/*
 * @Date: 2024-06-26 14:21:54
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import { handleJoinedMointor } from '@/routes/components/utils/utils';
import { openRelationChart } from '@/routes/components/EnterpriseRelationSearch';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/common/intelligentReview.svg';

import { btnsPermissions } from '../utils';

const HeaderBtns = ({
  loading = false,
  isPub = false,
  basic = {},
  aiApproveStatus,
  customizeBtnGroup,
  approvalDataMap = {},
  revokeDataMap = {},
  handleWeakModal = () => {},
  onIntelligentReview = () => {},
  handleRejectModal = () => {},
  handleCertification = () => {},
  handleSave = () => {},
  handleOperate = () => {},
  handleApprove = () => {},
  handleRevokeApprova = () => {},
  setLoading = () => {},
  certificationDealRemote,
  remoteBtnProps = {},
}) => {
  const { reqStatus, certificationStatus, companyName } = basic || {};
  // 状态为 SUBMIT，WFL_REJECT 时显示操作按钮
  const isEdit = ['SUBMIT', 'WFL_REJECT'].includes(reqStatus);
  const isNoNeed = certificationStatus === 'NO_NEED';
  const isDisable = isPub || !isEdit;

  // 风险扫描
  const handleScan = () => {
    handleJoinedMointor({
      setLoading,
      companyName,
      documentType: 'SSLM_CERTIFICATION_TENANT_APPROVAL',
    });
  };

  const buttons = [
    {
      name: 'approve',
      hidden: isDisable,
      child: intl.get('hzero.common.button.approvalAdopt').d('审批通过'),
      btnProps: {
        icon: 'check_circle',
        color: 'green',
        onClick: handleWeakModal,
      },
    },
    {
      name: 'reject',
      hidden: isDisable,
      child: intl.get(`hzero.common.view.message.title.reject`).d('审批拒绝'),
      btnProps: {
        icon: 'cancel',
        color: 'red',
        onClick: handleRejectModal,
      },
    },
    {
      name: 'verify',
      hidden: isDisable || isNoNeed,
      child: intl.get('spfm.certificationApproval.view.button.verify').d('三证验证'),
      btnProps: {
        icon: 'verified_user',
        funcType: 'flat',
        onClick: handleCertification,
      },
    },
    {
      name: 'intelligentReview',
      hidden: isDisable,
      child: (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {!loading && <IntelligentReviewIcon style={{ marginRight: '4px' }} />}
          {intl.get('sslm.common.button.intelligentReview').d('智能预审')}
        </span>
      ),
      btnProps: {
        funcType: 'flat',
        disabled: aiApproveStatus === 'APPROVING',
        onClick: onIntelligentReview,
      },
    },
    {
      name: 'save',
      hidden: isDisable,
      child: intl.get('hzero.common.button.save').d('保存'),
      btnProps: {
        icon: 'save',
        funcType: 'flat',
        onClick: handleSave,
      },
    },
    {
      name: 'operation',
      child: intl.get(`hzero.common.button.operating`).d('操作记录'),
      btnProps: {
        icon: 'operation_service_request',
        funcType: 'flat',
        onClick: handleOperate,
      },
    },
    {
      name: 'approval',
      hidden: isEmpty(approvalDataMap) || isPub,
      child: intl.get('hzero.common.button.approval').d('审批'),
      btnProps: {
        funcType: 'flat',
        icon: 'authorize',
        onClick: () => handleApprove(),
      },
    },
    {
      name: 'revokeApproval',
      hidden: isEmpty(revokeDataMap) || isPub,
      child: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
      btnProps: {
        funcType: 'flat',
        icon: 'reply',
        onClick: () => handleRevokeApprova(),
      },
    },
    {
      name: 'scan',
      hidden: isPub,
      child: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
      btnProps: {
        icon: 'document_scanner-o',
        funcType: 'flat',
        onClick: () => handleScan(),
      },
    },
    {
      name: 'relationSearch',
      child: intl.get('sslm.common.view.common.relationSearch').d('关系排查'),
      btnProps: {
        icon: 'relate',
        funcType: 'flat',
        onClick: () =>
          openRelationChart({
            supplierCompanyName: companyName,
            businessType: 'SUPPLIER_INVITATION',
          }),
      },
    },
  ].map(btn => ({
    ...btn,
    btnProps: { ...btn.btnProps, loading, waitType: 'throttle', wait: 500 },
  }));

  // 埋点
  const newBtns = certificationDealRemote
    ? certificationDealRemote.process(
        'SSLM_CERTIFICATIONDEAL_DETAIL_HEADER_BTN_PROCESS',
        buttons,
        remoteBtnProps
      )
    : buttons;

  return customizeBtnGroup(
    {
      code: 'SSLM.ENT_CER_PRO.HEADER_BTNS',
      pro: true,
    },
    <DynamicButtons
      maxNum={5}
      trigger="hover"
      buttons={newBtns}
      defaultBtnType="c7n-pro"
      permissions={btnsPermissions}
    />
  );
};

export default HeaderBtns;
