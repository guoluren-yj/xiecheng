/**
 * Detail - 供应商信息变更申请详情
 * @date: 2019-12-11
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import uuid from 'uuid/v4';
import qs from 'querystring';
import { connect } from 'dva';
import { compose, isUndefined, concat, isFunction, head } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { Icon as NewIcon } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import React, { Component, Fragment, useMemo, useState, createRef } from 'react';
import { Anchor, Form, Collapse, Icon, Spin, Modal as H0Modal, Tooltip } from 'hzero-ui';
import remote from 'utils/remote';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button } from 'components/Permission';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { checkPermission } from 'services/api';
import { Header, Content } from 'components/Page';
// import UploadModal from 'components/Upload/index';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';

import '@/routes/index.less';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import DynamicTable from '@/routes/components/DynamicTable/components/DynamicTable';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { aiApprove, fetchBusinessRules, fetchApproveStatus } from '@/services/commonService';
import styles from '@/routes/components/Navbar/index.less';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/common/intelligentReview.svg';
import HeaderInfo from './HeaderInfo';
import OtherInform from './OtherInform';
import LocationInform from './LocationInform'; // 地点层信息
import PurchaseInform from './PurchaseInform'; // 采购/财务信息
import SupplierCategoryInform from './SupplierCategoryInform'; // 供货能力清单
import SupplierClassify from './SupplierClassify'; // 供应商分类
import RegistInform from '../../EnterpriseInform/Detail/RegistInform'; // 登记信息
import BusinessInform from '../../EnterpriseInform/Detail/RegisteBusinessInform'; // 业务信息
import ContactInform from '../../EnterpriseInform/Detail/ContactInform'; // 联系人信息
import AddressInform from '../../EnterpriseInform/Detail/AddressInform'; // 地址信息
import BankInform from '../../EnterpriseInform/Detail/BankInform'; // 银行信息
import InvoiceInform from '../../EnterpriseInform/Detail/InvoiceInform'; // 开票信息
import AttachmentInform from '../../EnterpriseInform/Detail/AttachmentInform'; // 附件信息
import { useQuestionnaire } from './Investigate'; // 调查表信息
import Compare from '../Compare'; // 信息对比

const { Link } = Anchor;
const { Panel } = Collapse;
const { confirm } = H0Modal;

const tenantId = getCurrentOrganizationId();

const customizeUnitCode = [
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.CHANGE_ABILITY_LINE_TABLE',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.HEADER',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.REGISTRATION_OVERSEAS',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.BUSINESS_INFO',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.CONTACT_INFO',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.BANK_INFO',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.INVOICE_INFO',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.OTHER_INFO_FORM',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_INFO',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_HEAD',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ADDRESS_INFO',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.REGISTRATION_PERSONAL',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.SUPPLIER_CLASSIFY',
  'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ATTACHMENT_INFO',
];

@connect(({ supplierInform, enterpriseInform, loading }) => ({
  supplierInform,
  enterpriseInform,
  editLoading:
    loading.effects['supplierInform/submitApplication'] ||
    loading.effects['supplierInform/deleteApplication'] ||
    loading.effects['supplierInform/allSave'] ||
    loading.effects['supplierInform/checkBankAccount'] ||
    loading.effects['supplierInform/checkedSupplierChange'],
  queryLoading:
    loading.effects['supplierInform/queryDetailHeader'] ||
    loading.effects['supplierInform/queryInvestigateConfig'] ||
    loading.effects[`supplierInform/querySupChangeOther`],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sslm.supplierInform',
    'sslm.enterpriseInform',
    'sslm.supplierDetail',
    'spfm.enterprise',
    'sslm.common',
    'sslm.commonApplication',
    'sslm.supplierEntryDetail',
    'spfm.bank',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.CHANGE_ABILITY_LINE_TABLE',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.HEADER',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.REGISTRATION_OVERSEAS',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.BUSINESS_INFO',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.CONTACT_INFO',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.BANK_INFO',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.INVOICE_INFO',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.OTHER_INFO_FORM',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_INFO',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_HEAD',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.COLLAPSE',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.SUPPLY_CAPACITY.BTN_GROUP',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ADDRESS_INFO',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.REGISTRATION_PERSONAL',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.SUPPLIER_CLASSIFY',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_BTN',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ATTACHMENT_INFO',
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.HEADER_BTNGROUP',
  ],
  usePostMap: {
    'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.BANK_INFO': ['attributeLongtext2', 'attributeLongtext3'],
  },
})
class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { changeReqId, companyId },
        path,
      },
    } = props;
    const isPub = path.includes('/pub/');
    const routerParam = qs.parse(props.location.search.substr(1));
    const {
      supplierCompanyId,
      pubEdit = 0,
      readOnly = 0,
      pageReadOnly = 0,
      sourceType,
      openMenuType = '', // 打开菜单的方式， openTab的不要返回箭头
      ...otherParams
    } = routerParam;
    const hiddenBachPath = isPub || openMenuType === 'openTab';
    this.state = {
      sourceType,
      collapsedKeys: [], // 展开的Key集合
      newAttachmentUuid: uuid(),
      changeReqId,
      supplierInformCatalog: [],
      platformCatalog: [],
      isPub,
      companyId,
      code: {},
      supplierCompanyId,
      anchorShow: false,
      tableList: [],
      pubEdit: !!Number(pubEdit), // 工作流页面可编辑
      readOnlyFlag: !!Number(readOnly), // 页面只读不可编辑
      mustCompanyTab: '', // 门户配置的必填页签
      savePermissionFlag: true, // 判断保存的权限集是否为显示，若非显示则行上其他按钮都隐藏
      pageReadOnly: !!Number(pageReadOnly), // 角色工作台跳转,需要设置页面只读
      otherParams, // 用于模型表查询参数
      hiddenBachPath, // 隐藏返回箭头
      remoteEditFlag: true, // 埋点可编辑
      extraLoading: false, // 新加的loading
      reviewIsClick: false, // 记录【智能预审】按钮是否点击了
      aiApproveStatus: null, // 智能预审状态
    };
  }

  supplyCapabilityInform; // 供货能力信息

  PurchaseInform; // 采购/财务信息

  LocationInform; // 地点层信息

  OtherInform; // 其他信息

  supplierClassify; // 供应商分类

  attachmentInForm; // 附件信息

  remoteRef = {}; // 二开新增页签的ref

  timerRef = createRef(null); // 定时器

  timerTime = createRef(0); // 记录轮询次数

  componentDidMount() {
    const { onLoad } = this.props;
    if (isFunction(onLoad)) {
      onLoad({
        submit: this.workflowSubmit,
      });
    }

    this.handleBusinessRules();
    // this.handleDetailHeader();
    const lovCodes = {
      ID: 'SPFM.ID_TYPE',
      gender: 'HPFM.GENDER',
      companyType: 'HPFM.COMPANY_TYPE', // 登记信息-企业类型
      taxpayerType: 'HPFM.TAXPAYER_TYPE', // 登记信息-纳税人标识
      servicesAreas: 'SPFM.COMPANY.SERVICE_AREA', // 业务信息-送货服务范围
      businessType: 'SPFM.MASTER.STATUS', // 业务信息-主要身份
      serviceType: 'SPFM.BUSINESS.NATURE', // 业务信息-经营性质
      planGroups: 'SSLM.PROGRAMME_GROUPS', // 采购/财务信息-计划组
      paymentFrozenList: 'SSLM.PAYMENT_FROZEN', // 采购/财务信息-付款冻结代码
      contactType: 'SSLM.CONTACT_TYPE', // 联系人类型
      tradeTerms: 'SSLM.TRADE_TERMS',
      institutionalType: 'SPFM.INSTITUTION_TYPE', // 登记信息-机构类型
      domesticForeignRelationList: 'SSLM.CERTIFICATION_AREA', // 认证地区
      accountNatureType: 'SPFM.NATURE_OF_ACCOUNT', // 账户性质
      accountPurposeType: 'SPFM.PURPOSE_OF_ACCOUNT', // 账户用途
      tenantId,
    };
    this.handleInit(lovCodes);
    this.queryCustomize();
    this.querySavePermission();
    // 查询配置表
    queryRelTableConfig('sslm_supplier_change_req').then(res => {
      this.setState({
        tableList: res,
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { reviewIsClick } = this.state;
    const { reviewIsClick: prevReviewIsClick } = prevState;
    if (reviewIsClick !== prevReviewIsClick) {
      this.timerRef.current = setInterval(() => this.getAiApproveResult(), 5000);
    }
  }

  componentWillUnmount() {
    // 清空model
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierInform/updateState',
      payload: {
        detailHeader: {},
      },
    });
    this.clearTimerRef();
  }

  // 查询业务规则配置
  @Bind()
  handleBusinessRules() {
    const { setMustCompanyTabObj } = this.props;
    fetchBusinessRules({ documentType: 2 }).then(resp => {
      const res = getResponse(resp);
      if (res) {
        setMustCompanyTabObj(res);
      }

      this.handleDetailHeader();
    });
  }

  // 查询保存按钮权限
  @Bind()
  querySavePermission() {
    checkPermission(['srm.partner.my-partner.supplier-inform-change.ps.doc.save']).then(res => {
      if (res) {
        const { controllerType } = head(res);
        this.setState({ savePermissionFlag: !['disabled', 'hidden'].includes(controllerType) });
      }
    });
  }

  @Bind()
  setLoading(flag) {
    this.setState({ extraLoading: flag });
  }

  // 工作流审批回调
  @Bind()
  workflowSubmit(approveResult) {
    const { dispatch, supplierInfoChangeRemote } = this.props;
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved') {
        try {
          const payload = await this.getSaveParams();
          if (payload) {
            // 默认返回true,当返回false时走二开逻辑不走标准逻辑
            const cuxRes = await supplierInfoChangeRemote.event.fireEvent('cuxWorkflowApproved', {
              _this: this,
            });
            if (!cuxRes) {
              return;
            }
            dispatch({
              type: 'supplierInform/allSave',
              payload,
            }).then(res => {
              if (res) {
                resolve(res);
              } else {
                reject(new Error(res));
              }
            });
          } else {
            reject();
          }
        } catch (error) {
          reject();
        }
      } else {
        resolve();
      }
    });
  }

  /**
   * 获取值集
   */
  @Bind()
  handleInit(lovCodes) {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierInform/init',
      payload: lovCodes,
    }).then(res => {
      if (res) {
        this.setState({ code: res });
      }
    });
  }

  /**
   * 查询个性化
   */
  @Bind()
  queryCustomize() {
    const { dispatch } = this.props;
    const payload = {
      unitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.COLLAPSE',
    };
    dispatch({
      type: 'supplierInform/queryCustomize',
      payload,
    });
  }

  @Bind()
  handleRemoteRef(key, node) {
    this.remoteRef[key] = node;
  }

  // 渲染目录
  @Bind()
  handleCatalog(systemType, configName = [], siteFlag = 0) {
    const { mustCompanyTabObj } = this.props;

    // 原供应商信息变更页签
    const supplierInformCatalog = [
      {
        key: 'supplyCapacityInform',
        configDescription: intl
          .get('sslm.supplierDetail.view.fixCatalog.supplyCapacityList')
          .d('供货能力清单'),
        configName: 'supply_capacity_inform',
        isRequired: mustCompanyTabObj.ABILITY,
      },
      {
        key: 'supplierClassify',
        configDescription: intl
          .get('sslm.supplierInform.view.fixCatalog.supplierClassify')
          .d('供应商分类'),
        configName: 'supplier_classify',
      },
      {
        key: 'purchaseInform',
        configDescription: intl
          .get('sslm.supplierInform.view.fixCatalog.purchaseInform')
          .d('采购/财务信息'),
        configName: 'purchase_inform',
        isRequired: mustCompanyTabObj.FINPF,
      },
      (systemType === 'EBS' || systemType === 'BOTH') &&
        siteFlag !== 1 && {
          key: 'locationInform',
          configDescription: intl
            .get('sslm.supplierInform.view.fixCatalog.locationInform')
            .d('地点层信息'),
          configName: 'location_inform',
          isRequired: mustCompanyTabObj.PLACE,
        },
      {
        key: 'otherInform',
        configDescription: intl
          .get('sslm.supplierInform.view.fixCatalog.otherInform')
          .d('其他信息'),
        configName: 'other_inform',
      },
    ].filter(Boolean);

    // 新增平台页签，有调查表时先展示调查表
    const platformCatalog = [
      {
        key: 'registInform',
        configDescription: intl
          .get('sslm.supplierDetail.view.fixCatalog.registInform')
          .d('登记信息'),
        configName: 'regist_inform',
      },
      {
        key: 'businessInform',
        configDescription: intl
          .get('sslm.supplierDetail.view.fixCatalog.businessInform')
          .d('基础业务信息'),
        configName: 'registe_business_inform',
      },
      !configName.includes('sslmInvestgContact') && {
        key: 'contactInform',
        configDescription: intl
          .get('sslm.supplierDetail.view.fixCatalog.contactInform')
          .d('联系人信息'),
        configName: 'contact_inform',
        titleTooltip: intl
          .get('sslm.supplierEntryDetail.titleTooltip.entry.contactPerson')
          .d('请至少填写一条联系人'),
        isRequired: mustCompanyTabObj.CONTACT,
      },
      !configName.includes('sslmInvestgAddress') && {
        key: 'addressInform',
        configDescription: intl
          .get('sslm.supplierDetail.view.fixCatalog.addressInform')
          .d('地址信息'),
        configName: 'address_inform',
        isRequired: mustCompanyTabObj.ADDRESS,
      },
      !configName.includes('sslmInvestgBankAccount') && {
        key: 'bankInform',
        configDescription: intl.get('sslm.supplierDetail.view.fixCatalog.bankInform').d('银行信息'),
        isRequired: mustCompanyTabObj.BANK,
        configName: 'bank_inform',
      },
      {
        key: 'invoiceInform',
        configDescription: intl
          .get('sslm.supplierDetail.view.fixCatalog.invoiceInform')
          .d('开票信息'),
        configName: 'invoice_inform',
      },
      !configName.includes('sslmInvestgAttachment') && {
        key: 'attachmentInform',
        configDescription: intl
          .get('sslm.enterpriseInform.view.fixCatalog.attachmentInform')
          .d('附件信息'),
        configName: 'attachment_inform',
        isRequired: mustCompanyTabObj.ATTACHMENT,
      },
    ].filter(Boolean);

    this.setState({ platformCatalog, supplierInformCatalog });
  }

  // 明细头查询
  @Bind()
  handleDetailHeader() {
    const { dispatch, supplierInfoChangeRemote } = this.props;
    const { isPub, changeReqId } = this.state;
    dispatch({
      type: 'supplierInform/queryDetailHeader',
      payload: {
        changeReqId,
        customizeUnitCode: customizeUnitCode[1],
      },
    }).then(res => {
      if (res) {
        // 处理编辑埋点
        this.handleRemoteEdit(res);
        // siteFlag =1 启用业务规则，展示模型表地点层数据隐藏原平台地点层信息
        // verifyBankFlag =1 取业务规则配置，弱校验弹窗提示
        const { siteFlag, checkMode, mustCompanyTab } = res;
        this.setState({
          siteFlag,
          verifyBankFlag: checkMode,
          mustCompanyTab: mustCompanyTab || '',
          aiApproveStatus: res.aiApproveStatus,
        });
        // 调查表配置查询
        dispatch({
          type: 'supplierInform/queryInvestigateConfig',
          payload: { changeReqId },
        }).then(response => {
          if (response) {
            const configName =
              response.investigateConfigHeaders &&
              response.investigateConfigHeaders.map(n => n.configName);
            const { systemType } = res;
            this.handleCatalog(systemType, configName, siteFlag);
          }
        });
        const cuxDidMountEventsProps = {
          isPub,
          onCompare: this.handleCompare,
        };
        supplierInfoChangeRemote.event.fireEvent('cuxDidMountEvents', cuxDidMountEventsProps);
      }
    });
  }

  /**
   * 渲染明细头部表单
   */
  renderHeaderForm() {
    const {
      form,
      customizeForm,
      supplierInform: { detailHeader = {} },
    } = this.props;
    const {
      companyId,
      pubEdit,
      readOnlyFlag,
      savePermissionFlag,
      pageReadOnly,
      isPub,
      remoteEditFlag,
    } = this.state;
    const headerStatus = ['NEW', 'REJECTED'].includes(detailHeader.reqStatus) && remoteEditFlag;
    const changFlag = readOnlyFlag || !headerStatus || pageReadOnly || isPub;
    const headerInfoProps = {
      form,
      changFlag,
      companyId,
      pubEdit,
      detailHeader,
      customizeForm,
      savePermissionFlag,
      readOnly: !headerStatus || readOnlyFlag || !savePermissionFlag,
    };
    return <HeaderInfo {...headerInfoProps} />;
  }

  /**
   * 渲染折叠面板的Panel
   */
  @Bind()
  renderPanel(item) {
    const { collapsedKeys } = this.state;
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
        header={fieldName => {
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h3 style={{ margin: '0', marginLeft: '16px' }}>
                {fieldName || item.configDescription}
              </h3>
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
                {tip && (
                  <Tooltip placement="topLeft" title={tip}>
                    {tip}
                  </Tooltip>
                )}
              </div>
            </div>
          );
        }}
      >
        {this.renderPanelComponent(item.key)}
      </Panel>
    );
  }

  /**
   * 渲染Panel对应的组件
   */
  @Bind()
  renderPanelComponent(key) {
    const {
      history,
      supplierInform: { detailHeader = {} },
      customizeTable,
      customizeForm,
      custLoading,
      customizeBtnGroup,
      custConfig = {},
      supplierInfoChangeRemote,
    } = this.props;
    // domesticForeignRelation 境内外标识，1 - 境内 0 -境外，境外不需要校验银行信息
    const { reqStatus, isSubdomainsRegister, domesticForeignRelation, countryCode } = detailHeader;
    // isSubdomainsRegister = false是协同，true不协同
    const isEdit = !isSubdomainsRegister; // 仅当注册时根据采购方二级域名注册并且勾选了不允许其他企业看到我时，允许采购方修改
    const {
      changeReqId,
      isPub,
      code,
      companyId,
      supplierCompanyId,
      pubEdit,
      readOnlyFlag,
      mustCompanyTab,
      savePermissionFlag,
      pageReadOnly,
      remoteEditFlag,
    } = this.state;
    const changFlag =
      readOnlyFlag ||
      (reqStatus !== 'NEW' && reqStatus !== 'REJECTED') ||
      pageReadOnly ||
      isPub ||
      !remoteEditFlag;

    // 路特斯埋点更改登记信息组件属性
    const remoteProps = supplierInfoChangeRemote
      ? supplierInfoChangeRemote.process('SSLM_SUPPLIER_INFORM_CHANGE_PROCESS', detailHeader || {})
      : {};
    const commonProps = {
      isPub,
      pubEdit,
      changFlag,
      changeReqId,
      companyId,
      supplierCompanyId,
      supplierFlag: 1,
      savePermissionFlag,
      infoChangeRemote: supplierInfoChangeRemote,
    };
    const supplyCapabilityInformProps = {
      ...commonProps,
      companyId,
      customizeTable,
      customizeUnitCode: customizeUnitCode[0],
      onRef: (ref = {}) => {
        this.supplyCapabilityInform = ref;
      },
      customizeBtnGroup,
    }; // 供货能力信息

    const supplierClassifyProps = {
      ...commonProps,
      companyId,
      history,
      detailHeader,
      custLoading,
      customizeTable,
      customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.SUPPLIER_CLASSIFY',
      onRef: (ref = {}) => {
        this.supplierClassify = ref;
      },
    }; // 供应商分类

    const purchaseInformProps = {
      ...commonProps,
      customizeForm,
      customizeTable,
      companyId,
      code,
      detailHeader,
      customizeBtnGroup,
      onRef: (ref = {}) => {
        this.PurchaseInform = ref;
      },
    }; // 采购/财务信息

    const locationInformProps = {
      ...commonProps,
      companyId,
      history,
      onRef: (ref = {}) => {
        this.LocationInform = ref;
      },
    }; // 地点层信息
    const otherInformProps = {
      customizeForm,
      custLoading,
      ...commonProps,
      companyId,
      history,
      detailHeader,
      onRef: (ref = {}) => {
        this.OtherInform = ref;
      },
    };

    // 登记信息
    const registInformProps = {
      code,
      isEdit,
      source: 'supplier',
      customizeForm,
      customizeUnitCode: customizeUnitCode[2],
      personalUnitCode: customizeUnitCode[11],
      queryUnitCode: [
        'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.REGISTRATION_OVERSEAS',
        'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.REGISTRATION_PERSONAL',
      ],
      ...commonProps,
      onRef: (ref = {}) => {
        this.registInForm = ref;
      },
      remoteProps,
    };

    // 业务信息
    const businessInformProps = {
      code,
      isEdit,
      source: 'supplier',
      customizeForm,
      domesticForeignRelation,
      countryCode,
      customizeUnitCode: customizeUnitCode[3],
      ...commonProps,
      onRef: (ref = {}) => {
        this.registeBusinessInForm = ref;
      },
    };

    // 联系人信息
    const contactInformProps = {
      code,
      source: 'supplier',
      customizeTable,
      customizeUnitCode: customizeUnitCode[4],
      ...commonProps,
      onRef: (ref = {}) => {
        this.contactInForm = ref;
      },
    };

    // 地址信息
    const addressInform = {
      custConfig,
      source: 'supplier',
      customizeTable,
      customizeUnitCode: customizeUnitCode[10],
      domesticForeignRelation,
      ...commonProps,
      onRef: (ref = {}) => {
        this.addressInForm = ref;
      },
    };

    // 银行信息
    const bankInformProps = {
      code,
      source: 'supplier',
      customizeTable,
      customizeUnitCode: customizeUnitCode[5],
      isSupplierInfoFlag: true,
      domesticForeignRelation,
      ...commonProps,
      onRef: (ref = {}) => {
        this.bankInForm = ref;
      },
    };

    // 开票信息
    const invoiceInformProps = {
      source: 'supplier',
      customizeForm,
      customizeUnitCode: customizeUnitCode[6],
      domesticForeignRelation,
      ...commonProps,
      isEdit,
      onRef: (ref = {}) => {
        this.invoiceInForm = ref;
      },
      mustCompanyTab,
      isSubdomainsRegister,
    };

    const attachmentInformProps = {
      source: 'supplier',
      ...commonProps,
      crossTenant: true,
      customizeTable,
      customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ATTACHMENT_INFO',
      onRef: (ref = {}) => {
        this.attachmentInForm = ref;
      },
    }; // 附件信息

    switch (key) {
      case 'supplyCapacityInform': // 供货能力信息
        return <SupplierCategoryInform {...supplyCapabilityInformProps} />;
      case 'supplierClassify':
        return <SupplierClassify {...supplierClassifyProps} />;
      case 'purchaseInform':
        return <PurchaseInform {...purchaseInformProps} />;
      case 'locationInform':
        return <LocationInform {...locationInformProps} />;
      case 'otherInform':
        return <OtherInform {...otherInformProps} />;
      case 'registInform':
        return <RegistInform {...registInformProps} />;
      case 'businessInform':
        return <BusinessInform {...businessInformProps} />;
      case 'contactInform':
        return <ContactInform {...contactInformProps} />;
      case 'addressInform':
        return <AddressInform {...addressInform} />;
      case 'bankInform':
        return <BankInform {...bankInformProps} />;
      case 'invoiceInform':
        return <InvoiceInform {...invoiceInformProps} />;
      case 'attachmentInform': // 附件信息
        return <AttachmentInform {...attachmentInformProps} />;
      default:
        return null;
    }
  }

  /**
   * 渲染配置表折叠面板的Panel
   */
  @Bind()
  renderModelTablePanel(item, changFlag) {
    const { collapsedKeys, changeReqId, otherParams } = this.state;
    const { companyId, supplierCompanyId, ...other } = otherParams;
    const { dataSource } = item;
    const modelTable = {
      ...item,
      otherParams: other,
    };
    return (
      <Panel
        key={item.tableCode}
        id={item.tableCode}
        showArrow={false}
        header={
          <Fragment>
            <h3>{item.tableName}</h3>
            <a>
              {collapsedKeys.includes(item.tableCode)
                ? intl.get('hzero.common.button.up').d('收起')
                : intl.get('hzero.common.button.expand').d('展开')}
              {<Icon type={collapsedKeys.includes(item.tableCode) ? 'up' : 'down'} />}
            </a>
          </Fragment>
        }
      >
        <DynamicTable
          modelTable={modelTable}
          relationId={changeReqId}
          readOnly={changFlag}
          viewDeleteButton={dataSource !== 'sslm_ext_supplier_site'}
          onRef={(ref = {}) => {
            this[item.tableCode] = ref;
          }}
          pageFlag={false}
        />
      </Panel>
    );
  }

  /**
   * 折叠面板的收起／展开
   */
  @Bind()
  handleCollapse(collapsedKeys) {
    this.setState({ collapsedKeys });
  }

  /**
   * 信息比对
   */
  @Bind()
  handleCompare() {
    const {
      supplierInform: { detailHeader = {}, collapseCodeList = [] },
    } = this.props;
    const { siteFlag, tableList } = this.state;
    const { changeReqId, companyId, systemType } = detailHeader;
    Modal.open({
      key: Modal.key(),
      footer: null,
      closable: true,
      fullScreen: true,
      title: intl.get('sslm.enterpriseInform.view.title.changeContrast').d('明细比对'),
      children: (
        <Compare
          changeReqId={changeReqId}
          companyId={companyId}
          systemType={systemType}
          tableList={tableList}
          siteFlag={siteFlag}
          collapseCodeList={collapseCodeList}
        />
      ),
    });
  }

  /**
   * 数据刷新
   */
  @Bind()
  handleReflash(payload) {
    const { allFetch, supplierInfoChangeRemote } = this.props;
    const { tableList = [] } = this.state;
    this.handleDetailHeader();
    if (payload.supChangeAbilityLn) this.supplyCapabilityInform.handleSuCapacity(); // 供货能力清单刷新
    if (payload.supChangeCate) this.supplierClassify.handleSupplierClassifyList(); // 供应商分类刷新
    if (payload.supChangeEbsAdds) this.LocationInform.handleLocationInform(); // 地点层刷新
    if (payload.supChangeSync) this.PurchaseInform.handPurchaseHeadInfo(); // 采购/财务信息刷新
    if (payload.supChangeSyncPf) this.PurchaseInform.handlePurchase();
    if (payload.supChangeOther) {
      // 处理个性化带值，接口返回正常数据，界面还展示旧数据问题
      if (this.OtherInform.props && this.OtherInform.props.form) {
        this.OtherInform.props.form.resetFields();
      }
      this.OtherInform.handleSupChangeOther();
    } // 其他信息刷新

    if (payload.comBasicReq) this.registInForm.handlequeryCompanyBasic(); // 登记信息刷新
    if (payload.comBusinessReqDTO) this.registeBusinessInForm.handlequeryCompanyBusiness(); // 业务信息刷新
    if (payload.supInvoiceReq) this.invoiceInForm.queryPlatformInvoice(); // 开票信息刷新
    if (payload.comAddressReqs) this.addressInForm.handlePlatformAddress(); // 地址信息刷新
    if (payload.comBankAccReqs) this.bankInForm.handlePlatformBank(); // 银行信息刷新
    if (payload.comContactsReqs) this.contactInForm.handlePlatformContact(); // 联系人信息刷新
    if (payload.supAttachmentReqs) {
      this.attachmentInForm.handleAttachmentsList();
    } // 附件信息刷新

    allFetch();

    tableList.forEach(n => {
      if (this[n.tableCode]) {
        this[n.tableCode].queryDynamicTable();
      }
    });

    if (supplierInfoChangeRemote && supplierInfoChangeRemote.event) {
      supplierInfoChangeRemote.event.fireEvent('cuxInitQuery', { remoteRef: this.remoteRef });
    }
  }

  payloadObj = { customizeUnitCode, desensitize: false };

  allError = true;

  /**
   * 校验数据
   */
  @Bind()
  async verifyData(form, objname) {
    try {
      const data = await form.checkData();
      if (data && this.allError) {
        this.payloadObj[objname] = data;
        this.allError = true;
      } else {
        this.allError = false;
      }
    } catch (error) {
      this.allError = false;
    }
  }

  // 获取头信息
  @Bind()
  getBasicInfo() {
    const {
      form: { validateFieldsAndScroll },
      supplierInform: { detailHeader = {} },
    } = this.props;
    const { newAttachmentUuid } = this.state;
    return new Promise((resolve, reject) => {
      validateFieldsAndScroll({ force: true }, (err, values) => {
        if (err) {
          notification.warning({
            message: intl
              .get(`sslm.enterpriseInform.view.message.warn.basicInfo`)
              .d('基础信息填写有误'),
          });
          reject();
        } else {
          const basicInfo = filterNullValueObject({
            ...detailHeader,
            ...values,
            remark: values.remark,
            unitId: values.unitId,
            attachmentUuid: detailHeader.attachmentUuid
              ? detailHeader.attachmentUuid
              : newAttachmentUuid,
          });
          resolve(basicInfo);
        }
      });
    });
  }

  // 获取保存参数
  @Bind()
  async getSaveParams() {
    const {
      supplierInform: { purchaseHeadInfo = {} },
      allSave,
      supplierInfoChangeRemote,
    } = this.props;
    const { collapsedKeys, changeReqId, tableList = [] } = this.state;
    let payload = null;

    this.payloadObj.supplierChangeReq = await this.getBasicInfo();

    // 检测供货能力清单数据
    if (this.supplyCapabilityInform) {
      await this.verifyData(this.supplyCapabilityInform, 'supChangeAbilityLn');
    }
    // 维护采购财务头信息数据
    if (this.PurchaseInform) {
      // 拆分form，区分个性化字段取值
      const { form: purchaseForm } = this.PurchaseInform.props;
      purchaseForm.validateFields((purchaseErr, purchaseValues) => {
        if (!purchaseErr) {
          const { frozenFlag } = purchaseValues;
          const newfrozenFlag = isUndefined(frozenFlag) ? purchaseHeadInfo.frozenFlag : frozenFlag;
          this.payloadObj.supChangeSync = {
            ...purchaseHeadInfo,
            changeReqId,
            ...purchaseValues,
            frozenFlag: newfrozenFlag,
          };
        } else {
          this.allError = false;
          notification.warning({
            message: intl
              .get(`sslm.enterpriseInform.view.message.warn.purchaseInfo`)
              .d('采购/财务信息填写有误'),
          });
        }
      });
    }
    // 检测财务采购清单数据
    if (this.PurchaseInform) {
      await this.verifyData(this.PurchaseInform, 'supChangeSyncPf');
    }
    // 检测地点层数据
    if (this.LocationInform) {
      await this.verifyData(this.LocationInform, 'supChangeEbsAdds');
    }
    // 供应商分类
    if (this.supplierClassify) {
      await this.verifyData(this.supplierClassify, 'supChangeCate');
    }
    // 其他信息
    if (this.OtherInform) {
      await this.verifyData(this.OtherInform, 'supChangeOther');
    }

    // 登记信息 校验
    if (this.registInForm) {
      await this.verifyData(this.registInForm, 'comBasicReq');
    }

    // 注册业务信息 校验
    if (this.registeBusinessInForm) {
      await this.verifyData(this.registeBusinessInForm, 'comBusinessReqDTO');
    }

    // 开票信息 检验
    if (this.invoiceInForm) {
      await this.verifyData(this.invoiceInForm, 'supInvoiceReq');
    }

    // 联系人信息
    if (this.contactInForm) {
      await this.verifyData(this.contactInForm, 'comContactsReqs');
    }

    // 地址信息 校验
    if (this.addressInForm) {
      await this.verifyData(this.addressInForm, 'comAddressReqs');
    }

    // 银行信息
    if (this.bankInForm) {
      await this.verifyData(this.bankInForm, 'comBankAccReqs');
    }

    // 附件信息 校验
    if (this.attachmentInForm) {
      await this.verifyData(this.attachmentInForm, 'supAttachmentReqs');
    }
    // 校验模型表数据
    let checkModelTableFlag = true;
    let modelDatas = [];
    tableList.forEach(n => {
      if (this[n.tableCode]) {
        const tableData = this[n.tableCode].checkData();
        if (checkModelTableFlag) {
          checkModelTableFlag = tableData;
        }
        if (tableData) {
          modelDatas = concat(modelDatas, tableData);
        }
      }
    });

    if (this.allError && checkModelTableFlag) {
      const { allErrs, allData } = allSave();
      if (allErrs) return true;
      payload = {
        ...this.payloadObj,
        ...allData,
        modelDatas,
      };
    }
    const allPayload = supplierInfoChangeRemote
      ? supplierInfoChangeRemote.process(
          'SSLM_SUPPLIER_INFORM_CHANGE_DETAIL_SAVE_PARAMS',
          payload,
          { remoteRef: this.remoteRef }
        )
      : payload;
    this.setState({ collapsedKeys });
    this.allError = true; // 校验完成恢复初始值
    return allPayload;
  }

  /**
   * 保存／提交
   */
  @Bind()
  async handleSaveAndSubmit(flag) {
    const { dispatch, allSave, supplierInfoChangeRemote } = this.props;
    const payload = await this.getSaveParams();
    const { allErrs, allData } = allSave();
    if (allErrs || !payload) {
      // notification.warning({
      //   message: intl
      //     .get('sslm.enterpriseInform.view.message.requiredMsg')
      //     .d('请检查是否有必填项未填写！'),
      // });
      return true;
    }
    if (flag) {
      const cuxRes = await supplierInfoChangeRemote.event.fireEvent('cuxHandleSave', {
        payload,
        _this: this,
      });
      if (!cuxRes) {
        return;
      }
      dispatch({
        type: 'supplierInform/allSave',
        payload,
      }).then(res => {
        if (res) {
          notification.success();
          this.handleReflash(this.payloadObj);
        }
      });
    } else {
      const cuxSubmitRes = await supplierInfoChangeRemote.event.fireEvent('cuxHandleSubmit', {
        _this: this,
      });
      if (!cuxSubmitRes) {
        return;
      }
      // 先校验，在提交
      this.handleChecked({ allData, payload });
    }
  }

  /**
   * 弱校验
   */
  @Bind()
  handleChecked({ allData = {}, payload = {} }) {
    const { changeReqId, verifyBankFlag } = this.state;
    const {
      dispatch,
      supplierInfoChangeRemote,
      supplierInform: { detailHeader = {} },
    } = this.props;
    // isSubdomainsRegister = false是协同，true不协同
    const { isSubdomainsRegister } = detailHeader;
    const data = this.payloadObj.comBankAccReqs || allData.sslmInvestgBankAccount || [];
    const bankAccountList = data.map(n => {
      const { investgBankAccountId, bankAccReqId, bankAccountName } = n;
      return {
        bankAccountId: investgBankAccountId || bankAccReqId,
        bankAccountName,
      };
    });
    // 登记信息企业名称
    const { companyName } = this.payloadObj.comBasicReq || {};
    // 取开票信息发票头
    const { invoiceHeader } = this.payloadObj.supInvoiceReq || {};

    let invoiceHeaderMsg = '';
    if (this.invoiceInForm) {
      // 企业名称和开票头不一致标识
      const invoiceHeaderFlag = companyName !== invoiceHeader;
      const needTipInvoiceHeader = invoiceHeaderFlag && isSubdomainsRegister;
      // 开票信息是否校验标识
      const invoiceMsgFlag = supplierInfoChangeRemote.process(
        'SSLM_SUPPLIER_INFORM_CHANGE_INVOICE_MSG_FLAG',
        needTipInvoiceHeader
      );
      invoiceHeaderMsg = invoiceMsgFlag
        ? intl
            .get('sslm.supplierInform.view.message.invoiceHeaderAtypismTips')
            .d('企业名称与发票头不一致')
        : '';
    }
    dispatch({
      type: 'supplierInform/checkedSupplierChange',
      payload: {
        changeReqId,
        supChangeCate: payload.supChangeCate || [],
        checkBankAccountNameDTO: {
          bankAccountList,
          documentId: changeReqId,
          documentSource: 'SUP_CHANGE',
          companyName,
        },
      },
    }).then(resp => {
      const res = getResponse(resp);
      if (res) {
        const { bankFlag, cateFlag, bankDataFlag } = res;
        let bankDataDuplicateMsg = '';
        let bankNameMsg = '';
        let supplierCateMsg = '';
        // 银行名称不一致不需要前端校验
        const backAccountFlag = bankFlag || verifyBankFlag !== 'weakCheck';
        if (backAccountFlag && cateFlag && bankDataFlag) {
          // this.handleSubmit(payload);
        } else {
          // 先校验银行重复不取业务规则定义
          bankDataDuplicateMsg =
            bankDataFlag === false
              ? intl
                  .get('sslm.supplierInform.view.message.bankDuplicateTips')
                  .d('存在银行账号重复的数据，请检查数据')
              : '';
          bankNameMsg =
            bankFlag === false && verifyBankFlag === 'weakCheck'
              ? `${intl
                  .get('sslm.supplierInform.view.message.bankToolTip')
                  .d('银行账户名称与公司名称不一致')}`
              : '';
          supplierCateMsg =
            cateFlag === false
              ? intl
                  .get('sslm.supplierInform.view.message.cateToolTips')
                  .d('存在要启用的分类已在供应商分类定义被禁用')
              : '';
        }
        if (bankNameMsg || bankDataDuplicateMsg || supplierCateMsg || invoiceHeaderMsg) {
          const submitMsg = intl
            .get('sslm.supplierInform.view.message.confirmTip')
            .d('请确认是否继续提交');
          confirm({
            title: (
              <Fragment>
                <div>{bankNameMsg}</div>
                <div>{bankDataDuplicateMsg}</div>
                <div>{supplierCateMsg}</div>
                <div>{invoiceHeaderMsg}</div>
                <div>{submitMsg}</div>
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
    const { supplierCategoryChangeFlag } = this.payloadObj.supplierChangeReq || {};
    if (supplierCategoryChangeFlag) {
      confirm({
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
  async handleSubmit(payload = {}) {
    const { history, dispatch, supplierInfoChangeRemote } = this.props;
    const cuxRes = await supplierInfoChangeRemote.event.fireEvent('cuxHandleSubmit', {
      payload,
      _this: this,
    });
    if (!cuxRes) {
      return;
    }
    dispatch({
      type: 'supplierInform/submitApplication',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        history.push(`/sslm/supplier-inform-change/list`);
      } else {
        this.handleReflash(this.payloadObj); // 提交失败刷新数据
      }
    });
  }

  /**
   * 删除数据
   */
  @Bind()
  handDelete() {
    const {
      history,
      dispatch,
      supplierInform: { detailHeader },
    } = this.props;
    const { changeReqId } = detailHeader;
    dispatch({
      type: 'supplierInform/deleteApplication',
      payload: {
        changeReqIdList: [changeReqId],
        customizeUnitCode,
      },
    }).then(res => {
      if (res) {
        history.push(`/sslm/supplier-inform-change/list`);
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

  // 操作记录
  @Bind()
  handleOperate() {
    const { changeReqId } = this.state;
    operationRecordsModal({
      changeReqId,
      documentId: changeReqId,
      documentType: 'SUPPLIER_INFO_CHANGE',
    });
  }

  // 处理埋点编辑
  @Bind()
  handleRemoteEdit(headerInfo = {}) {
    const { remoteEditFlag } = this.state;
    const { supplierInfoChangeRemote } = this.props;
    const newRemoteEditFlag = supplierInfoChangeRemote
      ? supplierInfoChangeRemote.process(
          'SSLM_SUPPLIER_INFORM_CHANGE_DETAIL_EDIT',
          remoteEditFlag,
          headerInfo
        )
      : remoteEditFlag;
    this.setState({
      remoteEditFlag: newRemoteEditFlag,
    });
  }

  // 清除轮循计时器
  @Bind()
  clearTimerRef() {
    if (this.timerRef.current) {
      clearInterval(this.timerRef.current);
    }
  }

  // 轮询【智能审核】结果
  @Bind()
  async getAiApproveResult() {
    const { changeReqId } = this.state;
    const res = getResponse(
      await fetchApproveStatus({ documentType: 'SUP_CHANGE_REQ', documentId: changeReqId })
    );
    if (res) {
      this.setState({ aiApproveStatus: res.status });
      this.timerTime.current++;
      if (this.timerTime.current > 4 || res.status !== 'APPROVING') {
        this.timerTime.current = 0;
        this.clearTimerRef();
        this.setState({ reviewIsClick: false });
      }
    } else {
      this.clearTimerRef();
    }
  }

  // 【智能审核】回调
  @Bind()
  async handleIntelligentReview() {
    const { changeReqId } = this.state;
    const { dispatch, allSave } = this.props;
    const payload = await this.getSaveParams();
    const { allErrs } = allSave();
    if (allErrs || !payload) {
      notification.warning({
        message: intl
          .get('sslm.enterpriseInform.view.message.requiredMsg')
          .d('请检查是否有必填项未填写！'),
      });
      return true;
    }
    this.setLoading(true);
    dispatch({
      type: 'supplierInform/allSave',
      payload,
    })
      .then(async res => {
        if (res) {
          await aiApprove({
            documentType: 'SUP_CHANGE_REQ',
            documentId: changeReqId,
          }).then(async response => {
            const resp = getResponse(response);
            if (resp) {
              notification.success();
              this.setState({ reviewIsClick: true });
            }
          });
        }
      })
      .finally(() => {
        this.handleReflash(this.payloadObj);
        this.setLoading(false);
      });
  }

  render() {
    const {
      editLoading,
      supplierInform: { detailHeader = {}, collapseCodeList = [] },
      QuestionLink,
      QuestionArea,
      queryLoading,
      custLoading,
      customizeCollapse,
      customizeBtnGroup,
      supplierInfoChangeRemote,
    } = this.props;
    const {
      sourceType,
      supplierInformCatalog,
      platformCatalog,
      isPub,
      extraLoading,
      hiddenBachPath,
      newAttachmentUuid,
      anchorShow,
      tableList,
      readOnlyFlag,
      savePermissionFlag,
      pageReadOnly,
      remoteEditFlag,
      aiApproveStatus,
    } = this.state;

    const { aiApproveDTOList } = detailHeader;

    const changFlag =
      readOnlyFlag ||
      (detailHeader.reqStatus !== 'NEW' && detailHeader.reqStatus !== 'REJECTED') ||
      !savePermissionFlag ||
      pageReadOnly ||
      isPub ||
      !remoteEditFlag;

    const allLoading = editLoading || queryLoading || extraLoading || false;

    const remoteRenderProps = {
      onRef: this.handleRemoteRef,
      _this: this,
    };

    // 明细对比按钮工作流不要权限，功能页报错权限
    const compareBtnProps = isPub
      ? {}
      : {
          permissionList: [
            {
              code: `srm.partner.my-partner.supplier-inform-change.ps.button.detailcompare`,
              type: 'button',
              meaning: '信息比对-查看',
            },
          ],
        };

    return (
      <Fragment>
        <Header
          title={intl.get('sslm.supplierInform.view.title.changeSupplier').d('供应商信息变更')}
          backPath={hiddenBachPath ? '' : '/sslm/supplier-inform-change/list'}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.HEADER_BTNGROUP',
            },
            [
              <Button
                data-name="submit"
                icon="check"
                type="primary"
                onClick={() => this.handleSaveAndSubmit(false)}
                loading={allLoading}
                style={{ display: changFlag ? 'none' : 'block' }}
                permissionList={[
                  {
                    code: `srm.partner.my-partner.supplier-inform-change.ps.doc.submit`,
                    type: 'button',
                    meaning: '供应商信息变更-提交',
                  },
                ]}
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>,
              <Button
                data-name="save"
                icon="save"
                onClick={() => this.handleSaveAndSubmit(true)}
                loading={allLoading}
                style={{ display: changFlag ? 'none' : 'block' }}
                permissionList={[
                  {
                    code: `srm.partner.my-partner.supplier-inform-change.ps.doc.save`,
                    type: 'button',
                    meaning: '供应商信息变更-保存',
                  },
                ]}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>,
              <Button
                data-name="delete"
                icon="delete"
                onClick={this.handDelete}
                loading={allLoading}
                disabled={changFlag}
                style={{ display: changFlag ? 'none' : 'block' }}
                permissionList={[
                  {
                    code: `srm.partner.my-partner.supplier-inform-change.ps.doc.delete`,
                    type: 'button',
                    meaning: '供应商信息变更-删除',
                  },
                ]}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>,
              <Button
                loading={allLoading}
                data-name="intelligentReview"
                onClick={this.handleIntelligentReview}
                disabled={aiApproveStatus === 'APPROVING'}
              >
                <span style={{ display: !allLoading ? 'flex' : 'initial', alignItems: 'center' }}>
                  {!allLoading && <IntelligentReviewIcon style={{ marginRight: '4px' }} />}
                  {intl.get('sslm.common.button.intelligentReview').d('智能预审')}
                </span>
              </Button>,
              <Button
                data-name="infoComparison"
                icon="profile"
                loading={allLoading}
                onClick={this.handleCompare}
                {...compareBtnProps}
              >
                {intl.get('sslm.enterpriseInform.view.button.informationComparison').d('信息比对')}
              </Button>,
              <Button
                data-name="supplierInfo"
                loading={allLoading}
                icon="profile"
                onClick={() => handleSupplierDetail({ ...detailHeader, sourceType })}
              >
                {intl.get('sslm.supplierInform.view.button.supplierInfo').d('供应商信息查看')}
              </Button>,
              <Button className="upload-btn" data-name="uploadFile">
                <Upload
                  icon={allLoading ? 'loading' : changFlag ? 'paper-clip' : 'upload'}
                  attachmentUUID={
                    detailHeader.attachmentUuid ? detailHeader.attachmentUuid : newAttachmentUuid
                  }
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="sslm-supplier-inform"
                  viewOnly={changFlag}
                  tenantId={tenantId}
                />
              </Button>,
              <Button
                data-name="operate"
                icon="file-text"
                onClick={() => this.handleOperate()}
                loading={allLoading}
              >
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button>,
            ]
          )}
        </Header>
        <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
        <Content>
          <Spin spinning={allLoading || false}>
            <Form className="ued-edit-form">
              <div style={{ margin: '0 16px 24px' }}>{this.renderHeaderForm()}</div>
            </Form>

            <div className="ued-detail-wrapper">
              {customizeCollapse(
                {
                  code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.COLLAPSE',
                },
                <Collapse
                  className="form-collapse"
                  onChange={this.handleCollapse}
                  custLoading={custLoading}
                >
                  {platformCatalog && platformCatalog.map(item => this.renderPanel(item))}
                </Collapse>
              )}
              {QuestionArea}
              {customizeCollapse(
                {
                  code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.COLLAPSE',
                },
                <Collapse
                  className="form-collapse"
                  onChange={this.handleCollapse}
                  custLoading={custLoading}
                >
                  {supplierInformCatalog &&
                    supplierInformCatalog.map(item => this.renderPanel(item))}
                </Collapse>
              )}
              <Collapse className="form-collapse" onChange={this.handleCollapse}>
                {tableList && tableList.map(item => this.renderModelTablePanel(item, changFlag))}
              </Collapse>
              {supplierInfoChangeRemote &&
                supplierInfoChangeRemote.render(
                  'SSLM_SUPPLIER_INFORM_CHANGE_DETAIL_EXTRA_COLLAPSE',
                  null,
                  remoteRenderProps
                )}
            </div>

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
                  {platformCatalog &&
                    platformCatalog.map(item => {
                      if (collapseCodeList.includes(item.key)) {
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
                  {supplierInformCatalog &&
                    supplierInformCatalog.map(item => {
                      if (collapseCodeList.includes(item.key)) {
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
                  {tableList &&
                    tableList.map(item => {
                      return (
                        <Link
                          key={item.tableCode}
                          href={`#${item.tableCode}`}
                          title={item.tableName}
                        />
                      );
                    })}
                </Anchor>
              </div>
            </div>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}

const Index = props => {
  const [mustCompanyTabObj, setMustCompanyTabObj] = useState({});
  const { QuestionLink, QuestionArea, allSave, allFetch, reqStatus } = useQuestionnaire({
    ...props,
    mustCompanyTabObj,
  });
  return useMemo(
    () => (
      <Detail
        {...{
          mustCompanyTabObj,
          setMustCompanyTabObj,
          QuestionLink,
          QuestionArea,
          allSave,
          allFetch,
          ...props,
        }}
      />
    ),
    [QuestionLink.length, reqStatus, props]
  );
};

export default compose(
  connect(({ supplierInform, enterpriseInform }) => ({
    supplierInform,
    enterpriseInform,
  })),
  formatterCollections({ code: ['sslm.enterpriseInform', 'spfm.investigationDefinition'] }),
  remote(
    {
      code: 'SSLM_SUPPLIER_INFORM_CHANGE', // 对应二开模块暴露的Expose的编码
      name: 'supplierInfoChangeRemote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      events: {
        cuxInitQuery: () => {}, // 二开新增页签的查询
        cuxWorkflowApproved: () => {}, // 二开工作流审批通过逻辑
        cuxHandleSave: () => {}, // 二开保存逻辑
        cuxHandleSubmit: () => {}, // 二开提交逻辑
        cuxHandleBankSave: () => {}, // 银行页签保存按钮增加二开逻辑
        cuxHandleInvestigSave: () => {}, // 调查页签保存按钮增加二开逻辑
      },
    }
  ),
  withCustomize({
    unitCode: ['SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.COLLAPSE'],
  })
)(Index);
