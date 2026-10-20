/*
 * @Date: 2026-02-02 15:53:24
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

const HeaderBtns = ({
  remote,
  loading,
  onAgree,
  investgHeaderId,
  onAgreeCooperate,
  onInviteReject,
  onInvestigateReject,
}) => {
  const btns = [
    {
      name: 'agree',
      hidden: !investgHeaderId,
      child: intl.get('hzero.common.button.agree').d('同意'),
      btnProps: {
        color: 'green',
        icon: 'check_circle',
        onClick: () => onAgree(),
      },
    },
    {
      name: 'agreeCooperation',
      hidden: investgHeaderId,
      child: intl.get(`spfm.disposeInvite.view.message.agree`).d('同意合作'),
      btnProps: {
        color: 'green',
        icon: 'check_circle',
        onClick: () => onAgreeCooperate(),
      },
    },
    {
      name: 'inviteRefuse',
      child: intl.get('sslm.investigCorrelat.view.button.inviteRefuse').d('邀约拒绝'),
      btnProps: {
        color: 'red',
        icon: 'cancel',
        onClick: () => onInviteReject(),
      },
    },
    {
      name: 'investigateRefuse',
      hidden: !investgHeaderId,
      child: intl.get('sslm.investigCorrelat.view.title.investigateRefuse').d('调查表拒绝'),
      btnProps: {
        icon: 'cancel',
        funcType: 'flat',
        onClick: () => onInvestigateReject(),
      },
    },
  ].map(btn => ({
    ...btn,
    btnProps: {
      ...btn.btnProps,
      loading,
      wait: 500,
      waitType: 'throttle',
    },
  }));

  const buttons = remote.process(
    'SSLM.SUPPLIER_INVITE_MANAGE_DETAIL.INVITE_DEAL_HEADER_BTNS',
    btns
  );

  return <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />;
};

export default HeaderBtns;
