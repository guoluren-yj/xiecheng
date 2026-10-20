/**
 * index - 整单引用创建
 * @date: 2020-11-17
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright 2020, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Spin, Collapse, Icon, Modal, Form } from 'hzero-ui';
import { connect } from 'dva';

import { isEmpty, throttle } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { routerRedux } from 'dva/router';

import UploadModal from '_components/Upload';
import { Header, Content } from 'components/Page';
import {
  getResponse,
  createPagination,
  getEditTableData,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import querystring from 'querystring';
import { DATETIME_MIN, DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import DeliveryInformationHeader from './DeliveryInformationHeader';
import PurchaseRequestHeader from './PurchaseRequestHeader';
import BillingInformation from './BillingInformation';
import PurchaseLineInfo from './PurchaseLineInfo';
import {
  BUCKET_NAME,
  THROTTLE_TIME,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
} from '@/routes/components/utils/constant';
import { handleOldBudgetVerification } from '@/routes/components/utils';

const { Panel } = Collapse;

@withCustomize({
  unitCode: [
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_ERP',
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC',
    'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_CATALOGUE',
    'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
    'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
    'SODR.ORDER_CREATE_LINE_LIST.DELIVERY_CATA',
  ],
})
@formatterCollections({
  code: [
    'component.docFlow',
    'sodr.quotePurchaseRequisition',
    'sodr.common',
    'entity.attachment',
    'sodr.quotePurchase',
    'sodr.orderMaintain',
    'hpfm.employee',
    'srm.common',
    'sprm.purchaseReqCreation',
    'sprm.common',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, quotePurchaseRequisition }) => ({
  saveLoading: loading.effects['quotePurchaseRequisition/add'],
  saveWarnLoading: loading.effects['quotePurchaseRequisition/saveWarn'],
  submitDetailLoading: loading.effects['quotePurchaseRequisition/submitDetail'],
  deleteDeliveryLoading: loading.effects['quotePurchaseRequisition/deleteSheetDelivery'],
  queryDetailHeaderLoading: loading.effects['quotePurchaseRequisition/queryDetailHeader'],
  queryDetailListLoading: loading.effects['quotePurchaseRequisition/queryDetailList'],
  addNewSubmitDetailLoading: loading.effects['quotePurchaseRequisition/addNewSubmitDetail'],
  budgetVerificationLoading: loading.effects['quotePurchaseRequisition/oldBudgetVerification'],
  queryDoubleUomConfigLoading: loading.effects['quotePurchaseRequisition/queryDoubleUomConfig'],
  quotePurchaseRequisition,
}))
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { poHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      poHeaderId,
      orderHeaderFormDataSource: {}, // 头form数据源
      collapseKeys: ['orderHeaderInfo'], // 打开的折叠面板key
      listCommonDataSource: [], // 表格数据源
      listCommonPagination: {}, // 表格分页
      isClearListCacheDataSource: true, // 是否清除表格缓存数据源
      tenantId: getCurrentOrganizationId(),
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
      this.queryDoubleUomConfig();
      this.fetchDetailList();
    }
    this.fetchEnum();
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
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader() {
    const { dispatch } = this.props;
    const { poHeaderId } = this.state;
    // const { params } = match;
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailHeader',
      payload: {
        poHeaderId,
        customizeUnitCode:
          'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST,SODR.ORDER_CREATE_LINE_LIST.DELIVERY_CATA',
      },
    }).then((res) => {
      if (res) {
        const { poSourcePlatform } = res;
        const code = this.getCustomizeCode(poSourcePlatform);
        this.setState(
          {
            orderHeaderFormDataSource: res,
            customizeCode: code,
            // supplierAttachmentUuid: res.supplierAttachmentUuid,
          }
          // () => {
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
    const { dispatch } = this.props;
    const { poHeaderId } = this.state;
    this.setState({ listCommonDataSource: [] });
    dispatch({
      type: 'quotePurchaseRequisition/queryDetailList',
      payload: {
        poHeaderId,
        page,
        poEntryPoint: 'PO_MAINTAIN_DETAIL',
        customizeUnitCode: 'SODR.ORDER_CREATE_LINE_LIST.LINE_BY_EC',
      },
    }).then((res) => {
      if (res && res.content) {
        this.setState({
          listCommonDataSource: [...res.content.map((n) => ({ ...n, _status: 'update' }))],
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
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  save() {
    const { dispatch, form } = this.props;
    const {
      orderHeaderFormDataSource,
      listCommonDataSource,
      tenantId,
      customizeCode = '',
    } = this.state;
    const formAndListCustomizeCode = `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    form.validateFields((errs, values) => {
      if (!errs) {
        const param = filterNullValueObject({ ...values });
        const lines = getEditTableData(
          listCommonDataSource,
          ['poLineId', '_status'],
          { container: document.querySelector('.ant-table-body') },
          {
            force: true,
          }
        );
        const transLines = lines.map((item) => {
          const { needByDate } = item;
          return {
            ...item,
            needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
            wbsCode: item.wbsCode || '',
            remark: item.remark || '',
            receiveToleranceQuantityType: item.receiveToleranceQuantityType || '',
            benchmarkPriceType:
              item.benchmarkPriceType ?? orderHeaderFormDataSource.benchmarkPriceType,
          };
        });
        if (listCommonDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
          const data = {
            poHeaderDetailDTO: {
              ...orderHeaderFormDataSource,
              ...param,
              tenantId,
              remark: param.remark || '',
            },
            poLineDetailDTOs: [...transLines],
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

  /**
   * submitDetail - 提交明细数据
   * 提交明细头数据和行明细相关字段
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  @Bind()
  submitDetail() {
    const {
      dispatch,
      form,
      location: { search },
    } = this.props;
    const {
      orderHeaderFormDataSource,
      listCommonDataSource,
      tenantId,
      customizeCode = '',
    } = this.state;
    const formAndListCustomizeCode = `${customizeCode},SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST`;
    const { source } = querystring.parse(search.substr(1));
    form.validateFields((errs, values) => {
      if (!errs) {
        const param = filterNullValueObject({ ...values });
        const lines = getEditTableData(
          listCommonDataSource,
          ['poLineId', '_status'],
          { container: document.querySelector('.ant-table-body') },
          {
            force: true,
          }
        );
        const transLines = lines.map((item) => {
          const { needByDate } = item;
          return {
            ...item,
            wbsCode: item.wbsCode || '',
            remark: item.remark || '',
            needByDate: needByDate ? moment(needByDate).format(DATETIME_MIN) : undefined,
            benchmarkPriceType:
              item.benchmarkPriceType ?? orderHeaderFormDataSource.benchmarkPriceType,
          };
        });
        if (listCommonDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
          const data = {
            poHeaderDetailDTO: {
              ...orderHeaderFormDataSource,
              ...param,
              tenantId,
              remark: param.remark || '',
            },
            poLineDetailDTOs: [...transLines],
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
                        pathname:
                          source === 'maintain'
                            ? `/sodr/purchase-order-maintain/list`
                            : `/sodr/purchase-order-maintain/quote-purchase-requisition/list`,
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
   * deleteDelivery - 作废送货单
   */
  @Bind()
  invalidDelivery() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { source } = querystring.parse(search.substr(1));
    // const { params } = match;
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
            payload: orderHeaderFormDataSource,
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname:
                    source === 'maintain'
                      ? `/sodr/purchase-order-maintain/list`
                      : `/sodr/purchase-order-maintain/quote-purchase-requisition/list`,
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
   * 修改行数据
   * @param {Array} listCommonDataSource
   */
  @Bind()
  handleChangeList(listCommonDataSource) {
    this.setState({ listCommonDataSource });
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
  getHeaderAttachmentUuid(uuid) {
    const { dispatch } = this.props;
    const {
      orderHeaderFormDataSource: { poHeaderId },
    } = this.state;
    dispatch({
      type: 'quotePurchaseRequisition/saveAttachmentUUID',
      payload: { poHeaderId, uuid, uuidType: 1 },
    }).then((res) => {
      if (res) {
        this.setState({
          orderHeaderFormDataSource: {
            ...this.state.orderHeaderFormDataSource,
            objectVersionNumber: res,
            attachmentUuid: uuid,
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

  @Bind()
  headerOnChangeForm({ returnOrderFlag, orderTypeCode }) {
    const { orderHeaderFormDataSource, listCommonDataSource } = this.state;
    // this.orderListFormDataSourceForm.props.form.setFieldsValue({
    //   returnedFlag: _record,
    // });
    const newDateSource = listCommonDataSource.map((item) => {
      return {
        ...item,
        returnedFlag: returnOrderFlag,
      };
    });
    this.setState({
      returnOrderFlag,
      orderHeaderFormDataSource: { ...orderHeaderFormDataSource, orderTypeCode },
      listCommonDataSource: newDateSource,
    });
  }

  render() {
    const {
      form,
      saveLoading,
      customizeTable,
      customizeForm,
      saveWarnLoading,
      deleteDeliveryLoading,
      queryDetailHeaderLoading,
      queryDetailListLoading,
      submitDetailLoading,
      addNewSubmitDetailLoading,
      location: { search },
      quotePurchaseRequisition: { enumMap },
      budgetVerificationLoading = false,
    } = this.props;
    const { source } = querystring.parse(search.substr(1));
    const {
      collapseKeys,
      listCommonDataSource,
      listCommonPagination,
      isClearListCacheDataSource,
      orderHeaderFormDataSource = {},
      returnOrderFlag,
      doubleUnitEnabled,
    } = this.state;
    const {
      statusCode,
      poHeaderId,
      transactionMode,
      multiDealParentPoHeaderId,
    } = orderHeaderFormDataSource;
    const { prSourcePlatform = orderHeaderFormDataSource.poSourcePlatform } = querystring.parse(
      search.substr(1)
    );
    const orderHeaderFormDataSourceFormProps = {
      form,
      customizeForm,
      prSourcePlatform,
      loading: queryDetailHeaderLoading,
      dataSource: orderHeaderFormDataSource,
      ref: (node) => {
        this.orderHeaderFormDataSourceForm = node;
      },
      headerOnChangeForm: this.headerOnChangeForm,
      onChangeSettleSupplierLov: this.onChangeSettleSupplierLov,
    };
    const listProps = {
      statusCode,
      prSourcePlatform,
      customizeTable,
      returnOrderFlag,
      headerInfo: orderHeaderFormDataSource,
      isClearListCacheDataSource,
      onRef: (node) => {
        this.list = node;
      },
      orderHeaderFormDataSource,
      dataSource: listCommonDataSource,
      pagination: listCommonPagination,
      loading: queryDetailListLoading,
      onSearch: this.fetchDetailList,
      onChangeListData: this.handleChangeList,
      afterOpenUploadModal: this.afterOpenUploadModal,
      afterOpenLineUploadModal: this.afterOpenLineUploadModal,
      enumMap,
      doubleUnitEnabled,
    };
    const { attachmentUuid, purchaserInnerAttachmentUuid } = orderHeaderFormDataSource;
    const uploadModalProps = {
      btnText: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
      btnProps: {
        icon: 'upload',
        disabled: !poHeaderId,
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
        disabled: !poHeaderId,
      },
      showFilesNumber: true,
      attachmentUUID: purchaserInnerAttachmentUuid,
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
      afterOpenUploadModal: this.afterOpenHeaderUploadModalLoad,
    };

    const headerBtnLoading =
      saveLoading ||
      saveWarnLoading ||
      submitDetailLoading ||
      deleteDeliveryLoading ||
      addNewSubmitDetailLoading ||
      budgetVerificationLoading ||
      queryDetailHeaderLoading ||
      queryDetailListLoading;

    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.quotePurchase.view.message.quotePurchase`).d('订单维护')}
          backPath={
            source === 'maintain'
              ? `/sodr/purchase-order-maintain/list`
              : `/sodr/purchase-order-maintain/quote-purchase-requisition/list`
          }
        >
          <Button loading={headerBtnLoading} onClick={this.save} type="primary" icon="save">
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button loading={headerBtnLoading} icon="check" onClick={this.submitDetail}>
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <UploadModal {...uploadModalProps} />
          <UploadModal {...uploadModalPropsLoad} />
          {statusCode !== 'REJECTED' &&
            (transactionMode !== 'TRIPARTITE' || !multiDealParentPoHeaderId) && (
              <Button loading={headerBtnLoading} onClick={this.invalidDelivery} icon="delete">
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
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`sodr.quotePurchase.view.message.deliveryInformationHeader`)
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
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`sodr.quotePurchase.view.message.billingInformation`).d('开票信息')}
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
                <BillingInformation {...orderHeaderFormDataSourceFormProps} />
              </Panel>
            </Collapse>
            <PurchaseLineInfo {...listProps} />
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
