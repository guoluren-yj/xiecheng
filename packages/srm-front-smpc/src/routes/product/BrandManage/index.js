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
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import ImportButton from 'components/Import';
import { getResponse } from 'utils/utils';
import CroperModal from '@/routes/components/CroperModal';
import { enabledRenderer } from '@/routes/product/utilsApi/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import ExportPro from '@/components/ExportPro';
import { SRM_SMPC } from '_utils/config';

import BrandForm from './BrandForm';

import { tableDs, formDs } from './ds';
import { setEnable, setDisabled, saveBrand } from './api';

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
@withCustomize({ unitCode: ['MALL.BRAND_MANAGE.BTNS', 'MALL.BRAND_MANAGE.TABLE'] })
export default class BrandManage extends Component {
  imgModal;

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
  uploadSuccess(file = { url: '' }) {
    const { url } = file;
    if (url) {
      this.formDs.records[0].set('logoUrl', url);
    }
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
      onOk: () => this.save(!!line),
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <BrandForm dataSet={this.formDs} imgModal={this.imgModal} />,
    });
  }

  @Bind()
  async save(edit = false) {
    const flag = await this.formDs.validate();
    if (flag) {
      const params = this.formDs.toData()[0];
      const result = getResponse(await saveBrand({ ...params, edit }));
      if (result) {
        notification.success();
        this.createModal.close();
        this.ds.query(this.ds.currentPage);
      } else return false;
    }
    return false;
  }

  @Bind()
  async handleEnable(line, enabledFlag) {
    const params = { ...line, enabledFlag };
    const result = getResponse(await (enabledFlag === 1 ? setEnable(params) : setDisabled(params)));
    if (result) {
      notification.success();
      this.ds.query(this.ds.currentPage);
    }
  }

  @Bind()
  renderText({ value }) {
    return <p className="info-item">{value}</p>;
  }

  @Bind()
  getColumns() {
    return [
      {
        name: 'brandCode',
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
        width: 120,
        renderer: ({ record }) => {
          const line = record.toData();
          const { enabledFlag } = line;
          return (
            <span className="action-link">
              <a onClick={() => this.brandModal(line)}>
                {intl.get('smpc.product.button.edit').d('编辑')}
              </a>
              <a onClick={() => this.handleEnable(line, enabledFlag === 1 ? 0 : 1)}>
                {enabledFlag === 1
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
    const { customizeTable } = this.props;
    const columns = this.getColumns();
    const buttons = [
      <Button name="createBrand" icon="playlist_add" onClick={() => this.brandModal()}>
        {intl.get('smpc.product.button.createBrand').d('新建品牌')}
      </Button>,
      <Button name="import" icon="archive" onClick={this.handleImport}>
        {intl.get('hzero.common.import').d('导入')}
      </Button>,
      <ImportButton
        name="newImport"
        businessObjectTemplateCode="SMPC.BRAND_IMPORT"
        refreshButton
        buttonText={intl.get('smpc.product.button.importNew').d('(新)导入')}
        prefixPatch="/smpc"
        successCallBack={() => this.ds.query()}
        buttonProps={{
          icon: 'archive',
          color: 'primary',
          funcType: 'flat',
          // permissionList: [
          //   { code: `${path}.button.import-new`, type: 'button', meaning: '品牌管理-(新)导入' },
          // ],
        }}
      />,
      <ExportPro
        name="newExport"
        color="primary"
        templateCode="SMPC_BRAND_EXPORT"
        dataSet={this.ds}
        requestUrl={`${SRM_SMPC}/v1/brand/export`}
      />,
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('smpc.brandManage.view.title').d('品牌管理')} />
        <Content className="brand-manage-container">
          {customizeTable(
            {
              code: 'MALL.BRAND_MANAGE.TABLE',
              buttonCode: 'MALL.BRAND_MANAGE.BTNS',
            },
            <Table
              dataSet={this.ds}
              buttons={buttons}
              columns={columns}
              queryFieldsLimit={3}
              rowHeight="auto"
              queryBar="normal"
            />
          )}
        </Content>
        <CroperModal
          fn={(ele) => {
            this.imgModal = ele;
          }}
          title={intl.get('smpc.product.model.brandLogo').d('品牌LOGO')}
          width={160}
          height={90}
          canvasStyle={{ width: 160, height: 90 }}
          callback={this.uploadSuccess}
          maxSize={{
            storageSize: 5,
            storageUnit: 'MB',
          }}
        />
      </React.Fragment>
    );
  }
}
