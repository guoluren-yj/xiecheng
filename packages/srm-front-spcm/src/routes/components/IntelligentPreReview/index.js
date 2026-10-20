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
  const { aiApproveReslultParams = [], resultStatus = '', wrapperStyles = {} } = props;

  // 智能审核详情查看
  const handleReviewResult = () => {
    Modal.open({
      title: intl.get('spcm.common.button.intelligentReview').d('智能审核'),
      children: (
        <EmbedPage
          href="/pub/smbl/check-result-card-panel"
          bindObjList={aiApproveReslultParams || []}
        />
      ),
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      drawer: true,
      style: { width: 1100 },
      bodyStyle: { padding: 0 },
      destroyOnClose: true,
      key: Modal.key(),
    });
  };

  const viewReviewResultIntl = useMemo(
    () => intl.get('spcm.common.view.common.reviewResult').d('查看预审结果'),
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
        {intl.get('spcm.common.button.reviewAssistant').d('预审助手')}
      </Button>,
    ];
  }, [resultStatus]);

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

    if (resultStatus === 'APPROVING') {
      text = (
        <span style={{ color: '#0161D5' }}>
          {intl.get('spcm.common.view.common.reviewing').d('正在为您生成预审结果，请稍等片刻')}
        </span>
      );
      type = 'info';
      iconType = 'help';
    }

    if (resultStatus === 'APPROVED') {
      text = (
        <div style={{ color: '#179454' }}>
          <span>{intl.get('spcm.common.view.common.reviewCompleted').d('预审通过，请点击')}</span>
          {buttons}
          <span>{viewReviewResultIntl}</span>
        </div>
      );
      type = 'success';
      iconType = 'sentiment_satisfied';
    }

    if (resultStatus === 'APPROVED_SUGGEST') {
      text = (
        <div style={{ color: 'orange' }}>
          <span>
            {intl
              .get('spcm.common.view.common.reviewCompletedSuggest')
              .d('预审通过（有建议），请点击')}
          </span>
          {buttons}
          <span>{viewReviewResultIntl}</span>
        </div>
      );
      type = 'warning';
      iconType = 'error';
    }

    if (resultStatus === 'REJECTED') {
      text = (
        <div style={{ color: '#E64322' }}>
          <span>
            {intl.get('spcm.common.view.common.reviewUnCompleted').d('预审不通过，请点击')}
          </span>
          {buttons}
          <span>{viewReviewResultIntl}</span>
        </div>
      );
      type = 'error';
      iconType = 'cancel';
    }

    if (resultStatus === 'FAIL') {
      text = (
        <div style={{ color: '#E64322' }}>
          <span>{intl.get('spcm.common.view.common.reviewFiled').d('预审失败，请点击')}</span>
          {buttons}
          <span>{intl.get('spcm.common.view.common.reviewResultFailed').d('查看失败原因')}</span>
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
  }, [resultStatus, getButtons]);

  const { text, iconType, type } = messageInfos || {};

  if (!resultStatus || !text) {
    return '';
  }

  return text ? (
    <Alert
      key={resultStatus}
      message={text}
      showIcon
      type={type}
      iconType={iconType}
      closable
      banner
      style={{
        ...(wrapperStyles || {}),
      }}
    />
  ) : null;
};

export default observer(IntelligentReviewResult);
