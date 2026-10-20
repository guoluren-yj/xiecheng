import React, { Component, Fragment } from 'react';
import { Form, Row, Col, Collapse, Icon, InputNumber, Input, DatePicker, Checkbox } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import { yesOrNoRender } from 'utils/renderer';
import moment from 'moment';

import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_3_LAYOUT,
  DEFAULT_DATE_FORMAT,
} from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import Lov from 'components/Lov';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';

import common from '@/routes/sbid/common.less';
import style from './Header.less';

const promptCode = 'ssrc.supplierBid';
const FormItem = Form.Item;
const { Panel } = Collapse;
const { TextArea } = Input;

const remarkFormLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

@formatterCollections({ code: ['ssrc.supplierQuotation'] })
export default class SectionFormInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: [`${props.biddingLine.bidLineItemId}`],
    };
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  render() {
    const {
      biddingLine,
      form = {},
      customizeForm,
      changeTaxId,
      quotationHeader,
      onChangeFreightFlag,
      doubleUnitFlag,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const { collapseKeys } = this.state;
    const { tenantId } = quotationHeader || {};
    const isUnTaxPriceFlag = (quotationHeader && quotationHeader.priceTypeCode) === 'NET_PRICE';
    return (
      <Form>
        <Collapse
          className="form-collapse"
          defaultActiveKey={collapseKeys}
          onChange={this.onCollapseChange}
        >
          <Panel
            showArrow={false}
            header={
              <Fragment>
                <h3>{intl.get(`${promptCode}.view.message.panel.itemLineInfo`).d('物品行信息')}</h3>
                <a>
                  {collapseKeys.includes(`${biddingLine.bidLineItemId}`)
                    ? intl.get(`hzero.common.button.up`).d('收起')
                    : intl.get(`hzero.common.button.expand`).d('展开')}
                </a>
                <Icon
                  type={collapseKeys.includes(`${biddingLine.bidLineItemId}`) ? 'up' : 'down'}
                />
              </Fragment>
            }
            key={`${biddingLine.bidLineItemId}`}
          >
            <Form>
              <Row gutter={48} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <UEDDisplayFormItem
                    label={intl.get(`${promptCode}.model.supplierBid.itemCode`).d('物料编码')}
                    value={biddingLine.itemCode}
                  />
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <UEDDisplayFormItem
                    label={intl.get(`${promptCode}.model.supplierBid.itemName`).d('物品描述')}
                    value={biddingLine.itemName}
                  />
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <UEDDisplayFormItem
                    label={intl.get(`${promptCode}.model.supplierBid.itemCategory`).d('物品分类')}
                    value={biddingLine.categoryName}
                  />
                </Col>
              </Row>
              <Row gutter={48} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <UEDDisplayFormItem
                    label={intl.get(`${promptCode}.model.supplierBid.unit`).d('单位')}
                    value={biddingLine.secondaryUomName}
                  />
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <UEDDisplayFormItem
                    label={intl.get(`${promptCode}.model.supplierBid.bidQuantity`).d('需求数量')}
                    value={biddingLine.secondaryQuantity}
                  />
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <UEDDisplayFormItem
                    label={intl.get(`${promptCode}.model.supplierBid.taxInclude`).d('是否含税')}
                    value={yesOrNoRender(biddingLine.taxIncludedFlag)}
                  />
                </Col>
              </Row>
              {doubleUnitFlag ? (
                <Row gutter={48} className="read-row">
                  <Col {...FORM_COL_3_LAYOUT}>
                    <UEDDisplayFormItem
                      label={intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位')}
                      value={biddingLine.uomName}
                    />
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <UEDDisplayFormItem
                      label={intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量')}
                      value={biddingLine.bidQuantity}
                    />
                  </Col>
                </Row>
              ) : null}
              <Row gutter={48} className="read-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <UEDDisplayFormItem
                    label={intl.get(`${promptCode}.model.supplierBid.demandDate`).d('需求日期')}
                    value={
                      biddingLine.demandDate &&
                      moment(biddingLine.demandDate).format(DEFAULT_DATE_FORMAT)
                    }
                  />
                </Col>
              </Row>
            </Form>
          </Panel>
        </Collapse>
        <Row style={{ fontSize: '15px', marginLeft: '13px' }}>
          <span className={style.labelCol}>
            {intl.get(`${promptCode}.model.supplierBid.quoteInformation`).d('投标信息')}
          </span>
        </Row>
        <div className={common['padding-16']}>
          {customizeForm(
            {
              code: 'SSRC.TENDER_HALL_UPDATE.TNDER.FORM.INFO',
              form: this.props.form,
              dataSource: biddingLine,
            },
            <Form>
              <Row
                gutter={64}
                className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
              >
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.unitPrice`).d('单价')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('currentQuotationPrice', {
                      initialValue: biddingLine.currentQuotationPrice,
                      rules: [
                        {
                          required: form.getFieldValue('abandonedFlag') !== 1 && !isUnTaxPriceFlag,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${promptCode}.model.supplierBid.unitPrice`).d('单价'),
                          }),
                        },
                      ],
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        currency={biddingLine.quotationCurrencyCode}
                        min="0"
                        style={{ width: '100%' }}
                        max="99999999999999999999"
                        disabled={form.getFieldValue('abandonedFlag') === 1 || isUnTaxPriceFlag}
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.supplierBid.deliveryDay`)
                      .d('供货周期(天)')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('currentDeliveryCycle', {
                      initialValue: biddingLine.currentDeliveryCycle,
                      // rules: [
                      //   {
                      //     max: 100,
                      //     message: intl.get('hzero.common.validation.max', {
                      //       max: 100,
                      //     }),
                      //   },
                      // ],
                    })(
                      <InputNumber
                        disabled={form.getFieldValue('abandonedFlag') === 1}
                        precision={0}
                        min={0}
                        style={{ width: '100%' }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.proPayDate`).d('承诺交付日期')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('currentPromisedDate', {
                      initialValue:
                        biddingLine.currentPromisedDate &&
                        moment(biddingLine.currentPromisedDate, getDateFormat()),
                      rules: [
                        {
                          required: form.getFieldValue('abandonedFlag') !== 1,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.supplierBid.proDeliveryDate`)
                              .d('承诺交货日期'),
                          }),
                        },
                      ],
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        format={getDateFormat()}
                        placeholder={null}
                        disabled={form.getFieldValue('abandonedFlag') === 1}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={64}
                className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
              >
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.supplierBid.currentQuotationQuantity`)
                      .d('可供数量')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('currentQuotationQuantity', {
                      initialValue: biddingLine.currentQuotationQuantity,
                      rules: [
                        {
                          required:
                            form.getFieldValue('abandonedFlag') !== 1 &&
                            biddingLine.quantityChangeFlag,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.supplierBid.currentQuotationQuantity`)
                              .d('可供数量'),
                          }),
                        },
                      ],
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        uom={biddingLine.uomId}
                        disabled={
                          form.getFieldValue('abandonedFlag') === 1 ||
                          biddingLine.quantityChangeFlag === 0
                        }
                        style={{ width: '100%' }}
                        max="99999999999999999999"
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.modifyTheRate`).d('税率(%)')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('taxId', {
                      initialValue: biddingLine.taxId,
                      rules: [
                        {
                          required:
                            form.getFieldValue('abandonedFlag') !== 1 &&
                            biddingLine.taxChangeFlag &&
                            biddingLine.taxIncludedFlag,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.supplierBid.modifyTheRate`)
                              .d('税率(%)'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        code="SMDM.TAX"
                        style={{ width: '98%' }}
                        textValue={biddingLine.taxRate}
                        disabled={
                          biddingLine.taxChangeFlag === 0 ||
                          biddingLine.taxIncludedFlag === 0 ||
                          form.getFieldValue('abandonedFlag') === 1
                        }
                        onChange={(value, dataList) => changeTaxId(value, dataList)}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.netPrice`).d('单价(不含税)')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('netPrice', {
                      initialValue: biddingLine.netPrice,
                      rules: [
                        {
                          required: form.getFieldValue('abandonedFlag') !== 1 && isUnTaxPriceFlag,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.supplierBid.netPrice`)
                              .d('单价(不含税)'),
                          }),
                        },
                      ],
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        currency={biddingLine.quotationCurrencyCode}
                        min="0"
                        disabled={form.getFieldValue('abandonedFlag') === 1 || !isUnTaxPriceFlag}
                        style={{ width: '100%' }}
                        max="99999999999999999999"
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={64}
                className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
              >
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.netAmount`).d('不含税总金额')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('netAmount', {
                      initialValue: biddingLine.netAmount,
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        financial={biddingLine.quotationCurrencyCode}
                        min="0"
                        disabled
                        style={{ width: '100%' }}
                        max="99999999999999999999"
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.taxAmount`).d('税额')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('taxAmount', {
                      initialValue: biddingLine.taxAmount,
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        financial={biddingLine.quotationCurrencyCode}
                        min="0"
                        disabled
                        style={{ width: '100%' }}
                        max="99999999999999999999"
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.supplierBid.totalAmount`).d('总金额')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('totalAmount', {
                      initialValue: biddingLine.totalAmount,
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        financial={biddingLine.quotationCurrencyCode}
                        min="0"
                        disabled
                        style={{ width: '100%' }}
                        max="99999999999999999999"
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={64}
                className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
              >
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.supplierBid.freightIncludedFlag`)
                      .d('是否含运费')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('freightIncludedFlag', {
                      initialValue: biddingLine.freightIncludedFlag,
                    })(
                      <Checkbox
                        disabled={quotationHeader.freightUpdatableFlag === 0}
                        checkedValue={1}
                        unCheckedValue={0}
                        onChange={(value) => onChangeFreightFlag(value, form)}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`${promptCode}.model.supplierBid.freightAmount`).d('运费')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator(`freightAmount`, {
                      initialValue: biddingLine.freightAmount,
                    })(
                      <PrecisionInputNumber
                        type="hzero"
                        financial={biddingLine.quotationCurrencyCode}
                        disabled={form.getFieldValue('freightIncludedFlag') === 1}
                        style={{ width: '100%' }}
                        min="0"
                        max="99999999999999999999"
                        queryPrecisionParams={{
                          purTenantId: tenantId,
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row
                gutter={48}
                className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
              >
                <Col {...FORM_COL_2_3_LAYOUT}>
                  <FormItem label={intl.get('hzero.common.remark').d('备注')} {...remarkFormLayout}>
                    {getFieldDecorator('currentQuotationRemark', {
                      initialValue: biddingLine.currentQuotationRemark,
                    })(<TextArea rows={2} disabled={form.getFieldValue('abandonedFlag') === 1} />)}
                  </FormItem>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item style={{ display: 'none' }}>
                    {getFieldDecorator('taxRate', { initialValue: biddingLine.taxRate })(<div />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={48}
                className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
              >
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.supplierBid.quotationStartValidTime`)
                      .d('报价有效日期从')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('quotationExpiryDateFrom', {
                      initialValue:
                        biddingLine.quotationExpiryDateFrom &&
                        moment(biddingLine.quotationExpiryDateFrom, getDateFormat()),
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        format={getDateFormat()}
                        placeholder={null}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.supplierBid.quotationEndValidTime`)
                      .d('报价有效日期至')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('quotationExpiryDateTo', {
                      initialValue:
                        biddingLine.quotationExpiryDateTo &&
                        moment(biddingLine.quotationExpiryDateTo, getDateFormat()),
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        format={getDateFormat()}
                        placeholder={null}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          )}
        </div>
      </Form>
    );
  }
}
