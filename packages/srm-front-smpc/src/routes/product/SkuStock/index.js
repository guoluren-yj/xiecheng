/**
 * 库存管理
 * @date: 2020-12-07
 * @author hl <li.huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useState } from 'react';
import queryString from 'querystring';
import { Bind } from 'lodash-decorators';
import {
  DataSet,
  Form,
  Modal,
  Select,
  Lov,
  Tabs,
  TextArea,
  TextField,
  NumberField,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import qs from 'qs';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import { openTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import ImportButton from 'components/Import';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from '_components/SearchBarTable';

import { fetchUseOldReceive } from '@/routes/product/SkuCreate/api';
import ProductInfoCell from '../ProductInfoCell';
import { precisionRender } from '../utilsApi/precision';
import { getSkuStock } from '../SkuWorkbench/tableColumns';
import { ObserverBtn, DropdownBtn, MenuItemBtn } from '../SkuWorkbench/components';
import { saveData } from './api';
import { getStockListDs, getStockEditDs, getStockCreateDs } from './stockDs';
import openStockRecord from './openStockRecord';

import styles from './index.less';

const unitCode = {
  listPur: 'SMPC.COMMODITY_INVENTORY.LIST',
  listSup: 'SMPC.COMMODITY_INVENTORY_SUP.LIST',
  searchPur: 'SMPC.COMMODITY_INVENTORY.SEARCH_BAR',
  receiveSearchPur: 'SMPC.COMMODITY_INVENTORY.RECEIVE.SEARCH_BAR',
  searchSup: 'SMPC.COMMODITY_INVENTORY_SUP.SEARCH_BAR',
  buttonPur: 'SMPC.COMMODITY_INVENTORY.BTNS',
  buttonSup: 'SMPC.COMMODITY_INVENTORY_SUP.BTNS',
};

// customizeUnitCode

const organizationId = getCurrentOrganizationId();

const BatchEdit = observer(({ dataSet }) => {
  const [maxLength, setMaxLength] = useState(0);

  function handleOnInput(e) {
    const { value } = e.target;
    setMaxLength(value.length);
  }
  const stockOpt = dataSet?.current?.get('stockOpt');
  return (
    <Form labelLayout="float" dataSet={dataSet} columns={1}>
      <Select name="stockOpt" />
      {['INC', 'DEC'].includes(stockOpt) && <NumberField name="replenishmentStock" />}
      {stockOpt === 'SETWARNING' && <NumberField name="warningStock" />}
      <div className={styles['remark-wrap']}>
        <TextArea name="remark" cols={4} onInput={handleOnInput} />
        <div className={styles['remark-waring-msg']}>{`${maxLength}/180`}</div>
      </div>
    </Form>
  );
});

@withCustomize({
  unitCode: [
    unitCode.listPur,
    unitCode.listSup,
    unitCode.buttonPur,
    unitCode.buttonSup,
    unitCode.receiveSearchPur,
  ],
})
@formatterCollections({ code: ['smpc.product', 'smpc.inventory', 'smpc.workbench'] })
export default class InventoryManage extends React.Component {
  constructor(props) {
    super(props);
    const {
      location: { pathname, search },
    } = this.props;
    const isSup = pathname.includes('stock-manage-sup');
    this.initListDs(isSup);
    const { tabKey: initTabKey = 'SALE' } = qs.parse(search.substr(1));
    this.state = {
      isSup,
      tabKey: initTabKey,
      oldReceive: true,
    };
  }

  componentDidMount() {
    fetchUseOldReceive().then((res) => {
      this.setState({ oldReceive: res });
    });
  }

  initListDs = () => {
    this.purSaleListDs = new DataSet(
      getStockListDs({ customizeUnitCode: `${unitCode.listPur},${unitCode.searchPur}` })
    );
    this.purReceiveListDs = new DataSet(
      getStockListDs({
        stockType: 'RECEIVE',
        customizeUnitCode: `${unitCode.listPur},${unitCode.searchPur}`,
      })
    );
    this.supplierListDs = new DataSet(
      getStockListDs({
        isSup: true,
        customizeUnitCode: `${unitCode.listSup},${unitCode.searchSup}`,
      })
    );
  };

  handleTabChange = (key) => {
    this.setState({ tabKey: key });
  };

  handleCreate = () => {
    const { tabKey, isSup } = this.state;
    const listDs = this.getDataSet();
    const createDs = new DataSet(getStockCreateDs(isSup, tabKey));
    createDs.create({ stockType: tabKey });
    Modal.open({
      drawer: true,
      title: intl.get('smpc.product.view.title.createStock').d('新建库存'),
      style: { width: 380 },
      onOk: async () => {
        const flag = await createDs.validate();
        if (flag) {
          await createDs.submit();
          listDs.query();
        } else {
          return false;
        }
      },
      children: (
        <Form labelLayout="float" columns={1} dataSet={createDs}>
          <Lov name="skuLov" />
          <TextField name="skuName" />
          <TextField name="supplierCompanyName" />
          <Select name="stockType" />
          {tabKey === 'RECEIVE' && <Lov name="inventoryLov" />}
          <NumberField name="warningStock" />
          <NumberField name="totalStock" />
        </Form>
      ),
    });
  };

  handleBatchEdit = () => {
    const batchDs = new DataSet(getStockEditDs());
    Modal.open({
      drawer: true,
      title: intl.get('smpc.workbench.view.batchMatain').d('批量编辑'),
      style: { width: 380 },
      onOk: () => this.handleOk(batchDs),
      children: <BatchEdit dataSet={batchDs} />,
    });
  };

  @Bind()
  async handleOk(ds) {
    const flag = await ds.validate();
    if (!flag) return false;
    const listDs = this.getDataSet();
    const data = ds.current.toJSONData();
    const method = data.stockOpt === 'SETWARNING' ? 'POST' : 'PUT';
    const params = listDs.selected.map((record) => {
      return {
        ...record.toData(),
        ...data,
      };
    });
    const res = getResponse(await saveData(params, method));
    if (res) {
      notification.success();
      listDs.query(listDs.currentPage);
      return true;
    }
    return false;
  }

  /**
   * 导入
   */
  @Bind()
  handleImport() {
    const {
      location: { pathname },
    } = this.props;
    const { tabKey } = this.state;
    const { importCode } = this.getImportExportConfig();
    openTab({
      key: `/smpc/data-import/${importCode}`,
      title: 'srm.common.view.stockImport',
      // title: intl.get('srm.common.view.stockImport').d('库存导入'),
      search: queryString.stringify({
        action: 'srm.common.view.stockImport',
        backPath: pathname,
        args: JSON.stringify({
          stockType: tabKey,
          templateCode: importCode,
        }),
      }),
    });
  }

  @Bind()
  renderProductInfo({ record }) {
    const { mediaPath, skuName, spuCode, categoryNamePath } = record.toData();
    return (
      <ProductInfoCell
        skuName={skuName}
        spuCode={spuCode}
        imagePath={mediaPath}
        categoryNamePath={categoryNamePath}
      />
    );
  }

  @Bind()
  getColumns() {
    const { isSup, tabKey } = this.state;
    const columns = [
      {
        name: 'skuCode',
        width: 150,
      },
      {
        name: 'productInfo',
        renderer: this.renderProductInfo,
        minWidth: 320,
        tooltip: 'none',
      },
      {
        key: 'itemInfo',
        header: intl.get('smpc.product.model.itemInfo').d('物料信息'),
        aggregation: true,
        align: 'left',
        minWidth: 200,
        tooltip: 'none',
        show: !isSup && tabKey !== 'RECEIVE',
        children: [
          {
            name: 'itemCode',
          },
          {
            name: 'itemName',
          },
        ],
      },
      {
        name: 'supplierCompanyName',
        width: 150,
        show: !isSup,
      },
      {
        name: 'warningStock',
        width: 150,
        renderer: precisionRender,
      },
      {
        name: 'consumedStock',
        width: 150,
        renderer: precisionRender,
      },
      {
        name: 'surplusStock',
        width: 150,
        renderer: ({ record, name }) => {
          return getSkuStock({ showLine: false, record, skuStockName: name });
        },
      },
      {
        name: 'totalStock',
        width: 150,
        renderer: ({ value, record }) =>
          value === -1 || isNaN(value)
            ? intl.get('smpc.product.model.noLimitStock').d('无限库存')
            : precisionRender({ name: 'totalStock', record }),
      },
      {
        name: 'inventoryName',
        width: 120,
        show: tabKey === 'RECEIVE',
      },
      // {
      //   name: 'stockTypeMeaning',
      //   width: 100,
      // },
      {
        name: 'action',
        width: 100,
        lock: 'right',
        renderer: ({ record }) => (
          <a onClick={() => openStockRecord(record, isSup, tabKey === 'RECEIVE')}>
            {intl.get('smpc.product.button.stockRecord').d('库存记录')}
          </a>
        ),
      },
    ];
    return columns.filter((f) => f.show !== false);
  }

  getCustomCode = () => {
    const { isSup, tabKey } = this.state;
    return {
      tableCode: isSup ? unitCode.listSup : unitCode.listPur,
      searchCode: isSup
        ? unitCode.searchSup
        : tabKey === 'SALE'
        ? unitCode.searchPur
        : unitCode.receiveSearchPur,
    };
  };

  getDataSet = () => {
    const { isSup, tabKey } = this.state;
    return isSup
      ? this.supplierListDs
      : tabKey === 'SALE'
      ? this.purSaleListDs
      : this.purReceiveListDs;
  };

  getTable = (dataSet) => {
    const { customizeTable } = this.props;
    const columns = this.getColumns();
    const { tableCode, searchCode } = this.getCustomCode();
    return customizeTable(
      {
        code: tableCode,
      },
      <SearchBarTable
        aggregation
        columns={columns}
        rowHeight={54}
        dataSet={dataSet}
        searchBarConfig={{
          fieldProps: {
            supplierCompanyId: {
              lovPara: { tenantId: organizationId },
            },
            itemId: {
              lovPara: { tenantId: organizationId },
            },
          },
        }}
        searchCode={searchCode}
        onAggregationChange={() => {}}
      />
    );
  };

  getExportParams = () => {
    const { tabKey } = this.state;
    const dataSet = this.getDataSet();
    const { tableCode, searchCode } = this.getCustomCode();
    const customizeUnitCode = `${tableCode},${searchCode}`;
    const params = dataSet.queryDataSet?.current?.toJSONData() || {};
    delete params.__dirty;
    delete params.__id;
    delete params._status;
    delete params.customizeUnitCode;
    return filterNullValueObject({
      ...params,
      stockType: tabKey,
      // 物料查询导出
      customData: JSON.stringify({ exportSearchbarUnitCode: customizeUnitCode }),
      customizeUnitCode,
    });
  };

  getImportExportConfig = () => {
    const { isSup, tabKey } = this.state;
    return isSup
      ? {
          importCode: 'SMPC.SKU_STOCK_SALE_IMPORT',
          exportCode: 'SMPC_SUP_SKU_STOCK_EXPORT',
          exportUrl: `/smpc/v1/${organizationId}/sku-stocks/supplier/export`,
        }
      : tabKey === 'SALE'
      ? {
          importCode: 'SMPC.SKU_STOCK_SALE_IMPORT',
          exportCode: 'SMPC_SKU_STOCK_SALE_EXPORT',
          exportUrl: `/smpc/v1/${organizationId}/sku-stocks/export/sale`,
        }
      : {
          importCode: 'SMPC.SKU_STOCK_RECORD_IMPORT',
          exportCode: 'SMPC_SKU_STOCK_EXPORT',
          exportUrl: `/smpc/v1/${organizationId}/sku-stocks/export`,
        };
  };

  render() {
    const { isSup, tabKey, oldReceive } = this.state;
    const {
      match: { path = '' },
      customizeBtnGroup,
    } = this.props;
    const currentDataSet = this.getDataSet();
    const { importCode, exportCode, exportUrl } = this.getImportExportConfig();
    // 注意key 值统一以 '_' 分隔
    const importName = isSup
      ? 'batchImport'
      : `${String(tabKey).toLowerCase().replace(/_/g, '-')}OldImport`;
    const exportName = isSup
      ? 'export'
      : `${String(tabKey).toLowerCase().replace(/_/g, '-')}OldExport`;
    const customizeButtons = [
      {
        name: 'create',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          onClick: this.handleCreate,
          color: 'primary',
          icon: 'add',
        },
      },
      {
        name: 'batchEdit',
        btnComp: ObserverBtn,
        btnProps: {
          icon: 'mode_edit',
          funcType: 'flat',
          dataSet: currentDataSet,
          getDisable: (n) => n.length < 1,
          text: intl.get('smpc.workbench.view.batchMatain').d('批量编辑'),
          onClick: this.handleBatchEdit,
        },
      },
      {
        name: 'newExport',
        btnComp: ExcelExportPro,
        btnProps: {
          exportAsync: true,
          templateCode: exportCode,
          requestUrl: exportUrl,
          queryParams: this.getExportParams,
          buttonText: intl.get('smpc.product.button.exportNew').d('(新)导出'),
          otherButtonProps: {
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
            permissionList: [
              { code: `${path}.button.export-new`, type: 'button', meaning: '库存管理-(新)导出' },
            ],
          },
        },
      },
      {
        name: 'newImport',
        btnComp: ImportButton,
        btnProps: {
          businessObjectTemplateCode: importCode,
          refreshButton: true,
          buttonText: intl.get('smpc.product.button.batchImportNew').d('(新)批量导入'),
          prefixPatch: '/smpc',
          args: {
            stockType: tabKey,
            templateCode: importCode,
          },
          successCallBack: () => currentDataSet.query(),
          buttonProps: {
            icon: 'archive',
            funcType: 'flat',
            permissionList: [
              { code: `${path}.button.import-new`, type: 'button', meaning: '库存管理-(新)导入' },
            ],
          },
        },
      },
      {
        name: 'more',
        group: true,
        children: [
          {
            name: importName,
            btnComp: MenuItemBtn,
            btnProps: {
              text: intl.get('hzero.common.button.batchImport').d('批量导入'),
              onClick: this.handleImport,
            },
          },
          {
            name: exportName,
            btnComp: MenuItemBtn,
            btnProps: {
              btnComp: ExcelExport,
              requestUrl: exportUrl,
              queryParams: this.getExportParams,
              otherButtonProps: {
                icon: '',
                type: 'c7n-pro',
                funcType: 'flat',
              },
            },
          },
        ],
        child: <DropdownBtn icon="more_horiz" hiddenIcon funcType="flat" />,
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={
            isSup
              ? intl.get('smpc.inventory.view.supTitle').d('库存管理（供）')
              : intl.get('smpc.inventory.view.purTitle').d('库存管理（采）')
          }
        >
          {customizeBtnGroup(
            {
              code: isSup ? unitCode.buttonSup : unitCode.buttonPur,
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={customizeButtons} />
          )}
        </Header>
        <Content className={styles['inventory-manage-container']}>
          {isSup ? (
            this.getTable(this.supplierListDs)
          ) : (
            <Tabs onChange={this.handleTabChange} activeKey={tabKey}>
              <Tabs.TabPane
                tab={intl.get('smpc.product.view.title.saleStock').d('销售库存')}
                key="SALE"
              >
                {this.getTable(this.purSaleListDs)}
              </Tabs.TabPane>
              {oldReceive && (
                <Tabs.TabPane
                  tab={intl.get('smpc.product.view.title.receiveStock').d('领用库存')}
                  key="RECEIVE"
                >
                  {this.getTable(this.purReceiveListDs)}
                </Tabs.TabPane>
              )}
            </Tabs>
          )}
        </Content>
      </React.Fragment>
    );
  }
}

export { BatchEdit };
