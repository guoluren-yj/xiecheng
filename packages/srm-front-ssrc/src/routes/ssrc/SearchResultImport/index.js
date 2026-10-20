/**
 * Recommend - 寻源结果-列表
 * @date: 2019-4-2
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Tabs, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isEmpty, isUndefined } from 'lodash';

import { routerRedux } from 'dva/router';
import querystring from 'querystring';

import intl from 'utils/intl';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import { filterNullValueObject, getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import SAPFilterForm from './SAPFilterForm';
import SAPTable from './SAPTableList';
import EBSFilterForm from './EBSFilterForm';
import EBSTable from './EBSTableList';
// import Iconfont from '../components/Icons'; // 下载至本地的icon
import LadderLevel from '../components/LadderLevel';
import QuotedPriceModel from './QuotedPriceModel';

const promptCode = 'ssrc.searchResultImport';
const { TabPane } = Tabs;

@withCustomize({
  unitCode: ['SSRC.PRICE_LIB_INFO.EBSTABLE_LINE', 'SSRC.PRICE_LIB_INFO.SAPTABLE_LINE'],
})
@connect(({ inquiryHall, searchResultImport, loading }) => ({
  inquiryHall,
  searchResultImport,
  Loading: loading.effects['searchResultImport/fetchEntranceList'],
  saveLoading: loading.effects['searchResultImport/saveData'],
  abandonLoading: loading.effects['searchResultImport/abandonData'],
  importErpLoading: loading.effects['searchResultImport/sourceImportErp'],
  fetchLadderLevelTableLoading: loading.effects['inquiryHall/fetchLadderLevelTable'],
  organizationId: getCurrentOrganizationId(),
}))
// eslint-disable-next-line no-alert
@formatterCollections({
  code: ['ssrc.searchResultImport', 'ssrc.common', 'ssrc.supplierQuotation', 'ssrc.inquiryHall'],
})
export default class SearchResultImport extends Component {
  form;

  constructor(props) {
    super(props);
    const { activeKey } = querystring.parse(props.location.search.substr(1));
    this.state = {
      resultImportSelectedRows: [], // 采购信息选中行
      resultImportSelectedRowKeys: [], // 采购信息选中id
      viewLadderLevelVisible: false, // 阶梯报价模态框
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      activeKey: activeKey || 'SAP',
      displayTabs: '',
      quotedPriceModelVisible: false, // 引用价格的弹框是否显示
    };
  }

  componentDidMount() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'inquiryHall/querySetting',
      payload: {
        '011115': '011115',
      },
    });
    dispatch({
      type: 'searchResultImport/fetchQueryBatchCode',
      payload: {
        lovCodes: {
          copyFlagList: 'HPFM.FLAG',
        },
      },
    });
    dispatch({
      type: 'searchResultImport/getSystem',
      payload: { organizationId },
    }).then((res) => {
      this.setState({
        displayTabs: res,
      });
      if (res === 'EBS') {
        this.setState(
          {
            activeKey: res,
          },
          () => {
            this.querySupplier();
          }
        );
      } else {
        this.querySupplier();
      }
    });
  }

  getSnapshotBeforeUpdate() {
    const { dispatch, location } = this.props;
    const { activeKey } = querystring.parse(location.search.substr(1));
    const {
      searchResultImport: { gotoFlag },
    } = this.props;
    if (gotoFlag && activeKey) {
      this.setState(
        {
          activeKey,
        },
        () => {
          dispatch({
            type: 'searchResultImport/updateState',
            payload: { gotoFlag: false },
          });
        }
      );
      return true;
    } else {
      return false;
    }
  }

  componentDidUpdate(...param) {
    if (param[2]) {
      this.querySupplier();
    }
  }

  /**
   * 寻源结果查询
   */
  @Bind()
  querySupplier() {
    const {
      dispatch,
      searchResultImport: { pagination = {} },
    } = this.props;
    this.handleSearch(pagination);
    const lovCodes = {
      sourceTy: 'SSRC.SOURCE_TYPE', // 寻源类型
      sourceCategory: 'SSRC.SOURCE_FROM', // 寻源类别
      infoType: 'SSRC.INFO_TYPE', // 信息类别
      syncStatus: 'SSRC.SOURCE_RESULT_SYNC_STATUS', // 导入状态
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      rfxStatus: 'SSRC.RFX_STATUS', // 询价单状态
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 报价方向
      sourceCategorys: 'SSRC.SOURCE_CATEGORY', // 寻源类别
      quotationType: 'SSRC.QUOTATION_TYPE', // 报价方式
    };
    dispatch({
      type: 'inquiryHall/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const { itemCode, itemName, supplierCompanyName, sourceId, quotationLineStatus } = record;
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        sourceId,
        supplierCompanyName,
        quotationLineStatus,
      },
    });
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'inquiryHall/fetchLadderLevelTable',
      payload: { quotationLineId: sourceId, organizationId },
    });
  }

  /**
   * hideLadderLevelModal - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    this.setState({ viewLadderLevelVisible: false });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        quotaLadderLevelData: [],
      },
    });
  }

  /**
   * SAPTab页的表单
   * @param {*} 绑定的节点
   */
  @Bind()
  handleSAPRef(ref = {}) {
    this.SAPForm = (ref.props || {}).form;
  }

  /**
   * EBSTab页的表单
   * @param {*} 绑定的节点
   */
  @Bind()
  handleEBSRef(ref = {}) {
    this.EBSForm = (ref.props || {}).form;
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 点击寻源单号跳转
   */
  @Bind()
  onDetail(record = {}) {
    const { dispatch } = this.props;
    const { sourceHeaderId } = record;

    // 判断询价单/招投标
    if (record.sourceFrom === 'BID') {
      const search = querystring.stringify({
        libFlag: 'priceLib', // 页面跳转标识，backpath标识
      });
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/inquiry-bid-query/bid-update/${sourceHeaderId}`,
          search,
        })
      );
    } else {
      const search = querystring.stringify({
        typeName: 'resultImportDetail',
      });
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/search-result-import/results-query-detail/${sourceHeaderId}`,
          search,
        })
      );
    }
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, organizationId } = this.props;
    const { activeKey = 'SAP' } = this.state;
    let activeForm;
    let hcuzCode = 'SSRC.PRICE_LIB_INFO.EBSTABLE_LINE';
    switch (activeKey) {
      case 'SAP':
        activeForm = this.SAPForm;
        hcuzCode = 'SSRC.PRICE_LIB_INFO.SAPTABLE_LINE';
        break;
      case 'EBS':
        activeForm = this.EBSForm;
        hcuzCode = 'SSRC.PRICE_LIB_INFO.EBSTABLE_LINE';
        break;
      default:
        break;
    }
    const fieldValues = isUndefined(activeForm)
      ? {}
      : filterNullValueObject(activeForm.getFieldsValue());
    let values = { ...fieldValues };
    values = {
      creationDateFrom: fieldValues.creationDateFrom
        ? fieldValues.creationDateFrom.format(DATETIME_MIN)
        : undefined,
      creationDateTo: fieldValues.creationDateTo
        ? fieldValues.creationDateTo.format(DATETIME_MAX)
        : undefined,
    };
    dispatch({
      type: 'searchResultImport/fetchEntranceList',
      payload: {
        page,
        ...fieldValues,
        ...values,
        organizationId,
        systemType: activeKey || 'SAP',
        customizeUnitCode: hcuzCode,
      },
    });
  }

  // 导入Erp数据后
  @Bind()
  handleAfterImportErp() {
    this.setState({
      quotedPriceModelVisible: false,
      resultImportSelectedRows: [], // 采购信息选中行
      resultImportSelectedRowKeys: [], // 采购信息选中id
    });
  }

  /**
   * 批量保存列表
   */
  @Bind()
  saveData() {
    const { resultImportSelectedRows } = this.state;
    const {
      dispatch,
      searchResultImport: { pagination = {} },
      organizationId,
    } = this.props;
    const newParams = getEditTableData(resultImportSelectedRows, ['resultId']);
    const newParmaters = newParams.map((item) => {
      const {
        firstReminder,
        secondReminder,
        thirdReminder,
        nonDelivery,
        excessiveDelivery,
        purchaseOrderRemark,
        remark,
        baseUomConversionRate,
        priceUomConversionRate,
        validPromisedDate,
        quotationExpiryDateFrom,
        quotationExpiryDateTo,
      } = item;

      const baseOrderRateSub = baseUomConversionRate && baseUomConversionRate.split(':')[0];
      const baseOrderRatePar = baseUomConversionRate && baseUomConversionRate.split(':')[1];
      const priceOrderRateSub = priceUomConversionRate && priceUomConversionRate.split(':')[0];
      const priceOrderRatePar = priceUomConversionRate && priceUomConversionRate.split(':')[1];
      const validPromisedDateFix = validPromisedDate
        ? moment(validPromisedDate).format(DATETIME_MIN)
        : undefined;
      const quotationExpiryDateFromFix = quotationExpiryDateFrom
        ? moment(quotationExpiryDateFrom).format(DATETIME_MIN)
        : undefined;
      const quotationExpiryDateToFix = quotationExpiryDateTo
        ? moment(quotationExpiryDateTo).format(DATETIME_MIN)
        : undefined;
      return {
        ...item,
        quotationExpiryDateFrom: quotationExpiryDateFromFix,
        quotationExpiryDateTo: quotationExpiryDateToFix,
        validPromisedDate: validPromisedDateFix,
        sourceResultExtend: {
          ...item.sourceResultExtend,
          remark,
          nonDelivery,
          firstReminder,
          purchaseOrderRemark,
          thirdReminder,
          secondReminder,
          excessiveDelivery,
          baseOrderRateSub,
          baseOrderRatePar,
          priceOrderRateSub,
          priceOrderRatePar,
        },
      };
    });

    if (resultImportSelectedRows.length !== 0) {
      if (!isEmpty(newParmaters)) {
        dispatch({
          type: 'searchResultImport/saveData',
          payload: {
            organizationId,
            newParams: newParmaters,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.setState({
              resultImportSelectedRows: [],
              resultImportSelectedRowKeys: [],
            });
            this.props.dispatch({
              type: 'searchResultImport/updateState',
              payload: {
                resultsList: [],
              },
            });
            this.handleSearch(pagination);
          }
        });
      } else {
        notification.warning({
          message: intl
            .get(`${promptCode}.view.message.requiredFields`)
            .d('检验不通过，必输项必填'),
        });
      }
    } else {
      notification.warning({
        message: intl.get(`${promptCode}.view.message.noSelectedRows`).d('未选择保存行，无法保存!'),
      });
    }
  }

  /**
   * 放弃
   * @param {object} fields - 放弃
   */
  @Bind()
  abandonData() {
    const {
      dispatch,
      searchResultImport: { pagination = {} },
      organizationId,
    } = this.props;
    const { resultImportSelectedRows } = this.state;
    // 获取勾选行的resultId
    const resultIdList = resultImportSelectedRows.map((item) => item.resultId);
    if (isEmpty(resultIdList)) {
      notification.warning({
        message: intl.get(`${promptCode}.view.message.abandonSelectedRows`).d('请先勾选需放弃行！'),
      });
    } else {
      dispatch({
        type: 'searchResultImport/abandonData',
        payload: {
          organizationId,
          resultIdList,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.props.dispatch({
            type: 'searchResultImport/updateState',
            payload: {
              resultsList: [],
            },
          });
          this.handleSearch(pagination);
          this.setState({ resultImportSelectedRowKeys: [], resultImportSelectedRows: [] });
        }
      });
    }
  }

  /**
   * 导入ERP
   * @param {*} 传入数据的datasource
   */
  @Bind()
  importErp(resultImportSelectedRows) {
    const { activeKey } = this.state;
    const {
      dispatch,
      searchResultImport: { pagination = {} },
      organizationId,
    } = this.props;
    const newParams = getEditTableData(resultImportSelectedRows, ['resultId']);
    const newParmaters = newParams.map((item) => {
      const {
        firstReminder,
        secondReminder,
        thirdReminder,
        nonDelivery,
        excessiveDelivery,
        purchaseOrderRemark,
        remark,
        baseUomConversionRate,
        priceUomConversionRate,
        validPromisedDate,
        quotationExpiryDateFrom,
        quotationExpiryDateTo,
      } = item;
      const baseOrderRateSub = baseUomConversionRate && baseUomConversionRate.split(':')[0];
      const baseOrderRatePar = baseUomConversionRate && baseUomConversionRate.split(':')[1];
      const priceOrderRateSub = priceUomConversionRate && priceUomConversionRate.split(':')[0];
      const priceOrderRatePar = priceUomConversionRate && priceUomConversionRate.split(':')[1];
      const validPromisedDateFix = validPromisedDate
        ? moment(validPromisedDate).format(DATETIME_MIN)
        : undefined;
      const quotationExpiryDateFromFix = quotationExpiryDateFrom
        ? moment(quotationExpiryDateFrom).format(DATETIME_MIN)
        : undefined;
      const quotationExpiryDateToFix = quotationExpiryDateTo
        ? moment(quotationExpiryDateTo).format(DATETIME_MIN)
        : undefined;
      return {
        ...item,
        validPromisedDate: validPromisedDateFix,
        quotationExpiryDateFrom: quotationExpiryDateFromFix,
        quotationExpiryDateTo: quotationExpiryDateToFix,
        sourceResultExtend: {
          ...item.sourceResultExtend,
          remark,
          nonDelivery,
          firstReminder,
          thirdReminder,
          secondReminder,
          purchaseOrderRemark,
          excessiveDelivery,
          baseOrderRateSub,
          baseOrderRatePar,
          priceOrderRateSub,
          priceOrderRatePar,
        },
      };
    });
    if (resultImportSelectedRows.length !== 0) {
      if (!isEmpty(newParmaters)) {
        dispatch({
          type: 'searchResultImport/sourceImportErp',
          payload: {
            organizationId,
            newParams: newParmaters,
            systemType: activeKey,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.setState({
              resultImportSelectedRows: [],
              resultImportSelectedRowKeys: [],
            });
            this.props.dispatch({
              type: 'searchResultImport/updateState',
              payload: {
                resultsList: [],
              },
            });
            this.handleSearch(pagination);
          }
        });
      }
    } else {
      notification.warning({
        message: intl.get(`${promptCode}.view.message.pleaseSelectedRows`).d('请先勾选需导入的行'),
      });
    }
  }

  /**
   * 导入ERP(侧弹框的)
   * @param {*} 传入数据的datasource
   */
  @Bind()
  importToErp(resultImportSelectedRows) {
    const { activeKey } = this.state;
    const {
      dispatch,
      searchResultImport: { pagination = {} },
      organizationId,
    } = this.props;
    const newParams = getEditTableData(resultImportSelectedRows, ['resultId']);
    const newParmaters = newParams.map((item) => {
      const {
        firstReminder,
        secondReminder,
        thirdReminder,
        purchaseOrderRemark,
        nonDelivery,
        excessiveDelivery,
        remark,
        baseUomConversionRate,
        priceUomConversionRate,
        validPromisedDate,
        quotationExpiryDateFrom,
        quotationExpiryDateTo,
      } = item;
      const baseOrderRateSub = baseUomConversionRate && baseUomConversionRate.split(':')[0];
      const baseOrderRatePar = baseUomConversionRate && baseUomConversionRate.split(':')[1];
      const priceOrderRateSub = priceUomConversionRate && priceUomConversionRate.split(':')[0];
      const priceOrderRatePar = priceUomConversionRate && priceUomConversionRate.split(':')[1];
      const validPromisedDateFix = validPromisedDate
        ? moment(validPromisedDate).format(DATETIME_MIN)
        : undefined;
      const quotationExpiryDateFromFix = quotationExpiryDateFrom
        ? moment(quotationExpiryDateFrom).format(DATETIME_MIN)
        : undefined;
      const quotationExpiryDateToFix = quotationExpiryDateTo
        ? moment(quotationExpiryDateTo).format(DATETIME_MIN)
        : undefined;
      return {
        ...item,
        validPromisedDate: validPromisedDateFix,
        quotationExpiryDateFrom: quotationExpiryDateFromFix,
        quotationExpiryDateTo: quotationExpiryDateToFix,
        sourceResultExtend: {
          ...item.sourceResultExtend,
          remark,
          nonDelivery,
          firstReminder,
          thirdReminder,
          secondReminder,
          purchaseOrderRemark,
          excessiveDelivery,
          baseOrderRateSub,
          baseOrderRatePar,
          priceOrderRateSub,
          priceOrderRatePar,
        },
      };
    });

    if (!isEmpty(newParmaters)) {
      dispatch({
        type: 'searchResultImport/sourceImportToErp',
        payload: {
          organizationId,
          newParams: newParmaters,
          systemType: activeKey,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.setState({
            resultImportSelectedRows: [],
            resultImportSelectedRowKeys: [],
            quotedPriceModelVisible: false,
          });
          this.props.dispatch({
            type: 'searchResultImport/updateState',
            payload: {
              modelList: [],
            },
          });
          this.handleSearch(pagination);
        }
      });
    }
  }

  /**
   * 物品明细-获取选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleResultImportRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      resultImportSelectedRowKeys: selectedRowKeys,
      resultImportSelectedRows: selectedRows,
    });
  }

  /**
   * 获取数据导出查询参数
   */
  @Bind()
  handleGetFormValue() {
    const { resultImportSelectedRowKeys, activeKey } = this.state;
    let filterForm;
    switch (activeKey) {
      case 'SAP':
        filterForm = this.SAPForm;
        break;
      case 'EBS':
        filterForm = this.EBSForm;
        break;
      default:
        break;
    }
    const filterValues =
      resultImportSelectedRowKeys.length > 0
        ? {
            resultIds: String(resultImportSelectedRowKeys),
          }
        : isUndefined(filterForm)
        ? {}
        : filterNullValueObject(filterForm.getFieldsValue());
    return filterValues;
  }

  /**
   * 点击引用价格按钮
   */
  @Bind()
  openQuotedPrice() {
    const { resultImportSelectedRows = [], resultImportSelectedRowKeys = [] } = this.state;
    // const jumpFlag = resultImportSelectedRows.every(item => item.syncStatus === 'SYNCHRONIZED'); // 跨页肯定不支持，后面再看

    if (resultImportSelectedRowKeys && resultImportSelectedRowKeys[0]) {
      // 如果数据中同时包含`EBS`和`SAP`则无法复制数据
      const rowTemp = resultImportSelectedRows[0];
      const isFromDiffTab = resultImportSelectedRows.some(
        (item) => item.systemType !== rowTemp.systemType
      );
      if (isFromDiffTab) {
        // 不可同时价格引用,采购信息记录与采购协议
        notification.warning({
          message: intl
            .get(`${promptCode}.view.message.copyDataValidateMsg`)
            .d('不可同时复制两个页签的数据!'),
        });
      } else {
        this.setState({
          quotedPriceModelVisible: true,
        });
      }
    } else {
      notification.warning({
        message: intl
          .get(`${promptCode}.view.message.pleaseSelectedQuoteRows`)
          .d('请先勾选需引用的行'),
      });
    }
  }

  /**
   * 关闭引用价格
   */
  @Bind()
  cancleQuotedPriceModel() {
    this.setState({
      quotedPriceModelVisible: false,
      // resultImportSelectedRowKeys: [],
      // resultImportSelectedRows: [],
    });
  }

  /**
   * 改变业务实体 - 清空库存组织
   */
  @Bind()
  changeOuId(val, dataList, record) {
    const { setFieldsValue } = record.$form;
    if (!val) {
      setFieldsValue({
        ouId: undefined,
        ouName: undefined,
        ouCode: undefined,
        invOrganizationId: undefined,
        invOrganizationName: undefined,
      });
      return;
    }
    setFieldsValue({
      ouId: dataList.ouId,
      ouName: dataList.ouName,
      ouCode: dataList.ouCode,
      invOrganizationId: undefined,
      invOrganizationName: undefined,
    });
  }

  /**
   * 改变供应商 - 清空供应商地点
   * @param {*} 当前供应商id
   * @param {*} 当前lov所带出来的行的值
   * @param {*} record
   */
  @Bind()
  changeSupplierId(value, dataList, record) {
    const { setFieldsValue } = record.$form;
    if (!value) {
      setFieldsValue({
        supplierId: undefined,
        externalSystemCode: undefined,
        supplierSiteId: undefined,
        supplierSiteName: undefined,
      });
      return;
    }
    setFieldsValue({
      supplierId: dataList.supplierId,
      externalSystemCode: dataList.externalSystemCode,
      supplierSiteName: undefined,
      supplierSiteId: undefined,
    });
  }

  @Bind()
  changeInvOrganization(val, dataList, record) {
    record.$form.setFieldsValue({
      invOrganizationId: dataList.organizationId,
      invOrganizationName: dataList.organizationName,
    });
  }

  /**
   * 改变供应商地点的回调
   * @param {*} 当前值
   * @param {*} lov里面的列表值
   * @param {*} 一行的record
   */
  @Bind()
  changeSupplierLocation(val, dataList, record) {
    record.$form.setFieldsValue({
      supplierSiteId: dataList.supplierSiteId,
      supplierSiteName: dataList.supplierSiteName,
    });
  }

  /**
   * Tab改变的回调
   * @param {*} tab选择的页签
   */
  @Bind()
  changeTab(activeKey) {
    this.setState(
      {
        activeKey,
      },
      () => {
        this.handleSearch();
      }
    );
  }

  @Bind()
  editRow(record, flag) {
    const {
      searchResultImport: { resultsList },
      dispatch,
    } = this.props;
    const newResultsList = resultsList.map((item) =>
      record.resultId === item.resultId ? { ...item, rewriteFlag: flag ? 1 : 0 } : item
    );
    dispatch({
      type: 'searchResultImport/updateState',
      payload: { resultsList: newResultsList },
    });
  }

  render() {
    const {
      Loading,
      saveLoading,
      abandonLoading,
      organizationId,
      customizeTable,
      importErpLoading,
      fetchLadderLevelTableLoading,
      searchResultImport: { resultsList = [], pagination = {}, lovCode = {} },
      inquiryHall: { code = {}, quotaLadderLevelData = [], settings = {} },
    } = this.props;
    const {
      activeKey,
      displayTabs,
      viewLadderLevelVisible,
      quotedPriceModelVisible,
      resultImportSelectedRows = [],
      LadderLevelHeaderData = {},
      resultImportSelectedRowKeys = [],
    } = this.state;
    const allowChangeOrganization = !!+(settings['011115'] && settings['011115'].settingValue);
    const resultImportRowSelection = {
      selectedRows: resultImportSelectedRows,
      selectedRowKeys: resultImportSelectedRowKeys,
      onChange: this.handleResultImportRowSelectChange,
    };
    const ladderLevelModalProps = {
      quotaLadderLevelData,
      LadderLevelHeaderData,
      visible: viewLadderLevelVisible,
      hideModal: this.hideLadderLevelModal,
      loading: fetchLadderLevelTableLoading,
    };
    const quotedPriceModelProps = {
      code,
      activeKey,
      organizationId,
      selectRows: resultImportSelectedRows,
      onDetail: this.onDetail,
      resultImportSelectedRowKeys,
      changeOuId: this.changeOuId,
      tableType: this.state.activeKey,
      visible: quotedPriceModelVisible,
      cancle: this.cancleQuotedPriceModel,
      changeSupplierId: this.changeSupplierId,
      viewLadderLevelModal: this.viewLadderLevelModal,
      changeInvOrganization: this.changeInvOrganization,
      changeSupplierLocation: this.changeSupplierLocation,
      onSearch: this.handleSearch,
      onAfterImportErp: this.handleAfterImportErp,
    };
    const SAPFilterProps = {
      code,
      lovCode,
      organizationId,
      onRef: this.handleSAPRef,
      resultImportSelectedRowKeys,
      onConditional: this.handleSearch,
    };
    const SAPTableProps = {
      code,
      Loading,
      pagination,
      resultsList,
      organizationId,
      resultImportRowSelection,
      customizeTable,
      onDetail: this.onDetail,
      changeOuId: this.changeOuId,
      scrollWidth: this.scrollWidth,
      handleSearch: this.handleSearch,
      changeInvOrganization: this.changeInvOrganization,
      viewLadderLevelModal: this.viewLadderLevelModal,
      editRow: this.editRow,
    };
    const EBSFilterProps = {
      code,
      lovCode,
      organizationId,
      onRef: this.handleEBSRef,
      resultImportSelectedRowKeys,
      onConditional: this.handleSearch,
    };
    const EBSTableProps = {
      code,
      Loading,
      pagination,
      resultsList,
      organizationId,
      customizeTable,
      resultImportRowSelection,
      onDetail: this.onDetail,
      changeOuId: this.changeOuId,
      scrollWidth: this.scrollWidth,
      handleSearch: this.handleSearch,
      changeSupplierId: this.changeSupplierId,
      viewLadderLevelModal: this.viewLadderLevelModal,
      changeInvOrganization: this.changeInvOrganization,
      changeSupplierLocation: this.changeSupplierLocation,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.priceInfoImport`).d('价格信息导入')}
        >
          <Button
            type="primary"
            style={{ marginLeft: 8 }}
            onClick={() => this.importErp(resultImportSelectedRows)}
            loading={importErpLoading}
            icon="download"
          >
            {intl.get(`${promptCode}.view.message.button.importERP`).d('导入ERP')}
          </Button>
          {allowChangeOrganization && (
            <Button type="default" style={{ marginLeft: 8 }} onClick={() => this.openQuotedPrice()}>
              {/* <Iconfont type="yinyongjiage" style={{ marginRight: '8px' }} /> */}
              {intl.get('ssrc.searchResultImport.view.message.button.quotedPrice').d('引用价格')}
            </Button>
          )}
          <Button
            type="default"
            loading={saveLoading}
            style={{ marginLeft: '8px' }}
            onClick={() => this.saveData()}
            icon="save"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <ExcelExport
            requestUrl={`/ssrc/v1/${organizationId}/source/result/export`}
            queryParams={this.handleGetFormValue()}
          />
          <Button
            type="default"
            loading={abandonLoading}
            onClick={() => this.abandonData()}
            icon="close"
          >
            {intl.get(`${promptCode}.view.message.button.abandon`).d('放弃')}
          </Button>
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <Tabs activeKey={activeKey || 'SAP'} animated={false} onChange={this.changeTab}>
            {(displayTabs === 'SAP' || displayTabs === 'BOTH' || displayTabs === 'OTHERS') && (
              <TabPane
                tab={intl.get(`${promptCode}.view.message.tab.purInfoRecord`).d('采购信息记录')}
                key="SAP"
              >
                <div style={{ marginBottom: '10px' }} className="table-list-search">
                  <SAPFilterForm {...SAPFilterProps} />
                </div>
                <SAPTable {...SAPTableProps} />
              </TabPane>
            )}
            {(displayTabs === 'EBS' || displayTabs === 'BOTH') && (
              <TabPane
                tab={intl
                  .get(`${promptCode}.view.message.tab.batchPurchaseAgreement`)
                  .d('一揽子采购协议')}
                key="EBS"
              >
                <div style={{ marginBottom: '10px' }} className="table-list-search">
                  <EBSFilterForm {...EBSFilterProps} />
                </div>
                <EBSTable {...EBSTableProps} />
              </TabPane>
            )}
          </Tabs>
        </Content>
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
        {quotedPriceModelVisible && <QuotedPriceModel {...quotedPriceModelProps} />}
      </React.Fragment>
    );
  }
}
