/**
 * index.js - 业务实体定义
 * @date: 2018-10-26
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';

import { Button as ButtonPermission } from 'components/Permission';
import { Header, Content } from 'components/Page';
import { isEmpty } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import notification from 'utils/notification';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  getEditTableData,
  addItemToPagination,
  delItemToPagination,
} from 'utils/utils';
import { openTab } from 'utils/menuTab';
import querystring from 'querystring';
import { HZERO_PLATFORM } from 'utils/config';
import ExcelExport from 'components/ExcelExport';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import ListTable from './ListTable';
import FilterForm from './FilterForm';
import Drawer from './Drawer';
import AssignOrganizationLov from './AssignOrganizationLov';

@withCustomize({
  unitCode: [
    'SPFM_ORG-INFO_OPERATION-UNIT.LIST',
    'SPFM_ORG-INFO_OPERATION-UNIT.SEARCH',
    'SPFM_ORG-INFO_OPERATION-UNIT.BTNS',
  ],
})
@connect(({ loading, operationUnit, assignOrganization }) => ({
  operationUnit,
  assignOrganization,
  loading: loading.effects['operationUnit/queryOperationUnit'],
  saving: loading.effects['operationUnit/saveOperationUnit'],
  purOrgLoading: loading.effects['assignOrganization/fetchPurOrganization'],
  purOrgLovLoading: loading.effects['assignOrganization/fetchPurOrganizationLov'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['hpfm.operationUnit', 'entity.company', 'spfm.enterprise'],
})
export default class OperationUnit extends PureComponent {
  constructor(props) {
    super(props);
    this.filterForm = {}; // 获取查询表单对象
    this.rowKey = 'ouId';
    this.queryPageSize = 10;
    this.state = {
      ouId: '',
      visibleModal: false,
      visibleLovModal: false,
    };
  }

  componentDidMount() {
    const {
      operationUnit: { pagination },
    } = this.props;
    this.handleSearch(pagination);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'operationUnit/updateState',
      payload: {
        pagination: {},
        list: {},
      },
    });
  }

  /**
   * 查询业务实体列表
   * @param {Object} params - 查询条件及分页参数对象
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const values = this.filterForm.props && this.filterForm.props.form.getFieldsValue();
    dispatch({
      type: 'operationUnit/queryOperationUnit',
      payload: {
        tenantId,
        page,
        ...values,
        customizeUnitCode: 'SPFM_ORG-INFO_OPERATION-UNIT.LIST,SPFM_ORG-INFO_OPERATION-UNIT.SEARCH',
      },
    });
  }

  /**
   * 编辑行
   * @param {Obj} record
   */
  @Bind()
  handleEdit(record) {
    const {
      operationUnit: { list = {} },
      dispatch,
    } = this.props;
    const index = list.content.findIndex((item) => item[this.rowKey] === record[this.rowKey]);
    const newList = {
      ...list,
      content: [
        ...list.content.slice(0, index),
        {
          ...record,
          _status: 'update',
        },
        ...list.content.slice(index + 1),
      ],
    };

    dispatch({
      type: 'operationUnit/updateState',
      payload: {
        list: newList,
      },
    });
  }

  /**
   * 新建行
   */
  @Bind()
  handleCreate() {
    const {
      dispatch,
      commonSourceCode,
      commonExternalSystemCode,
      operationUnit: { list = {}, pagination = {} },
    } = this.props;
    const newLine = {
      isCreate: true,
      enabledFlag: 1,
      ouCode: '',
      ouName: '',
      ouId: uuidv4(),
      sourceCode: commonSourceCode,
      externalSystemCode: commonExternalSystemCode,
      _status: 'create',
    };
    dispatch({
      type: 'operationUnit/updateState',
      payload: {
        list: {
          ...list,
          content: [newLine, ...(list.content || [])],
        },
        pagination: addItemToPagination(list.content?.length, pagination),
      },
    });
  }

  /**
   * 保存，校验成功保存新增行和修改行
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      operationUnit: { list = {}, pagination = {} },
      tenantId,
    } = this.props;
    const { content } = list;
    const params = getEditTableData(content, [this.rowKey]);
    if (Array.isArray(params) && params.length === 0) {
      return;
    }
    dispatch({
      type: 'operationUnit/saveOperationUnit',
      payload: {
        tenantId,
        list: params,
        customizeUnitCode: 'SPFM_ORG-INFO_OPERATION-UNIT.LIST',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 取消编辑行
   * @param {Obj} record
   * @memberof StoreRoom
   */
  @Bind()
  handleCancel(record) {
    const {
      operationUnit: { list = {} },
      dispatch,
    } = this.props;
    const index = list.content.findIndex((item) => item[this.rowKey] === record[this.rowKey]);
    const { _status, ...other } = record;
    const newList = {
      ...list,
      content: [...list.content.slice(0, index), other, ...list.content.slice(index + 1)],
    };

    dispatch({
      type: 'operationUnit/updateState',
      payload: {
        list: newList,
      },
    });
  }

  /**
   * 删除新建行
   * @param {*} record
   */
  @Bind()
  handleDelete(record) {
    const {
      operationUnit: { list = {}, pagination = {} },
      dispatch,
    } = this.props;
    dispatch({
      type: 'operationUnit/updateState',
      payload: {
        list: {
          ...list,
          content: list.content.filter((item) => item[this.rowKey] !== record[this.rowKey]),
        },
        pagination: delItemToPagination(list.content.length, pagination),
      },
    });
  }

  /**
   * 展示分配采购组织弹窗
   * @param {*} record 行数据
   */
  @Bind()
  handleAssignOrgModal(record = {}) {
    const { dispatch } = this.props;
    const { ouId } = record;
    dispatch({
      type: 'assignOrganization/fetchPurOrganization',
      payload: {
        ouId,
      },
    });
    this.setState({
      ouId,
      visibleModal: true,
    });
  }

  /**
   * 关闭分配采购组织弹窗
   */
  @Bind()
  handlepurOrgCancel() {
    this.setState({
      visibleModal: false,
    });
  }

  /**
   * 分配采购组织查询
   * @param {*} params 查询参数
   */
  @Bind()
  fetchPurOrganization(page = {}, params = {}) {
    const { dispatch } = this.props;
    const { ouId } = this.state;
    dispatch({
      type: 'assignOrganization/fetchPurOrganization',
      payload: {
        ouId,
        ...params,
        page,
      },
    });
  }

  /**
   * 分配采购组织删除
   */
  @Bind()
  deletePurOrganization(params = []) {
    const { dispatch } = this.props;
    const { ouId } = this.state;
    dispatch({
      type: 'assignOrganization/deletePurOrganization',
      payload: {
        ouId,
        purchaseOrganizationList: params,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchPurOrganization();
      }
    });
  }

  /**
   * 新增采购组织
   */
  @Bind()
  handleAddOrganization() {
    this.setState({
      visibleLovModal: true,
    });
    this.fetchPurOrganizationLov();
  }

  /**
   * 关闭采购组织多选lov
   */
  @Bind()
  handlepurOrgCancelLov() {
    this.setState({
      visibleLovModal: false,
    });
  }

  /**
   * 采购组织多选lov查询
   */
  @Bind()
  fetchPurOrganizationLov(page = {}, params = {}) {
    const { dispatch } = this.props;
    const { ouId } = this.state;
    dispatch({
      type: 'assignOrganization/fetchPurOrganizationLov',
      payload: {
        ouId,
        ...params,
        page,
      },
    });
  }

  /**
   * 新增采购组织
   */
  @Bind()
  @Debounce(100)
  handleLovOk(params = {}) {
    const { dispatch } = this.props;
    const { ouId } = this.state;
    dispatch({
      type: 'assignOrganization/addPurOrganization',
      payload: {
        ouId,
        purchaseOrganizationList: params,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchPurOrganization();
        this.setState({
          visibleLovModal: false,
        });
      }
    });
  }

  @Bind()
  onTableSelectedRowChange(selectedRowKeys, selectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'operationUnit/updateState',
      payload: {
        selectedRows,
        selectedRowKeys,
      },
    });
  }

  /**
   *导入
   */

  handleImport() {
    openTab({
      key: `/spfm/org-info/operation-unit/comment-import/HPFM.OPERATION_UNIT_IMPORT`,
      title: 'hzero.common.button.import',
      search: querystring.stringify({
        action: 'hzero.common.button.import',
      }),
    });
  }

  render() {
    const { visibleModal = false, visibleLovModal = false, ouId } = this.state;
    const {
      form,
      loading,
      purOrgLoading,
      purOrgLovLoading,
      saving,
      tenantId,
      commonSourceCode,
      match,
      operationUnit: {
        list: { content = [] },
        pagination = {},
        selectedRowKeys,
      },
      assignOrganization: {
        purOrganizationList = [],
        purOrgPagination = {},
        purOrganizationLovList = [],
        purOrgLovPagination = {},
      },
      customizeTable,
      customizeFilterForm,
      customizeBtnGroup,
    } = this.props;
    const values = (this.filterForm.props && this.filterForm.props.form.getFieldsValue()) || {};
    const hasEdit = content.findIndex((item) => !!item._status) !== -1;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onTableSelectedRowChange,
    };
    const listProps = {
      customizeTable,
      commonSourceCode,
      loading,
      pagination,
      form,
      tenantId,
      match,
      rowKey: this.rowKey,
      dataSource: content,
      rowSelection,
      onEdit: this.handleEdit,
      onDelete: this.handleDelete,
      onCancel: this.handleCancel,
      onSearch: this.handleSearch,
      onAssignOrgModal: this.handleAssignOrgModal,
    };
    const drawerProps = {
      ouId,
      purOrgLoading,
      visibleModal,
      anchor: 'right',
      purOrganizationList,
      purOrgPagination,
      onCancel: this.handlepurOrgCancel,
      onFetchPurOrganization: this.fetchPurOrganization,
      onDeletePurOrganization: this.deletePurOrganization,
      onAddOrganization: this.handleAddOrganization,
    };
    const lovProps = {
      purOrgLovLoading,
      visibleLovModal,
      purOrganizationLovList,
      purOrgLovPagination,
      onCancel: this.handlepurOrgCancelLov,
      onOk: this.handleLovOk,
      onFetchPurOrganization: this.fetchPurOrganizationLov,
    };
    return (
      <Fragment>
        <Header title={intl.get('hpfm.operationUnit.view.title.operationUnit').d('业务实体')}>
          {customizeBtnGroup({ code: 'SPFM_ORG-INFO_OPERATION-UNIT.BTNS' }, [
            <ButtonPermission
              data-name="save"
              type="primary"
              icon="save"
              onClick={this.handleSave}
              loading={(saving || loading) && hasEdit}
              disabled={!hasEdit}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </ButtonPermission>,
            <ButtonPermission
              data-name="create"
              icon="plus"
              onClick={this.handleCreate}
              permissionList={[
                {
                  code: `srm.mdm.enterprise.srm-org-info.button.ps.unit.create`,
                  type: 'button',
                  meaning: '新建',
                },
              ]}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </ButtonPermission>,
            <ExcelExportPro
              data-name="newExport"
              templateCode="HPFM_OPERATION_UNIT_EXPORT"
              buttonText={
                selectedRowKeys?.length
                  ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
                  : intl.get('hzero.common.export.new').d('导出-新')
              }
              requestUrl={`${HZERO_PLATFORM}/v1/${tenantId}/operation-unit/export`}
              queryParams={{
                ...values,
                exportOuIds: isEmpty(selectedRowKeys) ? undefined : selectedRowKeys.join(),
              }}
              otherButtonProps={{
                permissionList: [
                  {
                    code: 'srm.mdm.enterprise.srm-org-info.ps.new.unit.list.export',
                    type: 'button',
                  },
                ],
              }}
            />,
            <CommonImport
              data-name="newImport"
              prefixPatch="/hpfm"
              businessObjectTemplateCode="HPFM.OPERATION_UNIT_IMPORT"
              buttonText={intl.get('hzero.common.button.import.new').d('导入-新')}
              buttonProps={{
                // icon: 'to-top',
                permissionList: [
                  {
                    code: `srm.mdm.enterprise.srm-org-info.ps.new.unit.import`,
                    type: 'button',
                    meaning: '导入-新',
                  },
                ],
              }}
            />,
            <ExcelExport
              data-name="export"
              buttonText={
                selectedRowKeys?.length
                  ? intl.get('hzero.common.button.exports').d('勾选导出')
                  : intl.get('hzero.common.export').d('导出')
              }
              requestUrl={`${HZERO_PLATFORM}/v1/${tenantId}/operation-unit/export`}
              queryParams={{
                ...values,
                exportOuIds: isEmpty(selectedRowKeys) ? undefined : selectedRowKeys.join(),
              }}
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                permissionList: [
                  {
                    code: 'srm.mdm.enterprise.srm-org-info.ps.unit.list.export',
                    type: 'button',
                  },
                ],
              }}
            />,
            <ButtonPermission
              data-name="import"
              icon="archive"
              type="c7n-pro"
              onClick={this.handleImport}
              permissionList={[
                {
                  code: `srm.mdm.enterprise.srm-org-info.ps.unit.import`,
                  type: 'button',
                  meaning: '导入',
                },
              ]}
            >
              {intl.get('hzero.common.button.import').d('导入')}
            </ButtonPermission>,
          ])}
        </Header>
        <Content noCard>
          <div className="table-list-search">
            <FilterForm
              onRef={(ref) => {
                this.filterForm = ref;
              }}
              onSearch={this.handleSearch}
              tenantId={tenantId}
              customizeFilterForm={customizeFilterForm}
            />
          </div>
          <ListTable {...listProps} />
        </Content>
        <Drawer {...drawerProps} />
        <AssignOrganizationLov {...lovProps} />
      </Fragment>
    );
  }
}
