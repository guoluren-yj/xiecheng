/**
 * bidHall - 寻源服务 招标维护 - 寻源公告
 * @date: 2020-6-4
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { map } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Input, InputNumber, Select } from 'hzero-ui';

import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { getCurrentUser } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_3_LAYOUT,
} from 'utils/constants';
import { PUBLIC_BUCKET } from '_utils/config';
import { FIlESIZE } from '@/utils/SsrcRegx';

const FormItem = Form.Item;

@formatterCollections({
  code: ['ssrc.bidHall'],
})
export default class RfxNoticeForm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  /**
   * 区号改变 需要 重置手机号的校验状态
   */
  @Bind()
  reValidationPhone(value) {
    const { form } = this.props;
    const prevInternationalTelCode = form.getFieldValue('internationalTelCode');
    if (value === '+86' || prevInternationalTelCode === '+86') {
      // 只要 +86 出现在 中间态 就需要重新手动校验 phone
      const curPhone = form.getFieldValue('purPhone');
      let errors = null;
      if (curPhone) {
        const testReg = value === '+86' ? PHONE : NOT_CHINA_PHONE;
        if (!testReg.test(curPhone)) {
          errors = [new Error(intl.get('hzero.common.validation.phone').d('手机格式不正确'))];
        }
        form.setFields({
          purPhone: {
            value: curPhone,
            errors,
          },
        });
      }
    }
  }

  render() {
    const {
      form = {},
      form: { getFieldDecorator },
      organizationId,
      header = {},
      tenderNoticeInfo = {},
      previewNotice = () => {},
      idd = [],
    } = this.props;

    return (
      <Form className="writable-row-custom">
        <Row {...EDIT_FORM_ROW_LAYOUT} type="flex" justify="start">
          <Col {...FORM_COL_2_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.bidHall.model.bidHall.noticeTitle').d('公告标题')}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 20 }}
            >
              {getFieldDecorator('noticeTitle', {
                initialValue:
                  tenderNoticeInfo.noticeTitle ||
                  `${header.rfxTitle || ''}${intl
                    .get('ssrc.inquiryHall.view.message.panel.rfxNotice')
                    .d('寻源公告')}`,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('ssrc.bidHall.model.bidHall.noticeTitle').d('公告标题'),
                    }),
                  },
                ],
              })(<Input style={{ marginLeft: '5.5%' }} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.bidHall.model.bidHall.noticeDays').d('公告天数')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('noticeDays', {
                initialValue: tenderNoticeInfo.noticeDays,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('ssrc.bidHall.model.bidHall.noticeDays').d('公告天数'),
                    }),
                  },
                ],
              })(<InputNumber min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.purchasingContact`).d('采购联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purName', {
                initialValue: tenderNoticeInfo.purName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.purName`).d('采购联系人'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.contactPhone`).d('联系人电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purPhone', {
                initialValue: tenderNoticeInfo.purPhone || getCurrentUser().phone,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.contactPhone`).d('联系人电话'),
                    }),
                  },
                  {
                    pattern:
                      form.getFieldValue('internationalTelCode') === '+86'
                        ? PHONE
                        : NOT_CHINA_PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                  },
                ],
              })(
                <Input
                  addonBefore={form.getFieldDecorator('internationalTelCode', {
                    initialValue: (idd[0] && idd[0].value) || getCurrentUser().internationalTelCode,
                  })(
                    <Select onChange={this.reValidationPhone}>
                      {map(idd, (r) => (
                        <Select.Option key={r.value} value={r.value}>
                          {r.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.contactMail`).d('联系人邮箱')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purEmail', {
                initialValue: tenderNoticeInfo.purEmail,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.contactMail`).d('联系人邮箱'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.noticeAttachment`).d('公告附件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('noticeAttachmentUuid', {
                initialValue: tenderNoticeInfo.noticeAttachmentUuid,
              })(
                <Upload
                  filePreview
                  bucketName={PUBLIC_BUCKET}
                  bucketDirectory="ssrc-rfx-tender-notice"
                  attachmentUUID={tenderNoticeInfo.noticeAttachmentUuid}
                  tenantId={organizationId}
                  fileSize={FIlESIZE}
                />
              )}
              {getFieldDecorator('noticeId', { initialValue: tenderNoticeInfo.noticeId })(<span />)}
              {getFieldDecorator('objectVersionNumber', {
                initialValue: tenderNoticeInfo.objectVersionNumber,
              })(<span />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('ssrc.bidHall.model.bidHall.noticePreview').d('公告预览')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('inquiryGroup')(
                <span>
                  {tenderNoticeInfo.noticeId ? (
                    <a onClick={previewNotice}>
                      {intl.get('hzero.common.button.preview').d('预览')}
                    </a>
                  ) : null}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
