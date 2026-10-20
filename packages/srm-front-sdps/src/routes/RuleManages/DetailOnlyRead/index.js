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
import { queryRuleManageConfig } from '@/services/ruleManagesService';
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
      queryData(metaDefinitionId, tenantId); // 带上tenantID去查询
    }
  }, [metaDefinitionId, tenantId]); // 仅当租户id发生变化时才重新执行查询

  /**
   * 根据主键和租户id查询数据
   * @param {Number} mId
   * @param {Number} tId
   */
  const queryData = (mId, tId) => {
    handleSpinning(true);
    queryRuleManageConfig({ metaDefinitionId: mId, tenantId: tId })
      .then((res) => {
        if (getResponse(res)) {
          const { interfaceParameters, parameters } = res;
          basicParamDs.create(res);
          interfaceParamDs.loadData(JSON.parse(interfaceParameters));
          returnParamDs.loadData(JSON.parse(parameters));
          // 如果是租户级，还需要查询策略配置
          if (tenantId !== '0') {
            actionConfigDs.setQueryParameter('fullPathCode', res.fullPathCode);
            actionConfigDs.setQueryParameter('tenantId', tenantId);
            actionConfigDs.query();
          }
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
  };

  const actionProps = {
    actionConfigDs,
  };

  return (
    <React.Fragment>
      <Header
        title={intl.get('sdps.ruleManagesDetail.view.header.title').d('规则详情')}
        backPath="/sdps/rule-manages/list"
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
            {
              // 如果是租户级，还需要有一个策略配置tab页
              tenantId !== '0' && (
                <TabPane
                  tab={intl.get('sdps.ruleManagesDetail.view.tab.action').d('策略配置')}
                  key="action"
                  disabled={metaDefinitionId === undefined}
                >
                  <ActionConfigOnlyRead {...actionProps} />
                </TabPane>
              )
            }
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
