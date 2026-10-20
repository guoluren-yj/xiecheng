import React from 'react';
import { stringify } from 'querystring';
import { Modal } from 'choerodon-ui/pro';
import classnames from 'classnames';

import EmbedPage from '../../components/EmbedPage';
import './index.less';

interface openApproveModalProps extends ApproveModalProps {
  modalProps?: any;
}

interface ApproveModalProps {
  taskId: string;
  processInstanceId: string;
  title?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  modal?: any;
  closable?: boolean;
}

export default function ApproveModal(props: ApproveModalProps) {
  const {
    taskId,
    processInstanceId,
    title,
    onSuccess,
    onClose,
    modal,
    closable,
  } = props;
  const path = `/pub/hwfp/approval/task/detail/${taskId}/${processInstanceId}?${stringify({
    title,
  })}`;
  const _location = {
    hash: '',
    pathname: path,
    search: stringify({
      title,
    }),
  };
  const pageProps = {
    path,
    location: _location,
    match: {
      params: {
        id: taskId,
        processInstanceId,
      },
      path,
    },
    history: {
      ...(window as any).dvaApp._history,
      location: _location,
    },
    inEmbedPage: true,
    title,
    onSuccess,
    modal,
    onClose,
    closable,
  };

  return (
    <EmbedPage
      href={path}
      contentStyle={{
        height: '100%',
      }}
      {...pageProps}
    />
  );
}

export function openApproveModal(props: openApproveModalProps) {
  const { modalProps, ...other } = props;
  const { title, className, closable, ...rest} = modalProps || {};
  Modal.open({
    title: null,
    footer: null,
    drawer: true,
    style: { width: '1080px' },
    className: classnames('approval-modal-common', className),
    children: <ApproveModal title={title} closable={closable} {...(other || {})} />,
    ...(rest || {}),
  });
}
