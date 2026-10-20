/**
 * 申请单头部
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form } from 'hzero-ui';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 申请单头部
 * @extends {Component} - PureComponent
 * @reactProps {Object} headerInfo - 头信息对象
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.supplierReview', 'sslm.common'],
})
export default class HeaderInfo extends PureComponent {
  render() {
    const {
      headerInfo = {},
      isReviewed = false,
      form,
      code = '',
      custLoading,
      customizeForm = () => {},
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code,
        form,
        dataSource: headerInfo,
        readOnly: true,
      },
      <Form className="ued-edit-form form-wrap" custLoading={custLoading}>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.supplierReview.model.supplierReview.qualifiedNumber`)
                .d('申请单号')}
            >
              {getFieldDecorator('qualifiedNumber', {
                initialValue: headerInfo.qualifiedNumber,
              })(<span>{headerInfo.qualifiedNumber}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.supplier.code').d('供应商编码')}
            >
              {getFieldDecorator('supplierCompanyNum', {
                initialValue: headerInfo.supplierCompanyNum,
              })(<span>{headerInfo.supplierCompanyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.supplier.name').d('供应商名称')}
            >
              {getFieldDecorator('supplierCompanyName', {
                initialValue: headerInfo.supplierCompanyName,
              })(<span>{headerInfo.supplierCompanyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.supplierReview.model.supplierReview.stageDescription`)
                .d('当前阶段')}
            >
              {getFieldDecorator('stageDescription', {
                initialValue: headerInfo.stageDescription,
              })(<span>{headerInfo.stageDescription}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.supplierReview.model.supplierReview.createDate`).d('创建时间')}
            >
              {getFieldDecorator('creationDate', {
                initialValue: headerInfo.creationDate,
              })(<span>{dateTimeRender(headerInfo.creationDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.common.view.creator.name`).d('创建人')}
            >
              {getFieldDecorator('realName', {
                initialValue: headerInfo.realName || headerInfo.loginName,
              })(<span>{headerInfo.realName || headerInfo.loginName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.supplierReview.model.supplierReview.targetStageDesc`)
                .d('目标阶段')}
            >
              {getFieldDecorator('targetStageDescription', {
                initialValue: headerInfo.targetStageDescription,
              })(<span>{headerInfo.targetStageDescription}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.supplierReview.model.supplierReview.companyCode`).d('公司编码')}
            >
              {getFieldDecorator('companyNum', {
                initialValue: headerInfo.companyNum,
              })(<span>{headerInfo.companyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.supplierReview.model.supplierReview.companyName`).d('公司名称')}
            >
              {getFieldDecorator('companyName', {
                initialValue: headerInfo.companyName,
              })(<span>{headerInfo.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.supplierReview.model.supplierReview.templateCode`)
                .d('评分要素代码')}
            >
              {getFieldDecorator('templateCode', {
                initialValue: headerInfo.templateCode,
              })(<span>{headerInfo.templateCode}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.supplierReview.model.supplierReview.templateName`)
                .d('评分要素描述')}
            >
              {getFieldDecorator('templateName', {
                initialValue: headerInfo.templateName,
              })(<span>{headerInfo.templateName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
              {getFieldDecorator('processStatus', {
                initialValue: headerInfo.processStatus,
              })(<span>{headerInfo.processStatusMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        {isReviewed && (
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('sslm.commonApplication.model.score.goal').d('得分')}
              >
                {getFieldDecorator('score', {
                  initialValue: headerInfo.score,
                })(<span>{headerInfo.score}</span>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get('sslm.commonApplication.model.score.scoreLevelDesc').d('等级')}
              >
                {getFieldDecorator('scoreLevelDesc', {
                  initialValue: headerInfo.scoreLevelDesc,
                })(<span>{headerInfo.scoreLevelDesc}</span>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get(`sslm.supplierReview.model.supplierReview.authorized`)
                  .d('特准供应商')}
              >
                {getFieldDecorator('authorizeFlag', {
                  initialValue: headerInfo.authorizeFlag,
                })(<span>{yesOrNoRender(headerInfo.authorizeFlag)}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
        {isReviewed && (
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get(`sslm.supplierReview.model.supplierReview.respScore`)
                  .d('评分人得分')}
              >
                {getFieldDecorator('respScore', {
                  initialValue: headerInfo.respScore,
                })(<span>{headerInfo.respScore}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
        {!isReviewed && (
          <Row gutter={48} className="read-row">
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get(`sslm.supplierReview.model.supplierReview.authorized`)
                  .d('特准供应商')}
              >
                {getFieldDecorator('authorizeFlag', {
                  initialValue: headerInfo.authorizeFlag,
                })(<span>{yesOrNoRender(headerInfo.authorizeFlag)}</span>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get(`sslm.supplierReview.model.supplierReview.respScore`)
                  .d('评分人得分')}
              >
                {getFieldDecorator('respScore', {
                  initialValue: headerInfo.respScore,
                })(<span>{headerInfo.respScore}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.supplierReview.model.supplierReview.remark`).d('说明')}
            >
              {getFieldDecorator('remark', {
                initialValue: headerInfo.remark,
              })(<span>{headerInfo.remark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
