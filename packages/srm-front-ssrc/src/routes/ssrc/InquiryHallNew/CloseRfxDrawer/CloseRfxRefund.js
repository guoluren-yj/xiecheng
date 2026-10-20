/**
 * closeRFX - 关闭询价单
 * */
import React, { Component } from 'react';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import notification from 'utils/notification';

/**
 * c7n关闭询价单退费二次确认
 * @param {*} formDS 关闭询价单的ds
 * @param {*} documentTypeName 单据类型
 */
@withCustomize({
  unitCode: [
    'SSRC.INQUIRY_HALL.NEW_LIST.REFUND_MODAL_BUTTON',
    'SSRC.BID_HALL.NEW_LIST.REFUND_MODAL_BUTTON',
  ],
})
class CloseRfxRefundFooter extends Component {
  rfxRefundMpdalKey = Modal.key();

  async refundTypeChoose(flag) {
    const { formDS = {}, closeRefund = () => {} } = this.props;
    formDS.setQueryParameter('bidFileExpenseReturnFlag', flag ? 1 : 0);
    try {
      await formDS.submit();
    } catch (e) {
      notification.error({
        message: intl.get('hzero.common.notification.error').d('操作失败'),
        description: e.message,
      });
      return false;
    }
    closeRefund();
  }

  getButtons() {
    const { closeRefund = () => {}, code = '', formDS = {} } = this.props;
    return [
      {
        name: 'cancel',
        child: intl.get(`ssrc.common.view.button.cancel`).d('取消'),
        btnProps: {
          onClick: () => closeRefund(),
        },
      },
      
      code === 'info.ssrc.exist_deposit_service_expense' && {
        name: 'okBtn',
        child: intl.get(`hzero.common.button.ok`).d('确定'),
        btnProps: {
          onClick: async () => {
            try {
              await formDS.submit();
            } catch (e) {
              notification.error({
                message: intl.get('hzero.common.notification.error').d('操作失败'),
                description: e.message,
              });
              return false;
            }
            closeRefund();
          },
        },
      },
      (code === 'info.ssrc.exist_source_expense' ||
        code === 'info.ssrc.exist_bid_file_expense') && {
        name: 'refundOfNotBidFee',
        btnProps: { onClick: () => this.refundTypeChoose(false) },
        child: intl.get('ssrc.inquiryHall.view.message.button.refundOfNotBidFee').d('不退还标书费'),
      },
      (code === 'info.ssrc.exist_source_expense' ||
        code === 'info.ssrc.exist_bid_file_expense') && {
        name: 'refundOfBidFee',
        btnProps: { type: 'primary', onClick: () => this.refundTypeChoose(true) },
        child: intl.get('ssrc.inquiryHall.view.message.button.refundOfBidFee').d('退还标书费'),
      },
    ].filter(Boolean);
  }

  render() {
    const { customizeBtnGroup = () => {}, sourceKey = 'INQUIRY' } = this.props;
    return customizeBtnGroup(
      {
        code: `SSRC.${sourceKey}_HALL.NEW_LIST.REFUND_MODAL_BUTTON`,
        pro: true,
      },
      <DynamicButtons buttons={this.getButtons()} />
    );
  }
}

export default function closeRfxRefund(res = {}, formDS = {}, sourceKey = 'INQUIRY') {
  let closeRfxRefundModal = '';
  const { code = '', message = '' } = res;
  const closeRefund = () => {
    if (closeRfxRefundModal) {
      closeRfxRefundModal.close();
    }
  };
  const refundProps = {
    closeRefund,
    code,
    formDS,
    sourceKey,
  };
  closeRfxRefundModal = Modal.open({
    destroyOnClose: true,
    closable: true,
    key: Modal.key(),
    children: message,
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    footer: <CloseRfxRefundFooter {...refundProps} />,
  });
}
