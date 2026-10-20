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
export default class HeaderInfo extends PureComponent {
  render() {
    const {
      form,
      customizeForm,
      custLoading,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_MANAGE.DEGRADE_HEADER',
        form,
        dataSource: {},
        readOnly: true,
      },
      <Form className="ued-edit-form" custLoading={custLoading}>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.applicationNumber').d('申请单号')}
            >
              {getFieldDecorator('degradeNumber')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.supplier.code').d('供应商编码')}
            >
              {getFieldDecorator('supplierCompanyNum')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.supplier.name').d('供应商名称')}
            >
              {getFieldDecorator('supplierCompanyName')(<span />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.stageDescription').d('当前阶段')}
            >
              {getFieldDecorator('stageDescription')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.creationDate').d('创建时间')}
            >
              {getFieldDecorator('creationDate')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.loginName').d('创建人')}
            >
              {getFieldDecorator('realName')(<span />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.model.coApp.targetStageDescription`)
                .d('目标阶段')}
            >
              {getFieldDecorator('toStageDescription')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.companyNum').d('公司编码')}
            >
              {getFieldDecorator('companyNum')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.companyName').d('公司名称')}
            >
              {getFieldDecorator('companyName')(<span />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.commonApplication.model.coApp.degradeTypeMeaning')
                .d('操作类型')}
            >
              {getFieldDecorator('degradeTypeMeaning')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.blacklistFlag').d('加入黑名单')}
            >
              {getFieldDecorator('blacklistFlag')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.model.coApp.foreverBlacklistFlag`)
                .d('永久黑名单')}
            >
              {getFieldDecorator('foreverBlacklistFlag')(<span />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
              {getFieldDecorator('processStatus')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.model.coApp.blacklistExpiryDate`)
                .d('黑名单失效时间')}
            >
              {getFieldDecorator('blacklistExpiryDate')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.supplier.authorized').d('特准供应商')}
            >
              {getFieldDecorator('authorizeFlag')(<span />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.eliminate.remark').d('说明')}
            >
              {getFieldDecorator('remark')(<span />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
