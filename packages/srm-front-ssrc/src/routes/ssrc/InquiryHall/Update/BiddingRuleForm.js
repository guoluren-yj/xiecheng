// BiddingRuleForm
/**
 * inquiryHall - 寻源服务/询价大厅-维护-寻源规则form
 * @date: 2020-04-23
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Row, Col, InputNumber, Select, DatePicker } from 'hzero-ui';
import moment from 'moment';

import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import Checkbox from 'components/Checkbox';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

import styles from './index.less';

const { Option } = Select;

export default class RfxRuleForm extends React.Component {
  render() {
    const {
      form = {},
      header = {},
      code: { quotationOrderType = [], auctionRule = [], openRule = [], rankRules = [] },
      UEDDisplayFormItem,
      FormItem,
      biddingRuleForm = () => {},
      changeQuotationOrderType = () => {},
      changeDay = () => {},
      changeHour = () => {},
      changeMinute = () => {},
      onChangeAR = () => {},
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;

    const quotationRunningDuration = getFieldValue('quotationRunningDuration');

    const day = quotationRunningDuration
      ? Math.floor(quotationRunningDuration / 1440)
      : quotationRunningDuration;
    const hour =
      day > 0
        ? Math.floor((quotationRunningDuration - day * 1440) / 60)
        : quotationRunningDuration
        ? Math.floor(quotationRunningDuration / 60)
        : quotationRunningDuration;
    const minute =
      hour > 0 || day > 0
        ? Math.floor(quotationRunningDuration - day * 1440 - hour * 60)
        : quotationRunningDuration;

    return (
      <Form className="writable-row-custom">
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={biddingRuleForm('quotationOrderType')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('quotationOrderType', {
                initialValue: header.quotationOrderType,
                rules: [
                  {
                    required: getFieldValue('sourceCategory') === 'RFA',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.quotationOrderType`)
                        .d('报价次序'),
                    }),
                  },
                ],
              })(
                <Select allowClear onChange={(value) => changeQuotationOrderType(value)}>
                  {quotationOrderType &&
                    quotationOrderType.map((item) => (
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
                .get(`ssrc.inquiryHall.model.inquiryHall.estimatedStartTime`)
                .d('预计开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('estimatedStartTime', {
                initialValue:
                  header.fastBidding && header.estimatedStartTime
                    ? moment(header.estimatedStartTime)
                    : null,
                rules: [
                  {
                    required: header.fastBidding,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.estimatedStartTime`)
                        .d('预计开始时间'),
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
                  disabledDate={(currentDate) => moment(new Date()).isAfter(currentDate, 'day')}
                  disabled={!header.fastBidding}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.biddingRunningTime`)
                .d('竞价运行时间')}
              labelCol={{ span: 9 }}
              wrapperCol={{ span: 15 }}
              style={{ width: '100%', display: 'inline-block' }}
              className={styles.errorStyle}
            >
              {getFieldDecorator('quotationRunningDuration', {
                initialValue: header.quotationRunningDuration,
              })(<div />)}
            </FormItem>
            <FormItem
              className={styles.timeStyle}
              style={{
                width: '15%',
                display: 'inline-block',
                marginLeft: '-63%',
                marginRight: '18px',
              }}
            >
              {getFieldDecorator('day', {
                initialValue: day,
                rules: [
                  {
                    required:
                      getFieldValue('sourceCategory') === 'RFA' &&
                      !getFieldValue('day') &&
                      !getFieldValue('hour') &&
                      !getFieldValue('minute'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.date.unit.day').d('天'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  style={{ width: '130%' }}
                  placeholder={intl.get('hzero.common.date.unit.day').d('天')}
                  onChange={(value) => changeDay(value)}
                  min={0}
                  max={1000}
                  precision={0}
                />
              )}
            </FormItem>
            <FormItem
              className={styles.timeStyle}
              style={{ width: '15%', display: 'inline-block', marginRight: '18px' }}
            >
              {getFieldDecorator('hour', {
                initialValue: hour,
                rules: [
                  {
                    required:
                      getFieldValue('sourceCategory') === 'RFA' &&
                      !getFieldValue('day') &&
                      !getFieldValue('hour') &&
                      !getFieldValue('minute'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.date.unit.hours').d('小时'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  placeholder={intl.get('hzero.common.date.unit.hours').d('小时')}
                  onChange={(value) => changeHour(value)}
                  min={0}
                  max={1000}
                  precision={0}
                  style={{ width: '130%' }}
                />
              )}
            </FormItem>
            <FormItem
              className={styles.timeStyle}
              style={{ width: '15%', display: 'inline-block' }}
            >
              {getFieldDecorator('minute', {
                initialValue: minute,
                rules: [
                  {
                    required:
                      getFieldValue('sourceCategory') === 'RFA' &&
                      !getFieldValue('day') &&
                      !getFieldValue('hour') &&
                      !getFieldValue('minute'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.date.unit.minutes').d('分钟'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  placeholder={intl.get('hzero.common.date.unit.minutes').d('分钟')}
                  onChange={(value) => changeMinute(value)}
                  min={0}
                  max={1000}
                  precision={1}
                  style={{ width: '130%' }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.quotationInterval`)
                .d('报价间隔时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationInterval', {
                initialValue: header.quotationInterval,
                rules: [
                  {
                    required:
                      getFieldValue('sourceCategory') === 'RFA' &&
                      getFieldValue('quotationOrderType') !== 'PARALLEL',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.quotationInterval`)
                        .d('报价间隔时间'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  disabled={getFieldValue('quotationOrderType') === 'PARALLEL'}
                  placeholder={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.unit.minutes`)
                    .d('单位：分钟')}
                  style={{ width: '100%' }}
                  min={0}
                  max={999999999999999}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.auctionRule`).d('竞价规则')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('auctionRule', {
                initialValue: header.auctionRule,
                rules: [
                  {
                    required: getFieldValue('sourceCategory') === 'RFA',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.auctionRule`)
                        .d('竞价规则'),
                    }),
                  },
                ],
              })(
                <Select onChange={onChangeAR}>
                  {auctionRule &&
                    auctionRule.map((item) => (
                      <Option
                        key={item.value}
                        value={item.value}
                        disabled={
                          getFieldValue('auctionDirection') === 'NONE' && item.value === 'TOP_ALL'
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
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.openRule`).d('公开规则')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('openRule', {
                initialValue: header.openRule,
                rules: [
                  {
                    required: getFieldValue('sourceCategory') === 'RFA',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.openRule`).d('公开规则'),
                    }),
                  },
                ],
              })(
                <Select>
                  {openRule &&
                    openRule.map((item) => (
                      <Option
                        key={item.value}
                        value={item.value}
                        disabled={
                          (getFieldValue('auctionRule') === 'TOP_ALL' &&
                            item.value === 'HIDE_IDENTITY_HIDE_QUOTE') ||
                          (getFieldValue('auctionRule') === 'TOP_ALL' &&
                            item.value === 'OPEN_IDENTITY_HIDE_QUOTE')
                        }
                      >
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
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.rankRule').d('排名规则')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('rankRule', {
                initialValue: getFieldValue('sourceCategory') === 'RFA' ? header.rankRule : null,
                rules: [
                  {
                    required: getFieldValue('sourceCategory') === 'RFA',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('ssrc.inquiryHall.model.inquiryHall.rankRule').d('排名规则'),
                    }),
                  },
                ],
              })(
                <Select disabled={getFieldValue('sourceCategory') !== 'RFA'}>
                  {rankRules.map((item) => (
                    <Select.Option
                      value={item.value}
                      key={String(item.value)}
                      disabled={
                        item.value === 'WEIGHT_PRICE' && getFieldValue('sourceMethod') !== 'INVITE'
                      }
                    >
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferDuration`).d('延时时长')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('autoDeferDuration', {
                initialValue: header.autoDeferDuration,
                rules: [
                  {
                    required:
                      getFieldValue('sourceCategory') === 'RFA' &&
                      getFieldValue('autoDeferFlag') === 1,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.autoDeferDuration`)
                        .d('延时时长'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={0}
                  max={999999999999999}
                  style={{ width: '100%' }}
                  disabled={
                    !(
                      getFieldValue('sourceCategory') === 'RFA' &&
                      getFieldValue('autoDeferFlag') === 1
                    )
                  }
                  placeholder={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.unit.minutes`)
                    .d('单位：分钟')}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferFlag`).d('启用自动延时')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('autoDeferFlag', {
                initialValue: header.autoDeferFlag,
              })(<Checkbox disabled checked={header.autoDeferFlag} />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferType`).d('延时触发规则')}
              value={header.autoDeferTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get('ssrc.sourceTemplate.model.inquiryHall.autoDeferPeriod')
                .d('延时触发时间段')}
              value={header.autoDeferPeriod}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.sourceTemplate.model.template.maxDeferCount').d('最大延时次数')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {header.maxDeferCount}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
