/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-06-07 15:36:04
 * @LastEditors: yanglin
 * @LastEditTime: 2022-08-16 21:10:19
 */
import React, { useState } from 'react';

export function getTabsPropsCallback({ components, callback = () => {} }) {
  const [initFlag, setInitFlag] = useState(false);

  const { init } = components?.props?.value?.cache['SPRM.PURCHASE_PLAFORM.ALL_TAB'] || {};

  if (init && !initFlag) {
    setInitFlag(true);
    callback(components?.props);
  }

  return <>{components}</>;
}
