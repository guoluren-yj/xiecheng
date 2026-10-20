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
import cuxRemote from 'hzero-front/lib/utils/remote';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import ImportButton from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import ExcelExport from 'components/ExcelExport';
import withProps from 'utils/withProps';
import uuidv4 from 'uuid/v4';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { openTab } from 'utils/menuTab';
import queryString from 'querystring';
import notification from 'utils/notification';
import {
  parseParameters,
  filterNullValueObject,
  getCurrentOrganizationId,
  getResponse,
} from 'utils/utils';

import { MenuItemLinkBtn } from '@/routes/components/CommonButtons';
import { ObserverBtn, DropdownBtn } from '@/components/CommonButtons';
import { getC7NExportQueryParams } from '@/utils/utils';
import MappingList from './MappingList';
import { tableDS } from './ds';
import { saveMapping, checkProduct } from './api';

const tenantId = getCurrentOrganizationId();
// 与url路由需一致
const path1 = '/s2-mall/product/catalog-mapping';

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
      requestUrl={`/smpc/v1/${tenantId}/catalog-mappings/${
        mappingType === 'ITEM_CATEGORY' ? 'item-category' : mappingType.toLocaleLowerCase()
      }/export`}
      queryParams={parseParameters({
        ...filterNullValueObject({
          ...(params || {}),
        }),
      })}
      otherButtonProps={{
        type: 'c7n-pro',
        funcType: 'flat',
        icon: 'unarchive',
        hidden: dataSet.getState('customEditable'),
      }}
      buttonText={intl.get('smpc.product.button.export').d('导出')}
    />
  );
});

