import React, { useEffect, useState } from 'react';
import { Spin } from 'choerodon-ui';
import { compose } from 'lodash';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { getResponse, getCurrentTenant } from 'utils/utils';

import { fetchBusinessRule } from '@/services/deliveryCreationService';
import { queryNewTableEnable } from '@/services/sinvCommonService';

import C7NIndex from './c7nIndex';
import Permission from './hzeroIndex';

const { tenantNum } = getCurrentTenant();

const Index = (props) => {
  const [type, useType] = useState();
  const [planList, useFlag] = useState({
    ruleData: {},
    planTypeFlag: null,
  });

  useEffect(() => {
    webpageCut();
    fetchBusinessInit();
  }, []);

  // 查询业务规则定义
  const fetchBusinessInit = async () => {
    const res = await fetchBusinessRule();
    if (getResponse(res)) {
      const { rcvFlag, planDataFlag, planFlag } = res;
      // ((rcvFlag && planDataFlag) || planFlag)
      useFlag({
        ...planList,
        ruleData: res,
        planTypeFlag: (rcvFlag && planDataFlag) || planFlag ? '1' : res.planFlag,
      });
      // typeSubtotal();
    }
  };

  // 页面组件切换-新
  const webpageCut = async () => {
    const params = {
      tenantNum,
    };
    const res = await queryNewTableEnable(params);
    if (getResponse(res)) {
      const menuTypes = res.filter((i) => i.menuName === 'create');
      if (menuTypes?.length) {
        useType('C7N');
      } else {
        useType('H0');
      }
    }
  };
  /**
   * @searchListParams : {defaultTabKey: tabKey, searchParams: { ...searchParams}}
   */
  const { remote } = props;
  const { getFetchListParams, resetFetchListParams } = remote?.props?.process || {};
  const searchListParams = typeof getFetchListParams === 'function' ? getFetchListParams() : {};
  const resetFetchListParamsChange =
    typeof resetFetchListParams === 'function' ? resetFetchListParams : undefined;
  const listprops = { ...props, planList, useFlag, searchListParams, resetFetchListParamsChange };

  if (type === 'C7N') return <C7NIndex {...listprops} />;
  if (type === 'H0') return <Permission {...listprops} />;
  return <Spin />;
};

export default compose(
  cuxRemote(
    {
      code: 'SINV_DELIVERY_CREATION', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        getFetchListParams: undefined,
        resetFetchListParams: undefined, // 默认 undefined， 如果需要传递查询参数， 可以在此处定义
      },
    }
  )
)(Index);
