/*
 * SupplierInviteManage - 供应商邀约管理
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import moment from 'moment';
import React, { Component } from 'react';
import { DataSet, Modal, Tabs, notification, Spin, Button, Form, TextArea } from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import { isArray, toString, isEmpty, isNil, isBoolean } from 'lodash';
import qs from 'querystring';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import remote from 'utils/remote';
import withProps from 'utils/withProps';
import { queryMapIdpValue } from 'services/api';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import { SRM_PLATFORM } from '_utils/config';
import CommonImport from 'components/Import';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'components/ExcelExportPro';

import { batchCheckBlackListSupplier } from '@/routes/components/utils/commonCheckUtils/blackListSupplier';
import TempatePreview from '@/routes/components/Investigation';
import { checkMemberSupplierEnabled, enterpriseTagsConfig } from '@/services/commonService';
import {
  inviteRegisterSupplier,
  handleQueryCount,
  companySearchOwn,
  checkBlackListSupplier,
  batchRejectInvite,
  batchApproveInvite,
  queryRiskMonitorType,
  batchApproveInvestigate,
  checkPartner,
  inviteSupplier,
  checkRiskEmbed,
  checkJoinedMointor,
  fetchLastRiskScanInfo,
  fetchLastRiskScanDate,
  handleRiskEmbedPage,
} from '@/services/supplierInviteManageServices';
import { queryCurrentUserPurchaseAgent } from '@/services/supplierEntryService';
import {
  findSupplierDS,
  certificationDealDS,
  inviteScheduleDS,
  inviteDealDS,
  getInviteRecordDS,
} from './stores/indexDS';
import { inviteModalDS, registerModalDS } from './FindSupplier/stores/indexDS';
import { inviteRejectModalDS, supplementInvestigModalDS } from './InviteDeal/Detail/stores/indexDS';
import FindSupplier from './FindSupplier';
import InviteQuery from './InviteQuery';
import InviteRegisterModal from './components/InviteRegisterModal';
import InviteModal from './components/InviteModal';
import InviteDeal from './InviteDeal';
import MemberSupplier from './MemberSupplier';
import CertificationDeal from './CertificationDeal';
import SupplementModal from './components/SupplementModal';
import Footer from './components/ModalFooter';
import { getEnterpriseDS, getProductDS } from './stores/memberSupplierDS';

const organizationId = getCurrentOrganizationId();
const sourceKey = 'SUPPLIER_INVITE_MANAGE';

/**
 * 供应商邀约管理
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
@formatterCollections({
  code: [
    'sslm.supplierInvite',
    'spfm.companySearch',
    'sslm.enterpriseInform',
    'spfm.invitationRegister',
    'spfm.enterprise',
    'spfm.approval',
    'spfm.certificationApproval',
    'spfm.supplier',
    'spfm.common',
    'entity.company',
    'spfm.disposeInvite',
    'spfm.invitationList',
    'sslm.common',
    'spfm.supplierInvite',
    'spfm.supplierRegister',
    'spfm.contactPerson',
    'sslm.supplierEntryDetail',
    'sslm.investigCorrelat',
    'sslm.supplierManage',
  ],
})
@WithCustomize({
  unitCode: [
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.SUP_SAL_FORM',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.OTHERINFO',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.OFFER_INFORMATION',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.INV_PUR_FORM',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_INV_PUR',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_OFFER_INFO',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_OTHERINFO',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_SUP_SAL_FORM',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.FIND_SUPPLIER_LIST',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.TABPANE', // 列表页-标签页
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.BTN_GROUP',
    'SSLM.ENT_CER_PRO.LIST.CERTIFICATION_DEAL_TABLE',
    'SSLM.SUP_INV_MAN_INV_PROCESS.LIST_TABLE',
    'SSLM.INVITE_MANAGE_INVITE_QUERY.SUPPLIER_TABLE',
    'SSLM.INVITE_MANAGE_INVITE_QUERY.INVITE_TABLE',
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.INVITE_COOPERATE_CARDS', // 邀约合作卡片
    'SSLM.SUPPLIER_INVITE_MANAGE_LIST.INVITE_REGISTER_CARDS', // 邀请注册-卡片
  ],
})
@withProps(
  () => {
    const supplierDs = new DataSet({
      ...findSupplierDS(),
    });
    const certificationDealDs = new DataSet({
      ...certificationDealDS(),
    });
    const inviteQueryDs = new DataSet({
      ...inviteScheduleDS(),
    });
    const inviteDealDs = new DataSet({
      ...inviteDealDS(),
    });
    const inviteRecordDs = new DataSet(getInviteRecordDS());
    const enterpriseDs = new DataSet(getEnterpriseDS());
    const productDs = new DataSet(getProductDS());
    const mixObj = {
      firstQuery: true, // 是否首次查询
      currentKey: 'findSupplier',
      dimensionValue: 'enterprise',
    };
    return {
      supplierDs,
      productDs,
      enterpriseDs,
      inviteDealDs,
      certificationDealDs,
      inviteQueryDs,
      inviteRecordDs,
      mixObj,
    };
  },
  { cacheState: true }
)
@remote(
  {
    code: 'SSLM.SUPPLIER_INVITE_MANAGE',
    name: 'inviteManageRemote',
  },
  {
    events: {
      cuxRegisterModalOnOk() {}, // 邀请注册onOk回调
      cuxInviteModalOnOk() {}, // 发起邀约onOk回调
    },
  }
)
@observer
export default class SupplierInviteManage extends Component {
  inviteQueryRef = null;

  constructor(props) {
    super(props);
    const routeParams = qs.parse(props.location.search.substr(1));
    const { messageActiveKey = '', ...others } = routeParams;
    const { mixObj = {} } = props;
    this.state = {
      messageActiveKey,
      activeKey: messageActiveKey || mixObj.currentKey || 'findSupplier',
      tabCount: {},
      itemCategorySingleFlag: false,
      purchaseAgentSingleFlag: false,
      supplierCategorySingleFlag: false,
      loading: false,
      routeParams: others,
      purchaseSelectedRows: [],
      purchaseInfo: {},
      fieldDefaultValue: {},
      valueList: [], // 存储值集
      dimensionValue: mixObj.dimensionValue,
      memberEnabled: false, // 默认未开启会员供应商功能
      showTagFlag: true, // 默认展示企业标签
    };
  }

  getSnapshotBeforeUpdate(nextProps) {
    const { activeKey } = this.state;
    const { supplierCompanyName, messageActiveKey } = qs.parse(nextProps.location.search.substr(1));
    const params = qs.parse(this.props.location.search.substr(1));
    if (supplierCompanyName !== params.supplierCompanyName) {
      this.setState({ routeParams: params });
    }
    if (messageActiveKey !== params.messageActiveKey) {
      this.setState({ activeKey: params.messageActiveKey || activeKey });
    }
  }

  componentDidMount() {
    handleQueryCount().then(res => {
      if (getResponse(res)) {
        this.setState({
          tabCount: res,
        });
      }
    });
    companySearchOwn().then(res => {
      if (getResponse(res)) {
        const {
          itemCategorySingleFlag: itemCategoryFlag = 0,
          purchaseAgentSingleFlag: purchaseAgentFlag = 0,
          supplierCategorySingleFlag: supplierCategoryFlag = 0,
          companyId,
          companyName,
          ...others
        } = res;
        // src-21763 邀请注册带出子账户分配的公司
        let fieldDefaultValue = { ...others };
        fieldDefaultValue = companyId
          ? {
              companyIdLov: {
                companyId,
                companyName,
              },
              ...fieldDefaultValue,
            }
          : {
              ...fieldDefaultValue,
            };
        const itemCategorySingleFlag = Number(itemCategoryFlag) === 1;
        const purchaseAgentSingleFlag = Number(purchaseAgentFlag) === 1;
        const supplierCategorySingleFlag = Number(supplierCategoryFlag) === 1;
        this.setState({
          itemCategorySingleFlag,
          purchaseAgentSingleFlag,
          supplierCategorySingleFlag,
          fieldDefaultValue,
        });
      }
    });
    // 查询当前登陆人对应的采购员
    this.handleCurrentUserPurchaseAgent();
    this.queryValueList();
    this.handleMemberEnabled();
    this.handleEnterpriseTags();
  }

  // 查询值集
  @Bind()
  queryValueList = () => {
    const lovCode = {
      dimensionList: 'SSLM.MEMBER_SUPPLIER_LIST_TYPE',
    };
    queryMapIdpValue(lovCode).then(response => {
      const res = getResponse(response);
      if (res) {
        this.setState({ valueList: res });
      }
    });
  };

  // 查询当前租户是否开启会员供应商拓展功能
  @Bind()
  handleMemberEnabled() {
    const { mixObj = {}, custConfig } = this.props;
    const { messageActiveKey } = this.state;
    const custActiveKey = (
      (custConfig['SSLM.SUPPLIER_INVITE_MANAGE_LIST.TABPANE']?.fields || []).find(
        n => n.defaultActive === 1
      ) || {}
    ).fieldCode;
    checkMemberSupplierEnabled().then(response => {
      const res = getResponse(response);
      if (res) {
        if (res.featureEnabledFlag === 1) {
          // 首次查询才将当前活动页置为会员供应商，从详情返回时不改变当前活动页
          if (mixObj.firstQuery) {
            this.setState({ activeKey: messageActiveKey || custActiveKey || 'memberSupplier' });
          }
          mixObj.firstQuery = false;
        }
        this.setState({ memberEnabled: res.featureEnabledFlag === 1 });
      }
    });
  }

  // 查询当前功能是否开启企业标签功能
  @Bind()
  handleEnterpriseTags() {
    enterpriseTagsConfig({ menuNum: '1' }).then(response => {
      const res = getResponse(response);
      if (res === 0) {
        this.setState({ showTagFlag: false });
      }
    });
  }

  /**
   * tab切换的回调
   */
  @Bind()
  handleTabChange(key) {
    const { mixObj = {} } = this.props;
    this.setState(
      {
        activeKey: key,
      },
      () => {
        mixObj.currentKey = key;
        this.handleQuery();
      }
    );
  }

  @Bind()
  handleCurrentUserPurchaseAgent() {
    queryCurrentUserPurchaseAgent().then(res => {
      if (getResponse(res)) {
        // src-20050 仅有一条采购员带出对应的采购员联系方式
        const onlyOnePurchase = isArray(res) && res.length === 1;
        const purchaseInfo = onlyOnePurchase ? res[0] : {};
        this.setState({ purchaseSelectedRows: res, purchaseInfo });
      }
    });
  }

  // 查询
  @Bind()
  handleQuery() {
    const { activeKey, dimensionValue } = this.state;
    const {
      supplierDs,
      inviteDealDs,
      inviteQueryDs,
      productDs,
      enterpriseDs,
      certificationDealDs,
      inviteRecordDs,
    } = this.props;
    switch (activeKey) {
      case 'findSupplier':
        if (supplierDs.getState('queryStatus') === 'ready') {
          supplierDs.query(supplierDs.currentPage);
        }
        break;
      case 'certificationDeal':
        if (certificationDealDs.getState('queryStatus') === 'ready') {
          certificationDealDs.query(certificationDealDs.currentPage);
        }
        break;
      case 'inviteDeal':
        if (inviteDealDs.getState('queryStatus') === 'ready') {
          inviteDealDs.query(inviteDealDs.currentPage);
        }
        break;
      case 'memberSupplier':
        if (dimensionValue === 'enterprise' && enterpriseDs.getState('queryStatus') === 'ready') {
          enterpriseDs.query(enterpriseDs.currentPage);
        } else if (productDs.getState('queryStatus') === 'ready') {
          productDs.query(productDs.currentPage);
        }
        break;
      default: {
        let inviteQueryListDs = inviteQueryDs;
        if (this.inviteQueryRef) {
          const { showSupplierTab = true, showInviteRecordTab = true } =
            this.inviteQueryRef.state || {};
          if (!showSupplierTab && showInviteRecordTab) {
            inviteQueryListDs = inviteRecordDs;
          }
        }
        if (inviteQueryListDs.getState('queryStatus') === 'ready') {
          inviteQueryListDs.query(inviteQueryListDs.currentPage);
        }
        break;
      }
    }
  }

  /**
   * 邀请注册弹窗
   */
  @Debounce(200)
  @Bind()
  handleRegisterModal() {
    const { customizeForm, inviteManageRemote, getHocInstance, history } = this.props;
    const {
      itemCategorySingleFlag,
      purchaseAgentSingleFlag,
      supplierCategorySingleFlag,
      routeParams,
      purchaseSelectedRows,
      purchaseInfo = {},
      fieldDefaultValue = {},
    } = this.state;
    // 埋点改变ds属性
    const modalDsProps = {
      ...registerModalDS({
        itemCategorySingleFlag,
        purchaseAgentSingleFlag,
        supplierCategorySingleFlag,
        purchaseSelectedRows,
      }),
    };
    // 埋点修改后的ds属性
    const newDsProps = inviteManageRemote
      ? inviteManageRemote.process('SSLM_SUPPLIER_INVITE_MANAGE_REGISTER_PROCESS', modalDsProps, {})
      : modalDsProps;
    const registerModalDs = new DataSet(newDsProps);
    // fieldDefaultValue src-25247 标准接口查询为空就不给默认，按个性化配置默认生效
    const fieldDefaultValueObj = isEmpty(fieldDefaultValue) ? {} : fieldDefaultValue;
    const proxyDsCreate = {
      createNow: true,
      createData: {
        purchaseAgentPhone: purchaseInfo.phone,
        internationalTelCode: purchaseInfo.internationalTelCode,
        supplierName: routeParams.supplierCompanyName,
        ...fieldDefaultValueObj,
        ...routeParams,
      },
    };
    this.registerModal = Modal.open({
      title: intl.get('spfm.supplierInvite.view.invite.invitationRegister').d('邀请供应商注册'),
      drawer: true,
      okText: intl.get('spfm.supplierInvite.view.invite.sendInvitation').d('发送邀请'),
      children: (
        <InviteRegisterModal
          dataSet={registerModalDs}
          customizeForm={customizeForm}
          proxyDsCreate={proxyDsCreate}
          getHocInstance={getHocInstance}
          history={history}
          remote={inviteManageRemote}
          cardCode="SSLM.SUPPLIER_INVITE_MANAGE_LIST.INVITE_REGISTER_CARDS"
        />
      ),
      style: { width: 1090 },
      footer: (okBtn, cancelBtn) => (
        <Footer
          okBtn={okBtn}
          cancelBtn={cancelBtn}
          modalDs={registerModalDs}
          handlePreviewInvestigation={this.handlePreviewInvestigation}
        />
      ),
      onOk: () =>
        new Promise(async resolve => {
          const currentRecord = registerModalDs.current;
          const validateFlag = await currentRecord.validate();
          const cuxRes = await inviteManageRemote.event.fireEvent('cuxRegisterModalOnOk', {
            registerModalDs,
          });
          if (!cuxRes) {
            return resolve(false); // 不关闭弹框
          }
          if (validateFlag) {
            const data = currentRecord.toJSONData();
            const { supplierName } = data;
            // 校验黑名单供应商
            const checkResult = await this.handleBlackListSupplier({
              supplierName,
              type: 'inviteRegister',
              record: currentRecord,
            });
            if (!checkResult) {
              return resolve(false);
            } else {
              // 校验不为黑名单供应商，继续邀请注册
              const res = this.handleRegisterSupplier(currentRecord, false);
              return resolve(res);
            }
          } else {
            resolve(false);
            notification.warning({
              placement: 'bottomRight',
              message: intl.get('sslm.common.view.message.maintainInfo').d('请填写相关信息！'),
            });
          }
        }),
    });
  }

  // 预览调查表
  @Bind()
  handlePreviewInvestigation(modalDs) {
    if (modalDs && modalDs.current) {
      const investigateTemplateId = modalDs.current.get('investigateTemplateId');
      if (investigateTemplateId) {
        Modal.open({
          title: intl.get('spfm.companySearch.view.message.templateDetail').d('模板明细'),
          drawer: true,
          okCancel: false,
          okText: intl.get('hzero.common.button.close').d('关闭'),
          children: (
            <TempatePreview
              investigateTemplateId={investigateTemplateId}
              previewFlag
              showTabBar={false}
              isModalFlag
            />
          ),
          bodyStyle: {
            paddingLeft: 0,
            paddingTop: 0,
            paddingBottom: 0,
          },
          style: { width: 1090 },
        });
        return;
      }
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('sslm.common.view.message.selectTemplate').d('请选择调查表模版！'),
      });
      return;
    }
    notification.warning({
      placement: 'bottomRight',
      message: intl.get('sslm.common.view.message.selectTemplate').d('请选择调查表模版！'),
    });
  }

  /**
   * 邀请供应商注册
   */
  async handleRegisterSupplier(record = {}, blackSupplierFlag = false) {
    const data = record.toJSONData();
    const { levelTypeFlag, inviteCompanyIds, supplierName, ...others } = data;
    const newInviteCompanyIds = isArray(inviteCompanyIds)
      ? inviteCompanyIds
      : inviteCompanyIds
      ? toString(inviteCompanyIds).split(',')
      : inviteCompanyIds;
    const payload = {
      ...others,
      supplierName,
      newInviteFlag: 1,
      levelTypeFlag: levelTypeFlag === 1 ? 0 : 1,
      tenantId: organizationId,
      inviteCompanyIds: newInviteCompanyIds,
      customizeUnitCode:
        'SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_INV_PUR,SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_OFFER_INFO,SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_OTHERINFO,SSLM.SUPPLIER_INVITE_MANAGE_LIST.REG_SUP_SAL_FORM',
    };
    const res = await inviteRegisterSupplier(payload);
    if (getResponse(res)) {
      notification.success({
        placement: 'bottomRight',
        message: intl.get('spfm.invitationRegister.model.invitationRegister.success').d('邀请成功'),
      });
      if (blackSupplierFlag) {
        // 点击第二个提示弹窗进来，成功需关闭原弹窗
        if (this.registerModal) {
          this.registerModal.close();
        }
      }
      return true;
    }
    return false;
  }

  /**
   * 处理黑名单供应商
   * return 返回值 true 原逻辑继续执行，false 后端抛错弹窗不关闭
   */
  @Bind()
  async handleBlackListSupplier(params = {}) {
    const { supplierName, type = 'inviteCooperate', record } = params;
    const {
      businessRegistrationNumber,
      dunsCode,
      organizingInstitutionCode,
      unifiedSocialCode,
    } = record.get([
      'businessRegistrationNumber',
      'dunsCode',
      'organizingInstitutionCode',
      'unifiedSocialCode',
    ]);
    const payload = {
      companyName: supplierName,
      checkType: 0,
      businessRegistrationNumber,
      dunsCode,
      organizingInstitutionCode,
      unifiedSocialCode,
      effectiveScenario: type === 'inviteCooperate' ? 1 : 2, // 触发场景标识
    };
    this.setState({
      loading: true,
    });
    try {
      const res = await checkBlackListSupplier(payload);
      if (getResponse(res)) {
        // 判断是否前端提示 strongCheckFlag开启业务规则标识，blackRelationResult => {} 是否有关联名单
        const { blackRelationResult = {}, strongCheckFlag } = res;
        if (!strongCheckFlag) {
          // 没开启业务规则原逻辑
          return true;
        } else {
          // 开启业务规则，判断是否黑名单供应商
          // relation true 收费 前端弱校验提示信息(然后走原逻辑)，false 不收费 走原逻辑
          const { relation, dataList, count } = blackRelationResult;
          const supplierCount = count;
          const supplierNameList =
            supplierCount > 3
              ? (dataList || [])
                  .slice(0, 3)
                  .map(supplier => supplier.linkName)
                  .join('、')
              : (dataList || []).map(supplier => supplier.linkName).join('、');
          const blackMessage =
            supplierCount > 3
              ? intl
                  .get('sslm.supplierInvite.view.message.moreBlackListSupplier', {
                    supplierNameList,
                    supplierCount,
                  })
                  .d(
                    `该供应商与【${supplierNameList}】等共${supplierCount}家黑名单企业存在关联关系，请谨慎进行邀约`
                  )
              : intl
                  .get('sslm.supplierInvite.view.message.littleBlackListSupplier', {
                    supplierNameList,
                    supplierCount,
                  })
                  .d(
                    `该供应商与【${supplierNameList}】${supplierCount}家黑名单企业存在关联关系，请谨慎进行邀约`
                  );
          if (relation) {
            if (type === 'inviteCooperate') {
              // 1. 邀请供应商合作右下角提示，返回true
              notification.warning({
                placement: 'bottomRight',
                message: blackMessage,
              });
              return true;
            } else {
              // 邀请注册弱校验弹窗提示,返回false，不让外边弹窗关闭
              Modal.confirm({
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: blackMessage,
                onOk: () => {
                  this.handleRegisterSupplier(record, true);
                },
              });
              return false;
            }
          }
          return true;
        }
      } else {
        return false;
      }
    } catch (e) {
      return true;
    } finally {
      this.setState({
        loading: false,
      });
    }
  }

  @Bind()
  setLoading(flag) {
    this.setState({
      loading: flag,
    });
  }

  // 按钮组
  @Bind()
  handleButtons() {
    const buttons = [
      {
        name: 'registerSupplier',
        btnComp: PermissionButton,
        btnProps: {
          type: 'primary',
          icon: 'user-add',
          onClick: () => this.handleRegisterModal(),
          permissionList: [
            {
              code: `srm.partner.my-partner.supplier-invite.button.register`,
              type: 'button',
              meaning: '发现供应商-邀请供应商',
            },
          ],
        },
        child: intl.get(`spfm.companySearch.view.option.inviteRegisterSupplier`).d('邀请供应商'),
      },
      {
        name: 'batchInvite',
        btnComp: CommonImport,
        childFor: 'buttonText',
        btnProps: {
          refreshButton: true,
          prefixPatch: SRM_PLATFORM,
          businessObjectTemplateCode: 'SPFM.BATCH_INVITE_NEW',
          buttonProps: {
            icon: 'archive',
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [
              {
                code: 'srm.partner.my-partner.supplier-invite.button.import.model',
                type: 'button',
                meaning: '发现供应商-批量邀约',
              },
            ],
          },
        },
        child: intl
          .get('spfm.companySearch.view.invitation.batchInviteRegist.new')
          .d('(新)批量邀请注册'),
      },
      {
        name: 'importSupplier',
        btnComp: CommonImport,
        childFor: 'buttonText',
        btnProps: {
          refreshButton: true,
          autoExecute: false,
          prefixPatch: SRM_PLATFORM,
          businessObjectTemplateCode: 'SPFM.ORG_COMPANY.IMPORT',
          buttonProps: {
            icon: 'archive',
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [
              {
                code: `srm.partner.my-partner.supplier-invite.button.sup-import-new`,
                type: 'button',
                meaning: '发现供应商-供应商导入',
              },
            ],
          },
        },
        child: intl
          .get(`spfm.companySearch.view.option.newImportSupplierGenerate`)
          .d('(新)供应商导入生成'),
      },
      {
        name: 'personalSupplierImport',
        btnComp: CommonImport,
        childFor: 'buttonText',
        btnProps: {
          businessObjectTemplateCode: 'SPFM.SELF-EMPLOYED.IMPORT',
          prefixPatch: SRM_PLATFORM,
          autoExecute: false,
          refreshButton: true,
          buttonProps: {
            icon: 'archive',
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [
              {
                code: `srm.partner.my-partner.supplier-invite.button.self-employed-import-new`,
                type: 'button',
                meaning: '发现供应商-个人供应商导入',
              },
            ],
          },
        },
        child: intl
          .get('spfm.companySearch.view.invitation.newPersonalSupplierImport')
          .d('(新)个人供应商导入'),
      },
    ];
    return buttons;
  }

  // 邀约处理按钮
  @Bind()
  handleInviteDealButtons() {
    const { inviteDealDs } = this.props;
    const selectedData = inviteDealDs.selected || [];
    const allowAgree = selectedData.filter(record => record.get('processStatus') !== 'PENDING');
    const buttons = [
      {
        name: 'agreeCooperate',
        btnComp: Button,
        btnProps: {
          icon: 'check_circle',
          color: 'primary',
          onClick: () => this.handleAgreeCooperate(),
          disabled: isEmpty(selectedData) || !isEmpty(allowAgree),
        },
        child: intl.get(`spfm.disposeInvite.view.message.agree`).d('同意合作'),
      },
      {
        name: 'inviteReject',
        btnComp: Button,
        btnProps: {
          icon: 'cancel',
          funcType: 'flat',
          onClick: () => this.handleInviteReject(),
          disabled: isEmpty(selectedData),
        },
        child: intl.get('sslm.investigCorrelat.view.button.inviteRefuse').d('邀约拒绝'),
      },
    ];
    return buttons;
  }

  // 邀约查询按钮
  @Bind()
  handleInviteQueryButtons(inviteQueryTabKey) {
    const btnProps = this.getButtonProps(inviteQueryTabKey);
    const { otherButtonProps = {}, ...others } = btnProps;
    const buttons = [
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          buttonText: intl.get('hzero.common.button.export').d('导出'),
          ...others,
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            ...otherButtonProps,
          },
        },
      },
    ];
    return buttons;
  }

  @Bind()
  getButtonProps(key = '') {
    const inviteCode = key === 'inviteRecord';
    const btnProps = inviteCode
      ? {
          requestUrl: `${SRM_PLATFORM}/v1/${organizationId}/invites_schedule_purchaser/export`,
          templateCode: 'SRM_C_SRM_SPFM_PARTNER_INVITE_PURCHASER',
          queryParams: () => this.handleExportParams(key),
          otherButtonProps: {},
        }
      : {
          requestUrl: `${SRM_PLATFORM}/v1/${organizationId}/invites_schedule/exprot`,
          method: 'POST',
          allBody: true,
          templateCode: 'SRM_C_SRM_SPFM_PARTNER_INVITE_SCHEDULE_EXPROT',
          queryParams: () => this.handleExportParams(key),
          otherButtonProps: {
            permissionList: [
              {
                code: 'srm.partner.my-partner.supplier-invite.button.schedule-export',
                type: 'button',
                meaning: '邀约管理-按供应商导出',
              },
            ],
          },
        };

    return btnProps;
  }

  // 导出参数
  @Bind()
  handleExportParams(key = '') {
    const { inviteRecordDs, inviteQueryDs } = this.props;
    const ds = key === 'inviteRecord' ? inviteRecordDs : inviteQueryDs;
    const queryData = isNil(ds.queryDataSet?.current) ? {} : ds.queryDataSet.current.toData();
    const { __dirty, ...otherParams } = queryData;
    return filterNullValueObject({ ...otherParams });
  }

  /**
   * 成为客户，校验黑名单供应商
   */
  @Bind()
  async handleCheckBlackListSupplier() {
    const { inviteDealDs } = this.props;
    const selectedData = inviteDealDs.toJSONData() || [];
    const supplierInfoList = selectedData.map(item => {
      const { companyId, companyName } = item;
      return {
        companyId,
        companyName,
      };
    });
    const param = {
      supplierInfoList,
      effectiveType: 'supplierActiveInvite',
    };
    const blackListRes = await batchCheckBlackListSupplier(param);
    return blackListRes;
  }

  @Bind()
  async handleAgreeCooperate() {
    const checkRes = await this.handleCheckBlackListSupplier();
    if (!checkRes) {
      return;
    }
    const { inviteDealDs } = this.props;
    const { purchaseSelectedRows } = this.state;
    const supplementDs = new DataSet({
      ...supplementInvestigModalDS({
        purchaseSelectedRows,
      }),
    });
    Modal.open({
      key: Modal.key(),
      title: intl.get('spfm.disposeInvite.view.message.title.modal.supplement').d('补充调查'),
      drawer: true,
      okText: intl.get(`spfm.disposeInvite.view.option.agree`).d('同意合作'),
      children: <SupplementModal dataSet={supplementDs} batchInvite />,
      style: { width: 850 },
      onOk: () =>
        new Promise(async resolve => {
          const currentRecord = supplementDs.current || {};
          const validateFlag = await currentRecord.validate();
          if (validateFlag) {
            const selectedData = inviteDealDs.toJSONData() || [];
            const inviteIds = selectedData.map(item => item.inviteId);
            const data = currentRecord.toJSONData();
            const {
              flag,
              multiSupplierCategoryId,
              categoryIds,
              purchaseAgentId,
              remark,
              investigateType,
              investigateTemplateId,
            } = data;
            const payload = {
              inviteIds,
              supplierCategoryIdList: multiSupplierCategoryId
                ? multiSupplierCategoryId.split(',')
                : null,
              multiSupplierCategoryId,
              categoryIds,
              purchaseAgentId,
              remark,
              investigateType,
              investigateTemplateId,
              flag,
              customizeUnitCode: 'SSLM.SUP_INV_MAN_INV_PROCESS.SUP_MODAL_FORM',
            };
            // 勾选发送调查表
            if (flag) {
              const res = await batchApproveInvestigate(payload);
              if (getResponse(res)) {
                resolve();
                notification.success({
                  placement: 'bottomRight',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                this.hanldeInviteDealQuery();
              } else {
                resolve(false);
              }
            } else {
              // 同意合作
              const res = await batchApproveInvite(payload);
              if (getResponse(res)) {
                resolve();
                notification.success({
                  placement: 'bottomRight',
                  message: intl.get('hzero.common.notification.success').d('操作成功'),
                });
                this.hanldeInviteDealQuery();
              } else {
                resolve(false);
              }
            }
          } else {
            resolve(false);
          }
        }),
    });
  }

  @Bind()
  handleInviteReject() {
    const { inviteDealDs } = this.props;
    const rejectModalDs = new DataSet(inviteRejectModalDS());
    const currentRecord = rejectModalDs.current || {};
    Modal.open({
      key: Modal.key(),
      movable: false,
      drawer: true,
      style: { width: 430 },
      title: intl.get(`spfm.disposeInvite.view.message.title.modal.refuse`).d('拒绝原因'),
      children: (
        <Form record={currentRecord} labelLayout="float">
          <TextArea name="refuseReason" resize="vertical" rows={16} />
        </Form>
      ),
      onOk: () =>
        new Promise(async resolve => {
          const selectedData = inviteDealDs.toJSONData() || [];
          const inviteIds = selectedData.map(item => item.inviteId);
          const payload = {
            inviteIds,
            processMsg: currentRecord.get('refuseReason'),
          };
          if (!isEmpty(inviteIds)) {
            const res = await batchRejectInvite(payload);
            if (getResponse(res)) {
              resolve();
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              this.hanldeInviteDealQuery();
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        }),
    });
  }

  @Bind()
  hanldeInviteDealQuery() {
    const { inviteDealDs } = this.props;
    inviteDealDs.unSelectAll();
    inviteDealDs.clearCachedSelected();
    inviteDealDs.query();
  }

  @Bind()
  handleInviteQueryTabKey(tabKey = '') {
    this.setState({ inviteQueryTabKey: tabKey });
  }

  @Bind()
  handleDimensionChange = key => {
    const { mixObj } = this.props;
    this.setState({ dimensionValue: key }, () => {
      // eslint-disable-next-line no-undef
      mixObj.currentKey = key;
    });
  };

  /**
   * 提示已有合作伙伴弹窗
   */
  @Bind()
  handleTipsPartnerModal(payload = {}) {
    Modal.confirm({
      children: (
        <div style={{ textIndent: '2em', fontSize: 14, lineHeight: 1.8 }}>
          {intl
            .get('sslm.supplierInvite.title.message.tipsPartner')
            .d(
              '邀请方公司与供应商已存在合作伙伴关系，不支持通过邀约途径更新已有合作供应商的相关信息。如您选择了发送调查表，或维护了采购员、品类和分类等，邀约发送后以上信息将被自动删除，仅可通过此邀约为所选销售员分配角色权限。请确认是否发送邀约。'
            )}
        </div>
      ),
      onOk: async () => {
        const res = await inviteSupplier({
          ...payload,
          clearFlag: 1,
        });
        if (getResponse(res)) {
          notification.success({
            placement: 'bottomRight',
            message: intl
              .get(`spfm.companySearch.view.message.invitatSuccessMsg`)
              .d('您好，您已向对方发起合作邀约，需等待被邀约企业处理，请耐心等待！'),
          });
          // 关闭外层弹窗
          if (this.inviteSupplierModal) {
            this.inviteSupplierModal.close();
          }
        }
        return true;
      },
      bodyStyle: { paddingTop: 32 },
      style: { width: 530 },
    });
  }

  /**
   * 邀请供应商弹窗
   */
  @Bind()
  async handleInviteModal(record = {}) {
    const { inviteManageRemote, customizeForm = () => {}, getHocInstance, history } = this.props;
    const {
      activeKey,
      showTagFlag,
      purchaseSelectedRows = [],
      itemCategorySingleFlag = false,
      purchaseAgentSingleFlag = false,
      supplierCategorySingleFlag = false,
    } = this.state;
    const dsProps = inviteModalDS({
      itemCategorySingleFlag,
      purchaseAgentSingleFlag,
      supplierCategorySingleFlag,
      purchaseSelectedRows,
    });
    const remoteProps = inviteManageRemote.process(
      'SSLM.SUPPLIER_INVITE_MANAGE.INVITE_MODAL',
      dsProps
    );
    const inviteModalDs = new DataSet(remoteProps);
    const listRecord = record.toData();
    const {
      memberInfoId,
      companyId: inviteCompanyId,
      tenantId: inviteTenantId,
      companyId,
      companyName,
      srmCompanyId,
      hpfmCompanyId,
    } = listRecord;
    // 销售员lov额外参数
    inviteModalDs.setState('salesPersonIdsLovParams', {
      activeKey,
      memberInfoId,
    });
    const newInviteCompanyId = activeKey === 'memberSupplier' ? hpfmCompanyId : inviteCompanyId;

    const remoteParams = await inviteManageRemote.process(
      'SSLM.SUPPLIER_INVITE_MANAGE_INVITE_MODAL_EXTRA_PARAMS',
      {},
      { listRecord }
    );
    const proxyDsCreate = {
      createNow: true,
      createData: {
        supplierName: companyName,
        inviteTenantId,
        supplierCompanyId: companyId,
        srmCompanyId,
        ...remoteParams,
      },
    };
    this.inviteSupplierModal = Modal.open({
      title: intl.get('sslm.supplierInvite.model.invite.initiateInvitation').d('发起邀约'),
      drawer: true,
      okText: intl.get('sslm.supplierInvite.model.invite.confirmInvitation').d('确认邀约'),
      children: (
        <InviteModal
          dataSet={inviteModalDs}
          record={listRecord}
          sourceKey={sourceKey}
          showTagFlag={showTagFlag}
          customizeForm={customizeForm}
          proxyDsCreate={proxyDsCreate}
          getHocInstance={getHocInstance}
          history={history}
          remote={inviteManageRemote}
          cardCode="SSLM.SUPPLIER_INVITE_MANAGE_LIST.INVITE_COOPERATE_CARDS"
        />
      ),
      style: { width: 1090 },
      footer: (okBtn, cancelBtn) => (
        <Footer
          okBtn={okBtn}
          cancelBtn={cancelBtn}
          modalDs={inviteModalDs}
          handlePreviewInvestigation={this.handlePreviewInvestigation}
        />
      ),
      onOk: async () => {
        const currentRecord = inviteModalDs.current;
        const validateFlag = await currentRecord.validate();
        let modalCloseFlag = false;
        const cuxRes = await inviteManageRemote.event.fireEvent('cuxInviteModalOnOk', {
          inviteModalDs,
        });
        if (!cuxRes) {
          return false; // 不关闭弹框
        }
        if (validateFlag) {
          const data = currentRecord.toJSONData();
          const {
            mergerInvitationFlag,
            levelTypeFlag,
            autosendInvestigateFlag,
            companyIds,
            rePurchaseAgentName,
            ...others
          } = data;

          const newCompanyIds = isArray(companyIds)
            ? companyIds
            : companyIds
            ? toString(companyIds).split(',')
            : companyIds;
          const payload = {
            ...others,
            mergerInvitationFlag,
            newInviteFlag: 1,
            inviteCompanyId: newInviteCompanyId,
            inviteTenantId,
            levelTypeFlag: levelTypeFlag === 1 ? 0 : 1,
            tenantId: organizationId,
            companyIds: newCompanyIds,
            customizeUnitCode:
              'SSLM.SUPPLIER_INVITE_MANAGE_LIST.SUP_SAL_FORM,SSLM.SUPPLIER_INVITE_MANAGE_LIST.OTHERINFO,SSLM.SUPPLIER_INVITE_MANAGE_LIST.OFFER_INFORMATION,SSLM.SUPPLIER_INVITE_MANAGE_LIST.INV_PUR_FORM',
          };
          // 校验合作伙伴
          const companyStr = isArray(companyIds) ? companyIds.join(',') : companyIds;
          const checkData = {
            mergerInvitationFlag,
            tenantId: organizationId,
            companyIds: companyStr,
            inviteTenantId,
            inviteCompanyId: newInviteCompanyId,
            levelTypeFlag: levelTypeFlag === 1 ? 0 : 1,
            inviteType: 'SUPPLIER',
          };
          const resultFalg = await checkPartner(checkData);
          const flag = getResponse(resultFalg);
          if (isBoolean(flag)) {
            if (flag) {
              // 可以邀约
              const res = await inviteSupplier(payload);
              if (getResponse(res)) {
                notification.success({
                  placement: 'bottomRight',
                  message: intl
                    .get(`spfm.companySearch.view.message.invitatSuccessMsg`)
                    .d('您好，您已向对方发起合作邀约，需等待被邀约企业处理，请耐心等待！'),
                });
                modalCloseFlag = true;
              }
            } else {
              // 弹窗提示
              this.handleTipsPartnerModal(payload);
            }
          }
          return modalCloseFlag;
        } else {
          notification.warning({
            placement: 'bottomRight',
            message: intl.get('sslm.common.view.message.maintainInfo').d('请维护相关信息！'),
          });
          return modalCloseFlag;
        }
      },
    });
  }

  // 处理未风险扫描
  @Bind()
  handleNotRiskScan(record) {
    // 打开弹窗
    this.handleInviteModal(record);
    // 右下角弹窗提示
    notification.info({
      placement: 'bottomRight',
      message: intl
        .get('spfm.companySearch.view.message.inviteRiskScanTips')
        .d(
          '租户已开通风险扫描服务，可在“发现供应商”列表内点击风险扫描，获取或更新待邀约供应商的最新风险信息'
        ),
    });
  }

  /**
   * 校验是否黑名单供应商
   */
  @Debounce(200)
  @Bind()
  checkoutBlackListSupplier(record) {
    const { companyName } = record.get(['companyName']);
    this.handleBlackListSupplier({
      supplierName: companyName,
      type: 'inviteCooperate',
      record,
    }).then(res => {
      if (res) {
        // 判断是否开启风控服务
        queryRiskMonitorType().then(riskRes => {
          const result = getResponse(riskRes, () => {
            // 未开通风险服务，不把报错内容展示在页面,打开弹窗
            this.handleInviteModal(record);
            // this.setState({ showRiskProfile: false });
          });
          // 开通风险服务
          if (result) {
            // this.setState({ showRiskProfile: true }, () => {
            // 判断该供应商是否进行过风险扫描
            fetchLastRiskScanInfo({
              companyName,
            }).then(scanInfoResp => {
              // 接口报错不弹窗提示报错内容，当做未风险扫描
              const scanInfoResult = getResponse(scanInfoResp, () => {
                this.handleNotRiskScan(record);
              });
              if (scanInfoResult) {
                this.handleInviteModal(record);
              }
            });
            // });
          }
        });
      }
    });
  }

  /**
   * 斯瑞德风险扫描内嵌页
   */
  @Bind()
  handleToPage(record) {
    const companyName = record.get('companyName');
    const supplierCompanyId = record.get('companyId');
    const load = intl.get('spfm.common.view.riskMonitoring.loading').d('正在加载');
    const prompt = `<p style="text-align: center">${load}...</p>`;
    const riskEmbedPage = window.open();
    if (riskEmbedPage) {
      riskEmbedPage.document.body.innerHTML = prompt;
    }
    handleRiskEmbedPage({
      enterpriseName: companyName,
      supplierCompanyId,
    }).then(res => {
      const resp = getResponse(res);
      if (riskEmbedPage) {
        if (resp) {
          const { monitorUrl, riskScanDate, fileUrl, riskLevel, riskLevelMeaning } = resp;
          riskEmbedPage.location = monitorUrl;
          // 回显
          record.init({
            riskScanDate,
            fileUrl,
            riskLevel,
            riskLevelMeaning,
          });
        } else {
          const errPrompt = `<p style="text-align: center">${res.message}</p>`;
          riskEmbedPage.document.body.innerHTML = errPrompt;
        }
      }
    });
  }

  /**
   * 校验是否开启了风控服务
   */
  @Bind()
  checkRisk(record) {
    checkRiskEmbed().then(response => {
      const res = getResponse(response);
      if (res) {
        notification.success({
          message: intl.get(`spfm.supplier.model.supplier.platform.successRisk`).d('操作成功'),
        });
        this.handleToPage(record);
      }
    });
  }

  // 校验是否加入监控的企业
  @Bind()
  handleJoinedMointor(record) {
    const { companyId, riskScanDate, unifiedSocialCode } = record.get([
      'companyId',
      'riskScanDate',
      'unifiedSocialCode',
    ]);
    // 查询当前租户风控类型
    queryRiskMonitorType().then(riskMonitorTypeRes => {
      const riskMonitorTypeResult = getResponse(riskMonitorTypeRes);
      if (riskMonitorTypeResult) {
        fetchLastRiskScanDate({
          tenantId: organizationId,
          unifiedSocialCreditCode: unifiedSocialCode,
        }).then(response => {
          if (response) {
            if (response.failed) {
              notification.error({
                message: intl
                  .get('sslm.common.view.message.riskScanErrorMsg')
                  .d('企业风险扫描额度不足或调用服务失败，请联系应用商店处理'),
              });
            } else {
              const { partnerCode: riskMonitorType } = riskMonitorTypeResult;
              // 斯瑞德监控
              if (riskMonitorType === 'SRD') {
                if (companyId) {
                  // 查询企业是否加入风险监控
                  checkJoinedMointor({ companyId }).then(res => {
                    // 返回布尔值，api没有报错
                    if (isBoolean(res)) {
                      if (res) {
                        this.checkRisk(record);
                      } else if (!riskScanDate) {
                        // 没有上次扫描时间
                        Modal.confirm({
                          children: intl
                            .get('sslm.supplierInvite.view.message.noMonitoring')
                            .d('该企业未加入监控，扫描将会扣除扫描额度，是否确认扫描？'),
                          onOk: () => {
                            this.checkRisk(record);
                          },
                        });
                      } else {
                        // 判断上次风险扫描时间是否超过24小时
                        const expirationDate = moment().subtract(24, 'hours');
                        const lastRiskScanDate = moment(riskScanDate).format(
                          DEFAULT_DATETIME_FORMAT
                        );
                        const flag = expirationDate.isBefore(lastRiskScanDate);
                        if (flag) {
                          // 距离上次扫描时间少于24小时，直接跳转
                          this.checkRisk(record);
                        } else {
                          Modal.confirm({
                            children: intl
                              .get('sslm.supplierInvite.view.message.repeatScanning', {
                                riskScanDate,
                              })
                              .d(
                                `该企业未加入监控，您已于【${riskScanDate}】对其进行过风险扫描，重复扫描将会再次扣除扫描额度，是否确认扫描？ 确认跳转至扫描详情，取消则关闭弹窗。`
                              ),
                            onOk: () => {
                              this.checkRisk(record);
                            },
                          });
                        }
                      }
                    } else {
                      getResponse(res);
                    }
                  });
                }
              }
              // 企查查 风险监控
              if (riskMonitorType === 'ZHENYUN_PARTNER') {
                this.handleToPage(record);
              }
            }
          }
        });
      }
    });
  }

  render() {
    const {
      location,
      supplierDs,
      inviteDealDs,
      inviteQueryDs,
      certificationDealDs,
      inviteRecordDs,
      dispatch,
      productDs,
      enterpriseDs,
      customizeForm,
      customizeTable,
      customizeTabPane,
      customizeBtnGroup,
    } = this.props;
    const {
      showTagFlag,
      routeParams,
      activeKey = 'findSupplier', // 处理个性化不配置默认激活（值为undefined），默认展示第一个tab
      tabCount,
      loading,
      valueList,
      memberEnabled,
      dimensionValue,
      inviteQueryTabKey,
    } = this.state;
    // 邀约进度Tab
    const inviteQueryFlag = activeKey === 'inviteQuery';
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.supplierInvite.view.title.supplierInvite').d('供应商邀约管理')}
        >
          {activeKey === 'findSupplier' && (
            <React.Fragment>
              {customizeBtnGroup(
                {
                  code: 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.BTN_GROUP',
                  pro: true,
                },
                <DynamicButtons buttons={this.handleButtons()} />
              )}
            </React.Fragment>
          )}
          {activeKey === 'inviteDeal' && (
            <DynamicButtons buttons={this.handleInviteDealButtons()} />
          )}
          {inviteQueryFlag && (
            <DynamicButtons buttons={this.handleInviteQueryButtons(inviteQueryTabKey)} />
          )}
        </Header>
        <Content>
          <Spin spinning={loading}>
            {customizeTabPane(
              {
                code: 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.TABPANE',
              },
              <Tabs activeKey={activeKey} animated={false} onChange={this.handleTabChange}>
                {memberEnabled && (
                  <Tabs.TabPane
                    key="memberSupplier"
                    count={
                      dimensionValue === 'enterprise'
                        ? tabCount.memberCompanyCount
                        : tabCount.memberProductCount
                    }
                    tab={intl
                      .get(`spfm.companySearch.view.title.memberSupplier`)
                      .d('会员供应商推荐')}
                  >
                    <MemberSupplier
                      valueList={valueList}
                      dimensionValue={dimensionValue}
                      setLoading={this.setLoading}
                      onRiskScan={this.handleJoinedMointor}
                      onInvite={this.checkoutBlackListSupplier}
                      onDimensionChange={this.handleDimensionChange}
                      searchCode={
                        dimensionValue === 'enterprise'
                          ? 'SSLM.MEMBER_SUPPLIER_RECOMMEND.ENTERPRISE_SEARCH_BAR'
                          : 'SSLM.MEMBER_SUPPLIER_RECOMMEND.PRODUCT_SEARCH_BAR'
                      }
                      dataSet={dimensionValue === 'enterprise' ? enterpriseDs : productDs}
                    />
                  </Tabs.TabPane>
                )}
                <Tabs.TabPane
                  tab={intl.get(`spfm.companySearch.view.option.title.supplier`).d('发现供应商')}
                  count={tabCount.findSupplierCount}
                  key="findSupplier"
                >
                  <FindSupplier
                    dataSet={supplierDs}
                    location={location}
                    sourceKey={sourceKey}
                    routeParams={routeParams}
                    showTagFlag={showTagFlag}
                    customizeTable={customizeTable}
                    onRiskScan={this.handleJoinedMointor}
                    onInvite={this.checkoutBlackListSupplier}
                    onRegisterModal={this.handleRegisterModal}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get('sslm.supplierInvite.view.invite.certificationDeal').d('认证处理')}
                  count={tabCount.submittedActionCount}
                  key="certificationDeal"
                >
                  <CertificationDeal
                    dataSet={certificationDealDs}
                    dispatch={dispatch}
                    customizeTable={customizeTable}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get('sslm.supplierInvite.view.invite.invitDeal').d('邀约处理')}
                  count={tabCount.newInvitesCount}
                  key="inviteDeal"
                >
                  <InviteDeal
                    dataSet={inviteDealDs}
                    dispatch={dispatch}
                    customizeTable={customizeTable}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl
                    .get('sslm.supplierInvite.view.invite.inviteProgressQuery')
                    .d('邀约进度查询')}
                  count={tabCount.invitesScheduleCount}
                  key="inviteQuery"
                >
                  <InviteQuery
                    customizeTable={customizeTable}
                    inviteSupplierDs={inviteQueryDs}
                    inviteRecordDs={inviteRecordDs}
                    dispatch={dispatch}
                    showTagFlag={showTagFlag}
                    customizeForm={customizeForm}
                    handleInviteQueryTabKey={this.handleInviteQueryTabKey}
                    onRef={ref => {
                      this.inviteQueryRef = ref;
                    }}
                  />
                </Tabs.TabPane>
              </Tabs>
            )}
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
