/*
 * @Description: 结算策略详情-错误记录导航栏
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, useCallback } from 'react';
import { CheckBox, Button, Tooltip } from 'choerodon-ui/pro';
import { isArray, isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import StatusTag from '@/routes/Components/StatusTag';

import { Store } from '../StoreProvider';

/**
 * @description: 错误记录导航栏
 * @param {*}
 * @return {ReactNode}
 */
export default observer(() => {
  const {
    refsMap,
    editFlag,
    headerDs,
    activeKey,
    errorsMap,
    errIndexsMap,
    emitErrIndex,
    getTagProps,
    titleMap,
    settleConfigId,
  } = useContext(Store);
  const tagProps = getTagProps(activeKey);
  const title = titleMap[activeKey];
  const errors = errorsMap[activeKey];
  const errIndex = errIndexsMap[activeKey];
  const errLength = errors?.length;

  /**
   * @description: 错误定位记录更改回调
   * @param {String} 向上/向下
   * @return {*}
   */
  const handleErrIndexChange = useCallback(
    (type) => {
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

  return (
    <div className="strategy-config-bar">
      <div className="strategy-config-bar-title">
        <span>{title}</span>
        {editFlag && settleConfigId !== 'create' && (
          <div className="strategy-config-bar-tag">
            <StatusTag size="small" {...tagProps} />
          </div>
        )}
      </div>
      <div className="strategy-config-bar-others">
        {isArray(errors) &&
          !isEmpty(errors) && [
            <Tooltip title={errors[errIndex]?.message}>
              <span className="strategy-config-bar-error">{errors[errIndex]?.message}</span>
            </Tooltip>,
            <span>
              ({errIndex + 1}/{errLength})
            </span>,
            <Button
              size="small"
              funcType="flat"
              icon="expand_more"
              disabled={errIndex === errLength - 1}
              onClick={() => handleErrIndexChange('next')}
            />,
            <Button
              size="small"
              funcType="flat"
              icon="expand_less"
              disabled={errIndex === 0}
              onClick={() => handleErrIndexChange('prev')}
            />,
          ]}
        {activeKey === 'payment' && [
          <CheckBox dataSet={headerDs} name="enablePaymentFlag">
            {intl.get(`ssta.settleStrategy.model.settleStrategy.payEnableFlag`).d('启用付款配置')}
          </CheckBox>,
        ]}
      </div>
      {/* <Select placeholder="搜索配置项" /> */}
    </div>
  );
});
