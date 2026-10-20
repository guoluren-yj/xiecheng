/* eslint-disable prefer-destructuring */
/**
 * LineCreation - 按行引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Spin, Collapse, Icon, Modal, Form } from 'hzero-ui';
import { connect } from 'dva';
import DynamicButtons from '_components/DynamicButtons';
import { isEmpty, merge, filter, isNil, throttle } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import {
  createPagination,
  getCurrentOrganizationId,
  getEditTableData,
  delItemsToPagination,
  addItemsToPagination,
} from 'utils/utils';
import intl from 'utils/intl';
import remotes from 'utils/remote';
import notification from 'utils/notification';
import { DATETIME_MIN, DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import PurchaseRequestHeader from './PurchaseRequestHeader';
import PurchaseLineInfo from './PurchaseLineInfo';
import {
  BUCKET_NAME,
  THROTTLE_TIME,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
} from '@/routes/components/utils/constant';
import {
  handleOldBudgetVerification,
  queryCommonDoubleUomConfig,
  validateLineCalculate,
  getStageIdList,
} from '@/routes/components/utils';
import remoteConfig from './remote';

const { Panel } = Collapse;

@withCustomize({
  unitCode: [
    'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
    'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
    'SODR.ORDER_CREATE_LINE_LIST.AGREEMENT_BTNS',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_CATALOGUE',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_ERP',
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
  saveWarnLoading: loading.effects['quotePurchaseRequisition/saveWarn'],
  submitDetailLoading: loading.effects['quotePurchaseRequisition/submitDetail'],
  deleteLineRemoteLoaing: loading.effects['quotePurchaseRequisition/deleteLineRemote'],
  deleteDeliveryLoading: loading.effects['quotePurchaseRequisition/deleteSheetDelivery'],
  queryDetailHeaderLoading: loading.effects['quotePurchaseRequisition/queryDetailHeader'],
  queryDetailListLoading: loading.effects['quotePurchaseRequisition/queryDetailList'],
  addNewSubmitDetailLoading: loading.effects['quotePurchaseRequisition/addNewSubmitDetail'],
  checkInvOrganizationLoading: loading.effects['quotePurchaseRequisition/checkInvOrganization'],
  budgetVerificationLoading: loading.effects['quotePurchaseRequisition/oldBudgetVerification'],
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
    const { poHeaderId, source, itemKey } = querystring.parse(search.substr(1));
    this.state = {
      poHeaderId,
      source,
      lovRecord: {},
      orderHeaderFormDataSource: {}, // 头form数据源
      listCommonDataSource: [], // 表格数据源
      listCommonPagination: {}, // 表格分页
      collapseKeys: ['orderHeaderInfo', 'orderLineInfo'], // 打开的折叠面板key
      tenantId: getCurrentOrganizationId(),
      selectedListRows: [],
      // priceModal: {},
      oldList: [], // 数据备份
      // fetchFlag: false, // 判断是否调用接口标识
      itemKey,
      // requisitionCount: 0, // 供应商引用采购申请变更次数
      // orderMainCount: 0, // 供应商订单维护变更次数
      // supplierFlag: false,
      // setting: '0',
      // customizeCode: '', // 个性化编码
      returnOrderFlag: null,
      enableSupplierSiteFlag: '',
      doubleUnitEnabled: 0,
      stageIdList: null,
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { poHeaderId } = this.state;
    this.fetchEnum();
    if (poHeaderId) {
      this.fetchDetailHeader();
      this.fetchDetailList();
      this.queryDoubleUomConfig();
      // this.getCompanyId();
      // this.fetchSettings();
    }
    window.addEventListener('message', this.handleEvent);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleEvent);
  }

  /**
   * 查询双单位配置
   */
  @Bind()
  async queryDoubleUomConfig() {
    const result = await queryCommonDoubleUomConfig({ moduleCode: 'SPCM' });
    this.setState({
      doubleUnitEnabled: result || 0,
    });
  }

  @Bind()
  async fetchStageIdList() {
    const stageIdList = await getStageIdList();
    this.setState({ stageIdList });
  }

  @Bind()
  handleEvent(e) {
    if (e.data === 'sodr/purchase-order-maintain/list') {
      this.fetchDetailHeader();
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
      // prLineId: uuid(),
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
  // @Bind()
  // fetchSettings() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'quotePurchaseRequisition/fetchSettings',
  //   }).then((res) => {
  //     if (res) {
  //       this.setState({
  //         setting: res['000112'],
  //       });
  //     }
  //   });
  // }

  // @Bind()
  // getCompanyId() {
  //   const { dispatch } = this.props;
  //   dispatch({ type: 'quotePurchaseRequisition/queryCompanyId' }).then((res) => {
  //     if (res && res[0]) {
  //       this.setState({ companyFlag: res[0].companyFlag });
  //     }
  //   });
  // }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader(flag) {
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
        this.setState(
          {
            orderHeaderFormDataSource: {
              ...res,
              prepayFlag: isNil(res.prepayFlag) ? 0 : res.prepayFlag,
            },
            lovRecord,
            // customizeCode: 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
            enableSupplierSiteFlag: res.enableSupplierSiteFlag,
            // priceModal: {
            //   supplierCompanyId: res.supplierCompanyId || res.supplierId,
            //   ouId: res.ouId,
            // },
          },
          () => {
            // 避免绑定uuid更新行数据
            if (!flag) {
              form.resetFields();
              form.setFieldsValue({
                poHeaderId: res?.poHeaderId,
              });
              // this.fetchDetailList();
            }
          }
        );
      }
    });
  }

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} page - 查询条件
   */
  @Bind()
  fetchDetailList(page = {}) {
    const {
      dispatch,
      quotePurchaseRequisition: { enumMap },
    } = this.props;
    const { poHeaderId } = this.state;
    const { internationalTelCode = [] } = enumMap;
    // 获取价格库查询标识
    // const priceQueryFlag = window.sessionStorage.getItem(itemKey);
    this.setState({ listCommonDataSource: [] });
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
              // prLineId: n.prLineId || uuid(),
              uuidFlag: !n.prLineId,
              tmpOrganizationId: n.invOrganizationId,
              internationalTelCode: n.internationalTelCode || internationalTelCode[0]?.value,
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
            // 处理首次查询不含税单价不更新显示值
            // const { listCommonDataSource, lovRecord } = this.state; ==> PS:注释原有订单逻辑
            const { listCommonDataSource } = this.state;
            listCommonDataSource.forEach((item) => {
              if (item.$form) {
                // item.$form.resetFields();
                item.$form.setFieldsValue({ unitPrice: item.unitPrice });
              }
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
   * handleDeleteLines - 删除行
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
   * handleDeleteLines - 远程删除订单行
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
   * 删除
   */
  @Bind()
  handleCancelLines() {
    const {
      selectedListRows = [],
      listCommonPagination,
      listCommonDataSource,
      orderHeaderFormDataSource,
    } = this.state;
    const { poSourcePlatform } = orderHeaderFormDataSource;
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
        title: intl.get(`sodr.common.model.common.deltetList`).d('是否删除数据'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: throttle(
          () => {
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
          },
          THROTTLE_TIME,
          { trailing: false }
        ),
      });
    }
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
      orderHeaderFormDataSource,
      tenantId,
      listCommonDataSource,
      lovRecord = {},
      doubleUnitEnabled,
    } = this.state;
    const formAndListCustomizeCode = `SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION,SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        let lines = [];
        lines = getEditTableData(
          listCommonDataSource,
          ['_status'],
          { container: document.querySelector('.ant-table-body') },
          { force: true }
        );
        const transLines = lines.map((item) => {
          const { needByDate } = item;
          return {
            ...item,
            // unitPrice: listCommonDataSource[index].unitPrice,
            //  enteredTaxIncludedPrice: listCommonDataSource[index].enteredTaxIncludedPrice,
            // priceLibraryId: listCommonDataSource[index].priceLibraryId,
            benchmarkPriceType:
              item.benchmarkPriceType ?? orderHeaderFormDataSource.benchmarkPriceType,
            tenantId,
            needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
            surfaceTreatFlag: item.surfaceTreatFlag ? 1 : 0,
            returnedFlag: item.returnedFlag ? 1 : 0,
            poLineId: item.displayLineNum ? item.poLineId : undefined,
            wbsCode: item.wbsCode || '',
            remark: item.remark || '',
            receiveToleranceQuantityType: item.receiveToleranceQuantityType || '',
          };
        });
        if (!this.validateUomCalc({ doubleUnitEnabled, data: transLines })) return false;
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

  @Bind()
  saveDetail(payload, type) {
    const { itemKey } = this.state;
    const { dispatch } = this.props;
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

  // 保存和提交前校验是否存在双单位计算错误
  @Bind()
  validateUomCalc({ doubleUnitEnabled, data }) {
    if (doubleUnitEnabled && !validateLineCalculate({ data, type: 'h0' })) return false;
    return true;
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
      doubleUnitEnabled,
    } = this.state;
    // listCommonDataSource.forEach((n) => {
    //   if (!n.displayLineNum) {
    //     const nn = n;
    //     nn.poLineId = undefined;
    //     nn.prLineId = undefined;
    //   }
    // });
    const formAndListCustomizeCode = `SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION,SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        let lines = [];
        lines = getEditTableData(
          listCommonDataSource,
          ['_status'],
          { container: document.querySelector('.ant-table-body') },
          { force: true }
        );
        const transLines = lines.map((item) => {
          const { needByDate } = item;
          return {
            ...item,
            wbsCode: item.wbsCode || '',
            remark: item.remark || '',
            // unitPrice: listCommonDataSource[index].unitPrice,
            // enteredTaxIncludedPrice: listCommonDataSource[index].enteredTaxIncludedPrice,
            benchmarkPriceType:
              item.benchmarkPriceType ?? orderHeaderFormDataSource.benchmarkPriceType,
            needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
            surfaceTreatFlag: item.surfaceTreatFlag ? 1 : 0,
            poLineId: item.displayLineNum ? item.poLineId : undefined,
            prLineId: item.displayLineNum ? item.prLineId : undefined,
          };
        });
        if (!this.validateUomCalc({ doubleUnitEnabled, data: transLines })) return false;
        const poLineDetailDTOs = [...transLines].map((item) => {
          if (item._status === 'update') {
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
              remark: values.remark || '',
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
                    if (res.minAmountInfo) {
                      notification.warning({
                        message: res.minAmountInfo,
                      });
                    }
                    dispatch(
                      routerRedux.push({
                        // pathname: `/sodr/purchase-order-maintain/list`,
                        pathname: this.handleBackParent(),
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
  // @Bind()
  // changeFetchFlag(newFlag) {
  //   this.setState({ fetchFlag: newFlag });
  // }

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

  /**
   * taxDate
   */
  @Bind()
  handTaxDate(text, values, record) {
    const { listCommonDataSource } = this.state;
    const oldList = listCommonDataSource.findIndex((e) => e.poLineId === record.poLineId);
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

  /**
   * 修改行数据
   * @param {Array} listCommonDataSource
   */
  @Bind()
  handleChangeList(listCommonDataSource) {
    this.setState({ listCommonDataSource });
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
  // @Bind()
  // handleChangeLov(lovRecord) {
  //   const {
  //     form: { registerField, setFieldsValue },
  //   } = this.props;

  //   this.setState({ lovRecord });
  //   const { supplierId, supplierCompanyId } = lovRecord;
  //   registerField('supplierId');
  //   setFieldsValue({ supplierId });
  //   const { listCommonDataSource, oldList, priceModal } = this.state;
  //   const newDateSource = listCommonDataSource.map((ele) => {
  //     if (
  //       ele.supplierCompanyId !== supplierId &&
  //       ele.supplierCompanyId !== supplierCompanyId &&
  //       ele.priceLibraryId
  //     ) {
  //       return oldList.find((obj) => obj.prLineId === ele.prLineId) || ele;
  //     } else {
  //       return ele;
  //     }
  //   });
  //   this.setState({
  //     listCommonDataSource: newDateSource,
  //     priceModal: { ...priceModal, supplierCompanyId: supplierCompanyId || supplierId },
  //   });
  // }

  /**
   * 修改公司Lov数据
   * @param {Array} lovRecord
   */
  // @Bind()
  // onChangeCompany(lovRecord) {
  //   const {
  //     form: { setFieldsValue },
  //   } = this.props;
  //   const { companyId, currencyCode, currencyName } = lovRecord;
  //   const { orderHeaderFormDataSource } = this.state;
  //   const newOrderHeaderFormDataSource = {
  //     ...orderHeaderFormDataSource,
  //     supplierName: '',
  //     supplierCompanyName: '',
  //     companyId,
  //     currencyCode: currencyCode || 'CNY',
  //     currencyName: currencyName || '人民币',
  //   };
  //   this.setState({
  //     orderHeaderFormDataSource: newOrderHeaderFormDataSource,
  //   });
  //   setFieldsValue({ ouId: null });
  //   setFieldsValue({ tempKey: null });
  //   setFieldsValue({
  //     currencyCode: currencyCode || 'CNY',
  //     currencyName: currencyName || '人民币',
  //   });
  // }

  /**
   * 修改供应商Lov数据
   * @param {Array} lovRecord
   */
  // @Bind()
  // onChangeSupplierLov(lovRecord) {
  //   const { supplierCompanyId } = lovRecord;
  //   const { orderHeaderFormDataSource } = this.state;
  //   const newOrderHeaderFormDataSource = {
  //     ...orderHeaderFormDataSource,
  //     supplierCompanyId,
  //   };
  //   this.setState({
  //     orderHeaderFormDataSource: newOrderHeaderFormDataSource,
  //   });
  // }

  /**
   * 修改业务实体Lov数据
   * @param {Array} lovRecord
   */
  @Bind()
  onOuNameOnchange(lovRecord = {}) {
    const { ouId, ouCode } = lovRecord;
    const { orderHeaderFormDataSource } = this.state;
    const {
      form: { setFieldsValue, getFieldsValue },
      dispatch,
    } = this.props;
    const { companyId } = getFieldsValue() || {};
    let newOrderHeaderFormDataSource = {
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
      // priceModal: { ...priceModal, ouId },
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
    } else {
      return '/sodr/purchase-order-maintain/purchase/list';
    }
  }

  /**
   * 改变供应商flag
   */
  // @Bind()
  // onChangeSupplierCount(count) {
  //   this.setState({
  //     requisitionCount: count,
  //     orderMainCount: count,
  //   });
  // }

  /**
   * 改变供应商flag
   */
  // @Bind()
  // onChangeSupplierFlag(flag) {
  //   this.setState({
  //     supplierFlag: flag,
  //   });
  // }

  // 采购申请行分页处理
  @Bind()
  handleChangePagination(page = {}) {
    this.fetchDetailList(page);
  }

  @Bind()
  headerOnChangeForm(_record) {
    const { listCommonDataSource } = this.state;
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
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectedChange(_, selectedRows) {
    this.setState({ selectedListRows: selectedRows });
  }

  @Bind()
  async validateItemAndInv(invOrganizationId) {
    const {
      listCommonDataSource = [],
      selectedListRows = [],
      orderHeaderFormDataSource,
    } = this.state;
    const { dispatch, form } = this.props;
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
      saveWarnLoading = false,
      deleteDeliveryLoading = false,
      queryDetailHeaderLoading = false,
      queryDetailListLoading = false,
      submitDetailLoading = false,
      addNewSubmitDetailLoading = false,
      budgetVerificationLoading = false,
      remote,
      form,
    } = this.props;
    const { orderHeaderFormDataSource = {} } = this.state;
    const {
      statusCode,
      poHeaderId,
      attachmentUuid,
      purchaserInnerAttachmentUuid,
    } = orderHeaderFormDataSource;
    const headerBtnLoading =
      saveLoading ||
      saveWarnLoading ||
      submitDetailLoading ||
      deleteDeliveryLoading ||
      addNewSubmitDetailLoading ||
      budgetVerificationLoading ||
      queryDetailHeaderLoading ||
      queryDetailListLoading;

    const btns = [
      {
        name: 'save',
        child: intl.get(`hzero.common.button.save`).d('保存'),
        btnProps: {
          icon: 'save',
          type: 'primary',
          onClick: this.save,
          loading: headerBtnLoading,
        },
      },
      {
        name: 'check',
        child: intl.get(`hzero.common.button.submit`).d('提交'),
        btnProps: {
          disabled: !poHeaderId,
          icon: 'check',
          onClick: this.submitDetail,
          loading: headerBtnLoading,
        },
      },
      {
        name: 'outUuid',
        btnComp: UploadModal,
        btnProps: {
          btnProps: {
            icon: 'upload',
            disabled: !poHeaderId || saveLoading || submitDetailLoading || deleteDeliveryLoading,
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
            disabled: !poHeaderId || saveLoading || submitDetailLoading || deleteDeliveryLoading,
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
          disabled: !poHeaderId,
          icon: 'delete',
          onClick: this.invalidDelivery,
          loading: headerBtnLoading,
        },
      },
    ];
    return remote.process('processHeaderBtn', btns, { form, orderHeaderFormDataSource });
  }

  render() {
    const {
      form,
      customizeForm,
      customizeTable,
      //   saveLoading = false,
      //  deleteDeliveryLoading = false,
      queryDetailHeaderLoading = false,
      queryDetailListLoading = false,
      //  submitDetailLoading = false,
      deleteLineRemoteLoaing = false,
      //   addNewSubmitDetailLoading,
      quotePurchaseRequisition: { enumMap },
      checkInvOrganizationLoading = false,
      //  budgetVerificationLoading = false,
      customizeBtnGroup,
    } = this.props;
    const {
      collapseKeys,
      tenantId,
      stageIdList,
      listCommonDataSource,
      listCommonPagination,
      selectedListRows,
      orderHeaderFormDataSource = {},
      lovRecord: { supplierCompanyId },
      // companyFlag,
      // requisitionCount,
      // orderMainCount,
      // source,
      // supplierFlag,
      returnOrderFlag,
      doubleUnitEnabled,
      enableSupplierSiteFlag,
    } = this.state;
    const {
      //  statusCode,
      //  poHeaderId,
      poSourcePlatform,
      tieredPricingFlag,
      ouId,
      companyId,
    } = orderHeaderFormDataSource;
    const orderHeaderFormDataSourceFormProps = {
      form,
      stageIdList,
      customizeForm,
      listCommonDataSource,
      poHeaderId: this.state.poHeaderId,
      loading: queryDetailHeaderLoading,
      // onChangeListData: this.handleChangeLov,
      // handleChangeList: this.handleChangeList,
      // onChangeCompany: this.onChangeCompany,
      onOuNameOnchange: this.onOuNameOnchange,
      onChangeSettleSupplierLov: this.onChangeSettleSupplierLov,
      // onFetchFlag: this.changeFetchFlag,
      // onChangeSupplierFlag: this.onChangeSupplierFlag,
      // onChangeSupplierLov: this.onChangeSupplierLov,
      // onChangeSupplierCount: this.onChangeSupplierCount,
      headerOnChangeForm: this.headerOnChangeForm,
      dataSource: orderHeaderFormDataSource,
      onRef: (node) => {
        this.orderHeaderFormDataSourceForm = node;
      },
      enableSupplierSiteFlag,
      // companyFlag,
      // requisitionCount,
      // orderMainCount,
      // source,
      // supplierFlag,
      termsOnchange: this.termsOnchange,
    };
    const listProps = {
      tenantId,
      customizeTable,
      supplierCompanyId,
      tieredPricingFlag,
      ouId,
      companyId,
      returnOrderFlag,
      selectedListRows,
      poSourcePlatform,
      handTaxDate: this.handTaxDate,
      handleTranslate: this.handleTranslate,
      loading: queryDetailListLoading,
      dataSource: listCommonDataSource,
      pagination: listCommonPagination,
      onChangeListData: this.handleChangeList,
      form,
      deleteLineRemoteLoaing,
      handleCancelLines: this.handleCancelLines,
      handleChangePagination: this.handleChangePagination,
      handleRowSelectedChange: this.handleRowSelectedChange,
      afterOpenUploadModal: this.afterOpenUploadModal,
      headerInfo: orderHeaderFormDataSource,
      onRef: (node) => {
        this.orderListFormDataSourceForm = node;
      },
      onChangeHeader: this.handleChangeHeader,
      enumMap,
      doubleUnitEnabled,
      validateItemAndInv: this.validateItemAndInv,
      checkInvOrganizationLoading,
      customizeForm,
    };
    // const { attachmentUuid, purchaserInnerAttachmentUuid } = orderHeaderFormDataSource;
    // const uploadModalProps = {
    //   btnText: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
    //   btnProps: {
    //     icon: 'upload',
    //     disabled: !poHeaderId || saveLoading || submitDetailLoading || deleteDeliveryLoading,
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
    //     disabled: !poHeaderId || saveLoading || submitDetailLoading || deleteDeliveryLoading,
    //   },
    //   showFilesNumber: true,
    //   attachmentUUID: purchaserInnerAttachmentUuid,
    //   bucketName: BUCKET_NAME,
    //   bucketDirectory: 'sodr-order',
    //   afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
    // };
    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.quotePurchase.view.message.purchaseOrderMaintain`).d('订单维护')}
          backPath={this.handleBackParent()}
        >
          {customizeBtnGroup(
            { code: 'SODR.ORDER_CREATE_LINE_LIST.AGREEMENT_BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtnsRender()} />
          )}
          {/* <Button
            loading={
              queryDetailHeaderLoading ||
              queryDetailListLoading ||
              saveLoading ||
              submitDetailLoading ||
              deleteDeliveryLoading ||
              addNewSubmitDetailLoading
            }
            onClick={this.save}
            type="primary"
            icon="save"
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button
            disabled={!this.state.poHeaderId}
            loading={
              queryDetailHeaderLoading ||
              queryDetailListLoading ||
              saveLoading ||
              submitDetailLoading ||
              deleteDeliveryLoading ||
              addNewSubmitDetailLoading ||
              budgetVerificationLoading
            }
            icon="check"
            onClick={this.submitDetail}
          >
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <UploadModal {...uploadModalProps} />
          <UploadModal {...uploadModalPropsLoad} />
          {statusCode !== 'REJECTED' && (
            <Button
              disabled={!this.state.poHeaderId}
              loading={
                queryDetailHeaderLoading ||
                queryDetailListLoading ||
                saveLoading ||
                submitDetailLoading ||
                deleteDeliveryLoading ||
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
      </Fragment>
    );
  }
}
