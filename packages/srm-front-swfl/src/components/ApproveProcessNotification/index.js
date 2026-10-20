import React, { useState, useEffect, useRef } from 'react';
import { Icon, Progress, Text } from 'choerodon-ui';
import classnames from 'classnames';

import intl from 'hzero-front/lib/utils/intl';
import styles from './index.less';

export const PROCESS_EXCUTE_STATUS = {
  FORM_VALIDATING: 'FORM_VALIDATING',
  FORM_VALID_ERROR: 'FORM_VALID_ERROR',
  FORM_VALID_SUCCESS: 'FORM_VALID_SUCCESS',
  SERVICE_EXCUTEING: 'SERVICE_EXCUTEING',
  SERVICE_EXCUTE_ERROR: 'SERVICE_EXCUTE_ERROR',
  SERVICE_EXCUTE_SUCCESS: 'SERVICE_EXCUTE_SUCCESS',
};

const ApproveProcessNotification = ({ status, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [percent, setPercent] = useState(0);
  const forceHidden = useRef(false);
  const handleClose = () => {
    setVisible(false);
    forceHidden.current = true;
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    setVisible(!!status);
    if (status === PROCESS_EXCUTE_STATUS.FORM_VALIDATING) {
      setPercent(25);
    }
    if (
      [PROCESS_EXCUTE_STATUS.FORM_VALID_ERROR, PROCESS_EXCUTE_STATUS.FORM_VALID_SUCCESS].includes(
        status
      )
    ) {
      setPercent(50);
    }
    if (
      [
        PROCESS_EXCUTE_STATUS.SERVICE_EXCUTEING,
        PROCESS_EXCUTE_STATUS.SERVICE_EXCUTE_ERROR,
      ].includes(status)
    ) {
      setPercent(75);
    }
    if (status === PROCESS_EXCUTE_STATUS.SERVICE_EXCUTE_SUCCESS) {
      setPercent(100);
      setTimeout(() => {
        handleClose();
      }, 1000);
    }
  }, [status]);

  if (!visible || forceHidden.current) {
    return null;
  }

  const renderFormValidateStatus = () => {
    switch (status) {
      case PROCESS_EXCUTE_STATUS.FORM_VALIDATING:
        return (
          <div className={styles['notice-status']}>
            <Text>{intl.get('hwfp.common.view.title.formValidating').d('正在执行表单校验')}</Text>
          </div>
        );
      case PROCESS_EXCUTE_STATUS.FORM_VALID_ERROR:
        return (
          <div className={classnames(styles['notice-status'], styles['notice-status-error'])}>
            <Text>{intl.get('hwfp.common.view.title.formValidError').d('表单校验执行失败')}</Text>
            <Icon type="cancel" />
          </div>
        );
      case PROCESS_EXCUTE_STATUS.FORM_VALID_SUCCESS:
      case PROCESS_EXCUTE_STATUS.SERVICE_EXCUTEING:
      case PROCESS_EXCUTE_STATUS.SERVICE_EXCUTE_ERROR:
      case PROCESS_EXCUTE_STATUS.SERVICE_EXCUTE_SUCCESS:
        return (
          <div className={classnames(styles['notice-status'], styles['notice-status-success'])}>
            <Text>{intl.get('hwfp.common.view.title.formValidSuccess').d('表单校验执行完成')}</Text>
            <Icon type="check_circle" />
          </div>
        );
      default:
        return null;
    }
  };

  const renderServciceExcuteStatus = () => {
    switch (status) {
      case PROCESS_EXCUTE_STATUS.FORM_VALIDATING:
      case PROCESS_EXCUTE_STATUS.FORM_VALID_ERROR:
      case PROCESS_EXCUTE_STATUS.FORM_VALID_SUCCESS:
        return (
          <div className={classnames(styles['notice-status'], styles['notice-status-disabled'])}>
            <Text>{intl.get('hwfp.common.view.title.waitServiceExcute').d('待执行服务任务')}</Text>
          </div>
        );
      case PROCESS_EXCUTE_STATUS.SERVICE_EXCUTEING:
        return (
          <div className={classnames(styles['notice-status'], styles['notice-status'])}>
            <Text>{intl.get('hwfp.common.view.title.serviceExcuting').d('正在执行服务任务')}</Text>
          </div>
        );
      case PROCESS_EXCUTE_STATUS.SERVICE_EXCUTE_ERROR:
        return (
          <div className={classnames(styles['notice-status'], styles['notice-status-error'])}>
            <Text>
              {intl.get('hwfp.common.view.title.serviceExcuteError').d('服务任务执行失败')}
            </Text>
            <Icon type="cancel" />
          </div>
        );
      case PROCESS_EXCUTE_STATUS.SERVICE_EXCUTE_SUCCESS:
        return (
          <div className={classnames(styles['notice-status'], styles['notice-status-success'])}>
            <Text>
              {intl.get('hwfp.common.view.title.serviceExcuteSuccess').d('服务任务执行成功')}
            </Text>
            <Icon type="check_circle" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.notice}>
      <div className={styles['notice-header']}>
        <div className={styles['notice-header-left']}>
          <Icon type="auto_fix_high" />
          <Text>
            {status === PROCESS_EXCUTE_STATUS.SERVICE_EXCUTE_SUCCESS
              ? intl.get('hwfp.common.view.title.processExcuteFinish').d('执行完成')
              : intl.get('hwfp.common.view.title.processExcuting').d('执行过程中，请勿离开页面')}
          </Text>
        </div>
        <div className={styles['notice-header-right']}>
          <Icon type="close" onClick={handleClose} />
        </div>
      </div>
      <div className={styles['notice-content']}>
        <Progress size="small" showInfo={false} percent={percent} />
        {renderFormValidateStatus()}
        {renderServciceExcuteStatus()}
      </div>
    </div>
  );
};

export default ApproveProcessNotification;
