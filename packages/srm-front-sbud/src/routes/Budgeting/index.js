/* exslint-disable */
/*
 * @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { Spin, Tabs } from 'choerodon-ui';
import { DataSet, Table, Modal, DatePicker } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { isEmpty, isFunction } from 'lodash';
import moment from 'moment';
import querystring from 'querystring';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { SRM_SPRM, PRIVATE_BUCKET } from '_utils/config';
import UploadModal from 'components/Upload';
import { queryMapIdpValue } from 'services/api';
import { approveNameRender } from 'utils/renderer';

import { mainTableDs, queryFields } from './DS/mainDS';
import { operationDS, approvalDS } from '../pubDS/operationDS';

import { getBugetFieldsConfig, getDatas } from '@/utils/utils';
import { getBudgetItem, submitAppove, cancel, delBuget } from '@/services/budgetingService';
import ExportDynamicExcel from '@/routes/components/ExportBtn';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from 'srm-front-boot/lib/components/ApproveRecordSimple';
import { revokeWorkFlow } from '@/routes/utils';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();
const allowEdit = ({ record = {}, fields }) => {
  if (fields === 'budgetNum') {
    if (record.status === 'add') {
      return true;
    } else {
      return false;
    }
  }
  let abledStatus = [];
  // 版本号大于1且已拒绝的为修改已拒绝，与已修改编辑逻辑一致
  const budgetStatus = record.get('budgetStatus');
  switch (fields) {
    case 'adjustAmount':
      abledStatus = [
        // 'NEW',
        // 'REJECTED',
        'APPROVED',
        'ALREADY_EDITED',
        'EDIT_REJECTED',
        // 'NEW_APPROVING'
        // 'NEW_REJECTED',
      ];
      break;
    case 'validityDate':
      abledStatus = [
        'NEW',
        // 'REJECTED',
        'APPROVED',
        'ALREADY_EDITED',
        'NEW_REJECTED',
        'EDIT_REJECTED',
      ];
      break;
    default:
      abledStatus = ['NEW', 'NEW_REJECTED'];
      break;
  }
  return abledStatus.includes(budgetStatus);
};

@formatterCollections({ code: ['sbud.budgeting'] })
@cuxRemote(
  {
    code: 'SBUD_BUGETING',
    name: 'remote',
  },
  {
    process: {
      setColumns: undefined,
    },
  }
)
class index extends Component {
  tableDs = new DataSet(mainTableDs());

  operationDs = new DataSet(
    operationDS({ url: `${SRM_SPRM}/v1/${organizationId}/budget-action`, pk: 'budgetId' })
  );

  approvalDs = new DataSet(approvalDS());

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      listColumns: [
        {
          name: 'budgetStatusMeaning',
          width: 100,
        },
        {
          name: 'budgetNum',
          editor: record => allowEdit({ record, fields: 'budgetNum' }),
          width: 200,
        },
        {
          name: 'workFlowApproveProcess',
          width: 150,
          renderer: this.viewDetail,
          tooltip: 'none',
        },
        {
          name: 'budgetDesc',
          width: 200,
          editor: record => allowEdit({ record, fields: 'budgetDesc' }),
        },
        {
          name: 'companyId',
          width: 200,
          editor: record => allowEdit({ record, fields: 'companyId' }),
        },
        {
          name: 'origBudgetAmount',
          width: 200,
          editor: record => allowEdit({ record, fields: 'origBudgetAmount' }),
        },
        {
          name: 'occupiedAmount',
          width: 200,
          renderer: ({ record }) => (
            <a onClick={() => this.linkToDetail(record.data.budgetId)}>
              {record.data.occupiedAmount}
            </a>
          ),
        },
        {
          name: 'appliedAmount',
          width: 200,
          renderer: ({ value, record }) => (
            <a onClick={() => this.linkToWriteOff(record.data.budgetId)}>{value}</a>
          ),
        },
        {
          name: 'remainingBudget',
          width: 200,
        },
        {
          name: 'adjustAmount',
          width: 200,
          editor: record => allowEdit({ record, fields: 'adjustAmount' }),
        },
        {
          name: 'budgetAmount',
          width: 200,
        },
        {
          name: 'currencyCode',
          width: 200,
          editor: record => allowEdit({ record, fields: 'currencyCode' }),
        },
        {
          name: 'periodNum',
          width: 200,
          editor: record => allowEdit({ record, fields: 'periodNum' }),
        },
        {
          name: 'validityDate',
          width: 240,
          editor: record => allowEdit({ record, fields: 'validityDate' }),
        },
        {
          name: 'createdByName',
          width: 200,
        },
        {
          name: 'creationDate',
          width: 200,
        },
        {
          name: 'approvedDate',
          width: 200,
        },
        {
          name: 'version',
          width: 100,
        },
        {
          name: 'operation',
          width: 180,
          lock: 'right',
          renderer: ({ dataSet, record }) => {
            const approvaFlags = dataSet.getState('approvaFlags');
            const operationFlags = dataSet.getState('operationFlags');
            const workFlowBusinessKey = record.get('businessKey');
            const approvaFlag = approvaFlags?.[workFlowBusinessKey];
            const operationFlag = operationFlags?.[workFlowBusinessKey];
            const { taskId, processInstanceId } = approvaFlag || {};
            return (
              <div>
                {approvaFlags && approvaFlag && (
                  <PermissionButton
                    wait={500}
                    type="c7n-pro"
                    funcType="link"
                    color="primary"
                    onClick={() => {
                      openApproveModal({
                        modalProps: {
                          closable: true,
                        },
                        taskId,
                        processInstanceId,
                        onSuccess: () => {
                          dataSet.query();
                        },
                      });
                    }}
                  >
                    {intl.get('hzero.common.button.approval').d('审批')}
                  </PermissionButton>
                )}
                {operationFlags && operationFlag?.REVOKE && (
                  <PermissionButton
                    wait={500}
                    type="c7n-pro"
                    funcType="link"
                    color="primary"
                    onClick={async () => {
                      const res = await revokeWorkFlow(workFlowBusinessKey);
                      if (res) {
                        dataSet.unSelectAll();
                        dataSet.clearCachedRecords();
                        dataSet.query();
                      }
                    }}
                  >
                    {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
                  </PermissionButton>
                )}
                {record.status !== 'add' ? (
                  <PermissionButton
                    type="c7n-pro"
                    funcType="link"
                    color="primary"
                    onClick={() => this.openOprationModal(record)}
                  >
                    {intl.get('sbud.budgeting.model.budgeting.operationRecord').d('操作记录')}
                  </PermissionButton>
                ) : (
                  <PermissionButton
                    type="c7n-pro"
                    funcType="link"
                    color="primary"
                    onClick={() => this.cancelOpr(record)}
                  >
                    {intl.get('sbud.budgeting.model.budgeting.cancelOpr').d('取消')}
                  </PermissionButton>
                )}
              </div>
            );
          },
        },
      ],
    };
  }

  @Bind()
  viewDetail({ record, dataSet }) {
    const simpleApprovalHistoryData = dataSet.getState('simpleApprovalHistoryData') || {};
    return <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('businessKey')]} />;
  }

  @Bind()
  linkToDetail(budgetId) {
    const { history } = this.props;
    history.push({
      pathname: '/sbud/budgeting/occupationDetails',
      search: querystring.stringify({ budgetId }),
    });
  }

  @Bind()
  linkToWriteOff(budgetId) {
    const { history } = this.props;
    history.push({
      pathname: '/sbud/budgeting/write-off',
      search: querystring.stringify({ budgetId }),
    });
  }

  componentDidMount() {
    const { listColumns } = this.state;
    const { setCuxListColumns } = this.props?.remote.props.process || {}
    const newListColumns = isFunction(setCuxListColumns) ? setCuxListColumns({ listColumns }) : listColumns;
    this.getBudgetItem({ listColumns: newListColumns, seq: 4, ds: this.tableDs });
  }

  @Bind()
  cancelOpr(record) {
    this.tableDs.delete(record);
  }

  /**
   * 设置动态列
   * @param {列} listColumns
   * @param {*插入列的位置} seq
   */
  @Bind()
  async getBudgetItem({ listColumns, seq, ds }) {
    const arr1 = listColumns.slice(0, seq);
    const arr2 = listColumns.slice(seq, listColumns.length);
    const arr3 = [];

    try {
      const dynamicColumns = await getBudgetItem();
      const queryFromDs = new DataSet();

      queryFields().forEach(item => {
        const { name, ...others } = item;
        queryFromDs.addField(name, others);
      });

      dynamicColumns.forEach(item => {
        const {
          queryFlag,
          enabledFlag,
          budgetFlag,
          budgetItemCode,
          componentType = 'INPUT',
          multipleFlag,
        } = item;
        const { gridField, columnsConfig, queryField } = getBugetFieldsConfig(item);
        const { name } = gridField;
        if (componentType === 'LOV') {
          const { displayField, budgetItemLovs, valueField } = item;
          ds.addField(name, {
            ...gridField,
            ignore: 'always',
          });

          ds.addField(budgetItemCode, {
            // 新的约定 用 budgetItemCode 作为 valueField,
            name: budgetItemCode,
            type: 'string',
            bind: `${name}.${valueField}`,
            multiple: Number(multipleFlag) === 1 ? ',' : false,
          });

          ds.addField(displayField, {
            name: displayField,
            type: 'string',
            bind: `${name}.${displayField}`,
            multiple: Number(multipleFlag) === 1 ? ',' : false,
          });
          // console.log(displayField);
          // ds.addField(displayField, {
          //   name: displayField,
          //   type: 'string',
          //   bind: `${name}.${displayField}`,
          // });
          // 设置直接映射关系
          ds.addField(`${budgetItemCode}MapList`, {
            name: `${budgetItemCode}MapList`,
            defaultValue: budgetItemLovs,
            ignore: 'always',
          });
        } else {
          ds.addField(name, gridField);
        }
        if (queryFlag && enabledFlag && Number(budgetFlag) === 1) {
          queryFromDs.addField(budgetItemCode, queryField);
        }
        if (Number(budgetFlag) === 1) {
          arr3.push({
            ...columnsConfig,
            editor: record => allowEdit({ record, fields: budgetItemCode }),
          });
        }
      });
      Object.assign(ds, { queryDataSet: queryFromDs });
      this.setState(
        {
          listColumns: [...arr1, ...arr3, ...arr2],
        },
        () => {
          this.setState({
            loading: false,
          });
          this.tableDs.query();
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 操作记录
   * @param {记录} record
   */
  @Bind()
  async openOprationModal(record) {
    const { budgetId } = record.data;
    this.operationDs.setQueryParameter('budgetId', budgetId);
    this.approvalDs.setQueryParameter('budgetId', budgetId);
    this.operationDs.query();
    this.approvalDs.query();
    const resLov = await getResponse(
      queryMapIdpValue({ definitions: 'SPUC.BUDGET_WORKFLOW_DEFINITION' })
    );
    const { definitions = [] } = resLov;
    const operateColumns = [
      {
        name: 'processUserName',
        width: 100,
      },
      {
        name: 'processDate',
        width: 250,
        tooltip: 'overflow',
      },
      {
        name: 'processStatusMeaning',
        width: 100,
      },
      {
        name: 'processRemark',
        width: 120,
        tooltip: 'overflow',
      },
    ];

    const approvalColumns = [
      {
        name: 'processDefinitionId',
        width: 150,
        renderer: ({ value }) => {
          const findItem = definitions.find(item => item.value === (value || '').split(':')[0]);
          return findItem ? findItem.meaning : (value || '').split(':')[0];
        },
      },
      {
        name: 'name',
        width: 150,
      },
      {
        name: 'assigneeName',
        width: 150,
      },
      {
        name: 'action',
        width: 150,
        renderer: ({ value }) => approveNameRender(value),
      },
      {
        name: 'endTime',
        width: 150,
      },
      {
        name: 'comment',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'attachmentUuid',
        width: 150,
        fixed: 'right',
        renderer: ({ value, record: lineRecord }) => {
          if (lineRecord.get('attachmentUuid')) {
            return <UploadModal attachmentUUID={value} bucketName={PRIVATE_BUCKET} viewOnly />;
          }
        },
      },
    ];
    Modal.open({
      key: Modal.key(),
      style: {
        width: 680,
      },
      closable: true,
      children: (
        <Tabs animated={false}>
          <TabPane
            tab={intl.get(`hzero.common.view.message.operateHistory`).d('操作记录')}
            key="operator"
          >
            <Table
              style={{ maxHeight: '450px' }}
              virtual
              virtualCell
              dataSet={this.operationDs}
              columns={operateColumns}
            />
          </TabPane>
          <TabPane
            tab={intl.get(`sbud.budgeting.view.message.approvalRecord`).d('审批记录')}
            key="approval"
          >
            <Table dataSet={this.approvalDs} columns={approvalColumns} />
          </TabPane>
        </Tabs>
      ),
      onOk: () => { },
      onCancel: () => { },
    });
  }

  @Bind()
  handleCreate() {
    this.tableDs.create({ budgetStatus: 'NEW' }, 0);
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const flag = await this.tableDs.validate();
    if (flag) {
      const res = await this.tableDs.submit();
      if (res && !res.failed) {
        this.tableDs.query();
      }
    }
  }

  /**
   * 提交审批
   */
  @Bind()
  async submitAppove() {
    const selectedRecords = this.tableDs.selected;
    const disabled = selectedRecords.find(i => i.status === 'add');
    if (disabled) {
      notification.warning({
        message: intl
          .get(`sbud.budgeting.model.budgeting.notSave`)
          .d('所选数据有未保存数据，请先保存之后提交审批'),
      });
      return;
    }
    const datas = selectedRecords.map(i => {
      const item = i.toData();
      const itemData = getDatas(item);
      return itemData;
    });
    const res = getResponse(await submitAppove(datas));
    if (res) {
      notification.success();
      this.tableDs.query();
    }
  }

  /**
   * 作废
   */
  @Bind()
  async cancel() {
    const selectedRecords = this.tableDs.selected;
    const disabled = selectedRecords.find(i => i.status === 'add');
    if (disabled) {
      notification.warning({
        message: intl
          .get(`sbud.budgeting.model.budgeting.notSaveToOpr`)
          .d('所选数据有未保存数据，请先保存之后再进行改操作'),
      });
      return;
    }
    const datas = selectedRecords.map(i => {
      const item = i.toData();
      const itemData = getDatas(item);
      return itemData;
    });
    const res = getResponse(await cancel(datas));
    if (res) {
      notification.success();
      this.tableDs.query();
    }
  }

  /**
   * 删除
   */
  @Bind()
  async delBuget() {
    const selectedRecords = this.tableDs.selected;
    const disabled = selectedRecords.find(i => i.status === 'add');
    if (disabled) {
      notification.warning({
        message: intl
          .get(`sbud.budgeting.model.budgeting.notSaveToOpr`)
          .d('所选数据有未保存数据，请先保存之后再进行改操作'),
      });
      return;
    }
    const datas = selectedRecords.map(i => {
      const item = i.toData();
      const itemData = getDatas(item);
      return itemData;
    });
    const res = getResponse(await delBuget(datas));
    if (res) {
      notification.success();
      this.tableDs.query();
    }
  }

  /**
   * 获取勾选行keys
   * @returns {Array} - 勾选行keys
   */
  getSelectedRowKes() {
    let selectedRowKeys = [];
    if (!isEmpty(this.tableDs.selected)) {
      selectedRowKeys = this.tableDs.selected.map(item => item.toData().budgetId);
    }
    return selectedRowKeys;
  }

  /**
   * handleImport - 项目行导入
   */
  @Bind()
  onImport() {
    const {
      location: { pathname },
      history,
    } = this.props;
    history.push({
      pathname: '/sbud/budgeting/data-import/SBUD.BUDGET_IMPORT_TPL',
      search: querystring.stringify({
        action: 'hzero.common.viewtitle.batchImport',
        backPath: `${pathname}`,
        args: JSON.stringify({
          tenantId: getCurrentOrganizationId(),
          templateCode: 'SBUD.BUDGET_IMPORT_TPL',
        }),
      }),
    });
  }

  render() {
    const { listColumns } = this.state;
    const Headers = observer(props => {
      const isDisabled = props.dataSet.selected.length === 0;
      const flag = !!props.dataSet.selected.find(i => i.status === 'add');
      const discardFlag = props.dataSet.selected.every(i =>
        ['APPROVED', 'REJECTED', 'ALREADY_EDITED', 'NEW_REJECTED', 'EDIT_REJECTED'].includes(
          i.toData().budgetStatus
        )
      );
      const submitFlag = props.dataSet.selected.every(i =>
        ['NEW', 'ALREADY_EDITED'].includes(i.toData().budgetStatus)
      );
      const deleFlag = props.dataSet.selected.every(i => ['NEW'].includes(i.toData().budgetStatus));
      const queryParams = props.dataSet.queryDataSet.toData()[0] || {};
      return (
        <Header title={intl.get('sbud.budgeting.view.title.budgeting').d('预算编制')}>
          <PermissionButton
            type="c7n-pro"
            color="primary"
            icon="add"
            onClick={this.handleCreate}
            permissionList={[
              {
                code: 'srm.finance.budget_management.budgeting.ps.button.new',
                type: 'button',
                meaning: '新建按钮权限',
              },
            ]}
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            icon="save"
            onClick={this.handleSave}
            permissionList={[
              {
                code: 'srm.finance.budget_management.budgeting.ps.button.save',
                type: 'button',
                meaning: '保存按钮权限',
              },
            ]}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            icon="signal_cellular_no_sim"
            funcType="raised"
            disabled={isDisabled || !discardFlag || flag}
            onClick={this.cancel}
            permissionList={[
              {
                code: 'srm.finance.budget_management.budgeting.ps.button.invalid',
                type: 'button',
                meaning: '作废按钮权限',
              },
            ]}
          >
            {intl.get('sbud.budgeting.view.button.cancellation').d('作废')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            icon="send"
            funcType="raised"
            disabled={isDisabled || !submitFlag || flag}
            onClick={this.submitAppove}
            permissionList={[
              {
                code: 'srm.finance.budget_management.budgeting.ps.button.submit',
                type: 'button',
                meaning: '提交审批按钮权限',
              },
            ]}
          >
            {intl.get('sbud.budgeting.view.button.submitApplove').d('提交审批')}
          </PermissionButton>
          <PermissionButton
            type="c7n-pro"
            icon="delete"
            funcType="raised"
            disabled={isDisabled || !deleFlag || flag}
            onClick={this.delBuget}
            permissionList={[
              {
                code: 'srm.finance.budget_management.budgeting.ps.button.delete',
                type: 'button',
                meaning: '删除按钮权限',
              },
            ]}
          >
            {intl.get('sbud.budgeting.view.button.delBuget').d('删除')}
          </PermissionButton>
          <ExportDynamicExcel
            disabled={false}
            requestUrl={`${SRM_SPRM}/v1/${organizationId}/budget/export`}
            queryParams={{
              selectedRowKeys: this.getSelectedRowKes(),
              ...queryParams,
            }}
          />
          <PermissionButton
            type="c7n-pro"
            icon="unarchive"
            onClick={this.onImport}
            permissionList={[
              {
                code: 'srm.finance.budget_management.budgeting.ps.button.import',
                type: 'button',
                meaning: '导入按钮权限',
              },
            ]}
          >
            {intl.get(`sbud.budgeting.view.button.import`).d('导入')}
          </PermissionButton>
        </Header>
      );
    });
    return (
      <Fragment>
        <Spin spinning={this.state.loading}>
          <Headers dataSet={this.tableDs} />
          <Content>
            <Table
              dataSet={this.tableDs}
              columns={listColumns}
              queryFieldsLimit={3}
              queryFields={{
                validityDate: (
                  <DatePicker
                    mode="dateTime"
                    dataSet={this.tableDs.queryDataSet}
                    defaultTime={[moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}
                  />
                ),
              }}
            />
          </Content>
        </Spin>
      </Fragment>
    );
  }
}

export default index;
