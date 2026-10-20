/**
 * 目录映射
 * @date: 2020-12-07
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { DataSet, Tabs, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { openTab } from 'utils/menuTab';
import uuidv4 from 'uuid/v4';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import ImportButton from 'components/Import';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { observer } from 'mobx-react-lite';
import queryString from 'querystring';
import {
  parseParameters,
  filterNullValueObject,
  getCurrentOrganizationId,
  getResponse,
} from 'utils/utils';
import cuxRemote from 'utils/remote';

import { Throttle } from 'lodash-decorators';
import { MenuItemLinkBtn, DropdownBtn } from '@/components/CommonButtons';
import { getC7NExportQueryParams } from '@/utils/utils';
import MappingList from './MappingList';
import { tableDS } from './ds';
import { saveMapping } from './api';

// 与url路由需一致
const path1 = '/s2-mall/product/product-mapping';
const tenantId = getCurrentOrganizationId();

const ExportButton = observer(({ dataSet, mappingType }) => {
  const params =
    dataSet.queryDataSet &&
    dataSet.queryDataSet.current &&
    dataSet.queryDataSet.current.toJSONData();
  if (params) {
    delete params.__dirty;
    delete params.__id;
    delete params._status;
  }
  return (
    <ExcelExport
      requestUrl={`/smpc/v1/${tenantId}/sku-mappings/${
        mappingType === 'ITEM_CATEGORY' ? 'item-category' : mappingType.toLocaleLowerCase()
      }/export`}
      queryParams={parseParameters({
        ...filterNullValueObject({
          ...(params || {}),
        }),
      })}
      otherButtonProps={{
        type: 'c7n-pro',
        icon: 'unarchive',
        funcType: 'flat',
        hidden: dataSet.getState('customEditable'),
      }}
      buttonText={intl.get('smpc.product.button.export').d('导出')}
    />
  );
});

@cuxRemote(
  {
    code: 'SMPC_PRODUCT_MAPPING_REMOTE',
    name: 'remote',
  },
  {
    process: {},
  }
)
@formatterCollections({
  code: ['smpc.productMapping', 'smpc.product', 'smpc.common'],
})
@withCustomize({
  unitCode: [
    'SMPC.PRODUCT_MAPPING.BTNS',
    'SMPC.PRODUCT_MAPPING.ITEM.TABLE',
    'SMPC.PRODUCT_MAPPING.ITEM_CATEGORY.TABLE',
    'SMPC.PRODUCT_MAPPING.CATALOG.TABLE',
  ],
})
@withProps(
  () => {
    // 注意顺序
    const codeMap = {
      ITEM: ['SMPC.PRODUCT_MAPPING.ITEM.SEARCHBAR', 'SMPC.PRODUCT_MAPPING.ITEM.TABLE'],
      ITEM_CATEGORY: [
        'SMPC.PRODUCT_MAPPING.ITEM_CATEGORY.SEARCHBAR',
        'SMPC.PRODUCT_MAPPING.ITEM_CATEGORY.TABLE',
      ],
      CATALOG: ['SMPC.PRODUCT_MAPPING.CATALOG.SEARCHBAR', 'SMPC.PRODUCT_MAPPING.CATALOG.TABLE'],
    };
    const tabConfigs = [
      {
        key: 'ITEM',
        tab: intl.get('smpc.productMapping.view.itemMapProduct').d('物料映射商品'),
        ds: new DataSet(tableDS('ITEM', codeMap.ITEM)),
        importCode: 'SMPC.SKU_ITEM_MAP_IMPORT',
        exportCode: 'SMPC_SKU_ITEM_MAP_EXPORT',
        searchCode: codeMap.ITEM[0],
        tableCode: codeMap.ITEM[1],
        permissionList: [
          {
            code: `${path1}.button.item-import-new`,
            type: 'button',
            meaning: '物料映射商品-(新)导入',
            _type: 'import-new',
          },
          {
            code: `${path1}.button.third-code-import-new`,
            type: 'button',
            meaning: '物料映射商品第三方编码-(新)导入',
            _type: 'third-import-new',
          },
          {
            code: `${path1}.button.item-export-new`,
            type: 'button',
            meaning: '物料映射商品-(新)导出',
            _type: 'export-new',
          },
        ],
      },
      {
        key: 'ITEM_CATEGORY',
        tab: intl.get('smpc.productMapping.view.itemCategoryMapProduct').d('品类映射商品'),
        ds: new DataSet(tableDS('ITEM_CATEGORY', codeMap.ITEM_CATEGORY)),
        importCode: 'SMPC.SKU_MCATE_MAP_IMPORT',
        exportCode: 'SMPC_SKU_MCATE_MAP_EXPORT',
        searchCode: codeMap.ITEM_CATEGORY[0],
        tableCode: codeMap.ITEM_CATEGORY[1],
        permissionList: [
          {
            code: `${path1}.button.item-category-import-new`,
            type: 'button',
            meaning: '品类映射商品-(新)导入',
            _type: 'import-new',
          },
          {
            code: `${path1}.button.item-category-export-new`,
            type: 'button',
            meaning: '品类映射商品-(新)导出',
            _type: 'export-new',
          },
        ],
      },
      {
        key: 'CATALOG',
        tab: intl.get('smpc.productMapping.view.catalogMapProduct').d('目录映射商品'),
        ds: new DataSet(tableDS('CATALOG', codeMap.CATALOG)),
        importCode: 'SMPC.SKU_CATALOG_MAP_IMPORT',
        exportCode: 'SMPC_SKU_CATALOG_MAP_EXPORT',
        searchCode: codeMap.CATALOG[0],
        tableCode: codeMap.CATALOG[1],
        permissionList: [
          {
            code: `${path1}.button.catalog-import-new`,
            type: 'button',
            meaning: '目录映射商品-(新)导入',
            _type: 'import-new',
          },
          {
            code: `${path1}.button.catalog-export-new`,
            type: 'button',
            meaning: '目录映射商品-(新)导出',
            _type: 'export-new',
          },
        ],
      },
    ];
    return { tabConfigs };
  },
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class productMapping extends Component {
  state = {
    tabKey: 'ITEM',
  };

  getTabConfig = () => {
    const { tabConfigs } = this.props;
    const { tabKey } = this.state;
    // 当前Tab ds
    const { ds } = tabConfigs.find((f) => f.key === tabKey) || {};
    return [tabConfigs, ds];
  };

  manualNew = () => {
    const { tabKey } = this.state;
    const [, currentDs] = this.getTabConfig();
    currentDs.setState('customEditable', true);
    currentDs.create({ enabledFlag: 1, mappingType: tabKey, uuid: uuidv4() }, 0);
    this.forceUpdate(); // 用于触发个性化
  };

  handleDelete = async () => {
    const { tabKey: mappingType } = this.state;
    const [, ds] = this.getTabConfig();
    const selectData = ds.selected;
    ds.remove(selectData.filter((f) => f.status === 'add'));
    await ds.delete(
      selectData.filter((f) => f.status !== 'add'),
      mappingType === 'CATALOG'
        ? {
            title: intl.get('smpc.product.view.delModal.title').d('提示'),
            children: intl
              .get('smpc.product.view.delModal.message1')
              .d('该操作将会导致商品目录变更或下架'),
          }
        : {
            title: intl.get('smpc.product.view.delModal.title').d('提示'),
            children: intl.get('smpc.common.view.confirm.delete').d('确认删除选中行'),
          }
    );
  };

  handleSave = async () => {
    const { remote } = this.props;
    const { tabKey: mappingType } = this.state;
    const [, ds] = this.getTabConfig();
    const flag = await ds.validate();
    if (flag) {
      const params = ds.toJSONData();
      const beforeCheck = await remote.event.fireEvent('beforeCheck', { params, mappingType });
      if (beforeCheck === false) return false;
      const res = getResponse(await saveMapping(params, mappingType));
      if (res) {
        const result = res || [];
        if (result.length < 1) {
          notification.success();
          ds.query();
          ds.setState('customEditable', false);
        } else {
          notification.error({
            message: intl.get('smpc.product.view.mappingErrMsg').d('数据映射关系已存在，操作失败'),
          });
          ds.records.forEach((record) => {
            if (
              result.some((s) =>
                s.uuid ? s.uuid === record.get('uuid') : s.mappingId === record.get('mappingId')
              )
            ) {
              record.set('repeatError', true);
            }
          });
        }
      }
    }
  };

  @Throttle(1000)
  handleEdit = async () => {
    const [, currentDs] = this.getTabConfig();
    const currentEditable = currentDs.getState('customEditable');
    // 点击编辑, 进入编辑状态
    if (!currentEditable) {
      currentDs.setState('customEditable', !currentEditable);
    }
    // 点击取消，校验是否有数据更改
    else if (currentDs.dirty) {
      Modal.confirm({
        title: intl.get('smpc.product.view.delModal.title').d('提示'),
        children: intl
          .get('smpc.product.view.updateModal.confirm.message')
          .d('当前操作将会清空变更过的数据，是否继续？'),
        onOk: () => {
          currentDs.setState('customEditable', !currentEditable);
          currentDs.reset(); // 防止取消编辑后切换tab还出现*
          this.forceUpdate();
          currentDs.query(currentDs.currentPage);
        },
      });
    } else {
      currentDs.setState('customEditable', !currentEditable);
    }
    // 处理 Table个性化字段编辑状态切换（customizeTable 需重新渲染组件）
    this.forceUpdate();
  };

  handleThirdCodeImport = () => {
    const intlCode = 'srm.common.excel.thirdSkuCodeImport';
    openTab({
      title: intlCode,
      key: `/smpc/data-import/SMPC.THIRD_SKU_CODE_ITEM_MAP`,
      search: queryString.stringify({
        action: intlCode,
        backPath: '/s2-mall/product/product-mapping',
      }),
    });
  };

  handleImport = () => {
    const { tabKey: mappingType } = this.state;
    const { key, code } =
      mappingType === 'ITEM'
        ? { key: 'SMPC.SKU_ITEM_MAP_IMPORT', code: 'srm.common.excel.itemMapSkuImport' }
        : mappingType === 'ITEM_CATEGORY'
        ? { key: 'SMPC.SKU_MCATE_MAP_IMPORT', code: 'srm.common.excel.itemCategoryMapSkuImport' }
        : {
            key: 'SMPC.SKU_CATALOG_MAP_IMPORT',
            code: 'srm.common.excel.catalogMapSkuImport',
          };
    openTab({
      key: `/smpc/data-import/${key}`,
      title: code,
      search: queryString.stringify({
        action: code,
        backPath: '/s2-mall/product/product-mapping',
      }),
    });
  };

  filterBtns = (btns) => {
    const filter = (arr) => arr.filter((b) => b.show !== false);
    const _btns = btns.map((m) => {
      const { children, ...other } = m;
      if (children) {
        const filterChildren = filter(children);
        return { ...other, children: filterChildren };
      }
      return m;
    });
    return filter(_btns);
  };

  getBtns = () => {
    const { tabKey } = this.state;
    const { importCode, exportCode, permissionList, ds } =
      this.getTabConfig()[0].find((f) => f.key === tabKey) || {};
    // 注意key 值统一以 '_' 分隔
    const importName = `${String(tabKey).toLowerCase().replace(/_/g, '-')}OldImport`;
    const exportName = `${String(tabKey).toLowerCase().replace(/_/g, '-')}OldExport`;
    const customizeButtons = [
      {
        name: 'create',
        group: true,
        children: [
          {
            name: 'manualCreate',
            child: intl.get('smpc.product.view.button.createManual').d('手动新建'),
            btnProps: {
              onClick: this.manualNew,
              style: {
                paddingLeft: 15,
              },
            },
          },
          {
            name: importName,
            child: intl.get('hzero.common.import').d('导入'),
            btnProps: {
              onClick: this.handleImport,
              style: {
                textAlign: 'left',
                marginLeft: 0,
                border: 'none',
              },
            },
          },
          {
            name: 'newImport',
            btnComp: MenuItemLinkBtn,
            btnProps: {
              btnComp: ImportButton,
              businessObjectTemplateCode: importCode,
              refreshButton: true,
              buttonText: intl.get('smpc.product.button.importNew').d('(新)导入'),
              prefixPatch: '/smpc',
              successCallBack: () => ds.query,
              buttonProps: {
                icon: '',
                funcType: 'link',
                permissionList: permissionList.filter((f) => f._type === 'import-new'),
                style: {
                  textAlign: 'left',
                  marginLeft: 0,
                  fontWeight: 'normal',
                },
              },
            },
          },
          // {
          //   show: tabKey === 'ITEM',
          //   name: 'thirdCodeImportNew',
          //   btnType: 'c7n-pro',
          //   btnComp: ImportButton,
          //   btnProps: {
          //     businessObjectTemplateCode: 'SMPC.THIRD_SKU_CODE_ITEM_MAP',
          //     refreshButton: true,
          //     buttonText: intl.get('smpc.product.button.thirdCodeImportNew').d('(新)第三方编码导入'),
          //     prefixPatch: '/smpc',
          //     successCallBack: () => ds.query(),
          //     buttonProps: {
          //       icon: '',
          //       funcType: 'flat',
          //       permissionList: permissionList.filter((f) => f._type === 'third-import-new'),
          //       style: {
          //         textAlign: 'left',
          //         marginLeft: 0,
          //         display: 'block',
          //         fontWeight: 'normal',
          //       },
          //     },
          //   },
          // },
        ],
        child: (fieldName, help) => (
          <DropdownBtn
            dataSet={ds}
            icon="add"
            btnHelp={help}
            getIsPrimary={(_ds) => !_ds.getState('customEditable')}
            text={intl.get('hzero.common.button.creation').d('新建')}
          />
        ),
      },
      {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        observerBtnProps: () => {
          const colorProps = ds.getState('customEditable')
            ? { color: 'primary' }
            : { funcType: 'flat' };
          return {
            onClick: this.handleSave,
            disabled: !ds.dirty,
            hidden: !ds.getState('customEditable'),
            wait: 1000,
            icon: 'save',
            ...colorProps,
          };
        },
      },
      {
        name: 'cancel',
        child: intl.get('hzero.common.button.cance').d('取消'),
        observerBtnProps: () => ({
          onClick: this.handleEdit,
          icon: 'cancel',
          funcType: 'flat',
          hidden: !ds.getState('customEditable'),
        }),
      },
      {
        name: 'edit',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        observerBtnProps: () => ({
          onClick: this.handleEdit,
          icon: 'mode_edit',
          funcType: 'flat',
          hidden: ds.getState('customEditable'),
        }),
      },
      {
        name: 'newExport',
        btnComp: ExcelExportPro,
        observerBtnProps: () => ({
          templateCode: exportCode,
          method: 'POST',
          allBody: true,
          buttonText:
            ds.selected.length > 0
              ? intl.get('smpc.product.button.selectBatchExportNew').d('勾选导出')
              : intl.get('smpc.product.button.batchExportNew').d('导出'),
          otherButtonProps: {
            icon: 'unarchive',
            funcType: 'flat',
            hidden: ds.getState('customEditable'),
            permissionList: permissionList.filter((f) => f._type === 'export-new'),
          },
          requestUrl: `/smpc/v1/${tenantId}/sku-mappings/${
            tabKey === 'ITEM_CATEGORY' ? 'item-category' : tabKey.toLocaleLowerCase()
          }/export`,
          queryParams: () =>
            getC7NExportQueryParams(ds, 'mappingId', 'exportIds', {
              skuType: ds.queryDataSet?.current.get('skuType'),
            }),
        }),
      },
      {
        name: exportName,
        btnComp: ExportButton,
        btnProps: {
          dataSet: ds,
          mappingType: tabKey,
        },
      },
      {
        name: 'delete',
        child: intl.get('smpc.product.button.batchDelete').d('批量删除'),
        observerBtnProps: () => ({
          icon: 'delete_sweep',
          // hidden: !ds.getState('customEditable'),
          wait: 1000,
          funcType: 'flat',
          disabled: ds.selected.length === 0,
          onClick: this.handleDelete,
        }),
      },
    ];
    return this.filterBtns(customizeButtons);
  };

  render() {
    const { customizeBtnGroup, customizeTable } = this.props;
    const [, ds] = this.getTabConfig();

    return (
      <React.Fragment>
        <Header title={intl.get('smpc.productMapping.view.title').d('商品映射')}>
          {customizeBtnGroup(
            {
              code: 'SMPC.PRODUCT_MAPPING.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={this.getBtns()} defaultBtnType="c7n-pro" />
          )}
        </Header>
        <Content className="product-mapping-container">
          <Tabs animated={false} onChange={(val) => this.setState({ tabKey: val })}>
            {this.getTabConfig()[0].map((i) => {
              return (
                <Tabs.TabPane tab={i.tab} key={i.key}>
                  <MappingList
                    mappingType={i.key}
                    ds={ds}
                    permissionList={i.permissionList}
                    searchCode={i.searchCode}
                    tableCode={i.tableCode}
                    customizeTable={customizeTable}
                  />
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
