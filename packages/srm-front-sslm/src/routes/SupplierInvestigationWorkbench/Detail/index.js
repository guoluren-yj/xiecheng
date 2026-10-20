/*
 * @Date: 2026-08-05 17:08:02
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import querystring from 'querystring';
import React, { useMemo, useEffect } from 'react';
import { isFunction } from 'lodash';

import Detail from './Detail';

const Index = (props) => {
  const routerParams = useMemo(() => querystring.parse(props.location.search.substr(1)), [
    props.location.search,
  ]);
  const { tenantNum } = routerParams;

  // 供应商加载采购方二开代码
  const loadCuxModule = async () => {
    if (isFunction(window.loadTenantMicroConfig)) {
      await window.loadTenantMicroConfig(tenantNum);
    }
  };

  useEffect(() => {
    // 租户级加载采购方二开代码
    if (tenantNum) {
      loadCuxModule();
    }
  }, [tenantNum]);

  return <Detail {...props} routerParams={routerParams} purTenantNum={tenantNum} />;
};

export default Index;
