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
import moment from 'moment';
import { DataSet, Table, Button, Modal, DatePicker } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import querystring from 'querystring';

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
import { getBudgetItem, approved, reject } from '@/services/budgetingService';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['sbud.budgeting'] })
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
          width: 200,
        },
        {
          name: 'budgetDesc',
          width: 200,
        },
        {
          name: 'companyId',
          width: 200,
        },
        {
          name: 'origBudgetAmount',
          width: 200,
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
        },
        {
          name: 'budgetAmount',
          width: 200,
        },
        {
          name: 'currencyCode',
          width: 200,
        },
        {
          name: 'periodNum',
          width: 200,
        },
        {
          name: 'validityDate',
          width: 240,
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
          width: 100,
          lock: 'right',
          renderer: ({ record }) => (
            <a onClick={() => this.openOprationModal(record)}>
              {intl.get('sbud.budgeting.model.budgeting.operationRecord').d('操作记录')}
            </a>
          ),
        },
      ],
    };
  }

  @Bind()
  linkToDetail(budgetId) {
    const { history } = this.props;
    history.push({
      pathname: '/sbud/budeget-approval/occupationDetails',
      search: querystring.stringify({ budgetId }),
    });
  }

  @Bind()
  linkToWriteOff(budgetId) {
    const { history } = this.props;
    history.push({
      pathname: '/sbud/budeget-approval/write-off',
      search: querystring.stringify({ budgetId }),
    });
  }

  componentDidMount() {
    const { listColumns } = this.state;
    this.getBudgetItem({ listColumns, seq: 4, ds: this.tableDs });
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

      queryFields().forEach((item) => {
        const { name, ...others } = item;
        queryFromDs.addField(name, others);
      });

      dynamicColumns.forEach((item) => {
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
          const { displayField, budgetItemLovs } = item;
          ds.addField(name, {
            ...gridField,
            ignore: 'always',
          });
          ds.addField(budgetItemCode, {
            name: budgetItemCode,
            type: 'string',
            bind: `${name}.${budgetItemCode}`,
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
            // editor: (record) => allowEdit({ record, fields: budgetItemCode }),
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
          const findItem = definitions.find((item) => item.value === (value || '').split(':')[0]);
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
      title: null,
      style: {
        width: 680,
      },
      children: (
        <Tabs animated={false}>
          <TabPane
            tab={intl.get(`hzero.common.view.message.operateHistory`).d('操作记录')}
            key="operator"
          >
            <Table dataSet={this.operationDs} columns={operateColumns} />
          </TabPane>
          <TabPane
            tab={intl.get(`sbud.budgeting.view.message.approvalRecord`).d('审批记录')}
            key="approval"
          >
            <Table dataSet={this.approvalDs} columns={approvalColumns} />
          </TabPane>
        </Tabs>
      ),
      onOk: () => {},
      onCancel: () => {},
    });
  }

  @Bind()
  async handleApprove() {
    const selectedRecords = this.tableDs.selected;
    const datas = selectedRecords.map((i) => {
      const item = i.toData();
      const itemData = getDatas(item);
      return itemData;
    });
    this.setState({
      approveLoading: true,
    });
    const res = getResponse(await approved(datas));
    this.setState({
      approveLoading: false,
    });
    if (res) {
      notification.success();
      this.tableDs.query();
    }
  }

  @Bind()
  async handleRefuse() {
    const selectedRecords = this.tableDs.selected;
    const datas = selectedRecords.map((i) => {
      const item = i.toData();
      const itemData = getDatas(item);
      return itemData;
    });
    this.setState({
      approveLoading: true,
    });
    const res = getResponse(await reject(datas));
    this.setState({
      approveLoading: false,
    });
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
      selectedRowKeys = this.tableDs.selected.map((item) => item.toData().budgetId);
    }
    return selectedRowKeys;
  }

  render() {
    const { listColumns, approveLoading = false } = this.state;
    const Headers = observer((props) => {
      const isDisabled = props.dataSet.selected.length === 0;
      return (
        <Header title={intl.get('sbud.budgeting.view.title.budegetApproval').d('预算审批')}>
          <Button
            icon="close"
            funcType="raised"
            loading={approveLoading}
            disabled={isDisabled}
            onClick={this.handleRefuse}
          >
            {intl.get('sbud.budgeting.view.button.refuse').d('审批拒绝')}
          </Button>
          <Button
            icon="check"
            funcType="raised"
            loading={approveLoading}
            disabled={isDisabled}
            onClick={this.handleApprove}
          >
            {intl.get('sbud.budgeting.view.button.approved').d('审批通过')}
          </Button>
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
                creationDate: (
                  <DatePicker
                    mode="dateTime"
                    dataSet={this.tableDataDs ? this.tableDataDs.queryDataSet : null}
                    defaultTime={[moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}
                  />
                ),
                validityDate: (
                  <DatePicker
                    mode="dateTime"
                    dataSet={this.tableDataDs ? this.tableDataDs.queryDataSet : null}
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
