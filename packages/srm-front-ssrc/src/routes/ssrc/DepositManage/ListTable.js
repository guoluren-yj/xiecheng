/**
 * ListTable - table组件
 * @date: 2020-04-01
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table, Popover } from 'hzero-ui';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { tableScrollWidth } from 'utils/utils';

const promptCode = 'ssrc.depositManage';

/**
 * ListTable - 展示组件 - table组件
 * @extends {Component} - React.PureComponent
 * @reactProps {!Object} [dataSource={}] - 数据源
 * @reactProps {!Object} [pagination={}] - 分页对象
 * @reactProps {boolean} [loading=false] - 请求完成标识
 * @reactProps {Function} [onChange=e => e] - 改变分页函数
 * @reactProps {Function} [onRowClick=e => e] - 点击行维护按钮
 * @return React.element
 */

@formatterCollections({
  code: 'ssrc.depositManage',
})
export default class ListTable extends PureComponent {
  render() {
    const {
      loading,
      dataSource = [],
      pagination = {},
      onChange,
      onRowClick,
      rowSelection,
      openNewBidFlag,
      remoteFunc,
    } = this.props;
    const preColumns = [
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'action',
        width: 100,
        align: 'center',
        render: (_, record) => {
          return (
            !record.observerFlag && (
              <a onClick={() => onRowClick(record)}>
                {intl.get('hzero.common.button.maintain').d('维护')}
              </a>
            )
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.sourceNum`).d('寻源单号'),
        dataIndex: 'sourceNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.sourceTitle`).d('寻源标题'),
        dataIndex: 'sourceTitle',
        width: 200,
        render: (text) =>
          text ? (
            <Popover content={text} placement="topLeft">
              {text}
            </Popover>
          ) : (
            text
          ),
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.companyName`).d('公司'),
        dataIndex: 'companyName',
        width: 200,
        render: (text) =>
          text ? (
            <Popover content={text} placement="topLeft">
              {text}
            </Popover>
          ) : (
            text
          ),
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.sourceCategory`).d('寻源类别'),
        dataIndex: openNewBidFlag ? 'secondarySourceCategoryMeaning' : 'sourceCategoryMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.sourceMethod`).d('寻源方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.purchaserName`).d('采购员'),
        dataIndex: 'purchaserName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.creator`).d('创建人'),
        dataIndex: 'sourceCreatedName',
        width: 100,
      },
    ];
    const columns = remoteFunc
      ? remoteFunc.process('SSRC_DEPOSIT_MANAGE_PROCESS_TABLE_COLUMN', preColumns)
      : preColumns;
    const scrollX = tableScrollWidth(columns);
    return (
      <Fragment>
        <Table
          bordered
          loading={loading}
          rowKey="sourceId"
          columns={columns}
          rowSelection={rowSelection}
          dataSource={dataSource}
          pagination={pagination}
          onChange={(page) => onChange(page)}
          scroll={{ x: scrollX }}
        />
      </Fragment>
    );
  }
}
