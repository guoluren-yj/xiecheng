/**
 * 申请单头部
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form } from 'hzero-ui';
import intl from 'utils/intl';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 申请单头部
 * @extends {Component} - PureComponent
 * @return React.element
 */
export default class PreviewHeader extends PureComponent {
  render() {
    return (
      <div className="ued-edit-form">
        <Row className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.model.investReceived.investNum`)
                .d('调查表编号')}
            />
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.model.investReceived.compName`)
                .d('公司名称')}
            />
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.investigationReceived.view.message.compNum`).d('公司编码')}
            />
          </Col>
        </Row>
        <Row className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.investigationReceived.view.message.type`).d('调查表类型')}
            />
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.investTemplateName`)
                .d('调查表模板')}
            />
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.investTemplateCode`)
                .d('模板代码')}
            />
          </Col>
        </Row>
        <Row className="read-row">
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')} />
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.creator.name').d('创建人')}
            />
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.lastUpdateByName`)
                .d('最后审批人')}
            />
          </Col>
        </Row>
        <Row className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.partnerCompNum`)
                .d('供应商编码')}
            />
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.partnerCompName`)
                .d('供应商名称')}
            />
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.partnerBuildDate`)
                .d('注册时间')}
            />
          </Col>
        </Row>
        <Row className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.investigationReceived.view.message.releaseData`).d('发布时间')}
            />
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.investigationReceived.view.message.submitDate`).d('提交时间')}
            />
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.lastUpdateDate`)
                .d('最后审批时间')}
            />
          </Col>
        </Row>
        <Row className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.investigationReceived.view.message.remark`).d('调查说明')}
            />
          </Col>
        </Row>
        <Row className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.investigationReceived.view.message.partnerRemark`)
                .d('反馈备注')}
            />
          </Col>
        </Row>
      </div>
    );
  }
}
