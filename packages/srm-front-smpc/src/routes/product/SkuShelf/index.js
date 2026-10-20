import React, { Component } from 'react';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { Tabs, Modal, Tooltip } from 'choerodon-ui';
import { DataSet, Table, DateTimePicker, Select } from 'choerodon-ui/pro';

import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import remote from 'hzero-front/lib/utils/remote';
import withProps from 'utils/withProps';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';

import { getSkuImagePath } from '@/utils/utils';
import { START_TIME_MOMENT, END_TIME_MOMENT } from '@/utils/const';
import Image from '@/components/Image';
import listCellRender from '@/routes/renderTools/listCellRender';

import { UnitLine, ObserverBtn, ExportButton, LabelContainer } from '../SkuWorkbench/components';
import {
  openEvaluate,
  openPriceInfo,
  openAuths,
  openTextArea,
  // openVersions,
} from '../SkuWorkbench/drawers';
import { openRecordTabs } from '../SkuWorkbench/drawers/record';
import operateRenderer from '../SkuWorkbench/records/operateRenderer';
import { statusColumn, stockRender, priceRender } from '../SkuWorkbench/tableColumns';
import { batchPutAway, batchUnShelve, batchRemarks } from '../SkuWorkbench/api';

import { tableDs } from './ds';

import styles from './index.less';

const { TabPane } = Tabs;

const organizationId = getCurrentOrganizationId();

