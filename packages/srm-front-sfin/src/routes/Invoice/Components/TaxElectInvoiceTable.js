/**
 * 电商税务发票行
 * @date: 2022-03-10
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, sum, isNumber, omit } from 'lodash';
import { Form, Input, Button, DatePicker, Modal, InputNumber } from 'hzero-ui';
import ValueList from 'components/ValueList';
import { connect } from 'dva';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';

import { DATETIME_MIN } from 'utils/constants';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import {
  getDateFormat,
  createPagination,
  addItemToPagination,
  getEditTableData,
  getCurrentOrganizationId,
  delItemsToPagination,
} from 'utils/utils';
import notification from 'utils/notification';
import uuidv4 from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';

import { thousandBitSeparator, thousandBitSeparatorIsNew, precisionNum } from '@/routes/utils';
import styles from './Line.less';
// import { getAttachmentUrlWithToken } from '../../../utils/utils';

const promptCode = 'sfin.invoiceBill';

@formatterCollections({
  code: ['sfin.invoiceInspection'],
})
@connect(({ payableInvoice, loading }) => ({
  payableInvoice,
  loading: loading.effects['payableInvoice/queryTaxInvoiceLine'],
  ocrImportLoading: loading.effects['payableInvoice/ocrImport'],
  deleteLoading: loading.effects['payableInvoice/deleteTaxInvoiceLine'],
  saveTaxLineLoading: loading.effects['payableInvoice/saveTaxLine'],
  headerLoading: loading.effects['payableInvoice/queryDetailHeader'],
}))
@Form.create({ fieldNameProp: null })
export default class TaxTicketTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      listDataSource: [],
      pagination: {},
    };
    this.isSave = this.props.isSave;
  }

  componentDidMount() {
    this.props.onRef(this);
    this.init();
  }

  @Bind()
  init() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, invoiceHeaderId, setUpdate } = this.props;
    dispatch({
      type: 'payableInvoice/queryTaxInvoiceLine',
      payload: {
        invoiceHeaderId,
        page,
      },
    }).then((res) => {
      if (!isEmpty(res)) {
        this.setState(
          {
            listDataSource: [],
            selectedRowKeys: [],
          },
          () => {
            this.setState({
              listDataSource: res.content.map((item) => {
                return {
                  ...item,
                  _status: 'update',
                };
              }),
              pagination: createPagination(res),
            });
            if (this.flag) {
              setUpdate('reset');
            }
            this.flag = true;
          }
        );
      }
    });
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const { ChangeFormItem, amountPrecision, remoteProps, routeSource, remoteCode } = this.props;
    const columnArray = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceCode`).d('发票代码'),
        dataIndex: 'invoiceCode',
        width: 150,
        render: (val, record) =>
          record.validateStatusCode !== 'CHECK_SUCCESS' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`invoiceCode`, {
                rules: [
                  {
                    required: !(
                      ['18', '19'].includes(
                        record?.$form.getFieldValue('noDepositInvoiceTypeCode')
                      ) || ['18', '19'].includes(record?.noDepositInvoiceTypeCode)
                    ),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.invoiceBill.taxInvoiceCode`)
                        .d('发票代码'),
                    }),
                  },
                  // {
                  //   pattern: /^\d{10}$|^\d{12}$/,
                  //   message: intl
                  //     .get(`${promptCode}.model.invoiceBill.NormalTwelveSpecialTen`)
                  //     .d('普票12位数字，专票10位数字'),
                  // },
                ],
                initialValue: record.invoiceCode,
              })(
                <Input
                  disabled={record.validateStatusCode === 'CHECK_SUCCESS'}
                  onChange={(event) => {
                    const valueA = event.target.value;
                    if (valueA.length === 10) record.$form.setFieldsValue({ checkCode: null });
                    record.$form.validateFields(['totalAmount', 'checkCode'], { force: true });
                  }}
                />
              )}
            </ChangeFormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceNumber`).d('发票号码'),
        dataIndex: 'invoiceNumber',
        width: 150,
        render: (val, record) =>
          record.validateStatusCode !== 'CHECK_SUCCESS' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`invoiceNumber`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.invoiceBill.invoiceNumber`).d('发票号码'),
                    }),
                  },
                  // {
                  //   pattern: /^\d{8}$/,
                  //   message: intl
                  //     .get(`${promptCode}.view.message.theLengthCanOnlyBeEightDigits`)
                  //     .d('长度只能为8位数字'),
                  // },
                ],
                initialValue: record.invoiceNumber,
              })(<Input disabled={record.validateStatusCode === 'CHECK_SUCCESS'} />)}
            </ChangeFormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceDateIssued`).d('开票日期'),
        dataIndex: 'billingDate',
        width: 150,
        render: (val, record) =>
          record.validateStatusCode !== 'CHECK_SUCCESS' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`billingDate`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.invoiceBill.taxInvoiceDateIssued`)
                        .d('开票日期'),
                    }),
                  },
                ],
                initialValue: record.billingDate ? moment(record.billingDate) : null,
              })(
                <DatePicker
                  disabled={record.validateStatusCode === 'CHECK_SUCCESS'}
                  placeholder={null}
                  format={getDateFormat()}
                />
              )}
            </ChangeFormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'totalAmount',
        width: 180,
        // render: this.totalAmountType,
        render: (val, record) => {
          return record.validateStatusCode !== 'CHECK_SUCCESS' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`totalAmount`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.invoiceBill.netAmount`).d('不含税金额'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      const currentLength = math.dp(value);

                      if (currentLength > record.amountPrecision) {
                        callback(
                          new Error(intl.get(`sfin.invoiceBill.msgError`).d(`精度校验不通过`))
                        );
                      }
                      if (
                        record.$form.getFieldValue('invoiceDirection') === 'BLUE_INVOICE' &&
                        (value < 0 ||
                          (record.$form.getFieldValue('invoiceDirection') &&
                            record.$form.getFieldValue('invoiceDirection') < 0))
                      ) {
                        callback(
                          new Error(
                            intl
                              .get(`${promptCode}.model.message.blueTotalAmount`)
                              .d('蓝字发票的金额大于等于0')
                          )
                        );
                      } else if (
                        record.$form.getFieldValue('invoiceDirection') === 'RED_INVOICE' &&
                        (value > 0 ||
                          (record.$form.getFieldValue('invoiceDirection') &&
                            record.$form.getFieldValue('invoiceDirection') > 0))
                      ) {
                        callback(
                          new Error(
                            intl
                              .get(`${promptCode}.model.message.redTotalAmount`)
                              .d('红字发票的金额小于等于0')
                          )
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],
                initialValue: record.totalAmount,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  // precision={precisionNum(val, record, 'totalAmount')}
                  precision={
                    record.validateStatusCode !== 'CHECK_SUCCESS'
                      ? amountPrecision
                      : precisionNum(val, record, 'totalAmount')
                  }
                  // precision={amountPrecision}
                  // {...precisionParams(record.totalAmount, true)}
                  allowThousandth
                  onChange={() => {
                    record.$form.validateFields(['totalAmount'], {
                      force: true,
                    });
                  }}
                />
              )}
            </ChangeFormItem>
          ) : (
            thousandBitSeparator(val, amountPrecision)
            // val?.toFixed(record.amountPrecision)
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 180,
        render: (val, record) => {
          return record.validateStatusCode !== 'CHECK_SUCCESS' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`taxAmount`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.invoiceBill.taxAmount`).d('税额'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      const currentLength = math.dp(value);

                      if (currentLength > record.amountPrecision) {
                        callback(
                          new Error(intl.get(`sfin.invoiceBill.msgError`).d(`精度校验不通过`))
                        );
                      } else if (
                        record.$form.getFieldValue('invoiceDirection') === 'BLUE_INVOICE' &&
                        (value < 0 ||
                          (record.$form.getFieldValue('invoiceDirection') &&
                            record.$form.getFieldValue('invoiceDirection') < 0))
                      ) {
                        callback(
                          new Error(
                            intl
                              .get(`${promptCode}.model.message.blueTaxAmount`)
                              .d('蓝字发票的税额大于等于0')
                          )
                        );
                      } else if (
                        record.$form.getFieldValue('invoiceDirection') === 'RED_INVOICE' &&
                        (value > 0 ||
                          (record.$form.getFieldValue('invoiceDirection') &&
                            record.$form.getFieldValue('invoiceDirection') > 0))
                      ) {
                        callback(
                          new Error(
                            intl
                              .get(`${promptCode}.model.message.redTaxAmount`)
                              .d('红字发票的税额小于等于0')
                          )
                        );
                      } else {
                        callback();
                      }
                      // callback();
                    },
                  },
                ],
                initialValue: record.taxAmount,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  // precision={precisionNum(val, record, 'taxAmount')}
                  // precision={amountPrecision}
                  precision={
                    record.validateStatusCode !== 'CHECK_SUCCESS'
                      ? amountPrecision
                      : precisionNum(val, record, 'taxAmount')
                  }
                  allowThousandth
                  // {...precisionParams(record.taxAmount, true)}
                  onChange={() => {
                    record.$form.validateFields(['taxAmount'], {
                      force: true,
                    });
                  }}
                />
              )}
            </ChangeFormItem>
          ) : (
            thousandBitSeparator(val, amountPrecision)
            // val?.toFixed(record.amountPrecision)
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),

        dataIndex: 'taxIncludedAmount',
        width: 150,
        render: (_, record) => {
          const l = math.plus(
            record.$form?.getFieldValue('totalAmount') || record.totalAmount,
            record.$form?.getFieldValue('taxAmount') || record.taxAmount
          );
          return thousandBitSeparatorIsNew(l, amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceType`).d('发票种类'),
        dataIndex: 'noDepositInvoiceTypeCode',
        width: 150,
        render: (val, record) =>
          record.validateStatusCode !== 'CHECK_SUCCESS' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`noDepositInvoiceTypeCode`, {
                initialValue: record.noDepositInvoiceTypeCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.invoiceBill.invoiceType`).d('发票种类'),
                    }),
                  },
                ],
              })(
                <ValueList
                  style={{ width: '100%' }}
                  lovCode="SPUC.INVOICE_TYPE"
                  lazyLoad={false}
                  allowClear
                />
              )}
            </ChangeFormItem>
          ) : (
            <span>{record.noDepositInvoiceTypeMeaning}</span>
          ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceDirection`).d('发票方向'),
        dataIndex: 'invoiceDirection',
        width: 150,
        render: (val, record) =>
          record.validateStatusCode !== 'CHECK_SUCCESS' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`invoiceDirection`, {
                initialValue: record.invoiceDirection,
              })(
                <ValueList
                  style={{ width: '100%' }}
                  lovCode="SPUC.INVOICE_DIRECTION"
                  lazyLoad={false}
                  allowClear
                  onChange={(value) => {
                    record.$form.validateFields(['taxAmount'], { force: true });
                    record.$form.validateFields(['totalAmount'], { force: true });
                    if (
                      value === 'BLUE_INVOICE' &&
                      (record.$form.getFieldValue('totalAmount') < 0 ||
                        record.$form.getFieldValue('taxAmount') < 0)
                    ) {
                      record.$form.setFieldsValue({ totalAmount: null, taxAmount: null });
                    } else if (
                      value === 'RED_INVOICE' &&
                      (record.$form.getFieldValue('totalAmount') > 0 ||
                        record.$form.getFieldValue('taxAmount') > 0)
                    ) {
                      record.$form.setFieldsValue({ totalAmount: null, taxAmount: null });
                    }
                  }}
                />
              )}
            </ChangeFormItem>
          ) : (
            <span>{record.invoiceDirectionMeaning}</span>
          ),
      },
      {
        title: intl
          .get(`${promptCode}.model.invoiceBill.checkCodeWarning`)
          .d('校验码 (多位时请输入后6位即可)'),
        dataIndex: 'checkCode',
        width: 250,
        render: (val, record) =>
          record.validateStatusCode !== 'CHECK_SUCCESS' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`checkCode`, {
                rules: [
                  {
                    pattern: /^[a-zA-Z\d]+$/,
                    message: intl
                      .get(`sfin.invoiceBill.verify.CanOnlyDigitsOrLetter`)
                      .d('只能输入字母或者数字'),
                  },
                ],
                initialValue: record.checkCode,
              })(<Input disabled={record.validateStatusCode === 'CHECK_SUCCESS'} />)}
            </ChangeFormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoicePrintStatus`).d('发票打印状态'),
        dataIndex: 'invoicePrintStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.listPrintStatus`).d('销货清单打印状态'),
        dataIndex: 'listPrintStatusMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.checkState`).d('查验状态'),
        dataIndex: 'validateStatusCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.checkStateExplain`).d('查验状态说明'),
        dataIndex: 'validateMessage',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceStatus`).d('发票状态'),
        width: 100,
        dataIndex: 'taxInvoiceStatusCodeMeaning',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.xmlSourceFileUrl`).d('数电票XML文件下载'),
        dataIndex: 'xmlSourceFileUrl',
        width: 100,
        // eslint-disable-next-line no-unused-vars
        render: (value, record) => {
          return value ? (
            <a href={value} target="_blank" rel="noopener noreferrer">
              {intl.get('hzero.common.button.download').d('下载')}
            </a>
          ) : null;
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.ofdFileUrl`).d('ofd文件下载'),
        dataIndex: 'ofdFileUrl',
        width: 100,
        // eslint-disable-next-line no-unused-vars
        render: (value, record) =>
          value ? (
            <a href={value} target="_blank" rel="noopener noreferrer">
              {intl.get('hzero.common.button.download').d('下载')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.downloadInvoice`).d('发票下载'),
        dataIndex: 'downloadInvoice',
        width: 100,
        // eslint-disable-next-line no-unused-vars
        render: (value, record) =>
          record.layoutFileUrl ? (
            <a href={record.layoutFileUrl}>
              {intl.get(`${promptCode}.model.invoiceBill.downloadInvoice`).d('发票下载')}
            </a>
          ) : null,
      },
    ];
    return remoteProps?.process && remoteCode
      ? remoteProps.process(remoteCode, columnArray, { routeSource })
      : columnArray;
  }

  /**
   * 选中行回调
   * @param {Array} selectedRowKeys
   */
  @Bind()
  handleChangeSelectRowKeys(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 添加行
   */
  @Bind()
  handleAdd() {
    const { listDataSource = [], pagination = {} } = this.state;
    const { invoiceHeaderId } = this.props;
    this.setState({
      listDataSource: [
        { _status: 'create', taxInvoiceLineId: uuidv4(), invoiceHeaderId },
        ...listDataSource,
      ],
      pagination: addItemToPagination(listDataSource.length, pagination),
    });
  }

  @Bind()
  @Throttle(1000)
  handleSave() {
    const { dispatch, invoiceHeaderId } = this.props;
    const { listDataSource } = this.state;
    // 过滤出新增数据
    const list = getEditTableData(listDataSource, ['_status', 'taxInvoiceLineId']).filter(
      (v) => v.validateStatusCode !== 'CHECK_SUCCESS'
    );
    const errsArray = [];
    listDataSource.forEach((item) => {
      const { $form } = item;
      $form.validateFieldsAndScroll((errs) => {
        if (errs) {
          errsArray.push(errs);
        }
      });
    });
    // 过滤出未修改的数据避免金额丢失
    const arr = listDataSource.filter((v) => v.validateStatusCode === 'CHECK_SUCCESS');
    const totalList = [...list, ...arr];
    if (totalList.length === 0 || errsArray.length > 0) return;
    dispatch({
      type: 'payableInvoice/saveTaxLine',
      payload: {
        list: totalList.map((item) => {
          if (item._status === 'create' || item.validateStatusCode !== 'CHECK_SUCCESS') {
            if (item._status === 'create') {
              // eslint-disable-next-line
              delete item._token;
            }
            // eslint-disable-next-line
            delete item._status;
            // eslint-disable-next-line
            item.billingDate = item.billingDate ? item.billingDate.format(DATETIME_MIN) : undefined;
            return {
              ...item,
              invoiceTypeCode: item.noDepositInvoiceTypeCode,
              tenantId: getCurrentOrganizationId(),
            };
          } else {
            // eslint-disable-next-line
            delete item.$form;
            return {
              ...item,
              invoiceTypeCode: item.noDepositInvoiceTypeCode,
              tenantId: getCurrentOrganizationId(),
            };
          }
        }),
        invoiceHeaderId,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        const { fetchHeader } = this.props;
        this.setState({
          listDataSource: res.map((item) => ({
            ...item,
            _status: 'update',
          })),
        });
        this.handleSearch();
        fetchHeader(true);
      }
    });
  }

  /**
   * 删除行
   */
  @Bind()
  @Throttle(1000)
  handleDelete() {
    const { dispatch, setUpdate, fetchHeader } = this.props;
    const { listDataSource, selectedRowKeys, pagination } = this.state;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`${promptCode}.model.invoiceBill.deleteFlag`).d('是否删除'),
      onOk: () => {
        listDataSource.forEach((item) => {
          if (!selectedRowKeys.includes(item.taxInvoiceLineId)) {
            newDataSource.push(item);
          } else if (item._status === 'update') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: 'payableInvoice/deleteTaxInvoiceLine',
            payload: deleteList,
          }).then((res) => {
            if (res) {
              this.setState(
                {
                  listDataSource: [],
                  selectedRowKeys: [],
                },
                () => {
                  this.setState({
                    listDataSource: newDataSource,
                  });
                }
              );
              notification.success();
              this.handleSearch();
              fetchHeader(true);
            }
          });
        } else {
          this.setState({
            listDataSource: newDataSource,
            selectedRowKeys: [],
            pagination: delItemsToPagination(
              selectedRowKeys.length,
              listDataSource.length,
              pagination
            ),
          });
          setUpdate('deleteLine', selectedRowKeys);
        }
      },
    });
  }

  render() {
    const {
      loading = true,
      saveLoading = false,
      deleteLoading = false,
      headerLoading,
      saveTaxLineLoading,
      headerInfo = {},
      remoteBtnCode,
      remoteProps,
      fetchHeader,
    } = this.props;
    const { selectedRowKeys = [], listDataSource, pagination = {} } = this.state;
    const { invoiceStatus } = headerInfo;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleChangeSelectRowKeys,
    };
    const columns = this.getColumns();
    const editTableProps = {
      columns,
      bordered: true,
      rowKey: 'taxInvoiceLineId',
      rowSelection,
      onChange: (page) => {
        this.pageSize = this.state.pagination.pageSize;
        this.isSave(
          () => this.handleSearch(page),
          () => {
            this.setState({
              pagination: {
                ...pagination,
                pageSize: this.pageSize,
              },
            });
          }
        )();
      },
      dataSource: listDataSource,
      loading: loading || saveLoading,
      pagination,
      scroll: { x: sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 250 },
    };
    // 有直连开票标识permitDirectInvoiceFlag=1,开票不成功什么按钮都不显示
    // 开票成功就显示查看发票按钮
    // 没有直连开票标识,开票不成功就显示EXCEL导入,OCR识别,删除等按钮
    return (
      <div className={styles['purchase-application']}>
        <Form layout="inline">
          {
            //  电商开票异常
            invoiceStatus === 'EC_INVOICE_EXCEPTION' && [
              <Button type="primary" onClick={this.handleAdd}>
                {intl.get(`hzero.common.button.create`).d('新建')}
              </Button>,
              <Button
                icon="save"
                loading={headerLoading || saveTaxLineLoading}
                onClick={this.handleSave}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>,
              <Button
                disabled={isEmpty(selectedRowKeys)}
                onClick={this.isSave(this.handleDelete)}
                loading={deleteLoading}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>,
            ]
          }
          {remoteBtnCode && remoteProps?.process
            ? remoteProps.process(remoteBtnCode, [], {
                handleSearchLine: this.handleSearch,
                fetchHeader,
                headerInfo,
                listDataSource,
                selectedRowKeys,
              })
            : ''}
        </Form>
        <EditTable {...editTableProps} />
      </div>
    );
  }
}
