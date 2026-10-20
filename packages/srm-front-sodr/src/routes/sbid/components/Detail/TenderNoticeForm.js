/**
 * bidHall - 寻源服务 招标明细 - 招标公告
 * @date: 2019-09-11
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import Upload from 'components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import { PUBLIC_BUCKET } from '_utils/config';

const FormItem = Form.Item;

const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

@formatterCollections({ code: ['ssrc.bidHall'] })
export default class TenderNoticeForm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { organizationId, header = {} } = this.props;
    const formsLayouts = { labelCol: { span: 4 }, wrapperCol: { span: 20 } };

    return (
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.noticeNum.`).d('公告编号')}
              value={header.noticeNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.noticeStatus`).d('公告状态')}
              value={header.noticeStatusMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.noticeAttachment`).d('公告附件')}
              value={
                <Upload
                  bucketName={PUBLIC_BUCKET}
                  bucketDirectory="ssrc-tendernotice-detail"
                  attachmentUUID={header.noticeAttachmentUuid}
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                />
              }
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              label={intl
                .get(`ssrc.bidHall.model.bidHall.otherSupplementaryIssues`)
                .d('其它补充事项')}
              {...formsLayouts}
              value={header.remark}
            >
              <div style={{ marginLeft: '8.4%' }}>{header.remark}</div>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
