/**
 * 品牌管理
 * @date: 2020-12-03
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { DataSet, Tabs, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { enabledRenderer } from '@/routes/product/utilsApi/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import BrandForm from './BrandForm';

import { tableDs, formDs } from './ds';
import { setEnable, saveBrand } from './api';

import './index.less';

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: true,
  destroyOnClose: true,
  drawer: true,
};

@formatterCollections({
  code: ['smpc.brandManage', 'smpc.product'],
})
export default class BrandManage extends Component {
  createModal;

  ds = new DataSet(tableDs());

  /**
   * 导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: '/smpc/data-import/SMPC.BRAND_IMPORT',
      title: 'srm.common.view.brandImport',
      // title: intl.get('srm.common.view.brandImport').d('品牌导入'),
      search: qs.stringify({
        action: 'srm.common.view.brandImport',
        backPath: '/s2-mall/product/brand-manage',
      }),
    });
  }

  @Bind()
  brandModal(line) {
    this.formDs = new DataSet(formDs());
    this.formDs.create(line || { enabledFlag: 1 });
    this.createModal = Modal.open({
      ...modalProps,
      key: 'brandModal',
      style: { width: 380 },
      title: line
        ? intl.get('smpc.product.button.editBrand').d('编辑品牌')
        : intl.get('smpc.product.button.createBrand').d('新建品牌'),
      onOk: () => this.save(),
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <BrandForm dataSet={this.formDs} />,
    });
  }

  @Bind()
  async handleEnable(line) {
    const result = getResponse(await setEnable(line));
    if (result) {
      notification.success();
      this.ds.query(this.ds.currentPage);
    }
  }

  @Bind()
  async save() {
    const flag = await this.formDs.validate();
    if (flag) {
      const params = this.formDs.toData()[0];
      const result = getResponse(await saveBrand({ ...params }));
      if (result) {
        notification.success();
        this.createModal.close();
        this.ds.query(this.ds.currentPage);
      }
    }
    return false;
  }

  @Bind()
  renderText({ value }) {
    return <p className="info-item">{value}</p>;
  }

  @Bind()
  getColumns() {
    return [
      {
        name: 'code',
        width: 120,
        renderer: this.renderText,
      },
      {
        name: 'brandName',
        renderer: ({ record }) => {
          const brandNameZh = record.get('brandNameZh');
          const brandNameEn = record.get('brandNameEn');
          return this.renderText({
            value:
              brandNameZh && brandNameEn
                ? `${brandNameZh}（${brandNameEn}）`
                : brandNameZh || brandNameEn || '',
          });
        },
      },
      {
        name: 'logoUrl',
        width: 120,
        align: 'center',
        renderer: ({ value }) => <img src={value} alt="" width={36} height={36} />,
      },
      {
        name: 'officialUrl',
        width: 180,
        renderer: this.renderText,
      },
      {
        name: 'serverPhone',
        width: 120,
        renderer: this.renderText,
      },
      {
        name: 'enabledFlag',
        align: 'left',
        width: 90,
        renderer: enabledRenderer,
      },
      {
        name: 'operation',
        width: 100,
        renderer: ({ record }) => {
          const line = record.toData();
          return (
            <span className="action-link">
              <a onClick={() => this.brandModal(line)}>
                {intl.get('smpc.product.button.edit').d('编辑')}
              </a>
              <a onClick={() => this.handleEnable(line)}>
                {line.enabledFlag === 1
                  ? intl.get('smpc.product.button.disable').d('禁用')
                  : intl.get('smpc.product.button.enable').d('启用')}
              </a>
            </span>
          );
        },
      },
    ];
  }

  render() {
    // const columns = this.getColumns();
    // const buttons = [
    //   <Button icon="playlist_add" onClick={() => this.brandModal()}>
    //     {intl.get('smpc.product.button.createBrand').d('新建品牌')}
    //   </Button>,
    //   <Button icon="archive" onClick={this.handleImport}>
    //     {intl.get('hzero.common.import').d('导入')}
    //   </Button>,
    // ];
    return (
      <Tabs tabPosition="left">
        {/* <Tabs.TabPane tab={intl.get('smpc.catalogManage.view.catalogNew').d('目录新增')} key="1">
          <CatalogList />
        </Tabs.TabPane>
        <Tabs.TabPane
        tab={intl.get('smpc.catalogManage.view.mallCatalogConfig').d('商城目录配置')}
        key="2"
      >
        <Jurisdiction />
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={intl.get('smpc.catalogManage.view.catalogJurisdiction').d('目录权限管理')}
        key="3"
      >
        <MallConfig />
      </Tabs.TabPane> */}
      </Tabs>
    );
  }
}
