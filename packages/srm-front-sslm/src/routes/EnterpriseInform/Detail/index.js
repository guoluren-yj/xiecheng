/**
 * Detail - 企业信息变更申请---详情
 * @date: 2019-10-29
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { connect } from 'dva';
import querystring from 'querystring';
import { compose, isUndefined, isFunction } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { Icon as NewIcon, Alert } from 'choerodon-ui';
import {
  ModalProvider,
  useModal,
  TextArea,
  Form as C7NForm,
  DataSet,
  Button as C7NButton,
} from 'choerodon-ui/pro';
import React, { Component, useMemo, Fragment, useState } from 'react';
import { Button, Anchor, Form, Collapse, Icon, Modal, Spin, Tooltip } from 'hzero-ui';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button as PerButton } from 'components/Permission';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { getResponse } from 'utils/utils';

import '@/routes/index.less';
import styles from '@/routes/components/Navbar/index.less';
import { fetchBusinessRules } from '@/services/commonService';
import HeaderInfo from './HeaderInfo';
import RegistInform from './RegistInform';
import RegisteBusinessInform from './RegisteBusinessInform';
import ContactInform from './ContactInform';
import AddressInform from './AddressInform';
import BankInform from './BankInform';
import InvoiceInform from './InvoiceInform';
import FinancialInform from './FinancialInform';
import AttachmentInform from './AttachmentInform';
import SupplierClassify from './SupplierClassify';
import OtherInform from './OtherInform';
import { useQuestionnaire } from '../InfoDetailApproval';
import stylesModal from './index.less';

const { Link } = Anchor;
const { Panel } = Collapse;

// const tenantId = getCurrentOrganizationId();

const customizeUnitCode = [
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.HEADER',
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.BANK_INFO',
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.OTHER_INFO',
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.INVOICE_INFO',
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.CONTACT_INFO',
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.ADDRESS_INFO',
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.ATTA_INFO',
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.FINANCIAL_INFO',
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_OVERSEAS',
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_PERSONAL',
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.BUSINESS_INFO', // 业务信息
  'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.SUPPLIER_CLASSIFY',
];

@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  editLoading:
    loading.effects['enterpriseInform/submitApplication'] ||
    loading.effects['enterpriseInform/deleteApplication'] ||
    loading.effects['enterpriseInform/allSave'] ||
    loading.effects['enterpriseInform/checkBankAccountCommon'] ||
    loading.effects['enterpriseInform/checkBankAccount'],
  queryConfigLoading:
    loading.effects['enterpriseInform/queryInfoChangeApprovalDetail'] ||
    loading.effects['enterpriseInform/querySupChangeOther'] ||
    loading.effects['enterpriseInform/fetchWeburl'] ||
    loading.effects['enterpriseInform/queryDetailHeader'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sslm.enterpriseInform',
    'sslm.supplierInform',
    'sslm.common',
    'sslm.supplierEntryDetail',
    'spfm.bank',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.HEADER', //  详情头
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.BANK_INFO', // 银行信息
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.OTHER_INFO', // 其它信息
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.COLLAPSE', // 折叠面板
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.INVOICE_INFO', // 开票信息
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.CONTACT_INFO', // 联系人
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.ADDRESS_INFO', // 地址
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.ATTA_INFO', // 附件
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.FINANCIAL_INFO', // 财务状况
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_OVERSEAS', // 登记信息 （境内外）
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_PERSONAL', // 登记信息（个人）
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.BUSINESS_INFO', // 业务信息
    'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.SUPPLIER_CLASSIFY', // 供应商分类
    'SSLM.ENTERPRISE_INFORM_CHANGE_SUPPLIER.COLLAPSE', // 折叠面板(平台级企业信息变更-供应商发起)
  ],
  manualQuery: true,
})
class Detail extends Component {
  constructor(props) {
    super(props);
    const { state: { historyBack } = {} } = props.location;
    const isPub = props.location.pathname.match('/pub/');
    const routerParam = querystring.parse(props.location.search.substr(1));
    const { partnerTenantId, isPurchaser, workflow = 0, pubEdit = 0 } = routerParam;
    const backPath = historyBack || `${isPub ? '/pub' : ''}/sslm/enterprise-inform-change/list`;
    const isInclude = props.location.pathname.includes('/include/'); // 360带include路由跳转过来的
    this.state = {
      isPub,
      isInclude,
      code: {}, // 值集集合
      collapsedKeys: [], // 展开的Key集合
      allCatalog: [],
      detailHeader: {}, // 头信息
      anchorShow: false,
      backPath, // 返回路径
      isAllPlatform: partnerTenantId === '-1',
      purchaserFlag: isPurchaser === '1', // 判断查询对象是否是采购方，采购方只读
      mustCompanyTab: '', // 门户配置的必填页签
      changeLevel: '', // 变更维度
      showAppealBtn: false, // 是否显示申诉按钮
      isSecondaryDomain: false,
      secondaryDomainTenantId: '',
      workflowFlag: !!Number(workflow), // 是否工作流标识，isPub判断工作流会有问题，srm-109893
      pubEdit: !!Number(pubEdit), // 工作流页面可编辑
    };
  }

  registInForm; // 登记信息

  registeBusinessInForm; // 注册业务信息

  contactInForm; // 联系人信息

  addressInForm; // 地址信息

  bankInForm; // 银行信息

  invoiceInForm; // 开票信息

  financialInForm; // 财务状况

  attachmentInForm; // 附件信息

  supplierClassify; // 供应商分类

  otherInform;

  // 其他信息
  formDs = new DataSet({
    autoCreate: true,
    autoQuery: false,
    fields: [
      {
        name: 'appealReason',
        type: 'string',
        label: intl.get('sslm.enterpriseInform.model.view.appealReasonB').d('申诉原因'),
        required: true,
      },
    ],
  });

  // 供应商分类
  componentDidUpdate(PrevProps) {
    const {
      match: {
        params: { changeReqId },
      },
    } = this.props;
    if (PrevProps.match.params.changeReqId !== changeReqId) {
      this.handleDetailHeader();
    }
  }

  componentDidMount() {
    const { isAllPlatform } = this.state;
    const parame = querystring.parse(this.props.location.search.substr(1));
    const { partnerTenantId } = parame || {};
    const lovCodes = {
      ID: 'SPFM.ID_TYPE',
      gender: 'HPFM.GENDER',
      companyType: 'HPFM.COMPANY_TYPE', // 登记信息-企业类型
      taxpayerType: 'HPFM.TAXPAYER_TYPE', // 登记信息-纳税人标识
      servicesAreas: 'SPFM.COMPANY.SERVICE_AREA', // 业务信息-送货服务范围
      businessType: 'SPFM.MASTER.STATUS', // 业务信息-主要身份
      serviceType: 'SPFM.BUSINESS.NATURE', // 业务信息-经营性质
      contactType: 'SSLM.CONTACT_TYPE', // 联系人类型
      institutionalType: 'SPFM.INSTITUTION_TYPE', // 登记信息-机构类型
      domesticForeignRelationList: 'SSLM.CERTIFICATION_AREA', // 认证地区
      accountNatureType: 'SPFM.NATURE_OF_ACCOUNT', // 账户性质
      accountPurposeType: 'SPFM.PURPOSE_OF_ACCOUNT', // 账户用途
      tenantId: isAllPlatform ? 0 : partnerTenantId,
    };
    const { hostname } = window.location;
    const { queryUnitConfig, dispatch, onLoad } = this.props;
    if (isAllPlatform) {
      const payload = {
        webUrl: hostname,
      };
      // 类型为全平台公开时，获取二级域名
      dispatch({
        type: 'enterpriseInform/fetchWeburl',
        payload,
      }).then((res) => {
        if (res && res.tenantId) {
          this.setState({
            isSecondaryDomain: true,
            secondaryDomainTenantId: res.tenantId,
          });
          // 单独查询一个单元
          queryUnitConfig(
            {
              customizeTenantId: res.tenantId,
            },
            null,
            ['SSLM.ENTERPRISE_INFORM_CHANGE_SUPPLIER.COLLAPSE']
          );
          this.queryCustomize('true', res.tenantId);
        } else {
          queryUnitConfig();
          this.queryCustomize('false');
        }
      });
    } else if (queryUnitConfig) {
      queryUnitConfig({
        customizeTenantId: partnerTenantId,
      });
      this.queryCustomize('false');
    }
    this.handleInit(lovCodes);
    this.handleBusinessRules();
    // this.handleDetailHeader();
    if (isFunction(onLoad)) {
      onLoad({
        submit: this.workflowSubmit,
      });
    }
  }

  // 工作流审批回调
  @Bind()
  workflowSubmit(approveResult) {
    return new Promise(async (resolve) => {
      if (approveResult === 'Approved') {
        this.handleSaveAddSubmit(true, '', resolve);
      } else {
        resolve();
      }
    });
  }

  // 查询业务规则配置
  @Bind()
  handleBusinessRules() {
    const parame = querystring.parse(this.props.location.search.substr(1));
    const { partnerTenantId } = parame || {};
    const { setMustCompanyTabObj } = this.props;
    fetchBusinessRules({
      documentType: 1,
      partnerTenantId: partnerTenantId === '-1' ? undefined : partnerTenantId,
    }).then((resp) => {
      const res = getResponse(resp);
      if (res) {
        setMustCompanyTabObj(res);
      }
      this.handleDetailHeader();
    });
  }

  /**
   * 查询个性化
   */
  @Bind()
  queryCustomize(isSecondaryDomain, secondaryDomainTenantId) {
    const { dispatch, location } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { partnerTenantId } = routerParam;
    const unitCode = [
      'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.COLLAPSE',
      'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_OVERSEAS',
      'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_PERSONAL',
      'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.BUSINESS_INFO',
      'SSLM.ENTERPRISE_INFORM_CHANGE_SUPPLIER.COLLAPSE',
    ];
    const payload = {
      unitCode: unitCode.join(','),
      // customizeTenantId: partnerTenantId,
      ...(Number(partnerTenantId) === -1
        ? {
            customizeTenantId: isSecondaryDomain === 'true' ? secondaryDomainTenantId : '',
            isSecondaryDomain,
          }
        : {
            customizeTenantId: partnerTenantId,
          }),
    };
    dispatch({
      type: 'enterpriseInform/queryCustomize',
      payload,
    });
  }

  // 明细头查询
  @Bind()
  handleDetailHeader() {
    const {
      dispatch,
      match: {
        params: { changeReqId },
      },
    } = this.props;
    const parame = querystring.parse(this.props.location.search.substr(1));
    const { partnerTenantId } = parame || {};
    if (partnerTenantId && changeReqId) {
      dispatch({
        type: 'enterpriseInform/queryDetailHeader',
        payload: {
          changeReqId,
          customizeUnitCode: customizeUnitCode[0],
          customizeTenantId: partnerTenantId,
        },
      }).then((res) => {
        if (res) {
          const { checkMode, mustCompanyTab, changeLevel } = res;
          this.setState({
            changeLevel,
            detailHeader: res,
            verifyBankFlag: checkMode,
            mustCompanyTab: mustCompanyTab || '',
          });
        }
      });
      // 调查表配置查询
      dispatch({
        type: 'enterpriseInform/queryInfoChangeApprovalDetail',
        payload: {
          changeReqId,
          partnerTenantId,
        },
      }).then((res) => {
        if (res) {
          const configName =
            res.investigateConfigHeaders && res.investigateConfigHeaders.map((n) => n.configName);
          this.handleCatalog(configName, partnerTenantId);
        }
      });
    }
  }

  // 渲染目录
  @Bind()
  handleCatalog(configName = [], partnerTenantId) {
    const { mustCompanyTabObj } = this.props;
    // 平台目录(平台目录有顺序要求)
    const platformCatalog = [
      {
        key: 'registInform',
        configDescription: intl
          .get('sslm.enterpriseInform.view.fixCatalog.registInform')
          .d('登记信息'),
        configName: 'regist_inform',
        promptInform: intl
          .get('sslm.enterpriseInform.view.registInform.promptInform')
          .d(
            '非常重要：请参照贵司营业执照如实填写，否则会影响您的资质审核，无法进行后续正常业务操作。'
          ),
      },
      {
        key: 'registeBusinessInform',
        configDescription: intl
          .get('sslm.enterpriseInform.view.fixCatalog.registeBusinessInform')
          .d('基础业务信息'),
        configName: 'registe_business_inform',
        promptInform: intl
          .get('sslm.enterpriseInform.view.registeBusineInform.promptInform')
          .d(
            '非常重要：业务信息将会出现在您的主页上，丰富的内容有助于提高您的资质，便于更多企业快速阅览，促进交易。'
          ),
      },
      !configName.includes('sslmInvestgContact') && {
        key: 'contactInform',
        configDescription: intl
          .get('sslm.enterpriseInform.view.fixCatalog.contactInform')
          .d('联系人信息'),
        configName: 'contact_inform',
        titleTooltip: intl
          .get('sslm.supplierEntryDetail.titleTooltip.entry.contactPerson')
          .d('请至少填写一条联系人'),
        isRequired: mustCompanyTabObj.CONTACT,
        promptInform: intl
          .get('sslm.enterpriseInform.view.contactInform.promptInform')
          .d('非常重要：真实的联系人信息便于合作企业快速联系您，至少需要维护一条默认联系人。'),
      },
      !configName.includes('sslmInvestgAddress') && {
        key: 'addressInform',
        configDescription: intl
          .get('sslm.enterpriseInform.view.fixCatalog.addressInform')
          .d('地址信息'),
        configName: 'address_inform',
        isRequired: mustCompanyTabObj.ADDRESS,
        promptInform: intl
          .get('sslm.enterpriseInform.view.addressInform.promptInform')
          .d('您的企业可能在多地有工厂/分公司，建议维护完整信息，展示贵司规模。'),
      },
      !configName.includes('sslmInvestgBankAccount') && {
        key: 'bankInform',
        configDescription: intl
          .get('sslm.enterpriseInform.view.fixCatalog.bankInform')
          .d('银行信息'),
        configName: 'bank_inform',
        isRequired: mustCompanyTabObj.BANK,
        promptInform: intl
          .get('sslm.enterpriseInform.view.bankInform.promptInform')
          .d('维护账户信息，后续您向合作企业提供付款账号时，可快速复制。'),
      },
      {
        key: 'invoiceInform',
        configDescription: intl
          .get('sslm.enterpriseInform.view.fixCatalog.invoiceInform')
          .d('开票信息'),
        configName: 'invoice_inform',
        promptInform: intl
          .get('sslm.enterpriseInform.view.invoiceInform.promptInform')
          .d('非常重要：开票信息要保证发票真实有效，请维护准确完整的开票信息。'),
      },
      !configName.includes('sslmInvestgFin') && {
        key: 'financialInform',
        configDescription: intl
          .get('sslm.enterpriseInform.view.model.financialStatus.title')
          .d('财务状况'),
        configName: 'financial_inform',
        isRequired: mustCompanyTabObj.FIN,
        promptInform: intl
          .get('sslm.enterpriseInform.view.financialInform.promptInform')
          .d('提供贵司的近三年财务报告，有利于展示您的经营与发展状况。'),
      },
      !configName.includes('sslmInvestgAttachment') && {
        key: 'attachmentInform',
        configDescription: intl
          .get('sslm.enterpriseInform.view.fixCatalog.attachmentInform')
          .d('附件信息'),
        configName: 'attachment_inform',
        isRequired: mustCompanyTabObj.ATTACHMENT,
        promptInform: intl
          .get('sslm.enterpriseInform.view.attachmentInform.promptInform')
          .d(
            '您可在此处上传各类经营/质量及各类许可证信息，便于贵司的资质认可；同类型许可证可在同一行内上传多个附件。'
          ),
      },
      partnerTenantId !== '-1' && {
        key: 'supplierClassify',
        configDescription: intl
          .get('sslm.enterpriseInform.view.fixCatalog.supplierClassify')
          .d('供应商分类'),
        configName: 'supplier_classify',
      },
      partnerTenantId !== '-1' && {
        key: 'otherInform',
        configDescription: intl
          .get('sslm.supplierInform.view.fixCatalog.otherInform')
          .d('其他信息'),
        configName: 'other_inform',
      },
    ];

    this.setState({ allCatalog: platformCatalog.filter((n) => n) });
  }

  /**
   * 渲染折叠面板的Panel
   */
  renderPanel(item) {
    const {
      collapsedKeys,
      detailHeader: { changeLevel },
    } = this.state;
    const tip = item.isRequired
      ? intl
          .get('sslm.supplierEntryDetail.view.tooltip.leastOneLine', {
            name: item.configDescription,
            number: item.isRequired,
          })
          .d(`请至少填写${item.isRequired}条${item.configDescription}`)
      : item.titleTooltip;
    return (
      <Panel
        forceRender
        key={item.key}
        id={item.configName}
        showArrow={false}
        header={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h3 style={{ margin: '0', marginLeft: '16px' }}>{item.configDescription}</h3>
            <a style={{ marginLeft: '16px' }}>
              {collapsedKeys.includes(item.key)
                ? intl.get('hzero.common.button.up').d('收起')
                : intl.get('hzero.common.button.expand').d('展开')}
              {<Icon type={collapsedKeys.includes(item.key) ? 'up' : 'down'} />}
            </a>
            <div
              style={{
                display: 'inline-block',
                marginLeft: 24,
                width: '70%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {changeLevel === 'PLATFORM' && (
                <Tooltip placement="topLeft" title={item.promptInform}>
                  {item.promptInform}
                </Tooltip>
              )}
              {changeLevel !== 'PLATFORM' && tip && (
                <Tooltip placement="topLeft" title={tip}>
                  {tip}
                </Tooltip>
              )}
            </div>
          </div>
        }
      >
        {this.renderPanelComponent(item.key)}
      </Panel>
    );
  }

  /**
   * 渲染Panel对应的组件
   */
  renderPanelComponent(key) {
    const {
      match,
      customizeForm,
      customizeTable,
      custLoading,
      enterpriseInform: { customizeConfig = {} },
      custConfig = {},
    } = this.props;
    const { pubEdit, detailHeader, purchaserFlag, mustCompanyTab, changeLevel, isPub } = this.state;
    const changFlag =
      purchaserFlag ||
      (detailHeader.reqStatus !== 'NEW' &&
        detailHeader.reqStatus !== 'REJECTED' &&
        detailHeader.reqStatus !== 'CONFIRM_REJECTED');
    const { domesticForeignRelation, countryCode } = detailHeader;
    // eslint-disable-next-line prefer-destructuring
    const changeReqId = match.params.changeReqId;
    const routerParam = querystring.parse(this.props.location.search.substr(1));
    const { companyId, partnerTenantId } = routerParam;
    const { code } = this.state;

    const commonParams = {
      changFlag,
      changeReqId,
      companyId,
      changeLevel,
      partnerTenantId,
      domesticForeignRelation,
      supplierCompanyId: detailHeader.partnerCompanyId,
      supplierFlag: partnerTenantId === '-1' ? 0 : 1,
      pubEdit: changeLevel === 'PLATFORM' ? false : pubEdit,
    };

    const registInformProps = {
      code,
      source: 'enterprise',
      customizeForm,
      customizeUnitCode: changeLevel === 'PLATFORM' ? '' : customizeUnitCode[8],
      personalUnitCode: changeLevel === 'PLATFORM' ? '' : customizeUnitCode[9],
      queryUnitCode: [customizeUnitCode[8], customizeUnitCode[9]],
      customizeTenantId: partnerTenantId,
      ...commonParams,
      onRef: (ref = {}) => {
        this.registInForm = ref;
      },
      customizeConfig,
      pubEdit: false, // 工作流中个性化字段不可编辑
    }; // 登记信息

    const registeBusinessInformProops = {
      code,
      source: 'enterprise',
      customizeForm,
      customizeUnitCode: changeLevel === 'PLATFORM' ? '' : customizeUnitCode[10],
      customizeTenantId: partnerTenantId,
      ...commonParams,
      countryCode,
      onRef: (ref = {}) => {
        this.registeBusinessInForm = ref;
      },
      customizeConfig,
      pubEdit: false, // 工作流中个性化字段不可编辑
    }; // 注册业务信息

    const contactInformProps = {
      code,
      source: 'enterprise',
      customizeTable,
      customizeUnitCode: changeLevel === 'PLATFORM' ? '' : customizeUnitCode[4],
      customizeTenantId: partnerTenantId,
      ...commonParams,
      onRef: (ref = {}) => {
        this.contactInForm = ref;
      },
      changeLevel,
    }; // 联系人信息

    const addressInform = {
      custConfig,
      source: 'enterprise',
      customizeTable,
      customizeUnitCode: changeLevel === 'PLATFORM' ? '' : customizeUnitCode[5],
      customizeTenantId: partnerTenantId,
      ...commonParams,
      onRef: (ref = {}) => {
        this.addressInForm = ref;
      },
    }; // 地址信息

    const bankInformProps = {
      code,
      source: 'enterprise',
      customizeTable,
      customizeUnitCode: changeLevel === 'PLATFORM' ? '' : customizeUnitCode[1],
      customizeTenantId: partnerTenantId,
      domesticForeignRelation,
      ...commonParams,
      onRef: (ref = {}) => {
        this.bankInForm = ref;
      },
      changeLevel,
    }; // 银行信息

    const invoiceInformProps = {
      source: 'enterprise',
      custLoading,
      customizeForm,
      customizeUnitCode:
        changeLevel === 'PLATFORM' ? '' : 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.INVOICE_INFO',
      customizeTenantId: partnerTenantId,
      domesticForeignRelation,
      ...commonParams,
      onRef: (ref = {}) => {
        this.invoiceInForm = ref;
      },
      mustCompanyTab,
      pubEdit: false, // 工作流中个性化字段不可编辑
    }; // 开票信息

    const financialInformProps = {
      source: 'enterprise',
      customizeTable,
      customizeUnitCode: changeLevel === 'PLATFORM' ? '' : customizeUnitCode[7],
      customizeTenantId: partnerTenantId,
      ...commonParams,
      onRef: (ref = {}) => {
        this.financialInForm = ref;
      },
    }; // 财务状况

    const attachmentInformProps = {
      source: 'enterprise',
      customizeTable,
      customizeUnitCode: changeLevel === 'PLATFORM' ? '' : customizeUnitCode[6],
      customizeTenantId: partnerTenantId,
      ...commonParams,
      crossTenant: true,
      onRef: (ref = {}) => {
        this.attachmentInForm = ref;
      },
      isPub,
    }; // 附件信息

    const supplierClassifyProps = {
      ...commonParams,
      custLoading,
      customizeTable,
      customizeUnitCode:
        changeLevel === 'PLATFORM' ? '' : 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.SUPPLIER_CLASSIFY',
      onRef: (ref = {}) => {
        this.supplierClassify = ref;
      },
    };

    const otherInformProps = {
      customizeForm,
      customizeUnitCode: changeLevel === 'PLATFORM' ? '' : customizeUnitCode[2],
      customizeTenantId: partnerTenantId,
      ...commonParams,
      onRef: (ref = {}) => {
        this.otherInform = ref;
      },
    }; // 其他信息

    switch (key) {
      case 'registInform': // 登记信息
        return <RegistInform {...registInformProps} />;
      case 'registeBusinessInform': // 注册业务信息
        return <RegisteBusinessInform {...registeBusinessInformProops} />;
      case 'contactInform': // 联系人信息
        return <ContactInform {...contactInformProps} />;
      case 'addressInform': // 地址信息
        return <AddressInform {...addressInform} />;
      case 'bankInform': // 银行信息
        return <BankInform {...bankInformProps} />;
      case 'invoiceInform': // 开票信息
        return <InvoiceInform {...invoiceInformProps} />;
      case 'financialInform': // 财务状况
        return <FinancialInform {...financialInformProps} />;
      case 'attachmentInform': // 附件信息
        return <AttachmentInform {...attachmentInformProps} />;
      case 'supplierClassify': // 供应商分类
        return <SupplierClassify {...supplierClassifyProps} />;
      case 'otherInform':
        return <OtherInform {...otherInformProps} />;
      default:
        return null;
    }
  }

  /**
   * 折叠面板的收起／展开
   */
  @Bind()
  handleCollapse(collapsedKeys) {
    this.setState({ collapsedKeys });
  }

  /**
   * 获取值集
   */
  @Bind()
  handleInit(lovCodes) {
    const { dispatch } = this.props;
    dispatch({
      type: 'enterpriseInform/init',
      payload: lovCodes,
    }).then((res) => {
      if (res) {
        this.setState({ code: res });
      }
    });
  }

  /**
   * 刷新数据
   */
  @Bind()
  handleReflash(platformData = {}) {
    const { allFetch } = this.props;
    this.handleDetailHeader();
    if (platformData.comBasicReq || platformData.supBasicReq) {
      this.registInForm.handlequeryCompanyBasic();
    } // 登记信息刷新
    if (platformData.comBusinessReqDTO || platformData.supBusinessReqDTO) {
      this.registeBusinessInForm.handlequeryCompanyBusiness();
    } // 业务信息刷新
    if (platformData.invoiceReq || platformData.supInvoiceReq) {
      this.invoiceInForm.queryPlatformInvoice();
    } // 开票信息刷新
    if (platformData.comAddressReqs || platformData.supAddressReqs) {
      this.addressInForm.handlePlatformAddress();
    } // 地址信息刷新
    if (platformData.comAttachmentReqs || platformData.supAttachmentReqs) {
      this.attachmentInForm.handleAttachmentsList();
    } // 附件信息刷新
    if (platformData.financeReqs || platformData.supFinanceReqs) {
      this.financialInForm.handleCompanyFinance();
    } // 财务状况刷新
    if (platformData.comBankAccReqs || platformData.supBankAccReqs) {
      this.bankInForm.handlePlatformBank();
    } // 银行信息刷新
    if (platformData.comContactsReqs || platformData.supContactsReqs) {
      this.contactInForm.handlePlatformContact();
    } // 联系人信息刷新
    if (platformData.sslmInvestgSupplierCate) this.supplierClassify.handleSupplierClassifyList(); // 供应商分类刷新
    if (platformData.supChangeOther) this.otherInform.handleSupChangeOther(); // 其他信息刷新
    allFetch();
  }

  /**
   * 信息比对
   */
  @Bind()
  handleCompare() {
    const {
      match: { params },
      history,
    } = this.props;
    const {
      isPub,
      purchaserFlag,
      detailHeader,
      workflowFlag,
      isSecondaryDomain,
      secondaryDomainTenantId,
    } = this.state;
    // eslint-disable-next-line prefer-destructuring
    const { changeReqId } = params;
    const routerParam = querystring.parse(this.props.location.search.substr(1));
    const { companyId, partnerTenantId, ...rest } = routerParam;
    const pathname = isPub
      ? `/pub/sslm/enterprise-inform-change/compare/${changeReqId}/${companyId}`
      : `/sslm/enterprise-inform-change/compare/${changeReqId}/${companyId}`;
    const backPath = isPub
      ? `/pub/sslm/enterprise-inform-change/detail/${changeReqId}`
      : `/sslm/enterprise-inform-change/detail/${changeReqId}`;
    const historyBack = `${backPath}?${querystring.stringify({
      companyId,
      partnerTenantId,
      isPurchaser: purchaserFlag ? 1 : 0,
    })}`;
    const search = {
      ...rest,
      partnerTenantId,
      changeLevel: detailHeader.changeLevel,
      source: 'enterprise',
      isSecondaryDomain,
      secondaryDomainTenantId,
    };

    if (workflowFlag) {
      history.push({
        pathname: `/sslm/workflow/enterprise-inform-change/compare/${changeReqId}/${companyId}`,
        search: querystring.stringify({
          ...search,
          workflowFlag: workflowFlag ? 1 : 0,
        }),
      });
    } else {
      history.push({
        pathname,
        search: querystring.stringify(search),
        state: { historyBack },
      });
    }
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const { backPath } = this.state;
    const { dispatch, match, history } = this.props;
    // eslint-disable-next-line prefer-destructuring
    const changeReqId = match.params.changeReqId;

    Modal.confirm({
      title: intl.get('sslm.enterpriseInform.view.confirmMsg.deleteSubmit').d('确认删除？'),
      onOk: () => {
        dispatch({
          type: 'enterpriseInform/deleteApplication',
          payload: {
            changeReqIdList: [changeReqId],
            customizeUnitCode,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            history.push(backPath);
          }
        });
      },
    });
  }

  platformData = { customizeUnitCode, desensitize: false };

  allError = true;

  /**
   * 校验数据
   */
  @Bind()
  async verifyData(form, objname) {
    try {
      const data = await form.checkData();
      if (data && this.allError) {
        this.platformData[objname] = data;
        this.allError = true;
      } else {
        this.allError = false;
      }
    } catch (error) {
      this.allError = false;
    }
  }

  /**
   * 提交／保存
   */
  @Bind()
  async handleSaveAddSubmit(flag, param = '', resolve) {
    const appealReason = param ? { appealReason: param } : {};
    const isAppeal = { isAppeal: param ? 1 : 0 };
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      enterpriseInform: { collapseCodeList = [] },
      allSave,
    } = this.props;
    const { detailHeader, isAllPlatform, isSecondaryDomain } = this.state;
    const routerParam = querystring.parse(this.props.location.search.substr(1));
    const { partnerTenantId } = routerParam;

    // 登记信息 校验
    if (this.registInForm && collapseCodeList.includes('registInform')) {
      await this.verifyData(
        this.registInForm,
        partnerTenantId === '-1' ? 'comBasicReq' : 'supBasicReq'
      );
    }

    // 注册业务信息 校验
    if (this.registeBusinessInForm && collapseCodeList.includes('registeBusinessInform')) {
      await this.verifyData(
        this.registeBusinessInForm,
        partnerTenantId === '-1' ? 'comBusinessReqDTO' : 'supBusinessReqDTO'
      );
    }

    // 开票信息 检验
    if (this.invoiceInForm && collapseCodeList.includes('invoiceInform')) {
      await this.verifyData(
        this.invoiceInForm,
        partnerTenantId === '-1' ? 'invoiceReq' : 'supInvoiceReq'
      );
    }

    // 地址信息 校验
    if (this.addressInForm && collapseCodeList.includes('addressInform')) {
      await this.verifyData(
        this.addressInForm,
        partnerTenantId === '-1' ? 'comAddressReqs' : 'supAddressReqs'
      );
    }

    // 附件信息 校验
    if (this.attachmentInForm && collapseCodeList.includes('attachmentInform')) {
      await this.verifyData(
        this.attachmentInForm,
        partnerTenantId === '-1' ? 'comAttachmentReqs' : 'supAttachmentReqs'
      );
    }

    // 财务状况 检验
    if (this.financialInForm && collapseCodeList.includes('financialInform')) {
      await this.verifyData(
        this.financialInForm,
        partnerTenantId === '-1' ? 'financeReqs' : 'supFinanceReqs'
      );
    }

    // 银行信息
    if (this.bankInForm && collapseCodeList.includes('bankInform')) {
      await this.verifyData(
        this.bankInForm,
        partnerTenantId === '-1' ? 'comBankAccReqs' : 'supBankAccReqs'
      );
    }

    // 联系人信息
    if (this.contactInForm && collapseCodeList.includes('contactInform')) {
      await this.verifyData(
        this.contactInForm,
        partnerTenantId === '-1' ? 'comContactsReqs' : 'supContactsReqs'
      );
    }

    // 供应商分类
    if (this.supplierClassify && collapseCodeList.includes('supplierClassify')) {
      await this.verifyData(this.supplierClassify, 'sslmInvestgSupplierCate');
    }

    // 其他信息
    if (this.otherInform && collapseCodeList.includes('otherInform')) {
      await this.verifyData(this.otherInform, 'supChangeOther');
    }

    await new Promise((headerResolve) => {
      validateFieldsAndScroll({ force: true }, (error, values) => {
        if (!error && this.allError) {
          const firmChangeReq = { ...detailHeader, ...values, ...appealReason, ...isAppeal };
          const { allErrs, allData } = allSave();
          if (allErrs) return true;
          const payload = {
            firmChangeReq,
            ...this.platformData,
            ...allData,
            customizeTenantId: partnerTenantId,
            tenantId: partnerTenantId !== '-1' ? partnerTenantId : undefined,
            changeReqId: detailHeader.changeReqId,
          };
          if (flag) {
            dispatch({
              type: 'enterpriseInform/allSave',
              payload,
            }).then((res) => {
              if (res) {
                notification.success();
                this.handleReflash(this.platformData);
                if (isFunction(resolve)) {
                  resolve(res);
                }
              } else if (isFunction(resolve)) {
                resolve(false);
              }
            });
          } else if (!isAllPlatform) {
            // 针对采购方变更
            this.handleCheckBankAccount({ allData, payload });
          } else if (isSecondaryDomain && !collapseCodeList.includes('bankInform')) {
            // 平台级变更:有二级域名并且个性化隐藏银行页签，不进行校验银行信息
            this.classifyRepeatCheck(payload);
          } else {
            // 平台级变更不是二级域名或者个性化显示银行页签，直接进行校验银行信息
            this.handleCheckBankAccount({ allData, payload });
          }
        } else if (isFunction(resolve)) {
          resolve(false);
        } else {
          headerResolve(false);
        }
      });
    });
    this.allError = true; // 校验完成恢复初始值
  }

  /**
   * 弱校验
   */
  @Bind()
  handleCheckBankAccount({ allData = {}, payload = {} }) {
    const { detailHeader, verifyBankFlag, isAllPlatform } = this.state;
    const { dispatch } = this.props;
    const routerParam = querystring.parse(this.props.location.search.substr(1));
    const { partnerTenantId } = routerParam;
    const data =
      (partnerTenantId === '-1'
        ? this.platformData.comBankAccReqs
        : this.platformData.supBankAccReqs) ||
      allData.sslmInvestgBankAccount ||
      [];
    const bankAccountList = data.map((n) => {
      const { investgBankAccountId, bankAccReqId, bankAccountName, comBankAccReqId, ...other } = n;
      return {
        bankAccountId: investgBankAccountId || bankAccReqId || comBankAccReqId,
        bankAccountName,
        ...other,
      };
    });
    // 登记信息企业名称
    const { companyName } = this.platformData.comBasicReq || {};
    // 校验银行信息账户名称是否一致、银行账户是否重复标识
    dispatch({
      type: 'enterpriseInform/checkBankAccountCommon',
      payload: {
        bankAccountList,
        documentId: detailHeader.changeReqId,
        documentSource: 'FIRM_CHANGE',
        companyName,
      },
    }).then((resp) => {
      const res = getResponse(resp);
      if (res) {
        const { bankDataFlag = true, bankNameFlag = true } = res || {};
        // 银行名称不一致需要前端校验的场景
        const bankAccountNameFlag =
          !bankNameFlag && (verifyBankFlag === 'weakCheck' || isAllPlatform);
        if (!bankDataFlag || bankAccountNameFlag) {
          const bankDataMsg =
            !isUndefined(bankDataFlag) && !bankDataFlag
              ? intl
                  .get('sslm.supplierInform.view.message.bankDuplicateToolTips')
                  .d('存在银行账户重复的数据，请检查数据，确认是否继续提交')
              : '';
          const bankNameMsg =
            !isUndefined(bankNameFlag) && bankAccountNameFlag
              ? intl
                  .get('sslm.supplierInform.view.message.bankToolTips')
                  .d('银行账户名称与公司名称不一致，请确认是否继续提交')
              : '';
          Modal.confirm({
            title: (
              <Fragment>
                <div>{bankDataMsg}</div>
                <div>{bankNameMsg}</div>
              </Fragment>
            ),
            onOk: () => {
              this.classifyRepeatCheck(payload);
            },
          });
        } else {
          this.classifyRepeatCheck(payload);
        }
      }
    });
  }

  // 供应商分类弱校验，产品要求单独校验，不可合并校验
  // 公司级变更，对比供应商分类是否变更，如有变更，弹框确认
  @Bind()
  classifyRepeatCheck(payload = {}) {
    const { firmChangeReq: { supplierCategoryChangeFlag } = {} } = payload;
    if (supplierCategoryChangeFlag) {
      Modal.confirm({
        title: intl
          .get('sslm.common.classfiy.repeatMsg')
          .d('当前为公司级供应商信息变更，供应商分类变更会同步至全集团，请确认是否变更'),
        onOk: () => {
          this.handleSubmit(payload);
        },
      });
    } else {
      this.handleSubmit(payload);
    }
  }

  /**
   * 提交数据
   */
  @Bind()
  handleSubmit(payload = {}) {
    const { dispatch } = this.props;
    const { backPath } = this.state;
    dispatch({
      type: 'enterpriseInform/submitApplication',
      payload,
    }).then((res) => {
      if (res) {
        if (res.reqStatus === 'FAIL') {
          // 报错了显示出申诉按钮
          if (res.code === 'authentication.failed.notknown.firm') {
            this.setState({ showAppealBtn: true });
          }
          notification.error({ description: res.remark });
          this.handleReflash(this.platformData);
        } else {
          notification.success();
          const { history } = this.props;
          history.push(backPath);
        }
      } else {
        // 避免saga调用失败造成回滚版本号变化，提交失败进行一次数据刷新
        this.handleReflash(this.platformData);
      }
    });
  }

  /**
   * 导航栏的显示／隐藏
   */
  @Bind()
  toggleAnchor() {
    const { anchorShow } = this.state;
    this.setState({ anchorShow: !anchorShow });
  }

  render() {
    const {
      form,
      editLoading,
      QuestionLink,
      QuestionArea,
      queryConfigLoading,
      customizeForm,
      customizeCollapse,
      custLoading,
      enterpriseInform: { collapseCodeList = [] },
    } = this.props;
    const {
      isPub,
      pubEdit,
      backPath,
      allCatalog,
      changeLevel,
      detailHeader,
      anchorShow,
      isInclude,
      workflowFlag,
      purchaserFlag,
      showAppealBtn,
      isAllPlatform,
      isSecondaryDomain,
    } = this.state;

    const changFlag =
      purchaserFlag ||
      (detailHeader.reqStatus !== 'NEW' &&
        detailHeader.reqStatus !== 'REJECTED' &&
        detailHeader.reqStatus !== 'CONFIRM_REJECTED');
    const openModal = (modal, title, width) => {
      modal.open({
        drawer: true,
        title,
        className: stylesModal.createModal,
        bodyStyle: {
          padding: 0,
        },
        children: (
          <C7NForm dataSet={this.formDs} labelLayout="float" columns={1}>
            <Alert
              banner
              showIcon
              closable
              type="info"
              iconType="help"
              className={stylesModal.supEntryAlert}
              message={intl
                .get('sslm.enterpriseInform.view.alert.createWarning')
                .d(
                  '如您对审批拒绝的原因有疑义可提出申诉，提交后将转至人工审批，需等待0-1个工作日。'
                )}
            />
            <div style={{ padding: '0px 20px' }}>
              <TextArea
                label={intl.get('sslm.enterpriseInform.model.view.appealReason').d('申诉原因')}
                name="appealReason"
                cols="50"
                rows="4"
                resize="both"
                clearButton
                maxLength={100}
              />
            </div>
          </C7NForm>
        ),
        okFirst: true,
        okText: intl.get('sslm.enterpriseInform.button.submit').d('提交'),
        onOk: async () => {
          const res = await this.formDs.validate();
          if (res) {
            const data = this.formDs.toData();
            this.handleSaveAddSubmit(false, data[0].appealReason);
            return true;
          } else {
            return false;
          }
        },
        style: { width },
      });
    };
    const InnerModal = () => {
      const modal = useModal();
      const handleClick = React.useCallback(
        () =>
          openModal(
            modal,
            intl.get('sslm.enterpriseInform.model.view.appealReasonB').d('申诉原因'),
            380
          ),
        []
      );
      return (
        isAllPlatform && (
          <C7NButton
            icon="question_answer"
            loading={editLoading}
            onClick={handleClick}
            style={{
              display:
                detailHeader.appealFlag === 1 ||
                detailHeader.reqStatus === 'REJECTED' ||
                showAppealBtn
                  ? 'inline-block'
                  : 'none',
            }}
          >
            {intl.get('sslm.enterpriseInform.button.appeal').d('申诉')}
          </C7NButton>
        )
      );
    };

    const allLoading = editLoading || queryConfigLoading;

    return (
      <Fragment>
        <Header
          title={intl.get('sslm.enterpriseInform.view.title.changeApplication').d('企业信息变更')}
          backPath={workflowFlag || isInclude ? '' : backPath}
        >
          <Button
            icon="check"
            type="primary"
            onClick={() => this.handleSaveAddSubmit(false)}
            loading={allLoading}
            style={{ display: changFlag ? 'none' : 'inline-block' }}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button
            icon="save"
            onClick={() => this.handleSaveAddSubmit(true)}
            loading={allLoading}
            style={{ display: changFlag ? 'none' : 'inline-block' }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="delete"
            loading={allLoading}
            onClick={this.handleDelete}
            style={{ display: changFlag ? 'none' : 'inline-block' }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <PerButton
            permissionList={[
              {
                code: `srm.mdm.firm-info-change.ps.button.detailcompare`,
                type: 'button',
                meaning: '信息比对-查看',
              },
            ]}
            icon="profile"
            loading={allLoading}
            onClick={this.handleCompare}
          >
            {intl.get('sslm.enterpriseInform.view.button.informationComparison').d('信息比对')}
          </PerButton>
          <ModalProvider>
            <InnerModal />
          </ModalProvider>
        </Header>
        <Content>
          <Spin spinning={queryConfigLoading || false}>
            <Form className="ued-edit-form">
              <div style={{ margin: '0 16px 24px' }}>
                <HeaderInfo
                  changFlag={changFlag || isPub || purchaserFlag}
                  detailHeader={detailHeader}
                  form={form}
                  pubEdit={pubEdit}
                  custLoading={custLoading}
                  customizeForm={customizeForm}
                  customizeUnitCode={changeLevel === 'PLATFORM' ? '' : customizeUnitCode[0]}
                />
              </div>
            </Form>
            <div className="ued-detail-wrapper">
              {customizeCollapse(
                {
                  code: isSecondaryDomain
                    ? 'SSLM.ENTERPRISE_INFORM_CHANGE_SUPPLIER.COLLAPSE'
                    : 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.COLLAPSE',
                },
                <Collapse
                  className="form-collapse"
                  onChange={this.handleCollapse}
                  custLoading={custLoading}
                >
                  {allCatalog.map((item) => item && this.renderPanel(item))}
                </Collapse>
              )}
            </div>
            {QuestionArea}
            <div
              className={classnames(styles['page-anchor-container'], {
                [styles['toggle-show']]: !anchorShow,
              })}
            >
              <div className={styles['anchor-icon']} onClick={this.toggleAnchor}>
                <NewIcon
                  type="baseline-arrow_right"
                  className={
                    anchorShow
                      ? styles['anchor-icon-custom-right']
                      : styles['anchor-icon-custom-left']
                  }
                  style={{ fontSize: 27, marginLeft: -8 }}
                />
              </div>
              <div className={classnames(styles['anchor-content'])}>
                <Anchor
                  getContainer={() =>
                    document.getElementsByClassName('page-container')[0] || document.body
                  }
                >
                  {allCatalog.map((item) => {
                    if (item && collapseCodeList.includes(item.key)) {
                      return (
                        <Link
                          key={item.key}
                          href={`#${item.configName}`}
                          title={item.configDescription}
                        />
                      );
                    } else {
                      return null;
                    }
                  })}
                  {QuestionLink}
                </Anchor>
              </div>
            </div>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}

const Index = (props) => {
  const [mustCompanyTabObj, setMustCompanyTabObj] = useState({});
  const { QuestionLink, QuestionArea, allSave, allFetch, reqStatus } = useQuestionnaire({
    ...props,
    mustCompanyTabObj,
  });
  return useMemo(
    () => (
      <Detail
        {...{
          QuestionLink,
          QuestionArea,
          allSave,
          allFetch,
          mustCompanyTabObj,
          setMustCompanyTabObj,
          ...props,
        }}
      />
    ),
    [QuestionLink.length, reqStatus, props]
  );
};

export default compose(
  connect(({ enterpriseInform }) => ({
    enterpriseInform,
  })),
  formatterCollections({
    code: [
      'sslm.enterpriseInform',
      'sslm.common',
      'spfm.enterprise',
      'spfm.investigationDefinition',
    ],
  })
)(Index);
