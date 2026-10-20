/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-18 17:43:15
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-13 15:43:12
 */

import React, { useMemo } from 'react';

import intl from 'utils/intl';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import styles from '../index.less';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Index = function Index({
  name,
  title,
  amount,
  imgSrc,
  selectSrc,
  disabled = false,
  onChange = () => {},
  activeKey,
}) {
  const isSelectd = name === activeKey;

  const handleChange = () => {
    if (!disabled && isFunction(onChange)) {
      onChange(name);
    }
  };

  const itemClassNames = useMemo(() => {
    const classNames = [styles['occupied-or-applied-detail-formula-item']];

    if (disabled) {
      classNames.push(styles['occupied-or-applied-detail-formula-item-disabled']);
    }

    if (isSelectd) {
      classNames.push(styles['occupied-or-applied-detail-formula-item-select']);
    }

    return classNames;
  }, [disabled, isSelectd]);

  return (
    <div className={itemClassNames.join(' ')} onClick={handleChange}>
      <div className="formula-item-wrapper">
        <div className="formula-item-right">
          <div>
            <div className="formula-item-right-title">{title}</div>
            <Tooltip title={amount || '0'}>
              <div className="formula-item-right-mount">{amount || 0}</div>
            </Tooltip>
          </div>
        </div>

        <div className="formula-item-left">
          {!disabled && (
            <div className="formula-item-left-detail">
              <a>{intl.get(`${commonPrompt}.detail`).d('明细')}</a>
              <Icon type="keyboard_arrow_right" width="16" height="16" />
            </div>
          )}

          <img className="formula-item-left-img" alt="icon" src={isSelectd ? selectSrc : imgSrc} />
        </div>
      </div>
    </div>
  );
};

export default observer(Index);
