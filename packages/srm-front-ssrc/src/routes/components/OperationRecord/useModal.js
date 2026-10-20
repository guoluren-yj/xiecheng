import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import OperationRecordExport from '@/routes/components/OperationRecordExport';

import Container from './Container';

const promptCode = 'ssrc.common';

const useModal = () => {
  const openModal = (props, modalProps) => {
    const { rfxHeaderId, ...otherProps } = props;
    const operationRef = React.createRef();
    const containerProps = {
      rfxHeaderId,
      handleOperationRef: operationRef,
      ...otherProps,
    };
    const modal = Modal.open({
      key: Modal.key(),
      title: intl.get(`${promptCode}.view.title.operationRecord`).d('操作记录'),
      children: <Container {...containerProps} />,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
      footer: (_, cancelBtn) => {
        return (
          <>
            {cancelBtn}
            <OperationRecordExport sourceId={rfxHeaderId} type="RFQ" operationRef={operationRef} />
          </>
        );
      },
      ...modalProps,
    });
    return modal;
  };
  return {
    openModal,
  };
};

export default useModal;
