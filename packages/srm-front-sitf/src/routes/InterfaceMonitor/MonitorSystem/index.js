/**
 * MonitorSystem - 监控系统配置
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import { isUndefined, isEmpty } from 'lodash';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import CacheComponent from 'components/CacheComponent';
import { filterNullValueObject } from 'utils/utils';
import ListTable from './ListTable';
import QueryForm from './QueryForm';

/**
 * 监控系统配置
 * @extends {Component} - React.Component
 * @return React.element
 */

@withRouter
@CacheComponent({ cacheKey: '/sitf/interface-monitor/monitor-system' })
export default class MonitorSystem extends PureComponent {
  form;
  constructor(props) {
    super(props);
    this.state = {
      changedRows: [],
      uuidKey: uuidv4(),
    };
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  onFetchMonitorSystem(pageData = {}) {
    const { onFetchMonitorSystem } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    this.setState({
      changedRows: [],
    });
    if (onFetchMonitorSystem) {
      onFetchMonitorSystem({
        page: isEmpty(pageData) ? {} : pageData,
        ...filterValues,
      });
    }
    this.setState({
      uuidKey: uuidv4(),
    });
  }

  /**
   * 增加监控数据
   * @param {boolean} flag 显/隐标记
   * @param {Object} record 行数据
   */
  @Bind()
  onAddMonitorSystem() {
    const { onAddMonitorSystem } = this.props;
    if (onAddMonitorSystem) {
      onAddMonitorSystem();
    }
  }

  /**
   * 清除行数据
   * @param {Object} record 行数据
   */
  @Bind()
  onClearMonitorSystem(record = {}) {
    const { onClearMonitorSystem } = this.props;
    if (onClearMonitorSystem) {
      onClearMonitorSystem(record);
    }
  }

  /**
   * 保存数据
   */
  @Bind()
  onSaveMonitorSystem() {
    const { onSaveMonitorSystem } = this.props;
    const { changedRows } = this.state;
    const saveData = changedRows.map(row => {
      const formValues = row.$form && row.$form.getFieldsValue();
      return {
        ...row,
        ...formValues,
      };
    });
    if (onSaveMonitorSystem) {
      onSaveMonitorSystem(saveData);
    }
  }

  /**
   * 存储改变的数据
   * @param {Object} record 行数据
   */
  @Bind()
  onStoreChangedRows(record) {
    const { changedRows } = this.state;
    this.setState({
      changedRows: changedRows.find(row => row.monitorSystemId === record.monitorSystemId)
        ? changedRows.filter(r => r.monitorSystemId !== record.monitorSystemId)
        : [...changedRows, record],
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.onFetchMonitorSystem();
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryMonitorSystem(queryData = {}) {
    this.onFetchMonitorSystem(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.onFetchMonitorSystem(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const { history, list = [], pagination = {}, saveLoading, fetchLoading } = this.props;
    const { uuidKey } = this.state;
    // 编辑表格属性
    const editTableOption = {
      key: uuidKey,
      history,
      pagination,
      dataSource: list,
      loading: fetchLoading,
      onStoreChangedRows: this.onStoreChangedRows,
      onClearMonitorSystem: this.onClearMonitorSystem,
      onSearch: this.handleStandardTableChange,
    };

    return (
      <React.Fragment>
        <Content style={{ marginTop: '-16px' }}>
          <div className="table-list-operator" style={{ position: 'relative', height: '32px' }}>
            <div style={{ position: 'absolute', right: '0px' }}>
              <Button icon="plus" onClick={() => this.onAddMonitorSystem()}>
                {intl.get('sitf.interfaceMonitor.view.button.add.minitorSystem').d('新建监控系统')}
              </Button>
              <Button icon="save" loading={saveLoading} onClick={() => this.onSaveMonitorSystem()}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </div>
          </div>
          <QueryForm onQueryMonitorSystem={this.onFetchMonitorSystem} onRef={this.handleBindRef} />
          <ListTable {...editTableOption} />
        </Content>
      </React.Fragment>
    );
  }
}
