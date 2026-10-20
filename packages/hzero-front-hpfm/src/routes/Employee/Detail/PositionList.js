import React, { Fragment, PureComponent } from 'react';
import { Checkbox } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { Button as PermissionButton } from 'components/Permission';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
// import notification from 'utils/notification';
// import withIndividuationTable from '@/components/Individuation/withIndividuationTable';

/**
 * 员工明细-已分配岗位信息列表
 * @extends {PureComponent} - React.PureComponent
 //  * @reactProps {Boolean} primaryFlag - 是否已分配主岗标记
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Function} onChange - 维护岗位信息
 * @return React.element
 */
// @withIndividuationTable({
//   tableKey: 'EMPLOYEE_POSITION_TABLE',
//   permissionCode: {
//     tenant: [{ code: 'hzero.personality.table.ps.tenant', type: 'Button'}],
//     user: [{ code: 'hzero.personality.table.ps.user', type: 'Button'}],
//     role: [{ code: 'hzero.personality.table.ps.role', type: 'Button'}],
//   },
// })
export default class PositionList extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource = [],
      selectedRowKeys,
      onChange,
      onAdd,
      onDelete,
      onEditPrimary,
      customizeTable,
      custLoading,
      // withIndividuationTableComponent,
      // withIndividuationTable,
    } = this.props;
    const columns = [
      //       员工定义详情页岗位信息查询接口返回：positionCode（所属岗位编码）、unitCode（所属部门编码）
      // 页面查询条件岗位值集：LOV_POSITION
      // 查询条件字段名：positionId
      {
        title: intl.get('hpfm.employee.model.employee.unitCompanyCode').d('所属公司编码'),
        dataIndex: 'unitCompanyCode',
        width: 150,
      },
      {
        title: intl.get('hpfm.employee.model.employee.unitCompanyName').d('所属公司'),
        dataIndex: 'unitCompanyName',
        width: 220,
      },
      {
        title: intl.get('hpfm.employee.model.employee.unitCode').d('所属部门编码'),
        dataIndex: 'unitCode',
        width: 150,
      },
      {
        title: intl.get('hpfm.employee.model.employee.unitName').d('所属部门'),
        dataIndex: 'unitName',
        width: 220,
      },
      {
        title: intl.get('hpfm.employee.model.employee.positionCode').d('所属岗位编码'),
        dataIndex: 'positionCode',
        width: 150,
      },
      {
        title: intl.get('hpfm.employee.model.employee.positionName').d('所属岗位'),
        dataIndex: 'positionName',
        width: 220,
      },
      {
        title: intl.get('hpfm.employee.model.employee.primaryPositionFlag').d('主岗'),
        dataIndex: 'primaryPositionFlag',
        width: 100,
        render: (val, record) => (
          <Checkbox
            checked={val}
            onChange={(event) => onEditPrimary(record, event.target.checked)}
          />
        ),
      },
    ];
    return (
      <Fragment>
        <div className="table-operator">
          <PermissionButton
            onClick={onAdd}
            permissionList={[
              {
                code: `hzero.organization.staff.hpfm.hr.staff.detail.-employeeId.-employeeNum.button.change`,
                type: 'button',
                meaning: '维护岗位',
              },
            ]}
          >
            {intl.get('hpfm.employee.view.option.change').d('维护岗位')}
          </PermissionButton>
          <PermissionButton
            onClick={onDelete}
            disabled={selectedRowKeys.length === 0}
            permissionList={[
              {
                code: `hzero.organization.staff.hpfm.hr.staff.detail.-employeeId.-employeeNum.button.remove`,
                type: 'button',
                meaning: '删除岗位',
              },
            ]}
          >
            {intl.get('hpfm.employee.view.option.remove').d('删除岗位')}
          </PermissionButton>
        </div>
        {customizeTable(
          { code: 'SPFM.EMPLOYEE_DETAIL.POSTION_LIST' },
          <EditTable
            bordered
            rowKey="positionId"
            scroll={{ x: tableScrollWidth(columns) }}
            loading={loading || custLoading}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            rowSelection={{
              selectedRowKeys,
              onChange,
            }}
          />
        )}
      </Fragment>
    );
  }
}
