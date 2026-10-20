/*
 * HandlePersonInfo - CA认证-经办人信息
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-8-5 16:09:07
 * @LastEditTime: 2019-08-26 10:55:30
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input } from 'hzero-ui';
import classnames from 'classnames';
import { isFunction } from 'lodash';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

@Form.create({ fieldNameProp: null })
export default class HandlePersonInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  render() {
    const {
      form = {},
      detailDataSource,
      companyEditable = false,
      amountDisabled = false,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const { agentName, agentIdNum, agentMobile } = detailDataSource; // agentMail
    return (
      <Form>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(companyEditable ? 'writable-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`spfm.certificateAuthority.model.certificateAuthority.agent`)
                .d('经办人')}
            >
              {companyEditable
                ? getFieldDecorator('agentName', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfm.certificateAuthority.model.certificateAuthority.agent`)
                            .d('经办人'),
                        }),
                      },
                      {
                        max: 30,
                        message: intl.get('hzero.common.validation.max', { max: 30 }),
                      },
                    ],
                    initialValue: agentName,
                  })(<Input disabled={amountDisabled} />)
                : agentName}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`spfm.certificateAuthority.model.certificateAuthority.ID`)
                .d('身份证号')}
            >
              {companyEditable
                ? getFieldDecorator('agentIdNum', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfm.certificateAuthority.model.certificateAuthority.ID`)
                            .d('身份证号'),
                        }),
                      },
                      {
                        pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
                        message: intl.get('hzero.common.validation.ID').d('身份证格式不正确'),
                      },
                    ],
                    initialValue: agentIdNum,
                  })(<Input disabled={amountDisabled} />)
                : agentIdNum}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`spfm.certificateAuthority.model.certificateAuthority.phone`)
                .d('手机号码')}
            >
              {companyEditable
                ? getFieldDecorator('agentMobile', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfm.certificateAuthority.model.certificateAuthority.phone`)
                            .d('手机号码'),
                        }),
                      },
                      {
                        pattern: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
                        message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                      },
                    ],
                    initialValue: agentMobile,
                  })(<Input disabled={amountDisabled} />)
                : agentMobile}
            </Form.Item>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(companyEditable ? 'writable-row' : 'read-row')}
        >
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item {...EDIT_FORM_ITEM_LAYOUT} label={intl.get('hzero.common.email').d('邮箱')}>
              {companyEditable
                ? getFieldDecorator('agentMail', {
                    rules: [
                      {
                        type: 'email',
                        message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                      },
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hzero.common.email').d('邮箱'),
                        }),
                      },
                      {
                        max: 100,
                        message: intl.get('hzero.common.validation.max', { max: 100 }),
                      },
                    ],
                    initialValue: agentMail,
                  })(<Input disabled={amountDisabled} />)
                : agentMail}
            </Form.Item>
          </Col> */}
        </Row>
      </Form>
    );
  }
}
