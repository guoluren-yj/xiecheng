/**
 * 主题替换临时方案
 * @author 吴华真
 */

import React, { useEffect, useState } from 'react';
import { getCurrentTenant } from 'utils/utils';
import isNil from 'lodash/isNil';
import getTheme from './themes';

export default function ThemeProvider(props) {
  const tenant = getCurrentTenant();
  const { children } = props;
  const [style, setStyle] = useState(null);

  useEffect(() => {
    const promise = getTheme(tenant);
    if (promise) {
      promise.then((result) => setStyle((result.default || result)()));
    } else {
      setStyle('');
    }
  }, [tenant]);

  return isNil(style) ? null : (
    <>
      <style>
        {style}
      </style>
      {children}
    </>
  );
}
