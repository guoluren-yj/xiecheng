/*
 * @Date: 2024-02-27 14:21:54
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

const HeaderBtns = observer(
  ({
    remote,
    loading,
    headerDs,
    onPreview,
    onRelease,
    isAmktClient,
    customizeBtnGroup,
    investigateTemplateId,
    onGenerateInvestigate,
  }) => {
    const btns = [
      {
        name: 'release',
        child: intl.get('hzero.common.button.release').d('发布'),
        btnProps: {
          loading,
          icon: 'near_me',
          color: 'primary',
          onClick: () => onRelease(),
        },
      },
      {
        name: 'newInvestigate',
        hidden: isAmktClient,
        child: intl.get('sslm.investDefOrg.button.generateInvestigate').d('生成调查表'),
        btnProps: {
          loading,
          icon: 'baseline-file_copy',
          funcType: 'flat',
          onClick: () => onGenerateInvestigate(),
        },
      },
      {
        name: 'preview',
        child: intl.get('hzero.common.button.preview').d('预览'),
        btnProps: {
          loading,
          icon: 'plagiarism',
          funcType: 'flat',
          onClick: () => onPreview(),
          disabled: !investigateTemplateId,
        },
      },
    ];

    const buttons = remote
      ? remote.process('SSLM_PURCHASER_INVESTIGATION_CREATE_HEADER_BTNS', btns, { headerDs })
      : btns;

    return customizeBtnGroup(
      {
        code: 'SSLM.INVESTIGATION_WORKBENCH_DETAIL.CREATE_BUTTON',
        pro: true,
      },
      <DynamicButtons maxNum={5} trigger="hover" buttons={buttons} defaultBtnType="c7n-pro" />
    );
  }
);

export default HeaderBtns;
