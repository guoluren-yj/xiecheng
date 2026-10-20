/**
 * LazyTree
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019-08-09
 * @copyright 2019 © HAND
 */
import React from 'react';
import classNames from 'classnames';
import uuid from 'uuid/v4';
import { Icon, Button } from 'hzero-ui';
import { PerformanceTable, DataSet } from 'choerodon-ui/pro';
import { Bind, Throttle } from 'lodash-decorators';
import { isNil, isEmpty, omit } from 'lodash';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth, getEditTableData } from 'utils/utils';
import { DEBOUNCE_TIME } from 'utils/constants';
import { yesOrNoRender, operatorRender } from 'utils/renderer';

import EditDrawer from '../components/Drawer';
import CreateDrawer from '../components/CreateDrawer';

import styles from './styles.less';

function buildNewTreeDataSource(treeDataSource = [], iterFunc) {
  return treeDataSource.map((item) => {
    if (item.children) {
      const newItem = iterFunc(item);
      return {
        ...newItem,
        children: buildNewTreeDataSource(newItem.children, iterFunc),
      };
    } else {
      return iterFunc(item);
    }
  });
}

const INDENT_SIZE = 16;
@WithCustomize({
  unitCode: ['SPFM.ORGANIZATION.LIST_TREE'],
})
export default class LazyTree extends React.Component {
  vTableDs = new DataSet({});

  state = {
    drawerVisible: false,
    editRecord: {},
    createDrawerVisible: false,
    createRecord: {},
  };

  componentDidMount() {
    const { loadData } = this.props;
    loadData();
  }

  componentWillUnmount() {
    this.handleTableExpand.cancel();
  }

  /**
   * 新建一个顶级组织
   */
  @Bind()
  handleCreateBtnClick() {
    this.setState({
      createDrawerVisible: true,
      createRecord: {},
    });
  }

  /**
   * 表格行内编辑的保存
   */
  @Bind()
  handleSaveBtnClick() {
    const { organizationId, dataSource = [], saveAddData } = this.props;
    // 处理表单效验，获取处理后的表单数据
    const params = getEditTableData(dataSource, ['children', 'unitId']);
    if (Array.isArray(params) && params.length !== 0) {
      saveAddData({
        tenantId: organizationId,
        data: params,
      }).then((res) => {
        if (res) {
          notification.success();
          const { loadData } = this.props;
          loadData();
        }
      });
    }
  }

  /**
   * 有新增的数据才可以 保存
   * @return {boolean}
   */
  getSaveBtnDisabled() {
    const { dataSource = [] } = this.props;
    let createCount = 0;
    buildNewTreeDataSource(dataSource, (item) => {
      if (item._status === 'create') {
        createCount += 1;
      }
      return item;
    });
    return createCount === 0;
  }

  // Table

  /**
   * 清除新增的数据
   * @param record
   */
  @Bind()
  handleClearRecord(record) {
    const { updateModelState, dataSource = [], expandKeys = [] } = this.props;
    let needRemoveExpandKey = false;
    const newDataSource = isNil(record.parentUnitId)
      ? dataSource.filter((item) => item.unitId !== record.unitId)
      : buildNewTreeDataSource(dataSource, (item) => {
          if (record.parentUnitId === item.unitId) {
            const newChildren = item.children.filter((child) => child.unitId !== record.unitId);
            const newItem = { ...item };
            if (newChildren.length === 0) {
              needRemoveExpandKey = true;
              newItem.hasNextFlag = item._prevHasNextFlag;
            }
            return {
              ...newItem,
              children: newChildren,
            };
          } else {
            return item;
          }
        });

    updateModelState({
      treeDataSource: newDataSource,
      expandKeys: needRemoveExpandKey
        ? expandKeys.filter((item) => item !== record.parentUnitId)
        : expandKeys,
    });
  }

  /**
   * 编辑已经保存的数据
   * @param record
   */
  @Bind()
  handleEditRecord(record) {
    this.setState({
      drawerVisible: true,
      editRecord: record,
    });
  }

  @Bind()
  handleAddChildRecord(record) {
    this.setState({
      createDrawerVisible: true,
      createRecord: record,
    });
  }

