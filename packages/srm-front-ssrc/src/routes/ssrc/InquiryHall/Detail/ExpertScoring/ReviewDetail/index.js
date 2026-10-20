/**
 * 符合性检查
 * 专家审核明细
 */
import React from 'react';
import { Button, Icon } from 'choerodon-ui/pro';
import { isNil, compose } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
// import formatterCollections from 'utils/intl/formatterCollections';

import useModal from './useModal';
import styles from './index.less';

const promptCode = 'ssrc.common';
const { openModal } = useModal();

const ReviewDetail = (props) => {
  const {
    displayType = 'text',
    text = intl.get(`${promptCode}.view.button.scoringDetail`).d('评分明细'),
    icon = 'operation_service_request',
    funcType = 'flat',
    title,
    resultColor = '',
    modalProps = {},
    ...otherProps
  } = props;

  const handleOpenModal = () => {
    openModal({ ...otherProps }, modalProps);
  };

  return displayType === 'text' ? (
    <a className={styles['a-as-btn']} onClick={handleOpenModal} style={{ color: resultColor }}>
      {!isNil(props.icon) && <Icon type={icon} style={{ fontSize: '12px' }} />}
      {text}
    </a>
  ) : (
    <Button icon={icon} funcType={funcType} onClick={handleOpenModal} {...otherProps}>
      {text}
    </Button>
  );
};

const HocComponent = (NewComponent) => {
  return compose()(observer(NewComponent));
  // formatterCollections({
  //   code: [
  //     'ssrc.inquiryHall',
  //     'ssrc.supplierQuotation',
  //     'ssrc.common',
  //     'scux.ssrc',
  //     'sscux.ssrc',
  //   ],
  // })
};

export default HocComponent(ReviewDetail);
