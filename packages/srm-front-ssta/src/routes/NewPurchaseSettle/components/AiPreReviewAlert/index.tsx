import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { Modal } from 'choerodon-ui/pro';
import { reaction } from 'mobx';
import intl from 'utils/intl';
import EmbedPage from '_components/EmbedPage';

import type { DynamicAlertProps } from '../../../Components/DynamicAlert';
import DynamicAlert from '../../../Components/DynamicAlert';
import { getSettleAiApproveResult } from '../../../../services/settlePoolServices';
import commonStyles from '../../../common.less';

const DELAY_STRATEGY = [7000, 5000, 4000, 4000, 5000, 7000];
const MAX_DELAY = 15000;

const AiPreReviewAlert = ({ settleHeaderId, settleHeaderDs }) => {
  const { aiApproveStatus, searchDetailParams } = settleHeaderDs.current?.get('sstaAiApproveResult') || {};

  const timerRef = useRef<any>(null);
  const retryCountRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      retryCountRef.current = 0;
    }
  }, []);

  const startPolling = useCallback(() => {
    // 防止重复启动
    stopPolling();
    const poll = async () => {
      try {
        // 1. 中断检查：如果超过 10 次，强制停止，避免死循环
        if (retryCountRef.current > 10) {
          stopPolling();
          return;
        }
        // 2. 先计算等待时间
        const nextDelay = DELAY_STRATEGY[retryCountRef.current] || MAX_DELAY;
        retryCountRef.current += 1;

        // 3. 将查询逻辑放入定时器，实现“先等再查”
        timerRef.current = setTimeout(async () => {
          const res = await getSettleAiApproveResult(settleHeaderId);
          if (!res) throw new Error('查询接口返回空');
          // 如果依然在审核中，递归调用 poll 继续下一次等待
          if (res.aiApproveStatus === 'APPROVING') {
            poll();
          } else {
            // 状态变了，停止并更新
            stopPolling();
            if (settleHeaderDs.current) {
              settleHeaderDs.current.init('sstaAiApproveResult', res);
            }
          }
        }, nextDelay);
      } catch (e) {
        stopPolling();
        throw e;
      }
    };
    poll();
  }, [stopPolling, settleHeaderId, settleHeaderDs]);

  useEffect(() => {
    // reaction 第一个参数监听值变化，第二个参数执行逻辑
    const disposer = reaction(
      () => settleHeaderDs.current?.get('sstaAiApproveResult')?.aiApproveStatus,
      (aiApproveStatus) => {
        if (aiApproveStatus === 'APPROVING') {
          startPolling();
        } else {
          stopPolling();
        }
      },
      { fireImmediately: true }
    );
    return () => disposer();
  }, [startPolling, settleHeaderDs, stopPolling]);
  // 智能审核详情查看
  const handleReviewResult = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      resizable: true,
      cancelButton: false,
      title: intl.get('ssta.common.view.button.smartPreReview').d('智能预审'),
      children: <EmbedPage href="/pub/smbl/check-result-card-panel" bindObjList={searchDetailParams} />,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      className: commonStyles['ssta-large-modal'],
      bodyStyle: { padding: 0 },
    });
  }, [searchDetailParams]);

  const btn = useMemo(() => {
    return (
      <a
        style={{ textDecoration: 'underline' }}
        onClick={handleReviewResult}
      >
        {intl.get('ssta.common.view.button.preReviewAssistant').d('预审助手')}
      </a>
    );
  }, [handleReviewResult]);

  const alertProps = useMemo<DynamicAlertProps | undefined>(() => {
    switch (aiApproveStatus) {
      case 'APPROVING':
        return {
          type: 'info',
          iconType: 'help',
          message: intl.get('ssta.common.view.message.smartPreReviewingAndWaiting').d('正在为您生成预审结果，请稍等片刻'),
        };
      case 'APPROVED':
        return {
          type: 'success',
          iconType: 'sentiment_satisfied',
          message: (
            <span>
              {intl.get('ssta.common.view.message.smartPreReviewCompletedSuccess.prefix').d('预审通过，请点击')}
              {btn}
              {intl.get('ssta.common.view.message.smartPreReviewCompletedSuccess.suffix').d('查看预审结果')}
            </span>
          ),
        };
      case 'APPROVED_SUGGEST':
        return {
          type: 'warning',
          iconType: 'error',
          message: (
            <span>
              {intl.get('ssta.common.view.message.smartPreReviewCompletedSuggest.prefix').d('预审通过（有建议），请点击')}
              {btn}
              {intl.get('ssta.common.view.message.smartPreReviewCompletedSuggest.suffix').d('查看预审结果')}
            </span>
          ),
        };
      case 'REJECTED':
        return {
          type: 'error',
          iconType: 'cancel',
          message: (
            <span>
              {intl.get('ssta.common.view.message.smartPreReviewCompletedReject.prefix').d('预审不通过，请点击')}
              {btn}
              {intl.get('ssta.common.view.message.smartPreReviewCompletedReject.suffix').d('查看预审结果')}
            </span>
          ),
        };
      case 'FAIL':
        return {
          type: 'warning',
          iconType: 'error',
          message: (
            <span>
              {intl.get('ssta.common.view.message.smartPreReviewFailed.prefix').d('预审失败，请点击')}
              {btn}
              {intl.get('ssta.common.view.message.smartPreReviewFailed.suffix').d('查看失败原因')}
            </span>
          ),
        };
      default:
    }
  }, [btn, aiApproveStatus]);

  if (!alertProps) return null;

  return <DynamicAlert placement="content-top" {...alertProps} />;
};

export default AiPreReviewAlert;
