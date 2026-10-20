/**
 * LineData - 打平的组织数据
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019-08-12
 * @copyright 2019 © HAND
 */

import React from 'react';
import { Table, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';
import { yesOrNoRender, operatorRender } from 'utils/renderer';

import SearchForm from './SearchForm';
import EditDrawer from '../components/Drawer';

@cacheComponent({ cacheKey: '/hpfm/hr/org/company/line-data/list' })
export default class LineData extends React.Component {
  state = {
    isCreate: true, // 是否是新建
    drawerVisible: false, // 编辑模态框
    editRecord: {}, // 编辑数据
    cachePagination: {}, // 缓存的分页数据
    sort: {
      columnKey: 'orderSeq',
      field: 'orderSeq',
      order: 'asc',
    },
  };

  searchFormRef = React.createRef();

  componentDidMount() {
    this.reload();
    const { onRef } = this.props;
    onRef(this);
  }

  // base

  handleSearch(pagination = {}) {
    let searchParams = {};
    if (this.searchFormRef.current) {
      searchParams = this.searchFormRef.current.props.form.getFieldsValue();
    }
    const { unitsQueryLine } = this.props;
    const { sort } = this.state;
    this.setState({
      cachePagination: pagination,
    });
    unitsQueryLine({
      params: {
        ...pagination,
        sort,
        ...searchParams,
        customizeUnitCode: 'SPFM.ORGANIZATION.LIST_PAGING,SPFM.ORGANIZATION.EDIT_FORM',
      },
    });
  }

  reload() {
    const { cachePagination = {} } = this.state;
    this.handleSearch(cachePagination);
  }

  // Button
  @Bind()
  handleCreateBtnClick() {
    this.setState({
      isCreate: true,
      drawerVisible: true,
      editRecord: {},
    });
  }

  // SearchForm

  @Bind()
  handleSearchFormSearch() {
    this.handleSearch();
  }

  // EditDrawer

  /**
   * 保存 - 单条组织行数据修改后保存
   * @param {Object} values 修改后的数据
   */
  @Bind()
  handleDrawerOk(values) {
    const { saveEditData, saveAddData, organizationId } = this.props;
    const { isCreate } = this.state;
    if (isCreate) {
      //  新建
      saveAddData({
        tenantId: organizationId,
        data: [
          {
            ...values,
            tenantId: organizationId,
            enabledFlag: 1,
          },
        ],
        customizeUnitCode: 'SPFM.ORGANIZATION.LIST_PAGING,SPFM.ORGANIZATION.EDIT_FORM',
      }).then((res) => {
        if (res) {
          this.setState({
            isCreate: true,
            drawerVisible: false,
            editRecord: {},
          });
          this.reload();
          notification.success();
        }
      });
    } else {
      saveEditData({
        tenantId: organizationId,
        values,
        customizeUnitCode: 'SPFM.ORGANIZATION.LIST_PAGING,SPFM.ORGANIZATION.EDIT_FORM',
      }).then((res) => {
        if (res) {
          this.setState({
            isCreate: true,
            drawerVisible: false,
            editRecord: {},
          });
          this.reload();
          notification.success();
        }
      });
    }
  }

  /**
   * 编辑侧滑框隐藏
   */
  @Bind()
  handleDrawerCancel() {
    this.setState({
      isCreate: true,
      drawerVisible: false,
      editRecord: {},
    });
  }

  // Table
  getColumns() {
    const { sort = {} } = this.state;
    const { order } = sort;

    let sortOrder = 'asc';

    switch (order) {
      case 'asc':
        sortOrder = 'ascend';
        break;
      case 'desc':
        sortOrder = 'descend';
        break;
      default:
        sortOrder = false;
        break;
    }

    return [
      {
        dataIndex: 'unitCode',
        title: intl.get('entity.organization.code').d('组织编码'),
        width: 300,
      },
      {
        dataIndex: 'unitName',
        title: intl.get('entity.organization.name').d('组织名称'),
      },
      {
        dataIndex: 'nameLevelPaths',
        title: intl.get('hpfm.organization.model.unit.nameLevelPaths').d('组织层级'),
        width: 400,
        render: (nameLevelPaths = []) => {
          return nameLevelPaths.join('/');
        },
      },
      {
        dataIndex: 'unitTypeMeaning',
        title: intl.get('entity.organization.type').d('组织类型'),
        width: 130,
      },
      {
        dataIndex: 'orderSeq',
        title: intl.get('hpfm.common.model.common.orderSeq').d('排序号'),
        defaultSortOrder: 'ascend',
        sortOrder,
        sorter: (a, b) => Number(a) - Number(b),
        width: 110,
      },
      {
        dataIndex: 'supervisorFlag',
        title: intl.get('hpfm.organization.model.unit.supervisorFlag').d('主管组织'),
        width: 90,
        render: yesOrNoRender,
      },
      {
        key: 'operator',
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 190,
        fixed: 'right',
        render: (_, record) => {
          const actions = [];
          switch (record.enabledFlag) {
            case 1:
              actions.push({
                key: 'edit',
                len: 2,
                ele: (
                  <a onClick={() => this.handleEditRecord(record)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                ),
              });
              actions.push({
                key: 'disable',
                len: 2,
                title: intl.get('hzero.common.status.disable').d('禁用'),
                ele: (
                  <a onClick={() => this.handleDisabledRecord(record)}>
                    {intl.get('hzero.common.status.disable').d('禁用')}
                  </a>
                ),
              });
              actions.push({
                key: 'assign-grade',
                len: 4,
                title: intl.get('hpfm.organization.view.option.assign').d('分配部门'),
                ele: (
                  <a onClick={() => this.handleGotoSubGradeRecord(record)}>
                    {intl.get('hpfm.organization.view.option.assign').d('分配部门')}
                  </a>
                ),
              });
              break;
            case 0:
              actions.push({
                key: 'edit',
                len: 2,
                ele: (
                  <a onClick={() => this.handleEditRecord(record)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                ),
              });
              actions.push({
                key: 'enable',
                len: 2,
                title: intl.get('hzero.common.status.enable').d('启用'),
                ele: (
                  <a onClick={() => this.handleEnableRecord(record)}>
                    {intl.get('hzero.common.status.enable').d('启用')}
                  </a>
                ),
              });
              actions.push({
                key: 'assign-grade',
                len: 4,
                title: intl.get('hpfm.organization.view.option.assign').d('分配部门'),
                ele: (
                  <a onClick={() => this.handleGotoSubGradeRecord(record)}>
                    {intl.get('hpfm.organization.view.option.assign').d('分配部门')}
                  </a>
                ),
              });
              break;
            default:
              break;
          }
          return operatorRender(actions);
        },
      },
    ];
  }

  @Bind()
  handleTableChange(page, filter, sort = {}) {
    this.setState(
      {
        sort,
      },
      () => {
        this.handleSearch({
          page,
          sort,
        });
      }
    );
  }

  @Bind()
  handleEditRecord(record) {
    this.setState({
      isCreate: false,
      drawerVisible: true,
      editRecord: record,
    });
  }

  /**
   * 对保存的数据禁用
   * @param record
   */
  @Bind()
  handleDisabledRecord(record) {
    const { forbidLine, organizationId } = this.props;
    forbidLine({
      tenantId: organizationId,
      unitId: record.unitId,
      objectVersionNumber: record.objectVersionNumber,
      _token: record._token,
    }).then((res) => {
      if (res) {
        notification.success();
        this.reload();
      }
    });
  }

  /**
   * 对保存的数据启用
   * @param record
   */
  @Bind()
  handleEnableRecord(record) {
    const { organizationId, enabledLine } = this.props;
    enabledLine({
      tenantId: organizationId,
      unitId: record.unitId,
      objectVersionNumber: record.objectVersionNumber,
      _token: record._token,
    }).then((res) => {
      if (res) {
        notification.success();
        this.reload();
      }
    });
  }

  /**
   * 分配部门 - 跳转到子路由
   * @param record
   */
  @Bind()
  handleGotoSubGradeRecord(record) {
    const { push } = this.props;
    push({
      pathname: `/hpfm/hr/org/department/${record.unitId}`,
    });
  }

  render() {
    const {
      dataSource = [],
      pagination = {},
      organizationId,
      unitType,
      createDataLoading = false,
      queryLoading = false,
      saveEditDataLoading = false,
      forbidLineLoading = false,
      enabledLineLoading = false,
      customizeTable,
      customizeForm,
    } = this.props;
    const { drawerVisible = false, editRecord = {}, isCreate = true } = this.state;
    const columns = this.getColumns();
    return (
      <React.Fragment>
        <SearchForm
          onSearch={this.handleSearchFormSearch}
          wrappedComponentRef={this.searchFormRef}
          unitType={unitType}
        />
        <div className="table-operator">
          <Button onClick={this.handleCreateBtnClick}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        {customizeTable(
          {
            code: 'SPFM.ORGANIZATION.LIST_PAGING',
          },
          <Table
            bordered
            rowKey="unitId"
            pagination={pagination}
            dataSource={dataSource}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            loading={queryLoading || forbidLineLoading || enabledLineLoading}
            onChange={this.handleTableChange}
          />
        )}
        {drawerVisible && (
          <EditDrawer
            customizeForm={customizeForm}
            isCreate={isCreate}
            tenantId={organizationId}
            unitType={unitType}
            loading={saveEditDataLoading || createDataLoading}
            visible={drawerVisible}
            anchor="right"
            title={
              isCreate
                ? intl.get('hpfm.organization.view.message.create').d('组织信息新建')
                : intl.get('hpfm.organization.view.message.edit').d('组织信息修改')
            }
            onCancel={this.handleDrawerCancel}
            onOk={this.handleDrawerOk}
            itemData={editRecord}
          />
        )}
      </React.Fragment>
    );
  }
}
