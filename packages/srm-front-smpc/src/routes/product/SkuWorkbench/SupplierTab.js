import React from 'react';
// import qs from 'querystring';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import {
  filterNullValueObject,
  generateUrlWithGetParam,
  getCurrentOrganizationId,
} from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import imgDefault from '@/assets/sku_default.svg';
import Image from '@/components/Image';
import { ViewFilter } from './components';
import operateRenderer from './records/operateRenderer';
import QueryField from './QueryField';
import { openRecordTabs } from './drawers';
import {
  approveStatusColumn,
  supStatusColumn,
  getOptions,
  priceFieldRender,
  viewPriceInfo,
  statusColumn,
  getMappingGroup,
  getSkuStock,
  renderApplyType,
  validateDateRender,
} from './tableColumns';
import { getRecordFields } from './utils';
import { precisionRender } from '../utilsApi/precision';
import { searchBarConfig } from './searchBarConfig';
import styles from './index.less';

export default class SkuPool extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      aggregation: false,
    };
  }

  componentDidMount() {
    const { filterStatus, onSubTableDidMount } = this.props;
    onSubTableDidMount(filterStatus);
  }

  getUrlParams = (record, tabStatus, defaultParams = {}, dynamicParams = {}) => {
    const urlParams = {
      ...defaultParams,
    };
    Object.keys(dynamicParams).forEach((key) => {
      if (typeof dynamicParams[key] === 'function') {
        urlParams[key] = dynamicParams[key]({ record, tabStatus });
      } else {
        urlParams[key] = dynamicParams[key];
      }
    });
    return filterNullValueObject(urlParams);
  };

  // 已撤销｜｜工作流审批中为更新商品
  isWorkflowApprove = (record) => {
    const { purSkuStatus, approveStatus, approveType } = record.get([
      'purSkuStatus',
      'approveStatus',
      'approveType',
    ]);
    return (
      approveStatus === 'REVERTED' ||
      (approveType === 'UPDATE' && (purSkuStatus === 12 || approveStatus === 'WORKFLOW_WAITING'))
    );
  };

  // 商品详情前置条件
  skuDetailParams = {
    // 请求方式｜请求参数
    req: ({ record, tabStatus }) => {
      const { purSkuStatus, approveStatus } = record.get([
        'purSkuStatus',
        'approveStatus',
        'approveType',
      ]);
      // 已失效商品
      if (tabStatus === '7') return undefined;
      // 更新商品工作流审批
      if (this.isWorkflowApprove(record)) return 'workflowApprove';
      // 审批拒绝
      if (tabStatus === '6' && approveStatus === 'REJECT') return 'reject';
      // 审批页签或已生效
      if (['5', '6'].includes(tabStatus) || purSkuStatus === 7) return 'new';
      // 已上架商品
      if (purSkuStatus === 1) return 'lastVersion';
    },
  };

  @Bind
  handleViewDetail(record) {
    const { push, prefixPath, filterStatus } = this.props;
    const { skuId, spuId, skuTemporaryId, approveType } = record.toData();
    const urlParams = this.getUrlParams(
      record,
      filterStatus,
      {
        spuId,
        skuId,
        tabStatus: filterStatus,
        skuTemporaryId,
        approveType,
      },
      this.skuDetailParams
    );
    push(generateUrlWithGetParam(`${prefixPath}/detail`, urlParams));
  }

  // 商品编辑前置条件
  skuEditParams = {
    // 请求方式｜请求参数
    req: ({ record, tabStatus }) => {
      const { approveStatus } = record.get(['approveStatus']);
      // 更新商品工作流审批
      if (this.isWorkflowApprove(record)) return 'workflowApprove';
      // 审批拒绝
      if (tabStatus === '6' && approveStatus === 'REJECT') return 'reject';
      // 默认查new
      return 'new';
    },
    // 已上架商品查看旧版本
    lastVersion: ({ record }) => (record.get('purSkuStatus') === 1 ? 'y' : null),
  };

  @Bind
  handleEditSpu(record) {
    const { push, prefixPath, filterStatus } = this.props;
    const { spuId, skuTemporaryId } = record.toData();

    const urlParams = this.getUrlParams(
      record,
      filterStatus,
      {
        spuId,
        skuTemporaryId,
        // tabStatus: status,
      },
      this.skuEditParams
    );

    push(generateUrlWithGetParam(`${prefixPath}/create`, urlParams));
  }

  // 操作记录
  operateRecord = (record) => {
    const { status } = this.props;
    // 待审批 + 审批拒绝
    const needTemporaryId = ['5', '6'].includes(status);
    const { skuId, skuTemporaryId } = record.get(['skuId', 'skuTemporaryId']);
    openRecordTabs(
      {
        rowRecord: record,
        skuTemporaryId: needTemporaryId ? skuTemporaryId : null,
        leftOperateArg: {
          url: `/smpc/v1/${getCurrentOrganizationId()}/sku-operation-records/list`,
          queryParams: {
            skuId,
          },
          operateRenderer,
          partLoad: true,
        },
      },
      true
    );
  };

  // 状态列
  renderStatus = () => {
    const { aggregation } = this.state;
    const { filterStatus } = this.props;
    if (['7'].includes(filterStatus)) {
      return [supStatusColumn()];
    } else if (['5', '6'].includes(filterStatus)) {
      const isWaiting = filterStatus === '5';
      return [approveStatusColumn(isWaiting, aggregation), statusColumn(aggregation)];
    } else {
      return [statusColumn(aggregation)];
    }
  };

  renderOptions = ({ record, aggregation }) => {
    const { filterStatus } = this.props;
    // const historyFlag = !!record.get('historyFlag');
    const actions = [
      {
        text: intl.get('hzero.common.button.preview').d('预览'),
        event: () => this.props.onPreview(record),
      },
      {
        text: intl.get('hzero.common.edit').d('编辑'),
        event: () => this.handleEditSpu(record),
        show:
          !['5', '7'].includes(filterStatus) &&
          !(filterStatus === '4' && record.get('purSkuStatus') === 8) &&
          !(filterStatus === '6' && record.get('approveType') === 'INVALID'),
      },
      {
        text: intl.get('hzero.common.button.record').d('操作记录'),
        event: () => this.operateRecord(record),
      },
    ];
    const maxLength = aggregation ? 4 : 3;
    return getOptions(actions, maxLength, aggregation);
  };

  getImagePath = (record) => {
    const { imagePath, skuImageList } = getRecordFields(record, ['imagePath', 'skuImageList']);
    const { mediaPath } = (skuImageList || []).find((f) => f.primaryFlag === 1) || {};
    return imagePath || mediaPath || imgDefault;
  };

  renderSkuInfo = ({ record, text }) => {
    const imagePath = this.getImagePath(record);

    return (
      <div className={styles['sku-container']}>
        <div className="sku-info">
          <Image className="sku-img" value={imagePath} width={64} height={64} decoding="async" />
          <div className="sku-content">{text}</div>
        </div>
      </div>
    );
  };

  renderPriceInfo = ({ record, text }) => {
    const { filterStatus, onSearch = (e) => e } = this.props;
    const prices = record.get('skuSalesInfos') || record.get('skuApproveSalesList') || [];
    if (prices.length > 1) {
      return viewPriceInfo(record, {
        isSup: true,
        status: filterStatus,
        afterClose: () => onSearch(false),
      });
    } else {
      return text;
    }
  };

  @Bind
  getColumns() {
    const { aggregation } = this.state;
    const { filterStatus, onSearch = (e) => e } = this.props;
    const columns = [
      ...this.renderStatus(),
      {
        name: 'options',
        width: aggregation ? 100 : 160,
        command: this.renderOptions,
        align: 'left',
      },
      {
        name: 'imagePath',
        width: 100,
        hideable: false,
        show: !aggregation,
        renderer: ({ record }) => {
          const imagePath = this.getImagePath(record);
          return <Image value={imagePath} width={32} height={32} decoding="async" />;
        },
      },
      {
        key: 'skuGroup',
        minWidth: 250,
        aggregation: true,
        align: 'left',
        header: intl.get('smpc.product.view.skuInfo').d('商品信息'),
        children: [
          {
            name: 'skuCode',
            width: 120,
            renderer: ({ record }) => (
              <a onClick={() => this.handleViewDetail(record)}>{record.get('skuCode')}</a>
            ),
          },
          {
            name: 'skuName',
            minWidth: 180,
          },
          {
            name: 'thirdSkuCode',
            width: 180,
          },
          {
            name: 'spuCode',
            width: 120,
            // hideable: false,
            // show: !aggregation,
          },
          {
            name: 'categoryNamePath',
            width: 160,
            // hideable: false,
            // show: !aggregation,
          },
        ],
        renderer: this.renderSkuInfo,
      },
      {
        name: 'approveTypeMeaning',
        minWidth: aggregation ? 120 : 100,
        show: ['5', '6'].includes(filterStatus),
        renderer: (p) => renderApplyType(p, aggregation),
        tooltip: 'none',
      },
      {
        name: 'approveReason',
        minWidth: '120',
        show: ['5', '6'].includes(filterStatus) && !aggregation,
        renderer: ({ value }) => value || '-',
      },
      getMappingGroup(),
      {
        key: 'priceGroup',
        mintWidth: 210,
        aggregation: true,
        align: 'left',
        header: intl.get('smpc.product.view.priceInfo').d('价格信息'),
        renderer: this.renderPriceInfo,
        children: [
          {
            name: 'taxPrice',
            header: intl.get('smpc.product.view.price.tax').d('单价(含税)'),
            width: 100,
            align: 'right',
            renderer: (params) =>
              priceFieldRender(params, {
                isSup: true,
                status: filterStatus,
                afterClose: () => onSearch(false),
              }),
          },
          {
            name: 'tax',
            header: intl.get('smpc.product.model.tax').d('税率'),
            width: 100,
            align: 'right',
            renderer: priceFieldRender,
          },
          {
            name: 'validDateFrom',
            width: 180,
            header: intl.get('smpc.product.view.effectTime').d('有效期'),
            renderer: validateDateRender,
          },
          {
            name: 'priceType',
            header: intl.get('smpc.product.model.priceType').d('价格类型'),
            width: 100,
            renderer: priceFieldRender,
          },
          {
            name: 'currencyName',
            header: intl.get('smpc.product.model.currency').d('币种'),
            width: 100,
            renderer: priceFieldRender,
          },
        ],
      },
      {
        name: 'ecValidDateTo',
        width: 130,
        title: intl.get('smpc.product.model.cataEcValidDateTo').d('商品有效期截至'),
        show: filterStatus === '3',
      },
      {
        name: 'firstShelfDate',
        width: 150,
        hidden: true,
        show: ['1', '3', '4'].includes(filterStatus),
      },
      {
        key: 'stockGroup',
        width: 160,
        align: 'left',
        aggregation: true,
        header: intl.get('smpc.product.view.stockInfo').d('库存信息'),
        children: [
          {
            name: 'skuStock',
            renderer: ({ record }) => {
              return getSkuStock({ record });
            },
          },
          {
            name: 'warningStock',
            renderer: (params) => precisionRender({ ...params, showLine: true }),
          },
          {
            name: 'consumedStock',
            renderer: (params) => precisionRender({ ...params, showLine: true }),
          },
          {
            name: 'totalStock',
            renderer: ({ value, record }) => {
              return value === -1 || isNaN(value)
                ? intl.get('smpc.product.view.bigStock').d('无限库存')
                : precisionRender({ name: 'totalStock', record, showLine: true });
            },
          },
        ],
      },
      {
        name: 'supplierCompanyName',
        width: 160,
        hidden: true,
      },
      {
        name: 'publisher',
        width: 160,
        hidden: true,
      },
      {
        name: 'shelfRemark',
        width: 80,
        show: !aggregation,
      },
      {
        name: 'purchaseAgentName',
        width: 100,
      },
    ];
    return columns.filter((f) => f.show !== false);
  }

  render() {
    const { aggregation } = this.state;
    const {
      tableDs,
      style,
      remote,
      customizeTable,
      customizeUnitCode, // 筛选器单元
      tableCustomizeUnitCode, // 表格单元
    } = this.props;
    const columns = this.getColumns();
    const left = {
      render: () => (
        <QueryField
          name="skuCodes"
          dataSet={tableDs}
          onRef={(ref) => {
            this.queryRef = ref;
          }}
          placeholder={intl.get('smpc.product.view.queryMsg.skuCode').d('请输入商品编码查询')}
        />
      ),
    };
    const cuxLeft = remote.process('SMPC_SKU_WORKBENCH_SUP_PROCESS_SEARCHBAR_LEFT', left, {
      tableDs,
      remoteThis: this,
    });
    const tableProps = {
      columns,
      aggregation,
      dataSet: tableDs,
      style: { maxHeight: 'calc(100% - 22px)' },
      searchBarConfig: {
        ...searchBarConfig,
        onLoad: () => {
          tableDs.setState('queryStatus', 'ready');
        },
        onReset: () => {
          if (this.queryRef) this.queryRef.handleClear();
        },
        onClear: () => {
          if (this.queryRef) this.queryRef.handleClear();
        },
        left: cuxLeft,
        right: {
          render: () => (
            <ViewFilter
              aggregation={aggregation}
              onAggregationChange={(_aggregation) => {
                this.setState({ aggregation: _aggregation });
              }}
            />
          ),
        },
      },
      cacheState: true,
      searchCode: customizeUnitCode,
      onAggregationChange: (_aggregation) => {
        this.setState({ aggregation: _aggregation });
      },
    };
    if (!aggregation) {
      tableProps.rowHeight = 38;
    }
    return (
      <div style={{ ...style, height: 'calc(100vh - 252px)' }}>
        {customizeTable({ code: tableCustomizeUnitCode }, <SearchBarTable {...tableProps} />)}
      </div>
    );
  }
}
