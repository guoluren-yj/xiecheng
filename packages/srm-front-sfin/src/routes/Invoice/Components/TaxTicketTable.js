/**
 * TaxTicketTable.js - 税务发票行表格
 * @date: 2019-07-31
 * @author: yangou <ou.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Bind, Throttle } from 'lodash-decorators';
import { omit, isEmpty, sum, isNumber, isFunction, isNil, isArray } from 'lodash';
import { Form, Input, Button, DatePicker, Modal, Spin, InputNumber, Popover, Icon } from 'hzero-ui';
import ValueList from 'components/ValueList';
import { connect } from 'dva';
import { withRouter, routerRedux } from 'dva/router';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';
import Viewer from 'react-viewer';

import { DATETIME_MIN } from 'utils/constants';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import {
  getDateFormat,
  createPagination,
  addItemToPagination,
  getEditTableData,
  getCurrentOrganizationId,
  getAttachmentUrl,
} from 'utils/utils';
import notification from 'utils/notification';
import uuidv4 from 'uuid/v4';
import { stringify } from 'querystring';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';

import { thousandBitSeparator, thousandBitSeparatorIsNew, precisionNum } from '@/routes/utils';
import {
  getResponse,
  getEditTableAllData,
  previewPdf,
  getAttachmentUrlWithToken,
} from '@/utils/utils';
import { getOcrConfig } from '@/services/invoiceService';
import filePdf from '@/assets/file_pdf.svg';
import Icons from '../../components/Icons';
import styles from './Line.less';
import OcrUpload from '../../components/OcrUpload';
import { viewInvoiceDetail } from '../../utils';

const promptCode = 'sfin.invoiceBill';
const buttonTxt = 'sfin.invoiceInspection.button';

@formatterCollections({
  code: ['sfin.invoiceInspection', 'sfin.common'],
})
@connect(({ invoice, loading }) => ({
  invoice,
  loading:
    loading.effects['invoice/queryTaxInvoiceLine'] ||
    loading.effects['invoice/ocrImport'] ||
    loading.effects['invoice/ofdImport'] ||
    loading.effects['invoice/checkARinvoice'] ||
    loading.effects['invoice/deleteTaxInvoiceLine'] ||
    loading.effects['invoice/saveTaxLine'] ||
    loading.effects['invoice/queryDetailHeader'],
  settingLoading: loading.effects['invoice/querySetting'],
}))
@withRouter
@Form.create({ fieldNameProp: null })
export default class TaxTicketTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      listDataSource: [],
      pagination: {},
      ocrLoading: false,
      sizeConfig: {},
      // amountPrecision
      // settingTicketFlag: false,
      viewVisible: false, // ocr文件查看-图片
      ocrFileUrl: '',
      ofdModalVisible: false,
    };
    this.isSave = this.props.isSave;
  }

  componentDidMount() {
    const { remoteProps } = this.props;
    const { event } = remoteProps || {};
    this.props.onRef(this);
    this.init();
    this.getOcrSizeConfig();
    // 爱婴室二开埋点 pur-17646
    // 获取二开配置信息
    if (event) event.fireEvent('onDidMountCux', { taxTicketTable: this });
  }

  @Bind()
  async getOcrSizeConfig() {
    const res = getResponse(await getOcrConfig());
    if (res) {
      const { fileTypeList, ocrFileSize, ocrTransSize } = res;
      this.setState({
        sizeConfig: {
          ocrFileSize,
          ocrTransSize,
          fileType:
            isNil(fileTypeList) || !isArray(fileTypeList)
              ? undefined
              : Array.from(new Set(fileTypeList)).join('/'),
        },
      });
    }
  }

  @Bind()
  init() {
    this.handleSearch();
    this.querySetting();
  }

  @Bind()
  querySetting() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/querySetting',
    }).then((n) => {
      if (n) {
        // 采购方发票查验配置
        const field010514 = parseInt(n['010514'], 10);
        // 销售方发票查验配置
        const field010515 = parseInt(n['010515'], 10);
        this.setState({
          purchaseSetting: field010514 === 1,
          supplySetting: field010515 === 1,
        });
      }
      // if (n && parseInt(n['010514'], 10) === 1) {
      //   this.setState({
      //     settingTicketFlag: true,
      //   });
      // }
    });
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, invoiceHeaderId, setUpdate, hcuzCode } = this.props;
    dispatch({
      type: 'invoice/queryTaxInvoiceLine',
      payload: {
        invoiceHeaderId,
        page,
        customizeUnitCode: hcuzCode,
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
            this.checkAR(true);
            if (this.flag) {
              setUpdate('reset');
            }
            this.flag = true;
          }
        );
      }
    });
  }

  // 校验作用域和自动授权域
  // @Bind()
  // validateSelect(rule, value, callback) {
  //   const { setting } = this.props;
  //   // // eslint-disable-next-line radix
  //   // const lengths = parseInt(value);
  //   // // eslint-disable-next-line prefer-destructuring
  //   // const length = lengths.toString().length;
  //   if (setting === '0') {
  //     rule;
  //     callback(intl.get('hzero.client.view.validate.maxLength').d('整数位最多十位'));
  //     return;
  //   }
  //   // if (length > 10) {
  //   //   callback(intl.get('hzero.client.view.validate.maxLength').d('整数位最多十位'));
  //   //   return;
  //   // }
  //   callback();
  // }

  @Bind()
  modal(ocrFileUrl) {
    if (ocrFileUrl) {
      const content = (
        <div>
          <span className="check-ocr" onClick={() => this.showModal(ocrFileUrl)}>
            <img src={filePdf} alt="" className="svg-img" />
            {intl.get(`sfin.invoiceBill.view.message.orcFile`).d('查看OCR识附件')}
          </span>
        </div>
      );
      return (
        <Popover
          content={content}
          title={intl.get(`sfin.invoiceBill.view.title.ocrDistinguish`).d('OCR识别')}
          trigger="hover"
          placement="bottomLeft"
        >
          <a className="ocr-btn">
            <Icon type="find_in_page" />
            {intl.get(`sfin.invoiceBill.view.message.checkOCRFile`).d('OCR识别附件')}
          </a>
        </Popover>
      );
    } else {
      return '';
    }
  }

  // 显示Madal
  showModal = (ocrFileUrl) => {
    const { tenantId } = this.state;
    const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
    const bucketDirectory = 'finance-invoice';
    const fA = ocrFileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(ocrFileUrl);
    else if (fileExt.toLowerCase() === 'ofd') return getAttachmentUrlWithToken(ocrFileUrl);
    this.setState({
      ocrFileUrl: getAttachmentUrl(ocrFileUrl, bucketName, tenantId, bucketDirectory),
      viewVisible: true,
    });
  };

  // 关闭Modal
  hideModal = () => {
    this.setState({
      viewVisible: false,
    });
  };

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    const {
      ChangeFormItem,
      headerForm: { headerInfo = {} },
      typeCode,
      remoteProps,
      remoteProcessCode,
    } = this.props;
    const { issueStatusCode } = headerInfo;
    // const { settingTicketFlag } = this.state;
    const columnArray = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceType`).d('发票种类'),
        dataIndex: 'noDepositInvoiceTypeCode',
        width: 150,
        render: (val, record) =>
          issueStatusCode !== 'SUCCESS' ? (
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
                  onChange={() => {
                    const { _status, $form } = record || {};
                    if (_status === 'create') {
                      // 新建重置，带出默认值
                      $form.resetFields(['invoiceNumber', 'invoiceCode']);
                    } else if (_status === 'update') {
                      // 修改时清空两个字段
                      $form.setFieldsValue({ invoiceNumber: null, invoiceCode: null });
                    }
                  }}
                />
              )}
            </ChangeFormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceCode`).d('发票代码'),
        dataIndex: 'invoiceCode',
        width: 150,
        render: (val, record) =>
          issueStatusCode !== 'SUCCESS' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`invoiceCode`, {
                initialValue: record.invoiceCode,
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
                  {
                    validator: (i, value, callback) => {
                      if (remoteProps && remoteProcessCode) {
                        // 爱婴室二开埋点 pur-17646
                        const res = remoteProps.process(remoteProcessCode, true, {
                          validateFieldCode: 'invoiceCode',
                          validateValue: value,
                          noDepositInvoiceTypeCode: record?.$form.getFieldValue(
                            'noDepositInvoiceTypeCode' || record?.noDepositInvoiceTypeCode
                          ),
                          taxTicketTable: this,
                          callback,
                        });
                        if (res) {
                          callback();
                        }
                      } else {
                        callback();
                      }
                    },
                  },
                  // {
                  //   pattern: /^\d{10}$|^\d{12}$/,
                  //   message: intl
                  //     .get(`${promptCode}.model.invoiceBill.NormalTwelveSpecialTen`)
                  //     .d('普票12位数字，专票10位数字'),
                  // },
                ],
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
          issueStatusCode !== 'SUCCESS' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator(`invoiceNumber`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.invoiceBill.invoiceNumber`).d('发票号码'),
                    }),
                  },
                  {
                    validator: (i, value, callback) => {
                      if (remoteProps && remoteProcessCode) {
                        // 爱婴室二开埋点 pur-17646
                        const res = remoteProps.process(remoteProcessCode, true, {
                          validateFieldCode: 'invoiceNumber',
                          validateValue: value,
                          noDepositInvoiceTypeCode: record?.$form.getFieldValue(
                            'noDepositInvoiceTypeCode' || record?.noDepositInvoiceTypeCode
                          ),
                          taxTicketTable: this,
                          callback,
                        });
                        if (res) {
                          callback();
                        }
                      } else {
                        callback();
                      }
                    },
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
          issueStatusCode !== 'SUCCESS' ? (
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
          const { amountPrecision } = this.props;
          return issueStatusCode !== 'SUCCESS' ? (
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
                  // settings === '0'
                  //   ? {
                  //       pattern: /(^[1-9](\d+)?(\.\d{2,2})?$)/,
                  //       message: intl
                  //         .get(`${promptCode}.model.decimals`)
                  //         .d('金额需大于零或为两位小数'),
                  //     }
                  //   : {
                  //       type: 'number',
                  //       message: intl
                  //         .get(`${promptCode}.model.decimals`)
                  //         .d('金额需大于零或为两位小数'),
                  //     },
                ],
                initialValue: record.totalAmount,
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  // precision={precisionNum(val, record, 'totalAmount')}
                  precision={
                    record._status === 'create'
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
          const { amountPrecision } = this.props;
          return issueStatusCode !== 'SUCCESS' ? (
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
                    record._status === 'create'
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
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxIncludedAmount`).d('含税金额'),

        dataIndex: 'taxIncludedAmount',
        width: 150,
        render: (_, record) => {
          const { amountPrecision } = this.props;
          const l = math.plus(
            record.$form.getFieldValue('totalAmount') || record.totalAmount,
            record.$form.getFieldValue('taxAmount') || record.taxAmount
          );
          return math.isNaN(l) ? undefined : thousandBitSeparatorIsNew(l, amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceDirection`).d('发票方向'),
        dataIndex: 'invoiceDirection',
        width: 150,
        render: (val, record) =>
          issueStatusCode !== 'SUCCESS' ? (
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
            val
          ),
      },
      {
        title: intl
          .get(`${promptCode}.model.invoiceBill.checkCodeWarning`)
          .d('校验码 (多位时请输入后6位即可)'),
        dataIndex: 'checkCode',
        width: 250,
        render: (val, record) => (
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
        ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierCompanyNames`).d('销方名称'),
        dataIndex: 'supplierCompanyName',
        width: 120,
        render: (_, record) => {
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator('supplierCompanyName', {
                initialValue: record.supplierCompanyName,
              })(
                <Lov
                  code={
                    typeCode === 'purchase'
                      ? 'SFIN.PURCHASER_SUPPLIER_UNIFIED_SOCIAL_INFO'
                      : 'SFIN.SUPPLIER_UNIFIED_SOCIAL_INFO'
                  }
                  textField="supplierCompanyName"
                  queryParams={{ tenantId: getCurrentOrganizationId() }}
                  onChange={(val, records) => {
                    record.$form.setFieldsValue({
                      supUnifiedSocialCode: records.unifiedSocialCode,
                    });
                  }}
                />
              )}
            </ChangeFormItem>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supUnifiedSocialCode`).d('销方税号'),
        dataIndex: 'supUnifiedSocialCode',
        width: 120,
        render: (val, record) =>
          issueStatusCode !== 'SUCCESS' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator('supUnifiedSocialCode', {
                initialValue: record.supUnifiedSocialCode,
              })(<Input disabled />)}
            </ChangeFormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purCompanyName`).d('购方名称'),
        dataIndex: 'companyName',
        width: 120,
        render: (_, record) => {
          return (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator('companyName', {
                initialValue: record.companyName,
              })(
                <Lov
                  code={
                    typeCode === 'purchase'
                      ? 'SFIN.PURCHASER_UNIFIED_SOCIAL_INFO'
                      : 'SFIN.SUPPLIER_PURCHASER_UNIFIED_SOCIAL_INFO'
                  }
                  textField="companyName"
                  queryParams={{ tenantId: getCurrentOrganizationId() }}
                  onChange={(val, records) => {
                    record.$form.setFieldsValue({
                      purUnifiedSocialCode: records.unifiedSocialCode,
                    });
                  }}
                />
              )}
            </ChangeFormItem>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purUnifiedSocialCode`).d('购方税号'),
        dataIndex: 'purUnifiedSocialCode',
        width: 120,
        render: (val, record) =>
          issueStatusCode !== 'SUCCESS' ? (
            <ChangeFormItem record={record}>
              {record.$form.getFieldDecorator('purUnifiedSocialCode', {
                initialValue: record.purUnifiedSocialCode,
              })(<Input disabled />)}
            </ChangeFormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.ocrFileUrl`).d('OCR识别附件'),
        dataIndex: 'ocrFileUrl',
        width: 150,
        render: (val) => this.modal(val),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.ofdFile`).d('OFD文件'),
        dataIndex: 'ofdFile',
        width: 120,
        render: (_, record) => {
          const { jpgUrl, ofdFileUrl } = record;
          return (
            <span className="action-link">
              {ofdFileUrl && (
                <a onClick={() => this.showModal(ofdFileUrl)}>
                  {intl.get('hzero.common.button.download').d('下载')}
                </a>
              )}
              {jpgUrl && (
                <a onClick={() => this.showModal(jpgUrl)}>
                  {intl.get('hzero.common.button.view').d('查看')}
                </a>
              )}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.dataSourceMeaning`).d('数据来源'),
        dataIndex: 'inputTypeCodeMeaning',
        width: 140,
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
      {
        title: intl.get(`sfin.common.model.common.invoiceView`).d('发票查看'),
        dataIndex: 'invoiceView',
        width: 120,
        render: (_, record) => {
          const { taxInvoiceLineId: invoiceHeaderId } = record;
          return (
            <a onClick={() => viewInvoiceDetail({ invoiceHeaderId, docType: 'taxInvoice' })}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          );
        },
      },
    ];
    return columnArray;
  }

  /**
   * 选中行回调
   * @param {Array} selectedRowKeys
   */
  @Bind()
  handleChangeSelectRowKeys(selectedRowKeys) {
    this.setState({ selectedRowKeys });
    const { listDataSource } = this.state;
    this.checkAR(
      !listDataSource
        .filter((item) => selectedRowKeys.includes(item.taxInvoiceLineId))
        .some((item) => item._status === 'update')
    );
  }

  /**
   * 添加行
   */
  @Bind()
  handleAdd() {
    const { listDataSource = [], pagination = {} } = this.state;
    const {
      // match: {
      //   params: { invoiceHeaderId },
      // },
      match,
    } = this.props;

    if (match.params.invoiceHeaderId !== undefined) {
      const { invoiceHeaderId } = match.params;
      this.setState({
        listDataSource: [
          { _status: 'create', taxInvoiceLineId: uuidv4(), invoiceHeaderId },
          ...listDataSource,
        ],
        pagination: addItemToPagination(listDataSource.length, pagination),
      });
    } else {
      const { invoiceHeaderId } = this.props;
      this.setState({
        listDataSource: [
          { _status: 'create', taxInvoiceLineId: uuidv4(), invoiceHeaderId },
          ...listDataSource,
        ],
        pagination: addItemToPagination(listDataSource.length, pagination),
      });
    }
  }

  @Bind()
  @Throttle(1000)
  async handleSave() {
    const {
      dispatch,
      // match: {
      //   params: { invoiceHeaderId },
      // },
      match,
      headerForm,
      customizeTable,
    } = this.props;
    if (match.params.invoiceHeaderId !== undefined) {
      const { invoiceHeaderId } = match.params;
      const { listDataSource } = this.state;
      // const list = getEditTableData(listDataSource, [], {
      //   force: true,
      // });
      // 个性化附件必填校验getEditTableData不支持，需改造
      const list = await getEditTableAllData(listDataSource);

      if (list.length === 0) return;
      dispatch({
        type: 'invoice/saveTaxLine',
        payload: {
          list: list.map((item) => {
            const { taxInvoiceLineId, ...other } = item;
            if (item._status === 'create') {
              delete other._status;
              return {
                ...other,
                invoiceTypeCode: item.noDepositInvoiceTypeCode,
                billingDate: item.billingDate ? item.billingDate.format(DATETIME_MIN) : undefined,
                tenantId: getCurrentOrganizationId(),
                taxIncludedAmount: math.plus(item.totalAmount, item.taxAmount),
              };
            } else {
              return {
                ...item,
                invoiceTypeCode: item.noDepositInvoiceTypeCode,
                billingDate: item.billingDate ? item.billingDate.format(DATETIME_MIN) : undefined,
                tenantId: getCurrentOrganizationId(),
                taxIncludedAmount: math.plus(item.totalAmount, item.taxAmount),
              };
            }
          }),
          invoiceHeaderId,
          customizeUnitCode: isFunction(customizeTable)
            ? 'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE'
            : '',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          // const { fetchHeader } = this.props;
          this.setState({
            listDataSource: res.map((item) => ({
              ...item,
              _status: 'update',
            })),
          });
          // fetchHeader();
          if (headerForm) {
            headerForm.fetchDetail();
          }
        }
      });
    } else {
      const { invoiceHeaderId } = this.props;
      const { listDataSource } = this.state;
      const list = getEditTableData(listDataSource, [], {
        force: true,
      });
      if (list.length === 0) return;
      dispatch({
        type: 'invoice/saveTaxLine',
        payload: {
          list: list.map((item) => {
            const { taxInvoiceLineId, ...other } = item;
            if (item._status === 'create') {
              delete other._status;
              return {
                ...other,
                invoiceTypeCode: item.noDepositInvoiceTypeCode,
                billingDate: item.billingDate ? item.billingDate.format(DATETIME_MIN) : undefined,
                tenantId: getCurrentOrganizationId(),
                taxIncludedAmount: math.plus(item.totalAmount, item.taxAmount),
              };
            } else {
              return {
                ...item,
                invoiceTypeCode: item.noDepositInvoiceTypeCode,
                billingDate: item.billingDate ? item.billingDate.format(DATETIME_MIN) : undefined,
                tenantId: getCurrentOrganizationId(),
                taxIncludedAmount: math.plus(item.totalAmount, item.taxAmount),
              };
            }
          }),
          invoiceHeaderId,
          customizeUnitCode: isFunction(customizeTable)
            ? 'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE'
            : '',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          // const { fetchHeader } = this.props;
          this.setState({
            listDataSource: res.map((item) => ({ ...item, _status: 'update' })),
          });
          // fetchHeader();
          if (headerForm) {
            headerForm.fetchDetail();
          }
        }
      });
    }
  }

  /**
   * 删除行
   */
  @Bind()
  @Throttle(1000)
  handleDelete() {
    const { dispatch, setUpdate, headerForm } = this.props;
    const { listDataSource, selectedRowKeys } = this.state;
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
            type: 'invoice/deleteTaxInvoiceLine',
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
              if (headerForm) {
                headerForm.fetchDetail();
              }
            }
          });
        } else {
          this.setState({
            listDataSource: newDataSource,
            selectedRowKeys: [],
          });
          setUpdate('deleteLine', selectedRowKeys);
        }
      },
    });
  }

  /**
   * 关闭或打开OCR
   */
  @Bind()
  handleModalVisible(value, modalName) {
    const visibleName = modalName === 'ofd' ? 'ofdModalVisible' : 'visible';
    if (value) {
      this.setState({
        [visibleName]: value,
        ocrLoading: false,
      });
    } else {
      this.setState({
        [visibleName]: value,
      });
      if (this.picturesWallRef) {
        this.picturesWallRef.setState({
          fileList: [],
        });
      }
    }
  }

  /**
   * OCR上传
   */
  @Bind()
  OCRUpload() {
    if (this.picturesWallRef) {
      const { sizeConfig } = this.state;
      const fileSize = sizeConfig.ocrFileSize || 10;
      const { fileList } = this.picturesWallRef.state;
      if (isEmpty(fileList)) {
        notification.warning({
          message: intl.get(`sfin.invoiceBill.verify.uploadPictureIsNull`).d('上传照片为空'),
        });
      } else {
        const overSizeFileNames = fileList
          .reduce((total, current) => {
            const { size, name } = current;
            return total.concat(size > fileSize * 1024 * 1024 ? [name] : []);
          }, [])
          .join();
        if (overSizeFileNames.length) {
          notification.error({
            message: intl
              .get(`sfin.common.message.validate.OCRLimitTips`, {
                overSizeFileNames,
                size: fileSize,
              })
              .d(`OCR识别失败，失败原因是文件{overSizeFileNames}大于{size}M无法识别，请检查`),
          });
          return;
        }
        const { dispatch, invoiceHeaderId, headerForm } = this.props;
        const list = fileList
          .filter((n) => n.status === 'done' && n.response)
          .map((n) => n.response);
        dispatch({
          type: 'invoice/ocrImport',
          payload: {
            list,
            invoiceHeaderId,
          },
        }).then((res) => {
          if (res) {
            // 返回的错误文件
            const lists = Object.keys(res);
            if (lists.length < list.length) {
              notification.success();
            }
            this.handleSearch();
            if (headerForm) {
              headerForm.fetchDetail();
            }
            if (!isEmpty(lists)) {
              // 弹窗中只留识别失败的附件
              this.picturesWallRef.setState({
                fileList: fileList.filter((file) => lists.includes(file.name)),
              });

              const errorMsg = Object.entries(res).map(([key, value]) => `${key}:${value.desc}`);
              getResponse({
                failed: true,
                type: 'error',
                message: errorMsg.join(','),
              });
            } else {
              this.picturesWallRef.setState({
                fileList: [],
              });
            }
          }
        });
      }
    }
  }

  @Bind()
  OFDUpload() {
    if (this.picturesWallRef) {
      const { fileList } = this.picturesWallRef.state;
      if (isEmpty(fileList)) {
        notification.warning({
          message: intl.get(`sfin.invoiceBill.verify.uploadPictureIsNull`).d('上传照片为空'),
        });
        return;
      }
      const { dispatch, invoiceHeaderId, headerForm } = this.props;
      const list = fileList.filter((n) => n.status === 'done' && n.response).map((n) => n.response);
      dispatch({
        type: 'invoice/ofdImport',
        payload: {
          list,
          invoiceHeaderId,
        },
      }).then((res) => {
        if (res) {
          // 返回的错误文件
          const lists = Object.keys(res);
          if (lists.length < list.length) {
            notification.success();
          }
          this.handleSearch();
          if (headerForm) {
            headerForm.fetchDetail();
          }
          if (!isEmpty(lists)) {
            // 弹窗中只留识别失败的附件
            this.picturesWallRef.setState({
              fileList: fileList.filter((file) => lists.includes(file.name)),
            });

            const errorMsg = Object.entries(res).map(([key, value]) => `${key}:${value.desc}`);
            getResponse({
              failed: true,
              type: 'error',
              message: errorMsg.join(','),
            });
          } else {
            this.picturesWallRef.setState({
              fileList: [],
            });
          }
        }
      });
    }
  }

  /**
   * EXCEL导入
   */
  @Bind()
  handleRoleImport() {
    openTab({
      key: `/sfin/invoice-create/data-import/SFIN.TAX_INVOICE_LINE`,
      title: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        args: JSON.stringify({
          tenantId: this.props.tenantId,
          a: 1,
          b: 2,
          templateCode: 'SFIN.TAX_INVOICE_LINE',
          invoiceHeaderId: this.props.invoiceHeaderId,
        }),
      }),
    });
  }

  @Bind()
  setOcrLoading(value) {
    this.setState({ ocrLoading: value });
  }

  /**
   * 发票查验
   */
  @Bind()
  @Throttle(1000)
  checkARinvoice() {
    const { typeCode } = this.props;
    Modal.confirm({
      title: intl.get(`sfin.invoiceBill.validation.isInvoiceCheck`).d('是否进行发票查验'),
      onOk: () => {
        const { dispatch, headerForm, tenantId, invoiceHeaderId } = this.props;
        const { listDataSource, selectedRowKeys } = this.state;
        const _list = listDataSource.filter(
          (item) => selectedRowKeys.includes(item.taxInvoiceLineId) && item._status === 'update'
        );
        const list = getEditTableData(_list || [], ['_status', 'taxInvoiceLineId', '$form'], {
          force: true,
        }).map((item) => {
          const { billingDate } = item;
          return {
            ...item,
            billingDate: billingDate ? billingDate.format(DATETIME_MIN) : undefined,
            tenantId,
            invoiceHeaderId,
            checkSource: typeCode === 'purchase' ? 'AUDIT' : 'RECEIVABLES',
          };
        });
        if (_list.length !== list.length) return;
        dispatch({
          type: 'invoice/checkARinvoice',
          payload: list,
        }).then((res) => {
          if (res) {
            notification.success();
          }
          this.handleSearch();
          headerForm.fetchDetail();
        });
      },
    });
  }

  @Bind()
  checkAR(value) {
    this.setState({
      checkAR: value,
    });
  }

  @Bind()
  invoicePage() {
    const { dispatch, headerForm, location = {} } = this.props;
    const { listDataSource = [] } = this.state;
    const taxType = listDataSource[0].invoiceTypeCode || '';
    const { pathname = '' } = location;
    let path = '';
    let type = '';
    if (pathname.search('update') > 0) {
      path = '/sfin/invoice-update/';
      type = 'update';
    } else if (pathname.search('create') > 0) {
      path = '/sfin/invoice-create/';
      type = 'create';
    } else {
      path = '/sfin/invoice-supplier/';
      type = 'supplier';
    }
    const {
      headerInfo: { invoiceHeaderId },
    } = headerForm;
    if (taxType === 'VAT_ORDINARY_INVOICE' || taxType === 'VAT_SPECIAL_INVOICE') {
      dispatch(
        routerRedux.push({
          pathname: `${path}view/`,
          search: stringify({ invoiceHeaderId, type }),
        })
      );
    } else if (taxType === 'VAT_ELECTRONIC_INVOICE') {
      dispatch(
        routerRedux.push({
          pathname: `${path}elcview`,
          search: stringify({ invoiceHeaderId, type }),
        })
      );
    }
    return null;
  }

  render() {
    const {
      headerForm: { headerInfo = {} },
      loading = true,
      customizeTable,
      typeCode,
      remoteOcrTitleCode,
      remoteProps,
      remoteBtnCreateCode,
    } = this.props;
    const { permitDirectInvoiceFlag, issueStatusCode } = headerInfo;
    const {
      selectedRowKeys = [],
      visible,
      listDataSource,
      pagination = {},
      ocrLoading = false,
      checkAR = true,
      // setting = false,
      purchaseSetting = false,
      supplySetting = false,
      sizeConfig,
      viewVisible = false,
      ocrFileUrl,
      ofdModalVisible,
    } = this.state;
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
      loading,
      pagination,
      scroll: { x: sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 250 },
    };
    const size = sizeConfig.ocrTransSize || 3;
    const fileType = sizeConfig.fileType || 'jpg/jpeg/png/bmp/pdf/ofd';
    const ocrTitle = intl
      .get(`sfin.common.message.validate.acceptMultipleUpload`, { size, fileType })
      .d(`支持{fileType}格式，建议单个附件不超过{size}M,可批量上传`);
    const attachmentModalProps = {
      visible,
      bodyStyle: { height: '400px', overflow: 'auto' },
      onCancel: () => this.handleModalVisible(false),
      title:
        remoteProps && remoteOcrTitleCode
          ? remoteProps.process(remoteOcrTitleCode, ocrTitle, { size })
          : ocrTitle,
      footer: [
        <Button key="back" onClick={() => this.handleModalVisible(false)}>
          {intl.get('hzero.common.view.button.cancel').d('取消')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={this.OCRUpload}
          disabled={ocrLoading}
        >
          {intl.get('sfin.invoiceBill.view.button.invoiceBill.ocrDistinguish').d('OCR识别')}
        </Button>,
      ],
    };
    const ofdModalProps = {
      visible: ofdModalVisible,
      bodyStyle: { height: '400px', overflow: 'auto' },
      title: intl.get(`sfin.invoiceBill.view.button.ofdAnalysis`).d('OFD解析'),
      onCancel: () => this.handleModalVisible(false, 'ofd'),
      footer: [
        <Button key="back" onClick={() => this.handleModalVisible(false, 'ofd')}>
          {intl.get('hzero.common.view.button.cancel').d('取消')}
        </Button>,
        <Button key="submit" type="primary" onClick={this.OFDUpload} loading={loading}>
          {intl.get(`sfin.invoiceBill.view.button.ofdAnalysis`).d('OFD解析')}
        </Button>,
      ],
    };
    const picturesWall = {
      onRef: (ref) => {
        this.picturesWallRef = ref;
      },
      accept: fileType
        ?.split('/')
        .map((n) => `.${n}`)
        .join(','),
      setOcrLoading: this.setOcrLoading,
    };
    const btns = [
      <Button
        type="primary"
        onClick={this.handleAdd}
        disabled={permitDirectInvoiceFlag === 1}
        name="add"
      >
        {intl.get(`hzero.common.button.create`).d('新建')}
      </Button>,
      <Button onClick={this.handleRoleImport} disabled={permitDirectInvoiceFlag === 1} name="excel">
        {intl.get(`sfin.invoiceBill.view.button.invoiceBill.excelImport`).d('EXCEL导入')}
      </Button>,
      <Button
        onClick={this.isSave(() => this.handleModalVisible(true))}
        disabled={permitDirectInvoiceFlag === 1}
        loading={loading}
        name="ocr"
      >
        {intl.get('sfin.invoiceBill.view.button.invoiceBill.ocrDistinguish').d('OCR识别')}
      </Button>,
      <Button
        onClick={this.isSave(() => this.handleModalVisible(true, 'ofd'))}
        disabled={permitDirectInvoiceFlag === 1}
        loading={loading}
        name="ofd"
      >
        {intl.get('sfin.invoiceBill.view.button.ofdAnalysis').d('OFD解析')}
      </Button>,
      <Button
        disabled={isEmpty(selectedRowKeys) || permitDirectInvoiceFlag === 1}
        onClick={this.isSave(this.handleDelete)}
        loading={loading}
        name="delete"
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>,
      <Button
        onClick={this.isSave(this.checkARinvoice)}
        disabled={
          checkAR ||
          !(typeCode === 'purchase' ? purchaseSetting : supplySetting) ||
          permitDirectInvoiceFlag === 1
        }
        name="check"
        loading={loading}
      >
        <Icons type="Invoice-Inspection" style={{ marginRight: '8px' }} />
        {intl.get(`${buttonTxt}.checkInvoice`).d('发票查验')}
      </Button>,
      <Button icon="save" loading={loading} onClick={this.handleSave} name="save">
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
    ];
    // 有直连开票标识permitDirectInvoiceFlag=1,开票不成功什么按钮都不显示
    // 开票成功就显示查看发票按钮
    // 没有直连开票标识,开票不成功就显示EXCEL导入,OCR识别,删除等按钮
    return (
      <div className={styles['purchase-application']}>
        <Form layout="inline">
          {issueStatusCode === 'SUCCESS' ? (
            <Button
              type="primary"
              onClick={this.isSave(this.invoicePage)}
              disabled={isEmpty(listDataSource)}
            >
              {intl.get(`${promptCode}.model.invoiceBill.viewInvoice`).d('查看发票')}
            </Button>
          ) : issueStatusCode !== 'SUCCESS' && permitDirectInvoiceFlag === 0 ? (
            <>
              {remoteProps && remoteBtnCreateCode
                ? remoteProps.process(remoteBtnCreateCode, btns, { headerInfo })
                : btns}
            </>
          ) : (
            ''
          )}
        </Form>
        {isFunction(customizeTable) ? (
          customizeTable(
            { code: 'SFIN.INVOICE_CREATE_DETAIL.TAX_LINE' },
            <EditTable {...editTableProps} />
          )
        ) : (
          <EditTable {...editTableProps} />
        )}
        {visible && (
          <Modal {...attachmentModalProps}>
            <Spin spinning={loading}>
              {/* 1048576 = 1024 * 1024 */}
              <OcrUpload {...picturesWall} fileSize={(sizeConfig.ocrFileSize || 10) * 1048576} />
            </Spin>
          </Modal>
        )}
        {ofdModalVisible && (
          <Modal {...ofdModalProps}>
            <Spin spinning={loading}>
              <OcrUpload accept=".ofd" {...picturesWall} />
            </Spin>
          </Modal>
        )}
        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={viewVisible}
          onClose={this.hideModal}
          downloadable
          images={[
            {
              src: ocrFileUrl,
              alt: '',
              downloadUrl: ocrFileUrl,
            },
          ]}
        />
      </div>
    );
  }
}
