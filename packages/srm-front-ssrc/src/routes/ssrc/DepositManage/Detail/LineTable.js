/**
 * LineTable - 保证金列表展示组件
 * @date: 2020-04-01
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Select, Button, Modal, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isEmpty, filter } from 'lodash';
import uuidv4 from 'uuid/v4';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { tableScrollWidth, getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import notification from 'utils/notification';
import Upload from 'srm-front-boot/lib/components/Upload';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

const promptCode = 'ssrc.depositManage';
const organizationId = getCurrentOrganizationId();
const userId = getCurrentUserId();

/**
 * LineTable - 展示组件 - 询价单头信息
 * @extends {Component} - React.Component
 * @reactProps {!Object} [dataSource=[]] - 数据源
 * @reactProps {!Object} [loading=false] - table数据加载中标识
 * @reactProps {!Object} [pagination={}] - 分页对象
 * @reactProps {Function} [onChange=e => e] - 改变分页函数
 * @reactProps {Function} [onSave=e => e] - 保存保证金函数
 * @return React.element
 */

@withCustomize({
  unitCode: [
    'SSRC.EXPENSE_MANAGEMENT.LINETABLE_MARGIN_DETAILS', // 保证金
    'SSRC.EXPENSE_MANAGEMENT.LINETABLE_BIDDING_DOCUMENTS', // 招标文件费详情
  ],
})
export default class LineTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.key, this);
    }
    this.state = {};
  }

  /**
   * 保存保证金变更
   * @param {Object} record - 操作行
   */
  @Bind()
  handleSave() {
    const { onSave, expensesType, dataIndex, dataSource, selectedRows } = this.props;
    const data = selectedRows?.length ? selectedRows : dataSource;
    onSave(data, expensesType, dataIndex);
  }

  /**
   * 新建行
   */
  @Bind()
  createRow() {
    const { dispatch, dataIndex, dataSource, header } = this.props;
    dispatch({
      type: 'depositManage/updateState',
      payload: {
        [`${dataIndex}Data`]: [
          {
            expensesRelDocId: uuidv4(),
            expenseStatus: 'NO_PAY',
            sourceId: header.sourceId,
            sourceNum: header.sourceNum,
            expectAmount: header[dataIndex],
            expensesType: dataIndex === 'bidBond' ? 'DEPOSIT' : 'TENDER_FEE',
            _status: 'create', // 新建标记位
          },
          ...(dataSource || []),
        ],
      },
    });
  }

  /**
   * 删除
   */
  @Bind
  handleDelete() {
    const {
      dispatch,
      selectedRows = [],
      dataSource = [],
      dataIndex,
      updateSelectedRows,
    } = this.props;
    // 过滤出勾选数据的剩下数据
    const newData = filter(dataSource, (item) => {
      return selectedRows?.map((r) => r.expensesRelDocId).indexOf(item.expensesRelDocId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        selectedRows.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          } else {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          dispatch({
            type: 'depositManage/updateState',
            payload: {
              [`${dataIndex}Data`]: newData,
            },
          });
          updateSelectedRows(dataIndex);
        } else {
          dispatch({
            type: 'depositManage/deleteDeposit',
            payload: remoteDelete,
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: 'depositManage/updateState',
                payload: {
                  [`${dataIndex}Data`]: newData,
                },
              });
              updateSelectedRows(dataIndex);
            }
          });
        }
      },
    });
  }

  /**
   * 切换状态
   * @param {Object} row - 行记录
   */
  @Bind()
  handleChangeStatus(value, row = {}) {
    const { processRemote } = this.props;
    const { setFieldsValue } = row.$form;
    if (value === 'NO_PAY') {
      const eventProps = {
        setFieldsValue,
      };
      if (processRemote?.event) {
        processRemote.event.fireEvent('handleChangeStatusEvent', eventProps);
      } else {
        setFieldsValue({
          expensesAmount: null,
          paymentName: '',
          paymentAccount: '',
          paymentBank: '',
        });
      }
    }
  }

  /**
   * 改变供应商编码-获取供应商名称
   */
  @Bind()
  changeSupplierCompanyNum(value, dataList, record) {
    const { supplierCompanyName, supplierCompanyCode, supplierTenantId } = dataList;
    record.$form.setFieldsValue({
      supplierCompanyName,
      supplierTenantId,
      supplierCompanyNum: supplierCompanyCode,
    });
  }

  @Bind()
  getAmountDisabled(record) {
    const { processRemote } = this.props;
    const { getFieldValue } = record.$form;
    const disabled = !getFieldValue('expenseStatus') || getFieldValue('expenseStatus') === 'NO_PAY'; // 当状态为未收取时只读
    const otherProps = {};
    return processRemote
      ? processRemote.process(
          'SSRC_DEPOSITMANAGE_DETAIL_PROCESS_AMOUNT_DISABLED',
          disabled,
          otherProps
        )
      : disabled;
  }

  @Bind()
  remoteOptionDis(record, value) {
    const { processRemote, dataIndex, header } = this.props;
    const otherProps = {
      record,
      dataIndex,
      header,
      value,
    };
    return processRemote
      ? processRemote.process(
          'SSRC_DEPOSITMANAGE_DETAIL_PROCESS_EXPENSE_OPTIONS',
          false,
          otherProps
        )
      : false;
  }

  // 批量编辑按钮禁用逻辑
  @Bind()
  getBatchMaintainBtnProps() {
    const { processRemote, dataIndex } = this.props;
    return processRemote
      ? processRemote.process(
          'SSRC_DEPOSITMANAGE_DETAIL_PROCESS_BATCH_MAINTAIN_BUTTON_PROPS',
          {},
          {
            dataIndex,
          }
        )
      : {};
  }

  // BUTTONS
  renderTableButtons = () => {
    const {
      expensesType,
      processRemote,
      header = {},
      dataSource = [],
      selectedRows = [],
      rowSelection,
      dataIndex,
      saveLoading,
      serviceChargeFlag = false,
      onBatchMaintain,
      handleUpdateSelectedRows,
      pagination,
      onChange = () => {},
      setTableBtnLoading = () => {},
      getTableBtnLoading = () => {},
      dispatch,
    } = this.props;
    const flag = header.sourceMethod === 'OPEN' || header.sourceMethod === 'ALL_OPEN';

    /**
     * 按钮loading； bidBondLoading-初版在二开设置，若标准需要也可以用此loading名称
     * @protected
     */
    const btnLoading =
      saveLoading || isFunction(getTableBtnLoading) ? getTableBtnLoading('bidBondLoading') : false;

    const currentButtons = [
      <Button type="primary" style={{ marginRight: 8 }} onClick={this.createRow} disabled={!flag}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button style={{ marginRight: 8 }} onClick={this.handleSave} loading={btnLoading}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      <Button
        style={{ marginRight: 8 }}
        disabled={isEmpty(selectedRows) || !flag}
        onClick={this.handleDelete}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>,
      !serviceChargeFlag && (
        <Tooltip
          title={
            isEmpty(selectedRows)
              ? intl.get('ssrc.depositManage.view.button.batchMaintenanceAll').d('批量编辑全部数据')
              : null
          }
        >
          <Button
            onClick={() => onBatchMaintain(dataIndex, expensesType)}
            disabled={isEmpty(dataSource)}
            {...(this.getBatchMaintainBtnProps() || {})}
          >
            {isEmpty(selectedRows)
              ? intl.get('ssrc.depositManage.view.button.batchMaintenance').d('批量维护')
              : intl
                  .get('ssrc.depositManage.view.button.choose.batchMaintenance')
                  .d('勾选批量维护')}
          </Button>
        </Tooltip>
      ),
    ];

    const otherProps = {
      header,
      expensesType,
      handleUpdateSelectedRows,
      rowSelection,
      selectedRows,
      dataIndex,
      pagination,
      saveLoading,
      handleQuerySupplierList: onChange,
      setTableBtnLoading,
      getTableBtnLoading,
      dispatch,
    };

    const buttons = processRemote
      ? processRemote.process(
          'SSRC_DEPOSITMANAGE_DETAIL_LINETABLES_BUTTONS',
          currentButtons,
          otherProps
        )
      : currentButtons;
    return buttons.filter(Boolean);
  };

  render() {
    const {
      expensesType,
      title,
      onChange,
      header = {},
      loading = false,
      pagination = {},
      dataSource = [],
      expensesStatus = [],
      rowSelection,
      customizeTable = () => {},
      dataIndex,
      serviceChargeFlag = false,
      processRemote,
      cuxLovOptions = {},
    } = this.props;
    const flag = header.sourceMethod === 'OPEN' || header.sourceMethod === 'ALL_OPEN';
    const serviceChargeColumns =
      (serviceChargeFlag &&
        [
          {
            title:
              dataIndex === 'bidFileExpense'
                ? intl.get(`${promptCode}.model.depositManage.bidFileExpensesNum`).d('标书费编号')
                : intl
                    .get(`${promptCode}.model.depositManage.bidBondexpensesNum`)
                    .d('保证金缴纳服务费单号'),
            dataIndex: 'expensesNum',
            width: 150,
          },
          {
            title:
              dataIndex === 'bidFileExpense'
                ? intl
                    .get(`${promptCode}.model.depositManage.bidFileReturnedAmount`)
                    .d('标书费已退回金额')
                : intl
                    .get(`${promptCode}.model.depositManage.bidBondReturnedAmount`)
                    .d('保证金已退回金额'),
            dataIndex: 'returnedAmount',
            width: 150,
            render: numberSeparatorRender,
          },
          {
            title:
              dataIndex === 'bidFileExpense'
                ? intl
                    .get(`${promptCode}.model.depositManage.bidFilePayRuleMeaning`)
                    .d('标书费支付规则')
                : intl
                    .get(`${promptCode}.model.depositManage.bidBondPayRuleMeaning`)
                    .d('保证金支付规则'),
            dataIndex: 'payRuleMeaning',
            width: 150,
          },
          dataIndex === 'bidFileExpense' && {
            title: intl
              .get(`${promptCode}.model.depositManage.invoiceRuleMeaning`)
              .d('标书费开票规则'),
            dataIndex: 'invoiceRuleMeaning',
            width: 150,
          },
          dataIndex === 'bidFileExpense' && {
            title: intl
              .get(`${promptCode}.model.depositManage.bidFileDownloadNodeMeaning`)
              .d('标书费下载节点'),
            dataIndex: 'bidFileDownloadNodeMeaning',
            width: 150,
          },
          {
            title:
              dataIndex === 'bidFileExpense'
                ? intl
                    .get('ssrc.inquiryHall.model.inquiryHall.paymentTypeOfTender')
                    .d('招标文件费缴纳类型')
                : intl
                    .get('ssrc.inquiryHall.model.inquiryHall.marginPaymentType')
                    .d('保证金缴纳类型'),
            dataIndex: 'paymentRuleMeaning',
            width: 150,
          },
          dataIndex === 'bidBond' && {
            title: intl
              .get(`${promptCode}.model.depositManage.depositConvertRuleMeaning`)
              .d('保证金转保证金维度规则'),
            dataIndex: 'depositConvertRuleMeaning',
            width: 150,
          },
          {
            title:
              dataIndex === 'bidFileExpense'
                ? intl
                    .get(`${promptCode}.model.depositManage.bidFileReturnRuleMeaning`)
                    .d('标书费退回类型')
                : intl
                    .get(`${promptCode}.model.depositManage.bidBondReturnRuleMeaning`)
                    .d('保证金退回类型'),
            dataIndex: 'returnRuleMeaning',
            width: 150,
          },
          {
            title: intl
              .get(`${promptCode}.model.depositManage.syncExpenseStatusMeaning`)
              .d('同步费用工作台状态'),
            dataIndex: 'syncExpenseStatusMeaning',
            width: 150,
          },
          {
            title: intl
              .get(`${promptCode}.model.depositManage.syncExpenseResponseMsg`)
              .d('同步费用工作台反馈'),
            dataIndex: 'syncExpenseResponseMsg',
            width: 150,
          },
          {
            title: intl.get(`${promptCode}.model.depositManage.paymentStatusMeaning`).d('支付状态'),
            dataIndex: 'paymentStatusMeaning',
            width: 150,
          },
          dataIndex === 'bidFileExpense' && {
            title: intl.get(`${promptCode}.model.depositManage.invoiceStatusMeaning`).d('开票状态'),
            dataIndex: 'invoiceStatusMeaning',
            width: 150,
          },
        ].filter(Boolean)) ||
      [];
    const currentColumns = [
      {
        title: intl.get(`${promptCode}.model.depositManage.supplierCompanyNum`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 150,
        render: (val, record) =>
          ['create'].includes(record._status) && flag ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('supplierCompanyId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
                      }),
                    },
                  ],
                  initialValue: record.supplierCompanyId,
                })(
                  <Lov
                    code="SSRC.SUPPLIER"
                    onChange={(value, dataList) =>
                      this.changeSupplierCompanyNum(value, dataList, record)
                    }
                    queryParams={{ organizationId, userId, companyId: header.companyId }}
                    textValue={record.supplierCompanyNum}
                  />
                )}
              </Form.Item>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('supplierTenantId', {
                  initialValue: record.supplierTenantId,
                })(<div />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            record.supplierNum || val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.supplierCompanyName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        // width: 200,
        render: (val, record) =>
          ['create'].includes(record._status) && flag ? (
            <Form.Item>
              {record.$form.getFieldDecorator('supplierCompanyName', {
                initialValue: val,
              })(<Input disabled />)}
            </Form.Item>
          ) : (
            record?.supplierName || val
          ),
      },
      {
        title,
        dataIndex: 'expectAmount',
        align: 'right',
        width: 150,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.expensesAmount`).d('实收金额'),
        dataIndex: 'expensesAmount',
        align: 'right',
        width: 120,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            const disabled = this.getAmountDisabled(record);
            return (
              <Form.Item>
                {getFieldDecorator('expensesAmount', {
                  initialValue: val,
                  rules: [
                    {
                      required: !disabled,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.depositManage.expensesAmount`)
                          .d('实收金额'),
                      }),
                    },
                  ],
                })(
                  <PrecisionInputNumber
                    type="hzero"
                    financial={header.currencyCode}
                    disabled={disabled}
                    min={0}
                    max="99999999999999999999"
                    style={{ width: '100%' }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.paymentName`).d('付款人户名'),
        dataIndex: 'paymentName',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            const disabled =
              !getFieldValue('expenseStatus') || getFieldValue('expenseStatus') === 'NO_PAY'; // 当状态为未收取时只读
            return (
              <Form.Item>
                {getFieldDecorator('paymentName', {
                  initialValue: val,
                })(<Input disabled={disabled} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.paymentAccount`).d('支付账号'),
        dataIndex: 'paymentAccount',
        width: 150,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            const disabled =
              !getFieldValue('expenseStatus') || getFieldValue('expenseStatus') === 'NO_PAY'; // 当状态为未收取时只读
            return (
              <Form.Item>
                {getFieldDecorator('paymentAccount', {
                  initialValue: val,
                })(<Input disabled={disabled} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.depositManage.paymentBank`).d('支付银行'),
        dataIndex: 'paymentBank',
        width: 200,
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator, getFieldValue } = record.$form;
            const disabled =
              !getFieldValue('expenseStatus') || getFieldValue('expenseStatus') === 'NO_PAY'; // 当状态为未收取时只读
            return (
              <Form.Item>
                {getFieldDecorator('paymentBank', {
                  initialValue: val,
                })(<Input disabled={disabled} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      !serviceChargeFlag && {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'expenseStatus',
        width: 150,
        render: (_, record) => {
          if (['create', 'update'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('expenseStatus', {
                  initialValue: record.expenseStatus || 'NO_PAY',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hzero.common.status').d('状态'),
                      }),
                    },
                  ],
                })(
                  <Select
                    style={{ width: '100%' }}
                    allowClear
                    onChange={(value) => this.handleChangeStatus(value, record)}
                  >
                    {expensesStatus.map((item) => (
                      <Select.Option
                        value={item.value}
                        key={item.value}
                        disabled={this.remoteOptionDis(record, item.value)}
                      >
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            );
          } else {
            return (
              record.expenseStatusMeaning ||
              intl.get(`ssrc.depositManage.model.depositManage.unpaid`).d('未缴纳')
            );
          }
        },
      },
      {
        title: intl.get(`ssrc.depositManage.model.depositManage.attachmentUuid`).d('行附件'),
        dataIndex: 'attachmentUuid',
        width: 130,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('attachmentUuid', {
                initialValue: val,
              })(
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-depositManage"
                  attachmentUUID={val}
                  tenantId={organizationId}
                  fileSize={FIlESIZE}
                  {...ChunkUploadProps}
                />
              )}
            </Form.Item>
          ) : (
            <Upload
              filePreview
              viewOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-rfxitem"
              attachmentUUID={val}
              tenantId={organizationId}
            />
          ),
      },
      ...serviceChargeColumns,
    ].filter(Boolean);

    // 获取远程配置
    const columns = processRemote
      ? processRemote.process('SSRC_DEPOSITMANAGE_DETAIL_PROCESS_TABLE_COLUMNS', currentColumns, {
          header,
          tableType: dataIndex,
          cuxLovOptions,
        })
      : currentColumns;

    const scrollX = tableScrollWidth(columns);
    return (
      <React.Fragment>
        <div style={{ marginBottom: '8px' }}>{this.renderTableButtons()}</div>
        {customizeTable(
          {
            code:
              dataIndex === 'bidBond'
                ? 'SSRC.EXPENSE_MANAGEMENT.LINETABLE_MARGIN_DETAILS' // 保证金
                : 'SSRC.EXPENSE_MANAGEMENT.LINETABLE_BIDDING_DOCUMENTS', // 招标文件费详情
          },
          <EditTable
            bordered
            loading={loading}
            rowKey="expensesRelDocId"
            dataSource={dataSource}
            columns={columns}
            pagination={pagination}
            rowSelection={rowSelection}
            onChange={(page) => onChange(page, expensesType)}
            scroll={{ x: scrollX }}
          />
        )}
      </React.Fragment>
    );
  }
}
