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
    const {
      form,
      customizeForm,
      custLoading,
      form: { getFieldDecorator },
    } = this.props;

    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_HEADER',
        form,
        dataSource: {},
        readOnly: true,
      },
      <Form className="ued-edit-form" custLoading={custLoading}>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.model.conApp.applicationNumber`)
                .d('申请单号')}
            >
              {getFieldDecorator('qualifiedNumber')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.model.conApp.supplierCompanyNum`)
                .d('供应商编码')}
            >
              {getFieldDecorator('supplierCompanyNum')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.model.conApp.supplierCompanyName`)
                .d('供应商名称')}
            >
              {getFieldDecorator('supplierCompanyName')(<span />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.commonApplication.model.conApp.stageDescription`).d('当前阶段')}
            >
              {getFieldDecorator('stageDescription')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.commonApplication.model.conApp.createDate`).d('创建时间')}
            >
              {getFieldDecorator('creationDate')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.creator.name').d('创建人')}
            >
              {getFieldDecorator('realName')(<span />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.commonApplication.model.coApp.targetStageDesc`).d('目标阶段')}
            >
              {getFieldDecorator('toStageDescription')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.commonApplication.model.conApp.companyNum`).d('公司编码')}
            >
              {getFieldDecorator('companyNum')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.commonApplication.model.conApp.companyName`).d('公司名称')}
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
                .get(`sslm.commonApplication.view.message.scoreElementCode`)
                .d('评分要素编码')}
            >
              {getFieldDecorator('templateId')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.view.message.scoreElementDes`)
                .d('评分要素描述')}
            >
              {getFieldDecorator('templateName')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
              {getFieldDecorator('processStatus')(<span />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.commonApplication.view.message.score`).d('得分')}
            >
              {getFieldDecorator('score')(<span />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.commonApplication.view.message.scoreLevelDesc`).d('等级')}
            >
              {getFieldDecorator('scoreLevelDesc')(<span />)}
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
              label={intl.get('sslm.commonApplication.model.supplier.weightFlag').d('权重式计算')}
            >
              {getFieldDecorator('weightedFlag')(<span />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.qualified.remark').d('说明')}
            >
              {getFieldDecorator('remark')(<span />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
