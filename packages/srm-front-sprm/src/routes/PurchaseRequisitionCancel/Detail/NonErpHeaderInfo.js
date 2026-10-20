/*
 * NonErpHeaderInfo - 非Erp采购申请头信息
 * @date: 2019-02-22
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Row, Col, Form } from 'hzero-ui';
// import classnames from 'classnames';

import intl from 'utils/intl';
import { dateRender, dateTimeRender } from 'utils/renderer';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

import { thousandBitSeparator } from '@/routes/utils.js';
// import DisplayFormItem from '../../components/DisplayFormItem';

const FormItem = Form.Item;
const commonPrompt = 'sprm.common.model.common';

export default class NonErpHeaderInfo extends Component {
  render() {
    const {
      headerInfo = {},
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    const {
      ouName,
      amount,
      remark,
      purchaseOrgName,
      // contactTelNum,
      companyName,
      displayPrNum,
      creationDate,
      purchaseAgentName,
      title,
      createByName,
      prSourcePlatform,
      prSourcePlatformMeaning,
      paymentMethodName,
      // freight,
      lotNum,
      unitName,
      financialPrecision,
      requestDate,
      originalCurrency,
      headerPriceHiddenFlag,
      amountMeaning,
      localFinancialPrecision,
      localCurrencyNoTaxSum,
      localCurrencyTaxSum,
      localCurrencyTaxSumMeaning,
      localCurrencyNoTaxSumMeaning,
      priceHiddenFlag,
    } = headerInfo;
    return customizeForm(
      {
        code: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.HEADER',
        dataSource: headerInfo,
        form: this.props.form,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.title`).d('标题')}>
              {getFieldDecorator('title', {
                initialValue: title,
              })(<span>{title}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}>
              {getFieldDecorator('prNum', {
                initialValue: displayPrNum,
              })(<span>{displayPrNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.creationTime`).d('创建时间')}>
              {getFieldDecorator('creationDate', {
                initialValue: creationDate,
              })(<span>{dateTimeRender(creationDate)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.amount`).d('申请总额')}>
              {getFieldDecorator('amount', {
                initialValue: amount,
              })(
                <span>
                  {headerPriceHiddenFlag === 1
                    ? amountMeaning
                    : thousandBitSeparator(amount, financialPrecision, prSourcePlatform !== 'SRM')}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.roles.creator`).d('创建人')}>
              {getFieldDecorator('createByName', {
                initialValue: createByName,
              })(<span>{createByName}</span>)}
            </FormItem>
          </Col>
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.contactTelNum`).d('联系电话')}>
              {getFieldDecorator('contactTelNum', {
                initialValue: contactTelNum,
              })(<span>{contactTelNum}</span>)}
            </FormItem>
          </Col> */}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.company.tag`).d('公司')}>
              {getFieldDecorator('companyName', {
                initialValue: companyName,
              })(<span>{companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.business.tag`).d('业务实体')}>
              {getFieldDecorator('ouName', {
                initialValue: ouName,
              })(<span>{ouName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.organization.class.purchase`).d('采购组织')}>
              {getFieldDecorator('purchaseOrgName', {
                initialValue: purchaseOrgName,
              })(<span>{purchaseOrgName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员')}>
              {getFieldDecorator('purchaseAgentName', {
                initialValue: purchaseAgentName,
              })(<span>{purchaseAgentName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源')}>
              {getFieldDecorator('prSourcePlatformMeaning', {
                initialValue: prSourcePlatformMeaning,
              })(<span>{prSourcePlatformMeaning}</span>)}
            </FormItem>
          </Col>
          {prSourcePlatform === 'E-COMMERCE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem label={intl.get(`${commonPrompt}.paymentMethodCode`).d('支付方式')}>
                {getFieldDecorator('paymentMethodName', {
                  initialValue: paymentMethodName,
                })(<span>{paymentMethodName}</span>)}
              </FormItem>
            </Col>
          )}
          {['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform) && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem label={intl.get(`${commonPrompt}.lotNum`).d('批次号')}>
                {getFieldDecorator('lotNum', {
                  initialValue: lotNum,
                })(<span>{lotNum}</span>)}
              </FormItem>
            </Col>
          )}
          {prSourcePlatform === 'SRM' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem label={intl.get(`${commonPrompt}.unitName`).d('所属部门')}>
                {getFieldDecorator('unitName', {
                  initialValue: unitName,
                })(<span>{unitName}</span>)}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.requestDate`).d('申请日期')}>
              {getFieldDecorator('requestDate')(<span>{dateRender(requestDate)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.originalCurrency`).d('原币币种')}>
              {getFieldDecorator('originalCurrency', {
                initialValue: originalCurrency,
              })(<span>{originalCurrency}</span>)}
            </FormItem>
          </Col>
        </Row>
        {/* {prSourcePlatform === 'E-COMMERCE' && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem label={intl.get(`${commonPrompt}.freight`).d('运费')}>
                {getFieldDecorator('freight', {
                  initialValue: freight,
                })(<span>{numberRender(freight, 2)}</span>)}
              </FormItem>
            </Col>
          </Row>
        )} */}
        <Row>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.localCurrencyNoTaxSum`).d('本币金额(不含税)')}
            >
              {getFieldDecorator('localCurrencyNoTaxSum', {
                initialValue: localCurrencyNoTaxSum,
              })(
                <span>
                  {priceHiddenFlag === 1
                    ? localCurrencyNoTaxSumMeaning
                    : thousandBitSeparator(
                        localCurrencyNoTaxSum,
                        localFinancialPrecision,
                        prSourcePlatform !== 'SRM'
                      )}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.localCurrencyTaxSum`).d('本币金额(含税)')}>
              {getFieldDecorator('localCurrencyTaxSum', {
                initialValue: localCurrencyTaxSum,
              })(
                <span>
                  {priceHiddenFlag === 1
                    ? { localCurrencyTaxSumMeaning }
                    : thousandBitSeparator(
                        localCurrencyTaxSum,
                        localFinancialPrecision,
                        prSourcePlatform !== 'SRM'
                      )}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.applyExplain`).d('申请说明')}>
              {getFieldDecorator('remark', {
                initialValue: remark,
              })(<span>{remark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
