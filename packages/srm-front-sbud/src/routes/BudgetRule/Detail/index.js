/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/*
 * @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import {
  DataSet,
  Lov,
  Table,
  Select,
  Button,
  Form,
  TextField,
  NumberField,
  DatePicker,
} from 'choerodon-ui/pro';
import { Collapse, Icon, Spin } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import querystring from 'querystring';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { getBudgetRuleDetail, save, publish, cancel, recall } from '@/services/budgetRuleService';

import { formDs, tableDs } from './mainDS';

const { Panel } = Collapse;

@formatterCollections({ code: ['sbud.budgetRule', 'sbud.budgeting'] })
class index extends Component {
  formDs = new DataSet(formDs());

  tableDs = new DataSet(tableDs());

  condFormulaDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'condFormula',
        type: 'string',
        validator: (value, _, record) => {
          const reg = /[\u4e00-\u9fa5]/gm;
          if (reg.test(record.get('condFormula'))) {
            return intl
              .get(`sbud.budgetRule.view.message.condFormulaNotChinese`)
              .d('逻辑表达式不可含中文');
          }
          return true;
        },
      },
    ],
  });

  constructor(props) {
    super(props);
    const routerParams = querystring.parse(this.props.history.location.search.substr(1));
    const { budgetRuleId = null } = routerParams;
    this.state = {
      budgetRuleId,
      editFlag: true,
      collapseKeys: ['header', 'line'],
      loading: true,
      ruleStatus: '',
    };
  }

  componentDidMount() {
    this.init();
  }

  @Bind()
  async init() {
    const { budgetRuleId } = this.state;
    if (budgetRuleId) {
      const res = getResponse(await getBudgetRuleDetail(budgetRuleId));
      if (res) {
        const { budgetRuleLines = [], ruleStatus = 'NEW', condFormula = '' } = res;
        if (ruleStatus !== 'CANCEL' && ruleStatus !== 'RELEASE') {
          this.setState({
            editFlag: true,
          });
        } else {
          this.setState({
            editFlag: false,
          });
        }
        this.setState({
          ruleStatus,
          loading: false,
          // ruleStatus,
        });
        this.formDs.loadData([res]);
        this.tableDs.loadData(budgetRuleLines);
        if (this.tableDs.data) {
          this.tableDs.data.forEach((record, index) => {
            record.set('valueMeaning', budgetRuleLines[index].valueMeaning);
            record.set('value', budgetRuleLines[index].value);
          });
        }

        console.log(this.tableDs.data);
        // this.forceUpdate();
        this.condFormulaDs.loadData([{ condFormula }]);
      }
    } else {
      this.setState({
        editFlag: true,
        loading: false,
      });
    }
  }

  /**
   * 获取勾选行keys
   * @returns {Array} - 勾选行keys
   */
  getSelectedRowKes() {
    let selectedRowKeys = [];
    if (!isEmpty(this.formDs.selected)) {
      selectedRowKeys = this.formDs.selected.map((item) => item.toData().budgetId);
    }
    return selectedRowKeys;
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind()
  getTableButtons() {
    const { editFlag } = this.state;
    if (editFlag) {
      return [
        <Button icon="playlist_add" onClick={() => this.handleAdd(this.tableDs)} key="add">
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>,
        ['delete', { color: 'red' }],
      ];
    } else {
      return [];
    }
  }

  /**
   * 新增
   * @memberof PriceLibDimension
   */
  @Bind()
  handleAdd(ds) {
    let seq = 1;
    const nums = ds.toData().map((i) => Number(i.sequenceNo));
    while (nums.includes(seq)) {
      seq++;
    }
    const lastSeq = ds.toData().length;
    const record = ds.create({}, lastSeq);
    record.set('sequenceNo', seq);
    const { condFormula: oldCondFormula = null } = this.condFormulaDs.toData()[0]
      ? this.condFormulaDs.toData()[0]
      : {};
    if (lastSeq === 0 || !oldCondFormula) {
      this.condFormulaDs.loadData([{ condFormula: seq }]);
    } else if (oldCondFormula) {
      this.condFormulaDs.loadData([{ condFormula: `${oldCondFormula} AND ${seq}` }]);
    }
  }

  @Bind()
  async getSendData() {
    const headerValidateFlag = await this.formDs.validate();
    const linesValidateFlag = await this.tableDs.validate();
    const condValidateFlag = await this.condFormulaDs.validate();
    if (headerValidateFlag && linesValidateFlag && condValidateFlag) {
      const headerData = this.formDs.toData()[0] ? this.formDs.toData()[0] : {};
      const lineData = this.tableDs.toData() ? this.tableDs.toData() : [];
      lineData.forEach((record) => {
        if (record.operator === '!= null' || record.operator === '== null') {
          record.valueObj = null;
          record.value = null;
          record.valueMeaning = null;
        }
      });
      // console.log(11111, lineData);
      const condValidateData = this.condFormulaDs.toData()[0] ? this.condFormulaDs.toData()[0] : {};
      const sendData = {
        ...headerData,
        budgetRuleLines: lineData,
        ...condValidateData,
      };
      return sendData;
    } else {
      return null;
    }
  }

  @Bind()
  async handleOpr(reqFun) {
    const sendData = await this.getSendData();
    if (sendData) {
      const res = getResponse(await reqFun(sendData));
      if (res) {
        notification.success();
        const { history } = this.props;
        history.push('/sbud/budget-rule/list');
      }
    }
  }

  render() {
    const { collapseKeys, editFlag, loading, budgetRuleId } = this.state;
    const Headers = observer(() => {
      const { ruleStatus } = this.state;
      return (
        <Header
          title={intl.get('sbud.budgetRule.view.title.budgetRuleUpdate').d('预算规则维护')}
          backPath="/sbud/budget-rule/list"
        >
          {budgetRuleId && (
            <Button
              icon="signal_cellular_no_sim"
              funcType="raised"
              color="primary"
              loading={loading}
              disabled={ruleStatus === 'CANCEL'}
              onClick={() => this.handleOpr(cancel)}
            >
              {intl.get('sbud.budgeting.view.button.cancellation').d('作废')}
            </Button>
          )}

          <Button
            icon="send"
            funcType="raised"
            disabled={!editFlag}
            loading={loading}
            onClick={() => this.handleOpr(publish)}
          >
            {intl.get('sbud.budgeting.view.button.publish').d('发布')}
          </Button>
          <Button
            icon="save"
            funcType="raised"
            disabled={!editFlag}
            loading={loading}
            onClick={() => this.handleOpr(save)}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="delete"
            funcType="raised"
            disabled={ruleStatus !== 'RELEASE'}
            loading={loading}
            onClick={() => this.handleOpr(recall)}
          >
            {intl.get('sbud.budgeting.view.button.recall').d('取消')}
          </Button>
        </Header>
      );
    });
    const listColumns = [
      {
        name: 'sequenceNo',
        width: 80,
      },
      {
        name: 'budgetItem',
        width: 200,
        editor: editFlag,
      },
      {
        name: 'operator',
        width: 200,
        editor: editFlag,
      },
      {
        name: 'valueObj',
        width: 200,
        editor: editFlag,
        renderer: ({ record }) => {
          // console.log(record, record.get('componentType'), record.data.componentType === 'LOV' );
          if (record.data.componentType === 'LOV' || record.get('componentType') === 'LOV') {
            return record.toData().operator === '== null' || record.toData().operator === '!= null'
              ? null
              : record.toData().value;
          }
          return record.toData().valueObj;
        },
      },
      {
        name: 'valueMeaning',
        renderer: ({ record }) => {
          // console.log(record, record.get('componentType'), record.data.componentType === 'LOV' );
          if (record.data.componentType === 'LOV' || record.get('componentType') === 'LOV') {
            return record.toData().operator === '== null' || record.toData().operator === '!= null'
              ? null
              : record.toData().valueMeaning;
          }
          return record.toData().valueMeaning;
        },
        width: 200,
      },
      // {
      //   name: 'endDate',
      //   width: 180,
      //   editor: editFlag,
      // },
    ];
    return (
      <Fragment>
        <Headers dataSet={this.formDs} />
        <Spin spinning={loading}>
          <Content>
            <Collapse
              style={{ border: 'none' }}
              defaultActiveKey={['header', 'line']}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                key="header"
                style={{ border: 'none' }}
                header={
                  <Fragment>
                    <h2 style={{ display: 'inline-block', marginRight: '8px' }}>
                      {intl.get(`sbud.budgetRule.view.message.panel.baseInfos`).d('基础信息')}
                    </h2>
                    <div style={{ display: 'inline-flex' }}>
                      <a style={{ height: '100%' }}>
                        {collapseKeys.includes('header')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon
                        style={{ fontSize: '24px', color: '#29BECE' }}
                        type={collapseKeys.includes('header') ? 'expand_less' : 'expand_more'}
                      />
                    </div>
                  </Fragment>
                }
              >
                <Form dataSet={this.formDs} columns={3}>
                  <TextField name="ruleCode" disabled />
                  <TextField name="ruleDesc" disabled={!editFlag} />
                  <TextField name="version" disabled />
                  <Select name="ruleLevel" clearButton={false} disabled={!editFlag} />
                  <Lov name="company" disabled={!editFlag} />
                  <TextField name="ruleStatusMeaning" disabled />
                  <TextField name="createdByName" disabled />
                  <DatePicker name="creationDate" disabled  mode='dateTime'/>
                  <NumberField name="excessOccupancyTolerance" disabled={!editFlag} />
                  <Select name="balanceReminderFlag" disabled={!editFlag} showHelp="tooltip" />
                  <NumberField name="balanceRemindsNode" disabled={!editFlag} />
                </Form>
              </Panel>
              <Panel
                showArrow={false}
                key="line"
                style={{ border: 'none' }}
                header={
                  <Fragment>
                    <h2 style={{ display: 'inline-block', marginRight: '8px' }}>
                      {intl.get(`sbud.budgetRule.view.message.panel.budgetRule`).d('预算维度规则')}
                    </h2>
                    <div style={{ display: 'inline-flex' }}>
                      <a style={{ height: '100%' }}>
                        {collapseKeys.includes('line')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon
                        style={{ fontSize: '24px', color: '#29BECE' }}
                        type={collapseKeys.includes('line') ? 'expand_less' : 'expand_more'}
                      />
                    </div>
                  </Fragment>
                }
              >
                <Table
                  columns={listColumns}
                  dataSet={this.tableDs}
                  queryFieldsLimit={3}
                  buttons={this.getTableButtons()}
                />
                <div style={{ marginTop: '20px' }}>
                  <h3>{intl.get(`sbud.budgetRule.view.message.condFormula`).d('逻辑表达式')}</h3>
                  <TextField
                    style={{ width: '100%' }}
                    dataSet={this.condFormulaDs}
                    name="condFormula"
                    clearButton
                    disabled={!editFlag}
                  />
                  <h4 style={{ color: '#ccc' }}>
                    {intl
                      .get(`sbud.budgetRule.view.message.condFormulaDetail`)
                      .d('使用条件编号及AND、OR编写运算规则。示例(1 OR 2) AND 3')}
                  </h4>
                </div>
              </Panel>
            </Collapse>
          </Content>
        </Spin>
      </Fragment>
    );
  }
}

export default index;
