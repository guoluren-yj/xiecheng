import React from 'react';
import { Modal } from 'choerodon-ui/pro';

export default async function confirm({ title, content, onOk = (e) => e, onCancel = (e) => e }) {
  Modal.confirm({
    title: <span>{title}</span>,
    children: <span>{content}</span>,
    onOk,
    onCancel,
  });
}
