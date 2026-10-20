/**
 * ExpertScoring/BidHall - 澄清单详情头信息展示
 * @date: 2019-08-20
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';

import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';

const FormItem = Form.Item;
class InforForm extends Component {
  /**
   * 渲染澄清单状态
   *
   * @param {*} status NEW/新建| PENDING/待回复 | ANSWERED/已回复 | DEADLINE/已超时
   */
  renderStatus(status) {
    switch (status) {
      case 'NEW':
        return intl.get(`ssrc.expertScoring.model.expertScoring.creat`).d(`新建`);
      case 'PENDING':
        return intl.get(`ssrc.expertScoring.model.expertScoring.waittingReply`).d(`待回复`);
      case 'ANSWERED':
        return intl.get(`ssrc.expertScoring.model.expertScoring.alreaReplaied`).d(`已回复`);
      case 'DEADLINE':
        return intl.get(`ssrc.expertScoring.model.expertScoring.timeOutted`).d(`已超时`);

      default:
        return '';
    }
  }

  render() {
    const {
      clarifyNotifyDetailHeader: {
        sourceTitle = '',
        clarifyNotifyNum,
        companyName,
        sourceNum,
        supplierCompanyName,
        replyDate,
        replyStatus,
        clarifyNotifyTitle,
      },
    } = this.props;
    return (
      <div>
        <Row gutter={12} className="read-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.expertScoring.model.expertScoring.clarifyNum`).d('澄清单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {clarifyNotifyNum}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.expertScoring.model.expertScoring.title`).d('标题')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <span style={{ whiteSpace: 'nowrap' }}>{clarifyNotifyTitle}</span>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12} className="read-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.expertScoring.model.expertScoring.bidNum`).d('寻源单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {sourceNum}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl
                .get(`ssrc.expertScoring.model.expertScoring.inquiry.title`)
                .d('寻源单标题')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {sourceTitle}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.expertScoring.model.expertScoring.client`).d('客户')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {companyName}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12} className="read-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.expertScoring.model.expertScoring.supplier`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {supplierCompanyName}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.expertScoring.model.expertScoring.replyTime`).d('回复时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {replyDate}
            </FormItem>
          </Col>
          <Col span={8} style={{ height: 39, paddingTop: '6.5px' }}>
            <FormItem label={intl.get(`hzero.common.status`).d('状态')} {...EDIT_FORM_ITEM_LAYOUT}>
              {this.renderStatus(replyStatus)}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}

export default InforForm;
