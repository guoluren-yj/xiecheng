/**
 * ExpertScoring/BidHall - 澄清单详情头信息展示
 * @date: 2019-08-20
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input } from 'hzero-ui';
import classnames from 'classnames';

import { FORM_COL_2_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';

const FormItem = Form.Item;
const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
class InforForm extends Component {
  /**
   * 渲染澄清单状态
   *
   * @param {*} status NEW/新建| PENDING/待回复 | ANSWERED/已回复 | DEADLINE/已超时
   */
  renderStatus(status) {
    switch (status) {
      case 'NEW':
        return intl.get(`ssrc.bidHall.model.question.create`).d(`新建`);
      case 'PENDING':
        return intl.get(`ssrc.bidHall.model.question.waittingReply`).d(`待回复`);
      case 'ANSWERED':
        return intl.get(`ssrc.bidHall.model.question.alreaReplaied`).d(`已回复`);
      case 'DEADLINE':
        return intl.get(`ssrc.bidHall.model.question.timeOutted`).d(`已超时`);

      default:
        return '';
    }
  }

  render() {
    const {
      form: { getFieldDecorator },
      clarifyNotifyDetailHeader: {
        clarifyNotifyNum,
        companyName,
        sourceNum,
        submittedDate,
        supplierCompanyName,
        replyEndDate,
        replyStatus,
        submittedByName,
        clarifyNotifyTitle,
        replyRequirement,
        quotationHeaderNum,
      },
    } = this.props;
    return (
      <div>
        <Row gutter={12} className="read-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.modal.question.questionNum`).d('问题单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {clarifyNotifyNum}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {companyName}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.modal.question.inquiryNum`).d('寻源单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {sourceNum}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12} className="read-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.modal.question.submitTime`).d('提交时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {submittedDate}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.modal.question.supplier`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {supplierCompanyName}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.modal.question.bidNum`).d('投标单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {quotationHeaderNum}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12} className="read-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.modal.question.replayEndTime`).d('答复截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {replyEndDate}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.modal.question.releasePeople`).d('发布人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {submittedByName}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`hzero.common.status`).d('状态')} {...EDIT_FORM_ITEM_LAYOUT}>
              {this.renderStatus(replyStatus)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`ssrc.bidHall.view.message.clarifyNotifyTitle`).d('标题')}>
              {getFieldDecorator('clarifyNotifyTitle', {
                initialValue: clarifyNotifyTitle,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`ssrc.bidHall.view.message.replayCommand`).d('答复要求')}>
              {getFieldDecorator('replyRequirement', {
                initialValue: replyRequirement,
              })(<TextArea rows={4} style={{ height: '56px' }} disabled />)}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}

export default InforForm;
