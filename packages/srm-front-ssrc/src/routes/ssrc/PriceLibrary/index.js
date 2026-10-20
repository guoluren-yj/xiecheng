/**
 * PriceLibrary - 价格库管理/价格库
 * @date: 2019-10-23
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { isUndefined, isEmpty } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { routerRedux } from 'dva/router';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { openTab } from 'utils/menuTab';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import { DEFAULT_DATETIME_FORMAT, DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import { filterNullValueObject, getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import { SRM_SPC } from '_utils/config';
import { dateFormate } from '@/utils/utils';

import common from '@/routes/ssrc/common.less';
import Iconfont from '../components/Icons';
import FilterForm from './FilterForm';
import TableList from './TableList';
import HistoryPriceModal from './HistoryPriceModal';
import HisPriceAnalysisModal from './HisPriceAnalysisModal';

@formatterCollections({ code: ['ssrc.priceLibrary', 'ssrc.common', 'ssrc.inquiryHall'] })
@withCustomize({
  unitCode: ['SSRC.PRICE_LIBRARY.LIST'],
})
@connect(({ priceLibrary, searchResultImport, loading }) => ({
  priceLibrary,
  searchResultImport,
  fetchPriceLibListLoading: loading.effects['priceLibrary/fetchPriceLibList'],
  fetchHistoryPriceDetailLoading: loading.effects['priceLibrary/fetchHistoryPriceDetail'],
  fetchPriceAnalysisLoading: loading.effects['priceLibrary/fetchPriceAnalysis'],
  fetchHisSimilarItemLoading: loading.effects['priceLibrary/fetchHisSimilarItem'],
  importErpLoading: loading.effects['priceLibrary/importToErp'],
  organizationId: getCurrentOrganizationId(),
}))
export default class PriceLibrary extends Component {
  form;

  /**
   * state初始化
   */
  state = {
    historyModelVisible: false, // 历史报价模态框
    historyPriceLineInfo: {}, // 历史报价行信息
    selectedRows: [], // 选中行信息
    selectedRowKeys: [], // 选中行信息key
    hisPriceAnalysisModalVisible: false, // 历史价格分析模态框
    dateFlag: 'allTime', // 历史价格分析(全部时间/近一年/近三个月)活跃标志
    activeSupplierId: undefined, // 点击供应商行标记
    activeItemId: undefined, // itemId
    activeSourceHeaderId: undefined, // sourceHeaderId
    activeItemNum: undefined, // itemNum
    priceLibraryId: undefined, // priceLibraryId
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      dispatch,
      priceLibrary: { priceLibPagination = {} },
    } = this.props;
    this.handleSearch(priceLibPagination);
    const lovCodes = {
      priceLibStatus: 'SSRC.PRICE_LIB_STATUS', // 价格库状态
      priceSource: 'SSRC.PRICE_SOURCE', // 价格来源
    };
    dispatch({
      type: 'priceLibrary/batchCode',
      payload: { lovCodes },
    });
    // 查询配置中心
    dispatch({
      type: 'priceLibrary/querySetting',
      payload: {
        '011103': '011103', // 手工创建
      },
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, organizationId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const values = {
      ...fieldValues,
      quotationExpiryDateFrom: dateFormate(fieldValues.quotationExpiryDateFrom, DATETIME_MIN),
      quotationExpiryDateTo: dateFormate(fieldValues.quotationExpiryDateTo, DATETIME_MAX),
    };
    dispatch({
      type: 'priceLibrary/fetchPriceLibList',
      payload: {
        page,
        ...values,
        organizationId,
        customizeUnitCode: 'SSRC.PRICE_LIBRARY.LIST',
      },
    }).then(() => {
      if (JSON.stringify(page) === '{}') {
        this.setState({
          selectedRows: [],
          selectedRowKeys: [],
        });
      }
    });
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 设置历史价格Form
   * @param {object} ref - HistoryPriceModal组件引用
   */
  @Bind()
  handleOnRef(ref = {}) {
    this.historyForm = (ref.props || {}).form;
  }

  /**
   * 历史价格
   */
  @Bind()
  goHistoryPriceDetail(record) {
    const { dispatch, organizationId } = this.props;
    this.setState({
      historyModelVisible: true,
      historyPriceLineInfo: record,
    });
    // 查询历史价格数据
    dispatch({
      type: 'priceLibrary/fetchHistoryPriceDetail',
      payload: {
        priceLibraryId: record.priceLibraryId,
        organizationId,
      },
    });
  }

  // 价格库 - 导入
  @Bind()
  handleBatchExport() {
    const {
      organizationId,
      // priceLibrary: { priceLibList = [] },
    } = this.props;
    // const flag = priceLibList && priceLibList[0] && priceLibList[0].detailUserId;
    // if (flag) {
    const detailUserId = getCurrentUserId();
    openTab({
      key: '/ssrc/price-library/comment-import/SSRC.PRICE_IMPORT',
      search: querystring.stringify({
        key: '/ssrc/price-library/comment-import/SSRC.PRICE_IMPORT',
        title: 'hzero.common.title.batchImport',
        action: intl.get('hzero.common.title.priceImport').d('价格导入'),
        auto: true,
        backPath: `/ssrc/price-library/list`,
        routerPath: '/ssrc/price-library/lib-update',
        args: JSON.stringify({
          tenantId: organizationId,
          detailUserId,
        }),
      }),
    });
    // } else {
    //   notification.warning({
    //     message: intl
    //       .get(`ssrc.priceLibrary.view.message.creatAndUpdateManually`)
    //       .d('价格库请先手工维护一条数据'),
    //   });
    // }
  }

  /**
   * 价格 - 导出
   */

  @Bind()
  handleGetFormValue() {
    const { selectedRowKeys = [] } = this.state;
    const filterForm = this.form;
    const object = isUndefined(filterForm)
      ? {}
      : filterNullValueObject(filterForm && filterForm.getFieldsValue());
    let params = {};
    // eslint-disable-next-line guard-for-in
    for (const key in object) {
      params = {
        ...params,
        [key]: object[key]?.trim ? object[key].trim() : object[key],
      };
    }
    return selectedRowKeys?.length
      ? {
          priceLibraryIds: selectedRowKeys,
        }
      : {
          ...params,
          quotationExpiryDateFrom: dateFormate(params.quotationExpiryDateFrom, DATETIME_MIN),
          quotationExpiryDateTo: dateFormate(params.quotationExpiryDateTo, DATETIME_MAX),
        };
  }

  /**
   * 跳转到寻源明细页面
   */
  @Bind()
  inquiryDetail(record = {}) {
    const { dispatch } = this.props;
    const { sourceHeaderId = null, sourceFrom = 'RFX' } = record;
    let pathname = `/ssrc/query-rfq/rfx-detail/${sourceHeaderId}`;
    const search = querystring.stringify({
      libFlag: 'priceLib', // 页面跳转标识，backpath标识
    });

    if (sourceFrom === 'BID') {
      pathname = `/ssrc/inquiry-bid-query/bid-update/${sourceHeaderId}`;
    }

    dispatch(
      routerRedux.push({
        pathname,
        search,
      })
    );
  }

  /**
   * 跳转到合同明细页面
   */
  @Bind()
  contractDetail(record) {
    const { dispatch } = this.props;
    const { contractId } = record;
    const pcHeaderId = contractId;
    const libFlag = 'priceLib';
    dispatch(
      routerRedux.push({
        pathname: `${SRM_SPC}m/purchase-contract-view/detail`,
        search: pcHeaderId
          ? querystring.stringify({ pcHeaderId, libFlag })
          : querystring.stringify({}),
      })
    );
  }

  /**
   * 跳转到订单明细页面
   */
  @Bind()
  orderDetail(record) {
    const { dispatch } = this.props;
    const search = querystring.stringify({
      libFlag: 'priceLib', // 页面跳转标识，backpath标识
    });
    dispatch(
      routerRedux.push({
        pathname: `/sodr/order-release/detail/${record.orderId}`,
        search,
      })
    );
  }

  /**
   * 历史报价测弹框-寻源单号跳转到寻源事件查询明细页面
   */
  @Bind()
  goInquDetail(record) {
    const { dispatch } = this.props;
    this.setState({
      historyModelVisible: false,
    });
    const search = querystring.stringify({
      libFlag: 'priceLib', // 页面跳转标识，backpath标识
    });
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/query-rfq/rfx-detail/${record.sourceHeaderId}`,
        search,
      })
    );
  }

  /**
   * 历史报价测弹框-订单编号跳转到订单发布明细页面
   */
  @Bind()
  goOrdDetail(record) {
    const { dispatch } = this.props;
    this.setState({
      historyModelVisible: false,
    });
    const search = querystring.stringify({
      libFlag: 'priceLib', // 页面跳转标识，backpath标识
    });
    dispatch(
      routerRedux.push({
        pathname: `/sodr/order-release/detail/${record.orderId}`,
        search,
      })
    );
  }

  /**
   * 历史报价测弹框-合同编号跳转到我发起的协议明细页面
   */
  @Bind()
  goContDetail(record) {
    const { dispatch } = this.props;
    const { contractId } = record;
    const pcHeaderId = contractId;
    const libFlag = 'priceLib';
    this.setState({
      historyModelVisible: false,
    });
    dispatch(
      routerRedux.push({
        pathname: `${SRM_SPC}m/purchase-contract-view/detail`,
        search: pcHeaderId
          ? querystring.stringify({ pcHeaderId, libFlag })
          : querystring.stringify({}),
      })
    );
  }

  /**
   * 过滤值级，不要新建状态
   * @param {Object} data
   */
  @Bind()
  filterCode(data = []) {
    const dataValue = data.filter((item) => {
      return item.value === 'VALID' || item.value === 'EXPIRE';
    });
    return dataValue;
  }

  @Bind()
  fetchHistoryPriceDetail(page = {}) {
    const { dispatch, organizationId } = this.props;
    const { historyPriceLineInfo = {} } = this.state;
    const fieldValues = isUndefined(this.historyForm)
      ? {}
      : filterNullValueObject(this.historyForm.getFieldsValue());
    dispatch({
      type: 'priceLibrary/fetchHistoryPriceDetail',
      payload: {
        priceLibraryId: historyPriceLineInfo.priceLibraryId,
        organizationId,
        page,
        ...fieldValues,
        creationDateFrom: dateFormate(fieldValues.creationDateFrom, DEFAULT_DATETIME_FORMAT),
        creationDateTo: dateFormate(fieldValues.creationDateTo, DEFAULT_DATETIME_FORMAT),
      },
    });
  }

  /**
   * 隐藏历史价格模态框
   */
  @Bind()
  handleCancelHistoryPrice() {
    this.props.dispatch({
      type: 'priceLibrary/updateState',
      payload: {
        historyPriceList: [], // 历史价格数据列表
        historyPricePagination: {}, // 历史价格分页器
      },
    });
    this.setState({
      historyModelVisible: false,
    });
  }

  @Bind()
  priceLibCreate() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) {
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/price-library/lib-update`,
        })
      );
    } else {
      const search = querystring.stringify({
        ids: selectedRowKeys,
      });
      dispatch(
        routerRedux.push({
          pathname: `/ssrc/price-library/lib-update`,
          search,
        })
      );
      this.setState({ selectedRows: [], selectedRowKeys: [] });
    }
  }

  /**
   * 获取历史报价分析
   */
  @Bind()
  handleHisPriceAnalysisOnRef(ref = {}) {
    this.hisPriceAnalysisOnRef = ref;
  }

  /**
   * 打开历史价格分析模态框
   */
  @Bind()
  hisPriceAnalysis() {
    const { selectedRowKeys = [], selectedRows = [] } = this.state;
    if (selectedRowKeys.length <= 1) {
      if (isEmpty(selectedRowKeys)) {
        this.setState({
          hisPriceAnalysisModalVisible: true,
        });
        this.handleHisPriceAnalysisSearch();
        this.handleHisSimilarItemSearch();
      } else {
        const {
          priceLibraryId = undefined,
          supplierCompanyId = undefined,
          itemId = undefined,
          sourceHeaderId = undefined,
          itemNum = undefined,
        } = selectedRows[0];
        this.setState({
          hisPriceAnalysisModalVisible: true,
          activeItemId: itemId,
          activeSourceHeaderId: sourceHeaderId,
          activeItemNum: itemNum,
          activeSupplierId: supplierCompanyId,
          activePriceLibraryId: priceLibraryId,
        });
        this.handleHisPriceAnalysisSearch({ sourceHeaderId, supplierCompanyId, itemNum, itemId });
        this.handleHisSimilarItemSearch({ priceLibraryId });
      }
    } else {
      notification.warning({
        message: intl
          .get(`ssrc.priceLibrary.model.library.onlyChioceOneData`)
          .d('仅可选择一条数据查看！'),
      });
    }
  }

  /**
   * 查询历史价格分析列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleHisPriceAnalysisSearch(params = {}) {
    const { dispatch, organizationId } = this.props;
    const {
      dateFlag = 'allTime',
      activeItemId = undefined,
      activeSupplierId = undefined,
      activeSourceHeaderId = undefined,
      activeItemNum = undefined,
    } = this.state;
    dispatch({
      type: 'priceLibrary/fetchPriceAnalysis',
      payload: {
        organizationId,
        dateFlag,
        itemId: activeItemId,
        sourceHeaderId: activeSourceHeaderId,
        itemNum: activeItemNum,
        supplierCompanyId: activeSupplierId,
        ...params,
      },
    }).then((res) => {
      if (res) {
        this.setHisPriceAnalysisDate(res);
      }
    });
  }

  /**
   * 查询历史价格分析-相似物品最低一览表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleHisSimilarItemSearch(params = {}, page = {}) {
    const { dispatch, organizationId } = this.props;
    const { activePriceLibraryId = undefined } = this.state;
    dispatch({
      type: 'priceLibrary/fetchHisSimilarItem',
      payload: {
        page,
        organizationId,
        priceLibraryId: activePriceLibraryId,
        ...params,
      },
    });
  }

  /**
   * hidePriceAnalysis - 关闭比价助手弹窗
   */
  @Bind()
  hidePriceAnalysis() {
    this.setState({
      hisPriceAnalysisModalVisible: false,
      dateFlag: 'allTime',
      activeItemId: undefined,
      activeSupplierId: undefined,
      activeSourceHeaderId: undefined,
      activeItemNum: undefined,
    });
    this.props.dispatch({
      type: 'priceLibrary/updateState',
      payload: {
        quotationPriceLine: [],
      },
    });
  }

  /**
   * 选择物品回调
   */
  @Bind()
  handleSelectItemOk(value, record) {
    const {
      priceLibraryId = undefined,
      itemId = undefined,
      sourceHeaderId = undefined,
      itemNum = undefined,
    } = record;
    this.setState({
      activeItemId: itemId,
      activeSourceHeaderId: sourceHeaderId,
      activeItemNum: itemNum,
      activePriceLibraryId: priceLibraryId,
    });
    this.handleHisSimilarItemSearch({ priceLibraryId });
    this.handleHisPriceAnalysisSearch({ itemId, sourceHeaderId, itemNum });
  }

  /**
   * 选择供应商回调
   */
  @Bind()
  handleSelectSupplierOk(supplierCompanyId = undefined) {
    this.setState({ activeSupplierId: undefined });
    this.handleHisPriceAnalysisSearch({ supplierCompanyId });
  }

  /**
   * 查询时间-历史价格分析列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleTimeSearch(dateFlag) {
    this.handleHisPriceAnalysisSearch({ dateFlag });
    this.setState({
      dateFlag,
    });
  }

  /**
   * 历史价格分析数据源处理
   */
  @Bind()
  setHisPriceAnalysisDate(data) {
    this.hisPriceAnalysisOnRef.setState({
      finallyPriceArry: data,
    });
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 导入ERP，跳转到价格信息导入页面
   */
  @Bind()
  importErp() {
    const { selectedRowKeys } = this.state;
    const { dispatch, organizationId } = this.props;
    if (selectedRowKeys.length > 0) {
      dispatch({
        type: 'priceLibrary/importToErp',
        payload: { organizationId, selectedRowKeys },
      }).then((res) => {
        if (res.code === 'EBS' || res.code === 'SAP') {
          if (res.message) {
            notification.warning({
              message: res.message,
            });
          } else {
            notification.warning({
              message: intl
                .get(`ssrc.priceLibrary.view.message.importFail`)
                .d('导入失败，请补充信息后再次导入'),
            });
          }
          dispatch({
            type: 'searchResultImport/updateState',
            payload: { gotoFlag: true },
          });
          this.props.history.push({
            pathname: `/ssrc/search-result-import/list`,
            search: querystring.stringify({ activeKey: res.code }),
          });
        } else if (res.code === 'SUCCESS') {
          notification.success({
            message: intl.get(`ssrc.priceLibrary.view.message.successImport`).d('导入成功'),
          });
        } else {
          notification.warning({
            message: res.message,
          });
        }
      });
    } else {
      notification.warning({
        message: intl
          .get(`ssrc.priceLibrary.model.library.pleaseSelectRows`)
          .d('请选择一条或者多条数据后再执行导入操作！'),
      });
    }
  }

  render() {
    const {
      importErpLoading,
      fetchPriceLibListLoading,
      fetchHistoryPriceDetailLoading,
      fetchPriceAnalysisLoading,
      fetchHisSimilarItemLoading,
      customizeTable,
      priceLibrary: {
        priceLibList = [],
        priceLibPagination = {},
        historyPriceList = [],
        historyPricePagination = {},
        code: { priceLibStatus = [], priceSource = [] },
        settings = {},
        hisSimilarItemData = [],
        hisSimilarItemPagination = {},
      },
      organizationId,
    } = this.props;
    const setting011103 = !!+(settings['011103'] && settings['011103'].settingValue);
    const {
      historyModelVisible,
      historyPriceLineInfo = {},
      selectedRows,
      selectedRowKeys,
      dateFlag,
      hisPriceAnalysisModalVisible,
    } = this.state;
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.onSelectChange,
      // getCheckboxProps: record => ({
      //   disabled: record && !setting011103,
      // }),
    };
    const formProps = {
      priceLibStatus: this.filterCode(priceLibStatus),
      priceSource,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      rowSelection,
      dataSource: priceLibList,
      pagination: priceLibPagination,
      loading: fetchPriceLibListLoading,
      onChange: this.handleSearch,
      onHistoryPriceDetail: this.goHistoryPriceDetail,
      onInquiryDetail: this.inquiryDetail,
      onContractDetail: this.contractDetail,
      onOrderDetail: this.orderDetail,
      customizeTable,
    };
    // 历史报价
    const historyPriceProps = {
      organizationId,
      priceSource,
      historyPriceLineInfo,
      loading: fetchHistoryPriceDetailLoading,
      visible: historyModelVisible,
      onRef: this.handleOnRef,
      onCancel: this.handleCancelHistoryPrice,
      dataSource: historyPriceList,
      pagination: historyPricePagination,
      onSearch: this.fetchHistoryPriceDetail,
      onInquiryDetail: this.goInquDetail,
      onContractDetail: this.goContDetail,
      onOrderDetail: this.goOrdDetail,
    };

    // 历史价格分析
    const hisPriceAnalysisProps = {
      dateFlag,
      organizationId,
      selectedRows,
      hideModal: this.hidePriceAnalysis,
      visible: hisPriceAnalysisModalVisible,
      loading: fetchPriceAnalysisLoading,
      fetchHisSimilarItemLoading,
      onRef: this.handleHisPriceAnalysisOnRef,
      hisSimilarItemData,
      hisSimilarItemPagination,
      onChangeSimilarItem: this.handleHisSimilarItemSearch,
      onSelectItemOk: this.handleSelectItemOk,
      onSelectSupplierOk: this.handleSelectSupplierOk,
      onClickTimeBtn: this.handleTimeSearch,
    };

    return (
      <React.Fragment>
        <Header title={intl.get(`ssrc.priceLibrary.view.message.title.priceLibrary`).d('价格库')}>
          {setting011103 && (
            <React.Fragment>
              <Button icon="check" type="primary" onClick={() => this.priceLibCreate()}>
                {intl
                  .get(`ssrc.priceLibrary.view.message.button.creatAndUpdateManually`)
                  .d('手工创建&更新')}
              </Button>
              <Button icon="import" onClick={() => this.handleBatchExport()}>
                <Iconfont type="main-import" size={16} className={common['btn-icon']} />
                {intl.get('hzero.common.button.priceImport').d('批量创建')}
              </Button>
            </React.Fragment>
          )}
          <Button
            style={{ marginLeft: 8 }}
            onClick={this.importErp}
            icon="download"
            loading={importErpLoading}
          >
            {intl.get('ssrc.priceLibrary.view.message.button.importErp').d('导入ERP')}
          </Button>
          <ExcelExportPro
            allBody
            requestUrl={`/ssrc/v1/${organizationId}/price-lib/excel/output`}
            queryParams={this.handleGetFormValue()}
            buttonText={intl.get('hzero.common.button.priceExport').d('批量导出')}
            method="POST"
          />
          <Button icon="line-chart" onClick={this.hisPriceAnalysis}>
            {intl
              .get(`ssrc.priceLibrary.view.message.button.historyPriceAnalysis`)
              .d('历史价格分析')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          <TableList {...tableProps} />
        </Content>
        {historyModelVisible && <HistoryPriceModal {...historyPriceProps} />}
        {hisPriceAnalysisModalVisible && <HisPriceAnalysisModal {...hisPriceAnalysisProps} />}
      </React.Fragment>
    );
  }
}
