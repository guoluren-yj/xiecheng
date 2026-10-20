/**
 * inquiryHall - 寻源服务/询价大厅-维护-基本信息form
 * @date: 2020-04-23
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Row, Col, Input, InputNumber, Tooltip, Select, DatePicker } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import { getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_3,
} from 'utils/constants';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import InquiryGroupModal from '../../components/InquiryGroupModal';

const { Option } = Select;

export default class BasicHeaderForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inquiryGroupVisibleFlag: false,
    };
  }

  /**
   * 寻源小组打开
   */
  @Bind()
  openInquiryGroup() {
    this.setState({
      inquiryGroupVisibleFlag: true,
    });
  }

  /**
   * 寻源小组关闭
   */
  @Bind()
  closeInquiryGroup() {
    this.setState({
      inquiryGroupVisibleFlag: false,
    });
  }

  render() {
    const { inquiryGroupVisibleFlag } = this.state;
    const {
      organizationId,
      form = {},
      header = {},
      code: { priceCategory = [], sourceType = [] },
      customizeForm = () => {},
      changeCompany = () => {},
      bidBoundFormatter = () => {},
      changeStartFlag = () => {},
      handleEndOpenChange = () => {},
      changeQuoteDay = () => {},
      changeQuoteHour = () => {},
      changeQuoteMinute = () => {},
      endOpen = false,
      FormItem,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    const quoteDay = header.startQuotationRunningDuration
      ? Math.floor(header.startQuotationRunningDuration / 1440)
      : header.startQuotationRunningDuration;
    const quoteHour =
      quoteDay > 0
        ? Math.floor((header.startQuotationRunningDuration - quoteDay * 1440) / 60)
        : header.startQuotationRunningDuration
        ? Math.floor(header.startQuotationRunningDuration / 60)
        : header.startQuotationRunningDuration;
    const quoteMinute =
      quoteHour > 0 || quoteDay > 0
        ? header.startQuotationRunningDuration - quoteDay * 1440 - quoteHour * 60
        : header.startQuotationRunningDuration;
    const openerChooseFlag =
      getFieldValue('openerFlag') === 1 && getFieldValue('sealedQuotationFlag') === 1;
    const inquiryGroupModalProps = {
      inquiryGroupVisibleFlag,
      closeInquiryGroup: this.closeInquiryGroup,
      rfxHeaderId: header.rfxHeaderId,
      openerChooseFlag,
      header,
    };
    return (
      <React.Fragment>
        {customizeForm(
          { code: 'SSRC.INQUIRY_HALL.EDIT_HEADER', form, dataSource: header },
          <Form className="writable-row-custom">
            <Row gutter={48} className="writable-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.RFXNo.`).d('RFX单号')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('rfxNum', {
                    initialValue: header.rfxNum,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitle`)
                    .d('询价单标题')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('rfxTitle', {
                    initialValue: header.rfxTitle && header.rfxTitle.trim(),
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitle`)
                            .d('询价单标题'),
                        }),
                      },
                      {
                        max: 150,
                        message: intl.get('hzero.common.validation.max', {
                          max: 150,
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.common.company').d('公司')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('companyId', {
                    initialValue: header.companyId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('ssrc.common.company').d('公司'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      textValue={header.companyName}
                      onChange={(val, record) => changeCompany(val, record, header)}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`)
                    .d('采购组织名称')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('purOrganizationId', {
                    initialValue: header.purOrganizationId,
                  })(<Lov code="SPFM.USER_AUTH.PURORG" textValue={header.purOrganizationName} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('unitId', {
                    initialValue: header.unitId,
                  })(
                    <Lov
                      code="SPRM.USER_DEPARTMENT"
                      textValue={header.unitName}
                      disabled={!getFieldValue('companyId')}
                      queryParams={{
                        tenantId: organizationId,
                        companyId: getFieldValue('companyId'),
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.createdUnitName`)
                    .d('创建人部门')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('createdUnitName', {
                    initialValue: header.createdUnitName,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('budgetAmount', {
                    initialValue: header.budgetAmount,
                    rules: [
                      {
                        required: false, // HACK OVERRIDE CUXTIMIZEFORM
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      financial={header.currencyCode}
                      style={{ width: '100%' }}
                      min="0"
                      max="99999999999999999999"
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('currencyCode', {
                    initialValue: header.currencyCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
                        }),
                      },
                    ],
                  })(<Lov code="SMDM.EXCHANGE_RATE.CURRENCY" textValue={header.currencyCode} />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`)
                    .d('采购员')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('purchaserId', {
                    initialValue: header.purchaserId,
                  })(
                    <Lov
                      code="SPFM.USER_AUTH.PURCHASE_AGENT"
                      textValue={header.purchaserName}
                      queryParams={{ organizationId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingType`).d('寻源类型')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sourceType', {
                    initialValue: header.sourceType,
                  })(
                    <Select allowClear disabled>
                      {sourceType &&
                        sourceType.map((item) => (
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
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('paymentTypeId', {
                    initialValue: header.paymentTypeId,
                  })(<Lov textValue={header.paymentTypeName} code="SMDM.PAYMENTTYPE" />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('paymentTermId', {
                    initialValue: header.paymentTermId,
                  })(<Lov textValue={header.paymentTermName} code="SMDM.PAYMENT.TERM" />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('startFlag', {
                    initialValue: header.preQualificationFlag ? 0 : header.startFlag,
                  })(
                    <Switch
                      onChange={changeStartFlag}
                      disabled={header.preQualificationFlag || header.fastBidding}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTime`)
                    .d('报价开始时间')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('quotationStartDate', {
                    initialValue: header.quotationStartDate && moment(header.quotationStartDate),
                    rules: [
                      {
                        required: !getFieldValue('startFlag') && !header.fastBidding,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTime`)
                            .d('报价开始时间'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder=""
                      showTime={{
                        defaultValue: moment('00:00:00', 'HH:mm:ss'),
                      }}
                      format={getDateTimeFormat()}
                      disabled={getFieldValue('startFlag') || header.fastBidding}
                      disabledDate={(currentDate) => moment(new Date()).isAfter(currentDate, 'day')}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadline`)
                    .d('报价截止时间')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('quotationEndDate', {
                    initialValue: header.quotationEndDate && moment(header.quotationEndDate),
                    rules: [
                      {
                        required:
                          getFieldValue('sourceCategory') === 'RFQ' &&
                          getFieldValue('quotationEndDateFlag') === 1 &&
                          !getFieldValue('startFlag') &&
                          // !getFieldValue('startQuotationRunningDuration') &&
                          !header.fastBidding,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadline`)
                            .d('报价截止时间'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      style={{ width: '100%' }}
                      open={endOpen}
                      onOpenChange={handleEndOpenChange}
                      placeholder=""
                      disabled={
                        // !(
                        //   getFieldValue('sourceCategory') === 'RFQ' &&
                        //   getFieldValue('quotationEndDateFlag') === 1
                        // ) ||
                        // getFieldValue('startQuotationRunningDuration') ||
                        getFieldValue('sourceCategory') !== 'RFQ' ||
                        getFieldValue('quotationEndDateFlag') === 0 ||
                        getFieldValue('startFlag') ||
                        header.fastBidding
                      }
                      showTime={{
                        defaultValue: moment('00:00:00', 'HH:mm:ss'),
                      }}
                      format={getDateTimeFormat()}
                    />
                  )}
                  {getFieldDecorator('quotationEndDateFlag', {
                    initialValue: header.quotationEndDateFlag,
                  })(<div />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.quotRunningDuration`)
                    .d('报价运行时间')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                  className="multi-time-input-width-three"
                >
                  {getFieldDecorator('quoteDay', {
                    initialValue: quoteDay,
                    rules: [
                      {
                        required:
                          !getFieldValue('quoteDay') &&
                          !getFieldValue('quoteHour') &&
                          !getFieldValue('quoteMinute') &&
                          getFieldValue('startFlag') &&
                          getFieldValue('sourceCategory') !== 'RFA' &&
                          getFieldValue('quotationEndDateFlag') &&
                          !header.fastBidding,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.quotRunningDuration`)
                            .d('报价运行时间'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      placeholder={intl.get('hzero.common.date.unit.day').d('天')}
                      onChange={(value) => changeQuoteDay(value)}
                      min={0}
                      max={1000}
                      precision={0}
                      disabled={
                        getFieldValue('quotationEndDate') ||
                        getFieldValue('sourceCategory') === 'RFA' ||
                        !getFieldValue('quotationEndDateFlag') ||
                        header.fastBidding
                      }
                    />
                  )}
                  {getFieldDecorator('quoteHour', {
                    initialValue: quoteHour,
                    rules: [
                      {
                        required:
                          !getFieldValue('quoteDay') &&
                          !getFieldValue('quoteHour') &&
                          !getFieldValue('quoteMinute') &&
                          getFieldValue('startFlag') &&
                          getFieldValue('sourceCategory') !== 'RFA' &&
                          getFieldValue('quotationEndDateFlag') &&
                          !header.fastBidding,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hzero.common.date.unit.hours').d('小时'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      placeholder={intl.get('hzero.common.date.unit.hours').d('小时')}
                      onChange={(value) => changeQuoteHour(value)}
                      min={0}
                      max={24}
                      precision={0}
                      disabled={
                        getFieldValue('quotationEndDate') ||
                        getFieldValue('sourceCategory') === 'RFA' ||
                        !getFieldValue('quotationEndDateFlag') ||
                        header.fastBidding
                      }
                    />
                  )}
                  {getFieldDecorator('quoteMinute', {
                    initialValue: quoteMinute,
                    rules: [
                      {
                        required:
                          !getFieldValue('quoteDay') &&
                          !getFieldValue('quoteHour') &&
                          !getFieldValue('quoteMinute') &&
                          getFieldValue('startFlag') &&
                          getFieldValue('sourceCategory') !== 'RFA' &&
                          getFieldValue('quotationEndDateFlag') &&
                          !header.fastBidding,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hzero.common.date.unit.minutes').d('分钟'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      placeholder={intl.get('hzero.common.date.unit.minutes').d('分钟')}
                      onChange={(value) => changeQuoteMinute(value)}
                      min={0}
                      max={60}
                      precision={1}
                      disabled={
                        getFieldValue('quotationEndDate') ||
                        getFieldValue('sourceCategory') === 'RFA' ||
                        !getFieldValue('quotationEndDateFlag') ||
                        header.fastBidding
                      }
                    />
                  )}
                  {getFieldDecorator('startQuotationRunningDuration', {
                    initialValue: header.startQuotationRunningDuration,
                  })}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCategory`).d('价格类型')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('priceCategory', {
                    initialValue: header.priceCategory,
                  })(
                    <Select allowClear>
                      {priceCategory &&
                        priceCategory.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('roundNumber', {
                    initialValue: header.roundNumber,
                  })(<InputNumber disabled />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan').d('保证金(元)')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('bidBond', {
                    initialValue: header.bidBond,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan')
                            .d('保证金(元)'),
                        }),
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      financial={header.currencyCode}
                      min="0"
                      max="99999999999999999999"
                      formatter={bidBoundFormatter}
                      style={{ width: '100%' }}
                      step={0.01}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`ssrc.inquiryHall.model.inquiryHall.inquiryGroup`).d('寻源小组')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('inquiryGroup')(
                    <a onClick={this.openInquiryGroup} disabled={!header?.rfxHeaderId}>
                      {intl.get('hzero.common.button.edit').d('编辑')}
                    </a>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={
                    <Tooltip
                      title={intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.centralPurchaseMessage`)
                        .d('集采类寻源所确定的价格，在价格库将被标记为集采价格，以供商城使用。')}
                      placement="right"
                    >
                      {intl.get(`ssrc.inquiryHall.model.inquiryHall.centralPurFlag`).d('是否集采')}
                    </Tooltip>
                  }
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('centralPurchaseFlag', {
                    initialValue: header.centralPurchaseFlag || 0,
                  })(<Switch />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`hzero.common.remark`).d('备注')}
                  {...EDIT_FORM_ITEM_LAYOUT_COL_3}
                >
                  {getFieldDecorator('rfxRemark', {
                    initialValue: header.rfxRemark,
                    rules: [
                      {
                        max: 1000,
                        message: intl.get('hzero.common.validation.max', {
                          max: 1000,
                        }),
                      },
                    ],
                  })(<Input.TextArea style={{ marginLeft: '-4px' }} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col span={24}>
                <FormItem
                  label={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.remarkInside`)
                    .d('备注(内部)')}
                  {...EDIT_FORM_ITEM_LAYOUT_COL_3}
                >
                  {getFieldDecorator('internalRemark', {
                    rules: [
                      {
                        max: 1000,
                        message: intl.get('hzero.common.validation.max', {
                          max: 1000,
                        }),
                      },
                    ],
                    initialValue: header.internalRemark,
                  })(<Input.TextArea style={{ marginLeft: '-4px' }} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        {inquiryGroupVisibleFlag && <InquiryGroupModal {...inquiryGroupModalProps} />}
      </React.Fragment>
    );
  }
}
