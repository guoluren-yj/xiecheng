/**
 * 接口权限审批
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/8/24
 * @copyright HAND ® 2021
 */
import React from 'react';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Table, DataSet, Modal, Select } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { TagRender } from 'hzero-front/lib/utils/renderer';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import getLang from '@/langs/approvalLang';
import { todoTableDS, approvalTableDS, expandedTableDS } from '@/stores/Approval/ApprovalDS';
import {
  APPROVAL_STATUS_TAGS,
  APPROVAL_TYPE_CONSTANTS,
  APPROVAL_STATUS_CONSTANTS,
  SOURCE_TYPE_TAG,
} from '@/constants/constants';
import ApprovalModal from './ApprovalModal';

const { TabPane } = Tabs;

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class Approval extends React.Component {
  constructor(props) {
    super(props);

    this.todoTableDS = new DataSet(todoTableDS());
    this.approvalTableDS = new DataSet(approvalTableDS());
  }

  handleRefresh() {
    Promise.all([this.todoTableDS.query(), this.approvalTableDS.query()]);
  }

  toggle(record) {
    const { approvalType, instanceId } = record.toData();
    if (approvalType === APPROVAL_TYPE_CONSTANTS.WORKFLOW && instanceId) {
      this.handleGotoTodoTaskDetail(instanceId);
      return true;
    }
    if (approvalType === APPROVAL_TYPE_CONSTANTS.FUNCTION) {
      this.openApprovalModal(record);
      return true;
    }
  }

  /**
   * 打开接口权限申请滑窗
   */
  @Bind()
  openApprovalModal(record) {
    const {
      match: { path },
    } = this.props;
    const modalProps = {
      path,
      approvalData: record.toData(),
      onRefresh: () => this.handleRefresh(),
    };
    Modal.open({
      title: getLang('HEADER'),
      closable: true,
      style: { width: 800 },
      okText: getLang('SAVE'),
      children: <ApprovalModal {...modalProps} />,
    });
  }

  /**
   * 跳转到工作流[我参与的流程]明细页
   */
  @Bind()
  handleGotoTodoTaskDetail(instanceId) {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/hwkf/process-monitor/detail/${instanceId}`,
      })
    );
  }

  /**
   * 状态过滤，只保留已通过和已拒绝状态
   * @param {string} record
   */
  @Bind
  handleStatusOptionFilter(record) {
    const { APPROVED, REJECTED } = APPROVAL_STATUS_CONSTANTS;
    return [APPROVED, REJECTED].includes(record.get('value'));
  }

  /**
   * 子行渲染
   */
  @Bind()
  handleExpandedRowRenderer({ record }) {
    const { permissionApplyLineList = [] } = record.toData();
    const tempExpandedTableDS = new DataSet(
      expandedTableDS({
        initialData: permissionApplyLineList,
      })
    );
    return (
      <Table dataSet={tempExpandedTableDS} columns={this.expandedColumns} highLightRow={false} />
    );
  }

  get todoColumns() {
    return [
      {
        name: 'applyCode',
        width: 220,
        lock: 'left',
        renderer: ({ value, record }) => <a onClick={() => this.toggle(record)}>{value}</a>,
      },
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 150,
      },
      {
        name: 'submitter',
        width: 150,
      },
      {
        name: 'applyReason',
      },
      {
        name: 'submittedTime',
        width: 150,
        align: 'center',
      },
    ];
  }

  get approvalColumns() {
    return [
      {
        name: 'applyCode',
        width: 220,
        lock: 'left',
        renderer: ({ value, record }) => {
          if (
            record.get('approvalType') === APPROVAL_TYPE_CONSTANTS.WORKFLOW &&
            record.get('instanceId')
          ) {
            return (
              <a onClick={() => this.handleGotoTodoTaskDetail(record.get('instanceId'))}>{value}</a>
            );
          }
          return value;
        },
      },
      {
        name: 'tenantName',
        width: 150,
      },
      {
        name: 'submitter',
        width: 150,
      },
      {
        name: 'applyReason',
      },
      {
        name: 'submittedTime',
        width: 150,
        align: 'center',
      },
      {
        name: 'approvalTime',
        width: 150,
        align: 'center',
      },
      {
        name: 'statusCode',
        width: 100,
        align: 'center',
        renderer: ({ value, record }) =>
          TagRender(value, APPROVAL_STATUS_TAGS, record.get('statusCodeMeaning')),
      },
      {
        name: 'approvalReason',
      },
    ];
  }

  get expandedColumns() {
    return [
      !isTenantRoleLevel() && {
        name: 'tenantName',
        width: 120,
      },
      {
        name: 'interfaceCode',
      },
      {
        name: 'interfaceName',
      },
      {
        name: 'serverCode',
      },
      {
        name: 'serverName',
      },
      {
        name: 'namespace',
        width: 120,
      },
      isTenantRoleLevel() && {
        name: 'sourceType',
        width: 90,
        align: 'center',
        renderer: ({ value, text }) => TagRender(value, SOURCE_TYPE_TAG, text),
      },
    ];
  }

  render() {
    return (
      <>
        <Header title={getLang('HEADER')} />
        <Content>
          <Tabs defaultActiveKey="todoList" className="page-tabs">
            <TabPane tab={getLang('TODO_LIST')} key="todoList">
              <Table
                mode="tree"
                dataSet={this.todoTableDS}
                columns={this.todoColumns}
                expandedRowRenderer={this.handleExpandedRowRenderer}
              />
            </TabPane>
            <TabPane tab={getLang('APPROVAL_LIST')} key="approvalList">
              <Table
                mode="tree"
                dataSet={this.approvalTableDS}
                columns={this.approvalColumns}
                queryFields={{
                  statusCode: <Select optionsFilter={this.handleStatusOptionFilter} />,
                }}
                expandedRowRenderer={this.handleExpandedRowRenderer}
              />
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}
