/**
 * 规则配置详情
 * @date: 2021-09-02
 * @author: Zepeng Huang <zepeng.huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { useEffect, useState } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Tabs, Spin } from 'choerodon-ui';
import qs from 'querystring';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { queryRuleManageConfigOrg } from '@/services/ruleManagesService';
import { openTab } from 'utils/menuTab';
import { getBasicParamDs, getParamDs, getActionConfigDs } from '../store/ruleManagesDetailDs';
import BasicParamOnlyRead from './BasicParamOnlyRead';
import ParamTableOnlyRead from './ParamTableOnlyRead';
import ActionConfigOnlyRead from './ActionConfigOnlyRead';

const { TabPane } = Tabs;

function DetailOnlyRead(props = {}) {
  const { tenantId, metaDefinitionId } = qs.parse(props.history.location.search.substr(1)); // 截取url上面传递参数
  const [spinning, handleSpinning] = useState(false); // 是否在loading
  const { basicParamDs, interfaceParamDs, returnParamDs, actionConfigDs } = props.valueDs; // 获取各个DS对象

  /**
   * 查询
   */
  useEffect(() => {
    if (metaDefinitionId) {
      queryData(metaDefinitionId);
    }
  }, [metaDefinitionId, tenantId]); // 仅当租户id发生变化时才重新执行查询

  /**
   * 根据主键查询数据
   * @param {Number} mId
   */
  const queryData = (mId) => {
    handleSpinning(true);
    // 查询数据，租户级别不需要提供租户id
    queryRuleManageConfigOrg({ metaDefinitionId: mId })
      .then((res) => {
        if (getResponse(res)) {
          const { interfaceParameters, parameters } = res;
          basicParamDs.create(res); // 表单DS采用创建record的形式
          interfaceParamDs.loadData(JSON.parse(interfaceParameters)); // 表格DS直接载入数据即可
          returnParamDs.loadData(JSON.parse(parameters));
          actionConfigDs.setQueryParameter('fullPathCode', res.fullPathCode);
          actionConfigDs.setQueryParameter('code', res.code);
          actionConfigDs.query();
        } else {
          handleSpinning(false);
        }
      })
      .finally(() => handleSpinning(false));
  };

  /**
   * 重置数据
   */
  const resetAllDs = () => {
    basicParamDs.reset();
    interfaceParamDs.loadData([]);
    returnParamDs.loadData([]);
  };

  /**
   * 路由跳转函数，由【返回参数】页面点击参数key后携带参数跳转至【指标探查】页面
   */
  const routeIndexSearch = () => {
    const {
      interfaceParameters,
      service: { serviceName, serviceRoute },
      parameters,
    } = basicParamDs.current.get(['interfaceParameters', 'service', 'parameters']);
    const parameterKey = returnParamDs.current.get('parameterKey');
    // 指标探查页面的查询所需参数
    const payload = {
      interfaceParameters,
      serviceRoute,
      serviceName,
      parameterKey,
      parameters,
    };
    openTab({
      key: '/sdps/index-search-org',
      title: intl.get('sdps.ruleManagesDetail.view.newtab.title').d('指标探查'),
      state: payload,
    });
  };

  // 各子组件所需的传参
  const basicParamProps = {
    formDs: basicParamDs,
  };

  const interfaceParamProps = {
    tableDs: interfaceParamDs,
    isInterface: true,
  };

  const returnParamProps = {
    tableDs: returnParamDs,
    isInterface: false,
    routeIndexSearch,
  };

  const actionProps = {
    actionConfigDs,
  };

  return (
    <React.Fragment>
      <Header
        title={intl.get('sdps.ruleManagesDetail.view.header.title').d('规则详情')}
        backPath="/sdps/rule-manages-org/list"
        onBack={resetAllDs}
      />
      <Content>
        <Spin spinning={spinning}>
          <Tabs defaultActiveKey="basic">
            <TabPane
              tab={intl.get('sdps.ruleManagesDetail.view.tab.basic').d('基本信息')}
              key="basic"
            >
              <BasicParamOnlyRead {...basicParamProps} />
            </TabPane>
            <TabPane
              tab={intl.get('sdps.ruleManagesDetail.view.tab.interface_parameter').d('接口参数')}
              key="interface_parameter"
              disabled={metaDefinitionId === undefined}
            >
              <ParamTableOnlyRead {...interfaceParamProps} />
            </TabPane>
            <TabPane
              tab={intl.get('sdps.ruleManagesDetail.view.tab.index_parameter').d('返回参数')}
              key="index_parameter"
              disabled={metaDefinitionId === undefined}
            >
              <ParamTableOnlyRead {...returnParamProps} />
            </TabPane>
            <TabPane
              tab={intl.get('sdps.ruleManagesDetail.view.tab.action').d('策略配置')}
              key="action"
              disabled={metaDefinitionId === undefined}
            >
              <ActionConfigOnlyRead {...actionProps} />
            </TabPane>
          </Tabs>
        </Spin>
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['sdps.ruleManagesDetail'],
})(
  withProps(
    () => {
      const basicParamDs = new DataSet(getBasicParamDs());
      const interfaceParamDs = new DataSet(
        // 添加一个是否必输的查询字段
        getParamDs([
          {
            name: 'isRequired',
            type: 'boolean',
            label: intl
              .get('sdps.ruleManagesDetail.model.ruleManagesDetail.isRequired')
              .d('是否必输'),
          },
        ])
      );
      const returnParamDs = new DataSet(getParamDs());
      const actionConfigDs = new DataSet(getActionConfigDs());

      const valueDs = {
        basicParamDs,
        interfaceParamDs,
        returnParamDs,
        actionConfigDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(DetailOnlyRead)
);
