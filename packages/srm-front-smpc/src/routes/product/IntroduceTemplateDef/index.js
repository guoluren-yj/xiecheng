/**
 * 商品介绍模板定义
 * @date: 2020-12-07
 * @author hl <li.huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import { tableDs } from './ds';
import { saveTemplate } from './api';
import { enabledRenderer } from '../utilsApi/renderer';

@formatterCollections({
  code: ['smpc.prdIntroTemplateDef', 'smpc.product'],
})
export default class IntroduceTemplateDef extends Component {
  ds = new DataSet(tableDs());

  /**
   * 新建
   */
  @Bind()
  handleCreateOrder() {
    const { history } = this.props;
    history.push('/s2-mall/product/introduce-template-def/detail/create');
  }

  /**
   * 编辑
   */
  @Bind()
  handleEditData(templateId) {
    const { history } = this.props;
    history.push(`/s2-mall/product/introduce-template-def/detail/${templateId}`);
  }

  /**
   * 启用禁用
   */
  @Bind()
  async handleEnabled(record) {
    const result = getResponse(
      await saveTemplate({ ...record, enabledFlag: record.enabledFlag === 1 ? 0 : 1 })
    );
    if (result) {
      notification.success();
      this.ds.query(this.ds.currentPage);
    }
  }

  @Bind()
  getColumns() {
    return [
      {
        name: 'enabledFlag',
        width: 100,
        align: 'left',
        renderer: enabledRenderer,
      },
      {
        name: 'operation',
        width: 130,
        renderer: ({ record }) => {
          const line = record.toData();
          return (
            <span className="action-link">
              <a
                onClick={() => {
                  this.handleEditData(record.get('templateId'));
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a
                onClick={() => {
                  this.handleEnabled(line);
                }}
              >
                {record.get('enabledFlag')
                  ? intl.get('hzero.common.status.disable').d('禁用')
                  : intl.get('hzero.common.status.enable').d('启用')}
              </a>
            </span>
          );
        },
      },
      {
        name: 'templateCode',
        width: 200,
      },
      {
        name: 'templateName',
      },
    ];
  }

  render() {
    const columns = this.getColumns();

    return (
      <React.Fragment>
        <Header title={intl.get('smpc.prdIntroTemplateDef.view.title').d('商品介绍模板定义')}>
          <Button icon="add" color="primary" onClick={() => this.handleCreateOrder()}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={this.ds} columns={columns} />
        </Content>
      </React.Fragment>
    );
  }
}
