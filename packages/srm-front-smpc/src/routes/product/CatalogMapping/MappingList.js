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
import { observer } from 'mobx-react';
import { Lov, Modal, Button, Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import FilterBarTable from '_components/FilterBarTable';
import { getResponse } from 'utils/utils';

import { enabledRenderer } from '@/routes/product/utilsApi/renderer';

import { setEnable, checkProduct, fetchMappingShelf } from './api';

import styles from './styles.less';

@observer
export default class MaterielMapping extends Component {
  constructor(props) {
    super(props);
    this.ds = props.ds;
  }

  /**
   * 启用和禁用
   */
  @Bind()
  async handleEnable(line) {
    const { enabledFlag } = line;
    let title = enabledFlag
      ? intl.get('smpc.product.view.confirm.disable').d('确认禁用')
      : intl.get('smpc.product.view.confirm.enable').d('确认启用');
    // 禁用时校验
    if (enabledFlag) {
      const res = await getResponse(checkProduct([line], this.props.mappingType));
      if (res && res.checkResult) {
        title = intl
          .get('smpc.product.view.delModal.message1')
          .d('该操作将会导致商品目录变更或下架');
      }
    }
    Modal.confirm({
      title: intl.get('smpc.product.view.delModal.title').d('提示'),
      children: intl
        .get('smpc.product.view.delModal.message', {
          value: title,
        })
        .d(title),
      onOk: async () => {
        const result = getResponse(
          await setEnable({ ...line, enabledFlag: line.enabledFlag ? 0 : 1 })
        );
        if (result) {
          notification.success();
          this.ds.query(this.ds.currentPage);
        }
      },
    });
  }

  @Bind()
  async handleShelf(line) {
    const res = await getResponse(await fetchMappingShelf(line));
    if (res) {
      notification.success();
      this.ds.query(this.ds.currentPage);
    }
  }

  @Bind()
  optionsRender({ record }) {
    const { mappingType } = this.props;
    const line = record.toJSONData();
    const notMapping = !record.get('mappingId'); // 未映射目录
    const { shelfOperationFlag, enabledFlag } = record.get(['shelfOperationFlag', 'enabledFlag']);
    if (record.status === 'add') return '';
    else if (mappingType !== 'CATEGORY') {
      return (
        <Button
          funcType="link"
          disabled={isNull(enabledFlag)}
          onClick={() => this.handleEnable(line)}
        >
          {enabledFlag === 1
            ? intl.get('hzero.common.button.disable').d('禁用')
            : intl.get('hzero.common.button.enable').d('启用')}
        </Button>
      );
    } else {
      // 无电商商品
      if (!record.get('ecSkuCount')) {
        return (
          <div className="action-link-btns">
            <Tooltip
              title={
                notMapping
                  ? intl.get('smpc.catalogMapping.view.operateMapHelp').d('请完成映射后进行此操作')
                  : ''
              }
            >
              <Button funcType="link" disabled={notMapping} onClick={() => this.handleEnable(line)}>
                {enabledFlag === 1
                  ? intl.get('hzero.common.button.disable').d('禁用')
                  : intl.get('hzero.common.button.enable').d('启用')}
              </Button>
              {/* <Button funcType="link" disabled>
                {intl.get('smpc.catalogMapping.view.btn.shelved').d('上架完成')}
              </Button> */}
            </Tooltip>
          </div>
        );
      }
      // 未映射目录、映射执行中， 禁止操作
      return (
        <div className="action-link-btns">
          <Tooltip
            title={
              notMapping
                ? intl.get('smpc.catalogMapping.view.operateMapHelp').d('请完成映射后进行此操作')
                : shelfOperationFlag === 0
                ? intl.get('smpc.catalogMapping.view.selfingHelp').d('批量上架中')
                : shelfOperationFlag === 2
                ? intl.get('smpc.catalogMapping.view.mappingHelp').d('映射正在处理中')
                : ''
            }
          >
            <Button
              funcType="link"
              disabled={notMapping || [0, 2].includes(shelfOperationFlag)}
              onClick={() => this.handleEnable(line)}
            >
              {enabledFlag === 1
                ? intl.get('hzero.common.button.disable').d('禁用')
                : intl.get('hzero.common.button.enable').d('启用')}
            </Button>
            {/* 禁用的映射无法上架 */}
            {![0, 1].includes(shelfOperationFlag) && (
              <Tooltip
                title={
                  !notMapping && !record.get('enabledFlag') && shelfOperationFlag === -1
                    ? intl
                        .get('smpc.catalogMapping.view.operateEnabledHelp')
                        .d('请启用后进行此操作')
                    : ''
                }
              >
                <Button
                  funcType="link"
                  disabled={notMapping || shelfOperationFlag === 2 || !record.get('enabledFlag')}
                  onClick={() => this.handleShelf(line)}
                >
                  {intl.get('smpc.catalogMapping.view.btn.batchShelf').d('批量上架')}
                </Button>
              </Tooltip>
            )}
            {shelfOperationFlag === 0 && (
              <Button funcType="link" disabled>
                {intl.get('smpc.catalogMapping.view.btn.shelfing').d('上架中')}
              </Button>
            )}
            {/* {shelfOperationFlag === 1 && (
              <Button funcType="link" disabled>
                {intl.get('smpc.catalogMapping.view.btn.shelved').d('上架完成')}
              </Button>
            )} */}
          </Tooltip>
        </div>
      );
    }
  }

  /**
   * 获取表格列
   */
  @Bind()
  getColumns() {
    const { mappingType: type, ds } = this.props;
    const readOnly = !ds.getState('customEditable');
    return [
      {
        width: 90,
        name: 'enabledFlag',
        align: 'left',
        renderer: enabledRenderer,
      },
      {
        width: 120,
        name: 'operation',
        lock: 'right',
        renderer: this.optionsRender,
        show: readOnly,
      },
      {
        name: 'mapLov',
        width: 240,
        editor: (record, name) => {
          if (readOnly) return false;
          return (
            <Lov
              clearButton={false}
              searchable={false}
              tableProps={{
                selectionMode: type === 'ITEM_CATEGORY' ? 'rowbox' : 'none',
              }}
              onChange={(item) => {
                if (item) {
                  record.set(name, {
                    mappingData: item.itemId || item.categoryId,
                    mappingDataCode: item.itemCode || item.categoryCode,
                    mappingDataName: item.itemName || item.categoryName,
                    mappingDataDesc:
                      type === 'ITEM'
                        ? `${item.itemCode} - ${item.itemName}`
                        : // : type === 'ITEM_CATEGORY'
                          `${item.categoryCode} - ${item.categoryName}`,
                    // : `${item.code} - ${item.name}`,
                  });
                }
              }}
            />
          );
        },
      },
      {
        name: 'externalSystemCode',
        width: 120,
        show: type === 'ITEM',
      },
      { name: 'ecSkuCount', show: type === 'CATEGORY' },
      {
        name: 'catalogLov',
        width: 240,
        editor: (record, name) => {
          if (readOnly) return false;
          return (
            <Lov
              clearButton={false}
              searchable={false}
              onChange={(item) => {
                if (item) {
                  record.set(name, {
                    catalogId: item.catalogId,
                    catalogLevel: item.catalogLevel,
                    catalogCode: item.catalogCode,
                    catalogName: item.catalogName,
                    catalogNamePath: item.catalogPath,
                    catalogDesc: `${item.catalogCode}-${item.catalogName}`,
                  });
                }
              }}
            />
          );
        },
      },
      {
        width: 140,
        name: 'level',
      },
      {
        name: 'catalogNamePath',
        minWidth: 200,
      },
    ].filter((f) => f.show !== false);
  }

  render() {
    const columns = this.getColumns();
    const { tableCode, customizeTable } = this.props;
    return customizeTable(
      {
        code: tableCode,
        readOnly: !this.ds.getState('customEditable'),
      },
      <FilterBarTable
        dataSet={this.ds}
        columns={columns}
        columnResizable
        className={styles['catalog-mapping-table']}
        style={{ maxHeight: 'calc(100vh - 250px)' }}
        filterBarConfig={{
          defaultSortedField: 'lastUpdateDate',
          defaultSortedOrder: 'desc',
          editorProps: {
            // 必须选中单选在单击双击才选中， 不好用， 所以筛选器统一不做处理了
            // mappingLov: {
            //   // ds中根据业务规则 - 品类值集选择范围， 判断数据是否能选中
            //   tableProps: {
            //     selectionMode: mappingType === 'ITEM_CATEGORY' ? 'rowbox' : 'none',
            //   },
            // },
          },
        }}
        onRow={({ record }) => {
          return {
            style: record.get('repeatError') ? { backgroundColor: '#FEF4F2' } : {},
          };
        }}
      />
    );
  }
}
