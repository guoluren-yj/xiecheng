import React, { useState, useMemo } from 'react';
import { Alert } from 'choerodon-ui';
import { Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import EmbedPage from '_components/EmbedPage';

const AlertTooltip = (props) => {
  const { reviewStatus = '', aiReviewParams = {} } = props;
  const [alertObj, setAlertObj] = useState({
    type: 'info',
    iconType: 'help',
  });

  // 智能审核详情查看
  const handleReviewResult = () => {
    Modal.open({
      title: intl.get('sodr.common.button.intelligentReview').d('智能审核'),
      children: <EmbedPage href="/pub/smbl/check-result-card-panel" bindObjList={aiReviewParams} />,
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      drawer: true,
      style: { width: 1100 },
      bodyStyle: { padding: 0 },
    });
  };

  const getMessage = useMemo(() => {
    switch (reviewStatus) {
      case 'APPROVING':
        setAlertObj({
          type: 'info',
          iconType: 'help',
        });
        return (
          <span style={{ color: '#0161D5' }}>
            {intl
              .get('sodr.workspace.view.workspace.reviewing')
              .d('正在为您生成预审结果，请稍等片刻')}
          </span>
        );
      case 'APPROVED':
        setAlertObj({
          type: 'success',
          iconType: 'sentiment_satisfied',
        });
        return (
          <div style={{ color: '#179454' }}>
            <span>
              {intl.get('sodr.workspace.view.workspace.reviewCompleted').d('预审已完成，请点击')}
            </span>
            <Button
              funcType="link"
              style={{
                height: 14,
                margin: '0 2px',
                verticalAlign: 'text-top',
                textDecoration: 'underline',
              }}
              onClick={() => handleReviewResult()}
            >
              {intl.get('sodr.common.button.reviewAssistant').d('预审助手')}
            </Button>
            <span>{intl.get('sodr.workspace.view.workspace.reviewResult').d('查看审核结果')}</span>
          </div>
        );
      case 'APPROVED_SUGGEST':
        setAlertObj({
          type: 'warning',
          iconType: 'error',
        });
        return (
          <div style={{ color: '#F06200' }}>
            <span>
              {intl
                .get('sodr.workspace.view.workspace.reviewCompletedSuggest')
                .d('预审通过（有建议），请点击')}
            </span>
            <Button
              funcType="link"
              style={{
                height: 14,
                margin: '0 2px',
                verticalAlign: 'text-top',
                textDecoration: 'underline',
              }}
              onClick={() => handleReviewResult()}
            >
              {intl.get('sodr.common.button.reviewAssistant').d('预审助手')}
            </Button>
            <span>{intl.get('sodr.workspace.view.workspace.reviewResult').d('查看审核结果')}</span>
          </div>
        );
      case 'REJECTED':
        setAlertObj({
          type: 'error',
          iconType: 'cancel',
        });
        return (
          <div style={{ color: '#E64322' }}>
            <span>
              {intl.get('sodr.workspace.view.workspace.reviewUnCompleted').d('预审不通过，请点击')}
            </span>
            <Button
              funcType="link"
              style={{
                height: 14,
                margin: '0 2px',
                verticalAlign: 'text-top',
                textDecoration: 'underline',
              }}
              onClick={() => handleReviewResult()}
            >
              {intl.get('sodr.common.button.reviewAssistant').d('预审助手')}
            </Button>
            <span>{intl.get('sodr.workspace.view.workspace.reviewResult').d('查看审核结果')}</span>
          </div>
        );
      case 'FAIL':
        setAlertObj({
          type: 'warning',
          iconType: 'error',
        });
        return (
          <div style={{ color: '#F06200' }}>
            <span>
              {intl.get('sodr.workspace.view.workspace.reviewFail').d('预审失败，请点击')}
            </span>
            <Button
              funcType="link"
              style={{
                height: 14,
                margin: '0 2px',
                verticalAlign: 'text-top',
                textDecoration: 'underline',
              }}
              onClick={() => handleReviewResult()}
            >
              {intl.get('sodr.common.button.reviewAssistant').d('预审助手')}
            </Button>
            <span>
              {intl.get('sodr.workspace.view.workspace.reviewFailReason').d('查看失败原因')}
            </span>
          </div>
        );
      default:
        return '';
    }
  }, [reviewStatus, setAlertObj]);

  return reviewStatus ? (
    <Alert
      key={reviewStatus}
      message={getMessage}
      showIcon
      type={alertObj.type}
      iconType={alertObj.iconType}
      closable
      banner
    />
  ) : null;
};

export default AlertTooltip;
