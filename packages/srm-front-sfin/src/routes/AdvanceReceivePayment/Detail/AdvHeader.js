/**
 * index -创建一般收款申请-明细头页面
 * @date: 2019-12-11
 * @author zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, DatePicker } from 'hzero-ui';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
} from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import moment from 'moment';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getDateFormat, getCurrentUserId } from 'utils/utils';
import ValueList from 'components/ValueList';
import { dateTimeRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';

const FormItem = Form.Item;
const { TextArea } = Input;

const commonPrompt = 'sfin.payment.common';
@withCustomize({
  unitCode: ['SFIN.RECEIVE_PREPAYMENT_DETAIL.HEADER'],
})
// @Form.create({ fieldNameProp: null })
export default class paymentHeader extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {
      userId: getCurrentUserId(),
      // organizationId: getUserOrganizationId(),
      // collapseKeys: {},
      // time: new Date(),
    };
  }

  calculateAmount = (paymentAmount, amountPrecision) => {
    if (isNaN(Number(paymentAmount))) return '';
    return thousandBitSeparator(paymentAmount, amountPrecision);
  };

  render() {
    const { userId } = this.state;
    const {
      dataSource = {},
      form,
      tenantId,
      supplierLovList,
      handerChange = (e) => e,
      bankHanderChange = (e) => e,
      companyChange = (e) => e,
      supplierChange = (e) => e,
      customizeForm,
    } = this.props;
    const defaultLovRecord = supplierLovList.length === 1 && (supplierLovList[0] || []);
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    const {
      paymentHeaderId,
      // paymentTypeName,
      typeName,
      paymentNum,
      // paymentTypeId,
      bankBranchName,
      bankAccountNum,
      paymentDate,
      paymentAmount,
      amountPrecision,
      remark,
      bankName,
      bankFirm,
      supplierId,
      supplierName,
      // supplierName,
      // bankId,
      supplierCompanyId,
      supplierCompanyName,
      createdByName,
      companyId,
      companyName,
      ouId,
      ouName,
      bankAccountName,
      creationDate,
      currencyCode,
      paymentSourceTypeCode,
    } = dataSource;
    return (
      <>
        {customizeForm(
          {
            code: 'SFIN.RECEIVE_PREPAYMENT_DETAIL.HEADER',
            form,
            dataSource,
          },
          <Form>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.receivePaymentNum`).d('收款申请单号')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('paymentNum', {})(<span>{paymentNum}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.clientCompany`).d('客户公司')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('companyId', {
                    initialValue: companyId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.clientCompany`).d('客户公司'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SFIN.PAYMENT_CUSTOMER_COMPANY"
                      textValue={companyName}
                      queryParams={{
                        tenantId,
                        supplierCompanyId: getFieldValue('supplierCompanyId'),
                      }}
                      onChange={(value, lovRecord) => companyChange(value, lovRecord)}
                      disabled={paymentHeaderId}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.ouId`).d('业务实体')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('ouId', {
                    initialValue: ouId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.ouId`).d('业务实体'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="HPFM.OU"
                      textValue={ouName}
                      queryParams={{
                        tenantId,
                        companyId: getFieldValue('companyId'),
                      }}
                      // onChange={(value, lovRecord) => companyChange(value, lovRecord)}
                      disabled={!getFieldValue('companyId') || (paymentHeaderId && ouId)}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.clientCompanyName`).d('公司')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('tempKey', {
                    initialValue: defaultLovRecord.companyName || supplierCompanyName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.clientCompanyName`).d('公司'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SFIN.PAYMENT_SUPPLIER_COMPANY"
                      textValue={defaultLovRecord.companyName || supplierCompanyName}
                      queryParams={{ userId, tenantId, companyId }}
                      onChange={(value, lovRecord) => supplierChange(value, lovRecord)}
                      disabled={paymentHeaderId}
                    />
                  )}
                  {getFieldDecorator('bankFirm', {
                    initialValue: defaultLovRecord.bankFirm || bankFirm,
                  })}
                  {getFieldDecorator('supplierId', {
                    initialValue: defaultLovRecord.supplierId || supplierId,
                  })}
                  {getFieldDecorator('supplierName', {
                    initialValue: defaultLovRecord.supplierName || supplierName,
                  })}
                  {getFieldDecorator('supplierCompanyId', {
                    initialValue: defaultLovRecord.companyId || supplierCompanyId,
                  })}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.receivePaymentType`).d('收款类型')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('paymentSourceTypeCode', {
                    initialValue: paymentSourceTypeCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.receivePaymentType`).d('收款类型'),
                        }),
                      },
                    ],
                  })(
                    <ValueList
                      style={{ width: '100' }}
                      lovCode="SFIN.PAYMENT_SOURCE_TYPE"
                      textValue={paymentSourceTypeCode}
                      lazyLoad={false}
                      allowClear
                      disabled={paymentHeaderId}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.bankName`).d('银行名称')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('bankName', {
                    initialValue: defaultLovRecord.bankName || bankName,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.bankBranchName`).d('开户行名称')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('bankBranchName', {
                    initialValue: defaultLovRecord.bankBranchName || bankBranchName,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.bankAccountName`).d('账户名称')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('bankAccountName', {
                    initialValue: defaultLovRecord.bankAccountName || bankAccountName,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.bankAccountNum`).d('银行账号')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('bankAccountNum', {
                    initialValue: defaultLovRecord.bankAccountNum || bankAccountNum,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.bankAccountNum`).d('银行账号'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SPUC.COMPANY_BANK_ACCOUNT_NEW"
                      textValue={defaultLovRecord.bankAccountNum || bankAccountNum}
                      // queryParams={{ companyId: form.getFieldValue('supplierCompanyId') }}
                      queryParams={{
                        partnerCompanyId: getFieldValue('supplierCompanyId'),
                        tenantId,
                        companyId: getFieldValue('companyId'),
                      }}
                      onChange={(value, lovRecord) => bankHanderChange(value, lovRecord)}
                      disabled={!getFieldValue('companyId') || !getFieldValue('supplierCompanyId')}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.receiveType`).d('收款方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('typeName', {
                    initialValue: typeName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.receiveType`).d('收款方式'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SMDM.PAYMENT_TYPE_SUPPLIER"
                      textValue={typeName}
                      queryParams={{ tenantId }}
                      onChange={(_, record) => {
                        handerChange(record);
                        setFieldsValue({ typeId: record.typeId });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.receivePaymentDate`).d('收款日期')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('paymentDate', {
                    initialValue: paymentDate && moment(paymentDate),
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.receivePaymentDate`).d('收款日期'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder=""
                      // disabledDate={currentDate => moment(time).isAfter(currentDate, 'day')}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.receiveAmount`).d('收款金额')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('paymentAmount', {
                    initialValue: paymentAmount,
                  })(<span>{this.calculateAmount(paymentAmount, amountPrecision)}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.currencyCode`).d('币种')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('currencyCode', {
                    initialValue: currencyCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SPRM.EXCHANGE_RATE.CURRENCY"
                      textValue={currencyCode}
                      queryParams={{ tenantId }}
                      disabled={paymentHeaderId}
                      // onChange={(value, lovRecord) => bankHanderChange(value, lovRecord)}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.creationDate`).d('创建日期')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDate', {
                    initialValue: creationDate,
                  })(<span>{dateTimeRender(creationDate)}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.createdByName`).d('申请人')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('createdByName', {
                    initialValue: createdByName,
                  })(<span>{createdByName}</span>)}
                </FormItem>
              </Col>
            </Row>

            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl.get(`${commonPrompt}.remark`).d('备注')}
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                >
                  {getFieldDecorator('remark', {
                    initialValue: remark,
                    rules: [
                      {
                        max: 120,
                        message: intl.get('hzero.common.validation.max', { max: 120 }),
                      },
                    ],
                  })(<TextArea rows={2} style={{ overflow: 'hidden', height: '56px' }} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </>
    );
  }
}
