/**
 * 目录管理
 * @date: 2020-12-09
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import ImportButton from 'hzero-front/lib/components/Import';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { DropdownBtn, MenuItemLinkBtn, ObserverBtn } from '@/components/CommonButtons';
import { getC7NExportQueryParams, getC7NQueryParams } from '@/utils/utils';
import c7nModal from '@/utils/c7nModal';

import CatalogForm from './CatalogForm';
import CategoryTree from './CatalogList/CategoryTree';
import CatalogList from './CatalogList';
import { tableDs } from './CatalogList/ds';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: [
    'smpc.catalogManage',
    'smpc.product',
    'hzero.common',
    'halt.alertAdvanced',
    'smpc.common',
    'smpc.catalog',
    'sagm.common',
  ],
})
@withProps(() => ({ dataSet: new DataSet(tableDs()) }), {
  cacheState: true,
  keepOriginDataSet: true,
})
@withCustomize({
  unitCode: [
    'SMPC.CATALOG_MANAGE.BTNS',
    'SMPC.CATALOG_MANAGE.LIST',
    'SMPC.CATALOG_MANAGE.MATAIN.FORM',
  ],
})
export default class CatalogManage extends Component {
  // 查询参数
  getQueryParams = () => {
    const { dataSet } = this.props;
    if (dataSet.queryDataSet.current) {
      const { enabledFlag } = dataSet.queryDataSet.current.toJSONData();
      return filterNullValueObject({ enabledFlag });
    }
    return {};
  };

  catalogListRef;

  // 编辑目录弹窗
  handleOpenCatalogModal = (level, record, parentCatalogId = -1) => {
    const { customizeForm } = this.props;
    Modal.open({
      drawer: true,
      style: { width: 380 },
      title: record
        ? intl.get('smpc.catalogManage.button.editCatalog').d('编辑目录')
        : level === 1
        ? intl.get('smpc.catalogManage.button.createTopCatalog').d('新增顶级目录')
        : intl.get('smpc.catalogManage.button.createNextCatalog').d('新增下级目录'),
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: (
        <CatalogForm
          level={level}
          data={record ? record.toData() : null}
          parentCatalogId={parentCatalogId}
          customizeForm={customizeForm}
          successCallback={this.query}
        />
      ),
    });
  };

  // 编辑后保存回调
  query = () => {
    const { dataSet } = this.props;
    dataSet.query(dataSet.currentPage, null, false);
  };

  handleExpandOrCollapse = () => {
    const { dataSet } = this.props;
    // table 展开状态， 执行收起操作
    if (dataSet.getState('customExpanded')) {
      this.catalogListRef.collapseAll();
    }
    // table 收起状态， 执行展开操作
    else {
      this.catalogListRef.expandAll();
    }
  };

  impPlatformCatalog = () => {
    c7nModal({
      title: intl.get('smpc.catalogManage.view.addCategoryToDirectory').d('引用平台分类作为目录'),
      style: { width: 380 },
      okText: intl.get('hzero.common.button.create').d('新建'),
      children: (
        <CategoryTree
          onRef={(ref) => {
            this.categoryTreeRef = ref;
          }}
        />
      ),
    });
  };

  render() {
    const {
      match: { path = '' },
      dataSet,
      customizeTable,
      customizeBtnGroup,
    } = this.props;
    const customizeButtons = [
      {
        name: 'create',
        group: true,
        children: [
          {
            name: 'addTopCatalog',
            btnType: 'c7n-pro',
            child: intl.get('smpc.catalogManage.button.createTopCatalog').d('新建一级目录'),
            btnProps: {
              onClick: () => this.handleOpenCatalogModal(1),
            },
          },
          {
            name: 'impPlatformCatalog',
            btnType: 'c7n-pro',
            child: intl.get('smpc.catalogManage.button.impPlatformCatalog').d('引用平台分类'),
            btnProps: {
              onClick: this.impPlatformCatalog,
            },
          },
          {
            name: 'old-import',
            btnType: 'c7n-pro',
            child: intl.get('hzero.common.import').d('导入'),
            btnProps: {
              onClick: () => this.catalogListRef.handleImport(),
            },
          },
          {
            name: 'new-import',
            btnType: 'c7n-pro',
            btnComp: MenuItemLinkBtn,
            btnProps: {
              btnComp: ImportButton,
              businessObjectTemplateCode: 'SMPC.CATALOG_IMPORT',
              refreshButton: true,
              prefixPatch: '/smpc',
              buttonText: intl.get('smpc.product.button.importNew').d('(新)导入'),
              successCallBack: () => dataSet.query(),
              buttonProps: {
                icon: '',
                funcType: 'link',
                permissionList: [
                  {
                    code: `${path}.button.import-new`,
                    type: 'button',
                    meaning: '目录管理-(新)导入',
                  },
                ],
              },
            },
          },
        ],
        child: (
          <DropdownBtn
            primary
            icon="add"
            color="primary"
            text={intl.get('hzero.common.model.create').d('新建')}
          />
        ),
      },
      // {
      //   name: 'save',
      //   btnType: 'c7n-pro',
      //   child: intl.get('hzero.common.button.save').d('保存'),
      //   btnProps: {
      //     icon: 'save',
      //     funcType: 'flat',
      //     await: 1000,
      //     onClick: async () => {
      //       await dataSet.submit();
      //     },
      //   },
      // },
      {
        name: 'new-export',
        btnComp: ExcelExportPro,
        observerBtnProps: () => ({
          templateCode: 'SMPC_CATALOG_EXPORT',
          exportAsync: true,
          method: 'POST',
          allBody: true,
          buttonText:
            dataSet.selected.length > 0
              ? intl.get('smpc.product.button.selectBatchExportNew').d('勾选导出')
              : intl.get('smpc.product.button.batchExportNew').d('导出'),
          requestUrl: `/smpc/v1/${organizationId}/catalogs/export`,
          queryParams: () => getC7NExportQueryParams(dataSet, 'catalogId'), // 待确认
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            permissionList: [
              { code: `${path}.button.export-new`, type: 'button', meaning: '目录管理-(新)导出' },
            ],
          },
        }),
      },
      {
        name: 'old-export',
        btnComp: ExcelExport,
        observerBtnProps: () => ({
          exportAsync: true,
          // queryParams: this.getQueryParams,
          queryParams: () => getC7NQueryParams(dataSet),
          requestUrl: `/smpc/v1/${organizationId}/catalogs/export`,
          otherButtonProps: { type: 'c7n-pro', funcType: 'flat', icon: 'unarchive' },
        }),
      },
      {
        name: 'expandOrCollapse',
        btnComp: ObserverBtn,
        btnProps: {
          dataSet,
          getText: (ds) =>
            ds.getState('customExpanded')
              ? intl.get('sagm.common.model.collapseAll').d('全部收起')
              : intl.get('hzero.common.button.expandAll').d('全部展开'),
          getIcon: (ds) =>
            ds.getState('customExpanded') ? 'baseline-arrow_right' : 'baseline-arrow_drop_down',
          onClick: this.handleExpandOrCollapse,
        },
      },
      {
        name: 'more',
        group: true,
        child: (
          <DropdownBtn
            icon="mode_edit"
            funcType="flat"
            text={intl.get('hzero.common.button.batchEdit').d('批量编辑')}
          />
        ),
        children: [
          {
            name: 'batchUnEnable',
            child: intl.get('smpc.product.button.batchUnEnable').d('批量禁用'),
            observerBtnProps: () => ({
              disabled: dataSet.selected.filter((i) => i.get('enabledFlag') === 1) < 1,
              onClick: () => this.catalogListRef.handleBatchEnable(dataSet, 0),
            }),
          },
          {
            name: 'batchEnable',
            child: intl.get('smpc.product.button.batchEnable').d('批量启用'),
            observerBtnProps: () => ({
              disabled: dataSet.selected.filter((i) => i.get('enabledFlag') === 0) < 1,
              onClick: () => this.catalogListRef.handleBatchEnable(dataSet, 1),
            }),
          },
          {
            name: 'mobileIconImport',
            child: intl.get('smpc.product.view.mobileIconImport').d('移动端ICON导入'),
            btnProps: {
              onClick: () =>
                this.props.history.push('/s2-mall/product/catalog-manage/mobile-icon-import'),
            },
          },
          {
            name: 'batchUpdateCatalog',
            btnComp: MenuItemLinkBtn,
            btnProps: {
              prefixPatch: '/smpc',
              refreshButton: true,
              changeServicePrefix: true,
              btnComp: ImportButton,
              buttonText: intl.get('smpc.product.button.batchUpdateCatalog').d('(新)批量修改目录'),
              successCallBack: () => this.query(),
              buttonProps: {
                icon: '',
                funcType: 'link',
              },
              businessObjectTemplateCode: 'SMPC.CATALOG_UPDATE',
            },
          },
        ],
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('smpc.catalogManage.view.title').d('目录管理')}>
          {customizeBtnGroup(
            {
              code: 'SMPC.CATALOG_MANAGE.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={customizeButtons} defaultBtnType="c7n-pro" maxNum={5} />
          )}
        </Header>
        <Content className={styles['catalog-manage-container']}>
          <CatalogList
            path={path}
            ds={dataSet}
            onRef={(ref) => {
              this.catalogListRef = ref;
            }}
            // categoryTreeRef={this.categoryTreeRef}
            onOpenCatalogModal={this.handleOpenCatalogModal}
            customizeTable={customizeTable}
          />
        </Content>
      </React.Fragment>
    );
  }
}
