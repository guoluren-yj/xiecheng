import React, { useMemo } from 'react';
import { Button, Tooltip } from 'choerodon-ui/pro';

import { useModal } from 'hzero-front/lib/components/Import';

// ToolTip无法直接加在新版导入组件，使用useModal处理
const ScoreEntryButton = (props) => {
  const { help, buttonText, buttonProps, remote, pageData, ...other } = props;

  const openImportModal = useMemo(() => useModal(), []);

  const openModal = () => {
    if (openImportModal.openModal) {
      openImportModal.openModal({ ...other });
    }
  };

  const remoteOpenModal = () => {
    if (remote?.event) {
      remote.event.fireEvent('remoteHandleOpenScoreEntryModal', {
        openModal,
        ...(pageData || {}),
      });
    } else {
      openModal();
    }
  };

  const btnProps = {
    onClick: remoteOpenModal,
    ...buttonProps,
  };

  return (
    <>
      <Tooltip title={help} placement="left">
        <Button {...btnProps}>{buttonText}</Button>
      </Tooltip>
    </>
  );
};

export default ScoreEntryButton;
