/**
 * index -创建一般付款申请-明细头页面
 * @date: 2019-12-11
 * @author zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Input, DatePicker, InputNumber } from 'hzero-ui';
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
import { dateTimeRender } from 'utils/renderer';
// import withCustomize from 'srm-front-cuz/lib/h0Customize'
import { getDateFormat, getUserOrganizationId, getCurrentUserId } from 'utils/utils';
import ValueList from 'components/ValueList';
import { thousandBitSeparator } from '@/routes/utils';

// import { dateRender } from 'utils/renderer';

const FormItem = Form.Item;
const { TextArea } = Input;

const commonPrompt = 'sfin.payment.common';
// @withCustomize({
//   unitCode: ['SFIN.ADVANCE_PAYMENT_RECORD_DETAIL.HEADER'],
// })
// @Form.create({ fieldNameProp: null })
export default class paymentHeader extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {
      userId: getCurrentUserId(),
      organizationId: getUserOrganizationId(),
      // collapseKeys: {},
      // time: new Date(),
    };
  }

  render() {
    const { organizationId, userId } = this.state;
    const {
      dataSource = [],
      form = {},
      tenantId,
      // handerChange = (e) => e,
      bankHanderChange = (e) => e,
      companyChange = (e) => e,
      supplierChange = (e) => e,
      customizeForm,
    } = this.props;
    const { getFieldDecorator, setFieldsValue, registerField } = form;
    const {
      paymentHeaderId,
      // paymentTypeName,
      typeName,
      paymentNum,
      // paymentTypeId,
      bankBranchName,
      bankAccountNum,
      // bankId,
      paymentDate,
      paymentAmount,
      amountPrecision,
      remark,
      bankName,
      supplierName,
      supplierCompanyId,
      supplierId,
      createdByName,
      supplierCompanyName,
      companyId,
      companyName,
      bankAccountName,
      creationDate,
      currencyCode,
      ouName,
      ouId,
      paymentSourceTypeCode,
      advanceRatio,
    } = dataSource;
    return customizeForm(
      {
        code: 'SFIN.ADVANCE_PAYMENT_RECORD_DETAIL.HEADER',
        form,
        dataSource,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${commonPrompt}.paymentNum`).d('付款申请单号')}>
              {getFieldDecorator('paymentNum')(<span>{paymentNum}</span>)}
            </Form.Item>
            {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.paymentNum`).d('付款申请单号')}
              value={paymentNum}
            /> */}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.company.tag`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName', {
                initialValue: companyId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.company.tag`).d('公司'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SFIN.PAYMENT_COMPANY"
                  textValue={companyName}
                  queryParams={{ tenantId, supplierCompanyId }}
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
                  code="SPFM.USER_AUTH.OU"
                  textValue={ouName}
                  queryParams={{ tenantId }}
                  // onChange={(value, lovRecord) => companyChange(value, lovRecord)}
                  disabled={ouId && paymentHeaderId}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.supplier.tag`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('supplierCompanyName', {
                initialValue: supplierName || supplierCompanyName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.supplier.tag`).d('供应商'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SFIN.PAYMENT_SUPPLIER"
                  textValue={supplierName || supplierCompanyName}
                  queryParams={{ userId, tenantId, organizationId, companyId }}
                  onChange={(value, lovRecord) => supplierChange(value, lovRecord)}
                  disabled={paymentHeaderId || !companyId}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.paymentHeaderStatus`).d('付款类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentSourceTypeCode', {
                initialValue: paymentSourceTypeCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.paymentHeaderStatus`).d('付款类型'),
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
                initialValue: bankName,
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
                initialValue: bankBranchName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.bankAccountName`).d('账户名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
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
                  queryParams={{
                    partnerCompanyId: supplierCompanyId,
                    tenantId,
                    companyId,
                    supplierId,
                  }}
                  onChange={(value, lovRecord) => bankHanderChange(value, lovRecord)}
                  disabled={!companyId || (!supplierCompanyId && !supplierId)}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.typeNames`).d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('typeName', {
                initialValue: typeName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.typeNames`).d('付款方式'),
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
                  // disabledDate={currentDate => moment(time).isAfter(currentDate, 'day')}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${commonPrompt}.paymentAmount`).d('付款金额')}>
              {getFieldDecorator('paymentAmount')(
                <span>
                  {paymentAmount ? thousandBitSeparator(paymentAmount, amountPrecision) : ''}
                </span>
              )}
            </Form.Item>
            {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.paymentAmount`).d('付款金额')}
              value={paymentAmount}
            /> */}
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${commonPrompt}.creationDate`).d('创建日期')}>
              {getFieldDecorator('creationDate')(<span>{dateTimeRender(creationDate)}</span>)}
            </Form.Item>
            {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.creationDate`).d('创建日期')}
              value={creationDate}
            /> */}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${commonPrompt}.createdByName`).d('申请人')}>
              {getFieldDecorator('createdByName')(<span>{createdByName}</span>)}
            </Form.Item>
            {/* <DisplayFormItem
              label={intl.get(`${commonPrompt}.createdByName`).d('申请人')}
              value={createdByName}
            /> */}
          </Col>
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
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.advanceRatio`).d('本次预付比例')}
              {...EDIT_FORM_ITEM_LAYOUT_COL_2}
            >
              {getFieldDecorator('advanceRatio', {
                initialValue: advanceRatio,
              })(
                <InputNumber
                  // precision={amountPrecision}
                  precision={5}
                  max={100}
                  min={0}
                  formatter={(value) => `${value}%`}
                  parser={(value) => value?.replace('%', '')}
                  allowThousandth
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
