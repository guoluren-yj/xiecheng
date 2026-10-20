/**
 * 商品发布采
 * @date: 2020-12-17
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React from 'react';
// import { isNumber } from 'lodash';
import qs from 'querystring';
import { Bind, Throttle } from 'lodash-decorators';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import { DataSet, Table, Button, Tooltip, Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import {
  getResponse,
  getCurrentUserId,
  getUserOrganizationId,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import ImportButton from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';

import { getSkuImagePath } from '@/utils/utils';
import Image from '@/components/Image';
import PriceLib from '@/routes/sagm/PriceLib';
import listCellRender from '@/routes/renderTools/listCellRender';

import {
  // QueryForm,
  // FilterBar,
  UnitLine,
  ObserverBtn,
  DropdownBtn,
  ExportButton,
  LabelContainer,
  OptionList,
  // ViewFilter,
} from '../SkuWorkbench/components';
import {
  openEvaluate,
  // openBatchSku,
  openPriceInfo,
  openAuths,
  openVersions,
  openTextArea,
  openRecordTabs,
} from '../SkuWorkbench/drawers';
import {
  statusColumn,
  stockRender,
  priceRender,
  supPublishStatusColumn,
} from '../SkuWorkbench/tableColumns';
import operateRenderer from '../SkuWorkbench/records/operateRenderer';
import { tableDs, queryDs } from './ds';
import { batchSubmit, handleBaseInfoExport } from './api';
import { batchValid, batchInvalid } from '../SkuWorkbench/api';

import styles from './index.less';

const userOrgId = getUserOrganizationId();
const organizationId = getCurrentOrganizationId();
const unitCode = {
  supBtn: 'SMPC.SKU_PUBLISH.SUP.BTNS',
  purBtn: 'SMPC.SKU_PUBLISH.PUR.BTNS',
  purTableBtn: 'SMPC.SKU_PUBLISH.PUR.TABLE.BTNS', // table 上按钮组
  supTableBtn: 'SMPC.SKU_PUBLISH.TABLE.BTNS',
  purTable: 'SMPC.SKU_PUBLISH.PUR.TABLE',
  supTable: 'SMPC.SKU_PUBLISH.TABLE',
};
@formatterCollections({
  code: ['smpc.product', 'smpc.productPublish', 'smpc.workbench', 'sagm.common', 'small.common'],
})
@withCustomize({
  unitCode: [
    unitCode.supBtn,
    unitCode.purBtn,
    unitCode.purTableBtn,
    unitCode.supTableBtn,
    unitCode.purTable,
    unitCode.supTable,
  ],
})
@withProps(
  () => ({
    ds: new DataSet(tableDs()),
  }),
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
@observer // observer注解必须放第一个
export default class ProductList extends React.Component {
  constructor(props) {
    super(props);
    const {
      ds,
      location: { pathname },
    } = props;
    const isSup = pathname.includes('sku-publish-sup');
    const prefixUrl = pathname.split('/list')[0];
    const title = isSup
      ? intl.get('smpc.productPublish.view.supTitle').d('商品发布（供）')
      : intl.get('smpc.productPublish.view.purTitle').d('商品发布（采）');

    const queryFields = new DataSet(queryDs(isSup));
    ds.queryDataSet = queryFields;
    ds.setQueryParameter('isSup', isSup);
    if (isSup) {
      ds.setQueryParameter('supplierTenantId', userOrgId);
    }

    this.state = {
      isSup,
      title,
      currentPath: pathname,
      readPath: `${prefixUrl}/detail`,
      editPath: `${prefixUrl}/create`,
      imgImportPath: `${prefixUrl}/img-import`,
    };
  }

  componentDidMount() {
    const { ds } = this.props;
    ds.query(ds.currentPage);
  }

  /**
   * 编辑
   */
  @Bind()
  handleEditSpu(record) {
    const { editPath } = this.state;
    const { spuId, purSkuStatus } = record.toData();
    const req = purSkuStatus === 7 ? 'new' : '';
    this.props.history.push(`${editPath}?spuId=${spuId}&req=${req}`);
  }

  @Bind
  handleQuotePrice() {
    const { isSup } = this.state;
    const modal = PriceLib.create({
      type: 'sku',
      isSup,
      afterSuccess: () => {
        notification.success();
        modal.close();
        this.props.ds.query();
      },
    });
  }

  /**
   * 查看-跳转到只读页面
   */
  @Bind()
  handleViewDetail(record) {
    const { isSup, readPath } = this.state;
    const { skuId, spuId, purSkuStatus } = record.toData();
    const req = purSkuStatus === 7 ? 'new' : '';
    const anchor = isSup ? 'PUB_SUP' : 'PUB_PUR';
    this.props.history.push(
      `${readPath}?spuId=${spuId}&skuId=${skuId}&anchor=${anchor}&req=${req}`
    );
  }

  @Bind()
  handleViewHistory(record) {
    const { readPath } = this.state;
    const { skuId, skuHistoryId } = record.toData();
    this.props.history.push(`${readPath}?skuHistoryId=${skuHistoryId}&skuId=${skuId}`);
  }

  /**
   * 预览商品
   */
  @Bind()
  handlePreview(record) {
    const { currentPath } = this.state;
    const { skuId: productId, sourceFrom, purSkuStatus } = record.toData();
    const req = purSkuStatus === 7 ? 'new' : '';

    openTab({
      key: '/smpc/sku-preview',
      title: 'srm.common.view.skuPreview',
      search: qs.stringify({
        req,
        productId,
        sourceFrom,
        backPath: currentPath,
      }),
    });
  }

  /**
   * 批量设为生效：3/失效：4 - 租户级
   */
  @Throttle(1000)
  @Bind()
  async handleChangeSkuStatus(api, filterFlag) {
    const { ds } = this.props;
    openTextArea({
      title:
        filterFlag === 1
          ? intl.get('smpc.workbench.view.batchInvalid').d('批量失效')
          : intl.get('smpc.workbench.view.batchValid').d('批量生效'),
      name: 'remark',
      label:
        filterFlag === 1
          ? intl.get('smpc.product.view.invalidReason').d('失效原因')
          : intl.get('smpc.product.view.validReason').d('生效原因'),
      maxLength: 100,
      onOk: async (param) => {
        const data = ds.selected
          .filter((f) => f.get('supplierShelfFlag') === filterFlag)
          .map((m) => ({ ...m.toData(), ...param }));
        const result = getResponse(await api(data));
        if (result) {
          notification.success();
          ds.clearCachedSelected();
          ds.unSelectAll();
          ds.query(ds.currentPage);
        }
      },
    });
  }

  /**
   * 批量提交
   */
  @Throttle(1000)
  @Bind()
  async handleBatchSubmit() {
    const { ds } = this.props;
    const ids = ds.selected.filter((f) => f.get('purSkuStatus') === 5).map((m) => m.get('spuId'));
    const result = getResponse(await batchSubmit(ids));
    if (result) {
      const { batchStatus, batchResult } = result;
      // 如果勾选列表长度大于勾选的新建状态列表，则存在其他状态的数据
      if (batchStatus === 2) {
        notification.success({
          message: intl.get('smpc.product.view.notification.success').d(batchResult),
        });
      } else if (batchStatus === 1) {
        notification.warning({
          message: intl.get('smpc.product.view.notification.partSuccess').d(batchResult),
        });
      } else {
        notification.error({
          message: intl.get('smpc.product.view.notification.error').d(batchResult),
        });
      }
      ds.clearCachedSelected();
      ds.unSelectAll();
      ds.query(ds.currentPage);
    }
  }

  @Bind
  openImport({ code, intlCode }) {
    const { currentPath } = this.state;
    openTab({
      key: `/smpc/data-import/${code}`,
      title: intlCode,
      search: qs.stringify({
        action: intlCode,
        backPath: currentPath,
      }),
    });
  }

  @Bind
  handleImport() {
    const { isSup } = this.state;
    this.openImport({
      code: isSup ? 'SMPC.SUP_SKU_IMPORT' : 'SMPC.SKU_IMPORT',
      intlCode: 'srm.common.view.batchImportSku',
    });
  }

  /**
   * 商品图片导入
   */
  handleImgImport = () => {
    const { imgImportPath } = this.state;
    const { ds } = this.props;
    const { skuType = 'CATA' } = ds.queryDataSet?.current?.toData();
    this.props.history.push(`${imgImportPath}?skuType=${skuType}`);
  };

  /**
   * 基础数据导出
   */
  async handleBaseInfoExport() {
    const result = getResponse(
      await handleBaseInfoExport({
        userId: getCurrentUserId(),
        tenantId: getUserOrganizationId(),
      })
    );
    if (result) {
      // notification.info({ message: '请到异步导出监控页面查看' });
    }
  }

  // 操作记录
  operateRecord = (record) => {
    const { isSup } = this.props;
    openRecordTabs(
      {
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
      },
      isSup
    );
  };

  renderOptions = (record, type, isEC) => {
    const actions = [
      {
        text: intl.get('hzero.common.edit').d('编辑'),
        event: () => this.handleEditSpu(record),
        show: !isEC,
      },
      {
        text: intl.get('hzero.common.button.look').d('查看'),
        event: () => this.handleViewDetail(record),
        show: !isEC,
      },
      {
        text: intl.get('hzero.common.button.preview').d('预览'),
        event: () => this.handlePreview(record),
      },
      {
        text: intl.get('smpc.product.view.historyVersion').d('历史版本'),
        event: () => openVersions({ skuId: record.get('skuId'), onView: this.handleViewHistory }),
        show: !isEC,
      },
      {
        text: intl.get('hzero.common.button.record').d('操作记录'),
        // event: () => openRecords(record.get('skuId')),
        event: () => this.operateRecord(record),
      },
    ].filter((f) => f.show !== false);
    return <OptionList actions={actions} type={type} />;
  };

  renderSkuInfo = ({ record }, isEC) => {
    const { skuCode, spuCode, categoryNamePath } = record.toData();
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
                render: (_, contentClass) =>
                  !isEC ? (
                    <a
                      onClick={() => this.handleViewDetail(record)}
                      className={classNames({ [contentClass]: true, [styles['sku-color']]: true })}
                    >
                      {skuCode}
                    </a>
                  ) : (
                    skuCode
                  ),
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
    const { ds } = this.props;
    const { isSup } = this.state;
    const skuType = ds.queryDataSet?.current?.get('skuType');
    const prices = record.get('skuSalesInfos') || record.get('skuApproveSalesList') || [];
    if (prices.length > 1 || view === 'hor') {
      return (
        <a
          className={styles['unit-line']}
          onClick={() =>
            openPriceInfo(
              {
                isSup,
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
    const { isSup, currentPath } = this.state;
    const { ds } = this.props;
    // filters 1 为采购方 2 为供应商
    const getColumn = isSup ? supPublishStatusColumn : statusColumn;
    const { skuType } = ds.queryDataSet?.current?.toJSONData() || {};
    const columns = [
      getColumn(),
      {
        name: 'options',
        width: 100,
        renderer: ({ record }) => this.renderOptions(record, 'ver', skuType === 'EC'),
      },
      {
        name: 'skuInfo',
        width: 290,
        tooltip: 'none',
        renderer: (p) => this.renderSkuInfo(p, skuType === 'EC'),
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
        name: 'stockInfo',
        width: 160,
        renderer: stockRender,
      },
      {
        name: 'skuComment',
        width: 100,
        filters: [1],
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
        filters: [1],
      },
      {
        name: 'authority',
        width: 100,
        filters: [1],
        renderer: ({ record }) => (
          <UnitLine>
            <a onClick={() => openAuths(record, currentPath)}>
              {intl.get('smpc.product.view.lookAuth').d('查看权限')}
            </a>
          </UnitLine>
        ),
      },
      {
        name: 'publisher',
        width: 160,
      },
    ];
    return columns
      .filter((f) => {
        const { filters = [1, 2] } = f;
        const filterKey = isSup ? 2 : 1;
        return filters.includes(filterKey);
      })
      .map((m) => ({
        ...m,
        renderer: m.renderer
          ? m.renderer
          : ({ value }) => <UnitLine title={value}>{value}</UnitLine>,
      }));
  }

  @Bind
  getSupplierBtns() {
    const { ds } = this.props;
    return [
      <ObserverBtn
        name="batchValid"
        dataSet={ds}
        funcType="flat"
        color="primary"
        icon="add"
        onClick={() => this.handleChangeSkuStatus(batchValid, 0)}
        getDisable={(data) => !data.some((f) => f.get('supplierShelfFlag') === 0)}
        text={intl.get('smpc.workbench.view.batchValid').d('批量生效')}
      />,
      <ObserverBtn
        name="batchInvalid"
        dataSet={ds}
        icon="remove"
        funcType="flat"
        color="primary"
        onClick={() => this.handleChangeSkuStatus(batchInvalid, 1)}
        getDisable={(data) => !data.some((f) => f.get('supplierShelfFlag') === 1)}
        text={intl.get('smpc.workbench.view.batchInvalid').d('批量失效')}
      />,
    ];
  }

  render() {
    const {
      ds,
      customizeBtnGroup,
      customizeTable,
      match: { path = '' },
    } = this.props;
    const { title, isSup, editPath } = this.state;
    const columns = this.getTogehterColumns();
    const diffBtns = isSup ? this.getSupplierBtns() : [];
    const buttons = [
      <ExportButton
        name="productExport"
        dataSet={ds}
        exportAsync
        requestUrl={`/smpc/v1/${organizationId}/${isSup ? 'sup' : 'pur'}-skus/new/export`}
        getQueryParams={() => {
          const params = (ds.queryDataSet.current && ds.queryDataSet.current.toJSONData()) || {};
          delete params.__dirty;
          delete params.__id;
          delete params._status;
          return {
            skuType: 'CATA',
            supplierTenantId: isSup ? organizationId : undefined,
            ...filterNullValueObject(params),
          };
        }}
        otherButtonProps={{ color: 'primary' }}
        buttonText={intl.get('smpc.productPublish.button.productExport').d('商品导出')}
      />,
      <ExcelExportPro
        name="newExport"
        templateCode={isSup ? 'SMPC_SUP_SKU_EXPORT' : 'SMPC_SKU_EXPORT'}
        buttonText={intl.get('smpc.product.button.skuExportNew').d('(新)商品导出')}
        exportAsync
        otherButtonProps={{
          funcType: 'flat',
          icon: 'unarchive',
          color: 'primary',
          permissionList: [
            {
              code: `${path}.button.export-new`,
              type: 'button',
              meaning: '商品发布-(新)导出',
            },
          ],
        }}
        requestUrl={`/smpc/v1/${organizationId}/${isSup ? 'sup' : 'pur'}-skus/export`}
        queryParams={() => {
          const params = (ds.queryDataSet.current && ds.queryDataSet.current.toJSONData()) || {};
          delete params.__dirty;
          delete params.__id;
          delete params._status;
          return {
            skuType: 'CATA',
            supplierTenantId: isSup ? organizationId : undefined,
            ...filterNullValueObject(params),
          };
        }}
      />,
      ...diffBtns,
      <ObserverBtn
        name="batchSubmit"
        dataSet={ds}
        funcType="flat"
        color="primary"
        icon="playlist_add_check"
        onClick={this.handleBatchSubmit}
        getDisable={(data) => !data.some((f) => f.get('purSkuStatus') === 5)}
        text={intl.get('smpc.product.button.import.productSub').d('商品批量提交')}
      />,
    ];
    const supCustomizeButtons = [
      {
        name: 'skuCreate',
        group: true,
        children: [
          {
            name: 'manualCreate',
            btnType: 'c7n-pro',
            // 没有btnComp时，默认渲染<Button>{child}<Button/>
            child: intl.get('smpc.workbench.view.createManual').d('手动新建'),
            btnProps: {
              onClick: () => this.props.history.push(editPath),
            },
          },
          {
            name: 'priceLibCreate',
            btnType: 'c7n-pro',
            child: intl.get('smpc.workbench.view.quotePrice').d('引用价格库'),
            btnProps: {
              onClick: this.handleQuotePrice,
            },
          },
        ],
        //   // 聚合组按钮 主按钮自渲染，只能用child
        //   // 普通按钮， 自渲染 btnComp || 只能用child
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
        name: 'skuBatchImportNew',
        btnProps: {
          businessObjectTemplateCode: isSup ? 'SMPC.SUP_SKU_IMPORT' : 'SMPC.SKU_IMPORT',
          refreshButton: true,
          buttonText: intl.get('smpc.product.button.skuBatchImportNew').d('(新)商品批量导入'),
          prefixPatch: '/smpc',
          changeServicePrefix: true,
          successCallBack: () => ds.query(),
          buttonProps: {
            icon: 'archive',
            funcType: 'flat',
            permissionList: [
              {
                code: `${path}.button.import-new`,
                type: 'button',
                meaning: '商品发布-(新)导入',
              },
            ],
          },
        },
        btnComp: ImportButton,
      },
      {
        name: 'productBatchImport',
        btnType: 'c7n-pro',
        child: intl.get('smpc.productPublish.button.productBatchImport').d('商品批量导入'),
        btnProps: {
          funcType: 'flat',
          icon: 'archive',
          onClick: this.handleImport,
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={title}>
          {customizeBtnGroup(
            {
              code: isSup ? 'SMPC.SKU_PUBLISH.SUP.BTNS' : 'SMPC.SKU_PUBLISH.PUR.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={supCustomizeButtons} />
          )}
          <Button onClick={this.handleImgImport} funcType="flat" icon="archive">
            {intl.get('smpc.productPublish.view.productManage.imgImport').d('商品图片导入')}
          </Button>
          {/* <Button onClick={this.handleBaseInfoExport} funcType="flat" icon="export">
            {intl.get('smpc.productPublish.button.baseInfoExport').d('基础数据导出')}
          </Button> */}
        </Header>
        <Content className={styles['publish-list-page']}>
          {customizeTable(
            {
              code: isSup ? unitCode.supTable : unitCode.purTable,
              buttonCode: isSup ? unitCode.supTableBtn : unitCode.purTableBtn,
            },
            <Table
              dataSet={this.props.ds}
              buttons={buttons}
              columns={columns}
              rowHeight="auto"
              queryFields={{
                skuType: <Select clearButton={false} />,
              }}
            />
          )}
          {/* <Table dataSet={this.props.ds} buttons={buttons} columns={columns} rowHeight="auto" /> */}
        </Content>
      </React.Fragment>
    );
  }
}
