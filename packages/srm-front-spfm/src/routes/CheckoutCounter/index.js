import React, { useState, useEffect } from 'react';
import { Radio, Row, Col, Button, Modal } from 'choerodon-ui';
import queryString from 'query-string';
import { isEmpty } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';

import logo from '@/assets/payment/zylogo.png';
import {
  getPaymentOrder,
  getNewPaymentOrder,
  getPayConfig,
  reGenerateOrder,
  getNewPayConfig,
} from '@/services/checkoutCounterServices';

import Header from './components/Header';
import PaymentModal from './PaymentModal';
import { renderPaymentChannelLogo, showOrderPaidResult } from './utils';
import styles from './index.less';

const CheckoutCounter = (props) => {
  const [orderInfo, setOrderInfo] = useState({}); // 订单信息
  const [paymentChannel, setPaymentChannel] = useState([]); // 支付方式
  const [payConfigList, setPayConfigList] = useState([]); // 支付配置
  const [modalVisible, setModalVisible] = useState(false); // 支付弹窗显隐标识

  useEffect(async () => {
    await fetchPayConfig();
  }, []);

  const fetchOrderInfo = async (serviceFlag) => {
    const {
      location: { search = '' },
    } = props;
    const { paymentOrderNum } = queryString.parse(search);

    let order = {};
    if (serviceFlag === 'old') {
      order = await getPaymentOrder(paymentOrderNum);
    } else if (serviceFlag === 'new') {
      order = await getNewPaymentOrder(paymentOrderNum);
    }

    if (isEmpty(order)) {
      notification.error({
        message: intl.get('hpay.checkoutCounter.view.title.invalidOrder').d('无效的订单！'),
      });
    } else {
      const { status } = order;
      // PAID 已支付订单
      switch (status) {
        case 'PAID': {
          notification.warning({
            message: intl
              .get('hpay.checkoutCounter.view.title.alreadyPaid')
              .d('当前订单已经支付过了，请勿重复操作！'),
          });
          setTimeout(() => {
            showOrderPaidResult(order);
          }, 2500);
          break;
        }
        case 'CANCELLED': {
          // 取消支付的订单 重新生单
          handleReGenerateOrder(paymentOrderNum);
          break;
        }
        default: {
          setOrderInfo({
            ...order,
            paymentOrderNum,
          });
        }
      }
    }
  };

  const handleReGenerateOrder = async (paymentOrderNum) => {
    const result = await reGenerateOrder(paymentOrderNum);
    if (result) {
      if (result.code === 'success') {
        notification.warning({
          message: intl
            .get('hpay.checkoutCounter.view.title.alreadyPaid')
            .d('当前订单已经支付过了，请勿重复操作！'),
        });
        setTimeout(() => {
          showOrderPaidResult(orderInfo);
        }, 2500);
      } else if (result.data) {
        const newOrder = result.data;
        setOrderInfo(newOrder);
      }
    }
  };

  const fetchPayConfig = async () => {
    const {
      location: { search = '' },
    } = props;
    const { payCenter = '' } = queryString.parse(search);
    let list = null;
    let serviceFlag = 'old';

    if (payCenter === 1 || payCenter === '1') {
      // 新服务
      list = await getNewPayConfig();
      serviceFlag = 'new';
    } else {
      list = await getPayConfig();
    }

    const dataList = list && list.content && list.content.length ? list.content : [];

    fetchOrderInfo(serviceFlag);

    if (dataList && dataList.length) {
      const { channelTrxType } = queryString.parse(search);
      let configList = [];
      if (channelTrxType) {
        configList = dataList.filter((item) => {
          if (item.extParam) {
            if (item.extParam.channelTrxType === 'QR' && channelTrxType !== 'qrcode') {
              return false;
            }
            if (item.extParam.channelTrxType === 'PC' && channelTrxType !== 'link') {
              return false;
            }
          }
          return true;
        });
      }
      setPayConfigList(configList);
    }
  };

  const handlePay = () => {
    if (isEmpty(paymentChannel)) {
      Modal.warning({
        title: intl.get('hpay.checkoutCounter.view.message.notChoosePayType').d('请选择支付方式'),
      });
    } else {
      setModalVisible(true);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.logo}>
        <a className={styles['logo-icon']}>
          <img src={logo} alt={intl.get('hpay.checkoutCounter.view.img.logo').d('logo')} />
          <span>{intl.get('hpay.checkoutCounter.view.title.checkoutCounter').d('收银台')}</span>
        </a>
      </div>
      <div className={styles.content}>
        <div className={styles['payment-type-title']}>
          {intl.get('hpay.checkoutCounter.view.title.choosePayType').d('选择付款方式')}
        </div>
        <div className={styles['payment-order']}>
          <div className={styles['payment-order-num']}>
            <span>{intl.get('hpay.checkoutCounter.view.title.orderId').d('订单编号')}</span>
            <span>{orderInfo.paymentOrderNum}</span>
          </div>
          <div className={styles['payment-order-amount']}>
            <span>{intl.get('hpay.checkoutCounter.view.title.amount').d('应付金额')}</span>
            <span>
              ({orderInfo.currencyCode}){orderInfo.paymentAmount}
            </span>
          </div>
        </div>
        <div className={styles['payment-card']}>
          <div className={styles['payment-card-title']}>
            {intl.get('hpay.checkoutCounter.view.title.payType').d('支付方式')}
          </div>
          <Radio.Group
            name="paymentType"
            onChange={(event) => setPaymentChannel(event.target.value)}
          >
            <Row className={styles['payment-card-content']}>
              {!isEmpty(orderInfo) &&
                payConfigList.map((item) => (
                  <Col span={6}>
                    <Radio
                      key={item.channelCode}
                      value={item}
                      className={styles['payment-radio-item']}
                    >
                      {renderPaymentChannelLogo(item)}
                      {/* <img
                        className={styles['payment-type-icon']}
                        alt={item.channelMeaning}
                        src={PaymentChannelLogo[item.channelCode].icon}
                      /> */}
                    </Radio>
                  </Col>
                ))}
            </Row>
          </Radio.Group>
        </div>
        {!isEmpty(orderInfo) && (
          <div className={styles['payment-card-footer']}>
            <Button funcType="raised" onClick={handlePay}>
              {intl.get('hpay.checkoutCounter.view.button.payNow').d('立即支付')}
            </Button>
          </div>
        )}
      </div>
      <PaymentModal
        orderInfo={orderInfo}
        modalVisible={modalVisible}
        paymentChannel={paymentChannel}
        handleClose={setModalVisible}
        handleRefreshOrder={setOrderInfo}
      />
    </div>
  );
};

export default formatterCollections({
  code: ['hpay.checkoutCounter', 'spfm.checkoutCounter'],
})(CheckoutCounter);
