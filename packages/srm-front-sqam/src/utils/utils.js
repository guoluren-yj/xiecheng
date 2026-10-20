import { stringify } from 'querystring';
import { Modal } from 'choerodon-ui/pro';
import React from 'react';
import { Tag } from 'hzero-ui';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';
import { DATETIME_MIN, DATETIME_MAX, DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { isNil, isArray, isString } from 'lodash';
import { HZERO_FILE } from 'utils/config';
import { queryFileListOrg } from 'services/api';
import { filterNullValueObject, getAccessToken, getCurrentOrganizationId } from 'utils/utils';

const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const accessToken = getAccessToken();

export function dateRangeTransform(dateRange, isFormat = false) {
  const transToArr = () => {
    switch (dateRange) {
      case 'ALL TIME':
        return [undefined, undefined];
      case 'LAST MONTH':
        return [moment().subtract(1, 'month'), moment()];
      case 'LAST THREE MONTHS':
        return [moment().subtract(3, 'month'), moment()];
      case 'RECENT HALF YEAR':
        return [moment().subtract(6, 'month'), moment()];
      case 'IN RECENT YAER':
        return [moment().subtract(12, 'month'), moment()];
      case 'LAST MONTH AND BEFORE':
        return [undefined, moment().subtract(1, 'month').endOf('month')];
      case 'LAST MONTH TO 25':
        return [moment().subtract(1, 'month').date(26), moment().date(25)];
      default:
        return [moment().subtract(6, 'month'), moment()];
    }
  };
  if (isFormat) {
    const start = transToArr()[0]?.format(DEFAULT_DATE_FORMAT) || '';
    const end = transToArr()[1]?.format(DEFAULT_DATE_FORMAT) || '';
    const sign = dateRange === 'ALL TIME' ? '' : ',';
    return start + sign + end;
  } else {
    return transToArr();
  }
}

export function transformQselectDate(data, dateFieldsMapping = {}) {
  if (!data) return {};
  const mergeData = {};
  const { customizeFilterComparison } = data;
  const addComparisonSet = new Set();
  const safeComparison = customizeFilterComparison || '';
  Object.entries(dateFieldsMapping).forEach(([qSelectField, dateField]) => {
    if (!qSelectField || !dateField) return;
    const qSelectValue = data[qSelectField];
    const rangeField = `${dateField}_range`;
    const rangeValue = data[rangeField];
    if (isNil(qSelectValue) || !isNil(rangeValue)) return;
    const [from, to] = dateRangeTransform(qSelectValue);
    if (!from && !to) return;
    mergeData[rangeField] = `${from?.format(DATETIME_MIN) || ''},${to?.format(DATETIME_MAX) || ''}`;
    if (isString(safeComparison) && !safeComparison.includes(dateField)) {
      addComparisonSet.add(`${dateField}:~`);
    }
  });
  if (addComparisonSet.size > 0 && isString(safeComparison)) {
    const concatComparison = Array.from(addComparisonSet).join(',');
    const sign = safeComparison ? ',' : '';
    mergeData.customizeFilterComparison = safeComparison + sign + concatComparison;
  }
  return mergeData;
}

export function getSelectedNegActConfirmMsg(action, dataSet) {
  const actionDescMap = {
    delete: intl.get('hzero.common.button.delete').d('删除'),
    cancel: intl.get('hzero.common.button.cancel').d('取消'),
  };
  const actionDesc = actionDescMap[action] || action;
  const msgFlag = isNil(dataSet) ? true : dataSet.selected?.some((item) => item.status !== 'add');
  return (
    msgFlag && {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sqam.common.view.message.confirmActionSelectedRowsOrNot', { actionDesc })
        .d('是否确认{actionDesc}选中行？'),
    }
  );
}

export async function confirmDocNegAction(params) {
  const actionDescMap = {
    delete: intl.get('hzero.common.button.delete').d('删除'),
    cancel: intl.get('hzero.common.button.cancel').d('取消'),
    return: intl.get('hzero.common.button.return').d('退回'),
  };
  const { action, documentNum, documentName = '' } = params || {};
  const actionDesc = actionDescMap[action] || action;
  const feedback = await Modal.confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    children: intl
      .get('sqam.common.view.message.confirmActionDocumentOrNot', {
        actionDesc,
        documentName,
        documentNum,
      })
      .d('是否确认{actionDesc}{docmentName}{docmentNum}？'),
  });
  return feedback === 'ok';
}

