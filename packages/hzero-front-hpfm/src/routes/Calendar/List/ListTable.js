import React from 'react';
import { Table, Tag } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { Bind, Throttle } from 'lodash-decorators';
import { isString } from 'lodash';
import { queryBatchApprovaFlag } from 'srm-front-boot/lib/utils/utils';
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';
import { Button as ButtonPermission } from 'components/Permission';

import { tableScrollWidth, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

import { revokeWorkFlowByKey } from '@/services/commonService';
/**
 * 日历数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 分页查询
 * @reactProps {Function} editDetail - 查看详情
 * @reactProps {Function} editRow - 编辑行
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class ListTable extends React.Component {
  /**
   * state初始化
   * @param {object} props - 组件props
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  /**
   * render
   * @returns React.element
   */
  @Bind()
  @Throttle(1000)
  handleRevoke(record) {
    const { onSearch, onSelect } = this.props;
    return new Promise(async (resolve) => {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.common.view.revokeApproval.tip`')
          .d('是否确认撤销审批？撤销后您仍可再次提交发起审批（仅工作流审批发起人可撤销审批）'),
        onOk: async () => {
          const res = await revokeWorkFlowByKey({ businessKey: record.workflowBusinessKey });
          if (isString(res)) {
            notification.error({
              message: intl.get('hzero.common.status.mistake').d('错误'),
              description: res,
            });
          } else if (res && !res?.failed) {
            resolve(true);
            notification.success();
            onSelect([], []);
            onSearch();
          }
          resolve(false);
        },
        afterClose: () => {
          resolve(false);
        },
      });
    });
  }

  @Bind()
  @Throttle(1000)
  handleApprove(record) {
    this.setState({ loading: true });
    return new Promise(async (resolve) => {
      const { onSearch, onSelect } = this.props;
      const res = await queryBatchApprovaFlag([record.workflowBusinessKey]);
      this.setState({ loading: false });
      if (getResponse(res)) {
        openApproveModal({
          modalProps: {
            title: intl.get('hzero.common.button.approval').d('审批'),
            closable: true,
          },
          taskId: res[record.workflowBusinessKey]?.taskId,
          processInstanceId: res[record.workflowBusinessKey]?.processInstanceId,
          onSuccess: () => {
            onSelect([], []);
            onSearch();
          },
        });
      }
      resolve(true);
    });
  }

  render() {
    const {
      loading,
      dataSource,
      pagination,
      onSearch,
      onEditRow,
      onEditDetail,
      path,
      selectedRowKeys,
      onSelect,
    } = this.props;

    const columns = [
      {
        title: intl.get('hzero.common.common.status').d('状态'),
        dataIndex: 'calendarStatusCode',
        render: (value, record) => (
          <Tag
            color={
              ['NEW', 'APPROVING', 'WORKFLOW_APPROVAL'].includes(value)
                ? 'orange'
                : value === 'REJECTED'
                ? 'red'
                : 'green'
            }
          >
            {record.calendarStatusCodeMeaning}
          </Tag>
        ),
      },
      {
        title: intl.get('hpfm.calendar.model.calendar.calendarName').d('描述'),
        dataIndex: 'calendarName',
      },
      {
        title: intl.get('hpfm.calendar.model.calendar.country').d('国家/地区'),
        dataIndex: 'countryName',
      },
      {
        title: intl.get('smdm.common.model.costCenter.company').d('公司'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get('smdm.taxRateOrg.model.taxRate.isDefault').d('是否默认'),
        dataIndex: 'defaultFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get('hpfm.calendar.model.calendar.maintain').d('日历维护'),
        dataIndex: 'maintain',
        width: 90,
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => onEditDetail(record)}>
              {intl.get('hpfm.calendar.model.calendar.maintain').d('日历维护')}
            </a>
          </span>
        ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 200,
        fixed: 'right',
        render: (val, record) => {
          return (
            <span className="action-link">
              <ButtonPermission
                onClick={() => onEditRow(record)}
                type="c7n-pro"
                funcType="link"
                permissionList={[
                  {
                    code: `${path}.button.edit`,
                    type: 'button',
                    meaning: '日历定义-编辑',
                  },
                ]}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </ButtonPermission>
              {String(record.workflowApprovalFlag) === '1' && (
                <ButtonPermission
                  type="c7n-pro"
                  onClick={() => this.handleApprove(record)}
                  funcType="link"
                  wait={500}
                  loading={this.state.loading}
                  // permissionList={[
                  //   {
                  //     code: `${path}.button.edit`,
                  //     type: 'button',
                  //     meaning: '日历定义-编辑',
                  //   },
                  // ]}
                >
                  {intl.get('hzero.common.button.approval').d('审批')}
                </ButtonPermission>
              )}
              {String(record.workflowRevokeFlag) === '1' && (
                <ButtonPermission
                  type="c7n-pro"
                  onClick={() => this.handleRevoke(record)}
                  funcType="link"
                  wait={500}
                  // permissionList={[
                  //   {
                  //     code: `${path}.button.edit`,
                  //     type: 'button',
                  //     meaning: '日历定义-编辑',
                  //   },
                  // ]}
                >
                  {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
                </ButtonPermission>
              )}
            </span>
          );
        },
      },
    ];
    return (
      <Table
        bordered
        rowKey="calendarId"
        loading={loading}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onSearch(page)}
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedKeys, selectedRows) => onSelect(selectedKeys, selectedRows),
        }}
      />
    );
  }
}
