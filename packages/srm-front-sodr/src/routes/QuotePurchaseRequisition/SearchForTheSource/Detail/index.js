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

import { isEmpty, filter, isNil, throttle } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import {
  addItemsToPagination,
  // addItemToPagination,
  createPagination,
  getCurrentOrganizationId,
  getEditTableData,
  delItemsToPagination,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { DATETIME_MIN, DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import moment from 'moment';
import {
  newTableEnable,
  getStageIdList,
  handleOldBudgetVerification,
  queryCommonDoubleUomConfig,
  validateLineCalculate,
} from '@/routes/components/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import PurchaseRequestHeader from './PurchaseRequestHeader';
import C7nDetail from '../../C7nSearchForTheSource';
import PurchaseLineInfo from './PurchaseLineInfo';
import {
  BUCKET_NAME,
  THROTTLE_TIME,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
} from '@/routes/components/utils/constant';
import remoteConfig from './remote';

const { Panel } = Collapse;

@newTableEnable(C7nDetail, 'orderMaintain')
@formatterCollections({
  code: [
    'component.docFlow',
    'sodr.quotePurchaseRequisition',
    'sodr.common',
    'entity.attachment',
    'sodr.orderMaintain',
    'sodr.quotePurchase',
    'hpfm.employee',
    'srm.common',
    'sodr.workspace',
  ],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
    'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
    'SODR.ORDER_CREATE_LINE_LIST.SOURCE_BTNS',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_CATALOGUE',
    'SODR.ORDER_CREATE_LINE_LIST.BATCH_ERP',
  ],
})
@cuxRemote(...remoteConfig)
@connect(({ loading, quotePurchaseRequisition }) => ({
  saveLoading: loading.effects['quotePurchaseRequisition/add'],
  newAddLoading: loading.effects['quotePurchaseRequisition/newAdd'],
  saveWarnLoading: loading.effects['quotePurchaseRequisition/saveWarn'],
  submitDetailLoading: loading.effects['quotePurchaseRequisition/submitDetail'],
  addDetailLinesLoading: loading.effects['quotePurchaseRequisition/addDetailLines'],
  deleteDetailLinesLoading: loading.effects['quotePurchaseRequisition/deleteDetailLines'],
  deleteLineRemoteLoaing: loading.effects['quotePurchaseRequisition/deleteLineRemote'],
  deleteDeliveryLoading: loading.effects['quotePurchaseRequisition/deleteSheetDelivery'],
  queryCreateListLoading: loading.effects['quotePurchaseRequisition/queryDetailCreateList'],
  queryDetailHeaderLoading: loading.effects['quotePurchaseRequisition/queryDetailHeader'],
  queryDetailListLoading: loading.effects['quotePurchaseRequisition/queryDetailList'],
  validating: loading.effects['quotePurchaseRequisition/appendValidate'],
  addNewSubmitDetailLoading: loading.effects['quotePurchaseRequisition/addNewSubmitDetail'],
  checkInvOrganizationLoading: loading.effects['quotePurchaseRequisition/checkInvOrganization'],
  budgetVerificationLoading: loading.effects['quotePurchaseRequisition/oldBudgetVerification'],
  fetchAutoGetCompany: loading.effects['quotePurchaseRequisition/fetchAutoGetCompany'],
  quotePurchaseRequisition,
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { poHeaderId, entrance } = querystring.parse(search.substr(1));
    this.state = {
      poHeaderId,
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
      // priceModalVisible: false, // 参考价格
      // priceModal: {},
      oldList: [], // 数据备份
      customizeCode: '', // 个性化编码
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
    const result = await queryCommonDoubleUomConfig({ moduleCode: 'RFX' });
    this.setState({
      doubleUnitEnabled: result || 0,
    });
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

  @Bind()
  async fetchStageIdList() {
    const stageIdList = await getStageIdList();
    this.setState({ stageIdList });
  }

  // @Bind()
  // getCompanyId() {
  //   const { dispatch } = this.props;
  //   dispatch({ type: 'quotePurchaseRequisition/queryCompanyId' }).then(res => {
  //     if (res && res[0]) {
  //       this.setState({ companyFlag: res[0].companyFlag });
  //     }
  //   });
  // }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader() {
    const { dispatch } = this.props;
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
        const { poSourcePlatform } = res;
        const code = this.getCustomizeCode(poSourcePlatform);
        this.setState(
          {
            orderHeaderFormDataSource: {
              ...res,
              prepayFlag: isNil(res.prepayFlag) ? 0 : res.prepayFlag,
            },
            lovRecord,
            customizeCode: code,
            enableSupplierSiteFlag: res.enableSupplierSiteFlag,
          }
          // function () {
          //   this.fetchDetailList();
          // }
        );
      }
    });
  }

  /**
   * getCustomizeCode - 获取个性化编码
   */
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
    const {
      form,
      dispatch,
      quotePurchaseRequisition: { enumMap },
    } = this.props;
    const { poHeaderId } = this.state;
    const { internationalTelCode = [] } = enumMap;
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
            this.state.listCommonDataSource.forEach((i) => {
              if (i.$form) {
                i.$form.resetFields();
              }
            });
            if (isEmpty(page)) {
              form.resetFields();
            }
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

  // 保存和提交前校验是否存在双单位计算错误
  @Bind()
  validateUomCalc({ doubleUnitEnabled, data }) {
    if (doubleUnitEnabled && !validateLineCalculate({ data, type: 'h0' })) return false;
    return true;
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
      doubleUnitEnabled,
    } = this.state;
    // listCommonDataSource.forEach((n) => {
    //   if (!n.displayLineNum) {
    //     const nn = n;
    //     nn.poLineId = undefined;
    //   }
    // });
    const formAndListCustomizeCode = `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    const { sourceBillTypeCode } = orderHeaderFormDataSource;
    if (!poHeaderId) {
      form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          const data = {
            // ...merge(orderHeaderFormDataSource, values),
            ...orderHeaderFormDataSource,
            ...values,
            remark: values?.remark || '',
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
      // const { selectedListRows } = this.state;
      form.validateFieldsAndScroll((errs, values) => {
        if (!errs) {
          let lines = [];
          if (sourceBillTypeCode === 'PURCHASE_ORDER') {
            lines = getEditTableData(listCommonDataSource, ['poLineId', '_status'], {
              container: document.querySelector('.ant-table-body'),
            });
          } else {
            lines = getEditTableData(listCommonDataSource, ['_status'], {
              container: document.querySelector('.ant-table-body'),
            });
          }
          this.setState({ orderHeaderFormDataSource: { ...orderHeaderFormDataSource, values } });
          const transLines = lines.map((item, index) => {
            const { needByDate } = item;
            return {
              ...item,
              unitPrice: listCommonDataSource[index].unitPrice,
              //  enteredTaxIncludedPrice: listCommonDataSource[index].enteredTaxIncludedPrice,
              benchmarkPriceType:
                item.benchmarkPriceType ?? orderHeaderFormDataSource.benchmarkPriceType,
              priceLibraryId: listCommonDataSource[index].priceLibraryId,
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
                // ...merge(orderHeaderFormDataSource, values),
                ...orderHeaderFormDataSource,
                ...values,
                tenantId,
                remark: values.remark || '',
                // supplierCompanyId: lovRecord.supplierCompanyId,
                // supplierCompanyName: lovRecord.supplierCompanyName,
                // supplierTenantId: lovRecord.supplierTenantId,
                // supplierId: lovRecord.supplierId || null,
                // supplierName: lovRecord.supplierName || null,
                // supplierCode: lovRecord.supplierNum || lovRecord.supplierCode || null,
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
  }

  @Bind()
  saveDetail(payload, type) {
    const { dispatch } = this.props;
    dispatch({
      type,
      payload,
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchDetailHeader();
        this.fetchDetailList();
        if (res.maintainErrorMsg) {
          Modal.info({ title: res.maintainErrorMsg });
        }
      }
    });
  }

  @Bind()
  cuxSubmitValidateChange(handleSubmit, budgetVerificationData, data) {
    const { remote, dispatch } = this.props;
    const { cuxSubmitValidate } = remote?.props?.process || {};
    const cfmoFlag = typeof cuxSubmitValidate === 'function';
    if (cfmoFlag) {
      cuxSubmitValidate({
        dispatch,
        handleSubmit,
        handleOldBudgetVerification,
        data,
        dispatchObject: {
          type: 'quotePurchaseRequisition/oldBudgetVerification',
          payload: budgetVerificationData,
        },
      });
      return cfmoFlag;
    }
    handleOldBudgetVerification(
      dispatch,
      {
        type: 'quotePurchaseRequisition/oldBudgetVerification',
        payload: budgetVerificationData,
      },
      handleSubmit()
    );
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
      // lovRecord,
      selectedListRows,
      customizeCode = '',
      doubleUnitEnabled,
      // source,
    } = this.state;
    // listCommonDataSource.forEach(n => {
    //   if (!n.displayLineNum) {
    //     const nn = n;
    //     nn.poLineId = undefined;
    //     nn.prLineId = undefined;
    //   }
    // });
    const formAndListCustomizeCode = `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    const { sourceBillTypeCode } = orderHeaderFormDataSource;
    // const { selectedListRows } = this.list.state;
    form.validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        let lines = [];
        if (sourceBillTypeCode === 'PURCHASE_ORDER') {
          lines = getEditTableData(listCommonDataSource, ['poLineId', '_status'], {
            container: document.querySelector('.ant-table-body'),
          });
        } else {
          lines = getEditTableData(listCommonDataSource, ['_status'], {
            container: document.querySelector('.ant-table-body'),
          });
        }
        this.setState({ orderHeaderFormDataSource: { ...orderHeaderFormDataSource, values } });
        const transLines = lines.map((item, index) => {
          const { needByDate } = item;
          return {
            ...item,
            wbsCode: item.wbsCode || '',
            remark: item.remark || '',
            unitPrice: listCommonDataSource[index].unitPrice,
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
        const poLineDetailDTOs = [...transLines, ...selectedListRows].map((item) => {
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
              // ...merge(orderHeaderFormDataSource, values),
              ...orderHeaderFormDataSource,
              ...values,
              tenantId,
              remark: values.remark || '',
              // supplierCompanyId: lovRecord.supplierCompanyId,
              // supplierCompanyName: lovRecord.supplierCompanyName,
              // supplierTenantId: lovRecord.supplierTenantId,
              // supplierId: lovRecord.supplierId || null,
              // supplierName: lovRecord.supplierName || null,
              // supplierCode: lovRecord.supplierNum || lovRecord.supplierCode || null,
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
                    if (res.minAmountInfo) {
                      notification.warning({
                        message: res.minAmountInfo,
                      });
                    }
                    notification.success();
                    dispatch(
                      routerRedux.push({
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
                      // handleOldBudgetVerification(
                      //   dispatch,
                      //   {
                      //     type: 'quotePurchaseRequisition/oldBudgetVerification',
                      //     payload: budgetVerificationData,
                      //   },
                      //   handleSubmit
                      // ),
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
    });
  }

  /**
   * deleteDelivery - 作废送货单
   */
  @Bind()
  invalidDelivery() {
    const { dispatch } = this.props;
    const { orderHeaderFormDataSource, entrance } = this.state;
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
            payload: orderHeaderFormDataSource,
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname:
                    entrance === 'maintain'
                      ? `/sodr/purchase-order-maintain/list`
                      : `/sodr/purchase-order-maintain/source-from-requisition/list`,
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
   * 修改行数据
   * @param {Array} listCommonDataSource
   */
  @Bind()
  handleChangeList(listCommonDataSource) {
    this.setState({ listCommonDataSource });
  }

  /**
   *头添加批量字段
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
    const { listCommonDataSource, oldList } = this.state;
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
    });
  }

  // /**
  //  * 修改公司Lov数据
  //  * @param {Array} lovRecord
  //  */
  @Bind()
  onChangeCompany(lovRecord = {}) {
    const {
      form: { setFieldsValue },
      dispatch,
    } = this.props;
    const { companyId, companyNum, companyName } = lovRecord;
    const { orderHeaderFormDataSource, listCommonDataSource } = this.state;
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
      const newOrderHeaderFormDataSource = {
        ...orderHeaderFormDataSource,
        ouName,
        ouId,
        ouCode,
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
      setFieldsValue({
        ouId,
        ouName,
        ouCode,
        purchaseOrgId,
        purchaseOrgName,
        agentId,
        agentName,
        companyName,
        companyCode: companyNum,
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
    const { ouId, ouCode } = lovRecord;
    const { companyId } = getFieldsValue();
    const { orderHeaderFormDataSource, listCommonDataSource, oldList } = this.state;
    const newDateSource = listCommonDataSource.map((ele) => {
      if (ele.ouId !== ouId && ele.priceLibraryId) {
        return oldList.find((obj) => obj.prLineId === ele.prLineId);
      } else {
        return ele;
      }
    });
    setFieldsValue({ supplierSiteId: null });
    this.setState({
      listCommonDataSource: newDateSource,
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
      const newOrderHeaderFormDataSource = {
        ...orderHeaderFormDataSource,
        ouCode,
        agentId,
        agentName,
        purchaseOrgId,
        purchaseOrgName,
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
    const { entrance } = this.state;
    if (entrance === 'maintain') {
      return '/sodr/purchase-order-maintain/list';
    } else {
      return '/sodr/purchase-order-maintain/source-from-requisition/list';
    }
  }

  // /**
  //  * 修改行数据
  //  * @param {Array} listCommonDataSource
  //  */
  // // eslint-disable-next-line no-dupe-class-members
  // @Bind()
  // handleChangeList(listCommonDataSource) {
  //   this.setState({ listCommonDataSource });
  // }

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

  // 采购申请行分页处理
  @Bind()
  handleChangePagination(page = {}) {
    const { orderHeaderFormDataSource } = this.state;
    const { sourceBillTypeCode } = orderHeaderFormDataSource;
    if (sourceBillTypeCode === 'PURCHASE_REQUEST') {
      this.setState({ listCommonPagination: page });
    } else {
      this.fetchDetailList(page);
    }
  }

  @Bind()
  async validateItemAndInv(invOrganizationId, selectedListRows) {
    const { listCommonDataSource = [], orderHeaderFormDataSource } = this.state;
    const { dispatch, form } = this.props;
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
      saveLoading = false,
      newAddLoading = false,
      saveWarnLoading = false,
      addDetailLinesLoading = false,
      deleteDetailLinesLoading = false,
      deleteDeliveryLoading = false,
      queryCreateListLoading = false,
      queryDetailHeaderLoading = false,
      queryDetailListLoading = false,
      submitDetailLoading = false,
      deleteLineRemoteLoaing = false,
      validating,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      addNewSubmitDetailLoading,
      quotePurchaseRequisition: { enumMap },
      checkInvOrganizationLoading = false,
      budgetVerificationLoading = false,
      remote,
    } = this.props;
    const {
      collapseKeys,
      tenantId,
      stageIdList,
      selectedListRows,
      listCommonDataSource,
      listCommonPagination,
      isClearListCacheDataSource,
      isHeaderInfoFormDataSource,
      orderHeaderFormDataSource = {},
      lovRecord: { supplierCompanyId },
      // companyFlag,
      returnOrderFlag,
      doubleUnitEnabled,
      enableSupplierSiteFlag,
    } = this.state;
    const {
      prStatusCode,
      poHeaderId,
      poSourcePlatform,
      // priceShieldFlag,
      tieredPricingFlag,
      ouId,
      companyId,
      statusCode,
    } = orderHeaderFormDataSource;

    const orderHeaderFormDataSourceFormProps = {
      form,
      stageIdList,
      customizeForm,
      newAddLoading,
      poSourcePlatform,
      poHeaderId: this.state.poHeaderId,
      loading: queryDetailHeaderLoading,
      onChangeListData: this.handleChangeLov,
      onChangeCompany: this.onChangeCompany,
      onOuNameOnchange: this.onOuNameOnchange,
      onPurchaseOrgChange: this.onPurchaseOrgChange,
      onChangeSettleSupplierLov: this.onChangeSettleSupplierLov,
      headerOnChangeForm: this.headerOnChangeForm,
      dataSource: orderHeaderFormDataSource,
      onRef: (node) => {
        this.orderHeaderFormDataSourceForm = node;
      },
      enableSupplierSiteFlag,
      // companyFlag,
      termsOnchange: this.termsOnchange,
    };
    const headerForm = form;
    const listProps = {
      remote,
      tenantId,
      prStatusCode,
      validating,
      customizeTable,
      supplierCompanyId,
      // priceShieldFlag,
      tieredPricingFlag,
      ouId,
      companyId,
      returnOrderFlag,
      poSourcePlatform,
      doubleUnitEnabled,
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
      fetchDetailCreateList: this.fetchDetailCreateList,
      onChangeListData: this.handleChangeList,
      handleCancelLines: this.handleCancelLines,
      handleRowSelectedChange: this.handleRowSelectedChange,
      fetchList: this.fetchDetailList,
      afterOpenUploadModal: this.afterOpenUploadModal,
      onHandleAppendValidate: this.handleAppendValidate,
      handleChangePagination: this.handleChangePagination,
      onChangeHeader: this.handleChangeHeader,
      handleTranslate: this.handleTranslate,
      form,
      headerForm,
      onRef: (node) => {
        this.orderListFormDataSourceForm = node;
      },
      enumMap,
      validateItemAndInv: this.validateItemAndInv,
      checkInvOrganizationLoading,
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
    //   bucketDirectory: 'sprm-pr',
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
    //   bucketDirectory: 'sprm-pr',
    //   afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
    // };
    const headerBtnLoading =
      saveLoading ||
      newAddLoading ||
      saveWarnLoading ||
      queryDetailHeaderLoading ||
      queryDetailListLoading ||
      submitDetailLoading ||
      deleteDeliveryLoading ||
      addNewSubmitDetailLoading ||
      budgetVerificationLoading;

    const headerBtnsRender = [
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
          icon: 'check',
          onClick: this.submitDetail,
          disabled: !this.state.poHeaderId,
          loading: headerBtnLoading,
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
      statusCode !== 'REJECTED' && {
        name: 'delete',
        child: intl.get(`hzero.common.button.delete`).d('删除'),
        btnProps: {
          icon: 'delete',
          disabled: !this.state.poHeaderId,
          onClick: this.invalidDelivery,
          loading: headerBtnLoading,
        },
      },
    ];
    return (
      <Fragment>
        <Header
          title={
            poHeaderId
              ? intl.get(`sodr.quotePurchase.view.message.purchaseOrderMaintain`).d('订单维护')
              : intl.get(`sodr.quotePurchase.view.message.handCreateOrder`).d('手工创建订单')
          }
          backPath={this.handleBackParent()}
        >
          {customizeBtnGroup(
            { code: 'SODR.ORDER_CREATE_LINE_LIST.SOURCE_BTNS', pro: true },
            <DynamicButtons
              buttons={remote.process('processHeaderBtn', headerBtnsRender, {
                form,
                orderHeaderFormDataSource,
              })}
            />
          )}
          {/* <Button
            loading={
              saveLoading ||
              newAddLoading ||
              queryDetailHeaderLoading ||
              queryDetailListLoading ||
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
              saveLoading ||
              submitDetailLoading ||
              queryDetailHeaderLoading ||
              queryDetailListLoading ||
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
                saveLoading ||
                deleteDeliveryLoading ||
                queryDetailHeaderLoading ||
                queryDetailListLoading ||
                submitDetailLoading ||
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
