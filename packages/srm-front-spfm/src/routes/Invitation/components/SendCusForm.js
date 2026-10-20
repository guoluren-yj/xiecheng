import React, { Component } from 'react';
import { Form, Col, Row } from 'hzero-ui';

import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import styles from '../index.less';

/**
 * 员工基本信息表单
 * @extends {Component} - React.Component
 * @reactProps {!Object} employeeInfo - 数据源
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@withCustomize({
  unitCode: ['SPFM.PARTNER_INVITE.SENDTOP', 'SPFM.PARTNER_INVITE.SENDSUPTOP'],
})
@Form.create({ fieldNameProp: null })
export default class DataForm extends Component {
  componentDidMount() {
    const { form, onRef } = this.props;
    onRef(form);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { customizeForm, dataSource = {}, form } = this.props;
    const { getFieldDecorator } = this.props.form;
    const {
      levelTypeFlag,
      purchaseAgentNameJoint,
      privateFlag,
      companyName,
      creationDate,
      roleType,
      roleTypeMeaning,
      inviteRemark,
      investigateTemplateName,
      sendInvestigateTemplateFlag,
      investigateTypeMeaning,
      investigateCategoryName,
      multiSupplierCategoryDesc,
      inviteType,
      toCycleStageDescription,
      toCycleStageId,
    } = dataSource;
    return inviteType === 'CUSTOMER'
      ? customizeForm(
          { code: 'SPFM.PARTNER_INVITE.SENDTOP', form, dataSource },
          <Form style={{ maxWidth: 1000 }} className={styles['invite-header-form']}>
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.companyName').d('邀请方')}
                >
                  {getFieldDecorator('companyName', {
                    initialValue: companyName,
                  })(<span>{companyName}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.creationDate').d('邀请时间')}
                >
                  {getFieldDecorator('creationDate', {
                    initialValue: creationDate,
                  })(<span>{creationDate ? dateRender(creationDate) : null}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.roleType').d('供应商角色')}
                >
                  {getFieldDecorator('roleType', {
                    initialValue: roleType,
                  })(<span>{roleTypeMeaning}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('spfm.disposeInvite.model.topinfo.inviteRegisterRemark')
                    .d('邀请备注')}
                >
                  {getFieldDecorator('inviteRegisterRemark', {
                    initialValue: inviteRemark,
                  })(<span>{inviteRemark}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('spfm.disposeInvite.model.topinfo.levelTypeFlagSupplier')
                    .d('是否集团级供应商')}
                >
                  {getFieldDecorator('levelTypeFlagSupplier', {
                    initialValue: levelTypeFlag,
                  })(<span>{yesOrNoRender(levelTypeFlag ? 0 : 1)}</span>)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )
      : customizeForm(
          { code: 'SPFM.PARTNER_INVITE.SENDSUPTOP', form, dataSource },
          <Form style={{ maxWidth: 1000 }} className={styles['invite-header-form']}>
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.companyName').d('邀请方')}
                >
                  {getFieldDecorator('companyName', {
                    initialValue: companyName,
                  })(<span>{companyName}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.levelTypeFlag').d('是否集团级')}
                >
                  {getFieldDecorator('levelTypeFlag', {
                    initialValue: levelTypeFlag,
                  })(<span>{yesOrNoRender(levelTypeFlag ? 0 : 1)}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.privateFlag').d('私有化')}
                >
                  {getFieldDecorator('privateFlag', {
                    initialValue: privateFlag,
                  })(<span>{yesOrNoRender(privateFlag)}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('spfm.disposeInvite.model.topinfo.autosendInvestigateFlag')
                    .d('是否发送调查表')}
                >
                  {getFieldDecorator('autosendInvestigateFlag', {
                    initialValue: sendInvestigateTemplateFlag,
                  })(<span>{yesOrNoRender(sendInvestigateTemplateFlag)}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('spfm.disposeInvite.model.topinfo.investigateType')
                    .d('调查表类型')}
                >
                  {getFieldDecorator('investigateTypeMeaning', {
                    initialValue: investigateTypeMeaning,
                  })(<span>{investigateTypeMeaning}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.templateName').d('调查表模板')}
                >
                  {getFieldDecorator('templateName', {
                    initialValue: investigateTemplateName,
                  })(<span>{investigateTemplateName}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.categoryName').d('准入品类')}
                >
                  {getFieldDecorator('categoryName', {
                    initialValue: investigateCategoryName,
                  })(<span>{investigateCategoryName}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.purchaseAgent').d('采购员')}
                >
                  {getFieldDecorator('purchaseAgent')(<span>{purchaseAgentNameJoint}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('spfm.disposeInvite.model.topinfo.multiSupplierCategoryDesc')
                    .d('供应商分类')}
                >
                  {getFieldDecorator('multiSupplierCategoryDesc', {
                    initialValue: multiSupplierCategoryDesc,
                  })(<span>{multiSupplierCategoryDesc}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.creationDate').d('邀请时间')}
                >
                  {getFieldDecorator('creationDate', {
                    initialValue: creationDate,
                  })(<span>{creationDate ? dateRender(creationDate) : null}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.roleType').d('供应商角色')}
                >
                  {getFieldDecorator('roleType', {
                    initialValue: roleType,
                  })(<span>{roleTypeMeaning}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('spfm.disposeInvite.model.topinfo.inviteRegisterRemark')
                    .d('邀请备注')}
                >
                  {getFieldDecorator('inviteRegisterRemark', {
                    initialValue: inviteRemark,
                  })(<span>{inviteRemark}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get(`spfm.invitationRegister.model.invitation.lifeCycle`)
                    .d('生命周期')}
                >
                  {getFieldDecorator('toCycleStageId', {
                    initialValue: toCycleStageId,
                  })(<span>{toCycleStageDescription}</span>)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        );
  }
}
