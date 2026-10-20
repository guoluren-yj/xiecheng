import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const { confirm } = Modal;

function confirmModal(info, callBackFn, reqFun, opr) {
  const caption = {
    CANCEL: intl.get('hzero.common.btn.cancel').d('取消'),
    APPROVE: intl.get('hzero.common.button.return').d('退回'),
    CANCELDETAIL: intl.get('hzero.common.btn.cancel').d('取消'),
    CANCELSETTLELINE: intl
      .get('ssta.purchaseSettle.view.message.cancelSettleLine')
      .d('取消结算单行'),
    CANCELSIGNATURE: intl.get('ssta.common.model.common.eSignLinkCancel').d('取消签章'),
    TERMINATE: intl.get('ssta.common.model.common.terminate').d('解约'),
  };
  const action = caption[info.action];
  confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    children: (
      <span>
        <span>{intl.get('ssta.purchaseSettle.view.message.confirm').d('确定要')}</span>
        <span>{action}</span>
        {info.bills}?
      </span>
    ),
    onOk() {
      callBackFn(reqFun, opr);
    },
    onCancel() {},
  });
}

export { confirmModal };
