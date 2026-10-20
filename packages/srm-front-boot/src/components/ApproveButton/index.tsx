import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import { Button, DataSet, Modal } from 'choerodon-ui/pro';
import type { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import type { ModalProps } from 'choerodon-ui/pro/lib/modal/Modal';
import intl from 'hzero-front/lib/utils/intl';
import { getCurrentUser, getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { submitDocumentApprove } from '@/services/taskService';
import ModalContent from './ModalContent';

interface ApproveButtonProps {
  customizeCode: string;
  documentCode: string;
  businessKey: string;
  buttonProps?: ButtonProps;
  buttonText?: React.ReactNode;
  beforeClick?: () => Promise<boolean>;
  modalProps?: ModalProps;
  onSuccess?: () => void;
  onError?: () => void;
  c7nCutomizeUtils?: {
    withCustomize: any;
  }
}

function ApproveButton(props: ApproveButtonProps) {
  const {
    customizeCode, documentCode, businessKey, buttonText, buttonProps, modalProps = {}, c7nCutomizeUtils,
    beforeClick, onSuccess, onError,
   } = props;
  const { withCustomize } = c7nCutomizeUtils || {};

  const formDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
    });
  }, []);

  const handleOk = useCallback(async() => {
    const record = formDs.current;
    if (!record) {
      return false;
    }
    const flag = await record.validate();
    if (!flag) {
      return false;
    }
    const data = omit(record.toJSONData(), ['__dirty', '__id', '_status']);
    const { currentRoleId: roleId, id: userId, tenantId } = getCurrentUser() || {};
    const res = await submitDocumentApprove({
      documentCode,
      businessKey,
      unitCode: customizeCode,
      tenantId,
      roleId,
      userId,
      approverConfig: JSON.stringify(data),
    });
    if (getResponse(res)) {
      if (onSuccess) {
        onSuccess();
      }
      return true;
    }
    if (onError) {
      onError();
    }
    return false;
  }, [formDs, customizeCode, documentCode, businessKey, onSuccess, onError]);

  const ModalContentComp = useMemo(() => {
    if (!withCustomize || !customizeCode) {
      return null;
    }
    return withCustomize({ unitCode: [ customizeCode ] })(ModalContent);
  }, []);

  const openModal = useCallback(() => {
    Modal.open({
      title: intl.get('hzero.common.button.approval').d('审批'),
      drawer: true,
      style: { width: 600 },
      ...modalProps,
      children: !ModalContentComp ? undefined : <ModalContentComp dataSet={formDs} customizeCode={customizeCode} />,
      onOk: handleOk,
    });
  }, [customizeCode, modalProps, withCustomize, ModalContentComp, handleOk]);

  const handleClick = useCallback(async() => {
    let flag = true;
    if (beforeClick) {
      flag = await beforeClick();
    }
    if (flag) {
      openModal();
    }
  }, [beforeClick, openModal]);

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
    >
      {buttonText || intl.get('hzero.common.button.approval').d('审批')}
    </Button>
  );
}

export default class ApproveButtonWrapper extends React.Component<ApproveButtonProps> {
  static contextTypes = {
    c7nCutomizeUtils: PropTypes.object,
    setC7nCutomizeUtils: PropTypes.func,
  };

  render() {
    return <ApproveButton {...(this.context || {})} {...this.props} />;
  }
}