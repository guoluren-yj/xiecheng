import React, { useState, useEffect } from 'react';
import { compose } from 'lodash';
import { Icon } from 'choerodon-ui';
import { Button, Modal } from 'choerodon-ui/pro';
import classNames from 'classnames';
import qs from 'qs';

import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import intl from 'utils/intl';
import {
  getResponse,
  getCurrentLanguage,
  getCurrentUser,
  filterNullValueObject,
} from 'utils/utils';

import { ReactComponent as paymentEmptySvg } from '@/assets/no_pay_method.svg';
import EmotionFill from '@/components/EmotionFill';
import {
  fetchOrderData,
  fetchPaymentData,
  // fetchLogo,
  handlePay,
  fetchPayStatus,
} from '@/services/paymentCashierService';
import Alich from '@/assets/Alipay_ch@1x.png';
import Alien from '@/assets/Alipay_en@1x.png';
import WXch from '@/assets/WeChat.svg';
import WXen from '@/assets/WeChat_en.svg';
import ComLogo from '@/assets/Logo_zy.svg';
import PayModal from './PayModal';
import styles from './index.less';

const imgList = { alipay: { ch: Alich, en: Alien }, wxpay: { ch: WXch, en: WXen } };
let timer;
function PaymentCashier(props) {
  // const [more, setMore] = useState(false);
  const [paymentList, setPaymentList] = useState(null);
  const [channelCode, setChannelCode] = useState(undefined);
  const [orderData, setOrderData] = useState(undefined);
  // const [logo, setLogo] = useState('');
  const { paymentOrderNum, payBusinessType, companyCode } = qs.parse(
    props.history.location.search.substr(1)
  );
  const realName = getCurrentUser()?.realName;
  useEffect(() => {
    fetchOrderdata();
  }, [paymentOrderNum]);

  useEffect(() => {
    fetchPaymentMethod();
  }, []);

  function fetchPaymentStatus() {
    if (!timer) {
      timer = setInterval(() => {
        fetchPayStatus({ merchantOrderNum: orderData?.merchantOrderNum }).then((res) => {
          if (res && res.status === 'PAID') {
            clearInterval(timer);
            window.location.href = res.returnUrl;
          }
        });
      }, 3000);
    } else {
      clearInterval(timer);
      timer = null;
    }
  }

  function fetchOrderdata() {
    fetchOrderData(paymentOrderNum).then((res) => {
      if (res) {
        const result = getResponse(res);
        setOrderData(result);
      }
    });
    // if (webUrl) {
    //   fetchLogo({ webUrl }).then((res) => {
    //     if (res) {
    //       setLogo(res?.logoUrl);
    //     }
    //   });
    // }
  }

  function fetchPaymentMethod() {
    if (payBusinessType === 'SUPPLIER_PAY') {
      fetchPaymentData(
        filterNullValueObject({ payBusinessType: 'SUPPLIER_PAY', cashierFlag: 1, companyCode })
      ).then((res) => {
        if (res && !res.failed) {
          const result = getResponse(res);
          setPaymentList(result?.content);
        } else {
          setPaymentList([]);
        }
      });
    } else {
      fetchPaymentData(filterNullValueObject({ cashierFlag: 1, companyCode })).then((res) => {
        if (res && !res.failed) {
          const result = getResponse(res);
          setPaymentList(result?.content);
        } else {
          setPaymentList([]);
        }
      });
    }
  }

  async function quickPayment() {
    const param =
      payBusinessType === 'SUPPLIER_PAY'
        ? { paymentOrderNum, payType: channelCode, payBusinessType: 'SUPPLIER_PAY', companyCode }
        : { paymentOrderNum, payType: channelCode, companyCode };
    const result = await handlePay(filterNullValueObject({ ...param }));
    if (/<form/.test(result)) {
      document.open('text/html', 'replace');
      document.write(result);
      document.close();
    } else {
      const res = JSON.parse(result);
      if (res.code_url) {
        Modal.open({
          title: (
            <div>
              <div>{intl.get('spct.paymentOrder.view.wxPay').d('微信支付')}</div>
              <div
                style={{ fontSize: '12px', fontWeight: 400, lineHeight: '18px', marginTop: '8px' }}
              >
                {intl
                  .get('spct.paymentOrder.view.wxPayTips')
                  .d('交易将在30分钟后关闭，请及时付款！')}
              </div>
            </div>
          ),
          children: <PayModal orderData={orderData} codeUrl={res.code_url} />,
          footer: null,
          closable: true,
          movable: false,
          border: false,
          bodyStyle: { paddingTop: 0 },
          style: { width: 400 },
        });
        fetchPaymentStatus();
      } else {
        notification.error({ message: res?.message });
      }
    }
  }
  return (
    <div className={styles['cashier-content']}>
      <div className="cashier-header">
        <div className="cashier-title">
          <img
            src={ComLogo}
            alt=""
            style={{ height: '30px', width: '150px', marginRight: '9px' }}
          />
          <span style={{ display: 'inline-block', verticalAlign: 'bottom' }}>
            {intl.get('spct.paymentOrder.view.cashier').d('收银台')}
          </span>
        </div>
        <div className="cashier-account">
          <span>{realName}</span>
        </div>
      </div>
      <div className="cashier-bg">
        {/* <Spin spinning={!orderData}> */}
        <div className="cashier-container">
          <div className="cashier-line">
            <div>
              <div className="cashier-tips">
                {intl.get('spct.paymentOrder.view.paymentTips').d('请选择支付渠道，尽快支付！')}
                {/* <span className="change-detail" onClick={() => setMore(!more)}>
                  {more
                    ? intl.get('spct.paymentOrder.view.packDetail').d('收起详情')
                    : intl.get('spct.paymentOrder.view.moreDetail').d('展开详情')}
                </span> */}
              </div>
              <div className="cashier-code">
                {intl.get('spct.paymentOrder.view.paymentCode').d('支付单号')}：
                {orderData?.merchantOrderNum}
              </div>
            </div>
            <div className="cashier-money">
              {intl.get('spct.paymentOrder.view.shouldPay').d('应付金额')}：
              <span className="cashier-sum">
                <span style={{ fontSize: '20px' }}>{orderData?.currencyCode}</span>
                <span>{orderData?.paymentAmount}</span>
              </span>
            </div>
          </div>
          <div className="cashier-payment">
            <div className="cashier-method">
              {intl.get('spct.paymentOrder.view.paymentMethod').d('支付方式')}
            </div>
            {paymentList && (
              <EmotionFill
                showEmotion={paymentList.length === 0}
                svgConfig={{
                  Com: paymentEmptySvg,
                  emptyInfo: intl
                    .get('spct.paymentOrder.view.paymentMethod.info')
                    .d('未查询到可使用支付方式，请联系管理员进行支付渠道配置'),
                }}
              >
                {paymentList.map((i) => (
                  <div
                    className={classNames({
                      'cashier-payName': true,
                      actived: channelCode === i.channelCode,
                    })}
                    onClick={() => setChannelCode(i.channelCode)}
                  >
                    <>
                      <img
                        src={
                          getCurrentLanguage() === 'zh_CN'
                            ? imgList[i.channelCode].ch
                            : imgList[i.channelCode].en
                        }
                        alt=""
                        style={{
                          display: 'block',
                          margin: '0 auto',
                          position: 'relative',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          height: '32px',
                          maxWidth: '260px',
                        }}
                      />
                      <div className="check-block" hidden={channelCode !== i.channelCode}>
                        <Icon type="check" />
                      </div>
                      {/* <div hidden={channelCode !== i.channelCode} className="check" /> */}
                    </>
                  </div>
                ))}
              </EmotionFill>
            )}
          </div>
          <div style={{ marginTop: '20px', textAlign: 'end' }}>
            {paymentList?.length > 0 && (
              <Button
                style={{
                  minWidth: '104px',
                  height: '40px',
                  background: '#29BECE',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: 'none',
                }}
                disabled={!channelCode}
                onClick={() => quickPayment()}
              >
                {intl.get('spct.paymentOrder.view.quickPayment').d('立即支付')}
              </Button>
            )}
          </div>
        </div>
        {/* </Spin> */}
      </div>
    </div>
  );
}

export default compose(
  formatterCollections({
    code: ['spct.paymentOrder'],
  })
)(PaymentCashier);
