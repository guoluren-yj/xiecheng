/*
 * inviteInfo - 邀约信息
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Output, Spin } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentLanguage } from 'utils/utils';

import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';

import styles from '../index.less';

const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境

/**
 * 邀约信息
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
export default class InviteInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    const { dataSet, inviteId } = this.props;
    if (inviteId) {
      this.setState({
        loading: true,
      });
      dataSet.setQueryParameter('inviteId', inviteId);
      dataSet.query().finally(() => {
        this.setState({ loading: false });
      });
    }
  }

  render() {
    const {
      dataSet,
      showTagFlag,
      customizeForm = () => {},
      inviteType,
      zhimaLabels,
      supplierCompanyName,
    } = this.props;
    const { loading } = this.state;
    const inviteRegisterFlag = inviteType === 'REGISTER';
    const inviteSupplierFlag = inviteType === 'SUPPLIER';
    const inviteCustomerFlag = inviteType === 'CUSTOMER';
    const notinviteRegisterFlag = inviteType !== 'REGISTER';
    const tagShowFlag = showTagFlag && !isEmpty(zhimaLabels) && isChinese;
    // 个性化单元后续可能更换，目前先和发现供应商那边用一个
    // 这里查看区分3种场景，邀请注册，邀请供应商，邀请客户。
    // 其中邀请邀请注册弹窗字段单独展示，邀请供应商和邀请客户目前字段一样，只是没有邀请客户没有个性化单元
    // eslint-disable-next-line no-unused-vars
    let suppliersSalesmenCode = '';
    let inviteInfoCode = '';
    let invitePurchaserCode = '';
    let otherInfoCode = '';
    if (inviteRegisterFlag) {
      suppliersSalesmenCode = 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_SUP_SAL_FORM';
      inviteInfoCode = 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_OFFER_INFO';
      invitePurchaserCode = 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_INV_PUR';
      otherInfoCode = 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_OTHERINFO';
    } else if (inviteSupplierFlag) {
      suppliersSalesmenCode = 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.SUP_SAL_FORM';
      inviteInfoCode = 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.OFFER_INFORMATION';
      invitePurchaserCode = 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.INV_PUR_FORM';
      otherInfoCode = 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.OTHERINFO';
    }
    // 非邀请注册
    return (
      <React.Fragment>
        <Spin spinning={loading}>
          {tagShowFlag && (
            <div className={styles['enterprise-tags-wrap']}>
              <div className={styles['enterprise-tags-title']}>{supplierCompanyName}</div>
              <EnterpriseTags
                key="INVITE_INFO"
                tagList={zhimaLabels}
                parentId="sslmInviteInfo"
                tagClassName="sslm-invite-info"
              />
            </div>
          )}
          <div className={styles['modal-c7n-card']}>
            <Card
              bordered={false}
              title={intl
                .get('sslm.supplierInvite.model.invite.suppliersSalesmen')
                .d('供应商及销售员')}
            >
              {customizeForm(
                {
                  code: suppliersSalesmenCode,
                  readOnly: true,
                },
                <Form
                  dataSet={dataSet}
                  columns={3}
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                >
                  <Output name="supplierName" />
                  {/* 供应商EPR编码在邀请供应商不展示 */}
                  <Output name="supplierErpCode" hidden={notinviteRegisterFlag} />
                  <Output name="roleType" />
                  <Output name="salesPersonName" hidden={notinviteRegisterFlag} />
                  <Output name="salesPersonIdsLov" hidden={!notinviteRegisterFlag} />
                  <Output name="salesPersonPhone" />
                  <Output name="supplierMail" hidden={notinviteRegisterFlag} />
                  <Output name="salesPersonEmail" hidden={!notinviteRegisterFlag} />
                  <Output name="childRoleId" />
                </Form>
              )}
            </Card>
            <Card
              bordered={false}
              title={intl.get('sslm.supplierInvite.model.invite.inviteInfo').d('邀约信息')}
            >
              {customizeForm(
                {
                  code: inviteInfoCode,
                  readOnly: true,
                },
                <Form
                  dataSet={dataSet}
                  columns={3}
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                >
                  <Output
                    key="autobuildPartnerFlag"
                    name="autobuildPartnerFlag"
                    renderer={({ value }) => {
                      return yesOrNoRender(Number(value) ? 1 : 0);
                    }}
                    hidden={notinviteRegisterFlag}
                  />
                  <Output
                    key="autosendPartnerInviteFlag"
                    name="autosendPartnerInviteFlag"
                    renderer={({ value }) => {
                      return yesOrNoRender(Number(value) ? 1 : 0);
                    }}
                    hidden={notinviteRegisterFlag}
                  />
                  <Output
                    key="levelTypeFlag"
                    name="levelTypeFlag"
                    renderer={({ value }) => {
                      return yesOrNoRender(Number(value) ? 0 : 1);
                    }}
                  />
                  <Output
                    key="sendRegisterInvestigateFlag"
                    name="sendRegisterInvestigateFlag"
                    renderer={({ value }) => {
                      return yesOrNoRender(Number(value) ? 1 : 0);
                    }}
                    hidden={notinviteRegisterFlag}
                  />
                  <Output
                    key="mergerInvitationFlag"
                    name="mergerInvitationFlag"
                    renderer={({ value }) => {
                      return yesOrNoRender(Number(value) ? 1 : 0);
                    }}
                    hidden={inviteCustomerFlag}
                  />
                  <Output
                    key="autosendInvestigateFlag"
                    name="autosendInvestigateFlag"
                    renderer={({ value }) => {
                      return yesOrNoRender(Number(value) ? 1 : 0);
                    }}
                  />
                  <Output
                    key="cancelRegisterInvestigateFlag"
                    name="cancelRegisterInvestigateFlag"
                    renderer={({ value }) => {
                      return yesOrNoRender(Number(value) ? 1 : 0);
                    }}
                    hidden={notinviteRegisterFlag}
                  />
                </Form>
              )}
            </Card>
            <Card
              bordered={false}
              title={intl
                .get('sslm.supplierInvite.model.invite.invitePurchaser')
                .d('邀请方及采购员')}
            >
              {customizeForm(
                {
                  code: invitePurchaserCode,
                  readOnly: true,
                },
                <Form
                  dataSet={dataSet}
                  columns={3}
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                >
                  <Output name="companyIdLov" />
                  <Output name="inviteCompanyLov" hidden={notinviteRegisterFlag} />
                  <Output name="purchaseAgentIdLov" />
                  <Output hidden={notinviteRegisterFlag} name="purchaseAgentPhone" />
                </Form>
              )}
            </Card>
            <Card
              bordered={false}
              title={intl.get('sslm.supplierInvite.model.invite.otherInfo').d('其他信息')}
            >
              {customizeForm(
                {
                  code: otherInfoCode,
                  readOnly: true,
                },
                <Form
                  dataSet={dataSet}
                  columns={3}
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                >
                  <Output
                    name="investigateType"
                    // hidden={!notinviteRegisterFlag && !autosendPartnerInviteFlag}
                  />
                  <Output
                    name="investigateTemplateIdLov"
                    // hidden={!notinviteRegisterFlag && !autosendPartnerInviteFlag}
                  />
                  <Output
                    name="multiSupplierCategoryIdLov"
                    // hidden={!notinviteRegisterFlag && !autosendPartnerInviteFlag}
                  />
                  <Output
                    name="categoryIdLov"
                    colSpan={2}
                    // hidden={!notinviteRegisterFlag && !autosendPartnerInviteFlag}
                  />
                  <Output name="toCycleStageId" hidden={inviteCustomerFlag} />
                  <Output name="remark" newLine colSpan={2} hidden={!notinviteRegisterFlag} />
                  <Output
                    name="inviteInvestigateRemark"
                    newLine
                    colSpan={2}
                    hidden={notinviteRegisterFlag}
                  />
                  <Output name="inviteRemark" newLine colSpan={2} hidden={!notinviteRegisterFlag} />
                  <Output
                    name="inviteRegisterRemark"
                    newLine
                    colSpan={3}
                    hidden={notinviteRegisterFlag}
                  />
                </Form>
              )}
            </Card>
          </div>
        </Spin>
      </React.Fragment>
    );
  }
}
