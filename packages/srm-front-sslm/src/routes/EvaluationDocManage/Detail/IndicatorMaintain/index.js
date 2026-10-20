/*
 * IndicatorMaintain - 指标维护
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table, DataSet, Tabs, Button, notification } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { addedDS, notAddedDS } from './stores';

export default class index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'added',
    };
    if (props.onRef) {
      props.onRef(this);
    }
  }

  addedDS = new DataSet({
    ...addedDS(),
    queryParameter: {
      evalHeaderId: this.props.evalHeaderId,
    },
  });

  notAddedDS = new DataSet({
    ...notAddedDS(),
    queryParameter: {
      evalHeaderId: this.props.evalHeaderId,
    },
  });

  componentDidMount() {
    const { modal } = this.props;
    const { activeKey } = this.state;
    if (activeKey === 'added') {
      modal.update({
        footer: (okBtn, cancelBtn) => (
          <div>
            {okBtn}
            <Button onClick={this.handleDelete}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            {cancelBtn}
          </div>
        ),
        okText: intl.get(`hzero.common.button.sure`).d('确定'),
        onOk: () => {
          return this.handleSave();
        },
      });
    }
  }

  /**
   * 已添加
   */
  @Bind()
  getAddedColumns() {
    const columns = [
      {
        name: 'indicatorCode',
      },
      {
        name: 'indicatorName',
      },
      {
        name: 'scoreTypeMeaning',
      },
      {
        name: 'evalWeight',
        editor: (record) => !!record.get('leafFlag'),
      },
      {
        name: 'evalStandard',
        editor: (record) => !!record.get('leafFlag'),
      },
    ];
    return columns;
  }

  /**
   * 未添加
   */
  @Bind()
  getNotAddedColumns() {
    const columns = [
      {
        name: 'indicatorCode',
      },
      {
        name: 'indicatorName',
      },
      {
        name: 'scoreTypeMeaning',
      },
      {
        name: 'evalWeight',
      },
      {
        name: 'evalStandard',
      },
    ];
    return columns;
  }

  /**
   * tab切换的回调
   */
  @Bind()
  handleTabChange(key) {
    const { modal } = this.props;
    this.setState({
      activeKey: key,
    });
    if (key === 'notAdded') {
      modal.update({
        footer: (okBtn, cancelBtn) => (
          <div>
            {okBtn}
            {cancelBtn}
          </div>
        ),
        okText: intl.get(`sslm.common.view.button.add`).d('添加'),
        onOk: () => {
          return this.handleAdd();
        },
      });
    } else {
      modal.update({
        footer: (okBtn, cancelBtn) => (
          <div>
            {okBtn}
            <Button onClick={this.handleDelete}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            {cancelBtn}
          </div>
        ),
        okText: intl.get(`hzero.common.button.sure`).d('确定'),
        onOk: () => {
          return this.handleSave();
        },
      });
    }
  }

  /**
   * 处理保存
   */
  @Bind()
  async handleSave() {
    let modalCloseFlag = false;
    if (this.addedDS.dirty) {
      const validateFlag = await this.addedDS.validate();
      if (validateFlag) {
        const res = getResponse(await this.addedDS.submit());
        if (res && res.success) {
          modalCloseFlag = true;
        }
        return modalCloseFlag;
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl.get('sslm.common.view.message.maintainInfo').d('请维护相关信息！'),
        });
        return modalCloseFlag;
      }
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl
          .get('sslm.supplierDocManage.view.saveWaring.noDataSave')
          .d('暂无需要保存的数据！'),
      });
      return modalCloseFlag;
    }
  }

  /**
   * 处理删除
   */
  @Bind()
  async handleDelete() {
    const { modal } = this.props;
    const selectedRecords = this.addedDS.selected;
    if (selectedRecords.length) {
      const res = getResponse(await this.addedDS.delete(selectedRecords));
      if (res && res.success) {
        this.addedDS.unSelectAll();
        this.addedDS.clearCachedSelected();
        modal.close();
      }
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('hzero.common.notification.warning').d('请先勾选一条数据'),
      });
    }
  }

  /**
   * 处理添加
   */
  @Bind()
  async handleAdd() {
    const selectedRecords = this.notAddedDS.selected;
    if (selectedRecords.length) {
      let modalCloseFlag = false;
      const res = getResponse(await this.notAddedDS.submit());
      if (res && res.success) {
        this.notAddedDS.unSelectAll();
        this.notAddedDS.clearCachedSelected();
        modalCloseFlag = true;
      }
      return modalCloseFlag;
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('hzero.common.notification.warning').d('请先勾选一条数据'),
      });
      return false;
    }
  }

  render() {
    const { activeKey } = this.state;
    return (
      <Fragment>
        <Tabs activeKey={activeKey} animated={false} onChange={this.handleTabChange}>
          <Tabs.TabPane
            tab={intl.get(`sslm.supplierDocManage.view.tab.added`).d('已添加')}
            key="added"
          >
            <Table
              mode="tree"
              treeAsync
              onRow={({ record }) => {
                const nodeProps = {};
                if (record.get('leafFlag')) {
                  nodeProps.isLeaf = true;
                }
                return nodeProps;
              }}
              dataSet={this.addedDS}
              columns={this.getAddedColumns()}
              queryFieldsLimit={2}
              queryBar={this.renderBar}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get('sslm.supplierDocManage.view.tab.notAdded').d('未添加')}
            key="notAdded"
          >
            <Table
              mode="tree"
              treeAsync
              onRow={({ record }) => {
                const nodeProps = {};
                if (record.get('leafFlag')) {
                  nodeProps.isLeaf = true;
                }
                return nodeProps;
              }}
              dataSet={this.notAddedDS}
              columns={this.getNotAddedColumns()}
              queryFieldsLimit={2}
            />
          </Tabs.TabPane>
        </Tabs>
      </Fragment>
    );
  }
}
