import React, { useMemo, useContext, useCallback } from 'react';
import { observer } from 'mobx-react';
import { isArray, isEmpty } from 'lodash';
import { Alert } from 'choerodon-ui';
import { Tooltip, Icon } from 'choerodon-ui/pro';

import { Store } from '../../StoreProvider';
import styles from './index.less';

const ErrorsAlert = observer(() => {

  const {
    refsMap,
    activeKey,
    errorsMap,
    errIndexsMap,
    emitErrIndex,
  } = useContext(Store);
  const errors = errorsMap[activeKey];
  const errIndex = errIndexsMap[activeKey];
  const errLength = errors?.length;

  /**
 * @description: 错误定位记录更改回调
 * @param {String} 向上/向下
 * @return {*}
 */
  const handleErrIndexChange = useCallback(
    (type: 'prev' | 'next', disabled: boolean) => {
      if (disabled) return;
      const newIndex = type === 'next' ? errIndex + 1 : errIndex - 1;
      const code = errors[newIndex]?.code;
      const errNode = refsMap.current[code];
      if (errNode) {
        errNode.parentNode.scrollTop = errNode.offsetTop - 60;
      }
      emitErrIndex({ type });
    },
    [errIndex, errors, emitErrIndex, refsMap]
  );

  const message = useMemo(() => {
    if (isArray(errors) && !isEmpty(errors)) {
      const prefixCls = 'errors-alert-message';
      const prevDisabled = errIndex === 0;
      const nextDisabled = errIndex === errLength - 1;
      return (
        <div className={styles[prefixCls]}>
          <Tooltip title={errors[errIndex]?.message}>
            <div className={styles[`${prefixCls}-text`]}>{errors[errIndex]?.message}</div>
          </Tooltip>
          <div className={styles[`${prefixCls}-count`]}>
            ({errIndex + 1}/{errLength})
          </div>
          {errors.length > 1 && (
            <div className={styles[`${prefixCls}-guide`]}>
              <Icon
                type='keyboard_arrow_up'
                className={prevDisabled && styles[`${prefixCls}-guide-disabled`]}
                onClick={() => handleErrIndexChange('prev', prevDisabled)}
              />
              <Icon
                type='keyboard_arrow_down'
                className={nextDisabled && styles[`${prefixCls}-guide-disabled`]}
                onClick={() => handleErrIndexChange('next', nextDisabled)}
              />
            </div>
          )}
        </div>
      );
    };
  }, [errors, errIndex, errLength, handleErrIndexChange]);

  if (!message) return null;

  return (
    <div className={styles['errors-alert-wrapper']}>
      <Alert
        banner
        closable
        showIcon
        message={message}
        className={styles[`ssta-alert-error`]}
      />
    </div>
  );
});

export default ErrorsAlert;