/**
 * 操作记录通用组件
 * @date: 2021-07-23
 * @author: goku<xu.pan01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Button, Icon } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import useModal from './useModal';
import styles from './index.less';

const promptCode = 'ssrc.common';
const { openModal } = useModal();

/**
 * ScoringDetail - 函数组件 props extends ButtonProps
 * @extends {FunctionComponent} - React.FunctionComponent
 * @reactProps {?displayType} [displayType='button'] - 默认展示成 `button` 形式 button/text
 * @reactProps {?text} [type=''] - 默认展示成 `button` 形式 button/text
 * @returns React.element
 */
const ScoringDetail = (props) => {
  const {
    displayType = 'button',
    text = intl.get(`${promptCode}.view.button.scoringDetail`).d('评分明细'),
    icon = 'operation_service_request',
    funcType = 'flat',
    title,
    remote,
    redFlag = false,
    modalProps = {},
    ...otherProps
  } = props;
  const handleOpenModal = () => {
    openModal({...otherProps, remote}, modalProps);
  };

  return displayType === 'text' ? (
    remote ? (
      remote.render(
        'SSRC_INQUIRY_HALL_DETAIL_RENDER_SCORING_DETAIL',
        <a
          className={styles['a-as-btn']}
          onClick={handleOpenModal}
          style={{ color: redFlag ? 'red' : '' }}
        >
          {!isNil(props.icon) && <Icon type={icon} style={{ fontSize: '12px' }} />}
          {text}
        </a>,
        {
          otherProps,
          modalProps,
        }
      )
    ) : (
      <a
        className={styles['a-as-btn']}
        onClick={handleOpenModal}
        style={{ color: redFlag ? 'red' : '' }}
      >
        {!isNil(props.icon) && <Icon type={icon} style={{ fontSize: '12px' }} />}
        {text}
      </a>
    )
  ) : (
    <Button icon={icon} funcType={funcType} onClick={handleOpenModal} {...otherProps}>
      {text}
    </Button>
  );
};

export default formatterCollections({
  code: ['ssrc.common'],
})(ScoringDetail);
