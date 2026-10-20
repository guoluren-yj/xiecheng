/**
 * index - 按行引用创建-并单
 * @date: 2020-11-17
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Spin, Collapse, Icon, Modal, Form, Tabs } from 'hzero-ui';
import { connect } from 'dva';

import { isEmpty, merge, filter, isNil, throttle } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';

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
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DATETIME_MIN, DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { BUCKET_NAME, THROTTLE_TIME } from '@/routes/components/utils/constant';
import {
  formatUom,
  validateDoubleUom,
  queryCalcRuleConfig,
  validateLineCalculate,
  handleOldBudgetVerification,
} from '@/routes/components/utils';
import PurchaseRequestHeader from './PurchaseRequestHeader';
import HeaderForm from './HeaderForm';
import PurchaseLineInfo from './PurchaseLineInfo';
import ListInfo from './ListInfo';
import PriceModle from './PriceModal';
import DeliveryInformationHeader from './DeliveryInformationHeader';
import WrapperBOMModal from '../../components/BOMModal';
// import BillingInformation from './BillingInformation';
import styles from './Header.less';

const { Panel } = Collapse;
/**
 * 使用 Tabs.TabPane 组件
 */
const { TabPane } = Tabs;

// const pathname_ = {
//   contract: '/sodr/purchase-order-maintain/purchase/list',
// };
@withCustomize({
  unitCode: [
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP',
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC',
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE',
    'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
    'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_CATALOGUE',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_ERP',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
  ],
})
@formatterCollections({
  code: [
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
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, quotePurchaseRequisition }) => ({
  fetchDetailTableLoading: loading.effects['quotePurchaseRequisition/fetchDetailTable'],
  saveLoading: loading.effects['quotePurchaseRequisition/add'],
  newSaveLoading: loading.effects['quotePurchaseRequisition/newSave'],
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
  validateLoading: loading.effects['quotePurchaseRequisition/submitValidate'],
  priceUpdateLoading: loading.effects['quotePurchaseRequisition/priceUpdate'],
  fetchPriceUpdateListLoading: loading.effects['quotePurchaseRequisition/fetchPriceUpdateList'],
  budgetVerificationLoading: loading.effects['quotePurchaseRequisition/oldBudgetVerification'],
  queryDoubleUomConfigLoading: loading.effects['quotePurchaseRequisition/queryDoubleUomConfig'],
  quotePurchaseRequisition,
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { cacheKey, source, sourcePage, entrance } = querystring.parse(search.substr(1));
    this.state = {
      cacheKey,
      source,
      sourcePage,
      entrance,
      lovRecord: {},
      orderHeaderFormDataSource: {}, // 头form数据源
      listCommonDataSource: [], // 表格数据源
      listCommonPagination: {}, // 表格分页
      collapseKeys: ['orderHeaderInfo', 'orderLineInfo', 'deliveryInformationHeader'], // 打开的折叠面板key
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
      dimensions: [], // tab数据
      poHeaderIdList: {}, // 初始化的id(对象内置id)
      nowId: null, // 当前tab页的id
      priceUpdateList: [], // 可更新价格库的行
      referencePriceRecord: {}, // 参考价格所查询的订单行
      wrapperBOMModalVisible: false, // BOM弹窗visibel
      actionListRowData: {}, // BOM所属行
      initialAttachmentUuid: '', // 初始化外部附件
      initialPurchaserInnerAttachmentUuid: '', // 初始化内部附件
      doubleUnitEnabled: 0, // 双单位配置是否开启
      amountCalcRule: 'Amount', // 金额计算配置
    };
  }

  // headerInfoForms = {};

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    this.fetchEnum();
    this.fetchDetailTable();
    this.fetchCalcRuleConfig();
    this.queryDoubleUomConfig();
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

  @Bind()
  fetchDetailTable(numId) {
    const { dispatch } = this.props;
    const { cacheKey } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/fetchDetailTable',
      payload: { cacheKey },
    }).then((res) => {
      if (res) {
        this.setState({
          dimensions: res instanceof Array ? res : [],
          poHeaderIdList: res[0] || {}, // 默认获取第一条数据,取id
          nowId: res[0].poHeaderId || null,
        });
        this.fetchDetailHeader(numId);
        // this.fetchDetailList(numId);
        this.fetchSettings();
        this.fetchNewPriceLibEnable();
      }
    });
  }

  // 查询是否引用新价格库
  @Bind()
  fetchNewPriceLibEnable() {
    const { dispatch } = this.props;
    const { poHeaderIdList } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/fetchNewPriceLibEnable',
      payload: {
        poHeaderId: poHeaderIdList.poHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.setState({ newPriceLibFlag: res });
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

  // 查询金额计算配置
  @Bind()
  async fetchCalcRuleConfig() {
    const result = await queryCalcRuleConfig();
    this.setState({
      amountCalcRule: result,
    });
  }

  // 查询订单可更新价格库的行信息
  @Bind()
  fetchPriceUpdateList() {
    const { poHeaderIdList } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/fetchPriceUpdateList',
      payload: { poHeaderId: poHeaderIdList.poHeaderId },
    }).then((res) => {
      if (res) {
        this.setState({
          priceUpdateList: res.map((item) => item.poLineId),
        });
      }
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
      if (res && res['010224'] && res['010224'].includes('CONTRACT')) {
        this.setState({
          conractFlag: true,
        });
      }
      if (res) {
        this.setState({
          setting: res['000112'],
        });
      }
    });
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader(numId, flag) {
    this.fetchSettings();
    const { dispatch, form } = this.props;
    const { poHeaderIdList } = this.state;
    this.setState({ orderHeaderFormDataSource: {} });
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailHeader',
      payload: {
        poHeaderId: numId || poHeaderIdList.poHeaderId,
        customizeUnitCode: 'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
      },
    }).then((res) => {
      if (res) {
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
        const {
          poSourcePlatform,
          currencyCode = '',
          currencyName = '',
          attachmentUuid = '',
          purchaserInnerAttachmentUuid = '',
        } = res;
        const code = this.getCustomizeCode(poSourcePlatform);
        this.setState(
          {
            orderHeaderFormDataSource: {
              ...res,
              currencyCode: currencyCode || 'CNY',
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
            headerCurrencyCode: currencyCode || 'CNY',
            headerCurrencyName: currencyName || intl.get('hzero.common.currency.cny').d('人民币'),
            returnOrderFlag: res.returnOrderFlag,
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
              this.fetchDetailList(numId);
              this.fetchPriceUpdateList();
            }
          }
        );
        Promise.all(
          [attachmentUuid, purchaserInnerAttachmentUuid]
            .filter((n) => !n)
            .map(() => {
              return this.createUuid();
            })
        ).then((response) => {
          if (response && response.length > 0) {
            this.setState({
              initialAttachmentUuid: response[0].content,
              initialPurchaserInnerAttachmentUuid:
                response.length === 2 ? response[1].content : response[0].content,
            });
          }
        });
      }
    });
  }

  @Bind()
  getCustomizeCode(poSourcePlatform) {
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
    return code;
  }

  @Bind()
  createUuid() {
    const { dispatch } = this.props;
    return new Promise((resolve) => {
      dispatch({
        type: 'quotePurchaseRequisition/createUuid',
      }).then((res) => {
        if (res) {
          return resolve(res);
        }
      });
    });
  }

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} page - 查询条件
   */
  @Bind()
  fetchDetailList(numId, page = {}) {
    const { dispatch } = this.props;
    const {
      poHeaderIdList,
      // orderHeaderFormDataSource,
      headerCurrencyCode,
      headerCurrencyName,
    } = this.state;
    // const { poSourcePlatform } = orderHeaderFormDataSource;
    // let code;
    // switch (poSourcePlatform) {
    //   case 'ERP':
    //     code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP';
    //     break;
    //   case 'E-COMMERCE':
    //     code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC';
    //     break;
    //   case 'SRM':
    //     code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
    //     break;
    //   case 'SHOP':
    //     code = 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION';
    //     break;
    //   case 'CATALOGUE':
    //     code = 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE';
    //     break;
    //   default:
    //     code = null;
    //     break;
    // }
    this.setState({ listCommonDataSource: [] });
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailList',
      payload: {
        poHeaderId: numId || poHeaderIdList.poHeaderId,
        page,
        poEntryPoint: 'PO_MAINTAIN_DETAIL',
        customizeUnitCode: 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
      },
    }).then((res) => {
      if (res && res.content) {
        this.setState({
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
        });
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
    const { poHeaderIdList } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailCreateList',
      poHeaderId: poHeaderIdList.poHeaderId,
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
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource,
      tenantId,
      listCommonDataSource,
      lovRecord = {},
      customizeCode = '',
      dimensions,
      cacheKey,
      doubleUnitEnabled,
    } = this.state;
    if (unSaveEnable) {
      // 采购申请先保存头
      this.orderHeaderFormDataSourceForm.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const data = {
            poHeaderDetailDTO: {
              ...merge(orderHeaderFormDataSource, values),
              tenantId,
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
                    this.saveDetail(payload, 'quotePurchaseRequisition/newSave');
                  },
                  THROTTLE_TIME,
                  { trailing: false }
                ),
              });
            } else {
              this.saveDetail(payload, 'quotePurchaseRequisition/newSave');
            }
          });
        }
      });
    } else {
      this.orderHeaderFormDataSourceForm.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const jsonArray = this.handleValidateColumns();
          if (doubleUnitEnabled && !validateLineCalculate({ data: jsonArray.lines, type: 'h0' })) {
            return false;
          }
          if (
            listCommonDataSource.length === 0 ||
            (Array.isArray(jsonArray.lines) && jsonArray.lines.length !== 0)
          ) {
            const data = {
              poLineDetailDTOs: jsonArray.poLineDetailDTOs,
              poHeaderDetailDTO: {
                ...merge(orderHeaderFormDataSource, values),
                tenantId,
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
            const subData = {
              poLineDetailDTOs: jsonArray.poLineDetailDTOs,
              poHeaderDetailDTO: {
                ...merge(orderHeaderFormDataSource, values),
                tenantId,
                cacheKey,
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
                      ...subData.poHeaderDetailDTO,
                      saveFlag: 1,
                      viewCode: 'PENDING_DETAIL_VIEW',
                      poLineExpVOList: data.poLineDetailDTOs,
                    },
                  ];
                  const handleSubmit = () => {
                    dispatch({
                      type: 'quotePurchaseRequisition/submitDetail',
                      payload: {
                        data: subData,
                        customizeUnitCode: `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`,
                      },
                    }).then((response) => {
                      if (response?.minAmountInfo) {
                        notification.warning({
                          message: response.minAmountInfo,
                        });
                      }
                      if (response && dimensions.length !== 1) {
                        this.fetchDetailTable();
                        this.fetchDetailList();
                        notification.success();
                      } else if (response && dimensions.length === 1) {
                        notification.success();
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
        }
      });
    }
  }

  /**
   * 其他正常保存
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  onNormalSave(saveFlag) {
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource,
      tenantId,
      listCommonDataSource,
      lovRecord = {},
      customizeCode = '',
      dimensions,
      cacheKey,
    } = this.state;
    this.orderHeaderFormDataSourceForm.props.form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        const jsonArray = this.handleValidateColumns();
        if (
          listCommonDataSource.length === 0 ||
          (Array.isArray(jsonArray.lines) && jsonArray.lines.length !== 0)
        ) {
          const data = {
            poLineDetailDTOs: jsonArray.poLineDetailDTOs,
            poHeaderDetailDTO: {
              ...merge(orderHeaderFormDataSource, values),
              tenantId,
              cacheKey,
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
              }).then((res) => {
                if (res && dimensions.length !== 1) {
                  this.fetchDetailTable();
                  this.fetchDetailList();
                  notification.success();
                } else if (res && dimensions.length === 1) {
                  notification.success();
                  this.handleSubmitBackPath();
                }
              });
            };
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
      }
    });
  }

  @Bind()
  saveDetail(payload, type, showError) {
    const { dispatch } = this.props;
    const { nowId } = this.state;
    dispatch({ type, payload }).then((res) => {
      this.fetchDetailHeader(nowId);
      // this.fetchDetailList(nowId);
      notification.success();
      if (res.errorMsg && showError) {
        Modal.info({ title: res.errorMsg });
      }
      if (res.maintainErrorMsg && showError) {
        Modal.info({ title: res.maintainErrorMsg });
      }
    });
  }

  /**
   * 处理订单提交后返回入口  ps： 暂时默认返回订单维护
   */
  @Bind()
  handleSubmitBackPath() {
    this.props.history.push({
      pathname: '/sodr/purchase-order-maintain/list',
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
      //  newPriceLibFlag,
      orderHeaderFormDataSource,
    } = this.state;
    const lines = getEditTableData(
      listCommonDataSource,
      ['poLineId', '_status'],
      { container: document.querySelector('.ant-table-body') },
      { force: true }
    );
    const transLines = lines.map((item) => {
      const { needByDate } = item;
      return {
        ...item,
        // unitPrice:
        //   item.benchmarkPriceType === 'NET_PRICE'
        //     ? item.unitPrice
        //     : listCommonDataSource[index].unitPrice,
        //  enteredTaxIncludedPrice: listCommonDataSource[index].enteredTaxIncludedPrice,
        // priceLibraryId: listCommonDataSource[index].priceLibraryId,
        benchmarkPriceType: item.benchmarkPriceType ?? orderHeaderFormDataSource.benchmarkPriceType,
        tenantId,
        needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
        surfaceTreatFlag: item.surfaceTreatFlag ? 1 : 0,
        returnedFlag: item.returnedFlag ? 1 : 0,
        wbsCode: item.wbsCode || '',
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
    const { cacheKey, orderHeaderFormDataSource, dimensions } = this.state;
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
            payload: { ...orderHeaderFormDataSource, cacheKey },
          }).then(() => {
            if (dimensions.length !== 1) {
              this.setState({ nowId: undefined });
              this.fetchDetailTable();
              // this.fetchDetailList();
              notification.success();
            } else {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: '/sodr/purchase-order-maintain/list',
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
    const poLineDetailDTOs = [
      {
        ...others,
        ...values,
        poLineId: record._status === 'create' ? -1 : record.poLineId,
      },
    ];
    if (newPriceLibFlag === 1 && values.itemCode && values.freeFlag !== 1) {
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
            sourceFrom, // 价格来源
            sourceFromId, // 来源头id
            sourceFromLnId, // 报价行id
            sourceFromLnNum, // 价格来源单据行号
            sourceFromNum, // 价格来源单据号 | 寻源单号
            defaultPrecision,
          } = res;
          // 开启则 校验价格库单位和行基本单位是否一致
          const sodrEnabled = doubleUnitEnabled !== 0;
          if (sodrEnabled && !validateDoubleUom({ price: res, record, sodrEnabled })) return;
          const newDataSource = listCommonDataSource.map((item) => {
            if (item.poLineId === record.poLineId) {
              record.$form.setFieldsValue({
                uomId,
                uomName,
                uomCodeAndName,
                currencyCode,
                taxId,
                taxRate,
                unitPrice: netPrice,
                enteredTaxIncludedPrice: taxIncludedPrice,
                unitPriceBatch,
                priceLibraryId: priceLibId,
                priceTaxId: taxId,
                contractNum,
                defaultPrecision,
              });
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
    const { listCommonPagination, listCommonDataSource, nowId } = this.state;
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
              this.fetchDetailList(nowId);
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
  handleChangeList(listCommonDataSource) {
    this.setState({ listCommonDataSource });
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
   * 修改业务实体Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  onOuNameOnchange(lovRecord = {}) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const { ouId, invOrganizationId, invOrganizationCode, invOrganizationName } = lovRecord;
    const { orderHeaderFormDataSource, priceModal } = this.state;
    const newOrderHeaderFormDataSource = {
      ...orderHeaderFormDataSource,
      ouId,
    };
    const { listCommonDataSource, oldList } = this.state;
    const newDateSource = listCommonDataSource.map((ele) => {
      if (ele.ouId !== ouId && ele.priceLibraryId) {
        return oldList.find((obj) => obj.prLineId === ele.prLineId);
      } else {
        return ele;
      }
    });
    setFieldsValue({ supplierSiteId: null });
    this.setState({
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
      listCommonDataSource: newDateSource,
      priceModal: { ...priceModal, ouId },
    });
    const newListCommonDataSource = listCommonDataSource.map((item) => {
      return { ...item, invOrganizationId, invOrganizationCode, invOrganizationName };
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
    const { orderHeaderFormDataSource = {}, nowId } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/deleteDetailLines',
      poHeaderId: orderHeaderFormDataSource.poHeaderId || match.params.id,
      data,
    }).then((res) => {
      if (res) {
        success(res);
        this.fetchDetailList(nowId);
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
    const { orderHeaderFormDataSource = {} } = this.state;
    if (isEmpty(orderHeaderFormDataSource.attachmentUuid)) {
      this.getHeaderAttachmentUuid(attachmentUuid);
    }
  }

  /**
   * getHeaderAttachmentUuid - 获取头附件uuid
   * @param {!string} uuid - 附件uuid返回值
   */
  @Bind()
  getHeaderAttachmentUuid(attachmentUuid) {
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource: { poHeaderId },
      // nowId,
    } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/saveAttachmentUUID',
      payload: { poHeaderId, uuid: attachmentUuid, uuidType: 1 },
    }).then((res) => {
      if (res) {
        this.setState({
          orderHeaderFormDataSource: {
            ...this.state.orderHeaderFormDataSource,
            objectVersionNumber: res,
            attachmentUuid,
          },
        });
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
      // nowId,
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
    const listCommonDataSourceDisplayLineNums = listCommonDataSource?.filter(
      (n) => n.displayLineNum
    );
    const selectedListRowsDisplayLineNums = selectedListRows?.filter((n) => n.displayLineNum);
    const existingDisplayLineNums = listCommonDataSourceDisplayLineNums?.filter(
      (n) => !selectedListRowsDisplayLineNums.includes(n)
    );
    const { sourceBillTypeCode, poSourcePlatform } = orderHeaderFormDataSource;
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
    // const {
    //   priceModal: { prLineId, supplierCompanyId, ouId },
    //   listCommonDataSource,
    //   oldList,
    // } = this.state;
    // const { unitPrice, ladderPriceLibList } = val;
    // const index = listCommonDataSource.findIndex((ele) => ele.prLineId === prLineId);

    // if (index !== -1 && isArray(ladderPriceLibList) && ladderPriceLibList[0]) {
    //   const { quantity } = listCommonDataSource[index];
    //   // eslint-disable-next-line array-callback-return
    //   let price = ladderPriceLibList.find(
    //     (ele) => quantity >= ele.ladderFrom && quantity < ele.ladderTo
    //   );
    //   if (!price) {
    //     price = unitPrice;
    //   }
    //   const newDataSource = listCommonDataSource.map((item) => {
    //     if (item.prLineId === prLineId) {
    //       item.$form.setFieldsValue('unitPrice');
    //       item.$form.setFieldsValue('priceLibraryId');
    //       return {
    //         ...item,
    //         supplierCompanyId,
    //         ouId,
    //         enteredTaxIncludedPrice:
    //           price && price.ladderPrice
    //             ? price.ladderPrice
    //             : listCommonDataSource[index].unitPrice,
    //         unitPrice:
    //           price && price.ladderPrice
    //             ? price.ladderPrice / (1 + item.taxRate * 0.01)
    //             : listCommonDataSource[index].enteredTaxIncludedPrice,
    //         referPrice: price && price.ladderPrice ? 1 : 0,
    //         priceLibraryId: price && price.priceLibraryId ? price.priceLibraryId : null,
    //       };
    //     } else {
    //       return { ...item, priceLibraryId: item.priceLibraryId };
    //     }
    //   });
    //   this.handleChangeList(newDataSource);
    // }
    // if (!isEmpty(val)) {
    //   const newDataSource = listCommonDataSource.map((item) => {
    //     if (item.prLineId === prLineId) {
    //       item.$form.setFieldsValue('unitPrice');
    //       item.$form.setFieldsValue('priceLibraryId');
    //       return {
    //         ...item,
    //         supplierCompanyId,
    //         ouId,
    //         enteredTaxIncludedPrice: unitPrice || listCommonDataSource[index].unitPrice,
    //         unitPrice: unitPrice
    //           ? unitPrice / (1 + item.taxRate * 0.01)
    //           : listCommonDataSource[index].enteredTaxIncludedPrice,
    //         referPrice: unitPrice ? 1 : 0,
    //         priceLibraryId: unitPrice && val.priceLibraryId ? val.priceLibraryId : null,
    //       };
    //     } else {
    //       return { ...item, priceLibraryId: item.priceLibraryId };
    //     }
    //   });
    //   this.handleChangeList(newDataSource);
    // }

    // if (isEmpty(val)) {
    //   const oldStatus = oldList.filter((item) => item.prLineId === prLineId)[0];
    //   const newDataSource = listCommonDataSource.map((item) => {
    //     if (item.prLineId === prLineId) {
    //       item.$form.setFieldsValue('unitPrice');
    //       item.$form.setFieldsValue('priceLibraryId');
    //       return {
    //         ...oldStatus,
    //         priceLibraryId: null,
    //       };
    //     } else {
    //       return {
    //         ...item,
    //         priceLibraryId: item.priceLibraryId,
    //       };
    //     }
    //   });
    //   this.handleChangeList(newDataSource);
    // }

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
        uomName,
        uomCodeAndName,
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
            currencyCode,
            ladderPriceLibId,
            ladderQuotationFlag,
            enteredTaxIncludedPrice,
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
    const { itemId, invOrganizationId, uomId } = values;
    const { priceModal } = this.state;
    const recordPrice = {
      ...priceModal,
      prLineId: record.prLineId,
      priceLibraryId,
      itemId,
      uomId,
      purchaseOrgId: this.orderHeaderFormDataSourceForm.getFieldValue('purchaseOrgId'),
      invOrganizationId,
    };
    this.setState({
      referencePriceRecord: record,
      priceModal: recordPrice,
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
    const { nowId } = this.state;
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
    this.fetchDetailList(nowId, page);
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
    const { poHeaderIdList, orderHeaderFormDataSource } = this.state;
    const { poSourcePlatform, sourceBillTypeCode } = orderHeaderFormDataSource;
    if (poHeaderIdList.poHeaderId) {
      // 采购申请
      if (sourceBillTypeCode === 'PURCHASE_REQUEST') {
        if (
          poSourcePlatform === 'SRM' ||
          poSourcePlatform === 'ERP' ||
          poSourcePlatform === 'SHOP'
        ) {
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
  onChangeCompany(lovRecord, form) {
    // const {
    //   form: { setFieldsValue },
    // } = this.props;
    const { setFieldsValue } = form;
    const {
      companyNum,
      companyName,
      currencyCode,
      currencyName,
      ouId,
      ouName,
      ouCode,
      purchaseOrgId,
      purchaseOrgName,
      purchaseAgentId,
      purchaseAgentName,
      invOrganizationId,
      invOrganizationName,
    } = lovRecord;
    const { orderHeaderFormDataSource, listCommonDataSource } = this.state;
    const newOrderHeaderFormDataSource = {
      ...orderHeaderFormDataSource,
      supplierName: '',
      supplierCompanyName: '',
      currencyCode: currencyCode || 'CNY',
      currencyName: currencyName || intl.get('hzero.common.currency.cny').d('人民币'),
      ouId,
      ouName,
      ouCode,
      purchaseOrgId,
      purchaseOrgName,
      agentId: purchaseAgentId,
      agentName: purchaseAgentName,
    };
    this.setState({
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
    });
    setFieldsValue({
      ouId,
      purchaseOrgId,
      agentId: purchaseAgentId,
      agentName: purchaseAgentName,
      companyCode: companyNum,
      companyName,
    });
    setFieldsValue({ tempKey: null });
    setFieldsValue({
      currencyCode: currencyCode || 'CNY',
      currencyName: currencyName || intl.get('hzero.common.currency.cny').d('人民币'),
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
  }

  /**
   * 拆分
   */
  @Bind()
  handleTranslate(record) {
    const { listCommonDataSource = [], listCommonPagination = {} } = this.state;
    const newItem = {
      ...record,
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
    this.setState({
      listCommonDataSource,
      listCommonPagination: newPagaination,
    });
  }

  @Bind()
  headerOnChangeForm(_record) {
    const { listCommonDataSource } = this.state;
    // this.orderListFormDataSourceForm.props.form.setFieldsValue({
    //   returnedFlag: _record,
    // });
    const newDateSource = listCommonDataSource.map((item) => {
      return {
        ...item,
        returnedFlag: _record,
      };
    });
    this.setState({
      returnOrderFlag: _record,
      listCommonDataSource: newDateSource,
    });
  }

  @Bind()
  tabChange(n) {
    const numId = n;
    this.fetchDetailHeader(numId);
    // this.fetchDetailList(numId);
    this.setState({
      nowId: numId, // 获取当前tab页的id
      orderHeaderFormDataSource: {}, // 头form数据源
      listCommonDataSource: [], // 表格数据源
      listCommonPagination: {}, // 表格分页
    });
  }

  // 根据价格库更新当前订单所有行的价格
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  priceUpdate() {
    const { orderHeaderFormDataSource } = this.state;
    const { dispatch } = this.props;
    const { poSourcePlatform, poHeaderId } = orderHeaderFormDataSource;
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
        // this.fetchPriceUpdateList();
      }
    });
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

  @Bind()
  renderDimensions() {
    const {
      form,
      customizeForm,
      customizeTable,
      newAddLoading = false,
      addDetailLinesLoading = false,
      deleteDetailLinesLoading = false,
      deleteLineRemoteLoaing = false,
      queryCreateListLoading = false,
      queryDetailHeaderLoading = false,
      queryDetailListLoading = false,
      priceUpdateLoading = false,
      fetchPriceUpdateListLoading = false,
      validating,
      quotePurchaseRequisition: { enumMap },
    } = this.props;
    const {
      collapseKeys,
      selectedListRows,
      listCommonDataSource,
      listCommonPagination,
      isClearListCacheDataSource,
      isHeaderInfoFormDataSource,
      orderHeaderFormDataSource = {},
      lovRecord: { supplierCompanyId },
      fetchFlag,
      conractFlag,
      sourcePage,
      setting,
      checkContract,
      returnOrderFlag,
      newPriceLibFlag,
      dimensions,
      priceUpdateList,
      doubleUnitEnabled,
      amountCalcRule,
    } = this.state;
    const {
      prStatusCode,
      poSourcePlatform,
      tieredPricingFlag,
      ouId,
      companyId,
    } = orderHeaderFormDataSource;
    const orderHeaderFormDataSourceFormProps = {
      // form,
      sourcePage,
      fetchFlag,
      newAddLoading,
      customizeForm,
      poSourcePlatform,
      listCommonDataSource,
      poHeaderId: this.state.nowId,
      loading: queryDetailHeaderLoading,
      onChangeListData: this.handleChangeLov,
      handleChangeList: this.handleChangeList,
      onChangeCompany: this.onChangeCompany,
      onOuNameOnchange: this.onOuNameOnchange,
      onFetchFlag: this.changeFetchFlag,
      onChangeSupplierLov: this.onChangeSupplierLov,
      headerOnChangeForm: this.headerOnChangeForm,
      dataSource: orderHeaderFormDataSource,
      onRef: (node) => {
        this.orderHeaderFormDataSourceForm = node;
      },
      validataOrg: this.validataOrg,
      termsOnchange: this.termsOnchange,
    };
    const listProps = {
      form,
      prStatusCode,
      validating,
      customizeTable,
      checkContract,
      supplierCompanyId,
      tieredPricingFlag,
      ouId,
      setting,
      companyId,
      returnOrderFlag,
      poSourcePlatform,
      isClearListCacheDataSource,
      isHeaderInfoFormDataSource,
      addDetailLinesLoading,
      deleteDetailLinesLoading,
      deleteLineRemoteLoaing,
      queryCreateListLoading,
      priceUpdateLoading,
      selectedListRows,
      priceUpdateList,
      fetchPriceUpdateListLoading,
      priceUpdate: this.priceUpdate,
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
      showPriceModal: this.handlePrice,
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
      handleIncludedPriceFcous: this.handleIncludedPriceFcous,
      changeBomVisibel: this.changeBomVisibel,
      enumMap,
      customizeForm,
    };
    // const FilterForm = flow(Form.create({ fieldNameProp: null }))(PurchaseRequestHeader);
    return dimensions.map((item) => {
      return (
        <TabPane tab={item.displayPoNum} key={item.poHeaderId}>
          <Collapse
            className="form-collapse"
            activeKey={collapseKeys}
            onChange={this.onCollapseChange}
          >
            <Panel
              showArrow={false}
              forceRender
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
              {item.prSourcePlatform !== 'CATALOGUE' ? (
                item.poHeaderId === this.state.nowId && (
                  <PurchaseRequestHeader {...orderHeaderFormDataSourceFormProps} />
                )
              ) : (
                <HeaderForm {...orderHeaderFormDataSourceFormProps} />
              )}
            </Panel>
            {item.poHeaderId && item.prSourcePlatform === 'CATALOGUE' && (
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
                <DeliveryInformationHeader {...orderHeaderFormDataSourceFormProps} />
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
                {item.prSourcePlatform !== 'CATALOGUE' ? (
                  item.poHeaderId === this.state.nowId && (
                    <PurchaseLineInfo {...{ ...listProps, formKey: item.poHeaderId }} />
                  )
                ) : (
                  <ListInfo {...{ ...listProps, formKey: item.poHeaderId }} />
                )}
              </Panel>
            )}
          </Collapse>
        </TabPane>
      );
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

  render() {
    const {
      newSaveLoading = false,
      saveLoading = false,
      newAddLoading = false,
      deleteDeliveryLoading = false,
      queryDetailHeaderLoading = false,
      submitDetailLoading = false,
      fetchDetailTableLoading = false,
      queryDetailListLoading = false,
      validateLoading = false,
      deleteLineRemoteLoaing = false,
      budgetVerificationLoading = false,
    } = this.props;
    const {
      orderHeaderFormDataSource = {},
      priceModal,
      priceModalVisible,
      newPriceLibFlag,
      listCommonDataSource,
      actionListRowData,
      wrapperBOMModalVisible,
      initialAttachmentUuid,
      initialPurchaserInnerAttachmentUuid,
    } = this.state;
    const {
      poHeaderId,
      statusCode,
      unSaveEnable = 1,
      sourceBillTypeCode,
      poSourcePlatform,
    } = orderHeaderFormDataSource;
    const { attachmentUuid, purchaserInnerAttachmentUuid } = orderHeaderFormDataSource;
    const uploadModalProps = {
      btnText: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
      btnProps: {
        icon: 'upload',
        disabled: !poHeaderId,
      },
      showFilesNumber: true,
      attachmentUUID: attachmentUuid || initialAttachmentUuid,
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sodr-order',
      afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    };
    const uploadModalPropsLoad = {
      btnText: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
      btnProps: {
        icon: 'upload',
        disabled: !poHeaderId,
      },
      showFilesNumber: true,
      attachmentUUID: purchaserInnerAttachmentUuid || initialPurchaserInnerAttachmentUuid,
      bucketName: BUCKET_NAME,
      bucketDirectory: 'sodr-order',
      afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
    };
    // 参考价格
    const priceModalProps = {
      newPriceLibFlag,
      orderHeaderFormDataSource,
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
      hideModal: this.handleToolTipVisible,
      onSetPrice: this.setPrice,
    };
    const wrapperBOMModalProps = {
      visible: wrapperBOMModalVisible,
      onCancel: this.changeBomVisibel,
      actionListRowData,
      poHeaderId,
      listCommonDataSource,
      handleChangeList: this.handleChangeList,
    };
    const loadingAll =
      saveLoading ||
      newSaveLoading ||
      newAddLoading ||
      validateLoading ||
      submitDetailLoading ||
      deleteDeliveryLoading ||
      deleteLineRemoteLoaing ||
      queryDetailHeaderLoading ||
      budgetVerificationLoading ||
      queryDetailListLoading;

    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.quotePurchase.view.message.purchaseOrderMaintain`).d('订单维护')}
          backPath="/sodr/purchase-order-maintain/quote-purchase-requisition/list"
        >
          <Button
            onClick={() => this.handleOrderSaveOrSubmit(true)}
            loading={loadingAll}
            // onClick={this.save}
            type="primary"
            icon="save"
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          {unSaveEnable === 0 || poSourcePlatform === 'CATALOGUE' ? (
            <Button
              disabled={!this.state.poHeaderIdList.poHeaderId}
              loading={loadingAll}
              icon="check"
              onClick={() => this.handleOrderSaveOrSubmit(false)}
            >
              {intl.get(`hzero.common.button.submit`).d('提交')}
            </Button>
          ) : null}
          <UploadModal {...uploadModalProps} />
          <UploadModal {...uploadModalPropsLoad} />
          {statusCode !== 'REJECTED' && (
            <Button
              disabled={!this.state.poHeaderIdList.poHeaderId}
              loading={loadingAll}
              onClick={this.invalidDelivery}
              icon="delete"
            >
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </Button>
          )}
        </Header>
        <Content>
          {poSourcePlatform !== 'CATALOGUE' &&
            sourceBillTypeCode === 'PURCHASE_REQUEST' &&
            [1, 2].includes(unSaveEnable) && (
              <p className={styles['order-top-title']}>
                <span />
                {intl
                  .get(`sodr.quotePurchase.view.message.saveBeforeOperation`)
                  .d('请先保存订单头信息，再操作订单行信息')}
              </p>
            )}
          <Spin
            spinning={false}
            wrapperClassName={DETAIL_DEFAULT_CLASSNAME}
            loading={fetchDetailTableLoading || queryDetailHeaderLoading || queryDetailListLoading}
          >
            <Tabs
              defaultActiveKey="company"
              animated={false}
              onTabClick={this.tabChange}
              tabPosition="left"
              className={styles['sub-accout-tabs']}
              forceRender
            >
              {this.renderDimensions()}
            </Tabs>
          </Spin>
        </Content>
        {priceModalVisible && <PriceModle {...priceModalProps} />}
        {wrapperBOMModalVisible && <WrapperBOMModal {...wrapperBOMModalProps} />}
      </Fragment>
    );
  }
}
