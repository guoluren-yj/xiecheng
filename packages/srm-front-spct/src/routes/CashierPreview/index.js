import React, { useState, useEffect } from 'react';
import { compose } from 'lodash';
import { Icon } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import classNames from 'classnames';
import qs from 'qs';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse, getCurrentLanguage, getCurrentUser } from 'utils/utils';

// import PayModal from './PayModal';
import { fetchPaymentData, previewData } from '@/services/paymentCashierService';
import Alich from '@/assets/Alipay_ch@1x.png';
import Alien from '@/assets/Alipay_en@1x.png';
import WXch from '@/assets/WeChat.svg';
import WXen from '@/assets/WeChat_en.svg';
import ComLogo from '@/assets/Logo_zy.svg';
import colors from '@/utils/mallColors.js';
import styles from './index.less';

const imgList = { alipay: { ch: Alich, en: Alien }, wxpay: { ch: WXch, en: WXen } };
function PaymentCashier(props) {
  // const [more, setMore] = useState(false);
  const [paymentList, setPaymentList] = useState([]);
  const [channelCode, setChannelCode] = useState(undefined);
  const [configData, setConfigData] = useState(undefined);
  // const [logo, setLogo] = useState('');
  const { payBusinessType, cashierConfigSource } = qs.parse(
    props.history.location.search.substr(1)
  );
  const realName = getCurrentUser()?.realName;
  useEffect(() => {
    if (cashierConfigSource) {
      fetchConfigdata();
    }
  }, [cashierConfigSource]);

  useEffect(() => {
    fetchPaymentMethod();
  }, []);

  function fetchConfigdata() {
    const srmUrl =
      window.$$env.NODE_ENV === 'production'
        ? window.location.origin
        : 'https://dev.isrm.going-link.com';
    previewData(cashierConfigSource, srmUrl).then((res) => {
      if (res) {
        const result = getResponse(res);
        setConfigData(result);
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
      fetchPaymentData({ payBusinessType: 'SUPPLIER_PAY', enabledFlag: 1 }).then((res) => {
        if (res && !res.failed) {
          const result = getResponse(res);
          setPaymentList(result?.content);
        }
      });
    } else {
      fetchPaymentData({ enabledFlag: 1 }).then((res) => {
        if (res && !res.failed) {
          const result = getResponse(res);
          setPaymentList(result?.content);
        }
      });
    }
  }

  return (
    <div className={styles['cashier-content']}>
      <div className="cashier-header">
        <div className="cashier-title">
          <img
            src={configData?.fileDTOS?.[0]?.fileUrl || ComLogo}
            alt={configData?.fileDTOS?.[0]?.fileName}
            style={{ height: '30px', width: '150px', marginRight: '9px' }}
          />
          <span style={{ display: 'inline-block', verticalAlign: 'bottom' }}>
            {configData?.cashierConfigTitle}
          </span>
        </div>
        <div className="cashier-account">
          {configData?.cashierConfigLinks?.map((i) => (
            <span
              style={{ cursor: 'pointer', padding: '0 15px', borderRight: '1px solid #eaeaea' }}
              onClick={() => window.open(i.linkUrl)}
            >
              {i.linkTitle}
            </span>
          ))}
          <span style={{ marginLeft: 15 }}>{realName}</span>
        </div>
      </div>
      <div className="cashier-bg">
        {/* <Spin spinning={!orderData}> */}
        <div className="cashier-container">
          <div className="cashier-line">
            <div>
              <div className="cashier-tips">
                {configData?.cashierConfigTips}
                {/* <span className="change-detail" onClick={() => setMore(!more)}>
                  {more
                    ? intl.get('spct.paymentOrder.view.packDetail').d('收起详情')
                    : intl.get('spct.paymentOrder.view.moreDetail').d('展开详情')}
                </span> */}
              </div>
              <div className="cashier-code">
                {intl.get('spct.paymentOrder.view.paymentCode').d('支付单号')}：
                {/* {orderData?.merchantOrderNum} */}
                PAY202201120000001
              </div>
            </div>
            <div className="cashier-money">
              {intl.get('spct.paymentOrder.view.shouldPay').d('应付金额')}：
              <span className="cashier-sum">
                <span style={{ fontSize: '20px' }}>¥</span>
                <span>999,999,999.00</span>
              </span>
            </div>
          </div>
          <div className="cashier-payment">
            <div className="cashier-method">
              {intl.get('spct.paymentOrder.view.paymentMethod').d('支付方式')}
            </div>
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
          </div>
          <div style={{ marginTop: '20px', textAlign: 'end' }}>
            <Button
              style={{
                minWidth: '104px',
                height: '40px',
                background:
                  configData?.cashierConfigColor === 'FOLLOW_SRM'
                    ? ''
                    : colors[configData?.topicColor || 'A']['primary-color'],
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                border: 'none',
              }}
              className={configData?.cashierConfigColor === 'FOLLOW_SRM' ? 'srm-primary' : ''}
              disabled={!channelCode}
            >
              {intl.get('spct.paymentOrder.view.quickPayment').d('立即支付')}
            </Button>
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
