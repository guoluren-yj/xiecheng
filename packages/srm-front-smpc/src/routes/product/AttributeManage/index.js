/**
 * 属性管理
 * @date: 2020-12-07
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { Popconfirm } from 'choerodon-ui';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import ImportButton from 'components/Import';
import { getResponse } from 'utils/utils';
import { ynRenderer } from '@/routes/product/utilsApi/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import ExportPro from '@/components/ExportPro';
import { SRM_SMPC } from '_utils/config';

import AttrForm from './AttrForm';

import { tableDs, formDs } from './ds';
import { saveAttr, delAttr } from './api';

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
  code: ['smpc.attrManage', 'smpc.product'],
})
@withCustomize({ unitCode: ['MALL.ATTRIBUTE_MANAGE.BTNS', 'MALL.ATTRIBUTE_MANAGE.TABLE'] })
export default class AttrManage extends Component {
  createModal;

  ds = new DataSet(tableDs());

  /**
   * 导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: '/smpc/data-import/SMPC.ATTRIBUTE_IMPORT',
      title: 'srm.common.view.attributeImport',
      // title: intl.get('srm.common.view.attributeImport').d('属性导入'),
      search: qs.stringify({
        action: 'srm.common.view.attributeImport',
        backPath: '/s2-mall/product/attribute-manage',
      }),
    });
  }

  @Bind()
  attrModal(line) {
    this.formDs = new DataSet(formDs());
    if (line) {
      this.formDs.loadData([line]);
    } else {
      this.formDs.create({ enabledFlag: 1 });
    }
    this.createModal = Modal.open({
      ...modalProps,
      key: 'attrModal',
      style: { width: 380 },
      title: line
        ? intl.get('smpc.product.button.editAttr').d('编辑属性')
        : intl.get('smpc.product.button.createAttr').d('新建属性'),
      onOk: () => this.save(),
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <AttrForm dataSet={this.formDs} />,
    });
  }

  @Bind()
  async handleDelete(id) {
    const result = getResponse(await delAttr(id));
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
      const result = getResponse(await saveAttr({ ...params }));
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
        name: 'attributeCode',
        width: 120,
        // renderer: this.renderText,
      },
      {
        name: 'attributeName',
      },
      {
        name: 'enabledFlag',
        align: 'left',
        width: 90,
        renderer: ynRenderer,
      },
      {
        name: 'operation',
        width: 120,
        renderer: ({ record }) => {
          const line = record.toData();
          return (
            <span className="action-link">
              <Popconfirm
                placement="topRight"
                title={intl
                  .get('smpc.attrManage.view.confirmEdit')
                  .d('编辑后已关联数据将会同时变更，请谨慎操作')}
                onConfirm={() => this.attrModal(line)}
              >
                <a>{intl.get('hzero.common.button.edit').d('编辑')}</a>
              </Popconfirm>
              <Popconfirm
                placement="topRight"
                title={intl.get('smpc.attrManage.view.confirmDelete').d('确认删除？')}
                onConfirm={() => this.handleDelete(line.attributeId)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
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
      <Button name="createAttr" icon="playlist_add" onClick={() => this.attrModal()}>
        {intl.get('smpc.product.button.createAttr').d('新建属性')}
      </Button>,
      <Button name="import" icon="archive" onClick={this.handleImport}>
        {intl.get('hzero.common.import').d('导入')}
      </Button>,
      <ImportButton
        name="newImport"
        businessObjectTemplateCode="SMPC.ATTRIBUTE_IMPORT"
        refreshButton
        buttonText={intl.get('smpc.product.button.importNew').d('(新)导入')}
        prefixPatch="/smpc"
        successCallBack={() => this.ds.query()}
        buttonProps={{
          icon: 'archive',
          color: 'primary',
          funcType: 'flat',
        }}
      />,
      <ExportPro
        name="newExport"
        color="primary"
        templateCode="SMPC_ATTRIBUTE_EXPORT"
        dataSet={this.ds}
        requestUrl={`${SRM_SMPC}/v1/attribute/export`}
      />,
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('smpc.attrManage.view.title').d('属性管理')} />
        <Content className="attr-manage-container">
          {customizeTable(
            {
              code: 'MALL.ATTRIBUTE_MANAGE.TABLE',
              buttonCode: 'MALL.ATTRIBUTE_MANAGE.BTNS',
            },
            <Table
              dataSet={this.ds}
              buttons={buttons}
              columns={columns}
              queryFieldsLimit={3}
              queryBar="normal"
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
