/*
 * ResultAlert-明细页横幅
 * @Date: 2026-03-05 15:44:20
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React, { useMemo } from 'react';
import { Alert } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { headerAiApproveModal } from '../index';

const btnStyle = {
  height: 14,
  margin: '0 2px',
  verticalAlign: 'text-top',
  textDecoration: 'underline',
};

const ResultAlert = ({ aiApproveStatus, params }) => {
  // 【预审助手】按钮
  const RevieBtn = ({ type }) => {
    const isFail = type === 'FAIL';
    return (
      <>
        <Button funcType="link" style={btnStyle} onClick={() => headerAiApproveModal(params)}>
          {intl.get('sslm.common.button.reviewAssistant').d('预审助手')}
        </Button>
        <span>
          {isFail
            ? intl.get('sslm.common.view.intelligentReview.failResult').d('查看失败原因')
            : intl.get('sslm.common.view.intelligentReview.reviewResult').d('查看审核结果')}
        </span>
      </>
    );
  };

  const alertProps = useMemo(() => {
    switch (aiApproveStatus) {
      case 'APPROVING':
        return {
          type: 'info',
          iconType: 'help',
          message: (
            <div style={{ color: '#0161D5' }}>
              {intl
                .get('sslm.common.view.intelligentReview.underReview')
                .d('正在为您生成预审结果，请稍等片刻')}
            </div>
          ),
        };
      case 'APPROVED':
        return {
          type: 'success',
          iconType: 'sentiment_satisfied',
          message: (
            <div style={{ color: '#3BB346' }}>
              {intl.get('sslm.common.view.intelligentReview.passMsg').d('预审通过，请点击')}
              <RevieBtn />
            </div>
          ),
        };
      case 'REJECTED':
        return {
          type: 'error',
          iconType: 'cancel',
          message: (
            <div style={{ color: '#E64322' }}>
              {intl.get('sslm.common.view.intelligentReview.noPassMsg').d('预审不通过，请点击')}
              <RevieBtn />
            </div>
          ),
        };
      case 'APPROVED_SUGGEST':
        return {
          type: 'warning',
          iconType: 'error',
          message: (
            <div style={{ color: '#F06200' }}>
              {intl
                .get('sslm.common.view.intelligentReview.passWithSuggestMsg')
                .d('预审通过（有建议），请点击')}
              <RevieBtn />
            </div>
          ),
        };
      case 'FAIL':
        return {
          type: 'error',
          iconType: 'cancel',
          message: (
            <div style={{ color: '#E64322' }}>
              {intl.get('sslm.common.view.intelligentReview.failedMsg').d('预审失败，请点击')}
              <RevieBtn type={aiApproveStatus} />
            </div>
          ),
        };
      default:
        break;
    }
  }, [aiApproveStatus, params]);

  return aiApproveStatus ? <Alert banner showIcon closable {...alertProps} /> : null;
};

export default ResultAlert;
