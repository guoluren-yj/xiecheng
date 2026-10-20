/**
 * index - 手工创建订单-新
 * @date: 2020-11-18
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Spin, Collapse, Icon, Modal, Form } from 'hzero-ui';
import { connect } from 'dva';

import { isEmpty, isNil, throttle } from 'lodash';
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
  filterNullValueObject,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { DATETIME_MIN, DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import {
  formatAumont,
  formatUom,
  newTableEnable,
  MenuType,
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
import WrapperBOMModal from '../components/BOMModal';
import remoteConfig from './remote';
// import { queryNewTableEnable } from '@/services/orderWorkspaceService';

import C7nDetail from '../C7nManuallyCreate';

const { Panel } = Collapse;
const { ORDER_MAINTAIN } = MenuType;
// const pathname_ = {
//   contract: '/sodr/purchase-order-maintain/purchase/list',
// };
@newTableEnable(C7nDetail, ORDER_MAINTAIN)
@withCustomize({
  unitCode: [
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP',
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC',
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE',
    'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
    'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
    'SODR.ORDER_CREATE_LINE_LIST.PROPOSED.PRICE',
    'SODR.ORDER_CREATE_LINE_LIST.MANUALLY_BTNS',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_CATALOGUE',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_ERP',
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
    'entity.item',
    'sodr.workspace',
    'sodr.orderMaintain',
  ],
})
@cuxRemote(...remoteConfig)
@Form.create({ fieldNameProp: null })
@connect(({ loading, quotePurchaseRequisition }) => ({
  saveLoading: loading.effects['quotePurchaseRequisition/add'],
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
  priceUpdateLoading: loading.effects['quotePurchaseRequisition/priceUpdate'],
  fetchPriceUpdateListLoading: loading.effects['quotePurchaseRequisition/fetchPriceUpdateList'],
  addNewSubmitDetailLoading: loading.effects['quotePurchaseRequisition/addNewSubmitDetail'],
  checkInvOrganizationLoading: loading.effects['quotePurchaseRequisition/checkInvOrganization'],
  budgetVerificationLoading: loading.effects['quotePurchaseRequisition/oldBudgetVerification'],
  queryDoubleUomConfigLoading: loading.effects['quotePurchaseRequisition/queryDoubleUomConfig'],
  fetchAutoGetCompany: loading.effects['quotePurchaseRequisition/fetchAutoGetCompany'],
  quotePurchaseRequisition,
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { poHeaderId, source, entrance } = querystring.parse(search.substr(1));

    this.state = {
      poHeaderId,
      source,
      entrance,
      lovRecord: {},
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
      wrapperBOMModalVisible: false, // BOM弹窗
      actionListRowData: {}, // BOM所属行
      defaultProjectCategory: '', // 默认项目类别
      defaultProjectCategoryMeaning: '', // 默认项目类别描述
      priceModalPoLineDetailDTOs: [], // 参考价格弹框对应行的订单行数据
      enableSupplierSiteFlag: '',
      doubleUnitEnabled: 0, // 双单位配置是否开启
      amountCalcRule: 'Amount', // 金额计算规则配置，默认为按金额
      stageIdList: null, // 业务规则定义-订单下单控制
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { poHeaderId } = this.state;
    this.fetchEnum();
    this.queryDoubleUomConfig();
    if (poHeaderId) {
      this.fetchDetailHeader();
      this.fetchDetailList();
      this.fetchSettings();
      this.fetchCalcRuleConfig();
      this.fetchNewPriceLibEnable();
      this.fetchItemNewPriceLibEnable();
    } else if (!poHeaderId) {
      this.fetchPageOrder();
    }
    window.addEventListener('message', this.handleEvent);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleEvent);
  }

  @Bind()
  handleEvent(e) {
    if (e.data === 'sodr/purchase-order-maintain/list') {
      this.fetchDetailHeader();
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
        this.fetchStageIdList({
          poTypeId: res.poTypeId,
          companyId: res.companyId,
        });
        this.setState({
          orderHeaderFormDataSource: res,
          enableSupplierSiteFlag: res.enableSupplierSiteFlag,
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
    const { dispatch, form } = this.props;
    const { poHeaderId } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailHeader',
      payload: {
        poHeaderId,
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
        const { poSourcePlatform, currencyCode = '', currencyName = '', outsourceOrderFlag } = res;
        const code = this.getCustomizeCode(poSourcePlatform);

        if (outsourceOrderFlag === 1) {
          this.fetchDefaultValueView('SPUC.PR_LINE_PROJECT_CATEHORY', 'L');
        }
        this.fetchStageIdList({
          poTypeId: res.poTypeId,
          companyId: res.companyId,
        });
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
            enableSupplierSiteFlag: res.enableSupplierSiteFlag,
          },
          () => {
            form.resetFields();
            this.forceUpdate();
            this.fetchDefaultLineOrgId();
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
    });
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

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} page - 查询条件
   */
  @Bind()
  fetchDetailList(page = {}) {
    const { dispatch } = this.props;
    const {
      poHeaderId,
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
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailList',
      payload: {
        poHeaderId,
        page,
        poEntryPoint: 'PO_MAINTAIN_DETAIL',
        customizeUnitCode: 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
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
   * getAmount - 将字符串的逗号分隔符去掉
   */
  @Bind()
  getAmount(amount) {
    if (!amount) {
      return amount;
    }
    const arr = `${amount}`.split(',');
    const newAmount = !arr.length ? arr[0] : arr.reduce((pre, cur) => `${pre}${cur}`);
    return new BigNumber(newAmount);
  }

  @Bind()
  saveDetail(payload, type, showError, callback) {
    const { dispatch } = this.props;
    dispatch({
      type,
      payload,
    }).then((res) => {
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

  @Bind()
  async cuxSubmitValidateChange(handleSubmit, budgetVerificationData, data) {
    const { remote, dispatch } = this.props;
    const { cuxSubmitValidate } = remote?.props?.process || {};
    const cfmoFlag = typeof cuxSubmitValidate === 'function';
    if (cfmoFlag) {
      const res = await cuxSubmitValidate({
        dispatch,
        handleSubmit,
        handleOldBudgetVerification,
        data,
        dispatchObject: {
          type: 'quotePurchaseRequisition/oldBudgetVerification',
          payload: budgetVerificationData,
        },
      });
      return res;
    }
    handleOldBudgetVerification(
      dispatch,
      {
        type: 'quotePurchaseRequisition/oldBudgetVerification',
        payload: budgetVerificationData,
      },
      handleSubmit()
    );
    return false;
  }

  /**
   * 手工创建订单保存-提交
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  handleOrderSaveOrSubmit(saveFlag) {
    const { dispatch, form } = this.props;
    const {
      orderHeaderFormDataSource,
      tenantId,
      listCommonDataSource,
      lovRecord = {},
      customizeCode = '',
      poHeaderId,
      doubleUnitEnabled,
    } = this.state;
    // listCommonDataSource.forEach(n => {
    //   if (!n.displayLineNum) {
    //     const nn = n;
    //     nn.poLineId = undefined;
    //     nn.prLineId = undefined;
    //   }
    // });
    if (!poHeaderId) {
      form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const data = {
            ...orderHeaderFormDataSource,
            ...values,
            tenantId,
            supplierCompanyId: lovRecord.supplierCompanyId,
            supplierCompanyName: lovRecord.supplierCompanyName,
            supplierTenantId: lovRecord.supplierTenantId,
            supplierId: lovRecord.supplierId || null,
            supplierName: lovRecord.supplierName || null,
            supplierCode: lovRecord.supplierNum || lovRecord.supplierCode || null,
          };
          dispatch({
            type: 'quotePurchaseRequisition/newAdd',
            payload: {
              data,
              customizeUnitCode: `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`,
            },
          }).then((res) => {
            if (res) {
              this.setState(
                {
                  poHeaderId: res.poHeaderId,
                },
                () => {
                  this.props.history.push({
                    pathname:
                      '/sodr/purchase-order-maintain/quote-purchase-requisition/line-manuall-create',
                    search: `?poHeaderId=${res.poHeaderId}&source=newRequisition&sourcePage=pageOrder&entrance=maintain`,
                  });
                  this.fetchDetailHeader();
                  this.fetchDetailList();
                  this.fetchNewPriceLibEnable();
                  this.fetchItemNewPriceLibEnable();
                  notification.success();
                }
              );
            }
          });
        }
      });
    } else {
      form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const jsonArray = this.handleValidateColumns();
          if (
            doubleUnitEnabled &&
            !validateLineCalculate({ data: jsonArray?.lines || [], type: 'h0' })
          ) {
            return false;
          }
          const poLineDetailDTOs = jsonArray.poLineDetailDTOs.map((item) => {
            return {
              ...item,
              originUnitPrice: this.getAmount(item.originUnitPrice),
              unitPrice: this.getAmount(item.unitPrice),
              enteredTaxIncludedPrice: this.getAmount(item.enteredTaxIncludedPrice),
            };
          });
          jsonArray.poLineDetailDTOs = poLineDetailDTOs;
          if (
            listCommonDataSource.length === 0 ||
            (Array.isArray(jsonArray.lines) && jsonArray.lines.length !== 0)
          ) {
            const data = {
              poLineDetailDTOs: jsonArray.poLineDetailDTOs,
              poHeaderDetailDTO: {
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
              if (!data.poLineDetailDTOs.length) {
                notification.error({
                  message: intl.get('hzero.common.status.mistake').d('错误'),
                  description: intl
                    .get(`sodr.workspace.view.message.noPoLine`)
                    .d(`订单提交失败，失败原因是不存在订单行，请维护订单行。`),
                });
                return;
              }
              dispatch({
                type: 'quotePurchaseRequisition/addNewSubmitDetail',
                payload: data,
              }).then((ras) => {
                if (ras) {
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
                      if (res) {
                        notification.success();
                        if (res.minAmountInfo) {
                          notification.warning({
                            message: res.minAmountInfo,
                          });
                        }
                        this.handleSubmitBackPath();
                      }
                    });
                  };
                  if (ras.value) {
                    Modal.confirm({
                      title: ras.message,
                      okText: intl.get('hzero.common.button.sure').d('确定'),
                      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                      onOk: throttle(
                        // () =>
                        //   handleOldBudgetVerification(
                        //     dispatch,
                        //     {
                        //       type: 'quotePurchaseRequisition/oldBudgetVerification',
                        //       payload: budgetVerificationData,
                        //     },
                        //     handleSubmit
                        //   ),
                        () =>
                          this.cuxSubmitValidateChange(handleSubmit, budgetVerificationData, data),
                        THROTTLE_TIME,
                        { trailing: false }
                      ),
                    });
                  } else {
                    this.cuxSubmitValidateChange(handleSubmit, budgetVerificationData, data);
                    // handleOldBudgetVerification(
                    //   dispatch,
                    //   {
                    //     type: 'quotePurchaseRequisition/oldBudgetVerification',
                    //     payload: budgetVerificationData,
                    //   },
                    //   handleSubmit
                    // );
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
   * 处理订单提交后返回入口  ps： 暂时默认返回订单维护
   */
  @Bind()
  handleSubmitBackPath() {
    // const { source } = this.state;
    this.props.history.push({
      pathname: '/sodr/purchase-order-maintain/list',
      // pathname:
      //   source === 'maintain'
      //     ? `/sodr/purchase-order-maintain/list`
      //     : `/sodr/purchase-order-maintain/quote-purchase-requisition/list`,
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
      newPriceLibFlag,
      orderHeaderFormDataSource,
    } = this.state;
    const lines = getEditTableData(
      listCommonDataSource,
      ['poLineId', '_status', 'saveBomItemId'],
      { container: document.querySelector('.ant-table-body') },
      { force: true }
    );
    const transLines = lines.map((item) => {
      const { needByDate } = item;
      return {
        ...item,
        benchmarkPriceType: newPriceLibFlag
          ? item.benchmarkPriceType
          : orderHeaderFormDataSource.benchmarkPriceType,
        tenantId,
        needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
        surfaceTreatFlag: item.surfaceTreatFlag ? 1 : 0,
        returnedFlag: item.returnedFlag ? 1 : 0,
        poLineId: item.displayLineNum ? item.poLineId : undefined,
        prLineId: item.displayLineNum ? item.prLineId : undefined,
        wbsCode: item.wbsCode || '',
        wbs: item.wbs || '',
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
  }

  // 原币含税单价获取焦点事件
  @Bind()
  handleIncludedPriceFcous(record, dataList) {
    const {
      newPriceLibFlag,
      doubleUnitEnabled,
      listCommonDataSource = [],
      orderHeaderFormDataSource = {},
    } = this.state;
    const { dispatch, form, remote } = this.props;
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
        if (
          res &&
          !isEmpty(res) &&
          getResponse(res) &&
          (record.$form.getFieldValue('priceLibraryId') || res.priceLibId)
        ) {
          const {
            uomId,
            uomCode,
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
            uomCodeAndName,
            callRecordId, // 取价记录id
          } = res;
          // 开启则 校验价格库单位和行基本单位是否一致
          const sodrEnabled = doubleUnitEnabled !== 0;
          if (sodrEnabled && !validateDoubleUom({ price: res, record, sodrEnabled })) return;
          const newDataSource = listCommonDataSource.map((item) => {
            if (item.poLineId === record.poLineId) {
              const setFields = remote.process(
                'handleIncludedPriceFcousSetFields',
                {
                  uomId: uomId || dataList?.uomId,
                  uomCode: uomCode || dataList?.uomCode,
                  uomName: uomName || dataList?.uomName,
                  uomCodeAndName:
                    uomCodeAndName ||
                    (dataList ? formatUom(dataList.uomCode, dataList.uomName) : null),
                  currencyCode: currencyCode || record.currencyCode,
                  taxId,
                  taxRate,
                  unitPrice: netPrice,
                  enteredTaxIncludedPrice: taxIncludedPrice,
                  // unitPrice: formatAumont(netPrice,defaultPrecision || orderHeaderFormDataSource.domesticFinancialPrecision),
                  // enteredTaxIncludedPrice: formatAumont(taxIncludedPrice,defaultPrecision || orderHeaderFormDataSource.domesticFinancialPrecision),
                  unitPriceBatch,
                  priceLibraryId: priceLibId,
                  priceTaxId: taxId,
                  contractNum,
                  defaultPrecision,
                },
                { res, record, orderHeaderFormDataSource, form }
              );
              record.$form.setFieldsValue(setFields);
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
                callRecordId,
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
  handleGetNewPrice(record, dataList, benchmarkPriceType) {
    const { listCommonDataSource } = this.state;
    const newDataSource = listCommonDataSource.map((item) => {
      if (item.poLineId === record.poLineId) {
        return {
          ...item,
          priceLibraryId: null,
          benchmarkPriceType,
        };
      }
      return item;
    });
    const { setFieldsValue } = record.$form;
    const { itemCode, itemName, categoryId, categoryName, uomId, uomName, uomCode } = dataList;
    setFieldsValue({
      itemCode,
      itemName,
      categoryId,
      categoryName,
      uomId,
      uomName,
      uomCodeAndName: formatUom(uomCode, uomName),
      currencyCode: record.currencyCode || undefined,
    });
    this.handleChangeList(newDataSource);
    // this.handleChangeLov(newDataSource);
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
          prLineId: undefined,
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
    return true;
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
   * @param {Array} orderHeaderFormDataSource
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
    const { priceModal } = this.state;
    // const newDateSource = listCommonDataSource.map((ele) => {
    //   if (
    //     ele.supplierCompanyId !== supplierId &&
    //     ele.supplierCompanyId !== supplierCompanyId &&
    //     ele.priceLibraryId
    //   ) {
    //     return oldList.find((obj) => obj.prLineId === ele.prLineId);
    //   } else {
    //     return ele;
    //   }
    // });
    this.setState({
      // listCommonDataSource: newDateSource,
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
    const {
      supplierCompanyId,
      supplierCompanyNum,
      supplierId,
      supplierCompanyName,
      supplierTenantId,
      supplierName,
      supplierCode,
    } = lovRecord;
    const { orderHeaderFormDataSource } = this.state;
    const newOrderHeaderFormDataSource = {
      ...orderHeaderFormDataSource,
      supplierCompanyId,
      supplierCompanyNum,
      supplierId,
      supplierCompanyName,
      supplierTenantId,
      supplierName,
      supplierCode,
    };
    setFieldsValue({ originalPoHeaderId: null, originalPoNum: null, supplierSiteId: null });
    this.setState({
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
    });
  }

  /**
   * 修改结算供应商Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  onChangeSettleSupplierLov(lovRecord = {}) {
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
   * 修改采购组织Lov数据
   * @param {Object} lovRecord
   */
  @Bind()
  onPurchaseOrgChange(lovRecord) {
    const {
      form: { setFieldsValue, getFieldsValue },
      dispatch,
    } = this.props;
    const { purchaseOrgId } = lovRecord || {};
    const { agentId: oldAgentId } = getFieldsValue() || {};
    const { orderHeaderFormDataSource } = this.state;
    const payload = purchaseOrgId ? { purchaseOrgId, purchaseAgentId: oldAgentId } : {};
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
        payload,
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
    const { companyId } = getFieldsValue() || {};
    const { ouId, ouCode } = lovRecord;
    const { orderHeaderFormDataSource, priceModal } = this.state;
    let newOrderHeaderFormDataSource = {
      ...orderHeaderFormDataSource,
      ouId,
      ouCode,
    };
    const { listCommonDataSource, oldList } = this.state;
    const newDateSource = listCommonDataSource.map((ele) => {
      if (ele.ouId !== ouId && ele.priceLibraryId) {
        return oldList.find((obj) => obj.prLineId === ele.prLineId);
      } else {
        return ele;
      }
    });
    setFieldsValue({ originalPoHeaderId: null, originalPoNum: null, supplierSiteId: null });
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
    const { selectedListRows = [], listCommonDataSource, orderHeaderFormDataSource } = this.state;
    const { poSourcePlatform, statusCode } = orderHeaderFormDataSource;
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
      statusCode === 'REJECTED' &&
      (poSourcePlatform === 'SRM' || poSourcePlatform === 'ERP' || poSourcePlatform === 'SHOP')
    ) {
      notification.warning({
        message: intl.get(`sodr.common.view.message.moreThanOne`).d('订单至少有一个订单行。'),
      });
      return;
    }
    Modal.confirm({
      title: intl.get(`sodr.common.model.common.deleteLines`).d('是否确认删除行'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: throttle(
        () => {
          // 手工创建订单时
          const selectedRowKeys = selectedListRows.map((item) => item.poLineId);
          const filtered = listCommonDataSource.filter(
            (item) => !selectedRowKeys.includes(item.poLineId)
          );
          this.handleDeleteLines(filtered, selectedListRows);
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
    // }
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
    return '/sodr/purchase-order-maintain/list';
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
    const { remote } = this.props;
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
        sourceFromId, // 价格来源单据头id
        sourceFrom, // 价格来源
        sourceFromLnId, // 报价行id
        sourceFromLnNum, // 价格来源单据行号
        sourceFromNum, // 价格来源单据号 | 寻源单号
        defaultPrecision,
      } = val;
      const sodrEnabled = doubleUnitEnabled !== 0;
      if (sodrEnabled && !validateDoubleUom({ price: val, record, sodrEnabled })) return false;
      const quantity = record.$form.getFieldValue('quantity');
      const ladderPriceRecord = ladderPriceLibList.find(
        (item) =>
          math.gte(new BigNumber(quantity), new BigNumber(item.ladderFrom)) &&
          (math.lt(new BigNumber(quantity, new BigNumber(item.ladderTo))) ||
            math.lt(new BigNumber(quantity, new BigNumber(Infinity))))
      );
      const newDataSource = listCommonDataSource.map((item) => {
        const unitPrice = formatAumont(
          ladderPriceRecord ? ladderPriceRecord.ladderNetPrice : netPrice,
          defaultPrecision
        );
        const enteredTaxIncludedPrice = formatAumont(
          ladderPriceRecord ? ladderPriceRecord.ladderPrice : taxIncludedPrice,
          defaultPrecision
        );

        if (item.poLineId === record.poLineId) {
          record.$form.setFieldsValue(
            remote.process(
              'processReferPriceSetFields',
              {
                uomId,
                uomName,
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
              },
              { val, record }
            )
          );
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
            priceId: sourceFromId,
            priceSource: sourceFrom,
            priceSourceNum: sourceFromNum,
            priceSourceLineNum: sourceFromLnNum,
            priceLineId: sourceFromLnId,
            defaultPrecision,
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
    const {
      quotePurchaseRequisition: { enumMap },
    } = this.props;
    const { internationalTelCode = [] } = enumMap;
    const { currencyCode = '', benchmarkPriceType } = orderHeaderFormDataSource;
    const newDataSource = {
      poLineId: uuid(),
      _status: 'create',
      currencyCode,
      benchmarkPriceType,
      internationalTelCode: internationalTelCode[0].value || '',
      invOrganizationId: this.state.orderHeaderFormDataSource.organizationId,
      invOrganizationName: this.state.orderHeaderFormDataSource.organizationName,
      invOrganizationCode: this.state.orderHeaderFormDataSource.organizationCode,
    };
    this.setState({
      listCommonDataSource: [...listCommonDataSource, newDataSource],
      listCommonPagination: addItemToPagination(listCommonDataSource.length, listCommonPagination),
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
    //  setFieldsValue({ prepayFlag});
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
    const { companyId, companyNum, currencyCode, currencyName, defaultEnabledFlag } = lovRecord;
    const { orderHeaderFormDataSource, listCommonDataSource } = this.state;
    const { poTypeId } = getFieldsValue() || {};
    const initData = {
      supplierName: '',
      supplierCompanyName: '',
      companyId,
      companyCode: companyNum,
      currencyCode:
        (currencyCode === 'CNY' ? (defaultEnabledFlag ? 'CNY' : '') : currencyCode) ||
        (defaultEnabledFlag ? 'CNY' : ''),
      currencyName: currencyName || intl.get('hzero.common.currency.cny').d('人民币'),
      domesticCurrencyCode: currencyCode,
    };
    const newOrderHeaderFormDataSource = {
      ...initData,
      ...orderHeaderFormDataSource,
    };
    this.setState({
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
    });
    setFieldsValue({ tempKey: null });
    setFieldsValue({ originalPoHeaderId: null, originalPoNum: null });
    setFieldsValue({
      currencyCode:
        (currencyCode === 'CNY' ? (defaultEnabledFlag ? 'CNY' : '') : currencyCode) ||
        (defaultEnabledFlag ? 'CNY' : ''),
      currencyName: currencyName || intl.get('hzero.common.currency.cny').d('人民币'),
      domesticCurrencyCode: currencyCode,
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
        ...initData,
        ...orderHeaderFormDataSource,
        ouName,
        ouId,
        ouCode,
        companyId,
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
   * 拆分
   */
  @Bind()
  handleTranslate(record) {
    const { listCommonDataSource = [], listCommonPagination = {} } = this.state;
    const newItem = {
      ...record,
      ...record.$form.getFieldsValue(),
      poLineId: uuid(),
      displayLineNum: null,
      poLineLocationId: null,
      _status: 'create',
      // objectVersionNuber: null,
      // _token: null,
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
    setTimeout(() => {
      this.forceUpdate();
    }, 0);
  }

  @Bind()
  headerOnChangeForm(lovRecord = {}) {
    const {
      form: { getFieldsValue },
    } = this.props;
    const { companyId } = getFieldsValue() || {};
    const { returnOrderFlag, orderTypeId } = lovRecord;
    const { listCommonDataSource } = this.state;
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

  /**
   * 查询默认值集视图
   */
  @Bind()
  fetchDefaultValueView(lovCode, value) {
    const { dispatch } = this.props;
    dispatch({
      type: 'quotePurchaseRequisition/fetchDefaultValueView',
      payload: {
        lovCode,
        value,
      },
    }).then((res) => {
      if (res) {
        const { meaning = '' } = res.content[0];
        this.setState({
          defaultProjectCategory: value,
          defaultProjectCategoryMeaning: meaning,
        });
      }
    });
  }

  /**
   * 查询默认库存组织
   */
  @Bind()
  fetchDefaultLineOrgId() {
    const {
      form: { getFieldsValue },
      dispatch,
    } = this.props;
    const { orderHeaderFormDataSource } = this.state;
    const { companyId, ouId } = getFieldsValue() || {};
    dispatch({
      type: 'quotePurchaseRequisition/fetchAutoGetCompany',
      payload: {
        companyId,
        ouId,
      },
    }).then((res) => {
      if (res) {
        const { organizationId, organizationName, organizationCode } = res;
        this.setState({
          orderHeaderFormDataSource: {
            ...orderHeaderFormDataSource,
            organizationId,
            organizationName,
            organizationCode,
          },
        });
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

  render() {
    const {
      form,
      custConfig,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      saveLoading = false,
      newAddLoading = false,
      saveWarnLoading = false,
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
      addNewSubmitDetailLoading,
      quotePurchaseRequisition: { enumMap },
      checkInvOrganizationLoading = false,
      budgetVerificationLoading = false,
      remote,
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
      itemChangePriceFlag,
      priceUpdateList,
      wrapperBOMModalVisible,
      actionListRowData,
      defaultProjectCategory,
      defaultProjectCategoryMeaning,
      priceModalPoLineDetailDTOs,
      enableSupplierSiteFlag,
      doubleUnitEnabled,
      amountCalcRule,
    } = this.state;
    const {
      prStatusCode,
      poHeaderId,
      statusCode,
      poSourcePlatform,
      tieredPricingFlag,
      ouId,
      companyId,
      unSaveEnable = 1,
      sourceBillTypeCode,
    } = orderHeaderFormDataSource;
    const orderHeaderFormDataSourceFormProps = {
      remote,
      sourcePage,
      form,
      fetchFlag,
      stageIdList,
      newAddLoading,
      customizeForm,
      poSourcePlatform,
      listCommonDataSource,
      poFlag: returnOrderFlag,
      poHeaderId: this.state.poHeaderId,
      loading: queryDetailHeaderLoading,
      onChangeListData: this.handleChangeLov,
      handleChangeList: this.handleChangeList,
      onChangeCompany: this.onChangeCompany,
      onPurchaseOrgChange: this.onPurchaseOrgChange,
      onOuNameOnchange: this.onOuNameOnchange,
      onFetchFlag: this.changeFetchFlag,
      onChangeSupplierLov: this.onChangeSupplierLov,
      headerOnChangeForm: this.headerOnChangeForm,
      onChangeSettleSupplierLov: this.onChangeSettleSupplierLov,
      dataSource: orderHeaderFormDataSource,
      onRef: (node) => {
        this.orderHeaderFormDataSourceForm = node;
      },
      validataOrg: this.validataOrg,
      enableSupplierSiteFlag,
      termsOnchange: this.termsOnchange,
    };
    const listProps = {
      statusCode,
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
      custConfig,
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
      enumMap,
      defaultProjectCategory,
      defaultProjectCategoryMeaning,
      validateItemAndInv: this.validateItemAndInv,
      checkInvOrganizationLoading,
      fetchDetailHeader: this.fetchDetailHeader,
      customizeForm,
    };
    const { attachmentUuid, purchaserInnerAttachmentUuid } = orderHeaderFormDataSource;
    // const uploadModalProps = {
    //   btnText: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
    //   btnProps: {
    //     icon: 'upload',
    //     disabled: !poHeaderId,
    //   },
    //   showFilesNumber: true,
    //   attachmentUUID: attachmentUuid,
    //   bucketName: BUCKET_NAME,
    //   bucketDirectory: 'sodr-order',
    //   afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    // };
    // const uploadModalPropsLoad = {
    //   btnText: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
    //   btnProps: {
    //     icon: 'upload',
    //     disabled: !poHeaderId,
    //   },
    //   showFilesNumber: true,
    //   attachmentUUID: purchaserInnerAttachmentUuid,
    //   bucketName: BUCKET_NAME,
    //   bucketDirectory: 'sodr-order',
    //   afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
    // };
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
      hideModal: this.handleToolTipVisible,
      onSetPrice: this.setPrice,
      priceModalPoLineDetailDTOs,
      customizeTable,
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
      newAddLoading ||
      saveWarnLoading ||
      submitDetailLoading ||
      deleteDeliveryLoading ||
      deleteLineRemoteLoaing ||
      queryDetailHeaderLoading ||
      queryDetailListLoading ||
      addNewSubmitDetailLoading ||
      budgetVerificationLoading;

    const headerBtnsRender = [
      {
        name: 'save',
        child: intl.get(`hzero.common.button.save`).d('保存'),
        btnProps: {
          icon: 'save',
          type: 'primary',
          onClick: () => this.handleOrderSaveOrSubmit(true),
          loading: loadingAll,
        },
      },
      {
        name: 'submit',
        hidden: unSaveEnable !== 0,
        child: intl.get(`hzero.common.button.submit`).d('提交'),
        btnProps: {
          disabled: !this.state.poHeaderId,
          loading: loadingAll,
          icon: 'check',
          onClick: () => this.handleOrderSaveOrSubmit(false),
        },
      },
      {
        name: 'outUuid',
        btnComp: UploadModal,
        childFor: 'btnText',
        child: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
        btnProps: {
          btnProps: {
            icon: 'upload',
            disabled: !poHeaderId,
          },
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
        childFor: 'btnText',
        child: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
        btnProps: {
          btnProps: {
            icon: 'upload',
            disabled: !poHeaderId,
          },
          showFilesNumber: true,
          attachmentUUID: purchaserInnerAttachmentUuid,
          bucketName: BUCKET_NAME,
          bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
          afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
        },
      },
      {
        name: 'delete',
        hidden: statusCode === 'REJECTED',
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          disabled: !this.state.poHeaderId,
          onClick: this.invalidDelivery,
          icon: 'delete',
          loading: loadingAll,
        },
      },
      // {
      //   name: 'newBatchImport',
      //   btnComp: CommonImport,
      //   child: intl.get(`hzero.common.button.newBatchImport`).d('(新)批量导入'),
      //   childFor: 'buttonText',
      //   btnProps: {
      //     businessObjectTemplateCode: 'SPUC.PO_LINE_IMPORT',
      //     prefixPatch: SRM_SPUC,
      //     refreshButton: true,
      //     args: { poHeaderId }, // 上传参数
      //     successCallBack: (page) => {
      //       this.handleChangePagination(page);
      //       this.fetchDetailHeader();
      //     },
      //     buttonProps: {
      //       type: 'c7n-pro',
      //       icon: 'archive',
      //       disabled: !poHeaderId,
      //       loading:
      //         saveLoading ||
      //         newAddLoading ||
      //         submitDetailLoading ||
      //         deleteDeliveryLoading ||
      //         queryDetailHeaderLoading ||
      //         queryDetailListLoading ||
      //         addNewSubmitDetailLoading,
      //     }, // 导入按钮属性
      //   },
      // },
      // {
      //   name: 'batchImport',
      //   child: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
      //   btnProps: {
      //     icon: 'download',
      //     onClick: () => this.handleImport(),
      //     loading:
      //       saveLoading ||
      //       newAddLoading ||
      //       submitDetailLoading ||
      //       deleteDeliveryLoading ||
      //       queryDetailHeaderLoading ||
      //       queryDetailListLoading ||
      //       addNewSubmitDetailLoading,
      //   },
      // },
    ];
    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.quotePurchase.view.message.purchaseOrderMaintain`).d('订单维护')}
          backPath={this.handleBackParent()}
        >
          {customizeBtnGroup(
            { code: 'SODR.ORDER_CREATE_LINE_LIST.MANUALLY_BTNS', pro: true },
            <DynamicButtons
              buttons={remote.process('processHeaderBtn', headerBtnsRender, {
                form,
                orderHeaderFormDataSource,
              })}
            />
          )}
          {/* <Button
            onClick={() => this.handleOrderSaveOrSubmit(true)}
            loading={
              saveLoading ||
              newAddLoading ||
              submitDetailLoading ||
              deleteDeliveryLoading ||
              queryDetailHeaderLoading ||
              queryDetailListLoading ||
              addNewSubmitDetailLoading
            }
            // onClick={this.save}
            type="primary"
            icon="save"
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          {unSaveEnable === 0 ? (
            <Button
              disabled={!this.state.poHeaderId}
              loading={
                saveLoading ||
                submitDetailLoading ||
                queryDetailHeaderLoading ||
                queryDetailListLoading ||
                deleteDeliveryLoading ||
                addNewSubmitDetailLoading ||
                budgetVerificationLoading
              }
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
              disabled={!this.state.poHeaderId}
              loading={
                saveLoading ||
                queryDetailListLoading ||
                queryDetailHeaderLoading ||
                submitDetailLoading ||
                deleteDeliveryLoading ||
                deleteLineRemoteLoaing ||
                addNewSubmitDetailLoading
              }
              onClick={this.invalidDelivery}
              icon="delete"
            >
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </Button>
          )} */}
        </Header>
        <Content>
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
