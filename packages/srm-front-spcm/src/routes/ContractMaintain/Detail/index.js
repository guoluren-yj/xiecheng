/*
 * ContractMaintainDetail - 协议维护详情
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin, Modal, Row, Col, Anchor, Affix, Card, Tabs, Popover } from 'hzero-ui';
import { Alert, Tag } from 'choerodon-ui';
import { connect } from 'dva';
import {
  isNumber,
  isEmpty,
  omit,
  merge,
  isArray,
  get,
  isString,
  map,
  debounce as _debounce,
  compose,
  isNil,
  isFinite,
  // isFunction,
} from 'lodash';
import classnames from 'classnames';
import { Bind, Debounce } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import hocRemote from 'utils/remote';

import Upload from 'srm-front-boot/lib/components/Upload';
import ComUpload from '@/routes/components/ComUpload';
import moment from 'moment';

import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import {
  getEditTableData,
  getCurrentOrganizationId,
  addItemToPagination,
  createPagination,
  delItemsToPagination,
  addItemsToPagination,
  getAccessToken,
  getResponse,
} from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { isNullOrUndefined } from 'util';
import {
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_DATE_FORMAT,
  DETAIL_DEFAULT_CLASSNAME,
  DETAIL_CARD_CLASSNAME,
} from 'utils/constants';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { oldUnitCodeList } from '@/utils/enum';
import { fetchContractOnlineHTMLType, fetchWpsV5TextPreView } from '@/services/editorOnlineService';
import { batchQueryPrice, createPaymentPlan, preSubmitValid } from '@/services/newContractService';
import { getRecommendSupplierFlag, fetchTenantIsBlacklist } from '@/services/contractCommonService';
import { getMasterDefaults, fetchStageOptions } from '@/services/contractMaintainService';
import {
  allSignList,
  openTermsModal,
  preSubmitValidBudget,
  renderThousandthNum,
  getCustByFieldCode,
  queryCommonDoubleUomConfig,
  getAttributeFields,
  handlePurchaseNeedDTOs,
} from '@/utils/util';
import PreferentialRule from '@/routes/components/PreferentialRule';
import { executeAiApprove, queryAiApproveResult } from '@/services/workspaceService';
import IntelligentPreReview from '@/routes/components/IntelligentPreReview/index';

import styles from './index.less';
import ContractHeader from '../../components/ContractHeader';
// eslint-disable-next-line import/no-named-as-default
import ContractSubject from '../../components/ContractSubject';
import ContractStage from '../../components/ContractStage';
import ContractPartner from '../../components/ContractPartner';
import ApproveRecord from '../../components/ApproveRecord';
import ContractBusinessTerms from '../../components/ContractBusinessTerms';
import ContractRebate from '../../components/ContractRebate';
import OperationRecordDrawer from '../../components/OperationRecordDrawer';
import EditorOnline from '../../components/EditorOnline';
import Attachment from '../../components/Upload';
import TextComparisonModal from '../../components/TextComparisonModal';
import ContractReplenish from '../../components/ContractReplenish';

const { Link } = Anchor;
const { TabPane } = Tabs;
const CONTRACT_MAINTAIN = 'srm.pc-admin.pc-purchaser.maintain';

/**
 * ContractMaintainDetail - 协议维护详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [contractMaintain={}] - 数据源
 * @reactProps {boolean} [getHeaderAttachmentUuidLoading=false] - 获取附件uuid处理中
 * @reactProps {boolean} [deleteDetailLinesLoading=false] - 删除明细行处理中
 * @reactProps {boolean} [submitDeliveryLoading=false] - 提交送货单处理中
 * @reactProps {boolean} [deleteDeliveryLoading=false] - 删除送货单处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建行处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护行处理中
 * @reactProps {boolean} [fetchingDetailHeader=false] - 查询明细头处理中
 * @reactProps {boolean} [queryDetailListLoading=false] - 查询明细行处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

class Detail extends Component {
  constructor(props) {
    const isPub = props.location.pathname.includes('/pub'); // 判断是否为pub页面
    super(props);
    const {
      match = {},
      location: { search },
    } = this.props;
    const { params } = match;
    const { pcHeaderId, itemKey, isQuoteSource, quoteType } = querystring.parse(search.substr(1));
    this.state = {
      isPub,
      pcHeaderId: params.id || params.pcHeaderId || pcHeaderId,
      itemKey,
      headerInfo: {}, // 头form数据源
      collapseKeys: [
        'contractHeaderInformation',
        'contractPartnerInformation',
        'contractSubjectInformation',
        'contractBusinessTermsInformation',
        'contractOnlineEdit',
      ], // 打开的折叠面板key
      listDataSource: [], // 表格数据源
      operationRecordVisible: false,
      headerEdited: false, // 头是否编辑过
      pcSubjectEdited: false,
      pcStageEdited: false,
      partnerEdited: false,
      termEdited: false,
      pcRebateEdited: false,
      fullScreenFlag: false,
      tenantId: getCurrentOrganizationId(),
      partnerDataSource: [], // 合作伙伴数据
      partnerSelectedRows: [],
      pcSubjectDataSource: [],
      pcStageDataSource: [],
      pcSubjectPagination: {},
      pcStagePagination: {},
      pcSubjectSelectedRows: [],
      pcStageSelectedRows: [],
      termDataSource: [],
      termSelectedRows: [],
      templateList: [],
      templateListFlag: false,
      activeKey: 'contractSubjectInfo',
      backPath: {
        purchaseContract: '/spcm/contract-maintain/purchase-contract',
        purchaseOrder: '/spcm/contract-maintain/quote-purchase-order',
        default: '/spcm/contract-maintain/list',
      },
      from: '',
      isQuoteSource,
      pcRebateDataSource: [],
      pcRebatePagination: {},
      pcRebateSelectedRows: [],
      quoteType, // 引用类型
      textPreviewVisible: false,
      textPreviewHtml: null,
      pcSubjectTableKey: 'pcSubjectTableKey', // 标的表格key
      isNotSaveFormChanged: true,
      prLineImport: false,
      doubleUnitEnabled: 0,
      fetchTextPreViewLoading: false,
      cuxQueryLoading: false,
      isBlacklistTenant: false, // 黑名单租户
      aiCheckLoading: false,
      disableAiApproveBtn: false,
      aiApproveReslultParams: [],
      resultStatus: '',
    };
    this.aiResultTimer = null;
  }

  editorOnlineRef;

  UN_LISTEN;

  componentDidMount() {
    const { pcHeaderId, headerInfo } = this.state;
    const {
      history,
      location: { search },
      contractMaintain: { sourceResultDTOs },
    } = this.props;

    const { from } = querystring.parse(search.substr(1));
    const setData = { from };
    if (sourceResultDTOs.length > 0) {
      setData.headerInfo = {
        ...headerInfo,
        ...sourceResultDTOs[0],
      };
    }
    this.setState(setData);
    // 查询是否协议黑名单租户
    this.queryTenantIsBlacklist();
    // 从其他页面带过来的默认值要放在最前面，避免覆盖已经保存的值
    // this.resetDataFromStorage();
    this.fetchEnum();
    this.fetchData(); // 查询值集(新)
    this.fetchDoubleUnitFlag();
    if (pcHeaderId && pcHeaderId) {
      this.fetchHeader();
      this.fetchList();
      this.fetchAiApproveResult();
    } else {
      this.resetDataFromStorage();
      this.fetchPurchaseAgent();
    }
    this.fetchConfigSetting();

    // 监听路由，当从导入返回时刷新标的
    this.UN_LISTEN = history.listen((router = {}) => {
      const { pathname, state = {} } = router;
      if (pathname === '/spcm/contract-maintain/detail' && state._back === -1) {
        this.fetchSubject();
      }
    });
    this.hanldeCuxInit();
  }

  componentWillUnmount() {
    this.clearAIResultTimer();
    this.offDTOs();
    // 去除监听
    if (this.UN_LISTEN) this.UN_LISTEN();
  }

  @Bind()
  hanldeCuxInit() {
    const { remote } = this.props;
    if (remote?.event) {
      remote.event.fireEvent('handleCuxInitInfo', { current: this });
    }
  }

  // 查询租户是否不在黑名单
  @Bind()
  queryTenantIsBlacklist() {
    fetchTenantIsBlacklist().then((res) => {
      // 返回1在黑名单，0 不在黑名单
      if (isFinite(Number(res))) {
        this.setState({
          isBlacklistTenant: !!Number(res),
        });
      } else {
        getResponse(res);
      }
    });
  }

  @Bind()
  offDTOs() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/updateState',
      payload: {
        sourceResultDTOs: [],
        sourceRslQueryParams: {},
        createPurchaseOrderList: [],
        createPurchaseOrderInfo: {},
      },
    });
    dispatch({
      type: 'contractCommon/updateState',
      payload: { formChanged: false },
    });
  }

  /**
   * 双单位业务规则是否开启
   */
  @Bind()
  async fetchDoubleUnitFlag() {
    const res = await queryCommonDoubleUomConfig();
    this.setState({ doubleUnitEnabled: res });
  }

  /**
   * resetDataFromStorage - 从存储数据中初始化数据，
   *  这些存储数据可能从采购申请中点击创建时设置sessionStorege
   */
  @Bind()
  async resetDataFromStorage() {
    const { remote } = this.props;
    const { itemKey } = this.state;
    if (!itemKey) {
      return;
    }
    // 从sessionStorage中获取其他页面暂存的数据
    const dataFromPurchaseContract = JSON.parse(window.sessionStorage.getItem(itemKey));
    if (!dataFromPurchaseContract) {
      return;
    }
    dataFromPurchaseContract.pcSubjectDataSource = await handlePurchaseNeedDTOs(
      dataFromPurchaseContract.pcSubjectDataSource
    );
    let { headerInfo = {} } = dataFromPurchaseContract;
    dataFromPurchaseContract.pcSubjectDataSource = (
      dataFromPurchaseContract.pcSubjectDataSource || []
    ).map((item) => ({
      _status: 'create',
      pcSubjectId: uuid(),
      edited: true,
      ...item,
      lineNum: '',
    }));
    // 第一次新建增加埋点
    const otherProps = {
      pcSubjectDataSource: dataFromPurchaseContract.pcSubjectDataSource, // 标的行数据
      current: this,
    };
    // 处理新建的采购申请的行标的信息, 支持异步
    headerInfo = remote
      ? await remote.process(
          'SPCM_CONTRACT_MAINTAIN_DETAIL_TRANSFORM_CREATE_HEADER',
          headerInfo,
          otherProps
        )
      : headerInfo;
    this.setState({
      ...dataFromPurchaseContract,
      headerInfo,
      prExchangeRate: headerInfo?.exchangeRate,
    });
  }

  /**
   * newResetDataFromStorage - 针对标的取价做处理
   *  这些存储数据可能从采购申请中点击创建时设置sessionStorege
   */
  @Bind()
  async newResetDataFromStorage() {
    const {
      itemKey,
      pcHeaderId,
      doubleUnitEnabled,
      headerInfo: { priceType, pcSourceCode, purchaseCurrencyCode = 'CNY', acceptExecuteType },
    } = this.state;
    const {
      newContract: { _linkFlag },
    } = this.props;
    if (!itemKey) {
      return [];
    }
    // 从sessionStorage中获取其他页面暂存的数据
    const dataFromPurchaseContract = JSON.parse(window.sessionStorage.getItem(itemKey));
    if (!dataFromPurchaseContract) {
      return [];
    }
    const data = [];
    dataFromPurchaseContract.pcSubjectDataSource
      .filter((i) => i.itemId)
      .map((item) => {
        data.push({
          pcHeaderId,
          pcSourceCode,
          itemId: item.itemId,
          itemCode: item.itemCode,
          invOrganizationId: item.invOrganizationId,
          uomId: item.uomId,
          secondaryUomId: item.secondaryUomId,
        });
        return data;
      });
    const itemObj = {};
    if (pcHeaderId) {
      const itemList = await batchQueryPrice({
        pcHeaderId,
        data,
      });
      // eslint-disable-next-line no-unused-expressions
      Array.isArray(itemList) &&
        itemList.forEach((item) => {
          itemObj[item.itemId] = item;
        });
    }
    dataFromPurchaseContract.pcSubjectDataSource = await handlePurchaseNeedDTOs(
      dataFromPurchaseContract.pcSubjectDataSource
    );
    dataFromPurchaseContract.pcSubjectDataSource = (
      dataFromPurchaseContract.pcSubjectDataSource || []
    ).map((item) => {
      let rest = {};
      let attributeFields = {};
      const hasTaxInclude = priceType === 'TAX_INCLUDED_PRICE';
      const priceField = hasTaxInclude ? 'taxIncludedUnitPrice' : 'unitPrice';
      // 采购申请没有【辅助单价不含税】secondaryUnitPrice，此处只是用来给benchmarkPrice一个undefined
      const secondField = hasTaxInclude ? 'taxIncludedSecondaryUnitPrice' : 'secondaryUnitPrice';
      const unitPriceObj = {
        benchmarkPrice: doubleUnitEnabled ? item[secondField] : item[priceField],
      };
      if (itemObj[item.itemId]) {
        const { taxIncludedUnitPrice, unitPrice, unitPriceBatch, ...restObj } =
          itemObj[item.itemId] || {};
        const TaxIncludedUnitPrice = isNumber(item.taxIncludedUnitPrice)
          ? item.taxIncludedUnitPrice
          : taxIncludedUnitPrice;
        const UnitPrice = isNumber(item.unitPrice) ? item.unitPrice : unitPrice;
        rest = restObj;
        unitPriceObj[priceField] = hasTaxInclude ? TaxIncludedUnitPrice : UnitPrice;
        unitPriceObj.benchmarkPrice = hasTaxInclude ? TaxIncludedUnitPrice : UnitPrice;
        if (
          hasTaxInclude &&
          ((!isNil(item.taxIncludedUnitPrice) && isNil(item.unitPriceBatch)) ||
            (isNil(item.taxIncludedUnitPrice) && !isNil(taxIncludedUnitPrice)))
        ) {
          unitPriceObj.unitPriceBatch = unitPriceBatch;
        } else if (
          !hasTaxInclude &&
          ((!isNil(item.unitPrice) && isNil(item.unitPriceBatch)) ||
            (isNil(item.unitPrice) && !isNil(unitPrice)))
        ) {
          unitPriceObj.unitPriceBatch = unitPriceBatch;
        }
        // 当开启双单位的时候才会有taxIncludedSecondaryUnitPrice/secondaryUnitPrice
        if (doubleUnitEnabled) {
          unitPriceObj[secondField] = isNumber(item[secondField])
            ? item[secondField]
            : restObj[secondField];
          unitPriceObj.benchmarkPrice = isNumber(item[secondField])
            ? item[secondField]
            : restObj[secondField];
        }
        attributeFields = getAttributeFields(itemObj[item.itemId]);
      }
      return {
        ...attributeFields,
        _status: 'create',
        pcSubjectId: uuid(),
        edited: true,
        ...item,
        lineNum: '',
        ...unitPriceObj,
        currencyCode: isNumber(item[priceField]) ? item.currencyCode : rest.currencyCode,
        purchaseCurrencyCode: item.purchaseCurrencyCode || purchaseCurrencyCode,
        taxRate: isNumber(item[priceField]) ? item.taxRate : rest.taxRate,
        taxId: isNumber(item[priceField]) ? item.taxId : rest.taxId,
        taxCode: isNumber(item[priceField]) ? item.taxCode : rest.taxCode,
        // 新链路框架协议取全部数量
        quantity:
          _linkFlag && acceptExecuteType === 'CONTRACT_FRAMEWORK'
            ? item.quantity
            : item.availableQuantity,
        secondaryQuantity:
          _linkFlag && acceptExecuteType === 'CONTRACT_FRAMEWORK'
            ? item.secondaryQuantity
            : item.secondaryAvailableQuantity,
      };
    });
    return dataFromPurchaseContract.pcSubjectDataSource;
  }

  /**
   * 引用采购申请创建查询业务规则是否开启推荐供应商
   */
  @Bind()
  async getRecommendSupplierFlag() {
    const { headerInfo: { pcSourceCode } = {} } = this.state;
    if (pcSourceCode === 'PURCHASE_NEED') {
      const res = getResponse(await getRecommendSupplierFlag());
      this.setState({ prLineImport: res === 1 });
    }
  }

  // 移除引用采购申请的缓存数据
  @Bind()
  removeDataFromStorage() {
    const { itemKey } = this.state;
    if (!itemKey) {
      return;
    }
    const dataFromPurchaseContract = JSON.parse(window.sessionStorage.getItem(itemKey));
    if (!dataFromPurchaseContract) {
      return;
    }
    window.sessionStorage.removeItem(itemKey);
  }

  /**
   * fetchHeader - 查询头明细数据
   */
  @Bind()
  fetchHeader() {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    return dispatch({
      type: 'contractCommon/fetchHeader',
      pcHeaderId,
      customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
    }).then(async (res) => {
      if (res) {
        this.setState({ headerInfo: res }, () => {
          this.fetchSubject(); // 需要头信息里的字段
          this.fetchStage();
          this.handleFetchConfigAttachment();
          this.getRecommendSupplierFlag();
        });
        await dispatch({
          type: 'contractMaintain/fetchPcPartnerTypes',
          payload: {
            pcTypeId: res.pcTypeId,
          },
        });
        this.resetEditFlag();
        if (this.headerRef) {
          this.headerRef.setState({ signFlag: res.signEffectFlag });
        }
        if (res.rebateFlag) {
          this.fetchContractRebate();
        }
      }
    });
  }

  /**
   * 查询采购员（根据当前登录用户查询）
   */

  @Bind()
  fetchPurchaseAgent() {
    const {
      dispatch,
      contractMaintain: { createPurchaseOrderInfo = {} },
    } = this.props;
    dispatch({
      type: 'contractMaintain/fetchPurAgent',
    }).then((res) => {
      if (getResponse(res) && res.length) {
        const { purchaseAgentId, purchaseAgentName } = res[0];
        const { headerInfo } = this.state;
        if (!isEmpty(createPurchaseOrderInfo)) {
          this.setState({
            headerInfo: {
              ...headerInfo,
              purchaseAgentId: createPurchaseOrderInfo?.purchaseAgentId || purchaseAgentId,
              purchaseAgentName: createPurchaseOrderInfo?.purchaseAgentName || purchaseAgentName,
            },
          });
        } else {
          this.setState({
            headerInfo: {
              ...headerInfo,
              purchaseAgentId:
                headerInfo?.agentId || headerInfo?.purchaseAgentId || purchaseAgentId,
              purchaseAgentName:
                headerInfo?.agentName || headerInfo?.purchaseAgentName || purchaseAgentName,
            },
          });
        }
      }
    });
  }

  /**
   * 查询列表
   */
  @Bind()
  fetchList() {
    this.fetchPartner();
    // this.fetchStage();
    this.fetchTerm();
    this.fetchDefaultStage();
  }

  /**
   * 查询详情值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/fetchDetailEnum',
    });
  }

  /**
   * 查询值集(新)
   */
  @Bind()
  fetchData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'newContract/fetchDetailEnum',
    });
  }

  /**
   * 查询配置中心配置
   */
  @Bind()
  fetchConfigSetting() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchConfigSetting',
    });
  }

  /**
   * 重置修改标志
   */
  @Bind()
  resetEditFlag() {
    this.setState({
      headerEdited: false,
      pcSubjectEdited: false,
      pcStageEdited: false,
      partnerEdited: false,
      termEdited: false,
      pcRebateEdited: false,
    });
  }

  /**
   * fetchPartner - 查询合作伙伴数据
   * @param {object} page - 合作伙伴分页条件
   */
  @Bind()
  fetchPartner(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchPartner',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            partnerDataSource: res.map((n) => ({ ...n, _status: 'update' })),
            isNotSaveFormChanged: false,
          });
          this.resetEditFlag();
        }
      });
    }
  }

  /**
   * fetchSubject - 查询标的信息数据
   * @param {object} page - 标的信息分页条件
   * @param {object} itemName - 标的信息筛选查询条件
   * @param {object} itemCode - 标的信息筛选查询条件
   */
  @Bind()
  async fetchSubject(page = {}, ...args) {
    const [itemName = null, itemCode = null] = args;
    const { dispatch } = this.props;
    const {
      pcHeaderId,
      itemKey,
      // pcSubjectDataSource,
      headerInfo: {
        supplierCurrencyCode = 'CNY',
        purchaseCurrencyCode = 'CNY',
        pcKindCode,
        contractPurpose,
      },
      isPub,
    } = this.state;

    // 当协议性质为框架协议，协议用途为电商采购，该字段为false
    const taxIncludedUpRequired = !(
      ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(pcKindCode) &&
      contractPurpose === 'OMMERCE_PURCHASE'
    );

    const oldPcSubjectData = await this.newResetDataFromStorage();
    if (pcHeaderId) {
      const res = await dispatch({
        type: 'contractCommon/fetchSubject',
        payload: {
          page,
          itemName,
          itemCode,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
          isPub,
        },
      });
      if (!res) {
        return;
      }

      // 如果是根据其他数据创建协议, 则要默认带出值
      const newPcSubjectDataSource =
        itemKey && isEmpty(res.content)
          ? oldPcSubjectData
          : res.content.map((n) => ({
              ...n,
              _status: 'update',
              isPub,
              currencyCode: taxIncludedUpRequired
                ? n.currencyCode || supplierCurrencyCode
                : n.currencyCode,
              purchaseCurrencyCode: taxIncludedUpRequired
                ? n.purchaseCurrencyCode || purchaseCurrencyCode
                : n.purchaseCurrencyCode,
            }));

      // 特别场景 如果 用这个itemKey && isEmpty(res.content)  pcSubjectPagination 会有问题
      const pcSubjectPaginationEmpty = {
        number: 0,
        numberOfElements: 0,
        size: oldPcSubjectData.length > 10 ? oldPcSubjectData.length : 10,
        totalElements: oldPcSubjectData.length,
        totalPages: 1,
      };
      this.setState({
        pcSubjectTableKey: `pcSubjectTableKey${Math.random()}`, // 刷新标的table
        pcSubjectDataSource: newPcSubjectDataSource,
        pcSubjectPagination: createPagination(
          itemKey && isEmpty(res.content) ? pcSubjectPaginationEmpty : res
        ),
        isNotSaveFormChanged: false,
      });
      this.resetEditFlag();
    }
  }

  /**
   * fetchStage - 查询标的协议阶段
   * @param {object} page - 协议阶段分页条件
   * 阶段查询做得乱七八糟，fetchStage和fetchDefaultStage实际调用同一个接口
   * 协议拟制页实际查了两次阶段，但是我不想优化了，毕竟有复制二开的和继承二开的项目
   * 另外fetchStageOptions也查了两次，也不敢轻易优化，毕竟有复制二开的和继承二开的项目
   */
  @Bind()
  fetchStage(page = {}) {
    const { dispatch } = this.props;
    const {
      pcHeaderId,
      headerInfo: {
        supplierCurrencyCode = 'CNY',
        purchaseCurrencyCode = 'CNY',
        pcTypeId,
        contractPendingMethod,
      },
    } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchStage',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
        },
      }).then(async (res) => {
        if (res) {
          // 查询阶段名称值集
          let stageOptions = [];
          // 协议阶段新建方式为手工新建
          const stageEditFlag = contractPendingMethod === '1';
          await fetchStageOptions({ pcTypeId }).then((result) => {
            if (getResponse(result)) {
              stageOptions = result?.content || [];
            }
          });
          this.setState({
            pcStageDataSource: res.content.map((n) => ({
              ...n,
              _status: 'update',
              supplierCurrencyCode: n.supplierCurrencyCode || supplierCurrencyCode,
              purchaseCurrencyCode: n.purchaseCurrencyCode || purchaseCurrencyCode,
              stageName: stageEditFlag
                ? n.stageName
                : stageOptions.filter((item) => item.stageCode === n.stageCode)[0]?.stageName ||
                  n.stageName,
            })),
            pcStagePagination: createPagination(res),
            isNotSaveFormChanged: false,
          });
          this.resetEditFlag();
        }
      });
    }
  }

  /**
   * fetchSubject - 查询业务条款数据
   * @param {object} page - 业务条款分页数据
   */
  @Bind()
  fetchTerm(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchTerm',
        payload: {
          page,
          pcHeaderId,
        },
      }).then(async (res) => {
        if (res) {
          const lovCodes = {};
          let termDataSource = res.map((n) => {
            if (n.termTypeLov) {
              lovCodes[n.termTypeLov] = n.termTypeLov;
            }
            return { ...n, _status: 'update' };
          });
          if (!isEmpty(lovCodes)) {
            const lovList = await dispatch({
              type: 'contractCommon/fetchBatchTermContentDefaultSelect',
              payload: lovCodes,
            });
            if (lovList) {
              termDataSource = termDataSource.map((t) => {
                if (t.termTypeLov && lovList[t.termTypeLov]) {
                  const termContentObj = lovList[t.termTypeLov].find(
                    (term) => term.value === t.termContent
                  );
                  return {
                    ...t,
                    termTypeList: lovList[t.termTypeLov],
                    termContent: termContentObj ? termContentObj.value : '',
                  };
                }
                return t;
              });
            }
          }
          this.setState(
            {
              termDataSource,
              isNotSaveFormChanged: false,
            },
            () => {
              const { termDataSource: termDataList } = this.state;
              // 修复h0组件校验后form值不是净值问题
              (termDataList || []).forEach((record) => {
                if (record.$form) {
                  record.$form.resetFields();
                }
              });
            }
          );
          this.resetEditFlag();
        }
      });
    }
  }

  /**
   * fetchDefaultStage - 查询协议阶段
   * @param {object} page - 协议阶段数据
   */
  @Bind()
  async fetchDefaultStage(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      await dispatch({
        type: 'contractMaintain/fetchDefaultStage',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
        },
      });
    }
  }

  /**
   * 查询返利信息
   * @param {*} page
   */
  @Bind()
  fetchContractRebate(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;

    dispatch({
      type: 'contractCommon/fetchContractRebate',
      payload: {
        page,
        pcHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          pcRebateDataSource: res.content && res.content.map((r) => ({ ...r, _status: 'update' })),
          pcRebatePagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 刷新头信息和附件列表
   */
  @Bind()
  handleRefresh() {
    this.fetchHeader();
    this.handleFetchConfigAttachment();
  }

  /**
   * 查询配置的附件列表
   */
  @Bind()
  handleFetchConfigAttachment() {
    const { pcHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchPcAttachmentList',
      payload: pcHeaderId,
    }).then((templateList) => {
      if (templateList) {
        this.setState({
          templateList,
          templateListFlag: true,
        });
      }
    });
  }

  /**
   * 格式化时间
   * @param {*} [dataSource=[]] 数据数组
   * @param {*} [fields=[]] 字段数组
   */
  @Bind()
  formatTime(dataSource = [], fields = []) {
    if (isArray(dataSource)) {
      return dataSource.map((item) => {
        const newItem = {};
        fields.forEach((field) => {
          if (isString(item[field])) {
            newItem[field] = item[field];
          } else {
            newItem[field] = item[field]
              ? item.termType === 'DATE'
                ? item[field].format(DEFAULT_DATE_FORMAT)
                : item[field].format(DEFAULT_DATETIME_FORMAT)
              : undefined;
          }
        });
        return {
          ...item,
          ...newItem,
        };
      });
    }
  }

  @Bind()
  renderContractStage(contractStageListProps) {
    return <ContractStage {...contractStageListProps} />;
  }

  @Bind()
  renderContractBusinessTerms(contractBusinessTermsListProps) {
    return <ContractBusinessTerms {...contractBusinessTermsListProps} />;
  }

  /**
   * 格式化时间
   * @param {*} [dataSource=[]] 数据数组
   * @param {*} [fields=[]] 字段数组
   */
  @Bind()
  formatSubjectTime(dataSource = [], fields = []) {
    if (isArray(dataSource)) {
      return dataSource.map((item) => {
        const newItem = {};
        fields.forEach((field) => {
          newItem[field] = item[field]
            ? moment(item[field]).format(DEFAULT_DATE_FORMAT)
            : undefined;
        });
        return {
          ...item,
          ...newItem,
        };
      });
    }
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-maintain/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : null,
      })
    );
    const headerNode = document.querySelector(
      '#spcm-contract-maintain-detail-contract-header-information'
    );
    if (headerNode) {
      headerNode.scrollIntoView();
    }
    this.setState(
      {
        pcHeaderId,
      },
      () => {
        this.componentDidMount();
      }
    );
  }

  @Bind()
  async saveSubject(param) {
    const { dispatch, remote } = this.props;
    const {
      pcHeaderId,
      pcSubjectDataSource,
      headerInfo: { priceType },
    } = this.state;
    const pcSubjectDetailDTOList = await this.validateEditTableDataSource(
      pcSubjectDataSource,
      ['pcSubjectId'],
      { force: true },
      ['disableChangeRate']
    );
    /**
     * 由于数量这种decimal字段在数据库限制最大长度为10个整数+10个小数
     * 导致在压力测试下，不仅需要对单个字段做长度限制
     * 还要对累乘结果作判断；否则很容易超出数据库限制长度导致抛出异常信息
     */
    const maxMutiplyNum = pcSubjectDetailDTOList.reduce((total, item) => {
      const price = priceType === 'TAX_INCLUDED_PRICE' ? item.taxIncludedUnitPrice : item.unitPrice;
      return total + (item.quantity * price) / (item.unitPriceBatch || 1);
    }, 0);
    if (maxMutiplyNum > 99999999999999999999.9999999999) {
      notification.warning({
        message: intl
          .get(`spcm.common.view.message.title.new.maxMutiplyNum`)
          .d('【数量*含税单价】计算得出结果超出数据库长度【99999999999999999999.9999999999】！'),
      });
      return;
    }
    if (!isEmpty(pcSubjectDetailDTOList)) {
      const res = await remote?.event.fireEvent('handleSaveSubject', {
        currentState: this.state,
        eventProps: this.props,
        param,
        saveSubject: () =>
          dispatch({
            type: 'contractMaintain/saveSubject',
            payload: {
              pcHeaderId,
              ...this.formatSubjectTime(pcSubjectDetailDTOList, [
                'deliverDate',
                'priceEndDate',
                'priceStartDate',
              ]),
              customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
            },
          }),
      });
      if (res) {
        notification.success();
        this.removeDataFromStorage(); // 移除引用采购申请的标的缓存数据
        // 查询头信息
        dispatch({
          type: 'contractCommon/fetchHeader',
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
        }).then((headerInfo) => {
          if (remote?.event) {
            remote.event.fireEvent('handleCuxSaveSubject', {
              headerInfo,
              current: this,
            });
          }
          if (headerInfo) {
            this.setState({ headerInfo });
            dispatch({
              type: 'contractCommon/updateState',
              payload: {
                formChanged: false,
              },
            });
          }
        });
        this.fetchSubject();
      }
    }
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   * @param {Object} params 保存信息
   */
  @Bind()
  async save(params = {}, isSubmit, sourceKey) {
    const {
      dispatch,
      contractMaintain: {
        sourceResultDTOs,
        sourceRslQueryParams,
        createPurchaseOrderList = [],
        createPurchaseOrderInfo = {},
      },
    } = this.props;
    const {
      tenantId,
      headerInfo = {},
      pcHeaderId = headerInfo.pcHeaderId,
      itemKey,
      pcStageDataSource = [],
      pcSubjectDataSource = [],
    } = this.state;
    // const { editStep } = headerInfo;
    const formRef = get(this, 'headerRef.props.form');
    if (!formRef) {
      return;
    }
    const { defaultSupplierTenantId } = this.headerRef?.state?.defaultValues || {};
    if (
      formRef.getFieldValue('acceptType') === 'stage' &&
      isEmpty(pcStageDataSource) &&
      pcHeaderId
    ) {
      Modal.confirm({
        title: intl
          .get(`spcm.common.view.message.title.stageCannotSave`)
          .d('验收类型为按阶段验收时，协议阶段行不可为空'),
      });
      return;
    }

    if (
      formRef.getFieldValue('acceptType') === 'target' &&
      isEmpty(pcSubjectDataSource) &&
      pcHeaderId
    ) {
      Modal.confirm({
        title: intl
          .get(`spcm.common.view.message.title.targetCannotSave`)
          .d('验收类型为按标的验收时，协议标的行不可为空'),
      });
      return;
    }

    if (!formRef) {
      return;
    }
    const { isQuoteSource, quoteType } = this.state;
    // prSourceCode 有3种情况，为空=普通创建协议，
    // SEARCH_SOURCE_RESULT 我引用寻源 创建的协议
    // PURCHASE_NEED 我引用采购申请 创建的协议
    // PURCHASE_ORDER 引用采购订单 创建的协议
    // 注意： isQuoteSource 字段只能判断是否为 引用寻源 创建的协议
    let pcSourceCode = '';
    if (Number(isQuoteSource) === 1 && isNullOrUndefined(itemKey)) {
      pcSourceCode = 'SEARCH_SOURCE_RESULT';
    } else if (isNullOrUndefined(isQuoteSource) && !isNullOrUndefined(itemKey)) {
      pcSourceCode = 'PURCHASE_NEED';
    } else if (quoteType === 'PO') {
      pcSourceCode = 'PURCHASE_ORDER';
    }
    if (!pcHeaderId) {
      formRef.validateFieldsAndScroll({ force: true }, (errs, values) => {
        const { supplierId, supplierName, supplierCode } = createPurchaseOrderInfo || {};
        const purchaseOrderInfoObj =
          pcSourceCode === 'PURCHASE_ORDER'
            ? {
                supplierId,
                supplierName,
                supplierNum: supplierCode,
              }
            : {};
        if (!errs) {
          const { startDateActive, endDateActive, overseasProcurement, signEffectFlag } = values;
          const headerData = {
            supplierTenantId:
              pcSourceCode === 'PURCHASE_ORDER'
                ? createPurchaseOrderInfo.supplierTenantId
                : defaultSupplierTenantId,
            sourceResultDTOs,
            tenantId,
            ...purchaseOrderInfoObj,
            ...headerInfo,
            ...values,
            ...params,
            startDateActive: startDateActive
              ? moment(startDateActive).format(DEFAULT_DATETIME_FORMAT)
              : undefined,
            endDateActive: endDateActive
              ? moment(endDateActive).format(DEFAULT_DATETIME_FORMAT)
              : undefined,
            overseasProcurement: overseasProcurement ? 1 : 0,
            signEffectFlag: signEffectFlag ? 1 : 0,
            pcSourceCode,
            poLineLocationVOList: createPurchaseOrderList,
            supplierCompanyId:
              pcSourceCode === 'PURCHASE_ORDER'
                ? createPurchaseOrderInfo.supplierCompanyId
                : headerInfo.supplierCompanyId,
          };
          dispatch({
            type: 'contractMaintain/add',
            payload: {
              ...headerData,
              workbenchFlag: '0',
              customizeUnitCode:
                'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
              query: sourceRslQueryParams,
            },
          }).then((newHeaderInfo) => {
            if (newHeaderInfo) {
              this.setState({ headerInfo: newHeaderInfo, pcHeaderId: newHeaderInfo.pcHeaderId });

              const query = {
                pcHeaderId: newHeaderInfo.pcHeaderId,
              };
              if (itemKey) {
                query.itemKey = itemKey;
              }

              this.props.history.push({
                pathname: '/spcm/contract-maintain/detail',
                search: querystring.stringify(query),
              });
              // eslint-disable-next-line
              this.headerRef.props.form && this.headerRef.props.form.resetFields();
              this.fetchHeader().then(async () => {
                this.fetchPartner();
                this.fetchTerm();
                await this.fetchDefaultStage(); // 新建保存后查询阶段数据前端不做数据渲染，此操作是为了后端根据协议类型带出阶段数据入库
                await this.fetchStage(); // 新建保存后查询阶段数据
                /**
                 * 基于故事号srm-44163，前端在第一次保存时，根据当前协议类型内定义的阶段行信息
                 * 初始化生成阶段行序列
                 */
                // const {
                //   contractMaintain: { detailEnumMap = {} },
                // } = this.props;
                // const { stageOptions = [] } = detailEnumMap;
                // const stateSource = stageOptions.map((item) => {
                //   return {
                //     ...item,
                //     _status: 'update',
                //     pcStageId: item.pcStageId,
                //     edited: true,
                //     currencyCode: 'CNY',
                //     supplierCurrencyCode: item.supplierCurrencyCode,
                //     purchaseCurrencyCode: item.purchaseCurrencyCode,
                //     exchangeRate: item.exchangeRate,
                //     stageName: item.stageName,
                //     stageCode: item.stageCode,
                //     remark: item.remark,
                //     objectVersionNumber: item.objectVersionNumber,
                //   };
                // });
                // this.setState({
                //   pcStageDataSource: stateSource,
                //   pcStagePagination: createPagination(stateSource),
                // });
                notification.success();
              });
            }
          });
        }
      });
      return;
    }

    // if (editStep === 1) {
    //   Modal.confirm({
    //     title: intl.get(`${viewMessagePrompt}.newconfirmUpdate`).d('是否需要重新生成协议文本？'),
    //     okText: intl.get('hzero.common.status.yes').d('是'),
    //     cancelText: intl.get('hzero.common.status.no').d('否'),
    //     onOk: () => this.handleUpdateContract({ fileFlag: 1 }, 1),
    //     onCancel: () => this.handleUpdateContract({ fileFlag: 0 }, 0),
    //   });
    // } else {
    this.handleUpdateContract({}, 0, isSubmit, sourceKey);
    // }
  }

  // @Bind()
  // changeSourceLineNumToResultId(dataArr = []) {
  //   const arr = dataArr.map(item => ({
  //     ...item,
  //     sourceLineNum: item.resultId,
  //   }));
  //   return arr;
  // }

  /**
   * 更新协议
   * @param {Object} [params={}] 更细内容
   * @param {Number} [oldEditStep] 协议所处阶段 1重新刷新协议文本 0则不刷新
   * isSubmit 是TRUE代表，请求成功就提交
   */
  @Bind()
  handleUpdateContract(params = {}, oldEditStep, isSubmit, sourceKey) {
    const {
      tenantId,
      headerInfo = {},
      pcSubjectDataSource = [],
      pcStageDataSource = [],
      partnerDataSource = [],
      termDataSource = [],
      pcRebateDataSource = [],
      remote,
    } = this.state;
    const { dispatch } = this.props;
    const { priceType } = headerInfo;
    const typeName = pcStageDataSource.map((item) => {
      return item.typeName;
    });
    if (!this.headerRef?.props?.form) return;
    if (this.headerRef.props.form.getFieldValue('acceptType') === 'stage') {
      if (typeName.indexOf(null) !== -1) {
        notification.error({
          message: intl
            .get('spcm.common.view.message.title.stageContentNotComplete')
            .d('协议阶段相关内容未填写完整，请补充！'),
        });
        return;
      }
    }
    this.headerRef.props.form.validateFieldsAndScroll({ force: true }, async (errs, values) => {
      if (!errs) {
        // 文本模式，手动保存编辑文档
        // if (this.editorOnlineRef && isFunction(this.editorOnlineRef.saveDocument)) {
        //   await this.editorOnlineRef.saveDocument({ data: 'saveDocument' });
        // }
        Promise.all([
          this.validateEditTableDataSource(
            pcSubjectDataSource,
            ['pcSubjectId'],
            {
              force: true,
            },
            ['disableChangeRate']
          ),
          this.validateEditTableDataSource(pcStageDataSource, ['pcStageId'], {
            force: true,
          }),
          this.validateEditTableDataSource(partnerDataSource, ['partnerId'], {
            force: true,
          }),
          !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode)
            ? this.validateEditTableDataSource(termDataSource, ['termId'], { force: true })
            : Promise.resolve([]),
          headerInfo.rebateFlag
            ? this.validateEditTableDataSource(pcRebateDataSource, ['rebateInformationId'], {
                force: true,
              })
            : Promise.resolve([]),
        ]).then(
          ([
            pcSubjectDetailDTOList,
            pcStageDetailDTOList,
            pcPartnerDetailDTOList,
            pcTermDetailDTOList = [],
            pcRebateInformationlist = [],
          ]) => {
            const { startDateActive, endDateActive, overseasProcurement, signEffectFlag } = values;
            const headerData = {
              tenantId,
              ...values,
              ...params,
              startDateActive: startDateActive
                ? moment(startDateActive).format(DEFAULT_DATETIME_FORMAT)
                : undefined,
              endDateActive: endDateActive
                ? moment(endDateActive).format(DEFAULT_DATETIME_FORMAT)
                : undefined,
              overseasProcurement: overseasProcurement ? 1 : 0,
              signEffectFlag: signEffectFlag ? 1 : 0,
            };
            /**
             * 由于数量这种decimal字段在数据库限制最大长度为10个整数+10个小数
             * 导致在压力测试下，不仅需要对单个字段做长度限制
             * 还要对累乘结果作判断；否则很容易超出数据库限制长度导致抛出异常信息
             */
            const maxMutiplyNum = pcSubjectDetailDTOList.reduce((total, item) => {
              const price =
                priceType === 'TAX_INCLUDED_PRICE' ? item.taxIncludedUnitPrice : item.unitPrice;
              return total + (item.quantity * price) / (item.unitPriceBatch || 1);
            }, 0);
            if (maxMutiplyNum > 99999999999999999999.9999999999) {
              notification.warning({
                message: intl
                  .get(`spcm.common.view.message.title.new.maxMutiplyNum`)
                  .d(
                    '【数量*含税单价】计算得出结果超出数据库长度【99999999999999999999.9999999999】！'
                  ),
              });
              return;
            }
            /**
             * 由于阶段行上的付款比例和原币费用跟协议总额相关联，而协议总额的更新受制于协议标的行上相关字段
             * 后者在更新较为滞后（需要保存单据或者删除标的行时才会在服务端进行相关计算）
             * 因此，需要校验一下协议标的行上相关字段是否为0（直接校验相关字段是否为0比copy服务端相关计算逻辑更便捷，后者计算逻辑比较庞大）；
             * 若不为0，则需要将协议阶段行上的付款比例和原币费用置为0（srm-17314的需求）
             */
            // const notZero = pcSubjectDetailDTOList.some((item) => {
            //   const { quantity, taxIncludedUnitPrice, unitPrice } = item;
            //   return (
            //     (Number(taxIncludedUnitPrice) !== 0 || // 原币含税单价
            //       Number(unitPrice) !== 0) && // 原币不含税单价
            //     ![
            //       Number(quantity), // 数量
            //     ].includes(0)
            //   );
            // });
            // // !notZero意味着协议标的行上要么没数据，要么数据汇总得到的协议总额为0
            // let pcStageDTOList = pcStageDetailDTOList;
            // if (!notZero) {
            //   pcStageDTOList = pcStageDetailDTOList.map((item) => {
            //     return {
            //       ...item,
            //       // payRatio: 0,
            //       costQuantity: 0,
            //     };
            //   });
            // }
            dispatch({
              type: 'contractMaintain/update',
              payload: {
                ...headerInfo,
                ...headerData,
                supplierCompanyId: headerInfo.supplierCompanyId,
                mainContractId: headerData.mainContractId,
                pcPartnerDetailDTOList,
                pcSubjectDetailDTOList: this.formatSubjectTime(pcSubjectDetailDTOList, [
                  'deliverDate',
                  'priceEndDate',
                  'priceStartDate',
                ]),
                pcStageDetailDTOList: this.formatTime(pcStageDetailDTOList, ['milestoneTime']), // 这里待修改
                pcTermDetailDTOList: [
                  ...pcTermDetailDTOList.filter(
                    (item) => !['DATE', 'DATETIME'].includes(item.termType)
                  ),
                  ...this.formatTime(
                    pcTermDetailDTOList.filter((item) =>
                      ['DATE', 'DATETIME'].includes(item.termType)
                    ),
                    ['termContent']
                  ),
                ],
                pcRebateInformationlist: this.formatTime(pcRebateInformationlist, [
                  'validityDateFrom',
                  'validityDateTo',
                ]),
                customizeUnitCode:
                  'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
              },
            }).then((res) => {
              if (res) {
                this.removeDataFromStorage(); // 移除引用采购申请的标的缓存数据
                if (sourceKey === 'aiApprove') {
                  this.handleAiCheck();
                }
                if (isSubmit) {
                  // 提交保存一次
                  setTimeout(() => {
                    this.submit();
                  }, 0);
                  return null;
                }
                notification.success();
                this.headerRef.props.form.resetFields();
                this.fetchHeader().then(() => {
                  if (remote?.event) {
                    remote.event.fireEvent('handleCuxUpdateAll', {
                      headerInfo: this.state.headerInfo,
                      current: this,
                    });
                  }
                  if (oldEditStep === 1) {
                    const n = document.querySelector(
                      `a[href="#spcm-contract-maintain-detail-contract-online-edit"]`
                    );
                    // 由于首次不渲染在线编辑组件而是在弹窗中渲染，所以此处无值，无需重新请求
                    // if (pcHeaderId && editStep === 1 && !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(pcKindCode)) {
                    //   this.editorOnlineRef.fetchEditorOnlineHTML();
                    // }
                    if (n) n.click();
                  }
                });
                this.fetchList();
                partnerDataSource.forEach((i) => i.$form?.resetFields());
                pcStageDataSource.forEach((i) => i.$form && i.$form.resetFields()); // 此处需要判断一下，由于页面初始化时协议阶段行默认不渲染，以至于没有$form属性
                dispatch({
                  type: 'contractCommon/updateState',
                  payload: {
                    formChanged: false,
                  },
                });
              }
            });
          }
        );
      }
    });
  }

  /**
   * 更新头上的协议文本类型附件url
   * @param {Object} headerInfo 头信息
   */
  @Bind()
  handleUpdateContractTextUrl(headerInfo) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractMaintain/updateContractTextUrl',
      payload: headerInfo,
    });
  }

  // ai审核
  @Bind()
  handleAiCheck() {
    const { pcHeaderId } = this.state;
    // 执行审查
    const payload = {
      headerDataId: pcHeaderId,
    };
    this.setState({ aiCheckLoading: true });
    executeAiApprove(payload)
      .then((res) => {
        if (getResponse(res)) {
          this.setState({ disableAiApproveBtn: true, resultStatus: 'APPROVING' });
          this.rollingFetchAiResult();
        } else {
          this.setState({ disableAiApproveBtn: false });
        }
      })
      .finally(() => {
        this.setState({ aiCheckLoading: false });
      });
  }

  // 轮询查询ai预审结果
  @Bind()
  rollingFetchAiResult() {
    this.clearAIResultTimer();
    this.aiResultTimer = setInterval(() => {
      this.fetchAiApproveResult();
    }, 10000);
  }

  // 查询ai预审结果
  @Bind()
  fetchAiApproveResult() {
    const { pcHeaderId } = this.state;
    const payload = {
      headerDataId: pcHeaderId,
    };
    queryAiApproveResult(payload).then((res) => {
      if (getResponse(res)) {
        const { result: resultStatus, aiApproveResultQueryDTOList } = res;
        let disableAiApproveBtn = true;
        // 进行中，还需要继续等待结果， 其它状态表示已经拿到结果
        if (!resultStatus || (resultStatus && resultStatus !== 'APPROVING')) {
          this.clearAIResultTimer();
          disableAiApproveBtn = false;
        }
        this.setState({
          disableAiApproveBtn,
          aiApproveReslultParams: aiApproveResultQueryDTOList,
          resultStatus,
        });
      } else {
        // 后端接口报错也清空定时器
        this.clearAIResultTimer();
      }
    });
  }

  // 清空定时器
  @Bind()
  clearAIResultTimer() {
    if (this.aiResultTimer) {
      clearInterval(this.aiResultTimer);
      this.aiResultTimer = null;
    }
  }

  /**
   * 行内校验
   * @param {Array} [dataSource=[]] 数据源
   * @param {Array} [excludeKeys=[]] 排除新建行的字段
   * @param {Object} [property={}] 校验API的options
   * @param {Object} [deleteKeys={}] 删除不需要的字段
   */
  @Bind()
  async validateEditTableDataSource(
    dataSource = [],
    excludeKeys = [],
    property = {},
    deleteKeys = []
  ) {
    if (dataSource.length === 0) {
      return dataSource;
    }
    if (dataSource.length > 0 && !dataSource[0].$form) {
      return dataSource;
    }
    return new Promise((resolve, reject) => {
      let validateDataSource = getEditTableData(dataSource, excludeKeys, property);
      validateDataSource = map(validateDataSource, (o) => omit(o, deleteKeys));
      if (validateDataSource.length === 0) {
        reject();
        if (excludeKeys.every((item) => item === 'pcSubjectId')) {
          notification.error({
            message: intl
              .get('spcm.common.view.message.title.targetCannotSave2')
              .d('请检查协议标的行填写内容'),
          });
        }
        if (excludeKeys.every((item) => item === 'pcStageId')) {
          notification.error({
            message: intl
              .get('spcm.common.view.message.title.stageCannotSave2')
              .d('协议阶段行必填内容未填写完整'),
          });
        }
      } else {
        resolve(validateDataSource);
      }
    });
  }

  /**
   * 提交的时候校验头上附件必输
   */
  @Bind()
  attachmentRequiredCheck() {
    const { headerInfo = {}, templateList = [] } = this.state;
    const msg = [];
    templateList.forEach((item) => {
      if (item.nullableFlag === 0 && !item.supAttachmentFlag && !item.attachmentUrl) {
        msg.push(item.attachmentTypeName);
      }
    });
    if (
      ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
      !headerInfo.contractAttachmentUrl
    ) {
      msg.push(intl.get(`spcm.common.view.message.title.contractAttachment`).d('协议文本'));
    }
    if (msg.length > 0) {
      notification.warning({
        message: `${intl.get('hzero.common.validation.notNull', {
          name: msg.join(','),
        })},${intl
          .get('spcm.common.model.common.upContractWithUpload')
          .d('请通过【附件上传】上传协议文本。')}`,
      });
      return null;
    } else {
      return 1;
    }
  }

  /**
   * preSubmit - 提交采购协议前置modal弹窗
   */
  @Bind()
  preSubmit() {
    const { partnerDataSource, headerInfo } = this.state;
    if (partnerDataSource.length > 0) {
      this.submit('save');
    } else if (headerInfo.attributeVarchar13 !== 'SRM-HYGY') {
      // 兼容性处理
      notification.warning({
        message: intl
          .get(`spcm.common.view.message.title.mustMaintainPartnerLine`)
          .d('该采购协议未维护合伙伙伴行信息，无法提交'),
      });
    } else {
      this.submit('save');
    }
  }

  /**
   * submit - 采购申请提交
   */
  @Bind()
  submit(key) {
    const { remote } = this.props;
    const {
      headerInfo = {},
      pcSubjectDataSource = [],
      pcStageDataSource = [],
      partnerDataSource = [],
      termDataSource = [],
      pcRebateDataSource = [],
    } = this.state;
    const {
      pcHeaderId,
      pcStatusCode,
      supplementFlag,
      mainContractId,
      version,
      pcNum,
      mainPcNum,
      payPlanNum,
      pcKindCode,
    } = headerInfo;
    let pcStatusFlag;
    if (supplementFlag) {
      pcStatusFlag = 3;
    } else if (!supplementFlag && mainContractId && version > 1) {
      pcStatusFlag = 1;
    } else if (['PENDING', 'REJECTED', 'SUPPLIER_REJECTED'].includes(pcStatusCode)) {
      pcStatusFlag = 0;
    } else {
      pcStatusFlag = 2;
    }
    const data = {
      pcHeaderId,
      pcNum,
      mainPcNum: supplementFlag ? mainPcNum : null,
      pcStatusFlag, // 协议状态标识(0新建&审批拒绝&拒绝生效/1变更协议/2生效和其他状态/3补充协议)
    };
    if (this.headerRef?.props?.form) {
      this.headerRef.props.form.validateFieldsAndScroll({ force: true }, (errs, values) => {
        if (!errs) {
          Promise.all([
            this.validateEditTableDataSource(
              pcSubjectDataSource,
              ['pcSubjectId'],
              {
                force: true,
              },
              ['disableChangeRate']
            ),
            this.validateEditTableDataSource(partnerDataSource, ['partnerId'], {
              force: true,
            }),
            !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode)
              ? this.validateEditTableDataSource(termDataSource, ['termId'], { force: true })
              : Promise.resolve([]),
            headerInfo.rebateFlag
              ? this.validateEditTableDataSource(pcRebateDataSource, ['rebateInformationId'], {
                  force: true,
                })
              : Promise.resolve([]),
          ]).then(async () => {
            if (remote?.event) {
              const res = await remote.event.fireEvent('handleCuxPreSubmit', {
                current: this,
                key,
              });
              if (!res) {
                return;
              }
            }
            if (this.attachmentRequiredCheck()) {
              if (key === 'save') {
                // 提交前再保存
                setTimeout(() => {
                  this.save({}, true);
                });
                return null;
              }
              const validateBudgetFlag = await preSubmitValidBudget([
                {
                  pcHeaderId,
                },
              ]);
              if (!validateBudgetFlag) {
                this.fetchHeader();
                this.fetchList();
                return null;
              }
              // 查询业务规则定义-【协议生成付款计划】
              const paymentPlanFlag =
                !supplementFlag &&
                (getResponse(
                  await createPaymentPlan({
                    pcHeaderId,
                  })
                ) ||
                  0);
              // 有付款计划：调用
              // 无付款计划：业务规则=是&原协议&有阶段&协议性质不等于非系统供应商 -调用
              if (payPlanNum || (paymentPlanFlag && !supplementFlag)) {
                if (pcStageDataSource?.length > 0 && pcKindCode !== 'NOT_SYS_SUPPLIER') {
                  // 补充协议的时候要预校验提交内容,预提交校验通过之后才允许走弹框打开规则
                  const preValid =
                    supplementFlag &&
                    !getResponse(
                      await preSubmitValid({
                        pcHeaderId,
                      })
                    );
                  if (preValid) {
                    this.fetchHeader();
                    this.fetchList();
                    return false;
                  }
                  return openTermsModal(
                    {
                      type: 'submit',
                      record: headerInfo,
                      afterOk: () => this.finalSubmit(values),
                      onCancel: () => {
                        this.fetchHeader();
                        this.fetchList();
                      },
                    },
                    data
                  );
                } else {
                  Modal.confirm({
                    title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
                    content: intl
                      .get(`spcm.common.view.message.msg.paymentPlan.confirm`)
                      .d(
                        '协议性质为非系统供应商合同或协议阶段为空时，无法生成付款计划，是否确认提交？'
                      ),
                    onOk: () => this.finalSubmit(values),
                    onCancel: () => {
                      this.fetchHeader();
                      this.fetchList();
                    },
                  });
                }
              } else {
                return this.finalSubmit(values);
              }
            }
          });
        }
      });
    }
  }

  /**
   * finalSubmit - 最终提交submit
   */
  @Bind()
  finalSubmit(values) {
    const { dispatch, remote } = this.props;
    const {
      headerInfo = {},
      partnerDataSource = [],
      isQuoteSource,
      itemKey,
      pcStageDataSource = [],
    } = this.state;
    // pcSourceCode 有3种情况，为空=普通创建协议，
    // SEARCH_SOURCE_RESULT 我引用寻源 创建的协议
    // PURCHASE_NEED 我引用采购申请 创建的协议
    // 注意： isQuoteSource 字段只能判断是否为 引用寻源 创建的协议
    let pcSourceCode = '';
    if (Number(isQuoteSource) === 1 && isNullOrUndefined(itemKey)) {
      pcSourceCode = 'SEARCH_SOURCE_RESULT';
    } else if (isNullOrUndefined(isQuoteSource) && !isNullOrUndefined(itemKey)) {
      pcSourceCode = 'PURCHASE_NEED';
    }
    const { startDateActive, endDateActive, overseasProcurement, signEffectFlag } = merge(
      {},
      headerInfo,
      values
    );
    const { pcHeaderIdSet, ...pcHeader } = {
      ...headerInfo,
      ...values,
      startDateActive: startDateActive
        ? moment(startDateActive).format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      endDateActive: endDateActive
        ? moment(endDateActive).format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      overseasProcurement: overseasProcurement ? 1 : 0,
      signEffectFlag: signEffectFlag ? 1 : 0,
      pcSourceCode,
      supplierCompanyId:
        headerInfo.supplierCompanyId === headerInfo.supplierCompanyName
          ? null
          : headerInfo.supplierCompanyId, // 修复提交供应商supplierCompanyId传值问题
    };
    dispatch({
      type: 'contractMaintain/submit',
      payload: {
        pcHeaderList: [omit(pcHeader, ['insertPcStageList'])],
        customizeUnitCode:
          'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
      },
    }).then(async (res) => {
      if (res) {
        notification.success();
        if (remote?.event) {
          const res = await remote.event.fireEvent('handleCuxAfterSubmit', {
            handleHeaderQuery: this.handleHeaderQuery,
            goToList: this.goToList,
            handleCuxLoading: this.handleCuxLoading,
          });
          if (!res) {
            return;
          }
        }
        this.goToList();
      } else {
        this.headerRef.props.form.resetFields();
        this.removeDataFromStorage(); // 移除引用采购申请的标的缓存数据
        this.fetchHeader();
        this.fetchList();
        partnerDataSource.forEach((i) => i.$form?.resetFields());
        pcStageDataSource.forEach((i) => i.$form && i.$form.resetFields()); // 此处需要判断一下，由于页面初始化时协议阶段行默认不渲染，以至于没有$form属性
      }
    });
  }

  /**
   * 返回列表
   */
  @Bind()
  goToList() {
    this.props.history.push('/spcm/contract-maintain/list');
  }

  // 二开loading
  @Bind()
  handleCuxLoading(flag = false) {
    this.setState({
      cuxQueryLoading: flag,
    });
  }

  // 单独头查询
  @Bind()
  handleHeaderQuery() {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    return dispatch({
      type: 'contractCommon/fetchHeader',
      pcHeaderId,
      customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
    });
  }

  /**
   * delete 删除采购申请
   */
  @Bind()
  delete() {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.common.view.message.title.confirmDelete`).d('是否删除'),
      onOk: () => {
        dispatch({
          type: 'contractMaintain/delete',
          payload: [headerInfo],
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-maintain/list`,
              })
            );
          }
        });
      },
    });
  }

  // 通过本币和原币查询带出汇率;
  @Bind()
  async handleChangeTaxRate(currencyProps, type) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    const fromCurrencyCode =
      type === 'pcSubject' ? currencyProps.currencyCode : currencyProps.supplierCurrencyCode;
    const toCurrencyCode = currencyProps.purchaseCurrencyCode;
    if (fromCurrencyCode === toCurrencyCode) {
      Object.assign(currencyProps, { exchangeRate: 1 });
    } else if (fromCurrencyCode && toCurrencyCode) {
      const res = await dispatch({
        type: 'contractCommon/fetchExRate',
        payload: {
          tenantId,
          fromCurrencyCode,
          toCurrencyCode,
          rateDate: moment(new Date()).format(DEFAULT_DATE_FORMAT),
        },
      });
      let exchangeRate = null;
      let disableChangeRate = false;
      if (res && res.length === 1) {
        exchangeRate = res[0].rate;
        disableChangeRate = res[0].rateMethodCode === 'FR';
      }
      Object.assign(currencyProps, { exchangeRate, disableChangeRate });
    }
    this.pcStageCurrency = currencyProps;
  }

  @Bind()
  async handleCurrencyCode(currencyProps, type) {
    // 协议阶段和协议标的币种处理
    /* 协议来源=手工新建/采购申请 标的&阶段行【原币币种】优先取页面个性化【原币币种】默认值，
    如果无默认值配置，则走当前代码逻辑（供应商公司缺省币种作为默认值） */
    const {
      headerInfo: { supplierCurrencyCode = 'CNY', purchaseCurrencyCode = 'CNY' },
      pcSubjectDataSource,
    } = this.state;
    const formData = pcSubjectDataSource[0] || {};
    // // 优先默认用标的第一行标的的原币币种作为默认值
    const { currencyCode, purchaseCurrencyCode: subjectSCurrencyCode } =
      formData?.$form?.getFieldsValue() || {};
    if (
      this.pcStageCurrency &&
      this.pcStageCurrency.supplierCurrencyCode === currencyCode &&
      this.pcStageCurrency.purchaseCurrencyCode === subjectSCurrencyCode
    ) {
      Object.assign(currencyProps, this.pcStageCurrency);
      return false;
    }
    const sCurrencyCode =
      currencyProps.supplierCurrencyCode ||
      getCustByFieldCode(this.props.custConfig, oldUnitCodeList.STAGE, 'supplierCurrencyCode')
        .defaultValueMeaning; // 原币
    const pCurrencyCode =
      currencyProps.purchaseCurrencyCode ||
      getCustByFieldCode(this.props.custConfig, oldUnitCodeList.STAGE, 'purchaseCurrencyCode')
        .defaultValueMeaning; // 本币
    const pcStageCurrency = {
      supplierCurrencyCode: currencyCode || sCurrencyCode || supplierCurrencyCode,
      purchaseCurrencyCode: subjectSCurrencyCode || pCurrencyCode || purchaseCurrencyCode,
    };
    Object.assign(currencyProps, pcStageCurrency);
    await this.handleChangeTaxRate(currencyProps, type);
  }

  /**
   * handleAddLines - 新增行
   * @param {String} key - 新增对应的行数据
   * @param {Boolean} isOrder - 是否顺序插入新增行，默认为false（因原逻辑是倒序插入新增行）
   * @override 海量
   */
  @Bind()
  async handleAddLines(key, isOrder) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const rowKey = `${key}Id`;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      headerInfo: {
        supplierCurrencyCode = 'CNY',
        purchaseCurrencyCode = 'CNY',
        startDateActive = undefined,
        endDateActive = undefined,
        signEffectFlag,
        priceType,
      },
    } = this.state;
    let currencyProps = {
      currencyCode: supplierCurrencyCode,
      supplierCurrencyCode,
      purchaseCurrencyCode,
      priceType,
    };
    if (key === 'pcStage') {
      currencyProps = { priceType };
      const flag = getCustByFieldCode(this.props.custConfig, oldUnitCodeList.STAGE, 'typeName')
        .defaultValueMeaning;
      // 个性化没给付款方式配置默认值时调用接口取默认值。
      if (!flag) {
        if (!this.masterDefault) {
          this.masterDefault = await getMasterDefaults();
        }
        if (getResponse(this.masterDefault)) {
          const { typeId, typeCode, typeName } = this.masterDefault || {};
          Object.assign(currencyProps, { typeId, typeCode, typeName });
        } else {
          this.masterDefault = null;
        }
      }
      await this.handleCurrencyCode(currencyProps, key);
    }
    if (signEffectFlag === 0) {
      currencyProps.priceStartDate =
        startDateActive && moment(startDateActive).format(DEFAULT_DATE_FORMAT);
      currencyProps.priceEndDate =
        endDateActive && moment(endDateActive).format(DEFAULT_DATE_FORMAT);
    }
    const newItem = { _status: 'create', [rowKey]: uuid(), edited: true, ...currencyProps };
    const params = {
      [sourceField]: isOrder ? [...dataSource, newItem] : [newItem, ...dataSource],
      [paginationField]: addItemToPagination(dataSource.length, pagination),
    };
    this.setState({ ...params });
  }

  /**
   * addLines - 新增标的行
   * @overide 海亮
   */
  @Bind()
  addSubjectLines(selectedListRows) {
    const {
      pcSubjectDataSource,
      pcSubjectPagination,
      headerInfo: { supplierCurrencyCode = 'CNY', purchaseCurrencyCode = 'CNY' },
    } = this.state;
    this.setState({
      pcSubjectDataSource: [
        ...pcSubjectDataSource,
        ...selectedListRows.map((n) => ({
          ...n,
          _status: 'create',
          edited: true,
          sourceCode: n.sourceNum || n.prNum, // sourceCode取寻源或者是需求的号码
          deliverDate:
            (n.deliverDate && moment(n.deliverDate).format(DEFAULT_DATE_FORMAT)) ||
            (n.neededDate && moment(n.neededDate).format(DEFAULT_DATE_FORMAT)),
          neededDate: n.neededDate && moment(n.neededDate).format(DEFAULT_DATE_FORMAT),
          quantity: isNumber(n.availableQuantity) ? n.availableQuantity : n.quantity,
          secondaryQuantity: isNumber(n.secondaryAvailableQuantity)
            ? n.secondaryAvailableQuantity
            : n.secondaryQuantity,
          lineNum: '',
          sourceLineNum: this.isQuoteSourceFlag() ? n.itemNum : n.itemNum || n.lineNum,
          pcSubjectId: uuid(),
          currencyCode: n.currencyCode || supplierCurrencyCode,
          purchaseCurrencyCode: n.purchaseCurrencyCode || purchaseCurrencyCode,
          prLineNum: n.lineNum,
          unitPriceBatch: n.priceBatchQuantity || n.unitPriceBatch,
          exchangeRate: n.exchangeRate,
          //  priceShieldFlag: undefined,
          // poLineLocationDeleteFlag: undefined,
          //  tmpOrganizationId: n.invOrganizationId,
          //  enteredTaxIncludedPrice: n.taxIncludedUnitPrice || null,
        })),
      ],
      pcSubjectPagination: addItemsToPagination(
        selectedListRows.length,
        pcSubjectDataSource.length,
        pcSubjectPagination
      ),
      pcSubjectEdited: true,
    });
  }

  /**
   * handleAddLines - 新增业务条款行
   * @param {String} key - 新增对应的行数据
   * @param {Boolean} isOrder - 是否顺序插入新增行，默认为false（因原逻辑是倒序插入新增行）
   * @override 海量
   */
  @Bind()
  async handleAddTerm(key, dataList = []) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const rowKey = `${key}Id`;
    const { [sourceField]: dataSource = [], [paginationField]: pagination = {} } = this.state;
    const newData = dataList.map((data) => {
      const {
        termTypeCode,
        termTypeName,
        termContentDefault: termContent,
        remark,
        termType,
        termTypeLov,
        termTypeId,
        termTypeList,
        nullableFlag,
      } = data || {};
      const record = {
        termTypeCode,
        termTypeName,
        termContent,
        remark,
        termType,
        termTypeLov,
        termTypeId,
        termTypeList,
        nullableFlag,
      };
      return { _status: 'create', [rowKey]: uuid(), edited: true, ...record };
    });

    const params = {
      [sourceField]: [...newData, ...dataSource],
      [paginationField]: addItemToPagination(dataSource.length, pagination),
    };
    this.setState({ ...params });
  }

  /**
   * handleDeleteLines - 删除采购申请行
   */
  @Bind()
  handleDeleteLines(key, primaryKey, model = 'contractMaintain') {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const selectedField = `${key}SelectedRows`;
    const actionField = `${key}LinesDelete`;
    const rowKey = primaryKey || `${key}Id`;
    const { dispatch } = this.props;
    const {
      pcHeaderId,
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      [selectedField]: selectedRows = [],
    } = this.state;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`spcm.common.view.message.title.confirmDelete`).d('是否删除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map((n) => n[rowKey]);
        dataSource.forEach((item) => {
          if (!selectedRowKeys.includes(item[rowKey])) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          const editedData = dataSource.filter((item) => item.edited);
          if (!this.checkModified(key, selectedRows, dataSource) || editedData.length > 0) {
            Modal.confirm({
              title: intl
                .get(`spcm.common.view.message.title.lostData`)
                .d('存在未保存数据，继续将导致数据丢失，是否继续'),
              onOk: () => {
                dispatch({
                  type: `${model}/${actionField}`,
                  payload: {
                    pcHeaderId,
                    body: deleteList,
                  },
                }).then((res) => {
                  if (res) {
                    if (res) {
                      this.setState({ [selectedField]: [] });
                      notification.success();
                      this.deleteFresh(key);
                    }
                  }
                });
              },
            });
          } else {
            dispatch({
              type: `${model}/${actionField}`,
              payload: {
                pcHeaderId,
                body: deleteList,
              },
            }).then((res) => {
              if (res) {
                if (res) {
                  this.setState({ [selectedField]: [] });
                  notification.success();
                  this.deleteFresh(key);
                }
              }
            });
          }
        } else {
          this.setState({
            [sourceField]: newDataSource,
            [paginationField]: delItemsToPagination(
              selectedRows.length,
              dataSource.length,
              pagination
            ),
          });
          this.setState({ [selectedField]: [] });
        }
      },
    });
  }

  /**
   * 删除后刷新
   */
  @Bind()
  deleteFresh(key) {
    switch (key) {
      case 'partner':
        this.fetchPartner();
        break;
      case 'pcStage':
        this.fetchStage();
        break;
      case 'pcRebate':
        this.fetchContractRebate();
        break;
      case 'term':
        this.fetchTerm();
        break;
      default:
        this.fetchHeader();
        this.fetchList();
        break;
    }
  }

  /**
   * 检查是否有非本条外的项修改过
   * @param {*} key
   * @param {*} selectedRows
   * @param {*} dataSource
   */
  @Bind()
  checkModified(key) {
    // 如果是删除当前列表，则判断删除条数是否等于总条数，不是则提示
    // 如果删除的不是当前已修改列表，则提示
    /**
     * key: ['pcSubject', 'partner']
     * headerEdited: false, // 头是否编辑过
      pcSubjectEdited: false,
      partnerEdited: false,
     */
    const { headerEdited, pcSubjectEdited, pcStageEdited, partnerEdited } = this.state;
    if (
      key === 'pcSubject' &&
      !headerEdited &&
      !partnerEdited
      // selectedRows.length >= dataSource.length
    ) {
      return 1;
    } else if (
      key === 'partner' &&
      !headerEdited &&
      !pcSubjectEdited &&
      !pcStageEdited
      // selectedRows.length >=
      //   dataSource.filter(i => i._status === 'update' && i.predefinedFlag !== 1).length
    ) {
      return 1;
    } else if (key === 'ladderQuote') {
      return 1;
    } else if (key === 'term') {
      return 1;
    } else {
      return null;
    }
  }

  /**
   * 修改行数据
   * @param {Array} listDataSource
   */
  @Bind()
  handleChangeList(listDataSource) {
    this.setState(listDataSource);
  }

  /**
   * 修改头数据
   * @param {*} headerInfo
   */
  @Bind()
  handleChangeHeader(headerInfo, changeType) {
    const {
      pcSubjectDataSource,
      pcStageDataSource,
      partnerDataSource,
      pcRebateDataSource,
    } = this.state;
    const {
      contractMaintain: { detailEnumMap = {} },
    } = this.props;
    const {
      purchaseAgentEmail = null,
      supplierCurrencyCode = null,
      purchaseAgentName = null,
      purchaseAgentPhone = null,
      purchaseAgentFax = null,
      startDateActive = null,
      endDateActive = null,
      pcKindCode,
      companyId,
    } = headerInfo;
    const { partnerTypes = [] } = detailEnumMap;

    const formatStartDate = startDateActive && moment(startDateActive).format(DEFAULT_DATE_FORMAT);
    const formatEndDate = endDateActive && moment(endDateActive).format(DEFAULT_DATE_FORMAT);

    const changeState = {
      headerInfo,
    };

    // 选择采购员后，需要将采购员的联系人信息更新到下方的采购协议伙伴信息行上去
    if (changeType === 'changeAgent') {
      changeState.partnerDataSource = partnerDataSource.map((item) => {
        const partnerInfo =
          partnerTypes.find((pType) => {
            return (
              pType.partnerTypeId ===
              (item?.$form?.getFieldValue('partnerTypeId') || item.partnerTypeId)
            );
          }) || {};
        // contactMethodCode=DEFAULT/null/undefined且是采购方或者公司编码等于头上的公司编码
        const isAgent =
          (partnerInfo.defaultRoleFlag === '1' ||
            (partnerInfo.defaultRoleFlag !== '0' && item.companyId === companyId)) &&
          (isNil(partnerInfo.contactMethodCode) || partnerInfo.contactMethodCode == 'DEFAULT');
        return isAgent
          ? {
              ...item,
              mail: purchaseAgentEmail,
              contacts: purchaseAgentName,
              telNum: purchaseAgentPhone,
              faxes: purchaseAgentFax,
            }
          : item;
      });
    } else if (changeType === 'supplier') {
      Object.assign(changeState, {
        pcSubjectDataSource: pcSubjectDataSource.map((ele) => ({
          ...ele,
          currencyCode: supplierCurrencyCode || ele.currencyCode || 'CNY',
        })),
        pcStageDataSource: pcStageDataSource.map((ele) => ({
          ...ele,
          supplierCurrencyCode: supplierCurrencyCode || ele.supplierCurrencyCode || 'CNY',
        })),
      });
    } else if (changeType === 'ContractDate') {
      Object.assign(changeState, {
        pcSubjectDataSource: pcSubjectDataSource.map((ele) =>
          ele._status === 'create'
            ? {
                ...ele,
                // 这行代码存在不合理，引用单据创建的新建一行标的，再修改起始/终止日期的时候，原币币种会被头上币种覆盖。
                // currencyCode: supplierCurrencyCode || ele.currencyCode || 'CNY',
                priceStartDate: formatStartDate,
                priceEndDate: formatEndDate,
              }
            : ele
        ),
        pcRebateDataSource: pcRebateDataSource.map((ele) =>
          ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(pcKindCode) &&
          ele._status === 'create'
            ? {
                ...ele,
                validityDateFrom: formatStartDate,
                validityDateTo: formatEndDate,
              }
            : ele
        ),
      });
    } else if (changeType === 'ouId') {
      Object.assign(changeState, {
        pcSubjectDataSource: pcSubjectDataSource.map((ele) => {
          if (ele && ele.$form) {
            ele.$form.setFieldsValue({
              invOrganizationId: null,
              invOrganizationName: null,
            });
          }
          return {
            ...ele,
            invOrganizationId: null,
            invOrganizationName: null,
          };
        }),
      });
    }

    this.setState(changeState);
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 改变模态框显示状态
   * @param {String} modalVisible 字段
   * @param {Boolean} flag 值
   * @param {Object} [otherParams={}] 其他参数
   */
  @Bind()
  @Debounce(500)
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * getParent-获取 dom 的parent
   * @param {HTMLElement} dom
   */
  @Bind()
  getParent(dom) {
    const parent = dom && dom.parentNode.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  }

  /**
   * getAffixContainer-获取给 Affix 组件使用的元素
   * @return {HTMLElement}
   */
  @Bind()
  getAffixContainer() {
    const parent = this.getParent(
      document.getElementById('spcm-contract-maintain-detail-content-inner-wrapper')
    );
    return parent || document.body;
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys 选中的主键
   * @param {Array} selectedRows 选中的行
   * @param {String} field 字段前缀
   */
  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows, field) {
    this.setState({
      [`${field}SelectedRows`]: selectedRows,
    });
  }

  /**
   * 改变标的信息分页前的回调
   */
  @Bind()
  handlePreSearchPcSubject(page) {
    const { headerEdited, pcSubjectEdited, partnerEdited, termEdited, pcRebateEdited } = this.state;
    const edited = headerEdited || pcSubjectEdited || partnerEdited || termEdited || pcRebateEdited;
    if (edited) {
      Modal.confirm({
        title: intl
          .get(`spcm.common.view.message.title.lostData`)
          .d('存在未保存数据，继续将导致数据丢失，是否继续'),
        onOk: () => this.fetchSubject(page),
        onCancel: () => this.forceUpdate(),
      });
    } else {
      this.fetchSubject(page);
    }
  }

  /**
   * 改变 阶段信息 分页前的回调
   */
  @Bind()
  handlePreSearchPcStage(page) {
    const { headerEdited, pcStageEdited, partnerEdited, termEdited, pcRebateEdited } = this.state;
    const edited = headerEdited || pcStageEdited || partnerEdited || termEdited || pcRebateEdited;
    if (edited) {
      Modal.confirm({
        title: intl
          .get(`spcm.common.view.message.title.lostData`)
          .d('存在未保存数据，继续将导致数据丢失，是否继续'),
        onOk: () => this.fetchStage(page),
        onCancel: () => this.forceUpdate(),
      });
    } else {
      this.fetchStage(page);
    }
  }

  /**
   * 选定物料后查询对应的品类定义
   * @param {Number} itemId 物料id
   */
  @Bind()
  handleFetchCategory(itemId) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractMaintain/fetchCategory',
      payload: {
        itemId,
        enabledFlag: 1,
      },
    });
  }

  /**
   * 防抖，减少渲染频率
   * @param {Function} fun 回调函数
   * @param {number} delay 延时
   */
  /* eslint-disable */
  @Bind()
  debounce(fun, delay) {
    let timeout = null;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fun.call(this, arguments);
      }, delay);
    };
  }
  /* eslint-enable */

  /**
   * 改变state时
   * @param {Object} params state内容
   */
  @Bind()
  handleChangeState(params) {
    this.debounce(() => this.setState(params), 300)();
  }

  /**
   * 查询扩展信息
   * @param {Number} companyId 公司Id
   * @returns Promise(result)
   */
  @Bind()
  handleFetchExtended(companyId) {
    const { dispatch } = this.props;
    const {
      headerInfo: { pcHeaderId },
    } = this.state;
    return dispatch({
      type: 'contractMaintain/fetchExtended',
      payload: {
        companyId,
        pcHeaderId,
      },
    });
  }

  /**
   * handleVisible - 通过协议-打开模态框
   * @param {String} field 设置的字段
   * @param {Boolean} flag 设置的值
   */
  @Bind()
  fullScreen(field, flag) {
    this.setState({ [field]: !!flag });
  }

  @Bind()
  handleExpenseUnitChange(record = {}) {
    const { headerInfo } = this.state;
    this.setState({
      headerInfo: {
        ...headerInfo,
        costAnchDepId: record.unitId || null,
        costAnchDepDesc: record.unitName || null,
      },
    });
  }

  /**
   * handleRecordChange - 监听行内修改
   * @param {Object} 行数据
   */
  @Bind()
  handleRecordChange(record) {
    const dataSource = this.state.pcSubjectDataSource;
    const newDataSource = dataSource.map((item) => {
      if (item.pcSubjectId === record.pcSubjectId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    this.setState({
      pcSubjectDataSource: newDataSource,
    });
  }

  /**
   * 保存激活的tab的key
   * @param {String} activeKey
   */
  @Bind()
  handleSaveKey(activeKey) {
    this.setState({ activeKey });
  }

  /**
   * fetchSubjectCreateList - 查询可创建行数据
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  @Bind()
  fetchSubjectCreateList(params, success = (e) => e) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'contractMaintain/querySubjectCreateList',
      pcHeaderId,
      params,
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * fetchSubjectQuoteList - 查询可创建寻源单据
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  @Bind()
  fetchSubjectQuoteList(params, success = (e) => e) {
    const { pcHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/querySubjectQuoteList',
      pcHeaderId,
      params,
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * 保存pcHeaderElectronicSignatureAttachment
   * @param {*} pcHeaderElectronicSignatureAttachment
   */
  @Bind()
  handleSaveElectricSignUuid(pcHeaderElectronicSignatureAttachment) {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    if (!headerInfo.pcHeaderElectronicSignatureAttachment) {
      dispatch({
        type: 'contractMaintain/add',
        payload: {
          ...headerInfo,
          pcHeaderElectronicSignatureAttachment,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            headerInfo: {
              ...headerInfo,
              ...res,
            },
          });
        }
      });
    }
  }

  @Bind()
  handleAppendValidate(poLineDetailDTOList) {
    const { pcHeaderId } = this.state;
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractMaintain/appendValidate',
      payload: {
        pcHeaderId,
        poLineDetailDTOList,
      },
    });
  }

  isQuoteSourceFlag = () => {
    const {
      isQuoteSource,
      headerInfo: { pcSourceCode },
    } = this.state;
    // 引用寻源单据跳转到 协议拟制详情页
    if (Number(isQuoteSource) === 1) {
      return true;
    }
    // 直接进入 协议拟制详情页 或 引用寻源单据保存后，isQuoteSource 丢失时
    if (pcSourceCode === 'SEARCH_SOURCE_RESULT') {
      return true;
    }
    return false;
  };

  /**
   * 采购订单新增标的行
   */
  @Bind()
  handleAddPurchaseOrder(selectedList = []) {
    const {
      pcSubjectDataSource,
      pcSubjectPagination,
      headerInfo: { supplierCurrencyCode = 'CNY', purchaseCurrencyCode = 'CNY' },
    } = this.state;
    this.setState({
      pcSubjectDataSource: [
        ...pcSubjectDataSource,
        ...selectedList.map((n, index) => ({
          ...n,
          _status: 'create',
          edited: true,
          sourceCode: n.displayPoNum,
          sourceLineNum: n.displayLineNum,
          deliverDate: n.deliverDate && moment(n.deliverDate).format(DEFAULT_DATE_FORMAT),
          neededDate: n.neededDate && moment(n.neededDate).format(DEFAULT_DATE_FORMAT),
          lineNum: '',
          pcSubjectId: uuid(),
          currencyCode: n.currencyCode || supplierCurrencyCode,
          purchaseCurrencyCode: n.purchaseCurrencyCode || purchaseCurrencyCode, // 本币
          purchaseTaxLineAmount: n.taxIncludedLineAmount, // 本币含税行金额
          prLineNum: pcSubjectDataSource.length + index + 1,
          taxIncludedUnitPrice: n.enteredTaxIncludedPrice,
          taxAmount: n.taxPrice,
          resultId: n.poLineLocationId,
          exchangeRate: n.exchangeRate,
          uomCodeAndName: n.uomCodeAndName,
        })),
      ],
      pcSubjectPagination: addItemsToPagination(
        selectedList.length,
        pcSubjectDataSource.length,
        pcSubjectPagination
      ),
      pcSubjectEdited: true,
    });
  }

  /**
   * 保存purchaserAttachmentUuid
   * @param {*} purchaserAttachmentUuid
   */
  @Bind()
  handleSaveUuid(purchaserAttachmentUuid) {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    if (!headerInfo.purchaserAttachmentUuid) {
      dispatch({
        type: 'contractMaintain/add',
        payload: {
          ...headerInfo,
          purchaserAttachmentUuid,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            headerInfo: {
              ...headerInfo,
              ...res,
            },
          });
        }
      });
    }
  }

  @Bind()
  handleAddRebate(key, primaryKey) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const rowKey = primaryKey || `${key}Id`;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      headerInfo: { pcKindCode, startDateActive, endDateActive },
    } = this.state;
    const newItem = ['ATTACHMENT_FRAMEWORK', 'FRAMEWORK_AGREEMENT'].includes(pcKindCode)
      ? {
          _status: 'create',
          [rowKey]: uuid(),
          edited: true,
          validityDateFrom: startDateActive,
          validityDateTo: endDateActive,
        }
      : { _status: 'create', [rowKey]: uuid(), edited: true };
    const params = {
      [sourceField]: [newItem, ...dataSource],
      [paginationField]: addItemToPagination(dataSource.length, pagination),
    };
    this.setState({ ...params });
  }

  @Bind()
  handleControlComparison() {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible });
  }

  @Bind()
  handlePreviewModalClose() {
    this.setState({
      textPreviewVisible: false,
    });
  }

  @Bind()
  async getTextPreViewUrl() {
    const {
      dispatch,
      contractMaintain: { createPurchaseOrderInfo = {} },
    } = this.props;
    const {
      headerInfo,
      pcSubjectDataSource,
      pcStageDataSource,
      partnerDataSource,
      termDataSource,
      pcRebateDataSource,
      pcHeaderId,
    } = this.state;
    const formRef = get(this, 'headerRef.props.form');
    if (!formRef) {
      return;
    }
    this.setState({ fetchTextPreViewLoading: true });
    formRef.validateFieldsAndScroll({ force: true }, (errs, values) => {
      if (!errs) {
        Promise.all([
          this.validateEditTableDataSource(pcSubjectDataSource, ['pcSubjectId'], {
            force: true,
          }),
          this.validateEditTableDataSource(pcStageDataSource, ['pcStageId'], {
            force: true,
          }),
          this.validateEditTableDataSource(partnerDataSource, ['partnerId'], {
            force: true,
          }),
          !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode)
            ? this.validateEditTableDataSource(termDataSource, ['termId'], { force: true })
            : Promise.resolve([]),
          headerInfo.rebateFlag
            ? this.validateEditTableDataSource(pcRebateDataSource, ['rebateInformationId'], {
                force: true,
              })
            : Promise.resolve([]),
          fetchContractOnlineHTMLType(),
        ])
          .then(
            ([
              pcSubjectDetailDTOList,
              pcStageDetailDTOList,
              pcPartnerDetailDTOList,
              pcTermDetailDTOList = [],
              pcRebateInformationlist = [],
              type,
            ]) => {
              setTimeout(() => {
                const { startDateActive, endDateActive } = values;
                const formatStartDate =
                  startDateActive && moment(startDateActive).format(DEFAULT_DATETIME_FORMAT);
                const formatEndDate =
                  endDateActive && moment(endDateActive).format(DEFAULT_DATETIME_FORMAT);
                const payload = {
                  ...headerInfo, // 采购协议头信息
                  ...values,
                  companyName: values?.companyName || headerInfo?.companyName || null, // 由于清除companyName，但是又不敢修改以前表单的逻辑
                  supplierCompanyId:
                    headerInfo.pcSourceCode === 'PURCHASE_ORDER'
                      ? createPurchaseOrderInfo.supplierCompanyId
                      : headerInfo.supplierCompanyId,
                  startDateActive: formatStartDate,
                  endDateActive: formatEndDate,
                  pcSubjectDetailDTOList: this.formatSubjectTime(pcSubjectDetailDTOList, [
                    'deliverDate',
                    'priceEndDate',
                    'priceStartDate',
                  ]),
                  pcStageDetailDTOList: this.formatTime(pcStageDetailDTOList, ['milestoneTime']),
                  pcPartnerDetailDTOList,
                  pcTermDetailDTOList: [
                    ...pcTermDetailDTOList.filter(
                      (item) => !['DATE', 'DATETIME'].includes(item.termType)
                    ),
                    ...this.formatTime(
                      pcTermDetailDTOList.filter((item) =>
                        ['DATE', 'DATETIME'].includes(item.termType)
                      ),
                      ['termContent']
                    ),
                  ],
                  pcRebateInformationlist: this.formatTime(pcRebateInformationlist, [
                    'validityDateFrom',
                    'validityDateTo',
                  ]),
                  customizeUnitCode:
                    'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
                };
                if (type?.includes('new_wps')) {
                  // type为new_wps/new_wps_V7时，使用新版WPS预览
                  fetchWpsV5TextPreView(payload)
                    .then((url) => {
                      if (getResponse(url)) {
                        if (type === 'new_wps_V7' && window?.open) {
                          window.open(
                            `${window.$$env.BASE_PATH}pub/spcm/contract-workspace/wps-v7-preview/${pcHeaderId}?previewUrl=${url}`
                          );
                        } else {
                          window.open(url);
                        }
                      }
                    })
                    .finally(() => {
                      this.setState({ fetchTextPreViewLoading: false });
                    });
                  return false;
                }
                dispatch({
                  type: 'editorOnline/fetchTextPreView',
                  payload,
                }).then((url) => {
                  this.setState({ fetchTextPreViewLoading: false });
                  const hasFailed = url && url.includes('failed'); // 是否接口报错
                  if (typeof url === 'string' && url !== '' && !hasFailed) {
                    const tenantId = getCurrentOrganizationId();
                    const bucketName = PRIVATE_BUCKET;
                    const editor = type?.includes('new_wps') ? 'WPS' : 'ONLYOFFICE';
                    window.open(
                      `${HZERO_FILE}/v1/${tenantId}/file/preview?url=${encodeURIComponent(
                        url
                      )}&editor=${editor}&bucketName=${bucketName}&access_token=${getAccessToken()}#toolbar=0`
                    );
                  } else if (hasFailed) {
                    const errorObj = JSON.parse(url);
                    notification.error({
                      message: errorObj.message,
                    });
                  } else {
                    notification.warning({
                      message: intl
                        .get('spcm.common.view.button.getPreViewUrlError')
                        .d('Url获取失败！'),
                    });
                  }
                });
              }, 2000);
            }
          )
          .catch(() => {
            this.setState({ fetchTextPreViewLoading: false });
            notification.warning({
              message: intl.get('spcm.common.view.validateLine.error').d('采购协议行信息校验失败'),
            });
          });
      } else {
        this.setState({ fetchTextPreViewLoading: false });
        notification.warning({
          message: intl.get('spcm.common.view.validateHeader.error').d('采购协议头信息校验失败'),
        });
      }
    });
  }

  /**
   * 引用协议模板刷新在线编辑中的模板文件内容
   */
  @Bind()
  refreshTemplate() {
    const { pcHeaderId } = this.state;
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractMaintain/fetchTemplateRefresh',
      payload: {
        pcHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.fetchHeader();
      }
    });
  }

  @Bind()
  getBackPath() {
    const { isQuoteSource, backPath = {}, from = undefined } = this.state;
    const { remote } = this.props;
    const path =
      isQuoteSource === '1'
        ? '/spcm/contract-maintain/quoteSource'
        : backPath[from] || backPath.default;

    return remote
      ? remote.process('SPCM_CONTRACT_MAINTAIN_DETAIL_BACKPATH', path, {
          current: this,
        })
      : path;
  }

  // @overide海亮
  renderContractHeader(headerInfoFormProps) {
    return <ContractHeader {...headerInfoFormProps} />;
  }

  // @overide 元组
  renderAttachment(attachmentProps) {
    return <Attachment {...attachmentProps} />;
  }

  // src-4038 为了58的补充协议列表二开
  @Bind()
  renderContractReplenish(contractReplenishProps) {
    return <ContractReplenish {...contractReplenishProps} />;
  }

  // @overide佰傲再生
  renderContractSubject(contractSubjectListProps) {
    return <ContractSubject {...contractSubjectListProps} />;
  }

  /**
   * 优惠规则——折扣
   * @param {object} discountRuleProps 折扣属性
   * @returns
   */
  renderDiscountRule(discountRuleProps) {
    return <PreferentialRule {...discountRuleProps} />;
  }

  /**
   * 优惠规则——返利
   * @param {object} rebateRuleProps 返利属性
   * @returns
   */
  renderRebateRule(rebateRuleProps) {
    return <PreferentialRule {...rebateRuleProps} />;
  }

  // @overide网易
  renderHeaderButton() {
    const {
      location,
      queryingHeader = false,
      queryingSubject = false,
      saving = false,
      // deleteHeaderLoading = false,
      submitContractLoading = false,
      // fetchTextPreViewLoading = false,
      refreshTemplateLoading = false,
      contractCommon: { formChanged },
      customizeBtnGroup,
      remote,
    } = this.props;
    const {
      templateListFlag,
      templateList,
      headerInfo = {},
      isNotSaveFormChanged,
      fetchTextPreViewLoading,
      cuxQueryLoading = false,
      isBlacklistTenant,
      aiCheckLoading,
      disableAiApproveBtn,
    } = this.state;
    const {
      attachmentUuid,
      electronicSignatureAttachmentDisplayFlag, // 这一个显示电签附件
      supplierAttachmentUuid,
      editStep,
      signatureType,
      authType,
      electricSignFlag,
    } = headerInfo;
    const { search = {} } = location;
    const { pcHeaderId = headerInfo.pcHeaderId } = querystring.parse(search.substr(1));
    const commonLoading = saving || submitContractLoading || cuxQueryLoading;
    const commonDisabled = queryingHeader || queryingSubject || aiCheckLoading;
    const attachmentProps = {
      remote,
      templateListFlag,
      headerInfo,
      templateList,
      supplierAttachmentUuid,
      width: 610,
      isShowTips: true,
      onChangeState: (state) => {
        this.setState(state);
      },
      onRef: (node) => {
        this.attachmentRef = node;
      },
      attachmentUUID: attachmentUuid,
      onUpdateHeader: this.handleUpdateContractTextUrl,
      onFetchHeader: this.fetchHeader,
      onRefresh: this.handleFetchConfigAttachment,
      purchaserParams: { purchaserUploadFlag: true },
      btnProps: {
        icon: 'upload',
        disabled: (formChanged && isNotSaveFormChanged) || commonDisabled,
        loading: commonLoading,
        btnText: intl.get(`entity.attachment.upload.spcm`).d('附件上传'),
      },
      'data-name': 'attachment',
      isBlacklistTenant,
    };
    const uploadProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchaser-attachment',
      btnText: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      title: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
      attachmentUUID: headerInfo.purchaserAttachmentUuid,
      afterOpenUploadModal: (purchaserUuid) => this.handleSaveUuid(purchaserUuid),
    };
    const electricSignAttachmentProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'purchase-contract',
      btnText: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      title: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
      attachmentUUID: headerInfo.pcHeaderElectronicSignatureAttachment,
      rightAttachmentUUID: headerInfo.pcHeaderElectronicSignatureAttachmentIsSigned,
      afterOpenUploadModal: (electricSignUuid) => this.handleSaveElectricSignUuid(electricSignUuid),
      fileSize: 25 * 1024 * 1024,
      fileMaxNum: 4,
      btnProps: {
        disabled:
          (pcHeaderId && templateListFlag && !attachmentUuid) ||
          queryingHeader ||
          saving ||
          queryingSubject,
        loading: submitContractLoading,
      },
      fileType:
        'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' &&
      allSignList.includes(authType) &&
      electricSignFlag === 1; // 是否附件签章
    const isAttachmentSignAndText =
      (signatureType === 'TEXT_AND_ANNEX_SIGNATURE' &&
        allSignList.includes(authType) &&
        electricSignFlag === 1) ||
      electronicSignatureAttachmentDisplayFlag === 'Y'; // 是否附件签章

    const buttons = [
      <Button
        data-name="save"
        loading={commonLoading || (pcHeaderId && templateListFlag ? !attachmentUuid : false)}
        onClick={() => this.save()}
        icon="save"
        type="primary"
        disabled={commonDisabled}
      >
        {intl.get(`hzero.common.button.save`).d('保存')}
      </Button>,
      <Button
        data-name="submit"
        loading={commonLoading || (pcHeaderId && templateListFlag ? !attachmentUuid : false)}
        icon="check"
        onClick={_debounce(() => this.preSubmit(), 1000, { leading: true, trailing: false })}
        disabled={
          editStep === 0 ||
          !pcHeaderId ||
          (formChanged && isNotSaveFormChanged) ||
          commonDisabled ||
          !templateListFlag
        }
      >
        {intl.get(`hzero.common.button.submit`).d('提交')}
      </Button>,
      pcHeaderId && (isAttachmentSignUpload || isAttachmentSignAndText) && (
        <ComUpload data-name="uploadESignAttachment" {...electricSignAttachmentProps} />
      ),
      pcHeaderId && templateListFlag && this.renderAttachment(attachmentProps),
      pcHeaderId && (
        <Popover
          content={intl.get('spcm.common.view.button.purchaserViewOnly').d('仅采购方可见')}
          placement="bottomLeft"
          trigger="hover"
          data-name="purchaserAttachment"
        >
          <PermissionButton
            loading={commonLoading || commonDisabled} // PermissionButton的children是Upload时disabled不生效所以放到loading上
            key="purchaserAttachment"
            permissionList={[
              {
                code: 'srm.pc-admin.pc-purchaser.maintain.ps.attachment',
                type: 'button',
                meaning: '采购方附件',
              },
            ]}
            className={styles.purchaseHeaderNumber}
          >
            <Upload {...uploadProps} />
          </PermissionButton>
        </Popover>
      ),
      <Button
        data-name="delete"
        loading={commonLoading}
        icon="delete"
        disabled={!pcHeaderId || commonDisabled}
        onClick={this.delete}
      >
        {intl.get(`hzero.common.button.delete`).d('删除')}
      </Button>,
      <Button
        data-name="operating"
        icon="clock-circle-o"
        disabled={!pcHeaderId}
        onClick={() => this.handleModalVisible('operationRecordVisible', true, { pcHeaderId })}
      >
        {intl.get(`hzero.common.button.operating`).d('操作记录')}
      </Button>,
      headerInfo.pcStatusCode !== 'PENDING' &&
        !isAttachmentSignUpload &&
        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) && (
          <PermissionButton
            data-name="comparison"
            key="comparison"
            loading={commonLoading}
            permissionList={[
              {
                code: 'srm.pc-admin.pc-purchaser.maintain.ps.text.comparison',
                type: 'button',
                meaning: '文本对比',
              },
            ]}
            disabled={!pcHeaderId || headerInfo.pcKindCode === 'ATTACHMENT' || commonDisabled}
            onClick={this.handleControlComparison}
          >
            {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
          </PermissionButton>
        ),
      !isAttachmentSignUpload && (
        <Button
          data-name="textPreview"
          loading={fetchTextPreViewLoading || commonLoading}
          disabled={
            !pcHeaderId ||
            ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) ||
            commonDisabled
          }
          onClick={this.getTextPreViewUrl}
        >
          {intl.get('spcm.common.view.title.textPreview').d('文本预览')}
        </Button>
      ),
      !isAttachmentSignUpload && (
        <Button
          data-name="quoteAgreementTemplate"
          loading={refreshTemplateLoading || commonLoading}
          disabled={
            !pcHeaderId ||
            ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) ||
            commonDisabled
          }
          onClick={this.refreshTemplate}
        >
          {intl.get('spcm.common.view.title.quoteAgreementTemplate').d('引用协议模板')}
        </Button>
      ),
      pcHeaderId && (
        <Button
          data-name="aiApprove"
          loading={commonLoading || (pcHeaderId && templateListFlag ? !attachmentUuid : false)}
          // icon="offline_bolt-o"
          onClick={() => this.save({}, false, 'aiApprove')}
          disabled={commonDisabled || disableAiApproveBtn}
        >
          {intl.get('spcm.common.view.button.aiApprove').d('智能预审')}
        </Button>
      ),
    ].filter(Boolean);
    const buttonList = remote
      ? remote.process('SPCM_CONTRACT_MAINTAIN_DETAIL_PROCESS_HEADER_BUTTONS', buttons, {
          current: this,
        })
      : buttons;
    return (
      <Header
        title={intl.get(`spcm.contractMaintain.view.message.title.purchaseCreation`).d('协议拟制')}
        backPath={this.getBackPath()}
      >
        {customizeBtnGroup(
          {
            code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.BTN_GROUP',
          },
          buttonList
        )}
      </Header>
    );
  }

  render() {
    const {
      location,
      sourceCreateLoading,
      queryingHeader = false,
      queryingPartner = false,
      queryingApproveRecord = false,
      queryingSubject = false,
      queryingStage = false,
      queryingTerm = false,
      saving = false,
      submitContractLoading = false,
      deletePcSubjectLoading = false,
      deletePcStageLoading = false,
      deletePartnerLoading = false,
      deleteTermLoading = false,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      saveSubjectLoading,
      dispatch,
      contractMaintain: {
        sourceResultDTOs,
        createPurchaseOrderInfo = {},
        detailEnumMap = {},
        detailEnumMapStage = {},
      },
      contractCommon: { configSetting = {}, formChanged },
      newContract: { newEnumMap = {}, _linkFlag },
      remote,
      match,
    } = this.props;
    const {
      isPub,
      operationRecordVisible,
      fullScreenFlag,
      pcSubjectDataSource = [],
      pcStageDataSource = [],
      pcSubjectPagination = {},
      pcStagePagination = {},
      pcSubjectSelectedRows = [],
      pcStageSelectedRows = [],
      partnerDataSource = [],
      partnerSelectedRows = [],
      headerInfo = {},
      termDataSource = [],
      termSelectedRows = [],
      activeKey,
      isQuoteSource,
      pcRebateDataSource,
      pcRebatePagination,
      pcRebateSelectedRows,
      quoteType,
      textComparisonVisible,
      pcSubjectTableKey,
      prLineImport,
      doubleUnitEnabled,
      aiApproveReslultParams,
      resultStatus,
    } = this.state;
    const {
      editStep,
      amountDiffFlag, // 差异标识
      taxIncludeAmount = 0, // 协议头本币含税金额字段
      purchaseCostQuantity = 0, // 阶段行本币金额字段
      diffAmount = 0, // 差异金额
      alterationFlag,
      rebateFlag,
      supplementFlag,
      signatureType,
      authType,
      electricSignFlag,
      supplierCurrencyCode,
      enableRule,
      pcNum,
      version,
    } = headerInfo;
    const queryingList =
      queryingPartner || queryingSubject || queryingStage || queryingTerm || queryingApproveRecord;
    const { search = {} } = location;
    const parentRoute = {
      location,
      match,
    };
    const { pcHeaderId = headerInfo.pcHeaderId } = querystring.parse(search.substr(1));
    const editable = !pcHeaderId;
    const maintainEditable = true;
    const checkArtificial = true;
    const pageSourceKey = 'CONTRACT_MAINTAIN';
    const headerInfoFormProps = {
      remote,
      sourceResultDTOs,
      detailEnumMap,
      newEnumMap,
      purchaseFlag: true, // 是否来自采购方
      editable,
      isQuoteSource,
      maintainEditable,
      alterationFlag,
      createPurchaseOrderInfo,
      quoteType,
      formChanged,
      pageSourceKey,
      customizeForm,
      supplementFlag,
      parentRoute,
      onRef: (node) => {
        this.headerRef = node;
      },
      dataSource: headerInfo,
      onChangeHeader: this.handleChangeHeader,
      onChangeState: this.handleChangeState,
      handleExpenseUnitChange: this.handleExpenseUnitChange,
      _linkFlag,
      updateSubjectList: this.subjectRef ? this.subjectRef.updateSubjectList : (e) => e,
      updateStageList: this.stageRef ? this.stageRef.updateStageList : (e) => e,
    };
    const contractSubjectListProps = {
      doubleUnitEnabled,
      prLineImport,
      pageSourceKey,
      sourceResultDTOs,
      pcHeaderId,
      editable,
      _linkFlag,
      checkArtificial,
      maintainEditable,
      headerInfo,
      detailEnumMap,
      customizeTable,
      customizeBtnGroup,
      saveSubjectLoading,
      dispatch,
      formChanged,
      remote,
      parentRoute,
      headerRef: this.headerRef,
      onSave: this.saveSubject,
      deleting: deletePcSubjectLoading,
      loading: queryingSubject,
      doubleUomFlag: configSetting['000112'] === '1',
      showOperationLadderQuote: true, // 是否加载阶梯价格弹窗模块
      showSearchSubject: true, // 是否加载物料查询模块
      pagination: pcSubjectPagination,
      dataSource: pcSubjectDataSource,
      pcSubjectTableKey,
      onSelectionChange: this.handleChangeSelection,
      fetchSubjectCreateList: this.isQuoteSourceFlag()
        ? this.fetchSubjectQuoteList
        : this.fetchSubjectCreateList,
      addSubjectLines: this.addSubjectLines,
      onHandleAppendValidate: this.onHandleAppendValidate,
      selectedRows: pcSubjectSelectedRows,
      onAdd: () => this.handleAddLines('pcSubject', true),
      onDelete: () => this.handleDeleteLines('pcSubject'),
      onRef: (node) => {
        this.subjectRef = node;
      },
      onHandleRecord: this.handleRecordChange, // 监听修改
      onChangeState: this.handleChangeState,
      onChangeListData: this.handleChangeList,
      onPrePaginationChange: this.handlePreSearchPcSubject,
      originPage: {
        contractMaintain: true,
      },
      quoteSourceFlag: this.isQuoteSourceFlag(),
      onAddPurchaseOrder: this.handleAddPurchaseOrder,
      onSearchSubject: ({ itemName, itemCode }) => this.fetchSubject(undefined, itemName, itemCode),
      sourceCreateLoading,
      newEnumMap,
    };
    // 新增 tab 协议阶段相关数据和操作
    const contractStageListProps = {
      headerInfo,
      detailEnumMap,
      detailEnumMapStage,
      editable,
      checkArtificial,
      maintainEditable,
      customizeTable,
      dispatch,
      remote,
      parentRoute,
      formChanged,
      deleting: deletePcStageLoading,
      loading: queryingStage,
      pagination: pcStagePagination,
      dataSource: pcStageDataSource,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: pcStageSelectedRows,
      onAdd: () => this.handleAddLines('pcStage'),
      onDelete: () => this.handleDeleteLines('pcStage'),
      onRef: (node) => {
        this.stageRef = node;
      },
      onHandleRecord: this.handleRecordChange, // 监听修改
      onChangeState: this.handleChangeState,
      onChangeListData: this.handleChangeList,
      onPrePaginationChange: this.handlePreSearchPcStage,
    };
    const contractRebateProps = {
      editable,
      maintainEditable,
      checkArtificial,
      customizeTable,
      dispatch,
      formChanged,
      pcHeaderId,
      parentRoute,
      supplierCurrencyCode,
      dataSource: pcRebateDataSource,
      pagination: pcRebatePagination,
      selectedRows: pcRebateSelectedRows,
      onFetchContractRebate: this.fetchContractRebate,
      onAdd: () => this.handleAddRebate('pcRebate', 'rebateInformationId'),
      onDelete: () => this.handleDeleteLines('pcRebate', 'rebateInformationId'),
      onChangeState: this.handleChangeState,
      onSelectionChange: this.handleChangeSelection,
      onPrePaginationChange: this.fetchContractRebate,
    };
    const partnerListProps = {
      editable,
      checkArtificial,
      maintainEditable,
      detailEnumMap,
      headerInfo,
      customizeTable,
      dispatch,
      parentRoute,
      formChanged,
      customizeBtnGroup,
      deleting: deletePartnerLoading,
      loading: queryingPartner,
      dataSource: partnerDataSource,
      onSearch: this.fetchPartner,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: partnerSelectedRows,
      onAdd: () => this.handleAddLines('partner', ''),
      onDelete: () => this.handleDeleteLines('partner'),
      onRef: (node) => {
        this.partnerRef = node;
      },
      onChangeState: this.handleChangeState,
      onChangeListData: this.handleChangeList,
      onFetchExtended: this.handleFetchExtended,
      detailState: { ...this.state },
      remote,
    };
    const contractBusinessTermsListProps = {
      editable,
      maintainEditable,
      checkArtificial,
      headerInfo,
      deleting: deleteTermLoading,
      loading: queryingTerm,
      pagination: false,
      dispatch,
      formChanged,
      customizeBtnGroup,
      dataSource: termDataSource,
      selectedRows: termSelectedRows,
      onRef: (node) => {
        this.termRef = node;
      },
      onSelectionChange: this.handleChangeSelection,
      onAdd: (data) => this.handleAddTerm('term', data),
      onDelete: () => this.handleDeleteLines('term'),
      onChangeState: this.handleChangeState,
    };

    const formRef = get(this, 'headerRef.props.form');

    const discountRuleProps = {
      editable: editable || maintainEditable,
      majorPcNum: `${pcNum}|${version}`,
      type: 'discount',
      isH0Type: true,
      headerInfo: () => ({ ...headerInfo, ...formRef?.getFieldsValue() }),
    };

    const rebateRuleProps = {
      editable: editable || maintainEditable,
      majorPcNum: `${pcNum}|${version}`,
      type: 'rebate',
      isH0Type: true,
      headerInfo: () => ({ ...headerInfo, ...formRef?.getFieldsValue() }),
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };
    const ModalProps = {
      width: '100%',
      height: document?.body?.clientHeight || '100vh',
      visible: fullScreenFlag,
      onCancel: () => this.fullScreen('fullScreenFlag', false),
      footer: null,
      closable: false,
    };

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };

    const contractReplenishProps = {
      pcHeaderId,
      redirectDetail: this.redirectDetail,
      customizeTable,
    };

    const isAttachmentSignUpload =
      signatureType === 'ANNEX_SIGNATURE' &&
      allSignList.includes(authType) &&
      electricSignFlag === 1; // 是否附件签章

    // ai审核参数
    const aiApproveParam = {
      aiApproveReslultParams,
      resultStatus,
    };
    return (
      <Fragment>
        {this.renderHeaderButton()}

        <Content>
          <div id="spcm-contract-maintain-detail-content-inner-wrapper">
            <Spin
              spinning={
                queryingHeader || queryingPartner || queryingList || submitContractLoading || saving
              }
              wrapperClassName={classnames(
                styles['contract-maintain-spin-wrapper'],
                DETAIL_DEFAULT_CLASSNAME
              )}
            >
              <IntelligentPreReview {...aiApproveParam} />
              <Row gutter={24}>
                <Col span={21}>
                  <Card
                    key="contractHeaderInformation"
                    id="spcm-contract-maintain-detail-contract-header-information"
                    bordered={false}
                    className={DETAIL_CARD_CLASSNAME}
                    title={
                      <>
                        <h3>
                          {intl
                            .get(`spcm.common.view.message.title.contractHeaderInformation`)
                            .d('采购协议头信息')}
                        </h3>
                        {amountDiffFlag === 1 && !isPub && (
                          <div className={classnames(styles['alert-wrapper'])}>
                            <Alert
                              message={
                                <>
                                  <Tag color="#0161D5">
                                    {intl
                                      .get('spcm.common.view.message.title.tailedDifference')
                                      .d('有尾差')}
                                  </Tag>
                                  <span className={classnames(styles['alert-info'])}>
                                    {intl
                                      .get('spcm.common.view.message.title.tailedDifferenceInfo', {
                                        purchaseCostQuantity: renderThousandthNum(
                                          purchaseCostQuantity
                                        ),
                                        taxIncludeAmount: renderThousandthNum(taxIncludeAmount),
                                        diffAmount: renderThousandthNum(diffAmount),
                                      })
                                      .d(
                                        `当前协议阶段本币费用之和【${renderThousandthNum(
                                          purchaseCostQuantity
                                        )}】当前协议总额（本币）【${renderThousandthNum(
                                          taxIncludeAmount
                                        )}】，尾差为【${renderThousandthNum(diffAmount)}】`
                                      )}
                                  </span>
                                </>
                              }
                              type="info"
                              closable
                            />
                          </div>
                        )}
                      </>
                    }
                  >
                    {this.renderContractHeader(headerInfoFormProps)}
                  </Card>
                  {pcHeaderId && (
                    <div
                      key="subjectInformation"
                      id="spcm-contract-maintain-detail-contract-subject"
                    >
                      <Tabs activeKey={activeKey} animated={false} onChange={this.handleSaveKey}>
                        <TabPane
                          tab={intl
                            .get('spcm.common.view.message.title.contractSubject')
                            .d('协议标的')}
                          key="contractSubjectInfo"
                        >
                          {this.renderContractSubject(contractSubjectListProps)}
                        </TabPane>
                        <TabPane
                          tab={intl
                            .get('spcm.common.view.message.title.contractStage')
                            .d('协议阶段')}
                          key="agreementStage"
                          forceRender
                        >
                          {this.renderContractStage(contractStageListProps)}
                        </TabPane>
                        {rebateFlag && (
                          <TabPane
                            tab={intl
                              .get('spcm.common.view.message.title.ContractRebate')
                              .d('返利信息')}
                            key="contractRebate"
                          >
                            <ContractRebate {...contractRebateProps} />
                          </TabPane>
                        )}
                      </Tabs>
                    </div>
                  )}
                  {pcHeaderId && (
                    <Card
                      key="contractPartnerInformation"
                      id="spcm-contract-maintain-detail-contract-partner"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`spcm.common.view.message.title.contractPartnerInformation`)
                            .d('采购协议伙伴信息')}
                        </h3>
                      }
                    >
                      <ContractPartner {...partnerListProps} />
                    </Card>
                  )}
                  {pcHeaderId &&
                    !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) && (
                      <Card
                        key="contractBusinessTermsInformation"
                        id="spcm-contract-maintain-detail-contract-business-terms"
                        bordered={false}
                        className={DETAIL_CARD_CLASSNAME}
                        title={
                          <h3>
                            {intl
                              .get(`spcm.common.view.message.title.purcAgreementBusinessTerms`)
                              .d('采购协议业务条款')}
                          </h3>
                        }
                      >
                        {this.renderContractBusinessTerms(contractBusinessTermsListProps)}
                      </Card>
                    )}
                  {pcHeaderId && !!enableRule && (
                    <Card
                      key="discountRule"
                      id="spcm-contract-maintain-detail-discount-rule"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get('spcm.common.view.message.title.dicountRule')
                            .d('优惠规则-折扣')}
                        </h3>
                      }
                    >
                      {this.renderDiscountRule(discountRuleProps)}
                    </Card>
                  )}
                  {pcHeaderId && !!enableRule && (
                    <Card
                      key="rebateRule"
                      id="spcm-contract-maintain-detail-rebate-rule"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl.get('spcm.common.view.message.title.rebateRule').d('优惠规则-返利')}
                        </h3>
                      }
                    >
                      {this.renderRebateRule(rebateRuleProps)}
                    </Card>
                  )}
                  {/* 只有在开启“启用SRM采购协议审”时才显示审批记录 */}
                  {pcHeaderId && configSetting['010601'] === '1' && (
                    <Card
                      key="approveRecordInformation"
                      id="spcm-contract-maintain-detail-approve-record"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`spcm.common.view.message.title.approveRecordInformation`)
                            .d('审批记录')}
                        </h3>
                      }
                    >
                      <ApproveRecord pcHeaderId={pcHeaderId} />
                    </Card>
                  )}
                  {pcHeaderId && !supplementFlag && (
                    <Card
                      key="contractReplenishList"
                      id="spcm-contract-approval-detail-contract-replenish"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`spcm.common.view.message.title.contractReplenishList`)
                            .d('补充协议列表')}
                        </h3>
                      }
                    >
                      {this.renderContractReplenish(contractReplenishProps)}
                    </Card>
                  )}
                  {pcHeaderId &&
                    editStep === 1 &&
                    !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
                    !isAttachmentSignUpload && (
                      <Card
                        key="contractOnlineEdit"
                        id="spcm-contract-maintain-detail-contract-online-edit"
                        bordered={false}
                        className={DETAIL_CARD_CLASSNAME}
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '14px' }}>
                              {intl
                                .get(`spcm.common.title.contractOnlineEdit`)
                                .d('采购协议文本编辑')}
                            </h3>
                            <PermissionButton
                              permissionList={[
                                {
                                  code:
                                    'srm.pc-admin.pc-purchaser.maintain.ps.contract-line-editing',
                                  type: 'button',
                                  meaning: '文本编辑',
                                },
                              ]}
                              type="primary"
                              onClick={() => this.fullScreen('fullScreenFlag', true)}
                            >
                              {intl.get(`spcm.common.title.onlineEdit`).d('文本编辑')}
                            </PermissionButton>
                          </div>
                        }
                      >
                        {/* <div className={styles['button-wrapper']}> */}
                        {/*  <Button */}
                        {/*    type="primary" */}
                        {/*    onClick={() => this.fullScreen('fullScreenFlag', true)} */}
                        {/*  > */}
                        {/*    {intl.get(`hzero.common.button.fullScreen`).d('全屏模式')} */}
                        {/*  </Button> */}
                        {/* </div> */}
                        {/* <EditorOnline */}
                        {/*  sourcePage="contractMaintain" */}
                        {/*  iframeStyle={{ */}
                        {/*    width: '100%', */}
                        {/*    height: `${(document.body.clientHeight - 96) * 0.9}px`, */}
                        {/*  }} */}
                        {/*  pcHeaderId={pcHeaderId} */}
                        {/*  onRef={(node) => { */}
                        {/*    this.editorOnlineRef = node; */}
                        {/*  }} */}
                        {/* /> */}
                      </Card>
                    )}
                </Col>
                <Col span={3} className={styles['anchor-wrapper']}>
                  <Affix
                    style={{ top: '200px', width: 'calc( 100% - 11px )', position: 'absolute' }}
                    offsetTop={224}
                    target={this.getAffixContainer}
                  >
                    <Anchor offsetTop={24} getContainer={this.getAffixContainer}>
                      {pcHeaderId && (
                        <Link
                          href="#spcm-contract-maintain-detail-contract-header-information"
                          title={intl
                            .get(`spcm.common.view.message.title.basicInformation`)
                            .d('基本信息')}
                        />
                      )}
                      {pcHeaderId && (
                        <Link
                          href="#spcm-contract-maintain-detail-contract-subject"
                          title={intl
                            .get(`spcm.common.view.message.title.subjectInformation`)
                            .d('标的信息')}
                        />
                      )}
                      {pcHeaderId && (
                        <Link
                          href="#spcm-contract-maintain-detail-contract-partner"
                          title={intl
                            .get(`spcm.common.view.message.title.partnerInformation`)
                            .d('伙伴信息')}
                        />
                      )}
                      {pcHeaderId &&
                        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) && (
                          <Link
                            href="#spcm-contract-maintain-detail-contract-business-terms"
                            title={intl
                              .get(`spcm.common.view.message.title.businessTermsInformation`)
                              .d('业务条款')}
                          />
                        )}
                      {pcHeaderId && !!enableRule && (
                        <Link
                          href="#spcm-contract-maintain-detail-discount-rule"
                          title={intl
                            .get('spcm.common.view.message.title.dicountRule')
                            .d('优惠规则-折扣')}
                        />
                      )}
                      {pcHeaderId && !!enableRule && (
                        <Link
                          href="#spcm-contract-maintain-detail-rebate-rule"
                          title={intl
                            .get('spcm.common.view.message.title.rebateRule')
                            .d('优惠规则-返利')}
                        />
                      )}
                      {pcHeaderId && configSetting['010601'] === '1' && (
                        <Link
                          href="#spcm-contract-maintain-detail-approve-record"
                          title={intl
                            .get(`spcm.common.view.message.title.approveRecordInformation`)
                            .d('审批记录')}
                        />
                      )}
                      {pcHeaderId && !supplementFlag && (
                        <Link
                          href="#spcm-contract-approval-detail-contract-replenish"
                          title={intl.get(`spcm.common.title.contractReplenish`).d('补充协议')}
                        />
                      )}
                      {pcHeaderId &&
                        editStep === 1 &&
                        !['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(headerInfo.pcKindCode) &&
                        !isAttachmentSignUpload && (
                          <Link
                            href="#spcm-contract-maintain-detail-contract-online-edit"
                            title={intl.get(`spcm.common.title.onlineEdit`).d('文本编辑')}
                          />
                        )}
                    </Anchor>
                  </Affix>
                </Col>
              </Row>
            </Spin>
          </div>
          <Modal
            destroyOnClose
            wrapClassName={styles['full-modal-wrapper']}
            bodyStyle={{ height: `${document?.body?.clientHeight - 39}px` }}
            {...ModalProps}
            title={
              <Button
                icon="shrink"
                style={{ float: 'right' }}
                onClick={() => this.fullScreen('fullScreenFlag', false)}
              >
                {intl.get(`hzero.common.button.exitFullScreen`).d('退出全屏')}
              </Button>
            }
          >
            <EditorOnline
              menuCode={CONTRACT_MAINTAIN}
              sourcePage="contractMaintain"
              iframeStyle={{
                width: '100%',
                height: 'calc(100vh - 50px)',
              }}
              pcHeaderId={pcHeaderId}
              headerInfo={headerInfo}
              fullScreenFlag={fullScreenFlag}
              onRef={(node) => {
                this.editorOnlineRef = node;
              }}
            />
          </Modal>
        </Content>
        <OperationRecordDrawer {...operationRecordProps} />
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
      </Fragment>
    );
  }
}

