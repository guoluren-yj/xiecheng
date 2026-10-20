import React, { useMemo } from 'react';
import { Alert } from 'choerodon-ui';
import { Button, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { fetchAiCheckService } from '@/services/commonService';
import EmbedPage from '_components/EmbedPage';
import intl from 'utils/intl';
import './index.less';

// 智能预审助手弹窗
export const handleOpenAiHelp = async (params) => {
  const res = await fetchAiCheckService({
    documentType: 'PR',
    documentId: params.id,
  });
  if (!res) return;
  Modal.open({
    title: intl.get('sprm.common.button.aiCheck').d('智能审核'),
    children: <EmbedPage href="/pub/smbl/check-result-card-panel" bindObjList={res} />,
    cancelButton: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    drawer: true,
    style: { width: 1100 },
    bodyStyle: { padding: 0 },
  });
};

const AiCheckAlert = ({ record }) => {
  const aiCheckResultDTO = record?.get('aiCheckResultDTO') || {};
  const { approveResult } = aiCheckResultDTO || {};

  const aiAlertMessage = useMemo(() => {
    // 前缀
    let prefix = '';
    switch (approveResult) {
      case 'APPROVED':
        prefix = intl.get('sprm.common.view.aiApproved').d('预审通过,请点击');
        break;
      case 'APPROVING':
        prefix = intl.get('sprm.common.view.aiApproving').d('正在为您生成预审结果，请稍等片刻');
        break;
      case 'REJECTED':
        prefix = intl.get('sprm.common.view.aiRejected').d('预审未通过,请点击');
        break;
      case 'FAIL':
        prefix = intl.get('sprm.common.view.aiFailed1').d('预审失败,请点击');
        break;
      case 'APPROVED_SUGGEST':
        prefix = intl.get('sprm.common.view.aiApprovedSuggest').d('预审通过(有建议),请点击');
        break;
      default:
        return null;
    }

    // 后缀
    let suffix = null;
    if (['APPROVED', 'REJECTED', 'APPROVED_SUGGEST', 'FAIL'].includes(approveResult)) {
      suffix = (
        <>
          <Button
            funcType="link"
            onClick={() => handleOpenAiHelp({ id: record.get('prHeaderId') })}
          >
            {intl.get('sprm.common.button.aiHelp').d('预审助手')}
          </Button>
          {approveResult === 'FAIL'
            ? intl.get('sprm.common.view.aiFailReason').d('查看失败原因')
            : intl.get('sprm.common.view.aiCheckResult').d('查看预审结果')}
        </>
      );
    }
    return (
      <>
        {prefix}
        {suffix}
      </>
    );
  }, [approveResult, record]);

  const iconType = useMemo(() => {
    switch (approveResult) {
      // 通过
      case 'APPROVED':
        return 'sentiment_satisfied';
      // 生成中
      case 'APPROVING':
        return 'help';
      // 不通过
      case 'FAIL':
      case 'APPROVED_SUGGEST':
      case 'REJECTED':
        return 'info';
      default:
        return '';
    }
  }, [approveResult]);

  const aiAlertType = useMemo(() => {
    switch (approveResult) {
      case 'APPROVED':
        return 'success';
      case 'APPROVING':
        return 'info';
      case 'REJECTED':
        return 'error';
      case 'FAIL':
      case 'APPROVED_SUGGEST':
        return 'warning';
      default:
        return 'info';
    }
  }, [approveResult]);

  return (
    !!approveResult && (
      <Alert
        showIcon
        iconType={iconType}
        className="sprm-ai-check-alert"
        border={false}
        type={aiAlertType}
        message={aiAlertMessage}
      />
    )
  );
};

export default observer(AiCheckAlert);
