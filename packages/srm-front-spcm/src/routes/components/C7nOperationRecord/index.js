/*
 * @Description: 操作记录/审批记录组件
 * @Date: 2022-04-14 16:27:35
 * @Author: yitian.mao@going-link.com
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useCallback } from 'react';
import { Modal, Button, Icon } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import Container from './Container';
import styles from './index.less';

/**
 * OperationRecord - 函数组件 props extends ButtonProps
 * @extends {FunctionComponent} - React.FunctionComponent
 * @reactProps {?displayType} [displayType='button'] - 默认展示成 `button` 形式 button/text
 * @reactProps {?text} [type=''] - 默认展示成 `button` 形式 button/text
 * @returns React.element
 */
const OperationRecord = (props) => {
  const {
    pcHeaderId,
    displayType = 'button',
    text = intl.get(`hzero.common.view.button.operationRecord`).d('操作记录'),
    icon = 'operation_service_request',
    funcType = 'flat',
    ...otherProps
  } = props;

  const handleOpenModal = useCallback(() => {
    Modal.open({
      key: Modal.key(),
      title: intl.get(`hzero.common.view.title.operationRecord`).d('操作记录'),
      children: <Container {...props} />,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: { color: 'primary' },
    });
  }, [pcHeaderId]);

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
  code: ['spcm.common'],
})(OperationRecord);
