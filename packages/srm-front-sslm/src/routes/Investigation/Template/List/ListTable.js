/* eslint-disable no-unused-expressions */
/*
 * ListTable - 租户级调查模板定义数据显示
 * @date: 2018/08/07 15:18:20
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';
import { Modal, DataSet, notification } from 'choerodon-ui/pro';

import Checkbox from 'components/Checkbox';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import { getResponse } from 'utils/utils';
import { handeleSaveRule } from '@/services/orgInvestigateTemplateService';
import RuleConfiguration from './RuleConfiguration';

import styles from '../../index.less';

import {
  getConditionRuleDs,
  // getPolicyConfigDs,
  getConditionJsonDs,
  getCustomizeConditionCombinationDs,
  getParamTableDs,
} from './RuleConfiguration/stores';

/**
 * 租户级调查模板定义查询表单
 * @extends {Component} - React.Component
 * @reactProps {Function} onHandleChangeColumn // 列改变时修改状态树
 * @reactProps {Function} toTemplateDetail // 跳转模板详情页
 * @reactProps {Function} allocateToCompany // 分配至公司
 * @return React.element
 */
const FormItem = Form.Item;
// @formatterCollections({ code: 'sslm.questionnairePreset' })

@withProps(
  () => {
    const conditionRuleDs = new DataSet(getConditionRuleDs());
    const conditionJsonDs = new DataSet(getConditionJsonDs());
    const customizeConditionCombinationDs = new DataSet(getCustomizeConditionCombinationDs());
    const paramTableDs = new DataSet(getParamTableDs()); // 参数表格 ds
    return {
      conditionRuleDs,
      conditionJsonDs,
      customizeConditionCombinationDs,
      paramTableDs,
    };
  },
  { cacheState: true }
)
export default class ListTable extends Component {
  // 条件规则弹窗
  ConditionsConfigurationModal;

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
  }

  @Bind()
  latestFlag(record) {
    if (this.props.onHandleLatest) {
      this.props.onHandleLatest(record.investigateTemplateId);
    }
  }

  /**
   * 修改列时改变状态树的数据
   * @param {Sting} dataIndex
   * @param {Sting} value
   * @param {Object} record
   */
  @Bind()
  handleChangeColumn(dataIndex, value, record) {
    if (this.props.onHandleChangeColumn) {
      this.props.onHandleChangeColumn(dataIndex, value, record);
    }
  }

  /**
   * 跳转详情页
   * @param {Number} investigateTemplateId
   */
  @Bind()
  toTemplateDetail(investigateTemplateId) {
    if (this.props.onHandleToTemplateDetail) {
      this.props.onHandleToTemplateDetail(investigateTemplateId);
    }
  }

  /**
   * 分配至公司
   * @param {Object} record
   */
  @Bind()
  handleAllocateToCompany(record) {
    if (this.props.onHandleAllocateToCompany) {
      this.props.onHandleAllocateToCompany(record);
    }
  }

  /**
   * 编辑行信息
   * @param {Object} record
   */
  @Bind()
  handleEditQuestionnaire(record) {
    if (this.props.onHandleEditQuestionnaire) {
      this.props.onHandleEditQuestionnaire(record);
    }
  }

  /**
   * 复制
   * @param {*} record
   */
  @Bind()
  handleTemplateCopy(record = {}) {
    const { handleTemplateCopy = () => {} } = this.props;
    handleTemplateCopy(record);
  }

  /**
   * 复制模板
   * @param {Object} record
   */
  @Bind()
  referenceTemplate(record) {
    if (this.props.onHandleReferenceTemplate) {
      const { investigateType, industryId, industryMeaning, investigateTemplateId } = record;
      this.props.onHandleReferenceTemplate(
        investigateType,
        industryId,
        industryMeaning,
        investigateTemplateId
      );
    }
  }

  /**
   * 保存条件规则
   */
  @Bind()
  async handleSaveRuleConfig(record) {
    const {
      conditionRuleDs,
      conditionJsonDs,
      customizeConditionCombinationDs,
      pagination,
      handleSearch,
    } = this.props;
    const flag =
      (await conditionRuleDs.validate()) &&
      (await conditionJsonDs.validate()) &&
      (await customizeConditionCombinationDs.validate());
    if (flag) {
      const { conditionType } = conditionRuleDs?.current?.toData() || {};
      const { customizeConditionCombination } =
        customizeConditionCombinationDs?.current?.toData() || {};
      const params = {
        ...(conditionRuleDs?.current?.toData() || {}),
        conditionLines: conditionType === 'TRUE' ? [] : conditionJsonDs?.toData() || [],
        customizeConditionCombination:
          conditionType === 'TRUE' ? '' : customizeConditionCombination,
      };
      const { __dirty, ...others } = params;
      return handeleSaveRule({ ...record, conditionJson: JSON.stringify(others) }).then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success({
            placement: 'bottomRight',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
          handleSearch(pagination);
        } else {
          return false;
        }
      });
    } else {
      return false;
    }
  }

  @Bind()
  handleConditionsConfiguration(record) {
    const {
      conditionRuleDs,
      conditionJsonDs,
      customizeConditionCombinationDs,
      paramTableDs,
    } = this.props;
    this.ConditionsConfigurationModal = Modal.open({
      key: Modal.key(),
      title: intl.get(`sslm.investDefOrg.model.investDefOrg.ruleConfiguration`).d('规则配置'),
      okText: intl.get('hzero.common.button.save').d('保存'),
      drawer: true,
      movable: false,
      style: { width: 742 },
      bodyStyle: { padding: 0 },
      children: (
        <RuleConfiguration
          record={record}
          conditionRuleDs={conditionRuleDs}
          conditionJsonDs={conditionJsonDs}
          customizeConditionCombinationDs={customizeConditionCombinationDs}
          paramTableDs={paramTableDs}
        />
      ),
      afterClose: () => {
        conditionRuleDs?.loadData([]);
        conditionJsonDs?.loadData([]);
        customizeConditionCombinationDs?.loadData([]);
      },
      onOk: () => this.handleSaveRuleConfig(record),
    });
  }

  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 150,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const { effecting, dataSource, onSearchPaging, pagination, customizeTable } = this.props;
    const columns = [
      {
        title: intl
          .get(`sslm.investDefOrg.model.investDefOrg.investTemplateCode`)
          .d('调查表模板代码'),
        dataIndex: 'templateCode',
        width: 200,
        fixed: 'left',
      },
      {
        title: intl
          .get(`sslm.investDefOrg.model.investDefOrg.investTemplateName`)
          .d('调查表模板名称'),
        dataIndex: 'templateName',
        fixed: 'left',
        width: 200,
      },
      {
        title: intl.get(`sslm.investDefOrg.model.investDefOrg.versionNumber`).d('版本'),
        dataIndex: 'versionNumber',
        width: 80,
      },
      {
        title: intl.get(`sslm.investDefOrg.model.investDefOrg.latestFlag`).d('生效状态'),
        dataIndex: 'releaseFlag',
        width: 150,
        render: (val, record) =>
          val ? (
            intl.get(`sslm.investDefOrg.view.message.table.effect`).d('已发布')
          ) : (
            <a onClick={() => this.latestFlag(record)}>
              {intl.get('hzero.common.button.release').d('发布')}
            </a>
          ),
      },
      {
        title: intl.get(`sslm.investDefOrg.model.investDefOrg.investigateType`).d('调查表类型'),
        dataIndex: 'investigateTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`sslm.investDefOrg.model.investDefOrg.industryId`).d('行业'),
        dataIndex: 'industryMeaning',
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 150,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`remark`, {
              initialValue: record.remark,
            })(<Input />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: (val, record) => (
          <FormItem>
            {record.$form.getFieldDecorator(`enabledFlag`, {
              initialValue: record.enabledFlag === 0 ? 0 : 1,
            })(<Checkbox />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`sslm.investDefOrg.model.investDefOrg.templateDetail`).d('模板明细'),
        dataIndex: 'templateDetail',
        width: 100,
        render: (val, record) => (
          <a onClick={() => this.toTemplateDetail(record.investigateTemplateId)}>
            {intl.get(`sslm.investDefOrg.model.investDefOrg.templateDetail`).d('模板明细')}
          </a>
        ),
      },
      {
        title: intl.get(`sslm.investDefOrg.model.investDefOrg.allocateToCompany`).d('分配公司'),
        dataIndex: 'allocateToCompany',
        width: 100,
        render: (val, record) => (
          <a onClick={() => this.handleAllocateToCompany(record)}>
            {intl.get(`sslm.investDefOrg.model.investDefOrg.allocateToCompany`).d('分配公司')}
          </a>
        ),
      },
      // {
      //   title: intl
      //     .get(`sslm.investDefOrg.model.investDefOrg.conditionsConfiguration`)
      //     .d('发送条件配置'),
      //   dataIndex: 'conditionsConfiguration',
      //   width: 150,
      //   render: (val, record) => (
      //     <a onClick={() => this.handleConditionsConfiguration(record)}>
      //       {intl.get(`sslm.investDefOrg.model.investDefOrg.ruleConfiguration`).d('条件配置')}
      //     </a>
      //   ),
      // },
      {
        title: intl.get(`sslm.investDefOrg.model.investDefOrg.creator`).d('创建人'),
        dataIndex: 'creator',
        width: 150,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        dataIndex: 'option',
        render: (val, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleEditQuestionnaire(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a onClick={() => this.handleTemplateCopy(record)} disabled={!record.enabledFlag}>
                {intl.get('hzero.common.button.copy').d('复制')}
              </a>
            </span>
          );
        },
      },
    ];
    const scrollX = sum(columns.map(item => (isNumber(item.width) ? item.width : 150)));
    const editTableProps = {
      // rowSelection,
      columns,
      dataSource,
      pagination,
      scroll: { x: scrollX },
      bordered: true,
      loading: effecting,
      className: styles.table,
      rowKey: 'investigateTemplateId',
      onChange: onSearchPaging,
    };
    return customizeTable(
      {
        code: 'SSLM.INVESTIGATION_TEMPLATE_LIST.TABLE',
        readOnly: true,
      },
      <EditTable {...editTableProps} />
    );
  }
}
