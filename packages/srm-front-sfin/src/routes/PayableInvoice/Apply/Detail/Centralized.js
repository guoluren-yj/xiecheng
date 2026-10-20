/**
 * CentralizedInvoice - 应付发票申请 - 集中开票明细
 * @date: 2019-02-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Spin, Collapse, Icon, Modal, Tabs, InputNumber, Form } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { cloneDeep, isEmpty, omit } from 'lodash';
import querystring from 'querystring';
import moment from 'moment';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import { SRM_FINANCE } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import EditTable from 'components/EditTable';
import remote from 'hzero-front/lib/utils/remote';
import { dateTimeRender } from 'utils/renderer';

// eslint-disable-next-line import/no-named-as-default
import { thousandsRender } from '@/utils/utils';
import CentralizedForm from './CentralizedForm';
import CentralizedBillForm from './CentralizedBillForm';
import ActionHistory from '../../../Invoice/Components/ActionHistory';
import ElectTaxInvoiceLine from '../../../Invoice/Components/ElectTaxInvoiceLine.js';
import TaxElectInvoiceTable from '../../../Invoice/Components/TaxElectInvoiceTable.js';
import Change from '../../../components/ChangeFormItem';
import styles from '../../index.less';
// import { thousandBitSeparator, thousandBitSeparatorDJ } from '@/routes/utils';

const { TabPane } = Tabs;

const { confirm } = Modal;
const promptCode = 'sfin.payableInvoice';

const eCCustomizeUnitCodes = {
  // 我的应付发票
  MYPAYMENT: {
    BASIC: 'SFIN.INVOICE_SUMMARY_DETAIL.EC_BASIC_INFO',
    BILL: 'SFIN.INVOICE_SUMMARY_DETAIL.EC_BILL_INFO',
    INVOICE_LINE: 'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
  },
  // 维护电商发票申请
  PAYMAINTAIN: {
    BASIC: 'SFIN.INVOICE_EC_UPDATE_DETAIL.BASIC_INFO',
    BILL: 'SFIN.INVOICE_EC_UPDATE_DETAIL.BILL_INFO',
    INVOICE_LINE: 'SFIN.INVOICE_EC_UPDATE_DETAIL.INV_LINE',
  },
  // 创建电商发票申请
  PAYCREATE: {
    BASIC: 'SFIN.INVOICE_EC_CREATE_DETAIL.BASIC_INFO',
    BILL: 'SFIN.INVOICE_EC_CREATE_DETAIL.BILL_INFO',
    INVOICE_LINE: 'SFIN.INVOICE_EC_CREATE_DETAIL.INV_LINE',
  },
  // 审核应付发票
  // APPROVE: {
  //   BASIC: 'SFIN.INVOICE_APPROVE_DETAIL.EC_BASIC_INFO',
  //   BILL: 'SFIN.INVOICE_APPROVE_DETAIL.EC_BILL_INFO',
  //   INVOICE_LINE: 'SFIN.INVOICE_APPROVE_DETAIL.EC_INVOICE_LINE',
  // },
};

/**
 * 集中开票
 * @extends {Component} - Component
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

// const unitCodes = [
//   'SFIN.INVOICE_EC_UPDATE_DETAIL.BASIC_INFO',
//   'SFIN.INVOICE_SUMMARY_DETAIL.CENTRALIZED_BASIC',
//   'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
//   'SFIN.INVOICE_EC_UPDATE_DETAIL.BILL_INFO',
// ].join();

@remote({
  code: 'SFIN_INVOICE_SUMMARY_READ_ONLY_CENTRALIZED_DETAIL_CUX',
  name: 'remote',
})
@connect(({ payableInvoice, loading }) => ({
  payableInvoice,
  loading:
    loading.effects['payableInvoice/fetchInvoiceHeaderPurchaser'] ||
    loading.effects['payableInvoice/fetchInvoiceLinePurchaser'] ||
    loading.effects['payableInvoice/deletePayableInvoice'] ||
    loading.effects['payableInvoice/fetchInvoiceInformation'] ||
    loading.effects['payableInvoice/savePayableInvoice'] ||
    loading.effects['payableInvoice/submitPayableInvoice'] ||
    loading.effects['invoice/confirm'] ||
    loading.effects['invoice/reject'],
}))
@formatterCollections({
  code: ['entity.item', 'sfin.payableInvoice', 'sfin.invoiceBill'],
})
@withCustomize({
  unitCode: [
    'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
    'SFIN.INVOICE_EC_UPDATE_DETAIL.INV_LINE',
    'SFIN.INVOICE_EC_CREATE_DETAIL.INV_LINE',
  ],
})
export default class CentralizedInvoice extends Component {
  constructor(props) {
    const {
      match: {
        path,
        params: { invoiceHeaderId },
      },
      location: { search },
    } = props;
    super(props);
    const { businessType } = querystring.parse(search.substr(1));
    // 维护电商发票申请,创建电商发票申请，我的应付发票电商类
    const { ecSource } = search ? querystring.parse(search.substr(1)) : {};
    const pathArray = path.split('/');
    this.state = {
      attachmentUUID: null,
      invoiceHeaderId,
      tenantId: getCurrentOrganizationId(),
      backPath: `/sfin/${pathArray[2]}/list`,
      isEdit: pathArray[3] !== 'read-only-centralized-detail',
      isSupplier: pathArray[2] === 'invoice-supplier' && businessType !== 'EC',
      recordModal: false,
      collapseKeys: {}, // 打开的折叠面板key
      isChooseLastFlag: true, // 是否选择最深层级地址
      cityData: [],
      newMallRegion: [],
      routeSource: pathArray[2],
      businessType,
      ecSource,
    };
    const Change_ = Change('taxInvoiceLineId');
    this.changeList = Change_.changeList;
    this.setUpdate = Change_.setUpdate;
    this.isSave = Change_.isSave;
    this.ChangeFormItem = Change_.ChangeFormItem;
  }

  componentDidMount() {
    const { isSupplier } = this.state;
    this.queryValueCode();
    if (isSupplier) {
      this.handelSearchSupplier();
    } else {
      this.handelSearchPurchaser();
      this.queryProvinceCity();
      this.queryDefaultCity();
    }
  }

  /**
   * 查询默认省区地址
   */
  @Bind()
  queryDefaultCity() {
    const { dispatch } = this.props;
    dispatch({
      type: 'payableInvoice/queryDefaultCity',
    }).then((res) => {
      this.setState({
        cityData: res,
      });
    });
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'payableInvoice/queryValueCode',
      payload: {
        taxTypeList: 'SFIN.TAX_TYPE', // 发票类型
        idd: 'HPFM.IDD',
      },
    });
  }

  /**
   * 查询省市区地址
   */
  @Bind()
  queryProvinceCity() {
    const { dispatch } = this.props;
    dispatch({
      type: 'payableInvoice/queryProvinceCity',
    });
  }

  /**
   * 查询集中发票明细 头 - 采购方
   */
  @Bind()
  handelSearchPurchaser(flag) {
    const { invoiceHeaderId, ecSource } = this.state;
    const {
      dispatch,
      payableInvoice: { [invoiceHeaderId]: { purchaserLinePagination = {} } = {} },
    } = this.props;
    dispatch({
      type: 'payableInvoice/fetchInvoiceHeaderPurchaser',
      payload: {
        invoiceHeaderId,
        customizeUnitCode: ecSource
          ? [
              eCCustomizeUnitCodes[ecSource.toUpperCase()].BASIC,
              eCCustomizeUnitCodes[ecSource.toUpperCase()].BILL,
            ].join()
          : ['SFIN.INVOICE_SUMMARY_DETAIL.CENTRALIZED_BASIC'].join(),
      },
    }).then((res) => {
      if (res) {
        this.setState({
          newMallRegion: res.regionIds,
        });
      }
    });
    if (!flag) {
      this.handelSearchPurchaserLine(purchaserLinePagination);
    }
  }

  /**
   * 查询集中发票明细 行 - 采购方
   * @param {Object} page 分页参数
   */
  @Bind()
  handelSearchPurchaserLine(page = {}) {
    const { dispatch } = this.props;
    const { invoiceHeaderId, businessType, ecSource } = this.state;
    if (businessType === 'EC') {
      // 如果类型是电商，改成采购方看我的应付发票详情电商类型一样的路径接口
      dispatch({
        type: 'payableInvoice/fetchInvoiceDetailLine',
        payload: {
          page,
          invoiceHeaderId,
          customizeUnitCode: 'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
        },
      });
    } else {
      dispatch({
        type: 'payableInvoice/fetchInvoiceLinePurchaser',
        payload: {
          page,
          invoiceHeaderId,
          customizeUnitCode: ecSource
            ? eCCustomizeUnitCodes[ecSource.toUpperCase()].INVOICE_LINE
            : 'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
        },
      });
    }
  }

  /**
   * 查询集中发票明细 头 - 供应商
   */
  @Bind()
  handelSearchSupplier() {
    const { invoiceHeaderId } = this.state;
    const {
      dispatch,
      payableInvoice: { [invoiceHeaderId]: { supplierLinePagination = {} } = {} },
    } = this.props;
    dispatch({
      type: 'payableInvoice/fetchInvoiceHeaderSupplier',
      payload: invoiceHeaderId,
    });
    this.handelSearchSupplierLine(supplierLinePagination);
  }

  /**
   * 查询集中发票明细 行 - 供应商
   * @param {Object} page 分页参数
   */
  @Bind()
  handelSearchSupplierLine(page = {}) {
    const { dispatch } = this.props;
    const { invoiceHeaderId } = this.state;
    dispatch({
      type: 'payableInvoice/fetchInvoiceLineSupplier',
      payload: {
        page,
        invoiceHeaderId,
      },
    });
  }

  /**
   * 资质认证
   * @param {Number} companyId 公司Id
   */
  @Bind()
  handleValidate(companyId) {
    const { dispatch } = this.props;
    const form = this.filterForm || {};
    dispatch({
      type: 'payableInvoice/validateInvoice',
      payload: companyId,
    }).then((res) => {
      if (res) {
        const { qualificationStatus } = res;
        if (qualificationStatus === 'APPROVED') {
          notification.success({
            message: intl.get(`${promptCode}.message.validatePass`).d('验证通过'),
          });
        } else {
          form.setFieldsValue({ taxType: null });
          notification.warning({
            message: intl.get(`${promptCode}.message.validateNotPass`).d('验证未通过'),
          });
        }
      } else {
        form.setFieldsValue({ taxType: null });
        notification.warning({
          message: intl.get(`${promptCode}.message.validateNotPass`).d('验证未通过'),
        });
      }
    });
  }

  /**
   * 保存或提交
   * @param {Boolean} flag true - 保存
   */
  @Bind()
  @Throttle(1000)
  handleSaveOrSubmit(flag, info) {
    const { invoiceHeaderId, attachmentUUID, backPath, newMallRegion, ecSource } = this.state;
    const {
      dispatch,
      history,
      payableInvoice: {
        [invoiceHeaderId]: { purchaserHeaderInfo = {}, purchaserLineList = [] } = {},
      },
    } = this.props;
    const form = this.filterForm || {};
    const billForm = this.filterBillForm || {};
    form.validateFields((err, formData) => {
      if (!err) {
        const lines = getEditTableData(purchaserLineList, []);
        billForm.validateFields((billErr, billFormData) => {
          if (!billErr) {
            const regionArray = purchaserHeaderInfo.newMallFlag
              ? newMallRegion
              : cloneDeep(billFormData.regionIds);
            const regionId = regionArray[regionArray.length - 1];
            const data = {
              ...purchaserHeaderInfo,
              ...formData,
              ...omit(billFormData, ['regionIds']),
              regionId,
              expectInvoiceDate:
                formData.expectInvoiceDate &&
                moment(formData.expectInvoiceDate).format('YYYY-MM-DD 00:00:00'),
              attachmentUuid: attachmentUUID,
              // 如果是电商开票异常税额可编辑
              invoiceLines:
                info?.invoiceStatus === 'EC_INVOICE_EXCEPTION'
                  ? lines.length === 0
                    ? purchaserLineList
                    : lines
                  : purchaserLineList,
              customizeUnitCode: ecSource
                ? [
                    eCCustomizeUnitCodes[ecSource.toUpperCase()].BASIC,
                    eCCustomizeUnitCodes[ecSource.toUpperCase()].BILL,
                    eCCustomizeUnitCodes[ecSource.toUpperCase()].INVOICE_LINE,
                  ].join()
                : ['SFIN.INVOICE_SUMMARY_DETAIL.CENTRALIZED_BASIC'].join(),
            };
            if (flag) {
              dispatch({
                type: 'payableInvoice/savePayableInvoice',
                payload: data,
              }).then((res) => {
                if (res) {
                  notification.success();
                  this.handelSearchPurchaser();
                }
              });
            } else {
              confirm({
                title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交？'),
                onOk: () => {
                  dispatch({
                    type: 'payableInvoice/submitPayableInvoice',
                    payload: data,
                  }).then((res) => {
                    if (res) {
                      notification.success();
                      history.push(backPath);
                    }
                  });
                },
              });
            }
          }
        });
      }
    });
  }

  /**
   * 删除
   */
  @Bind()
  @Throttle(1000)
  handleDelete() {
    const { dispatch, history } = this.props;
    const { invoiceHeaderId, backPath } = this.state;
    confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除？'),
      onOk: () => {
        dispatch({
          type: 'payableInvoice/deletePayableInvoice',
          payload: invoiceHeaderId,
        }).then((res) => {
          if (res) {
            notification.success();
            history.push(backPath);
          }
        });
      },
    });
  }

  @Bind()
  afterOpenUploadModal(attachmentUUID) {
    this.setState({
      attachmentUUID,
    });
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.centralizedForm = ref;
    this.filterForm = ref.props.form;
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindBillRef(ref = {}) {
    this.filterBillForm = ref.props.form;
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord() {
    this.setState(
      {
        recordModal: true,
      },
      () => {
        this.historyModal.handleSearch();
      }
    );
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState(
      {
        recordModal: false,
      },
      () => {
        this.historyModal.closeSearch();
      }
    );
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(arr, key) {
    const { collapseKeys } = this.state;
    this.setState({
      collapseKeys: {
        ...collapseKeys,
        [key]: arr,
      },
    });
  }

  /**
   * 地区级联下拉框动态加载数据
   */
  @Bind()
  handleQueryCity(selectedOptions) {
    const { dispatch } = this.props;
    const lastOption = selectedOptions[selectedOptions.length - 1] || [];
    const { regionCode } = lastOption;
    lastOption.loading = true;
    clearTimeout(this.loadCitiseTimer); // 清除定时器
    this.loadCitiseTimer = setTimeout(() => {
      dispatch({
        type: 'payableInvoice/queryNewMallCity',
        payload: { page: -1, regionCode },
      }).then((res) => {
        if (res) {
          const { cityData } = this.state;
          lastOption.loading = false;
          // 是否是最后一级地区
          if (!isEmpty(res) && lastOption.virtualFlag !== 1) {
            lastOption.children = res;
            this.setState({
              isChooseLastFlag: false,
            });
          } else {
            this.setState({
              isChooseLastFlag: true,
            });
          }
          this.setState({
            cityData: [...cityData],
          });
        }
      });
    }, 10);
  }

  // 节流时间 -为了查询是否为最后一级地区loadCity会请求两次
  loadCitiseTimer;

  @Bind()
  handleSetMallRegion(val) {
    this.setState({
      newMallRegion: val,
    });
  }

  /**
   * 发票复核确认
   */
  @Bind()
  @Throttle(1000)
  confirm() {
    const { invoiceHeaderId, isSupplier } = this.state;
    const {
      dispatch,
      history,
      payableInvoice: { [invoiceHeaderId]: { purchaserLineList = [], supplierLineList = [] } = {} },
    } = this.props;
    const dataSource = isSupplier ? supplierLineList : purchaserLineList;
    const invoiceLines = getEditTableData(dataSource, ['_status']);
    confirm({
      title: intl.get(`${promptCode}.view.message.title.modal.pass`).d('是否确认通过?'),
      onOk() {
        dispatch({
          type: 'invoice/confirm',
          payload: {
            type: 'review',
            body: [{ invoiceHeaderId, reviewedRemark: null, invoiceLines }],
            customizeUnitCode: 'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            history.push(`/sfin/invoice-review/list`);
          }
        });
      },
    });
  }

  /**
   * 复核退回
   */
  @Bind()
  @Throttle(1000)
  reject() {
    const { invoiceHeaderId, isSupplier } = this.state;
    const {
      dispatch,
      history,
      payableInvoice: { [invoiceHeaderId]: { purchaserLineList = [], supplierLineList = [] } = {} },
    } = this.props;
    const dataSource = isSupplier ? supplierLineList : purchaserLineList;
    const invoiceLines = getEditTableData(dataSource, ['_status']);
    confirm({
      title: intl.get(`${promptCode}.view.message.title.modal.detail`).d('是否确认要退回?'),
      onOk() {
        dispatch({
          type: 'invoice/reject',
          payload: {
            type: 'review',
            body: [{ invoiceHeaderId, reviewedRemark: null, invoiceLines }],
            customizeUnitCode: 'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            history.push(`/sfin/invoice-review/list`);
          }
        });
      },
    });
  }

  render() {
    const {
      isEdit,
      isSupplier,
      backPath,
      tenantId,
      invoiceHeaderId,
      recordModal,
      collapseKeys,
      isChooseLastFlag,
      cityData,
      routeSource,
      ecSource,
    } = this.state;
    const {
      loading,
      dispatch,
      customizeTable,
      payableInvoice: {
        [invoiceHeaderId]: {
          purchaserHeaderInfo = {},
          purchaserLineList = [],
          purchaserLinePagination = {},
          supplierHeaderInfo = {},
          supplierLineList = [],
          supplierLinePagination = {},
        } = {},
        invoiceInfo = {},
        cityList = [],
        code: { taxTypeList = [], idd = [] },
      },
      remote: remoteProps,
    } = this.props;
    const headerInfo = isSupplier ? supplierHeaderInfo : purchaserHeaderInfo;
    const dataSource = isSupplier ? supplierLineList : purchaserLineList;
    const pagination = isSupplier ? supplierLinePagination : purchaserLinePagination;
    const showTaxLine = [
      'invoice-summary',
      'invoice-supplier',
      'invoice-review',
      'invoice-approve',
    ].includes(routeSource);
    // const uploadProps = {
    //   tenantId,
    //   btnProps: { icon: 'upload' },
    //   attachmentUUID: headerInfo.attachmentUuid,
    //   afterOpenUploadModal: this.afterOpenUploadModal,
    // };
    // const uploadReadOnlyProps = {
    //   tenantId,
    //   viewOnly: true,
    //   btnProps: { icon: 'paper-clip', type: 'primary' },
    //   attachmentUUID: headerInfo.attachmentUuid,
    // };
    const CentralizedFormProps = {
      isEdit,
      taxTypeList,
      headerInfo,
      invoiceInfo,
      onRef: this.handleBindRef,
      onValidate: this.handleValidate,
      // ecFlag,
      ecSource,
      eCCustomizeUnitCodes,
    };
    const CentralizedBillFormProps = {
      idd,
      isEdit,
      taxTypeList,
      headerInfo,
      invoiceInfo,
      cityList,
      cityData,
      isChooseLastFlag,
      onRef: this.handleBindBillRef,
      onLoadData: this.handleQueryCity,
      onSetMallRegion: this.handleSetMallRegion,
      ecSource,
      eCCustomizeUnitCodes,
    };
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      onRef: (ref) => {
        this.historyModal = ref;
      },
      hideModal: this.hideOperationRecord,
    };
    const { amountPrecision, pricePrecision, invoiceStatus } = headerInfo;
    const taxTicketTableProps = {
      amountPrecision,
      pricePrecision,
      tenantId,
      invoiceHeaderId,
      fetchHeader: this.handelSearchPurchaser,
      wrappedComponentRef: (node) => {
        this.list = node;
      },
      onRef: (ref) => {
        this.taxTicketTableRef = ref;
      },
      setUpdate: this.setUpdate,
      headerInfo,
      isSave: this.isSave,
      ChangeFormItem: this.ChangeFormItem,
      routeSource,
      remoteProps,
      remoteCode: 'SFIN_INVOICE_SUMMARY_READ_ONLY_CENTRALIZED_DETAIL_CUX_TAXINVOICE_COLUMNS',
      remoteBtnCode: 'SFIN_INVOICE_SUMMARY_READ_ONLY_CENTRALIZED_DETAIL_CUX_TAXINVOICE_BTNS',
    };
    const requestUrl = isSupplier
      ? `${SRM_FINANCE}/v1/${tenantId}/invoice-line/supplier/${invoiceHeaderId}/es-export`
      : `${SRM_FINANCE}/v1/${tenantId}/invoice-line/${invoiceHeaderId}/es-export`;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.payableInvoice.invoiceLineNum`).d('发票行号'),
        dataIndex: 'invoiceLineNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecProductNum`).d('商品编码'),
        dataIndex: 'ecProductNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecProductName`).d('商品名称'),
        dataIndex: 'ecProductName',
        width: 120,
      },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get('entity.item.name').d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
      },
      // {
      //   title: intl.get('entity.company.name').d('公司名称'),
      //   dataIndex: 'companyName',
      //   width: 120,
      // },

      // {
      //   title: intl.get('entity.supplier.name').d('供应商名称'),
      //   dataIndex: 'supplierCompanyName',
      //   width: 120,
      // },
      {
        title: intl.get(`${promptCode}.model.specificationsAndModel`).d('规格型号'),
        dataIndex: 'specificationsAndModel',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.unit`).d('单位'),
        dataIndex: 'uom',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.quantity`).d('本次开票数量'),
        dataIndex: 'quantity',
        width: 120,
        render: thousandsRender,
        // render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.netPrices`).d('不含税单价'),
        dataIndex: 'netPrice',
        align: 'right',
        render: (val, record) =>
          record.netPriceUpdFlag && isEdit ? (
            <Form.Item>
              {record.$form?.getFieldDecorator(`netPrice`, {
                initialValue: record.netPrice,
              })(
                <InputNumber
                  // precision={amountPrecision}
                  min={0}
                  allowThousandth
                />
              )}
            </Form.Item>
          ) : (
            <span>
              {record.priceShieldFlag === 1 ? record.netPriceMeaning : thousandsRender(val)}
            </span>
          ),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        render: (value, record) => {
          return record.priceShieldFlag === 1 ? record.netAmountMeaning : thousandsRender(value);
          // : thousandBitSeparator(record.netAmount, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        render: (val, record) =>
          invoiceStatus === 'EC_INVOICE_EXCEPTION' && isEdit && record.taxAmountUpdFlag ? (
            <Form.Item>
              {record.$form?.getFieldDecorator(`taxAmount`, {
                initialValue: record.taxAmount,
              })(
                <InputNumber
                  // precision={amountPrecision}
                  min={0}
                  allowThousandth
                />
              )}
            </Form.Item>
          ) : (
            <span>
              {record.priceShieldFlag === 1 ? record.taxAmountMeaning : thousandsRender(val)}
            </span>
          ),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxIncludedPrices`).d('含税单价'),
        dataIndex: 'taxIncludedPrice',
        render: (val, record) =>
          record.taxIncludePriceUpdFlag && isEdit ? (
            <Form.Item>
              {record.$form?.getFieldDecorator(`taxIncludedPrice`, {
                initialValue: record.taxIncludedPrice,
              })(
                <InputNumber
                  // precision={amountPrecision}
                  min={0}
                  allowThousandth
                />
              )}
            </Form.Item>
          ) : (
            <span>
              {record.priceShieldFlag === 1 ? record.taxIncludedPriceMeaning : thousandsRender(val)}
            </span>
          ),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        render: (value, record) => {
          return record.priceShieldFlag === 1
            ? record.taxIncludedAmountMeaning
            : thousandsRender(value);
          // : thousandBitSeparator(record.taxIncludedAmount, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecPoNum`).d('父订单号'),
        dataIndex: 'ecPoNum',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecPoSubNum`).d('子订单号'),
        dataIndex: 'ecPoSubNum',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.deliverTime`).d('妥投时间'),
        dataIndex: 'deliverTime',
        width: 150,
        render: dateTimeRender,
      },
    ];
    return (
      <React.Fragment>
        <Header
          backPath={backPath}
          title={intl.get(`${promptCode}.view.title.payableInvoice.detail`).d('应付发票明细')}
        >
          {isEdit ? (
            <React.Fragment>
              <Button
                icon="save"
                type="primary"
                loading={loading}
                onClick={() => this.handleSaveOrSubmit(true, headerInfo)}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                icon="check"
                loading={loading}
                onClick={() => this.handleSaveOrSubmit(false, headerInfo)}
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>
              {!(
                routeSource === 'payable-invoice-maintain' &&
                invoiceStatus === 'EC_INVOICE_EXCEPTION'
              ) && (
                <Button icon="delete" loading={loading} onClick={this.handleDelete}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              )}
              {/* <Upload {...uploadProps} /> */}
            </React.Fragment>
          ) : (
            <React.Fragment>
              {/* <Upload {...uploadReadOnlyProps} /> */}
              {routeSource === 'invoice-review' && (
                <Button type="primary" icon="check" loading={loading} onClick={this.confirm}>
                  {intl.get(`${promptCode}.model.invoiceBill.approve`).d('通过')}
                </Button>
              )}
              {routeSource === 'invoice-review' && (
                <Button icon="close" loading={loading} onClick={this.reject}>
                  {intl.get(`${promptCode}.model.invoiceBill.return`).d('退回')}
                </Button>
              )}
              <ExcelExport
                requestUrl={requestUrl}
                queryParams={{
                  invoiceHeaderId,
                  customizeUnitCode: ecSource
                    ? eCCustomizeUnitCodes[ecSource.toUpperCase()].INVOICE_LINE
                    : 'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
                }}
                otherButtonProps={{
                  icon: 'export',
                  type: routeSource === 'invoice-review' ? 'default' : 'primary',
                }}
              />
              <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        <Content>
          <Spin spinning={!!loading} wrapperClassName={styles['payable-invoice']}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['centralizedForm']}
              onChange={(arr) => this.onCollapseChange(arr, 'centralizedForm')}
            >
              <Collapse.Panel
                forceRender
                showArrow={false}
                key="centralizedForm"
                header={
                  <React.Fragment>
                    <h3>
                      {intl
                        .get(`${promptCode}.view.message.title.detail.payableInvoice`)
                        .d('应付发票头信息')}
                    </h3>
                    <a>
                      {collapseKeys.centralizedForm
                        ? collapseKeys.centralizedForm.some((o) => o === 'centralizedForm')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.centralizedForm
                          ? collapseKeys.centralizedForm.some((o) => o === 'centralizedForm')
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </React.Fragment>
                }
              >
                <CentralizedForm {...CentralizedFormProps} />
              </Collapse.Panel>
            </Collapse>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['centralizedBillForm']}
              onChange={(arr) => this.onCollapseChange(arr, 'centralizedBillForm')}
            >
              <Collapse.Panel
                forceRender
                showArrow={false}
                key="centralizedBillForm"
                header={
                  <React.Fragment>
                    <h3>
                      {intl
                        .get(`${promptCode}.view.message.title.centralizedBillForm`)
                        .d('开票信息')}
                    </h3>
                    <a>
                      {collapseKeys.centralizedBillForm
                        ? collapseKeys.centralizedBillForm.some((o) => o === 'centralizedBillForm')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.centralizedBillForm
                          ? collapseKeys.centralizedBillForm.some(
                              (o) => o === 'centralizedBillForm'
                            )
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </React.Fragment>
                }
              >
                <CentralizedBillForm {...CentralizedBillFormProps} />
              </Collapse.Panel>
            </Collapse>
            <Tabs animated={false}>
              <TabPane
                tab={intl.get(`${promptCode}.view.message.title.invoice.tab.row`).d('发票行')}
                key="detail"
              >
                {customizeTable(
                  {
                    code: ecSource
                      ? eCCustomizeUnitCodes[ecSource.toUpperCase()].INVOICE_LINE
                      : 'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
                  },
                  <EditTable
                    bordered
                    rowKey="invoiceLineId"
                    columns={columns}
                    dataSource={dataSource}
                    pagination={pagination}
                    onChange={this.handelSearchPurchaserLine}
                    scroll={{ x: this.scrollWidth(columns, 750) }}
                  />
                )}
              </TabPane>
              {(showTaxLine || invoiceStatus === 'EC_INVOICE_EXCEPTION') && (
                <TabPane
                  tab={intl.get(`${promptCode}.view.taxInvoiceRow`).d('税务发票行')}
                  key="taxInvoiceLine"
                >
                  {routeSource === 'payable-invoice-maintain' ? (
                    <TaxElectInvoiceTable {...taxTicketTableProps} />
                  ) : (
                    <ElectTaxInvoiceLine
                      invoiceHeaderId={invoiceHeaderId}
                      remoteProps={remoteProps}
                      routeSource={routeSource}
                      remoteCode="SFIN_INVOICE_SUMMARY_READ_ONLY_CENTRALIZED_DETAIL_CUX_ELECT_TAX_COLUMNS"
                      remoteBtnCode="SFIN_INVOICE_SUMMARY_READ_ONLY_CENTRALIZED_DETAIL_CUX_ELECT_TAX_BTNS"
                      fetchHeader={this.handelSearchPurchaser}
                      headerInfo={headerInfo}
                    />
                  )}
                </TabPane>
              )}
            </Tabs>
          </Spin>
        </Content>
        {!isEdit && <ActionHistory {...operationRecordProps} />}
      </React.Fragment>
    );
  }
}
