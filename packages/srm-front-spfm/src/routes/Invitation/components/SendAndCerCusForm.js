import React, { Component } from 'react';
import { Form, Col, Row } from 'hzero-ui';

import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
// eslint-disable-next-line no-unused-vars
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
  unitCode: ['SPFM.PARTNER_INVITE.SENDCERTOP'],
})
@Form.create({ fieldNameProp: null })
// eslint-disable-next-line no-unused-vars
export default class DataForm extends Component {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { customizeForm, dataSource = {}, form } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { inviteReg = {}, roleTypeMeaning, levelTypeFlag, privateFlag } = dataSource;
    const {
      autosendPartnerInviteFlag,
      companyName,
      autosendInvestigateFlag,
      investigateTypeMeaning,
      templateName,
      multiSupplierCategoryDesc,
      categoryName,
      purchaseAgentNameJoint,
      purchaseAgentPhone,
      creationDate,
      inviteRegisterRemark,
      internationalTelMeaning,
      autobuildPartnerFlag,
      toCycleStageDescription,
    } = inviteReg;
    return customizeForm(
      { code: 'SPFM.PARTNER_INVITE.SENDCERTOP', form, dataSource },
      <Form style={{ maxWidth: 1000 }} className={styles['invite-header-form']}>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get('spfm.disposeInvite.model.topinfo.autosendPartnerInviteFlag')
                .d('发送邀约')}
            >
              {getFieldDecorator('autosendPartnerInviteFlag')(
                <span>{yesOrNoRender(autosendPartnerInviteFlag)}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('spfm.disposeInvite.model.topinfo.companyName').d('邀请方')}
            >
              {getFieldDecorator('companyName')(<span>{companyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get('spfm.disposeInvite.model.topinfo.purchaseAgentPhone')
                .d('采购员联系方式')}
            >
              {getFieldDecorator('purchaseAgentPhone')(
                <span>{`${internationalTelMeaning} | ${purchaseAgentPhone}`}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('spfm.disposeInvite.model.topinfo.levelTypeFlag').d('是否集团级')}
            >
              {getFieldDecorator('levelTypeFlag')(
                <span>{yesOrNoRender(levelTypeFlag ? 0 : 1)}</span>
              )}
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
              {getFieldDecorator('autosendInvestigateFlag')(
                <span>{yesOrNoRender(autosendInvestigateFlag)}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('spfm.disposeInvite.model.topinfo.investigateType').d('调查表类型')}
            >
              {getFieldDecorator('investigateTypeMeaning')(<span>{investigateTypeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('spfm.disposeInvite.model.topinfo.templateName').d('调查表模板')}
            >
              {getFieldDecorator('templateName')(<span>{templateName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get('spfm.disposeInvite.model.topinfo.multiSupplierCategoryDesc')
                .d('供应商分类')}
            >
              {getFieldDecorator('multiSupplierCategoryDesc')(
                <span>{multiSupplierCategoryDesc}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('spfm.disposeInvite.model.topinfo.categoryName').d('准入品类')}
            >
              {getFieldDecorator('categoryName')(<span>{categoryName}</span>)}
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
              label={intl.get('spfm.disposeInvite.model.topinfo.creationDate').d('邀请时间')}
            >
              {getFieldDecorator('creationDate')(
                <span>{creationDate ? dateRender(creationDate) : null}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('spfm.disposeInvite.model.topinfo.roleType').d('供应商角色')}
            >
              {getFieldDecorator('roleType')(<span>{roleTypeMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get('spfm.disposeInvite.model.topinfo.inviteRegisterRemark')
                .d('邀请备注')}
            >
              {getFieldDecorator('inviteRegisterRemark')(<span>{inviteRegisterRemark}</span>)}
            </Form.Item>
          </Col>
          {autosendPartnerInviteFlag === 1 && autosendInvestigateFlag === 0 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl
                  .get('spfm.disposeInvite.model.invitation.autoPartnerFlag')
                  .d('自动建立合作伙伴关系')}
              >
                {getFieldDecorator('autobuildPartnerFlag')(
                  <span>{yesOrNoRender(autobuildPartnerFlag)}</span>
                )}
              </Form.Item>
            </Col>
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`spfm.invitationRegister.model.invitation.lifeCycle`).d('生命周期')}
            >
              {getFieldDecorator('toCycleStageId')(<span>{toCycleStageDescription}</span>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
