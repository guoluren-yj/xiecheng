/**
 * index.js - store 业务规则定义
 * @date: 2021-06-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import Context from '../Context';
import getServiceRuleDs from './serviceRuleDs';
import {
  getParamServiceDs,
  getParamTableDs,
  getReturnValueTableDs,
} from '../stores/paramServiceDs';
import {
  getPolicyConfigDs,
  getPolicyConfigDataDs,
  getConditionJsonDs,
  getCustomizeConditionCombinationDs,
} from '../stores/policyConfigDs';

// const Store = createContext();

// export default Store;

const StoreProvider = props => {
  const {
    children,
    serviceRuleDs,
    returnValueDs,
    paramTableDs,
    paramServiceDs,
    policyConfigDs,
    policyConfigDataDs,
    conditionJsonDs,
    customizeConditionCombinationDs,
  } = props;

  const value = {
    ...props,
    serviceRuleDs,
    returnValueDs,
    paramTableDs,
    paramServiceDs,
    policyConfigDs,
    policyConfigDataDs,
    conditionJsonDs,
    customizeConditionCombinationDs,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default formatterCollections({
  code: ['spfm.rulesDefinition', 'hzero.common'],
})(
  withProps(
    () => {
      const serviceRuleDs = new DataSet(getServiceRuleDs()); // 服务规则 ds
      const paramServiceDs = new DataSet(getParamServiceDs()); // 参数服务头 ds
      const paramTableDs = new DataSet(getParamTableDs()); // 参数表格 ds
      const returnValueDs = new DataSet(getReturnValueTableDs()); // 返回值 ds
      const policyConfigDs = new DataSet(getPolicyConfigDs()); // 策略配置表格 ds
      const policyConfigDataDs = new DataSet(getPolicyConfigDataDs()); // 策略配置行数据 ds
      const conditionJsonDs = new DataSet(getConditionJsonDs()); // 策略配置条件 ds
      const customizeConditionCombinationDs = new DataSet(getCustomizeConditionCombinationDs()); //

      return {
        serviceRuleDs,
        returnValueDs,
        paramTableDs,
        paramServiceDs,
        policyConfigDs,
        policyConfigDataDs,
        conditionJsonDs,
        customizeConditionCombinationDs,
      };
    },
    { cacheState: true }
  )(StoreProvider)
);