export async function confirmHandleEnable() {
  const feedback = await Modal.confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    children: intl
      .get('sqam.common.view.message.confirmEnableOrNot')
      .d('当前模板为禁用状态，发布后将直接生效变为“已发布”，请确认是否发布？'),
  });
  return feedback === 'ok';
}

export function approveNameRenderTemp(action) {
  let actionText = null;
  let actionColor = null;
  if (action) {
    switch (action.toLowerCase()) {
      case 'startevent':
        actionColor = '#2C3E50';
        actionText = intl.get('hzero.common.text.startEvent').d('开始');
        break;
      case 'endevent':
        actionText = intl.get('hzero.common.text.endEvent').d('结束');
        break;
      case 'approved':
        actionColor = '#87d068';
        actionText = intl.get('hzero.common.status.agree').d('同意');
        break;
      case 'rejected':
        actionColor = '#f50';
        actionText = intl.get('hzero.common.status.reject').d('拒绝');
        break;
      case 'addsign':
        actionColor = 'cyan';
        actionText = intl.get('hzero.common.status.addSign').d('加签');
        break;
      case 'approveandaddsign':
        actionColor = 'green';
        actionText = intl.get('hzero.common.status.ApproveAndAddSign').d('同意并加签');
        break;
      case 'delegate':
        actionColor = '#108ee9';
        actionText = intl.get('hzero.common.status.delegate').d('转交');
        break;
      case 'jump':
        actionColor = 'red';
        actionText = intl.get('hzero.common.status.jump').d('驳回');
        break;
      case 'recall':
        actionColor = 'orange';
        actionText = intl.get('hzero.common.status.recall').d('撤回');
        break;
      case 'revoke':
        actionColor = 'gold';
        actionText = intl.get('hzero.common.status.revoke').d('撤销');
        break;
      case 'autodelegate':
        actionColor = '#2db7f5';
        actionText = intl.get('hzero.common.status.autoDelegate').d('自动转交');
        break;
      case 'carboncopy':
        actionColor = 'purple';
        actionText = intl.get('hzero.common.status.carbonCopy').d('抄送');
        break;
      case 'autocarboncopy':
        actionColor = 'purple';
        actionText = intl.get('hzero.common.status.autocarboncopy').d('自动抄送');
        break;
      case 'specify':
        actionColor = 'magenta';
        actionText = intl.get('hzero.common.status.specify').d('指定');
        break;
      case 'stop':
        actionText = intl.get('hzero.common.status.stop').d('终止');
        break;
      default:
        break;
    }
  }
  return { actionText, actionColor };
}

export function approveNameRender(action) {
  const { actionText, actionColor } = approveNameRenderTemp(action);
  return actionText ? <Tag color={actionColor}>{actionText}</Tag> : null;
}

export async function getFileNumByUUID(uuid, bucketDirectory) {
  if (!uuid) return 0;
  const uuids = (isArray(uuid) ? uuid : [uuid]).filter((v) => v);
  if (!uuids.length) return 0;
  const requestList = uuids.map((item) => {
    return queryFileListOrg(
      filterNullValueObject({
        attachmentUUID: item,
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory,
      })
    );
  });
  const res = await Promise.all(requestList);
  if (isArray(res)) {
    return math.sum(...res.map((item) => item?.length || 0));
  }
  return 0;
}

export async function previewPdf(fileUrl, paramBucketName) {
  const bucket = paramBucketName || bucketName;
  const pdfParams = stringify(
    filterNullValueObject({
      bucketName: bucket,
      access_token: accessToken,
      url: encodeURIComponent(fileUrl),
    })
  );
  const previewUrl = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview/by-url?${pdfParams}`;
  window.open(previewUrl);
}
