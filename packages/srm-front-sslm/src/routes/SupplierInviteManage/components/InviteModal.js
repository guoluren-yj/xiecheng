/*
 * InviteModal - 邀约弹窗
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Select, TextField, Lov, SelectBox, TextArea, TelField } from 'choerodon-ui/pro';
import { Alert, Card } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isFunction, isArray, isEmpty, head } from 'lodash';
import { Bind } from 'lodash-decorators';
import { TopSection, SecondSection } from '_components/Section';

import intl from 'utils/intl';
import { getResponse, getCurrentLanguage } from 'utils/utils';

import { checkClassify } from '@/services/supplierInviteManageServices';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';

import RiskProfile from './RiskProfile';
import styles from '../index.less';

const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境

/**
 * 邀约弹窗
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
@observer
export default class InviteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 销售员改变时，判断邀请方是单选还是多选，对邀约方数据进行转换
  // 邀约方改变时，判断销售员是单选还是多选，对销售员数据进行转换
  @Bind()
  handleValueChange(name) {
    const { dataSet, inviteSupplierFlag = true } = this.props;
    // 发现供应商-发起邀约
    if (inviteSupplierFlag) {
      const record = dataSet?.current;
      const nameMultiple = dataSet?.getField(name)?.get('multiple', record);
      // 不用get取值，get取值为可观察数组，不好判断是对象还是数组
      const nameValue = record?.toData()[name];
      if (!isEmpty(nameValue) && record) {
        if (nameMultiple) {
          if (!isArray(nameValue)) {
            record.set({ [name]: [nameValue] });
          }
        } else if (isArray(nameValue)) {
          record.set({ [name]: head(nameValue) });
        }
      }
    }
  }

  @Bind()
  handleInviteInfoForm(params = {}) {
    const {
      autosendPartnerInviteFlag,
      autosendInvestigateFlag,
      levelTypeFlag,
      autobuildPartnerFlag,
    } = params;
    const {
      customizeForm = () => {},
      // proxyDsCreate = {},
      dataSet,
      inviteSupplierFlag = true,
    } = this.props;

    return customizeForm(
      {
        code: inviteSupplierFlag
          ? 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.OFFER_INFORMATION'
          : 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_OFFER_INFO',
        enableCreate: false,
        __force_record_to_update__: true,
        // proxyDsCreate,
      },
      inviteSupplierFlag ? (
        <Form
          dataSet={dataSet}
          columns={3}
          labelLayout="float"
          className={styles['card-invite-form']}
          style={{
            width: '75%',
          }}
        >
          <SelectBox key="levelTypeFlag" name="levelTypeFlag" />
          <SelectBox
            key="mergerInvitationFlag"
            name="mergerInvitationFlag"
            hidden={levelTypeFlag}
          />
          <SelectBox key="autosendInvestigateFlag" name="autosendInvestigateFlag" />
        </Form>
      ) : (
        <Form
          dataSet={dataSet}
          columns={3}
          labelLayout="float"
          className={styles['card-invite-form']}
          style={{
            width: '75%',
          }}
        >
          <SelectBox key="autobuildPartnerFlag" name="autobuildPartnerFlag" />
          <SelectBox
            key="autosendPartnerInviteFlag"
            name="autosendPartnerInviteFlag"
            // 【自动建立合作伙伴关系】为“是”时隐藏
            hidden={autobuildPartnerFlag}
          />
          <SelectBox
            key="levelTypeFlag"
            name="levelTypeFlag"
            // 【自动建立合作关系】和【发送邀约】都为”否“时隐藏
            hidden={!autosendPartnerInviteFlag && !autobuildPartnerFlag}
          />
          <SelectBox
            key="mergerInvitationFlag"
            name="mergerInvitationFlag"
            // 【自动建立合作伙伴关系】为“否”，【发送邀约】为“是”展示 【集团级】为否，否则都隐藏
            hidden={!(!autobuildPartnerFlag && autosendPartnerInviteFlag && !levelTypeFlag)}
          />
          <SelectBox
            key="autosendInvestigateFlag"
            name="autosendInvestigateFlag"
            // 【自动建立合作关系】为“否”，【发送邀约】为“是”时展示
            hidden={!(!autobuildPartnerFlag && autosendPartnerInviteFlag)}
          />
          <SelectBox
            key="sendRegisterInvestigateFlag"
            name="sendRegisterInvestigateFlag"
            // 【自动建立合作关系】为“是”时展示，否则不展示
            hidden={!autobuildPartnerFlag}
          />
          <SelectBox
            key="cancelRegisterInvestigateFlag"
            name="cancelRegisterInvestigateFlag"
            // 【自动建立合作伙伴关系】为“否”，【发送邀约】为“是”，【发送邀约调查表】为“是”时展示
            hidden={
              !(!autobuildPartnerFlag && autosendPartnerInviteFlag && autosendInvestigateFlag)
            }
          />
        </Form>
      )
    );
  }

  render() {
    const {
      remote,
      dataSet,
      sourceKey,
      // 邀请供应商合作标识，默认是
      inviteSupplierFlag = true,
      record = {},
      customizeForm = () => {},
      proxyDsCreate = {},
      getHocInstance,
      cardCode = '',
      history,
      showTagFlag,
    } = this.props;
    const { companyName: message, zhimaLabels } = record;
    const current = dataSet?.current || {};
    const tagShowFlag = !isEmpty(zhimaLabels) && showTagFlag && isChinese;

    const {
      autosendPartnerInviteFlag: oldAutosendPartnerInviteFlag,
      autosendInvestigateFlag: oldAutosendInvestigateFlag,
      levelTypeFlag: oldLevelTypeFlag,
      autobuildPartnerFlag,
      sendRegisterInvestigateFlag: oldSendRegisterInvestigateFlag,
    } =
      (isFunction(current?.get) &&
        current?.get([
          'autosendPartnerInviteFlag',
          'autosendInvestigateFlag',
          'levelTypeFlag',
          'autobuildPartnerFlag',
          'sendRegisterInvestigateFlag',
        ])) ||
      {};
    const autosendPartnerInviteFlag = Number(oldAutosendPartnerInviteFlag)
      ? !!Number(oldAutosendPartnerInviteFlag)
      : false;
    const autosendInvestigateFlag = Number(oldAutosendInvestigateFlag)
      ? !!Number(oldAutosendInvestigateFlag)
      : false;
    const sendRegisterInvestigateFlag = !!Number(oldSendRegisterInvestigateFlag);
    const hiddenInvestigateFlag = !autosendInvestigateFlag && !sendRegisterInvestigateFlag;
    const levelTypeFlag = Number(oldLevelTypeFlag) ? !!Number(oldLevelTypeFlag) : false;
    const newAutobuildPartnerFlag = !!Number(autobuildPartnerFlag);
    const tips = intl
      .get('sslm.supplierInvite.model.invite.becomeSupplier', { message })
      .d(`您正在向【${message}】发出合作邀约，邀请它成为你的【供应商】`);
    const registerSupplierTips = intl
      .get('sslm.supplierInvite.model.invite.registerSupplier', { message })
      .d(`邀请注册的供应商，其邀约信息优先取邀请注册的配置，不再执行注册策略的邀约配置`);

    return (
      <React.Fragment>
        <Alert
          banner
          showIcon
          closable
          type="info"
          iconType="help"
          message={inviteSupplierFlag ? tips : registerSupplierTips}
          className={styles['form-alert']}
        />
        <div className={styles['modal-c7n-card']}>
          {tagShowFlag && (
            <div className={styles['enterprise-tags-wrap']}>
              <div className={styles['enterprise-tags-title']}>{message}</div>
              <EnterpriseTags
                key={sourceKey}
                tagList={zhimaLabels}
                parentId="sslmSupplierInfoModal"
                tagClassName="sslm-supplier-info-modal"
              />
            </div>
          )}
          <TopSection code={cardCode} getHocInstance={getHocInstance}>
            <SecondSection code="riskProfile">
              <RiskProfile record={current} history={history} />
            </SecondSection>
            <SecondSection
              code="suppliersSalesmen"
              title={intl
                .get('sslm.supplierInvite.model.invite.suppliersSalesmen')
                .d('供应商及销售员')}
            >
              <Card bordered={false}>
                {customizeForm(
                  {
                    code: inviteSupplierFlag
                      ? 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.SUP_SAL_FORM'
                      : 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_SUP_SAL_FORM',
                    enableCreate: false,
                    __force_record_to_update__: true,
                  },
                  <Form
                    dataSet={dataSet}
                    columns={3}
                    labelLayout="float"
                    style={{
                      width: '75%',
                    }}
                  >
                    <TextField name="supplierName" />
                    <TextField name="supplierErpCode" hidden={inviteSupplierFlag} />
                    <Select name="roleType" />
                    <Lov
                      name="salesPersonIdsLov"
                      hidden={!inviteSupplierFlag}
                      onChange={() => this.handleValueChange('companyIdLov')}
                    />
                    <TextField name="salesPersonName" hidden={inviteSupplierFlag} />
                    <TelField name="salesPersonPhone" />
                    <TextField name="supplierMail" hidden={inviteSupplierFlag} />
                    <TextField name="salesPersonEmail" hidden={!inviteSupplierFlag} />
                    <Lov name="childRoleId" />
                  </Form>
                )}
              </Card>
            </SecondSection>
            <SecondSection
              code="inviteInfo"
              title={intl.get('sslm.supplierInvite.model.invite.inviteInfo').d('邀约信息')}
            >
              <Card bordered={false}>
                {/* 拆分邀请注册和邀请供应商表单 */}
                {this.handleInviteInfoForm({
                  autosendPartnerInviteFlag,
                  autosendInvestigateFlag,
                  levelTypeFlag,
                  autobuildPartnerFlag: newAutobuildPartnerFlag,
                })}
              </Card>
            </SecondSection>
            <SecondSection
              code="invitePurchaser"
              title={intl
                .get('sslm.supplierInvite.model.invite.invitePurchaser')
                .d('邀请方及采购员')}
            >
              <Card bordered={false}>
                {customizeForm(
                  {
                    code: inviteSupplierFlag
                      ? 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.INV_PUR_FORM'
                      : 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_INV_PUR',
                    enableCreate: false,
                    __force_record_to_update__: true,
                    proxyDsCreate,
                  },
                  <Form
                    dataSet={dataSet}
                    columns={3}
                    labelLayout="float"
                    style={{
                      width: '75%',
                    }}
                  >
                    <Lov
                      name="companyIdLov"
                      onChange={() => this.handleValueChange('salesPersonIdsLov')}
                    />
                    <Lov hidden={inviteSupplierFlag} name="inviteCompanyLov" />
                    <Lov name="purchaseAgentIdLov" />
                    <TextField
                      hidden={inviteSupplierFlag}
                      addonBefore={<Select name="internationalTelCode" clearButton={false} />}
                      name="purchaseAgentPhone"
                    />
                  </Form>
                )}
              </Card>
            </SecondSection>
            <SecondSection
              code="otherInfo"
              title={intl.get('sslm.supplierInvite.model.invite.otherInfo').d('其他信息')}
            >
              <Card bordered={false}>
                {customizeForm(
                  {
                    code: inviteSupplierFlag
                      ? 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.OTHERINFO'
                      : 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_OTHERINFO',
                    enableCreate: false,
                    __force_record_to_update__: true,
                  },
                  <Form
                    dataSet={dataSet}
                    columns={3}
                    labelLayout="float"
                    style={{
                      width: '75%',
                    }}
                  >
                    <Select
                      name="investigateType"
                      hidden={!inviteSupplierFlag && hiddenInvestigateFlag}
                    />
                    <Lov
                      name="investigateTemplateIdLov"
                      hidden={!inviteSupplierFlag && hiddenInvestigateFlag}
                    />
                    <Lov
                      name="multiSupplierCategoryIdLov"
                      searchFieldInPopup
                      tableProps={{
                        treeAsync: true,
                        alwaysShowRowBox: true,
                        selectionMode: 'rowbox',
                        onRow: ({ record: tableRecord }) => {
                          const nodeProps = { disabled: false };
                          if (tableRecord.get('hasChild') === 0) {
                            nodeProps.isLeaf = true;
                          }
                          return nodeProps;
                        },
                      }}
                      onOption={({ record: optionRecord }) => {
                        return {
                          disabled: !optionRecord.get('checkFlag'),
                        };
                      }}
                      onBeforeSelect={async tableRecord => {
                        if (!isEmpty(tableRecord)) {
                          const supplierCategoryIdList = [];
                          if (isArray(tableRecord)) {
                            tableRecord.forEach(item => {
                              const supplierCategoryId = item.get('categoryId');
                              supplierCategoryIdList.push(supplierCategoryId);
                            });
                          } else {
                            const supplierCategoryId = tableRecord.get('categoryId');
                            supplierCategoryIdList.push(supplierCategoryId);
                          }
                          const res = await checkClassify({ supplierCategoryIdList });
                          if (getResponse(res)) {
                            return true;
                          } else {
                            return false;
                          }
                        } else {
                          return true;
                        }
                      }}
                    />
                    <Lov
                      name="categoryIdLov"
                      searchFieldInPopup
                      onOption={({ record: optionRecord }) => {
                        return {
                          disabled: optionRecord.get('isCheck') === false,
                        };
                      }}
                      tableProps={{
                        virtual: true,
                        virtualCell: true,
                        treeAsync: true,
                        onRow: ({ record: tableRecord }) => {
                          const nodeProps = {};
                          if (tableRecord.get('hasChild') === '0') {
                            nodeProps.isLeaf = true;
                          }
                          return nodeProps;
                        },
                      }}
                    />
                    <Select name="toCycleStageId" />
                    <TextArea name="remark" newLine colSpan={3} hidden={!inviteSupplierFlag} />
                    <TextArea
                      name="inviteInvestigateRemark"
                      newLine
                      colSpan={3}
                      hidden={inviteSupplierFlag}
                    />
                    <TextArea
                      name="inviteRemark"
                      newLine
                      colSpan={3}
                      hidden={!inviteSupplierFlag}
                    />
                    <TextArea
                      name="inviteRegisterRemark"
                      newLine
                      colSpan={3}
                      hidden={inviteSupplierFlag}
                    />
                    {remote &&
                      remote.process('SSLM.SUPPLIER_INVITE_MANAGE_INVITE_MODAL_FORM', null, {
                        _this: this,
                      })}
                  </Form>
                )}
              </Card>
            </SecondSection>
          </TopSection>
        </div>
      </React.Fragment>
    );
  }
}
