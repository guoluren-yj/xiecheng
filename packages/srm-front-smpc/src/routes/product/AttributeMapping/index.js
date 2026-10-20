/**
 * 属性映射
 * @date: 2020-12-08
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Tabs } from 'hzero-ui';
import { DataSet, Table, Lov, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import queryString from 'querystring';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { openTab } from 'utils/menuTab';
import ImportButton from 'components/Import';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { mappingStatusRenderer } from '@/routes/product/utilsApi/renderer';
import { tableDs } from './ds';
import { saveMap } from './api';

import styles from './index.less';

const tenantId = getCurrentOrganizationId();

@formatterCollections({
  code: ['smpc.attrMapping', 'smpc.product'],
})
@withCustomize({ unitCode: ['SMPC.ATTRIBUTE_MAPPING.BTNS'] })
export default class MallDataMapping extends Component {
  uomDs = new DataSet(tableDs('UOM'));

  taxDs = new DataSet(tableDs('TAX'));

  currencyDs = new DataSet(tableDs('CURRENCY'));

  state = { activeKey: 'UOM' };

  @Bind()
  async save(ds) {
    if (ds) {
      const list = ds.updated.map((i) => ({ ...i.toJSONData(), tenantId }));
      const { activeKey: mappingType } = this.state;
      if (list.length > 0) {
        const result = getResponse(await saveMap({ mappingType, list }));
        if (result) {
          notification.success();
          ds.query(ds.currentPage);
        }
      }
    }
  }

  @Bind()
  getColumns(type = 'UOM') {
    const uom = [
      {
        name: 'uomLov',
        align: 'center',
        width: 180,
        editor: (record, name) => (
          <Lov
            onChange={(lovRecord) => {
              const item = lovRecord || {};
              record.set(name, {
                uomId: item.uomId || null,
                uomCode: item.uomCode || null,
                uomName: item.uomName || null,
              });
            }}
          />
        ),
      },
    ];
    const tax = [
      {
        name: 'taxLov',
        align: 'center',
        width: 180,
        editor: (record, name) => (
          <Lov
            onChange={(lovRecord) => {
              const item = lovRecord || {};
              record.set(name, {
                taxId: item.taxId || null,
                taxRate: item.taxRate || null,
                taxCode: item.taxCode || null,
                description: item.description || null,
              });
            }}
          />
        ),
      },
      {
        name: 'taxRate',
        align: 'center',
        width: 150,
      },
    ];
    const currency = [
      {
        name: 'currencyLov',
        width: 180,
        align: 'center',
        editor: (record, name) => (
          <Lov
            onChange={(lovRecord) => {
              const item = lovRecord || {};
              record.set(name, {
                currencyId: item.currencyId || null,
                currencyCode: item.currencyCode || null,
                currencyName: item.currencyName || null,
              });
            }}
          />
        ),
      },
    ];
    return [
      {
        name: 'num',
        align: 'center',
        width: 100,
        renderer: ({ record, dataSet }) => {
          return (dataSet.currentPage - 1) * dataSet.pageSize + record.index + 1;
        },
      },
      {
        name: 'mappingFlag',
        width: 120,
        align: 'center',
        renderer: mappingStatusRenderer,
      },
      {
        name: 'attrValueCode',
        align: 'center',
        width: 180,
      },
      {
        name: 'attrValueName',
        align: 'center',
        width: 180,
      },
      ...(type === 'TAX' ? tax : type === 'CURRENCY' ? currency : uom),
      { name: 'mappingDataName', align: 'center', width: 150 },
      {
        name: 'userName',
        width: 100,
        align: 'center',
      },
    ];
  }

  @Bind()
  handleImport({ importKeyCode, importTabName }) {
    openTab({
      key: `/smpc/data-import/${importKeyCode}`,
      // 加多语言
      title: importTabName,
      search: queryString.stringify({
        action: importTabName,
      }),
    });
  }

  render() {
    const { activeKey } = this.state;
    const {
      match: { path = '' },
      customizeBtnGroup,
    } = this.props;
    const tabPaneList = [
      {
        label: intl.get('smpc.attrMapping.view.uomMapping').d('单位映射'),
        key: 'UOM',
        dataSet: this.uomDs,
        excelFileName: intl.get('smpc.attrMapping.view.uomMapping').d('单位映射'),
        requestUrl: `/smpc/v1/${tenantId}/attribute-mappings/uom/export`,
        exportCode: 'SMPC_UOM_MAPPING_EXPORT',
        importKeyCode: 'SMPC.UOM_MAPPING_IMPORT',
        importTabName: intl.get('smpc.attrMapping.view.import.uomMapping').d('单位映射导入'),
        permissionList: [
          {
            code: `${path}.button.uom-import-new`,
            type: 'button',
            meaning: '单位映射-(新)导入',
            _type: 'import-new',
          },
          {
            code: `${path}.button.uom-export-new`,
            type: 'button',
            meaning: '单位映射-(新)导出',
            _type: 'export-new',
          },
        ],
      },
      {
        label: intl.get('smpc.attrMapping.view.taxRateMapping').d('税率映射'),
        key: 'TAX',
        dataSet: this.taxDs,
        excelFileName: intl.get('smpc.attrMapping.view.taxRateMapping').d('税率映射'),
        requestUrl: `/smpc/v1/${tenantId}/attribute-mappings/tax/export`,
        exportCode: 'SMPC_TAX_MAPPING_EXPORT',
        importKeyCode: 'SMPC.TAX_MAPPING_IMPORT',
        importTabName: intl.get('smpc.attrMapping.view.import.taxRateMapping').d('税率映射导入'),
        permissionList: [
          {
            code: `${path}.button.tax-import-new`,
            type: 'button',
            meaning: '税率映射-(新)导入',
            _type: 'import-new',
          },
          {
            code: `${path}.button.tax-export-new`,
            type: 'button',
            meaning: '税率映射-(新)导出',
            _type: 'export-new',
          },
        ],
      },
      {
        label: intl.get('smpc.attrMapping.view.currencyMapping').d('币种映射'),
        key: 'CURRENCY',
        dataSet: this.currencyDs,
        excelFileName: intl.get('smpc.attrMapping.view.currencyMapping').d('币种映射'),
        requestUrl: `/smpc/v1/${tenantId}/attribute-mappings/currency/export`,
        exportCode: 'SMPC_CURRENCY_MAPPING_EXPORT',
        importKeyCode: 'SMPC.CURRENCY_MAPPING_IMPORT',
        importTabName: intl.get('smpc.attrMapping.view.import.currencyMapping').d('币种映射导入'),
        permissionList: [
          {
            code: `${path}.button.currency-import-new`,
            type: 'button',
            meaning: '币种映射-(新)导入',
            _type: 'import-new',
          },
          {
            code: `${path}.button.currency-export-new`,
            type: 'button',
            meaning: '币种映射-(新)导出',
            _type: 'export-new',
          },
        ],
      },
    ];
    const columns = this.getColumns(activeKey);
    const currentTab = tabPaneList.find((i) => i.key === activeKey) || {};
    // key 必与个性化按钮组一致
    const importName = `${String(activeKey).toLowerCase()}-old-import`;
    const exportName = `${String(activeKey).toLowerCase()}-old-export`;
    const customizeButtons = [
      {
        name: importName,
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.import').d('导入'),
        btnProps: {
          icon: 'archive',
          funcType: 'flat',
          onClick: () => this.handleImport(currentTab),
          style: { border: 'none' },
        },
      },
      {
        name: exportName,
        btnType: 'c7n-pro',
        btnComp: ExcelExport,
        btnProps: {
          buttonText: intl.get('hzero.common.button.export').d('导出'),
          fileName: currentTab.excelFileName,
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
          },
          requestUrl: currentTab.requestUrl,
          queryParams: () => {
            const params =
              (currentTab.dataSet.queryDataSet &&
                currentTab.dataSet.queryDataSet.current.toJSONData()) ||
              {};
            delete params.__dirty;
            delete params.__id;
            delete params._status;
            return { ...filterNullValueObject(params) };
          },
        },
      },
    ];

    return (
      <React.Fragment>
        <Header title={intl.get('smpc.attrMapping.view.title').d('属性映射')}>
          <Button
            wait={1000}
            icon="save"
            color="primary"
            onClick={() => this.save(currentTab.dataSet)}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <ImportButton
            businessObjectTemplateCode={currentTab.importKeyCode}
            action={currentTab.importTabName}
            refreshButton
            buttonText={intl.get('smpc.product.button.importNew').d('(新)导入')}
            prefixPatch="/smpc"
            successCallBack={() => currentTab.dataSet.query()}
            buttonProps={{
              icon: 'archive',
              funcType: 'flat',
              permissionList: currentTab.permissionList.filter((f) => f._type === 'import-new'),
            }}
          />
          <ExcelExportPro
            templateCode={currentTab.exportCode}
            buttonText={intl.get('smpc.product.button.exportNew').d('(新)导出')}
            fileName={currentTab.excelFileName}
            otherButtonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
              permissionList: currentTab.permissionList.filter((f) => f._type === 'export-new'),
            }}
            requestUrl={currentTab.requestUrl}
            queryParams={() => {
              const params =
                (currentTab.dataSet.queryDataSet &&
                  currentTab.dataSet.queryDataSet.current.toJSONData()) ||
                {};
              delete params.__dirty;
              delete params.__id;
              delete params._status;
              return { ...filterNullValueObject(params) };
            }}
          />
          {customizeBtnGroup(
            {
              code: 'SMPC.ATTRIBUTE_MAPPING.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={customizeButtons} />
          )}
        </Header>
        <Content>
          <Tabs
            animated={false}
            activeKey={activeKey}
            onChange={(key) => this.setState({ activeKey: key })}
          >
            {tabPaneList.map((item) => (
              <Tabs.TabPane tab={item.label} key={item.key}>
                <Table
                  className={styles['attribute-mapping-table']}
                  columns={columns}
                  queryFieldsLimit={3}
                  dataSet={item.dataSet}
                />
              </Tabs.TabPane>
            ))}
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
