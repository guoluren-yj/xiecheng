// 采购方商品工作台

import React from 'react';
import qs from 'qs';
import { Bind, Debounce } from 'lodash-decorators';
import { Tabs } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import { unionBy, throttle } from 'lodash';

import intl from 'utils/intl';

import withProps from 'utils/withProps';
import { openTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import ImportButton from 'components/Import';
// import ExcelExportPro from 'components/ExcelExportPro';
import notification from 'utils/notification';
import remote from 'hzero-front/lib/utils/remote';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import { checkPermission } from 'services/api';

import c7nModal from '@/utils/c7nModal';
import PriceLib from '@/routes/sagm/PriceLib';
import { DropdownBtn, ExportButton, ObserverBtn, MenuItemLinkBtn } from './components';
// import CataSkuPool from './CataSkuPool';
// import EcSkuPool from './EcSkuPool';
import SubTable from './SubTable';
import SkuCompose from './SkuCompose';
import ItemSearchbarTable from './drawers/ItemSearchbarTable';
import ReceiveRuleButton from './drawers/ReceiveRule';

import {
  batchPutAway,
  batchSkuInfo,
  batchUnShelve,
  batchRemarks,
  batchEditECInfo,
  batchValid,
  batchInvalid,
  batchSubmit,
  batchDeprecate,
  batchRecovery,
  getSkuAttrConfig,
  checkSkuCompose,
  createReceiveSku,
  receiveDeprecation,
  receiveStore,
  receiveSkuAssign,
  fetchIsFeedBack,
} from './api';
import { approveOrReject } from '../SkuApprove/api';

import {
  openLabels,
  openBatchSku,
  openTextArea,
  openUploadImg,
  openSkuFeedback,
  SkuCondition,
  openNewPackageSku,
} from './drawers';
import SkuCopy from './drawers/SkuCopy';
import confirm from './confirm';
import { getStatusAndDs } from './utils';
import { purListCode } from './customUnitCode';
import { purPermissions } from './permissions';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const { TabGroup, TabPane } = Tabs;

const getSkuTypes = () => [
  {
    skuType: 'CATA',
    skuTypeMeaning: intl.get('smpc.workbench.view.hasSkuPool').d('自有商品池'),
  },
  {
    skuType: 'EC',
    skuTypeMeaning: intl.get('smpc.workbench.view.ecSkuPool').d('电商商品池'),
    initPara: { tenantId: organizationId },
  },
  {
    skuType: 'RECEIVE',
    skuTypeMeaning: intl.get('smpc.workbench.view.receiveSkuPool').d('领用商品池'),
  },
];

// 记录组件初始状态的变更，商品类型、状态
const initState = {
  skuType: 'CATA',
  skuStatus: '1',
  defaultKey: { CATA: 'all', EC: 'allEc', RECEIVE: 'allReceive' },
};

let skuAuths = [];

/**
 * 德康商品上架填写原因
 * 永祥电商商品上架填写原因
 */
@remote(
  {
    code: 'SKU_WORKBENCH',
    name: 'remote',
  },
  // 默认Expose属性，当没有二开Expose时会走此逻辑
  {
    events: {
      handleOnShelf({ ds, onOk }) {
        const bodyData = ds.selected.map((m) => m.toData());
        const isRemark = bodyData.some((s) => s.shelfRemark);
        if (isRemark) {
          confirm({
            title: intl.get('smpc.product.model.shelfMsg').d('上架提示'),
            content: intl
              .get('smpc.product.model.remarkSureShelf')
              .d('商品有备注信息，是否确认上架？'),
            onOk,
          });
        } else {
          return onOk();
        }
      },
      // 自有商品批量编辑商品信息保存 -德康
      async batchCataSkuInfoOnSave({ skuInfo, saleInfo, selectedData, handleSearch, api }) {
        const newData = selectedData.map((m) => {
          const { skuSalesInfos, skuApproveSalesList } = m;
          const newSkuSalesInfos = [...(skuSalesInfos || skuApproveSalesList || [])]; // 深拷贝一波
          if (saleInfo) {
            newSkuSalesInfos.unshift(saleInfo);
          }
          return {
            ...m,
            ...skuInfo,
            skuSalesInfos: newSkuSalesInfos,
          };
        });
        const res = getResponse(await api(newData));
        if (res) {
          notification.success();
          handleSearch(false);
        } else {
          return false;
        }
      },
      // 电商列表单个上架
      cuxHandleSingleShelf({ onOk }) {
        onOk();
      },
    },
  }
)
@formatterCollections({
  code: ['smpc.product', 'smpc.workbench', 'sagm.common', 'small.common', 'smpc.common'],
})
@withCustomize({ unitCode: purListCode })
@withProps(
  () => {
    const skuCollections = {};
    const skuTypes = getSkuTypes();
    skuTypes.forEach((f) => {
      const { skuType, initPara = {} } = f;
      const [statusList, dsMap] = getStatusAndDs('', { skuType, ...initPara });
      skuCollections[skuType] = { skuType, dsMap, statusList };
    });
    return { skuCollections };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class SkuWorkbench extends React.Component {
  subTables = [];

  subTablesLoaded = {}; // 记录子组件是否已经挂载

  tableRef;

  ECLoad = false;

  CATALoad = false;

  skuTypes = getSkuTypes();

  authCodes = {};

  constructor(props) {
    super(props);
    const {
      location: { pathname, search },
      skuCollections,
    } = props;

    this.initAuthCodes();

    const { tabKey: initTabKey } = qs.parse(search.substr(1));

    // 数据构造完成，初始化
    const isSup = pathname.includes('sku-workbench-sup');
    const prefixPath = pathname.split('/list')[0];
    const title = isSup
      ? intl.get('smpc.workbench.view.supTitle').d('商品工作台（供）')
      : intl.get('smpc.workbench.view.purTitle').d('商品工作台（采）');

    this.skuTypes.forEach((f) => {
      const { skuType } = f;
      const { dsMap, statusList } = skuCollections[skuType];
      const _list = statusList.map((m) => {
        // value: 商品状态
        const {
          value,
          meaning,
          tabKey,
          exportUrl,
          exportCode,
          customizeUnitCode,
          tableCustomizeUnitCode,
        } = m;
        return {
          value,
          tabKey:
            skuType === 'EC' ? `${tabKey}Ec` : skuType === 'RECEIVE' ? `${tabKey}Receive` : tabKey,
          meaning,
          skuType,
          exportUrl,
          exportCode,
          customizeUnitCode,
          tableCustomizeUnitCode,
          ds: dsMap[`ds_${value}`],
        }; // 存储构造唯一值、ds { form, table, search, getPara }
      });
      this.subTables = [...this.subTables, ..._list]; // 7 + 4 + 2
    });

    this.setActiveKey(initTabKey);

    this.state = {
      isSup,
      title,
      // initTabKey,
      prefixPath,
      attrFlag: false,
      currentPath: pathname,
      tabsCount: {}, // 不同tab组下tab总数
    };
  }

  setActiveKey = (key) => {
    if (!key) return false;
    const { skuType = 'CATA', value: skuStatus = '1' } =
      this.subTables.find((f) => f.tabKey === key) || {};
    initState.skuType = skuType;
    initState.skuStatus = skuStatus;
    initState.defaultKey[skuType] = key;
  };

  getActiveKey = () => {
    const { skuType, skuStatus } = initState;
    const { tabKey } =
      this.subTables.find((f) => f.skuType === skuType && f.value === skuStatus) || {};
    return tabKey;
  };

  initAuthCodes = () => {
    const {
      match: { path = '' },
    } = this.props;
    const code = `${path}.button.editSkuAuth`.slice(1).replace(/\//g, '.');
    this.authCodes = {
      editSkuAuth: code,
    };
  };

  componentDidMount() {
    this.initLoad();
    this.fetchAttrConfig();
    this.fetchSkuEditAuth();
    this.fetchFeedBackConfig();
  }

  // 商品反馈
  fetchFeedBackConfig = async () => {
    const res = getResponse(await fetchIsFeedBack());
    if (res) this.setState({ canFeedBack: res });
  };

  componentWillReceiveProps(nextProps) {
    const {
      location: { search },
    } = nextProps;
    const { tabKey: key } = qs.parse(search.substr(1));
    // 平台工作台卡片跳转进来更新tab
    this.setActiveKey(key);
  }

  fetchAttrConfig = async () => {
    const res = getResponse(await getSkuAttrConfig());
    if (res) this.setState({ attrFlag: res });
  };

  // 手动check权限
  fetchSkuEditAuth = async () => {
    if (skuAuths && skuAuths.length > 0) return false;
    const codes = Object.keys(this.authCodes).map((m) => this.authCodes[m]);
    const res = getResponse(await checkPermission(codes));
    if (res) {
      skuAuths = res;
      this.handleForceUpdate();
    }
  };

  isInitTabs = false; // 记录是自动触发的还是/手动触发的

  // 筛选状态的变更
  @Bind
  updateFilters(key) {
    this.setActiveKey(key);
    this.handleForceUpdate();
    this.initLoad();
    const { ds } = this.subTables.find((f) => f.tabKey === key) || {};
    if (ds && ds?.table?.getState('queryStatus') === 'ready') {
      ds.search(false);
    }
  }

  @Bind
  custTabRender(
    key,
    { firstRenderHiddenKeys: hiddenKeys = [], firstRenderHiddenGroupKeys = [] } = {}
  ) {
    const { defaultKey } = initState;
    const groups = Object.keys(defaultKey);
    const hiddenGroupKeys = firstRenderHiddenGroupKeys.map((m) => m.toLocaleUpperCase()); // 个性化code是小写
    // 当前默认tab组被隐藏， 重设默认值
    if (hiddenGroupKeys.length > 0 && hiddenGroupKeys.includes(initState.skuType)) {
      const newGroup = groups.find((_key) => !hiddenGroupKeys.includes(_key));
      initState.skuType = newGroup;
    }
    if (hiddenKeys.length > 0) {
      // 其他显示tab组下有隐藏的子tab
      const showGroups = groups.filter((f) => !hiddenGroupKeys.includes(f));
      // 可能直接隐藏组下所有子tab去隐藏tab组, 选列表中第一个符合条件的组显示
      const config =
        this.subTables.find(
          (tab) => tab.skuType === initState.skuType && !hiddenKeys.includes(tab.tabKey)
        ) || this.subTables.find((tab) => !hiddenKeys.includes(tab.tabKey));

      if (config) {
        const { skuType, value } = config;
        initState.skuType = skuType;
        if (hiddenKeys.includes(defaultKey[skuType])) {
          initState.skuStatus = value;
        }
        // 修改其他显示tab组下默认子tab key
        showGroups.forEach((f) => {
          if (hiddenKeys.includes(defaultKey[f])) {
            const { tabKey } =
              this.subTables.find((tab) => tab.skuType === f && !hiddenKeys.includes(tab.tabKey)) ||
              {};
            // 该tab组下其余的非隐藏下第一个tab作为默认
            if (tabKey) {
              defaultKey[f] = tabKey;
            }
          }
        });
      }
    }
  }

  // 强制更新组件render
  @Bind
  handleForceUpdate() {
    const { _update = 0 } = this.state;
    this.setState({ _update: _update + 1 });
  }

  initLoad = async (skuType = initState.skuType) => {
    const activeKey = this.getActiveKey();
    // 已加载过的tab组，切换tab仅查询数量
    if (this[`${skuType}Load`]) {
      const find = this.subTables.find((f) => f.skuType === skuType && f.tabKey === activeKey);
      if (find) {
        const { queryCount = () => null } = find.ds;
        const res = await queryCount();
        if (getResponse(res)) {
          this.setState(({ tabsCount: pre }) => ({
            tabsCount: { ...pre, [find.tabKey]: res.totalElements || 0 },
          }));
        }
      }
      return false;
    }
    const apis = [];
    this.subTables.forEach(async (f) => {
      if (f.skuType === skuType) {
        const { queryCount = () => null } = f.ds;
        apis.push(queryCount);
      }
    });
    // 数量查询完毕统一更新数量
    Promise.all(apis.map((api) => api())).then((res) => {
      const tabsCount = {};
      // 当前tab组下
      this.subTables
        .filter((f) => f.skuType === skuType)
        .forEach((s, idx) => {
          tabsCount[s.tabKey] = res[idx]?.totalElements || 0;
        });
      this.setState({ tabsCount: { ...this.state.tabsCount, ...tabsCount } });
    });
    this[`${skuType}Load`] = true;
  };

  // 手工创建
  @Bind
  handleManualCreate() {
    const { prefixPath } = this.state;
    const { skuType } = initState;
    this.props.history.push(`${prefixPath}/create?req=${skuType.toLocaleLowerCase()}`);
  }

  // 引用物料创建
  @Debounce(500)
  @Bind
  handleCreateWithItem() {
    c7nModal({
      style: { width: 742 },
      children: (
        <ItemSearchbarTable push={this.props.history.push} prefixPath={this.state.prefixPath} />
      ),
      title: intl.get('smpc.workbench.view.createWithItem').d('引用物料新建'),
      okText: intl.get('hzero.common.button.create').d('新建'),
    });
  }

  // 引用价格库
  @Bind
  handleQuotePrice() {
    const modal = PriceLib.create({
      type: 'sku',
      searchCode: 'SMPC.PRICE_LIB.PUR_SEARCH_BAR',
      customizedCode: 'SMPC.PRICE_LIB.LIST',
      afterSuccess: (res) => {
        // 后端返回的字符串， 没有返回时拿到的是 {}
        if (['string', 'number'].includes(typeof res)) {
          // 单条引用价格库创建，直接跳转到商品页
          this.props.history.push({
            pathname: `${this.state.prefixPath}/create`,
            search: qs.stringify(
              filterNullValueObject({
                spuId: res,
              })
            ),
          });
        } else {
          notification.success();
          this.handleSearch();
          modal.close();
        }
      },
    });
  }

  // 图片导入
  @Bind
  handleImportImage() {
    const { prefixPath } = this.state;
    const { skuType } = initState;
    this.props.history.push(`${prefixPath}/img-import?skuType=${skuType}`);
  }

  // 导入
  @Bind
  openImport({ code, intlCode, args }) {
    const { currentPath } = this.state;
    openTab({
      key: `/smpc/data-import/${code}`,
      title: intlCode,
      search: qs.stringify(
        filterNullValueObject({
          args,
          action: intlCode,
          backPath: currentPath,
        })
      ),
    });
  }

  // 导入商品
  @Bind
  handleImportSku() {
    this.openImport({
      code: 'SMPC.SKU_IMPORT',
      intlCode: 'srm.common.view.batchImportSku',
    });
  }

  // 批量上架/下架导入
  @Bind
  handleBatchImport() {
    this.openImport({
      code: 'SMPC.SKU_SHELF_IMPORT_EC',
      intlCode: 'srm.common.view.productImport',
    });
  }

  // 导入库存
  @Bind
  handleImportStock() {
    this.openImport({
      code: 'SMPC.SKU_STOCK_SALE_IMPORT',
      intlCode: 'srm.common.view.batchImportStock',
      args: JSON.stringify({
        stockType: 'SALE',
        templateCode: 'SMPC.SKU_STOCK_SALE_IMPORT',
      }),
    });
  }

  // 导入打标
  @Bind
  handleImportLabel() {
    this.openImport({
      code: 'SMPC.SKU_LABEL_IMPORT',
      intlCode: 'srm.common.view.skuLabelImport',
    });
  }

  // 批量修改价格 -导入
  @Bind
  handleEditPrice() {
    this.openImport({
      code: 'SMPC.SKU_BATCH_UPDATE',
      intlCode: 'srm.common.view.batchEditProInfo',
    });
  }

  // 评价管理
  @Bind
  handleComment() {
    openTab({
      key: '/smpc/sku-evaluate',
      title: intl.get('smpc.workbench.view.skuCommentManage').d('商品评价管理'),
    });
  }

  @Bind
  sameSkuFeedbackManage() {
    const { prefixPath } = this.state;
    this.props.history.push(`${prefixPath}/sku-feedback`);
  }

  // 标签定义
  @Bind
  handleLabelConfig() {
    openTab({
      key: '/s2-mall/product/label-config',
      title: intl.get('smpc.workbench.view.skuLabelConfig').d('商品标签定义'),
    });
  }

  // 定制品属性模版
  handleAttrTemplate = () => {
    const { prefixPath } = this.state;
    this.props.history.push(`${prefixPath}/custom-attr-template`);
  };

  // 商品组合
  handleSkuCompose = throttle(async () => {
    const {
      ds: { table },
    } = this.getSubTableProps();
    const skuIds = [];
    const skus = table.selected.map((m) => {
      const line = m.toData();
      skuIds.push(line.skuId);
      return { ...line, skuCodeName: `${line.skuCode},${line.skuName}` };
    });
    const res = getResponse(await checkSkuCompose(skuIds));
    if (res) {
      c7nModal({
        style: { width: 742 },
        children: (
          <SkuCompose
            skus={skus}
            showSuggestionText
            afterSuccess={() => {
              this.handleEvents('handleSearch', false);
            }}
          />
        ),
        title: intl.get('smpc.product.view.title.skuCompose').d('商品组合'),
        okText: intl.get('smpc.product.button.compose').d('组合'),
        okProps: { disabled: true },
      });
    }
  }, 1000);

  // 生效
  @Bind
  handleValid() {
    const {
      ds: { table },
    } = this.getSubTableProps();
    openTextArea({
      title: intl.get('smpc.workbench.view.batchValid').d('批量生效'),
      name: 'remark',
      label: intl.get('smpc.product.view.validReason').d('生效原因'),
      maxLength: 100,
      onOk: (param) => {
        const bodyData = table.selected.map((m) => ({ ...m.toData(), ...param }));
        return this.handleBatchApi({ api: batchValid, args: [bodyData] });
      },
    });
  }

  // 失效
  @Bind
  handleInvalid() {
    const {
      ds: { table },
    } = this.getSubTableProps();
    openTextArea({
      title: intl.get('smpc.workbench.view.batchInvalid').d('批量失效'),
      name: 'remark',
      label: intl.get('smpc.product.view.invalidReason').d('失效原因'),
      maxLength: 100,
      onOk: (param) => {
        const bodyData = table.selected.map((m) => ({ ...m.toData(), ...param }));
        return this.handleBatchApi({ api: batchInvalid, args: [bodyData] });
      },
    });
  }

  // 审批
  @Bind
  handleBatchApprove(type) {
    const {
      ds: { table },
    } = this.getSubTableProps();
    const data = table.selected.map((m) => m.toData());

    const approveFn = async (params, suffix) => {
      table.setState('approve', 'submit');
      const result = getResponse(
        await approveOrReject({ skuApproveDTOS: data, ...params }, suffix)
      );
      table.setState('approve', null);
      if (result) {
        notification.success();
        this.handleSearch(false);
      }
    };

    if (type === 'pass') {
      return approveFn(
        {
          approvalFlag: 2,
        },
        'approve'
      );
    } else if (type === 'reject') {
      openTextArea({
        title: intl.get('smpc.workbench.view.approveReject').d('审批拒绝'),
        name: 'remark',
        label: intl.get('smpc.product.view.rejectReason').d('拒绝原因'),
        maxLength: 100,
        onOk: (param) => approveFn({ approvalFlag: 0, ...param }, 'reject'),
      });
    } else {
      return approveFn(
        {
          approvalFlag: 1,
        },
        'approve-and-shelf'
      );
    }
  }

  // 批量维护
  @Bind
  handleBatchSkuInfo() {
    const {
      ds: { table },
    } = this.getSubTableProps();
    const {
      remote: { event },
    } = this.props;
    const { isSup } = this.state;
    const data = table.selected.map((m) => m.toData());
    if (data.length === 0) return;
    if (data.length > 100) {
      notification.warning({
        message: intl
          .get('smpc.product.view.selecTip')
          .d('最多支持勾选100个商品，若操作量大建议使用导入功能-批量修改商品信息'),
      });
      return false;
    }
    const suppIds = [...new Set(data.map((d) => d.supplierTenantId))];
    const precision = data[0].uomPrecision;
    const multipleSuppliers = unionBy(
      data.map((m) => ({
        supplierCompanyId: m.supplierCompanyId,
        supplierCompanyName: m.supplierCompanyName,
        supplierTenantId: m.supplierTenantId,
      })),
      'supplierCompanyId'
    );
    openBatchSku({
      suppIds,
      precision,
      isSup,
      multipleSuppliers,
      onSave: (skuInfo, saleInfo) =>
        event.fireEvent('batchCataSkuInfoOnSave', {
          skuInfo,
          saleInfo,
          selectedData: data,
          handleSearch: this.handleSearch,
          api: batchSkuInfo,
        }),
      // onSave: async (skuInfo, saleInfo) => {
      //   const newData = data.map((m) => {
      //     const { skuSalesInfos, skuApproveSalesList } = m;
      //     const newSkuSalesInfos = [...(skuSalesInfos || skuApproveSalesList || [])]; // 深拷贝一波
      //     if (saleInfo) {
      //       newSkuSalesInfos.unshift(saleInfo);
      //     }
      //     return {
      //       ...m,
      //       ...skuInfo,
      //       skuSalesInfos: newSkuSalesInfos,
      //     };
      //   });
      //   const res = getResponse(await batchSkuInfo(newData));
      //   if (res) {
      //     notification.success();
      //     this.handleSearch(false);
      //   } else {
      //     return false;
      //   }
      // },
    });
  }

  @Bind
  async handleSearch(isFirst = true) {
    const {
      ds: { search = (e) => e },
    } = this.getSubTableProps();
    await search(isFirst, undefined, false);
    this.initLoad();
  }

  // 批量操作
  @Bind
  async handleBatchApi({ api, args, callback, loading, stateName }) {
    const {
      ds: { table },
    } = this.getSubTableProps();
    if (loading) table.status = 'loading';
    table.setState(stateName, true);
    const res = getResponse(await api(...args));
    table.setState(stateName, false);
    table.status = 'ready';
    if (res) {
      if (callback) {
        callback(res);
      } else {
        notification.success();
      }
      this.handleEvents('handleSearch', false);
    }
  }

  // 上架提交操作后回调
  onShelfCallback = (res) => {
    const { batchStatus, batchResult } = res;
    // 0失败 1部分成功 2 全部成功 3 电商走工作流成功
    const info = { message: batchResult };
    if ([2, 3].includes(batchStatus)) {
      notification.success(info);
    } else if (batchStatus === 1) {
      notification.warning(info);
    } else {
      notification.error(info);
    }
  };

  // 下架
  @Bind
  handleOffShelf() {
    const {
      ds: { table },
    } = this.getSubTableProps();
    openTextArea({
      title: intl.get('smpc.product.view.unshelfReason').d('下架原因'),
      name: 'unshelveRemark',
      label: intl.get('smpc.product.view.unshelfReason').d('下架原因'),
      maxLength: 100,
      onOk: (data) => {
        const list = table.selected.map((m) => ({ ...m.toData(), ...data }));
        return this.handleBatchApi({ api: batchUnShelve, args: [list] });
      },
    });
  }

  // 删除备注
  @Bind
  handleDeleteRemark() {
    const {
      ds: { table },
    } = this.getSubTableProps();
    confirm({
      title: intl.get('smpc.product.view.delModal.title').d('提示'),
      content: intl.get('smpc.product.model.deleteRemarkMsgContent').d('您确认删除备注信息？'),
      onOk: async () => {
        const filters = table.selected.filter((s) => s.get('shelfRemark'));
        const list = filters.map((m) => ({ ...m.toData(), shelfRemark: null }));
        return this.handleBatchApi({ api: batchRemarks, args: [list] });
      },
    });
  }

  // 商品预览
  @Bind
  handlePreview(record) {
    const status = initState.skuStatus;
    const { skuType } = initState;
    const {
      location: { pathname },
    } = this.props;
    const {
      skuId: productId,
      sourceFrom,
      // purSkuStatus,
      skuTemporaryId,
      __versionId, // 前端构造的待审批页签子节点
      approveType,
      receiveFlag,
      approveStatus,
    } = record.toData();

    // 是否为已生效
    // const isValid = status !== '7' && purSkuStatus === 7;
    // 是否查最新审批表数据
    // const isNew = isValid || status === '5' || status === '6';
    const isNew = !['2', '7'].includes(status) && skuType === 'CATA'; // 待提交、已失效
    // 是否为功能待审批
    const isWApprove = approveStatus === 'WAITING';

    openTab({
      key: '/smpc/sku-preview',
      title: 'srm.common.view.skuPreview',
      search: qs.stringify(
        filterNullValueObject({
          productId,
          sourceFrom,
          tabKey: skuType,
          approveType, // 待审批商品进入预览页面，必传
          closePath: pathname,
          skuTemporaryId: __versionId || !['5', '6'].includes(status) ? undefined : skuTemporaryId,
          btnFlag: isWApprove && !__versionId ? 'y' : 'n',
          req: receiveFlag === 1 ? 'receive' : isNew && !__versionId ? 'new' : '',
        })
      ),
    });
  }

  // 电商商品池-编辑商品信息
  @Bind
  handleBatchTag() {
    const { isSup } = this.state;
    const {
      ds: { table },
    } = this.getSubTableProps();
    if (!table) return;
    const batchData = table.selected.map((m) => m.toData());
    if (batchData.length === 0) return;
    if (batchData.length > 100) {
      notification.warning({
        message: intl
          .get('smpc.product.view.selecTip')
          .d('最多支持勾选100个商品，若操作量大建议使用导入功能-批量修改商品信息'),
      });
      return false;
    }
    // 勾选的sku 供应商集合
    const multipleSuppliers = unionBy(
      batchData.map((m) => ({
        supplierCompanyId: m.supplierCompanyId,
        supplierCompanyName: m.supplierCompanyName,
        supplierTenantId: m.supplierTenantId,
      })),
      'supplierCompanyId'
    );
    openLabels({
      isSup,
      multipleSuppliers,
      onSave: async (formData) => {
        const skuData = batchData.map((m) => ({ ...m, ...formData[0] }));
        const res = await batchEditECInfo(skuData);
        if (getResponse(res)) {
          notification.success();
          this.handleEvents('handleSearch', false);
        } else {
          return false;
        }
      },
      ds: table,
    });
  }

  // 绑定待审批得的dom
  handleBindRef = (ref) => {
    this.tableRef = ref;
  };

  // 单个上下架
  handleSingleShelf = (skus, purSkuStatus) => {
    const {
      remote: { event },
    } = this.props;
    // 下架
    if (purSkuStatus === 1) {
      openTextArea({
        title: intl.get('smpc.product.view.unshelfReason').d('下架原因'),
        name: 'unshelveRemark',
        label: intl.get('smpc.product.view.unshelfReason').d('下架原因'),
        maxLength: 100,
        onOk: (data) => {
          return this.handleBatchApi({
            api: batchUnShelve,
            args: [skus.map((m) => ({ ...m, ...data }))],
            loading: true,
          });
        },
      });
    } else {
      event.fireEvent('cuxHandleSingleShelf', {
        skus,
        onOk: (cuxParam = []) =>
          this.handleBatchApi({
            api: batchPutAway,
            args: [cuxParam.length ? cuxParam : skus.map((m) => m)], // 先走二开
            loading: true,
            callback: this.onShelfCallback,
          }),
      });
    }
  };

  // 批量提交
  handleBatchSubmit = (ds) => {
    const spuIds = ds.selected.map((m) => m.get('spuId'));
    return this.handleBatchApi({
      api: batchSubmit,
      args: [spuIds],
      loading: true,
      callback: this.onShelfCallback,
    });
  };

  // 子组件事件分发
  @Bind
  handleEvents(eventName, param) {
    const { [eventName]: refEvent = (e) => e } = this;
    return refEvent(param);
  }

  // 批量弃用
  @Bind()
  batchDeprecation() {
    const {
      ds: { table },
    } = this.getSubTableProps();
    const { skuType } = initState;
    const api = skuType === 'RECEIVE' ? receiveDeprecation : batchDeprecate;
    const bodyData = table.selected.map((m) => m.toData());
    this.handleBatchApi({
      api,
      args: [bodyData, 0],
    });
  }

  // 分配领用规则
  @Bind()
  async allocateReceiveRule(ids) {
    const {
      ds: { table },
    } = this.getSubTableProps();
    const bodyData = table.selected.map((m) => ({ ...m.toData(), saleAgreementHeaderIdList: ids }));
    return this.handleBatchApi({
      api: receiveSkuAssign,
      args: [bodyData],
      loading: true,
    });
  }

  // 领用库存管理
  // @Bind()
  // handleReceiveStockManage() {
  //   const { skuType } = initState;
  //   this.props.history.push(`/smpc/stock-manage-pur?tabKey=${skuType}`);
  // }

  @Bind()
  handleReceiveRuleManage() {
    this.props.history.push(`/sagm/sale-agreement-workbench/list?req=receive`);
  }

  @Bind()
  handleBatchRestore() {
    const {
      ds: { table },
    } = this.getSubTableProps();
    const bodyData = table.selected.map((m) => m.toData());
    this.handleBatchApi({
      api: receiveStore,
      args: [bodyData],
    });
  }

  // 批量恢复
  @Bind()
  batchRecovery() {
    const {
      ds: { table },
    } = this.getSubTableProps();
    const bodyData = table.selected.map((m) => m.toData());
    this.handleBatchApi({
      api: batchRecovery,
      args: [bodyData, 0],
    });
  }

  // 批量上传图片
  handleBatchUploadImg = () => {
    const {
      ds: { table },
    } = this.getSubTableProps();
    const selectData = table.selected.map((m) => m.toData());
    openUploadImg({ data: selectData, onSuccess: () => this.handleSearch(false) });
  };

  // 复制商品弹窗
  openCopyModal = () => {
    const {
      ds: { table },
    } = this.getSubTableProps();
    c7nModal({
      style: { width: 350 },
      bodyStyle: { padding: 0 },
      children: (
        <SkuCopy selectSkus={table.selected} afterCallback={() => table.query(table.currentPage)} />
      ),
      title: intl.get('smpc.product.view.title.skuCopy').d('商品复制'),
    });
  };

  handleFeedBack = () => {
    const {
      ds: { table },
    } = this.getSubTableProps();
    if (table.selected.length > 100) {
      Modal.confirm({
        title: intl.get('smpc.product.view.delModal.title').d('提示'),
        children: intl.get('smpc.workbench.view.feedBack.title').d('最多勾选100个商品进行反馈'),
        okCancel: true,
      });
    } else {
      openSkuFeedback({
        selected: table.selected,
        callBack: () => {
          notification.success();
          table.query(table.currentPage);
        },
      });
    }
  };

  // 创建领用商品
  // throttle 不要写在render上， 组件每次重新渲染了导致节流不生效
  handleCreateReceiveSku = throttle(async () => {
    const {
      ds: { table },
    } = this.getSubTableProps();
    const skuList = table.selected.map((m) => m.toData());
    return this.handleBatchApi({
      api: createReceiveSku,
      stateName: 'receive',
      args: [
        {
          priceCopyFlag: 2,
          skuList,
        },
      ],
    });
  }, 8000);

  // 电商按商品条件批量操作
  @Bind()
  skuConditionOperate() {
    c7nModal({
      style: { width: 380 },
      title: intl.get('smpc.workbench.view.btn.skuConditionOperate').d('按商品条件批量操作'),
      children: <SkuCondition />,
    });
  }

  @Bind()
  handleNewPackage() {
    const {
      ds: { table },
    } = this.getSubTableProps();
    openNewPackageSku({
      selected: table.selected,
      prefixPath: this.state.prefixPath,
      history: this.props.history,
    });
  }

  // 领用商品操作按钮禁用
  getIsReceive = (records) => {
    return records.some((s) => s.get('receiveFlag') === 1);
  };

  // 电商审批中状态 不可弃用/上架
  getIsECApprovaing = (data) => {
    const { skuType } = initState;
    return skuType === 'EC' && data.some((d) => d.get('purSkuStatus') === 13);
  };

  btnsFilter = (btns) => {
    return btns.filter((f) => !('show' in f) || f.show);
  };

  // 顶部按钮控制
  @Bind
  getButtons() {
    const {
      match: { path = '' },
      remote: { event },
    } = this.props;
    const { attrFlag, canFeedBack } = this.state;
    const { skuType, skuStatus: status } = initState;
    const { approve: editSkuAuth = true } =
      skuAuths.find((f) => f.code === this.authCodes.editSkuAuth) || {};
    const { ds, exportUrl, exportCode: custExportCode } = this.getSubTableProps();
    // attrFlag为 false + exports
    const urlSplits = exportUrl.split('/');
    urlSplits[4] = `exports/${urlSplits[4]}`;
    const requestUrl = skuType === 'CATA' ? urlSplits.join('/') : exportUrl;
    const preExportCode =
      skuType === 'CATA'
        ? !attrFlag
          ? 'SMPC_SKU_EXPORT'
          : 'SMPC_SKU_HAS_ATTR_EXPORT'
        : 'SMPC_EC_SKU_EXPORT';

    const exportCode = custExportCode || preExportCode;

    const btnTypes = {
      CATA: [
        {
          name: 'skuCreate',
          group: true,
          child: (
            <DropdownBtn
              primary
              icon="add"
              color="primary"
              text={intl.get('smpc.workbench.view.createSku').d('新建商品')}
            />
          ),
          show: skuType === 'CATA' && status !== '7',
          children: [
            {
              name: 'manualCreate',
              btnType: 'c7n-pro',
              child: intl.get('smpc.workbench.view.createManual').d('手动新建'),
              btnProps: {
                funcType: 'flat',
                onClick: this.handleManualCreate,
              },
            },
            {
              name: 'quoteLibPrice',
              btnType: 'c7n-pro',
              child: intl.get('smpc.workbench.view.quotePrice').d('引用价格库'),
              btnProps: {
                funcType: 'flat',
                onClick: this.handleQuotePrice,
              },
            },
            {
              name: 'quotePriceImportNew',
              btnType: 'c7n-pro',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                btnComp: ImportButton,
                prefixPatch: '/sagm',
                refreshButton: true,
                changeServicePrefix: true,
                buttonText: intl
                  .get('smpc.workbench.view.quotePriceImportNew')
                  .d('(新)引用价格库导入'),
                successCallBack: () => this.handleSearch(),
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                },
                businessObjectTemplateCode: 'SAGM.PIRCE_LIB_IMPORT',
              },
            },
            {
              name: 'skuBatchImport',
              btnType: 'c7n-pro',
              child: intl.get('srm.common.view.batchImportSku').d('商品批量导入'),
              btnProps: {
                funcType: 'flat',
                onClick: this.handleImportSku,
              },
            },
            {
              name: 'skuBatchImportNew',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                btnComp: ImportButton,
                prefixPatch: '/smpc',
                refreshButton: true,
                changeServicePrefix: true,
                buttonText: intl.get('smpc.product.button.skuBatchImportNew').d('(新)商品批量导入'),
                successCallBack: () => this.handleSearch(),
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                },
                businessObjectTemplateCode: 'SMPC.SKU_IMPORT',
              },
            },
            {
              name: 'copySku',
              btnComp: MenuItemLinkBtn,
              show: !['5', '6'].includes(status),
              btnProps: {
                onClick: this.openCopyModal,
                dataSet: ds.table,
                getDisable: (data = []) => data.length === 0 || this.getIsReceive(data),
                getTooltip: (dataSet) => {
                  if (this.getIsReceive(dataSet.selected)) {
                    return intl
                      .get('smpc.product.view.receiveSkuDisableAction')
                      .d('领用商品不支持该操作');
                  }
                },
                text: intl.get('smpc.product.view.copySku').d('复制商品'),
              },
            },
            {
              name: 'newPackageSku',
              btnType: 'c7n-pro',
              child: intl.get('smpc.workbench.view.createPackageSku').d('新建套餐商品'),
              btnProps: {
                funcType: 'flat',
                onClick: this.handleNewPackage,
              },
            },
          ],
        },
        {
          name: 'batchShelf',
          show: status === '4',
          child: intl.get('smpc.workbench.view.batchOnShelf').d('批量上架'),
          observerBtnProps: () => ({
            funcType: 'flat',
            icon: 'publish',
            disabled: ds.table.selected.length === 0 || this.getIsECApprovaing(ds.table.selected),
            onClick: () =>
              event.fireEvent('handleOnShelf', {
                ds: ds.table,
                onOk: (cuxParam = []) => {
                  const bodyData = cuxParam.length
                    ? cuxParam
                    : ds.table.selected.map((m) => m.toData()); // 先走二开
                  return this.handleBatchApi({
                    api: batchPutAway,
                    args: [bodyData, 0],
                    callback: this.onShelfCallback,
                  });
                },
              }),
          }),
        },
        {
          name: 'batchUnshelf',
          show: status === '3',
          child: intl.get('smpc.workbench.view.batchUnShelf').d('批量下架'),
          observerBtnProps: () => ({
            funcType: 'flat',
            icon: 'get_app',
            disabled: ds.table.selected.length === 0,
            onClick: () => this.handleOffShelf(),
          }),
        },
        {
          name: 'batchSubmit',
          show: skuType === 'CATA' && status === '2',
          child: intl.get('smpc.product.view.button.batchSubmit').d('批量提交'),
          observerBtnProps: () => ({
            funcType: 'flat',
            icon: 'check',
            onClick: () => this.handleBatchSubmit(ds.table),
            disabled: ds.table.selected.length < 1,
          }),
        },
        {
          name: 'batchEdit',
          group: true,
          show: skuType === 'CATA' && !['5', '7'].includes(status),
          child: (
            <DropdownBtn
              icon="mode_edit"
              funcType="flat"
              text={intl.get('smpc.workbench.view.batchMatain').d('批量编辑')}
            />
          ),
          children: [
            {
              name: 'batchUpdateSku',
              child: intl.get('smpc.workbench.view.batchEditProInfo').d('批量修改商品信息'),
              btnProps: {
                onClick: this.handleEditPrice,
              },
            },
            {
              name: 'batchUpdateSkuNew',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                prefixPatch: '/smpc',
                refreshButton: true,
                changeServicePrefix: true,
                btnComp: ImportButton,
                buttonText: intl
                  .get('smpc.product.button.batchEditSkuInfoNew')
                  .d('(新)批量修改商品信息'),
                successCallBack: () => this.handleSearch(),
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                },
                businessObjectTemplateCode: 'SMPC.SKU_BATCH_UPDATE',
              },
            },
            {
              name: 'skuEdit',
              btnComp: MenuItemLinkBtn,
              show: !['5', '6', '7'].includes(status),
              btnProps: {
                dataSet: ds.table,
                getTooltip: (dataSet) => {
                  if (this.getIsReceive(dataSet.selected)) {
                    return intl
                      .get('smpc.product.view.receiveSkuDisableAction')
                      .d('领用商品不支持该操作');
                  }
                },
                getDisable: (data = []) => data.length < 1 || this.getIsReceive(data),
                onClick: () => this.handleEvents('handleBatchSkuInfo'),
                text: intl.get('smpc.workbench.view.matainSkuInfo').d('编辑商品信息'),
              },
            },
            {
              name: 'imageImport',
              child: intl.get('smpc.workbench.view.imageImport').d('导入图片'),
              btnProps: {
                onClick: this.handleImportImage,
              },
            },
            {
              name: 'batchUploadImage',
              child: intl.get('smpc.product.view.batchUploadImg').d('批量上传图片'),
              show: !['5', '7'].includes(status),
              observerBtnProps: () => ({
                onClick: this.handleBatchUploadImg,
                disabled: ds.table.selected.length === 0,
              }),
            },
            {
              name: 'labelImport',
              show: skuType === 'CATA' && !['5', '7'].includes(status),
              child: intl.get('srm.common.view.skuLabelImport').d('导入标签'),
              btnProps: {
                onClick: this.handleImportLabel,
              },
            },
            {
              name: 'labelImportNew',
              show: skuType === 'CATA' && !['5', '7'].includes(status),
              btnComp: MenuItemLinkBtn,
              btnProps: {
                prefixPatch: '/smpc',
                refreshButton: true,
                btnComp: ImportButton,
                buttonText: intl.get('smpc.product.button.importLabelNew').d('(新)导入标签'),
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                },
                businessObjectTemplateCode: 'SMPC.SKU_LABEL_IMPORT',
              },
            },
            {
              name: 'batchDeleteRemark',
              child: intl.get('smpc.workbench.view.batchDeleteRemark').d('批量删除备注'),
              observerBtnProps: () => ({
                disabled: !ds.table.selected.some((s) => s.get('shelfRemark')),
                onClick: this.handleDeleteRemark,
              }),
            },
            {
              name: 'stockImport',
              child: intl.get('srm.common.view.batchImportStock').d('导入库存'),
              btnProps: {
                onClick: this.handleImportStock,
              },
            },
            {
              name: 'stockImportNew',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                btnComp: ImportButton,
                prefixPatch: '/smpc',
                refreshButton: true,
                buttonText: intl.get('smpc.product.button.importStockNew').d('(新)导入库存'),
                successCallBack: () => this.handleSearch(),
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                },
                args: {
                  stockType: 'SALE',
                  templateCode: 'SMPC.SKU_STOCK_SALE_IMPORT',
                },
                businessObjectTemplateCode: 'SMPC.SKU_STOCK_SALE_IMPORT',
              },
            },
          ],
        },
        {
          name: 'batchApprove',
          group: true,
          show: skuType === 'CATA' && status === '5',
          child: (
            <DropdownBtn
              icon="authorize"
              funcType="flat"
              text={intl.get('smpc.workbench.view.batchApprove').d('批量审批')}
            />
          ),
          children: [
            {
              name: 'approveOn',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                dataSet: ds.table,
                getDisable: (data = []) => data.length === 0,
                onClick: () => this.handleEvents('handleBatchApprove', 'pass'),
                getLoading: (dataSet) => dataSet.getState('approve') === 'submit',
                text: intl.get('smpc.workbench.view.approvePass').d('审批通过'),
              },
            },
            {
              name: 'approveOff',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                dataSet: ds.table,
                getDisable: (data = []) => data.length === 0,
                onClick: () => this.handleEvents('handleBatchApprove', 'reject'),
                getLoading: (dataSet) => dataSet.getState('approve') === 'submit',
                text: intl.get('smpc.workbench.view.approveReject').d('审批拒绝'),
              },
            },
            {
              name: 'approveOnShelf',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                dataSet: ds.table,
                getDisable: (data = []) =>
                  data.length === 0 || data.some((i) => i.get('approveType') === 'INVALID'),
                onClick: () => this.handleEvents('handleBatchApprove', 'passShelf'),
                getLoading: (dataSet) => dataSet.getState('approve') === 'submit',
                text: intl.get('smpc.workbench.view.approveAndShelf').d('审批通过并上架'),
              },
            },
          ],
        },
        {
          name: 'batchExportNew',
          show: skuType === 'CATA',
          btnComp: MenuItemLinkBtn,
          btnProps: {
            isExport: true,
            method: 'POST',
            allBody: true,
            dataSet: ds.table,
            requestUrl,
            exportAsync: true,
            templateCode: exportCode, // 区分配置表
            queryParams: (_ds) =>
              _ds.selected.length > 0
                ? {
                    ...ds.getDefaultPara(),
                    exportSkuIds: _ds.selected.map((m) => m.get('skuId')),
                  }
                : ds.getPara(),
            buttonText:
              ds?.selected?.length > 0
                ? intl.get('smpc.product.button.selectBatchExportNew').d('勾选导出(新)')
                : intl.get('smpc.product.button.batchExportNew').d('(新)批量导出'),
            otherButtonProps: {
              funcType: 'flat',
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: `${path}.button.cata-sku-export-new`,
                  type: 'button',
                  meaning: '商品工作台采-(新)目录化批量导出',
                },
              ],
            },
          },
        },
        {
          name: 'batchValid',
          child: intl.get('smpc.workbench.view.batchValid').d('批量生效'),
          show: status === '7',
          observerBtnProps: () => ({
            funcType: 'flat',
            icon: 'verified_user-o',
            onClick: () => this.handleValid(),
            disabled: ds.table.selected.length === 0,
          }),
        },
        {
          name: 'batchExport',
          show: skuType === 'CATA',
          btnComp: MenuItemLinkBtn,
          btnProps: {
            btnComp: ExportButton,
            icon: 'upload',
            headBtn: true,
            exportAsync: true,
            requestUrl,
            getQueryParams: () => ds.getPara(),
            buttonText: intl.get('smpc.workbench.view.batchExport').d('批量导出'),
          },
        },
        {
          name: 'batchInvalid',
          child: intl.get('smpc.workbench.view.batchInvalid').d('批量失效'),
          show: skuType === 'CATA' && !['5', '6', '7'].includes(status),
          observerBtnProps: () => ({
            funcType: 'flat',
            icon: 'not_interested',
            onClick: () => this.handleInvalid(),
            disabled: ds.table.selected.length === 0,
          }),
        },
        {
          name: 'skuOptsImport',
          child: intl.get('srm.common.view.productImport').d('导入商品操作'),
          show: skuType === 'CATA' && status !== '7',
          btnProps: {
            icon: 'archive',
            onClick: this.handleBatchImport,
          },
        },
        {
          name: 'skuOptsImportNew',
          btnComp: MenuItemLinkBtn,
          show: skuType === 'CATA' && status !== '7',
          btnProps: {
            style: { paddingLeft: 0 },
            prefixPatch: '/smpc',
            refreshButton: true,
            btnComp: ImportButton,
            buttonText: intl.get('smpc.product.button.skuOptImportNew').d('(新)导入商品操作'),
            successCallBack: () => this.handleSearch(),
            buttonProps: {
              icon: 'archive',
              funcType: 'flat',
            },
            businessObjectTemplateCode: 'SMPC.SKU_SHELF_IMPORT',
          },
        },
        {
          name: 'createReceiveMain',
          btnType: 'c7n-pro',
          show: skuType === 'CATA' && status === '1',
          child: intl.get('smpc.workbench.view.createReceiveSku').d('生成领用商品'),
          observerBtnProps: () => ({
            funcType: 'flat',
            icon: 'add',
            onClick: () => this.handleCreateReceiveSku(),
            disabled: ds.table.selected.length < 1,
          }),
        },
        {
          name: 'skuCompose',
          child: intl.get('smpc.product.view.button.skuCompose').d('商品组合'),
          show: skuType === 'CATA' && !['5', '6', '7'].includes(status),
          observerBtnProps: () => ({
            icon: 'project',
            disabled: ds.table.selected.length < 2,
            onClick: this.handleSkuCompose,
          }),
        },
        {
          name: 'skuLabelConfig',
          show: skuType === 'CATA' && !['5', '7'].includes(status),
          child: intl.get('smpc.workbench.view.button.skuLabelConfig').d('商品标签定义'),
          btnProps: {
            icon: 'local_offer',
            onClick: this.handleLabelConfig,
          },
        },
        {
          name: 'skuComment',
          show: skuType === 'CATA' && !['5', '7'].includes(status),
          child: intl.get('smpc.workbench.view.skuCommentManage').d('商品评价管理'),
          btnProps: {
            icon: 'message',
            onClick: this.handleComment,
          },
        },
        {
          name: 'custSkuTemp',
          show: skuType === 'CATA' && !['5', '7'].includes(status),
          child: intl.get('smpc.product.view.customAttrTitle').d('定制品属性模版管理'),
          btnProps: {
            icon: 'record_test',
            onClick: this.handleAttrTemplate,
          },
        },
        {
          name: 'historyVersion',
          btnComp: MenuItemLinkBtn,
          show: skuType === 'CATA' && status === '5',
          btnProps: {
            btnComp: ObserverBtn,
            dataSet: ds.table,
            funcType: 'flat',
            icon: 'baseline-arrow_drop_down',
            getText: () => {
              // 所有的都展开才为收起
              const canExpandRecords = ds.table.records.filter(
                (f) => !f.get('__versionId') && f.get('approvalFrom') !== 'SAGM'
              );
              const isExpanded =
                canExpandRecords.length && canExpandRecords.every((s) => s.isExpanded);
              if (isExpanded) {
                return intl.get('smpc.product.model.collapseHistoryVersion').d('收起历史版本');
              } else {
                return intl.get('smpc.product.model.expandHistoryVersion').d('展开历史版本');
              }
            },
            getDisable: () => {
              const canExpand = ds.table.records.some((s) => {
                return !s.get('__versionId') && s.get('approvalFrom') !== 'SAGM';
              });
              return !canExpand;
            },
            onClick: () => {
              const canExpandRecords = ds.table.records.filter(
                (f) => !f.get('__versionId') && f.get('approvalFrom') !== 'SAGM'
              );
              const isExpanded = canExpandRecords.every((s) => s.isExpanded);
              const { handleExpand = (e) => e, handleCollapse = (e) => e } = this.tableRef || {};
              if (isExpanded) {
                handleCollapse();
              } else {
                handleExpand();
              }
            },
            text: intl.get('smpc.product.model.expandHistoryVersion').d('展开历史版本'),
          },
        },
        {
          name: 'cataBatchUpdateStock',
          show: skuType === 'CATA',
          btnComp: MenuItemLinkBtn,
          btnProps: {
            prefixPatch: '/smpc',
            refreshButton: true,
            btnComp: ImportButton,
            buttonText: intl
              .get('smpc.product.button.cataBatchUpdateStock')
              .d('批量更新库存管理标识'),
            successCallBack: () => this.handleSearch(),
            buttonProps: {
              icon: '',
              funcType: 'flat',
            },
            businessObjectTemplateCode: 'CUS.JINKOSOLAR_STOCK_FLAG_IMPORT',
          },
        },
      ],
      EC: [
        {
          name: 'ecBatchShelf',
          show: status === '4',
          child: intl.get('smpc.workbench.view.batchOnShelf').d('批量上架'),
          observerBtnProps: () => ({
            icon: 'publish',
            color: 'primary',
            disabled: ds.table.selected.length === 0 || this.getIsECApprovaing(ds.table.selected),
            onClick: () =>
              event.fireEvent('handleOnShelf', {
                ds: ds.table,
                onOk: (cuxParam = []) => {
                  const bodyData = cuxParam.length
                    ? cuxParam
                    : ds.table.selected.map((m) => m.toData()); // 先走二开
                  return this.handleBatchApi({
                    api: batchPutAway,
                    args: [bodyData, 0],
                    callback: this.onShelfCallback,
                  });
                },
                skuType: 'EC',
              }),
          }),
        },
        {
          name: 'ecBatchUnshelf',
          show: status === '3',
          child: intl.get('smpc.workbench.view.batchUnShelf').d('批量下架'),
          observerBtnProps: () => ({
            icon: 'get_app',
            color: 'primary',
            disabled: ds.table.selected.length === 0,
            onClick: () => this.handleOffShelf(),
          }),
        },
        {
          name: 'batchExportEc',
          show: skuType === 'EC' && status !== '8',
          btnComp: MenuItemLinkBtn,
          btnProps: {
            btnComp: ExportButton,
            icon: 'unarchive',
            headBtn: true,
            exportAsync: true,
            requestUrl,
            getQueryParams: () => ds.getPara(),
            buttonText: intl.get('smpc.workbench.view.batchExport').d('批量导出'),
            permission: true,
            permissionList: [
              {
                code: `${path}.button.batchExport`,
                type: 'button',
                meaning: '商品工作台（采）-批量导出',
              },
            ],
          },
        },
        {
          name: 'batchExportEcNew',
          show: skuType === 'EC',
          btnComp: MenuItemLinkBtn,
          btnProps: {
            method: 'POST',
            allBody: true,
            isExport: true,
            dataSet: ds.table,
            requestUrl,
            exportAsync: true,
            templateCode: exportCode, // 区分配置表
            queryParams: (_ds) =>
              _ds.selected.length > 0
                ? {
                    ...ds.getDefaultPara(),
                    exportSkuIds: _ds.selected.map((m) => m.get('skuId')),
                  }
                : ds.getPara(),
            buttonText:
              ds?.selected?.length > 0
                ? intl.get('smpc.product.button.selectBatchExportNew').d('勾选导出(新)')
                : intl.get('smpc.product.button.batchExportNew').d('(新)批量导出'),
            otherButtonProps: {
              funcType: 'flat',
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: `${path}.button.ec-sku-export-new`,
                  type: 'button',
                  meaning: '商品工作台采-(新)电商批量导出',
                },
              ],
            },
          },
        },
        {
          name: 'batchRestore',
          show: skuType === 'EC' && status === '8',
          child: intl.get('smpc.workbench.view.btn.batchRecovery').d('批量恢复'),
          observerBtnProps: () => ({
            funcType: 'flat',
            icon: 'restore_page',
            disabled: ds.table.selected.length === 0,
            onClick: this.batchRecovery,
          }),
        },
        {
          name: 'batchCancel',
          show: skuType === 'EC' && status === '4',
          child: intl.get('smpc.workbench.view.btn.batchDeprecation').d('批量弃用'),
          observerBtnProps: () => ({
            icon: 'cancel',
            funcType: 'flat',
            onClick: this.batchDeprecation,
            disabled: ds.table.selected.length === 0,
          }),
        },
        {
          name: 'batchEditSku',
          group: true,
          show: skuType === 'EC',
          child: (
            <DropdownBtn
              icon="settings"
              funcType="flat"
              text={intl.get('smpc.workbench.view.batchEditSku').d('批量操作商品')}
            />
          ),
          children: [
            {
              name: 'ecsSkuOptsImport',
              child: intl.get('srm.common.view.productImport').d('导入商品操作'),
              show: status !== '8',
              btnProps: {
                onClick: this.handleBatchImport,
              },
            },
            {
              name: 'ecSkuOptsImportNew',
              btnComp: MenuItemLinkBtn,
              show: status !== '8',
              btnProps: {
                btnComp: ImportButton,
                prefixPatch: '/smec',
                refreshButton: true,
                buttonText: intl.get('smpc.product.button.skuOptImportNew').d('(新)导入商品操作'),
                successCallBack: () => this.handleSearch(),
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                  permissionList: [
                    {
                      code: `${path}.button.sku-opts-import-new`,
                      type: 'button',
                      meaning: '商品工作台采-(新)导入商品操作',
                    },
                  ],
                },
                businessObjectTemplateCode: 'SMPC.SKU_SHELF_IMPORT_EC',
              },
            },
            {
              name: 'skuConditionOperate',
              child: intl
                .get('smpc.workbench.view.btn.skuConditionOperate')
                .d('按商品条件批量操作'),
              btnProps: {
                onClick: this.skuConditionOperate,
                funcType: 'flat',
              },
            },
          ],
        },
        {
          name: 'ecBatchEdit',
          group: true,
          show: skuType === 'EC',
          child: (
            <DropdownBtn
              icon="mode_edit"
              funcType="flat"
              text={intl.get('smpc.workbench.view.batchMatain').d('批量编辑')}
            />
          ),
          children: [
            {
              name: 'ecBatchUpdateSkuNew',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                prefixPatch: '/smec',
                refreshButton: true,
                changeServicePrefix: true,
                btnComp: ImportButton,
                buttonText: intl
                  .get('smpc.product.button.batchEditSkuInfoNew')
                  .d('(新)批量修改商品信息'),
                successCallBack: () => this.handleSearch(),
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                },
                businessObjectTemplateCode: 'SMEC.EC_SKU_UPDATE',
              },
            },
            {
              name: 'ecSkuEdit',
              child: intl.get('smpc.workbench.view.matainSkuInfo').d('编辑商品信息'),
              show: status !== '8',
              observerBtnProps: () => ({
                icon: 'mode_edit',
                funcType: 'flat',
                onClick: () => this.handleEvents('handleBatchTag'),
                disabled: ds.table.selected.length === 0,
              }),
            },
          ],
        },
        {
          name: 'ecCreateReceive',
          btnType: 'c7n-pro',
          show: skuType === 'EC' && status === '1',
          child: intl.get('smpc.workbench.view.createReceiveSku').d('生成领用商品'),
          observerBtnProps: () => ({
            funcType: 'flat',
            icon: 'add',
            onClick: () => this.handleCreateReceiveSku(),
            disabled: ds.table.selected.length < 1,
          }),
        },
        // 在《接入电商商品反馈租户》配置表的用户可操作
        {
          name: 'skuFeedback',
          child: intl.get('smpc.product.view.skuFeedback').d('商品反馈'),
          show: skuType === 'EC' && canFeedBack,
          observerBtnProps: () => ({
            icon: 'question_answer',
            funcType: 'flat',
            onClick: this.handleFeedBack,
            disabled:
              ds.table.selected.length === 0 ||
              ds.table.selected.find((r) => !r.get('feedbackFlag')), // 未开启商品反馈（平台电商定义
          }),
        },
        {
          name: 'sameSkuFeedback',
          child: intl.get('smpc.product.model.sameSkuFeedbackManage').d('同款商品反馈管理'),
          show: skuType === 'EC',
          btnProps: {
            funcType: 'flat',
            icon: 'question_answer',
            onClick: this.sameSkuFeedbackManage,
          },
        },
        {
          name: 'ecSkuComment',
          child: intl.get('smpc.workbench.view.skuCommentManage').d('商品评价管理'),
          show: skuType === 'EC',
          btnProps: {
            funcType: 'flat',
            icon: 'message',
            onClick: this.handleComment,
          },
        },
      ],
      RECEIVE: [
        {
          name: 'receiveCreateGroup',
          group: true,
          show: skuType === 'RECEIVE',
          child: (
            <DropdownBtn
              primary
              icon="add"
              color="primary"
              text={intl.get('smpc.workbench.view.createReceiveSku1').d('新建领用商品')}
            />
          ),
          children: [
            {
              name: 'receiveSkuCreate',
              btnType: 'c7n-pro',
              child: intl.get('smpc.workbench.view.createManual').d('手动新建'),
              btnProps: {
                onClick: this.handleManualCreate,
              },
            },
            {
              name: 'createWithItem',
              btnType: 'c7n-pro',
              child: intl.get('smpc.workbench.view.createWithItem').d('引用物料新建'),
              btnProps: {
                onClick: this.handleCreateWithItem,
              },
            },
            {
              name: 'receiveBatchImport',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                btnComp: ImportButton,
                prefixPatch: '/smpc',
                refreshButton: true,
                buttonText: intl.get('hzero.common.button.batchImport').d('批量导入'),
                successCallBack: () => this.handleSearch(),
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                },
                businessObjectTemplateCode: 'SMPC.RECEIVE_SKU_IMPORT',
              },
            },
            {
              name: 'importWithItem',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                btnComp: ImportButton,
                prefixPatch: '/smpc',
                refreshButton: true,
                buttonText: intl.get('smpc.workbench.view.button.importWithItem').d('导入物料创建'),
                successCallBack: () => this.handleSearch(),
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                },
                businessObjectTemplateCode: 'SMPC.RECEIVE_ITEM_SKU_IMPORT',
              },
            },
          ],
        },
        {
          name: 'batchExportReceiveNew',
          btnComp: MenuItemLinkBtn,
          show: skuType === 'RECEIVE',
          btnProps: {
            isExport: true,
            method: 'POST',
            allBody: true,
            dataSet: ds.table,
            requestUrl,
            exportAsync: true,
            templateCode: exportCode, // 区分配置表
            queryParams: (_ds) =>
              _ds.selected.length > 0
                ? {
                    ...ds.getDefaultPara(),
                    exportSkuIds: _ds.selected.map((m) => m.get('skuId')),
                  }
                : ds.getPara(),
            buttonText:
              ds?.selected?.length > 0
                ? intl.get('smpc.product.button.selectBatchExportNew').d('勾选导出(新)')
                : intl.get('smpc.product.button.batchExportNew').d('(新)批量导出'),
            otherButtonProps: {
              funcType: 'flat',
              icon: 'unarchive',
              type: 'c7n-pro',
            },
          },
        },
        {
          name: 'receiveBatchEdit',
          group: true,
          show: skuType === 'RECEIVE',
          child: (
            <DropdownBtn
              icon="mode_edit"
              funcType="flat"
              text={intl.get('smpc.workbench.view.batchMatain').d('批量编辑')}
            />
          ),
          children: [
            {
              name: 'receiveBatchUpdateSkuNew',
              btnComp: MenuItemLinkBtn,
              btnProps: {
                prefixPatch: '/smpc',
                refreshButton: true,
                changeServicePrefix: true,
                btnComp: ImportButton,
                buttonText: intl
                  .get('smpc.product.button.batchEditSkuInfoNew')
                  .d('(新)批量修改商品信息'),
                successCallBack: () => this.handleSearch(),
                buttonProps: {
                  icon: '',
                  funcType: 'flat',
                },
                businessObjectTemplateCode: 'SMPC.RECEIVE_SKU_UPDATE',
              },
            },
            {
              name: 'receiveImageImport',
              child: intl.get('smpc.workbench.view.imageImport').d('导入图片'),
              btnProps: {
                funcType: 'flat',
                icon: 'archive',
                onClick: this.handleImportImage,
              },
            },
          ],
        },
        {
          name: 'batchLive',
          show: skuType === 'RECEIVE' && status === '8',
          btnType: 'c7n-pro',
          child: intl.get('smpc.workbench.view.batchLive').d('批量恢复'),
          observerBtnProps: () => ({
            icon: 'restore_page',
            funcType: 'flat',
            onClick: this.handleBatchRestore,
            disabled: ds.table.selected.length < 1,
          }),
        },
        {
          name: 'allocateReceiveRule',
          show: editSkuAuth && skuType === 'RECEIVE' && status === '1',
          btnComp: ReceiveRuleButton,
          btnType: 'c7n-pro',
          btnProps: {
            funcType: 'flat',
            icon: 'framework',
            onOk: this.allocateReceiveRule,
            tableDs: ds.table,
            text: intl.get('smpc.workbench.view.allocateReceiveRule').d('分配领用规则'),
          },
        },
        {
          name: 'batchDeprecation',
          show: skuType === 'RECEIVE' && status === '1',
          btnType: 'c7n-pro',
          child: intl.get('smpc.workbench.view.batchDeprecation').d('批量弃用'),
          observerBtnProps: () => ({
            funcType: 'flat',
            icon: 'cancel',
            onClick: this.batchDeprecation,
            disabled: ds.table.selected.length < 1,
          }),
        },
        {
          name: 'receiveRuleManage',
          show: skuType === 'RECEIVE' && status === '1',
          child: intl.get('smpc.workbench.view.receiveRuleManage').d('领用规则管理'),
          btnProps: {
            funcType: 'flat',
            icon: 'settings',
            onClick: this.handleReceiveRuleManage,
          },
        },
      ],
    };

    const buttons = btnTypes[skuType];

    const filterBtns = this.btnsFilter(buttons).map((m) => {
      const { children, ...other } = m;
      if (children) {
        const filterChildren = this.btnsFilter(children);
        return { ...other, children: filterChildren };
      }
      return m;
    });
    const isEcAppovaling = skuType === 'EC' && status === '9'; // 电商-审批中 不展示任何按钮

    return isEcAppovaling ? [] : filterBtns;
  }

  getSubTableProps = () => {
    const activeKey = this.getActiveKey();
    const { value, skuType, ds, exportUrl, exportCode, customizeUnitCode } =
      this.subTables.find((f) => f.tabKey === activeKey) || {};
    return { ds, skuType, status: value, exportUrl, exportCode, customizeUnitCode };
  };

  handleLoadedSubTable = (tabKey) => {
    this.subTablesLoaded[tabKey] = true;
  };

  render() {
    const { customizeTable, customizeBtnGroup, customizeTabPane } = this.props;
    const { title, isSup, prefixPath, currentPath, tabsCount } = this.state;
    const activeKey = this.getActiveKey();
    const { approve: editSkuAuth = true } =
      skuAuths.find((f) => f.code === this.authCodes.editSkuAuth) || {};
    return (
      <React.Fragment>
        <Header title={title}>
          {customizeBtnGroup(
            { code: 'SMPC.WORKBENCH_PUR_HEADER.BTNS', pro: true },
            <DynamicButtons
              buttons={this.getButtons()}
              maxNum={5}
              defaultBtnType="c7n-pro"
              permissions={purPermissions}
            />
          )}
        </Header>
        <Content className={styles['sku-workbench-container']}>
          {customizeTabPane(
            {
              code: 'SMPC.WORKBENCH_PUR_HEADER.TABS',
              cascade: true,
              custDefaultActive: this.custTabRender,
            },
            <Tabs activeKey={activeKey} onChange={this.updateFilters} defaultChangeable={false}>
              {this.skuTypes.map((m) => {
                const subList = this.subTables.filter((f) => f.skuType === m.skuType);
                return (
                  <TabGroup
                    tab={m.skuTypeMeaning}
                    key={m.skuType.toLocaleLowerCase()}
                    defaultActiveKey={initState.defaultKey[m.skuType]}
                  >
                    {subList.map((s) => {
                      const {
                        ds,
                        value,
                        tabKey,
                        meaning,
                        skuType: tableSkuType,
                        customizeUnitCode,
                        tableCustomizeUnitCode,
                      } = s;
                      const tableProps = {
                        ds,
                        isSup,
                        tabKey,
                        prefixPath,
                        editSkuAuth,
                        currentPath,
                        status: value,
                        customizeTable,
                        customizeUnitCode,
                        tableCustomizeUnitCode,
                        skuType: tableSkuType,
                        push: this.props.history.push,
                        remote: this.props.remote,
                        onRef: this.handleBindRef,
                        onPreview: this.handlePreview,
                        onShelf: this.handleSingleShelf,
                        onSubTableDidMount: this.handleLoadedSubTable,
                        onHandleSearch: this.handleSearch,
                      };
                      return (
                        <TabPane key={tabKey} tab={meaning} count={tabsCount[tabKey]}>
                          <SubTable {...tableProps} />
                        </TabPane>
                      );
                    })}
                  </TabGroup>
                );
              })}
            </Tabs>
          )}
        </Content>
      </React.Fragment>
    );
  }
}
