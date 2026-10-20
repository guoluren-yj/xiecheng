/*
 * BasicPolicy - 基本策略
 * @date: 2022/06/06 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import { isEmpty } from 'lodash';
import { Table, Button, Icon, Lov, DataSet, Modal } from 'choerodon-ui/pro';
import { Card, List, Row, Col } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import {
  getConditionRuleDs,
  getConditionJsonDs,
  getCustomizeConditionCombinationDs,
  getParamTableDs,
} from '@/routes/Investigation/Template/List/RuleConfiguration/stores';
import RuleConfiguration from '@/routes/Investigation/Template/List/RuleConfiguration';
import { handeleSaveRule } from '@/services/registerPolicyConfig';
import { dsDeleteData } from '@/routes/components/utils/utils';
import { ReactComponent as NoData } from '@/assets/common/condition-no-data.svg';

import { getInvestigateTemplateDS } from '../stores/indexDS';

import styles from '../index.less';

export default class BasicPolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // hidden: true,
    };
    this.conditionRuleDs = new DataSet(getConditionRuleDs());
    this.conditionJsonDs = new DataSet(getConditionJsonDs());
    this.customizeConditionCombinationDs = new DataSet(getCustomizeConditionCombinationDs());
  }

  templateDs = new DataSet(getInvestigateTemplateDS());

  @Bind()
  getColumns() {
    const { isEdit } = this.props;
    const columns = [
      {
        name: 'investigateType',
      },
      {
        name: 'templateCode',
      },
      {
        name: 'templateName',
      },
      {
        name: 'versionNumber',
        align: 'right',
      },
      !isEdit && {
        name: 'sendConditions',
        renderer: ({ record }) => {
          return (
            <Button funcType="link" onClick={() => this.renderSendConditions(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
          );
        },
      },
      isEdit && {
        name: 'conditionsConfig',
        renderer: ({ record }) => {
          const strategyInvestgAssignId = record.get('strategyInvestgAssignId');
          return (
            <Button
              funcType="link"
              onClick={() => this.handleConditionsConfiguration(record)}
              disabled={!strategyInvestgAssignId}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
          );
        },
      },
      {
        name: 'orderSeq',
        editor: isEdit,
      },
    ].filter(Boolean);
    return columns;
  }

  /**
   * 条件配置
   * @param {*} record
   */
  @Bind()
  handleConditionsConfiguration(record) {
    const paramTableDs = new DataSet(getParamTableDs()); // 参数表格 ds
    const recordData = record.toData();
    Modal.open({
      key: Modal.key(),
      title: intl.get(`sslm.investDefOrg.model.investDefOrg.ruleConfiguration`).d('规则配置'),
      okText: intl.get('hzero.common.button.save').d('保存'),
      drawer: true,
      movable: false,
      style: { width: 742 },
      bodyStyle: { padding: 0 },
      children: (
        <RuleConfiguration
          record={recordData}
          conditionRuleDs={this.conditionRuleDs}
          conditionJsonDs={this.conditionJsonDs}
          customizeConditionCombinationDs={this.customizeConditionCombinationDs}
          paramTableDs={paramTableDs}
        />
      ),
      afterClose: () => {
        // eslint-disable-next-line no-unused-expressions
        this.conditionRuleDs?.loadData([]);
        // eslint-disable-next-line no-unused-expressions
        this.conditionJsonDs?.loadData([]);
        // eslint-disable-next-line no-unused-expressions
        this.customizeConditionCombinationDs?.loadData([]);
      },
      onOk: () =>
        this.handleSaveRuleConfig({
          conditionRuleDs: this.conditionRuleDs,
          conditionJsonDs: this.conditionJsonDs,
          customizeConditionCombinationDs: this.customizeConditionCombinationDs,
          record: recordData,
        }),
    });
  }

  /**
   * 渲染发送条件
   */
  @Bind()
  renderSendConditions(record) {
    const investigateCnfHeaderVO = record.get('investigateCnfHeaderVO');
    const { customizeConditionCombination, conditionLines = [] } = investigateCnfHeaderVO || {};
    const ruleFlag = !isEmpty(conditionLines);
    Modal.open({
      key: Modal.key(),
      title: intl
        .get('sslm.registerPolicy.modal.registerPolicy.viewSendConditions')
        .d('查看发送条件'),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      cancelButton: false,
      drawer: true,
      movable: false,
      style: { width: 742 },
      className: styles['view-conditions-modal'],
      children: ruleFlag ? (
        <>
          <div className={styles['view-conditions-modal-body-title']}>
            {intl.get('sslm.investDefOrg.model.select.customize').d('自定义组合规则')}
          </div>
          <List
            size="small"
            bordered
            dataSource={conditionLines}
            renderItem={(item, index) => {
              const { leftValueMeaning, operatorMeaning, rightValueMeaning } = item;
              return (
                <List.Item>
                  <Row>
                    <Col span={1}>#{index + 1}</Col>
                    <Col span={5}>{leftValueMeaning}</Col>
                    <Col span={3} className={styles['view-conditions-modal-body-operator']}>
                      {operatorMeaning}
                    </Col>
                    <Col span={15}>{rightValueMeaning}</Col>
                  </Row>
                </List.Item>
              );
            }}
            footer={
              <div>
                {intl.get('sslm.investDefOrg.model.select.customize').d('自定义组合规则')}：
                <span>{customizeConditionCombination || '-'}</span>
              </div>
            }
          />
        </>
      ) : (
        <div className={styles['view-conditions-modal-no-data']}>
          <NoData />
          <div className={styles['view-conditions-modal-body-title']}>
            {intl.get('sslm.common.model.select.true').d('无条件限制')}
          </div>
        </div>
      ),
    });
  }

  /**
   * 保存条件规则
   */
  @Bind()
  async handleSaveRuleConfig(params = {}) {
    const { tableDataSet } = this.props;
    const { conditionRuleDs, conditionJsonDs, customizeConditionCombinationDs, record } = params;
    const flag =
      (await conditionRuleDs.validate()) &&
      (await conditionJsonDs.validate()) &&
      (await customizeConditionCombinationDs.validate());
    if (flag) {
      const { conditionType } = conditionRuleDs?.current?.toData() || {};
      const { customizeConditionCombination } =
        customizeConditionCombinationDs?.current?.toData() || {};
      // 保存时过滤 条件的fieldDefinition部分属性
      const conditionLines = (conditionJsonDs?.toData() || []).map(item => {
        const { fieldDefinition = {}, ...others } = item;
        const { name, label, lookupCode, textField, valueField, type, lovCode } =
          fieldDefinition || {};
        const line = {
          fieldDefinition: {
            name,
            label,
            lookupCode,
            textField,
            valueField,
            type,
            lovCode,
          },
          ...others,
        };
        return line;
      });
      const payload = {
        ...(conditionRuleDs?.current?.toData() || {}),
        conditionLines: conditionType === 'TRUE' ? [] : conditionLines || [],
        customizeConditionCombination:
          conditionType === 'TRUE' ? '' : customizeConditionCombination,
      };
      const { __dirty, ...others } = payload;
      return handeleSaveRule({ ...record, conditionJson: JSON.stringify(others) }).then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success();
          // 刷新列表 todo
          tableDataSet.query();
        } else {
          return false;
        }
      });
    } else {
      return false;
    }
  }

  @Bind()
  handleCreateData() {
    const { tableDataSet, assignId, strategyCfBasicId, policyConfigDs } = this.props;
    const currentData = this.templateDs.current.toData();
    const tableData = tableDataSet.toData();
    if (!isEmpty(currentData)) {
      const { investigateTemplateLov = [] } = currentData;
      const selectData = [];
      investigateTemplateLov.forEach(item => {
        const { templateCode } = item;
        const existData = (tableData || []).find(i => i.templateCode === templateCode);
        // 过滤已存在的模版
        if (!existData) {
          const data = {
            ...item,
            assignId,
            strategyCfBasicId,
          };
          selectData.push(data);
        }
      });
      selectData.forEach(line => {
        tableDataSet.create(line, 0);
      });
    }
    // 调查表模版有数据设置关联字段
    const hasTemplateFlag = !!(tableDataSet.records || []).length || false;
    if (hasTemplateFlag && policyConfigDs.current) {
      const { directCooperation, autoInvite, allowSupplierInvite } = policyConfigDs.current.get([
        'directCooperation',
        'autoInvite',
        'allowSupplierInvite',
      ]);
      let inviteTypeObj = {};
      if (!directCooperation && !autoInvite && !allowSupplierInvite) {
        inviteTypeObj = {
          directCooperation: 1,
          autoInvite: 0,
          allowSupplierInvite: 0,
        };
      }
      policyConfigDs.current.set({
        ...inviteTypeObj,
        approveMethod: 'tenant',
      });
    }
    this.templateDs.current.set('investigateTemplateLov', undefined);
  }

  render() {
    const { tableDataSet, isEdit } = this.props;
    const buttons = isEdit
      ? [
        <Lov
          mode="button"
          name="investigateTemplateLov"
          clearButton={false}
          dataSet={this.templateDs}
          modalProps={{
              afterClose: this.handleCreateData,
            }}
        >
          <Icon type="playlist_add" style={{ fontSize: 14, marginRight: 5, fontWeight: 400 }} />
          {intl.get('hzero.common.button.add').d('新增')}
        </Lov>,
          [
            'delete',
            {
              onClick: () => {
                // 过滤出已保存的数据
                const isSavedData = tableDataSet.selected.filter(record =>
                  record.get('strategyInvestgAssignId')
                );
                if (isEmpty(isSavedData)) {
                  tableDataSet.delete(tableDataSet.selected, false);
                } else {
                  dsDeleteData({ dataSet: tableDataSet });
                }
              },
            },
          ],
        ]
      : [];

    return (
      <React.Fragment>
        <Content
          className={classnames(
            styles['policy-content-card'],
            isEdit ? '' : styles['policy-content-card-view']
          )}
        >
          <Card
            bordered={false}
            title={intl
              .get('sslm.registerPolicy.view.registerPolicy.relationTemplate')
              .d('关联调查表模板')}
          >
            <Table
              dataSet={tableDataSet}
              columns={this.getColumns()}
              autoValidationLocate={false}
              buttons={buttons}
              selectionMode={isEdit ? 'rowbox' : 'click'}
              customizedCode="sslm-register-policy-config-relation-template"
              style={{ maxHeight: '400px' }}
            />
          </Card>
        </Content>
      </React.Fragment>
    );
  }
}
