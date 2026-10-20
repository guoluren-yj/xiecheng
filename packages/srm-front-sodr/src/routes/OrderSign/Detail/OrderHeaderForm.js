/**
 * OrderHeaderForm - 订单签署明细页面 - 明细信息Form
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
import classnames from 'classnames';

import intl from 'utils/intl';
// import { numberRender } from 'utils/renderer';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
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

/**
 * 订单发布明细页面 - 明细信息Form
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
    const {
      form = {},
      dataSource = {},
      customizeForm,
      amountFinancialPrecision = (e) => e,
    } = this.props;
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
      domesticCurrencyCode,
      domesticTaxIncludeAmount,
      domesticAmount,
      originalPoNum,
      sourceOfTransferOrder,
      sourceOfTransferOrderMeaning,
      supplierOrderTypeCode,
      cooperationSupplierFlag,
      electricSignFlag,
      electricSignStatus,
      electricSignOrderMeaning,
      electricSignOrder,
      electricSignStageMeaning,
      electricSignStage,
      electricSignStatusMeaning,
    } = dataSource;
    return customizeForm(
      {
        form,
        dataSource,
        code: 'SODR.ORDER_SIGN_DETAIL.HEADER',
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.poNum`).d('订单号')}
            >
              {getFieldDecorator('displayPoNum')(<span>{displayPoNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.releaseNum`).d('发放号')}
            >
              {getFieldDecorator('releaseNum')(<span>{releaseNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.versionNum`).d('版本号')}
            >
              {getFieldDecorator('versionNum')(<span>{versionNum}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.amount`).d('不含税金额')}
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
              label={intl.get(`sodr.common.model.common.taxIncludeAmount`).d('含税金额')}
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
              label={intl.get(`sodr.common.model.common.currencyCode`).d('币种')}
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
              label={intl.get(`sodr.common.model.common.supplierId`).d('供应商')}
            >
              {getFieldDecorator('supplierId')(
                <span>{`${supplierCode || ''} ${supplierName || ''}`}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.supplierSiteId`).d('供应商地点')}
            >
              {getFieldDecorator('supplierSiteId')(<span>{supplierSiteName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.poTypeCode`).d('订单类型')}
            >
              {getFieldDecorator('poTypeDesc')(<span>{poTypeDesc}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.purOrganizationId`).d('采购组织')}
            >
              {getFieldDecorator('purchaseOrgName')(<span>{purchaseOrgName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.agentName`).d('采购员')}
            >
              {getFieldDecorator('agentId')(<span>{agentName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.releasedDate`).d('发布日期')}
            >
              {getFieldDecorator('releasedDate')(<span>{releasedDate}</span>)}
            </FormItem>
          </Col>
          {poSourcePlatform !== 'CATALOGUE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`sodr.common.model.common.shipToLocationAddress`).d('收货方地址')}
              >
                {getFieldDecorator('shipToLocationAddress')(<span>{shipToLocationAddress}</span>)}
              </FormItem>
            </Col>
          )}
          {poSourcePlatform !== 'CATALOGUE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`sodr.common.model.common.billToLocationAddress`).d('收单方地址')}
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
              label={intl.get(`sodr.common.model.common.termsName`).d('付款条款')}
            >
              {getFieldDecorator('termsId')(<span>{termsName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.totalQuantity`).d('总数量')}
            >
              {getFieldDecorator('quantityTotal')(<span>{formatAumont(quantityTotal)}</span>)}
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
              {getFieldDecorator('domesticCurrencyCode', <span>{domesticCurrencyCode}</span>)}
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
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              className={styles.sodrOrderRemark}
              label={intl.get(`sodr.common.model.common.remark`).d('订单摘要')}
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
              label={intl
                .get(`sodr.common.model.common.cooperationSupplierFlag`)
                .d('供应商参与协同标识')}
            >
              {getFieldDecorator('cooperationSupplierFlag', {
                initialValue: cooperationSupplierFlag,
              })(<span>{yesOrNoRender(cooperationSupplierFlag)}</span>)}
            </FormItem>
          </Col>
        </Row>
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
