/**
 * inquiryHall - 寻源服务/询价大厅-维护-寻源规则form
 * @date: 2020-04-23
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Row, Col, InputNumber, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import QuotationDirectLable from '@/routes/ssrc/components/QuotationDirectLable';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import Checkbox from 'components/Checkbox';

const { Option, OptGroup } = Select;

export default class RfxRuleForm extends React.Component {
  // select-grouped-render
  @Bind()
  buildGroupSelectOption(
    list = [],
    groupKey = 'id',
    groupLabel = 'name',
    keyName = groupKey,
    labelName = groupLabel
  ) {
    const options =
      isArray(list) &&
      list.map((item) => {
        const { children = [] } = item;
        return (
          <OptGroup key={item[groupKey]} label={item[groupLabel]}>
            {children &&
              children.map((child) => {
                return (
                  <Option key={child[keyName]} value={child[keyName]}>
                    {child[labelName]}
                  </Option>
                );
              })}
          </OptGroup>
        );
      });
    return options;
  }

  // 获取初始化值
  @Bind()
  getInitialValue(value, key = 'id') {
    let newValue = value || null;
    const correctValueFlag = value && !isEmpty(value) && typeof value === 'string';
    if (correctValueFlag) {
      const parsedValue = JSON.parse(value);
      newValue = parsedValue.map((item = {}) => {
        return item[key] || null;
      });
    }
    return newValue;
  }

  render() {
    const {
      form = {},
      header = {},
      code: {
        sourceMethod = [],
        quotationType = [],
        quotationScope = [],
        auctionDirection = [],
        sourceCategory = [],
        organizationType = [],
      },
      LONG_LABEL_FORM_ITEM_LAYOUT,
      biddingRuleForm = () => {},
      changeTemplateId = () => {},
      openBidholder = () => {},
      onChangeAD = () => {},
      customizeForm = () => {},
      changeSourceMethod = () => {},
      changeOrganizationType = () => {},
      handleChangeIndustry = () => {},
      FormItem,
      industry = [],
      industryCategory = [],
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    const industryOptions = this.buildGroupSelectOption(industry, 'industryId', 'industryName');
    const industryCategoryOptions = this.buildGroupSelectOption(
      industryCategory,
      'industryId',
      'industryName',
      'categoryId',
      'categoryName'
    );

    const initialIndustryValue = this.getInitialValue(header.industryData, 'industryId');
    const initialIndustryCategoryValue = this.getInitialValue(
      header.industryCategoryData,
      'categoryId'
    );

    return customizeForm(
      { code: 'SSRC.INQUIRY_HALL_EDIT.RFX.RULE', form, dataSource: header },
      <Form className="writable-row-custom">
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('templateId', {
                initialValue: header.templateId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`)
                        .d('寻源模板'),
                    }),
                  },
                ],
              })(
                <Lov
                  allowClear={false}
                  code="SSRC.TEMPLATE_NAME"
                  onChange={(val, record) => changeTemplateId(val, record)}
                  textValue={header.templateName}
                  queryParams={{
                    sourceCategory: 'RFX',
                    scoreTemplateScoreType: header.templateScoreType,
                    sourceProjectId: header.sourceProjectId,
                  }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceCategory', {
                initialValue: header.sourceCategory,
              })(
                <Select allowClear disabled>
                  {sourceCategory &&
                    sourceCategory.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethod', {
                initialValue: header.sourceMethod,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`)
                        .d('寻源方式'),
                    }),
                  },
                ],
              })(
                <Select onChange={changeSourceMethod} allowClear>
                  {sourceMethod &&
                    sourceMethod.map((item) => (
                      <Option
                        key={item.value}
                        value={item.value}
                        disabled={
                          (getFieldValue('matchRestrictFlag') && item.value !== 'INVITE') ||
                          (getFieldValue('rankRule') === 'WEIGHT_PRICE' && item.value !== 'INVITE')
                        }
                      >
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
              {getFieldDecorator('matchRestrictFlag', { initialValue: header.matchRestrictFlag })}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.sourceTemplate.model.template.qualificationType').d('资格审查')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('qualificationType', {
                initialValue: header.qualificationType,
              })(<span>{header.qualificationTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.sourceTemplate.model.template.expertEvaluation').d('专家评分')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('expertScoreType', {
                initialValue: header.expertScoreType,
              })(<span>{header.expertScoreTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.sourceTemplate.model.template.openBidOrder').d('评标步制')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('openBidOrder', {
                initialValue: header.openBidOrder,
              })(<span>{header.openBidOrderMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.sourceTemplate.model.template.bidRuleType').d('标书规则')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidRuleType', {
                initialValue: header.bidRuleType,
              })(<span>{header.bidRuleTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationType', {
                initialValue: header.sourceCategory === 'RFA' ? 'ONLINE' : header.quotationType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.quotationType`)
                        .d('报价方式'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {quotationType &&
                    quotationType.map((item) => (
                      <Option
                        key={item.value}
                        value={item.value}
                        disabled={
                          getFieldValue('sourceCategory') === 'RFA' && item.value === 'ON_OFF'
                        }
                      >
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationScope`).d('报价范围')}
              {...{ ...EDIT_FORM_ITEM_LAYOUT }}
            >
              {getFieldDecorator('quotationScope', {
                initialValue: header.quotationScope,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.quotationScope`)
                        .d('报价范围'),
                    }),
                  },
                ],
              })(
                <Select>
                  {quotationScope.map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={<QuotationDirectLable />} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('auctionDirection', {
                initialValue: header.auctionDirection,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.biddingDirection`)
                        .d('报价方向'),
                    }),
                  },
                ],
              })(
                <Select allowClear onChange={onChangeAD}>
                  {auctionDirection &&
                    auctionDirection.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.sourceTemplate.model.template.quotationValidityFrom')
                .d('报价有效期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('validDateInputType', {
                initialValue: header.validDateInputType,
              })(<span>{header.validDateInputTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.sourceTemplate.model.template.taxChangeFlag')
                .d('允许供应商修改税率')}
              {...LONG_LABEL_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('taxChangeFlag', {
                initialValue: header.taxChangeFlag,
              })(<Checkbox disabled checked={header.taxChangeFlag} />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.sourceTemplate.model.template.quantityChangeFlag')
                .d('允许供应商修改可供数量')}
              {...LONG_LABEL_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quantityChangeFlag', {
                initialValue: header.quantityChangeFlag,
              })(<Checkbox disabled checked={header.quantityChangeFlag} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.sourceTemplate.model.template.continuousQuotationFlag')
                .d('允许供应商连续报价')}
              {...LONG_LABEL_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('continuousQuotationFlag', {
                initialValue: header.continuousQuotationFlag,
              })(<Checkbox disabled checked={header.continuousQuotationFlag} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.sourceTemplate.model.template.diyLadderQuotationFlags')
                .d('允许供应商自定义阶梯报价')}
              {...LONG_LABEL_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('diyLadderQuotationFlag', {
                initialValue: header.diyLadderQuotationFlag,
              })(<Checkbox disabled checked={header.diyLadderQuotationFlag} />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.allowMuitiCurQuo`)
                .d('允许多币种报价')}
              {...{ ...EDIT_FORM_ITEM_LAYOUT }}
            >
              {getFieldDecorator('multiCurrencyFlag', {
                initialValue: header.multiCurrencyFlag || 0,
              })(<Checkbox />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.common.model.common.allowChangePayWayFlag')
                .d('是否允许供应商修改付款条款&方式')}
              {...{ ...EDIT_FORM_ITEM_LAYOUT }}
            >
              {getFieldDecorator('paymentTermFlag', {
                initialValue: header.paymentTermFlag || 0,
              })(<Checkbox />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={biddingRuleForm('minQuotedSupplier')} {...LONG_LABEL_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('minQuotedSupplier', {
                initialValue: header.minQuotedSupplier || 1,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('ssrc.inquiryHall.model.inquiryHall.minQuotedSupplier')
                        .d('最少报价供应商数'),
                    }),
                  },
                ],
              })(<InputNumber style={{ width: '100%' }} precision={0} min={1} max={99999999999} />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.organizationType`)
                .d('境内外关系')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('organizationType', {
                initialValue: header.organizationType,
              })(
                <Select
                  onChange={changeOrganizationType}
                  disabled={form.getFieldValue('sourceMethod') === 'INVITE'}
                  allowClear
                >
                  {organizationType.map((item) => (
                    <Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.industryData`).d('行业类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('industryData', {
                initialValue: initialIndustryValue,
              })(
                <Select
                  allowClear
                  mode="multiple"
                  optionFilterProp="children"
                  onChange={handleChangeIndustry}
                  notFoundContent={intl
                    .get('ssrc.inquiryHall.view.message.selectOrgTypeDataFirst')
                    .d('请先选择境内外关系')}
                  disabled={form.getFieldValue('sourceMethod') === 'INVITE'}
                >
                  {industryOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.industryCategoryData`)
                .d('主营品类')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('industryCategoryData', {
                initialValue: initialIndustryCategoryValue,
              })(
                <Select
                  allowClear
                  mode="multiple"
                  notFoundContent={intl
                    .get('ssrc.inquiryHall.view.message.selectIndustryDataFirst')
                    .d('请先选择行业类型')}
                  disabled={form.getFieldValue('sourceMethod') === 'INVITE'}
                  optionFilterProp="children"
                >
                  {industryCategoryOptions}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={biddingRuleForm('sealedQuotation')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('sealedQuotationFlag', {
                initialValue:
                  header.sealedQuotationFlag || header.sealedQuotationFlag === 0
                    ? header.sealedQuotationFlag
                    : 0,
              })(<Switch disabled={header.fastBidding} />)}
              {getFieldValue('openerFlag') === 1 && getFieldValue('sealedQuotationFlag') === 1 ? (
                <a onClick={openBidholder} style={{ marginLeft: '8px' }}>
                  {intl.get(`ssrc.inquiryHall.view.message.button.defineOpener`).d('定义开标人')}
                </a>
              ) : (
                ''
              )}
              {getFieldDecorator('openerFlag', {
                initialValue: header.openerFlag,
              })(<div />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
