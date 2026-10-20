/*
 * index - 导入状态公共页面
 * @date: 2019/08/20 18:48
 * @author: 左向宇 <xiangyu.zuo@giong-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import { Table, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { createPagination } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';

@connect(({ loading = {}, sinvCommon = {} }) => ({
  fetchLeadTypeListLoading: loading.effects['sinvCommon/fetchLeadTypeList'],
  againLeadTypeListLoading: loading.effects['sinvCommon/againLeadTypeList'],
  sinvCommon,
}))
@formatterCollections({
  code: ['sinv.common'],
})
export default class ActionRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [], // 操作记录数据源
      pagination: {}, // 分页
    };
  }

  /**
   * getSnapshotBeforeUpdate 生命周期函数
   * 判断是否加载数据
   * @param {object} prevProps - 上一个状态下的props
   */
  //   getSnapshotBeforeUpdate(prevProps) {
  //     const { visible } = this.props;
  //     return visible && prevProps.visible !== visible;
  //   }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   * @param pagination
   */
  @Bind()
  handleSearch(pagination = {}) {
    const { recordList, dispatch, importType } = this.props;
    dispatch({
      type: 'sinvCommon/fetchLeadTypeList',
      payload: {
        importType, // 来源类型
        asnLineId: recordList.asnLineId,
        page: pagination,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content || [],
          pagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 重新同步
   */
  @Bind()
  startAgain(record) {
    const { dispatch, recordList } = this.props;
    dispatch({
      type: 'sinvCommon/againLeadTypeList',
      payload: {
        record,
        asnLineId: recordList.asnLineId,
      },
    }).then((res) => {
      if (res) {
        this.handleSearch();
        notification.success();
      }
    });
  }

  @Bind()
  onCell(record) {
    if (record.importStatus === 'SUCCESS') {
      return {
        style: { backgroundColor: '#7FFF00' },
      };
    } else if (record.importStatus === 'FAIL') {
      return {
        style: { backgroundColor: '#DC143C' },
      };
    } else {
      return {
        style: { backgroundColor: '#FFD700' },
      };
    }
  }

  render() {
    const {
      hideModal,
      visible = false,
      fetchLeadTypeListLoading,
      againLeadTypeListLoading,
      asnNum,
    } = this.props;
    const { pagination = {}, dataSource = [] } = this.state;
    const columns = [
      {
        title: intl.get(`sinv.common.model.common.importStatusMeaning`).d('导入状态'),
        dataIndex: 'importStatusMeaning',
        width: 150,
        render: (val, record) => {
          if (record.importStatus === 'SUCCESS') {
            return <div style={{ color: '#228B22' }}>{val}</div>;
          } else if (record.importStatus === 'FAIL') {
            return <div style={{ color: '#8B0000' }}>{val}</div>;
          } else {
            return <div style={{ color: '#DAA520' }}>{val}</div>;
          }
        },
        onCell: this.onCell,
      },
      {
        title: intl.get(`sinv.common.model.common.synchronousExecution`).d('同步执行'),
        dataIndex: 'synchronousExecution',
        width: 150,
        render: (val, record) => {
          if (record.importStatus === 'SUCCESS' || record.importStatus === 'IMPORTING') {
            return <span>{intl.get(`sinv.common.model.common.startAgain`).d('重新同步')}</span>;
          } else {
            return (
              <a onClick={() => this.startAgain(record)}>
                {intl.get(`sinv.common.model.common.startAgain`).d('重新同步')}
              </a>
            );
          }
        },
      },
      {
        title: intl.get(`sinv.common.model.common.importMessage`).d('反馈信息'),
        dataIndex: 'importMessage',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.sourceCode`).d('外部系统'),
        dataIndex: 'sourceCode',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.importType`).d('接口代码'),
        dataIndex: 'importType',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.importTypeMeaning`).d('接口名称'),
        dataIndex: 'importTypeMeaning',
        width: 150,
      },
    ];
    const tableProps = {
      pagination,
      columns,
      dataSource,
      bordered: true,
      loading: fetchLeadTypeListLoading || againLeadTypeListLoading,
      rowKey: 'asnActionId',
      onChange: this.handleSearch,
    };
    return (
      <Modal
        title={`${intl.get(`sinv.common.model.common.recordList`).d('标准送货单')}${asnNum}`}
        width={800}
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
