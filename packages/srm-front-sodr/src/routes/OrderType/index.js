/*
 * orderTypeOrg - 订单类型定义
 * @date: 2018/08/07 14:45:33
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Tabs, Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import cuxRemote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getEditTableData,
  getResponse,
} from 'utils/utils';
import { totalRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import notification from 'utils/notification';
import { SRM_SPRM, SRM_SRPM, SRM_SPUC, SRM_SIEC } from '_utils/config';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
import ListForm from './ListForm';
import DemandTable from './DemandTable';
import DemandList from './DemandListForm';
import DemandForm from './DemandForm';
import RpTypeTable from './RpTypeTable';
import RpTypeListForm from './RpTypeListForm';
import RpTypeForm from './RpTypeForm';
import ProjectForm from './ProjectForm';
import ProjectTable from './ProjectTable';
import ProjectModal from './ProjectModal';
// import LineTypeForm from './LineTypeForm';
// import LineTypeTable from './LineTypeTable';
// import LineTypeListForm from './LineTypeListForm';
import AccountForm from './AccountForm';
import AccountTable from './AccountTable';
import AccountListForm from './AccountListForm';

const { TabPane } = Tabs;

const tenantId = getCurrentOrganizationId();
/**
 * 订单类型定义
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} orderTypeOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, orderTypeOrg }) => ({
  loading: loading.effects['orderTypeOrg/queryOrderTypeList'],
  demandLoading: loading.effects['orderTypeOrg/queryDemandTypeList'],
  rpLoading: loading.effects['orderTypeOrg/queryRpTypeList'],
  saving: loading.effects['orderTypeOrg/addOrderType'],
  proSaving: loading.effects['orderTypeOrg/saveProType'],
  proLoading: loading.effects['orderTypeOrg/queryProTypeList'],
  demandSaving: loading.effects['orderTypeOrg/addDemandType'],
  RpSaving: loading.effects['orderTypeOrg/saveRpType'],
  queryLineTypeListLoading: loading.effects['orderTypeOrg/queryLineTypeList'],
  addLineTypeLoading: loading.effects['orderTypeOrg/addLineType'],
  queryAccountListLoading: loading.effects['orderTypeOrg/queryAccountList'],
  saveAccountLoading: loading.effects['orderTypeOrg/saveAccount'],
  queryFielsListLoading: loading.effects['orderTypeOrg/queryFielsList'],
  saveFielsListLoading: loading.effects['orderTypeOrg/saveFielsList'],
  fetchCategoryLoading: loading.effects['orderTypeOrg/queryCategory'],
  orderTypeOrg,
}))
@formatterCollections({
  code: ['sodr.orderTypeOrg', 'sodr.orderType', 'entity.order', 'sodr.common', 'hzero.hexl'],
})
@cuxRemote(
  {
    code: 'SODR_ORDER_TYPE_REMOTE',
    name: 'remote',
  },
  {
    process: {
      handleCuxCurrentRowSelect: undefined,
      handleCuxRowSelection: undefined,
      cuxDemandTypeCategoryQSetting: undefined, // 采购类型维护-申请类型维护-弹窗-品类lov的查询。具体格式[{name，label，type, lovCode}]
      cuxDemandTypeCategoryTList: undefined, // 采购类型维护-申请类型维护-弹窗-品类lov的表格cols
    },
  }
)
@withCustomize({
  unitCode: [
    'SODR.ORDER_TYPE.LIST.ORDER_GRID',
    'SODR.ORDER_TYPE.LIST.ORDER_INQUIRY',
    'SODR.ORDER_TYPE.LIST.ORDER_EDIT',
    'SODR.PR_TYPE.LIST',
    'SODR.PR_TYPE.SEARCH',
    'SODR.PR_TYPE.EDIT_FROM',
    'SODR.PROJECT_TYPE.EDIT_FROM',
    'SODR.PROJECT_TYPE.SEARCH',
    'SODR.PROJECT_TYPE.LIST',
  ],
})
export default class orderTypeOrg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalDemandVisible: false,
      // lineTypeVisible: false,
      modalAccountVisible: false,
      editValue: {},
      activeKey: 'rpmant',
      modalRpVisible: false,
      modalProjectVisible: false,
    };
  }

  listForm;

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderTypeOrg/init',
    });
    this.handleSearch();
    this.handleSearchDemand();
    this.handleSearchLineType();
    this.handleSearchAccount();
    this.handleSearchRpTypeList();
    this.handleSearchProjectTypeList();
  }

  /**
   * 新建订单类型
   */
  @Bind()
  handleCreateHeader() {
    this.setState(
      {
        editValue: { sourceCode: 'SRM' },
      },
      () => this.handleModalVisible(true)
    );
  }

  /**
   * 新建需求类型维护
   */
  @Bind()
  handleDemandCreateHeader() {
    this.setState(
      {
        editValue: { sourceCode: 'SRM' },
      },
      () => this.handleDemandModalVisible(true)
    );
  }

  @Bind()
  handleQueryDemandType({ prTypeId }) {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderTypeOrg/queryDemandTypeDetail',
      payload: {
        prTypeId,
        customizeUnitCode: 'SODR.PR_TYPE.EDIT_FROM',
      },
    }).then((res) => {
      if (res && !res.failed) {
        const { prTypeCategoryList = [], prTypeRoleList = [], prTypeCatalogList = [] } = res;
        const roleIds = prTypeRoleList.map((ele) => ele.roleId);
        const catalogIds = prTypeCatalogList.map((ele) => ele.mappingId);
        this.setState(
          {
            editValue: {
              ...res,
              selectDateRow: prTypeCategoryList,
              roleIds,
              roleNames: prTypeRoleList ? prTypeRoleList.map((ele) => ele.roleName).join(',') : '',
              roles: prTypeRoleList
                ? prTypeRoleList.map((ele) => ({ name: ele.roleName, id: ele.roleId }))
                : [],
              catalogIds,
              catalogNames: prTypeCatalogList
                ? prTypeCatalogList.map((ele) => ele.mappingName).join(',')
                : '',
              catalogs: prTypeCatalogList
                ? prTypeCatalogList.map((ele) => ({
                    catalogName: ele.mappingName,
                    catalogId: ele.mappingId,
                  }))
                : [],
            },
          },
          () => this.handleDemandModalVisible(true)
        );
      } else {
        notification.error({ message: res?.message });
      }
    });
  }

  // 项目类型-单条行查询
  @Bind()
  handleQueryProType({ prTypeId }) {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderTypeOrg/queryProTypeDetail',
      payload: {
        prTypeId,
        customizeUnitCode: 'SODR.PROJECT_TYPE.EDIT_FROM',
      },
    }).then((res) => {
      if (res && !res.failed) {
        this.setState(
          {
            editValue: { ...res },
          },
          () => this.handleProModalVisible()
        );
      } else {
        notification.error({ message: res.message });
      }
    });
  }

  /**
   * 新建需求类型维护
   */
  @Bind()
  handleRpCreateHeader() {
    this.setState(
      {
        editValue: { sourceCode: 'SRM' },
      },
      () => this.handleARpModalVisible(true)
    );
  }

  /**
   * 新建项目类型维护
   */
  @Bind()
  handleProCreateHeader() {
    this.setState(
      {
        editValue: { sourceCode: 'SRM' },
      },
      () => this.handleProModalVisible(true)
    );
  }

  /**
   * 新建采购行类型维护
   */
  @Bind()
  handleLineTypeCreateHeader() {
    this.setState(
      {
        editValue: { sourceCode: 'SRM' },
      },
      () => this.handleLineTypeModalVisible(true)
    );
  }

  /**
   * 新建账户分配类别
   */
  @Bind()
  handleAccountCreateHeader() {
    this.setState(
      {
        editValue: { sourceCode: 'SRM' },
      },
      () => this.handleAccountModalVisible(true)
    );
  }

  /**
   * tab切换的回调
   */
  @Bind()
  handleTabsChange(activeKey) {
    this.setState({ activeKey });
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  demandHideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleDemandModalVisible(false);
    }
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  rpHideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleARpModalVisible(false);
    }
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  lineTypeHideModal() {
    this.handleLineTypeModalVisible(false);
  }

  /**
   * 隐藏模态框
   */
  @Bind()
  accountHideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleAccountModalVisible(false);
    }
  }

  /**
   * 改变当前模态框显示状态
   * @param {boolean} flag
   */
  @Bind()
  handleModalVisible(flag) {
    this.setState({
      modalVisible: !!flag,
    });
  }

  /**
   * 改变需求类型模态框显示状态
   * @param {boolean} flag
   */
  @Bind()
  handleDemandModalVisible(flag) {
    this.setState({
      modalDemandVisible: !!flag,
    });
  }

  /**
   * 改变采购行类型模态框显示状态
   * @param {boolean} flag
   */
  // @Bind()
  // handleLineTypeModalVisible(flag) {
  //   this.setState({
  //     lineTypeVisible: !!flag,
  //   });
  // }

  /**
   * 改变账户分配类别模态框显示状态
   * @param {boolean} flag
   */
  @Bind()
  handleAccountModalVisible(flag) {
    this.setState({
      modalAccountVisible: !!flag,
    });
  }

  /**
   * 改变需求类型模态框显示状态
   * @param {boolean} flag
   */
  @Bind()
  handleARpModalVisible(flag) {
    this.setState({
      modalRpVisible: !!flag,
    });
  }

  /**
   * 改变需求类型模态框显示状态
   * @param {boolean} flag
   */
  @Bind()
  handleProModalVisible() {
    const { modalProjectVisible } = this.state;
    this.setState({
      modalProjectVisible: !modalProjectVisible,
    });
  }

  /**
   * 查询订单类型定义列表
   * @param {Object} page
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    dispatch({
      type: 'orderTypeOrg/queryOrderTypeList',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode:
          'SODR.ORDER_TYPE.LIST.ORDER_GRID,SODR.ORDER_TYPE.LIST.ORDER_INQUIRY,SODR.ORDER_TYPE.LIST.ORDER_EDIT',
      },
    });
  }

  /**
   * 查询需求类型维护列表
   * @param {Object} page
   */
  @Bind()
  handleSearchDemand(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.demandFilterForm)
      ? {}
      : filterNullValueObject(this.demandFilterForm.getFieldsValue());
    dispatch({
      type: 'orderTypeOrg/queryDemandTypeList',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode: 'SODR.PR_TYPE.SEARCH,SODR.PR_TYPE.LIST',
      },
    });
  }

  /**
   * 查询需求计划类型维护列表
   * @param {Object} page
   */
  @Bind()
  handleSearchRpTypeList(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.rpFilterForm)
      ? {}
      : filterNullValueObject(this.rpFilterForm.getFieldsValue());
    dispatch({
      type: 'orderTypeOrg/queryRpTypeList',
      payload: {
        page,
        ...filterValues,
      },
    });
  }

  /**
   * 查询项目计划类型维护列表
   * @param {Object} page
   */
  @Bind()
  handleSearchProjectTypeList(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.projectRef)
      ? {}
      : filterNullValueObject(this.projectRef.getFieldsValue());
    dispatch({
      type: 'orderTypeOrg/queryProTypeList',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode:
          'SODR.PROJECT_TYPE.EDIT_FROM,SODR.PROJECT_TYPE.SEARCH,SODR.PROJECT_TYPE.LIST',
      },
    });
  }

  /**
   * 查询采购行类型维护列表
   * @param {Object} page
   */
  @Bind()
  handleSearchLineType(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.lineTypeFilterForm)
      ? {}
      : filterNullValueObject(this.lineTypeFilterForm.getFieldsValue());
    dispatch({
      type: 'orderTypeOrg/queryLineTypeList',
      payload: {
        page,
        ...filterValues,
      },
    });
  }

  /**
   * 查询账户分配类别列表
   * @param {Object} page
   */
  @Bind()
  handleSearchAccount(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.accountForm)
      ? {}
      : filterNullValueObject(this.accountForm.getFieldsValue());
    dispatch({
      type: 'orderTypeOrg/queryAccountList',
      payload: {
        page,
        ...filterValues,
      },
    });
  }

  /**
   * 查询字段控制数据
   * @param {Object} record
   */
  @Bind()
  fetchFields(page = {}, record = {}, moreFiels = {}) {
    const { accountAssignTypeId } = record;
    const { dispatch } = this.props;
    dispatch({
      type: 'orderTypeOrg/queryFielsList',
      payload: {
        page,
        lineType: 'PR_LINE',
        accountAssignTypeId,
        ...moreFiels,
      },
    });
  }

  /**
   * 保存采购订单类型
   * @param {Object} fields
   */
  @Bind()
  @Throttle(THROTTLE_TIME, { trailing: false })
  handleAdd(fields) {
    const { dispatch } = this.props;
    const { editValue } = this.state;
    const { externalSystemCode, ...other } = fields;
    const newFields = editValue.orderTypeId ? fields : other;
    dispatch({
      type: 'orderTypeOrg/addOrderType',
      payload: { ...editValue, ...newFields, tenantId: getCurrentOrganizationId() },
    }).then((res) => {
      if (!isEmpty(res)) {
        this.hideModal();
        this.handleSearch();
        notification.success();
      }
    });
  }

  /**
   * 保存需求维护类型
   * @param {Object} fields
   */
  @Bind()
  handleDemandAdd(fields) {
    const { dispatch } = this.props;
    const { editValue } = this.state;
    const { externalSystemCode, ...other } = fields;
    const newFields = editValue.prTypeId ? fields : other;
    dispatch({
      type: 'orderTypeOrg/addDemandType',
      payload: {
        ...editValue,
        ...newFields,
        tenantId: getCurrentOrganizationId(),
        customizeUnitCode: 'SODR.PR_TYPE.EDIT_FROM',
      },
    }).then((res) => {
      if (!isEmpty(res)) {
        this.demandHideModal();
        this.handleSearchDemand();
        notification.success();
      }
    });
  }

  /**
   * 保存需求计划维护类型
   * @param {Object} fields
   */
  @Bind()
  handleRpdAdd(fields) {
    const { dispatch } = this.props;
    const { editValue } = this.state;
    const { externalSystemCode, ...other } = fields;
    const newFields = editValue.prTypeId ? fields : other;

    dispatch({
      type: 'orderTypeOrg/saveRpType',
      payload: filterNullValueObject({
        ...editValue,
        ...newFields,
        categoryIds: null,
        categoryNames: null,
        roleIds: null,
        roles: null,
        roleNames: null,
        selectDateRow: null,
        tenantId: getCurrentOrganizationId(),
      }),
    }).then((res) => {
      if (getResponse(res)) {
        this.rpHideModal();
        this.handleSearchRpTypeList();
        notification.success();
      }
    });
  }

  /**
   * 保存需求计划维护类型
   * @param {Object} fields
   */
  @Bind()
  handleProdAdd(fields) {
    const { dispatch } = this.props;
    const { editValue } = this.state;
    const { externalSystemCode, ...other } = fields;
    const newFields = editValue.typeId ? fields : other;
    dispatch({
      type: 'orderTypeOrg/saveProType',
      payload: filterNullValueObject({
        ...editValue,
        ...newFields,
        customizeUnitCode: 'SODR.PROJECT_TYPE.EDIT_FROM',
        tenantId: getCurrentOrganizationId(),
      }),
    }).then((res) => {
      const data = getResponse(res);
      if (data) {
        this.handleProModalVisible();
        this.handleSearchProjectTypeList();
        notification.success();
      }
    });
  }

  /**
   * 保存采购行类型
   * @param {Object} fields
   */
  @Bind()
  handleLineTypeAdd(fields) {
    const { dispatch } = this.props;
    const { editValue } = this.state;
    const { externalSystemCode, ...other } = fields;
    const newFields = editValue.purchaseLineTypeId ? fields : other;
    dispatch({
      type: 'orderTypeOrg/addLineType',
      payload: { ...editValue, ...newFields, tenantId: getCurrentOrganizationId() },
    }).then((res) => {
      if (res) {
        this.lineTypeHideModal();
        this.handleSearchLineType();
        notification.success();
      }
    });
  }

  /**
   * 保存账户分配类别
   * @param {Object} fields
   */
  @Bind()
  handleAccountAdd(fields) {
    const { dispatch } = this.props;
    const { editValue } = this.state;
    const { externalSystemCode, ...other } = fields;
    const newFields = editValue.prTypeId ? fields : other;
    dispatch({
      type: 'orderTypeOrg/saveAccount',
      payload: { ...editValue, ...newFields, tenantId: getCurrentOrganizationId() },
    }).then((res) => {
      if (!isEmpty(res)) {
        this.accountHideModal();
        this.handleSearchAccount();
        notification.success();
      }
    });
  }

  /**
   * 保存字段必输设置
   */
  @Bind()
  saveFielsList() {
    const {
      dispatch,
      orderTypeOrg: { fieldsList = [] },
    } = this.props;
    const files = getEditTableData(fieldsList);
    dispatch({
      type: 'orderTypeOrg/saveFielsList',
      payload: files,
    }).then((res) => {
      if (res) {
        notification.success();
        if (this.accountTable) {
          this.accountTable.setState({
            visible: false,
          });
        }
      }
    });
  }

  @Bind()
  handleEdit(record) {
    this.setState(
      {
        editValue: record,
      },
      () => this.handleModalVisible(true)
    );
  }

  @Bind()
  handleDemandEdit(record) {
    this.handleQueryDemandType(record.prTypeId);
  }

  @Bind()
  handleRpEdit(record) {
    this.setState(
      {
        editValue: record,
      },
      () => this.handleARpModalVisible(true)
    );
  }

  @Bind()
  handleLineTypeEdit(record = {}) {
    const { dispatch } = this.props;
    const { purchaseLineTypeId } = record;
    dispatch({
      type: 'orderTypeOrg/queryLineTypeDetail',
      payload: {
        purchaseLineTypeId,
      },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            editValue: res,
          },
          () => this.handleLineTypeModalVisible(true)
        );
      }
    });
  }

  @Bind()
  handleAccountEdit(record) {
    this.setState(
      {
        editValue: record,
      },
      () => this.handleAccountModalVisible(true)
    );
  }

  @Bind()
  fetchModalData(filerProps) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'orderTypeOrg/queryCategory',
      payload: filerProps,
    });
  }

  @Bind()
  fetchRpModalData(record) {
    const { dispatch } = this.props;
    const { rpTypeId } = record;
    dispatch({
      type: 'orderTypeOrg/queryRpTypeDetail',
      payload: { rpTypeId },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            editValue: {
              ...record,
              selectDateRow: res?.categoryRelationList
                ? res?.categoryRelationList.map((ele) => ({
                    categoryId: ele.sourceId,
                    categoryName: ele.sourceMeaning,
                  }))
                : [],
              roleIds: res?.roleRelationList
                ? res?.roleRelationList.map((ele) => ele.sourceId)
                : [],
              roleNames: res?.roleRelationList
                ? res?.roleRelationList.map((ele) => ele.sourceMeaning).join(',')
                : '',
              roles: res?.roleRelationList
                ? res?.roleRelationList.map((ele) => ({
                    name: ele.sourceMeaning,
                    id: ele.sourceId,
                  }))
                : [],
            },
          },
          () => this.handleARpModalVisible(true)
        );
      }
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { activeKey } = this.state;

    let searchForm;
    let customizeUnitCode;

    switch (activeKey) {
      case 'rpmant':
        searchForm = this.rpFilterForm;
        customizeUnitCode = undefined;
        break;
      case 'demandmant':
        searchForm = this.demandFilterForm;
        customizeUnitCode = 'SODR.PR_TYPE.SEARCH,SODR.PR_TYPE.LIST';
        break;
      case 'projectmant':
        searchForm = this.projectRef;
        customizeUnitCode =
          'SODR.PROJECT_TYPE.EDIT_FROM,SODR.PROJECT_TYPE.SEARCH,SODR.PROJECT_TYPE.LIST';
        break;
      case 'ordermant':
        searchForm = this.filterForm;
        customizeUnitCode =
          'SODR.ORDER_TYPE.LIST.ORDER_GRID,SODR.ORDER_TYPE.LIST.ORDER_INQUIRY,SODR.ORDER_TYPE.LIST.ORDER_EDIT';
        // 产品要求添加表单个性化单元，如果遇到多个个性化单元配置不同模型的相同字段，则视为配置原因。
        break;
      default:
        break;
    }

    const filterValues = isUndefined(searchForm)
      ? {}
      : filterNullValueObject(searchForm.getFieldsValue());
    return {
      ...filterValues,
      customizeUnitCode,
    };
  }

  render() {
    const {
      loading,
      saving,
      demandSaving,
      RpSaving,
      demandLoading,
      rpLoading,
      proSaving,
      proLoading,
      // queryLineTypeListLoading,
      // addLineTypeLoading,
      saveAccountLoading,
      saveFielsListLoading,
      queryFielsListLoading,
      queryAccountListLoading,
      fetchCategoryLoading,
      orderTypeOrg: {
        orderTypeList,
        flags,
        fieldsList,
        accountList,
        filesPagination,
        accountPagination,
        dataSources,
        orderTypePagination,
        demandTypeList,
        demandTypePagination,
        rpTypeList,
        rpTypePagination,
        proTypeList,
        proTypePagination,
        // lineTypeList,
        // lineTypePagination,
      },
      customizeFilterForm,
      customizeTable,
      customizeForm,
      remote,
    } = this.props;
    const {
      editValue,
      modalVisible,
      activeKey,
      modalDemandVisible,
      modalAccountVisible,
      modalRpVisible,
      modalProjectVisible,
      // lineTypeVisible,
    } = this.state;
    const filterProps = {
      flags,
      onFilterChange: this.handleSearch,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      customizeFilterForm,
    };
    const listProps = {
      loading,
      dataSource: orderTypeList,
      showEditModal: this.handleEdit,
      pagination: {
        ...orderTypePagination,
        showTotal: totalRender,
      },
      customizeTable,
    };

    const demandFilterProps = {
      flags,
      onFilterChange: this.handleSearchDemand,
      onRef: (node) => {
        this.demandFilterForm = node.props.form;
      },
      customizeFilterForm,
    };
    const demandListProps = {
      customizeTable,
      loading: demandLoading,
      dataSource: demandTypeList,
      showEditModal: this.handleQueryDemandType,
      pagination: demandTypePagination,
      onSearch: this.handleSearchDemand,
    };
    const rpFilterProps = {
      flags,
      onFilterChange: this.handleSearchRpTypeList,
      onRef: (node) => {
        this.rpFilterForm = node.props.form;
      },
    };
    const rpListProps = {
      loading: rpLoading,
      dataSource: rpTypeList,
      showEditModal: this.handleRpEdit,
      pagination: rpTypePagination,
      onSearch: this.handleSearchRpTypeList,
      onRecordCategory: this.fetchRpModalData,
    };
    const projectFilterProps = {
      flags,
      customizeFilterForm,
      onFilterChange: this.handleSearchProjectTypeList,
      onRef: (node) => {
        this.projectRef = node.props.form;
      },
    };
    const projectListProps = {
      loading: proLoading,
      dataSource: proTypeList,
      customizeTable,
      showEditModal: (record) => {
        this.setState({ editValue: record }, () => {
          this.handleProModalVisible();
        });
      },
      pagination: proTypePagination,
      onSearch: this.handleSearchProjectTypeList,
    };
    // const lineTypeFormProps = {
    //   flags,
    //   onFilterChange: this.handleSearchLineType,
    //   onRef: node => {
    //     this.lineTypeFilterForm = node.props.form;
    //   },
    // };
    // const lineTypeTableProps = {
    //   loading: queryLineTypeListLoading,
    //   dataSource: lineTypeList,
    //   pagination: lineTypePagination,
    //   showEditModal: this.handleLineTypeEdit,
    //   onSearch: this.handleSearchLineType,
    // };
    const accountFormProps = {
      flags,
      onFilterChange: this.handleSearchAccount,
      onRef: (node) => {
        this.accountForm = node.props.form;
      },
    };
    const accountTableProps = {
      fieldsList,
      filesPagination,
      saveFielsListLoading,
      queryFielsListLoading,
      fetchFields: this.fetchFields,
      loading: queryAccountListLoading,
      dataSource: accountList,
      onRef: (node) => {
        this.accountTable = node;
      },
      saveFielsList: this.saveFielsList,
      showEditModal: this.handleAccountEdit,
      pagination: accountPagination,
      onSearch: this.handleSearchAccount,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.orderType.view.message.title.orderTypeMaint`).d('采购类型维护')}
        >
          {activeKey === 'rpmant' && (
            <>
              <Button icon="plus" type="primary" onClick={this.handleRpCreateHeader}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <ExcelExportPro
                templateCode="SRPM_RP_TYPE_EXPORT"
                otherButtonProps={{
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code: 'srm.po-admin.po.order-type.button.demandPlan-export',
                      type: 'button',
                    },
                  ],
                }}
                buttonText={intl.get('hzero.common.export.new').d('导出-新')}
                requestUrl={`${SRM_SRPM}/v1/${tenantId}/rp-type/export`}
                queryParams={this.handleGetFormValue()}
                method="POST"
                allBody
              />
              <CommonImport
                prefixPatch="/srpm"
                businessObjectTemplateCode="SRPM_RP_TYPE_IMPORT"
                buttonText={intl.get(`hzero.common.import.new`).d('导入-新')}
                buttonProps={{
                  permissionList: [
                    {
                      code: `srm.po-admin.po.order-type.button.demandPlan-import`,
                      type: 'button',
                      meaning: '导入-新',
                    },
                  ],
                }}
              />
            </>
          )}
          {activeKey === 'demandmant' && (
            <>
              <Button icon="plus" type="primary" onClick={this.handleDemandCreateHeader}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <ExcelExportPro
                templateCode="SPRM_PR_TYPE_EXPORT"
                otherButtonProps={{
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code: 'srm.po-admin.po.order-type.button.demand-export',
                      type: 'button',
                    },
                  ],
                }}
                buttonText={intl.get('hzero.common.export.new').d('导出-新')}
                requestUrl={`${SRM_SPRM}/v1/${tenantId}/pr-type/export`}
                queryParams={this.handleGetFormValue()}
                method="POST"
                allBody
              />
              <CommonImport
                prefixPatch="/sprm"
                businessObjectTemplateCode="SPRM_PR_TYPE_IMPORT"
                buttonText={intl.get(`hzero.common.import.new`).d('导入-新')}
                buttonProps={{
                  permissionList: [
                    {
                      code: `srm.po-admin.po.order-type.button.demand-import`,
                      type: 'button',
                      meaning: '导入-新',
                    },
                  ],
                }}
              />
            </>
          )}
          {activeKey === 'projectmant' && (
            <>
              <Button icon="plus" type="primary" onClick={this.handleProCreateHeader}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <ExcelExportPro
                templateCode="SRM_C_SIEC_PROJECT_TYPE_EXPORT"
                otherButtonProps={{
                  icon: 'unarchive',
                }}
                buttonText={intl.get('hzero.common.export.new').d('导出-新')}
                requestUrl={`${SRM_SIEC}/v1/${tenantId}/project-type/export`}
                queryParams={this.handleGetFormValue()}
                method="POST"
                allBody
              />
              <CommonImport
                businessObjectTemplateCode="SRM_C_SIEC_PROJECT_TYPE_IMPORT"
                buttonText={intl.get(`hzero.common.import.new`).d('导入-新')}
                prefixPatch={SRM_SIEC}
              />
            </>
          )}
          {activeKey === 'ordermant' && (
            <Fragment>
              <Button icon="plus" type="primary" onClick={this.handleCreateHeader}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <ExcelExportPro
                otherButtonProps={{
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code: 'srm.po-admin.po.order-type.button.order-export',
                      type: 'button',
                    },
                  ],
                }}
                queryParams={this.handleGetFormValue()}
                method="POST"
                allBody
                buttonText={intl.get(`hzero.common.button.newExport`).d('(新)导出')}
                templateCode="SRM_C_SRM_SODR_ORDER_TYPE_EXCEL_EXPORT"
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/order-type/export/new-module`}
              />
              <CommonImport
                businessObjectTemplateCode="SRM_C_SRM_SODR_ORDER_TYPE_IMPORT"
                prefixPatch={SRM_SPUC}
                buttonProps={{
                  permissionList: [
                    {
                      code: `srm.po-admin.po.order-type.button.order-import`,
                      type: 'button',
                      meaning: '(新)导入',
                    },
                  ],
                }}
                refreshButton
                buttonText={intl.get(`hzero.common.button.newImport`).d('(新)导入')}
                successCallBack={() => this.handleSearch()}
              />
            </Fragment>
          )}
          {activeKey === 'lineType' && (
            <Button icon="plus" type="primary" onClick={this.handleLineTypeCreateHeader}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )}
          {activeKey === 'accountmant' && (
            <Button icon="plus" type="primary" onClick={this.handleAccountCreateHeader}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )}
        </Header>
        <Content>
          <Tabs activeKey={activeKey} animated={false} onChange={this.handleTabsChange}>
            <TabPane
              key="rpmant"
              tab={intl.get(`sodr.orderType.view.message.tab.rpmant`).d('需求计划类型维护')}
            >
              <RpTypeForm {...rpFilterProps} />
              <RpTypeTable {...rpListProps} />
            </TabPane>
            <TabPane
              key="demandmant"
              tab={intl.get(`sodr.orderType.view.message.tab.demandmant`).d('申请类型维护')}
            >
              <DemandForm {...demandFilterProps} />
              <DemandTable {...demandListProps} />
            </TabPane>
            <TabPane
              key="projectmant"
              tab={intl.get(`sodr.orderType.view.message.tab.project`).d('项目类型维护')}
            >
              <ProjectForm {...projectFilterProps} />
              <ProjectTable {...projectListProps} />
            </TabPane>
            <TabPane
              key="ordermant"
              tab={intl.get(`sodr.orderType.view.message.tab.ordermant`).d('订单类型维护')}
            >
              <FilterForm {...filterProps} />
              <ListTable {...listProps} />
            </TabPane>
            <TabPane
              key="accountmant"
              tab={intl.get('sodr.orderType.view.message.tab.accountEdit').d('账户分配类别维护')}
            >
              <AccountForm {...accountFormProps} />
              <AccountTable {...accountTableProps} />
            </TabPane>
            {/* <TabPane
              key="lineType"
              tab={intl.get(`sodr.orderType.view.message.tab.purchaseLineType`).d('采购行类型维护')}
            >
              <LineTypeForm {...lineTypeFormProps} />
              <LineTypeTable {...lineTypeTableProps} />
            </TabPane> */}
          </Tabs>
        </Content>
        {modalDemandVisible && (
          <DemandList
            anchor="right"
            title={
              editValue.prTypeId
                ? intl.get(`sodr.orderType.view.message.demandEdit`).d('需求类型编辑')
                : intl.get(`sodr.orderType.view.message.demandAdd`).d('需求类型创建')
            }
            onRef={(ref) => {
              this.listForm = ref;
            }}
            editValue={editValue}
            onHandleAdd={this.handleDemandAdd}
            confirmLoading={demandSaving}
            visible={modalDemandVisible}
            onCancel={this.demandHideModal}
            demandTypeList={demandTypeList}
            fetchCategoryLoading={fetchCategoryLoading}
            fetchModalData={this.fetchModalData}
            customizeForm={customizeForm}
            remote={remote}
          />
        )}
        {modalRpVisible && (
          <RpTypeListForm
            anchor="right"
            title={
              editValue.rpTypeId
                ? intl.get(`sodr.orderType.view.message.rpEdit`).d('需求计划类型编辑')
                : intl.get(`sodr.orderType.view.message.rpAdd`).d('需求计划类型创建')
            }
            onRef={(ref) => {
              this.listForm = ref;
            }}
            editValue={editValue}
            onHandleAdd={this.handleRpdAdd}
            confirmLoading={RpSaving}
            visible={modalRpVisible}
            onCancel={this.rpHideModal}
            rpTypeList={rpTypeList}
            fetchCategoryLoading={fetchCategoryLoading}
            fetchModalData={this.fetchModalData}
          />
        )}
        {modalProjectVisible && (
          <ProjectModal
            anchor="right"
            title={
              editValue.typeId
                ? intl.get(`sodr.orderType.view.message.projectEdit`).d('项目类型编辑')
                : intl.get(`sodr.orderType.view.message.projectAdd`).d('项目类型创建')
            }
            onRef={(ref) => {
              this.listForm = ref;
            }}
            customizeForm={customizeForm}
            editValue={editValue}
            onHandleAdd={this.handleProdAdd}
            confirmLoading={proSaving}
            visible={modalProjectVisible}
            onCancel={this.handleProModalVisible}
          />
        )}
        <ListForm
          anchor="right"
          title={
            editValue.orderTypeId
              ? intl.get(`sodr.orderType.view.message.detailEdit`).d('采购订单类型编辑')
              : intl.get(`sodr.orderType.view.message.detailAdd`).d('采购订单类型创建')
          }
          onRef={(ref) => {
            this.listForm = ref;
          }}
          editValue={editValue}
          onHandleAdd={this.handleAdd}
          confirmLoading={saving}
          visible={modalVisible}
          onCancel={this.hideModal}
          dataSources={dataSources}
          orderTypeList={orderTypeList}
          customizeForm={customizeForm}
        />
        {/* <LineTypeListForm
          anchor="right"
          title={
            editValue.purchaseLineTypeId
              ? intl.get(`sodr.orderType.view.message.lineTypeEdit`).d('采购行类型编辑')
              : intl.get(`sodr.orderType.view.message.lineTypeAdd`).d('采购行类型创建')
          }
          editValue={editValue}
          onHandleAdd={this.handleLineTypeAdd}
          confirmLoading={addLineTypeLoading}
          visible={lineTypeVisible}
          onCancel={this.lineTypeHideModal}
          orderTypeList={orderTypeList}
        /> */}
        <AccountListForm
          anchor="right"
          title={
            editValue.prTypeId
              ? intl.get(`sodr.orderType.view.message.tab.accountEdit`).d('账户分配类别维护')
              : intl.get(`sodr.orderType.view.message.tab.accountAdd`).d('账户分配类别创建')
          }
          onRef={(ref) => {
            this.listForm = ref;
          }}
          editValue={editValue}
          onHandleAdd={this.handleAccountAdd}
          confirmLoading={saveAccountLoading}
          visible={modalAccountVisible}
          onCancel={this.accountHideModal}
          demandTypeList={demandTypeList}
        />
      </Fragment>
    );
  }
}
