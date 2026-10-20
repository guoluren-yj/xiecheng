/**
 * bidHall - 寻源服务 招标维护 - 招标公告
 * @date: 2019-09-11
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input } from 'hzero-ui';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { PUBLIC_BUCKET } from '_utils/config';
import { FILE_SIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

const FormItem = Form.Item;

@formatterCollections({ code: ['ssrc.bidHall'] })
export default class TenderNoticeForm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      form: { getFieldDecorator },
      organizationId,
      header = {},
    } = this.props;
    const formsLayouts = { labelCol: { span: 4 }, wrapperCol: { span: 20 } };

    return (
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.noticeNum`).d('公告编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('noticeNum', {
                initialValue: header.noticeNum,
              })(<Input disabled />)}
            </FormItem>
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator('noticeId', {
                initialValue: header.noticeId || null,
              })(<Input disabled />)}
            </FormItem>
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator('noticeObjectVersionNumber', {
                initialValue: header.noticeObjectVersionNumber || 0,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.noticeStatus`).d('公告状态')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('noticeStatusMeaning', {
                initialValue: header.noticeStatusMeaning,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.noticeAttachment`).d('公告附件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('noticeAttachmentUuid', {
                initialValue: header.noticeAttachmentUuid,
              })(
                <Upload
                  filePreview
                  bucketName={PUBLIC_BUCKET}
                  bucketDirectory="ssrc-bidhall-update"
                  attachmentUUID={header.noticeAttachmentUuid}
                  tenantId={organizationId}
                  {...ChunkUploadProps}
                  fileSize={FILE_SIZE}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              label={intl
                .get(`ssrc.bidHall.model.bidHall.otherSupplementaryIssues`)
                .d('其它补充事项')}
              {...formsLayouts}
            >
              {getFieldDecorator('remark', {
                initialValue: header.remark,
              })(<Input.TextArea style={{ marginLeft: '8.4%' }} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
