/**
 * 价格库维度管理-平台
 * @date: 2020-05-27
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';

import { listLineDS } from './lineDS';
import { operationDS } from './operationDS';
import {
  enablePriceLib,
  releasePriceLib,
  fetchUnlockPriceLib,
} from '@/services/priceLibDimensionService';

@formatterCollections({ code: ['ssrc.priceLibDimension'] })
@withProps(
  () => {
    const tableDs = new DataSet(listLineDS());
    return {
      tableDs,
    };
  },
  { cacheState: true }
)
export default class PriceLibDimension extends Component {
  state = {
    releaseLoading: {},
  };

  operationDs = new DataSet(operationDS());

  componentDidMount() {
    this.props.tableDs.query();
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    this.props.tableDs.create({}, 0);
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const flag = await this.props.tableDs.validate();
    if (flag) {
      const res = await this.props.tableDs.submit();
      if (res && !res.failed) {
        this.props.tableDs.query();
      }
    }
  }

  /**
   * 发布
   */
  @Bind()
  async handleRelease(record) {
    const flag = await this.props.tableDs.validate();
    if (flag) {
      this.setState({ releaseLoading: { [record.toData().templateId]: true } });
      const params = [{ ...record.toData() }];
      releasePriceLib(params)
        .then((res) => {
          const result = getResponse(res);
          if (result) {
            notification.success();
            this.props.tableDs.query();
          }
        })
        .finally(() =>
          this.setState({
            releaseLoading: { [record.toData().templateId]: false },
          })
        );
    }
  }

  /**
   * 禁用
   */
  @Bind()
  async handleEnabled(record) {
    const data = record.toData();
    /**
     * @remember - 删除 `启用` 按钮,  `启用` 动作 转变为 `解锁`; 只存在 `禁用` 才会进入此函数
     */
    const params = {
      templateId: data.templateId,
      versionNum: data.versionNum,
      objectVersionNumber: data.objectVersionNumber,
      templateStatus: 'DISABLE', // PENDING => DISABLE
      parentTemplateId: data.parentTemplateId,
    };
    const result = getResponse(await enablePriceLib(params));
    if (result) {
      notification.success();
      this.props.tableDs.query();
    }
  }

  /**
   * 编辑
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handelEdit(record) {
    record.setState('editAble', true);
  }

  /**
   * 取消
   * record 行信息
   * @memberof PriceLibDimension
   */
  @Bind()
  handelCancel(record) {
    record.reset();
    record.setState('editAble', false);
  }

  /**
   * 解锁
   * @param {Obejct} record - 行信息
   */
  @Bind()
  async handleUnlock(record = {}) {
    const data = record.toData();
    const params = {
      templateId: data.templateId,
      versionNum: data.versionNum,
      objectVersionNumber: data.objectVersionNumber,
      parentTemplateId: data.parentTemplateId,
    };
    const result = getResponse(await fetchUnlockPriceLib(params));
    if (result) {
      notification.success();
      this.props.tableDs.query();
    }
  }

  /**
   * 跳转模板明细页面
   */
  @Bind()
  jumpTemplateDetail(record) {
    const { history } = this.props;
    const {
      data: { templateId, templateStatus },
    } = record;
    history.push({
      pathname: `/ssrc/price-lib-dimension/update/${templateId}`,
      search: querystring.stringify({
        templateStatus,
      }),
    });
  }

  /**
   * 操作记录
   */
  @Bind()
  showOperation(record) {
    this.operationDs.setQueryParameter('queryParams', {
      docType: 'TEMPLATE',
      docId: record.toData().templateId,
    });

    this.operationDs.query();

    const operateColumns = [
      {
        name: 'actionName',
        width: 100,
      },
      {
        name: 'actionDetail',
        width: 250,
        tooltip: 'overflow',
      },
      {
        name: 'realName',
        width: 100,
      },
      {
        name: 'creationDate',
        width: 120,
      },
    ];
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      style: {
        width: 680,
      },
      children: <Table dataSet={this.operationDs} columns={operateColumns} />,
      onOk: () => {},
      onCancel: () => {},
    });
  }

  /**
   * 渲染编辑列
   */
  @Bind()
  editOperations({ record }) {
    const { releaseLoading = {} } = this.state;
    let operate = '';
    if (record.status === 'add') {
      operate = (
        <span className="action-link">
          <a onClick={() => this.props.tableDs.remove(record)}>
            {intl.get('hzero.common.view.button.cancel').d('取消')}
          </a>
          <a
            disabled={releaseLoading[record.toData().templateId]}
            onClick={() => this.handleRelease(record)}
          >
            {intl.get('hzero.common.button.publish').d('发布')}
          </a>
        </span>
      );
    } else if (record.getState('editAble')) {
      operate = (
        <span className="action-link">
          <a onClick={() => this.handelCancel(record)}>
            {intl.get('hzero.common.view.button.cancel').d('取消')}
          </a>
          <a
            disabled={releaseLoading[record.toData().templateId]}
            onClick={() => this.handleRelease(record)}
          >
            {intl.get('hzero.common.button.publish').d('发布')}
          </a>
        </span>
      );
    } else {
      switch (record.get('templateStatus')) {
        case 'RELEASED':
          operate = (
            <span className="action-link">
              <a onClick={() => this.handleUnlock(record)}>
                {intl.get('hzero.common.button.unlock').d('解锁')}
              </a>
            </span>
          );
          break;
        case 'PENDING':
          operate = (
            <span className="action-link">
              <a onClick={() => this.handelEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a
                disabled={releaseLoading[record.toData().templateId]}
                onClick={() => this.handleRelease(record)}
              >
                {intl.get('hzero.common.button.publish').d('发布')}
              </a>
              <a onClick={() => this.handleEnabled(record)}>
                {intl.get('hzero.common.status.disable').d('禁用')}
              </a>
            </span>
          );
          break;
        case 'DISABLE':
          operate = (
            <a onClick={() => this.handleUnlock(record)}>
              {intl.get('hzero.common.button.unlock').d('解锁')}
            </a>
          );
          break;
        default:
          break;
      }
    }
    return operate;
  }

  render() {
    const listColumns = [
      {
        name: 'templateStatusMeaning',
        width: 100,
      },
      {
        name: 'templateCode',
        width: 150,
        editor: (record) => record.status === 'add',
      },
      {
        name: 'templateName',
        width: 150,
        tooltip: 'overflow',
        editor: (record) => record.status === 'add' || record.getState('editAble'),
      },
      {
        name: 'templateType',
        width: 150,
      },
      {
        name: 'remark',
        width: 150,
        tooltip: 'overflow',
        editor: (record) => record.status === 'add' || record.getState('editAble'),
      },
      {
        name: 'realName',
        width: 120,
        tooltip: 'overflow',
      },
      {
        name: 'creationDate',
        width: 180,
      },
      {
        name: 'versionNum',
        width: 80,
      },
      {
        name: 'enable',
        width: 100,
        renderer: ({ record }) => yesOrNoRender(record.get('templateStatus') === 'DISABLE' ? 0 : 1),
      },
      {
        name: 'templateDetail',
        width: 100,
        renderer: ({ record }) =>
          record.status !== 'add' && (
            <a onClick={() => this.jumpTemplateDetail(record)}>
              {record.get('templateStatus') === 'PENDING'
                ? intl.get('ssrc.priceLibDimension.view.button.templateManage').d('模板管理')
                : intl.get('ssrc.priceLibDimension.view.button.templateView').d('模板查看')}
            </a>
          ),
      },
      {
        name: 'edit',
        width: 180,
        renderer: this.editOperations,
      },
      {
        name: 'operation',
        width: 120,
        renderer: ({ record }) =>
          record.status !== 'add' && (
            <a onClick={() => this.showOperation(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          ),
      },
    ];

    return (
      <Fragment>
        <Header
          title={intl.get('ssrc.priceLibDimension.view.title.priceLibTemplate').d('价格库模板定义')}
        >
          <Button icon="add" color="primary" funcType="raised" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" funcType="raised" onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={this.props.tableDs} columns={listColumns} />
        </Content>
      </Fragment>
    );
  }
}