@remote(
  {
    code: 'OLD_SKU_SHELF', // 德康
    name: 'remote',
  },
  // 默认Expose属性，当没有二开Expose时会走此逻辑
  {
    events: {
      // 非首次上架填写原因
      handleOnShelf({ ds, onOk }) {
        const bodyData = ds.selected.map((m) => m.toData());
        const isRemark = bodyData.some((s) => s.shelfRemark);
        if (isRemark) {
          Modal.confirm({
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
    },
  }
)
@formatterCollections({
  code: ['smpc.goodsManage', 'smpc.product', 'smpc.workbench', 'sagm.common'],
})
@withCustomize({ unitCode: ['SMPC.SKU_SHELF.BTNS'] })
@withProps(
  () => ({
    notDs: new DataSet(tableDs({ shelfFlags: '0,2,3,4' })),
    didDs: new DataSet(tableDs({ shelfFlag: 1 }, true)),
  }),
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class GoodsManage extends Component {
  state = {
    activeKey: 'not',
  };

  componentDidMount() {
    const { activeKey } = this.state;
    const { [`${activeKey}Ds`]: ds } = this.props;
    ds.query(ds.currentPage);
  }

  // tab按钮差异属性
  getTabDiffAttr = (activeKey) => {
    const {
      remote: { event },
    } = this.props;
    const attrs = {
      not: {
        action: (ds) =>
          event.fireEvent('handleOnShelf', {
            ds,
            onOk: (cuxParam = []) => {
              const bodyData = cuxParam.length ? cuxParam : ds.selected.map((m) => m.toData()); // 先走二开的
              this.handleBatchApi({
                api: batchPutAway,
                args: [bodyData, 0],
                callback: this.onShelfCallback,
              });
            },
          }),
        primaryIcon: 'add',
        primaryText: intl.get('smpc.goodsManage.model.shelf').d('上架'),
      },
      did: {
        action: this.handleOffShelf,
        primaryIcon: 'remove',
        primaryText: intl.get('smpc.goodsManage.model.unShelf').d('下架'),
      },
    };
    const attr = attrs[activeKey] || {};
    return { ...attr };
  };

  // 请求loading切换
  toggleLoading = (loadingKey) => {
    const { [loadingKey]: loading } = this.state;
    this.setState({ [loadingKey]: !loading });
  };

  @Bind
  async handleBatchApi({ api, args, callback }) {
    const { activeKey } = this.state;
    const { [`${activeKey}Ds`]: ds } = this.props;
    const res = getResponse(await api(...args));
    if (res) {
      if (callback) {
        callback(res);
      } else {
        notification.success();
      }
      ds.unSelectAll();
      ds.clearCachedSelected();
      ds.query(ds.currentPage);
    }
  }

  onShelfCallback = (res) => {
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

  // 上架
  // @Bind
  // handleOnShelf(ds) {
  //   const bodyData = ds.selected.map((m) => m.toData());
  //   const isRemark = bodyData.some((s) => s.shelfRemark);
  //   if (isRemark) {
  //     Modal.confirm({
  //       title: intl.get('smpc.product.model.shelfMsg').d('上架提示'),
  //       content: intl.get('smpc.product.model.remarkSureShelf').d('商品有备注信息，是否确认上架？'),
  //       onOk: () =>
  //         this.handleBatchApi({
  //           api: batchPutAway,
  //           args: [bodyData, 0],
  //           callback: this.onShelfCallback,
  //         }),
  //     });
  //   } else {
  //     return this.handleBatchApi({
  //       api: batchPutAway,
  //       args: [bodyData, 0],
  //       callback: this.onShelfCallback,
  //     });
  //   }
  // }

  // 下架
  @Bind
  handleOffShelf(ds) {
    openTextArea({
      title: intl.get('smpc.product.view.unshelfReason').d('下架原因'),
      name: 'unshelveRemark',
      label: intl.get('smpc.product.view.unshelfReason').d('下架原因'),
      maxLength: 100,
      onOk: (data) => {
        const bodyData = ds.selected.map((m) => ({ ...m.toData(), ...data }));
        return this.handleBatchApi({ api: batchUnShelve, args: [bodyData, 0] });
      },
    });
  }

  // 备注
  @Bind
  async handleBatchRemark(ds) {
    if (!ds) return;
    const batchData = ds.selected.map((m) => m.toData());
    if (batchData.length === 0) return;
    const shelfRemark = batchData.length === 1 ? batchData[0].shelfRemark : '';
    const isShelfRemark = batchData.some((s) => s.shelfRemark);
    const handleRemark = () => {
      openTextArea({
        title: intl.get('smpc.product.model.batchRemark').d('批量备注'),
        name: 'shelfRemark',
        label: intl.get('smpc.product.view.skuRemark').d('商品备注'),
        maxLength: 30,
        value: shelfRemark,
        onOk: (data) => {
          const list = batchData.map((m) => ({ ...m, ...data }));
          return this.handleBatchApi({ api: batchRemarks, args: [list] });
        },
      });
    };
    if (isShelfRemark) {
      Modal.confirm({
        title: intl.get('smpc.product.model.batchRemarkMsgTitle').d('批量备注提示'),
        content: intl
          .get('smpc.product.model.batchRemarkMsgContent')
          .d('当前选中商品存在已经备注过的商品，是否确定覆盖？'),
        onOk: () => handleRemark(),
      });
    } else {
      handleRemark();
    }
  }

  @Bind
  handleDeleteRemark(ds) {
    Modal.confirm({
      title: intl.get('smpc.product.model.deleteRemarkMsgTitle').d('删除备注提示'),
      content: intl.get('smpc.product.model.deleteRemarkMsgContent').d('您确认删除备注信息？'),
      onOk: async () => {
        const list = ds.selected.map((m) => ({ ...m.toData(), shelfRemark: null }));
        return this.handleBatchApi({ api: batchRemarks, args: [list] });
      },
    });
  }

  /**
   * 预览商品
   */
  @Bind()
  handlePreview(record) {
    const { skuId: productId, sourceFrom } = record.toData();
    openTab({
      key: '/smpc/sku-preview',
      title: 'srm.common.view.skuPreview',
      search: qs.stringify({
        productId,
        sourceFrom,
        backPath: '/smpc/sku-shelf',
      }),
    });
  }

  // 操作记录
  operateRecord = (record) => {
    openRecordTabs({
      rowRecord: record,
      leftOperateArg: {
        url: `/smpc/v1/${getCurrentOrganizationId()}/sku-operation-records/list`,
        queryParams: {
          skuId: record.get('skuId'),
          // tenantId: getCurrentOrganizationId(),
        },
        operateRenderer,
        partLoad: true,
      },
      isOldMenu: true,
    });
  };

  renderOptions = (record, type) => {
    const actions = [
      {
        text: intl.get('hzero.common.button.preview').d('预览'),
        event: () => this.handlePreview(record),
      },
      // {
      //   text: intl.get('smpc.product.view.historyVersion').d('历史版本'),
      //   event: () => openVersions({ skuId: record.get('skuId') }),
      // },
      {
        text: intl.get('hzero.common.button.record').d('操作记录'),
        event: () => this.operateRecord(record),
      },
    ];
    const filterActions = actions.filter((f) => {
      const { show = true } = f;
      return show;
    });
    return (
      <span className={type === 'hor' ? 'action-link' : styles['action-link-ver']}>
        {filterActions.map((m) => {
          const { text, disabled, event = (e) => e } = m;
          return (
            <a disabled={disabled} onClick={event}>
              {text}
            </a>
          );
        })}
      </span>
    );
  };

  renderSkuInfo = ({ record }) => {
    const { spuCode, categoryNamePath } = record.toData();
    const imagePath = getSkuImagePath(record);
    return (
      <div className={styles['sku-container']}>
        <div className="sku-info">
          <Image className="sku-img" value={imagePath} width={60} height={60} />
          {listCellRender(
            [
              {
                name: 'skuCode',
                label: intl.get('smpc.product.view.skuCode').d('商品编码'),
              },
              {
                name: 'skuName',
                label: intl.get('smpc.product.view.skuName').d('商品名称'),
              },
              {
                name: 'thirdSkuCode',
                label: intl.get('smpc.product.view.thirdSkuCode').d('第三方商品编码'),
                labelMinWidth: 84,
              },
            ],
            record.toData()
          )}
        </div>
        <div className="spu-info">
          <span className="spu-code">
            <Tooltip title={intl.get('smpc.product.view.spuCode').d('商品组编码')} placement="top">
              {spuCode}
            </Tooltip>
          </span>
          <span className="spu-category">
            <Tooltip
              title={`${intl
                .get('smpc.product.view.platCategory')
                .d('平台分类')}：${categoryNamePath}`}
              placement="top"
            >
              {categoryNamePath}
            </Tooltip>
          </span>
        </div>
      </div>
    );
  };

  renderCusLabels = ({ record, value }) => {
    return <LabelContainer labels={value} record={record} />;
  };

  renderPriceInfo = (record, view) => {
    const { activeKey } = this.state;
    const { [`${activeKey}Ds`]: ds } = this.props;
    const skuType = ds.queryDataSet?.current?.get('skuType');
    const prices = record.get('skuSalesInfos') || record.get('skuApproveSalesList') || [];
    if (prices.length > 1 || view === 'hor') {
      return (
        <a
          className={styles['unit-line']}
          onClick={() =>
            openPriceInfo(
              {
                skuId: record.get('skuId'),
                data: prices,
                afterClose: () => ds.query(ds.currentPage),
              },
              true
            )
          }
        >
          {intl.get('smpc.product.view.lookPrice').d('查看价格')}
        </a>
      );
    } else {
      return priceRender(record, skuType);
    }
  };

  renderMappingInfo = ({ record }) => {
    return listCellRender(
      [
        {
          name: 'catalogName',
          label: intl.get('smpc.product.model.catalog').d('目录'),
          labelMinWidth: 24,
        },
        {
          name: 'itemCode',
          label: intl.get('smpc.product.model.itemCode').d('物料编码'),
        },
        {
          name: 'itemName',
          label: intl.get('smpc.product.model.itemName').d('物料名称'),
        },
        {
          name: 'itemCategoryName',
          label: intl.get('smpc.product.view.itemCategory').d('物料品类'),
        },
      ],
      record.toData()
    );
  };

  @Bind
  getTogehterColumns() {
    const columns = [
      statusColumn(),
      {
        name: 'options',
        width: 100,
        renderer: ({ record }) => this.renderOptions(record, 'ver'),
      },
      {
        name: 'skuInfo',
        width: 290,
        tooltip: 'none',
        renderer: this.renderSkuInfo,
      },
      {
        name: 'mappingInfo',
        width: 180,
        renderer: this.renderMappingInfo,
      },
      {
        name: 'priceInfo',
        width: 210,
        renderer: ({ record }) => this.renderPriceInfo(record, 'ver'),
        tooltip: 'none',
      },
      {
        name: 'shelfDate',
        width: 150,
        renderer: ({ value }) => dateTimeRender(value),
      },
      {
        name: 'stockInfo',
        width: 160,
        renderer: stockRender,
      },
      {
        name: 'skuComment',
        width: 100,
        filterSupplier: true,
        renderer: ({ record }) => (
          <UnitLine>
            <a onClick={() => openEvaluate(record.get('skuId'))}>
              {intl.get('smpc.product.view.lookComment').d('查看评价')}
            </a>
          </UnitLine>
        ),
      },
      {
        name: 'supplierCompanyName',
        width: 160,
      },
      {
        name: 'labels',
        width: 140,
        renderer: this.renderCusLabels,
        filterSupplier: true,
      },
      {
        name: 'authority',
        width: 100,
        filterSupplier: true,
        renderer: ({ record }) => (
          <UnitLine>
            <a onClick={() => openAuths(record, '/smpc/sku-shelf')}>
              {intl.get('smpc.product.view.lookAuth').d('查看权限')}
            </a>
          </UnitLine>
        ),
      },
      // {
      //   name: 'publisher',
      //   width: 160,
      // },
    ];
    return columns
      .filter((f) => f.show !== false)
      .map((m) => ({
        ...m,
        renderer: m.renderer
          ? m.renderer
          : ({ value }) => <UnitLine title={value}>{value}</UnitLine>,
      }));
  }

  getCustomizeButtons = () => {
    const { activeKey } = this.state;
    const {
      [`${activeKey}Ds`]: ds,
      match: { path = '' },
    } = this.props;
    const { action, primaryIcon, primaryText } = this.getTabDiffAttr(activeKey);
    return [
      {
        name: 'shelf',
        btnComp: ObserverBtn,
        btnType: 'c7n-pro',
        btnProps: {
          dataSet: ds,
          icon: primaryIcon,
          wait: 1000,
          color: 'primary',
          text: primaryText,
          onClick: () => action(ds),
          getDisable: (data) => data.length === 0,
          permission: true,
          permissionList: [
            {
              code: `${path}.button.shelf`,
              type: 'button',
              meaning: '商品上下架-上下架',
            },
          ],
        },
      },
      {
        name: 'oldExport',
        btnComp: ExportButton,
        btnProps: {
          dataSet: ds,
          icon: 'upload',
          exportAsync: true,
          requestUrl: `/smpc/v1/${organizationId}/pur-skus/export`,
          getQueryParams: () => {
            const params = (ds.queryDataSet.current && ds.queryDataSet.current.toJSONData()) || {};
            delete params.__dirty;
            delete params.__id;
            delete params._status;
            const diffPara = activeKey === 'not' ? { shelfFlags: '0,2,3,4' } : { shelfFlag: 1 };
            return {
              ...diffPara,
              ...filterNullValueObject(params),
            };
          },
        },
      },
      {
        name: 'exportNew',
        btnComp: ExcelExportPro,
        btnProps: {
          templateCode: 'SMPC_SKU_EXPORT',
          buttonText: intl.get('smpc.product.button.exportNew').d('(新)导出'),
          exportAsync: true,
          requestUrl: `/smpc/v1/${organizationId}/pur-skus/export`,
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            permissionList: [
              {
                code: `${path}.button.export-new`,
                type: 'button',
                meaning: '商品上下架-(新)导出',
              },
            ],
          },
          queryParams: () => {
            const params = (ds.queryDataSet.current && ds.queryDataSet.current.toJSONData()) || {};
            delete params.__dirty;
            delete params.__id;
            delete params._status;
            const diffPara = activeKey === 'not' ? { shelfFlags: '0,2,3,4' } : { shelfFlag: 1 };
            return {
              ...diffPara,
              ...filterNullValueObject(params),
            };
          },
        },
      },
      {
        name: 'batchRemark',
        btnComp: ObserverBtn,
        btnProps: {
          dataSet: ds,
          funcType: 'flat',
          icon: 'baseline-file_copy',
          onClick: () => this.handleBatchRemark(ds),
          getDisable: (data) => data.length === 0,
          text: intl.get('smpc.product.model.batchRemark').d('批量备注'),
        },
      },
      {
        name: 'deleteRemark',
        btnComp: ObserverBtn,
        btnProps: {
          dataSet: ds,
          funcType: 'flat',
          icon: 'baseline-file_copy',
          onClick: () => this.handleDeleteRemark(ds),
          getDisable: (data) => !data.some((s) => s.get('shelfRemark')),
          text: intl.get('smpc.product.model.deleteRemark').d('删除备注'),
        },
      },
    ];
  };

  render() {
    const { notDs, didDs, customizeBtnGroup } = this.props;
    const columns = this.getTogehterColumns();
    return (
      <React.Fragment>
        <Header title={intl.get('smpc.goodsManage.view.message.title').d('商品上下架')}>
          {customizeBtnGroup(
            {
              code: 'SMPC.SKU_SHELF.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={this.getCustomizeButtons()} />
          )}
        </Header>
        <Content className={styles['sku-shelf-container']}>
          <Tabs
            animated={false}
            activeKey={this.state.activeKey}
            onChange={(activeKey) => {
              this.setState({ activeKey }, () => {
                const { [`${activeKey}Ds`]: ds } = this.props;
                ds.query(ds.currentPage);
              });
            }}
          >
            <TabPane
              key="not"
              tab={intl.get('smpc.goodsManage.view.goodsManage.unShelf').d('待上架')}
            >
              <Table
                dataSet={notDs}
                columns={columns}
                rowHeight="auto"
                queryFields={{
                  skuType: <Select clearButton={false} />,
                  shelfDate: <DateTimePicker defaultTime={[START_TIME_MOMENT, END_TIME_MOMENT]} />,
                }}
              />
            </TabPane>
            <TabPane
              key="did"
              tab={intl.get('smpc.goodsManage.view.goodsManage.shelf').d('已上架')}
            >
              <Table
                dataSet={didDs}
                columns={columns}
                rowHeight="auto"
                queryFields={{
                  skuType: <Select clearButton={false} />,
                }}
              />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
