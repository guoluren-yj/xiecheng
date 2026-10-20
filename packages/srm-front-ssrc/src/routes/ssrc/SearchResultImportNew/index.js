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
import { Button as PermissionButton } from 'components/Permission';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isEmpty, isUndefined } from 'lodash';

import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import hocRemote from 'hzero-front/lib/utils/remote';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getEditTableData,
  getResponse,
} from 'utils/utils';
import { queryIdpValue } from 'services/api';
import formatterCollections from 'utils/intl/formatterCollections';
import { EventManager } from '_utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { numberIntervalRender } from '@/utils/renderer';
import { SRM_SPC } from '_utils/config';
import { asyncPageFetchList } from '@/utils/utils';

import SAPFilterForm from './SAPFilterForm';
import SAPTable from './SAPTableList';
import EBSFilterForm from './EBSFilterForm';
import EBSTable from './EBSTableList';
// import Iconfont from '../components/Icons'; // 下载至本地的icon
import LadderLevel from '../components/LadderLevel';
import QuotedPriceModel from './QuotedPriceModel';
import style from './index.less';
import { ladderQuotationDS } from './lineDS';

const promptCode = 'ssrc.searchResultImport';
const { TabPane } = Tabs;

@withCustomize({
  unitCode: [
    'SSRC.PRICE_LIB_EXPORT_ERP.EBSTABLE_LINE',
    'SSRC.PRICE_LIB_EXPORT_ERP.SAPTABLE_LINE',
    'SSRC.PRICE_LIB_EXPORT_ERP.SAP_FILTER_FORM',
    'SSRC.PRICE_LIB_EXPORT_ERP.EBS_FILTER_FORM',
  ],
})
@connect(({ inquiryHall, searchResultImportNew, loading }) => ({
  inquiryHall,
  searchResultImportNew,
  Loading: loading.effects['searchResultImportNew/fetchEntranceList'],
  saveLoading: loading.effects['searchResultImportNew/saveData'],
  abandonLoading: loading.effects['searchResultImportNew/abandonData'],
  setFailureLoading: loading.effects['searchResultImportNew/setFailure'],
  importErpLoading: loading.effects['searchResultImportNew/sourceImportErp'],
  fetchLadderLevelTableLoading: loading.effects['inquiryHall/fetchLadderLevelTable'],
  organizationId: getCurrentOrganizationId(),
}))
// eslint-disable-next-line no-alert
@formatterCollections({
  code: ['ssrc.searchResultImport', 'ssrc.common', 'ssrc.supplierQuotation', 'ssrc.inquiryHall'],
})
@hocRemote({
  code: 'SSRC_SEARCH_RESULT_IMPORT_NEW',
})
export default class SearchResultImportNew extends Component {
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
      sourceList: [], // 跳转链接
    };
  }

  ladderQuotationDs = new DataSet(ladderQuotationDS());

  componentDidMount() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'inquiryHall/querySetting',
      payload: {
        '011115': '011115',
      },
    });
    dispatch({
      type: 'searchResultImportNew/fetchQueryBatchCode',
      payload: {
        lovCodes: {
          copyFlagList: 'HPFM.FLAG',
        },
      },
    });
    dispatch({
      type: 'searchResultImportNew/getSystem',
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
    // 查询跳转链接值集
    queryIdpValue('SSRC.PRICE_LIB_SOURCE_FROM').then((res) => {
      if (getResponse(res)) {
        this.setState({ sourceList: res });
      }
    });
    // 避免重复监听, 需要在组件销毁时, 移除事件监听
    EventManager.on('REFRESH-PRICE-LIBRARY-IMPORT_TABLE', this.refreshTable);
  }

  getSnapshotBeforeUpdate() {
    const { dispatch, location } = this.props;
    const { activeKey } = querystring.parse(location.search.substr(1));
    const {
      searchResultImportNew: { gotoFlag },
    } = this.props;
    if (gotoFlag && activeKey) {
      this.setState(
        {
          activeKey,
        },
        () => {
          dispatch({
            type: 'searchResultImportNew/updateState',
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
   * 刷新table数据
   */
  @Bind()
  refreshTable() {
    this.handleSearch(); //  刷新页面
  }

  /**
   * 寻源结果查询
   */
  @Bind()
  querySupplier() {
    const {
      dispatch,
      searchResultImportNew: { pagination = {} },
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
   * 渲染阶梯报价
   */
  @Bind()
  renderLadderQuotation() {
    const columns = [
      {
        name: 'ladderLineNum',
        width: 80,
      },
      {
        name: 'ladderFrom',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ record }) =>
          numberIntervalRender(record.toData().ladderFrom, record.toData().ladderTo),
      },
      {
        name: 'ladderPrice',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'ladderNetPrice',
        width: 100,
        tooltip: 'overflow',
      },
      {
        name: 'cumulativeFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'ladderPriceRemark',
        width: 150,
        tooltip: 'overflow',
      },
    ];
    return (
      <Table
        dataSet={this.ladderQuotationDs}
        columns={columns}
        className={style['popover-content']}
      />
    );
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
   * 处理跳转列
   * @param {*} columns
   * @param {*} fixWidth
   * @returns
   */
  @Bind()
  renderJumpColumn(val, record = {}) {
    const { sourceList } = this.state;
    if (isEmpty(record) || isEmpty(sourceList)) {
      return val;
    }
    const { sourceFrom } = record;
    let showLink = false;
    const path = sourceList.find((item) => item.value === record.sourceFrom)?.tag;
    if (path || ['BID', 'RFX'].includes(sourceFrom)) {
      showLink = true;
    }
    return showLink ? <a onClick={() => this.onDetail(record)}>{val}</a> : val;
  }

  /**
   * 点击寻源单号跳转
   */
  @Bind()
  async onDetail(record = {}) {
    const { dispatch } = this.props;
    const { sourceList } = this.state;
    const { sourceHeaderId } = record;
    if (isEmpty(sourceList)) {
      return;
    }
    let finalPath = '';
    let search = '';
    if (sourceList) {
      const path = sourceList.find((item) => item.value === record.sourceFrom)?.tag;
      if (path) {
        const [pathName, params] = path.split('?');
        let searchParams = params;
        finalPath = pathName.replace('{sourceHeaderId}', sourceHeaderId);
        if (searchParams) {
          (Object.keys(record) || []).forEach((fieldName) => {
            if (searchParams.includes(fieldName)) {
              const reg = new RegExp(`{${fieldName}}`, 'g');
              searchParams = searchParams.replace(reg, record[fieldName]);
            }
          });
        }
        search = searchParams ? `?${searchParams}` : '';
      } else if (record.sourceFrom === 'BID') {
        // 保留旧的跳转方式，防止二开了SSRC.PRICE_LIB_SOURCE_FROM无法找到tag
        search = querystring.stringify({
          libFlag: 'priceLib', // 页面跳转标识，backpath标识
        });
        dispatch(
          routerRedux.push({
            pathname: `/ssrc/inquiry-bid-query/bid-update/${sourceHeaderId}`,
            search,
          })
        );
        return;
      } else if (record.sourceFrom === 'RFX') {
        finalPath = `/ssrc/search-result-import-new/results-query-detail/${sourceHeaderId}`;
        search = querystring.stringify({
          typeName: 'resultImportNewDetail',
        });
      }
    }
    if (!finalPath) {
      return;
    }
    dispatch(
      routerRedux.push({
        pathname: finalPath,
        search,
      })
    );
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   * @param { Boolean } pageChangeFlag - 是否来源于翻页查询
   */
  @Bind()
  async handleSearch(page = {}, pageChangeFlag = false) {
    const {
      dispatch,
      organizationId,
      searchResultImportNew: { resultsListOldTotal: oldTotalElements },
    } = this.props;
    const { activeKey = 'SAP' } = this.state;
    let activeForm;
    let hcuzCode =
      'SSRC.PRICE_LIB_EXPORT_ERP.EBSTABLE_LINE,SSRC.PRICE_LIB_EXPORT_ERP.EBS_FILTER_FORM';
    switch (activeKey) {
      case 'SAP':
        activeForm = this.SAPForm;
        hcuzCode =
          'SSRC.PRICE_LIB_EXPORT_ERP.SAPTABLE_LINE,SSRC.PRICE_LIB_EXPORT_ERP.SAP_FILTER_FORM';
        break;
      case 'EBS':
        activeForm = this.EBSForm;
        hcuzCode =
          'SSRC.PRICE_LIB_EXPORT_ERP.EBSTABLE_LINE,SSRC.PRICE_LIB_EXPORT_ERP.EBS_FILTER_FORM';
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
      creationDateFromNew: fieldValues.creationDateFromNew
        ? fieldValues.creationDateFromNew.format(DATETIME_MIN)
        : undefined,
      creationDateToNew: fieldValues.creationDateToNew
        ? fieldValues.creationDateToNew.format(DATETIME_MAX)
        : undefined,
    };
    const commonPayload = {
      page,
      ...fieldValues,
      ...values,
      organizationId,
      systemType: activeKey || 'SAP',
      customizeUnitCode: hcuzCode,
    };
    const fetchScoring = (payload) => {
      return dispatch({
        type: 'searchResultImportNew/fetchEntranceList',
        payload,
      });
    };

    // 异步分页
    await asyncPageFetchList({
      pageChangeFlag,
      commonPayload,
      oldTotalElements,
      fetchDataList: fetchScoring,
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
      searchResultImportNew: { pagination = {} },
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
        sourceResultExtendNew: {
          ...item.sourceResultExtendNew,
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
          type: 'searchResultImportNew/saveData',
          payload: {
            organizationId,
            newParams: newParmaters,
            customizeUnitCode:
              'SSRC.PRICE_LIB_EXPORT_ERP.SAPTABLE_LINE,SSRC.PRICE_LIB_EXPORT_ERP.SAP_FILTER_FORM',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.setState({
              resultImportSelectedRows: [],
              resultImportSelectedRowKeys: [],
            });
            this.props.dispatch({
              type: 'searchResultImportNew/updateState',
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
      searchResultImportNew: { pagination = {} },
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
        type: 'searchResultImportNew/abandonData',
        payload: {
          organizationId,
          resultIdList,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.props.dispatch({
            type: 'searchResultImportNew/updateState',
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
   * 置为无效
   */
  @Bind()
  setFailure() {
    const {
      dispatch,
      searchResultImportNew: { pagination = {} },
      organizationId,
    } = this.props;
    const { resultImportSelectedRows } = this.state;
    // 获取勾选行的resultId
    const resultIdList = resultImportSelectedRows.map((item) => item.resultId);
    if (isEmpty(resultIdList)) return;
    dispatch({
      type: 'searchResultImportNew/setFailure',
      payload: {
        organizationId,
        resultIdList,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.props.dispatch({
          type: 'searchResultImportNew/updateState',
          payload: {
            resultsList: [],
          },
        });
        this.handleSearch(pagination);
        this.setState({ resultImportSelectedRowKeys: [], resultImportSelectedRows: [] });
      }
    });
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
      searchResultImportNew: { pagination = {} },
      organizationId,
      remote,
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
        sourceResultExtendNew: {
          ...item.sourceResultExtendNew,
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
          type: 'searchResultImportNew/sourceImportErp',
          payload: remote
            ? remote.process('SSRC_SEARCH_RESULT_IMPORT_ERP_PARAMS', {
                organizationId,
                newParams: newParmaters,
                systemType: activeKey,
              })
            : {
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
              type: 'searchResultImportNew/updateState',
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
      searchResultImportNew: { pagination = {} },
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
        sourceResultExtendNew: {
          ...item.sourceResultExtendNew,
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
        type: 'searchResultImportNew/sourceImportToErp',
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
            type: 'searchResultImportNew/updateState',
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
  handleGetFormValue(type) {
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

    const fieldValues = isUndefined(filterForm)
      ? {}
      : filterNullValueObject(filterForm.getFieldsValue());
    let values = { ...fieldValues };
    values = {
      creationDateFrom: fieldValues.creationDateFrom
        ? fieldValues.creationDateFrom.format(DATETIME_MIN)
        : undefined,
      creationDateTo: fieldValues.creationDateTo
        ? fieldValues.creationDateTo.format(DATETIME_MAX)
        : undefined,
      creationDateFromNew: fieldValues.creationDateFromNew
        ? fieldValues.creationDateFromNew.format(DATETIME_MIN)
        : undefined,
      creationDateToNew: fieldValues.creationDateToNew
        ? fieldValues.creationDateToNew.format(DATETIME_MAX)
        : undefined,
    };
    const filterValues =
      resultImportSelectedRowKeys.length > 0
        ? {
            // POST方式适用数组
            resultIds: type ? resultImportSelectedRowKeys : String(resultImportSelectedRowKeys),
          }
        : filterNullValueObject({ ...fieldValues, ...values });
    return {
      ...filterValues,
      systemType: activeKey,
    };
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
      searchResultImportNew: { resultsList },
      dispatch,
    } = this.props;
    const newResultsList = resultsList.map((item) =>
      record.resultId === item.resultId ? { ...item, rewriteFlag: flag ? 1 : 0 } : item
    );
    dispatch({
      type: 'searchResultImportNew/updateState',
      payload: { resultsList: newResultsList },
    });
  }

  /**
   * 查询阶梯报价
   */
  @Bind()
  fetchLadderQuotation(record) {
    this.ladderQuotationDs.setQueryParameter('priceLibId', record.priceLibraryId);
    this.ladderQuotationDs.query();
  }

  /**
   * 销毁组件, 移除事件监听
   */
  componentWillUnmount() {
    EventManager.off('REFRESH-PRICE-LIBRARY-IMPORT_TABLE', this.refreshTable);
  }

  @Bind()
  handleSAPConditional() {
    this.setState({
      resultImportSelectedRows: [],
      resultImportSelectedRowKeys: [],
    });
    this.handleSearch();
  }

  @Bind()
  handleEBSConditional() {
    this.setState({
      resultImportSelectedRows: [],
      resultImportSelectedRowKeys: [],
    });
    this.handleSearch();
  }

  render() {
    const {
      Loading,
      saveLoading,
      abandonLoading,
      setFailureLoading,
      organizationId,
      customizeTable,
      importErpLoading,
      customizeFilterForm,
      fetchLadderLevelTableLoading,
      searchResultImportNew: {
        resultsList = [],
        pagination = {},
        lovCode = {},
        paginationLoading = false,
      },
      inquiryHall: { code = {}, quotaLadderLevelData = [], settings = {} },
      remote,
      dispatch,
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
      remote,
      activeKey,
      organizationId,
      selectRows: resultImportSelectedRows,
      onDetail: this.onDetail,
      renderJumpColumn: this.renderJumpColumn,
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
      customizeFilterForm,
      onRef: this.handleSAPRef,
      resultImportSelectedRowKeys,
      onConditional: this.handleSAPConditional,
    };
    const SAPTableProps = {
      code,
      Loading,
      paginationLoading,
      pagination,
      resultsList,
      organizationId,
      resultImportRowSelection,
      customizeTable,
      onDetail: this.onDetail,
      renderJumpColumn: this.renderJumpColumn,
      changeOuId: this.changeOuId,
      scrollWidth: this.scrollWidth,
      handleSearch: this.handleSearch,
      changeInvOrganization: this.changeInvOrganization,
      viewLadderLevelModal: this.viewLadderLevelModal,
      editRow: this.editRow,
      onRenderLadderQuotation: this.renderLadderQuotation,
      onFetchLadderQuotation: this.fetchLadderQuotation,
    };
    const EBSFilterProps = {
      code,
      lovCode,
      organizationId,
      customizeFilterForm,
      onRef: this.handleEBSRef,
      resultImportSelectedRowKeys,
      onConditional: this.handleEBSConditional,
    };
    const EBSTableProps = {
      code,
      Loading,
      paginationLoading,
      pagination,
      resultsList,
      organizationId,
      customizeTable,
      resultImportRowSelection,
      onDetail: this.onDetail,
      renderJumpColumn: this.renderJumpColumn,
      changeOuId: this.changeOuId,
      scrollWidth: this.scrollWidth,
      handleSearch: this.handleSearch,
      changeSupplierId: this.changeSupplierId,
      viewLadderLevelModal: this.viewLadderLevelModal,
      changeInvOrganization: this.changeInvOrganization,
      changeSupplierLocation: this.changeSupplierLocation,
      onRenderLadderQuotation: this.renderLadderQuotation,
      onFetchLadderQuotation: this.fetchLadderQuotation,
    };
    const buttons = [
      <Button
        type="primary"
        style={{ marginLeft: 8 }}
        onClick={() => this.importErp(resultImportSelectedRows)}
        loading={importErpLoading}
        icon="download"
      >
        {intl.get(`${promptCode}.view.message.button.importERP`).d('导入ERP')}
      </Button>,
      allowChangeOrganization && (
        <Button type="default" style={{ marginLeft: 8 }} onClick={() => this.openQuotedPrice()}>
          {/* <Iconfont type="yinyongjiage" style={{ marginRight: '8px' }} /> */}
          {intl.get('ssrc.searchResultImport.view.message.button.quotedPrice').d('引用价格')}
        </Button>
      ),
      <Button
        type="default"
        loading={saveLoading}
        style={{ marginLeft: '8px' }}
        onClick={() => this.saveData()}
        icon="save"
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      <ExcelExport
        requestUrl={`${SRM_SPC}/v1/${organizationId}/source/result-news/export`}
        queryParams={this.handleGetFormValue()}
      />,
      <ExcelExportPro
        method="POST"
        allBody
        buttonText={
          resultImportSelectedRows.length
            ? intl.get(`hzero.common.checkedExport`).d('勾选导出')
            : intl.get(`hzero.common.button.newExport`).d('新版导出')
        }
        otherButtonProps={{
          type: 'c7n-pro',
          icon: 'unarchive',
          funcType: 'flat',
        }}
        templateCode="SRM_SSRC_SOURCE_RESULT"
        requestUrl={`${SRM_SPC}/v1/${organizationId}/source/result-news/excel-export`}
        queryParams={this.handleGetFormValue('NEW')}
      />,
      <PermissionButton
        type="default"
        loading={abandonLoading}
        onClick={() => this.abandonData()}
        icon="close"
        permissionList={[
          {
            code: 'srm.source.result.price.lib.search-result-import-new.api.give-up',
            type: 'button',
            meaning: intl.get(`${promptCode}.view.message.button.abandon`).d('放弃'),
          },
        ]}
      >
        {intl.get(`${promptCode}.view.message.button.abandon`).d('放弃')}
      </PermissionButton>,
      <PermissionButton
        type="default"
        loading={setFailureLoading}
        onClick={() => this.setFailure()}
        icon="close"
        disabled={isEmpty(resultImportSelectedRows)}
        permissionList={[
          {
            code: 'srm.source.result.price.lib.search-result-import-new.api.reset-failed',
            type: 'button',
            meaning: intl.get(`${promptCode}.view.message.button.setFailure`).d('置为失败'),
          },
        ]}
      >
        {intl.get(`${promptCode}.view.message.button.setFailure`).d('置为失败')}
      </PermissionButton>,
    ];
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`${promptCode}.view.message.title.priceLibraryImportERP`)
            .d('价格库导入erp')}
        >
          {remote
            ? remote.process('SSRC_SEARCH_RESULT_IMPORT_NEW_BUTTONS', buttons, {
                resultImportSelectedRows,
                activeKey,
                handleSearch: this.handleSearch,
                pagination,
                promptCode,
                dispatch,
                setState: this.setState.bind(this),
              })
            : buttons}
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
