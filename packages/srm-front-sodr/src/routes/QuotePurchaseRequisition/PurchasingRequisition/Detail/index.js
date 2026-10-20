/**
 * index - 按行引用采购申请创建
 * @date: 2020-11-17
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Spin, Collapse, Icon, Modal, Form } from 'hzero-ui';
import { connect } from 'dva';

import { isEmpty, filter, isNil, throttle } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import DynamicButtons from '_components/DynamicButtons';
import { Header, Content } from 'components/Page';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import {
  getResponse,
  addItemsToPagination,
  addItemToPagination,
  createPagination,
  getCurrentOrganizationId,
  getEditTableData,
  delItemsToPagination,
  filterNullValueObject,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DATETIME_MIN, DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';
import remotes from 'utils/remote';

import {
  formatUom,
  newTableEnable,
  getStageIdList,
  validateDoubleUom,
  queryCalcRuleConfig,
  validateLineCalculate,
  handleOldBudgetVerification,
} from '@/routes/components/utils';
import {
  BUCKET_NAME,
  THROTTLE_TIME,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
} from '@/routes/components/utils/constant';
import PurchaseRequestHeader from './PurchaseRequestHeader';
import PurchaseLineInfo from './PurchaseLineInfo';
import PriceModle from './PriceModal';
import DeliveryInformationHeader from './DeliveryInformationHeader';
import BillingInformation from './BillingInformation';
import WrapperBOMModal from '../../components/BOMModal';
import C7nDetail from '../../C7nPurchasingRequisition/Detail/index';
// import { getCustomizeData } from '@/services/quotePurchaseRequisitionService';
import remoteConfig from './remote';
import styles from './Header.less';

const { Panel } = Collapse;

// const pathname_ = {
//   contract: '/sodr/purchase-order-maintain/purchase/list',
// };
@newTableEnable(C7nDetail, 'orderMaintain')
@withCustomize({
  unitCode: [
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP',
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC',
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE',
    'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
    'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
    'SODR.ORDER_CREATE_LINE_LIST.PROPOSED.PRICE',
    'SODR.ORDER_CREATE_LINE_LIST.HEADER_BTNS',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_CATALOGUE',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_ERP',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
  ],
})
@formatterCollections({
  code: [
    'component.docFlow',
    'sodr.quotePurchaseRequisition',
    'sodr.common',
    'entity.attachment',
    'sodr.quotePurchase',
    'hpfm.employee',
    'srm.common',
    'entity.tenant',
    'ssrc.priceLibrary',
    'sodr.view',
    'sprm.purchaseReqCreation',
    'sprm.common',
    'entity.item',
    'sodr.workspace',
    'sodr.orderMaintain',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, quotePurchaseRequisition }) => ({
  saveLoading: loading.effects['quotePurchaseRequisition/add'],
  unSaveLoading: loading.effects['quotePurchaseRequisition/newSave'],
  newAddLoading: loading.effects['quotePurchaseRequisition/newAdd'],
  submitDetailLoading: loading.effects['quotePurchaseRequisition/submitDetail'],
  addDetailLinesLoading: loading.effects['quotePurchaseRequisition/addDetailLines'],
  deleteDetailLinesLoading: loading.effects['quotePurchaseRequisition/deleteDetailLines'],
  deleteDeliveryLoading: loading.effects['quotePurchaseRequisition/deleteSheetDelivery'],
  deleteLineRemoteLoaing: loading.effects['quotePurchaseRequisition/deleteLineRemote'],
  queryCreateListLoading: loading.effects['quotePurchaseRequisition/queryDetailCreateList'],
  queryDetailHeaderLoading: loading.effects['quotePurchaseRequisition/queryDetailHeader'],
  queryDetailListLoading: loading.effects['quotePurchaseRequisition/queryDetailList'],
  validating: loading.effects['quotePurchaseRequisition/appendValidate'],
  saveWarnLoading: loading.effects['quotePurchaseRequisition/saveWarn'],
  validateLoading: loading.effects['quotePurchaseRequisition/submitValidate'],
  priceUpdateLoading: loading.effects['quotePurchaseRequisition/priceUpdate'],
  fetchPriceUpdateListLoading: loading.effects['quotePurchaseRequisition/fetchPriceUpdateList'],
  addNewSubmitDetailLoading: loading.effects['quotePurchaseRequisition/addNewSubmitDetail'],
  checkInvOrganizationLoading: loading.effects['quotePurchaseRequisition/checkInvOrganization'],
  budgetVerificationLoading: loading.effects['quotePurchaseRequisition/oldBudgetVerification'],
  queryDoubleUomConfigLoading: loading.effects['quotePurchaseRequisition/queryDoubleUomConfig'],
  fetchAutoGetCompany: loading.effects['quotePurchaseRequisition/fetchAutoGetCompany'],
  quotePurchaseRequisition,
}))
@remotes(...remoteConfig)
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { poHeaderId, source, sourcePage, entrance, poSourcePlatform } = querystring.parse(
      search.substr(1)
    );
    this.state = {
      poHeaderId,
      source,
      sourcePage,
      entrance,
      lovRecord: {},
      poSourcePlatform,
      orderHeaderFormDataSource: {}, // 头form数据源
      listCommonDataSource: [], // 表格数据源
      listCommonPagination: {}, // 表格分页
      collapseKeys: ['orderHeaderInfo', 'orderLineInfo'], // 打开的折叠面板key
      isClearListCacheDataSource: true, // 是否清除表格缓存数据源
      isHeaderInfoFormDataSource: false, // 表格头数据是否加载完成
      tenantId: getCurrentOrganizationId(),
      selectedListRows: [],
      priceModalVisible: false, // 参考价格
      priceModal: {},
      oldList: [], // 数据备份
      fetchFlag: false, // 判断是否调用接口标识
      newLineFlag: false,
      conractFlag: false, // 协议flag
      setting: '0',
      checkContract: true, // 订单启用校验协议
      customizeCode: '', // 个性化编码
      headerCurrencyCode: '', // 头币种编码
      headerCurrencyName: '', // 头币种名
      returnOrderFlag: null,
      newPriceLibFlag: 0, // 是否引用新价格库
      itemChangePriceFlag: 0, // 是否通过物料引用新价格库
      priceUpdateList: [], // 可更新价格库的行
      referencePriceRecord: {}, // 参考价格所查询的订单行
      wrapperBOMModalVisible: false, // BOM弹窗visibel
      actionListRowData: {}, // BOM所属行
      priceModalPoLineDetailDTOs: [], // 参考价格弹框对应行的订单行数据
      enableSupplierSiteFlag: '',
      doubleUnitEnabled: 0, // 双单位配置是否开启
      amountCalcRule: 'Amount', // 金额计算配置
      stageIdList: null,
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { poHeaderId, sourcePage } = this.state;
    this.fetchEnum();
    if (poHeaderId && poHeaderId) {
      this.fetchDetailHeader();
      this.fetchDetailList();
      this.fetchSettings();
      // this.fetchNewPriceLibEnable();
      this.queryDoubleUomConfig();
      this.fetchItemNewPriceLibEnable();
    } else if (!poHeaderId && sourcePage === 'pageOrder') {
      this.fetchPageOrder();
    }

    window.addEventListener('message', this.handleEvent);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleEvent);
  }

  @Bind()
  handleEvent(e) {
    const { type, payload } = e.data;
    if (e.data === 'sodr/purchase-order-maintain/list') {
      this.fetchDetailHeader();
    } else if (type === 'sodr/purchase-order-maintain/list' && payload === 'GoodBABy') {
      this.fetchDetailHeader();
      this.fetchDetailList();
    }
  }

  /**
   * 查询列表值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({ type: 'quotePurchaseRequisition/fetchEnum' });
  }

  // 查询是否引用新价格库
  @Bind()
  fetchNewPriceLibEnable() {
    const { dispatch } = this.props;
    const { poHeaderId } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/fetchNewPriceLibEnable',
      payload: {
        poHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.setState({ newPriceLibFlag: res });
      }
    });
  }

  // 查询是否通过物料引用新价格库
  @Bind()
  fetchItemNewPriceLibEnable() {
    const { dispatch } = this.props;
    const { poHeaderId } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/fetchItemNewPriceLibEnable',
      payload: {
        poHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.setState({ itemChangePriceFlag: res });
      }
    });
  }

  // 查询是否双单位配置是否开启
  @Bind()
  queryDoubleUomConfig() {
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/queryDoubleUomConfig',
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({ doubleUnitEnabled: Number(res) });
      }
    });
  }

  @Bind()
  async fetchStageIdList(params) {
    const stageIdList = await getStageIdList(params);
    this.setState({ stageIdList });
  }

  // 查询金额计算配置
  @Bind()
  async fetchCalcRuleConfig() {
    const result = await queryCalcRuleConfig();
    this.setState({
      amountCalcRule: result,
    });
  }

  /**
   * fetchPageOrder - 手工新建订单初始数据查询
   */
  @Bind()
  fetchPageOrder() {
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/fetchPageOrder',
      payload: {
        customizeUnitCode: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          orderHeaderFormDataSource: res,
        });
      }
    });
  }

  /**
   * fetchDetailHeader - 查询配置中心
   */
  @Bind()
  fetchSettings() {
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/fetchSettings',
    }).then((res) => {
      if (res) {
        this.setState({
          setting: res['000112'],
          checkContract: !!(res['010224'] && res['010224'].includes('CONTRACT')),
        });
      }
    });
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader(flag) {
    this.fetchSettings();
    this.fetchNewPriceLibEnable();
    const { dispatch } = this.props;
    const { poHeaderId } = this.state;
    const customizeUnitCode = 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST';
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailHeader',
      payload: {
        poHeaderId,
        customizeUnitCode,
      },
    }).then(async (res) => {
      if (res) {
        this.fetchStageIdList({
          poTypeId: res.poTypeId,
          companyId: res.companyId,
        });
        // if (res.unSaveEnable !== 0) {
        //   const custRes = await getCustomizeData([customizeUnitCode]);
        //   // 临时方案：查询个性化接口，使 【未保存状态】申请转订单 的头信息 先取个性化默认值，再取接口值
        //   const fieldsArr = custRes['SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST']?.fields || [];
        //   const poTypeField = fieldsArr.find((t) => t.fieldCode === 'poTypeId') || {};
        //   const { defaultValue: poTypeId, defaultValueMeaning: poTypeDesc } = poTypeField;
        //   const defaultCustMap = getResponse(custRes) && { poTypeId, poTypeDesc };
        //   this.updateHeaderForm({ res, flag, defaultCustMap });
        // } else {
        this.updateHeaderForm({ res, flag });
        // }
      }
    });
  }

  @Bind()
  updateHeaderForm(param) {
    const { res, flag, defaultCustMap } = param;
    const { dispatch, form } = this.props;
    const lovRecord = {};
    [
      'supplierCompanyId',
      'supplierCompanyName',
      'supplierTenantId',
      'supplierId',
      'supplierName',
      'supplierCode',
    ].forEach((n) => {
      lovRecord[n] = res[n];
    });
    const { poSourcePlatform, currencyCode = '', currencyName = '', defaultEnabledFlag } = res;
    const code = this.getCustomizeCode(poSourcePlatform);
    this.setState(
      {
        orderHeaderFormDataSource: {
          ...res,
          ...defaultCustMap,
          currencyCode:
            (currencyCode === 'CNY' ? (defaultEnabledFlag ? 'CNY' : '') : currencyCode) ||
            (defaultEnabledFlag ? 'CNY' : ''),
          currencyName: currencyName || intl.get('hzero.common.currency.cny').d('人民币'),
          prepayFlag: isNil(res.prepayFlag) ? 0 : res.prepayFlag,
        },
        lovRecord,
        customizeCode: code,
        priceModal: {
          supplierCompanyId: res.supplierCompanyId || res.supplierId,
          ouId: res.ouId,
          companyId: res.companyId,
        },
        headerCurrencyCode:
          (currencyCode === 'CNY' ? (defaultEnabledFlag ? 'CNY' : '') : currencyCode) ||
          (defaultEnabledFlag ? 'CNY' : ''),
        headerCurrencyName: currencyName || intl.get('hzero.common.currency.cny').d('人民币'),
        returnOrderFlag: res.returnOrderFlag,
        enableSupplierSiteFlag: res.enableSupplierSiteFlag,
      },
      () => {
        form.resetFields();
        // 避免绑定uuid更新行数据 && 且数据已保存
        if (!flag) {
          // 查询价格库
          dispatch({
            type: 'quotePurchaseRequisition/fetchSettings',
          }).then((item) => {
            if (item && item['010224'] && item['010224'].includes('CONTRACT')) {
              this.setState({
                conractFlag: true,
              });
            }
          });
          // this.fetchDetailList();
          this.fetchPriceUpdateList();
        }
      }
    );
  }

  // 查询订单可更新价格库的行信息
  @Bind()
  fetchPriceUpdateList() {
    const { poHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/fetchPriceUpdateList',
      payload: { poHeaderId },
    }).then((res) => {
      if (res) {
        this.setState({
          priceUpdateList: res.map((item) => item.poLineId),
        });
      }
    });
  }

  // 根据价格库更新当前订单所有行的价格
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  priceUpdate() {
    const { poHeaderId, orderHeaderFormDataSource } = this.state;
    const { dispatch } = this.props;
    const { poSourcePlatform } = orderHeaderFormDataSource;
    const customizeCode = this.getCustomizeCode(poSourcePlatform);
    dispatch({
      type: 'quotePurchaseRequisition/priceUpdate',
      payload: {
        poHeaderId,
        query: {
          customizeUnitCode: `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`,
        },
      },
    }).then((res) => {
      if (res) {
        this.fetchDetailHeader();
        this.fetchDetailList();
        // this.fetchPriceUpdateList();
      }
    });
  }

  @Bind()
  getCustomizeCode(poSourcePlatform) {
    let code;
    switch (poSourcePlatform || this.state.poSourcePlatform) {
      case 'ERP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP';
        break;
      case 'E-COMMERCE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC';
        break;
      case 'SRM':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'SHOP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'CATALOGUE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE';
        break;
      default:
        code = null;
        break;
    }
    return code;
  }

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} page - 查询条件
   */
  @Bind()
  fetchDetailList(page = {}) {
    const { dispatch } = this.props;
    const { poHeaderId, poSourcePlatform, headerCurrencyCode, headerCurrencyName } = this.state;
    let code;
    switch (poSourcePlatform) {
      case 'ERP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP';
        break;
      case 'E-COMMERCE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC';
        break;
      case 'SRM':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'SHOP':
        code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
        break;
      case 'CATALOGUE':
        code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE';
        break;
      default:
        code = null;
        break;
    }
    this.setState({ listCommonDataSource: [] });
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailList',
      payload: {
        poHeaderId,
        page,
        poEntryPoint: 'PO_MAINTAIN_DETAIL',
        customizeUnitCode: code,
      },
    }).then((res) => {
      if (res && res.content) {
        this.setState(
          {
            selectedListRows: [],
            listCommonDataSource: res.content.map((n) => ({
              ...n,
              _status: 'update',
              prLineId: n.prLineId || uuid(),
              uuidFlag: !n.prLineId,
              tmpOrganizationId: n.invOrganizationId,
              headerCurrencyCode,
              headerCurrencyName,
              saveBomItemId: n.itemId,
            })),
            oldList: res.content.map((n) => ({
              ...n,
              _status: 'update',
              prLineId: n.prLineId || uuid(),
              uuidFlag: !n.prLineId,
              tmpOrganizationId: n.invOrganizationId,
            })),
            listCommonPagination: createPagination(res),
          },
          () => {
            this.state.listCommonDataSource.forEach((i) => {
              if (i.$form) i.$form.resetFields();
            });
            setTimeout(() => {
              this.forceUpdate();
            }, 0);
          }
        );
      }
    });
  }

  @Bind()
  afterOpenUploadModal(attachmentUuid, record) {
    if (isEmpty(record.attachmentUuid) && record._status !== 'create') {
      this.getLineAttachmentUuid(attachmentUuid, record);
    }
  }

  @Bind()
  getLineAttachmentUuid(attachmentUuid, record) {
    const { listCommonDataSource } = this.state;
    const { dispatch } = this.props;
    const { poLineId } = record;
    dispatch({
      type: 'quotePurchaseRequisition/getLineAttachmentUuid',
      data: { poLineId, attachmentUuid },
    }).then((res) => {
      if (res) {
        const newDataSource = listCommonDataSource.map((item) => {
          if (item.poLineId === res.poLineId) {
            const { attachmentUuid: newUuid, objectVersionNumber } = res;
            return {
              ...item,
              attachmentUuid: newUuid,
              lineVersionNumber: objectVersionNumber,
            };
          }
          return item;
        });
        this.setState({ listCommonDataSource: newDataSource });
      }
    });
  }

  /**
   * fetchDetailCreateList - 查询可创建行数据
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  @Bind()
  fetchDetailCreateList(params, success = (e) => e) {
    const { dispatch } = this.props;
    const { poHeaderId } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailCreateList',
      poHeaderId,
      params,
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * handleOrderSave - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  @Bind()
  handleOrderSaveOrSubmit(saveFlag) {
    const { orderHeaderFormDataSource } = this.state;
    const { unSaveEnable, poSourcePlatform } = orderHeaderFormDataSource; // 订单来源 采购申请标识
    if (poSourcePlatform === 'SRM' || poSourcePlatform === 'ERP' || poSourcePlatform === 'SHOP') {
      // 来源平台为SRM或ERP
      this.onRequestSave(unSaveEnable, saveFlag);
    } else {
      this.onNormalSave(saveFlag);
    }
  }

  /**
   * 采购申请保存
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  onRequestSave(unSaveEnable, saveFlag) {
    const { dispatch, form } = this.props;
    const {
      orderHeaderFormDataSource,
      tenantId,
      listCommonDataSource,
      lovRecord = {},
      customizeCode = '',
      poSourcePlatform,
    } = this.state;
    if (unSaveEnable) {
      // 采购申请先保存头
      form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const data = {
            poHeaderDetailDTO: {
              // ...merge(orderHeaderFormDataSource, values),
              ...orderHeaderFormDataSource,
              ...values,
              tenantId,
              remark: values?.remark || '',
              supplierCompanyId: lovRecord.supplierCompanyId,
              supplierCompanyName: lovRecord.supplierCompanyName,
              supplierTenantId: lovRecord.supplierTenantId,
              supplierId: lovRecord.supplierId || null,
              supplierName: lovRecord.supplierName || null,
              supplierCode: lovRecord.supplierNum || lovRecord.supplierCode || null,
            },
          };
          const payload = {
            data,
            customizeUnitCode: `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`,
          };
          const callback = (res) => {
            this.setState({
              poHeaderId: res.poHeaderId,
            });
            this.props.history.push({
              pathname: '/sodr/purchase-order-maintain/quote-purchase-requisition/line-newCreation',
              search: `?poHeaderId=${res.poHeaderId}&source=newRequisition&poSourcePlatform=${poSourcePlatform}`,
            });
            this.fetchDetailHeader();
            this.fetchDetailList();
            this.fetchItemNewPriceLibEnable();
            notification.success();
          };
          dispatch({
            type: 'quotePurchaseRequisition/saveWarn',
            payload,
          }).then((ras) => {
            if (!ras) return false;
            if (ras.value) {
              Modal.confirm({
                title: ras.message,
                okText: intl.get('hzero.common.button.sure').d('确定'),
                cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                onOk: throttle(
                  () => {
                    this.saveDetail(payload, 'quotePurchaseRequisition/newSave', true, callback);
                  },
                  THROTTLE_TIME,
                  { trailing: false }
                ),
              });
            } else {
              this.saveDetail(payload, 'quotePurchaseRequisition/newSave', true, callback);
            }
          });
        }
      });
    } else {
      form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const jsonArray = this.handleValidateColumns();
          if (
            listCommonDataSource.length === 0 ||
            (Array.isArray(jsonArray.lines) && jsonArray.lines.length !== 0)
          ) {
            const data = {
              poLineDetailDTOs: jsonArray.poLineDetailDTOs,
              poHeaderDetailDTO: {
                // ...merge(orderHeaderFormDataSource, values),
                ...orderHeaderFormDataSource,
                ...values,
                tenantId,
                remark: values?.remark || '',
                supplierCompanyId: lovRecord.supplierCompanyId,
                supplierCompanyName: lovRecord.supplierCompanyName,
                supplierTenantId: lovRecord.supplierTenantId,
                supplierId: lovRecord.supplierId || null,
                supplierName: lovRecord.supplierName || null,
                supplierCode: lovRecord.supplierNum || lovRecord.supplierCode || null,
              },
              poLineBasicDetailDTOs: [],
              poLineOtherDetailDTOs: [],
            };
            if (saveFlag) {
              const payload = {
                data,
                customizeUnitCode: `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`,
              };
              dispatch({
                type: 'quotePurchaseRequisition/saveWarn',
                payload,
              }).then((ras) => {
                if (!ras) return false;
                if (ras.value) {
                  Modal.confirm({
                    title: ras.message,
                    okText: intl.get('hzero.common.button.sure').d('确定'),
                    cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                    onOk: throttle(
                      () => {
                        this.saveDetail(payload, 'quotePurchaseRequisition/newSave', true);
                      },
                      THROTTLE_TIME,
                      { trailing: false }
                    ),
                  });
                } else {
                  this.saveDetail(payload, 'quotePurchaseRequisition/newSave', true);
                }
              });
            } else {
              dispatch({
                type: 'quotePurchaseRequisition/submitValidate',
                payload: {
                  data,
                  customizeUnitCode: `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`,
                },
              }).then((res) => {
                if (res) {
                  const budgetVerificationData = [
                    {
                      ...data.poHeaderDetailDTO,
                      saveFlag: 1,
                      viewCode: 'PENDING_DETAIL_VIEW',
                      poLineExpVOList: data.poLineDetailDTOs,
                    },
                  ];
                  const handleSubmit = () => {
                    dispatch({
                      type: 'quotePurchaseRequisition/submitDetail',
                      payload: {
                        data,
                        customizeUnitCode: `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`,
                      },
                    }).then((response) => {
                      if (response) {
                        notification.success();
                        if (response.minAmountInfo) {
                          notification.warning({
                            message: response.minAmountInfo,
                          });
                        }
                        this.handleSubmitBackPath();
                      }
                    });
                  };
                  if (res.result) {
                    Modal.confirm({
                      title: res.result,
                      okText: intl.get('hzero.common.button.sure').d('确定'),
                      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                      onOk: throttle(
                        () => {
                          dispatch({
                            type: 'quotePurchaseRequisition/addNewSubmitDetail',
                            payload: data,
                          }).then((ras) => {
                            if (ras) {
                              if (ras.value) {
                                Modal.confirm({
                                  title: ras.message,
                                  okText: intl.get('hzero.common.button.sure').d('确定'),
                                  cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                                  onOk: throttle(
                                    () =>
                                      handleOldBudgetVerification(
                                        dispatch,
                                        {
                                          type: 'quotePurchaseRequisition/oldBudgetVerification',
                                          payload: budgetVerificationData,
                                        },
                                        handleSubmit
                                      ),
                                    THROTTLE_TIME,
                                    { trailing: false }
                                  ),
                                });
                              } else {
                                handleOldBudgetVerification(
                                  dispatch,
                                  {
                                    type: 'quotePurchaseRequisition/oldBudgetVerification',
                                    payload: budgetVerificationData,
                                  },
                                  handleSubmit
                                );
                              }
                            }
                          });
                        },
                        THROTTLE_TIME,
                        { trailing: false }
                      ),
                    });
                  } else {
                    dispatch({
                      type: 'quotePurchaseRequisition/addNewSubmitDetail',
                      payload: data,
                    }).then((ras) => {
                      if (ras) {
                        if (ras.value) {
                          Modal.confirm({
                            title: ras.message,
                            okText: intl.get('hzero.common.button.sure').d('确定'),
                            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                            onOk: throttle(
                              () =>
                                handleOldBudgetVerification(
                                  dispatch,
                                  {
                                    type: 'quotePurchaseRequisition/oldBudgetVerification',
                                    payload: budgetVerificationData,
                                  },
                                  handleSubmit
                                ),
                              THROTTLE_TIME,
                              { trailing: false }
                            ),
                          });
                        } else {
                          handleOldBudgetVerification(
                            dispatch,
                            {
                              type: 'quotePurchaseRequisition/oldBudgetVerification',
                              payload: budgetVerificationData,
                            },
                            handleSubmit
                          );
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        }
      });
    }
  }

  @Bind()
  saveDetail(payload, type, showError, callback) {
    const { dispatch } = this.props;
    dispatch({ type, payload }).then((res) => {
      if (res) {
        if (callback) {
          callback(res);
        } else {
          notification.success();
          this.fetchDetailHeader();
          this.fetchDetailList();
          if (res.errorMsg && showError) {
            Modal.info({ title: res.errorMsg });
          }
          if (res.maintainErrorMsg && showError) {
            Modal.info({ title: res.maintainErrorMsg });
          }
        }
      }
    });
  }

  /**
   * 其他正常保存
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  onNormalSave(saveFlag) {
    const { dispatch, form } = this.props;
    const {
      orderHeaderFormDataSource,
      tenantId,
      listCommonDataSource,
      lovRecord = {},
      customizeCode = '',
    } = this.state;
    form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        const jsonArray = this.handleValidateColumns();
        if (
          listCommonDataSource.length === 0 ||
          (Array.isArray(jsonArray.lines) && jsonArray.lines.length !== 0)
        ) {
          const data = {
            poLineDetailDTOs: jsonArray.poLineDetailDTOs,
            poHeaderDetailDTO: {
              // ...merge(orderHeaderFormDataSource, values),
              ...orderHeaderFormDataSource,
              ...values,
              tenantId,
              remark: values?.remark || '',
              supplierCompanyId: lovRecord.supplierCompanyId,
              supplierCompanyName: lovRecord.supplierCompanyName,
              supplierTenantId: lovRecord.supplierTenantId,
              supplierId: lovRecord.supplierId || null,
              supplierName: lovRecord.supplierName || null,
              supplierCode: lovRecord.supplierNum || lovRecord.supplierCode || null,
            },
            poLineBasicDetailDTOs: [],
            poLineOtherDetailDTOs: [],
          };
          if (saveFlag) {
            const payload = {
              data,
              customizeUnitCode: `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`,
            };
            dispatch({
              type: 'quotePurchaseRequisition/saveWarn',
              payload,
            }).then((ras) => {
              if (!ras) return false;
              if (ras.value) {
                Modal.confirm({
                  title: ras.message,
                  okText: intl.get('hzero.common.button.sure').d('确定'),
                  cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                  onOk: throttle(
                    () => {
                      this.saveDetail(payload, 'quotePurchaseRequisition/add');
                    },
                    THROTTLE_TIME,
                    { trailing: false }
                  ),
                });
              } else {
                this.saveDetail(payload, 'quotePurchaseRequisition/add');
              }
            });
          } else {
            dispatch({
              type: 'quotePurchaseRequisition/addNewSubmitDetail',
              payload: data,
            }).then((ras) => {
              if (ras) {
                if (ras.value) {
                  Modal.confirm({
                    title: ras.message,
                    okText: intl.get('hzero.common.button.sure').d('确定'),
                    cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                    onOk: throttle(
                      () => {
                        dispatch({
                          type: 'quotePurchaseRequisition/submitDetail',
                          payload: {
                            data,
                            customizeUnitCode: `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`,
                          },
                        }).then((response) => {
                          if (response) {
                            notification.success();
                            this.handleSubmitBackPath();
                          }
                        });
                      },
                      THROTTLE_TIME,
                      { trailing: false }
                    ),
                  });
                } else {
                  dispatch({
                    type: 'quotePurchaseRequisition/submitDetail',
                    payload: {
                      data,
                      customizeUnitCode: `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`,
                    },
                  }).then((response) => {
                    if (response) {
                      notification.success();
                      // ps：暂时默认返回订单维护页
                      this.handleSubmitBackPath();
                    }
                  });
                }
              }
            });
          }
        }
      }
    });
  }

  /**
   * 处理订单提交后返回入口  ps： 暂时默认返回订单维护
   */
  @Bind()
  handleSubmitBackPath() {
    this.props.history.push({
      // pathname: '/sodr/purchase-order-maintain/list',
      pathname: this.handleBackParent(),
    });
  }

  /**
   * 提取保存/提交公用集合逻辑处理
   */
  @Bind()
  handleValidateColumns() {
    const {
      tenantId,
      listCommonDataSource,
      orderHeaderFormDataSource,
      doubleUnitEnabled,
    } = this.state;
    const lines = getEditTableData(
      listCommonDataSource,
      ['poLineId', '_status', 'saveBomItemId'],
      { container: document.querySelector('.ant-table-body') },
      { force: true }
    );
    if (doubleUnitEnabled && !validateLineCalculate({ data: lines, type: 'h0' })) return false;
    const transLines = lines.map((item) => {
      const { needByDate } = item;
      return {
        ...item,
        benchmarkPriceType: item.benchmarkPriceType ?? orderHeaderFormDataSource.benchmarkPriceType,
        tenantId,
        needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
        surfaceTreatFlag: item.surfaceTreatFlag ? 1 : 0,
        returnedFlag: item.returnedFlag ? 1 : 0,
        wbsCode: item.wbsCode || '',
        remark: item.remark || '',
        receiveToleranceQuantityType: item.receiveToleranceQuantityType || '',
      };
    });
    const poLineDetailDTOs = [...transLines].map((item) => {
      if (item.uuidFlag) {
        const { prLineId, ...other } = item;
        return other;
      }
      return item;
    });
    return { lines, poLineDetailDTOs };
  }

  /**
   * 用于子组件PurchaseRequestHeader标识
   */
  @Bind()
  changeFetchFlag(newFlag) {
    this.setState({ fetchFlag: newFlag });
  }

  /**
   * deleteDelivery - 作废送货单
   */
  @Bind()
  invalidDelivery() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.quotePurchaseRequisition.view.message.confirmDestroy`)
        .d('是否确认删除订单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: throttle(
        () => {
          dispatch({
            type: 'quotePurchaseRequisition/deleteSheetDelivery',
            payload: { ...orderHeaderFormDataSource },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: this.handleBackParent(),
                })
              );
            }
          });
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  }

  /**
   * handleAddLines - 新增采购申请行
   */
  @Bind()
  handleAddLines(selectedListRows) {
    const {
      form: { getFieldValue },
    } = this.props;
    const {
      listCommonDataSource,
      listCommonPagination,
      orderHeaderFormDataSource = {},
    } = this.state;
    const { currencyCode = '' } = orderHeaderFormDataSource;
    this.setState({
      listCommonDataSource: [
        ...listCommonDataSource,
        ...selectedListRows.map((n) => ({
          ...n,
          _status: 'create',
          priceShieldFlag: undefined,
          currencyCode: n.currencyCode || getFieldValue('currencyCode') || currencyCode,
          tmpOrganizationId: n.invOrganizationId,
          enteredTaxIncludedPrice: n.taxIncludedUnitPrice || null,
        })),
      ],
      listCommonPagination: addItemsToPagination(
        selectedListRows.length,
        listCommonDataSource.length,
        listCommonPagination
      ),
    });
  }

  /**
   * 处理税率
   */
  @Bind()
  handTaxDate(text, values, record) {
    const { listCommonDataSource } = this.state;
    const oldList = listCommonDataSource.findIndex((e) => e.poLineId === record.poLineId);
    // const price = record.$form.getFieldValue('enteredTaxIncludedPrice');
    const newDataSource = {
      ...record,
      taxId: values.taxId,
      taxRate: values.taxRate,
    };
    if (oldList > -1) {
      listCommonDataSource[oldList] = newDataSource;
    }
    this.setState({
      listCommonDataSource,
    });
    // 当税率Lov改变时计算并设置当前不含税单价的值
    // record.$form.setFieldsValue({ unitPrice: price / (1 + values.taxRate / 100) });
  }

  // 原币含税单价获取焦点事件
  @Bind()
  handleIncludedPriceFcous(record, dataList) {
    const {
      // setting,
      newPriceLibFlag,
      doubleUnitEnabled,
      listCommonDataSource = [],
      orderHeaderFormDataSource = {},
    } = this.state;
    const { dispatch, form } = this.props;
    const values = record.$form.getFieldsValue() || {};
    const headerFormValues = form.getFieldsValue() || {};
    const { prLineId, ...others } = record;
    const { summaryFlag } = orderHeaderFormDataSource;
    const poLineDetailDTOs = [
      {
        ...others,
        ...values,
        poLineId: record._status === 'create' ? -1 : record.poLineId,
        itemId: dataList ? dataList.itemId : values.itemId,
      },
    ];
    if (
      newPriceLibFlag === 1 &&
      (values?.itemCode || dataList?.itemCode) &&
      (summaryFlag !== 1 || !record.$form.getFieldValue('priceLibraryId') || dataList)
    ) {
      dispatch({
        type: 'quotePurchaseRequisition/fetchNewPriceLibData',
        payload: {
          poHeaderDetailDTO: {
            ...orderHeaderFormDataSource,
            ...headerFormValues,
          },
          poLineDetailDTOs,
        },
      }).then((res) => {
        //
        if (
          res &&
          !isEmpty(res) &&
          getResponse(res) &&
          // ((setting === '1' && res.uomId === record.$form.getFieldValue('uomId')) ||
          //   setting === '0' ||
          //   setting === null) &&
          (record.$form.getFieldValue('priceLibraryId') || res.priceLibId)
        ) {
          const {
            uomId,
            uomCodeAndName,
            uomName,
            currencyCode,
            taxId,
            taxRate,
            netPrice,
            priceLibId,
            taxIncludedPrice,
            unitPriceBatch,
            holdPcHeaderId,
            holdPcLineId,
            contractNum,
            benchmarkPriceType,
            ladderPriceLibId,
            ladderQuotationFlag,
            sourceFromId, // 价格来源单据头id
            sourceFrom, // 价格来源
            sourceFromLnId, // 报价行id
            sourceFromLnNum, // 价格来源单据行号
            sourceFromNum, // 价格来源单据号 | 寻源单号
            defaultPrecision,
            callRecordId, // 取价记录id
          } = res;
          // 开启则 校验价格库单位和行基本单位是否一致
          const sodrEnabled = doubleUnitEnabled !== 0;
          if (sodrEnabled && !validateDoubleUom({ price: res, record, sodrEnabled })) return;
          const newDataSource = listCommonDataSource.map((item) => {
            if (item.poLineId === record.poLineId) {
              if (!sodrEnabled) {
                const secondaryObj = {
                  secondaryUomId: uomId || dataList?.uomId,
                  secondaryUomName: uomName || dataList?.uomName,
                  secondaryUomCodeAndName:
                    uomCodeAndName ||
                    (dataList ? formatUom(dataList.uomCode, dataList.uomName) : null),
                };
                record.$form.setFieldsValue({ ...secondaryObj });
              }
              return {
                ...item,
                originUnitPrice: benchmarkPriceType === 'NET_PRICE' ? netPrice : taxIncludedPrice,
                holdPcHeaderId,
                holdPcLineId,
                currencyCode,
                benchmarkPriceType,
                unitPrice: netPrice,
                ladderPriceLibId,
                ladderQuotationFlag,
                enteredTaxIncludedPrice: taxIncludedPrice,
                priceId: sourceFromId,
                priceSource: sourceFrom,
                priceSourceNum: sourceFromNum,
                priceSourceLineNum: sourceFromLnNum,
                priceLineId: sourceFromLnId,
                callRecordId,
              };
            }
            return item;
          });
          this.handleChangeList(newDataSource, () => {
            record.$form.setFieldsValue({
              uomId: uomId || dataList?.uomId,
              uomName: uomName || dataList?.uomName,
              uomCodeAndName:
                uomCodeAndName || (dataList ? formatUom(dataList.uomCode, dataList.uomName) : null),
              currencyCode: currencyCode || record.currencyCode,
              taxId,
              taxRate,
              unitPrice: netPrice,
              enteredTaxIncludedPrice: taxIncludedPrice,
              unitPriceBatch,
              priceLibraryId: priceLibId,
              priceTaxId: taxId,
              contractNum,
              defaultPrecision,
              callRecordId,
            });
          });
        }
      });
    }
  }

  @Bind()
  handleAppendValidate(poLineDetailDTOList) {
    const { poHeaderId } = this.state;
    const { dispatch } = this.props;
    return dispatch({
      type: 'quotePurchaseRequisition/appendValidate',
      payload: {
        poHeaderId,
        poLineDetailDTOList,
      },
    });
  }

  /**
   * handleDeleteLines - 删除采购申请行
   */
  @Bind()
  handleDeleteLines(filtered, selectedListRows) {
    const { listCommonPagination, listCommonDataSource } = this.state;
    const remoteDelete = selectedListRows.filter((item) => item.poLineLocationId);
    if (remoteDelete.length > 0) {
      const newRemoteDelete = remoteDelete.map((item) => {
        return {
          ...item,
          versionNum: item.locationVersionNumber,
          canCreateAsnFlag: 0,
          tenantId: this.state.tenantId,
          prLineId: item.uuidFlag ? undefined : item.prLineId,
        };
      });
      this.handleDeleteLineRemote(newRemoteDelete).then((res) => {
        const isSuccessDeleted = isEmpty(res) && res !== undefined;
        if (isSuccessDeleted) {
          this.setState(
            {
              listCommonDataSource: filtered,
              listCommonPagination: delItemsToPagination(
                selectedListRows.length,
                listCommonDataSource,
                listCommonPagination
              ),
            },
            () => {
              notification.success();
              this.fetchDetailHeader();
              this.fetchDetailList();
            }
          );
        }
      });
    } else {
      this.setState({
        listCommonDataSource: filtered,
        listCommonPagination: delItemsToPagination(
          selectedListRows.length - remoteDelete.length,
          listCommonDataSource,
          listCommonPagination
        ),
      });
    }
  }

  /**
   * handleDeleteLines - 远程删除采购申请行
   */
  @Bind()
  handleDeleteLineRemote(filtered) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'quotePurchaseRequisition/deleteLineRemote',
      data: filtered,
    });
  }

  /**
   * 修改行数据
   * @param {Array} listCommonDataSource
   */
  @Bind()
  handleChangeList(listCommonDataSource, callback = (e) => e) {
    this.setState({ listCommonDataSource }, callback);
  }

  /**
   * 头添加批量维护字段
   * @param {Array} listCommonDataSource
   */
  @Bind()
  handleChangeHeader(orderHeaderFormDataSource) {
    this.setState({ orderHeaderFormDataSource });
  }

  /**
   * 修改Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  handleChangeLov(lovRecord = {}) {
    const {
      form: { registerField, setFieldsValue },
    } = this.props;

    this.setState({ lovRecord });
    const { supplierId, supplierCompanyId } = lovRecord;
    registerField('supplierId');
    setFieldsValue({ supplierId });
    const { listCommonDataSource, oldList, priceModal } = this.state;
    const newDateSource = listCommonDataSource.map((ele) => {
      if (
        ele.supplierCompanyId !== supplierId &&
        ele.supplierCompanyId !== supplierCompanyId &&
        ele.priceLibraryId
      ) {
        return oldList.find((obj) => obj.prLineId === ele.prLineId);
      } else {
        return ele;
      }
    });
    this.setState({
      listCommonDataSource: newDateSource,
      priceModal: { ...priceModal, supplierCompanyId: supplierCompanyId || supplierId },
    });
  }

  /**
   * 修改供应商Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  onChangeSupplierLov(lovRecord = {}) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const { supplierCompanyId } = lovRecord;
    const { orderHeaderFormDataSource } = this.state;
    const newOrderHeaderFormDataSource = {
      ...orderHeaderFormDataSource,
      supplierCompanyId,
    };
    setFieldsValue({ supplierSiteId: null });
    this.setState({
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
    });
  }

  /**
   * 修改采购组织Lov数据
   * @param {Object} lovRecord
   */
  @Bind()
  onPurchaseOrgChange(lovRecord = {}) {
    const {
      form: { setFieldsValue, getFieldsValue },
      dispatch,
    } = this.props;
    const { purchaseOrgId } = lovRecord;
    const { agentId: oldAgentId } = getFieldsValue() || {};
    const { orderHeaderFormDataSource } = this.state;
    const updateBindData = (data) => {
      const { purchaseAgentId: agentId, purchaseAgentName: agentName } = data;
      const newOrderHeaderFormDataSource = {
        ...orderHeaderFormDataSource,
        agentId,
        agentName,
      };
      this.setState({
        orderHeaderFormDataSource: newOrderHeaderFormDataSource,
      });
      setFieldsValue({ agentId, agentName });
    };
    if (isEmpty(lovRecord)) {
      updateBindData({
        purchaseAgentId: null,
        purchaseAgentName: null,
      });
    } else {
      dispatch({
        type: 'quotePurchaseRequisition/fetchAutoGetAgent',
        payload: { purchaseOrgId, purchaseAgentId: oldAgentId },
      }).then((res) => {
        if (res) {
          updateBindData(res);
        }
      });
    }
  }

  /**
   * 修改业务实体Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  onOuNameOnchange(lovRecord = {}) {
    const {
      form: { setFieldsValue, getFieldsValue },
      dispatch,
    } = this.props;
    const { companyId } = getFieldsValue();
    const { ouId, ouCode } = lovRecord;
    const { orderHeaderFormDataSource, priceModal } = this.state;
    let newOrderHeaderFormDataSource = {
      ...orderHeaderFormDataSource,
      ouId,
      ouCode,
    };
    setFieldsValue({ supplierSiteId: null });
    const { listCommonDataSource, oldList } = this.state;
    const newDateSource = listCommonDataSource.map((ele) => {
      if (ele.ouId !== ouId && ele.priceLibraryId) {
        return oldList.find((obj) => obj.prLineId === ele.prLineId);
      } else {
        return ele;
      }
    });
    this.setState({
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
      listCommonDataSource: newDateSource,
      priceModal: { ...priceModal, ouId },
    });
    const updateBindData = (data) => {
      const {
        purchaseOrgId,
        purchaseOrgName,
        purchaseAgentId: agentId,
        purchaseAgentName: agentName,
        organizationId: invOrganizationId,
        organizationCode: invOrganizationCode,
        organizationName: invOrganizationName,
      } = data;
      newOrderHeaderFormDataSource = {
        ...orderHeaderFormDataSource,
        ouId,
        purchaseOrgId,
        purchaseOrgName,
        agentId,
        agentName,
        organizationId: invOrganizationId,
        organizationCode: invOrganizationCode,
        organizationName: invOrganizationName,
      };
      this.setState({
        orderHeaderFormDataSource: newOrderHeaderFormDataSource,
      });
      setFieldsValue({ purchaseOrgId, purchaseOrgName, agentId, agentName });
      const newListCommonDataSource = listCommonDataSource.map((item) => {
        return { ...item, invOrganizationId, invOrganizationName };
      });
      this.setState({
        listCommonDataSource: newListCommonDataSource,
      });
      listCommonDataSource.forEach((e) => {
        if (e.$form) {
          e.$form.setFieldsValue({
            invOrganizationId,
          });
        }
      });
    };
    if (isEmpty(lovRecord)) {
      updateBindData({
        purchaseOrgId: null,
        purchaseOrgName: null,
        purchaseAgentId: null,
        purchaseAgentName: null,
        organizationId: null,
        organizationCode: null,
        organizationName: null,
      });
    } else {
      dispatch({
        type: 'quotePurchaseRequisition/fetchAutoGetCompany',
        payload: { companyId, ouId },
      }).then((res) => {
        if (res) {
          updateBindData(res);
        }
      });
    }
  }

  /**
   * addDetailLines - 添加可创建行数据
   * @param {object} data - 提交数据
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  @Bind()
  addDetailLines(data, success = (e) => e) {
    const { listCommonDataSource, listCommonPagination, poHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/addDetailLines',
      poHeaderId,
      data,
    }).then((res) => {
      if (res) {
        this.setState({
          listCommonDataSource: [...listCommonDataSource, ...res.poLineList],
          listCommonPagination: addItemToPagination(
            listCommonDataSource.length,
            listCommonPagination
          ),
        });
        success(res);
      }
    });
  }

  /**
   * deleteDetailLines - 删除明细行数据
   * @param {object} data - 提交数据
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  @Bind()
  deleteDetailLines(data, success = (e) => e) {
    const { dispatch, match = {} } = this.props;
    const { orderHeaderFormDataSource = {} } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/deleteDetailLines',
      poHeaderId: orderHeaderFormDataSource.poHeaderId || match.params.id,
      data,
    }).then((res) => {
      if (res) {
        success(res);
        this.fetchDetailList();
      }
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModal(attachmentUuid) {
    const { remote } = this.props;
    const { orderHeaderFormDataSource = {} } = this.state;
    const shouldBindUUID = orderHeaderFormDataSource.attachmentUuid;
    if (remote.process('isBindUUIDtoHeader', shouldBindUUID, { orderHeaderFormDataSource })) {
      this.getHeaderAttachmentUuid(attachmentUuid);
    }
  }

  /**
   * getHeaderAttachmentUuid - 获取头附件uuid
   * @param {!string} uuid - 附件uuid返回值
   */
  @Bind()
  getHeaderAttachmentUuid(attachmentUuid) {
    const { dispatch, remote } = this.props;
    const {
      orderHeaderFormDataSource: { poHeaderId },
    } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/saveAttachmentUUID',
      payload: { poHeaderId, uuid: attachmentUuid, uuidType: 1 },
    }).then((res) => {
      if (res) {
        const state = remote.process(
          'getHeaderAttachmentUuidStates',
          {
            orderHeaderFormDataSource: {
              ...this.state.orderHeaderFormDataSource,
              objectVersionNumber: res,
              attachmentUuid,
            },
          },
          { res }
        );
        this.setState(state);
      }
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModalLoad(getHeaderAttachmentUuidLoad) {
    const { orderHeaderFormDataSource = {} } = this.state;
    if (isEmpty(orderHeaderFormDataSource.purchaserInnerAttachmentUuid)) {
      this.getHeaderAttachmentUuidLoad(getHeaderAttachmentUuidLoad);
    }
  }

  /**
   * getHeaderAttachmentUuidLoad - 获取头附件uuid
   * @param {!string} uuid - 附件uuid返回值
   */
  @Bind()
  getHeaderAttachmentUuidLoad(getHeaderAttachmentUuidLoad) {
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource: { poHeaderId },
    } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/saveAttachmentUUID',
      payload: { poHeaderId, uuid: getHeaderAttachmentUuidLoad, uuidType: 3 },
    }).then((res) => {
      if (res) {
        this.setState({
          orderHeaderFormDataSource: {
            ...this.state.orderHeaderFormDataSource,
            objectVersionNumber: res,
            purchaserInnerAttachmentUuid: getHeaderAttachmentUuidLoad,
          },
        });
      }
    });
  }

  /**
   * 删除功能修改
   * 区分手工订单polineId,采购申请转订单prlineId
   */
  @Bind()
  handleCancelLines() {
    const {
      selectedListRows = [],
      listCommonPagination,
      listCommonDataSource,
      orderHeaderFormDataSource,
    } = this.state;
    const { sourceBillTypeCode, poSourcePlatform } = orderHeaderFormDataSource;
    const listCommonDataSourceDisplayLineNums = listCommonDataSource?.filter(
      (n) => n.displayLineNum
    );
    const selectedListRowsDisplayLineNums = selectedListRows?.filter((n) => n.displayLineNum);
    const existingDisplayLineNums = listCommonDataSourceDisplayLineNums?.filter(
      (n) => !selectedListRowsDisplayLineNums.includes(n)
    );
    if (
      (listCommonDataSource.length === 1 ||
        selectedListRows.length >= listCommonDataSource.length ||
        existingDisplayLineNums.length === 0) &&
      (poSourcePlatform === 'SRM' || poSourcePlatform === 'ERP' || poSourcePlatform === 'SHOP')
    ) {
      notification.warning({
        message: intl.get(`sodr.common.view.message.moreThanOne`).d('订单至少有一个订单行。'),
      });
    } else {
      Modal.confirm({
        title:
          sourceBillTypeCode === 'PURCHASE_REQUEST' &&
          (poSourcePlatform === 'SRM' || poSourcePlatform === 'ERP' || poSourcePlatform === 'SHOP')
            ? intl.get(`sodr.common.model.common.deltetList`).d('是否删除数据')
            : intl.get(`sodr.common.model.common.confirmDestroy`).d('是否确认取消行'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: throttle(
          () => {
            // 手工创建订单时
            if (sourceBillTypeCode === 'PURCHASE_ORDER') {
              const selectedRowKeys = selectedListRows.map((item) => item.poLineId);
              const filtered = listCommonDataSource.filter(
                (item) => !selectedRowKeys.includes(item.poLineId)
              );
              this.handleDeleteLines(filtered, selectedListRows);
              this.setState({
                listCommonDataSource: filtered,
                listCommonPagination: delItemsToPagination(
                  selectedListRows.length - selectedRowKeys.length,
                  listCommonDataSource,
                  listCommonPagination
                ),
                selectedListRows: filter(selectedListRows, { _status: 'update' }),
              });
            } else {
              // 采购申请转订单时
              const selectedRowKeys = selectedListRows.map((item) => item.poLineId);
              const filtered = listCommonDataSource.filter(
                (item) => !selectedRowKeys.includes(item.poLineId)
              );
              this.handleDeleteLines(filtered, selectedListRows);
              this.setState({
                listCommonDataSource: filtered,
                listCommonPagination: delItemsToPagination(
                  selectedListRows.length - selectedRowKeys.length,
                  listCommonDataSource,
                  listCommonPagination
                ),
                selectedListRows: filter(selectedListRows, { _status: 'update' }),
              });
            }
          },
          THROTTLE_TIME,
          { trailing: false }
        ),
      });
    }
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectedChange(_, selectedRows) {
    this.setState({ selectedListRows: selectedRows });
  }

  /**
   * 返回父级页面
   * maintain: 订单维护
   * @returns {*}
   */
  @Bind()
  handleBackParent() {
    const { sourcePage, entrance } = this.state;
    let router; // 默认返回订单维护
    if (entrance === 'maintain') {
      router = '/sodr/purchase-order-maintain/list';
    } else {
      switch (sourcePage) {
        case 'pageRequest': // 采购申请
          router = '/sodr/purchase-order-maintain/quote-purchase-requisition/list';
          break;
        case 'pageOrder': // 手工创建订单
          router = '/sodr/purchase-order-maintain/list';
          break;
        case 'pageSource': // 寻源
          router = '/sodr/purchase-order-maintain/source-from-requisition/list';
          break;
        case 'pageConract': // 协议
          router = '/sodr/purchase-order-maintain/purchase/list';
          break;
        default:
          router = '/sodr/purchase-order-maintain/list';
          break;
      }
    }
    return router;
  }

  @Bind()
  onHide(priceModalVisible) {
    this.setState({ priceModalVisible });
  }

  /**
   * 设置价格
   * @param val
   */
  @Bind()
  setPrice(val) {
    // 配置中心配置可修改且开启新价格库参考价格带出
    const {
      referencePriceRecord: record,
      listCommonDataSource = [],
      doubleUnitEnabled,
    } = this.state;
    if (
      val &&
      val.priceLibId
      // ((setting === '1' && val.uomId === record.$form.getFieldValue('uomId')) || setting === '0')
    ) {
      const {
        uomId,
        uomCodeAndName,
        uomName,
        currencyCode,
        taxId,
        taxRate,
        netPrice,
        priceLibId,
        taxIncludedPrice,
        unitPriceBatch,
        holdPcHeaderId,
        holdPcLineId,
        contractNum,
        benchmarkPriceType,
        ladderPriceLibId,
        ladderQuotationFlag,
        ladderPriceLibList = [],
        sourceFrom, // 价格来源
        sourceFromId, // 来源头id
        sourceFromLnId, // 报价行id
        sourceFromLnNum, // 价格来源单据行号
        sourceFromNum, // 价格来源单据号 | 寻源单号
        defaultPrecision,
      } = val;
      const quantity = record.$form.getFieldValue('quantity');
      const ladderPriceRecord = ladderPriceLibList.find(
        (item) =>
          math.gte(new BigNumber(quantity), new BigNumber(item.ladderFrom)) &&
          (math.lt(new BigNumber(quantity, new BigNumber(item.ladderTo))) ||
            math.lt(new BigNumber(quantity, new BigNumber(Infinity))))
      );
      const sodrEnabled = doubleUnitEnabled !== 0;
      if (sodrEnabled && !validateDoubleUom({ price: val, record, sodrEnabled })) return false;
      const newDataSource = listCommonDataSource.map((item) => {
        const unitPrice = ladderPriceRecord ? ladderPriceRecord.ladderNetPrice : netPrice;
        const enteredTaxIncludedPrice = ladderPriceRecord
          ? ladderPriceRecord.ladderPrice
          : taxIncludedPrice;
        if (item.poLineId === record.poLineId) {
          record.$form.setFieldsValue({
            uomId,
            uomName,
            uomCodeAndName,
            currencyCode,
            taxId,
            taxRate,
            unitPrice,
            enteredTaxIncludedPrice,
            unitPriceBatch,
            priceLibraryId: priceLibId,
            priceTaxId: taxId,
            contractNum,
            defaultPrecision,
          });
          if (!sodrEnabled) {
            const secondaryObj = {
              secondaryUomId: uomId,
              secondaryUomName: uomName,
              secondaryUomCodeAndName: uomCodeAndName,
            };
            record.$form.setFieldsValue({ ...secondaryObj });
          }
          return {
            ...item,
            originUnitPrice:
              benchmarkPriceType === 'NET_PRICE' ? unitPrice : enteredTaxIncludedPrice,
            holdPcHeaderId,
            holdPcLineId,
            benchmarkPriceType,
            unitPrice,
            ladderPriceLibId,
            ladderQuotationFlag,
            referencePriceFlag: 1,
            enteredTaxIncludedPrice,
            priceSource: sourceFrom,
            priceId: sourceFromId,
            priceSourceNum: sourceFromNum,
            priceSourceLineNum: sourceFromLnNum,
            priceLineId: sourceFromLnId,
          };
        }
        return item;
      });
      this.handleChangeList(newDataSource);
    }
  }

  @Bind()
  handleToolTipVisible(tip, visible) {
    this.setState({
      [tip]: visible,
    });
  }

  /**
   * 处理价格
   * @param record
   */
  @Bind()
  handlePrice(record) {
    const {
      priceLibraryId,
      $form: { getFieldsValue },
    } = record;
    const values = getFieldsValue();
    const { itemId, invOrganizationId, uomId, needByDate } = values;
    const { priceModal, orderHeaderFormDataSource } = this.state;
    const { form } = this.props;
    const { tempKey, ...headerFieldsValue } = filterNullValueObject(form.getFieldsValue());
    const newOrderHeaderFormDataSource = { ...orderHeaderFormDataSource, ...headerFieldsValue };
    const recordPrice = {
      ...priceModal,
      prLineId: record.prLineId,
      priceLibraryId,
      itemId,
      uomId,
      purchaseOrgId: form.getFieldValue('purchaseOrgId'),
      invOrganizationId,
    };
    const poLineDetailDTOs = [
      {
        ...record,
        ...values,
        needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
        poLineId: record._status === 'create' ? -1 : record.poLineId,
      },
    ];
    this.setState({
      referencePriceRecord: record,
      priceModal: recordPrice,
      priceModalPoLineDetailDTOs: poLineDetailDTOs,
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
    });
    if (!priceModal.supplierCompanyId || !priceModal.ouId) {
      notification.warning({
        message: intl.get('hzero.common.validation.supplier.notNull').d('供应商或采购组织不能为空'),
      });
    } else {
      const priceModalVisible = true;
      this.onHide(priceModalVisible);
    }
  }

  // 采购申请行分页处理
  @Bind()
  handleChangePagination(page = {}) {
    // const { newLineFlag } = this.state;
    // if (newLineFlag) {
    //   Modal.confirm({
    //     title: intl
    //       .get(`sodr.view.message.confirm.prline`)
    //       .d('数据发生改变，是否继续，会造成数据丢失'),
    //     okText: intl.get('hzero.common.button.sure').d('确定'),
    //     cancelText: intl.get('hzero.common.button.cancel').d('取消'),
    //     onOk: () => {
    //       this.setState({
    //         newLineFlag: false,
    //       });
    //     },
    //   });
    // } else {
    //   this.fetchDetailList(page);
    // }
    this.fetchDetailList(page);
  }

  @Bind()
  onDataChange(record, changeValues, allValues) {
    const { listCommonDataSource = [], orderHeaderFormDataSource = {} } = this.state;
    const { sourceBillTypeCode } = orderHeaderFormDataSource;
    const newlistCommonDataSource = listCommonDataSource.map((item) => {
      if (
        (sourceBillTypeCode === 'PURCHASE_ORDER' && item.poLineId === record.poLineId) ||
        (sourceBillTypeCode !== 'PURCHASE_ORDER' && item.prLineId === record.prLineId)
      ) {
        return {
          ...item,
          ...allValues,
          itemCode: record.itemCode,
        };
      }
      return item;
    });
    this.setState({ listCommonDataSource: newlistCommonDataSource });
  }

  /**
   * 表格form事件改变flag
   * @param flag
   */
  @Bind()
  hasChangeData(flag) {
    this.setState({
      newLineFlag: flag,
    });
  }

  /**
   * 是否渲染订单行
   * @returns {*}
   */
  @Bind
  renderOrderLine() {
    const { poHeaderId, orderHeaderFormDataSource } = this.state;
    const { poSourcePlatform, sourceBillTypeCode } = orderHeaderFormDataSource;
    if (poHeaderId) {
      // 采购申请
      if (sourceBillTypeCode === 'PURCHASE_REQUEST') {
        if (
          poSourcePlatform === 'SRM' ||
          poSourcePlatform === 'ERP' ||
          poSourcePlatform === 'SHOP'
        ) {
          // if (unSaveEnable === 0) {
          //   return true;
          // } else {
          //   return false;
          // }
          return true;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  /**
   * handcraftAdd - 手动新增信息行事件
   */
  @Bind()
  handcraftAdd() {
    const {
      listCommonDataSource,
      listCommonPagination,
      orderHeaderFormDataSource = {},
    } = this.state;
    // const { dataSource, pagination, dispatch } = this.props;
    const { currencyCode = '', benchmarkPriceType } = orderHeaderFormDataSource;
    const newDataSource = {
      poLineId: uuid(),
      _status: 'create',
      currencyCode,
      benchmarkPriceType,
    };
    this.setState({
      listCommonDataSource: [...listCommonDataSource, newDataSource],
      listCommonPagination: addItemToPagination(listCommonDataSource.length, listCommonPagination),
    });
  }

  /**
   * 修改公司Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  onChangeCompany(lovRecord = {}) {
    const {
      form: { setFieldsValue, getFieldsValue },
      dispatch,
    } = this.props;
    const {
      companyId,
      companyNum,
      companyName,
      currencyCode,
      currencyName,
      defaultEnabledFlag,
    } = lovRecord;
    const { orderHeaderFormDataSource, listCommonDataSource } = this.state;
    const { poTypeId } = getFieldsValue() || {};
    // const initData = {
    //   supplierName: '',
    //   supplierCompanyName: '',
    //   companyId,
    // };
    // const newOrderHeaderFormDataSource = {
    //   ...initData,
    //   ...orderHeaderFormDataSource,
    //   currencyCode:
    //     (currencyCode === 'CNY' ? (defaultEnabledFlag ? 'CNY' : '') : currencyCode) ||
    //     (defaultEnabledFlag ? 'CNY' : ''),
    //   currencyName: currencyName || intl.get('hzero.common.currency.cny').d('人民币'),
    // };
    // this.setState({
    //   orderHeaderFormDataSource: newOrderHeaderFormDataSource,
    // });
    setFieldsValue({
      companyCode: companyNum,
      companyName,
    });
    setFieldsValue({ tempKey: null });
    setFieldsValue({
      currencyCode:
        (currencyCode === 'CNY' ? (defaultEnabledFlag ? 'CNY' : '') : currencyCode) ||
        (defaultEnabledFlag ? 'CNY' : ''),
      currencyName: currencyName || intl.get('hzero.common.currency.cny').d('人民币'),
    });
    const updateBindData = (data) => {
      const {
        ouName,
        ouId,
        ouCode,
        purchaseOrgId,
        purchaseOrgName,
        purchaseAgentId: agentId,
        purchaseAgentName: agentName,
        organizationId: invOrganizationId,
        organizationCode: invOrganizationCode,
        organizationName: invOrganizationName,
      } = data;
      const newHeaderInfo = {
        ...orderHeaderFormDataSource,
        ouName,
        ouId,
        ouCode,
        companyId,
        currencyCode:
          (currencyCode === 'CNY' ? (defaultEnabledFlag ? 'CNY' : '') : currencyCode) ||
          (defaultEnabledFlag ? 'CNY' : ''),
        currencyName: currencyName || intl.get('hzero.common.currency.cny').d('人民币'),
        purchaseOrgId,
        purchaseOrgName,
        agentId,
        agentName,
        organizationId: invOrganizationId,
        organizationCode: invOrganizationCode,
        organizationName: invOrganizationName,
      };
      this.setState({
        orderHeaderFormDataSource: newHeaderInfo,
      });
      setFieldsValue({
        ouId,
        ouName,
        ouCode,
        purchaseOrgId,
        purchaseOrgName,
        agentId,
        agentName,
      });
      const newListCommonDataSource = listCommonDataSource.map((item) => {
        return { ...item, invOrganizationId, invOrganizationName };
      });
      this.setState({
        listCommonDataSource: newListCommonDataSource,
      });
      listCommonDataSource.forEach((e) => {
        if (e.$form) {
          e.$form.setFieldsValue({
            invOrganizationId,
          });
        }
      });
    };
    this.fetchStageIdList({ poTypeId, companyId });
    if (isEmpty(lovRecord)) {
      updateBindData({
        ouName: null,
        ouId: null,
        ouCode: null,
        purchaseOrgId: null,
        purchaseOrgName: null,
        purchaseAgentId: null,
        purchaseAgentName: null,
        organizationId: null,
        organizationCode: null,
        organizationName: null,
      });
    } else {
      dispatch({
        type: 'quotePurchaseRequisition/fetchAutoGetCompany',
        payload: { companyId },
      }).then((res) => {
        if (res) {
          updateBindData(res);
        }
      });
    }
  }

  /**
   * 修改结算供应商Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  onChangeSettleSupplierLov(lovRecord) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const {
      supplierCompanyId,
      supplierCompanyNum,
      supplierCompanyName,
      supplierId,
      supplierNum,
      supplierName,
      supplierTenantId,
    } = lovRecord;
    setFieldsValue({
      settleSupplierId: supplierCompanyId || null,
      settleSupplierCode: supplierCompanyNum || null,
      settleSupplierName: supplierCompanyName || null,
      settleErpSupplierId: supplierId || null,
      settleErpSupplierCode: supplierNum || null,
      settleErpSupplierName: supplierName || null,
      settleSupplierTenantId: supplierTenantId || null,
    });
  }

  /**
   * 拆分
   */
  @Bind()
  handleTranslate(record, callback) {
    const { listCommonDataSource = [], listCommonPagination = {} } = this.state;
    const newItem = {
      ...record,
      ...record.$form.getFieldsValue(),
      poLineId: uuid(),
      // prLineId: uuid(),
      displayLineNum: null,
      poLineLocationId: null,
      _status: 'create',
      objectVersionNuber: null,
      _token: null,
    };
    const indexList = listCommonDataSource.findIndex((e) => e.poLineId === record.poLineId);
    listCommonDataSource.splice(indexList + 1, 0, newItem);
    const newPagaination = addItemsToPagination(
      1,
      listCommonDataSource.length,
      listCommonPagination
    );
    this.setState(
      {
        listCommonDataSource,
        listCommonPagination: newPagaination,
      },
      () => {
        if (callback) {
          callback();
        }
      }
    );
  }

  @Bind()
  headerOnChangeForm(lovRecord = {}) {
    const {
      form: { getFieldsValue },
    } = this.props;
    const { companyId } = getFieldsValue() || {};
    const { listCommonDataSource } = this.state;
    const { returnOrderFlag, orderTypeId } = lovRecord;
    // this.orderListFormDataSourceForm.props.form.setFieldsValue({
    //   returnedFlag: _record,
    // });
    const newDateSource = listCommonDataSource.map((item) => {
      return {
        ...item,
        returnedFlag: returnOrderFlag,
      };
    });
    this.fetchStageIdList({ poTypeId: orderTypeId, companyId });
    this.setState({
      returnOrderFlag,
      listCommonDataSource: newDateSource,
    });
  }

  // BOM物料弹窗控制
  @Bind()
  changeBomVisibel(record) {
    if (record && record._status === 'create') {
      Modal.info({
        title: intl
          .get(`sodr.quotePurchase.view.message.openBOM`)
          .d('该订单行未保存，bom信息不能维护，请先保存！'),
      });
    } else {
      this.setState({
        wrapperBOMModalVisible: !!record,
        actionListRowData: record
          ? { ...record, ...(record.$form ? record.$form.getFieldsValue() : {}) }
          : {},
      });
    }
  }

  @Bind()
  validataOrg(type, payload = {}) {
    const { form, dispatch } = this.props;
    const clearItem = type === 'ouId' ? 'purchaseOrgId' : 'agentId';
    dispatch({
      type: 'quotePurchaseRequisition/validataOrg',
      payload,
    }).then((res) => {
      if (res) {
        form.setFieldsValue({ [clearItem]: undefined });
      }
    });
  }

  @Bind()
  async validateItemAndInv(invOrganizationId) {
    const { dispatch, form } = this.props;
    const {
      listCommonDataSource = [],
      selectedListRows = [],
      orderHeaderFormDataSource,
    } = this.state;
    const list = (isEmpty(selectedListRows) ? listCommonDataSource : selectedListRows).map((i) => {
      const { prLineId, ...others } = i;
      return {
        ...(i.uuidFlag ? others : i),
        ...(i.$form ? i.$form.getFieldsValue() : {}),
        poLineId: i._status === 'create' ? null : i.poLineId,
      };
    });
    const poHeaderDetailDTO = { ...orderHeaderFormDataSource, ...form.getFieldsValue() };
    const response = await dispatch({
      type: 'quotePurchaseRequisition/checkInvOrganization',
      payload: { list: { poHeaderDetailDTO, poLineDetailDTOs: list }, invOrganizationId },
    });
    return response !== 'SUCCESS';
  }

  /**
   * 按钮组
   * @returns
   */
  @Bind()
  headerBtnsRender() {
    const {
      saveLoading = false,
      unSaveLoading = false,
      newAddLoading = false,
      saveWarnLoading = false,
      deleteLineRemoteLoaing = false,
      deleteDeliveryLoading = false,
      queryDetailHeaderLoading = false,
      queryDetailListLoading = false,
      submitDetailLoading = false,
      validateLoading = false,
      addNewSubmitDetailLoading = false,
      budgetVerificationLoading = false,
      remote,
      form,
    } = this.props;
    const { orderHeaderFormDataSource = {} } = this.state;
    const {
      statusCode,
      unSaveEnable = 1,
      poHeaderId,
      attachmentUuid,
      purchaserInnerAttachmentUuid,
    } = orderHeaderFormDataSource;

    const loadingAll =
      saveLoading ||
      unSaveLoading ||
      newAddLoading ||
      saveWarnLoading ||
      validateLoading ||
      submitDetailLoading ||
      deleteDeliveryLoading ||
      deleteLineRemoteLoaing ||
      queryDetailHeaderLoading ||
      queryDetailListLoading ||
      addNewSubmitDetailLoading ||
      budgetVerificationLoading;

    const btns = [
      {
        name: 'save',
        child: intl.get(`hzero.common.button.save`).d('保存'),
        btnProps: {
          icon: 'save',
          type: 'primary',
          disabled: !this.state.poHeaderId,
          onClick: () => this.handleOrderSaveOrSubmit(true),
          loading: loadingAll,
        },
      },
      unSaveEnable === 0 && {
        name: 'check',
        child: intl.get(`hzero.common.button.submit`).d('提交'),
        btnProps: {
          icon: 'check',
          onClick: () => this.handleOrderSaveOrSubmit(false),
          loading: loadingAll,
        },
      },
      {
        name: 'outUuid',
        btnComp: UploadModal,
        btnProps: {
          btnProps: {
            icon: 'upload',
            disabled: !poHeaderId,
          },
          btnText: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
          showFilesNumber: true,
          attachmentUUID: attachmentUuid,
          bucketName: BUCKET_NAME,
          bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
          afterOpenUploadModal: this.afterOpenHeaderUploadModal,
        },
      },
      {
        name: 'innerUuid',
        btnComp: UploadModal,
        btnProps: {
          btnProps: {
            icon: 'upload',
            disabled: !poHeaderId,
          },
          btnText: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
          showFilesNumber: true,
          attachmentUUID: purchaserInnerAttachmentUuid,
          bucketName: BUCKET_NAME,
          bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
          afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
        },
      },
      statusCode !== 'REJECTED' && {
        name: 'delete',
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          icon: 'delete',
          onClick: this.invalidDelivery,
          loading: loadingAll,
        },
      },
    ];
    return remote.process('processHeaderBtn', btns, { form, orderHeaderFormDataSource });
  }

  /**
   * 修改付款条款Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  termsOnchange(lovRecord = {}) {
    //  const {
    //    form: { setFieldsValue },
    //  } = this.props;
    const { prepayFlag } = lovRecord;
    const { orderHeaderFormDataSource } = this.state;
    const newOrderHeaderFormDataSource = {
      ...orderHeaderFormDataSource,
      prepayFlag,
    };
    this.setState({
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
    });
    // setFieldsValue({ prepayFlag});
  }

  render() {
    const {
      form,
      customizeForm,
      customizeTable,
      saveLoading = false,
      newAddLoading = false,
      addDetailLinesLoading = false,
      deleteDetailLinesLoading = false,
      deleteLineRemoteLoaing = false,
      deleteDeliveryLoading = false,
      queryCreateListLoading = false,
      queryDetailHeaderLoading = false,
      queryDetailListLoading = false,
      submitDetailLoading = false,
      validating,
      priceUpdateLoading = false,
      fetchPriceUpdateListLoading = false,
      quotePurchaseRequisition: { enumMap },
      checkInvOrganizationLoading = false,
      customizeBtnGroup,
    } = this.props;
    const {
      collapseKeys,
      tenantId,
      selectedListRows,
      listCommonDataSource,
      listCommonPagination,
      isClearListCacheDataSource,
      isHeaderInfoFormDataSource,
      orderHeaderFormDataSource = {},
      lovRecord: { supplierCompanyId },
      priceModal,
      priceModalVisible,
      fetchFlag,
      conractFlag,
      sourcePage,
      setting,
      stageIdList,
      checkContract,
      returnOrderFlag,
      newPriceLibFlag,
      priceUpdateList,
      wrapperBOMModalVisible,
      actionListRowData,
      priceModalPoLineDetailDTOs,
      itemChangePriceFlag,
      enableSupplierSiteFlag,
      doubleUnitEnabled,
      amountCalcRule,
    } = this.state;
    const {
      prStatusCode,
      poHeaderId,
      poSourcePlatform,
      tieredPricingFlag,
      ouId,
      companyId,
      unSaveEnable = 1,
      sourceBillTypeCode,
    } = orderHeaderFormDataSource;
    const orderHeaderFormDataSourceFormProps = {
      sourcePage,
      form,
      fetchFlag,
      stageIdList,
      newAddLoading,
      customizeForm,
      poSourcePlatform,
      listCommonDataSource,
      poHeaderId: this.state.poHeaderId,
      loading: queryDetailHeaderLoading,
      onChangeListData: this.handleChangeLov,
      handleChangeList: this.handleChangeList,
      onChangeCompany: this.onChangeCompany,
      onOuNameOnchange: this.onOuNameOnchange,
      onPurchaseOrgChange: this.onPurchaseOrgChange,
      onChangeSettleSupplierLov: this.onChangeSettleSupplierLov,
      onFetchFlag: this.changeFetchFlag,
      onChangeSupplierLov: this.onChangeSupplierLov,
      headerOnChangeForm: this.headerOnChangeForm,
      dataSource: orderHeaderFormDataSource,
      onRef: (node) => {
        this.orderHeaderFormDataSourceForm = node;
      },
      validataOrg: this.validataOrg,
      enableSupplierSiteFlag,
      termsOnchange: this.termsOnchange,
    };
    const listProps = {
      tenantId,
      prStatusCode,
      validating,
      customizeTable,
      checkContract,
      supplierCompanyId,
      tieredPricingFlag,
      ouId,
      setting,
      companyId,
      priceUpdateList,
      returnOrderFlag,
      poSourcePlatform,
      priceUpdate: this.priceUpdate,
      priceUpdateLoading,
      fetchPriceUpdateListLoading,
      isClearListCacheDataSource,
      isHeaderInfoFormDataSource,
      addDetailLinesLoading,
      deleteDetailLinesLoading,
      deleteLineRemoteLoaing,
      queryCreateListLoading,
      selectedListRows,
      handTaxDate: this.handTaxDate,
      loading: queryDetailListLoading,
      dataSource: listCommonDataSource,
      pagination: listCommonPagination,
      headerInfo: orderHeaderFormDataSource,
      handleCancelLines: this.handleCancelLines,
      fetchDetailCreateList: this.fetchDetailCreateList,
      handleRowSelectedChange: this.handleRowSelectedChange,
      fetchList: this.fetchDetailList,
      handcraftAdd: this.handcraftAdd,
      handleAddLines: this.handleAddLines,
      handleDeleteLines: this.handleDeleteLines,
      addDetailLines: this.addDetailLines,
      deleteDetailLines: this.deleteDetailLines,
      onChangeListData: this.handleChangeList,
      afterOpenLineUploadModal: this.afterOpenLineUploadModal,
      onHandleAppendValidate: this.handleAppendValidate,
      onHide: this.onHide,
      showPriceModal: this.handlePrice,
      form,
      fetchFlag,
      handleChangePagination: this.handleChangePagination,
      onDataChange: this.onDataChange,
      hasChangeData: this.hasChangeData,
      conractFlag,
      handleTranslate: this.handleTranslate,
      afterOpenUploadModal: this.afterOpenUploadModal,
      onRef: (node) => {
        this.orderListFormDataSourceForm = node;
      },
      amountCalcRule,
      newPriceLibFlag,
      doubleUnitEnabled,
      itemChangePriceFlag,
      handleIncludedPriceFcous: this.handleIncludedPriceFcous,
      changeBomVisibel: this.changeBomVisibel,
      onChangeHeader: this.handleChangeHeader,
      saveLoading,
      queryDetailHeaderLoading,
      submitDetailLoading,
      deleteDeliveryLoading,
      queryDetailListLoading,
      enumMap,
      validateItemAndInv: this.validateItemAndInv,
      checkInvOrganizationLoading,
      customizeForm,
    };

    // 参考价格
    const priceModalProps = {
      newPriceLibFlag,
      orderHeaderFormDataSource,
      listCommonDataSource,
      visible: priceModalVisible,
      supplierCompanyId: priceModal.supplierCompanyId,
      companyId: priceModal.companyId,
      ouId: priceModal.ouId,
      itemId: priceModal.itemId,
      priceLibraryId: priceModal.priceLibraryId,
      sourceBillTypeCode,
      purchaseOrgId: priceModal.purchaseOrgId,
      invOrganizationId: priceModal.invOrganizationId,
      uomId: priceModal.uomId,
      prLineId: priceModal.prLineId,
      priceModalPoLineDetailDTOs,
      hideModal: this.handleToolTipVisible,
      onSetPrice: this.setPrice,
      customizeTable,
    };
    const deliveryAndBillProps = {
      form,
      dataSource: orderHeaderFormDataSource,
      loading: queryDetailHeaderLoading,
    };
    const wrapperBOMModalProps = {
      visible: wrapperBOMModalVisible,
      onCancel: this.changeBomVisibel,
      actionListRowData,
      poHeaderId,
      listCommonDataSource,
      handleChangeList: this.handleChangeList,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.quotePurchase.view.message.purchaseOrderMaintain`).d('订单维护')}
          backPath={this.handleBackParent()}
        >
          {customizeBtnGroup(
            { code: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtnsRender()} />
          )}
        </Header>
        <Content>
          {sourceBillTypeCode === 'PURCHASE_REQUEST' && [1, 2].includes(unSaveEnable) && (
            <p className={styles['order-top-title']}>
              <span />
              {intl
                .get(`sodr.quotePurchase.view.message.saveBeforeOperation`)
                .d('请先保存订单头信息，再操作订单行信息')}
            </p>
          )}
          <Spin spinning={false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`sodr.quotePurchase.view.message.orderHeaderInfo`).d('订单头信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('orderHeaderInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="orderHeaderInfo"
              >
                <PurchaseRequestHeader {...orderHeaderFormDataSourceFormProps} />
              </Panel>
              {this.state.poHeaderId && poSourcePlatform === 'E-COMMERCE' && (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl
                          .get(`sodr.quotePurchase.view.message.title.deliveryHeader`)
                          .d('收货/收单信息')}
                      </h3>
                      <a>
                        {collapseKeys.includes('deliveryInformationHeader')
                          ? intl.get('hzero.common.button.up').d('收起')
                          : intl.get('hzero.common.button.expand').d('展开')}
                      </a>
                      <Icon
                        type={collapseKeys.includes('deliveryInformationHeader') ? 'up' : 'down'}
                      />
                    </Fragment>
                  }
                  key="deliveryInformationHeader"
                >
                  <DeliveryInformationHeader {...deliveryAndBillProps} />
                </Panel>
              )}
              {this.state.poHeaderId && poSourcePlatform === 'E-COMMERCE' && (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl
                          .get(`sodr.quotePurchase.view.message.billingInformation`)
                          .d('开票信息')}
                      </h3>
                      <a>
                        {collapseKeys.includes('billingInformation')
                          ? intl.get('hzero.common.button.up').d('收起')
                          : intl.get('hzero.common.button.expand').d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('billingInformation') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="billingInformation"
                >
                  <BillingInformation {...deliveryAndBillProps} />
                </Panel>
              )}
              {this.renderOrderLine() && (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl
                          .get(`sodr.quotePurchaseRequisition.view.message.orderLineInfo`)
                          .d('订单行信息')}
                      </h3>
                      <a>
                        {collapseKeys.includes('orderLineInfo')
                          ? intl.get('hzero.common.button.up').d('收起')
                          : intl.get('hzero.common.button.expand').d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('orderLineInfo') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="orderLineInfo"
                >
                  <PurchaseLineInfo {...listProps} />
                </Panel>
              )}
            </Collapse>
          </Spin>
        </Content>
        {priceModalVisible && <PriceModle {...priceModalProps} />}
        {wrapperBOMModalVisible && <WrapperBOMModal {...wrapperBOMModalProps} />}
      </Fragment>
    );
  }
}
