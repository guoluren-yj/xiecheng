// 审批记录节点
import React from 'react';

import { compose } from 'lodash';

import intl from 'utils/intl';

import { observer } from 'mobx-react-lite';

import { SRM_SPUC } from '_utils/config';

import { getCurrentOrganizationId } from 'utils/utils';

import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

export function approveNameRenderTemp(action) {
  let actionText = null;
  let actionColor = null;
  if (action) {
    switch (action.toLowerCase()) {
      case 'startevent':
        actionColor = '#000000';
        actionText = intl.get('sodr.workspace.status.start').d('开始');
        break;
      case 'endevent':
        actionColor = '#000000';
        actionText = intl.get('sodr.workspace.status.processEnd').d('流程结束');
        break;
      case 'approved':
        actionColor = '#000000';
        actionText = intl.get('sodr.workspace.model.common.approved').d('审批通过');
        break;
      case 'rejected':
        actionColor = '#F56349';
        actionText = intl.get('sodr.workspace.model.common.reject').d('审批拒绝');
        break;
      case 'addsign':
        actionColor = 'cyan';
        actionText = intl.get('sodr.workspace.status.addSign').d('加签');
        break;
      case 'approveandaddsign':
        actionColor = 'green';
        actionText = intl.get('sodr.workspace.status.approveAndAddSign').d('同意并加签');
        break;
      case 'delegate':
        actionColor = '#108ee9';
        actionText = intl.get('sodr.workspace.status.delegate').d('转交');
        break;
      case 'jump':
        actionColor = 'red';
        actionText = intl.get('sodr.workspace.status.jump').d('驳回');
        break;
      case 'recall':
        actionColor = 'orange';
        actionText = intl.get('sodr.workspace.status.recall').d('撤回');
        break;
      case 'revoke':
        actionColor = 'gold';
        actionText = intl.get('sodr.workspace.status.revoke').d('撤销');
        break;
      case 'autodelegate':
        actionColor = '#2db7f5';
        actionText = intl.get('sodr.workspace.status.autoDelegate').d('自动转交');
        break;
      case 'autocarboncopy':
        actionColor = '#000000';
        actionText = intl.get('sodr.workspace.status.autoCarbonCopy').d('自动抄送');
        break;
      case 'carboncopy':
        actionColor = '#000000';
        actionText = intl.get('sodr.workspace.status.carbonCopy').d('抄送');
        break;
      case 'specify':
        actionColor = 'magenta';
        actionText = intl.get('sodr.workspace.status.specify').d('指定');
        break;
      default:
        break;
    }
  }
  return { actionText, actionColor };
}
/**
 * Timeline.Item的color不满足样式
 * @param {*} action
 * @returns
 */
export function approveNameRenderColor(action) {
  let actionText = null;
  let actionColor = null;
  if (action) {
    switch (action.toLowerCase()) {
      case 'startevent':
        actionColor = '#000000';
        actionText = intl.get('sodr.workspace.status.start').d('开始');
        break;
      case 'endevent':
        actionText = intl.get('sodr.workspace.status.processEnd').d('流程结束');
        break;
      case 'approved':
        actionColor = '#00bf96';
        actionText = intl.get('sodr.workspace.model.common.approved').d('审批通过');
        break;
      case 'rejected':
        actionColor = '#F56349';
        actionText = intl.get('sodr.workspace.model.common.reject').d('审批拒绝');
        break;
      case 'addsign':
        actionColor = 'cyan';
        actionText = intl.get('sodr.workspace.status.addSign').d('加签');
        break;
      case 'approveandaddsign':
        actionColor = 'green';
        actionText = intl.get('sodr.workspace.status.ApproveAndAddSign').d('同意并加签');
        break;
      case 'delegate':
        actionColor = '#108ee9';
        actionText = intl.get('sodr.workspace.status.delegate').d('转交');
        break;
      case 'jump':
        actionColor = 'red';
        actionText = intl.get('sodr.workspace.status.jump').d('驳回');
        break;
      case 'recall':
        actionColor = 'orange';
        actionText = intl.get('sodr.workspace.status.recall').d('撤回');
        break;
      case 'revoke':
        actionColor = 'gold';
        actionText = intl.get('sodr.workspace.status.revoke').d('撤销');
        break;
      case 'autodelegate':
        actionColor = '#2db7f5';
        actionText = intl.get('sodr.workspace.status.autoDelegate').d('自动转交');
        break;
      case 'autocarboncopy':
        actionColor = '#E5E5E5';
        actionText = intl.get('sodr.workspace.status.autoCarbonCopy').d('自动抄送');
        break;
      case 'carboncopy':
        actionColor = '#E5E5E5';
        actionText = intl.get('sodr.workspace.status.carbonCopy').d('抄送');
        break;
      case 'specify':
        actionColor = 'magenta';
        actionText = intl.get('sodr.workspace.status.specify').d('指定');
        break;
      default:
        break;
    }
  }
  return { actionText, actionColor };
}
export function approveNameRender(action) {
  const { actionText, actionColor } = approveNameRenderTemp(action);
  return actionText ? (
    <span style={{ color: actionColor, fontWeight: 500 }}>{actionText}</span>
  ) : null;
}

// 操作记录导出
const CuxExcelExportPro = ({ dataSet, poHeaderId }) => {
  const params = dataSet?.queryDataSet?.current?.toData();
  console.log('params', params);
  return (
    <ExcelExportPro
      buttonText={intl.get('hzero.common.button.export').d('导出')}
      templateCode="SRM_C_SRM_SODR_PO_HEADER_ACTION" // 导出模板编码
      exportAsync // 是否异步
      otherButtonProps={{
        type: 'c7n-pro',
      }}
      requestUrl={`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/po-process-actions/${poHeaderId}/export/new-module`}
      queryParams={params}
      allBody
      method="POST"
    />
  );
};

export default compose(observer)(CuxExcelExportPro);
