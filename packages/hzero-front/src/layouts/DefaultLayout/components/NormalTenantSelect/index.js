/**
 * NormalTenantSelect
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019/8/27
 * @copyright 2019 © HAND
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Icon, Modal, Select, Spin, Table, Tooltip } from 'hzero-ui';
import { routerRedux } from 'dva/router';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { cleanMenuTabs } from 'utils/menuTab';
import {
  getCurrentOrganizationId,
  getCurrentTenant,
  getCurrentUser,
  setSession,
} from 'utils/utils';
import { CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE, YQCLOUD_TABMAP, YQCLOUD_COUNT } from 'utils/constants';
import remote from 'utils/remote';

import RecordCheckbox from './RecordCheckbox';
import style from './index.less';

const menuHistorySessionKey = 'menuHistoryKey';

@remote({
  code: 'LAYOUT_NORMAL_TENANT_SELECT',
  name: 'processRemote',
})
class NormalTenantSelect extends Component {
  /**
   * constructor - constructor方法
   * 组件构造函数
   */
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      tenantId: getCurrentOrganizationId(),
      selectTenant: (getCurrentTenant() || {}).tenantName || '',
      currentTenantName: '',
    };
  }

  /**
   * @function showModal - 显示和隐藏租户切换模态框
   * @param {boolean} flag - 显示或隐藏标识
   */
  @Bind()
  showModal(flag) {
    const { dispatch } = this.props;
    if (flag) {
      dispatch({
        type: 'user/fetchTenantList',
      });
    }
    this.setState({ modalVisible: flag });
  }

  /**
   * @function handleSelectTenant - 选择租户
   * @param {object} record - 选择的租户行数据
   * @param {string} record.tenantId - 租户ID
   * @param {string} record.tenantName - 租户名称
   * @param {string} record.tenantNum - 租户编码
   */
  @Bind()
  handleSelectTenant(record) {
    const { dispatch } = this.props;
    this.setState({
      // modalVisible: false,
      // 设置 loading
      updateTenantLoading: true,
      selectTenant: record.tenantName,
    });
    this.setState({
      selectTenant: record.tenantName,
    });
    // warn 清空 tabs 信息
    cleanMenuTabs();
    // 切换租户成功后跳转首页，刷新页面
    dispatch(routerRedux.push({ pathname: '/' }));
    // 缓存当前用户的租户
    dispatch({
      type: 'user/updateCurrentTenant',
      payload: { tenantId: record.tenantId },
    }).then((res) => {
      if (res) {
        setSession(menuHistorySessionKey, []);
        dispatch(routerRedux.push({ pathname: '/workplace' }));
        // 切换租户时记录当前登陆租户、角色和语言
        const { currentRoleId, language, timeZone } = getCurrentUser();
        localStorage.setItem(
          CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE,
          `${record.tenantId}-${currentRoleId}-${language}-${timeZone}`
        );
        localStorage.removeItem(YQCLOUD_TABMAP);
        localStorage.removeItem(YQCLOUD_COUNT);
        // 成功 刷新页面
        window.location.reload();
      } else {
        // 失败 不关闭模态框
        this.setState({
          updateTenantLoading: false,
        });
      }
    });
  }

  @Bind()
  handleTenantChange(tenantSelect) {
    if (tenantSelect !== 'see-all-tenant') {
      this.setState({ currentTenantName: tenantSelect });
    } else {
      this.showModal(true);
    }
  }

  /**
   * 选择器的点击事件
   * @param {object} record - 选择的租户行数据
   */
  @Bind()
  clickOption(record) {
    const { tenantId } = this.state;
    if (record.tenantId !== tenantId) {
      // 点击行和当前租户id不同才执行
      this.handleSelectTenant(record);
    }
  }

  getColumns() {
    const { processRemote } = this.props;
    const { tenantId } = this.state;
    let columns = [
      {
        title: <>{intl.get('entity.tenant.name').d('租户名称')} <Tooltip title={intl.get('hzero.common.tip.clickChangeTenant').d('点击名称切换租户')}><Icon type="question-circle-o" style={{ marginLeft: "4px" }} /></Tooltip></>,
        dataIndex: 'tenantName',
        render: (text, record) => (
          <div className={style.tenant}>
            {record.tenantId === tenantId && <div className={style['tenant-select-wrapper']} />}
            <a onClick={() => this.handleSelectTenant(record)}>
              {text}
              {record.tenantId === tenantId && `(${intl.get('hzero.common.current').d('当前')})`}
            </a>
          </div>
        ),
        
      },
      {
        title: intl.get('entity.tenant.code').d('租户编码'),
        width: 180,
        dataIndex: 'tenantNum',
      },
    ];
    if (processRemote && processRemote.process) {
      columns = processRemote.process(
        'LAYOUT_NORMAL_TENANT_SELECT_TABLE_COLUMNS',
        columns,
        { columns }
      );
    }
    return columns;
  }

  @Bind()
  renderTenantNum(tenantNum) {
    const { processRemote } = this.props;
    if (processRemote && processRemote.process) {
      return processRemote.render(
        'LAYOUT_NORMAL_TENANT_SELECT_TENANT_NUM',
        <div className={style['tenant-select-wrapper-subtitle']}>{tenantNum}</div>,
        {}
      );
    }
    return <div className={style['tenant-select-wrapper-subtitle']}>{tenantNum}</div>;
  }

  render() {
    const {
      tenantList = [],
      tenantName,
      allLoading = false,
      className,
      recentAccessTenantList = [],
    } = this.props;
    const {
      updateTenantLoading = false,
      selectTenant = {},
      modalVisible = false,
      currentTenantName = '',
    } = this.state;

    const columns = this.getColumns();

    const realTenantName = selectTenant.tenantName || tenantName || '';

    if (!realTenantName) {
      return null;
    }
    return (
      <>
        <Select
          size="small"
          className={classNames('select-no-border', 'default-language-select', className)}
          value={currentTenantName || realTenantName}
          onChange={this.handleTenantChange}
          disabled={allLoading}
          choiceRender={() => currentTenantName || realTenantName}
        >
          {recentAccessTenantList.map((item) => (
            <Select.Option
              key={item.tenantId}
              value={item.tenantName}
              onClick={() => this.clickOption(item)}
            >
              {item.tenantName}
              {this.renderTenantNum(item.tenantNum)}
            </Select.Option>
          ))}
          <Select.Option key="see-all-tenant" value="see-all-tenant">
            {intl.get('hzero.common.view.tenantSelect.seeAll').d('查看所有租户')}
          </Select.Option>
        </Select>
        <Modal
          title={intl.get('hzero.common.view.tenantSelect.title').d('选择租户')}
          width="620px"
          bodyStyle={{ paddingTop: 0, height: '460px', overflow: 'scroll' }}
          visible={modalVisible}
          onCancel={() => this.showModal(false)}
          footer={null}
        >
          <Spin spinning={updateTenantLoading}>
            <Table
              bordered
              style={{ marginTop: 24 }}
              rowKey="tenantId"
              pagination={false}
              loading={allLoading}
              dataSource={tenantList}
              columns={columns}
            />
          </Spin>
        </Modal>
      </>
    );
  }
}

export default formatterCollections({ code: ['hpfm.tenantSelect', 'entity.tenant'] })(
  connect(
    ({
      user: { tenantList = [], currentUser: { tenantName, recentAccessTenantList = [] } } = {},
      loading,
    }) => ({
      tenantList,
      tenantName,
      recentAccessTenantList,
      allLoading:
        loading.effects['user/updateDefaultTenant'] || loading.effects['user/fetchTenantList'],
    })
  )(NormalTenantSelect)
);
