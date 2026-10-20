/**
 * Platform - 菜单管理 - 平台tab页
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table, Modal, Tooltip } from 'hzero-ui';
import { sum, isFunction } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { dateRender } from 'utils/renderer';

// import modal from '../modal';
import OperationRecord from './OperationRecord';
// import OperationRecord from '../../components/DeliveryOeration';

/**
 * List - 业务组件 - 送货单创建 - 送货单创建汇总tab内容列表
 * @extends {Component} - React.Component
 * @reactProps {function} [ref= (e => e)] - react ref属性
 * @reactProps {boolean} [loading=false] - 表格处理状态
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @reactProps {object} [pagination={}] - 分页数据
 * @reactProps {Array<Object>} [dataSource=[]] - 表格数据源
 * @reactProps {object} [rowSelection={}] - 表格选择框配置
 * @return React.element
 */
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    // 方法注册
    [
      'onCell',
      'asnNumColumnRender',
      'operationRecordRender',
      'openOperationRecordModal',
      'cancel',
      'handleFetchOperationRecord',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * componentWillUnmount 生命周期函数
   * 组件卸载时销毁操作记录弹窗
   */
  componentWillUnmount() {
    if (this.operationRecordModal && isFunction(this.operationRecordModal.destroy)) {
      this.operationRecordModal.destroy();
    }
  }

  defaultTableRowKey = 'asnHeaderId';

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

  /**
   * asnNumColumnRender - 送货单编码单元格render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */
  asnNumColumnRender(text, record) {
    const { redirectDetail = (e) => e } = this.props;
    return <a onClick={() => redirectDetail(record.asnHeaderId)}>{text}</a>;
  }

  /**
   * operationRecordRender - 操作记录单元格render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */
  operationRecordRender(text, record) {
    return (
      <a onClick={() => this.openOperationRecordModal(record)}>
        {intl.get(`sinv.common.model.common.operationRecord`).d('操作记录')}
      </a>
    );
  }

  /**
   * openOperationRecordModal - 打开操作记录弹窗
   * @param {!object} record - 行数据
   */
  openOperationRecordModal(record) {
    this.setState({
      activeRow: record,
      visible: true,
    });
  }

  /**
   * cancel - 设置表格单元格属性函数
   */
  cancel() {
    this.setState({
      activeRow: {},
      visible: false,
    });
  }

  /**
   * handleFetchOperationRecord - 操作记录弹窗获取数据
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  handleFetchOperationRecord(params, success = (e) => e) {
    const { fetchOperationRecord } = this.props;
    const { activeRow = {} } = this.state;
    fetchOperationRecord(activeRow.asnHeaderId, params, success);
  }

  render() {
    const {
      dataSource = [],
      rowSelection,
      pagination,
      onChange,
      processing,
      customizeTable,
    } = this.props;
    const { visible } = this.state;
    const tableProps = {
      dataSource,
      columns: [
        {
          title: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
          width: 150,
          dataIndex: 'asnNum',
          // onCell: this.onCell,
          render: this.asnNumColumnRender,
        },
        {
          title: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
          width: 120,
          dataIndex: 'asnTypeCodeMeaning',
          // onCell: this.onCell,
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'supplierCompanyName',
          width: 180,
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.companySiteName`).d('公司地点'),
          dataIndex: 'supplierSiteName',
          width: 180,
          render: (val) => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
          // onCell: this.onCell,
        },
        {
          title: intl.get(`entity.customer.tag`).d('客户'),
          dataIndex: 'companyName',
          width: 180,
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
          dataIndex: 'actualReceiverName',
          // render: enableRender,
          width: 70,
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.invOrganization`).d('收货组织'),
          dataIndex: 'organizationName',
          width: 180,
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
          dataIndex: 'shipToLocationAddress',
          render: (val) => (
            <Tooltip title={val} placement="topLeft">
              {val}
            </Tooltip>
          ),
          width: 180,
          // onCell: this.onCell,
        },
        {
          title: intl.get(`sinv.common.model.common.creationDate`).d('创建日期'),
          dataIndex: 'creationDate',
          width: 140,
          render: dateRender,
        },
        {
          title: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
          dataIndex: 'shipDate',
          width: 120,
          // render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : null),
          render: (text) => {
            const val = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
            return <span>{dateRender(val)}</span>;
          },
        },
        {
          title: intl.get(`sinv.common.model.common.operationRecord`).d('操作记录'),
          width: 100,
          dataIndex: 'operationRecord',
          render: this.operationRecordRender,
        },
      ],
      rowKey: this.defaultTableRowKey,
      bordered: true,
      rowSelection,
      pagination,
      onChange,
      loading: processing.queryList,
    };
    tableProps.scroll = {
      x: sum(tableProps.columns.map((n) => n.width)),
      y: 'calc(100vh - 400px)',
    };
    // const operationProps = {
    //   visible,
    //   record: activeRow,
    //   asnHeaderId: activeRow?.asnHeaderId,
    //   hideModal: this.cancel,
    //   fetchDataSource: this.handleFetchOperationRecord,
    // };
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SINV.DELIVERY_CREATION.LIST_BY_MAINTAIN',
          },
          <Table {...tableProps} />
        )}
        <Modal
          title={intl.get(`sinv.common.view.button.operationRecord`).d('操作记录')}
          visible={visible}
          onCancel={this.cancel}
          destroyOnClose
          width={680}
          footer={null}
        >
          {visible && <OperationRecord fetchDataSource={this.handleFetchOperationRecord} />}
        </Modal>
        {/* {visible && <OperationRecord {...operationProps} />} */}
      </Fragment>
    );
  }
}
