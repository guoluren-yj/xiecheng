/**
 * 物料/品类映射商城目录
 * @date: 2020-12-15
 * @author hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { isNull } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Popconfirm } from 'choerodon-ui';
import { Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

export default class MaterielMapping extends Component {
  constructor(props) {
    super(props);
    this.ds = props.ds;
  }

  @Bind()
  optionsRender({ record }) {
    const line = record.toJSONData();
    return record.status !== 'add' ? (
      <span className="action-link">
        <Popconfirm
          placement="topRight"
          title={
            record.get('enabledFlag') === 1
              ? intl.get('smpc.product.view.confirm.disable').d('确认禁用')
              : intl.get('smpc.product.view.confirm.enable').d('确认启用')
          }
          onConfirm={() => this.handleEnable(line)}
        >
          <a disabled={isNull(line.enabledFlag)}>
            {line.enabledFlag === 1
              ? intl.get('hzero.common.button.disable').d('禁用')
              : intl.get('hzero.common.button.enable').d('启用')}
          </a>
        </Popconfirm>
      </span>
    ) : (
      '-'
    );
  }

  /**
   * 获取表格列
   */
  @Bind()
  getColumns() {
    const { mappingType: type, ds } = this.props;
    return [
      {
        name: 'productLov',
        width: 120,
        editor: (record, name) =>
          (ds.getState('customEditable') || record.status === 'add') && (
            <Lov
              clearButton={false}
              onChange={(item) => {
                if (item) {
                  record.set(name, {
                    ...item,
                    productId: item.productId,
                    skuCode: item.skuCode,
                    skuName: item.skuName,
                    thirdSkuCode: item.thirdSkuCode,
                  });
                  record.set('skuUomName', item.skuUomName);
                }
              }}
            />
          ),
      },
      {
        name: 'skuName',
        width: 200,
      },
      {
        name: 'skuUomName',
        title: intl.get('smpc.product.model.skuUomName').d('商品单位'),
        width: 100,
        show: type === 'ITEM',
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'thirdSkuCode',
        width: 140,
      },
      {
        name: 'mapLov',
        width: 240,
        editor: (record, name) => {
          return (
            (ds.getState('customEditable') || record.status === 'add') && (
              <Lov
                clearButton={false}
                searchable={false}
                tableProps={{
                  selectionMode: type === 'ITEM_CATEGORY' ? 'rowbox' : 'none',
                }}
                onChange={(item) => {
                  if (item) {
                    record.set(name, {
                      ...item,
                      mappingData: item.itemId || item.categoryId || item.catalogId,
                      mappingDataCode: item.itemCode || item.categoryCode || item.catalogCode,
                      mappingDataName: item.itemName || item.categoryName || item.catalogName,
                      mappingDataDesc:
                        type === 'ITEM'
                          ? `${item.itemCode} - ${item.itemName}`
                          : type === 'ITEM_CATEGORY'
                          ? `${item.categoryCode} - ${item.categoryName}`
                          : `${item.catalogCode} - ${item.catalogName}`,
                    });
                    record.set('itemUomName', item.uomCodeAndName);
                  }
                }}
              />
            )
          );
        },
      },
      {
        name: 'itemUomName',
        title: intl.get('smpc.product.model.itemUomName').d('物料单位'),
        width: 130,
        show: type === 'ITEM',
      },
      {
        name: 'externalSystemCode',
        width: 120,
        show: type === 'ITEM',
      },
      {
        width: 100,
        name: 'level',
        hidden: type !== 'CATALOG',
      },
      {
        name: 'catalogNamePath',
        minWidth: 200,
        hidden: type !== 'CATALOG',
      },
      {
        name: 'sourceFromMeaning',
        width: 120,
      },
      {
        name: 'updateUser',
        width: 100,
      },
      {
        name: 'updateTime',
        width: 160,
      },
    ].filter((f) => f.show !== false);
  }

  render() {
    const { mappingType, searchCode, tableCode, customizeTable } = this.props;
    const columns = this.getColumns();
    return (
      <div style={{ height: 'calc(100vh - 245px)' }}>
        {customizeTable(
          {
            code: tableCode,
            readOnly: !this.ds.getState('customEditable'),
          },
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            dataSet={this.ds}
            columns={columns}
            searchCode={searchCode}
            cacheState
            searchBarConfig={{
              fieldProps: {
                mappingData: {
                  lovPara: mappingType === 'ITEM_CATEGORY' ? { enabledFlag: 1 } : {},
                },
              },
              editorProps: {
                skuType: {
                  clearButton: false,
                },
              },
            }}
            columnResizable
            onRow={({ record }) => {
              return {
                style: record.get('repeatError') ? { backgroundColor: '#FEF4F2' } : {},
              };
            }}
          />
        )}
      </div>
    );
  }
}
