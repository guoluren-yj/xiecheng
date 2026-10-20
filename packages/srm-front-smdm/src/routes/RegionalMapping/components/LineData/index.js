/**
 * LineData - 打平的组织数据
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019-08-12
 * @copyright 2019 © HAND
 */

import React from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

// import { Button as ButtonPermission } from 'components/Permission';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';
// import { enableRender, operatorRender } from 'utils/renderer';

import SearchForm from './SearchForm';
import EditDrawer from '../EditDrawer';

export default class LineData extends React.Component {
  state = {
    drawerVisible: false, // 编辑模态框
    editRecord: {}, // 编辑数据
    cachePagination: {}, // 缓存的分页数据
    esStatus: [],
  };

  searchFormRef = React.createRef();

  componentDidMount() {
    const { searchEsStatus } = this.props;
    searchEsStatus().then((res) => {
      this.setState({
        esStatus: res,
      });
    });
    this.reload();
  }

  // base

  handleSearch(pagination = {}) {
    let searchParams = {};
    if (this.searchFormRef.current) {
      searchParams = this.searchFormRef.current.props.form.getFieldsValue();
    }
    const { query } = this.props;
    this.setState({
      cachePagination: pagination,
    });
    query({
      query: {
        ...pagination,
        ...searchParams,
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
      drawerVisible: true,
      editRecord: {
        enabledFlag: 1, // 新增地区默认启用
      },
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
    const { updateRecord } = this.props;
    updateRecord({
      ...values,
    }).then((res) => {
      if (res) {
        this.setState({
          drawerVisible: false,
          editRecord: {},
        });
        this.reload();
        notification.success();
      }
    });
  }

  /**
   * 编辑侧滑框隐藏
   */
  @Bind()
  handleDrawerCancel() {
    this.setState({
      drawerVisible: false,
      editRecord: {},
    });
  }

  // Table
  getColumns() {
    const { isOldTenant } = this.props;
    const extraColumns = !isOldTenant
      ? [
          {
            title: intl.get('hpfm.region.model.region.standardRegionCode').d('国标代码'),
            dataIndex: 'standardRegionCode',
            width: 150,
          },
        ]
      : [];
    return [
      {
        title: intl.get('hpfm.region.model.region.regionCode').d('区域代码'),
        dataIndex: 'regionCode',
        width: 150,
      },
      {
        title: intl.get('hpfm.region.model.region.regionName').d('区域名称'),
        dataIndex: 'regionName',
        width: 150,
      },
      ...extraColumns,
      {
        title: intl.get('smdm.regionalMapping.entity.region.esRegionCode').d('映射区域代码'),
        dataIndex: 'esRegionCode',
        width: 150,
      },
      {
        title: intl.get('smdm.regionalMapping.entity.region.esRegionName').d('映射区域名称'),
        dataIndex: 'esRegionName',
        width: 150,
      },
      {
        title: intl.get('smdm.regionalMapping.status').d('映射状态'),
        width: 100,
        dataIndex: 'status',
        render: (text, record) => {
          if (record.esRegionCode) {
            return <span>{intl.get('smdm.regionalMapping.status.yes').d('已映射')}</span>;
          } else {
            return <span>{intl.get('smdm.regionalMapping.status.no').d('未映射')}</span>;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 200,
        render: (text, record) => {
          return (
            <a onClick={() => this.handleEditRecord(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
  }

  @Bind()
  handleTableChange(page, filter, sort) {
    this.handleSearch({
      page,
      sort,
    });
  }

  @Bind()
  handleCreateChild(record) {
    this.setState({
      drawerVisible: true,
      editRecord: {
        parentRegionId: record.regionId,
        enabledFlag: 1, // 默认启用
      },
    });
  }

  @Bind()
  handleEditRecord(record) {
    this.setState({
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
    const { disableRecord } = this.props;
    disableRecord({
      regionId: record.regionId,
      body: {
        regionId: record.regionId,
        objectVersionNumber: record.objectVersionNumber,
        _token: record._token,
        enabledFlag: 0,
      },
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
    const { enableRecord } = this.props;
    enableRecord({
      regionId: record.regionId,
      body: {
        regionId: record.regionId,
        objectVersionNumber: record.objectVersionNumber,
        _token: record._token,
        enabledFlag: 1,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.reload();
      }
    });
  }

  render() {
    const {
      dataSource = [],
      pagination = {},
      isOldTenant,
      queryLoading = false,
      updateLoading = false,
    } = this.props;
    const { esStatus = [], drawerVisible = false, editRecord = {} } = this.state;
    const columns = this.getColumns();
    return (
      <React.Fragment>
        <SearchForm
          isOldTenant={isOldTenant}
          esStatus={esStatus}
          onSearch={this.handleSearchFormSearch}
          wrappedComponentRef={this.searchFormRef}
        />
        {/* <div className="table-operator">
          <ButtonPermission
            permissionList={[
              {
                code: `${match.path}.button.create`,
                type: 'button',
                meaning: '地区定义-分页结构-新建',
              },
            ]}
            onClick={this.handleCreateBtnClick}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </ButtonPermission>
        </div> */}
        <Table
          bordered
          rowKey="regionId"
          pagination={pagination}
          dataSource={dataSource}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          loading={queryLoading}
          onChange={this.handleTableChange}
        />
        <EditDrawer
          loading={updateLoading}
          visible={drawerVisible}
          anchor="right"
          title={intl.get('hpfm.region.view.title.edit').d('地区修改')}
          onCancel={this.handleDrawerCancel}
          onOk={this.handleDrawerOk}
          itemData={editRecord}
        />
      </React.Fragment>
    );
  }
}
