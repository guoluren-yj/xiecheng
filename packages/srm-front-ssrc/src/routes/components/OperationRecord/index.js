/**
 * 操作记录通用组件
 * @date: 2021-07-23
 * @author: goku<xu.pan01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, ZhenYun
 */
import React, { useCallback } from 'react';
import { Modal, Button, Icon } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import OperationRecordExport from '@/routes/components/OperationRecordExport';

import Container from './Container';
import styles from './index.less';

const promptCode = 'ssrc.common';

/**
 * OperationRecord - 函数组件 props extends ButtonProps
 * @extends {FunctionComponent} - React.FunctionComponent
 * @reactProps {?displayType} [displayType='button'] - 默认展示成 `button` 形式 button/text
 * @reactProps {?text} [type=''] - 默认展示成 `button` 形式 button/text
 * @returns React.element
 */
const OperationRecord = (props) => {
  const {
    rfxHeaderId,
    displayType = 'button',
    text = intl.get(`${promptCode}.view.button.operationRecord`).d('操作记录'),
    icon = 'operation_service_request',
    funcType = 'flat',
    rfx = {},
    ...otherProps
  } = props;

  const handleOpenModal = useCallback(() => {
    const operationRef = React.createRef();
    const containerProps = {
      rfxHeaderId,
      rfx,
      handleOperationRef: operationRef,
    };
    Modal.open({
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
    });
  }, [rfxHeaderId]);

  return displayType === 'text' ? (
    <a className={styles['a-as-btn']} onClick={handleOpenModal}>
      {!isNil(props.icon) && <Icon type={icon} style={{ fontSize: '12px' }} />}
      {text}
    </a>
  ) : (
    <Button icon={icon} funcType={funcType} onClick={handleOpenModal} {...otherProps}>
      {text}
    </Button>
  );
};

export default formatterCollections({
  code: ['ssrc.common'],
})(OperationRecord);
