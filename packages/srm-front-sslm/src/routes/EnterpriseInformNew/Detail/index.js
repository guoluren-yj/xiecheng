import querystring from 'querystring';
import React, { useMemo, useEffect } from 'react';
import { isFunction } from 'lodash';

import Detail from './Detail';

const Index = props => {
  const routerParams = useMemo(() => querystring.parse(props.location.search.substr(1)), [
    props.location.search,
  ]);
  const { partnerTenantId, partnerTenantNum } = routerParams;
  const isAllPlatform = useMemo(() => partnerTenantId === '-1', [partnerTenantId]);

  // 供应商加载采购方二开代码
  const loadCuxModule = async () => {
    if (isFunction(window.loadTenantMicroConfig)) {
      await window.loadTenantMicroConfig(partnerTenantNum);
    }
  };

  useEffect(() => {
    // 租户级加载采购方二开代码
    if (partnerTenantNum && !isAllPlatform) {
      loadCuxModule();
    }
  }, [partnerTenantNum, isAllPlatform]);

  return (
    <Detail
      {...props}
      routerParams={routerParams}
      isAllPlatform={isAllPlatform}
      partnerTenantNum={partnerTenantNum}
    />
  );
};

export default Index;
