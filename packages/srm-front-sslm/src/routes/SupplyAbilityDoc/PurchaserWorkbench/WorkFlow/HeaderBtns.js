/*
 * @Date: 2025-08-27 11:32:37
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { operationRecordsModal } from '@/routes/components/OperationRecords';

const permissions = [
  {
    name: 'supplierInfo',
    code: 'srm.partner.supply-ability-doc-purchaser.button.360info',
    meaning: '供应商360信息',
  },
];

const HeaderBtns = observer(
  ({ loading, abilityReqId, onSupplement, customizeBtnGroup, headerInfo = {} }) => {
    const buttons = [
      {
        name: 'infoSupplement',
        child: intl.get('sslm.common.model.field.infoSupplement').d('信息补录'),
        btnProps: {
          loading,
          color: 'primary',
          icon: 'mode_edit',
          onClick: () => onSupplement(),
        },
      },
      {
        name: 'operationRecord',
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: () =>
            operationRecordsModal({
              documentType: 'SUPPLY_ABILITY_CHANGE_REQ',
              documentId: abilityReqId,
            }),
        },
        child: intl.get('hzero.common.button.operation').d('操作记录'),
      },
      {
        name: 'supplierInfo',
        child: intl.get('sslm.common.view.button.supplierInfo').d('供应商360信息'),
        btnProps: {
          icon: 'find_in_page',
          funcType: 'flat',
          onClick: () => handleSupplierDetail(headerInfo),
        },
      },
    ].map(btn => ({
      ...btn,
      btnProps: { ...btn.btnProps, loading, waitType: 'throttle', wait: 300 },
    }));

    return customizeBtnGroup(
      {
        code: 'SUPPLY_ABILITY_DOC.PURCHASER_DETAIL_CUSTOM.HEADER_BTNS',
        pro: true,
      },
      <DynamicButtons
        buttons={buttons}
        maxNum={5}
        trigger="hover"
        defaultBtnType="c7n-pro"
        permissions={permissions}
      />
    );
  }
);

export default HeaderBtns;
