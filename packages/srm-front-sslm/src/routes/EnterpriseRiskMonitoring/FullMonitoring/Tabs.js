/* eslint-disable react/no-unused-state */
/**
 * TabsComponent - 全量监控企业管理
 * @date: 2019-07-02
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs, Table, Modal, Form, Popover } from 'hzero-ui';
import { isUndefined, uniq, isEmpty, flow, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import ExcelExport from 'components/ExcelExport';
import { Button as PerButton } from 'components/Permission';
import { checkPermission } from 'services/api';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';
import notification from 'utils/notification';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';

import FilterForm from './FilterForm';
import EditGroupDrawer from '../Group/EditGroupDrawer';
import ModifyGroupModel from '../Group/ModifyGroupModel';
import CreateEnterpriceDrawer from './CreateEnterpriceDrawer';
// import styles from '../index.less';

const { confirm } = Modal;

/**
 * 全量监控企业管理
 * @extends {Component} - Component
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} FullMonitoring - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ riskMonitoring, loading }) => ({
  riskMonitoring,
  loading: loading.effects['riskMonitoring/queryMonitoring'],
  cancelLoading: loading.effects['riskMonitoring/cancelMonitoring'],
}))
@formatterCollections({ code: ['sslm.riskMonitoring'] })
@cacheComponent({ cacheKey: '/sslm/supplier-manager/list' })
export default class TabsComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editGroupVisible: false, // 编辑分组模态框的显示、隐藏
      createEnterpriceVisible: false,
      modifyGroupVisible: false, // 修改分组模态框的显示、隐藏
      selectedRows: [],
      // eslint-disable-next-line react/no-unused-state
      selectedRowKeys: [],
      // eslint-disable-next-line react/no-unused-state
      organizationId: getCurrentOrganizationId(),
      monitorGroupId: 'all', // 分组Id
      expand: {},
      // eslint-disable-next-line react/no-unused-state
      showAllTab: false,
    };
  }

  componentDidMount() {
    const {
      riskMonitoring: { monitoringPagination = {} },
    } = this.props;
    const { monitorGroupId } = this.state;
    this.queryValueCode();
    this.handleSearchMonitoring(monitoringPagination[monitorGroupId]);
    this.queryPermissionGroups();
    this.handlePermissionButton();
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'riskMonitoring/queryValueCode',
      payload: {
        isErpList: 'HPFM.FLAG', // 是否为Erp
        tenantId: getCurrentOrganizationId(),
      },
    });
  }

  /**
   * 手动查询权限集
   */
  @Bind()
  handlePermissionButton() {
    checkPermission(['srm.partner.risk-manage.enterprise-monitoring-manage.ps.all-tab']).then(
      response => {
        const res = getResponse(response);
        if (res && isArray(res)) {
          const { approve } = res[0];
          this.setState({
            // eslint-disable-next-line react/no-unused-state
            showAllTab: approve,
          });
        }
      }
    );
  }

  /**
   * 查询分组列表
   */
  @Bind()
  queryGroupsList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'riskMonitoring/queryGroups',
    });
  }

  /**
   * 查询分组列表
   */
  @Bind()
  queryPermissionGroups() {
    const { dispatch } = this.props;
    dispatch({
      type: 'riskMonitoring/queryPermissionGroups',
    });
  }

  /**
   * 查询风险监控
   * @param {*} page 分页
   */
  @Bind()
  handleSearchMonitoring(page = {}) {
    this.setState({
      // eslint-disable-next-line react/no-unused-state
      selectedRowKeys: [],
      selectedRows: [],
    });
    const { dispatch } = this.props;
    const { monitorGroupId } = this.state;
    const fieldValues =
      this[`monitoringList${monitorGroupId}`] &&
      this[`monitoringList${monitorGroupId}`].props &&
      this[`monitoringList${monitorGroupId}`].props.form.getFieldsValue();
    dispatch({
      type: 'riskMonitoring/queryMonitoring',
      payload: {
        page,
        monitorGroupId: monitorGroupId === 'all' ? undefined : monitorGroupId,
        ...filterNullValueObject(fieldValues),
      },
    });
  }

  @Bind()
  handleOpenControlEnterprise() {
    const { createEnterpriceVisible } = this.state;
    this.setState({ createEnterpriceVisible: !createEnterpriceVisible });
  }

  /**
   * 是否展开
   */
  @Bind()
  toggle() {
    const { monitorGroupId, expand } = this.state;
    this.setState({
      expand: {
        [monitorGroupId]: !expand[monitorGroupId],
      },
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { monitorGroupId } = this.state;
    const formValues =
      this[`monitoringList${monitorGroupId}`] &&
      this[`monitoringList${monitorGroupId}`].props &&
      this[`monitoringList${monitorGroupId}`].props.form.getFieldsValue();
    return {
      monitorGroupId: monitorGroupId === 'all' ? undefined : monitorGroupId,
      ...formValues,
    };
  }

  /**
   * 编辑分组模态框
   */
  @Bind()
  handleEditGroups() {
    const { editGroupVisible } = this.state;
    this.setState({
      editGroupVisible: !editGroupVisible,
    });
  }

  /**
   * 修改分组模态框
   */
  @Bind()
  handleModifyGroup() {
    const { modifyGroupVisible, selectedRows } = this.state;
    const {
      riskMonitoring: { monitoringPagination = {} },
    } = this.props;
    const monitorGroupIds = selectedRows.map(item => item.monitorGroupIds);
    const uniqArr = uniq(monitorGroupIds);
    if (modifyGroupVisible) {
      this.handleSearchMonitoring(monitoringPagination);
    }
    if (uniqArr.length === 1) {
      this.setState({
        modifyGroupVisible: !modifyGroupVisible,
      });
    } else {
      notification.warning({
        message: intl
          .get(`sslm.riskMonitoring.view.message.noBatchModify`)
          .d('所属供应商分组不同，不可批量修改！'),
      });
    }
  }

  /**
   * 取消监控
   */
  @Bind()
  handleCancelMonitor() {
    const {
      dispatch,
      riskMonitoring: { monitoringPagination = {} },
    } = this.props;
    const { selectedRows } = this.state;
    const payload = selectedRows.map(s => ({
      monitorId: s.monitorId,
      resultMonitor: s.resultMonitor,
      supplierCompanyId: s.companyId,
      tenantId: getCurrentOrganizationId(),
    }));
    confirm({
      title: intl
        .get(`sslm.riskMonitoring.view.message.confirm.cancelMonitor`)
        .d('取消后，将在次月释放监控额度，确认取消吗？'),
      // content: '',
      onOk: () => {
        dispatch({
          type: 'riskMonitoring/cancelMonitoring',
          payload,
        }).then(res => {
          if (res) notification.success();
          this.handleSearchMonitoring(monitoringPagination);
        });
      },
    });
  }

  /**
   * 保存选中的行
   * @param {Array} selectedRows
   */
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    // eslint-disable-next-line react/no-unused-state
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * Tab Onchange
   * @param {*} tabKey
   */
  @Bind()
  handleTabsChange(monitorGroupId) {
    const {
      riskMonitoring: { monitoringPagination = {} },
    } = this.props;
    this.setState(
      {
        monitorGroupId,
      },
      () => {
        this.handleSearchMonitoring(monitoringPagination[monitorGroupId]);
      }
    );
  }

  /**
   * 跳转内嵌页面
   */
  @Bind()
  handleJumpPage(queryType, companyName) {
    const { dispatch } = this.props;
    const { monitorGroupId } = this.state;
    const type = isUndefined(companyName)
      ? 'riskMonitoring/queryAllRisk'
      : 'riskMonitoring/queryEnterpriseRisk';

    const GroupId = monitorGroupId === 'all' ? undefined : monitorGroupId;
    const params = isUndefined(GroupId) ? {} : { groupId: GroupId };
    const payload = isUndefined(companyName) ? params : { enterpriseName: companyName };

    if (isUndefined(companyName)) {
      dispatch({
        type,
        payload,
      }).then(res => {
        if (getResponse(res)) {
          openTab({
            title: intl.get(`sslm.riskMonitoring.model.riskMonitoring.riskAnalysis`).d('风险分析'),
            key: `/sslm/risk-embed`,
            search: `urlParams=${encodeURIComponent(res.monitorUrl)}`,
          });
        }
      });
    } else {
      const prompt = `<p style="text-align: center">${intl
        .get(`sslm.riskMonitoring.model.riskMonitoring.loading`)
        .d('正在加载')}...</p>`;
      const riskEmbedPage = window.open();
      riskEmbedPage.document.body.innerHTML = prompt;
      dispatch({
        type,
        payload,
      }).then(res => {
        if (res && !res.failed) {
          riskEmbedPage.location = res.monitorUrl;
        } else if (res) {
          const errPrompt = `<p style="text-align: center">${res.message}</p>`;
          riskEmbedPage.document.body.innerHTML = errPrompt;
        }
      });
    }
  }

  @Bind()
  renderForm(tabKey) {
    const {
      riskMonitoring: {
        code: { isErpList = [] },
      },
    } = this.props;
    const { expand } = this.state;
    class FilterBasicForm extends FilterForm {}
    const FilterFForm = flow(
      cacheComponent({ cacheKey: `/sslm/full-monitoring/list-${tabKey}` }),
      Form.create({ fieldNameProp: null })
    )(FilterBasicForm);
    const listParams = {
      isErpList,
      tabKey,
      expand: expand[tabKey],
      onSearch: this.handleSearchMonitoring,
      onToggle: this.toggle,
    };
    return (
      <div className="table-list-search">
        <FilterFForm
          {...listParams}
          onRef={ref => {
            this[`monitoringList${tabKey}`] = ref;
          }}
        />
      </div>
    );
  }

  renderAllGroup(tabKey) {
    const {
      loading,
      cancelLoading,
      riskMonitoring: { monitoringList = {}, monitoringPagination = {} },
    } = this.props;
    const { organizationId, selectedRowKeys } = this.state;
    const columns = [
      {
        title: intl.get(`sslm.riskMonitoring.model.riskMonitoring.companyNum`).d('企业编码'),
        dataIndex: 'companyNum',
        width: 150,
      },
      {
        title: intl.get(`sslm.riskMonitoring.model.riskMonitoring.companyName`).d('企业名称'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl
          .get(`sslm.riskMonitoring.model.riskMonitoring.unifiedSocialCode`)
          .d('统一社会信用代码'),
        dataIndex: 'unifiedSocialCode',
        width: 200,
      },
      {
        title: intl.get(`sslm.riskMonitoring.model.riskMonitoring.monitorGroupName`).d('所属组别'),
        dataIndex: 'monitorGroupName',
        render: val => <Popover content={val}>{val}</Popover>,
        width: 300,
      },
      {
        title: intl.get(`sslm.riskMonitoring.model.riskMonitoring.sourceCode`).d('是否ERP'),
        dataIndex: 'sourceCode',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl
          .get(`sslm.riskMonitoring.model.riskMonitoring.dynamicRiskMonitor`)
          .d('风险动态监控'),
        dataIndex: 'dynamicRiskMonitoring',
        width: 150,
        render: (val, record) => (
          <a onClick={() => this.handleJumpPage('single', record.companyName)}>
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange,
    };

    const allLoading = cancelLoading || loading;

    return (
      <React.Fragment>
        <div className="table-list-search" style={{ textAlign: 'right' }}>
          {tabKey === 'all' && (
            <React.Fragment>
              <PerButton
                loading={allLoading}
                onClick={this.handleEditGroups}
                permissionList={[
                  {
                    code: `srm.partner.risk-manage.enterprise-monitoring-manage.ps.btn-edit-group`,
                    type: 'button',
                    meaning: '全量监控企业管理-编辑分组',
                  },
                ]}
              >
                {intl.get(`sslm.riskMonitoring.view.message.title.editGroup`).d('编辑分组')}
              </PerButton>
              <PerButton
                loading={allLoading}
                type="primary"
                onClick={this.handleOpenControlEnterprise}
                style={{ marginLeft: 8 }}
                permissionList={[
                  {
                    code: `srm.partner.risk-manage.enterprise-monitoring-manage.ps.btn-new-monitor`,
                    type: 'button',
                    meaning: '全量监控企业管理-新增监控企业',
                  },
                ]}
              >
                {intl
                  .get(`sslm.riskMonitoring.view.option.addMonitoringEnterprise`)
                  .d('新增监控企业')}
              </PerButton>
            </React.Fragment>
          )}
          {tabKey === 'all' && (
            <PerButton
              loading={allLoading}
              disabled={isEmpty(selectedRowKeys)}
              style={{ marginLeft: 8 }}
              onClick={this.handleModifyGroup}
              permissionList={[
                {
                  code: `srm.partner.risk-manage.enterprise-monitoring-manage.ps.btn-update-group`,
                  type: 'button',
                  meaning: '全量监控企业管理-修改分组',
                },
              ]}
            >
              {intl.get(`sslm.riskMonitoring.view.option.modifyGroup`).d('修改分组')}
            </PerButton>
          )}
          {tabKey === 'all' && (
            <PerButton
              loading={allLoading}
              disabled={isEmpty(selectedRowKeys)}
              style={{ marginLeft: 8 }}
              onClick={() => this.handleCancelMonitor()}
              permissionList={[
                {
                  code: `srm.partner.risk-manage.enterprise-monitoring-manage.ps.btn-cancel-monitor`,
                  type: 'button',
                  meaning: '全量监控企业管理-取消监控',
                },
              ]}
            >
              {intl.get(`sslm.riskMonitoring.view.option.cancelMonitoring`).d('取消监控')}
            </PerButton>
          )}
          <ExcelExport
            requestUrl={`${SRM_SSLM}/v1/${organizationId}/monitor/export`}
            queryParams={() => this.handleGetFormValue()}
            otherButtonProps={{
              loading: allLoading,
              icon: '',
              permissionList: [
                {
                  code: 'srm.partner.risk-manage.enterprise-monitoring-manage.ps.btn-export',
                  type: 'button',
                  meaning: '全量监控企业管理-导出',
                },
              ],
              style: { marginLeft: 8 },
            }}
          />
          {tabKey === 'all' ? (
            <PerButton
              loading={allLoading}
              type="primary"
              style={{ marginLeft: 8 }}
              onClick={() => this.handleJumpPage(tabKey)}
              permissionList={[
                {
                  code: `srm.partner.risk-manage.enterprise-monitoring-manage.ps.btn-view-risk`,
                  type: 'button',
                  meaning: '全量监控企业管理-查看风险分析',
                },
              ]}
            >
              {intl.get(`sslm.riskMonitoring.view.option.viewRiskAnalysis`).d('查看风险分析')}
            </PerButton>
          ) : (
            <PerButton
              loading={allLoading}
              type="primary"
              style={{ marginLeft: 8 }}
              onClick={() => this.handleJumpPage(tabKey)}
              permissionList={[
                {
                  code: `srm.partner.risk-manage.enterprise-monitoring-manage.ps.btn-view-risk`,
                  type: 'button',
                  meaning: '全量监控企业管理-查看风险分析',
                },
              ]}
            >
              {intl.get(`sslm.riskMonitoring.view.option.viewRiskAnalysis`).d('查看风险分析')}
            </PerButton>
          )}
        </div>
        <Table
          bordered
          rowKey="monitorId"
          loading={loading}
          dataSource={monitoringList}
          columns={columns}
          pagination={monitoringPagination}
          rowSelection={rowSelection}
          onChange={this.handleSearchMonitoring}
        />
      </React.Fragment>
    );
  }

  render() {
    const {
      riskMonitoring: { permissionGroupsList = [] },
    } = this.props;
    const {
      createEnterpriceVisible,
      editGroupVisible,
      modifyGroupVisible,
      selectedRows,
      // selectedRowKeys,
      monitorGroupId,
      showAllTab,
    } = this.state;
    /* 租户管理员角色才可操作“全部”页签 */
    const allMonitor = showAllTab
      ? [
          {
            monitorGroupId: 'all',
            monitorGroupCode: 'all',
            monitorGroupName: intl.get(`sslm.riskMonitoring.view.message.allGroup`).d('全部'),
          },
        ]
      : [];
    const createEnterpriceProps = {
      createEnterpriceVisible,
      onClose: this.handleOpenControlEnterprise,
      onSearchMonitoring: this.handleSearchMonitoring,
      queryGroupsList: this.queryGroupsList,
    };
    const editGroupProps = {
      editGroupVisible,
      onClose: this.handleEditGroups,
      queryGroupsList: this.queryPermissionGroups,
    };
    const modifyGroupProps = {
      selectedRows,
      modifyGroupVisible,
      onCancel: this.handleModifyGroup,
    };

    const hiddenTabs = isEmpty(allMonitor) && isEmpty(permissionGroupsList);
    return (
      <React.Fragment>
        {!hiddenTabs && (
          <Tabs activeKey={monitorGroupId} animated={false} onChange={this.handleTabsChange}>
            {[...allMonitor, ...permissionGroupsList].map(g => {
              return (
                <Tabs.TabPane tab={g.monitorGroupName} key={`${g.monitorGroupId}`}>
                  {this.renderForm(g.monitorGroupId)}
                  {this.renderAllGroup(g.monitorGroupId)}
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        )}
        {editGroupVisible && <EditGroupDrawer {...editGroupProps} />}
        {modifyGroupVisible && <ModifyGroupModel {...modifyGroupProps} />}
        {createEnterpriceVisible && <CreateEnterpriceDrawer {...createEnterpriceProps} />}
      </React.Fragment>
    );
  }
}
