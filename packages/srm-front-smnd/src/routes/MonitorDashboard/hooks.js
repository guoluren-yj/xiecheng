import React, { useCallback } from 'react';
import { Tooltip, Modal } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';

import './index.less';

function useYesOrNoRender() {
  return useCallback(({ value }) => {
    return yesOrNoRender(+value);
  }, []);
}

function useRenderMeaning(name) {
  return useCallback(({ value, record }) => {
    return <span>{value && record.get(`${name}Meaning`)}</span>;
  }, []);
}

function useTooltip(props) {
  return useCallback(({ value }) => {
    return (
      <Tooltip title={value} {...props}>
        {value}
      </Tooltip>
    );
  }, []);
}

function c7nModal(modalProps = {}) {
  return Modal.open({
    movable: false,
    closable: true,
    mask: true,
    maskClosable: false,
    destroyOnClose: true,
    drawer: true,
    ...modalProps,
  });
}

function showText(value, title) {
  const showRecordModal = Modal.open({
    title,
    children: <span>{value}</span>,
    closable: true,
    footer: null,
  });

  return <a onClick={showRecordModal}>{title}</a>;
}

export { useYesOrNoRender, useRenderMeaning, useTooltip, c7nModal, showText };
