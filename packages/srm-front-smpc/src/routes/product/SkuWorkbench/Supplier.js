import React from 'react';
import qs from 'qs';
import { Bind } from 'lodash-decorators';
import { Tabs } from 'choerodon-ui';
import withProps from 'utils/withProps';
import { unionBy } from 'lodash';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import ImportButton from 'components/Import';
import notification from 'utils/notification';
import {
  getResponse,
  getUserOrganizationId,
  filterNullValueObject,
  getAttachmentUrl,
  getCurrentOrganizationId,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import remote from 'hzero-front/lib/utils/remote';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'components/ExcelExportPro';
import ExcelExport from 'components/ExcelExport';

import c7nModal from '@/utils/c7nModal';
import PriceLib from '@/routes/sagm/PriceLib';
import { DropdownBtn, MenuItemLinkBtn } from './components';
import { getStatusAndDs } from './utils';
import SupplierTab from './SupplierTab';
import {
  batchValid,
  batchInvalid,
  batchSkuInfo,
  downloadBaseInfo,
  batchSubmit,
  checkSkuCompose,
  getSkuAttrConfig,
} from './api';
import { getPermission } from '../SkuCreate/api';
import { openBatchSku, openTextArea, openUploadImg } from './drawers';
import SkuCompose from './SkuCompose';
import { supListCode } from './customUnitCode';
import { supPermissions } from './permissions';
// eslint-disable-next-line import/no-duplicates
import styles from './index.less';
// eslint-disable-next-line import/no-duplicates
import './index.less';

let filterStatus = '1';

const userOrgId = getUserOrganizationId();
const organizationId = getCurrentOrganizationId();
@remote(
  {
    code: 'SKU_WORKBENCH_SUP',
    name: 'remote',
  },
  {
    process: {},
  }
)
@formatterCollections({
  code: ['smpc.product', 'smpc.workbench', 'sagm.common', 'small.common'],
})
@withCustomize({ unitCode: supListCode })
@withProps(
  () => {
    const [list, dsMap] = getStatusAndDs('', { isSup: true, supplierTenantId: userOrgId });
    return { ...dsMap, list };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class SkuWorkbench extends React.Component {
  subTablesLoaded = {};

  constructor(props) {
    super(props);
    const {
      list,
      location: { pathname, search },
    } = props;
    const isSup = pathname.includes('sku-workbench-sup');
    const { tabKey } = qs.parse(search.substr(1));
    const { value } = list.find((f) => f.tabKey === tabKey) || { value: filterStatus }; // 详情页返回保留原tab
    filterStatus = value;
    const prefixPath = pathname.split('/list')[0];
    const title = intl.get('smpc.workbench.view.supTitle').d('商品中心工作台（供）');
    this.state = {
      isSup,
      title,
      prefixPath,
      currentPath: pathname,
      filterStatus,
      attrFlag: false,
      approveType: [],
      tabsCount: {}, // 不同tab组下tab总数
    };
  }

  componentDidMount() {
    this.fetchAttrConfig();
    this.queryTabsCount();
    this.fetchPermission();
  }

  queryTabsCount = async () => {
    const { list } = this.props;
    // 已全部查询过，只查当前tab数量
    if (this.tabLoaded) {
      const find = list.find((f) => f.value === filterStatus);
      if (find) {
        const { ds, tabKey } = find;
        const res = await ds.queryCount();
        if (getResponse(res)) {
          this.setState(({ tabsCount: pre }) => ({
            tabsCount: { ...pre, [tabKey]: res.totalElements || 0 },
          }));
        }
      }
      return;
    }
    const apis = [];
    list.forEach((f) => {
      const { queryCount = (e) => e } = f.ds;
      apis.push(queryCount);
    });
    // 数量查询完毕统一更新数量
    Promise.all(apis.map((api) => api())).then((res) => {
      const tabsCount = {};
      // 当前tab组下
      list.forEach((s, idx) => {
        tabsCount[s.tabKey] = res[idx]?.totalElements || 0;
      });
      this.setState({ tabsCount: { ...this.state.tabsCount, ...tabsCount } });
    });
    this.tabLoaded = true;
  };

  fetchAttrConfig = async () => {
    const res = getResponse(await getSkuAttrConfig());
    if (res) this.setState({ attrFlag: res });
  };

  @Bind
  async fetchPermission() {
    const result = getResponse(await getPermission());
    if (result) {
      const { approveType } = result;
      const types = approveType || [];
      if (types.includes('SALE_INFO')) {
        this.setState({ approveType: ['SALE_INFO'] });
      }
    }
  }

  @Bind
  handleSearch(isFirst = true, params, cached = true) {
    const { search = (e) => e } = this.getDs();
    search(isFirst, params, cached);
    this.queryTabsCount();
  }

  @Bind
  getDs(key) {
    const { filterStatus: _status } = this.state;
    const { [`ds_${_status}`]: ds } = this.props;
    return key && ds[key] ? ds[key] : ds;
  }

  @Bind
  handleForceUpdate() {
    const { _update = 0 } = this.state;
    this.setState({ _update: _update + 1 });
  }

  @Bind
  handleManualCreate() {
    const { prefixPath } = this.state;
    this.props.history.push(`${prefixPath}/create`);
  }

  @Bind
  handleQuotePrice() {
    const modal = PriceLib.create({
      type: 'sku',
      isSup: true,
      afterSuccess: (res) => {
        // 后端返回的字符串， 没有返回时拿到的是 {}
        if (res && ['string', 'number'].includes(typeof res)) {
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
          modal.close();
          this.handleSearch();
        }
      },
    });
  }

  @Bind
  handleImportImage() {
    const { prefixPath } = this.state;
    this.props.history.push(`${prefixPath}/img-import?skuType=CATA`);
  }

  // 批量维护
  @Bind
  handleBatchSkuInfo() {
    const { approveType, isSup } = this.state;
    const ds = this.getDs('table');
    const data = ds.selected.map((m) => m.toData());
    if (data.length === 0) return;
    const suppIds = [...new Set(data.map((d) => d.supplierTenantId))];
    const { uomPrecision: precision, supplierTenantId } = data[0];
    const multipleSuppliers = unionBy(
      data.map((m) => ({
        supplierCompanyId: m.supplierCompanyId,
        supplierCompanyName: m.supplierCompanyName,
        supplierTenantId: m.supplierTenantId,
      })),
      'supplierCompanyId'
    );
    openBatchSku({
      isSup,
      suppIds,
      precision,
      approveType,
      multipleSupplier: true,
      multipleSuppliers,
      supplier: { supplierTenantId },
      onSave: async (skuInfo, saleInfo) => {
        const newData = data.map((m) => {
          const { skuSalesInfos, skuApproveSalesList } = m;
          const newSkuSalesInfos = [...(skuSalesInfos || skuApproveSalesList || [])];
          if (saleInfo) {
            newSkuSalesInfos.unshift(saleInfo);
          }
          return {
            ...m,
            ...skuInfo,
            skuSalesInfos: newSkuSalesInfos,
          };
        });
        const res = getResponse(await batchSkuInfo(newData));
        if (res) {
          notification.success();
          this.handleSearch(false);
        } else {
          return false;
        }
      },
    });
  }

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

  @Bind
  handleImportSku() {
    this.openImport({
      code: 'SMPC.SUP_SKU_IMPORT',
      intlCode: 'srm.common.view.batchImportSku',
    });
  }

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

  @Bind
  handleImportFastUpdate() {
    this.openImport({
      code: 'SMPC.SKU_UPDATE',
      intlCode: 'srm.common.view.title.fastUpdate',
    });
  }

  // 批量修改价格 -导入
  @Bind
  handleEditPrice() {
    this.openImport({
      code: 'SMPC.SUP_SKU_BATCH_UPDATE',
      intlCode: 'srm.common.view.batchEditProInfo',
    });
  }

  @Bind
  handlePreview(record) {
    const {
      skuId: productId,
      sourceFrom,
      // purSkuStatus,
      skuTemporaryId,
      approveType,
      __versionId,
    } = record.toData();
    // 是否为已生效
    // const isValid = filterStatus !== '7' && purSkuStatus === 7;
    // 是否查最新审批表数据
    // const isNew = isValid || filterStatus === '5' || filterStatus === '6';
    const isNew = !['2', '7'].includes(filterStatus); // 待提交、已失效
    openTab({
      key: '/smpc/sku-preview',
      title: 'srm.common.view.skuPreview',
      search: qs.stringify(
        filterNullValueObject({
          productId,
          sourceFrom,
          approveType,
          skuTemporaryId:
            __versionId || !['5', '6'].includes(filterStatus) ? undefined : skuTemporaryId,
          req: isNew && !__versionId ? 'new' : '',
        })
      ),
    });
  }

  // 生效
  @Bind
  handleValid() {
    const ds = this.getDs('table');
    openTextArea({
      title: intl.get('smpc.workbench.view.batchValid').d('批量生效'),
      name: 'remark',
      label: intl.get('smpc.product.view.validReason').d('生效原因'),
      maxLength: 100,
      onOk: (param) => {
        const bodyData = ds.selected
          .map((m) => ({ ...m.toData(), ...param }))
          .filter((f) => f.supplierShelfFlag === 0);
        return this.handleBatchApi({ api: batchValid, args: [bodyData], cached: false });
      },
    });
  }

  // 失效
  @Bind
  handleInvalid() {
    const ds = this.getDs('table');
    openTextArea({
      title: intl.get('smpc.workbench.view.batchInvalid').d('批量失效'),
      name: 'remark',
      label: intl.get('smpc.product.view.invalidReason').d('失效原因'),
      maxLength: 100,
      onOk: (param) => {
        const bodyData = ds.selected
          .map((m) => ({ ...m.toData(), ...param }))
          .filter((f) => f.supplierShelfFlag === 1);
        return this.handleBatchApi({ api: batchInvalid, args: [bodyData], cached: false });
      },
    });
  }

  @Bind
  async handleBatchApi({ api, args, callback = (e) => e, loading, cached }) {
    const ds = this.getDs('table');
    if (loading) ds.status = 'loading';
    const res = getResponse(await api(...args));
    ds.status = 'ready';
    if (res) {
      if (callback) {
        callback(res);
      } else {
        notification.success();
      }
      this.handleSearch(false, null, cached);
    }
  }

  // 定制品属性模版
  handleAttrTemplate = () => {
    const { prefixPath } = this.state;
    this.props.history.push(`${prefixPath}/custom-attr-template`);
  };

  isJson = (res) => {
    let result;
    try {
      result = JSON.parse(res);
    } catch (e) {
      return false;
    }
    return typeof result === 'object' && typeof result !== 'string';
  };

  handleDownloadBaseInfo = async () => {
    const res = getResponse(await downloadBaseInfo());
    if (res) {
      if (this.isJson(res) && JSON.parse(res).failed) {
        notification.error({ message: JSON.parse(res).message });
        return false;
      }
      const url = getAttachmentUrl(res, 'private-bucket', organizationId, '/hpfm01');
      const ele = document.createElement('a');
      ele.style.display = 'none';
      ele.href = url;
      document.body.appendChild(ele);
      ele.click();
      document.body.removeChild(ele);
    }
  };

  // 商品组合
  handleSkuCompose = async () => {
    const { table } = this.getDs();
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
              this.handleSearch(false);
            }}
          />
        ),
        title: intl.get('smpc.product.view.title.skuCompose').d('商品组合'),
        okText: intl.get('smpc.product.button.compose').d('组合'),
        okProps: { disabled: true },
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
      callback: this.onSubmitCallback,
      cached: false,
    });
  };

  // 提交操作后回调
  onSubmitCallback = (res) => {
    const { batchStatus, batchResult } = res;
    // 0失败 1部分成功 2 全部成功
    const info = { message: batchResult };
    if (batchStatus === 2) {
      notification.success(info);
    } else if (batchStatus === 1) {
      notification.warning(info);
    } else {
      notification.error(info);
    }
  };

  handleBatchUploadImg = () => {
    const ds = this.getDs('table');
    const selectData = ds.selected.map((m) => m.toData());
    openUploadImg({ isSup: true, data: selectData, onSuccess: () => this.handleSearch(false) });
  };

  btnsFilter = (btns) => {
    return btns.filter((f) => !('show' in f) || f.show);
  };

  // 顶部按钮控制
  @Bind
  getButtons() {
    const { table, getPara = (e) => e, getDefaultPara, exportUrl } = this.getDs();
    const { attrFlag } = this.state;

    // attrFlag为 false + exports
    const urlSplits = exportUrl.split('/');
    if (!attrFlag) urlSplits[4] = `exports/${urlSplits[4]}`;
    const requestUrl = urlSplits.join('/');

    const buttons = [
      {
        name: 'skuCreate',
        group: true,
        children: [
          {
            name: 'manualCreate',
            btnType: 'c7n-pro',
            child: intl.get('smpc.workbench.view.createManual').d('手动新建'),
            btnProps: {
              onClick: this.handleManualCreate,
            },
          },
          {
            name: 'quoteLibPrice',
            btnType: 'c7n-pro',
            child: intl.get('smpc.workbench.view.quotePrice').d('引用价格库'),
            btnProps: {
              onClick: this.handleQuotePrice,
            },
          },
          {
            name: 'skuBatchImport',
            btnType: 'c7n-pro',
            child: intl.get('srm.common.view.batchImportSku').d('商品批量导入'),
            btnProps: {
              onClick: this.handleImportSku,
            },
          },
          {
            name: 'skuBatchImportNew',
            btnComp: MenuItemLinkBtn,
            btnProps: {
              prefixPatch: '/smpc',
              refreshButton: true,
              changeServicePrefix: true,
              btnComp: ImportButton,
              buttonText: intl.get('smpc.product.button.skuBatchImportNew').d('(新)商品批量导入'),
              successCallBack: () => this.handleSearch(),
              buttonProps: {
                icon: '',
                funcType: 'flat',
              },
              businessObjectTemplateCode: 'SMPC.SUP_SKU_IMPORT',
            },
          },
        ],
        child: (
          <DropdownBtn
            primary
            icon="add"
            color="primary"
            text={intl.get('smpc.workbench.view.createSku').d('新建商品')}
          />
        ),
      },
      {
        name: 'batchSubmit',
        show: filterStatus === '2',
        child: intl.get('smpc.product.view.button.batchSubmit').d('批量提交'),
        observerBtnProps: () => ({
          funcType: 'flat',
          dataSet: table,
          icon: 'check',
          disabled: table.selected.length === 0,
          onClick: () => this.handleBatchSubmit(table),
        }),
      },
      {
        name: 'batchEdit',
        group: true,
        show: filterStatus !== '5',
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
            show: filterStatus !== '5',
            child: intl.get('smpc.workbench.view.batchEditProInfo').d('批量修改商品信息'),
            btnProps: {
              onClick: this.handleEditPrice,
            },
          },
          {
            name: 'batchUpdateSkuNew',
            btnComp: MenuItemLinkBtn,
            show: filterStatus !== '5',
            btnProps: {
              btnComp: ImportButton,
              prefixPatch: '/smpc',
              refreshButton: true,
              changeServicePrefix: true,
              buttonText: intl
                .get('smpc.product.button.batchEditSkuInfoNew')
                .d('(新)批量修改商品信息'),
              successCallBack: () => this.handleSearch(),
              buttonProps: {
                icon: '',
                funcType: 'flat',
              },
              businessObjectTemplateCode: 'SMPC.SUP_SKU_BATCH_UPDATE',
            },
          },
          {
            name: 'skuEdit',
            child: intl.get('smpc.workbench.view.matainSkuInfo').d('编辑商品信息'),
            show: !['5', '6', '7'].includes(filterStatus),
            observerBtnProps: () => ({
              onClick: () => this.handleBatchSkuInfo(),
              disabled: table.selected.length === 0,
            }),
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
            show: !['5', '7'].includes(filterStatus),
            observerBtnProps: () => ({
              disabled: table.selected.length === 0,
              onClick: this.handleBatchUploadImg,
            }),
          },
          {
            name: 'fastUpdate',
            child: intl.get('smpc.product.button.fastUpdate').d('便捷修改'),
            btnProps: {
              onClick: this.handleImportFastUpdate,
            },
          },
          {
            name: 'fastUpdateNew',
            btnComp: MenuItemLinkBtn,
            btnProps: {
              btnComp: ImportButton,
              prefixPatch: '/smpc',
              refreshButton: true,
              buttonText: intl.get('smpc.product.button.fastUpdateNew').d('(新)便捷修改'),
              successCallBack: () => this.handleSearch(),
              buttonProps: {
                icon: '',
                funcType: 'flat',
              },
              businessObjectTemplateCode: 'SMPC.SKU_UPDATE',
            },
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
        name: 'batchExport',
        btnComp: MenuItemLinkBtn,
        btnProps: {
          btnComp: ExcelExport,
          exportAsync: true,
          queryParams: () => {
            const queryParams = getPara();
            return filterNullValueObject(queryParams);
          },
          requestUrl,
          getQueryParams: () => getPara(),
          buttonText: intl.get('smpc.workbench.view.batchExport').d('批量导出'),
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
          },
        },
      },
      {
        name: 'batchExportNew',
        btnComp: MenuItemLinkBtn,
        observerBtnProps: () => ({
          btnComp: ExcelExportPro,
          requestUrl,
          method: 'POST',
          allBody: true,
          exportAsync: true,
          templateCode: attrFlag ? 'SMPC_SUP_SKU_HAS_ATTR_EXPORT' : 'SMPC_SUP_SKU_EXPORT', // 区分配置表新老租户
          buttonText:
            table?.selected?.length > 0
              ? intl.get('smpc.product.button.selectBatchExportNew').d('勾选导出(新)')
              : intl.get('smpc.product.button.batchExportNew').d('(新)批量导出'),
          queryParams:
            table.selected?.length > 0
              ? {
                  ...getDefaultPara(),
                  exportSkuIds: table.selected.map((m) => m.get('skuId')),
                }
              : getPara(),
          otherButtonProps: {
            funcType: 'flat',
            icon: 'unarchive',
            type: 'c7n-pro',
          },
        }),
      },
      {
        name: 'batchValid',
        child: intl.get('smpc.workbench.view.batchValid').d('批量生效'),
        show: filterStatus === '7',
        observerBtnProps: () => ({
          funcType: 'flat',
          icon: 'not_interested',
          onClick: () => this.handleValid(),
          disabled: table.selected.length === 0,
        }),
      },
      {
        name: 'batchInvalid',
        child: intl.get('smpc.workbench.view.batchInvalid').d('批量失效'),
        show: !['5', '6', '7'].includes(filterStatus),
        observerBtnProps: () => ({
          funcType: 'flat',
          icon: 'not_interested',
          onClick: () => this.handleInvalid(),
          disabled: table.selected.length === 0,
        }),
      },
      {
        name: 'baseDownload',
        child: intl.get('smpc.product.model.button.baseInfoDownload').d('基础数据下载'),
        btnProps: {
          funcType: 'flat',
          icon: 'get_app',
          onClick: this.handleDownloadBaseInfo,
        },
      },
      {
        name: 'skuCompose',
        child: intl.get('smpc.product.view.button.skuCompose').d('商品组合'),
        show: !['5', '6', '7'].includes(filterStatus),
        observerBtnProps: () => ({
          icon: 'project',
          funcType: 'flat',
          disabled: table.selected.length < 2,
          onClick: this.handleSkuCompose,
        }),
      },
    ];

    const filterBtns = this.btnsFilter(buttons).map((m) => {
      const { children, ...other } = m;
      if (children) {
        const filterChildren = this.btnsFilter(children);
        return { ...other, children: filterChildren };
      }
      return m;
    });

    return filterBtns;
  }

  handleLoadedSubTable = (typeValue) => {
    this.subTablesLoaded[typeValue] = true;
  };

  render() {
    const { list, customizeTable, customizeBtnGroup, customizeTabPane } = this.props;
    const { title, isSup, prefixPath, currentPath, tabsCount } = this.state;

    // 由于之前的逻辑都是用数字判断，增加Tab个性化，使用映射写法
    const { tabKey: activeKey } = list.find((f) => f.value === filterStatus) || { tabKey: 'all' };

    return (
      <React.Fragment>
        <Header title={title}>
          {customizeBtnGroup(
            { code: 'SMPC.WORKBENCH_SUP_HEADER.BTNS', pro: true },
            <DynamicButtons
              maxNum={5}
              defaultBtnType="c7n-pro"
              buttons={this.getButtons()}
              permissions={supPermissions}
            />
          )}
        </Header>
        <Content className={styles['sku-workbench-container']}>
          {customizeTabPane(
            { code: 'SMPC.WORKBENCH_SUP_HEADER.TABS' },
            <Tabs
              activeKey={activeKey}
              defaultChangeable={false}
              onChange={(key) => {
                const { value, ds } = list.find((f) => f.tabKey === key) || { value: '1' };
                filterStatus = value;
                this.queryTabsCount(); // 先查cont, 防止table未渲染
                if (ds && ds?.table?.getState('queryStatus') === 'ready') {
                  ds.search(false);
                }
                this.setState({ filterStatus: value });
              }}
            >
              {list.map((m) => {
                const { ds, value, tabKey, customizeUnitCode, tableCustomizeUnitCode } = m;
                const tableProps = {
                  isSup,
                  prefixPath,
                  currentPath,
                  customizeTable,
                  customizeUnitCode,
                  tableDs: ds.table,
                  filterStatus: value,
                  tableCustomizeUnitCode,
                  push: this.props.history.push,
                  onSearch: ds.search,
                  remote: this.props.remote,
                  onPreview: this.handlePreview,
                  onSubTableDidMount: this.handleLoadedSubTable,
                };

                return (
                  <Tabs.TabPane key={tabKey} tab={m.meaning} count={tabsCount[tabKey]}>
                    <SupplierTab {...tableProps} />
                  </Tabs.TabPane>
                );
              })}
            </Tabs>
          )}
        </Content>
      </React.Fragment>
    );
  }
}
