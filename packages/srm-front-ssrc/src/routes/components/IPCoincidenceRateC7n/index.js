/**
 * ip重合率通用组件
 * @date: 2022-02-15
 * @author: yujie.shao@going-link.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, ZhenYun
 */
import React, { useEffect, useState } from 'react';
import { Button, Icon } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { querySetting } from '@/services/bidHallService';

import styles from './index.less';
import useIpRateModal from './useModal';

const promptCode = 'ssrc.inquiryHall';

const { openModal } = useIpRateModal();

/**
 * ScoringDetail - 函数组件 props extends ButtonProps
 * @extends {FunctionComponent} - React.FunctionComponent
 * @reactProps {?displayType} [displayType='button'] - 默认展示成 `button` 形式 button/text
 * @reactProps {?text} [type=''] - 默认展示成 `button` 形式 button/text
 * @returns React.element
 */
const IPCoincidenceRate = (props) => {
  const {
    displayType = 'button',
    text = intl.get(`${promptCode}.view.button.IPCoincidenceRate`).d('IP重合率'),
    title,
    iconProps = {},
    modalProps = {},
    ...otherProps
  } = props;

  const [ipConfig, setIpConfig] = useState({}); // 查询ip配置中心结果

  useEffect(() => {
    // 查询配置中心
    querySetting({ '011107': '011107' }).then((res) => {
      const result = getResponse(res);
      if (result) {
        setIpConfig(result);
      }
    });
  }, []);

  const handleOpenModal = () => {
    openModal(otherProps, modalProps);
  };

  return ipConfig['011107'] && +ipConfig['011107'].settingValue ? (
    displayType === 'text' ? (
      <a className={styles['a-as-btn']} onClick={handleOpenModal}>
        {!isNil(iconProps.icon) && <Icon style={{ fontSize: '12px' }} {...iconProps} />}
        {text}
      </a>
    ) : (
      <Button onClick={handleOpenModal} {...otherProps}>
        {text}
      </Button>
    )
  ) : null;
};

export default formatterCollections({
  code: ['ssrc.inquiryHall', 'ssrc.common'],
})(IPCoincidenceRate);
