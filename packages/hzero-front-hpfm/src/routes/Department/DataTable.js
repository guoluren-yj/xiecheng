import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { Icon } from 'hzero-ui';
import { PerformanceTable, DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { operatorRender, yesOrNoRender } from 'utils/renderer';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import { notification } from 'choerodon-ui';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { queryRelatedInformation } from '@/services/departmentService';

import styles from './index.less';

const INDENT_SIZE = 16;
const organizationId = getCurrentOrganizationId();

/**
 * 部门维护-数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} addLine - 新增部门
 * @reactProps {Function} clearLine - 清除新增部门
 * @reactProps {Function} forbidLine - 禁用部门
 * @reactProps {Function} enabledLine - 启用部门
 * @reactProps {Function} showSubLine - 下级部门展示
 * @reactProps {Function} gotoSubGrade - 部门分配岗位
 * @reactProps {Function} activeLine - 编辑框激活
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Array} expandedRowKeys - 展开行标识
 * @return React.element
 */
@WithCustomize({
  unitCode: ['SPFM.ORGANIZATION.RELATED_INFORMATION', 'SPFM.ORGANIZATION.PAGE_DEPLIST'],
})
export default class DataTable extends PureComponent {
  vTableDs = new DataSet({});

  /**
   * 点击'+',获取当前节点的下级节点
   * @param {Boolean} isExpand 展开标记
   * @param {Object} record  当前行
   */
  @Bind()
  handleExpandRow(isExpand, record) {
    this.props.onShowSubLine(isExpand, record);
  }

  @Bind()
  displayCost(val) {
    if (val) {
      if (val.length === 1) {
        return <div>{val[0].costName}</div>;
      } else {
        return (
          <a onClick={() => this.openCostModal(val)}>
            {' '}
            {intl.get('hpfm.department.model.department.viewMore').d('点击查看更多')}{' '}
          </a>
        );
      }
    } else {
      return null;
    }
  }

  @Bind()
  openCostModal(val) {
    const { handleCostView } = this.props;
    handleCostView(
      val.map((o) => o.costId),
      val
    );
  }

  @Bind()
  async handleRelatedInformation(record) {
    const { customizeTable } = this.props;
    const unitId = record?.unitId ?? '';
    const customizeUnitCode = 'SPFM.ORGANIZATION.RELATED_INFORMATION';
    const tableDs = {
      fields: [
        {
          label: intl.get('smde.modelDesigner.view.message.primaryKey').d('主键'),
          name: 'unitLineAttId',
          width: 120,
        },
      ],
      transport: {
        destroy: ({ data }) => {
          return {
            url: `/spfm/v1/${organizationId}/hr/unit/line-attr/${unitId}?customizeUnitCode=${customizeUnitCode}`,
            method: 'DELETE',
            data,
          };
        },
        submit: ({ data }) => {
          return {
            url: `/spfm/v1/${organizationId}/hr/unit/line-attr/${unitId}?customizeUnitCode=${customizeUnitCode}`,
            method: 'PUT',
            data,
          };
        },
      },
    };

    const relatedInformationTableDs = new DataSet({
      ...tableDs,
    });
    const columns = [
      {
        name: 'unitLineAttId',
      },
    ];
    let listData = [];
    const res = await queryRelatedInformation({
      unitId,
      customizeUnitCode: 'SPFM.ORGANIZATION.RELATED_INFORMATION',
    });
    if (res && res.content) {
      listData = res.content;
    } else if (res.failed) {
      notification.error({ message: res.message });
    }
    relatedInformationTableDs.loadData(listData);
    Modal.open({
      key: Modal.key(),
      style: { width: '600px' },
      destroyOnClose: true,
      title: intl.get('hpfm.department.model.department.relatedInformation').d('关联信息'),
      children: (
        <>
          {customizeTable(
            {
              code: 'SPFM.ORGANIZATION.RELATED_INFORMATION',
              dataSet: relatedInformationTableDs,
            },
            <Table
              dataSet={relatedInformationTableDs}
              columns={columns}
              key="relatedInformationTable"
              buttons={['add', 'delete', 'save']}
              autoFocus
            />
          )}
        </>
      ),
      onOk: () => {},
    });
  }

  /**
   * 分配岗位
   * @param {Object} record 操作对象
   */
  @Bind()
  gotoSubGrade(record) {
    this.props.gotoSubGrade(record);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      dataSource,
      loading,
      expandedRowKeys,
      onClearLine,
      onAddLine,
      onEnabledLine,
      onForbidLine,
      onEdit,
      customizeVTable,
      sortType,
      sortColumn,
      onSortColumn,
    } = this.props;
    const columns = [
      {
        title: intl.get('entity.department.code').d('部门编码'),
        dataIndex: 'unitCode',
        width: 300,
        resizable: true,
        render: ({ rowData: record }) => {
          const { unitId, unitCode, levelPath, children } = record;
          const indent = levelPath.split('|').length;
          const isExpand = expandedRowKeys.includes(unitId);
          const hasExpand = !isEmpty(children);
          const expandIcon = hasExpand ? (
            <Icon
              style={{ marginRight: '8px' }}
              type={isExpand ? 'minus-square-o' : 'plus-square-o'}
              onClick={() => this.handleExpandRow(!isExpand, record)}
            />
          ) : null;
          return (
            <span
              style={{ paddingLeft: (indent - 2) * INDENT_SIZE + 8, display: 'block' }}
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
        title: intl.get('entity.department.name').d('部门名称'),
        dataIndex: 'unitName',
        minWidth: 200,
        flexGrow: 1,
        resizable: true,
      },
      {
        title: intl.get('hpfm.department.model.department.principalEmployeeId').d('部门负责员工'),
        dataIndex: 'principalEmployeeId',
        width: 120,
        render: ({ rowData: record }) => record.principalEmployeeName,
        resizable: true,
      },
      {
        title: intl.get('hpfm.department.model.department.enableBudgetFlag').d('是否启用预算'),
        dataIndex: 'enableBudgetFlag',
        width: 120,
        align: 'center',
        resizable: true,
        render: ({ rowData: record, dataIndex }) => yesOrNoRender(record[dataIndex]),
      },
      {
        title: intl.get('hpfm.department.model.department.ownerCostCentral').d('所属成本中心'),
        dataIndex: 'costCenters',
        width: 150,
        resizable: true,
        render: ({ rowData: record, dataIndex }) => this.displayCost(record[dataIndex]),
      },
      {
        title: intl.get('hpfm.department.model.department.quickIndex').d('快速索引'),
        dataIndex: 'quickIndex',
        width: 200,
        resizable: true,
      },
      {
        title: intl.get('hpfm.department.model.department.phoneticize').d('拼音'),
        dataIndex: 'phoneticize',
        width: 120,
        resizable: true,
      },
      {
        title: intl.get('hpfm.department.model.department.relatedInformation').d('关联信息'),
        dataIndex: 'relatedInformation',
        width: 120,
        resizable: true,
        render: ({ rowData: record }) => (
          <a onClick={() => this.handleRelatedInformation(record)}>
            {intl.get('hpfm.department.model.department.relatedInformation').d('关联信息')}
          </a>
        ),
      },
      {
        title: intl.get('hpfm.common.model.common.orderSeq').d('排序号'),
        dataIndex: 'orderSeq',
        width: 150,
        sortable: true,
        resizable: true,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 200,
        resizable: true,
        fixed: 'right',
        render: ({ rowData: record }) => {
          const actions = [];
          if (record._status === 'create') {
            actions.push({
              key: 'clean',
              len: 2,
              title: intl.get('hzero.common.button.clean').d('清除'),
              ele: (
                <a onClick={() => onClearLine(record)}>
                  {intl.get('hzero.common.button.clean').d('清除')}
                </a>
              ),
            });
          } else if (record.enabledFlag) {
            actions.push({
              key: 'edit',
              len: 2,
              ele: (
                <a onClick={() => onEdit(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              ),
            });
            actions.push({
              key: 'add-children',
              len: 4,
              title: intl.get('hzero.common.button.addChildren').d('新增下级'),
              ele: (
                <a onClick={() => onAddLine(record)}>
                  {intl.get('hzero.common.button.addChildren').d('新增下级')}
                </a>
              ),
            });
            actions.push({
              key: 'disable',
              len: 2,
              title: intl.get('hzero.common.status.disable').d('禁用'),
              ele: (
                <a onClick={() => onForbidLine(record)}>
                  {intl.get('hzero.common.status.disable').d('禁用')}
                </a>
              ),
            });
            actions.push({
              key: 'assign-grade',
              len: 4,
              title: intl.get('hpfm.department.view.option.assign').d('分配岗位'),
              ele: (
                <a onClick={() => this.gotoSubGrade(record)}>
                  {intl.get('hpfm.department.view.option.assign').d('分配岗位')}
                </a>
              ),
            });
          } else {
            actions.push({
              key: 'edit',
              len: 2,
              ele: (
                <a onClick={() => onEdit(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              ),
            });
            actions.push({
              key: 'disable',
              len: 2,
              title: intl.get('hzero.common.status.disable').d('禁用'),
              ele: (
                <a style={{ color: '#F04134' }}>
                  {intl.get('hzero.common.status.disable').d('禁用')}
                </a>
              ),
            });
            actions.push({
              key: 'enable',
              len: 2,
              title: intl.get('hzero.common.status.enable').d('启用'),
              ele: (
                <a onClick={() => onEnabledLine(record)}>
                  {intl.get('hzero.common.status.enable').d('启用')}
                </a>
              ),
            });
            actions.push({
              key: 'assign-grade',
              len: 4,
              title: intl.get('hpfm.department.view.option.assign').d('分配岗位'),
              ele: (
                <a onClick={() => this.gotoSubGrade(record)}>
                  {intl.get('hpfm.department.view.option.assign').d('分配岗位')}
                </a>
              ),
            });
          }
          return operatorRender(actions, record);
        },
      },
    ];
    return (
      // <EditTable
      //   bordered
      //   rowKey="unitId"
      //   className={styles['hpfm-hr-show']}
      //   loading={loading}
      //   columns={columns}
      //   scroll={{ x: tableScrollWidth(columns) }}
      //   dataSource={dataSource}
      //   onExpand={this.handleExpandRow}
      //   expandedRowKeys={expandedRowKeys}
      //   indentSize={24}
      //   pagination={false}
      // />
      customizeVTable(
        {
          code: 'SPFM.ORGANIZATION.PAGE_DEPLIST',
          dataSet: this.vTableDs,
        },
        <PerformanceTable
          isTree
          bordered
          defaultExpandAllRows
          shouldUpdateScroll={false}
          virtualized
          rowHeight={32}
          headerHeight={40}
          height={400}
          minHeight={400}
          customizedCode="SPFM.ORGANIZATION.PAGE_DEPLIST"
          rowKey="unitId"
          sortType={sortType}
          sortColumn={sortColumn}
          onSortColumn={onSortColumn}
          className={styles['hpfm-hr-show']}
          loading={loading}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          data={dataSource}
          onExpand={this.handleExpandRow}
          expandedRowKeys={expandedRowKeys}
          pagination={false}
          customizable
          columnTitleEditable
        />
      )
    );
  }
}
