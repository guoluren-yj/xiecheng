/*
 * HeaderBtns 详情-按钮组
 * @Date: 2024-07-02 13:38:15
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

const HeaderBtns = observer(
  ({ remote, headerDs, loading = false, handleJumpSupplierDetail = () => {} }) => {
    const btns = [
      {
        name: 'viewSupplierInfo',
        btnProps: {
          icon: 'find_in_page',
          funcType: 'flat',
          onClick: handleJumpSupplierDetail,
        },
        child: intl.get('sslm.common.view.button.viewSupplierInfo').d('查看供应商360信息'),
      },
    ].map(btn => ({
      ...btn,
      btnProps: { ...btn.btnProps, loading, waitType: 'throttle', wait: 300 },
    }));

    const buttons = remote
      ? remote.process('SSLM_SUPPLY_ABILITY_MASTER_DATA_PURCHASER_DETAIL_HEADER_BTNS', btns, {
          headerDs,
        })
      : btns;

    return <DynamicButtons buttons={buttons} maxNum={5} trigger="hover" defaultBtnType="c7n-pro" />;
  }
);

export default HeaderBtns;
