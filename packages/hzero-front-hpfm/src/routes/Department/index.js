/**
 * Deparment - 公司分配部门（部门维度）
 * @date: 2018-6-20
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
// import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isUndefined, isNaN } from 'lodash';

import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import notification from 'utils/notification';
import { HZERO_PLATFORM } from 'utils/config';
// import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import DisplayModal from './DisplayModal';
import FilterForm from './FilterForm';
import DataTable from './DataTable';
import Drawer from './Drawer';
import CreateDrawer from './CreateDrawer';

/**
 * 部门维护组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} department - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {!boolean} saveLoading - 数据保存是否完成
 * @reactProps {!boolean} editLoading - 数据更新是否完成
 * @reactProps {!String} tenantId - 租户ID
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

// @WithCustomize({
//   unitCode: ['SPFM.ORGANIZATION.PAGE_DEPLIST'],
// })
@withCustomize({
  unitCode: ['SPFM.ORGANIZATION.PAGE_DEPFORM', 'SPFM.ORGANIZATION.DEP_TOPBUTTONS'],
})
@connect(({ department, loading }) => ({
  department,
  loading: loading.effects['department/searchDepartmentData'],
  saveLoading: loading.effects['department/saveAddData'],
  editLoading: loading.effects['department/saveEditData'],
  fetchCostLoading: loading.effects['department/fetchCostCenterData'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'hpfm.department',
    'hpfm.common',
    'entity.company',
    'entity.department',
    'hitf.common',
    'smde.modelDesigner',
  ],
})
export default class Department extends Component {
  form;

  /**
   * state初始化
   * @param {object} props 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {
      createDrawerVisible: false,
      createDrawerRecord: {},
      sortType: 'asc',
      sortColumn: 'orderSeq',
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { dispatch, match, tenantId } = this.props;
    dispatch({
      type: 'department/updateState',
      payload: {
        companyCode: '',
        companyName: '',
        renderTree: [],
        pathMap: {},
      },
    });
    this.handleSearch();
    dispatch({
      type: 'department/fetchDepartmentInfo',
      payload: {
        tenantId,
        unitId: match.params.companyId,
        customizeUnitCode: 'SPFM.ORGANIZATION.PAGE_DEPLIST',
      },
    });
  }

  /**
   * 根据节点路径，在树形结构树中的对应节点添加或替换children属性
   * @param {Array} collections 树形结构树
   * @param {Array} cursorList 节点路径
   * @param {Array} data  追加或替换的children数据
   * @returns {Array} 新的树形结构
   */
  findAndSetNodeProps(collections, cursorList = [], data) {
    let newCursorList = cursorList;
    const cursor = newCursorList[0];
    return collections.map((n) => {
      const m = n;
      if (m.unitId === cursor) {
        if (newCursorList[1]) {
          if (!m.children) {
            m.children = [];
          }
          newCursorList = newCursorList.filter((o) => newCursorList.indexOf(o) !== 0);
          m.children = this.findAndSetNodeProps(m.children, newCursorList, data);
        } else {
          m.children = [...data];
        }
        if (m.children.length === 0) {
          const { children, ...others } = m;
          return { ...others };
        } else {
          return m;
        }
      }
      return m;
    });
  }

  /**
   * 根据节点路径，在树形结构树中的对应节点
   * @param {Array} collections 树形结构树
   * @param {Array} cursorList 节点路径
   * @param {String} keyName 主键名称
   * @returns {Object} 节点信息
   */
  findNode(collection, cursorList = [], keyName) {
    let newCursorList = cursorList;
    const cursor = newCursorList[0];
    for (let i = 0; i < collection.length; i++) {
      if (collection[i][keyName] === cursor) {
        if (newCursorList[1]) {
          newCursorList = newCursorList.slice(1);
          return this.findNode(collection[i].children, newCursorList, keyName);
        }
        return collection[i];
      }
    }
  }

  /**
   * 查询框-查询数据
   * 根据输入框的内容进行查询，查询结果直接替换内容树
   * @param {Object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId, match } = this.props;
    const { sortType, sortColumn } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'department/searchDepartmentData',
      payload: {
        tenantId,
        unitCompanyId: match.params.companyId,
        customizeUnitCode: 'SPFM.ORGANIZATION.PAGE_DEPLIST',
        ...fieldValues,
        ...fields,
        sort: sortType
          ? {
              columnKey: sortColumn,
              field: sortColumn,
              order: sortType,
            }
          : {},
      },
    });
  }

  // 查询成本中心的数据
  @Bind()
  queryCostCenterData(params) {
    const { dispatch } = this.props;
    dispatch({
      type: `department/fetchCostCenterData`,
      payload: { ...params },
    });
  }

  @Bind()
  handleSortColumn(sortColumn, sortType) {
    this.setState(
      {
        sortColumn,
        sortType,
      },
      () => {
        this.handleSearch();
      }
    );
  }

  /**
   * 添加部门
   */
  @Bind()
  handleAddUnit() {
    const { match, tenantId } = this.props;
    this.setState({
      createDrawerVisible: true,
      createDrawerRecord: {
        tenantId,
        enabledFlag: 1,
        supervisorFlag: 0,
        unitTypeCode: 'D',
        unitCompanyId: match.params.companyId,
        parentUnitId: match.params.companyId,
      },
    });
  }

  /**
   * 顶部保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      tenantId,
      department: { expandedRowKeys = [], renderTree = [] },
    } = this.props;
    const params = getEditTableData(renderTree, ['children', 'unitId']);
    if (Array.isArray(params) && params.length !== 0) {
      dispatch({
        type: 'department/saveAddData',
        payload: {
          tenantId,
          data: params,
          customizeUnitCode: 'SPFM.ORGANIZATION.PAGE_DEPFORM',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearch({ expandedRowKeys, addData: {}, expandFlag: true });
        }
      });
    }
  }

  /**
   * 展开全部
   * 将页面展示的数据进行展开
   */
  @Bind()
  handleExpand() {
    const {
      dispatch,
      department: { pathMap = {} },
    } = this.props;
    dispatch({
      type: 'department/updateState',
      payload: {
        expandedRowKeys: Object.keys(pathMap).map((item) => (isNaN(+item) ? item : +item)),
      },
    });
  }

  /**
   * 收起全部
   * 页面顶部收起全部按钮，将内容树收起
   */
  @Bind()
  handleShrink() {
    const { dispatch } = this.props;
    dispatch({
      type: 'department/updateState',
      payload: { expandedRowKeys: [] },
    });
  }

  /**
   * 添加下级部门
   * @param {Object} record  操作对象
   */
  @Bind()
  handleAddLine(record = {}) {
    const { match, tenantId } = this.props;
    this.setState({
      createDrawerVisible: true,
      createDrawerRecord: {
        tenantId,
        enabledFlag: 1,
        supervisorFlag: 0,
        unitTypeCode: 'D',
        unitCompanyId: match.params.companyId,
        parentUnitId: record.unitId,
        parentUnitName: record.unitName,
      },
    });
  }

  /**
   * 新增部门-清除
   * @param {Object} record 新增部门
   */
  @Bind()
  handleCleanLine(record = {}) {
    const {
      dispatch,
      match,
      department: { renderTree = [], addData = {}, pathMap = {} },
    } = this.props;
    delete addData[record.unitId];
    let newRenderTree = [];
    if (record.parentUnitId && record.parentUnitId !== match.params.companyId) {
      // 找到父节点的children, 更新children数组
      const parent = this.findNode(renderTree, pathMap[record.parentUnitId], 'unitId');
      const newChildren = parent.children.filter((item) => item.unitId !== record.unitId);
      newRenderTree = this.findAndSetNodeProps(
        renderTree,
        pathMap[record.parentUnitId],
        newChildren
      );
    } else {
      newRenderTree = renderTree.filter((item) => item.unitId !== record.unitId);
    }
    dispatch({
      type: 'department/updateState',
      payload: {
        renderTree: newRenderTree,
        addData: {
          ...addData,
        },
      },
    });
  }

  /**
   * 禁用特定部门，同时禁用所有下属部门
   * @param {Object} record 操作对象
   */
  @Bind()
  handleForbidLine(record = {}) {
    const {
      dispatch,
      tenantId,
      department: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'department/forbidLine',
      payload: {
        tenantId,
        unitId: record.unitId,
        objectVersionNumber: record.objectVersionNumber,
        _token: record._token,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch({ expandedRowKeys, expandFlag: true });
      }
    });
  }

  /**
   * 启用部门，同时启用所有下属组织
   * @param {Object} record 操作对象
   */
  @Bind()
  handleEnabledLine(record = {}) {
    const {
      dispatch,
      tenantId,
      department: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'department/enabledLine',
      payload: {
        tenantId,
        unitId: record.unitId,
        objectVersionNumber: record.objectVersionNumber,
        _token: record._token,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch({ expandedRowKeys, expandFlag: true });
      }
    });
  }

  /**
   * 点击展开图标，展开行
   *  @param {Boolean} isExpand 展开标记
   *  @param {Object} record 组织行信息
   */
  @Bind()
  handleExpandSubLine(isExpand, record = {}) {
    const {
      dispatch,
      department: { expandedRowKeys = [] },
    } = this.props;
    const rowKeys = isExpand
      ? [...expandedRowKeys, record.unitId]
      : expandedRowKeys.filter((item) => item !== record.unitId);
    dispatch({
      type: 'department/updateState',
      payload: {
        expandedRowKeys: [...rowKeys],
      },
    });
  }

  /**
   * 分配岗位
   * 进行岗位分配，跳转到下一级页面
   * @param {*} record 操作对象
   */
  @Bind()
  handleGotoSubGrade(record = {}) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hpfm/hr/org/post/${record.unitId}`,
      })
    );
  }

  /**
   * 保存 - 单条部门行数据修改后保存
   * @param {Object} values 修改后的数据
   */
  @Bind()
  handleDrawerOk(values) {
    const {
      dispatch,
      tenantId,
      department: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'department/saveEditData',
      payload: { values, tenantId, customizeUnitCode: 'SPFM.ORGANIZATION.PAGE_DEPFORM' },
    }).then((res) => {
      if (res) {
        this.setState({ activeDepData: {}, drawerVisible: false });
        notification.success();
        this.handleSearch({ expandedRowKeys, expandFlag: true });
      }
    });
  }

  @Bind()
  handleCreateDrawerOk(params) {
    const {
      dispatch,
      tenantId,
      department: { expandedRowKeys = [] },
    } = this.props;
    dispatch({
      type: 'department/saveAddData',
      payload: {
        tenantId,
        data: params,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          createDrawerRecord: {},
          createDrawerVisible: false,
        });
        notification.success();
        this.handleSearch({ expandedRowKeys, addData: {}, expandFlag: true });
      }
    });
  }

  /**
   * 编辑侧滑款隐藏
   */
  @Bind()
  handleDrawerCancel() {
    this.setState({
      drawerVisible: false,
      activeDepData: {},
    });
  }

  @Bind()
  handleCreateDrawerCancel() {
    this.setState({
      createDrawerVisible: false,
      createDrawerRecord: {},
    });
  }

  /**
   * 更新编辑部门信息
   * @param {Object} record 操作对象
   */
  @Bind()
  handleActiveLine(record) {
    this.setState({
      drawerVisible: true,
      activeDepData: record,
    });
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询lov
   */
  @Bind()
  handleFecthRef(ref = {}) {
    this.costForm = (ref.props || {}).form;
  }

  @Bind()
  handleCostSearch() {
    const { displayArr = [] } = this.state;
    const fieldValues = isUndefined(this.costForm)
      ? {}
      : filterNullValueObject(this.costForm.getFieldsValue());
    const filterArr = displayArr.filter((item) => {
      return (
        item.costCode.includes(fieldValues.costCode || '') &&
        item.costName.includes(fieldValues.costName || '')
      );
    });
    this.setState({
      filterArr,
    });
  }

  /**
   * 获取 保存按钮是否应该禁用
   */
  @Bind()
  getSaveBtnDisabled() {
    const {
      department: { renderTree = [] },
    } = this.props;
    const travel = [...renderTree];
    while (travel.length !== 0) {
      const item = travel.pop();
      if (item._status === 'create') {
        // 只要有新建的数据 那么就不需要禁用 保存
        return false;
      }
      if (item.children) {
        travel.push(...item.children);
      }
    }
    return true;
  }

  @Bind()
  handleCancelModal() {
    this.setState({
      visable: false,
      filterArr: [],
    });
  }

  @Bind()
  handleCostView(_, displayArr) {
    this.setState({
      displayArr,
      filterArr: displayArr,
      visable: true,
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { match } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    return { ...filterValues, unitTypeCode: 'D', unitCompanyId: match.params.companyId };
  }

  @Bind()
  renderTopButtons() {
    const { tenantId } = this.props;

    const otherButtonProps = {
      type: 'default',
      icon: 'download',
    };

    const buttons = [
      {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          icon: 'plus',
          onClick: () => this.handleAddUnit(),
        },
      },
      {
        name: 'expandAll',
        child: intl.get('hzero.common.button.expandAll').d('全部展开'),
        btnProps: {
          icon: 'down',
          onClick: () => this.handleExpand(),
        },
      },
      {
        name: 'collapseAll',
        child: intl.get('hzero.common.button.collapseAll').d('全部收起'),
        btnProps: {
          icon: 'up',
          onClick: () => this.handleShrink(),
        },
      },
      {
        name: 'newExport',
        btnComp: ExcelExportPro,
        btnProps: {
          templateCode: 'HPFM_UNIT_EXPORT',
          requestUrl: `${HZERO_PLATFORM}/v1/${tenantId}/units/export`,
          queryParams: this.handleGetFormValue(),
          buttonText: intl.get('hzero.common.export.new').d('(新)导出'),
          permissionList: [
            {
              code: 'hzero.organization.hr.ps.new.unit-position.list.export',
              type: 'button',
            },
          ],
          otherButtonProps,
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `${HZERO_PLATFORM}/v1/${tenantId}/units/export`,
          queryParams: this.handleGetFormValue(),
          permissionList: [
            {
              code: 'hzero.organization.hr.ps.unit-position.list.export',
              type: 'button',
            },
          ],
          otherButtonProps,
        },
      },
    ];

    return buttons;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      saveLoading,
      editLoading,
      department = {},
      fetchCostLoading,
      tenantId,
      customizeVTable,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
    } = this.props;
    const {
      companyCode,
      companyName,
      renderTree = [],
      expandedRowKeys = [],
      costCenterData = {},
    } = department;
    const {
      activeDepData = {},
      drawerVisible = false,
      visable = false,
      filterArr = [],
      createDrawerVisible = false,
      createDrawerRecord = {},
      sortType,
      sortColumn,
    } = this.state;
    const filterProps = {
      companyCode,
      companyName,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      expandedRowKeys,
      loading,
      dataSource: renderTree,
      onAddLine: this.handleAddLine,
      onForbidLine: this.handleForbidLine,
      onEnabledLine: this.handleEnabledLine,
      onClearLine: this.handleCleanLine,
      onShowSubLine: this.handleExpandSubLine,
      gotoSubGrade: this.handleGotoSubGrade,
      onEdit: this.handleActiveLine,
      onQueryCostCenterData: this.queryCostCenterData,
      costCenterData,
      fetchCostLoading,
      customizeVTable,
      customizeTable,
      handleCostView: this.handleCostView,
      sortType,
      sortColumn,
      onSortColumn: this.handleSortColumn,
    };
    const drawerProps = {
      costCenterData,
      fetchCostLoading,
      onQueryCostCenterData: this.queryCostCenterData,
      onCancel: this.handleDrawerCancel,
      onOk: this.handleDrawerOk,
      visible: drawerVisible,
      anchor: 'right',
      customizeForm,
      title: intl.get('hpfm.department.view.message.edit').d('部门信息修改'),
      itemData: activeDepData,
      loading: editLoading || loading,
    };
    const createDrawerProps = {
      tenantId,
      costCenterData,
      fetchCostLoading,
      onQueryCostCenterData: this.queryCostCenterData,
      onCancel: this.handleCreateDrawerCancel,
      onOk: this.handleCreateDrawerOk,
      anchor: 'right',
      title: intl.get('hpfm.department.view.message.create').d('新增部门'),
      itemData: createDrawerRecord,
      loading: saveLoading || loading,
      customizeForm,
    };
    const DisplayModalProps = {
      visable,
      data: filterArr,
      onRef: this.handleFecthRef,
      handleCancelModal: this.handleCancelModal,
      handleSearch: this.handleCostSearch,
    };

    return (
      <Fragment>
        <Header
          title={intl.get('hpfm.department.view.message.title').d('公司分配部门')}
          backPath="/hpfm/hr/org/company"
        >
          {customizeBtnGroup(
            { code: 'SPFM.ORGANIZATION.DEP_TOPBUTTONS', pro: true },
            <DynamicButtons buttons={this.renderTopButtons()} />
          )}
          {/* <Button
            icon="save"
            type="primary"
            onClick={this.handleSave}
            disabled={editLoading || loading || this.getSaveBtnDisabled()}
            loading={saveLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button> */}
          {/* <Button icon="plus" onClick={this.handleAddUnit}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="down" onClick={this.handleExpand}>
            {intl.get('hzero.common.button.expandAll').d('全部展开')}
          </Button>
          <Button icon="up" onClick={this.handleShrink}>
            {intl.get('hzero.common.button.collapseAll').d('全部收起')}
          </Button>
          <ExcelExport
            requestUrl={`${HZERO_PLATFORM}/v1/${tenantId}/units/export`}
            queryParams={this.handleGetFormValue()}
            otherButtonProps={otherButtonProps}
          /> */}
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <DataTable {...listProps} />
          <Drawer {...drawerProps} />
          {createDrawerVisible && <CreateDrawer {...createDrawerProps} />}
          <DisplayModal {...DisplayModalProps} />
        </Content>
      </Fragment>
    );
  }
}
