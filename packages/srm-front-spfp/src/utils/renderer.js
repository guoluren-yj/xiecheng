import React from 'react';
import { Badge, Tag, Tooltip } from 'choerodon-ui';
import { Modal, Icon } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import intl from 'utils/intl';

const statusMap = ['error', 'success'];

export const tagColors = {
  success: { hex: '#47B881', rgba: 'rgba(71, 184, 129, 0.1)' },
  warn: { hex: '#F88D10', rgba: 'rgba(248, 141, 16, 0.1)' },
  error: { hex: '#F56349', rgba: 'rgba(245, 99, 73, 0.1)' },
  info: { hex: 'rgba(0, 0, 0, 0.65)', rgba: 'rgba(0, 0, 0, 0.1)' },
  green: { hex: '#3ab344', rgba: 'rgba(58,179,68,.1)' },
};

/*
 * @param: hex { string}
 * @param: opacity  { string || number } 透明度
 * @return: { string } rgba格式
 */
export function hexToRgba(hex = '', opacity = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return hex && `rgba(${r},${g},${b},${opacity})`;
}

export function yesOrNoRenderWithLink({ value, yesLink, noLink, noOnclick, yesOnclick }) {
  const yesIntl = intl.get('hzero.common.status.yes').d('是');
  const noIntl = intl.get('hzero.common.status.no').d('否');
  const yesScene = yesLink ? <a onClick={yesOnclick}>{yesIntl}</a> : yesIntl;
  const noScene = noLink ? <a onClick={noOnclick}>{noIntl}</a> : noIntl;
  return React.createElement(Badge, {
    status: statusMap[value],
    text: value === 1 ? yesScene : noScene,
  });
}

export async function confirmDocNegAction(params) {
  const actionDescMap = {
    delete: intl.get('hzero.common.button.delete').d('删除'),
    cancel: intl.get('hzero.common.button.cancel').d('取消'),
    return: intl.get('hzero.common.button.return').d('退回'),
    copy: intl.get('hzero.common.button.copy').d('复制'),
  };
  const { action, documentNum, documentName } = params || {};
  const actionDesc = actionDescMap[action] || action;
  const feedback = await Modal.confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    children: intl
      .get('spfp.common.view.message.confirmActionDocumentOrNot', {
        actionDesc,
        documentNum,
        documentName,
      })
      .d('是否确认{actionDesc}{documentName}{documentNum}？'),
  });
  return feedback === 'ok';
}

export function getSelectedNegActConfirmMsg(action, dataSet) {
  const actionDescMap = {
    delete: intl.get('hzero.common.button.delete').d('删除'),
    cancel: intl.get('hzero.common.button.cancel').d('取消'),
  };
  const actionDesc = actionDescMap[action] || action;
  const msgFlag = isNil(dataSet) ? true : dataSet.selected?.some(item => item.status !== 'add');
  return (
    msgFlag && {
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('spfp.common.view.message.confirmActionSelectedRowsOrNot', { actionDesc })
        .d('是否确认{actionDesc}选中行？'),
    }
  );
}

export function statusTagRender(value, color = 'info') {
  const { hex, rgba } = color.startsWith('#')
    ? { hex: color, rgba: hexToRgba(color, 0.1) }
    : tagColors[color] || {};
  return (
    <Tag color={rgba} style={{ fontWeight: 600, padding: '0 5px' }}>
      {' '}
      <span style={{ color: hex }}> {value}</span>
    </Tag>
  );
}

export function renderBubblePrompt(text) {
  if (!text) return null;
  const style = {
    fontSize: '14px',
    color: '#868d9c',
    fontWeight: 400,
    marginLeft: '8px',
    marginTop: '-4px',
  };
  return (
    <Tooltip title={text}>
      <Icon type="help" style={style} />
    </Tooltip>
  );
}
