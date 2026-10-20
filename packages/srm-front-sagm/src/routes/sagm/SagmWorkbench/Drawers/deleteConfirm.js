import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export default async function deleteConfirm({ title, content, confirm = e => e }) {
  await Modal.confirm({
    title: <span>{title || intl.get('hzero.common.message.confirm.title').d('提示')}</span>,
    children: <span>{content}</span>,
    onOk: confirm,
  });
  // if (button === 'ok') await confirm();
}
