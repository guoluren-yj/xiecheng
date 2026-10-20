/**
 * 二维码通用组件
 */
import React, { useState, useEffect } from 'react';
import { Icon, Spin } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import QRCode from 'qrcode';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import SafetySvg from '@/assets/payment/safety.svg';
import {
  getPayQrCode,
  reGenerateOrder,
  queryOrderStatus,
} from '@/services/checkoutCounterServices';
import { isJSON, useTimer, showOrderPaidResult } from '../utils';
import styles from '../index.less';

let reqTimes = 0; // 记录请求次数

export default function QrCodePay(props) {
  const { paymentChannel = {}, orderInfo = {}, handleClose, handleRefreshOrder, title } = props;
  const { channelCode, configCode } = paymentChannel;

  const [payQrCode, setPayQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [failedTimer, setFailedTimer] = useState(0);
  const [timerTrigger, setTimerTrigger] = useState(false);
  const { timeoutFlag, setTimeoutFlag, setLeftTime, timerRender, clearTimer } = useTimer(
    0,
    timerTrigger
  ); // 计时器

  useEffect(() => {
    fetchPayCode(orderInfo);
    return () => {
      clearTimer();
    };
  }, []);

  const fetchPayCode = async (order) => {
    setLoading(true);
    const result = await getPayQrCode({
      ...order,
      channelCode,
      configCode,
    });
    if (result) {
      if (isJSON(result) && JSON.parse(result).failed) {
        // 二维码获取失败时表示订单已存在或系统异常，此处需重新获取二维码
        // 最多重试3次, 最后一次把异常信息抛出来
        // const newTimer = failedTimer + 1;
        reqTimes += 1;
        if (reqTimes >= 3) {
          setLoading(false);
          clearTimer();
          notification.error({
            message: JSON.parse(result).message,
          });
        } else {
          // setFailedTimer(newTimer);
          refreshQrCode();
        }
      } else {
        setLoading(false);
        try {
          const qrcode = await QRCode.toDataURL(result);
          fetchPayStatus();
          setPayQrCode(qrcode);
          setLeftTime(59);
          setTimerTrigger(true);
        } catch (err) {
          notification.error({
            message: intl
              .get('hpay.checkoutCounter.view.title.refreshQrCode')
              .d('获取失败，点击重新获取二维码'),
          });
        }
      }
    }
  };

  const fetchPayStatus = () => {
    queryOrderStatus({
      paymentOrderNum: orderInfo.paymentOrderNum,
      channelCode,
    }).then((res) => {
      // 1成功 0失败
      if (res) {
        showOrderPaidResult(orderInfo);
      }
    });
  };

  const refreshQrCode = async () => {
    setTimeoutFlag(false);
    const res = await reGenerateOrder({
      paymentOrderNum: orderInfo.paymentOrderNum,
      channelCode,
    });
    const result = getResponse(res);
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
        handleRefreshOrder(newOrder);
        fetchPayCode(newOrder);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles['payment-qrcode-container']}>
        {loading ? (
          <Spin className={styles['payment-qrcode-container-spinning']} spinning={loading} />
        ) : !payQrCode ? (
          <div className={styles['payment-qrcode-noCode']} onClick={refreshQrCode}>
            <span>
              {intl
                .get('hpay.checkoutCounter.view.title.refreshQrCode')
                .d('获取失败，点击重新获取二维码')}
            </span>
            <Icon type="refresh" />
          </div>
        ) : (
          <>
            <div className={styles['payment-qrcode-timer']}>
              <span>
                {intl
                  .get('hpay.checkoutCounter.view.title.qrCodeEffectiveTime')
                  .d('二维码有效时间')}
              </span>
              {timerRender()}
            </div>
            <div className={timeoutFlag && styles['payment-qrcode-timer-invalid']}>
              {timeoutFlag && (
                <div onClick={refreshQrCode}>
                  <span>
                    {intl
                      .get('hpay.checkoutCounter.view.title.refreshQrCode')
                      .d('获取失败，点击重新获取二维码')}
                  </span>
                  <Icon type="refresh" />
                </div>
              )}
              <img
                alt={intl
                  .get('hpay.checkoutCounter.view.img.loadFailed')
                  .d('二维码加载失败，请点击刷新')}
                src={payQrCode}
                style={{ cursor: payQrCode ? 'default' : 'pointer' }}
                width={260}
                height={260}
              />
            </div>
            <div className={styles['payment-qrcode-msg']}>
              <img
                src={SafetySvg}
                alt={intl.get('hpay.checkoutCounter.view.img.safetyCode').d('安全码')}
              />
              <span>{title}</span>
            </div>
          </>
        )}
      </div>
      <div className={styles['payment-qrcode-container-footer']}>
        <Button color="default" onClick={() => handleClose(false)}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>
      </div>
    </>
  );
}
