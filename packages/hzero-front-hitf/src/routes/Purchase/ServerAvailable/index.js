/**
 * ServerAvailable - 可用服务列表
 * @date: 2020-2-27
 * @author: fengwanjun <wanjun.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { DataSet, Table } from 'choerodon-ui/pro';
import React, { Component } from 'react';

import { Content } from 'hzero-front/lib/components/Page';
import { TagRender } from 'hzero-front/lib/utils/renderer';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';

import { GROUP_SERVER_TYPE_TAGS, AVAILABLE_STATUS_TAGS } from '@/constants/CodeConstants';
import ServerAvailableDS from '../../../stores/Purchase/ServerAvailableDS';

/**
 * 可用服务列表
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hzero.common', 'hitf.serverAvailable'] })
export default class ServerAvailableList extends Component {
  constructor(props) {
    super(props);

    // 可用服务数据源
    this.tableDS = new DataSet({
      ...ServerAvailableDS(),
      autoQuery: false,
    });
  }

  componentDidMount() {
    // 设置查询参数
    this.tableDS.queryParameter.userPurchaseId = this.props.userPurchaseId;
    this.tableDS.query();
  }

  render() {
    return (
      <div>
        <Content>
          <Table
            dataSet={this.tableDS}
            columns={[
              {
                header: intl.get('hzero.common.view.serialNumber').d('序号'),
                lock: 'left',
                width: 70,
                align: 'center',
                renderer: ({ record }) =>
                  (this.tableDS.currentPage - 1) * this.tableDS.pageSize + record.index + 1,
              },
              {
                name: 'serverTypeCode',
                align: 'center',
                renderer: ({ value, text }) => TagRender(value, GROUP_SERVER_TYPE_TAGS, text),
              },
              {
                name: 'serverName',
              },
              {
                name: 'interfaceName',
              },
              {
                name: 'statusCode',
                align: 'center',
                renderer: ({ value, text }) => TagRender(value, AVAILABLE_STATUS_TAGS, text),
              },
              {
                name: 'remainCount',
              },
              {
                name: 'remark',
              },
            ]}
            queryBar="none"
          />
        </Content>
      </div>
    );
  }
}