  /**
   * 对保存的数据新增下级
   * @param record
   */
  @Bind()
  handleAddRecordChild(record) {
    const { updateModelState, dataSource = [], expandKeys = [], organizationId } = this.props;
    const unitId = uuid();
    const newItem = {
      unitId,
      tenantId: organizationId,
      unitCode: '',
      unitName: '',
      unitTypeMeaning: '',
      unitTypeCode: '',
      orderSeq: '',
      supervisorFlag: 0, // 默认非主管组织
      enabledFlag: 1, // 新增节点默认启用
      parentUnitName: record.unitName,
      parentUnitId: record.unitId,
      _status: 'create', // 新增节点的标识
      indent: record.indent + 1,
    };
    let needAddExpandKey = false;
    const newDataSource = buildNewTreeDataSource(dataSource, (item) => {
      if (item.unitId === record.unitId) {
        if (item.hasNextFlag !== 1) {
          // 本身没有子节点
          needAddExpandKey = true;
        } else if (!expandKeys.includes(item.unitId)) {
          // 本身有子节点但是没有展开
          needAddExpandKey = true;
        }
        return {
          ...item,
          hasNextFlag: 1,
          // 存储之前的 标记, 用于 清除后 还原
          _prevHasNextFlag: isNil(item._prevHasNextFlag) ? item.hasNextFlag : item._prevHasNextFlag,
          children: item.children ? [newItem, ...item.children] : [newItem],
        };
      } else {
        return item;
      }
    });
    updateModelState({
      treeDataSource: newDataSource,
      expandKeys: needAddExpandKey ? [...expandKeys, record.unitId] : expandKeys,
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
        const { loadData } = this.props;
        loadData();
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
        const { loadData } = this.props;
        loadData();
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

  /**
   * 树数据展开点击
   * @param {boolean} expanded - 是否展开
   * @param {object} record - 记录
   */
  @Throttle(DEBOUNCE_TIME)
  @Bind()
  handleTableExpand(expanded, record) {
    // 如果能显示展开按钮, 那么一定有children
    if (expanded) {
      if (record.children.length === 0) {
        const { loadData } = this.props;
        loadData({ unitId: record.unitId, indent: record.indent });
      } else {
        const { updateModelState, expandKeys = [] } = this.props;
        updateModelState({
          expandKeys: [...expandKeys, record.unitId],
        });
      }
    }
    if (!expanded) {
      const { updateModelState, expandKeys = [] } = this.props;
      updateModelState({
        expandKeys: expandKeys.filter((k) => k !== record.unitId),
      });
    }
  }

  /**
   * 须由 自己 手动设置 expand
   * 行内编辑只有新增
   * @return {*[]}
   */
  getColumns() {
    return [
      {
        dataIndex: 'unitCode',
        title: intl.get('entity.organization.code').d('组织编码'),
        width: 300,
        resizable: true,
        render: ({ rowData: record }) => {
          const { expandKeys = [], loadingExpandKeys = [] } = this.props;
          const { unitId, unitCode, indent = 0 } = record;
          const loading = loadingExpandKeys.includes(unitId);
          const isExpand = expandKeys.includes(unitId);
          const hasExpand = record.hasNextFlag === 1;
          const expandIcon = hasExpand && (
            <Icon
              className={classNames(styles['hpfm-organization-lazy-tree-expand-icon'], {
                [styles['hpfm-organization-lazy-tree-expand-icon-loading']]: loading,
              })}
              type={loading ? 'loading' : isExpand ? 'minus-square-o' : 'plus-square-o'}
              onClick={loading ? undefined : () => this.handleTableExpand(!isExpand, record)}
            />
          );
          return (
            <span
              style={{ paddingLeft: indent * INDENT_SIZE, display: 'block' }}
              className={classNames({
                [styles['hpfm-organization-lazy-tree-no-child']]: hasExpand,
              })}
            >
              {expandIcon}
              {unitCode}
            </span>
          );
        },
      },
      {
        dataIndex: 'unitName',
        title: intl.get('entity.organization.name').d('组织名称'),
        flexGrow: 1,
        minWidth: 200,
        resizable: true,
      },
      {
        dataIndex: 'unitTypeMeaning',
        title: intl.get('entity.organization.type').d('组织类型'),
        width: 130,
        resizable: true,
      },
      {
        dataIndex: 'orderSeq',
        title: intl.get('hpfm.common.model.common.orderSeq').d('排序号'),
        width: 110,
        sortable: true,
        resizable: true,
      },
      {
        dataIndex: 'supervisorFlag',
        title: intl.get('hpfm.organization.model.unit.supervisorFlag').d('主管组织'),
        width: 90,
        resizable: true,
        align: 'center',
        render: ({ rowData: record }) => {
          const { supervisorFlag } = record;
          return yesOrNoRender(supervisorFlag);
        },
      },
      {
        key: 'operator',
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 190,
        resizable: true,
        fixed: 'right',
        render: ({ rowData: record }) => {
          const { _status, enabledFlag } = record;
          const actions = [];
          if (_status) {
            actions.push({
              key: 'clear',
              len: 2,
              ele: (
                <a onClick={() => this.handleClearRecord(record)}>
                  {intl.get('hzero.common.button.clean').d('清除')}
                </a>
              ),
            });
          } else {
            switch (enabledFlag) {
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
                  key: 'new-child',
                  len: 4,
                  title: intl.get('hzero.common.button.addChildren').d('新增下级'),
                  ele: (
                    // <a onClick={() => this.handleAddRecordChild(record)}>
                    <a onClick={() => this.handleAddChildRecord(record)}>
                      {intl.get('hzero.common.button.addChildren').d('新增下级')}
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
          }
          return operatorRender(actions);
        },
      },
    ];
  }

  // EditDrawer

  /**
   * 保存 - 单条组织行数据修改后保存
   * @param {Object} values 修改后的数据
   */
  @Bind()
  handleDrawerOk(params) {
    const { saveEditData, organizationId } = this.props;
    const values = omit(params, ['children', '_parent']);
    saveEditData({
      tenantId: organizationId,
      values,
      customizeUnitCode: 'SPFM.ORGANIZATION.LIST_TREE,SPFM.ORGANIZATION.EDIT_FORM',
    }).then((res) => {
      if (res) {
        this.setState({
          drawerVisible: false,
          editRecord: {},
        });
        const { loadData } = this.props;
        loadData();
        notification.success();
      }
    });
  }

  @Bind()
  handleCreateDrawerOk(params) {
    const { saveAddData, organizationId } = this.props;
    saveAddData({
      tenantId: organizationId,
      data: params,
      customizeUnitCode: 'SPFM.ORGANIZATION.LIST_TREE,SPFM.ORGANIZATION.EDIT_FORM',
    }).then((res) => {
      if (res) {
        this.setState({
          createDrawerVisible: false,
          createRecord: {},
        });
        notification.success();
        const { loadData } = this.props;
        loadData();
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

  @Bind()
  @Bind()
  handleCreateDrawerCancel() {
    this.setState({
      createDrawerVisible: false,
      createRecord: {},
    });
  }

  render() {
    const {
      dataSource = [],
      expandKeys = [],
      loadingExpandKeys = [],
      organizationId,
      unitType = [],
      fetchOrgInfoLoading = false,
      saveEditDataLoading = false,
      saveAddDataLoading = false,
      forbidLineLoading = false,
      enabledLineLoading = false,
      sortType,
      sortColumn,
      onSortColumn,
      customizeH0Form,
      customizeVTable,
    } = this.props;
    const {
      drawerVisible = false,
      editRecord = {},
      createDrawerVisible = false,
      createRecord = {},
    } = this.state;
    const columns = this.getColumns();
    return (
      <div>
        <div className="table-operator">
          <Button onClick={this.handleCreateBtnClick} type="primary">
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {/* <Button
            onClick={this.handleSaveBtnClick}
            loading={saveAddDataLoading}
            disabled={this.getSaveBtnDisabled()}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button> */}
        </div>
        {/* <EditTable
          bordered
          pagination={false}
          rowKey="unitId"
          className={styles['hpfm-organization-lazy-tree']}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={dataSource}
          expandedRowKeys={expandKeys}
          loading={
            (fetchOrgInfoLoading && isEmpty(loadingExpandKeys)) ||
            forbidLineLoading ||
            enabledLineLoading
          }
        /> */}
        {customizeVTable(
          {
            code: 'SPFM.ORGANIZATION.LIST_TREE',
            dataSet: this.vTableDs,
          },
          <PerformanceTable
            isTree
            shouldUpdateScroll={false}
            bordered
            rowKey="unitId"
            virtualized
            sortType={sortType}
            sortColumn={sortColumn}
            onSortColumn={onSortColumn}
            className={styles['hpfm-organization-lazy-tree']}
            data={dataSource}
            rowHeight={32}
            headerHeight={40}
            height={400}
            minHeight={400}
            loading={
              (fetchOrgInfoLoading && isEmpty(loadingExpandKeys)) ||
              forbidLineLoading ||
              enabledLineLoading
            }
            defaultExpandAllRows
            columns={columns}
            pagination={false}
            onExpandChange={this.handleTableExpand}
            expandedRowKeys={expandKeys}
            scroll={{ x: tableScrollWidth(columns), y: 400 }}
          />
        )}
        {drawerVisible && (
          <EditDrawer
            customizeForm={customizeH0Form}
            tenantId={organizationId}
            unitType={unitType}
            loading={saveEditDataLoading}
            visible={drawerVisible}
            anchor="right"
            title={intl.get('hpfm.organization.view.message.edit').d('组织信息修改')}
            onCancel={this.handleDrawerCancel}
            onOk={this.handleDrawerOk}
            itemData={editRecord}
          />
        )}
        {createDrawerVisible && (
          <CreateDrawer
            customizeForm={customizeH0Form}
            tenantId={organizationId}
            unitType={unitType}
            loading={saveAddDataLoading}
            anchor="right"
            title={intl.get('hpfm.organization.view.message.addUnit').d('新增组织')}
            onCancel={this.handleCreateDrawerCancel}
            onOk={this.handleCreateDrawerOk}
            itemData={createRecord}
          />
        )}
      </div>
    );
  }
}