@formatterCollections({
  code: ['smpc.catalogMapping', 'smpc.product', 'smpc.common'],
})
@cuxRemote({
  code: 'SMPC_CATALOG_MAPPING_REMOTE',
  name: 'remote',
})
@withCustomize({
  unitCode: [
    'SMPC.CATALOG_MAPPING.BTNS',
    'SMPC.CATALOG_MAPPING.ITEM.TABLE',
    'SMPC.CATALOG_MAPPING.ITEM_CATEGORY.TABLE',
    'SMPC.CATALOG_MAPPING.CATEGORY.TABLE',
  ],
})
@withProps(
  () => {
    // 注意顺序
    const codeMap = {
      ITEM: ['', 'SMPC.CATALOG_MAPPING.ITEM.TABLE'],
      ITEM_CATEGORY: ['', 'SMPC.CATALOG_MAPPING.ITEM_CATEGORY.TABLE'],
      CATEGORY: ['', 'SMPC.PRODUCT_MAPPING.CATEGORY.TABLE'],
    };
    const tabConfigs = [
      {
        key: 'ITEM',
        tab: intl.get('smpc.catalogMapping.view.itemMapCatalog').d('物料映射目录'),
        tableCode: codeMap.ITEM[1],
        ds: new DataSet(tableDS('ITEM')),
        importCode: 'SMPC.CATALOG_ITEM_MAP_IMPORT',
        exportCode: 'SMPC_CATALOG_ITEM_MAP_EXPORT',
        permissionList: [
          {
            code: `${path1}.button.item-import-new`,
            type: 'button',
            meaning: '物料映射目录-(新)导入',
            _type: 'import-new',
          },
          {
            code: `${path1}.button.item-export-new`,
            type: 'button',
            meaning: '物料映射目录-(新)导出',
            _type: 'export-new',
          },
        ],
      },
      {
        key: 'ITEM_CATEGORY',
        tab: intl.get('smpc.catalogMapping.view.itemCategoryMapCatalog').d('品类映射目录'),
        tableCode: codeMap.ITEM_CATEGORY[1],
        ds: new DataSet(tableDS('ITEM_CATEGORY')),
        importCode: 'SMPC.CATALOG_MCATE_MAP_IMPORT',
        exportCode: 'SMPC_CATALOG_MCATE_MAP_EXPORT',
        permissionList: [
          {
            code: `${path1}.button.item-category-import-new`,
            type: 'button',
            meaning: '品类映射目录-(新)导入',
            _type: 'import-new',
          },
          {
            code: `${path1}.button.item-category-export-new`,
            type: 'button',
            meaning: '品类映射目录-(新)导出',
            _type: 'export-new',
          },
        ],
      },
      {
        key: 'CATEGORY',
        tab: intl.get('smpc.catalogMapping.view.categoryMapCatalog').d('平台分类映射目录'),
        tableCode: codeMap.CATEGORY[1],
        ds: new DataSet(tableDS('CATEGORY')),
        importCode: 'SMPC.CATALOG_CATE_MAP_IMPORT',
        exportCode: 'SMPC_CATALOG_CATE_MAP_EXPORT',
        permissionList: [
          {
            code: `${path1}.button.category-import-new`,
            type: 'button',
            meaning: '平台分类映射目录-(新)导入',
            _type: 'import-new',
          },
          {
            code: `${path1}.button.category-export-new`,
            type: 'button',
            meaning: '平台分类映射目录-(新)导出',
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
export default class CatalogMapping extends Component {
  state = {
    tabKey: 'ITEM',
  };

  getTabConfig = () => {
    const { tabKey } = this.state;
    const { remote, tabConfigs } = this.props;
    const extendedTabConfigs = remote.process('SMPC_CATALOG_MAPPING_PROCESS_TABS', tabConfigs, {
      component: this,
      tabKey,
    });
    const { ds: currentDs } = extendedTabConfigs.find((f) => f.key === tabKey) || {};
    return [extendedTabConfigs, currentDs];
  };

  manualNew = () => {
    const { tabKey } = this.state;
    const [, currentDs] = this.getTabConfig();
    currentDs.setState('customEditable', true);
    currentDs.create({ enabledFlag: 1, mappingType: tabKey, uuid: uuidv4() }, 0);
  };

  handleImport = () => {
    const { tabKey: mappingType } = this.state;
    const { key, code } =
      mappingType === 'ITEM'
        ? { key: 'SMPC.CATALOG_ITEM_MAP_IMPORT', code: 'srm.common.excel.itemMapCatalogImport' }
        : mappingType === 'ITEM_CATEGORY'
        ? {
            key: 'SMPC.CATALOG_MCATE_MAP_IMPORT',
            code: 'srm.common.excel.itemCategoryMapCatalogImport',
          }
        : {
            key: 'SMPC.CATALOG_CATE_MAP_IMPORT',
            code: 'srm.common.excel.categoryMapCatalogImport',
          };
    openTab({
      key: `/smpc/data-import/${key}`,
      title: code,
      search: queryString.stringify({
        action: code,
        backPath: '/s2-mall/product/catalog-mapping',
      }),
    });
  };

  handleSave = async () => {
    const { tabKey: mappingType } = this.state;
    const [, ds] = this.getTabConfig();
    const flag = await ds.validate();
    if (flag) {
      const params = ds.toJSONData();
      const res = getResponse(await saveMapping(params, mappingType));
      if (res) {
        const result = res || [];
        if (result.length < 1) {
          notification.success();
          await ds.query(ds.currentPage);
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

  handleDelete = async () => {
    const { tabKey: mappingType } = this.state;
    const [, ds] = this.getTabConfig();
    const selectData = ds.selected;
    ds.remove(selectData.filter((f) => f.status === 'add'));
    // 校验该目录下是否有已上架的商品
    const res = await getResponse(
      checkProduct(
        selectData.map((i) => i.toData()),
        mappingType
      )
    );
    if (res && res.checkResult) {
      await ds.delete(
        selectData.filter((f) => f.status !== 'add'),
        {
          title: intl.get('smpc.product.view.delModal.title').d('提示'),
          children: intl
            .get('smpc.product.view.delModal.message1')
            .d('该操作将会导致商品目录变更或下架'),
        }
      );
    } else {
      ds.delete(
        selectData.filter((f) => f.status !== 'add'),
        {
          title: intl.get('smpc.product.view.delModal.title').d('提示'),
          children: intl.get('smpc.common.view.confirm.delete').d('确认删除选中行'),
        }
      );
    }
  };

  handleEdit = () => {
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

  getBtns = () => {
    const { remote } = this.props;
    const { tabKey } = this.state;
    const { importCode, exportCode, permissionList, ds } =
      this.getTabConfig()[0].find((f) => f.key === tabKey) || {};
    const requestUrl = `/smpc/v1/${tenantId}/catalog-mappings/${
      tabKey === 'ITEM_CATEGORY' ? 'item-category' : tabKey.toLocaleLowerCase()
    }/export`;
    // 注意key 值统一以 '_' 分隔
    const importName = `${String(tabKey).toLowerCase().replace(/_/g, '-')}OldImport`;
    const exportName = `${String(tabKey).toLowerCase().replace(/_/g, '-')}OldExport`;
    const customizeButtons = [
      {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        observerBtnProps: () => {
          const colorProps = ds.getState('customEditable')
            ? { color: 'primary' }
            : { funcType: 'flat' };
          return {
            icon: 'save',
            hidden: !ds.getState('customEditable'),
            wait: 1000,
            ...colorProps,
            disabled: !ds.dirty,
            onClick: this.handleSave,
          };
        },
      },
      {
        name: 'create',
        group: true,
        children: [
          {
            name: 'manualCreate',
            btnType: 'c7n-pro',
            child: intl.get('smpc.catalogMapping.view.button.createManual').d('手动新建'),
            btnProps: {
              onClick: this.manualNew,
              style: {
                paddingLeft: 15,
              },
            },
          },
          {
            name: importName,
            btnType: 'c7n-pro',
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
            name: 'new-import',
            btnType: 'c7n-pro',
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
                },
              },
            },
          },
        ],
        child: (
          <DropdownBtn
            dataSet={ds}
            icon="add"
            getIsPrimary={(_ds) => !_ds.getState('customEditable')}
            text={intl.get('hzero.common.button.creation').d('新建')}
          />
        ),
      },
      {
        name: 'edit',
        btnComp: ObserverBtn,
        btnProps: {
          dataSet: ds,
          funcType: 'flat',
          getText: (_ds) =>
            !_ds.getState('customEditable')
              ? intl.get('hzero.common.button.edit').d('编辑')
              : intl.get('hzero.common.button.cance').d('取消'),
          getIcon: (_ds) => (!_ds.getState('customEditable') ? 'mode_edit' : 'cancel'),
          onClick: this.handleEdit,
        },
      },
      {
        name: 'new-export',
        btnComp: ExcelExportPro,
        observerBtnProps: () => ({
          templateCode: exportCode,
          requestUrl,
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
          queryParams: () => getC7NExportQueryParams(ds, 'mappingId'),
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
    ].filter((f) => f.show !== false);
    return remote.process('SMPC_CATALOG_MAPPING_PROCESS_BTNS', customizeButtons, {
      component: this,
      tabKey,
    });
  };

  render() {
    const { tabKey } = this.state;
    const { customizeBtnGroup, customizeTable, remote } = this.props;
    const [, ds] = this.getTabConfig();

    return (
      <React.Fragment>
        <Header title={intl.get('smpc.catalogMapping.view.title').d('目录映射')}>
          {customizeBtnGroup(
            {
              code: 'SMPC.CATALOG_MAPPING.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={this.getBtns()} defaultBtnType="c7n-pro" />
          )}
        </Header>
        <Content className="category-mapping-container">
          <Tabs animated={false} onChange={(val) => this.setState({ tabKey: val })}>
            {this.getTabConfig()[0].map((i) => {
              return (
                <Tabs.TabPane tab={i.tab} key={i.key}>
                  {remote &&
                    remote.process(
                      'SMPC_CATALOG_MAPPING_TABS',
                      <MappingList
                        mappingType={i.key}
                        ds={ds}
                        permissionList={i.permissionList}
                        tableCode={i.tableCode}
                        customizeTable={customizeTable}
                      />,
                      { component: this, tabKey, tabItem: i }
                    )}
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
