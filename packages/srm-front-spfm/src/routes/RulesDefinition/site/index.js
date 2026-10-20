/**
 * index.js 业务规则定义
 * @date: 2020-06-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, useState, useMemo } from 'react';
import { isArray } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import withProps from 'utils/withProps';
import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import getServiceRuleDs from '../stores/serviceRuleDs';
import {
  getParamServiceDs,
  getParamTableDs,
  getReturnValueTableDs,
  getReturnFieldTableDs,
} from '../stores/paramServiceDs';
import {
  getPolicyConfigDs,
  getPolicyConfigDataDs,
  getConditionJsonDs,
} from '../stores/policyConfigDs';
import TreeMenu from '../components/TreeMenu';
import DefinitionDetail from './DefinitionDetail';
import Context from '../components/Context';
import style from './index.less';
import { isJSON } from '../util';

function RulesDefinition(props = {}) {
  const [formVisible, handleFormVisible] = useState(false);
  const [returnMutlValueFlag, handleReturnMutlValueFlag] = useState(false); // 多值返回类型标识
  const [returnFieldDs, setReturnFieldDs] = useState(); // 返回字段ds
  const [loading, setLoadingStatus] = useState(false); // 返回字段ds
  const { serviceRuleDs, returnValueDs } = props.dsValue;

  // 返回值ds 添加 load 监听，如果 load的时候，添加 field 字段 描述、执行规则值
  useMemo(() => {
    returnValueDs.addEventListener('load', async () => {
      const returnFieldDsTmp = new DataSet(getReturnFieldTableDs());
      const fieldData = returnValueDs.toData() || [];
      fieldData.forEach((item) => {
        returnFieldDsTmp.addField(item.name, {
          ...item,
          required: true,
          type: item.lovCode ? 'object' : item.type || 'string',
          transformResponse: (value, object) => {
            if (object && !object.value && !object.valueMeaning) {
              return null;
            }
            if (item.lovCode && item.valueField) {
              return item.multiple
                ? (isJSON(value) ? JSON.parse(value) || [] : value || []).map((v, index) => {
                  const meaning = JSON.parse(object.valueMeaning || '[]');
                  return {
                    [item.valueField]: v,
                    [item.textField]: meaning[index],
                  };
                })
                : {
                  [item.valueField]: value,
                  [item.textField]: !returnMutlValueFlag
                    ? object.valueMeaning
                    : JSON.parse(object.valueMeaning)[item.name],
                };
            } else {
              return (isJSON(value) ? JSON.parse(value) : value) || '';
            }
          },
          transformRequest: (value) => {
            if (!value) {
              return null;
            }
            if (item.lovCode && item.valueField) {
              return isArray(value)
                ? JSON.stringify(value.map((v) => v[item.valueField]))
                : value[item.valueField];
            } else {
              return isArray(value) ? JSON.stringify(value) : value;
            }
          },
        });
      });
      setReturnFieldDs(returnFieldDsTmp);
    });
  }, [returnValueDs, returnMutlValueFlag]);

  return (
    <Fragment>
      <Header title={intl.get('spfm.rulesDefinition.view.title.header').d('业务规则定义')} />
      <div className={style['rule-definition']}>
        <Context.Provider value={{ ...props.dsValue, returnFieldDs, returnMutlValueFlag }}>
          <Spin spinning={loading}>
            <div className="rule-definition-content">
              <div className="rule-definition-tree">
                <TreeMenu
                  fetchDataDs={serviceRuleDs}
                  onChange={handleFormVisible}
                  handleReturnMutlValueFlag={handleReturnMutlValueFlag}
                  handleLoading={setLoadingStatus}
                />
              </div>
              <div className="rule-definition-form">
                {formVisible ? (
                  <DefinitionDetail dataDs={serviceRuleDs} style={{ overflowY: 'auto' }} />
                ) : (
                  <div className="rule-definition-black">
                    <div className="blank-pic" />
                    <div className="blank-title">
                      {intl
                        .get('spfm.rulesDefinition.view.title.blankTitle')
                        .d('请从左侧菜单中选择业务规则分类')}
                    </div>
                    <div className="blank-desc">
                      {intl
                        .get('spfm.rulesDefinition.view.title.blankDesc')
                        .d('业务规则定义可以配置相关的业务流程规则')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Spin>
        </Context.Provider>
      </div>
    </Fragment>
  );
}

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
      const dsValue = {
        serviceRuleDs,
        paramServiceDs,
        paramTableDs,
        returnValueDs,
        policyConfigDs,
        policyConfigDataDs,
        conditionJsonDs,
      };
      return { dsValue };
    },
    { cacheState: true }
  )(RulesDefinition)
);
