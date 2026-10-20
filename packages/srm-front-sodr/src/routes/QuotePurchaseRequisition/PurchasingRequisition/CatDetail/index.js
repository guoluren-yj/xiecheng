/**
 * index - 按行引用创建-目录化
 * @date: 2020-11-17
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Spin, Collapse, Icon, Modal, Form } from 'hzero-ui';
import { connect } from 'dva';

import { isEmpty, merge, isArray, isNil, throttle } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import BigNumber from 'bignumber.js';
import { math } from 'choerodon-ui/dataset';

import { Header, Content } from 'components/Page';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import {
  getResponse,
  // addItemsToPagination,
  // addItemToPagination,
  createPagination,
  getCurrentOrganizationId,
  getEditTableData,
  // delItemsToPagination,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DATETIME_MIN, DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  BUCKET_NAME,
  THROTTLE_TIME,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
} from '@/routes/components/utils/constant';
import { handleOldBudgetVerification } from '@/routes/components/utils';
import PurchaseRequestHeader from './PurchaseRequestHeader';
import DeliveryInformationHeader from './DeliveryInformationHeader';
// import BillingInformation from './BillingInformation';
import PurchaseLineInfo from './PurchaseLineInfo';
import PriceModle from './PriceModal';

const { Panel } = Collapse;

const pathname_ = {
  contract: '/sodr/purchase-order-maintain/purchase/list',
};

@withCustomize({
  unitCode: [
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP',
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC',
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE',
    'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
    'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
    'SODR.ORDER_CREATE_LINE_LIST.DELIVERY_CATA',
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
    'sodr.order',
    'entity.attachment',
    'sodr.quotePurchase',
    'sodr.orderMaintain',
    'hpfm.employee',
    'srm.common',
    'ssrc.priceLibrary',
    'sprm.purchaseReqCreation',
    'sprm.common',
    'sodr.workspace',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, quotePurchaseRequisition }) => ({
  saveLoading: loading.effects['quotePurchaseRequisition/add'],
  newAddLoading: loading.effects['quotePurchaseRequisition/newAdd'],
  submitDetailLoading: loading.effects['quotePurchaseRequisition/submitDetail'],
  // addDetailLinesLoading: loading.effects['quotePurchaseRequisition/addDetailLines'],
  deleteDetailLinesLoading: loading.effects['quotePurchaseRequisition/deleteDetailLines'],
  deleteDeliveryLoading: loading.effects['quotePurchaseRequisition/deleteSheetDelivery'],
  // queryCreateListLoading: loading.effects['quotePurchaseRequisition/queryDetailCreateList'],
  queryDetailHeaderLoading: loading.effects['quotePurchaseRequisition/queryDetailHeader'],
  queryDetailListLoading: loading.effects['quotePurchaseRequisition/queryDetailList'],
  // validating: loading.effects['quotePurchaseRequisition/appendValidate'],
  saveWarnLoading: loading.effects['quotePurchaseRequisition/saveWarn'],
  addNewSubmitDetailLoading: loading.effects['quotePurchaseRequisition/addNewSubmitDetail'],
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
    const { poHeaderId, source, itemKey } = querystring.parse(search.substr(1));
    this.state = {
      poHeaderId,
      source,
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
      itemKey,
      requisitionCount: 0, // 供应商引用采购申请变更次数
      orderMainCount: 0, // 供应商订单维护变更次数
      supplierFlag: false,
      setting: '0',
      customizeCode: '', // 个性化编码
      returnOrderFlag: null,
      doubleUnitEnabled: 0, // 双单位配置是否开启
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { poHeaderId } = this.state;
    if (poHeaderId) {
      this.fetchDetailHeader();
      this.fetchDetailList();
      this.getCompanyId();
      this.fetchSettings();
      this.queryDoubleUomConfig();
      this.fetchEnum();
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

  /**
   * 查询列表值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({ type: 'quotePurchaseRequisition/fetchEnum' });
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
        });
      }
    });
  }

  @Bind()
  getCompanyId() {
    const { dispatch } = this.props;
    dispatch({ type: 'quotePurchaseRequisition/queryCompanyId' }).then((res) => {
      if (res && res[0]) {
        this.setState({ companyFlag: res[0].companyFlag });
      }
    });
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader(flag) {
    this.setState({ orderHeaderFormDataSource: {} });
    const { dispatch, form } = this.props;
    const { poHeaderId } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailHeader',
      payload: {
        poHeaderId,
        customizeUnitCode:
          'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST,SODR.ORDER_CREATE_LINE_LIST.DELIVERY_CATA',
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
        const { poSourcePlatform } = res;
        const code = this.getCustomizeCode(poSourcePlatform);
        this.setState(
          {
            orderHeaderFormDataSource: {
              ...res,
              currencyCode: res.currencyCode || 'CNY',
              currencyName: res.currencyName || intl.get('hzero.common.currency.cny').d('人民币'),
              prepayFlag: isNil(res.prepayFlag) ? 0 : res.prepayFlag,
            },
            lovRecord,
            customizeCode: code,
            priceModal: {
              supplierCompanyId: res.supplierCompanyId || res.supplierId,
              ouId: res.ouId,
            },
          },
          () => {
            form.resetFields();
            setTimeout(() => {
              this.forceUpdate();
            }, 0);
            // 避免绑定uuid更新行数据
            if (!flag) {
              // this.fetchDetailList();
            }
          }
        );
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
    const { poHeaderId } = this.state;
    // const { sourceBillTypeCode } = orderHeaderFormDataSource;
    // 获取价格库查询标识
    // const priceQueryFlag = window.sessionStorage.getItem(itemKey);
    // 采购申请分页参数特殊处理
    // const pagination =
    //   sourceBillTypeCode === 'PURCHASE_REQUEST' ? { current: 1, pageSize: -1 } : page;
    this.setState({ listCommonDataSource: [] });
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailList',
      payload: {
        poHeaderId,
        page,
        poEntryPoint: 'PO_MAINTAIN_DETAIL',
        customizeUnitCode: 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE',
      },
    }).then((res) => {
      if (res && res.content) {
        // if (this.list) {
        // this.list.setState({ selectedListRows: [] });
        // }
        this.setState(
          {
            selectedListRows: [],
            listCommonDataSource: res.content.map((n) => ({
              ...n,
              _status: 'update',
              prLineId: n.prLineId || uuid(),
              uuidFlag: !n.prLineId,
              tmpOrganizationId: n.invOrganizationId,
            })),
            oldList: res.content.map((n) => ({
              ...n,
              _status: 'update',
              prLineId: n.prLineId || uuid(),
              uuidFlag: !n.prLineId,
              tmpOrganizationId: n.invOrganizationId,
            })),
            // 采购申请分页特殊处理
            listCommonPagination: createPagination(res),
            // sourceBillTypeCode === 'PURCHASE_REQUEST' ? false : createPagination(res),
          },
          () => {
            // 处理首次查询不含税单价不更新显示值
            // const { listCommonDataSource, lovRecord } = this.state; ==> PS:注释原有订单逻辑
            const { listCommonDataSource } = this.state;
            listCommonDataSource.forEach((item) => {
              if (item.$form) {
                item.$form.setFieldsValue({ unitPrice: item.unitPrice });
              }
            });
            // 不再回调
            // if (
            //   (this.orderHeaderFormDataSourceForm &&
            //     ['SRM', 'ERP'].includes(poSourcePlatform) &&
            //     priceQueryFlag === '1') ||
            //   !isEmpty(lovRecord)
            // ) {
            //   const { supplierOnChange = e => e } = this.orderHeaderFormDataSourceForm;
            //   this.setState(
            //     {
            //       supplierFlag: true,
            //     },
            //     () => supplierOnChange(lovRecord)
            //   );
            // }
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
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  save() {
    const { dispatch, form } = this.props;
    const {
      poHeaderId,
      orderHeaderFormDataSource,
      tenantId,
      listCommonDataSource,
      lovRecord = {},
      customizeCode = '',
    } = this.state;
    const formAndListCustomizeCode = `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    const { sourceBillTypeCode } = orderHeaderFormDataSource;
    if (!poHeaderId) {
      form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const data = {
            ...merge(orderHeaderFormDataSource, values),
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
            payload: { data, customizeUnitCode: formAndListCustomizeCode },
          }).then((res) => {
            if (res) {
              this.setState({
                poHeaderId: res.poHeaderId,
              });
              this.props.history.push({
                pathname: '/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation',
                search: `?poHeaderId=${res.poHeaderId}&source=maintain`,
              });
              this.fetchDetailHeader();
              this.fetchDetailList();
              notification.success();
            }
          });
        }
      });
    } else {
      form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          let lines = [];
          if (sourceBillTypeCode === 'PURCHASE_ORDER') {
            lines = getEditTableData(
              listCommonDataSource,
              ['poLineId', '_status'],
              { container: document.querySelector('.ant-table-body') },
              {
                force: true,
              }
            );
          } else {
            lines = getEditTableData(
              listCommonDataSource,
              ['_status'],
              { container: document.querySelector('.ant-table-body') },
              { force: true }
            );
          }
          const transLines = lines.map((item, index) => {
            const { needByDate } = item;
            return {
              ...item,
              remark: item.remark || '',
              unitPrice: listCommonDataSource[index].unitPrice,
              //  enteredTaxIncludedPrice: listCommonDataSource[index].enteredTaxIncludedPrice,
              // priceLibraryId: listCommonDataSource[index].priceLibraryId,
              benchmarkPriceType:
                item.benchmarkPriceType ?? orderHeaderFormDataSource.benchmarkPriceType,
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
          if (listCommonDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
            const data = {
              poLineDetailDTOs,
              poHeaderDetailDTO: {
                ...merge(orderHeaderFormDataSource, values),
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
            // if (this.validateFields()) return;
            const payload = { data, customizeUnitCode: formAndListCustomizeCode };
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
          }
        }
      });
    }
  }

  @Bind()
  saveDetail(payload, type) {
    const { dispatch } = this.props;
    const { itemKey } = this.state;
    dispatch({
      type,
      payload,
    }).then((res) => {
      if (res) {
        window.sessionStorage.setItem(itemKey, 0);
        notification.success();
        this.fetchDetailHeader();
        this.fetchDetailList();
        if (res.maintainErrorMsg) {
          Modal.info({ title: res.maintainErrorMsg });
        }
      }
    });
  }

  /**
   * submitDetail - 提交明细数据
   * 提交明细头数据和行明细相关字段
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  submitDetail() {
    const { dispatch, form } = this.props;
    const {
      orderHeaderFormDataSource,
      listCommonDataSource,
      tenantId,
      lovRecord,
      customizeCode = '',
      // selectedListRows,
      // source,
    } = this.state;
    const formAndListCustomizeCode = `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    const { sourceBillTypeCode } = orderHeaderFormDataSource;
    // const { selectedListRows } = this.list.state;
    form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        let lines = [];
        if (sourceBillTypeCode === 'PURCHASE_ORDER') {
          lines = getEditTableData(
            listCommonDataSource,
            ['poLineId', '_status'],
            { container: document.querySelector('.ant-table-body') },
            { force: true }
          );
        } else {
          lines = getEditTableData(
            listCommonDataSource,
            ['_status'],
            { container: document.querySelector('.ant-table-body') },
            { force: true }
          );
        }
        const transLines = lines.map((item, index) => {
          const { needByDate } = item;
          return {
            ...item,
            unitPrice: listCommonDataSource[index].unitPrice,
            wbsCode: item.wbsCode || '',
            remark: item.remark || '',
            // enteredTaxIncludedPrice: listCommonDataSource[index].enteredTaxIncludedPrice,
            benchmarkPriceType:
              item.benchmarkPriceType ?? orderHeaderFormDataSource.benchmarkPriceType,
            needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
            surfaceTreatFlag: item.surfaceTreatFlag ? 1 : 0,
          };
        });
        const poLineDetailDTOs = [...transLines].map((item) => {
          if (item.uuidFlag) {
            const { prLineId, ...other } = item;
            return other;
          }
          return item;
        });
        if (listCommonDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
          // if (this.validateFields()) return;
          const data = {
            poLineDetailDTOs,
            poHeaderDetailDTO: {
              ...merge(orderHeaderFormDataSource, values),
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
                  payload: { data, customizeUnitCode: formAndListCustomizeCode },
                }).then((res) => {
                  if (res) {
                    notification.success();
                    dispatch(
                      routerRedux.push({
                        pathname: `/sodr/purchase-order-maintain/list`,
                      })
                    );
                  }
                });
              };
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
    const { orderHeaderFormDataSource, source } = this.state;
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
                  pathname:
                    source === 'maintain'
                      ? `/sodr/purchase-order-maintain/list`
                      : source === 'requisition'
                      ? `/sodr/purchase-order-maintain/quote-purchase-requisition/list`
                      : `/sodr/purchase-order-maintain/purchase/list`,
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
  // @Bind()
  // handleAddLines(selectedListRows) {
  //   const {
  //     form: { getFieldValue },
  //   } = this.props;
  //   const {
  //     listCommonDataSource,
  //     listCommonPagination,
  //     orderHeaderFormDataSource = {},
  //   } = this.state;
  //   const { currencyCode = '' } = orderHeaderFormDataSource;
  //   this.setState({
  //     listCommonDataSource: [
  //       ...listCommonDataSource,
  //       ...selectedListRows.map(n => ({
  //         ...n,
  //         _status: 'create',
  //         priceShieldFlag: undefined,
  //         currencyCode: n.currencyCode || getFieldValue('currencyCode') || currencyCode,
  //         tmpOrganizationId: n.invOrganizationId,
  //         enteredTaxIncludedPrice: n.taxIncludedUnitPrice || null,
  //       })),
  //     ],
  //     listCommonPagination: addItemsToPagination(
  //       selectedListRows.length,
  //       listCommonDataSource.length,
  //       listCommonPagination
  //     ),
  //   });
  // }

  /**
   * taxDate
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

  // @Bind()
  // handleAppendValidate(poLineDetailDTOList) {
  //   const { poHeaderId } = this.state;
  //   const { dispatch } = this.props;
  //   return dispatch({
  //     type: 'quotePurchaseRequisition/appendValidate',
  //     payload: {
  //       poHeaderId,
  //       poLineDetailDTOList,
  //     },
  //   });
  // }

  /**
   * handleDeleteLines - 删除采购申请行
   */
  // @Bind()
  // handleDeleteLines(filtered, selectedListRows) {
  //   const { listCommonPagination, listCommonDataSource } = this.state;
  //   const remoteDelete = selectedListRows.filter(item => item.poLineLocationId);
  //   if (remoteDelete.length > 0) {
  //     const newRemoteDelete = remoteDelete.map(item => {
  //       return {
  //         ...item,
  //         versionNum: item.locationVersionNumber,
  //         canCreateAsnFlag: 0,
  //         tenantId: this.state.tenantId,
  //       };
  //     });
  //     this.handleDeleteLineRemote(newRemoteDelete).then(res => {
  //       const isSuccessDeleted = isEmpty(res) && res !== undefined;
  //       if (isSuccessDeleted) {
  //         this.setState(
  //           {
  //             listCommonDataSource: filtered,
  //             listCommonPagination: delItemsToPagination(
  //               selectedListRows.length,
  //               listCommonDataSource,
  //               listCommonPagination
  //             ),
  //           },
  //           () => {
  //             notification.success();
  //             this.fetchDetailList();
  //           }
  //         );
  //       }
  //     });
  //   } else {
  //     this.setState({
  //       listCommonDataSource: filtered,
  //       listCommonPagination: delItemsToPagination(
  //         selectedListRows.length - remoteDelete.length,
  //         listCommonDataSource,
  //         listCommonPagination
  //       ),
  //     });
  //   }
  // }

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
        return oldList.find((obj) => obj.prLineId === ele.prLineId) || ele;
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
   * 修改公司Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  onChangeCompany(lovRecord = {}) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const {
      companyId,
      companyCode,
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
      companyId,
      currencyCode: currencyCode || 'CNY',
      currencyName: currencyName || intl.get('hzero.common.currency.cny').d('人民币'),
      ouId,
      ouName,
      ouCode,
      purchaseOrgId,
      purchaseOrgName,
      agentId: purchaseAgentId,
      agentName: purchaseAgentName,
      companyCode,
    };
    this.setState({
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
    });
    setFieldsValue({ ouId, purchaseOrgId, agentId: purchaseAgentId, agentName: purchaseAgentName });
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
    this.setState({
      orderHeaderFormDataSource: newOrderHeaderFormDataSource,
    });
    setFieldsValue({ supplierSiteId: null });
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
    const { ouId, ouCode, invOrganizationId, invOrganizationCode, invOrganizationName } = lovRecord;
    const { orderHeaderFormDataSource, priceModal } = this.state;
    const newOrderHeaderFormDataSource = {
      ...orderHeaderFormDataSource,
      ouId,
      ouCode,
    };
    setFieldsValue({ supplierSiteId: null });
    const { listCommonDataSource, oldList } = this.state;
    const newDateSource = listCommonDataSource.map((ele) => {
      if (ele.ouId !== ouId && ele.priceLibraryId) {
        return oldList.find((obj) => obj.prLineId === ele.prLineId) || ele;
      } else {
        return ele;
      }
    });
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
  // @Bind()
  // addDetailLines(data, success = e => e) {
  //   const { listCommonDataSource, listCommonPagination, poHeaderId } = this.state;
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'quotePurchaseRequisition/addDetailLines',
  //     poHeaderId,
  //     data,
  //   }).then(res => {
  //     if (res) {
  //       this.setState({
  //         listCommonDataSource: [...listCommonDataSource, ...res.poLineList],
  //         listCommonPagination: addItemToPagination(
  //           listCommonDataSource.length,
  //           listCommonPagination
  //         ),
  //       });
  //       success(res);
  //     }
  //   });
  // }

  /**
   * deleteDetailLines - 删除明细行数据
   * @param {object} data - 提交数据
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  // @Bind()
  // deleteDetailLines(data, success = e => e) {
  //   const { dispatch, match = {} } = this.props;
  //   const { orderHeaderFormDataSource = {} } = this.state;
  //   dispatch({
  //     type: 'quotePurchaseRequisition/deleteDetailLines',
  //     poHeaderId: orderHeaderFormDataSource.poHeaderId || match.params.id,
  //     data,
  //   }).then(res => {
  //     if (res) {
  //       success(res);
  //       this.fetchDetailList();
  //     }
  //   });
  // }

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
   * requisition：采购申请
   * @returns {*}
   */
  @Bind()
  handleBackParent() {
    const { source } = this.state;
    if (source === 'maintain') {
      return '/sodr/purchase-order-maintain/list';
    } else if (pathname_[source]) {
      return pathname_[source];
    } else {
      return '/sodr/purchase-order-maintain/quote-purchase-requisition/list';
    }
  }

  @Bind()
  onHide(priceModalVisible, priceModal) {
    this.setState({ priceModalVisible, priceModal });
  }

  @Bind()
  setPrice(val) {
    const {
      priceModal: { prLineId, supplierCompanyId, ouId },
      listCommonDataSource,
      oldList,
    } = this.state;
    const { unitPrice, ladderPriceLibList } = val;
    const index = listCommonDataSource.findIndex((ele) => ele.prLineId === prLineId);

    if (index !== -1 && isArray(ladderPriceLibList) && ladderPriceLibList[0]) {
      const { quantity } = listCommonDataSource[index];
      // eslint-disable-next-line array-callback-return
      let price = ladderPriceLibList.find(
        (item) =>
          math.gte(new BigNumber(quantity), new BigNumber(item.ladderFrom)) &&
          (math.lt(new BigNumber(quantity, new BigNumber(item.ladderTo))) ||
            math.lt(new BigNumber(quantity, new BigNumber(Infinity))))
      );
      if (!price) {
        price = unitPrice;
      }
      const newDataSource = listCommonDataSource.map((item) => {
        if (item.prLineId === prLineId) {
          item.$form.setFieldsValue('unitPrice');
          item.$form.setFieldsValue('priceLibraryId');
          return {
            ...item,
            supplierCompanyId,
            ouId,
            enteredTaxIncludedPrice:
              price && price.ladderPrice
                ? price.ladderPrice
                : listCommonDataSource[index].unitPrice,
            unitPrice:
              price && price.ladderPrice
                ? math.div(
                    new BigNumber(price.ladderPrice),
                    math.plus(
                      new BigNumber(1),
                      math.multipliedBy(new BigNumber(item.taxRate), new BigNumber(0.01))
                    )
                  )
                : listCommonDataSource[index].enteredTaxIncludedPrice,
            referPrice: price && price.ladderPrice ? 1 : 0,
            priceLibraryId: price && price.priceLibraryId ? price.priceLibraryId : null,
          };
        } else {
          return { ...item, priceLibraryId: item.priceLibraryId };
        }
      });
      this.handleChangeList(newDataSource);
    }
    if (!isEmpty(val)) {
      const newDataSource = listCommonDataSource.map((item) => {
        if (item.prLineId === prLineId) {
          item.$form.setFieldsValue('unitPrice');
          item.$form.setFieldsValue('priceLibraryId');
          return {
            ...item,
            supplierCompanyId,
            ouId,
            enteredTaxIncludedPrice: unitPrice || listCommonDataSource[index].unitPrice,
            unitPrice:
              !math.isZero(unitPrice) && unitPrice
                ? math.div(
                    new BigNumber(unitPrice),
                    math.plus(
                      new BigNumber(1),
                      math.multipliedBy(new BigNumber(item.taxRate), new BigNumber(0.01))
                    )
                  )
                : listCommonDataSource[index].enteredTaxIncludedPrice,
            referPrice: !math.isZero(unitPrice) && unitPrice ? 1 : 0,
            priceLibraryId:
              !math.isZero(unitPrice) && unitPrice && val.priceLibraryId
                ? val.priceLibraryId
                : null,
          };
        } else {
          return { ...item, priceLibraryId: item.priceLibraryId };
        }
      });
      this.handleChangeList(newDataSource);
    }

    if (isEmpty(val)) {
      const oldStatus = oldList.filter((item) => item.prLineId === prLineId)[0];
      const newDataSource = listCommonDataSource.map((item) => {
        if (item.prLineId === prLineId) {
          item.$form.setFieldsValue('unitPrice');
          item.$form.setFieldsValue('priceLibraryId');
          return {
            ...oldStatus,
            priceLibraryId: null,
          };
        } else {
          return {
            ...item,
            priceLibraryId: item.priceLibraryId,
          };
        }
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

  @Bind()
  handlePrice(record) {
    const { priceLibraryId } = record;
    const { priceModal } = this.state;
    const recordPrice = {
      ...priceModal,
      prLineId: record.prLineId,
      priceLibraryId,
      itemId: record.itemId,
    };
    this.setState({
      priceModal: {
        ...priceModal,
        prLineId: record.prLineId,
        priceLibraryId,
        itemId: record.itemId,
      },
    });
    if (!priceModal.supplierCompanyId || !priceModal.ouId) {
      notification.warning({
        message: intl.get('hzero.common.validation.notNul112l').d('供应商或采购组织不能为空'),
      });
    } else {
      const priceModalVisible = true;
      this.onHide(priceModalVisible, recordPrice);
    }
  }

  /**
   * 改变供应商flag
   */
  @Bind()
  onChangeSupplierCount(count) {
    this.setState({
      requisitionCount: count,
      orderMainCount: count,
    });
  }

  /**
   * 改变供应商flag
   */
  @Bind()
  onChangeSupplierFlag(flag) {
    this.setState({
      supplierFlag: flag,
    });
  }

  // 采购申请行分页处理
  @Bind()
  handleChangePagination(page = {}) {
    // const { orderHeaderFormDataSource } = this.state;
    // const { sourceBillTypeCode } = orderHeaderFormDataSource;
    // if (sourceBillTypeCode === 'PURCHASE_REQUEST') {
    //   this.setState({ listCommonPagination: page });
    // } else {
    this.fetchDetailList(page);
    // }
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

  // 手动校验采购申请来源行
  @Bind()
  validateFields() {
    const { orderHeaderFormDataSource = {}, listCommonDataSource } = this.state;
    const { sourceBillTypeCode } = orderHeaderFormDataSource;
    let err = false;
    if (sourceBillTypeCode === 'PURCHASE_REQUEST') {
      const fields = [
        'categoryId',
        'categoryName',
        'uomId',
        'uomName',
        'currencyCode',
        'taxId',
        'taxRate',
        'enteredTaxIncludedPrice',
        'invOrganizationId',
        'invOrganizationName',
      ];
      listCommonDataSource.forEach((item) => {
        fields.forEach((e) => {
          if (!item[e]) {
            err = true;
          }
        });
      });
    }
    if (err) {
      notification.warning({
        message: intl.get('sodr.common.view.message.not.null').d('必输字段不能为空，请确认'),
      });
    }
    return err;
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

  /**
   * 头添加批量维护字段
   * @param {Array} listCommonDataSource
   */
  @Bind()
  handleChangeHeader(orderHeaderFormDataSource) {
    this.setState({ orderHeaderFormDataSource });
  }

  @Bind()
  async validateItemAndInv(invOrganizationId, selectedListRows) {
    const { dispatch, form } = this.props;
    const { listCommonDataSource = [], orderHeaderFormDataSource } = this.state;
    const listData = isEmpty(selectedListRows) ? listCommonDataSource : selectedListRows;
    const list = listData.map((i) => {
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
      saveWarnLoading = false,
      // addDetailLinesLoading = false,
      deleteDeliveryLoading = false,
      // queryCreateListLoading = false,
      queryDetailHeaderLoading = false,
      queryDetailListLoading = false,
      submitDetailLoading = false,
      quotePurchaseRequisition: { enumMap },
      addNewSubmitDetailLoading,
      budgetVerificationLoading = false,
      // validating,
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
      companyFlag,
      fetchFlag,
      requisitionCount,
      orderMainCount,
      source,
      supplierFlag,
      setting,
      returnOrderFlag,
      doubleUnitEnabled,
    } = this.state;
    const {
      statusCode,
      // prStatusCode,
      poHeaderId,
      poSourcePlatform,
      // priceShieldFlag,
      tieredPricingFlag,
      ouId,
      companyId,
      transactionMode,
      multiDealParentPoHeaderId,
    } = orderHeaderFormDataSource;
    // const deliveryAndBillProps = {
    //   dataSource: orderHeaderFormDataSource,
    //   loading: queryDetailHeaderLoading,
    // };
    const orderHeaderFormDataSourceFormProps = {
      form,
      fetchFlag,
      customizeForm,
      newAddLoading,
      poSourcePlatform,
      listCommonDataSource,
      poHeaderId: this.state.poHeaderId,
      loading: queryDetailHeaderLoading,
      onChangeListData: this.handleChangeLov,
      handleChangeList: this.handleChangeList,
      onChangeCompany: this.onChangeCompany,
      onOuNameOnchange: this.onOuNameOnchange,
      onFetchFlag: this.changeFetchFlag,
      onChangeSettleSupplierLov: this.onChangeSettleSupplierLov,
      onChangeSupplierFlag: this.onChangeSupplierFlag,
      onChangeSupplierLov: this.onChangeSupplierLov,
      onChangeSupplierCount: this.onChangeSupplierCount,
      headerOnChangeForm: this.headerOnChangeForm,
      dataSource: orderHeaderFormDataSource,
      onRef: (node) => {
        this.orderHeaderFormDataSourceForm = node;
      },
      companyFlag,
      requisitionCount,
      orderMainCount,
      source,
      supplierFlag,
      termsOnchange: this.termsOnchange,
    };
    const listProps = {
      tenantId,
      // prStatusCode,
      customizeTable,
      supplierCompanyId,
      setting,
      tieredPricingFlag,
      ouId,
      companyId,
      returnOrderFlag,
      poSourcePlatform,
      isClearListCacheDataSource,
      isHeaderInfoFormDataSource,
      selectedListRows,
      handTaxDate: this.handTaxDate,
      loading: queryDetailListLoading,
      dataSource: listCommonDataSource,
      pagination: listCommonPagination,
      headerInfo: orderHeaderFormDataSource,
      onChangeHeader: this.handleChangeHeader,
      validateItemAndInv: this.validateItemAndInv,
      handleRowSelectedChange: this.handleRowSelectedChange,
      // fetchList: this.fetchDetailList,
      // handleAddLines: this.handleAddLines,
      // handleDeleteLines: this.handleDeleteLines,
      // addDetailLines: this.addDetailLines,
      // deleteDetailLines: this.deleteDetailLines,
      onChangeListData: this.handleChangeList,
      // onHandleAppendValidate: this.handleAppendValidate,
      onHide: this.onHide,
      showPriceModal: this.handlePrice,
      form,
      fetchFlag,
      doubleUnitEnabled,
      handleChangePagination: this.handleChangePagination,
      afterOpenUploadModal: this.afterOpenUploadModal,
      // onDataChange: this.onDataChange,
      onRef: (node) => {
        this.orderListFormDataSourceForm = node;
      },
      enumMap,
      customizeForm,
    };
    const { attachmentUuid, purchaserInnerAttachmentUuid } = orderHeaderFormDataSource;
    const uploadModalProps = {
      btnText: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
      btnProps: {
        icon: 'upload',
        disabled: !poHeaderId || saveLoading || submitDetailLoading || deleteDeliveryLoading,
      },
      showFilesNumber: true,
      attachmentUUID: attachmentUuid,
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
      afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    };
    const uploadModalPropsLoad = {
      btnText: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
      btnProps: {
        icon: 'upload',
        disabled: !poHeaderId || saveLoading || submitDetailLoading || deleteDeliveryLoading,
      },
      showFilesNumber: true,
      attachmentUUID: purchaserInnerAttachmentUuid,
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
      afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
    };
    // 参考价格
    const priceModalProps = {
      visible: priceModalVisible,
      supplierCompanyId: priceModal.supplierCompanyId,
      companyId: priceModal.companyId,
      ouId: priceModal.ouId,
      itemId: priceModal.itemId,
      priceLibraryId: priceModal.priceLibraryId,
      hideModal: this.handleToolTipVisible,
      onSetPrice: this.setPrice,
      supplierId: orderHeaderFormDataSource.supplierId,
    };
    const loadingAll =
      queryDetailHeaderLoading ||
      queryDetailListLoading ||
      saveLoading ||
      newAddLoading ||
      saveWarnLoading ||
      submitDetailLoading ||
      deleteDeliveryLoading ||
      addNewSubmitDetailLoading ||
      budgetVerificationLoading;
    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.quotePurchase.view.message.purchaseOrderMaintain`).d('订单维护')}
          backPath={this.handleBackParent()}
        >
          <Button loading={loadingAll} onClick={this.save} type="primary" icon="save">
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button loading={loadingAll} icon="check" onClick={this.submitDetail}>
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <UploadModal {...uploadModalProps} />
          <UploadModal {...uploadModalPropsLoad} />
          {statusCode !== 'REJECTED' &&
            (transactionMode !== 'TRIPARTITE' || !multiDealParentPoHeaderId) && (
              <Button loading={loadingAll} onClick={this.invalidDelivery} icon="delete">
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
            )}
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
              {poSourcePlatform === 'CATALOGUE' && ( // 目录化
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
              {this.state.poHeaderId && (
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
      </Fragment>
    );
  }
}
