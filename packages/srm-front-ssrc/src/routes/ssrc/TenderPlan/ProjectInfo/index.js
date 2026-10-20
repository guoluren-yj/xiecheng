/**
 * ProjectInfo - 项目信息维护界面
 * @date: 2019-4-17
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Table, Popover } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isUndefined, isEmpty, isString } from 'lodash';
import { Modal as C7NModal } from 'choerodon-ui/pro';
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import remotes from 'hzero-front/lib/utils/remote';

import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button as PermissionButton } from 'components/Permission';
import { queryBatchApprovaFlag } from '_utils/utils';
import { getBatchOperationFlag } from '@/utils/utils';
import { revokeWorkFlowByKey } from '@/services/tenderPlanService';

import FilterForm from './FilterForm';

const promptCode = 'ssrc.tenderPlan.model.tenderPlan';

@remotes(
  {
    code: 'SSRC_PROJECT_INFO',
    name: 'remote',
  },
  {
    events: {
      handleDidMountCux() {},
    },
  }
)
@withCustomize({
  unitCode: ['SSRC.PROJECT_UPDATE.INFO', 'SSRC.PROJECT.LIST', 'SSRC.PROJECT.FILTER'],
})
/**
 * 项目信息维护
 * @extends {Component} - Component
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['ssrc.tenderPlan', 'ssrc.common'],
})
@connect(({ tenderPlan, loading }) => ({
  tenderPlan,
  loading: loading.effects['tenderPlan/fetchProjectInfo'],
  deleteLoading: loading.effects['tenderPlan/deleteProjectInfoDetail'],
}))
export default class ProjectInfo extends Component {
  state = {
    organizationId: getCurrentOrganizationId(),
    approvaFlags: {},
    operationFlags: {},
    approveLoaing: false,
  };

  componentDidMount() {
    this.handleSearch();
    this.querySelectList();

    this.handleRemote();
  }

  /**
   * 查询
   * @param {Object} params 分页参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const form = this.filterForm;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const filterValues = {
      ...formValues,
    };
    dispatch({
      type: 'tenderPlan/fetchProjectInfo',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode: 'SSRC.PROJECT.LIST,SSRC.PROJECT.FILTER',
      },
    }).then(async () => {
      const {
        tenderPlan: { projectInfoList = [] },
      } = this.props;
      const workFlowBussinessKeys = projectInfoList.reduce((acc, cur) => {
        const value = cur.workflowBusinessKey;
        if (value) {
          acc.push(value);
        }
        return acc;
      }, []);
      if (!isEmpty(workFlowBussinessKeys)) {
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
        // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
        this.setState({ approvaFlags, operationFlags });
      }
    });
  }

  /**
   * 查询下拉框值集:{projectStatusList:状态}
   */
  @Bind()
  querySelectList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'tenderPlan/fetchSelectList',
    });
  }

  // cux
  handleRemote = () => {
    const { remote } = this.props;
    if (remote?.event) {
      const eventProps = {
        that: this,
      };
      remote.event.fireEvent('handleDidMountCux', eventProps);
    }
  };

  /**
   * 跳转路由
   * @param {Object} record 行数据
   */
  @Bind()
  handleGoDetail({ projectId = '', projectStatus = '' }) {
    if (projectId && ['RELEASE_APPROVING', 'WORKFLOW_APPROVAL'].includes(projectStatus)) {
      this.props.history.push(`/ssrc/project-maintenance/project-read/${projectId}`);
    } else if (projectId) {
      this.props.history.push(`/ssrc/project-maintenance/project-detail/${projectId}`);
    } else {
      this.props.history.push('/ssrc/project-maintenance/create');
    }
  }

  /**
   * 删除项目信息
   */
  @Bind()
  handleDeleteProject(record) {
    const { dispatch } = this.props;
    const { projectId } = record;
    Modal.confirm({
      title: intl.get('ssrc.tenderPlan.view.message.confirm.deleteFlag').d('是否确认删除'),
      onOk: () => {
        if (projectId) {
          dispatch({
            type: 'tenderPlan/deleteProjectInfoDetail',
            payload: {
              projectId,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleSearch();
            }
          });
        }
      },
    });
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref.props.form;
  }

  /**
   * 撤销审批
   * @returns React.element
   */
  @Bind()
  @Throttle(1000)
  handleRevoke(record) {
    this.setState({ approveLoaing: true });
    return new Promise(async (resolve) => {
      C7NModal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.common.view.revokeApproval.tip')
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
            this.handleSearch();
          }
          this.setState({ approveLoaing: false });
          resolve(false);
        },
        afterClose: () => {
          this.setState({ approveLoaing: false });
          resolve(false);
        },
      });
    });
  }

  @Bind()
  @Throttle(1000)
  handleApprove(record) {
    this.setState({ approveLoaing: true });
    return new Promise(async (resolve) => {
      const res = await queryBatchApprovaFlag([record.workflowBusinessKey]);
      if (getResponse(res)) {
        openApproveModal({
          modalProps: {
            title: intl.get('hzero.common.button.approval').d('审批'),
            closable: true,
          },
          taskId: res[record.workflowBusinessKey]?.taskId,
          processInstanceId: res[record.workflowBusinessKey]?.processInstanceId,
          onSuccess: () => {
            this.handleSearch();
          },
        });
      }
      this.setState({ approveLoaing: false });
      resolve(true);
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const form = this.filterForm;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const filterValues = {
      ...formValues,
    };
    return filterValues;
  }

  render() {
    const {
      remote,
      loading = false,
      deleteLoading = false,
      customizeTable,
      customizeFilterForm,
      tenderPlan: { projectInfoList = [], projectInfoPagination = {}, projectStatusList = [] },
    } = this.props;
    const { organizationId, operationFlags, approvaFlags, approveLoaing } = this.state;

    const filterProps = {
      organizationId,
      customizeFilterForm,
      projectStatusList,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };

    const columns = [
      {
        title: intl.get(`${promptCode}.projectNum`).d('项目编码'),
        dataIndex: 'projectNum',
        width: 140,
        render: (text, record) => (
          <a
            onClick={() =>
              this.handleGoDetail({
                projectId: record.projectId,
                projectStatus: record.projectStatus,
              })
            }
          >
            {text}
          </a>
        ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'projectStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.projectName`).d('项目名称'),
        dataIndex: 'projectName',
        width: 120,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 120,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.ouName`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.projectUserName`).d('项目负责人'),
        dataIndex: 'realName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.phone`).d('手机号'),
        dataIndex: 'phone',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.email`).d('邮箱'),
        dataIndex: 'email',
      },
      {
        title: intl.get(`${promptCode}.projectAddress`).d('项目地址'),
        dataIndex: 'projectAddress',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.fundsSource`).d('资金来源'),
        dataIndex: 'fundsSourceMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.createdByName`).d('创建人'),
        dataIndex: 'createdByName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 110,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        width: 100,
        align: 'center',
        dataIndex: 'enabledFlag',
        render: (_, record) => {
          return record.enabledFlag === 1 ? yesOrNoRender(1) : yesOrNoRender(0);
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        fixed: 'right',
        width: 200,
        dataIndex: 'edit',
        render: (text, record) => {
          const { workflowBusinessKey } = record;
          if (['NEW', 'RELEASE_REJECTED'].includes(record.projectStatus)) {
            return (
              <span className="action-link">
                <a onClick={() => this.handleDeleteProject(record)}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </a>
              </span>
            );
          } else if (['WORKFLOW_APPROVAL'].includes(record.projectStatus)) {
            // return null;
            return (
              <div>
                {approvaFlags[workflowBusinessKey] && (
                  <PermissionButton
                    loading={approveLoaing}
                    data-name="approve"
                    funcType="link"
                    type="c7n-pro"
                    onClick={() => this.handleApprove(record)}
                  >
                    {intl.get('hzero.common.button.approval').d('审批')}
                  </PermissionButton>
                )}
                {operationFlags[workflowBusinessKey]?.REVOKE && (
                  <PermissionButton
                    loading={approveLoaing}
                    funcType="link"
                    data-name="revock"
                    type="c7n-pro"
                    onClick={() => this.handleRevoke(record)}
                  >
                    {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
                  </PermissionButton>
                )}
              </div>
            );
          } else {
            return null;
          }
        },
      },
    ];

    let button = [
      <PermissionButton
        name="add"
        icon="plus"
        type="primary"
        onClick={() => this.handleGoDetail({})}
        permissionList={[
          {
            code: `srm.source-plan.project.button.list.create`,
            type: 'button',
            meaning: '新建',
          },
        ]}
      >
        {intl.get('hzero.common.button.create').d('新建')}
      </PermissionButton>,
      <ExcelExportPro
        name="exportPro"
        templateCode="SSRC_PROJECT_EXPORT"
        buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
        requestUrl={`${SRM_SSRC}/v1/${organizationId}/project/export`}
        queryParams={this.handleGetFormValue()}
        otherButtonProps={{
          icon: 'unarchive',
          type: 'c7n-pro',
          permissionList: [
            {
              code: 'srm.source-plan.project.ps.new.list.export',
              type: 'button',
            },
          ],
        }}
      />,
      <ExcelExport
        name="export"
        requestUrl={`${SRM_SSRC}/v1/${organizationId}/project/export`}
        queryParams={this.handleGetFormValue()}
        otherButtonProps={{
          icon: 'unarchive',
          type: 'c7n-pro',
          permissionList: [
            {
              code: 'srm.source-plan.project.ps.list.export',
              type: 'button',
            },
          ],
        }}
      />,
    ];

    let cuxTableProps = {};

    if (remote?.process) {
      button = remote.process('SSRC_PROJECT_INFO_PROCESS_BUTTONS', button, {
        that: this,
      });
      cuxTableProps = remote.process('SSRC_PROJECT_INFO_PROCESS_TABLE_PROPS', {}, {
        columns,
        dataSource: projectInfoList,
        pagination: projectInfoPagination,
        onChange: this.handleSearch,
        that: this,
      });
    }

    button = button || [];

    return (
      <React.Fragment>
        <Header
          title={intl
            .get('ssrc.tenderPlan.view.message.title.projectInfoMaintenance')
            .d('项目信息维护')}
        >
          {button}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            { code: 'SSRC.PROJECT.LIST' },
            <Table
              bordered
              loading={loading || deleteLoading}
              rowKey="projectId"
              columns={columns}
              dataSource={projectInfoList}
              pagination={projectInfoPagination}
              onChange={this.handleSearch}
              scroll={{ x: this.scrollWidth(columns, 100) }}
              {...cuxTableProps}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
