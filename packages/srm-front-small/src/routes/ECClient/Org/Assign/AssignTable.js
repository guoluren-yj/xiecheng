/**
 * ecClientAssign - 电商账号管理 - 分配设置表格
 * @date: 2019-2-25
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';

/**
 * 分配设置数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal - 展示编辑表单
 * @reactProps {Function} onVerify - 立即验证
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @return React.element
 */

export default class AssignTable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  showEditModal(record) {
    this.props.onEdit(record);
  }

  @Bind()
  immediatelyVerify(record) {
    this.props.onVerify(record);
  }

  render() {
    const { loading, dataSource } = this.props;
    const columns = [
      {
        title: intl.get('small.assign.model.assign.companyNum').d('公司编码'),
        align: 'center',
        width: 150,
        dataIndex: 'companyNum',
      },
      {
        title: intl.get('small.assign.model.assign.companyName').d('公司名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get('small.assign.model.assign.currencyName').d('默认币种'),
        width: 100,
        dataIndex: 'currencyName',
      },
      {
        title: intl.get('small.assign.model.assign.uomName').d('默认计量单位'),
        width: 120,
        dataIndex: 'uomName',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        render: record => {
          return (
            <a
              onClick={() => {
                this.showEditModal(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];

    return (
      <Table
        className="small-table-all-space"
        bordered
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        rowKey="assignId"
      />
    );
  }
}
