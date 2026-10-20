/**
 * 交通银行-企业支付 tab
 */
import React, { useState, useEffect } from 'react';
import { Radio, Modal, Button, Row, Col, Icon } from 'choerodon-ui';
import { isArray } from 'lodash';

import { queryMapIdpValue } from 'services/api';
import intl from 'utils/intl';
import notification from 'utils/notification';

import { externalPay } from '@/services/checkoutCounterServices';
import { BankLogoPosition, isJSON } from '../utils';
import styles from '../index.less';

function Wysepay(props) {
  const { paymentChannel = {}, orderInfo = {}, handleClose } = props;
  const { channelCode, configCode } = paymentChannel;
  const [payBank, setPayBank] = useState(null);
  const [transceneList, setTransceneList] = useState([]);

  useEffect(() => {
    fetchWysepayTransceneList();
  }, []);

  // 获取交行b2b值集数据
  const fetchWysepayTransceneList = () => {
    queryMapIdpValue({
      transceneList: 'HPAY.WYSEPAY_B2B_TRANSCENE',
    }).then((res) => {
      if (res && isArray(res.transceneList)) {
        setTransceneList(res.transceneList);
      }
    });
  };

  // 跳转支付
  const fetchJumpPay = async (bankType) => {
    const res = await externalPay({
      ...orderInfo,
      channelCode,
      configCode,
      bankType,
    });
    if (isJSON(res)) {
      const resJson = JSON.parse(res);
      notification.error({
        message: resJson.message,
      });
    } else {
      renderJumpPayForm(res);
    }
  };

  const renderJumpPayForm = (formCode) => {
    // 防止重复运行
    if (!document.forms._wysesubmit_) {
      const formText = formCode.slice(0, formCode.indexOf('<script>'));
      const jumpPayForm = document.getElementById('jumpPayForm');
      jumpPayForm.innerHTML = formText;
      const script = document.createElement('script');
      script.async = true;
      script.id = 'wysesubmit';
      script.text = "document.forms['_wysesubmit_'].submit();";
      document.body.appendChild(script);
    }
  };

  const handleLinkPay = () => {
    if (!payBank) {
      Modal.warning({
        title: intl.get('hpay.checkoutCounter.view.message.notChoosePayBank').d('请选择支付银行'),
      });
    } else {
      fetchJumpPay(payBank);
    }
  };

  return (
    <>
      <div className={styles['payment-banks-container']}>
        <div className={styles['payment-banks-container-header']}>
          <Icon type="sentiment_satisfied" />
          {intl
            .get('hpay.checkoutCounter.view.message.paymentTip')
            .d('本次支付方式为企业对公转账支付')}
        </div>
        <Radio.Group name="paymentType" onChange={(event) => setPayBank(event.target.value)}>
          <Row className={styles['payment-banks-list']}>
            {transceneList.map((item) => (
              <Col className={styles['payment-banks-list-item']} span={12}>
                <Radio key={item.value} value={item.value}>
                  <div
                    className={styles['bank-list-logo']}
                    style={{ backgroundPosition: BankLogoPosition[item.value] }}
                  />
                </Radio>
              </Col>
            ))}
          </Row>
        </Radio.Group>
        <div id="jumpPayForm" />
      </div>
      <div className={styles['payment-banks-container-footer']}>
        <Button onClick={() => handleClose(false)}>
          {intl.get('hzero.common button.cancel').d('取消')}
        </Button>
        <Button onClick={handleLinkPay}>{intl.get('hzero.common.button.ok').d('确定')}</Button>
      </div>
    </>
  );
}

export default Wysepay;
