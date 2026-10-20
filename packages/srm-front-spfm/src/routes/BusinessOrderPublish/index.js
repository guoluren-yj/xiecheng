/**
 * BusinessOrderPublish - 业务通知单发布
 * @date: 2020-2-24
 * @version: 1.0.0
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isUndefined, isArray, isEmpty, isString } from 'lodash';
import { Modal as C7NModal } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';

import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import hocRemote from 'hzero-front/lib/utils/remote';

import { queryBatchApprovaFlag } from '_utils/utils';
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { getBatchOperationFlag } from './util';
import { revokeWorkFlowByKey } from '@/services/businessOrderPublishService';

import FilterForm from './FilterForm';
import TableList from './TableList';
import OperateRecord from './OperateRecord';
import ExportFormItem from './ExportFormItem';

@hocRemote({
  code: 'SPFM_BUSINESS_ORDER_PUBLISH', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
  name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
})
@withCustomize({
  unitCode: [
    'SPFM.PORTAL.BUSINESSORDER.PUBLISH.TABLELIST',
    'SPFM.PORTAL.BUSINESSORDER.PUBLISH.BTNS',
    'SPFM.PORTAL.BUSINESSORDER.PUBLISH.FILTER',
  ],
})
@formatterCollections({
  code: [
    'spfm.businessOrder',
    'spfm.notice',
    'entity.company',
    'entity.roles',
    'entity.supplier',
    'entity.supplier',
    'entity.company',
    'hwfp.common',
  ],
})
@connect(({ businessOrderPublish, loading }) => ({
  businessOrderPublish,
  fetchDataLoading: loading.effects['businessOrderPublish/fetchDataList'],
  publishLoading: loading.effects['businessOrderPublish/publishBusinessOrder'],
  approveLoading: loading.effects['businessOrderPublish/approvalBusinessOrder'],
  deleteLoading: loading.effects['businessOrderPublish/deleteBusinessOrder'],
  organizationId: getCurrentOrganizationId(),
}))
export default class BusinessOrderPublish extends Component {
  form;

  constructor(props) {
    super(props);

    this.state = {
      notificationId: '',
      notificationFlag: undefined,
    };
  }

  componentDidMount() {
    const {
      businessOrderPublish: { pagination = {} },
    } = this.props;

    this.queryIdpValue();
    this.handleSearch(pagination);
  }

  /**
   * 查询值集
   */
  @Bind()
  queryIdpValue() {
    const { dispatch } = this.props;
    dispatch({
      type: 'businessOrderPublish/queryIdpValue',
    });
  }

  /**
   * 业务通知单列表查询
   * @param {*} page - 分页
   */
  @Bind()
  handleSearch(page) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);

    dispatch({
      type: 'businessOrderPublish/fetchDataList',
      payload: {
        page,
        customizeUnitCode:
          'SPFM.PORTAL.BUSINESSORDER.PUBLISH.TABLELIST,SPFM.PORTAL.BUSINESSORDER.PUBLISH.FILTER',
        ...handleFormValues,
      },
    }).then(async () => {
      const {
        businessOrderPublish: { dataList = [] },
      } = this.props;
      const dataSource = dataList || [];
      const workFlowBussinessKeys = dataSource.reduce((acc, cur) => {
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
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealFromTime = {};
    const dealToTime = {};
    const timeFromArray = ['creationDateFrom'];
    const timeToArray = ['creationDateTo'];
    timeFromArray.forEach((item) => {
      dealFromTime[item] = filterValues[item]
        ? filterValues[item].format(DEFAULT_DATETIME_FORMAT)
        : undefined;
    });
    timeToArray.forEach((item) => {
      dealToTime[item] = filterValues[item]
        ? filterValues[item].format(DEFAULT_DATETIME_FORMAT)
        : undefined;
    });
    return {
      ...filterValues,
      ...dealFromTime,
      ...dealToTime,
    };
  }

  /**
   * 绑定查询form
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 绑定操作记录ref
   */
  @Bind()
  handleBindoperateRef(ref = {}) {
    this.operateRecord = ref;
  }

  /**
   * 查询form重置
   */
  @Bind()
  resetFields() {
    this.form.resetFields();
  }

  /**
   * table行勾选
   */
  @Bind()
  lineSelectedChange(keys = [], rows = []) {
    const { dispatch } = this.props;
    dispatch({
      type: 'businessOrderPublish/updateState',
      payload: {
        lineSelectedKeys: keys,
        lineSelectedRows: rows,
      },
    });
  }

  /**
   * 发布
   */
  @Bind()
  handlePulishOrder() {
    const {
      dispatch,
      businessOrderPublish: { lineSelectedRows = [] },
    } = this.props;
    dispatch({
      type: 'businessOrderPublish/publishBusinessOrder',
      payload: {
        businessNotificationDTOList: lineSelectedRows,
      },
    }).then((res) => {
      if (getResponse(res)) {
        notification.success();
        this.handleSearch();
        dispatch({
          type: 'businessOrderPublish/updateState',
          payload: {
            lineSelectedKeys: [],
            lineSelectedRows: [],
          },
        });
      }
    });
  }

  /**
   * 发布
   */
  @Bind()
  handleApprove(type) {
    const {
      dispatch,
      businessOrderPublish: { lineSelectedRows = [] },
    } = this.props;
    dispatch({
      type: 'businessOrderPublish/approvalBusinessOrder',
      payload: {
        type,
        businessNotificationDTOList: lineSelectedRows,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
        dispatch({
          type: 'businessOrderPublish/updateState',
          payload: {
            lineSelectedKeys: [],
            lineSelectedRows: [],
          },
        });
      }
    });
  }

  /**
 * 删除
 */
  @Bind()
  handleDelete() {
    const {
      dispatch,
      businessOrderPublish: { lineSelectedRows = [] },
    } = this.props;
    dispatch({
      type: 'businessOrderPublish/deleteBusinessOrder',
      payload: {
        businessNotifications: lineSelectedRows,
      },
    }).then((res) => {
      if (getResponse(res)) {
        notification.success();
        this.handleSearch();
        dispatch({
          type: 'businessOrderPublish/updateState',
          payload: {
            lineSelectedKeys: [],
            lineSelectedRows: [],
          },
        });
      }
    });
  }

  /**
   * 操作记录
   */
  @Bind()
  handShowOperate(record = {}) {
    const { notificationId } = record;
    this.setState(
      {
        notificationId,
      },
      () => {
        this.operateRecord.handleOperatedModal();
      }
    );
  }

  /**
   * 新建
   */
  @Bind()
  handleCreateOrder() {
    const { history } = this.props;
    history.push('/spfm/business-order-publish/detail/create');
  }

  @Bind()
  getExprotParams() {
    const {
      businessOrderPublish: { lineSelectedKeys = [] },
    } = this.props;
    const { notificationFlag } = this.state;

    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());

    const notificationIds = lineSelectedKeys.join(',');
    if (isArray(lineSelectedKeys) && !isEmpty(lineSelectedKeys)) {
      return {
        notificationIds,
        notificationFlag,
        customizeUnitCode: 'SPFM.PORTAL.BUSINESSORDER.PUBLISH.TABLELIST',
      };
    } else {
      return {
        ...fieldValues,
        notificationFlag,
        customizeUnitCode: 'SPFM.PORTAL.BUSINESSORDER.PUBLISH.TABLELIST',
      };
    }
  }

  /**
   * render
   * @returns React.element
   */
  @Bind()
  @Throttle(1000)
  handleRevoke(record) {
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
          } else if (getResponse(res)) {
            resolve(true);
            notification.success();
            this.handleSearch();
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
  handleWorkflowApprove(record) {
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
      resolve(true);
    });
  }

  render() {
    const {
      organizationId,
      fetchDataLoading,
      publishLoading,
      approveLoading,
      deleteLoading,
      businessOrderPublish: {
        dataList = [],
        pagination = {},
        notificationType = [],
        notificationStatus = [],
        lineSelectedRows = [],
        lineSelectedKeys = [],
      },
      customizeTable,
      customizeBtnGroup,
      customizeFilterForm,
      remote,
    } = this.props;
    const { notificationId, approvaFlags, operationFlags } = this.state;
    const formProps = {
      customizeFilterForm,
      organizationId,
      notificationType,
      notificationStatus,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      pagination,
      dataSource: dataList,
      fetchDataLoading,
      approvaFlags,
      operationFlags,
      handleRevoke: this.handleRevoke,
      handleWorkflowApprove: this.handleWorkflowApprove,
      onHandleChange: this.handleSearch,
      showOperate: this.handShowOperate,
      lineRowSelection: {
        selectedRowKeys: lineSelectedKeys,
        onChange: this.lineSelectedChange,
      },
      customizeTable,
      remote,
    };

    const operateProps = {
      notificationId,
      onRef: this.handleBindoperateRef,
    };

    const headerButtons = [
      {
        name: 'create',
        noNest: true,
        btnProps: { onClick: this.handleCreateOrder },
        child: (text) => (
          <Button icon="plus" type="primary" onClick={() => this.handleCreateOrder()}>
            {text || intl.get('hzero.common.button.create').d('新建')}
          </Button>
        ),
      },
      {
        name: 'release',
        noNest: true,
        btnProps: { onClick: this.handlePulishOrder },
        child: (text) => (
          <Button
            icon="rocket"
            loading={publishLoading}
            disabled={lineSelectedRows.length === 0 || lineSelectedRows?.some(i => ['APPROVING', 'WORKFLOW_APPROVING', 'NOT_RECEIVE', 'PART_RECEIVE', 'ALL_RECEIVE', 'CANCELLED'].includes(i.notificationStatus))}
            onClick={() => this.handlePulishOrder()}
          >
            {text || intl.get('hzero.common.button.release').d('发布')}
          </Button>
        ),
      },
      {
        name: 'delete',
        noNest: true,
        btnProps: { onClick: () => this.handleDelete() },
        child: (text) => (
          <Button
            icon="delete"
            loading={deleteLoading}
            disabled={
              lineSelectedRows.length === 0 ||
              lineSelectedRows?.some((e) => e.notificationStatus !== 'NEW')
            }
          >
            {text || intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        ),
      },
      {
        name: 'approve',
        noNest: true,
        btnProps: { onClick: () => this.handleApprove('approve') },
        child: (text) => (
          <Button
            icon="check"
            loading={approveLoading}
            disabled={
              lineSelectedRows.length === 0 ||
              lineSelectedRows?.some((e) => e.notificationStatus !== 'APPROVING')
            }
          >
            {text || intl.get('hzero.common.view.message.title.approved').d('审批通过')}
          </Button>
        ),
      },
      {
        name: 'reject',
        noNest: true,
        btnProps: { onClick: () => this.handleApprove('reject') },
        child: (text) => (
          <Button
            icon="exclamation-circle-o"
            loading={approveLoading}
            disabled={
              lineSelectedRows.length === 0 ||
              lineSelectedRows?.some((e) => e.notificationStatus !== 'APPROVING')
            }
          >
            {text || intl.get('hzero.common.view.message.title.reject').d('审批拒绝')}
          </Button>
        ),
      },
      {
        name: 'export',
        noNest: true,
        child: (text) => (
          <ExcelExportPro
            data-name="export"
            {...{
              otherButtonProps: {
                icon: 'unarchive',
                type: 'c7n-pro',
                funcType: 'flat',
                permissionList: [
                  {
                    code: 'srm.bg.manager.portal.business-order-publish.button.model.erexport',
                    type: 'button',
                  },
                ],
              },
              templateCode: 'SPFM_BUSINESS_NOTIFICATION_EXPORT',
              buttonText:
                text ||
                (isArray(lineSelectedKeys) && isEmpty(lineSelectedKeys)
                  ? intl.get('hzero.common.button.newExport').d('(新)导出')
                  : intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')),
              queryFormItem: (
                <ExportFormItem
                  onChange={(val) => {
                    this.setState({ notificationFlag: val });
                  }}
                />
              ),
              requestUrl: `${SRM_PLATFORM}/v1/${organizationId}/notify/export-modeler`,
              queryParams: () => this.getExprotParams(),
            }}
          />
        ),
      },
    ];

    return (
      <React.Fragment>
        <Header
          title={intl.get('spfm.businessOrder.view.title.businessOrderPublish').d('业务通知单发布')}
        >
          {customizeBtnGroup(
            {
              code: 'SPFM.PORTAL.BUSINESSORDER.PUBLISH.BTNS',
              pro: true,
            },
            <DynamicButtons
              buttons={headerButtons}
              permissions={[
                {
                  code: 'srm.bg.manager.portal.business-order-publish.button.approve',
                  name: 'approve',
                },
                {
                  code: 'srm.bg.manager.portal.business-order-publish.button.reject',
                  name: 'reject',
                },
                {
                  code: 'srm.bg.manager.portal.business-order-publish.button.delete',
                  name: 'delete',
                },
              ]}
            />
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          <TableList {...tableProps} />
        </Content>
        <OperateRecord {...operateProps} />
      </React.Fragment>
    );
  }
}
