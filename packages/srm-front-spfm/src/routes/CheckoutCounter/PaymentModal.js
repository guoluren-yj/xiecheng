import React, { useMemo } from 'react';
import { Modal } from 'choerodon-ui';

import intl from 'utils/intl';

import Wysepay from './tabs/Wysepay';
import Wyseqrpay from './tabs/Wyseqrpay';
import Alipay from './tabs/Alipay';
import Wxpay from './tabs/Wxpay';
import Unionpay from './tabs/Unionpay';
import styles from './index.less';

function PaymentModal(props) {
  const { modalVisible, orderInfo, paymentChannel = {}, handleClose, handleRefreshOrder } = props;
  const { channelCode, extParam = {}, channelMeaning } = paymentChannel;
  const { channelTrxType } = extParam;

  const modalTitle = useMemo(() => {
    let title = '';

    if (channelCode === 'alipay' || channelCode === 'wxpay') {
      title = channelMeaning;
    } else {
      title =
        channelTrxType === 'PC'
          ? intl.get('hpay.checkoutCounter.view.title.companyPayment').d('企业支付')
          : channelTrxType === 'QR'
          ? intl.get('hpay.checkoutCounter.view.title.wyseqrpay').d('交通银行聚合码')
          : channelMeaning;
    }

    return title;
  }, [paymentChannel]);

  const renderChannelComponent = () => {
    let ChannelComponent;
    switch (channelCode) {
      case 'wysepay':
        ChannelComponent = channelTrxType === 'PC' ? Wysepay : Wyseqrpay;
        break;
      case 'alipay':
        ChannelComponent = Alipay;
        break;
      case 'wxpay':
        ChannelComponent = Wxpay;
        break;
      case 'unionpay':
        ChannelComponent = Unionpay;
        break;
      default:
        return null;
    }
    return (
      <ChannelComponent
        paymentChannel={paymentChannel}
        orderInfo={orderInfo}
        handleClose={handleClose}
        handleRefreshOrder={handleRefreshOrder}
      />
    );
  };

  return (
    <Modal
      title={modalTitle}
      destroyOnClose
      maskClosable={false}
      wrapClassName={styles['payment-modal']}
      visible={modalVisible}
      width={560}
      footer={null}
      onCancel={() => handleClose(false)}
    >
      {renderChannelComponent()}
    </Modal>
  );
}

export default PaymentModal;
