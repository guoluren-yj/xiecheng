/**
 * ActionRecord - 操作记录
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Modal, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import intl from 'utils/intl';
import { createPagination } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

export default class ActionRecord extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
    };
  }

  componentDidMount() {
    const { asnHeaderId } = this.props;
    if (asnHeaderId) {
      this.handleSearch({ asnHeaderId });
    }
  }
  /**
   * 查询操作列表
   * @param {Object} fields
   */

  @Bind()
  handleSearch(fields) {
    const { onFetchOperation } = this.props;
    if (isFunction) {
      onFetchOperation(fields).then((res) => {
        if (res) {
          const pagination = createPagination(res);
          const dataSource = res.content;
          this.setState({
            pagination,
            dataSource,
          });
        }
      });
    }
  }
  /**
   * 分页改变回调
   * @param {Object} pagination
   */

  @Bind()
  handleActionHistoryTableChange(pagination) {
    const { asnHeaderId } = this.props;
    this.handleSearch({ asnHeaderId, page: pagination });
  }

  render() {
    const { dataSource, pagination } = this.state;
    const { loading, hideModal, visible } = this.props;
    const columns = [
      {
        title: intl.get(`entity.roles.operator`).d('操作人'),
        dataIndex: 'processUser',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.processDate`).d('操作时间'),
        dataIndex: 'processDate',
        width: 150,
        align: 'left',
        render: dateTimeRender,
      },
      {
        title: intl.get(`sinv.common.model.common.processStatusMeaning`).d('动作'),
        dataIndex: 'processStatusMeaning',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.explain`).d('说明'),
        dataIndex: 'processRemark',
        render: (value, record) => (
          <Tooltip title={value}>
            <span>{record.processRemark}</span>
          </Tooltip>
        ),
      },
    ];
    const tableProps = {
      loading,
      pagination,
      columns,
      dataSource,
      bordered: true,
      rowKey: 'asnActionId',
      onChange: this.handleActionHistoryTableChange,
    };
    return (
      <Modal
        title={intl.get(`sinv.common.model.common.operationRecord`).d('操作记录')}
        width={820}
        visible={visible}
        bodyStyle={{ maxHeight: '600px', overflow: 'auto' }}
        onCancel={hideModal}
        footer={null}
      >
        <Table {...tableProps} />
      </Modal>
    );
  }
}
