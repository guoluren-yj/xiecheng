/**
 * index - 发票验真- 待检验列表页
 * @date: 2019-07-24
 * @author: zuoxaingyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import moment from 'moment';
import { sum, isEmpty, isUndefined } from 'lodash';
import React, { Fragment } from 'react';
import { Bind } from 'lodash-decorators';
// import { routerRedux } from 'dva/router';
import { Input, DatePicker, Modal, Tooltip, InputNumber } from 'hzero-ui';
import { dateTimeRender } from 'utils/renderer';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import { getDateFormat, getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';
// import { HZERO_FILE } from 'utils/config';
import ValueList from 'components/ValueList';
import { previewPdf } from '@/utils/utils';

const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const bucketDirectory = 'finance-invoice';
// eslint-disable-next-line no-unused-vars
function autobindMethod(target, key, { value: fn, configurable, enumerable }) {
  return {
    configurable,
    enumerable,
    get() {
      const boundFn = fn.bind(this);
      // eslint-disable-next-line no-undef
      defineProperty(this, key, {
        configurable: true,
        writable: true,
        enumerable: false,
        value: boundFn,
      });
      return boundFn;
    },
    // eslint-disable-next-line no-undef
    set: createDefaultSetter(key),
  };
}

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ocrFileUrl: null,
      visible: false,
      // lengthVisibitable: null,
      tenantId: getCurrentOrganizationId(),
      // accessToken: getAccessToken(),
    };
  }

  // SRM发票号列内容渲染
  @Bind()
  goToLink(record) {
    const { redirectInvoiceSummary, isSave } = this.props;
    const { srmTaxInvoiceMap } = record;
    return (srmTaxInvoiceMap || []).map((item) => {
      const { invoiceHeaderId, invoiceNum } = item;
      if (invoiceNum) {
        return (
          <p style={{ marginBottom: 0 }}>
            <a onClick={isSave(() => redirectInvoiceSummary(invoiceHeaderId))}>{invoiceNum}</a>
          </p>
        );
      }
      return null;
    });
  }

  // 显示Madal
  showModal = (fileUrl) => {
    if (!fileUrl) return;
    const { tenantId } = this.state;
    const fA = fileUrl.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'pdf') return previewPdf(fileUrl);
    this.setState({
      // ocrFileUrl: `${HZERO_FILE}/v1/${tenantId}/files/redirect-url?access_token=${accessToken}&bucketName=${bucketName}&directory=${bucketDirectory}&url=${record.ocrFileUrl}`,
      ocrFileUrl: getAttachmentUrl(fileUrl, bucketName, tenantId, bucketDirectory),
      visible: true,
    });
  };

  // 关闭Modal
  hideModal = () => {
    this.setState({
      visible: false,
    });
  };

  modal(record) {
    const { ocrFileUrl, jpgUrl, inputTypeCode, inputTypeCodeMeaning } = record;
    if (['OCR', 'OFD'].includes(inputTypeCode)) {
      const fileUrl = inputTypeCode === 'OFD' ? jpgUrl : ocrFileUrl;
      return <a onClick={() => this.showModal(fileUrl)}>{inputTypeCodeMeaning}</a>;
    } else {
      return <span>{inputTypeCodeMeaning}</span>;
    }
  }

  @Bind()
  isCellChange(record, changeValues) {
    const { dispatch, awaitVerifyCellChange } = this.props;
    if (!isEmpty(changeValues)) {
      dispatch({
        type: 'invoiceVerification/updateState',
        payload: {
          awaitVerifyCellChange: {
            ...awaitVerifyCellChange,
          },
        },
      });
    }
  }

  render() {
    const {
      loading,
      onSearch,
      pagination,
      dataSource,
      selectedRows,
      onRowSelectChange = (e) => e, // 勾选按钮
      ChangeFormItem,
      isSave,
      dispatch,
      onViewInvoiceDetail,
    } = this.props;
    const { ocrFileUrl, visible, tenantId } = this.state;
    const columns = [
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.invoiceType`).d('发票种类'),
        dataIndex: 'invoiceTypeCode',
        width: 150,
        render: (val, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator(`invoiceTypeCode`, {
              initialValue: record.invoiceTypeCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sfin.invoiceBill.model.invoiceBill.invoiceType`).d('发票种类'),
                  }),
                },
              ],
            })(
              <ValueList
                style={{ width: '100%' }}
                lovCode="SPUC.INVOICE_TYPE"
                textValue={record.invoiceTypeCodeMeaning}
                lazyLoad={false}
                allowClear
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.taxInvoiceCode`).d('发票代码'),
        dataIndex: 'invoiceCode',
        width: 160,
        render: (val, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator(`invoiceCode`, {
              rules: [
                {
                  required: !(
                    ['18', '19'].includes(record?.$form.getFieldValue('invoiceTypeCode')) ||
                    ['18', '19'].includes(record?.invoiceTypeCode)
                  ),
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`sfin.invoiceBill.model.invoiceBill.taxInvoiceCode`)
                      .d('发票代码'),
                  }),
                },
                // {
                //   pattern: /^\d{10}$|^\d{12}$/,
                //   message: intl
                //     .get(`sfin.invoiceVerification.verify.TenOrTwelveLengthOnly`)
                //     .d('长度只能为10或12位数字'),
                // },
              ],
              initialValue: record.invoiceCode,
            })(
              <Input
                onChange={() => {
                  record.$form.validateFields(['checkCode'], {
                    force: true,
                  });
                }}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.invoiceNumber`).d('发票号码'),
        dataIndex: 'invoiceNumber',
        width: 160,
        render: (val, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator(`invoiceNumber`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`sfin.invoiceBill.model.invoiceBill.invoiceNumber`)
                      .d('发票号码'),
                  }),
                },
                // {
                //   pattern: /^\d{8}$/,
                //   message: intl
                //     .get(`sfin.invoiceBill.view.message.theLengthCanOnlyBeEightDigits`)
                //     .d('长度只能为8位数字'),
                // },
              ],
              initialValue: record.invoiceNumber,
            })(
              <Input
                onChange={() => {
                  record.$form.validateFields(['checkCode'], {
                    force: true,
                  });
                }}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.taxInvoiceDateIssued`).d('开票日期'),
        dataIndex: 'billingDate',
        width: 160,
        render: (val, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator(`billingDate`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`sfin.invoiceBill.model.invoiceBill.taxInvoiceDateIssued`)
                      .d('开票日期'),
                  }),
                },
              ],
              initialValue: record.billingDate && moment(record.billingDate),
            })(
              <DatePicker
                onChange={() => {
                  record.$form.validateFields(['billingDate'], {
                    force: true,
                  });
                }}
                placeholder={null}
                format={getDateFormat()}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.netAmount`).d('不含税金额'),
        dataIndex: 'totalAmount',
        align: 'right',
        width: 150,
        render: (val, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator(`totalAmount`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`sfin.invoiceBill.model.invoiceBill.netAmount`).d('不含税金额'),
                  }),
                },
              ],
              initialValue: record.totalAmount || null,
            })(
              <InputNumber
                precision={2}
                width={150}
                onChange={() => {
                  record.$form.validateFields(['totalAmount'], {
                    force: true,
                  });
                }}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.taxAmount').d('税额'),
        dataIndex: 'taxAmount',
        align: 'right',
        width: 150,
        render: (val, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator(`taxAmount`, {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('sfin.invoiceBill.model.invoiceBill.taxAmount').d('税额'),
                  }),
                },
              ],
              initialValue: isUndefined(record.taxAmount) ? null : record.taxAmount,
            })(
              <InputNumber
                precision={2}
                width={150}
                onChange={() => {
                  record.$form.validateFields(['taxAmount'], {
                    force: true,
                  });
                }}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl
          .get(`sfin.invoiceVerification.model.checkCodeWaning`)
          .d('校验码 (多位时请输入后6位即可)'),
        dataIndex: 'checkCode',
        width: 210,
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
            })(
              <Input
                onChange={() => {
                  record.$form.validateFields(['checkCode'], {
                    force: true,
                  });
                }}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sfin.inputInvoice.model.purchaser`).d('购买方'),
        dataIndex: 'companyId',
        width: 220,
        render: (val, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator(`companyId`, {
              initialValue: record.companyId,
            })(
              <Lov
                code="SFIN.USER_AUTH.COMPANY"
                textValue={record.companyName}
                textField="companyName"
                queryParams={{ enabledFlag: 1, tenantId }}
                onChange={() => {
                  record.$form.validateFields(['companyId'], {
                    force: true,
                  });
                }}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sfin.inputInvoice.model.supplier`).d('销售方'),
        dataIndex: 'supplierCompanyId',
        width: 220,
        render: (val, record) => (
          <ChangeFormItem record={record}>
            {record.$form.getFieldDecorator(`supplierCompanyId`, {
              initialValue: record.supplierCompanyId,
            })(
              <Lov
                code="SFIN.USER_AUTH.SUPPLIER"
                textValue={record.supplierCompanyName}
                textField="supplierCompanyName"
                queryParams={{ enabledFlag: 1, organizationId: tenantId }}
                onChange={() => {
                  record.$form.validateFields(['supplierCompanyId'], {
                    force: true,
                  });
                }}
              />
            )}
          </ChangeFormItem>
        ),
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.checkState`).d('查验状态'),
        dataIndex: 'validateStatusCodeMeaning',
        width: 80,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.stateSpecification`).d('状态说明'),
        dataIndex: 'validateMessage',
        width: 120,
        render: (value, record) => (
          <div>
            <Tooltip placement="topLeft" title={record.validateMessage}>
              <span>{record.validateMessage}</span>
            </Tooltip>
          </div>
        ),
      },
      {
        title: intl.get(`sfin.invoiceVerification.model.checkTime`).d('查验时间'),
        dataIndex: 'checkTime',
        width: 140,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.invoiceNum`).d('SRM发票号'),
        dataIndex: 'srmTaxInvoiceMap',
        width: 170,
        render: (_, record) => this.goToLink(record),
      },
      {
        title: intl.get(`sfin.invoiceVerification.model.inputTypeCodeMeaning`).d('发票录入方式'),
        dataIndex: 'inputTypeCodeMeaning',
        width: 120,
        render: (_, record) => this.modal(record),
      },
      {
        title: intl.get(`sfin.invoiceVerification.model.invoiceView`).d('发票查看'),
        dataIndex: 'invoiceView',
        width: 120,
        render: (_, record) => (
          <a onClick={() => onViewInvoiceDetail(record)}>
            {intl.get(`hzero.common.button.view`).d('查看')}
          </a>
        ),
      },
    ];
    const selectedRowKeys = selectedRows.map((item) => item.taxInvoiceCheckId);
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectChange,
    };

    const tableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      rowSelection,
      bordered: true,
      rowKey: 'taxInvoiceCheckId',
      onChange: (page) => {
        this.pageSize = pagination.pageSize;
        isSave(
          () => {
            onSearch(page);
          },
          () => {
            setTimeout(() => {
              document.querySelectorAll('.ant-pagination-item')[page.current - 1].blur();
              dispatch({
                type: 'invoiceVerification/updateState',
                payload: {
                  pagination: {
                    ...pagination,
                    pageSize: this.pageSize,
                  },
                },
              });
            }, 5);
          }
        )();
      },
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };
    return (
      <Fragment>
        {visible && (
          <Modal visible={visible} onCancel={this.hideModal} footer={null} width="770px">
            <img width="95%" alt="" src={ocrFileUrl} />
          </Modal>
        )}
        <EditTable {...tableProps} />
      </Fragment>
    );
  }
}
