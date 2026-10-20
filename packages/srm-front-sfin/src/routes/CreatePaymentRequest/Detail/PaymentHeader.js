/**
 * index -创建一般付款申请-明细头页面
 * @date: 2019-12-11
 * @author zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, DatePicker, Checkbox } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

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
import { getDateFormat } from 'utils/utils';
import { thousandBitSeparator } from '@/routes/utils';

// import { dateRender } from 'utils/renderer';

// import DisplayFormItem from '.././../components/DisplayFormItem';

const FormItem = Form.Item;
const { TextArea } = Input;

const commonPrompt = 'sfin.payment.common';
// @Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SFIN.PAYMENT_REQUEST_CREATE_DETAIL.HEADER_FORM'],
})
export default class paymentHeader extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {
      // collapseKeys: {},
      time: new Date(),
    };
  }

  render() {
    const { time } = this.state;
    const {
      dataSource = [],
      form = {},
      tenantId,
      // handerChange = (e) => e,
      bankHanderChange = (e) => e,
      customizeForm,
    } = this.props;
    const { getFieldDecorator, setFieldsValue, registerField } = form;
    const {
      // InvoiceTitle,
      typeName,
      paymentNum,
      companyName,
      supplierCompanyName,
      bankName,
      currencyCode,
      bankBranchName,
      bankAccountName,
      bankAccountNum,
      // bankId,
      paymentDate,
      paymentAmount,
      amountPrecision,
      createdByName,
      remark,
      supplierCompanyId,
      companyId,
      invoiceTitle,
      privatePaymentFlag,
      receiptPlace,
      ouName,
    } = dataSource;
    // SFIN.PAYMENT_REQUEST_CREATE_DETAIL.HEADER_FORM

    return customizeForm(
      {
        code: 'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.HEADER_FORM',
        form,
        dataSource,
      },
      // return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.paymentNum`).d('付款申请单号')}
              value={paymentNum}
            /> */}
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.paymentNum`).d('付款申请单号')}
            >
              {getFieldDecorator('paymentNum')(<span>{paymentNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem label={intl.get(`entity.company.tag`).d('公司')} value={companyName} /> */}
            <FormItem {...EDIT_FORM_ITEM_LAYOUT} label={intl.get(`entity.company.tag`).d('公司')}>
              {getFieldDecorator('companyName')(<span>{companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.paymentNum`).d('付款申请单号')}
              value={paymentNum}
            /> */}
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.ouName`).d('业务实体')}
            >
              {getFieldDecorator('ouName')(<span>{ouName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`entity.supplier.tag`).d('供应商')}
              value={supplierCompanyName}
            /> */}
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.supplier.tag`).d('供应商')}
            >
              {getFieldDecorator('supplierCompanyName')(<span>{supplierCompanyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.bankName`).d('银行名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.bankName`).d('银行名称')}
              value={bankName}
            /> */}
              {getFieldDecorator('bankName', {
                initialValue: bankName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.bankBranchName`).d('开户行名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.bankBranchName`).d('开户行名称')}
              value={bankBranchName}
            /> */}
              {getFieldDecorator('bankBranchName', {
                initialValue: bankBranchName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.bankAccountName`).d('账户名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.bankAccountName`).d('账户名称')}
              value={bankAccountName}
            /> */}
              {getFieldDecorator('bankAccountName', {
                initialValue: bankAccountName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.bankAccountNum`).d('银行账号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bankAccountNum', {
                initialValue: bankAccountNum,
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
                  textValue={bankAccountNum}
                  queryParams={{ partnerCompanyId: supplierCompanyId, tenantId, companyId }}
                  onChange={(value, lovRecord) => bankHanderChange(value, lovRecord)}
                  disabled={!companyId || !supplierCompanyId}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.typeName`).d('付款方法')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('typeName', {
                initialValue: typeName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.typeName`).d('付款方法'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SMDM.PAYMENT_TYPE"
                  textValue={typeName}
                  queryParams={{ tenantId }}
                  onChange={(_, record) => {
                    // handerChange(record);
                    registerField('typeId');
                    registerField('paymentTypeId');
                    setFieldsValue({
                      typeId: record.typeId,
                      paymentTypeId: record.typeId,
                    });
                  }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.paymentDate`).d('付款日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentDate', {
                initialValue: paymentDate && moment(paymentDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.paymentDate`).d('付款日期'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  format={getDateFormat()}
                  placeholder=""
                  disabledDate={(currentDate) => moment(time).isAfter(currentDate, 'day')}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.paymentAmount`).d('付款金额')}
              value={paymentAmount}
            /> */}
            <Form.Item label={intl.get(`${commonPrompt}.paymentAmount`).d('付款金额')}>
              {getFieldDecorator('paymentAmount')(
                <span>{thousandBitSeparator(paymentAmount, amountPrecision)}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.currencyCode`).d('币种')}
              value={currencyCode}
            /> */}
            <Form.Item label={intl.get(`${commonPrompt}.currencyCode`).d('币种')}>
              {getFieldDecorator('currencyCode', {
                initialValue: currencyCode,
              })(<span>{currencyCode}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.createdByName`).d('申请人')}
              value={createdByName}
            /> */}
            <Form.Item label={intl.get(`${commonPrompt}.createdByName`).d('申请人')}>
              {getFieldDecorator('createdByName')(<span>{createdByName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.privatePaymentFlag`).d('对私支付')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('privatePaymentFlag', {
                initialValue: privatePaymentFlag || 0,
              })(
                <Checkbox
                  // defaultValue={0}
                  checkedValue={1}
                  unCheckedValue={0}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.receiptPlace`).d('收单地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('receiptPlace', {
                initialValue: receiptPlace,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceBodyName`).d('开票主体')}
              value={invoiceTitle}
            /> */}
            <Form.Item label={intl.get(`${commonPrompt}.invoiceBodyName`).d('付款申请单号')}>
              {getFieldDecorator('invoiceTitle')(<span>{invoiceTitle}</span>)}
            </Form.Item>
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
    );
  }
}
