/**
 * AuditStagePanel - 审核阶段
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isFunction } from 'lodash';

import styles from './index.less';

const prefix = `sqam.common.view.message.title`;

@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SQAM.AUDIT_8D_DETAIL.APPROVE_STAGE'],
})
export default class QuestionForm extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this, 'basicInfo');
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form = {}, customizeForm, basicInfo, onClickOpen } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    return customizeForm(
      {
        code: 'SQAM.AUDIT_8D_DETAIL.APPROVE_STAGE',
        form,
        dataSource: basicInfo,
      },
      <Form>
        <Row>
          <Col span={24} className={styles['col-wrapper']}>
            <Form.Item label={intl.get(`${prefix}.issue`).d('审核信息')}>
              {getFieldDecorator('approvedRemark')(
                <span>
                  {basicInfo.problemStatus === 'ICA_REJECTED' ||
                  basicInfo.problemStatus === 'PCA_REJECTED'
                    ? basicInfo.approvedRemark
                    : basicInfo.operatedRemark}
                </span>
              )}
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
