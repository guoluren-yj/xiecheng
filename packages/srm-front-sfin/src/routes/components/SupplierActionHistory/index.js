/**
 * 详情页面操作记录模态框
 * @date: 2019-11-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Table, Modal } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { createPagination, getCurrentOrganizationId } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';

const promptCode = 'sfin.supplierChargeEntry';
/**
 * 开票申请--对账单操作记录
 * @extends {Component} - PureComponent
 * @reactProps {Object} supplierChargeEntry - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e=>e ] - redux dispatch方法
 * @return React.element
 */
@connect(({ supplierCommon, loading }) => ({
  supplierCommon,
  loading: loading.effects['supplierCommon/fetchOperationRecordList'],
}))
@formatterCollections({ code: 'sfin.supplierChargeEntry' })
@withRouter
export default class ActionHistory extends Component {
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
      operationRecordList: {},
      operationRecordPagination: {},
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 操作记录查询
   * @param {object} page - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, data, deductionsId } = this.props;
    if (data) {
      dispatch({
        type: 'supplierCommon/fetchOperationRecordList',
        payload: {
          page,
          supplierDeductionsId: data.supplierDeductionsId || deductionsId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            // operationRecordList: res.content.map(n => ({ ...n, _status: 'update' })),
            operationRecordList: res,
            operationRecordPagination: createPagination(res),
          });
        }
      });
    }
  }

  @Bind()
  closeSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierCommon/updateState',
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
      // supplierChargeEntry: { operationRecordList = {}, operationRecordPagination = {} },
      visible,
      hideModal,
    } = this.props;
    const { tenantId } = this.state;
    const { operationRecordList = {}, operationRecordPagination = {} } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processTypeCode`).d('操作'),
        dataIndex: 'processTypeCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processUserName`).d('操作人'),
        dataIndex: 'processUserName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.processedDate`).d('操作时间'),
        dataIndex: 'processedDate',
        width: 100,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.actionDsirption`).d('操作说明'),
        dataIndex: 'processRemark',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.actionDsirption`).d('附件'),
        dataIndex: 'supplierAttachmentUuid',
        width: 100,
        render: (val, record) =>
          record.processTypeCode === 'RETURNED' ? (
            <Upload
              bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
              attachmentUUID={val}
              tenantId={tenantId}
              icon="download"
              viewOnly
              filePreview
            />
          ) : null,
      },
    ];
    return (
      <Modal
        title={intl.get('hzero.common.button.operating').d('操作记录')}
        visible={visible}
        onCancel={hideModal}
        footer={null}
        width={700}
        bodyStyle={{ minHeight: 300 }}
      >
        <Table
          loading={loading}
          dataSource={operationRecordList.content}
          pagination={operationRecordPagination}
          rowKey="recordId"
          onChange={this.handleSearch}
          columns={columns}
          bordered
        />
      </Modal>
    );
  }
}
