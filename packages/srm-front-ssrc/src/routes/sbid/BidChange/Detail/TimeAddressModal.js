/**
 * routes - 招标变更/数据详情/时间地点变更modal
 * @date: 2020-02-07
 * @version: 1.0.0
 * @author: zoukang <kang.zou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import classnames from 'classnames';
import { Modal, Form, Spin, Input, DatePicker, Row, Col } from 'hzero-ui';
import moment from 'moment';

import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import {
  EDIT_FORM_ITEM_LAYOUT,
  DEFAULT_DATETIME_FORMAT,
  EDIT_FORM_ITEM_LAYOUT_COL_3,
} from 'utils/constants';

import common from '@/routes/sbid/common.less';

const { TextArea } = Input;
const FormItem = Form.Item;

const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

@Form.create({ fieldNameProp: null })
export default class TimeAddressModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 判断当前时间和指定时间大小
  judgeTimes(date = null) {
    let result = true;
    if (!date) {
      return result;
    }

    const formatRoundQuotation = moment(date).format(DEFAULT_DATETIME_FORMAT);
    const now = moment().format(DEFAULT_DATETIME_FORMAT);
    result = formatRoundQuotation < now;
    return result;
  }

  render() {
    const {
      form,
      timeAddressInfo = {},
      timeAddressChangeVisible,
      fetchTimeAddressChangeLoading,
      onChangeTimeAddress,
      onCancelChangeTimeAddress,
    } = this.props;

    const { getFieldDecorator } = form;

    return (
      <Modal
        className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}
        destroyOnClose
        closable
        width={800}
        visible={timeAddressChangeVisible}
        onOk={() => onChangeTimeAddress(form)}
        onCancel={onCancelChangeTimeAddress}
        title={intl.get('ssrc.bidChange.view.message.timeAddChange').d('时间&地点变更')}
      >
        <Spin spinning={fetchTimeAddressChangeLoading}>
          <Form className="writable-row-custom">
            <Row gutter={48}>
              <Col span={12}>
                <h4 style={{ background: '#f7f4f4', padding: '16px' }}>
                  {intl.get('ssrc.bidChange.view.modal.sourceInfos').d('原有单据信息')}
                </h4>
                <div style={{ paddingLeft: '16px', marginTop: '16px' }}>
                  <UEDDisplayFormItem
                    label={intl
                      .get(`ssrc.bidHall.model.bidHall.prequalEndDate`)
                      .d('资格预审截止时间')}
                    value={timeAddressInfo.prequalEndDate}
                  />
                  <UEDDisplayFormItem
                    label={intl
                      .get(`ssrc.bidHall.model.bidHall.quotationStartTime`)
                      .d('投标开始时间')}
                    value={timeAddressInfo.quotationStartDate}
                  />
                  <UEDDisplayFormItem
                    label={intl
                      .get(`ssrc.bidHall.model.bidHall.QuotationDeadLine`)
                      .d('投标截止时间')}
                    value={timeAddressInfo.quotationEndDate}
                  />
                  <UEDDisplayFormItem
                    label={intl.get(`ssrc.bidHall.model.bidHall.bidOpenDate`).d('开标时间')}
                    value={timeAddressInfo.bidOpenDate}
                  />
                  <UEDDisplayFormItem
                    label={intl.get('ssrc.bidHall.model.bidHall.bidOpenLocation').d('开标地点')}
                    value={timeAddressInfo.bidOpenLocation}
                  />
                </div>
              </Col>
              <Col span={12}>
                <h4 style={{ background: '#f7f4f4', padding: '16px' }}>
                  {intl.get('ssrc.bidChange.view.modal.updatedTo').d('更新为')}
                </h4>
                <div style={{ paddingLeft: '16px', marginTop: '16px' }}>
                  <FormItem
                    label={intl
                      .get(`ssrc.bidHall.model.bidHall.prequalEndDate`)
                      .d('资格预审截止时间')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('prequalEndDate', {
                      initialValue: null,
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        showTime
                        format={getDateTimeFormat()}
                        disabled={this.judgeTimes(timeAddressInfo.prequalEndDate)}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    label={intl
                      .get(`ssrc.bidHall.model.bidHall.quotationStartTime`)
                      .d('投标开始时间')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('quotationStartDate', {
                      initialValue: null,
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        showTime
                        format={getDateTimeFormat()}
                        disabled={this.judgeTimes(timeAddressInfo.quotationStartDate)}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    label={intl
                      .get(`ssrc.bidHall.model.bidHall.QuotationDeadLine`)
                      .d('投标截止时间')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('quotationEndDate', {
                      initialValue: null,
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        showTime
                        format={getDateTimeFormat()}
                        disabled={this.judgeTimes(timeAddressInfo.quotationEndDate)}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    label={intl.get(`ssrc.bidHall.model.bidHall.bidOpenDate`).d('开标时间')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('bidOpenDate', {
                      initialValue: null,
                    })(
                      <DatePicker
                        style={{ width: '100%' }}
                        showTime
                        format={getDateTimeFormat()}
                        disabled={this.judgeTimes(timeAddressInfo.bidOpenDate)}
                      />
                    )}
                  </FormItem>
                  <FormItem
                    label={intl.get('ssrc.bidHall.model.bidHall.bidOpenLocation').d('开标地点')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('bidOpenLocation', {
                      initialValue: null,
                    })(
                      <Input
                        style={{ width: '100%' }}
                        disabled={!timeAddressInfo.bidOpenLocation}
                      />
                    )}
                  </FormItem>
                </div>
              </Col>
            </Row>
            <Row>
              <FormItem
                label={intl.get('ssrc.bidChange.model.bidChange.changeDocument').d('变更说明')}
                {...EDIT_FORM_ITEM_LAYOUT_COL_3}
                style={{ paddingLeft: '16px', marginTop: '16px' }}
              >
                {getFieldDecorator('alterationRemark', {
                  initialValue: null,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('ssrc.bidChange.model.bidChange.changeDocument')
                          .d('变更说明'),
                      }),
                    },
                  ],
                })(<TextArea style={{ width: '100%' }} />)}
              </FormItem>
            </Row>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
