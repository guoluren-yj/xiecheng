/**
 * 物料/品类映射商城目录
 * @date: 2020-12-15
 * @author hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { isNull } from 'lodash';
import queryString from 'querystring';
import { Bind } from 'lodash-decorators';
import { Popconfirm } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { DataSet, Table, Button, Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { enabledRenderer } from '@/routes/product/utilsApi/renderer';

import { setEnable } from './api';
import { tableDS } from './ds';

import '../index.less';

export default class MaterielMapping extends Component {
  constructor(props) {
    super(props);
    this.ds = new DataSet(tableDS(props.mappingType));
  }

  /**
   * 导入
   */
  @Bind()
  handleImport() {
    // const { mappingType } = this.props;
    openTab({
      key: '/smpc/data-import/SMAL.GROUP_CATALOG_ITEM_REF',
      title: 'srm.common.view.itemCategoryMapCatalogImport',
      // title: intl.get('srm.common.view.itemCategoryMapCatalogImport').d('物料/品类映射商城目录'),
      search: queryString.stringify({
        action: 'srm.common.view.itemCategoryMapCatalogImport',
        backPath: '/s2-mall/product/materiel-mapping',
        args: JSON.stringify({
          templateCode: 'SMAL.GROUP_CATALOG_ITEM_REF',
        }),
      }),
    });
  }

  @Bind()
  createLine() {
    this.ds.create({ enabledFlag: 1 }, 0);
  }

  /**
   * 启用和禁用
   */
  @Bind()
  async handleDisable(line) {
    const result = getResponse(
      await setEnable([{ ...line, enabledFlag: line.enabledFlag ? 0 : 1 }])
    );
    if (result) {
      notification.success();
      this.ds.query(this.ds.currentPage);
    }
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const flag = await this.ds.validate();
    if (flag) {
      const res = await this.ds.submit();
      if (res && !res.failed) {
        this.ds.query();
      }
    }
  }

  @Bind()
  handleDelete() {
    const selectData = this.ds.selected;
    this.ds.remove(selectData.filter((f) => f.status === 'add'));
    this.ds.delete(selectData.filter((f) => f.status !== 'add'));
  }

  @Bind()
  optionsRender({ record }) {
    const line = record.toData();
    return record.status !== 'add' ? (
      <span className="action-link">
        <Popconfirm
          placement="topRight"
          title={
            record.get('enabledFlag') === 1
              ? intl.get('smpc.product.view.confirm.disable').d('确认禁用')
              : intl.get('smpc.product.view.confirm.enable').d('确认启用')
          }
          onConfirm={() => this.handleDisable(line)}
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
    return [
      // {
      //   name: 'mappingType',
      //   width: 160,
      //   editor: record => (
      //     <Select
      //       clearButton={false}
      //       onChange={item => {
      //         if (item) {
      //           record.set('mapLov', {
      //             mappingData: null,
      //             mappingDataCode: null,
      //             mappingDataName: null,
      //           });
      //         }
      //       }}
      //     />
      //   ),
      // },
      {
        name: 'mapLov',
        width: 200,
        editor: (record, name) => (
          <Lov
            clearButton={false}
            onChange={(item) => {
              if (item) {
                record.set(name, {
                  mappingData: item.itemId || item.categoryId,
                  mappingDataCode: item.itemCode || item.categoryCode,
                  mappingDataName: item.itemName || item.categoryName,
                });
              }
            }}
          />
        ),
      },
      { name: 'mappingDataName', width: 160 },
      {
        name: 'catalogLov',
        width: 240,
        editor: (record, name) => (
          <Lov
            clearButton={false}
            onChange={(item) => {
              if (item) {
                record.set(name, {
                  catalogId: item.catalogId,
                  catalogLevel: item.catalogLevel,
                  catalogCode: item.catalogCode,
                  catalogName: item.catalogName,
                  catalogNamePath: item.catalogPath,
                });
              }
            }}
          />
        ),
      },
      {
        width: 140,
        align: 'center',
        name: 'level',
      },
      {
        name: 'catalogNamePath',
        minWidth: 200,
      },
      {
        width: 90,
        name: 'enabledFlag',
        align: 'center',
        renderer: enabledRenderer,
      },
      {
        width: 70,
        name: 'operation',
        renderer: this.optionsRender,
      },
    ];
  }

  render() {
    const columns = this.getColumns();

    const DelButton = observer(({ dataSet }) => {
      return (
        <Button
          disabled={dataSet.selected.length === 0}
          funcType="flat"
          color="primary"
          icon="delete"
          onClick={this.handleDelete}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      );
    });

    const buttons = [
      <Button icon="playlist_add" onClick={this.createLine}>
        {intl.get('smpc.product.button.createMap').d('新建映射')}
      </Button>,
      <DelButton dataSet={this.ds} />,
      <Button icon="save" onClick={this.handleSave}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      <Button icon="archive" onClick={this.handleImport}>
        {intl.get('hzero.common.import').d('导入')}
      </Button>,
    ];
    return (
      <Table
        buttons={buttons}
        dataSet={this.ds}
        columns={columns}
        queryFieldsLimit={3}
        columnResizable
        // queryBar="normal"
      />
    );
  }
}
