/**
 * 详情页面操作记录模态框
 * @date: 2018/11/30 10:26:49
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import moment from 'moment';

// import UploadModal from 'components/Upload';

import { Table, Modal, Popover, Tabs, Tooltip } from 'hzero-ui';
import { isFunction } from 'lodash';
import { dateTimeRender, approveNameRender } from 'utils/renderer';
// import { queryMapIdpValue } from 'services/api';

import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';

import formatterCollections from 'utils/intl/formatterCollections';

const { TabPane } = Tabs;

const promptCode = 'sfin.invoiceBill';
/**
 * 发票操作记录
 * @extends {Component} - PureComponent
 * @reactProps {Object} invoice - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e=>e ] - redux dispatch方法
 * @return React.element
 */
@connect(({ invoice, loading }) => ({
  invoice,
  loading: loading.effects['invoice/fetchOperationRecordList'],
}))
@formatterCollections({ code: 'sfin.invoiceBill' })
@withRouter
export default class Invoice extends Component {
  /**
   * state初始化
   * @param {objet} props - 组件props
   */
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      definitions: [],
    };
  }

  /**
   * 操作记录查询和审批记录
   * @param {object} page - 查询参数
   */
  @Bind()
  async handleSearch(page = {}) {
    const { dispatch, data, match } = this.props;
    if (data) {
      dispatch({
        type: 'invoice/fetchOperationRecordList',
        payload: {
          page,
          invoiceHeaderId: data.invoiceHeaderId,
        },
      });
    }
    if (match.params.invoiceHeaderId !== undefined) {
      const { invoiceHeaderId } = match.params;
      if (invoiceHeaderId) {
        dispatch({
          type: 'invoice/fetchOperationRecordList',
          payload: {
            page,
            invoiceHeaderId,
          },
        });
      }
      if (data) {
        dispatch({
          type: 'invoice/fetchApproveRecordList',
          payload: {
            page,
            invoiceHeaderId: data.invoiceHeaderId,
          },
        });
      }
      if (invoiceHeaderId) {
        dispatch({
          type: 'invoice/fetchApproveRecordList',
          payload: {
            page,
            invoiceHeaderId,
          },
        });
      }
    } else {
      const { invoiceHeaderId } = this.props;
      if (invoiceHeaderId) {
        dispatch({
          type: 'invoice/fetchOperationRecordList',
          payload: {
            page,
            invoiceHeaderId,
          },
        });
      }
      if (data) {
        dispatch({
          type: 'invoice/fetchApproveRecordList',
          payload: {
            page,
            invoiceHeaderId: data.invoiceHeaderId,
          },
        });
      }
      if (invoiceHeaderId) {
        dispatch({
          type: 'invoice/fetchApproveRecordList',
          payload: {
            page,
            invoiceHeaderId,
          },
        });
      }
    }
  }

  @Bind()
  closeSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/updateState',
      payload: {
        operationRecordPagination: {},
        operationRecordList: {}, // 缓存的操作记录数据要清空
      },
    });
  }

  /**
   * render查询表单
   */
  render() {
    const {
      loading,
      invoice: {
        operationRecordList = {},
        operationRecordPagination = {},
        approvalData = [],
        // approvalRecordPagination = {},
      },
      visible,
      hideModal,
      isApprovalShow,
      showRejected = false,
    } = this.props;
    const { definitions } = this.state;
    const newaApprovalData = approvalData.filter((elem) => ['Rejected'].includes(elem.action));
    const handleChange = (_, i, { order }) => {
      if (showRejected) {
        newaApprovalData.sort(({ endTime: a }, { endTime: b }) =>
          order === 'ascend'
            ? moment(a).valueOf() - moment(b).valueOf()
            : moment(b).valueOf() - moment(a).valueOf()
        );
      } else {
        approvalData.sort(({ endTime: a }, { endTime: b }) =>
          order === 'ascend'
            ? moment(a).valueOf() - moment(b).valueOf()
            : moment(b).valueOf() - moment(a).valueOf()
        );
      }
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processUser`).d('操作人'),
        dataIndex: 'processUser',
        width: 100,
        render: (val, record) => {
          return record.processStatus === 'EC_INVOICE_FAILED' ? 'oms' : val;
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processDate`).d('操作日期'),
        dataIndex: 'processDate',
        width: 100,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processStatusMeaning`).d('动作'),
        dataIndex: 'processStatusMeaning',
        width: 100,
        render: (val, record) => {
          return record.processStatus === 'EC_INVOICE_FAILED'
            ? intl.get(`${promptCode}.view.message.pushInvoice`).d('推送发票')
            : val;
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processRemark`).d('说明'),
        dataIndex: 'processRemark',
        width: 100,
        render: (val, record) => {
          const text =
            record.processStatus === 'EC_INVOICE_FAILED'
              ? intl.get(`${promptCode}.view.message.errorReason`, { val }).d(`失败原因是{val}`)
              : val;
          return <Popover content={text}>{text}</Popover>;
        },
      },
    ];
    const approvalColumns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.approval`).d('审批流'),
        dataIndex: 'processDefinitionMeaning',
        width: 150,
        render: (val) => {
          const findItem = definitions.find((item) => item.value === val.split(':')[0]);
          return findItem ? findItem.meaning : val.split(':')[0];
        },
      },
      {
        title: intl.get(`${promptCode}.model.approval.step`).d('审批环节'),
        dataIndex: 'name',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.approval.owner`).d('审批人'),
        dataIndex: 'assigneeName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.approval.action`).d('审批操作'),
        dataIndex: 'action',
        width: 150,
        render: approveNameRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.time`).d('时间'),
        dataIndex: 'endTime',
        width: 150,
        render: dateTimeRender,
        sorter: true,
      },
      {
        title: intl.get(`${promptCode}.model.approval.content`).d('审批说明'),
        dataIndex: 'comment',
        width: 150,
        render: (val) => <Tooltip title={val}>{val}</Tooltip>,
      },
      // {
      //   title: '附件',
      //   dataIndex: 'attachmentUuid',
      //   width: 150,
      //   fixed: 'right',
      //   render: (val, record) => {
      //     if (record.attachmentUuid) {
      //       return <UploadModal attachmentUUID={val} bucketName="private-bucket" viewOnly />;
      //     }
      //   },
      // },
    ];
    return (
      <Modal
        title={
          isApprovalShow ? null : intl.get(`hzero.common.view.message.operateHistory`).d('操作记录')
        }
        visible={visible}
        onCancel={hideModal}
        footer={null}
        width={800}
        bodyStyle={{ minHeight: 300 }}
      >
        {/* <Table
          loading={loading}
          dataSource={operationRecordList.content}
          pagination={operationRecordPagination}
          rowKey="recordId"
          onChange={this.handleSearch}
          columns={columns}
          bordered
        /> */}
        {isApprovalShow ? (
          <Tabs>
            <TabPane
              tab={intl.get(`hzero.common.view.message.operateHistory`).d('操作记录')}
              key="operator"
            >
              <Table
                tab={intl.get(`hzero.common.view.message.operateHistory`).d('操作记录')}
                loading={loading}
                dataSource={operationRecordList.content}
                pagination={operationRecordPagination}
                rowKey="recordId"
                onChange={this.handleSearch}
                columns={columns}
                bordered
              />
            </TabPane>
            <TabPane
              tab={intl.get(`${promptCode}.model.approval.record`).d('审批记录')}
              key="approval"
            >
              <Table
                bordered
                dataSource={showRejected ? newaApprovalData : approvalData}
                columns={approvalColumns}
                // pagination={approvalRecordPagination}
                onChange={handleChange}
                pagination={false}
              />
            </TabPane>
          </Tabs>
        ) : (
          <Table
            tab={intl.get(`hzero.common.view.message.operateHistory`).d('操作记录')}
            loading={loading}
            dataSource={operationRecordList.content}
            pagination={operationRecordPagination}
            rowKey="recordId"
            onChange={this.handleSearch}
            columns={columns}
            bordered
          />
        )}
      </Modal>
    );
  }
}
