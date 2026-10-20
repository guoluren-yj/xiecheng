/**
 * OrderHeaderForm - 订单审批明细页面 - 明细信息Form
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Tooltip } from 'hzero-ui';
import { math } from 'choerodon-ui/dataset';
import classnames from 'classnames';
import {
  dateTimeRender, // 日期时间格式化
} from 'hzero-front/lib/utils/renderer';
import intl from 'utils/intl';
// import { numberRender } from 'utils/renderer';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { formatAumont } from '../../components/utils';
import styles from './index.less';
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

const SHIED_FIELDS = [
  'amount',
  'taxIncludeAmount',
  'unitPrice',
  'enteredTaxIncludedPrice',
  'lineAmount',
  'taxIncludedLineAmount',
  'domesticTaxIncludedPrice',
  'domesticUnitPrice',
  'domesticTaxIncludedLineAmount',
  'domesticLineAmount',
];

/**
 * 我发送的订单明细页面 - 明细信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class OrderHeaderForm extends PureComponent {
  state = {
    custLoading: true,
  };

  changeTip = (record, dom, fieldName) => {
    const { changeMap = {}, priceShieldFlag } = record || {};
    const shieldFlag = priceShieldFlag === 1 && SHIED_FIELDS.includes(fieldName);
    if (fieldName in changeMap) {
      const fieldMeaning = changeMap[fieldName] || '【】';
      const tipTitle = `${intl
        .get('sodr.common.model.common.beforeUpdate')
        .d('变更前')}: ${fieldMeaning}`;
      const _dom = math.isBigNumber(dom) ? dom.toString() : dom;
      if (!shieldFlag) {
        return (
          <Tooltip title={tipTitle} overlayClassName={styles['change-tip-tooltip']}>
            <span style={{ color: 'red' }}>{_dom}</span>
          </Tooltip>
        );
      } else {
        return <span style={{ color: 'red' }}>{_dom}</span>;
      }
    }
    return dom;
  };

  getUpdate = () => {
    this.forceUpdate();
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      that,
      remote,
      dataSource = {},
      customizeForm,
      custLoading = true,
      amountFinancialPrecision,
    } = this.props;
    const { getFieldDecorator } = form;
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
      erpContractNum,
      quantityTotal,
      financialPrecision,
      domesticFinancialPrecision,
      sourceOfTransferOrder,
      sourceOfTransferOrderMeaning,
      // domesticFinancialPrecision,
      originalPoNum,
      domesticTaxIncludeAmount,
      domesticCurrencyCode,
      domesticAmount,
      supplierOrderTypeCode,
    } = dataSource;
    const formatReleasedDate = dateTimeRender(releasedDate) || null;
    if (custLoading !== this.state.custLoading) {
      this.forceUpdate();
    }
    this.setState({ custLoading });
    const { getUpdate } = this;
    return customizeForm(
      {
        form,
        code: 'SODR.ORDER_APPROVE_LINE_LIST.HEADER',
        dataSource,
        forceUpdate: getUpdate,
      },
      <Form loading={custLoading}>
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
              {getFieldDecorator('releaseNum')(
                <span>{this.changeTip(dataSource, releaseNum, 'releaseNum')}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.versionNum`).d('版本号')}
            >
              {getFieldDecorator('versionNum')(
                <span>{this.changeTip(dataSource, versionNum, 'versionNum')}</span>
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
              {getFieldDecorator('amount')(
                <span>
                  {this.changeTip(
                    dataSource,
                    amountFinancialPrecision(
                      priceShieldFlag,
                      amount,
                      financialPrecision,
                      poSourcePlatform,
                      sourceOfTransferOrder
                    ),
                    'amount'
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
                  {this.changeTip(
                    dataSource,
                    amountFinancialPrecision(
                      priceShieldFlag,
                      taxIncludeAmount,
                      financialPrecision,
                      poSourcePlatform,
                      sourceOfTransferOrder
                    ),
                    'taxIncludeAmount'
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
                <span>{this.changeTip(dataSource, currencyCode, 'currencyCode')}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem {...EDIT_FORM_ITEM_LAYOUT} label={intl.get(`entity.company.tag`).d('公司')}>
              {getFieldDecorator('companyName', { initialValue: companyName })(
                <span>{this.changeTip(dataSource, companyName, 'companyName')}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.supplierId`).d('供应商')}
            >
              {getFieldDecorator('supplierId', { initialValue: supplierId })(
                <span>
                  {this.changeTip(
                    dataSource,
                    `${supplierCode || ''} ${supplierName || ''}`,
                    'supplierId'
                  )}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.supplierSiteIds`).d('供应商地点')}
            >
              {getFieldDecorator('supplierSiteId')(
                <span>{this.changeTip(dataSource, supplierSiteName, 'supplierSiteId')}</span>
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
                <span>{this.changeTip(dataSource, poTypeDesc, 'poTypeDesc')}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.purOrganizationId`).d('采购组织')}
            >
              {getFieldDecorator('purchaseOrgName', { initialValue: purchaseOrgName })(
                <span>{this.changeTip(dataSource, purchaseOrgName, 'purchaseOrgName')}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {remote ? (
              remote.render(
                'SODR.ORDERAPPROVAL_DETAIL_RENDER_AGENT_COL',
                <FormItem
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get(`${modelPrompt}.agentName`).d('采购员')}
                >
                  {getFieldDecorator('agentId', { initialValue: agentId })(
                    <span>{this.changeTip(dataSource, agentName, 'agentId')}</span>
                  )}
                </FormItem>,
                { that, form }
              )
            ) : (
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${modelPrompt}.agentName`).d('采购员')}
              >
                {getFieldDecorator('agentId', { initialValue: agentId })(
                  <span>{this.changeTip(dataSource, agentName, 'agentId')}</span>
                )}
              </FormItem>
            )}
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.releaseTime`).d('发布时间')}
            >
              {getFieldDecorator('releasedDate')(
                <span>{this.changeTip(dataSource, formatReleasedDate, 'releasedDate')}</span>
              )}
            </FormItem>
          </Col>
          {poSourcePlatform !== 'CATALOGUE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${modelPrompt}.shipToLocationAddress`).d('收货方地址')}
              >
                {getFieldDecorator('shipToLocationAddress')(
                  <span>
                    {this.changeTip(dataSource, shipToLocationAddress, 'shipToLocationAddress')}
                  </span>
                )}
              </FormItem>
            </Col>
          )}
          {poSourcePlatform !== 'CATALOGUE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${modelPrompt}.billToLocationAddress`).d('收单方地址')}
              >
                {getFieldDecorator('billToLocationAddress')(
                  <span>
                    {this.changeTip(dataSource, billToLocationAddress, 'billToLocationAddress')}
                  </span>
                )}
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
              {getFieldDecorator('termsId', { initialValue: termsId })(
                <span>{this.changeTip(dataSource, termsName, 'termsId')}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.totalQuantity`).d('总数量')}
            >
              {getFieldDecorator('quantityTotal')(
                <span>
                  {this.changeTip(dataSource, formatAumont(quantityTotal), 'quantityTotal')}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.erpContractNum`).d('合同编号')}
            >
              {getFieldDecorator('erpContractNum')(
                <span>
                  {this.changeTip(dataSource, formatAumont(erpContractNum), 'erpContractNum')}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        {originalPoNum && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('read-half-row', 'last-form-item')}>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl
                  .get(`sodr.quotePurchase.model.quotePurchase.originalPoNum`)
                  .d('原订单号')}
              >
                {getFieldDecorator('originalPoHeaderId')(
                  <span>{this.changeTip(dataSource, originalPoNum, 'originalPoHeaderId')}</span>
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.domesticCurrencyCode`)
                .d('本币币种')}
            >
              {getFieldDecorator('domesticCurrencyCode')(
                <span>
                  {this.changeTip(dataSource, domesticCurrencyCode, 'domesticCurrencyCode')}
                </span>
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
              {getFieldDecorator('domesticTaxIncludeAmount')(
                <span>
                  {this.changeTip(
                    dataSource,
                    amountFinancialPrecision(
                      priceShieldFlag,
                      domesticTaxIncludeAmount,
                      domesticFinancialPrecision,
                      poSourcePlatform,
                      sourceOfTransferOrder
                    ),
                    'domesticTaxIncludeAmount'
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
                  {this.changeTip(
                    dataSource,
                    amountFinancialPrecision(
                      priceShieldFlag,
                      domesticAmount,
                      domesticFinancialPrecision,
                      poSourcePlatform,
                      sourceOfTransferOrder
                    ),
                    'domesticAmount'
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
              })(
                <span>
                  {this.changeTip(dataSource, supplierOrderTypeCode, 'supplierOrderTypeCode')}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item')}>
          <Col span={12}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.remark`).d('订单摘要')}
            >
              {getFieldDecorator('remark')(
                <span>{this.changeTip(dataSource, remark, 'remark')}</span>
              )}
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
                })(
                  <span>
                    {this.changeTip(
                      dataSource,
                      sourceOfTransferOrderMeaning,
                      'sourceOfTransferOrder'
                    )}
                  </span>
                )}
              </FormItem>
            </Col>
          </Row>
        )}
      </Form>
    );
  }
}
