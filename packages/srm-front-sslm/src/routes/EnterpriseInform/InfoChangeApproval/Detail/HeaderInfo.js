/**
 * HeaderInfo - 申请单头信息
 * @date: 2019-12-16
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { Row, Col, Form, Input } from 'hzero-ui';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { dateRender } from 'utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload/index';

const FormItem = Form.Item;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

export default class HeaderInfo extends Component {
  @Bind()
  validator(rule, value, callback) {
    if (isEmpty(value)) {
      callback(intl.get('sslm.enterpriseInform.view.validate.approve').d('请填写审批意见'));
    }
    callback();
  }

  render() {
    const {
      form: { getFieldDecorator },
      detailHeader = {},
      errorMessage = '',
    } = this.props;
    return (
      <Form className="ued-edit-form" style={{ margin: '0 16px 24px' }}>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.model.application.applicationNum')
                .d('申请单号')}
            >
              {getFieldDecorator('changeReqNumber', {
                initialValue: detailHeader.changeReqNumber,
              })(<span>{detailHeader.changeReqNumber}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.model.application.latitudeChange')
                .d('变更维度')}
            >
              {getFieldDecorator('changeLevelMeaning', {
                initialValue: detailHeader.changeLevelMeaning,
              })(<span>{detailHeader.changeLevelMeaning}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.model.application.applicationState')
                .d('申请状态')}
            >
              {getFieldDecorator('reqStatus', {
                initialValue: detailHeader.reqStatus,
              })(<span>{detailHeader.reqStatusMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.model.application.enterpriseNum')
                .d('企业编码')}
            >
              {getFieldDecorator('companyNum', {
                initialValue: detailHeader.companyNum,
              })(<span>{detailHeader.companyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.model.application.enterpriseName')
                .d('企业名称')}
            >
              {getFieldDecorator('companyName', {
                initialValue: detailHeader.companyName,
              })(<span>{detailHeader.companyName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.model.application.creator').d('创建人')}
            >
              {getFieldDecorator('createUserRealName', {
                initialValue: detailHeader.createUserRealName,
              })(<span>{detailHeader.createUserRealName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.model.application.submitDate').d('提交日期')}
            >
              {getFieldDecorator('submitDate', {
                initialValue: detailHeader.submitDate,
              })(<span>{dateRender(detailHeader.submitDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('hzero.common.upload.modal.title').d('附件')}
            >
              {getFieldDecorator('attachmentUuid', {
                initialValue: detailHeader.attachmentUuid,
              })(
                <Upload
                  viewOnly
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="sslm-enterprise"
                  attachmentUUID={detailHeader.attachmentUuid}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.model.application.creationDate').d('创建日期')}
            >
              {getFieldDecorator('creationDate', {
                initialValue: detailHeader.creationDate,
              })(<span>{dateRender(detailHeader.creationDate)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.model.application.changeRemark').d('变更备注')}
            >
              {getFieldDecorator('remark', {
                initialValue: detailHeader.remark,
              })(<span>{detailHeader.remark}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.enterpriseInform.model.application.approvalOpinion')
                .d('审批意见')}
            >
              {getFieldDecorator('approvalRemark', {
                rules: [{ validator: this.validator }],
                initialValue: errorMessage,
              })(<TextArea rows={2} style={{ resize: 'none' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.model.application.appealReason').d('申诉原因')}
            >
              {getFieldDecorator('appealReason', {
                initialValue: detailHeader.appealReason,
              })(<span>{detailHeader.appealReason}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
