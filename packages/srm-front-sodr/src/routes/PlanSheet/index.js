/*
 * PlanSheet - 计划单
 * @date: 2018/10/13 11:47:39
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Tabs, Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { getUserOrganizationId, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SPUC } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import CreateList from './List'; // 创建列表
import UpdateList from './DetailSearch';
import OperationRecord from '../components/PlantOperationRecord/OperationRecord';

const { TabPane } = Tabs;

/**
 * 计划单
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} planSheet - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: [
    'sodr.planSheet',
    'sodr.orderApproval',
    'sodr.common',
    'entity.supplier',
    'entity.company',
    'entity.order',
    'entity.customer',
    'entity.business',
    'entity.organization',
    'entity.item',
  ],
})
@connect(({ loading, planSheet }) => ({
  loadingList: loading.effects['planSheet/queryPlanCreateList'],
  loadingDetailList: loading.effects['planSheet/queryPlanUpdateList'],
  planSheet,
}))
export default class PlanSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // : 'list',
      tenantId: getCurrentOrganizationId(),
      supplierTenantId: getUserOrganizationId(),
      selectedCreateRowKeys: [], // 创建计划单 key,
      selectedUpdateRowKeys: [], // 修改计划单 key,
      operatingVisible: false, // 操作记录模态框
      operatingPlanHeaderId: null, // 计划单主键id
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // 值集查询
    dispatch({
      type: 'planSheet/init',
    });
    // this.handleSearch();
  }

  /**
   * 查询列表
   * @param {Object} fields
   * @param {*} otherParams
   */
  @Bind()
  handleSearch(page = {}, key) {
    const radioTab = key || this.props.planSheet.radioTab;
    if (radioTab === 'list') {
      const fields = this.listForm ? this.listForm.searchForm.props.form.getFieldsValue() : {};
      const handleFormValues = this.handleFormQuery(fields);
      this.handleSearchList({
        page,
        ...handleFormValues,
      });
      this.setState({
        selectedCreateRowKeys: [],
      });
    } else {
      const fields = this.detailForm ? this.detailForm.searchForm.props.form.getFieldsValue() : {};
      const handleFormValues = this.handleFormQuery(fields);
      this.handleSearchDetailList({
        page,
        ...handleFormValues,
      });
      this.setState({
        selectedUpdateRowKeys: [],
      });
    }
  }

  /**
   * 查询创建列表
   * @param fields
   */
  @Bind()
  getQueryFields() {
    const currentForm = this.props.planSheet.radioTab === 'list' ? this.listForm : this.detailForm;
    const fields = currentForm ? currentForm.searchForm.props.form.getFieldsValue() : {};
    const handleFormValues = this.handleFormQuery(fields) || {};
    return handleFormValues;
  }

  /**
   * 查询创建列表
   * @param fields
   */
  @Bind()
  handleSearchList(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'planSheet/queryPlanCreateList',
      payload: fields,
    });
  }

  /**
   * 查询维护列表
   */
  @Bind()
  handleSearchDetailList(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'planSheet/queryPlanUpdateList',
      payload: { ...fields },
    });
  }

  /**
   * 选中行创建计划单改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleCreateListRowSelectChange(newSelectedRowKeys) {
    this.setState({ selectedCreateRowKeys: newSelectedRowKeys });
  }

  /**
   * 明细选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleUpdateSelectChange(selectedRowKeys) {
    this.setState({ selectedUpdateRowKeys: selectedRowKeys });
  }

  @Bind()
  handleTabsChange(key) {
    const {
      planSheet: { planCreateListPagination = {}, planUpdateListPagination = {} },
      dispatch,
    } = this.props;
    dispatch({
      type: 'planSheet/updateState',
      payload: {
        radioTab: key === 'list' ? 'list' : 'detail',
      },
    });
    this.handleSearch(key === 'list' ? planCreateListPagination : planUpdateListPagination, key);
  }

  /**
   *  创建计划单
   */
  @Bind()
  handleCreatePlan() {
    const { selectedCreateRowKeys } = this.state;
    const ids = selectedCreateRowKeys.join(',');
    const { dispatch, history } = this.props;
    dispatch({
      type: 'planSheet/createPlan',
      payload: ids,
    }).then((res) => {
      if (res) {
        notification.success();
        history.push({
          pathname: `/sodr/plan-sheet/detail/${res.planHeaderId}`,
        });
      }
    });
  }

  /**
   *发布计划单
   */
  @Bind()
  handleRelease() {
    const { dispatch } = this.props;
    const { selectedUpdateRowKeys = [] } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.planSheet.view.message.title.confirmReleasePlan`)
        .d('是否确认发布计划单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'planSheet/releasePlan',
          payload: selectedUpdateRowKeys,
        }).then((res) => {
          if (res) {
            notification.success();
            this.handleSearch();
          }
        });
      },
    });
  }

  /**
   *删除计划单
   */
  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedUpdateRowKeys = [] } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.planSheet.view.message.title.confirmDeletePlan`)
        .d('是否确认删除计划单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'planSheet/deletePlan',
          payload: selectedUpdateRowKeys,
        }).then((res) => {
          if (res) {
            notification.success();
            this.handleSearch();
          }
        });
      },
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const {
      planSheet: { radioTab },
    } = this.props;
    const dealTime = {};
    let timeArray = [];
    if (radioTab === 'list') {
      timeArray = ['needByDateStart', 'needByDateEnd'];
    } else {
      timeArray = ['creationDateStart', 'creationDateEnd'];
    }
    timeArray.forEach((item) => {
      if (item === 'needByDateEnd' || item === 'creationDateEnd') {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
      } else {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
      }
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * 跳转详情
   */
  @Bind()
  onJumpDetail(record) {
    const { history } = this.props;
    history.push({
      pathname: `/sodr/plan-sheet/detail/${record.planHeaderId}`,
    });
  }

  /**
   * 操作记录
   */
  @Bind()
  handleOperating(flag, record) {
    if (flag) {
      this.setState({
        operatingVisible: true,
        operatingPlanHeaderId: record.planHeaderId,
      });
    } else {
      this.setState({
        operatingVisible: false,
      });
    }
  }

  render() {
    const {
      // radioTab,
      tenantId,
      supplierTenantId,
      selectedCreateRowKeys,
      selectedUpdateRowKeys,
      operatingVisible,
      operatingPlanHeaderId,
    } = this.state;
    const {
      planSheet: {
        radioTab,
        enumMap = {},
        planCreateList = [],
        planCreateListPagination = {},
        planUpdateList = [],
        planUpdateListPagination = {},
      },
      loadingList,
      dispatch,
      loadingDetailList,
    } = this.props;
    const listProps = {
      enumMap,
      dispatch,
      rowSelection: {
        selectedRowKeys: selectedCreateRowKeys,
        onChange: this.handleCreateListRowSelectChange,
      },
      onSearch: this.handleSearch,
      loading: loadingList,
      dataSource: planCreateList,
      pagination: planCreateListPagination,
      onRef: (node) => {
        this.listForm = node;
      },
    };
    const detailSearchProps = {
      enumMap,
      dispatch,
      handleOperating: this.handleOperating,
      onJumpDetail: this.onJumpDetail,
      rowSelection: {
        selectedRowKeys: selectedUpdateRowKeys,
        onChange: this.handleUpdateSelectChange,
      },
      tenantId,
      supplierTenantId,
      loading: loadingDetailList,
      dataSource: planUpdateList,
      pagination: planUpdateListPagination,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.detailForm = node;
      },
    };
    const operationRecordProps = {
      dispatch,
      id: operatingPlanHeaderId,
      // loading: queryPlanOperateLoading,
      visible: operatingVisible,
      hideModal: this.handleOperating,
    };

    const primaryExportBtnProps = {
      icon: 'export',
    };
    const listCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedCreateRowKeys) && isEmpty(selectedCreateRowKeys),
    };
    const updateListCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedUpdateRowKeys) && isEmpty(selectedUpdateRowKeys),
    };
    const poLineLocationId = selectedCreateRowKeys.join(',');
    const planHeaderId = selectedUpdateRowKeys.join(',');
    return (
      <Fragment>
        <Header title={intl.get(`sodr.planSheet.view.message.title.create`).d('计划单创建')}>
          {radioTab === 'list' ? (
            <Fragment>
              <Button
                type="primary"
                icon="plus"
                onClick={this.handleCreatePlan}
                disabled={isArray(selectedCreateRowKeys) && isEmpty(selectedCreateRowKeys)}
              >
                {intl.get('sodr.common.button.planSheet.create').d('创建计划单')}
              </Button>
              <ExcelExportPro
                buttonText={
                  selectedCreateRowKeys.length
                    ? intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')
                    : intl.get(`hzero.common.button.newExport`).d('(新)导出')
                }
                templateCode="SPUC_SCHEDULE_MAINTAIN_EXPORT"
                otherButtonProps={{
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code: 'srm.po-admin.plan.scheduling.creation.ps.buttons.newexport',
                      type: 'c7n-pro',
                      meaning: '计划单创建-新版导出',
                    },
                  ],
                }}
                queryParams={
                  selectedCreateRowKeys.length ? { poLineLocationId } : this.getQueryFields()
                }
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/schedule/create-query/export/new-module`}
              />
              <ExcelExport
                otherButtonProps={primaryExportBtnProps}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/schedule/create-query/export`}
              />
              <ExcelExport
                buttonText={intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出')}
                otherButtonProps={listCheckExportBtnProps}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/schedule/create-query/export`}
                queryParams={{ poLineLocationId }}
              />
            </Fragment>
          ) : (
            <Fragment>
              <Button
                type="primary"
                icon="release"
                onClick={this.handleRelease}
                disabled={isArray(selectedUpdateRowKeys) && isEmpty(selectedUpdateRowKeys)}
              >
                {intl.get('sodr.common.button.planSheet.release').d('发布计划单')}
              </Button>
              <Button
                icon="delete"
                onClick={this.handleDelete}
                disabled={isArray(selectedUpdateRowKeys) && isEmpty(selectedUpdateRowKeys)}
              >
                {intl.get('sodr.common.button.planSheet.delete').d('删除计划单')}
              </Button>
              <ExcelExportPro
                buttonText={
                  selectedUpdateRowKeys.length
                    ? intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')
                    : intl.get(`hzero.common.button.newExport`).d('(新)导出')
                }
                templateCode="SPUC_SCHEDULE_MAINTAIN_EXPORT"
                otherButtonProps={{
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code: 'srm.po-admin.plan.scheduling.creation.ps.buttons.updatenewexport',
                      type: 'c7n-pro',
                      meaning: '计划单创建-更新-新版导出',
                    },
                  ],
                }}
                queryParams={
                  selectedUpdateRowKeys.length ? { planHeaderId } : this.getQueryFields()
                }
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/schedule/header/export`}
              />
              <ExcelExport
                otherButtonProps={primaryExportBtnProps}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/schedule/header/export`}
              />
              <ExcelExport
                buttonText={intl.get(`sodr.common.view.tab.checkExport`).d('勾选导出')}
                otherButtonProps={updateListCheckExportBtnProps}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/schedule/header/export`}
                queryParams={{ planHeaderId }}
              />
            </Fragment>
          )}
        </Header>
        <Content>
          <Tabs activeKey={radioTab} onChange={this.handleTabsChange} animated={false}>
            <TabPane
              tab={intl.get(`sodr.planSheet.view.tab.list.create`).d('计划单创建')}
              key="list"
            >
              <CreateList {...listProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`sodr.common.view.tab.detail.update`).d('计划单维护')}
              key="detail"
            >
              <UpdateList {...detailSearchProps} />
            </TabPane>
          </Tabs>
        </Content>
        {operatingVisible && <OperationRecord {...operationRecordProps} />}
      </Fragment>
    );
  }
}
