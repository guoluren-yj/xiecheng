/*
 * InviteRegisterModal - 邀请注册弹窗
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import {
  Form,
  Select,
  TextField,
  Lov,
  SelectBox,
  TextArea,
  TelField,
  notification,
} from 'choerodon-ui/pro';
import { Alert, Card } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isFunction, isArray, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { TopSection, SecondSection } from '_components/Section';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { checkClassify } from '@/services/supplierInviteManageServices';

import RiskProfile from './RiskProfile';
import styles from '../index.less';

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
export default class InviteRegisterModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRiskCard: false, // 展示卡片
    };
  }

  componentDidMount() {}

  // 供应商名称切换
  @Bind()
  handleSuplierNameChange(value) {
    const { dataSet } = this.props;
    if (Number(value)) {
      let checkFlag = true;
      // 校验供应商名称必填
      const current = dataSet?.current;
      if (current) {
        const supplierName = current.get('supplierName');
        if (supplierName) {
          checkFlag = false;
          // 展示风险扫描卡片
          this.setState({ showRiskCard: true });
        }
      }
      // 没维护供应商名称报错，展示风险档案卡片字段置为否
      if (checkFlag) {
        notification.warning({
          placement: 'bottomRight',
          message: intl
            .get('sslm.supplierInvite.view.message.maintainSupplierName')
            .d('请先维护供应商企业字段'),
        });
        if (current) {
          current.set({ showRiskScanCard: '0' });
        }
      }
    } else {
      this.setState({ showRiskCard: false });
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
    const { customizeForm = () => {}, dataSet } = this.props;

    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_OFFER_INFO',
        enableCreate: false,
        __force_record_to_update__: true,
        // proxyDsCreate,
      },
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
          hidden={!(!autobuildPartnerFlag && autosendPartnerInviteFlag && autosendInvestigateFlag)}
        />
      </Form>
    );
  }

  render() {
    const {
      remote,
      dataSet,
      record = {},
      customizeForm = () => {},
      proxyDsCreate = {},
      getHocInstance,
      cardCode = '',
      history,
    } = this.props;
    const { showRiskCard = false } = this.state;
    const { companyName: message } = record;
    const current = dataSet?.current || {};

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
    const registerSupplierTips = intl
      .get('sslm.supplierInvite.model.invite.registerSupplier', { message })
      .d(`邀请注册的供应商，其邀约信息优先取邀请注册的配置，不再执行注册策略的邀约配置`);
    const newCategoryTableProps = {
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
    };
    const categoryTableProps = remote
      ? remote.process(
          'SSLM.SUPPLIER_INVITE_MANAGE_INVITE_REGISTER_MODAL_CATEGORY_TABLE_PROPS',
          newCategoryTableProps
        )
      : newCategoryTableProps;
    return (
      <React.Fragment>
        <Alert
          banner
          showIcon
          closable
          type="info"
          iconType="help"
          message={registerSupplierTips}
          className={styles['form-alert']}
        />
        <div className={styles['modal-c7n-card']}>
          <TopSection code={cardCode} getHocInstance={getHocInstance}>
            <SecondSection
              code="suppliersSalesmen"
              title={intl
                .get('sslm.supplierInvite.model.invite.suppliersSalesmen')
                .d('供应商及销售员')}
            >
              <Card bordered={false}>
                {customizeForm(
                  {
                    code: 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_SUP_SAL_FORM',
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
                    <TextField name="supplierErpCode" />
                    <Select name="roleType" />
                    <TextField name="salesPersonName" />
                    <TelField name="salesPersonPhone" />
                    <TextField name="supplierMail" />
                    <Lov name="childRoleId" />
                  </Form>
                )}
              </Card>
            </SecondSection>
            <SecondSection
              code="riskProfile"
              title={intl.get('spfm.companySearch.view.message.riskScan').d('风险扫描')}
            >
              <Card bordered={false}>
                <Form
                  dataSet={dataSet}
                  columns={3}
                  labelLayout="float"
                  style={{
                    width: '75%',
                    marginBottom: 8,
                  }}
                >
                  <Select name="showRiskScanCard" onChange={this.handleSuplierNameChange} />
                </Form>
                {showRiskCard && <RiskProfile record={current} history={history} />}
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
                    code: 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_INV_PUR',
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
                    <Lov name="companyIdLov" />
                    <Lov name="inviteCompanyLov" />
                    <Lov name="purchaseAgentIdLov" />
                    <TelField name="purchaseAgentPhone" />
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
                    code: 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_OTHERINFO',
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
                    <Select name="investigateType" hidden={hiddenInvestigateFlag} />
                    <Lov name="investigateTemplateIdLov" hidden={hiddenInvestigateFlag} />
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
                      tableProps={categoryTableProps}
                    />
                    <Select name="toCycleStageId" />
                    {/* <TextArea name="remark" newLine colSpan={3} hidden={!inviteSupplierFlag} /> */}
                    <TextArea name="inviteInvestigateRemark" newLine colSpan={3} />
                    {/* <TextArea
                      name="inviteRemark"
                      newLine
                      colSpan={3}
                      hidden={!inviteSupplierFlag}
                    /> */}
                    <TextArea name="inviteRegisterRemark" newLine colSpan={3} />
                    {remote &&
                      remote.process(
                        'SSLM.SUPPLIER_INVITE_MANAGE_INVITE_REGISTER_MODAL_FORM',
                        null,
                        {
                          _this: this,
                        }
                      )}
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
