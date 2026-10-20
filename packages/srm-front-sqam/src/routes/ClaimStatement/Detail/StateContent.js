/**
 * BasicInfoForm - 基本信息表单
 * @date: 2019-11-4
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, FORM_COL_2_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import classNames from 'classnames';
import UploadModal from '_components/Upload';
import DisplayFormItem from '../../components/DisplayFormItem';

/**
 * 基本信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 */
export default class BasicInfoForm extends PureComponent {
  /**
   * render
   * @returns React.element
   */

  render() {
    const { dataSource = {} } = this.props;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sqam.common.panel.statementContent`).d('申诉内容')}
              value={dataSource.appealContentMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`entity.attachment.view`).d('附件查看')}
              value={
                <UploadModal
                  viewOnly
                  icon="download"
                  attachmentUUID={dataSource.supplierAttachmentUuid}
                  bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                  bucketDirectory="sprm-pr"
                />
              }
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`sqam.common.model.statementOption`).d('申诉意见')}
              value={dataSource.appealOpinion}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
