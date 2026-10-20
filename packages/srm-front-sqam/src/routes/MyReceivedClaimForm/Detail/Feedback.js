/*
 * @Description:
 * @Date: 2020-05-07 17:29:53
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
// 反馈意见
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_LAYOUT,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';

import classNames from 'classnames';

import DisplayFormItem from '../../components/DisplayFormItem';

const prefix = `sqam.common`;
const formItemLayout = {
  labelCol: { span: 9, style: { textAlign: 'left' } },
  wrapperCol: { span: 15, style: { textAlign: 'left' } },
};
export default class BasicInfoForm extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { feedbackOpinion, expenseProcessTypeMeaning, supplierConfirmUuid } = this.props;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.supplierConfirm`).d('供应商确认附件')}
              {...formItemLayout}
            >
              <Upload
                bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                bucketDirectory="sqam-claim"
                attachmentUUID={supplierConfirmUuid}
                tenantId={getCurrentOrganizationId()}
                viewOnly
              />
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sqam.common.model.expenseProcessType`).d('费用处理方式')}
              value={expenseProcessTypeMeaning}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${prefix}.model.feedbackOpinion`).d('反馈意见')}
              {...EDIT_FORM_ITEM_LAYOUT}
              value={feedbackOpinion}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
