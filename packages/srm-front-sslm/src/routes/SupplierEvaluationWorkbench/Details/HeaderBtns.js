/*
 * @Date: 2026-03-06 17:40:57
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

const HeaderBtns = props => {
  const { remote, loading, onSave, readOnly, onSubmit } = props;

  const btns = [
    {
      name: 'submit',
      hidden: readOnly,
      child: intl.get(`sslm.purchaserEvaluationDetail.button.header.submit`).d('提交'),
      btnProps: {
        loading,
        icon: 'done',
        color: 'primary',
        onClick: onSubmit,
      },
    },
    {
      name: 'save',
      hidden: readOnly,
      child: intl.get(`hzero.common.button.save`).d('保存'),
      btnProps: {
        loading,
        icon: 'save',
        funcType: 'flat',
        onClick: onSave,
      },
    },
  ];
  const buttons = remote.process('SSLM_SUPPLIER_EVALUATION_WORKBENCH_DETAIL_HEADER_BTNS', btns, {
    ...props,
  });

  return <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />;
};

export default HeaderBtns;
