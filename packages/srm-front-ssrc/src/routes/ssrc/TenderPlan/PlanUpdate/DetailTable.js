/**
 * Detail - 项目整体寻源计划维护表格
 * @date: 2019-04-17
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import { Form, Button, Input, DatePicker, Badge, Modal, Popover } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import moment from 'moment';

import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { getDateFormat, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import EditTable from 'components/EditTable';
import TLEditor from 'components/TLEditor';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';

import { batchDeletePlan } from '@/services/tenderPlanService';

const promptCode = 'ssrc.tenderPlan.model.tenderPlan';

@connect(({ tenderPlan, loading }) => ({
  tenderPlan,
  deleting: loading.effects['tenderPlan/tableDelete'],
  revokeCancel: loading.effects['tenderPlan/revokeCancelPlanUpdate'],
}))
export default class DetailTable extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    const remoteState = props.remoteFunc
      ? props.remoteFunc.process('SSRC_TENDER_PLAN_UPDATE_PROCESS_STATE', {})
      : {};

    this.state = {
      selectedRows: [],
      deleteLoading: false,
      ...(remoteState || {}),
    };
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 渲染操作
   * 处理状态：NEW/未审核；SUBMITTED/审核中；APPROVED/审核通过；REJECTED/审核拒绝
   */
  /**
   * 新建行 有问题
   */
  @Bind()
  handleCreateRow() {
    const { dispatch, planUpdateTable } = this.props;
    // const { realName } = getCurrentUser();
    dispatch({
      type: 'tenderPlan/updateState',
      payload: {
        planUpdateTable: [
          {
            // createdByName: `${realName}`,
            // processStatus: '未审核',
            // operate: '新增',
            _status: 'create',
            bidPlanLineId: uuid(),
          },
          ...planUpdateTable,
        ],
      },
    });
  }

  /**
   * 批量删除选中行
   */
  @Bind()
  handleDeleteRows() {
    const { onReload } = this.props;
    const { selectedRows } = this.state;
    this.setState({ deleteLoading: true });
    const bidPlanLineIdList = selectedRows
      ?.filter((e) => {
        return e._status === 'update';
      })
      ?.map((item) => {
        return item.bidPlanLineId;
      });
    const params = { bidPlanLineIdList };
    try {
      if (bidPlanLineIdList.length > 0) {
        batchDeletePlan(params).then((res) => {
          const response = getResponse(res);
          if (response) {
            notification.success();
            onReload();
            this.setState({ deleteLoading: false });
          }
        });
      } else {
        onReload();
        this.setState({ deleteLoading: false });
      }
    } catch (e) {
      throw e;
    } finally {
      this.setState({ deleteLoading: false });
      this.setState({ selectedRows: [] });
    }
  }

  /**
   * 修改行，对查询的结果进行修改
   * @param {Object} record
   */
  @Bind()
  editRow(record, flag) {
    const { dispatch, planUpdateTable } = this.props;
    const newPlanUpdateTable = planUpdateTable.map((item) =>
      record.bidPlanLineId === item.bidPlanLineId
        ? { ...item, _status: flag ? 'update' : '' }
        : item
    );
    dispatch({
      type: 'tenderPlan/updateState',
      payload: { planUpdateTable: newPlanUpdateTable },
    });
  }

  /**
   * 清除新建行
   * @param {Object} record
   * @memberof StoreRoom
   */
  @Bind()
  removeRow(record) {
    const { selectedRows } = this.state;
    const { dispatch, planUpdateTable } = this.props;
    const newPlanUpdateTable = planUpdateTable.filter(
      (item) => item.bidPlanLineId !== record.bidPlanLineId
    );
    dispatch({
      type: 'tenderPlan/updateState',
      payload: {
        planUpdateTable: newPlanUpdateTable,
      },
    });
    const restSelectedRows = selectedRows.filter((item) => {
      return item.bidPlanLineId !== record.bidPlanLineId;
    });
    this.setState({ selectedRows: restSelectedRows });
  }

  /**
   * 删除已保存行
   * @param {Object} record
   */
  @Debounce(500)
  @Bind()
  deleteRow(record) {
    const { selectedRows } = this.state;
    const { dispatch, onReload } = this.props;
    dispatch({
      type: 'tenderPlan/deletePlanUpdate',
      payload: {
        bidPlanLineId: record.bidPlanLineId,
      },
    }).then((res) => {
      if (res) {
        onReload();
        notification.success();
        const restSelectedRows = selectedRows.filter((item) => {
          return item.bidPlanLineId !== record.bidPlanLineId;
        });
        this.setState({ selectedRows: restSelectedRows });
      }
    });
  }

  /**
   * 撤销取消
   * @param {Object} record
   */
  @Bind()
  revokeCancelRow(record) {
    const { dispatch, onReload } = this.props;
    dispatch({
      type: 'tenderPlan/revokeCancelPlanUpdate',
      payload: {
        bidPlanLineId: record.bidPlanLineId,
      },
    }).then((res) => {
      if (res) {
        onReload();
        notification.success();
      }
    });
  }

  /**
   * 取消已保存行
   * @param {Object} record
   */
  @Bind()
  cancelRow(record) {
    const { dispatch, onReload } = this.props;
    Modal.confirm({
      title: intl.get('ssrc.tenderPlan.view.message.confirm.remove').d('确定取消选中数据?'),
      onOk: () => {
        dispatch({
          type: 'tenderPlan/cancelPlanUpdate',
          payload: {
            bidPlanLineId: record.bidPlanLineId,
          },
        }).then((res) => {
          if (res) {
            onReload();
            notification.success();
          }
        });
      },
    });
  }

  /**
   * @param {*} value 当前值
   * @param {*} date
   * @param {*} record 行的值
   */
  @Bind()
  handleDate(value, date, record) {
    let poor = '';
    if (value && date) {
      poor = Math.abs(value.diff(date, 'days'));
    }
    record.$form.setFieldsValue({
      bidDay: poor,
    });
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce(
      (prev, current) => prev + (current.className ? 0 : current.width ? current.width : 0),
      0
    );
    return total + fixWidth + 0;
  }

  render() {
    const {
      isDetail = false,
      planUpdateTable,
      customizeTable,
      remoteFunc,
      dispatch,
      onReload,
      form = {},
      bidPlanId,
    } = this.props;
    const dateFormat = getDateFormat();
    const { selectedRows, deleteLoading } = this.state;
    const preColumns = [
      {
        title: intl.get(`${promptCode}.bidPlanLineNum`).d('计划单号'),
        dataIndex: 'bidPlanLineNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.bidPlanLineName`).d('寻源计划名称'),
        dataIndex: 'bidPlanLineName',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            if (record.operate === 'CANCEL' || isDetail || record.enabledFlag === 0) {
              return (
                <Popover placement="topLeft" content={val}>
                  {val}
                </Popover>
              );
            } else {
              const { getFieldDecorator, getFieldValue } = record.$form;
              return (
                <Form.Item>
                  <Popover
                    placement="topLeft"
                    content={getFieldValue('bidPlanLineName')}
                    trigger="hover"
                  >
                    {getFieldDecorator('bidPlanLineName', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${promptCode}.bidPlanLineName`).d('寻源计划名称'),
                          }),
                        },
                      ],
                      initialValue: record.bidPlanLineName,
                    })(
                      <TLEditor
                        label={intl.get(`${promptCode}.bidPlanLineName`).d('寻源计划名称')}
                        field="bidPlanLineName"
                        token={record._token}
                      />
                    )}
                  </Popover>
                </Form.Item>
              );
            }
          }
        },
      },
      {
        title: intl.get(`${promptCode}.businessCategory`).d('业务类别'),
        dataIndex: 'businessCategory',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            if (record.operate === 'CANCEL' || isDetail || record.enabledFlag === 0) {
              return record.businessCategoryMeaning;
            } else {
              const { getFieldDecorator } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('businessCategory', {
                    initialValue: record.businessCategory,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.businessCategory`).d('业务类别'),
                        }),
                      },
                    ],
                  })(
                    <ValueList
                      lovCode="SSRC.BUSINESS_CATEGORY"
                      lazyLoad={false}
                      style={{ width: '100%' }}
                      allowClear
                    />
                  )}
                </Form.Item>
              );
            }
          }
        },
      },
      {
        title: intl.get(`${promptCode}.bidMethod`).d('寻源方式'),
        dataIndex: 'bidMethod',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            if (record.operate === 'CANCEL' || isDetail || record.enabledFlag === 0) {
              return record.bidMethodMeaning;
            } else {
              const { getFieldDecorator } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('bidMethod', {
                    initialValue: record.bidMethod,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.bidMethod`).d('寻源方式'),
                        }),
                      },
                    ],
                  })(
                    <ValueList
                      lovCode="SSRC.BID_METHOD"
                      lazyLoad={false}
                      style={{ width: '100%' }}
                      allowClear
                    />
                  )}
                </Form.Item>
              );
            }
          }
        },
      },
      {
        title: intl.get(`${promptCode}.startDate`).d('寻源开始日期'),
        dataIndex: 'startDate',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            if (record.operate === 'CANCEL' || isDetail || record.enabledFlag === 0) {
              return dateRender(val);
            } else {
              const { getFieldDecorator, getFieldValue } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('startDate', {
                    initialValue: record.startDate && moment(record.startDate),
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.startDate`).d('寻源开始日期'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      format={dateFormat}
                      disabledDate={(currentDate) =>
                        getFieldValue('endDate') &&
                        moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                      }
                      onChange={(value) =>
                        this.handleDate(value, record.$form.getFieldValue('endDate'), record)
                      }
                    />
                  )}
                </Form.Item>
              );
            }
          }
        },
      },
      {
        title: intl.get(`${promptCode}.endDate`).d('寻源完成日期'),
        dataIndex: 'endDate',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            if (record.operate === 'CANCEL' || isDetail || record.enabledFlag === 0) {
              return dateRender(val);
            } else {
              const { getFieldDecorator, getFieldValue } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('endDate', {
                    initialValue: record.endDate && moment(record.endDate, getDateFormat()),
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.endDate`).d('寻源完成日期'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      format={dateFormat}
                      disabledDate={(currentDate) =>
                        getFieldValue('startDate') &&
                        moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                      }
                      onChange={(value) =>
                        this.handleDate(record.$form.getFieldValue('startDate'), value, record)
                      }
                    />
                  )}
                </Form.Item>
              );
            }
          }
        },
      },
      {
        title: intl.get(`${promptCode}.bidDay`).d('寻源天数'),
        dataIndex: 'bidDay',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            if (record.operate === 'CANCEL' || isDetail || record.enabledFlag === 0) {
              return val;
            } else {
              const { getFieldDecorator } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('bidDay', {
                    initialValue: record.bidDay,
                  })(<Input disabled />)}
                </Form.Item>
              );
            }
          }
        },
      },
      {
        title: intl.get(`${promptCode}.currencyType`).d('币种'),
        dataIndex: 'currencyCode',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            if (record.operate === 'CANCEL' || isDetail || record.enabledFlag === 0) {
              return val;
            } else {
              const { getFieldDecorator } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('currencyCode', {
                    initialValue: record.currencyCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.currencyCode`).d('币种'),
                        }),
                      },
                    ],
                  })(<Lov code="SMDM.EXCHANGE_RATE.CURRENCY" textValue={record.currencyCode} />)}
                </Form.Item>
              );
            }
          }
        },
      },
      {
        title: intl.get(`${promptCode}.budgetAmountWithRMB`).d('预算金额(元)'),
        dataIndex: 'budgetAmount',
        width: 150,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            if (record.operate === 'CANCEL' || isDetail || record.enabledFlag === 0) {
              return val;
            } else {
              const { getFieldDecorator } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('budgetAmount', {
                    initialValue: record.budgetAmount,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.budgetAmount`).d('预算金额'),
                        }),
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      financial={record?.$form.getFieldValue('currencyCode')}
                      min={0}
                      max={9999999999}
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              );
            }
          }
        },
      },
      {
        title: intl.get(`${promptCode}.createdByName`).d('创建人'),
        dataIndex: 'realName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.processStatusMeaning`).d('审核状态'),
        dataIndex: 'processStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.operateMeaning`).d('修订状态'),
        dataIndex: 'operateMeaning',
        width: 100,
      },
      {
        title: intl.get('hzero.common.status.cancel').d('取消'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: (_, record) =>
          record.enabledFlag === 0 && record.processStatus === 'APPROVED' ? (
            <Badge status="error" text={intl.get(`${promptCode}.cancelled`).d('已取消')} />
          ) : null,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            if (record.operate === 'CANCEL' || isDetail || record.enabledFlag === 0) {
              return val;
            } else {
              const { getFieldDecorator } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('remark', {
                    rules: [
                      {
                        max: 480,
                        message: intl.get('hzero.common.validation.max', {
                          max: 480,
                        }),
                      },
                    ],
                    initialValue: record.remark,
                  })(<Input />)}
                </Form.Item>
              );
            }
          }
        },
      },
    ];
    if (!isDetail) {
      preColumns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 120,
        fixed: 'right',
        //  render: (_, record) => this.actionRender(record),
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'create' ? (
              <a onClick={() => this.removeRow(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            ) : record._status === 'update' ? (
              <span className="action-link">
                {record.processStatus === 'NEW' && record.operate !== 'CANCEL' && (
                  <a onClick={() => this.deleteRow(record)}>
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </a>
                )}
                {record.operate !== 'NEW' &&
                  record.operate !== 'CANCEL' &&
                  (record.processStatus === 'APPROVED' || record.processStatus === 'REJECT') &&
                  record.enabledFlag === 1 && (
                    <a onClick={() => this.cancelRow(record)}>
                      {intl.get('hzero.common.button.cancel').d('取消')}
                    </a>
                  )}
                {record.operate === 'CANCEL' &&
                  (record.processStatus === 'APPROVED' || record.processStatus === 'REJECT') && (
                    <a onClick={() => this.revokeCancelRow(record)}>
                      {intl.get(`${promptCode}.revokeCancel`).d('撤销取消')}
                    </a>
                  )}
              </span>
            ) : (
              <span className="action-link">
                {record.processStatus === 'NEW' && record.operate !== 'CANCEL' && (
                  <a onClick={() => this.deleteRow(record)}>
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </a>
                )}
                {record.operate !== 'NEW' &&
                  record.operate !== 'CANCEL' &&
                  (record.processStatus === 'APPROVED' || record.processStatus === 'REJECT') &&
                  !record.enabledFlag && (
                    <a onClick={() => this.cancelRow(record)}>
                      {intl.get('hzero.common.button.cancel').d('取消')}
                    </a>
                  )}
              </span>
            )}
          </span>
        ),
      });
    }

    const columns = remoteFunc
      ? remoteFunc.process('SSRC_TENDER_PLAN_UPDATE_PROCESS_TABLE_COLUMN', preColumns, {
          dispatch,
          isDetail,
          handleDate: this.handleDate,
          removeRow: this.removeRow,
          onReload,
          cancelRow: this.cancelRow,
          revokeCancelRow: this.revokeCancelRow,
        })
      : preColumns;

    const disabledState = remoteFunc
      ? remoteFunc.process('SSRC_TENDER_PLAN_UPDATE_PROCESS_CREATE_DISABLED_STATE', false, {
          bidPlanId,
        })
      : false;

    const rowSelection = {
      selectedRows,
      selectedRowKeys: selectedRows.map((n) => n.bidPlanLineId),
      type: 'checkbox',
      onChange: this.handleSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record.processStatus === 'APPROVED',
      }),
    };
    return (
      <React.Fragment>
        {!isDetail && (
          <div
            className="table-list-search"
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            {remoteFunc
              ? remoteFunc.render('SSRC_TENDER_PLAN_UPDATE_RENDER_SELECT', <></>, {
                  that: this,
                  planUpdateTable,
                  form,
                  bidPlanId,
                  onReload,
                })
              : null}
            <Button onClick={this.handleCreateRow} type="primary" disabled={disabledState}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
            <Button
              onClick={this.handleDeleteRows}
              type="primary"
              disabled={selectedRows.length === 0}
              style={{ marginLeft: '15px' }}
              loading={deleteLoading}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </div>
        )}
        {customizeTable(
          {
            code: 'SSRC.PLAN_UPDATE_DETAIL.TABLE',
          },
          <EditTable
            bordered
            rowKey="bidPlanLineId"
            dataSource={planUpdateTable}
            columns={columns}
            pagination={false}
            rowSelection={rowSelection}
            scroll={{ x: this.scrollWidth(columns, 0) }}
          />
        )}
      </React.Fragment>
    );
  }
}
