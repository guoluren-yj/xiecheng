/**
 * 物料/品类映射商品
 * @date: 2020-12-15
 * @author hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { DataSet, Table, Button, Modal, Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { createMethodRenderer } from '@/routes/product/utilsApi/renderer';

import MapForm from './MapForm';
import BatchMapForm from '../BatchMapForm';

import { tableDs, formDs, batchFormDs } from './ds';
import { setMap } from './api';

import '../index.less';

const SRM_SMPC = '/smpc';

const organizationId = getCurrentOrganizationId();

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: true,
  destroyOnClose: true,
  drawer: true,
};

export default class BrandManage extends Component {
  createModal;

  ds = new DataSet(tableDs());

  /**
   * 导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: '/smpc/data-import/SMAL_GROUP_SKU_ITEM_REF',
      title: 'srm.common.view.itemCategoryMapProductImport',
      // title: intl.get('srm.common.view.itemCategoryMapProductImport').d('物料/品类映射商品导入'),
      search: qs.stringify({
        action: 'srm.common.view.itemCategoryMapProductImport',
        backPath: '/s2-mall/product/materiel-mapping',
      }),
    });
  }

  @Bind()
  batchMapModal() {
    this.batchFormDs = new DataSet(batchFormDs());
    this.batchFormDs.create({});
    this.createModal = Modal.open({
      ...modalProps,
      key: 'batchMapModal',
      style: { width: 380 },
      title: intl.get('small.common.button.batchMapping').d('批量映射'),
      onOk: () => this.saveBatch(),
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <BatchMapForm dataSet={this.batchFormDs} />,
    });
  }

  @Bind()
  async saveBatch() {
    const flag = await this.batchFormDs.validate();
    const list = this.ds.selected;
    if (flag && list.length > 0) {
      const params = this.batchFormDs.toJSONData()[0];
      return this.save(list.map((i) => ({ ...i, ...params })));
    }
    return false;
  }

  @Bind()
  mapModal(line) {
    this.formDs = new DataSet(formDs());
    this.formDs.create(line || { agreementFlag: 0 });
    this.createModal = Modal.open({
      ...modalProps,
      key: 'mapModal',
      style: { width: 380 },
      title: line
        ? intl.get('smpc.product.button.edit').d('编辑')
        : intl.get('smpc.product.button.create').d('新建'),
      onOk: () => this.saveSingle(),
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <MapForm dataSet={this.formDs} />,
    });
  }

  @Bind()
  async saveSingle() {
    const flag = await this.formDs.validate();
    if (flag) {
      const params = this.formDs.toJSONData()[0];
      // 库存组织为空时值需为-1
      // 集团级物料时公司id需为-1
      const { invOrganizationId: id, companyId } = params;
      return this.save([{ ...params, companyId: companyId || -1, invOrganizationId: id || -1 }]);
    }
    return false;
  }

  @Bind()
  async save(list = []) {
    const result = getResponse(await setMap(list));
    if (result) {
      notification.success();
      this.createModal.close();
      this.ds.query(this.ds.currentPage);
    } else return false;
  }

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
    this.ds.delete(selectData.filter((f) => f.status !== 'add'));
  }

  @Bind()
  getColumns() {
    return [
      {
        name: 'supplierName',
        width: 140,
      },
      {
        name: 'productNum',
        width: 120,
      },
      {
        name: 'productName',
        width: 120,
      },
      {
        name: 'thirdSkuId',
        width: 120,
      },
      {
        name: 'platFlag',
        width: 120,
        align: 'left',
        // renderer: yesOrNoRenderer,
        editor: true,
      },
      {
        name: 'companyLov',
        width: 160,
        // editor: true,
        editor: (record, name) => (
          <Lov
            clearButton={false}
            onChange={(item) => {
              if (item) {
                record.set(name, {
                  companyId: item.companyId,
                  companyNum: item.companyNum,
                  companyName: item.companyName,
                });
              }
            }}
          />
        ),
      },
      {
        name: 'organizationLov',
        width: 160,
        // editor: true,
        editor: (record, name) => (
          <Lov
            onChange={(lovRecord) => {
              const item = lovRecord || {};
              if (item) {
                record.set(name, {
                  organizationId: item.organizationId || null,
                  organizationName: item.organizationName || null,
                });
              }
            }}
          />
        ),
      },
      {
        name: 'itemCategoryLov',
        width: 140,
        // editor: true,
        editor: (record, name) => (
          <Lov
            clearButton={false}
            onChange={(item) => {
              if (item) {
                record.set(name, {
                  categoryId: item.categoryId,
                  companyCode: item.categoryCode,
                  categoryName: item.categoryName,
                });
              }
            }}
          />
        ),
      },
      {
        name: 'categoryName',
        width: 140,
      },
      {
        name: 'itemLov',
        width: 160,
        // editor: true,
        editor: (record, name) => (
          <Lov
            clearButton={false}
            onChange={(item) => {
              if (item) {
                record.set(name, {
                  itemId: item.itemId,
                  itemCode: item.itemCode,
                  itemName: item.itemName,
                });
              }
            }}
          />
        ),
      },
      {
        name: 'itemName',
        width: 140,
      },
      {
        name: 'agreementFlag',
        align: 'left',
        width: 100,
        renderer: createMethodRenderer,
      },
      // {
      //   name: 'operation',
      //   width: 70,
      //   align: 'center',
      //   renderer: ({ record }) => {
      //     const line = record.toData();
      //     return (
      //       <a onClick={() => this.mapModal(line)} disabled={line.agreementFlag === 1}>
      //         {intl.get('smpc.product.button.edit').d('编辑')}
      //       </a>
      //     );
      //   },
      // },
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
    const BatchMapButton = observer(({ dataSet }) => {
      const list = dataSet.selected.filter((p) => p.agreementFlag === 0);
      return (
        <Button
          funcType="flat"
          color="primary"
          icon="swap_horiz"
          onClick={this.batchMapModal}
          disabled={list.length === 0}
        >
          {intl.get('small.common.button.batchMapping').d('批量映射')}
        </Button>
      );
    });
    const ExcelExportButton = observer(({ dataSet }) => {
      const params =
        (dataSet.queryDataSet.current && dataSet.queryDataSet.current.toJSONData()) || {};
      return (
        <ExcelExport
          requestUrl={`${SRM_SMPC}/v1/${organizationId}/group-product-item-refs-export`}
          queryParams={{
            ...filterNullValueObject(params),
          }}
        />
      );
    });
    const buttons = [
      <Button icon="playlist_add" onClick={() => this.mapModal()}>
        {intl.get('smpc.product.button.createMap').d('新建映射')}
      </Button>,
      <DelButton dataSet={this.ds} />,
      <Button icon="save" onClick={this.handleSave}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      <BatchMapButton dataSet={this.ds} />,
      <Button icon="archive" onClick={this.handleImport}>
        {intl.get('hzero.common.import').d('导入')}
      </Button>,
      <ExcelExportButton dataSet={this.ds} />,
    ];
    return (
      <Table
        dataSet={this.ds}
        buttons={buttons}
        columns={columns}
        queryFieldsLimit={3}
        columnResizable
        queryBar="normal"
      />
    );
  }
}
