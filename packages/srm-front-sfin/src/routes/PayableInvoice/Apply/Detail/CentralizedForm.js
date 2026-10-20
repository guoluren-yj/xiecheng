import React, { Component } from 'react';
import { Row, Col, Input, Form, Select, DatePicker, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { thousandsRender } from '@/utils/utils';
import styles from '../../index.less';
// import { thousandBitSeparator, precisionNum } from '@/routes/utils';

const { TextArea } = Input;
const promptCode = 'sfin.payableInvoice';

/**
 * 应付发票申请 - 集中开票明细表单
 * @extends {Component} - Component
 * @reactProps {Object} headerInfo - 头信息对象
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SFIN.INVOICE_SUMMARY_DETAIL.CENTRALIZED_BASIC',
    'SFIN.INVOICE_EC_UPDATE_DETAIL.BASIC_INFO',
    'SFIN.INVOICE_SUMMARY_DETAIL.EC_BASIC_INFO',
    'SFIN.INVOICE_EC_CREATE_DETAIL.BASIC_INFO',
  ],
})
@Form.create({ fieldNameProp: null })
export default class CentralizedForm extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {};
  }

  /**
   * 发票类型验证
   * @param {String} value select框value
   */
  @Bind()
  handleSelectChange(value) {
    const {
      onValidate,
      headerInfo: { companyId },
    } = this.props;
    if (value === 'SPECIAL_VAT') onValidate(companyId);
  }

  /**
   * 返回地址数组
   * @param {Number} id 地址最底Id
   * @param {Array} cityList 省市数组
   */
  @Bind()
  fetchRegionIds(id, cityList = []) {
    if (!id) return;
    const stack = [];
    const deepSearch = (children) => {
      let found = false;
      children.forEach((item) => {
        if (!found) {
          if (item.regionId === id) {
            found = true;
          } else if (!found && item.children && item.children.length > 0) {
            found = deepSearch(item.children);
          }
          if (found) stack.push(item);
        }
      });
      return found;
    };
    deepSearch(cityList);
    return stack.reverse().map((item) => item.regionId);
  }

  render() {
    const {
      form,
      isEdit,
      taxTypeList = [],
      headerInfo = {},
      customizeForm,
      ecSource,
      eCCustomizeUnitCodes = {},
    } = this.props;
    // const amountPrecision = headerInfo.amountPrecision;
    // const { amountPrecision } = headerInfo || {};
    // const amountCheck =
    //   amountPrecision === undefined || amountPrecision === null ? 2 : amountPrecision;
    const { invoiceStatus } = headerInfo || {};
    // 如果是电商发票异常维护电商发票申请页面的发票总额发票税额期望开票日期不可编辑
    const isEcInvoiceException =
      invoiceStatus === 'EC_INVOICE_EXCEPTION' && ['payMaintain'].includes(ecSource);
    // const taxIncludedAmount =
    //   headerInfo.priceShieldFlag === 1
    //     ? headerInfo.taxIncludedAmountMeaning
    //     : numberRender(headerInfo.taxIncludedAmount, 2, false);

    // const taxIncludedAmountSystem =
    //   headerInfo.priceShieldFlag === 1
    //     ? headerInfo.taxIncludedAmountSystemMeaning
    //     : numberRender(headerInfo.taxIncludedAmountSystem, 2, false);
    // const taxAmount =
    //   headerInfo.priceShieldFlag === 1
    //     ? headerInfo.taxAmountMeaning
    //     : numberRender(headerInfo.taxAmount, 2, false);
    // const taxAmountSystem =
    //   headerInfo.priceShieldFlag === 1
    //     ? headerInfo.taxAmountSystemMeaning
    //     : numberRender(headerInfo.taxAmountSystem, 2, false);

    const { taxIncludedAmount, taxIncludedAmountSystem, taxAmount, taxAmountSystem } = headerInfo;
    const { getFieldDecorator } = form;
    return (
      <React.Fragment>
        {customizeForm(
          {
            code: ecSource
              ? eCCustomizeUnitCodes[ecSource.toUpperCase()].BASIC
              : 'SFIN.INVOICE_SUMMARY_DETAIL.CENTRALIZED_BASIC',
            form,
            dataSource: headerInfo,
          },
          <Form className={styles['ec-read-form']}>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.payableInvoice.invoiceNum`).d('SRM发票号')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('invoiceNum', {
                    initialValue: headerInfo.invoiceNum,
                  })(<span>{headerInfo.invoiceNum}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`hzero.common.status`).d('状态')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('invoiceStatusMeaning', {
                    initialValue: headerInfo.invoiceStatusMeaning,
                  })(<span>{headerInfo.invoiceStatusMeaning}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('supplierCompanyName', {
                    initialValue: headerInfo.supplierCompanyName,
                  })(<span>{headerInfo.supplierCompanyName}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.payableInvoice.company`).d('公司')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('companyName', {
                    initialValue: headerInfo.companyName,
                  })(<span>{headerInfo.companyName}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.payableInvoice.purchaseAgentName`)
                    .d('采购员')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('purchaseAgentName', {
                    initialValue: headerInfo.purchaseAgentName,
                  })(<span>{headerInfo.purchaseAgentName}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.payableInvoice.drawerSupplierName`)
                    .d('出票方')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('drawerSupplierName', {
                    initialValue: headerInfo.drawerSupplierName,
                  })(<span>{headerInfo.drawerSupplierName}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.taxIncludedAmountSystem`)
                    .d('含税总额(系统)')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('taxIncludedAmountSystem', {
                    initialValue: headerInfo.taxIncludedAmountSystem,
                  })(
                    taxIncludedAmountSystem !== taxIncludedAmount && taxIncludedAmount !== null ? (
                      <span style={{ color: 'red' }}>
                        {thousandsRender(taxIncludedAmountSystem)}
                        {/* {thousandBitSeparator(Number(taxIncludedAmountSystem), amountPrecision)} */}
                      </span>
                    ) : (
                      <span>
                        {thousandsRender(taxIncludedAmountSystem)}
                        {/* {thousandBitSeparator(Number(taxIncludedAmountSystem), amountPrecision)} */}
                      </span>
                    )
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.taxIncludedAmount.invoice`).d('发票总额')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {isEdit && !isEcInvoiceException
                    ? getFieldDecorator('taxIncludedAmount', {
                        initialValue: taxIncludedAmount,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.model.taxIncludedAmount.invoice`)
                                .d('发票总额'),
                            }),
                          },
                          // {
                          //   validator: (i, value, callback) => {
                          //     const currentLength = Number(value).toString().split('.')[1]
                          //       ? Number(value).toString().split('.')[1].length
                          //       : 0;
                          //     if (currentLength > amountCheck) {
                          //       callback(
                          //         intl
                          //           .get(`${promptCode}.model.taxIncludedAmount.msgError`)
                          //           .d(`精度校验不通过`)
                          //       );
                          //     } else {
                          //       callback();
                          //     }
                          //   },
                          // },
                        ],
                      })(
                        <InputNumber
                          // precision={2}
                          // precision={precisionNum(
                          //   form.getFieldValue('taxIncludedAmount'),
                          //   {
                          //     $form: form,
                          //     amountPrecision,
                          //   },
                          //   'taxIncludedAmount'
                          // )}
                          // {...precisionParams(Number(taxIncludedAmount), true)}
                          allowThousandth
                          min={0}
                          style={{ width: '100%' }}
                        />
                      )
                    : taxIncludedAmountSystem === taxIncludedAmount
                    ? getFieldDecorator('taxIncludedAmount', {
                        initialValue: headerInfo.taxIncludedAmount,
                      })(
                        <span>
                          {thousandsRender(taxIncludedAmount)}
                          {/* {thousandBitSeparator(Number(taxIncludedAmount), amountPrecision)} */}
                        </span>
                      )
                    : getFieldDecorator('taxIncludedAmount', {
                        initialValue: headerInfo.taxIncludedAmount,
                      })(
                        <span style={{ color: 'red' }}>
                          {thousandsRender(taxIncludedAmount)}
                          {/* {thousandBitSeparator(Number(taxIncludedAmount), amountPrecision)} */}
                        </span>
                      )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.payableInvoice.currencyCode`).d('币种')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('currencyCode', {
                    initialValue: headerInfo.currencyCode,
                  })(<span>{headerInfo.currencyCode}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.payableInvoice.taxAmountSystem`)
                    .d('税额(系统)')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('taxAmountSystem', {
                    initialValue: headerInfo.taxAmountSystem,
                  })(
                    taxAmountSystem !== taxAmount && taxAmount !== null ? (
                      <span style={{ color: 'red' }}>
                        {thousandsRender(taxAmountSystem)}
                        {/* {thousandBitSeparator(Number(taxAmountSystem), amountPrecision)} */}
                      </span>
                    ) : (
                      <span>
                        {thousandsRender(taxAmountSystem)}
                        {/* {thousandBitSeparator(Number(taxAmountSystem), amountPrecision)} */}
                      </span>
                    )
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.payableInvoice.taxAmount.invoice`)
                    .d('发票税额')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {isEdit && !isEcInvoiceException
                    ? getFieldDecorator('taxAmount', {
                        initialValue: taxAmount,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.model.payableInvoice.taxAmount.invoice`)
                                .d('发票税额'),
                            }),
                          },
                          // {
                          //   validator: (i, value, callback) => {
                          //     const currentLength = Number(value).toString().split('.')[1]
                          //       ? Number(value).toString().split('.')[1].length
                          //       : 0;

                          //     if (currentLength > amountCheck) {
                          //       callback(
                          //         intl
                          //           .get(`${promptCode}.model.taxIncludedAmount.msgError`)
                          //           .d(`精度校验不通过`)
                          //       );
                          //     } else {
                          //       callback();
                          //     }
                          //   },
                          // },
                        ],
                      })(
                        <InputNumber
                          // precision={2}
                          // precision={precisionNum(
                          //   form.getFieldValue('taxAmount'),
                          //   {
                          //     $form: form,
                          //     amountPrecision,
                          //   },
                          //   'taxAmount'
                          // )}
                          // {...precisionParams(Number(taxAmount), true)}
                          allowThousandth
                          min={0}
                          style={{ width: '100%' }}
                        />
                      )
                    : taxAmountSystem === taxAmount
                    ? getFieldDecorator('taxAmount', {
                        initialValue: headerInfo.taxAmount,
                      })(
                        <span>
                          {thousandsRender(taxAmount)}
                          {/* {thousandBitSeparator(Number(taxAmount), amountPrecision)} */}
                        </span>
                      )
                    : getFieldDecorator('taxAmount', {
                        initialValue: headerInfo.taxAmount,
                      })(
                        <span style={{ color: 'red' }}>
                          {thousandsRender(taxAmount)}
                          {/* {thousandBitSeparator(Number(taxAmount), amountPrecision)} */}
                        </span>
                      )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.payableInvoice.freight`).d('运费')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('freight', {
                    initialValue: headerInfo.freight,
                  })(<span>{headerInfo.freight}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.payableInvoice.taxType`).d('发票类型')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {isEdit
                    ? getFieldDecorator('taxType', {
                        initialValue: headerInfo.taxType,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.model.payableInvoice.taxType`)
                                .d('发票类型'),
                            }),
                          },
                        ],
                      })(
                        <Select
                          allowClear
                          style={{ width: '100%' }}
                          // onChange={this.handleSelectChange}
                        >
                          {taxTypeList.map((item) => (
                            <Select.Option value={item.value} key={item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )
                    : getFieldDecorator('taxType', {
                        initialValue: headerInfo.taxType,
                      })(<span>{headerInfo.taxTypeMeaning}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.payableInvoice.expectInvoiceDate`)
                    .d('期望开票日期')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {isEdit && !isEcInvoiceException
                    ? getFieldDecorator('expectInvoiceDate', {
                        initialValue:
                          headerInfo.expectInvoiceDate &&
                          moment(headerInfo.expectInvoiceDate, getDateFormat()),
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.model.payableInvoice.expectInvoiceDate`)
                                .d('期望开票日期'),
                            }),
                          },
                        ],
                      })(
                        <DatePicker
                          style={{ width: '100%' }}
                          placeholder=""
                          format={getDateFormat()}
                          // disabledDate={currentDate => moment().isBefore(currentDate, 'day')}
                        />
                      )
                    : getFieldDecorator('expectInvoiceDate', {
                        initialValue: headerInfo.expectInvoiceDate,
                      })(<span>{dateRender(headerInfo.expectInvoiceDate)}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.payableInvoice.remark`).d('备注')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {isEdit
                    ? getFieldDecorator('remark', {
                        initialValue: headerInfo.remark,
                      })(<TextArea rows={2} />)
                    : getFieldDecorator('remark', {
                        initialValue: headerInfo.remark,
                      })(<span>{headerInfo.remark}</span>)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }
}
