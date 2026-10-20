/**
 * FullMonitoring - 全量监控企业管理
 * @date: 2019-07-01
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import Tabs from './Tabs';

/**
 * 全量监控企业管理
 * @extends {Component} - Component
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} FullMonitoring - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['sslm.riskMonitoring'] })
export default class FullMonitoring extends Component {
  state = {};

  render() {
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sslm.riskMonitoring.view.message.title.fullMonitoring`)
            .d('全量监控企业管理')}
        />
        <Content style={{ paddingTop: 0 }}>
          <Tabs />
        </Content>
      </React.Fragment>
    );
  }
}
