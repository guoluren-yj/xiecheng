/**
 * OrderHeaderForm - 我发送的订单明细页面 - 明细信息Form
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
import classnames from 'classnames';

import intl from 'utils/intl';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import { yesOrNoRender, dateTimeRender } from 'utils/renderer';

import { formatAumont } from '../../components/utils';

import styles from '../../components/index.less';

// function numberFormat(val) {
//   const count = countDecimals(val);
//   return isNumber(val) && !isNaN(val) ? numberRender(val, count <= 2 ? 2 : count) : val;
// }

// function countDecimals(val) {
//   return isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? `${val}`.split('.')[1].length || 0
//     : 0;
// }

// TextArea组件初始化
const { TextArea } = Input;
const FormItem = Form.Item;
// 设置sodr国际化前缀 - common - message
const modelPrompt = 'sodr.deliveryDateReview.model.common';

/**
 * OrderHeaderForm - 交期审核明细页面 - 明细信息Form
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
    const { form = {}, dataSource = {}, customizeForm, amountFinancialPrecision } = this.props;
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
      quantityTotal,
      financialPrecision,
      domesticFinancialPrecision,
      domesticTaxIncludeAmount,
      domesticCurrencyCode,
      domesticAmount,
      originalPoNum,
      sourceOfTransferOrder,
      sourceOfTransferOrderMeaning,
      supplierOrderTypeCode,
      electricSignFlag,
      electricSignStatus,
      electricSignOrderMeaning,
      electricSignOrder,
      electricSignStageMeaning,
      electricSignStage,
      electricSignStatusMeaning,
      supplierId,
      supplierSiteId,
      agentId,
      termsId,
      originalPoHeaderId,
    } = dataSource;
    const formatReleasedDate = dateTimeRender(releasedDate);
    return customizeForm(
      {
        form,
        dataSource,
        code: 'SODR.ORDER_DELIVERY_LINE_LIST.HEADER',
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.poNum`).d('订单号')}
            >
              {getFieldDecorator('displayPoNum', { initialValue: displayPoNum })(
                <span>{displayPoNum}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.releaseNum`).d('发放号')}
            >
              {getFieldDecorator('releaseNum', { initialValue: releaseNum })(
                <span>{releaseNum}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.versionNum`).d('版本号')}
            >
              {getFieldDecorator('versionNum', { initialValue: versionNum })(
                <span>{versionNum}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.amount`).d('不含税金额')}
            >
              {getFieldDecorator('amount', { initialValue: amount })(
                <span>
                  {amountFinancialPrecision(
                    priceShieldFlag,
                    amount,
                    financialPrecision,
                    poSourcePlatform,
                    sourceOfTransferOrder
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
              {getFieldDecorator('taxIncludeAmount', { initialValue: taxIncludeAmount })(
                <span>
                  {amountFinancialPrecision(
                    priceShieldFlag,
                    taxIncludeAmount,
                    financialPrecision,
                    poSourcePlatform,
                    sourceOfTransferOrder
                  )}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.currencyName`).d('币种')}
            >
              {getFieldDecorator('currencyCode', { initialValue: currencyCode })(
                <span>{currencyCode}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem {...EDIT_FORM_ITEM_LAYOUT} label={intl.get(`entity.company.tag`).d('公司')}>
              {getFieldDecorator('companyName', { initialValue: companyName })(
                <span>{companyName}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.supplierId`).d('供应商')}
            >
              {getFieldDecorator('supplierId', { initialValue: supplierId })(
                <span>{`${supplierCode || ''} ${supplierName || ''}`}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.supplierSiteIds`).d('供应商地点')}
            >
              {getFieldDecorator('supplierSiteId', { initialValue: supplierSiteId })(
                <span>{supplierSiteName}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.poTypeCode`).d('订单类型')}
            >
              {getFieldDecorator('poTypeDesc', { initialValue: poTypeDesc })(
                <span>{poTypeDesc}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.purOrganizationId`).d('采购组织')}
            >
              {getFieldDecorator('purchaseOrgName', { initialValue: purchaseOrgName })(
                <span>{purchaseOrgName}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.agentName`).d('采购员')}
            >
              {getFieldDecorator('agentId', { initialValue: agentId })(<span>{agentName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.releaseTime`).d('发布时间')}
            >
              {getFieldDecorator('releasedDate', { initialValue: releasedDate })(
                <span>{formatReleasedDate}</span>
              )}
            </FormItem>
          </Col>
          {poSourcePlatform !== 'CATALOGUE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${modelPrompt}.shipToLocationAddress`).d('收货方地址')}
              >
                {getFieldDecorator('shipToLocationAddress', {
                  initialValue: shipToLocationAddress,
                })(<span>{shipToLocationAddress}</span>)}
              </FormItem>
            </Col>
          )}
          {poSourcePlatform !== 'CATALOGUE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${modelPrompt}.billToLocationAddress`).d('收单方地址')}
              >
                {getFieldDecorator('billToLocationAddress', {
                  initialValue: billToLocationAddress,
                })(<span>{billToLocationAddress}</span>)}
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
              {getFieldDecorator('termsId', {
                initialValue: termsId,
              })(<span>{termsName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('sodr.common.model.common.totalQuantity').d('总数量')}
            >
              {getFieldDecorator('quantityTotal', {
                initialValue: quantityTotal,
              })(<span>{formatAumont(quantityTotal)}</span>)}
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
                {getFieldDecorator('originalPoHeaderId', {
                  initialValue: originalPoHeaderId,
                })(<span>{originalPoNum}</span>)}
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
              {getFieldDecorator('domesticCurrencyCode', {
                initialValue: domesticCurrencyCode,
              })(<span>{domesticCurrencyCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.domesticTaxIncludeAmount`)
                .d('本币含税金额')}
            >
              {getFieldDecorator('domesticTaxIncludeAmount', {
                initialValue: domesticTaxIncludeAmount,
              })(
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
              {getFieldDecorator('domesticAmount', {
                initialValue: domesticAmount,
              })(
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
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              className={styles.sodrOrderRemark}
              label={intl.get(`${modelPrompt}.remark`).d('订单摘要')}
            >
              {getFieldDecorator('remark', {
                initialValue: remark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(<TextArea rows={2} style={{ height: '56px' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.supplierOrderTypeCode`)
                .d('京东e卡-code')}
            >
              {getFieldDecorator('supplierOrderTypeCode', {
                initialValue: supplierOrderTypeCode,
              })(<span>{supplierOrderTypeCode}</span>)}
            </FormItem>
          </Col>
        </Row>
        {!!sourceOfTransferOrder && (
          <Row {...EDIT_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`sodr.common.model.common.sourceOfTransferOrder`).d('转单来源')}
              >
                {getFieldDecorator('sourceOfTransferOrder', {
                  initialValue: sourceOfTransferOrder,
                })(<span>{sourceOfTransferOrderMeaning}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.electricSignFlag`).d('电签标志')}
            >
              {getFieldDecorator('electricSignFlag', { initialValue: electricSignFlag })(
                <span>{yesOrNoRender(electricSignFlag)}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.electricSignStatus`).d('电签状态')}
            >
              {getFieldDecorator('electricSignStatus', { initialValue: electricSignStatus })(
                <span>{electricSignStatusMeaning}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.electricSignOrder`).d('签署顺序')}
            >
              {getFieldDecorator('electricSignOrder', { initialValue: electricSignOrder })(
                <span>{electricSignOrderMeaning}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.electricSignStage`).d('签署阶段')}
            >
              {getFieldDecorator('electricSignStage', { initialValue: electricSignStage })(
                <span>{electricSignStageMeaning}</span>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
