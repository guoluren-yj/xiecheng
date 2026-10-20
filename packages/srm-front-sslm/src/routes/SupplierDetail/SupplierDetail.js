/**
 * SupplierDetail - 供应商360度查询
 * @date: 2018-08-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import React, { PureComponent } from 'react';
import { Form, Spin } from 'hzero-ui';
import { sum, isEmpty, toString, head } from 'lodash';

import remote from 'utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button } from 'components/Permission';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import Lov from 'components/Lov';
import { openTab } from 'utils/menuTab';
import { checkPrintWindow, getPdfPreviewUrl } from '_utils/utils';
import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import { queryCustomize } from '@/services/commonService';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { riskScan } from '@/routes/LifeCycleManage/utils';
import CompanyInfo from './CompanyInfo';
// import DetailCatalog from './DetailCatalog';
import EnterpriseInfo from './EnterpriseInfo';
import SupplierInfo from './SupplierInfo';
import AffixMenu from './AffixMenu';
import InvestigateTmpl from './InvestigateTmpl';
import './index.less';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const currentTenantId = getCurrentOrganizationId();
/**
 * 供应商360度查询
 * @extends {Component} - React.Component
 * @reactProps {Object} supplierDetail - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: [
    'sslm.supplierDetail',
    'entity.company',
    'entity.bank',
    'sslm.historyVersion',
    'sslm.common',
    'spfm.certificationApproval',
    'spfm.contactPerson',
    'sslm.enterpriseInform',
    'spfm.importErp',
    'sslm.supplyAbility',
    'sslm.commonApplication',
    'sslm.supplierInform',
    'spfm.supplier',
    'spfm.common',
    'spfm.bank',
  ],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_LIFE_CYCLE.ABILITY_LINE_TABLE',
    'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL.BUSINESS',
    'SSLM.SUPPLIER_LIFE_CYCLE.OTHER_INFO',
    'SSLM.SUPPLIER_LIFE_CYCLE.BANK_INFO',
    'SSLM.SUPPLIER_LIFE_CYCLE.PURCHASE_INFO',
    'SSLM.SUPPLIER_LIFE_CYCLE.PURCHASE_HEADER',
    'SSLM.SUPPLIER_LIFE_CYCLE.LOCAL_SUPPLIER_SITE',
    'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL.RELATED_DOC',
    'SSLM.SUPPLIER_LIFE_CYCLE.CONTACTS_INFO', // 联系人
    'SSLM.SUPPLIER_LIFE_CYCLE.ADDRESS_INFO', // 地址
    'SSLM.SUPPLIER_LIFE_CYCLE.SUPPLIER_INFO_CARDS',
    'SSLM.SUPPLIER_LIFE_CYCLE.ENTERPRISE_INFO_CARDS',
    'SSLM.SUPPLIER_LIFE_CYCLE.FINANCE_LIST', // 财务状况
    'SSLM.SUPPLIER_LIFE_CYCLE.INVOICE_INFO', // 开票信息
    'SSLM.SUPPLIER_LIFE_CYCLE.ATTACHMENT_LIST', // 附件信息
    'SSLM.SUPPLIER_LIFE_CYCLE.SUP_CAT_LIST', // 供应商分类
    'SSLM.SUPPLIER_LIFE_CYCLE.HEADER_BTNS', // 360汇总详情头按钮组
    'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL_REGISTRATION_INFO', // 登记信息-境内
    'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL_REGISTRATION_OVERSEAS', // 登记信息-境外
    'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL_REGISTRATION_PERSONAL', // 登记信息-个人
    'SSLM.SUPPLIER_LIFE_CYCLE.SUPPLIER_BASIC', // 基础信息
    'SSLM.SUPPLIER_LIFE_CYCLE.STAGE_FORM', // 供应商生命周期表单
  ],
})
@remote(
  {
    code: 'SSLM.SUPPLIER_DETAIL',
    name: 'supplierDetailRemote',
  },
  {
    events: {
      cuxGroupJump() {}, // 二开集团级跳转，默认采购方子公司
      supplierInfoInit() {}, // 供应商信息初始化
    },
  }
)
export default class SupplierDetail extends PureComponent {
  /**
   *Creates an instance of SupplierDetail.
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    const routerParam = qs.parse(props.location.search.substr(1));
    const isPub = this.props.location.pathname.includes('/pub/'); // 判断是否为pub页面
    const isInclude = this.props.location.pathname.includes('/include/'); // 判断是否为include页面
    const { pageType } = routerParam; // src-17792风险工作台内嵌，不展示按钮
    const viewFlag = pageType === 'readOnly' || false;
    // pageType = 'include' 展示按钮功能跳转
    const showBtn = pageType === 'include';
    const { state: locationParam = {} } = props.location; // 这个参数是使用 history.push(pathname,state) 传递后获取的参数
    this.state = {
      tenantId: routerParam.tenantId || locationParam.tenantId,
      companyId: routerParam.companyId || locationParam.companyId || '',
      partnerCompanyId:
        routerParam.partnerCompanyId ||
        routerParam.supplierCompanyId ||
        locationParam.partnerCompanyId,
      partnerTenantId: routerParam.partnerTenantId || locationParam.partnerTenantId,
      spfmCompanyId: routerParam.spfmCompanyId || locationParam.spfmCompanyId,
      spfmPartnerCompanyId: routerParam.spfmPartnerCompanyId || locationParam.spfmPartnerCompanyId,
      supplierCompanyId:
        routerParam.supplierCompanyId ||
        routerParam.partnerCompanyId ||
        locationParam.partnerCompanyId,
      changeReqId: routerParam.changeReqId,
      historyBack: locationParam.historyBack, // historyBack 这个参数用来保存前一个页面的路径，使用 history.push({pathname: 'path', state: {...others, historyBack: 'prePath'}})
      // topValue: 0,
      isPub, // 是否为pub页面
      tableList: [],
      sourceTarget: routerParam.sourceTarget, // 跳转来源页面
      toStageId: routerParam.toStageId,
      requisitionId: routerParam.requisitionId,
      dimensionCode: routerParam.dimensionCode,
      lovChange: false,
      isInclude,
      viewFlag,
      cardList: [],
      showBtn,
      remoteCompanyId: null,
    };
  }

  /**
   * 查询公司信息和数据
   * @param {String} companyId 公司id
   */
  @Bind()
  fetchInfoAndData(companyId = '', spfmCompanyId = '') {
    const { dispatch, modelName = 'supplierDetail' } = this.props;
    const {
      partnerCompanyId,
      tenantId,
      supplierCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId,
    } = this.state;
    if ((!partnerCompanyId && !supplierCompanyId) || !partnerTenantId || !tenantId) {
      notification.error({
        message: intl
          .get('sslm.supplierDetail.view.message.paramMissing')
          .d(
            '参数不正确，采购方租户（tenantId）不能为空，供应商租户（partnerTenantId）不能为空,供应商公司(supplierCompanyId, partnerCompanyId)不能为空。请检查配置或联系您的项目经理/运维经理处理。'
          ),
      });
      return;
    }
    // 查询公司信息
    dispatch({
      type: `${modelName}/fetchCompanyInfo`,
      payload: {
        companyId,
        supplierCompanyId,
        customizeUnitCode: [
          'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL.BUSINESS',
          'SSLM.SUPPLIER_LIFE_CYCLE.FINANCE_LIST',
          'SSLM.SUPPLIER_LIFE_CYCLE.INVOICE_INFO',
          'SSLM.SUPPLIER_LIFE_CYCLE.ATTACHMENT_LIST',
          'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL_REGISTRATION_INFO',
          'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL_REGISTRATION_OVERSEAS',
          'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL_REGISTRATION_PERSONAL',
          'SSLM.SUPPLIER_LIFE_CYCLE.SUPPLIER_BASIC',
        ].join(','),
        customizeTenantId: tenantId,
      },
    }).then(res => {
      const { companyInfo = {}, erpInfo = [] } = res || {};
      const { basic = {}, siteFlag } = companyInfo || {};
      // 查询调查表模板
      dispatch({
        type: `${modelName}/fetchQuestionnaireTmpl`,
        payload: {
          tenantId,
          companyId,
          partnerTenantId,
          partnerCompanyId,
          spfmCompanyId,
          spfmPartnerCompanyId,
          supplierBasicId: basic ? basic.supplierBasicId : undefined,
        },
      }).then(tmplInfo => {
        const { questionnaireTmpl = [], tmplDataSource = {} } = tmplInfo;
        this.setState({
          questionnaireTmpl,
          tmplDataSource,
        });
      });
      this.setState({
        basicInfo: basic,
        companyInfo,
        erpInfo,
      });
      // 查询配置表
      queryRelTableConfig('sslm_life_cycle_summary').then(resp => {
        if (!isEmpty(resp)) {
          const list = resp.map(item => {
            return {
              ...item,
              companyId,
              supplierCompanyId,
              relationId: (basic || {})[item.pageRelationField],
            };
          });
          this.setState({
            tableList: list,
          });
        }
      });
      // siteFlag= 1查询本地供应商，不查询原地点层数据
      if (siteFlag !== 1) {
        // 地点层信息
        dispatch({
          type: `${modelName}/fetchDestinationList`,
          payload: {
            supplierCompanyId,
            companyId,
          },
        }).then(destinationList => {
          if (destinationList) {
            this.setState({
              destinationList,
            });
          }
        });
      }
    });
    // 查询供应商信息
    dispatch({
      type: `${modelName}/fetchSupplierInfo`,
      payload: {
        companyId,
        partnerCompanyId,
        tenantId,
        partnerTenantId,
        spfmCompanyId,
        spfmPartnerCompanyId,
      },
    }).then(supplierInfo => {
      const { contactsData = [], addressData = [], bankAccountData = [] } = supplierInfo;
      this.setState({
        contactsData, // 联系人信息
        addressData, // 地址信息
        bankAccountData, // 银行账户信息
      });
    });
    // 查询供应商生命周期
    dispatch({
      type: `${modelName}/fetchSupplierLifeCycle`,
      payload: {
        companyId,
        supplierCompanyId: partnerCompanyId,
        isLifeCycleFlag: 1, // srm-113054
        customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.STAGE_FORM',
      },
    }).then(lifeCycleSteps => {
      if (lifeCycleSteps) {
        this.setState({
          lifeCycleSteps,
        });
      }
    });
    // 查询菜单
    dispatch({
      type: `${modelName}/fetchCatalog`,
      payload: {
        tenantId,
        companyId,
        partnerTenantId,
        partnerCompanyId,
        spfmCompanyId,
        spfmPartnerCompanyId,
      },
    }).then(catalogData => {
      if (catalogData) {
        this.setState({
          catalogData,
        });
      }
    });
    // 查询编辑次数
    dispatch({
      type: `${modelName}/editedInfo`,
      payload: {
        companyId,
        partnerCompanyId,
      },
    }).then(editedInfo => {
      if (editedInfo) {
        this.setState({
          editedInfo,
        });
      }
    });
    // 查询供货能力清单数据
    dispatch({
      type: `${modelName}/fetchSupplyCapacityList`,
      payload: {
        companyId,
        supplierCompanyId: partnerCompanyId,
        customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.ABILITY_LINE_TABLE',
      },
    }).then(supplierCapacityData => {
      if (supplierCapacityData) {
        this.setState({
          supplierCapacityData,
        });
      }
    });
    // 查询供应商分类信息
    dispatch({
      type: `${modelName}/fetchSupplierCatagoryInfo`,
      payload: {
        supplierCompanyId: partnerCompanyId,
        isAssignFlag: 1,
        supplierTenantId: partnerTenantId,
        page: 0,
        size: 0,
        customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.SUP_CAT_LIST',
      },
    }).then(supplierCatagoryData => {
      if (supplierCatagoryData) {
        this.setState({
          supplierCatagoryData,
        });
      }
    });
    // 采购/财务信息
    this.queryPurchaseList({}, supplierCompanyId, companyId);
    // 本地地点层信息
    dispatch({
      type: `${modelName}/fetchLocalDestinationList`,
      payload: {
        supplierCompanyId,
        customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.LOCAL_SUPPLIER_SITE',
      },
    }).then(localDestinationList => {
      if (localDestinationList) {
        this.setState({
          localDestinationList,
        });
      }
    });
    // 查询其他信息
    this.queryOtherInfo(companyId);
  }

  // srm-51668：协鑫公司级默认采购方为协鑫
  @Bind()
  async handleCuxCompanyId() {
    const { supplierDetailRemote } = this.props;
    const remoteCompanyId = await supplierDetailRemote.process(
      'SSLM.SUPPLIER_DETAIL_COMPANY',
      null,
      {}
    );
    // 单独存储埋点返回的companyId,解决多次跳转页面时，更新state中companyId的问题
    this.setState({ remoteCompanyId });
    return remoteCompanyId;
  }

  // 解决从供应商信息变更进入该页面时数据不刷新问题
  getSnapshotBeforeUpdate(prevProps, prevState) {
    const routerParam = qs.parse(this.props.location.search.substr(1));
    const { changeReqId, companyId = '', supplierCompanyId, partnerCompanyId } = routerParam;
    // 解决多次进入详情页，返回路由不变
    const { state: locationParam = {} } = this.props.location;

    const newCompanyId = companyId || locationParam.companyId;
    const newSupplierCompanyId =
      supplierCompanyId || partnerCompanyId || locationParam.partnerCompanyId;
    const newTenantId = routerParam.tenantId || locationParam.tenantId;
    const newPartnerTenantId = routerParam.partnerTenantId || locationParam.partnerTenantId;
    const newSpfmCompanyId = routerParam.spfmCompanyId || locationParam.spfmCompanyId;
    const newSpfmPartnerCompanyId =
      routerParam.spfmPartnerCompanyId || locationParam.spfmPartnerCompanyId;

    let ChangeFlag =
      changeReqId !== prevState.changeReqId ||
      (newCompanyId && newCompanyId !== prevState.companyId) ||
      (newSupplierCompanyId && newSupplierCompanyId !== prevState.supplierCompanyId);
    // 判断是页面内部采购商值集切换还是，供应商信息变更进入
    if (this.state.lovChange) {
      ChangeFlag = false;
    }

    if (ChangeFlag) {
      this.setState({
        tenantId: newTenantId,
        companyId: prevState.remoteCompanyId || newCompanyId,
        partnerCompanyId: newSupplierCompanyId,
        partnerTenantId: newPartnerTenantId,
        spfmCompanyId: newSpfmCompanyId,
        spfmPartnerCompanyId: newSpfmPartnerCompanyId,
        supplierCompanyId: newSupplierCompanyId,
        changeReqId: routerParam.changeReqId,
      });
    }
    this.setState({
      historyBack: locationParam.historyBack,
    });
    return ChangeFlag;
  }

  componentDidUpdate(prevProps, prevState) {
    const { changeReqId, companyId = '', supplierCompanyId } = this.state;
    const ChangeFlag =
      changeReqId !== prevState.changeReqId ||
      (companyId && companyId !== prevState.companyId) ||
      (supplierCompanyId && supplierCompanyId !== prevState.supplierCompanyId);
    if (ChangeFlag) {
      const { spfmCompanyId } = this.state;
      if (companyId) {
        this.getCompanyName(companyId);
        this.fetchInfoAndData(companyId, spfmCompanyId);
      } else {
        // 集团集跳转没有companyId的情况
        this.handleGroupJump();
      }
    }
  }

  /**
   *组件挂载后执行方法
   */
  async componentDidMount() {
    const { companyId, spfmCompanyId, tenantId } = this.state;
    const { history } = this.props;
    if (toString(tenantId) !== toString(currentTenantId)) {
      notification.error({
        message: intl
          .get('sslm.supplierDetail.view.message.illegalQuery')
          .d('当前用户无数据查询权限，请刷新重试或联系您的项目经理/运维经理!'),
      });
      history.push('/sslm/supplier-manager/list');
      return;
    }
    if (companyId) {
      const remoteCompanyId = await this.handleCuxCompanyId();
      this.getCompanyName(remoteCompanyId || companyId);
      this.fetchInfoAndData(remoteCompanyId || companyId, spfmCompanyId);
      this.fetchPurchaseFormList();
    } else {
      this.handleGroupJump();
    }
    this.queryCustomize();
  }

  componentWillUnmount() {
    const { dispatch, modelName } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        destinationList: [],
        purchaseList: [],
        purchaseListPagination: {},
        supplierEvaluationResultData: [],
        localDestinationList: [],
      },
    });
  }

  // 根据路径上的companyId前端调接口查询出companyName
  // (平台安全整改项，路径上有供应商名称存在安全隐患)
  @Bind()
  getCompanyName(companyId) {
    const { dispatch, modelName = 'supplierDetail' } = this.props;
    const { partnerCompanyId, tenantId } = this.state;
    // if (!companyName) {
    // 集团级维度 handleGroupJump会查 故加个判断过滤
    dispatch({
      type: `${modelName}/fetchCompanyIdReserve`,
      payload: {
        lovCode: 'SSLM.USER_AUTH.COMPANY',
        queryParams: { tenantId, partnerCompanyId, companyId },
      },
    }).then(res => {
      if (!isEmpty(res)) {
        this.setState({
          companyName: res[0].companyName,
        });
      }
    });
    // }
  }

  /**
   * 查询个性化
   */
  @Bind()
  queryCustomize() {
    const unitCode = [
      'SSLM.SUPPLIER_LIFE_CYCLE.SUPPLIER_INFO_CARDS',
      'SSLM.SUPPLIER_LIFE_CYCLE.ENTERPRISE_INFO_CARDS',
    ];
    const payload = { unitCode };
    queryCustomize(payload).then(response => {
      const res = getResponse(response);
      if (res) {
        const u1 =
          res[unitCode[0]]?.fields?.filter(n => n.visible !== 0).map(n => n.fieldCode) || [];
        const u2 =
          res[unitCode[1]]?.fields?.filter(n => n.visible !== 0).map(n => n.fieldCode) || [];
        const cardList = u1.concat(u2);
        if (!isEmpty(u1)) {
          cardList.push('supplierInfo');
        }
        if (!isEmpty(u2)) {
          cardList.push('companyInfo');
        }
        this.setState({ cardList });
      }
    });
  }

  @Bind()
  handleDefaultCompany(defaultCompany) {
    this.setState(
      {
        companyId: defaultCompany.companyId,
        companyName: defaultCompany.companyName,
        spfmCompanyId: defaultCompany.spfmCompanyId,
      },
      () => {
        this.fetchPurchaseFormList();
      }
    );
  }

  /**
   * 处理集团集跳转查询
   * @param {Null} _ 占位符
   * @param {Object} row 行数据
   */
  @Bind()
  async handleGroupJump() {
    const { dispatch, modelName = 'supplierDetail', supplierDetailRemote } = this.props;
    const { partnerCompanyId, tenantId } = this.state;
    const eventProps = {
      tenantId,
      onDefaultCompany: this.handleDefaultCompany,
    };
    // 默认返回true,当返回false时走二开逻辑不走标准逻辑
    const cuxRes = await supplierDetailRemote.event.fireEvent('cuxGroupJump', eventProps);
    if (!cuxRes) {
      return;
    }
    dispatch({
      type: `${modelName}/fetchCompanyIdReserve`,
      payload: {
        lovCode: 'SSLM.USER_AUTH.COMPANY',
        queryParams: { tenantId, partnerCompanyId },
      },
    }).then(res => {
      if (!isEmpty(res)) {
        const defaultCompany = head(res);
        this.handleDefaultCompany(defaultCompany);
      }
    });
  }

  /**
   *跳转查看历史版本界面
   */
  @Bind()
  historyVersion() {
    const { history, match } = this.props;
    const {
      companyId,
      partnerCompanyId,
      tenantId,
      partnerTenantId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
      changeReqId,
      sourceTarget,
      toStageId,
      requisitionId,
      isInclude,
      showBtn,
    } = this.state;
    const basePath = match.path.substring(0, match.path.indexOf('/supplier-detail'));
    const params = {
      tenantId,
      companyId,
      partnerCompanyId,
      partnerTenantId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
      changeReqId,
      sourceTarget,
      toStageId,
      requisitionId,
    };
    if (isInclude || showBtn) {
      const jumpPath = '/sslm/include/supplier-manager/version-history';
      openTab({
        title: intl
          .get('sslm.supplierDetail.model.supplierDetail.editedInfo.history')
          .d('历史版本'),
        key: jumpPath,
        path: jumpPath,
        search: qs.stringify(params),
      });
    } else {
      history.push(`${basePath}/version-history?${qs.stringify(params)}`);
    }
  }

  /**
   * 查询供应商详情
   * @param {Null} _ 占位符
   * @param {Object} row 行数据
   */
  @Bind()
  showSupplierDetail(_, row) {
    this.setState(
      {
        companyId: row.companyId,
        companyName: row.companyName,
        spfmCompanyId: row.spfmCompanyId,
        lovChange: true,
        // tableList: [], // 切换公司卸载模型表
      },
      () => {
        this.fetchPurchaseFormList();
      }
    );
    this.fetchInfoAndData(row.companyId, row.spfmCompanyId);
  }

  /**
   * 查询供货能力清单附件行
   */
  @Bind()
  queryAttachment(page = {}, supplyAbilityLineId) {
    const { dispatch, modelName = 'supplierDetail' } = this.props;
    dispatch({
      type: `${modelName}/queryLineAttachment`,
      payload: {
        supplyAbilityLineId,
        page,
      },
    }).then(res => {
      const { capacityAttachmentData = [], capacityAttachmentPagination = {} } = res;
      this.setState({
        capacityAttachmentData,
        capacityAttachmentPagination,
      });
    });
  }

  /**
   * 查询采购财务
   */
  @Bind()
  queryPurchaseList(page = {}, supplierCompanyId, companyId) {
    const { dispatch, modelName = 'supplierDetail' } = this.props;
    const { companyId: stateCompanyId, supplierCompanyId: stateSupplierCompanyId } = this.state;
    const newSupplierCompanyId = supplierCompanyId || stateSupplierCompanyId;
    const newCompanyId = companyId || stateCompanyId;
    dispatch({
      type: `${modelName}/fetchPurchaseList`,
      payload: {
        page,
        supplierCompanyId: newSupplierCompanyId,
        companyId: newCompanyId,
        customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.PURCHASE_INFO',
      },
    }).then(res => {
      const { purchaseList = [], purchaseListPagination = {} } = res;
      this.setState({
        purchaseList,
        purchaseListPagination,
      });
    });
  }

  /**
   * 上下调动菜单
   */
  // @Bind()
  // handleChangeTop(type, num) {
  //   const { topValue } = this.state;
  //   const anchor = document.querySelector('.ant-anchor-wrapper');
  //   const max = num * -28;
  //   if (type === 'down') {
  //     const top = topValue > max ? topValue - 28 : max;
  //     anchor.style.top = `${top}px`;
  //     this.setState({ topValue: top });
  //   } else if (type === 'up') {
  //     const top = topValue < 0 ? topValue + 28 : 0;
  //     anchor.style.top = `${top}px`;
  //     this.setState({ topValue: top });
  //   }
  // }

  /**
   * 查询采购/财务表单信息
   */
  @Bind()
  fetchPurchaseFormList() {
    const { dispatch, modelName = 'supplierDetail' } = this.props;
    const { supplierCompanyId, tenantId, companyId } = this.state;
    dispatch({
      type: `${modelName}/fetchPurchaseFormList`,
      payload: {
        supplierCompanyId,
        companyId,
        tenantId,
        customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.PURCHASE_HEADER',
      },
    }).then(purchaseFormList => {
      if (purchaseFormList) {
        this.setState({
          purchaseFormList,
        });
      }
    });
  }

  /**
   * 查询其他信息
   */
  @Bind()
  queryOtherInfo(companyId) {
    const { dispatch, modelName = 'supplierDetail' } = this.props;
    const { supplierCompanyId, partnerTenantId } = this.state;
    dispatch({
      type: `${modelName}/fetchOtherInfo`,
      payload: {
        companyId,
        supplierCompanyId,
        supplierTenantId: partnerTenantId,
        customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.OTHER_INFO',
      },
    }).then(otherInfo => {
      if (otherInfo) {
        this.setState({
          otherInfo,
        });
      }
    });
  }

  /**
   * 记账冻结/取消记账冻结
   */
  @Bind()
  accountFreezeSwitch() {
    const { dispatch, modelName = 'supplierDetail' } = this.props;
    // const {
    // [modelName]: { purchaseFormList },
    // } = this.props;
    const { companyId, purchaseFormList = {} } = this.state;
    dispatch({
      type: `${modelName}/fetchAccountFreeze`,
      payload: {
        ...purchaseFormList,
        frozenFlag: purchaseFormList.frozenFlag ? 0 : 1,
      },
    }).then(() => {
      this.fetchPurchaseFormList();
      this.queryOtherInfo(companyId);
    });
  }

  /**
   * 供应商关联业务单据跳转
   */
  @Bind()
  handleJumpDetail() {
    const {
      isPub,
      companyId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
      partnerTenantId,
      changeReqId,
      tenantId,
      basicInfo,
      dimensionCode,
    } = this.state;
    const { partnerId, supplierTenantId } = basicInfo || {};
    const { history } = this.props;
    if (isPub) {
      history.push({
        pathname: `/pub/sslm/supplier-related-doc/list`,
        search: qs.stringify({
          companyId,
          sourceTarget: 'lifeCycleSummary',
          supplierCompanyId,
          customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL.RELATED_DOC',
          tenantId,
          spfmCompanyId,
          spfmPartnerCompanyId,
          partnerTenantId,
          changeReqId,
          isLifeCyclesSummaryFlag: 1,
          partnerId,
          dimensionCode,
          supplierTenantId, // src-31940 用于关联单据查询供应商分类
        }),
      });
    } else {
      openTab({
        title: 'hzero.common.view.title.supplierRelatedDoc',
        key: '/sslm/supplier-related-doc/list',
        path: '/sslm/supplier-related-doc/list',
        search: qs.stringify({
          companyId,
          supplierCompanyId,
          customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.DETAIL.RELATED_DOC',
          isLifeCyclesSummaryFlag: 1,
          partnerId,
          dimensionCode,
          supplierTenantId, // src-31940 用于关联单据查询供应商分类
        }),
      });
    }
  }

  /**
   * 跳转到申请单页面
   */
  @Bind()
  redirectToApplicationForm(record) {
    const { history, match } = this.props;
    const { requisitionId, toStageId, lifeCycleUrl, gradeCode, sucxRoute, documentType } = record;
    const {
      companyId,
      partnerCompanyId,
      tenantId,
      partnerTenantId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
      changeReqId,
    } = this.state;
    if (sucxRoute) {
      history.push(sucxRoute);
    } else if (documentType) {
      history.push({
        pathname: '/sslm/life-cycle-manage/read',
        search: qs.stringify(
          filterNullValueObject({
            requisitionId,
            documentType,
          })
        ),
      });
    } else {
      let basePath = match.path.substring(0, match.path.indexOf('/supplier-detail'));
      // 处理工作流跳转包含/include路径路由不存在
      if (basePath && basePath.includes('/include')) {
        basePath = basePath.replace('/include', '');
      }
      if (lifeCycleUrl) {
        const applicationPath = lifeCycleUrl.substring(27);
        const pathname = `${basePath}/${applicationPath}`;
        const search = qs.stringify({
          tenantId,
          companyId,
          partnerCompanyId,
          partnerTenantId,
          supplierCompanyId,
          spfmCompanyId,
          spfmPartnerCompanyId,
          requisitionId,
          toStageId,
          gradeCode,
          changeReqId,
        });
        history.push({
          pathname,
          search,
        });
      }
    }
  }

  @Bind()
  handlePrint() {
    const { dispatch, modelName = 'supplierDetail' } = this.props;
    const { companyId, supplierCompanyId } = this.state;
    dispatch({
      type: `${modelName}/handlePrint`,
      payload: {
        companyId,
        supplierCompanyId,
      },
    }).then(async res => {
      if (res) {
        const flag = checkPrintWindow();
        if (flag) {
          if (res.type.indexOf('application/json') > -1) {
            notification.warning({
              description: intl
                .get(`sslm.common.view.printwarning.noTemplate`)
                .d('未设置打印模板，不可打印'),
            });
            return;
          }
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow) {
            printWindow.print();
          }
        } else {
          const { fileUrl, bucketName, fileToken } = res;
          const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
          window.open(url);
        }
      }
    });
  }

  /**
   *渲染方法
   */
  render() {
    const {
      modelName = 'supplierDetail',
      form,
      match,
      // [modelName]: supplierDetail,
      // match: { path },
      buttonLoading,
      detailLoading,
      detailByManageLoading,
      detailOuListLoading,
      detailByManageOuListLoading,
      custLoading,
      customizeTable,
      customizeForm,
      getHocInstance,
      queryOtherLoading,
      fetchCompanyIdReserveLoading,
      printLoading,
      customizeBtnGroup,
      supplierDetailRemote,
    } = this.props;
    const {
      companyId,
      tenantId,
      isPub,
      changeReqId,
      historyBack,
      partnerCompanyId,
      supplierCompanyId,
      tableList = [],
      basicInfo = {},
      sourceTarget,
      toStageId,
      requisitionId,
      companyName,
      isInclude,
      viewFlag,
      showBtn,
      companyInfo = {}, // 公司信息
      erpInfo = [], // erp信息
      editedInfo = {}, // 编辑历史信息
      contactsData = [], // 联系人信息
      addressData = [], // 地址信息
      bankAccountData = [], // 银行账户信息
      catalogData = [], // 菜单数据
      questionnaireTmpl = [], // 调查表模板
      tmplDataSource = {}, // 模板数据
      lifeCycleSteps = [], // 生命周期步骤数据
      supplierCatagoryData = [], // 供应商分类信息
      supplierCapacityData = [], // 供货能力清单数据
      purchaseList = [], // 采购/财务信息
      purchaseListPagination = {}, // 采购/财务信息 分页
      purchaseFormList = {}, // 采购/财务表单信息
      destinationList = [], // 地点层信息
      ouList = [], // ou层信息
      otherInfo = {}, // 其他信息
      capacityAttachmentData = [], // 供货能力清单附件行
      capacityAttachmentPagination = {},
      companyInfo: { siteFlag = 0 } = {},
      localDestinationList = [], // 本地地点层信息
      cardList,
    } = this.state;
    const supplierInfo = {
      isPub,
      companyId,
      supplierCompanyId,
      companyInfo,
      contactsData,
      lifeCycleSteps,
      supplierCatagoryData,
      supplierCapacityData,
      addressData,
      bankAccountData,
      questionnaireTmpl,
      tmplDataSource,
      onRedirect: this.redirectToApplicationForm,
      queryAttachment: this.queryAttachment,
      purchaseList,
      purchaseListPagination,
      queryPurchaseList: this.queryPurchaseList,
      purchaseFormList,
      destinationList,
      ouList,
      loading: modelName === 'supplierDetail' ? detailOuListLoading : detailByManageOuListLoading,
      modelName,
      customizeTable,
      form,
      custLoading,
      customizeForm,
      otherInfo,
      capacityAttachmentData,
      capacityAttachmentPagination,
      tableList,
      basicInfo,
      siteFlag,
      localDestinationList,
      queryOtherLoading,
      getHocInstance,
      remote: supplierDetailRemote,
    };
    const fixCatalog = [
      {
        serialNumber: 1,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.companyInformation')
          .d('企业信息'),
        titleLevel: 1,
        configName: 'companyInfo',
      },
      {
        serialNumber: 1.1,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.registrationInfo')
          .d('登记信息'),
        titleLevel: 2,
        configName: 'registrationInfo',
      },
      {
        serialNumber: 1.2,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.basicBusinessInfo')
          .d('基本业务信息'),
        titleLevel: 2,
        configName: 'basicBusinessInfo',
      },
      {
        serialNumber: 1.3,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.treeYearsFinance')
          .d('近3年财务状况'),
        titleLevel: 2,
        configName: 'treeYearsFinance',
      },
      {
        serialNumber: 2,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.supplierInformation')
          .d('供应商信息'),
        titleLevel: 1,
        configName: 'supplierInfo',
      },
      {
        serialNumber: 2.1,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.supplierLifetime')
          .d('供应商生命周期'),
        titleLevel: 2,
        configName: 'supplierLifetime',
      },
      {
        serialNumber: 2.2,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.supplierContact')
          .d('联系人'),
        titleLevel: 2,
        configName: 'supplierContact',
      },
      {
        serialNumber: 2.3,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.supplierAddress')
          .d('地址'),
        titleLevel: 2,
        configName: 'supplierAddress',
      },
      {
        serialNumber: 2.4,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.supplierBankAccount')
          .d('银行账户'),
        titleLevel: 2,
        configName: 'supplierBankAccount',
      },
      {
        serialNumber: 2.5,
        configDescription: intl.get('sslm.supplierDetail.view.message.invoiceInfo').d('开票信息'),
        titleLevel: 2,
        configName: 'invoiceInfo',
      },
      {
        serialNumber: 2.6,
        configDescription: intl
          .get('sslm.supplierDetail.model.supplierDetail.attachmentMessage')
          .d('附件信息'),
        titleLevel: 2,
        configName: 'supplierAttchmentInfo',
      },
      {
        serialNumber: 2.7,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.supplierClass')
          .d('供应商分类'),
        titleLevel: 2,
        configName: 'supplierCatagory',
      },
      {
        serialNumber: 2.8,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.supplyCapacityList')
          .d('供货能力清单'),
        titleLevel: 2,
        configName: 'supplierCapacity',
      },
      {
        serialNumber: 2.9,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.purchaseList')
          .d('采购/财务信息'),
        titleLevel: 2,
        configName: 'purchaseList',
      },
      {
        serialNumber: '2.10', // 若为数字10 会自动去除0 故用字符串
        configDescription: siteFlag
          ? intl
              .get('sslm.supplierDetail.view.message.title.localAddress')
              .d('本地供应商地点层信息')
          : intl.get('sslm.supplierDetail.view.message.title.address').d('地点层信息'),
        titleLevel: 2,
        configName: 'addressList',
      },
      {
        serialNumber: 2.11,
        configDescription: intl.get('sslm.supplierDetail.view.message.otherInfo').d('其他信息'),
        titleLevel: 2,
        configName: 'otherInfo',
      },
    ].filter(n => cardList.includes(n.configName));
    const catalogQuestionnaire = [
      {
        serialNumber: 3,
        configDescription: intl
          .get('sslm.supplierDetail.view.message.title.questionInfo')
          .d('调查表信息'),
        titleLevel: 1,
        configName: 'questionnaire_information',
      },
    ];
    const catalogNewData = catalogData;
    const otherCatalog = tableList.map((n, i) => {
      return {
        configName: n.tableCode,
        configDescription: n.tableName,
        serialNumber: `2.${sum([13, i])}`,
        titleLevel: 2,
      };
    });
    const newFixCatalog = fixCatalog.concat(otherCatalog);
    const basePath = historyBack || match.path.substring(0, match.path.indexOf('/supplier-detail'));
    const defaultPubBackPath =
      historyBack || `/pub/sslm/supplier-inform-change/detail/${changeReqId}/${companyId}`;
    let sourcePathname = '';
    switch (sourceTarget) {
      case 'Qualified':
        sourcePathname = '/pub/sslm/supplier-life-manage/qualified-view';
        break;
      case 'Recommend':
        sourcePathname = '/pub/sslm/supplier-life-manage/recommend-view';
        break;
      case 'Prepare':
        sourcePathname = '/pub/sslm/supplier-life-manage/prepare-view';
        break;
      case 'Potential':
        sourcePathname = '/pub/sslm/supplier-life-manage/potential-view';
        break;
      case 'Eliminate':
        sourcePathname = '/pub/sslm/supplier-life-manage/eliminate-view';
        break;
      default:
        break;
    }
    const queryParams = {
      toStageId,
      requisitionId,
    };
    const pubSourePath = sourcePathname ? `${sourcePathname}?${qs.stringify(queryParams)}` : '';
    const pubBackPath = sourcePathname ? pubSourePath : defaultPubBackPath;

    const supplierBySummaryLoading = buttonLoading || detailLoading || detailOuListLoading;
    const supplierByManageLoading =
      buttonLoading || detailByManageLoading || detailByManageOuListLoading;

    const hiddenBottonFlag = isPub || viewFlag;
    const headerButton = [
      {
        name: 'print',
        btnComp: Button,
        child: intl.get('hzero.common.button.print').d('打印'),
        btnProps: {
          icon: 'printer',
          hidden: hiddenBottonFlag,
          onClick: this.handlePrint,
          loading:
            printLoading ||
            (modelName === 'supplierDetail' ? supplierBySummaryLoading : supplierByManageLoading),
        },
      },
      {
        name: 'supplierRelatedDoc',
        btnComp: Button,
        child: intl.get('sslm.common.view.title.supplierRelatedDoc').d('供应商关联业务单据'),
        btnProps: {
          icon: 'relate',
          type: 'c7n-pro',
          hidden: !(!isPub && companyId) || viewFlag,
          onClick: this.handleJumpDetail,
          loading:
            modelName === 'supplierDetail' ? supplierBySummaryLoading : supplierByManageLoading,
          permissionList: [
            {
              code: `srm.partner.suplier-lifecycle.summary-query.ps.button.associated.document`,
              type: 'button',
              meaning: '360详情-供应商关联业务单据',
            },
          ],
        },
      },
      {
        name: 'riskScan',
        btnComp: Button,
        child: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'document_scanner-o',
          onClick: () => riskScan({ ...basicInfo, companyId }, true),
          loading:
            modelName === 'supplierDetail' ? supplierBySummaryLoading : supplierByManageLoading,
        },
      },
      {
        name: 'cancelBookBlockOrBookKeepreeze',
        btnComp: Button,
        child: purchaseFormList.frozenFlag
          ? intl.get('hzero.common.button.cancelBookBlock').d('取消记账冻结')
          : intl.get('hzero.common.button.bookKeepreeze').d('记账冻结'),
        btnProps: {
          icon: 'lock',
          type: 'c7n-pro',
          color: 'primary',
          hidden: hiddenBottonFlag,
          onClick: this.accountFreezeSwitch,
          disabled: !companyId,
          loading:
            modelName === 'supplierDetail' ? supplierBySummaryLoading : supplierByManageLoading,
          permissionList: [
            {
              code: `srm.partner.suplier-lifecycle.summary-query.ps.button.edit`,
              type: 'button',
              meaning: '记账冻结-编辑',
            },
          ],
        },
      },
    ];
    const hiddenBackPath = isInclude || viewFlag || showBtn;

    const loading =
      (modelName === 'supplierDetail' ? supplierBySummaryLoading : supplierByManageLoading) ||
      fetchCompanyIdReserveLoading ||
      false;

    const renderProps = {
      tmplDataSource,
      companyInfo,
      questionnaireTmpl,
      loading,
      companyName,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.supplierDetail.view.message.title.main').d('供应商360度查询')}
          backPath={hiddenBackPath ? '' : isPub ? pubBackPath : basePath}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM.SUPPLIER_LIFE_CYCLE.HEADER_BTNS',
              pro: true,
            },
            <DynamicButtons buttons={headerButton} />
          )}
          {companyId && (
            <Form loading={loading} style={{ display: 'flex', alignItems: 'center' }}>
              <FormItem
                labelCol={{ span: 9 }}
                wrapperCol={{ span: 15 }}
                style={{ width: '100%', marginBottom: '0' }}
                label={intl.get('sslm.historyVersion.view.message.selectPurchaser').d('选择采购方')}
              >
                {form.getFieldDecorator('companyId', { initialValue: companyId })(
                  <Lov
                    allowClear={false}
                    textValue={companyName}
                    code="SSLM.USER_AUTH.COMPANY"
                    queryParams={{ tenantId, partnerCompanyId }}
                    onChange={this.showSupplierDetail}
                    disabled={fetchCompanyIdReserveLoading}
                  />
                )}
              </FormItem>
            </Form>
          )}
          {/* 按钮埋点 */}
          {supplierDetailRemote &&
            supplierDetailRemote.render(
              'SSLM_SUPPLIER_DETAIL_CUSTOMER_BUTTONS',
              <></>,
              renderProps
            )}
        </Header>
        <Content style={{ overflow: 'hidden', border: 0 }}>
          <Spin spinning={loading}>
            <div id="scrollArea">
              <CompanyInfo
                companyInfo={companyInfo}
                ERPInfo={erpInfo}
                editedInfo={editedInfo}
                historyVersion={this.historyVersion}
                purchaseFormList={purchaseFormList}
                isInclude={isInclude}
                customizeForm={customizeForm}
                form={form}
                remote={supplierDetailRemote}
              />
              <EnterpriseInfo
                companyInfo={companyInfo}
                questionnaireTmpl={questionnaireTmpl}
                tmplDataSource={tmplDataSource}
                form={form}
                customizeForm={customizeForm}
                getHocInstance={getHocInstance}
                customizeTable={customizeTable}
              />
              <SupplierInfo {...supplierInfo} />
              <InvestigateTmpl
                questionnaireTmpl={questionnaireTmpl}
                tmplDataSource={tmplDataSource}
              />
              <AffixMenu
                catalogList={
                  catalogNewData.length > 0
                    ? [...newFixCatalog, ...catalogQuestionnaire, ...catalogNewData]
                    : newFixCatalog
                }
              />
            </div>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
