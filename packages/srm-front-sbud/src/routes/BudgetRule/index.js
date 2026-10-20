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
import { DataSet, Table, Button, Modal, DatePicker } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import moment from 'moment';
import querystring from 'querystring';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
// import notification from 'utils/notification';
import { SRM_SPRM } from '_utils/config';

import { mainTableDs } from './DS/mainDS';
import { operationDS } from '../pubDS/operationDS';

const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['sbud.budgetRule'] })
class index extends Component {
  tableDs = new DataSet(mainTableDs());

  operationDs = new DataSet(
    operationDS({ url: `${SRM_SPRM}/v1/${organizationId}/budget-action`, pk: 'budgetId' })
  );

  constructor(props) {
    super(props);
    this.state = {
      listColumns: [
        {
          name: 'ruleStatusMeaning',
          width: 100,
        },
        {
          name: 'ruleCode',
          width: 200,
          renderer: ({ record }) => (
            <a onClick={() => this.linkToDetail(record.data.budgetRuleId)}>
              {record.data.ruleCode}
            </a>
          ),
        },
        {
          name: 'version',
          width: 100,
        },
        {
          name: 'ruleDesc',
          width: 200,
          tooltip: 'overflow',
        },
        {
          name: 'ruleLevelMeaning',
          width: 200,
        },
        {
          name: 'companyName',
          width: 200,
        },
        {
          name: 'createdByName',
          width: 200,
        },
        {
          name: 'creationDate',
          width: 200,
        },
        // {
        //   name: 'operation',
        //   width: 100,
        //   renderer: ({ record }) =>
        //     (
        //       <a onClick={() => this.openOprationModal(record)}>
        //         {intl.get('sbud.budgetRule.model.budgetRule.operationRecord').d('操作记录')}
        //       </a>
        //     ),
        // },
      ],
    };
  }

  @Bind()
  linkToDetail(budgetRuleId) {
    const { history } = this.props;
    history.push({
      pathname: '/sbud/budget-rule/detail',
      search: querystring.stringify({ budgetRuleId }),
    });
  }

  @Bind()
  linkToCreate() {
    const { history } = this.props;
    history.push({
      pathname: '/sbud/budget-rule/detail',
    });
  }

  /**
   * 操作记录
   * @param {记录} record
   */
  @Bind()
  openOprationModal(record) {
    const { budgetId } = record.data;
    this.operationDs.setQueryParameter('budgetId', budgetId);

    this.operationDs.query();

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
    Modal.open({
      key: Modal.key(),
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      style: {
        width: 680,
      },
      children: <Table dataSet={this.operationDs} columns={operateColumns} />,
      onOk: () => {},
      onCancel: () => {},
    });
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
    const { listColumns } = this.state;
    const Headers = observer(() => {
      return (
        <Header title={intl.get('sbud.budgetRule.view.title.budgetRule').d('预算规则')}>
          <Button icon="add" color="primary" funcType="raised" onClick={this.linkToCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
      );
    });
    return (
      <Fragment>
        <Headers dataSet={this.tableDs} />
        <Content>
          <Table
            dataSet={this.tableDs}
            columns={listColumns}
            queryFieldsLimit={3}
            selectionMode="click"
            queryFields={{
              creationDate: (
                <DatePicker
                  mode="dateTime"
                  dataSet={this.tableDs.queryDataSet}
                  defaultTime={[moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}
                />
              ),
            }}
          />
        </Content>
      </Fragment>
    );
  }
}

export default index;
