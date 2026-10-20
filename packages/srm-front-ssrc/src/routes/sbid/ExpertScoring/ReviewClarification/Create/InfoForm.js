/**
 * bidHall - 寻源服务/确认招标维护 - 基本信息表单
 * @date: 2019-06-27
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
// import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

const FormItem = Form.Item;

const promptCode = 'ssrc.expertScoring';

@formatterCollections({ code: ['ssrc.expertScoring', 'ssrc.common'] })
export default class BidInfoForm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { createHeader = {} } = this.props;
    return (
      <Form>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expertScoring.sourceNum`).d('寻源单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {createHeader.sourceNum}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {createHeader.companyName}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expertScoring.submitter`).d('提交人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {createHeader.userName}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expertScoring.quotationHeaderNum`).d('投标单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {createHeader.quotationHeaderNum}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expertScoring.supplierCompanyName`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {createHeader.supplierCompanyName}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
