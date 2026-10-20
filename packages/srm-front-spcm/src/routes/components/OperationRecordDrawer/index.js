/*
 * OperationRecord  - 操作记录通用组件
 * @date: 2021-06-24
 * @author: HB <xinying.li@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Drawer, Table, Tabs, Popover, Select, Form } from 'hzero-ui';
import { connect } from 'dva';
import remotes from 'utils/remote';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  tableScrollWidth,
  createPagination,
  getUserOrganizationId,
  getCurrentTenant,
} from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import style from './index.less';

const commonPrompt = 'spcm.common.model.common';
const { TabPane } = Tabs;
const FormItem = Form.Item;

@Form.create({
  fieldNameProp: null,
})
@connect(({ contractCommon = {}, loading = {} }) => ({
  contractCommon,
  loading: loading.effects['contractCommon/fetchOperationRecord'],
}))
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionApproval',
    'spfm.certificationApproval',
    'spfm.notice',
    'hzero.common',
    'spcm.common',
  ],
})
@remotes(
  { code: 'SPCM_PURCHASECONTRACTVIEW_OPERATING_RECORD_MODAL' },
  {
    process: {
      processHistoryColumns: (columns) => columns,
    },
  }
)
export default class OperationRecordDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operateDataSource: [],
      operatePagination: {},
      approveDataSource: [],
      approvePagination: {},
    };
  }

  getSnapshotBeforeUpdate(preProps) {
    const { visible } = preProps;
    if (!visible && visible !== this.props.visible) {
      return true;
    }
    return false;
  }

  componentDidUpdate(props, state, snap) {
    const organizationId = getUserOrganizationId();
    const { tenantId } = getCurrentTenant();
    const approveSequenceCode = organizationId === tenantId ? '' : 'CONFIRMATION_AFTER_APPROVAL';
    if (snap) {
      this.value = approveSequenceCode;
      this.fetchOperateList();
      this.fetchApproveList({});
      this.fetchApprovalNode();
    }
  }

  /**
   * 查询操作记录
   */
  @Bind()
  fetchOperateList(page = {}) {
    const { dispatch, pcHeaderId = '' } = this.props;
    dispatch({
      type: 'contractCommon/fetchOperationRecord',
      payload: {
        page,
        pcHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          operateDataSource: res.content || [],
          operatePagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 查询审批记录
   */
  @Bind()
  fetchApproveList(page = {}) {
    const { dispatch, pcHeaderId } = this.props;
    dispatch({
      type: 'contractCommon/fetchApproveRecord',
      payload: {
        pcHeaderId,
        page,
        approveSequenceCode: this.value || '',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          approveDataSource: res.content || [],
          approvePagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 查询审批节点值集
   */
  @Bind()
  fetchApprovalNode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchApprovalNode',
    });
  }

  /**
   * 下拉框改变回调
   */
  @Bind()
  handleChange(value) {
    this.value = value;
    this.fetchApproveList({});
  }

  /**
   * 关闭模态框
   */
  @Bind()
  handleCancelModal() {
    const { onHandleCancel, form } = this.props;
    const { setFieldsValue } = form;
    setFieldsValue({
      processNode: '',
    });
    onHandleCancel();
  }

  @Bind()
  approveColumns() {
    const { remote } = this.props;
    const columns = [
      {
        title: intl.get(`${commonPrompt}.approveSequenceCode`).d('审批流'),
        dataIndex: 'approveSequenceCodeMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.processNode`).d('审批节点'),
        dataIndex: 'processNodeName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.processName`).d('审批人'),
        dataIndex: 'processName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.processAction`).d('审批操作'),
        dataIndex: 'processActionMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.processDate`).d('时间'),
        dataIndex: 'processDate',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.processRemark`).d('审批说明'),
        dataIndex: 'processRemark',
        width: 120,
        render: (_, record) => (
          <Popover
            content={record.processRemark}
            overlayClassName={style['processRemark-popover']}
            trigger="hover"
          >
            {record.processRemark}
          </Popover>
        ),
      },
    ];
    return remote?.process('processHistoryColumns', columns);
  }

  render() {
    const { loading, visible, otherModalProps, contractCommon, form, role } = this.props;
    const { getFieldDecorator } = form;
    const organizationId = getUserOrganizationId();
    const { tenantId } = getCurrentTenant();
    const { approveSequenceCode = [] } = contractCommon.detailEnumMap;
    const approveSequenceCodeList =
      organizationId === tenantId
        ? approveSequenceCode
        : approveSequenceCode.filter((item) => item.value === 'CONFIRMATION_AFTER_APPROVAL');
    const {
      operatePagination,
      operateDataSource,
      approveDataSource,
      approvePagination,
    } = this.state;
    const operateColumns = [
      {
        title: intl
          .get(`spfm.certificationApproval.model.operationRecord.processUserName`)
          .d('操作人'),
        dataIndex: 'processUserName',
        width: 140,
      },
      {
        title: intl
          .get(`spfm.certificationApproval.model.operationRecord.processDate`)
          .d('操作时间'),
        width: 150,
        dataIndex: 'processedDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`spfm.notice.model.actionDetail.processStatusMeaning`).d('动作'),
        dataIndex: 'processTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`sprm.purchaseRequisitionApproval.model.common.handleRemark`).d('操作说明'),
        dataIndex: 'processRemark',
      },
    ];
    const modalProps = {
      visible,
      width: 650,
      footer: null,
      onClose: this.handleCancelModal,
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      ...otherModalProps,
    };
    const operateProps = {
      loading,
      columns: operateColumns,
      dataSource: operateDataSource,
      pagination: operatePagination,
      bordered: true,
      scroll: { x: tableScrollWidth(operateColumns) },
      rowKey: (record, index) => index,
      onChange: this.fetchOperateList,
    };
    const approveProps = {
      loading,
      columns: this.approveColumns(),
      dataSource: approveDataSource,
      pagination: approvePagination,
      bordered: true,
      scroll: { x: tableScrollWidth(this.approveColumns()) },
      rowKey: (record, index) => index,
      onChange: this.fetchApproveList,
    };
    return (
      <Drawer {...modalProps}>
        <Tabs defaultActiveKey={this.state.activeKey} onChange={this.changeTabs} animated={false}>
          <TabPane tab={intl.get(`hzero.common.button.operating`).d('操作记录')} key="itemLine">
            <Table {...operateProps} />
          </TabPane>
          {role !== 'supplier' && (
            <TabPane
              tab={intl.get(`hzero.common.button.approveHistory`).d('审批记录')}
              key="approveLine"
            >
              <FormItem
                label={intl.get(`${commonPrompt}.approveSequenceCode`).d('审批流')}
                labelCol={{ span: 6 }}
              >
                {getFieldDecorator('processNode', {
                  initialValue: '',
                })(
                  <Select
                    allowClear
                    style={{ minWidth: 150 }}
                    onChange={(value) => this.handleChange(value)}
                  >
                    {approveSequenceCodeList.map((n) => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem>
                <Table {...approveProps} />
              </FormItem>
            </TabPane>
          )}
        </Tabs>
      </Drawer>
    );
  }
}