const hocFuc = (com) =>
  compose(
    connect(({ loading, contractMaintain, contractCommon, newContract }) => ({
      queryingHeader: loading.effects['contractCommon/fetchHeader'],
      queryingPartner: loading.effects['contractCommon/fetchPartner'],
      queryingApproveRecord: loading.effects['contractCommon/fetchApproveRecord'],
      queryingSubject: loading.effects['contractCommon/fetchSubject'],
      queryingStage: loading.effects['contractCommon/fetchStage'],
      queryingTerm: loading.effects['contractCommon/fetchTerm'],
      saving:
        loading.effects['contractMaintain/update'] ||
        loading.effects['contractMaintain/add'] ||
        loading.effects['contractMaintain/delete'],
      deleteHeaderLoading: loading.effects['contractMaintain/delete'],
      submitContractLoading: loading.effects['contractMaintain/submit'],
      deletePcSubjectLoading: loading.effects['contractMaintain/pcSubjectLinesDelete'],
      deletePcStageLoading: loading.effects['contractMaintain/pcStageLinesDelete'],
      deletePartnerLoading: loading.effects['contractMaintain/partnerLinesDelete'],
      deleteTermLoading: loading.effects['contractMaintain/termLinesDelete'],
      saveSubjectLoading: loading.effects['contractMaintain/saveSubject'],
      fetchTextPreViewLoading: loading.effects['editorOnline/fetchTextPreView'],
      refreshTemplateLoading: loading.effects['contractMaintain/fetchTemplateRefresh'],
      sourceCreateLoading:
        loading.effects['contractMaintain/sourceCreate'] ||
        loading.effects['contractMaintain/verified'],
      contractMaintain,
      contractCommon,
      newContract,
    })),
    formatterCollections({
      code: [
        'spcm.contractMaintain',
        'spcm.common',
        'spcm.workspace',
        'spcm.purchaseRequisitionCreation',
        'entity.company',
        'entity.supplier',
        'entity.attachment',
        'hzero.common',
        'spcm.purchaseContractView',
        'hzero.c7nProUI',
        'spfp.ruleMaintenance',
        'spfp.common',
        'entity.roles',
      ],
    }),
    withCustomize({
      unitCode: [
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE.READONLY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.CONTRACTREPLENISH',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT.BTN_GROUP',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER.BTN_GROUP',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL.BTN_GROUP',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.BUSINESSTERMS.BTN_GROUP',
      ],
    }),
    hocRemote(
      {
        code: 'SPCM_CONTRACT_MAINTAIN_DETAIL',
        name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
      },
      {
        events: {
          async handleSaveSubject({ saveSubject = (e) => e }) {
            const res = await saveSubject();
            // 此处一定要用逻辑非操作符(!!)，否则handleSaveSubject总是会返回true。
            return !!res;
          },
          // 供应商变更
          handleCuxChangeSupplier({ eventProps, newData }) {
            const { onChangeHeader } = eventProps;
            onChangeHeader(newData, 'supplier');
          },
          // 协议标的保存后埋点处理
          handleCuxSaveSubject() {},
          // 协议保存后埋点处理
          handleCuxUpdateAll() {},
          // 协议提交之前预校验
          handleCuxPreSubmit() {},
          // 协议提交之后
          handleCuxAfterSubmit() {},
          // 协议详情二开初始化
          handleCuxInitInfo() {},
        },
      }
    )
  )(com);

export { hocFuc, Detail };
export default hocFuc(Detail);
