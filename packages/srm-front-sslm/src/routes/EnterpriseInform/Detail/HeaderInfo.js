/**
 * HeaderInfo - 申请单头信息
 * @date: 2019-12-16
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Row, Col, Form, Input } from 'hzero-ui';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import Upload from 'srm-front-boot/lib/components/Upload/index';

const FormItem = Form.Item;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

export default class HeaderInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newAttachmentUuid: uuidv4(),
    };
  }

  render() {
    const {
      form,
      pubEdit,
      changFlag,
      custLoading,
      form: { getFieldDecorator },
      detailHeader = {},
      customizeForm = undefined,
      customizeUnitCode = undefined,
      isApprove = false,
      platformConfimEdit = false,
    } = this.props;
    const { newAttachmentUuid } = this.state;

    const headerFrom = (
      <Form custLoading={custLoading}>
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
                initialValue: detailHeader.attachmentUuid || newAttachmentUuid,
              })(
                <Upload
                  attachmentUUID={detailHeader.attachmentUuid || newAttachmentUuid}
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="sslm-enterprise"
                  viewOnly={changFlag}
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
        <Row gutter={48} className="read-row">
          {detailHeader.changeLevel !== 'PLATFORM' && (
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={
                  detailHeader.changeLevel === 'GROUP'
                    ? intl
                        .get('sslm.enterpriseInform.model.application.purchaserName')
                        .d('采购方名称')
                    : intl
                        .get('sslm.enterpriseInform.model.application.partnerCompanyName')
                        .d('采购方公司名称')
                }
              >
                {getFieldDecorator('partnerCompanyName', {
                  initialValue: detailHeader.partnerCompanyName,
                })(<span>{detailHeader.partnerCompanyName}</span>)}
              </FormItem>
            </Col>
          )}
          {detailHeader.changeLevel === 'COMPANY' && (
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.enterpriseInform.model.application.partnerCompanyNum')
                  .d('采购方公司编码')}
              >
                {getFieldDecorator('partnerCompanyNum', {
                  initialValue: detailHeader.partnerCompanyNum,
                })(<span>{detailHeader.partnerCompanyNum}</span>)}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.enterpriseInform.model.application.changeRemark').d('变更备注')}
            >
              {getFieldDecorator('remark', {
                initialValue: detailHeader.remark,
              })(
                isApprove ? (
                  <span>{detailHeader.remark}</span>
                ) : (
                  <TextArea rows={2} style={{ resize: 'none' }} disabled={changFlag} />
                )
              )}
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
              {getFieldDecorator('oldApprovalOpinion', {
                initialValue: detailHeader.approvalOpinion,
              })(<span>{detailHeader.approvalOpinion}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
    return customizeForm
      ? customizeForm(
          {
            code: customizeUnitCode,
            form,
            dataSource: detailHeader,
            readOnly: pubEdit ? !pubEdit : platformConfimEdit ? !platformConfimEdit : changFlag,
          },
          headerFrom
        )
      : headerFrom;
  }
}
