/**
 * OrderHeaderForm - 我发送的订单明细页面 - 明细信息Form
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
import classnames from 'classnames';

import intl from 'utils/intl';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
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

// FormItem组件初始化
const FormItem = Form.Item;
// TextArea组件初始化
const { TextArea } = Input;

// 设置sodr国际化前缀 - common - message
const modelPrompt = 'sodr.sendOrder.model.common';

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
    const {
      sourceFromCancel,
      form = {},
      dataSource = {},
      customizeForm,
      amountFinancialPrecision,
      headerDataSourceKey,
      remote,
      history,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const {
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
      supplierSiteId,
      supplierSiteName,
      purchaseOrgName,
      agentId,
      agentName,
      shipToLocationAddress,
      billToLocationAddress,
      termsId,
      termsName,
      remark,
      supplierId,
      supplierCode,
      priceShieldFlag,
      poSourcePlatform,
      poSourcePlatformMeaning,
      supplierCompanyCode,
      supplierCompanyName,
      erpContractNum,
      quantityTotal,
      financialPrecision,
      domesticFinancialPrecision,
      domesticTaxIncludeAmount,
      domesticCurrencyCode,
      domesticAmount,
      // attributeLongtext1,
      sourceOfTransferOrder,
      sourceOfTransferOrderMeaning,
      originalPoNum,
      supplierOrderTypeCode,
      cooperationSupplierFlag,
      electricSignFlag,
      electricSignStatus,
      electricSignStatusMeaning,
      electricSignOrder,
      electricSignOrderMeaning,
      electricSignStage,
      electricSignStageMeaning,
      pcNum,
    } = dataSource;
    return customizeForm(
      {
        form,
        dataSource,
        code: sourceFromCancel
          ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.HEADER'
          : 'SODR.SEND_ORDER_DETAIL.HEADER',
        dataSourceKey: headerDataSourceKey,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.orderNum`).d('订单号')}
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
              label={intl.get(`${modelPrompt}.taxNotIncludeAmount`).d('不含税金额')}
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
              label={intl.get(`${modelPrompt}.currencyCode`).d('币种')}
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
              label={intl.get(`sodr.common.model.common.supplierId`).d('供应商')}
            >
              {getFieldDecorator('supplierId', { initialValue: supplierId })(
                <span>
                  {`${supplierCode || supplierCompanyCode || ''} ${
                    supplierName || supplierCompanyName || ''
                  }`}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.supplierSites`).d('供应商地点')}
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
              label={intl.get(`${modelPrompt}.orderType`).d('订单类型')}
            >
              {getFieldDecorator('poTypeDesc', { initialValue: poTypeDesc })(
                <span>{poTypeDesc}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.purOrganizationId`).d('采购组织')}
            >
              {getFieldDecorator('purchaseOrgName', { initialValue: purchaseOrgName })(
                <span>{purchaseOrgName}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.purchaseAgent`).d('采购员')}
            >
              {getFieldDecorator('agentId', { initialValue: agentId })(<span>{agentName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.releaseTime`).d('发布时间')}
            >
              {getFieldDecorator('releasedDate', { initialValue: releasedDate })(
                <span>{dateTimeRender(releasedDate)}</span>
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
              label={intl.get(`${modelPrompt}.paymentRules`).d('付款条款')}
            >
              {getFieldDecorator('termsId', { initialValue: termsId })(<span>{termsName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('sodr.common.model.common.totalQuantity').d('总数量')}
            >
              {getFieldDecorator('quantityTotal', { initialValue: quantityTotal })(
                <span>{formatAumont(quantityTotal)}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.sourcePlatform`).d('来源平台')}
            >
              {getFieldDecorator('poSourcePlatform', { initialValue: poSourcePlatform })(
                <span>{poSourcePlatformMeaning}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
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
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.contractNum`).d('合同编号')}
            >
              {getFieldDecorator('erpContractNum', { initialValue: erpContractNum })(
                <span>{erpContractNum}</span>
              )}
            </FormItem>
          </Col>
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.quotePurchase.model.quotePurchase.internalRemarks`).d('备注（内部）')}
            >
              {getFieldDecorator('attributeLongtext1')(<span>{attributeLongtext1}</span>)}
            </FormItem>
          </Col> */}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.domesticCurrencyCode`)
                .d('本币币种')}
            >
              {getFieldDecorator('domesticCurrencyCode', { initialValue: domesticCurrencyCode })(
                <span>{domesticCurrencyCode}</span>
              )}
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
              {getFieldDecorator('domesticAmount', { initialValue: domesticAmount })(
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
            {sourceFromCancel ? (
              <FormItem
                className={styles.sodrOrderRemark}
                label={intl.get(`${modelPrompt}.orderSummary`).d('订单摘要')}
              >
                {getFieldDecorator('remark', { initialValue: remark })(<span>{remark}</span>)}
              </FormItem>
            ) : (
              <FormItem
                className={styles.sodrOrderRemark}
                label={intl.get(`${modelPrompt}.orderSummary`).d('订单摘要')}
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
            )}
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
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.popcNum`).d('订单协议单号')}
            >
              {getFieldDecorator('pcNum', { initialValue: pcNum })(<span>{pcNum}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            {remote ? (
              remote.render('SODR.SENDORDER_DETAIL_RENDER_HEADER_FORM', <></>, {
                form,
                history,
                dataSource,
              })
            ) : (
              <></>
            )}
          </Col>
        </Row>
      </Form>
    );
  }
}
