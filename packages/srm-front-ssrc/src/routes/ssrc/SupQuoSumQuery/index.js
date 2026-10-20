/**
 * SupQuoSumQuery - 寻源结果管理/供应商报价汇总查询
 * @date: 2019-12-17
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isUndefined, isEmpty, isNil } from 'lodash';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import remoteHoc from 'hzero-front/lib/utils/remote';
import { SRM_SSRC } from '_utils/config';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import SupQuoSumQueryC7N from '@/routes/ssrc/SupQuoSumQuery/SupQuoSumQueryC7N/';

import { asyncPageFetchList, isText } from '@/utils/utils';

import { queryEnableDoubleUnit, queryH0OrC7N } from '@/services/commonService';

import FilterForm from './FilterForm';
import TableList from './TableList';
import LadderLevelModal from './LadderLevelModal';

class SupQuoSumQuery extends Component {
  form;

  /**
   * state初始化
   */
  state = {
    selectedRows: [], // 选中行信息
    selectedRowKeys: [], // 选中行信息key
    ladderVisible: false, // 是否显示阶梯报价
    ladderListHeaderInfo: {}, // 阶梯报价头信息
    doubleUnitFlag: false, // 双精度标志
    loading: false,
    newPage: null, // 使用新页面
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.initPage();
  }

  initPage = async () => {
    const {
      dispatch,
      supQuoSumQuery: { sumQueryPagination = {} },
    } = this.props;

    await this.fetchH0OrC7N();

    this.handleSearch(sumQueryPagination);
    const lovCodes = {
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      sourceCategory: 'SSRC.SECONDARY_SOURCE_CATEGORY', // 寻源类型
      quotationType: 'SSRC.QUOTATION_TYPE', // 报价方式
    };
    dispatch({
      type: 'supQuoSumQuery/batchCode',
      payload: { lovCodes },
    });
    this.queryDoubleUnit();
  };

  // 寻源功能控制黑白名单
  fetchH0OrC7N = async () => {
    const res = await queryH0OrC7N();

    if (!isEmpty(res)) {
      let newPriceDetail = 1;

      res.forEach((item) => {
        const { function: code } = item || {};

        if (code === 'SUPPLIER_SUMMARY_PAGE_BLACK_LIST') {
          newPriceDetail = 0;
        }
      });

      this.setState({
        newPage: newPriceDetail,
      });
    } else {
      this.setState({
        newPage: 1, // 不在配置表用新页面
      });
    }
  };

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
      supQuoSumQuery: { oldTotalElements },
    } = this.props;
    const { newPage } = this.state;

    if (newPage === 1) {
      return;
    }

    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const commonPayload = {
      page,
      organizationId,
      ...fieldValues,
      finishDateFrom: fieldValues.finishDateFrom
        ? fieldValues.finishDateFrom.format(DATETIME_MIN)
        : undefined,
      finishDateTo: fieldValues.finishDateTo
        ? fieldValues.finishDateTo.format(DATETIME_MAX)
        : undefined,
      customizeUnitCode:
        'SSRC.SUPPLIER_QUOTATION_COLLECT.QUERY,SSRC.SUPPLIER_QUOTATION_COLLECT.FILTER',
    };

    const fetchSumQueryList = (payload) => {
      return dispatch({
        type: 'supQuoSumQuery/fetchSumQueryList',
        payload,
      });
    };
    // 异步分页
    await asyncPageFetchList({
      pageChangeFlag,
      commonPayload,
      oldTotalElements,
      fetchDataList: fetchSumQueryList,
    });
  }

  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
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

  toggleLoading = (loading = false) => {
    this.setState({
      loading,
    });
  };

  /**
   * 供应商报价汇总查询-导出
   * @protected 【远东电缆】二开，禁止修改、删除此方法名
   */
  @Throttle(2000)
  @Bind()
  sumQueryExport() {
    const { dispatch, organizationId } = this.props;
    const { selectedRowKeys } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    this.toggleLoading(true);
    dispatch({
      type: 'supQuoSumQuery/sumQueryExport',
      payload: {
        querys: {
          customizeUnitCode:
            'SSRC.SUPPLIER_QUOTATION_COLLECT.QUERY,SSRC.SUPPLIER_QUOTATION_COLLECT.FILTER',
        },
        organizationId,
        quotationLineIds: selectedRowKeys,
        ...fieldValues,
        finishDateFrom: fieldValues.finishDateFrom
          ? fieldValues.finishDateFrom.format(DATETIME_MIN)
          : undefined,
        finishDateTo: fieldValues.finishDateTo
          ? fieldValues.finishDateTo.format(DATETIME_MAX)
          : undefined,
        // customizeUnitCode:
        //   'SSRC.SUPPLIER_QUOTATION_COLLECT.QUERY,SSRC.SUPPLIER_QUOTATION_COLLECT.FILTER',
      },
    }).then((url) => {
      this.toggleLoading(false);
      if (url) {
        // fetch(url)
        //   .then((res) => res.blob()) // 创建文件流
        //   .then((data) => {
        //     const blobUrl = window.URL.createObjectURL(data); // 通过原生方法createObjectURL创建文件流的资源路径
        //     const a = document.createElement('a');
        //     a.download = decodeURIComponent(
        //       `${intl
        //         .get('ssrc.supQuoSumQuery.model.supQuoSumQuery.suQSumQueryExport')
        //         .d('供应商报价汇总查询导出')}.xls`
        //     );
        //     a.href = blobUrl;
        //     a.click();
        //   });

        // const a = document.createElement('a');
        // a.href = url;
        // a.click();
        this.onSelectChange();
      }
    });
  }

  @Bind()
  onSelectChange(selectedRowKeys = [], selectedRows = []) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 点击当前阶梯报价，触发查询, 打开阶梯报价模态框
   * @param {Object} record -openLadder
   */
  @Bind()
  openLadder(record) {
    this.setState({ ladderVisible: true });
    const { dispatch } = this.props;
    dispatch({
      type: 'supQuoSumQuery/fetchLadderList',
      payload: {
        quotationLineId: record.quotationLineId,
      },
    });
    this.setState({
      ladderListHeaderInfo: record,
    });
  }

  /**
   *  关闭阶梯报价模态框
   * @param {Object} record -hideLadder
   */
  @Bind()
  hideLadderRecord() {
    this.setState({ ladderVisible: false, ladderListHeaderInfo: {} });
  }

  /**
   *  头部按钮组
   * @protected 【艾为电子】二开，禁止修改、删除此方法名
   */
  renderHeaderButtons() {
    const { selectedRowKeys = [], loading = false } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());

    return [
      <Button
        name="export"
        icon="export"
        type="primary"
        onClick={() => this.sumQueryExport()}
        loading={loading}
      >
        {intl.get(`hzero.common.button.export`).d('导出')}
      </Button>,
      <ExcelExportPro
        name="exportNew"
        templateCode="SRM_C_SRM_SSRC_RFX_QUOTATION_SUMMARY_EXPORT"
        queryParams={{
          quotationLineIds: selectedRowKeys,
          ...fieldValues,
          finishDateFrom: fieldValues.finishDateFrom
            ? fieldValues.finishDateFrom.format(DATETIME_MIN)
            : undefined,
          finishDateTo: fieldValues.finishDateTo
            ? fieldValues.finishDateTo.format(DATETIME_MAX)
            : undefined,
          customizeUnitCode:
            'SSRC.SUPPLIER_QUOTATION_COLLECT.QUERY,SSRC.SUPPLIER_QUOTATION_COLLECT.FILTER',
        }}
        buttonText={intl.get('hzero.common.export').d('导出')}
        requestUrl={`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rfx/quotation/summary/export-new`}
        otherButtonProps={{
          icon: 'unarchive',
          type: 'c7n-pro',
          loading,
          permissionList: [
            {
              code: 'ssrc.supplier-quotation-summary-query.list.exportnew'.toLowerCase(),
              type: 'button',
              meaning: `${
                intl
                  .get(`ssrc.supQuoSumQuery.view.message.title.supQuoSumQuery`)
                  .d('供应商报价汇总查询') - intl.get(`ssrc.common.button.exportNew`).d('导出(新)')
              }`,
            },
          ],
        }}
      />,
    ];
  }

  render() {
    const {
      customizeFilterForm,
      fetchSumQueryListLoading,
      fetchLadderListLoading,
      supQuoSumQuery: {
        sumQueryList = [],
        sumQueryPagination = {},
        code: { sourceMethod = [], sourceCategory = [], quotationType = [] },
        LadderDataList = [],
      },
      customizeTable = () => {},
      customizeBtnGroup = () => {},
      dispatch,
      remote,
    } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      ladderVisible,
      ladderListHeaderInfo = {},
      doubleUnitFlag,
      newPage = null,
    } = this.state;
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const formProps = {
      customizeFilterForm,
      sourceMethod,
      sourceCategory,
      quotationType,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      rowSelection,
      customizeTable,
      dataSource: sumQueryList,
      pagination: sumQueryPagination,
      loading: fetchSumQueryListLoading,
      onChange: this.handleSearch,
      showQuotationDetail: this.showQuotationDetail,
      viewLadderLevel: this.openLadder,
      dispatch,
      doubleUnitFlag,
      remote,
    };

    // 阶梯报价
    const ladderRecordProps = {
      ladderListHeaderInfo,
      fetchLadderListLoading,
      visible: ladderVisible,
      hideModal: this.hideLadderRecord,
      ladderLevelData: LadderDataList,
      doubleUnitFlag,
    };

    if (isNil(newPage)) {
      return '';
    }

    if (newPage === 1) {
      return <SupQuoSumQueryC7N {...this.props} />;
    }

    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`ssrc.supQuoSumQuery.view.message.title.supQuoSumQuery`)
            .d('供应商报价汇总查询')}
        >
          {customizeBtnGroup(
            { code: 'SSRC.SUPPLIER_QUOTATION_COLLECT.HEAD_BUTTONS' },
            this.renderHeaderButtons()
          )}
        </Header>
        <Content>
          <div>
            <div className="table-list-search">
              <FilterForm {...formProps} />
            </div>
            <TableList {...tableProps} />
          </div>
        </Content>
        {ladderVisible && <LadderLevelModal {...ladderRecordProps} />}
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) => {
  return withCustomize({
    unitCode: [
      'SSRC.SUPPLIER_QUOTATION_COLLECT.QUERY',
      'SSRC.SUPPLIER_QUOTATION_COLLECT.FILTER', // 汇总结果查询
      'SSRC.SUPPLIER_QUOTATION_COLLECT.HEAD_BUTTONS', // 汇总头按钮
    ],
  })(
    connect(({ supQuoSumQuery, loading }) => ({
      supQuoSumQuery,
      fetchSumQueryListLoading: loading.effects['supQuoSumQuery/fetchSumQueryList'],
      fetchHistoryPriceDetailLoading: loading.effects['supQuoSumQuery/fetchHistoryPriceDetail'],
      fetchLadderListLoading: loading.effects['supQuoSumQuery/fetchLadderList'],
      organizationId: getCurrentOrganizationId(),
    }))(
      formatterCollections({
        code: ['ssrc.supQuoSumQuery', 'ssrc.common', 'ssrc.inquiryHall', 'ssrc.scux'],
      })(
        remoteHoc({
          code: 'SSRC_SUPPLIER_QUOTATION_SUMMARY_QUERY',
        })(Comp)
      )
    )
  );
};

export { HOCComponent, SupQuoSumQuery };
export default HOCComponent(SupQuoSumQuery);
