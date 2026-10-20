/**
 * SupQuoSumQuery - 寻源结果管理/供应商报价汇总查询
 * @date: 2019-12-17
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
// import { Button } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { compose, isEmpty, isArray } from 'lodash';
import { DataSet, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import remote from 'hzero-front/lib/utils/remote';
import querystring from 'querystring';

import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';
import { isText, getTableFixSelfAdaptStyle } from '@/utils/utils';
import { SRM_SSRC } from '_utils/config';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { getCategoryCode } from '@/utils/globalVariable';

import { numberSeparatorRender, roundEliminate } from '@/utils/renderer';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import LadderLevelModal from '@/routes/ssrc/SupQuoSumQuery/LadderLevelModal';

import { TableDS } from './tableDataSet';

class SupQuoSumQuery extends Component {
  constructor(props) {
    super(props);

    this.searchBarRef = null;

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      ladderVisible: false, // 是否显示阶梯报价
      ladderListHeaderInfo: {}, // 阶梯报价头信息
      doubleUnitFlag: false, // 双精度标志
      loading: false,
    };
  }

  componentDidMount() {
    this.queryDoubleUnit();

    // this.initPage();
  }

  initPage = () => {
    this.handleSearch();
  };

  /**
   * 查询
   * @param {object} fields - 查询参数
   * @param { Boolean } pageChangeFlag - 是否来源于翻页查询
   */
  @Bind()
  handleSearch() {
    const { tableDS } = this.props;

    tableDS.setQueryParameter('commons', {
      customizeUnitCode: this.getCustomizeUnitCode(['table', 'filter']),
    });

    const filterBarQueryParams = this.getSearchBarQueryParams() || {};
    tableDS.setQueryParameter('searchBar', filterBarQueryParams);

    tableDS.query();
  }

  @Bind()
  queryDoubleUnit() {
    const { tableDS } = this.props;
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        const doubleUnitFlag = !!Number(res);
        this.setState({ doubleUnitFlag });
        tableDS.setState('doubleUnitFlag', doubleUnitFlag);
      }
    });
  }

  toggleLoading = (loading = false) => {
    this.setState({
      loading,
    });
  };

  /**
   *
   */
  getCustomizeUnitCode = (type = null) => {
    if (!type || isEmpty(type)) {
      return null;
    }

    const RfxCodeMap = new Map([
      ['buttons', 'SSRC.SUPPLIER_QUOTATION_COLLECT.HEAD_BUTTONS'], // 头部按钮组
      ['filter', 'SSRC.SUPPLIER_QUOTATION_COLLECT.TABLE_FILTER'],
      ['table', 'SSRC.SUPPLIER_QUOTATION_COLLECT.QUERY'],
    ]);

    const CodeDataMap = RfxCodeMap;
    let currentUnitCode = null;

    if (typeof type === 'string') {
      currentUnitCode = CodeDataMap.get(type);
    }

    if (isArray(type)) {
      const codeSet = new Set();
      type.forEach((unitCode) => {
        codeSet.add(CodeDataMap.get(unitCode));
      });

      currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
    }

    return currentUnitCode;
  };

  /**
   * 供应商报价汇总查询-导出
   * @protected 【远东电缆】二开，禁止修改、删除此方法名
   */
  @Throttle(2000)
  @Bind()
  sumQueryExport() {
    const { dispatch } = this.props;

    const { ids = [] } = this.getSelectedKeys();
    const searchFilterCode = this.getCustomizeUnitCode(['table', 'filter']);
    const exportParams = this.getSearchBarQueryParams() || {};
    this.toggleLoading(true);
    dispatch({
      type: 'supQuoSumQuery/sumQueryExport',
      payload: {
        querys: {
          customizeUnitCode: searchFilterCode,
        },
        organizationId: this.organizationId,
        quotationLineIds: ids,
        ...exportParams,
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
        this.clearTableSelected();
      }
    });
  }

  clearTableSelected = () => {
    const { tableDS } = this.props;
    tableDS.clearCachedSelected();
    tableDS.unSelectAll();
  };

  /**
   * 点击当前阶梯报价，触发查询, 打开阶梯报价模态框
   * @param {Object} record -openLadder
   */
  @Throttle(2000)
  @Bind()
  openLadder(record) {
    const { dispatch } = this.props;

    const lineData = record.toData() || {};
    const { quotationLineId } = lineData;

    if (!quotationLineId) {
      return;
    }

    this.setState({ ladderVisible: true });
    dispatch({
      type: 'supQuoSumQuery/fetchLadderList',
      payload: {
        quotationLineId,
      },
    });
    this.setState({
      ladderListHeaderInfo: lineData,
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
   * 点击PFx跳转
   */
  @Throttle(2000)
  @Bind()
  onrfxNum(record) {
    const { history } = this.props;
    const { rfxHeaderId, projectLineSectionId = null, secondarySourceCategory } =
      record?.toData() || {};
    if (!rfxHeaderId || !history) {
      return;
    }

    const searchObj = {};

    if (projectLineSectionId) {
      searchObj.projectLineSectionId = projectLineSectionId;
    }

    const search = querystring.stringify(searchObj);

    const path =
      secondarySourceCategory === 'NEW_BID'
        ? `/ssrc/new-bid-hall/bid-detail/${rfxHeaderId}`
        : `/ssrc/new-inquiry-hall/rfx-detail/${rfxHeaderId}`;

    if (history) {
      history.push({
        pathname: path,
        search,
      });
    }
  }

  getSearchBarQueryParams = () => {
    const { getQueryParameter } = this.searchBarRef || {};
    let data = {};
    if (getQueryParameter) {
      data = getQueryParameter();
    }

    data = data || {};
    return {
      ...data,
      multiRfxNumOrTitle: this.searchBarRef?.customizeDs?.current
        ?.get('multiRfxNumOrTitle')
        ?.join(','),
    };
  };

  getSelectedKeys = () => {
    const { tableDS } = this.props;
    const { selected: allTabSelected } = tableDS || {};
    if (!allTabSelected?.length) {
      return {};
    }

    const ids = [];

    allTabSelected.forEach((record) => {
      const { quotationLineId } = record.get(['quotationLineId']);
      if (quotationLineId) {
        ids.push(quotationLineId);
      }
    });

    return {
      ids,
    };
  };

  /**
   *  头部按钮组
   * @protected 【艾为电子】二开，禁止修改、删除此方法名
   */
  renderHeaderButtons() {
    const { loading = false } = this.state;
    const { ids = [] } = this.getSelectedKeys();
    const searchFilterCode = this.getCustomizeUnitCode(['table', 'filter']);
    const exportParams = this.getSearchBarQueryParams() || {};

    return [
      <Button name="export" icon="export" onClick={() => this.sumQueryExport()} loading={loading}>
        {intl.get(`hzero.common.button.export`).d('导出')}
      </Button>,
      <ExcelExportPro
        name="exportNew"
        templateCode="SRM_C_SRM_SSRC_RFX_QUOTATION_SUMMARY_EXPORT"
        queryParams={{
          quotationLineIds: ids,
          ...exportParams,
          customizeUnitCode: searchFilterCode,
        }}
        buttonText={intl.get('hzero.common.export').d('导出')}
        requestUrl={`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rfx/quotation/summary/export-new/c7n`}
        otherButtonProps={{
          icon: 'unarchive',
          type: 'c7n-pro',
          loading,
          color: 'primary',
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

  getTableColumns = () => {
    const { doubleUnitFlag } = this.state;

    let sumQueryColumns = [
      {
        name: 'supplierCompanyNum',
        width: 120,
        lock: 'left',
        editor: false,
      },
      {
        name: 'erpSupplierCompanyNum',
        width: 120,
        lock: 'left',
        editor: false,
      },
      {
        name: 'supplierCompanyName',
        width: 150,
        lock: 'left',
        editor: false,
      },
      {
        name: 'itemCode',
        width: 120,
        lock: 'left',
        editor: false,
      },
      {
        name: 'itemName',
        width: 250,
        renderer: ({ value, record }) => roundEliminate(value, record, { uiType: 'c7n-pro' }),
        editor: false,
      },
      doubleUnitFlag
        ? {
            name: 'validNetSecondaryPrice',
            width: 120,
            align: 'right',
            renderer: ({ value }) => {
              return numberSeparatorRender(value);
            },
            editor: false,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validQuotationSecPrice',
            width: 120,
            align: 'right',
            renderer: ({ value }) => {
              return numberSeparatorRender(value);
            },
            editor: false,
          }
        : null,
      {
        name: 'validNetPrice',
        width: 120,
        align: 'right',
        renderer: ({ value }) => {
          return numberSeparatorRender(value);
        },
        editor: false,
      },
      {
        name: 'validQuotationPrice',
        width: 120,
        align: 'right',
        renderer: ({ value }) => {
          return numberSeparatorRender(value);
        },
        editor: false,
      },
      {
        name: 'ladderInquiryFlag',
        width: 120,
        editor: false,
        renderer: ({ value, record }) => {
          if (value !== 1) {
            return '';
          }

          return (
            <a onClick={() => this.openLadder(record)}>
              {intl.get(`ssrc.supQuoSumQuery.view.message.button.ladderInquiryFlag`).d('阶梯报价')}
            </a>
          );
        },
      },
      {
        name: 'quotationDetailFlag',
        width: 120,
        editor: false,
        renderer: ({ record }) => {
          const { secondarySourceCategory } = record.get(['secondarySourceCategory']);

          return (
            <QuotationDetail
              rowData={record}
              sourceFrom="RFX"
              uiType="c7n"
              allowBuyerViewFlag
              pageFrom="supplierSummary"
              bidFlag={secondarySourceCategory === 'NEW_BID'}
            />
          );
        },
      },
      {
        name: 'freightAmount',
        width: 120,
        align: 'right',
        renderer: ({ value }) => {
          return numberSeparatorRender(value);
        },
        editor: false,
      },
      {
        name: 'suggestedFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
        editor: false,
      },
      doubleUnitFlag
        ? {
            name: 'allottedSecondaryQuantity',
            width: 120,
          }
        : null,
      {
        name: 'allottedQuantity',
        width: 120,
        editor: false,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 120,
            editor: false,
          }
        : null,
      {
        name: 'rfxQuantity',
        width: 120,
        editor: false,
      },
      doubleUnitFlag
        ? {
            name: 'currentQuotationSecQuantity',
            width: 120,
            editor: false,
          }
        : null,
      {
        name: 'currentQuotationQuantity',
        width: 120,
        editor: false,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 140,
          }
        : null,
      {
        name: 'uomName',
        width: 140,
        editor: false,
      },
      {
        name: 'taxCode',
        width: 120,
        editor: false,
      },
      {
        name: 'taxRate',
        width: 120,
        editor: false,
      },
      {
        name: 'currencyCode',
        width: 120,
        editor: false,
      },
      {
        name: 'exchangeRate',
        width: 120,
        editor: false,
      },
      {
        name: 'itemCategoryName',
        width: 120,
        editor: false,
      },
      {
        name: 'specs',
        width: 160,
        editor: false,
      },
      {
        name: 'quotationTypeMeaning',
        width: 120,
        editor: false,
      },
      {
        name: 'rfxLineItemNum',
        width: 120,
        editor: false,
      },
      {
        name: 'roundNumber',
        width: 120,
        editor: false,
      },
      {
        name: 'rfxNum',
        width: 160,
        editor: false,
        renderer: ({ record, value }) => <a onClick={() => this.onrfxNum(record)}>{value || ''}</a>,
      },
      {
        name: 'rfxTitle',
        width: 160,
        editor: false,
      },
      {
        name: 'templateName',
        width: 160,
        editor: false,
      },
      {
        name: 'sourceMethodMeaning',
        width: 120,
        editor: false,
      },
      {
        name: 'purOrganizationCode',
        width: 120,
        editor: false,
      },
      {
        name: 'purOrganizationName',
        width: 150,
        editor: false,
      },
      {
        name: 'ouName',
        width: 120,
        editor: false,
      },
      {
        name: 'invOrganizationName',
        width: 120,
        editor: false,
      },
      {
        name: 'createByName',
        width: 120,
        editor: false,
      },
      {
        name: 'finishDate',
        width: 120,
        editor: false,
      },
      {
        name: 'creationDate',
        width: 120,
        editor: false,
      },
    ].filter(Boolean);

    sumQueryColumns = sumQueryColumns.filter(Boolean);
    return sumQueryColumns;
  };

  setCurrentSearchBarRef = (ref) => {
    this.searchBarRef = ref;
  };

  tableSearchQuery = ({ params }) => {
    const { tableDS } = this.props;
    tableDS.setQueryParameter('searchBar', params);
    tableDS.query();
  };

  handleChange = (ds, value) => {
    const { tableDS } = this.props;
    const searchValue = value
      ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
      : undefined;
    tableDS.setQueryParameter('multiRfxNumOrTitle', searchValue);
  };

  /**
   * 组合筛选
   * todo name
   *
   */
  leftInput = (ds) => {
    return (
      <MutlTextFieldSearch
        searchBarDS={ds}
        name="multiRfxNumOrTitle"
        placeholder={intl
          .get('ssrc.common.model.common.commonMultiSearchRFX', {
            categoryCode: getCategoryCode(false),
          })
          .d('请输入{categoryCode}单号或标题查询')}
        onChange={this.handleChange}
      />
    );
  };

  clearQueryParameter = () => {
    const { tableDS } = this.props;
    tableDS.setQueryParameter('multiRfxNumOrTitle', '');
  };

  renderCotent = () => {
    const { customizeTable, tableDS } = this.props;

    return (
      <div style={getTableFixSelfAdaptStyle(true)?.wrapperCalcHeight}>
        {customizeTable(
          { code: this.getCustomizeUnitCode('table') },
          <SearchBarTable
            clearButton
            searchBarRef={this.setCurrentSearchBarRef}
            searchCode={this.getCustomizeUnitCode('filter')}
            onQuery={this.tableSearchQuery}
            showLoading={false}
            queryBar="none"
            searchBarConfig={{
              autoQuery: true,
              // closeFilterSelector: true, // 不能切换筛选 和新建筛选了
              onQuery: this.tableSearchQuery,
              editorProps: {
                organizationId: this.organizationId,
              },
              left: {
                render: (_, ds) => this.leftInput(ds),
              },
              onReset: this.clearQueryParameter,
              onClear: this.clearQueryParameter,
              fieldProps: {
                tempKey: {
                  // SSLM.SUPPLIER_CHOOSE
                  lovPara: {
                    tenantId: this.organizationId,
                  },
                },
                templateId: {
                  lovPara: {
                    sourceCategory: 'RFX',
                  },
                },
                createdBy: {
                  lovPara: { organizationId: this.organizationId },
                },
              },
            }}
            bordered
            dataSet={tableDS}
            rowKey="quotationLineId"
            virtual
            virtualCell
            columns={this.getTableColumns()}
            style={getTableFixSelfAdaptStyle()?.searchBarTableMaxHeight}
          />
        )}
      </div>
    );
  };

  render() {
    const {
      fetchLadderListLoading,
      supQuoSumQuery: { LadderDataList = [] },
      customizeBtnGroup = () => {},
    } = this.props;
    const { ladderVisible, ladderListHeaderInfo = {}, doubleUnitFlag } = this.state;

    // 阶梯报价
    const ladderRecordProps = {
      ladderListHeaderInfo,
      fetchLadderListLoading,
      visible: ladderVisible,
      hideModal: this.hideLadderRecord,
      ladderLevelData: LadderDataList,
      doubleUnitFlag,
    };

    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`ssrc.supQuoSumQuery.view.message.title.supQuoSumQuery`)
            .d('供应商报价汇总查询')}
        >
          {customizeBtnGroup(
            { code: this.getCustomizeUnitCode('buttons') },
            this.renderHeaderButtons()
          )}
        </Header>
        <Content>{this.renderCotent()}</Content>

        {ladderVisible && <LadderLevelModal {...ladderRecordProps} />}
      </React.Fragment>
    );
  }
}

const HOCComponent = (NewComponent) => {
  return compose(
    formatterCollections({
      code: [
        'ssrc.supQuoSumQuery',
        'ssrc.common',
        'ssrc.inquiryHall',
        'scux.ssrc',
        'sscux.ssrc',
        'ssrc.scux',
      ],
    }),
    withCustomize({
      unitCode: [
        'SSRC.SUPPLIER_QUOTATION_COLLECT.QUERY',
        'SSRC.SUPPLIER_QUOTATION_COLLECT.TABLE_FILTER', // 汇总结果查询
        'SSRC.SUPPLIER_QUOTATION_COLLECT.HEAD_BUTTONS', // 汇总头按钮
      ],
    }),
    connect(({ supQuoSumQuery, loading }) => ({
      supQuoSumQuery,
      fetchSumQueryListLoading: loading.effects['supQuoSumQuery/fetchSumQueryList'],
      fetchHistoryPriceDetailLoading: loading.effects['supQuoSumQuery/fetchHistoryPriceDetail'],
      fetchLadderListLoading: loading.effects['supQuoSumQuery/fetchLadderList'],
      organizationId: getCurrentOrganizationId(),
    })),
    withProps(
      () => {
        const tableDS = new DataSet(TableDS());

        return {
          tableDS,
        };
      },
      { cacheState: false, keepOriginDataSet: true }
    ),
    remote(
      {
        code: 'SSRC_SUPPLIER_QUOTATION_SUMMARY_QUERY',
        name: 'remote',
      },
      {
        events: {},
      }
    )
  )(observer(NewComponent));
};

export { HOCComponent, SupQuoSumQuery };
export default HOCComponent(SupQuoSumQuery);
