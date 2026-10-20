import React, { Component } from 'react';
import { Table, Popconfirm, Menu, Dropdown, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

const prompt = 'scec.companyBanner';
export default class TableList extends Component {
  // 编辑
  @Bind()
  handleEdit(record) {
    const { onHandleEdit } = this.props;
    onHandleEdit(record);
  }

  // 查看
  @Bind
  handleCheck(record) {
    const { onHandleCheck } = this.props;
    onHandleCheck(record);
  }

  // 上架/下架Banner
  @Bind()
  handleOperatingBanner(action, bannerId) {
    const { onHandleOperatingBanner } = this.props;
    onHandleOperatingBanner(action, bannerId);
  }

  /**
   * 打开-历史记录
   */
  @Bind()
  showHistoryRecord(record) {
    const { onShowHistoryRecord } = this.props;
    onShowHistoryRecord(record);
  }

  render() {
    const { dataSource = [], loading, pagination, onChange } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.model.companyBanner.bannerName`).d('Banner名称'),
        dataIndex: 'bannerName',
        width: 120,
      },
      {
        title: intl.get(`${prompt}.model.companyBanner.bannerType`).d('Banner类型'),
        dataIndex: 'bannerTypeName',
        width: 120,
      },
      {
        title: intl.get(`${prompt}.model.companyBanner.orderSeq`).d('排序号'),
        dataIndex: 'orderSeq',
        width: 80,
      },
      {
        title: intl.get(`scec.shopBasket.model.shoppingBasket.creationDate`).d('创建时间'),
        dataIndex: 'creationDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`scec.shopBasket.model.shoppingBasket.startDate`).d('开始时间'),
        dataIndex: 'startDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`scec.shopBasket.model.shoppingBasket.endDate`).d('截止时间'),
        dataIndex: 'endDate',
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'bannerStatusName',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: '_edit',
        render: (_, record) => {
          const menu = (
            <Menu>
              <Menu.Item>
                <a onClick={() => this.handleCheck(record)}>
                  {intl.get('hzero.common.button.view').d('查看')}
                </a>
              </Menu.Item>
              <Menu.Item>
                <a onClick={() => this.showHistoryRecord(record)}>
                  {intl.get('scec.common.button.operating').d('操作记录')}
                </a>
              </Menu.Item>
            </Menu>
          );
          return (
            <span className="action-link">
              {record.bannerStatus === '1' ? (
                <Popconfirm
                  placement="topRight"
                  title={intl
                    .get(`${prompt}.click.remove.will.be.removed`)
                    .d('点击下架操作，该Banner内容将会下架')}
                  onConfirm={() => this.handleOperatingBanner(0, record.bannerId)}
                >
                  <a>{intl.get(`scec.customBar.model.customBar.offShelf`).d('下架')}</a>
                </Popconfirm>
              ) : (
                <Popconfirm
                  placement="topRight"
                  title={intl
                    .get(`${prompt}.click.remove.will.be.on`)
                    .d('点击上架操作，该Banner内容将会上架')}
                  onConfirm={() => this.handleOperatingBanner(1, record.bannerId)}
                >
                  <a>{intl.get(`scec.customBar.model.customBar.onShelf`).d('上架')}</a>
                </Popconfirm>
              )}
              {record.bannerStatus === '1' ? (
                <a disabled>{intl.get('hzero.common.button.edit').d('编辑')}</a>
              ) : (
                <a onClick={() => this.handleEdit(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}
              <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
                <a className="ant-dropdown-link">
                  {intl.get('scec.common.button.more').d('更多')} <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          );
        },
      },
      {
        title: intl.get(`scec.companyBanner.model.companyBanner.processUser`).d('操作人'),
        dataIndex: 'lastUpdatedByName',
        width: 180,
        render: (_, record) => {
          return <span title={record.lastUpdatedByName}>{record.lastUpdatedByName}</span>;
        },
      },
    ];
    return (
      <Table
        bordered
        columns={columns}
        rowKey="bannerId"
        dataSource={dataSource}
        pagination={pagination}
        loading={loading}
        onChange={page => onChange(page)}
      />
    );
  }
}
