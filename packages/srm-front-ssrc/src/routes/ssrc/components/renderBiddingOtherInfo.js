import React from 'react';
import { Form, Row, Col } from 'hzero-ui';

import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

import Checkbox from 'components/Checkbox';
import { numberSeparatorRender } from '@/utils/renderer';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const renderBiddingOtherInfo = (
  otherInfoProps,
  dataSource,
  readOnly,
  openInquiryGroup,
  openBidholder = () => {}
) => {
  const { form = {}, customizeForm = () => {} } = otherInfoProps;
  const { getFieldDecorator } = form;
  const day = Math.floor(dataSource.startQuotationRunningDuration / 1440);
  const hour =
    day > 0
      ? Math.floor((dataSource.startQuotationRunningDuration - day * 1440) / 60)
      : Math.floor(dataSource.startQuotationRunningDuration / 60);
  let minute =
    hour > 0 || day > 0
      ? Math.floor(dataSource.startQuotationRunningDuration - day * 1440 - hour * 60)
      : Math.floor(dataSource.startQuotationRunningDuration);
  minute = minute.toFixed(2);
  return dataSource.sourceCategory && dataSource.sourceCategory === 'RFA'
    ? customizeForm(
        {
          code: 'SSRC.QUOTATION_CONTROLLER_DETAIL.OTHER',
          form,
          dataSource,
        },
      <Form className="writable-row-custom">
        <Row gutter={48} className={readOnly ? 'read-row' : 'writable-row'}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始')}
              {...formLayout}
            >
              {getFieldDecorator('startFlag', {
                  initialValue: dataSource.startFlag,
                })(<span>{yesOrNoRender(dataSource.startFlag)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTime`)
                  .d('报价开始时间')}
              {...formLayout}
            >
              {getFieldDecorator('quotationStartDate', {
                  initialValue: dataSource.quotationStartDate,
                })(<span>{dataSource.quotationStartDate}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadline`)
                  .d('报价截止时间')}
              {...formLayout}
            >
              {getFieldDecorator('quotationEndDate', {
                  initialValue: dataSource.quotationEndDate,
                })(<span>{dataSource.quotationEndDate}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className={readOnly ? 'read-row' : ''}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingType`).d('寻源类型')}
              {...formLayout}
            >
              {getFieldDecorator('sourceType', {
                  initialValue: dataSource.sourceType,
                })(<span>{dataSource.sourceTypeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式')}
              {...formLayout}
            >
              {getFieldDecorator('paymentTypeId', {
                  initialValue: dataSource.paymentTypeId,
                })(<span>{dataSource.paymentTypeName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCategory`).d('价格类型')}
              {...formLayout}
            >
              {getFieldDecorator('priceCategory', {
                  initialValue: dataSource.priceCategory,
                })(<span>{dataSource.priceCategoryMeaning}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className={readOnly ? 'read-row' : ''}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`).d('密封报价')}
              {...formLayout}
            >
              {getFieldDecorator('sealedQuotationFlag', {
                  initialValue: dataSource.sealedQuotationFlag,
                })(
                  <span>
                    {yesOrNoRender(dataSource.sealedQuotationFlag)}
                    {dataSource.openerFlag && dataSource.sealedQuotationFlag ? (
                      <span style={{ paddingLeft: '8px' }}>
                        <a onClick={() => openBidholder()}>
                          {intl
                            .get(`ssrc.inquiryHall.view.message.button.viewOpener`)
                            .d('查看开标人')}
                        </a>
                      </span>
                    ) : (
                      ''
                    )}
                  </span>
                )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationScope`).d('报价范围')}
              {...formLayout}
            >
              {getFieldDecorator('quotationScope', {
                  initialValue: dataSource.quotationScope,
                })(<span>{dataSource.quotationScopeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.allowMuitiCurQuo`)
                  .d('允许多币种报价')}
              {...formLayout}
            >
              {getFieldDecorator('multiCurrencyFlag', {
                  initialValue: dataSource.multiCurrencyFlag,
                })(<Checkbox checked={dataSource.multiCurrencyFlag} disabled />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className={readOnly ? 'read-row' : ''}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan').d('保证金(元)')}
              {...formLayout}
            >
              {getFieldDecorator('bidBond', {
                  initialValue: dataSource.bidBond,
                })(
                  <span>
                    {dataSource.bidBond === 0 || dataSource.bidBond === null
                      ? intl.get('ssrc.common.view.gratis').d('免费')
                      : numberSeparatorRender(dataSource.bidBond) || null}
                  </span>
                )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.inquiryGroup`).d('寻源小组')}
              {...formLayout}
            >
              {getFieldDecorator('inquiryGroup', {
                  initialValue: dataSource.inquiryGroup,
                })(
                  <a onClick={openInquiryGroup}>{intl.get('hzero.common.button.edit').d('编辑')}</a>
                )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.sourceAnnouncementFlag`)
                  .d('创建寻源公告')}
              {...formLayout}
            >
              {getFieldDecorator('sourceAnnouncementFlag', {
                  initialValue: dataSource.sourceAnnouncementFlag,
                })(<span>{yesOrNoRender(dataSource.sourceAnnouncementFlag)}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className={readOnly ? 'read-row' : ''}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}
              {...formLayout}
            >
              {getFieldDecorator('roundNumber', {
                  initialValue: dataSource.quotationRoundNumber
                    ? dataSource.quotationRoundNumber
                    : 1,
                })(
                  <span>
                    {dataSource.quotationRoundNumber ? dataSource.quotationRoundNumber : 1}
                  </span>
                )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
      )
    : customizeForm(
        {
          code: 'SSRC.QUOTATION_CONTROLLER_DETAIL.OTHER.INFO',
          form,
          dataSource,
        },
      <Form className="writable-row-custom">
        <Row gutter={48} className={readOnly ? 'read-row' : ''}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始')}
              {...formLayout}
            >
              {getFieldDecorator('startFlag', {
                  initialValue: dataSource.startFlag,
                })(<span>{yesOrNoRender(dataSource.startFlag)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTime`)
                  .d('报价开始时间')}
              {...formLayout}
            >
              {getFieldDecorator('quotationStartDate', {
                  initialValue: dataSource.quotationStartDate,
                })(<span>{dataSource.quotationStartDate}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadline`)
                  .d('报价截止时间')}
              {...formLayout}
            >
              {getFieldDecorator('quotationEndDate', {
                  initialValue: dataSource.quotationEndDate,
                })(<span>{dataSource.quotationEndDate}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className={readOnly ? 'read-row' : ''}>
          <Col span={8}>
            <FormItem
              label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.quotRunningDuration`)
                  .d('报价运行时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('startQuotationRunningDuration', {
                  initialValue: dataSource.startQuotationRunningDuration,
                })(
                  <span>
                    {day}
                    {intl.get('hzero.common.date.unit.day').d('天')}
                    {hour}
                    {intl.get('hzero.common.date.unit.hours').d('小时')}
                    {minute}
                    {intl.get('ssrc.quoController.model.quoController.minute').d('分钟')}
                  </span>
                )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingType`).d('寻源类型')}
              {...formLayout}
            >
              {getFieldDecorator('sourceType', {
                  initialValue: dataSource.sourceType,
                })(<span>{dataSource.sourceTypeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式')}
              {...formLayout}
            >
              {getFieldDecorator('paymentTypeId', {
                  initialValue: dataSource.paymentTypeId,
                })(<span>{dataSource.paymentTypeName}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className={readOnly ? 'read-row' : ''}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCategory`).d('价格类型')}
              {...formLayout}
            >
              {getFieldDecorator('priceCategory', {
                  initialValue: dataSource.priceCategory,
                })(<span>{dataSource.priceCategoryMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`).d('密封报价')}
              {...formLayout}
            >
              {getFieldDecorator('sealedQuotationFlag', {
                  initialValue: dataSource.sealedQuotationFlag,
                })(
                  <span>
                    {yesOrNoRender(dataSource.sealedQuotationFlag)}
                    {dataSource.openerFlag && dataSource.sealedQuotationFlag ? (
                      <span style={{ paddingLeft: '8px' }}>
                        <a onClick={() => openBidholder()}>
                          {intl
                            .get(`ssrc.inquiryHall.view.message.button.viewOpener`)
                            .d('查看开标人')}
                        </a>
                      </span>
                    ) : (
                      ''
                    )}
                  </span>
                )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationScope`).d('报价范围')}
              {...formLayout}
            >
              {getFieldDecorator('quotationScope', {
                  initialValue: dataSource.quotationScope,
                })(<span>{dataSource.quotationScopeMeaning}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className={readOnly ? 'read-row' : ''}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.allowMuitiCurQuo`)
                  .d('允许多币种报价')}
              {...formLayout}
            >
              {getFieldDecorator('multiCurrencyFlag', {
                  initialValue: dataSource.multiCurrencyFlag,
                })(<Checkbox checked={dataSource.multiCurrencyFlag} disabled />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan').d('保证金(元)')}
              {...formLayout}
            >
              {getFieldDecorator('bidBond', {
                  initialValue: dataSource.bidBond,
                })(
                  <span>
                    {dataSource.bidBond === 0 || dataSource.bidBond === null
                      ? intl.get('ssrc.common.view.gratis').d('免费')
                      : numberSeparatorRender(dataSource.bidBond) || null}
                  </span>
                )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.inquiryGroup`).d('寻源小组')}
              {...formLayout}
            >
              {getFieldDecorator('inquiryGroup', {
                  initialValue: dataSource.inquiryGroup,
                })(
                  <a onClick={openInquiryGroup}>{intl.get('hzero.common.button.edit').d('编辑')}</a>
                )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className={readOnly ? 'read-row' : ''}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.sourceAnnouncementFlag`)
                  .d('创建寻源公告')}
              {...formLayout}
            >
              {getFieldDecorator('sourceAnnouncementFlag', {
                  initialValue: dataSource.sourceAnnouncementFlag,
                })(<span>{yesOrNoRender(dataSource.sourceAnnouncementFlag)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次')}
              {...formLayout}
            >
              {getFieldDecorator('roundNumber', {
                  initialValue: dataSource.quotationRoundNumber
                    ? dataSource.quotationRoundNumber
                    : 1,
                })(
                  <span>
                    {dataSource.quotationRoundNumber ? dataSource.quotationRoundNumber : 1}
                  </span>
                )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
      );
};

export default renderBiddingOtherInfo;
