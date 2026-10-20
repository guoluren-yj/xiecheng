/**
 * AuditStagePanel - 审核阶段
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import styles from './index.less';

const prefix = `sqam.common.view.message.title`;

@Form.create({ fieldNameProp: null })
export default class QuestionForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form = {}, customizeForm, basicInfo, onClickOpen, code } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const longLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 },
    };
    // console.log(basicInfo, form)
    return customizeForm(
      {
        code,
        form,
        dataSource: basicInfo,
      },
      <Form>
        <Row>
          <Col span={24} className={styles['col-wrapper']}>
            <Form.Item label={intl.get(`${prefix}.audit.opinion`).d('审核意见')} {...longLayout}>
              {getFieldDecorator('approvedRemark', {
                initialValue: '',
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl.get(`${prefix}.audit.opinion`).d('审核意见'),
                    }),
                  },
                ],
              })(<Input.TextArea TextArea rows={3} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} className={styles['col-wrapper']}>
            <Form.Item
              label={intl
                .get(`${prefix}.model.incomingInspectionQuery.detectionGuide`)
                .d('审核附件')}
            >
              <a onClick={onClickOpen}>
                {intl.get(`sqam.common.model.qualityRectification.attachmentUuid`).d('附件管理')}
              </a>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
