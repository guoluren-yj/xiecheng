/**
 * 智能审批 预审结果
 */

import React, { useMemo, useCallback } from 'react';
import { Alert } from 'choerodon-ui';
import { Button, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import EmbedPage from '_components/EmbedPage';

const IntelligentReviewResult = (props) => {
  const { aiResultData, wrapperStyles = {} } = props;
  const { result: reviewStatus = '', aiApproveResultQueryDTOList = [] } = aiResultData || {};

  // 智能审核详情查看
  const handleReviewResult = () => {
    Modal.open({
      title: intl.get('ssrc.common.button.intelligentReview').d('智能审核'),
      children: (
        <EmbedPage
          href="/pub/smbl/check-result-card-panel"
          bindObjList={aiApproveResultQueryDTOList || []}
        />
      ),
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      drawer: true,
      style: { width: 1100 },
      bodyStyle: { padding: 0 },
      key: Modal.key(),
    });
  };

  const viewReviewResultIntl = useMemo(
    () => intl.get('ssrc.inquiryHall.view.inquiryHall.reviewResult').d('查看预审结果'),
    []
  );

  const getButtons = useCallback(() => {
    return [
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
        {intl.get('ssrc.common.button.reviewAssistant').d('预审助手')}
      </Button>,
    ];
  }, [reviewStatus]);

  /**
   * SMBL.CHECK_RESULT_STATUS
   *
   *
    预审状态=空	不展示提示框
    优先级2:预审状态=生成中	【蓝色信息框】正在为您生成预审结果，请稍等片刻
    优先级5:预审状态=通过	【绿色信息框】预审通过，请点击预审助手查看预审结果
    优先级3:预审状态=不通过	【红色信息框】预审不通过，请点击预审助手查看预审结果
    优先级4:预审状态=通过（有建议）	【橙色信息框】预审通过（有建议），请点击预审助手查看预审结果
    优先级1:预审状态=失败	【红色信息框】大数据模型未返回智能预审结果，请联系运维经理处理
  */
  const messageInfos = useMemo(() => {
    let text = '';
    let type = 'info';
    let iconType = 'help';

    const buttons = getButtons();

    if (reviewStatus === 'APPROVING') {
      text = (
        <span style={{ color: '#0161D5' }}>
          {intl
            .get('ssrc.inquiryHall.view.inquiryHall.reviewing')
            .d('正在为您生成预审结果，请稍等片刻')}
        </span>
      );
      type = 'info';
      iconType = 'help';
    }

    if (reviewStatus === 'APPROVED') {
      text = (
        <div style={{ color: '#179454' }}>
          <span>
            {intl.get('ssrc.inquiryHall.view.inquiryHall.reviewCompleted').d('预审通过，请点击')}
          </span>
          {buttons}
          <span>{viewReviewResultIntl}</span>
        </div>
      );
      type = 'success';
      iconType = 'sentiment_satisfied';
    }

    if (reviewStatus === 'APPROVED_SUGGEST') {
      text = (
        <div style={{ color: 'orange' }}>
          <span>
            {intl
              .get('ssrc.inquiryHall.view.inquiryHall.reviewCompletedSuggest')
              .d('预审通过（有建议），请点击')}
          </span>
          {buttons}
          <span>{viewReviewResultIntl}</span>
        </div>
      );
      type = 'warning';
      iconType = 'error';
    }

    if (reviewStatus === 'REJECTED') {
      text = (
        <div style={{ color: '#E64322' }}>
          <span>
            {intl
              .get('ssrc.inquiryHall.view.inquiryHall.reviewUnCompleted')
              .d('预审不通过，请点击')}
          </span>
          {buttons}
          <span>{viewReviewResultIntl}</span>
        </div>
      );
      type = 'error';
      iconType = 'cancel';
    }

    if (reviewStatus === 'FAIL') {
      // text = (
      //   <span style={{ color: '#F06200' }}>
      //     {intl
      //       .get('ssrc.inquiryHall.view.inquiryHall.resultFailed')
      //       .d('大数据模型未返回智能预审结果，请联系运维经理处理')}
      //   </span>
      // );
      text = (
        <div style={{ color: '#E64322' }}>
          <span>
            {intl.get('ssrc.inquiryHall.view.inquiryHall.reviewFiled').d('预审失败，请点击')}
          </span>
          {buttons}
          <span>
            {intl.get('ssrc.inquiryHall.view.inquiryHall.reviewResultFailed').d('查看失败原因')}
          </span>
        </div>
      );
      type = 'warning';
      iconType = 'error';
    }

    return {
      text,
      iconType,
      type,
    };
  }, [reviewStatus, getButtons]);

  const { text, iconType, type } = messageInfos || {};

  if (!reviewStatus || !text) {
    return '';
  }

  return (
    <Alert
      key={reviewStatus}
      message={text}
      showIcon
      type={type}
      iconType={iconType}
      closable
      banner
      style={{
        // marginBottom: '8px',
        ...(wrapperStyles || {}),
      }}
    />
  );
};

export default observer(IntelligentReviewResult);
