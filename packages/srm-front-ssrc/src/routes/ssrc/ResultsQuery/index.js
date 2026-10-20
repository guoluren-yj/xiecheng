/**
 * Recommend - 寻源结果-列表
 * @date: 2019-2-16
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Select, Form, Icon, Popover } from 'hzero-ui';
import { Icon as C7NIcon } from 'choerodon-ui/pro';
import EditTable from '_components/EditTable';
import { connect } from 'dva';
import { observer } from 'mobx-react';
import { Bind, Throttle } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty, compose } from 'lodash';
// import moment from 'moment';
import querystring from 'querystring';
import ExcelExport from 'components/ExcelExport';
import ExcelExportNew from 'hzero-front/lib/components/ExcelExportPro';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DocFlow from '_components/DocFlow';
import remoteHoc from 'hzero-front/lib/utils/remote';
import BudgetModal from 'srm-front-sbud/lib/routes/BudgetOccupiedModal';

import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getResponse,
  getCurrentTenant,
  getEditTableData,
} from 'utils/utils';
import notification from 'utils/notification';
import { numberRender, yesOrNoRender, dateRender } from 'utils/renderer';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  // DEFAULT_DATETIME_FORMAT,
  // DEFAULT_DATE_FORMAT,
  DATETIME_MAX,
  DATETIME_MIN,
} from 'utils/constants';
import { numberSeparatorRender } from '@/utils/renderer';
import DynamicButtons from '_components/DynamicButtons';
import PopoverButton from '@/routes/components/PopoverButton';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
// import LadderLevelModal from './LadderLevelModal';
import {
  saveExecutiveStrategy,
  importBudgetService,
  supplyAbilityService,
  importAnExternalSystem,
  importPriceLibrary,
} from '@/services/resultsQueryService';
import { fetchConfigSheet } from '@/services/inquiryHallNewService';
import {
  asyncPageFetchList,
  isText,
  getUomName,
  getPriceName,
  getNetPriceName,
  getEditTableToData,
} from '@/utils/utils';
import { queryEnableDoubleUnit } from '@/services/commonService';
import LadderLevel from '../components/LadderLevelDoubleUnit'; // 报价后阶梯报价弹框
import FilterForm from './FilterForm';
import SourceResultPool from './SourceResultPool';

const promptCode = 'ssrc.resultsQuery';
const FormItem = Form.Item;

class ResultsQuery extends Component {
  form;

  code;

  constructor(props) {
    super(props);

    this.sourceResultPoolRef = null;

    this.state = {
      LadderLevelHeaderData: [],
      viewLadderLevelVisible: false,
      selectedRowKeys: [],
      selectedRows: [],
      isNewLink: false,
      doubleUnitFlag: false, // 双精度标志
      exportParams: {},
      oldPriceFlag: false,
      oldSourceFlag: false,
      importAnExternalSystemLoading: false,
      importPriceLibraryLoading: false, // 导入价格库按钮loading
      pageDirective: null,
      sprmOldUi: true, // 采购申请工作台老ui
    };
  }

  componentDidMount() {
    const { remote } = this.props;
    if (remote?.event) {
      const eventProps = {
        that: this,
      };
      remote.event.fireEvent('remoteHandleMount', eventProps);
    }

    this.initPage();
  }

  initPage = async () => {
    const { remote, location = {} } = this.props;
    if (remote?.event) {
      remote.event.fireEvent('setRouterParams', {
        form: this.form,
        search: querystring.parse((location || {}).search?.substr(1)),
      });
    }

    const flag = await this.fetchResultQueryConfig();
    this.fetchLovData();

    // 寻源结果池 不需要查询老列表数据，但是其它配置表新页面要用
    if (flag === false) {
      this.querySupplier();
    }

    this.queryDoubleUnit();
    this.queryConfig();
  };

  getSnapshotBeforeUpdate(prevProps = {}) {
    const { location: preLocation } = prevProps;
    const { remote, location = {} } = this.props;
    return remote
      ? remote.process('SSRC_RESULT_QUERY_PROCESS_CONSTRACT_UPDATE', false, {
          preSearch: querystring.parse((preLocation || {}).search?.substr(1)),
          search: querystring.parse((location || {}).search?.substr(1)),
        })
      : false;
  }

  componentDidUpdate(...params) {
    const { remote, location = {} } = this.props;
    if (remote?.event) {
      remote.event.fireEvent('updateRouterParams', {
        form: this.form,
        search: querystring.parse((location || {}).search?.substr(1)),
        querySupplier: this.querySupplier,
        flag: params[2],
      });
    }
  }

  @Bind()
  async queryConfig() {
    const { organizationId } = this.props;
    try {
      const oldPriceFlagResult = getResponse(
        await fetchConfigSheet({
          configCode: 'new_old_price_lib_config',
          organizationId,
          data: {
            level: 'OLD',
            tenant: getCurrentTenant().tenantId,
          },
        })
      );
      const oldSourceFlagResult = getResponse(
        await fetchConfigSheet({
          configCode: 'ssrc_old_source_result_sync_erp_config',
          organizationId,
          data: {
            tenant: getCurrentTenant().tenantNum,
          },
        })
      );

      const sprmLinkOldConfig = await fetchConfigSheet({
        configCode: 'sprm_execution_link_old_tenant',
        organizationId,
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });

      const sprmOldUiConfig = getResponse(
        await fetchConfigSheet({
          configCode: 'sprm_old_ui_config',
          organizationId,
          data: {
            tenant: getCurrentTenant().tenantNum,
          },
        })
      );

      this.setState({
        oldPriceFlag: oldPriceFlagResult?.length,
        oldSourceFlag: oldSourceFlagResult?.length,
        isNewLink: isEmpty(sprmLinkOldConfig),
        sprmOldUi: !isEmpty(sprmOldUiConfig),
      });
    } catch (error) {
      throw error;
    }
  }

  // 寻源结果池或者寻源时间查询配置表
  fetchResultQueryConfig = async () => {
    const { organizationId } = this.props;
    let flag = null;

    const { tenantNum } = getCurrentTenant() || {};

    const newPageConfig = getResponse(
      await fetchConfigSheet({
        configCode: 'ssrc_source_result_pool_blacklist',
        organizationId,
        data: {
          tenantNum,
        },
      })
    );

    flag = !newPageConfig?.length;
    this.setState({
      pageDirective: flag,
    });

    return flag;
  };

  fetchLovData = () => {
    const { dispatch } = this.props;

    const lovCodes = {
      sourceTy: 'SSRC.SOURCE_TYPE', // 寻源类别
      quotationType: 'SSRC.QUOTATION_TYPE', // 报价方式
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      rfxStatus: 'SSRC.RFX_STATUS', // 询价单状态
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 报价方向
      sourceCategory: 'SSRC.SOURCE_CATEGORY', // 寻源类别
      executiveStrategy: 'SSRC.RESULT_EXECUTION_STRATEGY', // 寻源执行策略
      importErpStatusList: 'SSRC.SOURCE_RESULT_SYNC_ERP_STATUS', // 导入外部系统状态
    };
    dispatch({
      type: 'inquiryHall/batchCode',
      payload: { lovCodes },
    }).then((r) => {
      if (!this.code) {
        this.code = r;
      }
    });
  };

  /**
   * 寻源结果查询
   */
  @Bind()
  async querySupplier() {
    const {
      resultsQuery: { pagination = {} },
    } = this.props;
    const { pageDirective = false } = this.state;

    if (pageDirective) {
      return;
    }
    await this.handleSearch(pagination);
  }

  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
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
  onDetail(record) {
    const { dispatch, location = {} } = this.props;
    const { sourceHeaderId, sourceCategory } = record || {};
    if (!sourceHeaderId) {
      return;
    }

    const search = querystring.stringify({
      quotationDetailFlag: record.quotationDetailFlag,
    });

    if (sourceCategory === 'BID') {
      dispatch({
        type: 'resultsQuery/updateState',
        payload: {
          path: location.pathname,
        },
      });
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/results-query/results-bid-detail/${sourceHeaderId}`,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/results-query/results-query-detail/${sourceHeaderId}`,
          search,
        })
      );
    }
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
      resultsQuery: { oldTotalElements },
      remote,
    } = this.props;
    const { selectedRows } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    let values = { ...fieldValues };
    values = {
      creationDateFrom: fieldValues.creationDateFrom
        ? fieldValues.creationDateFrom.format(DATETIME_MIN)
        : undefined,
      creationDateTo: fieldValues.creationDateTo
        ? fieldValues.creationDateTo.format(DATETIME_MAX)
        : undefined,
    };

    const newState = {
      tableLoading: true,
      exportParams: {
        ...fieldValues,
        ...values,
        // customizeUnitCode: 'SSRC.RESULTS_QUERY.LIST,SSRC.RESULTS_QUERY.FILTER',
      },
    };

    if (!pageChangeFlag) {
      newState.selectedRowKeys = [];
      newState.selectedRows = [];
    } else {
      const allSelectionRows = [];
      selectedRows.forEach((row) => {
        if (!row) {
          return;
        }

        const { $form } = row || {};
        if ($form) {
          const formData = $form?.getFieldsValue() || {};
          allSelectionRows.push({ ...row, ...formData });
        } else {
          allSelectionRows.push(row);
        }
      });

      newState.selectedRows = allSelectionRows;
    }

    this.setState(newState);

    if (remote?.event) {
      await remote.event.fireEvent('changePageSave', {
        pageChangeFlag,
        handleSave: this.handleSave,
      });
    }

    const commonPayload = {
      page,
      ...fieldValues,
      ...values,
      organizationId,
      customizeUnitCode: 'SSRC.RESULTS_QUERY.LIST,SSRC.RESULTS_QUERY.FILTER',
    };

    await dispatch({
      type: 'resultsQuery/updateState',
      payload: {
        resultsList: [],
        pagination: {},
      },
    });

    const fetchEntranceList = (payload) => {
      const res = dispatch({
        type: 'resultsQuery/fetchEntranceList',
        payload,
      });
      res.then(() => {
        this.setState({
          tableLoading: false,
        });
      });
      return res;
    };

    // 异步分页
    await asyncPageFetchList({
      pageChangeFlag,
      commonPayload,
      oldTotalElements,
      fetchDataList: fetchEntranceList,
    });
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const { itemCode, itemName, supplierCompanyName, quotationLineId } = record;
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        supplierCompanyName,
      },
    });
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `inquiryHall/fetchLadderLevelTable`,
      payload: { quotationLineId, organizationId },
    });
  }

  /**
   * hideOperationRecord - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    const { dispatch } = this.props;
    this.setState({ viewLadderLevelVisible: false });
    dispatch({
      type: `inquiryHall/updateState`,
      payload: {
        ladderLevelData: [],
      },
    });
  }

  @Bind()
  linktoPrNumDetail(record) {
    const { history } = this.props;
    const { sprmOldUi } = this.state;
    const { prSourcePlatform, prHeaderId } = record || {};

    const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
    let pathUrl = null;

    if (!sprmOldUi) {
      // 采购申请工作台
      pathUrl = isErp
        ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
        : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
    } else {
      pathUrl = isErp
        ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
        : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
    }

    history.push({
      pathname: pathUrl,
    });
  }

  @Bind()
  onSelectChange(selectedRowKeys = [], selectedRows = []) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  @Throttle(1000)
  @Bind()
  saveExecutiveStrategy() {
    const {
      organizationId,
      resultsQuery: { resultsList = [] },
    } = this.props;
    const data = getEditTableData(resultsList);
    if (!data.length) {
      return;
    }
    const params = { organizationId, data, customizeUnitCode: 'SSRC.RESULTS_QUERY.LIST' };
    saveExecutiveStrategy(params).then((res) => {
      if (getResponse(res)) {
        notification.success({
          message: intl.get('hzero.common.notification.success.save').d('保存成功'),
        });
        this.handleSearch();
      }
    });
  }

  /*
   * 仅仅保存数据，不进行必输校验，可供跨页数据翻页保存，二开使用，勿删
   */
  @Bind()
  async handleSave() {
    const {
      organizationId,
      resultsQuery: { resultsList = [] },
    } = this.props;
    const data = getEditTableToData(resultsList);
    const params = { organizationId, data, customizeUnitCode: 'SSRC.RESULTS_QUERY.LIST' };
    const res = await saveExecutiveStrategy(params);
    return getResponse(res);
  }

  @Throttle(1000)
  @Bind()
  changeExecutiveStrategy(value, record, index) {
    const {
      resultsQuery: { resultsList = [] },
      dispatch,
    } = this.props;
    const changeRecord = { ...record, resultExecutionStrategy: value };
    resultsList[index] = changeRecord;
    dispatch({
      type: 'resultsQuery/updateState',
      payload: { resultsList },
    });
  }

  @Throttle(500)
  @Bind()
  importBudget() {
    const {
      organizationId,
      resultsQuery: { pagination = {} },
    } = this.props;
    const { selectedRowKeys = [] } = this.state;
    const data = { resultIds: selectedRowKeys };
    const params = { organizationId, data };
    importBudgetService(params).then((res) => {
      if (getResponse(res)) {
        this.handleSearch(pagination);
        notification.success({
          message: intl.get(`${promptCode}.view.message.title.importSuccess`).d('导入成功'),
        });
      }
    });
  }

  @Throttle(500)
  @Bind()
  createSupplierAvailable() {
    const {
      organizationId,
      resultsQuery: { pagination = {} },
    } = this.props;
    const { selectedRowKeys = [] } = this.state;
    const data = { resultIds: selectedRowKeys };
    const params = { organizationId, data };
    supplyAbilityService(params).then((res) => {
      if (getResponse(res)) {
        notification.success({
          message: intl.get('hzero.common.message.notification').d('操作成功!'),
        });
        this.handleSearch(pagination);
      }
    });
  }

  @Bind()
  async handleImportAnExternalSystem() {
    const { selectedRowKeys = [], selectedRows = [] } = this.state;
    const {
      organizationId,
      resultsQuery: { pagination = {} },
    } = this.props;
    this.setState({
      importAnExternalSystemLoading: true,
    });
    const data = getEditTableData(selectedRows);
    if (!data.length) {
      this.setState({
        importAnExternalSystemLoading: false,
      });
      return;
    }
    const params = { organizationId, data, customizeUnitCode: 'SSRC.RESULTS_QUERY.LIST' };
    const res = getResponse(await saveExecutiveStrategy(params));
    if (res) {
      const result = getResponse(await importAnExternalSystem({ resultIds: selectedRowKeys }));
      if (result) {
        notification.success({
          message: intl.get('hzero.common.message.notification').d('操作成功!'),
        });
      }
      this.handleSearch(pagination);
      this.setState({
        importAnExternalSystemLoading: false,
      });
    } else {
      this.setState({
        importAnExternalSystemLoading: false,
      });
    }
  }

  // 导入价格库
  @Bind()
  async handleImportPriceLibrary() {
    const { selectedRowKeys = [] } = this.state;
    const {
      resultsQuery: { pagination = {} },
    } = this.props;
    this.setState({
      importPriceLibraryLoading: true,
    });
    const result = getResponse(await importPriceLibrary({ resultIds: selectedRowKeys }));
    if (result) {
      notification.success({
        message: intl.get('hzero.common.message.notification').d('操作成功!'),
      });
    }
    this.handleSearch(pagination);
    this.setState({
      importPriceLibraryLoading: false,
    });
  }

  /**
   * [屈臣氏 济民可信 伊戈尔] 重写, 谨慎修改!!!
   * @protected
   */
  getColumn(state) {
    const {
      organizationId,
      remote,
      resultsQuery: { resultsList = [] },
    } = this.props;
    const {
      selectedRowKeys,
      isNewLink,
      selectedRows,
      exportParams,
      importAnExternalSystemLoading,
      importPriceLibraryLoading = false,
    } = state;

    const buttons = [
      {
        name: 'importPriceLibrary',
        btnComp: PopoverButton,
        btnProps: {
          onClick: this.handleImportPriceLibrary,
          loading: importPriceLibraryLoading,
          disabled: !selectedRowKeys?.length,
          icon: 'archive',
          showPopover: true,
          placement: 'top',
          content: intl
            .get(`${promptCode}.model.resultsQuery.importPriceLibrary.tooltip`)
            .d('支持将寻源结果导入价格库，若导入同步成功的寻源结果会将原价格行失效重新同步。'),
        },
        child: intl.get(`${promptCode}.model.resultsQuery.importPriceLibrary`).d('导入价格库'),
      },
      {
        name: 'importAnExternalSystem',
        btnComp: PopoverButton,
        btnProps: {
          onClick: this.handleImportAnExternalSystem,
          loading: importAnExternalSystemLoading,
          disabled: remote
            ? remote?.process(
                'SSRC_RESULT_QUERY_IMPORT_BUTTONS_DISABLED',
                !selectedRowKeys?.length,
                { selectedRows }
              )
            : !selectedRowKeys?.length,
          showPopover: true,
          placement: 'top',
          content: intl
            .get(`${promptCode}.model.resultsQuery.importAnExternalSystem.tooltip`)
            .d('支持将“未导入”“导入失败”的寻源结果导入外部系统'),
        },
        child: (
          <span>
            <C7NIcon
              type="archive"
              style={{ marginRight: '4px', fontSize: '14px', paddingBottom: '2px' }}
            />
            {intl.get(`${promptCode}.model.resultsQuery.importAnExternalSystem`).d('导入外部系统')}
          </span>
        ),
      },
      {
        name: 'createSupplierAvailable',
        btnProps: {
          onClick: this.createSupplierAvailable,
          disabled: !selectedRowKeys?.length,
        },
        child: (
          <>
            {intl
              .get(`${promptCode}.model.resultsQuery.createSupplierAvailable`)
              .d('生成供货能力清单')}
          </>
        ),
      },
      {
        name: 'importBudget',
        btnProps: {
          onClick: this.importBudget,
          disabled: !selectedRowKeys?.length,
        },
        child: <>{intl.get(`${promptCode}.model.resultsQuery.importBudget`).d('导入预算')}</>,
      },
      {
        name: 'priceExport',
        btnComp: ExcelExport,
        btnProps: {
          buttonText: intl.get('hzero.common.button.priceExport').d('批量导出'),
          requestUrl: `/ssrc/v1/${organizationId}/source/result/result-list/export`,
          queryParams: {
            resultIds: selectedRowKeys?.length > 0 ? selectedRowKeys : undefined,
            ...exportParams,
          },
        },
      },
      {
        name: 'newPriceExport',
        btnComp: ExcelExportNew,
        btnProps: {
          templateCode: 'SSRC_SOURCE_RESULT_BATCH_EXPORT',
          buttonText: intl.get('hzero.common.button.priceExportNew').d('(新)批量导出'),
          requestUrl: `/ssrc/v1/${organizationId}/source/result/result-list/export`,
          queryParams: {
            resultIds: selectedRowKeys?.length > 0 ? selectedRowKeys : undefined,
            ...exportParams,
          },
          otherButtonProps: {
            permissionList: [
              {
                code: `${this.props.match.path}.button.exportNew`.toLowerCase(),
                type: 'button',
                meaning: `${
                  intl
                    .get(`${promptCode}.view.message.title.findSourceResultQuery`)
                    .d('寻源结果查询') -
                  intl.get('hzero.common.button.priceExportNew').d('(新)批量导出')
                }`,
              },
            ],
          },
        },
      },
      {
        name: 'save',
        hidden: !isNewLink,
        btnProps: {
          onClick: this.saveExecutiveStrategy,
        },
        child: (
          <>
            <Icon type="save" style={{ marginRight: '4px' }} />
            {intl.get('hzero.common.btn.save').d('保存')}
          </>
        ),
      },
    ].filter(Boolean);
    return remote
      ? remote.process('SSRC_RESULT_QUERY_BUTTONS', buttons, {
          querySupplier: this.querySupplier,
          selectedRows,
          selectedRowKeys,
          setState: this.setState.bind(this),
          that: this,
          handleSave: this.handleSave,
          getEditTableToData,
          resultsList,
        })
      : buttons;
  }

  render() {
    const {
      customizeTable,
      customizeFilterForm,
      customizeBtnGroup,
      fetchLadderLevelLoading,
      resultsQuery: { resultsList = [], pagination = {} },
      inquiryHall: { quotaLadderLevelData = [] },
      remote,
      match,
    } = this.props;
    const {
      viewLadderLevelVisible = false,
      LadderLevelHeaderData = [],
      selectedRowKeys,
      selectedRows,
      isNewLink,
      doubleUnitFlag,
      oldPriceFlag,
      oldSourceFlag,
      tableLoading,
      pageDirective = false,
    } = this.state;
    const { executiveStrategy } = this.code || {};

    if (pageDirective === null) {
      return '';
    }

    const columnsOld = [
      !oldPriceFlag && {
        title: intl
          .get(`${promptCode}.model.resultsQuery.priceSyncStatusMeaning`)
          .d('导入价格库状态'),
        dataIndex: 'priceSyncStatusMeaning',
        width: 120,
      },
      !oldPriceFlag && {
        title: intl
          .get(`${promptCode}.model.resultsQuery.priceSyncFeedbackMeaning`)
          .d('导入失败原因'),
        dataIndex: 'priceSyncFeedback',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.model.resultsQuery.importOutSystermStatusMeaning`)
          .d('导入外部系统状态'),
        dataIndex: 'importErpStatusMeaning',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.model.resultsQuery.importOutSystermFeedback`)
          .d('导入外部系统反馈'),
        dataIndex: 'importErpFeedback',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      isNewLink && {
        title: intl.get(`${promptCode}.model.resultsQuery.executiveStrategy`).d('寻源执行策略'),
        dataIndex: 'resultExecutionStrategy',
        width: 130,
        render: (val, record, index) => {
          if (record.resultExecutionStrategyOptional?.length > 1) {
            const { getFieldDecorator } = record.$form;
            return (
              <FormItem style={{ marginBottom: 0 }}>
                {getFieldDecorator('resultExecutionStrategy', {
                  initialValue: val,
                })(
                  <Select
                    disabled={record?.strategyEditFlag === 0}
                    onChange={(e) => this.changeExecutiveStrategy(e, record, index)}
                  >
                    {executiveStrategy?.map?.((item) => {
                      const { resultExecutionStrategyOptional } = record;
                      return (
                        resultExecutionStrategyOptional.includes(item.value) && (
                          <Select.Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Select.Option>
                        )
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            );
          } else {
            return record.resultExecutionStrategyMeaning;
          }
        },
      },
      {
        title: intl
          .get(`${promptCode}.model.inquiryHall.amountUsageRecordQuery`)
          .d('金额占用记录查询'),
        dataIndex: 'amountUsageRecordQuery',
        width: 120,
        render: (val, record) =>
          record?.needShowBudgetHistory && (
            <BudgetModal
              documentType="SOURCE"
              docLineId={
                record?.budgetMode === 'HEADER' ? record?.sourceHeaderId : record?.resultId
              }
            />
          ),
      },
      oldSourceFlag && {
        title: intl.get(`${promptCode}.model.resultsQuery.syncStatus`).d('导入状态'),
        dataIndex: 'syncStatusMeaning',
        width: 100,
      },
      oldSourceFlag && {
        title: intl.get(`${promptCode}.model.resultsQuery.syncResponseMsg`).d('导入反馈'),
        dataIndex: 'syncResponseMsg',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.inquiryHall.docFlow`).d('单据流'),
        dataIndex: 'docFlow',
        width: 120,
        render: (val, record) => (
          <DocFlow tableName="ssrc_rfx_line_item" tablePk={record.rfxLineItemId} />
        ),
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.purOrganizationCode`).d('采购组织编码'),
        dataIndex: 'purOrganizationCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.purOrganizationName`).d('采购组织名称'),
        dataIndex: 'purOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.categoryName`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 100,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.resultsQuery.uomName`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        title: intl.get(`${promptCode}.model.resultsQuery.itemNum`).d('行号'),
        dataIndex: 'itemNum',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.companyNum`).d('供应商编码'),
        dataIndex: 'companyNum',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.model.resultsQuery.erpSupplierCompanyNum`)
          .d('ERP供应商编码'),
        dataIndex: 'erpSupplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.supplierCompanyName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'taxPrice',
        align: 'right',
        width: 80,
        render: numberSeparatorRender,
      },
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'unitPrice',
        align: 'right',
        width: 80,
        render: numberSeparatorRender,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.resultsQuery.unitPrice`).d('单价'),
            dataIndex: 'taxSecondaryPrice',
            align: 'right',
            width: 80,
            render: numberSeparatorRender,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`${promptCode}.model.resultsQuery.netPrice`).d('单价(不含税)'),
            dataIndex: 'netSecondaryPrice',
            align: 'right',
            width: 80,
            render: numberSeparatorRender,
          }
        : null,
      {
        title: intl.get(`${promptCode}.model.resultsQuery.quotationDetail`).d('报价明细'),
        width: 100,
        dataIndex: 'quotationDetailFlag',
        render: (val, record) => (
          <React.Fragment>
            {
              <QuotationDetail
                rowData={record}
                sourceFrom={record.sourceFrom}
                sourceHeaderId={record.sourceHeaderId}
                allowBuyerViewFlag
                bidFlag={record.secondarySourceCategory === 'NEW_BID'}
              />
            }
          </React.Fragment>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.ladderInquiry`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (val, record) =>
          record.ladderInquiryFlag === 1 ? (
            <a onClick={() => this.viewLadderLevelModal(record)}>
              {intl.get(`${promptCode}.model.offlineEntry.ladderLevel`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.taxCode`).d('税码'),
        dataIndex: 'taxCode',
        width: 60,
      },
      {
        title: <span>{intl.get(`${promptCode}.model.resultsQuery.taxRate`).d('税率')} (%)</span>,
        dataIndex: 'taxRate',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.exchangeRate`).d('汇率'),
        dataIndex: 'rate',
        width: 80,
        render: (val) => numberRender(val, 8, false),
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.validQuotationRemark`).d('报价说明'),
        dataIndex: 'validQuotationRemark',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.quotationType`).d('报价方式'),
        dataIndex: 'quotationTypeMeaning',
        width: 90,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.validPromisedDate`).d('承诺交货期'),
        dataIndex: 'validPromisedDate',
        width: 110,
        render: (val) => {
          return dateRender(val);
        },
      },
      {
        title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl
          .get(`${promptCode}.model.resultsQuery.quotationExpiryDateFrom`)
          .d('报价有效期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 120,
        render: (val) => {
          return dateRender(val);
        },
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.quotationExpiryDateTo`).d('报价有效期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 120,
        render: (val) => {
          return dateRender(val);
        },
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.priceBatchQuantity`).d('价格批量'),
        dataIndex: 'priceBatchQuantity',
        align: 'right',
        width: 90,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.controlProtocolFlag`).d('控制协议数量'),
        dataIndex: 'controlProtocolFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.purchasapplicationNum`).d('采购申请号'),
        dataIndex: 'prNum',
        width: 100,
        render: (val, record) => <a onClick={() => this.linktoPrNumDetail(record)}> {val}</a>,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.purchasappitemNum`).d('采购申请行号'),
        dataIndex: 'prLineNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.executionStates`).d('执行状态'),
        dataIndex: 'receiptsStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.occupationQuantit`).d('占用数量'),
        dataIndex: 'occupationQuantity',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.rfxCreated`).d('询价单创建人'),
        dataIndex: 'rfxCreated',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: (val) => {
          return dateRender(val);
        },
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.finishDate`).d('完成时间'),
        dataIndex: 'finishDate',
        width: 150,
        render: (val) => {
          return dateRender(val);
        },
      },
      {
        title: intl.get(`ssrc.common.model.common.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        dataIndex: 'specs',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.sourceNum`).d('寻源单号'),
        dataIndex: 'sourceNum',
        width: 150,
        fixed: 'right',
        render: (val, record) => <a onClick={() => this.onDetail(record)}>{val}</a>,
      },
      {
        title: intl
          .get(`${promptCode}.model.resultsQuery.budgetImportStatusMeaning`)
          .d('预算导入状态'),
        dataIndex: 'budgetImportStatusMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.resultsQuery.budgetImportFeedback`).d('预算导入反馈'),
        dataIndex: 'budgetImportFeedback',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.model.resultsQuery.synChronizationResultStatus`)
          .d('供货能力清单同步状态'),
        dataIndex: 'supplyImportStatusMeaning',
        width: 180,
      },
      {
        title: intl
          .get(`${promptCode}.model.resultsQuery.synChronizationResults`)
          .d('供货能力清单同步结果'),
        dataIndex: 'supplyImportFeedback',
        width: 180,
      },
    ].filter(Boolean);

    const ColumnsCuxProps = {};
    const columns = remote
      ? remote.process('SSRC_RESULT_QUERY_TABLE_COLUMNS', columnsOld, ColumnsCuxProps)
      : columnsOld;

    const scrollWidth = this.scrollWidth(columns, 0);
    const filterProps = {
      customizeFilterForm,
      code: this.code || {},
      onRef: this.handleRef,
      onConditional: this.handleSearch,
    };

    // // 阶梯报价props
    // const ladderLevelModalProps = {
    //   viewLadderLevel: this.viewLadderLevelModal,
    //   hideModal: this.hideLadderLevelModal,
    //   visible: viewLadderLevelVisible,
    //   ladderLevelData,
    //   LadderLevelHeaderData,
    //   fetchLadderLevelLoading,
    // };

    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal: this.hideLadderLevelModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelLoading,
      doubleUnitFlag,
    };

    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      columnWidth: 50,
      onChange: this.onSelectChange,
    };

    const newSourceResultPoolProps = {
      match,
      onDetail: this.onDetail,
      linktoPrNumDetail: this.linktoPrNumDetail,
      viewLadderLevelModal: this.viewLadderLevelModal,
      oldPriceFlag,
      isNewLink,
      oldSourceFlag,
      doubleUnitFlag,
      onRef: this.setSourceResultPoolRef,
      ladderLevelModalProps,
    };

    return !pageDirective ? (
      <React.Fragment>
        <Header
          title={intl
            .get(`${promptCode}.view.message.title.findSourceResultQuery`)
            .d('寻源结果查询')}
        >
          {customizeBtnGroup(
            { code: 'SSRC.RESULTS_QUERY.HEADER_FORM', pro: true },
            <DynamicButtons buttons={this.getColumn(this.state)} />
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            {
              code: 'SSRC.RESULTS_QUERY.LIST',
            },
            <EditTable
              scroll={{ x: scrollWidth, y: '450px' }}
              dataSource={resultsList}
              pagination={pagination}
              rowKey="resultId"
              loading={tableLoading}
              columns={columns}
              bordered
              rowSelection={rowSelection}
              onChange={(page) => this.handleSearch(page, true)}
            />
          )}
        </Content>
        {/* {viewLadderLevelVisible && <LadderLevelModal {...ladderLevelModalProps} />} */}
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
      </React.Fragment>
    ) : (
      <SourceResultPool {...newSourceResultPoolProps} />
    );
  }
}

const hocComponent = (com) =>
  compose(
    withCustomize({
      unitCode: [
        'SSRC.RESULTS_QUERY.LIST',
        'SSRC.RESULTS_QUERY.FILTER', // 寻源结果查询
        'SSRC.RESULTS_QUERY.HEADER_FORM',
        'component.docFlow',
      ],
    }),
    connect(({ inquiryHall, resultsQuery, loading }) => ({
      inquiryHall,
      resultsQuery,
      Loading: loading.effects['resultsQuery/fetchEntranceList'],
      fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
      fetchLadderLevelLoading: loading.effects['inquiryHall/fetchLadderLevelTable'],
      organizationId: getCurrentOrganizationId(),
    })),
    formatterCollections({
      code: [
        'ssrc.resultsQuery',
        'ssrc.common',
        'hzero.common',
        'ssrc.inquiryHall',
        'scux.ssrc',
        'sscux.common',
      ],
    }),
    Form.create({ fieldNameProp: null }),
    remoteHoc(
      {
        code: 'SSRC_RESULT_QUERY',
      },
      {
        events: {
          // 设置路由参数
          setRouterParams() {},

          // 更新路由参数
          updateRouterParams() {},

          // 翻页保存
          changePageSave() {},

          remoteHandleMount() {},
        },
      }
    )
  )(observer(com));

export default hocComponent(ResultsQuery);
export { ResultsQuery, hocComponent };
