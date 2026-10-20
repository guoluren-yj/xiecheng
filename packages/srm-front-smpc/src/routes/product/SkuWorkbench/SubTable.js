import React from 'react';
import qs from 'querystring';
import { DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from '_components/ApproveRecordSimple';

import imgDefault from '@/assets/sku_default.svg';
import Image from '@/components/Image';
import { checkPermission } from 'services/api';
import c7nModal from '@/utils/c7nModal';
import { fetchUseOldReceive, fetchReceiveStock } from '@/routes/product/SkuCreate/api';
import { NewStockInfo } from '@/routes/product/SkuCreate/StockInfo';
import { newStockDs } from '@/routes/product/SkuCreate/ds';
import { LabelContainer, ViewFilter } from './components';
import { openEvaluate, openAuths, priceRecord, openRecordTabs } from './drawers';
import { handleRevokeApprove, getRecordFields } from './utils';

import operateRenderer from './records/operateRenderer';
import ApproveTable from './ApproveTable';
import QueryField from './QueryField';
import {
  statusColumn,
  approveStatusColumn,
  supStatusColumn,
  priceFieldRender,
  getOptions,
  viewPriceInfo,
  viewStockInfo,
  rendererCompare,
  getMappingGroup,
  stockFieldRender,
  getSkuStock,
  recycleStatusColumn,
  renderApplyType,
  validateDateRender,
} from './tableColumns';

import { precisionRender } from '../utilsApi/precision';
import { searchBarConfig } from './searchBarConfig';
import styles from './index.less';

const EC_HIGH_PERMISSION_CODE = 'sku-workbench-pur.smpc.sku-workbench-pur.list.button.purchaseEc';

// let viewType = 1; // 1是聚合表/0是平铺表

export default class SkuPool extends React.PureComponent {
  constructor(props) {
    super(props);
    const { status, onRef = (e) => e } = props;
    if (status === '5') {
      onRef(this);
    }
    this.tableRef = React.createRef();

    this.state = {
      aggregation: false,
      // 电商高级权限按钮
      hasEcHighPermission: false,
      oldReceive: true, // 旧领用库存租户
    };
  }

  async componentDidMount() {
    const { tabKey, onSubTableDidMount, skuType } = this.props;
    if (skuType === 'EC') {
      this.checkEcHighPermission();
    }
    // 领用库存相关配置
    if (skuType === 'RECEIVE') {
      await this.getReceiveStockConfig();
    }
    onSubTableDidMount(tabKey);
  }

  getReceiveStockConfig = async () => {
    const res = getResponse(await fetchUseOldReceive());
    this.setState({ oldReceive: res });
  };

  @Bind
  async checkEcHighPermission() {
    const res = await checkPermission([EC_HIGH_PERMISSION_CODE]);
    if (res) {
      const { approve } = res[0];
      this.setState({
        hasEcHighPermission: approve,
      });
    }
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
    // 审批按钮
    btnFlag: ({ record }) => {
      // 是否为功能待审批
      const isWApprove = record.get('approveStatus') === 'WAITING';
      return isWApprove ? 'y' : undefined;
    },
    // 对比｜历史版本
    compareFlag: ({ record, tabStatus }) => {
      const approvalFrom = record.get('approvalFrom');
      return tabStatus === '5' && approvalFrom !== 'SAGM' ? 'y' : undefined;
    },
    // 请求方式｜请求参数
    req: ({ record, tabStatus }) => {
      const { purSkuStatus, approveStatus, receiveFlag } = record.get([
        'purSkuStatus',
        'approveStatus',
        'receiveFlag',
        'approveType',
      ]);
      // 已失效
      if (tabStatus === '7') return undefined;
      // 更新商品工作流审批
      if (this.isWorkflowApprove(record)) return 'workflowApprove';
      // 领用
      if (receiveFlag === 1) return 'receive';
      // 审批拒绝
      if (tabStatus === '6' && approveStatus === 'REJECT') return 'reject';
      // 审批或者（已生效同时不为已失效）
      if (['5', '6'].includes(tabStatus) || purSkuStatus === 7) return 'new';
      // 已上架商品
      if (purSkuStatus === 1) return 'lastVersion';
    },
  };

  @Bind
  handleViewDetail(record) {
    const { push, status, prefixPath } = this.props;
    const {
      spuId,
      skuId,
      approveType,
      skuTemporaryId,
      wflApproveFlag,
      wflRevokeApproveFlag,
      taskId,
      processInstanceId,
      businessKey,
    } = record.toData();
    const urlParams = this.getUrlParams(
      record,
      status,
      {
        spuId,
        skuId,
        approveType,
        skuTemporaryId,
        tabStatus: status,
        wflApproveFlag,
        wflRevokeApproveFlag,
        taskId,
        processInstanceId,
        businessKey,
      },
      this.skuDetailParams
    );
    push({
      pathname: `${prefixPath}/detail`,
      search: qs.stringify(urlParams),
    });
  }

  // 商品编辑前置条件
  skuEditParams = {
    // 请求方式｜请求参数
    req: ({ record, tabStatus }) => {
      const { approveStatus, receiveFlag } = record.get(['approveStatus', 'receiveFlag']);
      // 更新商品工作流审批
      if (this.isWorkflowApprove(record)) return 'workflowApprove';
      // 领用
      if (receiveFlag === 1) return 'receive';
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
    const { push, status, prefixPath } = this.props;
    const { spuId, skuTemporaryId } = record.toData();

    const urlParams = this.getUrlParams(
      record,
      status,
      {
        spuId,
        skuTemporaryId,
        // tabStatus: status,
      },
      this.skuEditParams
    );

    push({
      pathname: `${prefixPath}/create`,
      search: qs.stringify(urlParams),
    });
  }

  getImagePath = (record) => {
    const { imagePath, skuImageList } = getRecordFields(record, ['imagePath', 'skuImageList']);
    const { mediaPath } = (skuImageList || []).find((f) => f.primaryFlag === 1) || {};
    return imagePath || mediaPath || imgDefault;
  };

  // 状态列
  renderStatus = () => {
    const { status } = this.props;
    const { aggregation } = this.state;
    if (status === '7') {
      return [supStatusColumn()];
    } else if (status === '8') {
      return [recycleStatusColumn()];
    } else if (['5', '6'].includes(status)) {
      const isWaiting = status === '5';
      return [approveStatusColumn(isWaiting), statusColumn(aggregation)];
    } else {
      return [statusColumn(aggregation)];
    }
  };

  // 操作记录
  operateRecord = (record, isSup) => {
    const { status, skuType } = this.props;
    // 待审批 + 审批拒绝
    const needTemporaryId = ['5', '6'].includes(status);
    const { skuId, skuTemporaryId, tenantId, skuCode, businessKey } = record.get([
      'skuId',
      'skuTemporaryId',
      'tenantId',
      'skuCode',
      'businessKey',
    ]);
    openRecordTabs(
      {
        rowRecord: record,
        skuTemporaryId: needTemporaryId ? skuTemporaryId : null,
        businessKey:
          skuType === 'EC' ? `SMPC.EC_SHELF_APPROVE:${tenantId}:${skuCode}` : businessKey, // 电商目前就上架审批工作流一种，写死
        leftOperateArg: {
          url: `/smpc/v1/${getCurrentOrganizationId()}/sku-operation-records/list`,
          queryParams: {
            skuId,
          },
          operateRenderer,
          partLoad: true,
        },
        isEc: skuType === 'EC',
      },
      isSup
    );
  };

  // 聚合商品信息
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

  // 操作列
  renderOptions = ({ record, aggregation }) => {
    const {
      skuType,
      status,
      isSup,
      editSkuAuth,
      onShelf = (e) => e,
      onPreview = (e) => e,
      onHandleSearch = (e) => e,
    } = this.props;
    const { hasEcHighPermission } = this.state;
    // const isVersion = record.get('__versionId');
    const purSkuStatus = record.get('purSkuStatus');
    // const historyFlag = !!record.get('historyFlag');
    const { taskId, processInstanceId, businessKey } = record.get([
      'taskId',
      'processInstanceId',
      'businessKey',
    ]);

    const actions = [
      {
        text:
          purSkuStatus === 1
            ? intl.get('smpc.product.model.unshelf').d('下架')
            : intl.get('smpc.product.model.shelf').d('上架'),
        event: () => onShelf([record.toJSONData()], purSkuStatus),
        show: skuType === 'EC' && !['8', '9'].includes(status) && hasEcHighPermission,
        disabled: [8, 9, 13].includes(purSkuStatus),
      },
      {
        text: intl.get('hzero.common.button.preview').d('预览'),
        event: () => onPreview(record),
      },
      {
        text: intl.get('hzero.common.button.approval').d('审批'),
        event: () =>
          openApproveModal({
            modalProps: {
              closable: true,
            },
            taskId,
            processInstanceId,
            onSuccess: () => onHandleSearch(false),
          }),
        show: !record.get('__versionId') && !!record.get('wflApproveFlag'), // 历史版本不允许审批
      },
      {
        text: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
        event: () => handleRevokeApprove(businessKey, () => onHandleSearch(false)),
        show: !record.get('__versionId') && !!record.get('wflRevokeApproveFlag'), // 历史版本不允许撤销审批
      },
      {
        text: intl.get('hzero.common.edit').d('编辑'),
        event: () => this.handleEditSpu(record),
        // iconSpace: status === '1' && !aggregation,
        show:
          editSkuAuth && // 编辑权限
          // 自有商品
          ((skuType === 'CATA' &&
            !['5', '7'].includes(status) && // 待审批、已失效页签 不能编辑
            !(status === '4' && record.get('purSkuStatus') === 8) && // 待上架上架中不能编辑
            !(status === '6' && record.get('approveType') === 'INVALID')) || // 审批拒绝 申请类型未已失效 不能编辑
            (skuType === 'RECEIVE' && status !== '8')), // 领用商品回收站不可编辑
      },
      {
        text: intl.get('hzero.common.button.record').d('操作记录'),
        event: () => this.operateRecord(record, isSup),
      },
    ];
    const maxLength = aggregation ? 4 : 3;
    return getOptions(actions, maxLength, aggregation);
  };

  renderPriceInfo = ({ record, text }) => {
    const { status, skuType, ds, remote } = this.props;
    const prices = record.get('skuSalesInfos') || record.get('skuApproveSalesList') || [];
    if (prices.length > 1) {
      return viewPriceInfo(record, { status, skuType, remote, afterClose: () => ds.search(false) });
    } else {
      return text;
    }
  };

  renderStockInfo = ({ record, text }) => {
    const { skuType } = this.props;
    const stocks = record.get('skuStockList') || [];
    if (skuType === 'RECEIVE' && stocks.length > 1) {
      return viewStockInfo(record, stocks);
    } else {
      return text;
    }
  };

  openNewStockInfo = (record) => {
    const ds = new DataSet(newStockDs());
    ds.selection = false;
    const stockInfo = {
      skuRecord: record,
      tableDs: ds,
      read: true,
    };
    ds.status = 'loading';
    fetchReceiveStock({ itemId: record.get('itemId') })
      .then((res) => {
        if (getResponse(res)) {
          (res || []).forEach((r) => {
            ds.create({ ...r });
          });
          ds.status = 'ready';
        }
      })
      .finally(() => {
        ds.status = 'ready';
      });
    c7nModal({
      style: { width: 1000 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('smpc.product.view.lookStock').d('查看库存信息'),
      children: <NewStockInfo {...stockInfo} />,
    });
  };

  renderCusLabels = ({ record, value }) => {
    const { aggregation } = this.state;
    return (
      <LabelContainer
        labels={value}
        aggregation={aggregation}
        limitLine={3}
        labelWidth="auto"
        record={record}
      />
    );
  };

  @Bind()
  renderReceiveRules = ({ record }) => {
    const { aggregation } = this.state;
    let labels = record.get('saleAgreementHeaderList') || [];
    labels = labels.map((m) => ({
      labelName: m.agreementHeaderName,
      labelColorCode: 'G',
      onClick: () => this.onItemClick(m.agreementHeaderId),
    }));
    return (
      <LabelContainer
        labels={labels}
        aggregation={aggregation}
        limitLine={3}
        labelWidth="auto"
        type="link"
        record={record}
      />
    );
  };

  @Bind()
  onItemClick(id) {
    const { push } = this.props;
    push(`/sagm/sale-agreement-workbench/detail/read?agreementHeaderId=${id}`);
  }

  renderSourceFromNum = ({ record }) => {
    const { aggregation } = this.state;
    const skuSalesInfos = record.get('skuSalesInfos') || [];
    const values = skuSalesInfos
      .filter((f) => !!f.sourceFromNum)
      .map((i) => i.sourceFromNum)
      .filter((i, index, self) => i && self.indexOf(i) === index);
    const labels = values.map((i) => ({ labelName: i, labelColorCode: 'G_noBorder' }));
    return values.length === 0 ? (
      '-'
    ) : (
      <LabelContainer
        labels={labels}
        aggregation={aggregation}
        limitLine={3}
        labelWidth="auto"
        record={record}
      />
    );
  };

  @Bind
  getColumns() {
    const { aggregation, oldReceive } = this.state;
    const { status, skuType, ds, remote, push } = this.props;
    const columns = [
      ...this.renderStatus(),
      {
        name: 'options',
        width: aggregation ? 100 : 160,
        command: this.renderOptions,
        align: 'left',
      },
      {
        name: 'approvalProgress',
        width: 100,
        show: ['5', '9'].includes(status), // 待审批/审批中展示审批进度
        header: intl.get('smpc.product.view.approvalProgress').d('审批进度'),
        renderer: ({ record }) =>
          // 历史版本不展示审批进度
          isEmpty(record.get('simpleApprovalHistory')) || record.get('__versionId') ? (
            '-'
          ) : (
            <ApproveRecordSimple data={record.get('simpleApprovalHistory') || []} />
          ),
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
        className: styles['sku-group-column'],
        children: [
          {
            name: 'skuCode',
            width: 120,
            renderer: ({ record }) => {
              return ['CATA', 'RECEIVE'].includes(skuType) && !record.get('__versionId') ? (
                <a onClick={() => this.handleViewDetail(record)}>{record.get('skuCode')}</a>
              ) : (
                record.get('skuCode')
              );
            },
          },
          {
            name: 'skuName',
            minWidth: 180,
            renderer: rendererCompare,
          },
          {
            name: 'thirdSkuCode',
            width: 180,
          },
          {
            name: 'spuCode',
            width: 120,
            // hideable: false,
            // show: !aggregation,价格信息
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
        show: ['5', '6'].includes(status),
        renderer: (p) => renderApplyType(p, aggregation),
        tooltip: 'none',
      },
      {
        name: 'approveReason',
        minWidth: '120',
        show: ['5', '6'].includes(status) && !aggregation,
        renderer: ({ value }) => value || '-',
      },
      getMappingGroup(),
      {
        key: 'priceGroup',
        width: 200,
        aggregation: true,
        align: 'left',
        header: intl.get('smpc.product.view.priceInfo').d('价格信息'),
        renderer: this.renderPriceInfo,
        children: [
          {
            name: 'taxPrice',
            header: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
            width: 100,
            align: 'right',
            renderer: (params) =>
              priceFieldRender(params, {
                status,
                skuType,
                remote,
                afterClose: () => ds.search(false),
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
            show: ['CATA'].includes(skuType),
            renderer: validateDateRender,
          },
          {
            name: 'ecValidDateTo',
            width: 120,
            header: intl.get('smpc.product.model.dateTo').d('有效期至'),
            show: skuType === 'EC',
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
        ].filter((f) => f.show !== false),
      },
      {
        key: 'skuFeedBack',
        width: 180,
        show: skuType === 'EC',
        aggregation: true,
        align: 'left',
        header: intl.get('smpc.product.view.skuFeedback').d('商品反馈'),
        children: [
          {
            name: 'feedbackTypeMeaning',
            header: intl.get('smpc.workbench.view.feedbackType').d('反馈类型'),
            width: 100,
          },
          {
            name: 'feedbackRemark',
            header: intl.get('smpc.product.model.remark').d('备注'),
            width: 100,
          },
          {
            name: 'ecResponseFlag',
            header: intl.get('smpc.product.view.ecResponseFlag').d('电商确认'),
            width: 100,
            renderer: ({ value }) => (value ? intl.get('smpc.product.model.yes').d('是') : '-'),
          },
          {
            name: 'ecResponseRemark',
            header: intl.get('smpc.product.view.ecResponseRemark').d('电商备注'),
            width: 100,
          },
        ],
      },
      {
        name: 'ecValidDateTo',
        width: 130,
        title: intl.get('smpc.product.model.cataEcValidDateTo').d('商品有效期截至'),
        show: skuType === 'CATA' && status === '3',
      },
      {
        name: 'priceRecord',
        width: 100,
        header: intl.get('smpc.product.view.priceRecords').d('价格记录'),
        show: skuType === 'EC',
        renderer: ({ record }) => (
          <a onClick={() => priceRecord(record)}>
            {intl.get('smpc.product.model.viewRecords').d('查看记录')}
          </a>
        ),
      },
      {
        name: 'creationDate',
        width: 140,
        show: skuType === 'EC' && status === '4',
      },
      {
        name: 'shelfDate',
        width: 140,
        show: status === '3' || status === '4',
      },
      {
        name: 'offShelfDate',
        width: 140,
        show: status === '4',
      },
      {
        name: 'sourceFromNums',
        width: aggregation ? 160 : 260,
        tooltip: aggregation ? 'none' : 'overflow',
        show: skuType === 'CATA',
        renderer: this.renderSourceFromNum,
      },
      {
        name: 'firstShelfDate',
        width: 140,
        hidden: true,
        show: ['1', '3', '4'].includes(status),
      },
      {
        name: 'updateTime',
        header: intl.get('smpc.product.model.updateTime').d('更新时间'),
        width: 140,
        hidden: true,
        show: skuType === 'EC',
      },
      {
        name: 'authority',
        width: 100,
        renderer: ({ record }) => (
          <a className={styles['unit-line']} onClick={() => openAuths(record)}>
            {intl.get('smpc.product.view.lookAuth').d('查看权限')}
          </a>
        ),
      },
      {
        key: 'stockGroup',
        width: 150,
        aggregation: true,
        align: 'left',
        header: intl.get('smpc.product.view.stockInfo').d('库存信息'),
        renderer: this.renderStockInfo,
        children: [
          {
            name: 'inventoryName',
            renderer: (param) => stockFieldRender(param, false),
            show: skuType === 'RECEIVE',
          },
          {
            name: 'skuStock',
            renderer: ({ record, name }) => {
              if (record.get('receiveFlag') === 1) return stockFieldRender({ record, name });
              return getSkuStock({ record });
            },
          },
          {
            name: 'warningStock',
            renderer: ({ name, record }) => {
              if (record.get('receiveFlag') === 1) return stockFieldRender({ record, name });
              return precisionRender({ name, record, showLine: true });
            },
          },
          {
            name: 'consumedStock',
            renderer: ({ name, record }) => {
              if (record.get('receiveFlag') === 1) return stockFieldRender({ record, name });
              return precisionRender({ name, record, showLine: true });
            },
          },
          {
            name: 'totalStock',
            renderer: ({ value, record, name }) => {
              if (record.get('receiveFlag') === 1) return stockFieldRender({ record, name });
              return value === -1 || isNaN(value)
                ? intl.get('smpc.product.view.bigStock').d('无限库存')
                : precisionRender({ name: 'totalStock', record, showLine: true });
            },
          },
        ].filter((f) => f.show !== false),
        show: ['CATA', 'RECEIVE'].includes(skuType) && oldReceive,
      },
      {
        key: 'stockGroup',
        width: 150,
        aggregation: true,
        align: 'left',
        header: intl.get('smpc.product.view.stockInfo').d('库存信息'),
        renderer: ({ record }) => (
          <a onClick={() => this.openNewStockInfo(record)}>
            {intl.get('smpc.product.view.lookStock').d('查看库存信息')}
          </a>
        ),
        show: ['RECEIVE'].includes(skuType) && !oldReceive,
      },
      {
        name: 'supplierCompanyName',
        width: 150,
        show: skuType !== 'RECEIVE',
        // hidden: true,
      },
      {
        name: 'labels',
        width: aggregation ? 120 : 240,
        tooltip: aggregation ? 'none' : 'overflow',
        renderer: this.renderCusLabels,
        hidden: true,
      },
      {
        name: 'skuComment',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => openEvaluate(record.get('skuId'))}>
            {intl.get('smpc.product.view.lookComment').d('查看评价')}
          </a>
        ),
        hidden: true,
        show: skuType === 'CATA',
      },
      {
        name: 'publisher',
        width: 140,
        show: skuType === 'CATA',
        hidden: true,
      },
      {
        name: 'shelfRemark',
        width: 80,
        show: !aggregation && skuType === 'CATA',
      },
      // 权重分
      {
        name: 'weightScore',
        width: 100,
        hidden: true,
        help: intl
          .get('smpc.product.view.message.weightScore')
          .d('权重分越高的商品在主站搜索排序中越靠前'),
      },
      {
        name: 'saleAgreementHeaderList',
        header: intl.get('smpc.product.view.message.receiveRule').d('领用规则'),
        width: aggregation ? 120 : 260,
        tooltip: aggregation ? 'none' : 'overflow',
        renderer: this.renderReceiveRules,
        show: skuType === 'RECEIVE' && status === '1',
      },
      {
        name: 'purchaseAgentName',
        width: 100,
        show: skuType !== 'RECEIVE',
      },
    ];
    const newColumns = remote.process('SMPC_SKU_WORKBENCH_PROCESS_TABLE_COLUMNS', columns, {
      ds,
      status,
      skuType,
      push,
    });
    return newColumns.filter((f) => f.show !== false);
  }

  handleExpand = () => {
    if (this.tableRef) {
      this.tableRef.tableStore.expandAll();
    }
  };

  handleCollapse = () => {
    if (this.tableRef) {
      this.tableRef.tableStore.collapseAll();
    }
  };

  render() {
    const { aggregation } = this.state;
    // status：商品状态
    const {
      ds,
      status,
      customizeUnitCode,
      tableCustomizeUnitCode,
      customizeTable,
      remote,
    } = this.props;
    const columns = this.getColumns();
    // 隐藏滚动条
    const contentHeight = status === '5' ? 300 : 254;
    const left = {
      render: () => (
        <QueryField
          name="skuCodes"
          dataSet={ds.table}
          onRef={(ref) => {
            this.queryRef = ref;
          }}
          placeholder={intl.get('smpc.product.view.queryMsg.skuCode').d('请输入商品编码查询')}
        />
      ),
    };
    const cuxLeft = remote.process('SMPC_SKU_WORKBENCH_PROCESS_SEARCHBAR_LEFT', left, {
      ds,
      remoteThis: this,
    });
    const tableProps = {
      columns,
      aggregation,
      dataSet: ds.table,
      style: { maxHeight: 'calc(100% - 22px)' },
      searchBarConfig: {
        ...searchBarConfig,
        onLoad: () => {
          ds.table.setState('queryStatus', 'ready');
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
    return status === '5' ? (
      <ApproveTable
        onRef={(ref) => {
          this.tableRef = ref;
        }}
        dataSet={ds.table}
        customizeTable={customizeTable}
        customizedCode={tableCustomizeUnitCode}
        searchBarProps={tableProps}
      />
    ) : (
      <div style={{ height: `calc(100vh - ${contentHeight}px)` }}>
        {customizeTable(
          { code: tableCustomizeUnitCode },
          <SearchBarTable {...tableProps} virtualCell={false} />
        )}
      </div>
    );
  }
}
