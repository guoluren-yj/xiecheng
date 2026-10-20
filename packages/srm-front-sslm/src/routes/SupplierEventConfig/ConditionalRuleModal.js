/*
 * ConditionalRuleModal - 条件规则配置
 * @date: 2021/06/11 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { DataSet, notification, Form, Table, SelectBox, TextField, Button } from 'choerodon-ui/pro';
import { Card, Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { queryConditionalRule, saveAllConditionalRule } from '@/services/supplierEventService';

import { StandardConditionalDS, ExpandConditionalDS } from './stores';

const { Option } = SelectBox;

export default class ConditionalRuleModal extends Component {
  standardConditionalDS = new DataSet({
    ...StandardConditionalDS(),
    queryParameter: {
      exportCfId: this.props.exportCfId,
    },
    events: {
      update: ({ name, record }) => {
        if (name === 'filterObject') {
          record.set('filterVluse', null);
        }
      },
      load: ({ dataSet }) => {
        if (dataSet) {
          dataSet.forEach(record => {
            Object.assign(record, { status: 'update' });
          });
          this.handleTacticsCondition(true);
        }
      },
    },
  });

  expandConditionalDS = new DataSet({
    ...ExpandConditionalDS(),
    queryParameter: {
      exportCfId: this.props.exportCfId,
    },
    events: {
      load: ({ dataSet }) => {
        if (dataSet) {
          dataSet.forEach(record => {
            Object.assign(record, { status: 'update' });
          });
          this.handleTacticsCondition(false);
        }
      },
    },
  });

  constructor(props) {
    super(props);
    props.onRef(this);
    const { currentRecord } = props;
    this.state = {
      standardVisible: currentRecord.get('tactics') !== 'TRUE',
      expandVisible: currentRecord.get('tacticsCustomize') !== 'TRUE',
      spinning: false,
    };
  }

  componentDidMount() {
    this.queryAllData();
  }

  @Bind()
  queryAllData() {
    const { exportCfId, currentRecord } = this.props;
    this.setState({
      spinning: true,
    });
    queryConditionalRule({ exportCfId }).then(response => {
      const res = getResponse(response);
      if (res) {
        const {
          tacticsExportCfFilter = [],
          exportCfFilter = [],
          tactics,
          tacticsCustomize,
          tacticsRule,
          tacticsCustomizeRule,
        } = res;
        this.standardConditionalDS.loadData(tacticsExportCfFilter);
        this.expandConditionalDS.loadData(exportCfFilter);
        currentRecord.set('tactics', tactics || 'TRUE');
        currentRecord.set('tacticsCustomize', tacticsCustomize || 'TRUE');
        if (!tacticsRule) {
          // 处理历史数据没有自定义条件条件组合
          this.handleTacticsCondition(true);
        } else {
          currentRecord.set('tacticsRule', tacticsRule);
        }
        if (!tacticsCustomizeRule) {
          // 处理历史数据没有自定义条件条件组合
          this.handleTacticsCondition(false);
        } else {
          currentRecord.set('tacticsCustomizeRule', tacticsCustomizeRule);
        }
      }
      this.setState({
        spinning: false,
      });
    });
  }

  @Bind()
  getStandardColumns() {
    const columns = [
      {
        name: 'filterObject',
        editor: true,
      },
      {
        name: 'filterMethod',
        editor: true,
      },
      {
        name: 'filterVluse',
        editor: true,
        width: 170,
      },
      {
        name: 'operator',
        renderer: ({ record }) => (
          <a onClick={() => this.deleteStandard(record)}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        ),
      },
    ];
    return columns;
  }

  @Bind()
  getExpandColumns() {
    const columns = [
      {
        name: 'filterObject',
        editor: true,
        width: 180,
      },
      {
        name: 'filterName',
        editor: true,
        width: 140,
      },
      {
        name: 'filterMethod',
        editor: true,
        width: 100,
      },
      {
        name: 'filterVluse',
        editor: true,
      },
      {
        name: 'operator',
        width: 80,
        renderer: ({ record }) => (
          <a onClick={() => this.deleteExpand(record)}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        ),
      },
    ];
    return columns;
  }

  /**
   * 删除标准条件
   */
  @Bind()
  deleteStandard(record) {
    const { status } = record;
    this.standardConditionalDS.delete(record).then(() => {
      // 删除更新状态的数据
      if (status !== 'sync') {
        this.handleTacticsCondition(true);
      }
    });
  }

  /**
   * 删除拓展条件
   */
  @Bind()
  deleteExpand(record) {
    const { status } = record;
    this.expandConditionalDS.delete(record).then(() => {
      if (status !== 'sync') {
        this.handleTacticsCondition(false);
      }
    });
  }

  /**
   * 处理保存
   */
  @Bind()
  async handleSave() {
    const { dataSet, currentRecord } = this.props;
    if (dataSet.dirty || this.standardConditionalDS.dirty || this.expandConditionalDS.dirty) {
      const headerValidateFlag = await currentRecord.validate();
      const standardValidateFlag = await this.standardConditionalDS.validate();
      const expandValidateFlag = await this.expandConditionalDS.validate();
      if (headerValidateFlag && standardValidateFlag && expandValidateFlag) {
        const headerData = currentRecord.toJSONData();
        const {
          tactics,
          tacticsCustomize,
          exportCfId,
          tacticsRule,
          tacticsCustomizeRule,
        } = headerData;
        const standardData = this.standardConditionalDS.toJSONData() || [];
        // 标准条件添加条件序号
        const newStandardData = standardData.map((i, index) => {
          return {
            ...i,
            orderSeq: index + 1,
          };
        });
        const expandData = this.expandConditionalDS.toJSONData() || [];
        // 拓展条件添加条件序号
        const newExpandData = expandData.map((i, index) => {
          return {
            ...i,
            orderSeq: index + 1,
          };
        });
        if (tactics !== 'TRUE' && this.standardConditionalDS.length < 1) {
          notification.warning({
            placement: 'bottomRight',
            message: intl
              .get('sslm.supplierEventConfig.view.message.standardAtLastOne')
              .d('标准条件规则至少维护一行！'),
          });
        } else if (tacticsCustomize !== 'TRUE' && this.expandConditionalDS.length < 1) {
          notification.warning({
            placement: 'bottomRight',
            message: intl
              .get('sslm.supplierEventConfig.view.message.expandAtLastOne')
              .d('拓展条件规则至少维护一行'),
          });
        } else {
          const payload = {
            tactics,
            tacticsCustomize,
            exportCfId,
            tacticsExportCfFilter: newStandardData,
            exportCfFilter: newExpandData,
            tacticsRule,
            tacticsCustomizeRule,
          };
          saveAllConditionalRule(payload).then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              this.queryAllData();
            }
          });
        }
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl
            .get('sslm.supplierEventConfig.view.message.maintainInfo')
            .d('请维护相关信息！'),
        });
      }
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl
          .get('sslm.supplierEventConfig.view.message.noNeedSaveData')
          .d('暂无需要保存的数据！'),
      });
    }
    return false;
  }

  /**
   * 处理值切换
   */
  @Bind()
  handleStandardChange(value) {
    if (value === 'TRUE') {
      this.setState({ standardVisible: false });
    } else {
      this.setState({ standardVisible: true });
      this.handleTacticsCondition(true);
    }
  }

  /**
   * 处理值切换
   */
  @Bind()
  handleExpandChange(value) {
    if (value === 'TRUE') {
      this.setState({ expandVisible: false });
    } else {
      this.setState({ expandVisible: true });
      this.handleTacticsCondition(false);
    }
  }

  /**
   * 新建表条件规则
   * flag 标准条件规则
   */
  @Bind()
  handleTacticsCondition(flag = true) {
    const { currentRecord } = this.props;
    let lineDs = this.standardConditionalDS;
    let tactics = 'tactics';
    let tacticsRule = 'tacticsRule';
    if (!flag) {
      lineDs = this.expandConditionalDS;
      tactics = 'tacticsCustomize';
      tacticsRule = 'tacticsCustomizeRule';
    }
    if (currentRecord.get(tactics) === 'OR' || currentRecord.get(tactics) === 'AND') {
      const effectiveCondition = lineDs.records.filter(record => record.status !== 'delete');
      let rule = '';
      if (effectiveCondition.length === 0) {
        rule = '';
      } else if (effectiveCondition.length === 1) {
        rule = '1';
      } else {
        rule = effectiveCondition
          .map((_, index) => index + 1)
          .join(` ${currentRecord.get(tactics)} `);
      }
      currentRecord.set(tacticsRule, rule);
    }
  }

  /**
   * 新建按钮
   * flag 标准条件规则
   */
  @Bind()
  createButton(flag = true) {
    return (
      <Button
        icon="playlist_add"
        onClick={() => {
          if (flag) {
            this.standardConditionalDS.create({});
          } else {
            this.expandConditionalDS.create({});
          }
          this.handleTacticsCondition(flag);
        }}
        key="add"
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>
    );
  }

  render() {
    const { currentRecord } = this.props;
    const { standardVisible, expandVisible, spinning } = this.state;
    const { tactics, tacticsCustomize } = currentRecord.get(['tactics', 'tacticsCustomize']);

    return (
      <React.Fragment>
        <Spin spinning={spinning}>
          <Card
            title={intl
              .get('sslm.supplierEventConfig.view.card.standardCondition')
              .d('标准条件规则')}
          >
            <Form record={currentRecord} columns={2}>
              <SelectBox
                label={intl
                  .get('sslm.supplierEventConfig.model.eventConfig.conditionType')
                  .d('策略逻辑')}
                name="tactics"
                onChange={this.handleStandardChange}
                colSpan={2}
              >
                <Option value="OR">
                  {intl.get('sslm.supplierEventConfig.view.select.or').d('满足任一条件')}
                </Option>
                <Option value="AND">
                  {intl.get('sslm.supplierEventConfig.view.select.and').d('满足所有条件')}
                </Option>
                <Option value="TRUE">
                  {intl.get('sslm.supplierEventConfig.view.select.true').d('无条件限制')}
                </Option>
                <Option value="CUSTOMER">
                  {intl.get('sslm.supplierEventConfig.view.select.custom').d('自定义组合规则')}
                </Option>
              </SelectBox>
            </Form>
            {standardVisible && (
              <>
                <Table
                  rowNumber
                  dataSet={this.standardConditionalDS}
                  columns={this.getStandardColumns()}
                  buttons={[this.createButton(true)]}
                />
                <Form
                  record={currentRecord}
                  columns={1}
                  labelLayout="float"
                  style={{ marginTop: 20 }}
                >
                  <TextField name="tacticsRule" disabled={tactics !== 'CUSTOMER'} />
                </Form>
              </>
            )}
          </Card>
          <Card
            title={intl.get('sslm.supplierEventConfig.view.card.expandCondition').d('拓展条件规则')}
            style={{ marginTop: 20 }}
          >
            <Form record={currentRecord} columns={2}>
              <SelectBox
                label={intl
                  .get('sslm.supplierEventConfig.model.eventConfig.conditionType')
                  .d('策略逻辑')}
                name="tacticsCustomize"
                onChange={this.handleExpandChange}
                colSpan={2}
              >
                <Option value="OR">
                  {intl.get('sslm.supplierEventConfig.view.select.or').d('满足任一条件')}
                </Option>
                <Option value="AND">
                  {intl.get('sslm.supplierEventConfig.view.select.and').d('满足所有条件')}
                </Option>
                <Option value="TRUE">
                  {intl.get('sslm.supplierEventConfig.view.select.true').d('无条件限制')}
                </Option>
                <Option value="CUSTOMER">
                  {intl.get('sslm.supplierEventConfig.view.select.custom').d('自定义组合规则')}
                </Option>
              </SelectBox>
            </Form>
            {expandVisible && (
              <>
                <Table
                  rowNumber
                  dataSet={this.expandConditionalDS}
                  columns={this.getExpandColumns()}
                  buttons={[this.createButton(false)]}
                />
                <Form
                  record={currentRecord}
                  columns={1}
                  labelLayout="float"
                  style={{ marginTop: 20 }}
                >
                  <TextField
                    name="tacticsCustomizeRule"
                    disabled={tacticsCustomize !== 'CUSTOMER'}
                  />
                </Form>
              </>
            )}
          </Card>
        </Spin>
      </React.Fragment>
    );
  }
}
