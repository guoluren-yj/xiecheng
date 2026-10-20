/**
 * 澄清函基本信息
 * @date: 2019-6-19
 * @author: LvShuo <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Input, Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { valueMapMeaning } from 'utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { getCurrentUser } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { FILE_SIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

@Form.create({ fieldNameProp: null })
export default class BaseInfo extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    // const { realName } = getCurrentUser();
    this.state = {
      realName: getCurrentUser().realName,
      // supplier: getCurrentUser().tenantName,
    };
  }

  render() {
    const { realName } = this.state;
    const {
      clarificationDetails = {},
      organizationId,
      clarifyStatus = [],
      sourceNum,
      headerInfo = {},
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`ssrc.clarify.model.clarify.title`).d('标题')}>
              {getFieldDecorator('title', {
                initialValue: clarificationDetails.title,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', {
                      max: 480,
                    }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.clarify.model.clarify.title`).d('标题'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.clarify.model.clarify.clarifyNum`).d('澄清单号')}
            >
              {clarificationDetails.clarifyNum}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item {...EDIT_FORM_ITEM_LAYOUT} label={intl.get('ssrc.common.company').d('公司')}>
              {clarificationDetails.companyName || headerInfo.companyName}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.clarify.model.clarify.clarifyStatus`).d('状态')}
            >
              {valueMapMeaning(clarifyStatus, clarificationDetails.clarifyStatus)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.clarify.model.clarify.submittedByUserName`).d('发布人')}
            >
              {clarificationDetails.submittedByUserName || realName}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.clarify.model.clarify.sourceNum`).d('寻源单号')}
            >
              {clarificationDetails.sourceNum || sourceNum}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.clarify.model.clarify.submittedDate`).d('发布时间')}
            >
              {clarificationDetails.submittedDate}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`ssrc.clarify.model.clarify.context`).d('澄清函文件')}
            >
              {getFieldDecorator('attachmentUuid', {
                initialValue: clarificationDetails.attachmentUuid,
              })(
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={clarificationDetails.attachmentUuid}
                  tenantId={organizationId}
                  filePreview
                  {...ChunkUploadProps}
                  fileSize={FILE_SIZE}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
