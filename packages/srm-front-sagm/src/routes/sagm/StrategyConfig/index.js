import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';

import EnableTag from '@/components/EnableTag';
import c7nModal from '@/utils/c7nModal';
import Detail from './Detail';

@formatterCollections({ code: ['sagm.common', 'sagm.strategy'] })
export default class StrategyConfig extends Component {
  tableDs = new DataSet({
    autoQuery: true,
    selection: false,
    fields: [
      {
        name: 'strategyDimensionCode',
        label: intl.get('sagm.strategy.view.dimensionCode').d('维度编码'),
      },
      {
        name: 'strategyDimensionName',
        label: intl.get('sagm.strategy.view.dimensionName').d('维度名称'),
      },
      {
        name: 'strategyTypeMeaning',
        label: intl.get('sagm.strategy.view.dimensionCategory').d('维度分类'),
      },
      {
        name: 'componentTypeMeaning',
        label: intl.get('sagm.common.view.componentType').d('组件类型'),
      },
      { name: 'lovCode', label: intl.get('sagm.common.view.valueCode').d('值集编码') },
      { name: 'enabledFlag', label: intl.get('hzero.common.status').d('状态') },
      { name: 'option', label: intl.get('hzero.common.action').d('操作') },
    ],
    transport: {
      read: {
        url: '/sagm/v1/strategy-dimensions',
        method: 'GET',
      },
    },
  });

  columns = [
    { name: 'strategyDimensionCode', width: 140 },
    { name: 'strategyDimensionName', minWidth: 120 },
    { name: 'strategyTypeMeaning', width: 120 },
    { name: 'componentTypeMeaning', width: 120 },
    { name: 'lovCode', minWidth: 200 },
    {
      name: 'enabledFlag',
      width: 120,
      renderer: ({ record }) => <EnableTag enabledFlag={record.get('enabledFlag')} />,
    },
    { name: 'option', width: 120, renderer: this.renderOptions },
  ];

  @Bind
  renderOptions({ record }) {
    return (
      <a onClick={() => this.handleEdit(record.get('strategyDimensionId'))}>
        {intl.get('hzero.common.edit').d('编辑')}
      </a>
    );
  }

  @Bind
  fetchList(type = 'create') {
    if (type === 'create') {
      this.tableDs.query();
    } else {
      this.tableDs.query(this.tableDs.currentPage);
    }
  }

  @Bind
  handleEdit(key) {
    const title =
      key === 'create'
        ? intl.get('sagm.strategy.view.strategyDimension.create').d('新建策略维度')
        : intl.get('sagm.strategy.view.strategyDimension.edit').d('编辑策略维度');
    c7nModal({
      style: { width: '50%' },
      title,
      children: <Detail type={key} onFetchList={this.fetchList} />,
    });
  }

  render() {
    return (
      <Fragment>
        <Header title={intl.get('sagm.strategy.view.strategyDimensionConfig').d('策略维度配置')}>
          <Button type="primary" onClick={() => this.handleEdit('create')} icon="plus">
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={this.tableDs} columns={this.columns} />
        </Content>
      </Fragment>
    );
  }
}
