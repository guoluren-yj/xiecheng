/**
 * OrderHeaderForm - 订单审批明细页面 - 明细信息Form
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import classnames from 'classnames';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

// import DisplayFormItem from '../../components/DisplayFormItem';

// function numberFormat(val) {
//   const count = countDecimals(val);
//   return isNumber(val) && !isNaN(val) ? numberRender(val, count <= 2 ? 2 : count) : val;
// }

// function countDecimals(val) {
//   return isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? `${val}`.split('.')[1].length || 0
//     : 0;
// }

const FormItem = Form.Item;

// 设置sodr国际化前缀 - common - message
const modelPrompt = 'sodr.orderApproval.model.common';

/**
 * 我发送的订单明细页面 - 明细信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class OrderHeaderForm extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { dataSource = {}, form = {}, customizeForm, amountFinancialPrecision } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const {
      poSourcePlatform,
      displayPoNum,
      releaseNum,
      versionNum,
      releasedDate,
      companyName,
      amount,
      taxIncludeAmount,
      currencyCode,
      supplierName,
      poTypeDesc,
      supplierSiteName,
      purchaseOrgName,
      agentName,
      shipToLocationAddress,
      billToLocationAddress,
      termsName,
      remark,
      supplierCode,
      priceShieldFlag,
      erpContractNum,
      financialPrecision,
      domesticFinancialPrecision,
      domesticTaxIncludeAmount,
      domesticCurrencyCode,
      domesticAmount,
      originalPoNum,
      supplierOrderTypeCode,
    } = dataSource;
    return customizeForm(
      {
        form,
        dataSource,
        code: 'SODR.ORDER_EVALUATE_DETAIL.HEADER',
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.poNum`).d('订单号')}
            >
              {getFieldDecorator('displayPoNum')(<span>{displayPoNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.releaseNum`).d('发放号')}
            >
              {getFieldDecorator('releaseNum')(<span>{releaseNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.versionNum`).d('版本号')}
            >
              {getFieldDecorator('versionNum')(<span>{versionNum}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.amount`).d('不含税金额')}
            >
              {getFieldDecorator('amount')(
                <span>
                  {amountFinancialPrecision(
                    priceShieldFlag,
                    amount,
                    financialPrecision,
                    poSourcePlatform
                  )}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.taxIncludeAmount`).d('含税金额')}
            >
              {getFieldDecorator('taxIncludeAmount')(
                <span>
                  {amountFinancialPrecision(
                    priceShieldFlag,
                    taxIncludeAmount,
                    financialPrecision,
                    poSourcePlatform
                  )}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.currencyCode`).d('币种')}
            >
              {getFieldDecorator('currencyCode')(<span>{currencyCode}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem {...EDIT_FORM_ITEM_LAYOUT} label={intl.get(`entity.company.tag`).d('公司')}>
              {getFieldDecorator('companyName')(<span>{companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.supplierId`).d('供应商')}
            >
              {getFieldDecorator('supplierId')(
                <span>{`${supplierCode || ''} ${supplierName || ''}`}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.supplierSiteIds`).d('供应商地点')}
            >
              {getFieldDecorator('supplierSiteId')(<span>{supplierSiteName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.poTypeCode`).d('订单类型')}
            >
              {getFieldDecorator('poTypeDesc')(<span>{poTypeDesc}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.purOrganizationId`).d('采购组织')}
            >
              {getFieldDecorator('purchaseOrgName')(<span>{purchaseOrgName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.agentName`).d('采购员')}
            >
              {getFieldDecorator('agentId')(<span>{agentName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.releaseTime`).d('发布时间')}
            >
              {getFieldDecorator('releasedDate')(<span>{dateTimeRender(releasedDate)}</span>)}
            </FormItem>
          </Col>
          {poSourcePlatform !== 'CATALOGUE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${modelPrompt}.shipToLocationAddress`).d('收货方地址')}
              >
                {getFieldDecorator('shipToLocationAddress')(<span>{shipToLocationAddress}</span>)}
              </FormItem>
            </Col>
          )}
          {poSourcePlatform !== 'CATALOGUE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${modelPrompt}.billToLocationAddress`).d('收单方地址')}
              >
                {getFieldDecorator('billToLocationAddress')(<span>{billToLocationAddress}</span>)}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.termsName`).d('付款条款')}
            >
              {getFieldDecorator('termsId')(<span>{termsName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.erpContractNum`).d('合同编号')}
            >
              {getFieldDecorator('erpContractNum')(<span>{erpContractNum}</span>)}
            </FormItem>
          </Col>
          {originalPoNum && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl
                  .get(`sodr.quotePurchase.model.quotePurchase.originalPoNum`)
                  .d('原订单号')}
              >
                {getFieldDecorator('originalPoHeaderId')(<span>{originalPoNum}</span>)}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.domesticCurrencyCode`)
                .d('本币币种')}
            >
              {getFieldDecorator('domesticCurrencyCode')(<span>{domesticCurrencyCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.domesticTaxIncludeAmount`)
                .d('本币含税金额')}
            >
              {getFieldDecorator('domesticTaxIncludeAmount')(
                <span>
                  {amountFinancialPrecision(
                    priceShieldFlag,
                    domesticTaxIncludeAmount,
                    domesticFinancialPrecision,
                    poSourcePlatform
                  )}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.domesticAmount`)
                .d('本币不含税金额')}
            >
              {getFieldDecorator('domesticAmount')(
                <span>
                  {amountFinancialPrecision(
                    priceShieldFlag,
                    domesticAmount,
                    domesticFinancialPrecision,
                    poSourcePlatform
                  )}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`${modelPrompt}..supplierOrderTypeCode`).d('京东e卡-code')}>
              {getFieldDecorator('supplierOrderTypeCode', {
                initialValue: supplierOrderTypeCode,
              })(<span>{supplierOrderTypeCode}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('read-half-row', 'last-form-item')}>
          <Col span={12}>
            {/* <DisplayFormItem
              label={intl.get(`${modelPrompt}.remark`).d('订单摘要')}
              value={remark}
            /> */}
            <FormItem
              // className={styles.sodrOrderRemark}
              label={intl.get(`${modelPrompt}.remark`).d('订单摘要')}
            >
              {getFieldDecorator('remark')(<span>{remark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
