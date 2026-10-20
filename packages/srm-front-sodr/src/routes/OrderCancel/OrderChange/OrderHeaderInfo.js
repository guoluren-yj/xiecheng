/**
 * OrderHeaderInfo - 订单变更明细头信息
 * @date: 2020-03-04
 * @author: maojaiqi <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import {
  FORM_COL_2_LAYOUT,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import {
  dateTimeRender, // 日期时间格式化
} from 'hzero-front/lib/utils/renderer';
import { formatAumont } from '../../components/utils';

const FormItem = Form.Item;
const { TextArea } = Input;
export default class OrderHeaderInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
    };
  }

  // 头字段是否配置可修改
  @Bind()
  isDisabledFields(headerInfo, item) {
    const { changeFields = [] } = this.props;
    return headerInfo.cancelledFlag || headerInfo.closedFlag || !changeFields.includes(item);
  }

  render() {
    const { tenantId } = this.state;
    const { headerInfo = {}, form = {}, customizeForm, amountFinancialPrecision } = this.props;
    const { financialPrecision, domesticFinancialPrecision, domesticCurrencyCode } = headerInfo;
    const { getFieldDecorator } = form;
    const formatCreationDate = dateTimeRender(headerInfo.creationDate) || null;
    return customizeForm(
      {
        form,
        dataSource: headerInfo,
        code: 'SODR.ORDER_CANCEL_CHANGE.HEADER',
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.poTypeCode`).d('订单类型')}
            >
              {getFieldDecorator('poTypeDesc')(<span>{headerInfo.poTypeDesc}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.poNum`).d('订单号')}
            >
              {getFieldDecorator('displayPoNum')(<span>{headerInfo.displayPoNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.createTime`).d('创建时间')}
            >
              {getFieldDecorator('creationDate')(<span>{formatCreationDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem {...EDIT_FORM_ITEM_LAYOUT} label={intl.get(`entity.company.tag`).d('公司')}>
              {getFieldDecorator('companyName', { initialValue: headerInfo.companyName })(
                <span>{headerInfo.companyName}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.organization.class.ouFlag`).d('业务实体')}
            >
              {getFieldDecorator('ouName')(<span>{headerInfo.ouName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.supplier.tag`).d('供应商')}
            >
              {getFieldDecorator('supplierName')(<span>{headerInfo.supplierName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.organization.class.purchase`).d('采购组织')}
            >
              {getFieldDecorator('purchaseOrgName')(<span>{headerInfo.purchaseOrgName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.purchaser.tag`).d('采购员')}
            >
              {getFieldDecorator('agentName')(<span>{headerInfo.agentName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.currencyName`).d('币种')}
            >
              {getFieldDecorator('currencyCode', { initialValue: headerInfo.currencyCode })(
                <span>{headerInfo.currencyCode}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.totalAmountIncludingTax`).d('含税总金额')}
            >
              {getFieldDecorator('taxIncludeAmount')(
                <span>
                  {amountFinancialPrecision(
                    headerInfo.taxIncludeAmount,
                    financialPrecision,
                    headerInfo.poSourcePlatform
                  )}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.totalAmountExcludingTax`).d('不含税总金额')}
            >
              {getFieldDecorator('amount')(
                <span>
                  {amountFinancialPrecision(
                    headerInfo.amount,
                    financialPrecision,
                    headerInfo.poSourcePlatform
                  )}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.termsName`).d('付款条款')}
            >
              {getFieldDecorator('termsId', {
                initialValue: headerInfo.termsId,
              })(
                <Lov
                  code="SMDM.PAYMENT.TERM"
                  textValue={headerInfo.termsName}
                  queryParams={{ tenantId }}
                  disabled={this.isDisabledFields(headerInfo, 'termsId')}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.totalQuantity`).d('总数量')}
            >
              {getFieldDecorator('quantityTotal')(
                <span>{formatAumont(headerInfo.quantityTotal)}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.sourcePlatform`).d('来源平台')}
            >
              {getFieldDecorator('poSourcePlatform', {
                initialValue: headerInfo.poSourcePlatform,
              })(<span>{headerInfo.poSourcePlatformMeaning}</span>)}
            </FormItem>
          </Col>
          {headerInfo.originalPoNum && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl
                  .get(`sodr.quotePurchase.model.quotePurchase.originalPoNum`)
                  .d('原订单号')}
              >
                {getFieldDecorator('originalPoHeaderId')(<span>{headerInfo.originalPoNum}</span>)}
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
                    headerInfo.domesticTaxIncludeAmount,
                    domesticFinancialPrecision,
                    headerInfo.poSourcePlatform
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
                    headerInfo.domesticAmount,
                    domesticFinancialPrecision,
                    headerInfo.poSourcePlatform
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
                initialValue: headerInfo.supplierOrderTypeCode,
              })(<span>{headerInfo.supplierOrderTypeCode}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sodr.common.model.common.orderRemark`).d('订单摘要')}
            >
              {getFieldDecorator('remark', {
                initialValue: headerInfo.remark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(
                <TextArea
                  rows={2}
                  style={{ height: '56px' }}
                  disabled={this.isDisabledFields(headerInfo, 'headerRemark')}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        {/* <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.internalRemarks`)
                .d('备注（内部）')}
            >
              {getFieldDecorator('attributeLongtext1', {
                initialValue: headerInfo.attributeLongtext1,
              })(<TextArea rows={2}/>)}
            </FormItem>
          </Col>
        </Row> */}
      </Form>
    );
  }
}
