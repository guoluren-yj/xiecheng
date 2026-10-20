/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-06-07 15:36:04
 * @LastEditors: yanglin
 * @LastEditTime: 2022-12-12 15:18:42
 */
import React, { useState } from 'react';

export function getTabsPropsCallback({ components, callback = () => {} }) {
  const [initFlag, setInitFlag] = useState(false);

  const { init } = components?.props?.value?.cache['SPRM.FORECAST_WORKBENCH.TAB'] || {};
  if (init && !initFlag) {
    setInitFlag(true);
    callback(components?.props);
  }

  return <>{components}</>;
}
