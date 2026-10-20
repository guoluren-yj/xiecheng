/**
 * 协议工作台详情-文本共享管理
 */
import React, { useCallback } from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import ShareMangement from './index';

const openShareMangement = (pcHeaderId) => {
  Modal.open({
    key: Modal.key(),
    drawer: true,
    title: intl.get('spcm.workspace.view.modal.shareManagement').d('文本共享管理'),
    children: <ShareMangement pcHeaderId={pcHeaderId} />,
    closable: true,
    movable: false,
    destroyOnClose: true,
    style: { width: '1090px' },
    footer: null,
  });
};
const ButtonModal = (props) => {
  const { children, pcHeaderId } = props;
  // 文本共享管理
  const handleOpenShareMangement = useCallback(() => {
    openShareMangement(pcHeaderId);
  }, [pcHeaderId]);
  const DomColne = React.cloneElement(children, {
    onClick: handleOpenShareMangement,
  });
  return DomColne;
};

export { ButtonModal, openShareMangement };
