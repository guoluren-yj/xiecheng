import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { DataSet, Table, Dropdown, Menu, Icon } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
// import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';

import c7nModal from '@/utils/c7nModal';
import EnableTag from '@/components/EnableTag';
// import { enableAuthority, upgradeAuthority, publishAuthority } from './api';
import Detail from './Detail';
import { tableDs } from './ds';

@formatterCollections({ code: ['sagm.common', 'sagm.dimension'] })
export default class StrategyConfig extends Component {
  organizationId = getCurrentOrganizationId();

  tableDs = new DataSet(tableDs());

  columns = [
    { name: 'dimensionCode', width: 180 },
    { name: 'dimensionName', minWidth: 200 },
    { name: 'dimensionType', width: 140 },
    {
      name: 'unitDimensionFlag',
      width: 100,
    },
    {
      name: 'editFlag',
      width: 100,
    },
    {
      name: 'inputFlag',
      width: 100,
    },
    { name: 'tenantLov', width: 180 },
    { name: 'orderSeq', width: 90 },
    {
      name: 'enableFlag',
      width: 90,
      renderer: ({ record }) => <EnableTag enabledFlag={record.get('enabledFlag')} />,
    },
    { name: 'action', width: 100, lock: 'right', renderer: this.renderOptions },
  ];

  componentDidMount() {
    this.tableDs.query();
  }

  @Bind
  renderOptions({ record }) {
    const options = [
      {
        text: intl.get('hzero.common.edit').d('编辑'),
        show: true,
        event: () => this.handleOpenRight(record.toData()),
      },
    ];

    const menus = options.filter(f => f.show && f.type === 'menu');
    const actions = options.filter(f => f.show && f.type !== 'menu');
    const menu = (
      <Menu>
        {menus.map(m => (
          <Menu.Item key={m.text}>
            <a onClick={m.event} disabled={m.disabled}>
              {m.text}
            </a>
          </Menu.Item>
        ))}
      </Menu>
    );
    return (
      <span className="action-link">
        {actions.map(m => (
          <a onClick={m.event} style={m.style || {}} disabled={m.disabled}>
            {m.text}
          </a>
        ))}
        {menus.length > 0 && (
          <Dropdown overlay={menu}>
            <a>
              {intl.get('sagm.common.model.options.more').d('更多操作')}
              <Icon type="arrow_drop_down" />
            </a>
          </Dropdown>
        )}
      </span>
    );
  }

  @Bind
  fetchList(authDimensionId) {
    if (authDimensionId) {
      this.tableDs.query(this.tableDs.currentPage);
    } else {
      this.tableDs.query();
    }
  }

  @Bind
  handleOpenRight(data, readOnly = false) {
    c7nModal({
      style: { width: 600 },
      footer: readOnly ? null : undefined,
      title: intl.get('sagm.dimension.view.dimensionDefine').d('维度定义'),
      children: <Detail data={data} readOnly={readOnly} onFetchList={this.fetchList} />,
    });
  }

  render() {
    return (
      <Fragment>
        <Header title={intl.get('sagm.dimension.view.authorityTitle').d('采买权限维度')}>
          <Button icon="plus" type="primary" onClick={() => this.handleOpenRight({})}>
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
