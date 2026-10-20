/**
 * MonitorInterfaceSetting - 监控接口配置
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Button, Row, Col } from 'hzero-ui';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getEditTableData, addItemToPagination, delItemToPagination } from 'utils/utils';
import ListTable from './ListTable';

/**
 * 监控接口配置
 * @extends {Component} - React.Component
 * @reactProps {Object} monitorInterfaceSetting - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({
  code: ['sitf.monitorInterfaceSetting', 'entity.tenant', 'entity.interface'],
})
@connect(({ monitorInterfaceSetting, loading }) => ({
  monitorInterfaceSetting,
  saveLoading: loading.effects['monitorInterfaceSetting/saveMonitorInterfaceSetting'],
  fetchLoading: loading.effects['monitorInterfaceSetting/fetchMonitorInterfaceSetting'],
}))
@withRouter
export default class MonitorInterfaceSetting extends PureComponent {
  constructor(props) {
    super(props);
    const { monitorSystemId = undefined } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      monitorSystemId,
      changedRows: [],
      uuidKey: uuidv4(),
    };
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    this.fetchMonitorSystemInfo();
    this.fetchMonitorInterfaceSetting();
  }

  /**
   * 查询监控系统详情
   */
  @Bind()
  fetchMonitorSystemInfo() {
    const { dispatch } = this.props;
    const { monitorSystemId } = this.state;
    dispatch({
      type: 'monitorInterfaceSetting/fetchMonitorSystemInfo',
      payload: {
        monitorSystemId,
      },
    });
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchMonitorInterfaceSetting(pageData = {}) {
    const { monitorSystemId } = this.state;
    this.setState({
      changedRows: [],
      uuidKey: uuidv4(),
    });
    const { dispatch } = this.props;
    dispatch({
      type: 'monitorInterfaceSetting/fetchMonitorInterfaceSetting',
      payload: {
        monitorSystemId,
        page: pageData,
      },
    });
  }

  /**
   * 增加监控数据
   * @param {boolean} flag 显/隐标记
   * @param {Object} record 行数据
   */
  @Bind()
  onAddMonitorInterfaceSetting() {
    const {
      dispatch,
      monitorInterfaceSetting: { list = [], pagination = {} },
    } = this.props;
    dispatch({
      type: 'monitorInterfaceSetting/updateState',
      payload: {
        list: [
          {
            monitorInterfaceId: uuidv4(),
            enabledFlag: 1,
            _status: 'create', // 新建标记位
          },
          ...list,
        ],
        pagination: addItemToPagination(list.length, pagination),
      },
    });
  }

  /**
   * 清除行数据
   * @param {Object} record 行数据
   */
  @Bind()
  onClearMonitorInterfaceSetting(record = {}) {
    const {
      dispatch,
      monitorInterfaceSetting: { list = [], pagination = {} },
    } = this.props;
    const newList = list.filter(item => item.monitorInterfaceId !== record.monitorInterfaceId);
    dispatch({
      type: 'monitorInterfaceSetting/updateState',
      payload: {
        list: [...newList],
        pagination: delItemToPagination(list.length, pagination),
      },
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  onSaveMonitorInterfaceSetting() {
    const {
      dispatch,
      monitorInterfaceSetting: { list = [], pagination = {} },
    } = this.props;
    const { changedRows, monitorSystemId } = this.state;
    const params = getEditTableData(list, ['monitorInterfaceId']);
    const saveData = changedRows.map(row => {
      const formValues = row.$form && row.$form.getFieldsValue();
      return {
        ...row,
        ...formValues,
      };
    });
    if (Array.isArray(params) && params.length !== 0) {
      const addRows = params.filter(param => param._status === 'create');
      dispatch({
        type: 'monitorInterfaceSetting/saveMonitorInterfaceSetting',
        payload: {
          monitorSystemId,
          monitorInterfaceList: [...addRows, ...saveData],
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchMonitorInterfaceSetting(pagination);
        }
      });
    }
  }

  /**
   * 存储数据方法
   * @param {Object} record
   */
  @Bind()
  onStoreChangedRows(record) {
    const { changedRows } = this.state;
    this.setState({
      changedRows: changedRows.find(row => row.monitorInterfaceId === record.monitorInterfaceId)
        ? changedRows.filter(r => r.monitorInterfaceId !== record.monitorInterfaceId)
        : [...changedRows, record],
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.fetchMonitorInterfaceSetting();
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchMonitorInterfaceSetting(pagination);
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      match,
      monitorInterfaceSetting: { list = [], pagination = {}, monitorSystemInfo = {} },
      saveLoading,
      fetchLoading,
    } = this.props;
    const { uuidKey } = this.state;
    // 编辑表格属性
    const editTableOption = {
      key: uuidKey,
      pagination,
      dataSource: list,
      loading: fetchLoading,
      externalSystemCode: monitorSystemInfo.externalSystemCode,
      tenant: monitorSystemInfo.tenantId,
      onStoreChangedRows: this.onStoreChangedRows,
      onClearMonitorInterfaceSetting: this.onClearMonitorInterfaceSetting,
      onSearch: this.handleStandardTableChange,
    };
    const basePath = match.path.substring(0, match.path.indexOf('/monitor-interface-setting'));
    return (
      <React.Fragment>
        <Header
          title={intl.get('sitf.monitorInterfaceSetting.view.message.title').d('监控接口配置')}
          backPath={`${basePath}/list`}
        >
          <Button icon="plus" type="primary" onClick={() => this.onAddMonitorInterfaceSetting()}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="save"
            loading={saveLoading}
            onClick={() => this.onSaveMonitorInterfaceSetting()}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <Row gutter={24}>
              <Col span={2} style={{ textAlign: 'right', paddingRight: '6px' }}>
                {intl.get('entity.tenant.name').d('租户名称')}：
              </Col>
              <Col
                span={4}
                style={{
                  borderBottom: '1px solid #999',
                  marginTop: `${!monitorSystemInfo.tenantName ? '16px' : ''}`,
                }}
              >
                {monitorSystemInfo.tenantName}
              </Col>
              <Col span={2} style={{ textAlign: 'right' }}>
                {intl
                  .get('sitf.monitorInterfaceSetting.view.message.externalSystemCode')
                  .d('外部系统代码')}
                :
              </Col>
              <Col
                span={4}
                style={{
                  borderBottom: '1px solid #999',
                  marginTop: `${!monitorSystemInfo.externalSystemCode ? '16px' : ''}`,
                }}
              >
                {monitorSystemInfo.externalSystemCode}
              </Col>
              <Col span={2} style={{ textAlign: 'right' }}>
                {intl
                  .get('sitf.monitorInterfaceSetting.view.message.externalSystemName')
                  .d('外部系统名称')}
                :
              </Col>
              <Col
                span={4}
                style={{
                  borderBottom: '1px solid #999',
                  marginTop: `${!monitorSystemInfo.externalSystemName ? '16px' : ''}`,
                }}
              >
                {monitorSystemInfo.externalSystemName}
              </Col>
            </Row>
          </div>
          <ListTable {...editTableOption} />
        </Content>
      </React.Fragment>
    );
  }
}
