import React, { Fragment, PureComponent } from 'react';
import EditTable from 'components/EditTable';
import { Button as PermissionButton } from 'components/Permission';
import { Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
/**
 * 员工明细-已分配用户信息列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @return React.element
 */
export default class UserList extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      deleteUserLoading = false,
      dataSource = [],
      selectedRowKeys,
      onAdd,
      onDelete,
      onChange,
      customizeTable,
      custLoading,
      // withIndividuationTable = () => {},
    } = this.props;
    const columns = [
      {
        title: intl.get('entity.user.code').d('用户编码'),
        dataIndex: 'loginName',
        width: 200,
      },
      {
        title: intl.get('entity.user.name').d('用户姓名'),
        dataIndex: 'realName',
      },
    ];
    return (
      <Fragment>
        <div className="table-operator">
          <Tooltip
            title={intl
              .get('hpfm.employee.view.option.user.addtooltips')
              .d(
                '一个员工可以关联多个用户但一个用户只能被一个员工关联，此处新增用户时会自动过滤掉已经被其他员工关联的用户和没有角色的用户。'
              )}
          >
            <PermissionButton
              onClick={onAdd}
              permissionList={[
                {
                  code: `hzero.organization.staff.hpfm.hr.staff.detail.-employeeId.-employeeNum.button.add`,
                  type: 'button',
                  meaning: '新增用户',
                },
              ]}
            >
              {intl.get('hpfm.employee.view.option.user.add').d('新增用户')}
            </PermissionButton>
          </Tooltip>
          <PermissionButton
            onClick={onDelete}
            loading={deleteUserLoading}
            disabled={selectedRowKeys.length === 0}
            permissionList={[
              {
                code: `hzero.organization.staff.hpfm.hr.staff.detail.-employeeId.-employeeNum.button.delete`,
                type: 'button',
                meaning: '删除用户',
              },
            ]}
          >
            {intl.get('hpfm.employee.view.option.user.delete').d('删除用户')}
          </PermissionButton>
        </div>
        {customizeTable(
          { code: 'SPFM.EMPLOYEE_DETAIL.USER_LIST' },
          <EditTable
            bordered
            rowKey="employeeUserId"
            loading={loading || custLoading}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: tableScrollWidth(columns) }}
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
