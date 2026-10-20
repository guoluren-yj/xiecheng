/**
 * InterfaceMonitor - 接口监控
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Tabs } from 'hzero-ui';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getEditTableData, addItemToPagination, delItemToPagination } from 'utils/utils';
import MinitorSystem from './MonitorSystem/index';
import NoticeFields from './NoticeFields/index';

/**
 * tab标签页
 */
const { TabPane } = Tabs;

/**
 * 接口监控
 * @extends {Component} - React.Component
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sitf.interfaceMonitor', 'entity.tenant'],
})
@connect(({ interfaceMonitor, loading }) => ({
  interfaceMonitor,
  saveLoading: loading.effects['interfaceMonitor/saveMonitorSystem'],
  fetchLoading: loading.effects['interfaceMonitor/fetchMonitorSystem'],
  saveNoticeFields: loading.effects['interfaceMonitor/saveNoticeFields'],
  fetchNoticeFields: loading.effects['interfaceMonitor/fetchNoticeFields'],
}))
@withRouter
export default class InterfaceMonitor extends PureComponent {
  moniterSystemRef;
  noticeFieldsRef;
  /**
   * 组件挂载后执行
   */
  componentDidMount() {
    const {
      location: { state: { _back } = {} },
    } = this.props;
    const {
      interfaceMonitor: { monitorSystem = {} },
    } = this.props;
    const page = isUndefined(_back) ? {} : monitorSystem.pagination;
    this.onFetchMonitorSystem({ page });
  }

  /**
   * 点击tab页查询接口列表和批次列表数据
   */
  @Bind()
  queryData() {
    const {
      interfaceMonitor: { monitorSystem = {}, noticeFields = {} },
    } = this.props;
    if (monitorSystem.list && monitorSystem.list.length <= 0) {
      this.onFetchMonitorSystem();
    }
    if (noticeFields.list && noticeFields.list.length <= 0) {
      this.onFetchNoticeFields();
    }
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  onFetchNoticeFields(pageData = {}) {
    const { dispatch } = this.props;
    if (this.noticeFieldsRef) {
      this.noticeFieldsRef.setState({
        changedRows: [],
      });
    }
    dispatch({
      type: 'interfaceMonitor/fetchNoticeFields',
      payload: pageData,
    });
  }

  /**
   * 增加监控数据
   * @param {boolean} flag 显/隐标记
   * @param {Object} record 行数据
   */
  @Bind()
  onAddNoticeFields() {
    const {
      dispatch,
      interfaceMonitor: { noticeFields = {} },
    } = this.props;
    const { list = [], pagination = {} } = noticeFields;
    dispatch({
      type: 'interfaceMonitor/updateState',
      payload: {
        noticeFields: {
          list: [
            {
              fieldId: uuidv4(),
              enabledFlag: 1,
              _status: 'create', // 新建标记位
            },
            ...list,
          ],
          pagination: addItemToPagination(list.length, pagination),
        },
      },
    });
  }

  @Bind()
  getNoticeFieldsRef(ref = {}) {
    this.noticeFieldsRef = ref;
  }

  /**
   * 清除行数据
   * @param {Object} record 行数据
   */
  @Bind()
  onClearNoticeFields(record = {}) {
    const {
      dispatch,
      interfaceMonitor: { noticeFields = {} },
    } = this.props;
    const { list = [], pagination = {} } = noticeFields;
    const newList = list.filter(item => item.fieldId !== record.fieldId);
    dispatch({
      type: 'interfaceMonitor/updateState',
      payload: {
        noticeFields: {
          list: [...newList],
          pagination: delItemToPagination(list.length, pagination),
        },
      },
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  onSaveNoticeFields(changedRows = []) {
    const {
      dispatch,
      interfaceMonitor: { noticeFields = {} },
    } = this.props;
    const params = getEditTableData(noticeFields.list, ['fieldId']);
    if (Array.isArray(params) && params.length !== 0) {
      const addRows = params.filter(param => param._status === 'create');
      dispatch({
        type: 'interfaceMonitor/saveNoticeFields',
        payload: [...addRows, ...changedRows],
      }).then(res => {
        if (res) {
          notification.success();
          this.onFetchNoticeFields(noticeFields.pagination);
        }
      });
    }
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  onFetchMonitorSystem(pageData = {}) {
    const { dispatch } = this.props;
    if (this.moniterSystemRef) {
      this.moniterSystemRef.setState({
        changedRows: [],
      });
    }
    dispatch({
      type: 'interfaceMonitor/fetchMonitorSystem',
      payload: pageData,
    });
  }

  /**
   * 增加监控数据
   * @param {boolean} flag 显/隐标记
   * @param {Object} record 行数据
   */
  @Bind()
  onAddMonitorSystem() {
    const {
      dispatch,
      interfaceMonitor: { monitorSystem = {} },
    } = this.props;
    const { list = [], pagination = {} } = monitorSystem;
    dispatch({
      type: 'interfaceMonitor/updateState',
      payload: {
        monitorSystem: {
          list: [
            {
              monitorSystemId: uuidv4(),
              enabledFlag: 1,
              _status: 'create', // 新建标记位
            },
            ...list,
          ],
          pagination: addItemToPagination(list.length, pagination),
        },
      },
    });
  }

  @Bind()
  getMonitorSystemRef(ref = {}) {
    this.moniterSystemRef = ref;
  }

  /**
   * 清除行数据
   * @param {Object} record 行数据
   */
  @Bind()
  onClearMonitorSystem(record = {}) {
    const {
      dispatch,
      interfaceMonitor: { monitorSystem = {} },
    } = this.props;
    const { list = [], pagination = {} } = monitorSystem;
    const newList = list.filter(item => item.monitorSystemId !== record.monitorSystemId);
    dispatch({
      type: 'interfaceMonitor/updateState',
      payload: {
        monitorSystem: {
          list: [...newList],
          pagination: delItemToPagination(list.length, pagination),
        },
      },
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  onSaveMonitorSystem(changedRows = []) {
    const {
      dispatch,
      interfaceMonitor: { monitorSystem = {} },
    } = this.props;
    const params = getEditTableData(monitorSystem.list, ['monitorSystemId']);
    if (Array.isArray(params) && params.length !== 0) {
      const addRows = params.filter(param => param._status === 'create');
      dispatch({
        type: 'interfaceMonitor/saveMonitorSystem',
        payload: [...addRows, ...changedRows],
      }).then(res => {
        if (res) {
          notification.success();
          this.onFetchMonitorSystem(monitorSystem.pagination);
        }
      });
    }
  }

  render() {
    const {
      interfaceMonitor: { monitorSystem = {}, noticeFields = {} },
      saveLoading,
      fetchLoading,
      saveNoticeFields,
      fetchNoticeFields,
      history,
    } = this.props;
    const minitorSystemOption = {
      history,
      saveLoading,
      fetchLoading,
      onRef: this.getMonitorSystemRef,
      list: monitorSystem.list || [],
      pagination: monitorSystem.pagination || {},
      onClearMonitorSystem: this.onClearMonitorSystem,
      onSaveMonitorSystem: this.onSaveMonitorSystem,
      onAddMonitorSystem: this.onAddMonitorSystem,
      onFetchMonitorSystem: this.onFetchMonitorSystem,
    };
    const noticeFieldsOption = {
      saveNoticeFields,
      fetchNoticeFields,
      onRef: this.getNoticeFieldsRef,
      list: noticeFields.list || [],
      pagination: noticeFields.pagination || {},
      onClearNoticeFields: this.onClearNoticeFields,
      onSaveNoticeFields: this.onSaveNoticeFields,
      onAddNoticeFields: this.onAddNoticeFields,
      onFetchNoticeFields: this.onFetchNoticeFields,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sitf.interfaceMonitor.view.title.interfaceMonitor').d('接口监控')}
        />
        <Content>
          <Tabs
            defaultActiveKey="1"
            onChange={this.queryData}
            animated={false}
            tabBarStyle={{ marginTop: '-8px' }}
          >
            <TabPane
              tab={intl.get('sitf.interfaceMonitor.view.tab.minitorSystem').d('监控系统配置')}
              key="1"
            >
              <MinitorSystem {...minitorSystemOption} />
            </TabPane>
            <TabPane
              tab={intl.get('sitf.interfaceMonitor.view.tab.noticeFields').d('监控提醒字段配置')}
              key="2"
            >
              <NoticeFields {...noticeFieldsOption} />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
