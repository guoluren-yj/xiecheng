/**
 * OperationRecord  - 送货单创建 - 操作记录
 * @date: 2018-12-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

export default class OperationRecord extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
      loading: false,
    };
    // 方法注册
    ['onCell', 'handleFetchDataSource', 'onChange'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * componentDidMount - 生命周期函数
   * 获取操作记录表格数据
   */
  componentDidMount() {
    this.handleFetchDataSource();
  }

  /**
   * handleFetchDataSource - 获取操作记录表格数据
   * @param {object} params - 查询参数
   */
  handleFetchDataSource(params) {
    const { fetchDataSource = (e) => e } = this.props;
    this.setState({
      loading: true,
    });
    fetchDataSource(params, (res) => {
      const { dataSource = [], pagination = {} } = res;
      this.setState({
        dataSource,
        pagination,
        loading: false,
      });
    });
  }

  defaultTableRowKey = 'asnActionId';

  /**
   * onChange - 获取操作记录表格数据
   * @param {object} page - 查询参数
   */
  onChange(page) {
    this.handleFetchDataSource({ page });
  }

  /**
   * onCell - 设置表格单元格属性函数
   */
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const { dataSource = [], pagination, loading } = this.state;
    const tableProps = {
      dataSource,
      columns: [
        {
          title: intl.get('entity.roles.operator').d('操作人'),
          dataIndex: 'processUser',
          width: 150,
          align: 'left',
          onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.processDate`).d('操作时间'),
          width: 160,
          align: 'left',
          dataIndex: 'processDate',
          onCell: this.onCell,
          render: dateTimeRender,
        },
        {
          title: intl.get(`sinv.common.model.common.processStatusMeaning`).d('动作'),
          align: 'left',
          dataIndex: 'processStatusMeaning',
        },
        {
          title: intl.get(`sinv.common.model.common.explain`).d('说明'),
          align: 'left',
          dataIndex: 'processRemark',
        },
      ],
      rowKey: this.defaultTableRowKey,
      loading,
      onChange: this.onChange,
      pagination,
      bordered: true,
    };
    return <Table {...tableProps} />;
  }
}
