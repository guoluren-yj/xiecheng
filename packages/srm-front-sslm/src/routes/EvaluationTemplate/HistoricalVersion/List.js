/**
 * List - 查看历史版本记录页面 - 列表组件
 * @Author: zlh
 * @Date: 2022-9-13 10:03:57
 * @LastEditTime: 2022-9-13 10:03:57
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Dropdown, Icon, Menu, Tooltip } from 'hzero-ui';
import { sum } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import Checkbox from 'components/Checkbox';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';

// EditableContext组件初始化
const EditableContext = React.createContext();

@formatterCollections({
  code: ['spfm.evaluationTemplate', 'sslm.evaluationTemplate', 'sslm.common', 'hzero.common'],
})
export default class List extends PureComponent {
  /**
   * operiationRender - 操作render
   * @param {String} text - 显示内容
   * @param {object} record - 行数据
   */
  @Bind()
  operationRender(text, record) {
    const defaultMenuItemsGroup = [];
    // 当模板类型不是下单推荐供应商需要增加两个默认按钮
    if (record.evalTplType !== 'GYSKP_ORDER') {
      defaultMenuItemsGroup.push(
        <Menu.Item key="assignScoreLevel">
          {intl.get(`sslm.evaluationTemplate.view.button.viewScoreLevel`).d('查看评分等级')}
        </Menu.Item>,
        <Menu.Item key="assignCompany">
          {intl.get(`sslm.evaluationTemplate.view.button.viewCompany`).d('查看适用公司')}
        </Menu.Item>
      );
    }
    if (record.evalFlag === 1) {
      defaultMenuItemsGroup.push(
        <Menu.Item key="assignSupplierCategory">
          {intl
            .get(`sslm.evaluationTemplate.view.button.viewSupplierCategory`)
            .d('查看供应商及品类')}
        </Menu.Item>
      );
    }
    const menuItemsGroup = {
      HGGYSZR: [
        <Menu.Item key="assignPurchaseCategory">
          {intl.get(`sslm.evaluationTemplate.view.button.viewPurchaseCategory`).d('查看采购品类')}
        </Menu.Item>,
      ],
      GYSKP_AUTO: [
        <Menu.Item key="supplierEvaluationAuto">
          {intl
            .get(`sslm.evaluationTemplate.view.button.viewPurchaseCategoryAuto`)
            .d('查看自动考评配置')}
        </Menu.Item>,
      ],
    };
    const menu = (
      <Menu onClick={({ key }) => this.onOperationRenderMenuClick(key, record)}>
        {defaultMenuItemsGroup.concat(menuItemsGroup[record.evalTplType])}
      </Menu>
    );
    const actionRender =
      defaultMenuItemsGroup.length > 0 ? (
        <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
          <a className="ant-dropdown-link">
            {intl.get('hzero.common.button.action').d('操作')} <Icon type="down" />
          </a>
        </Dropdown>
      ) : (
        <a style={{ opacity: 0.2 }}>
          {intl.get('hzero.common.button.action').d('操作')} <Icon type="down" />
        </a>
      );
    return actionRender;
  }

  @Bind()
  onOperationRenderMenuClick(key, record) {
    const {
      openAssignSupplierCategory = e => e,
      onHandleViewCompany = e => e,
      toScoreLevel = e => e,
      toPurchaseCate = e => e,
      openSupplierEvaluationAuto = e => e,
    } = this.props;
    const action = {
      supplierEvaluationAuto: () => openSupplierEvaluationAuto(record), // 查看自动考评配置
      assignSupplierCategory: () => openAssignSupplierCategory(record), // ///// 查看供应商及品类
      assignCompany: () => onHandleViewCompany(true, record), // 查看适用公司
      assignScoreLevel: () => toScoreLevel(record), // 查看评分等级
      assignPurchaseCategory: () => toPurchaseCate(record), // 查看采购品类
    };
    if (action[key]) {
      action[key]();
    }
  }

  @Bind()
  assignIndicatorsRender(text, record = {}) {
    const { redirectIndicators, defaultTableRowKey } = this.props;
    return (
      <a onClick={() => redirectIndicators(record, record[defaultTableRowKey], 'view')}>
        {intl.get(`sslm.evaluationTemplate.view.title.viewIndicators`).d('查看指标')}
      </a>
    );
  }

  @Bind()
  evalTplTypeRender(...rest) {
    const record = rest[1] || {};
    return record.evalTplTypeMeaning;
  }

  @Bind()
  getColumns() {
    const { kpiEvalTplTypeCode = [] } = this.props;
    const defaultColumns = [
      {
        title: intl
          .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplCode`)
          .d('评分模板编码'),
        dataIndex: 'evalTplCode',
        width: 160,
      },
      {
        title: intl
          .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplDesc`)
          .d('评分模板名称'),
        dataIndex: 'evalTplName',
        width: 180,
      },
      {
        title: intl.get(`spfm.evaluationTemplate.model.evaluationTemplate.versionNum`).d('版本'),
        dataIndex: 'versionNum',
        width: 90,
      },
      {
        title: intl.get(`sslm.evaluationTemplate.view.title.viewIndicators`).d('查看指标'),
        width: 100,
        render: this.assignIndicatorsRender,
      },
      {
        title: intl
          .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplType`)
          .d('模版类型'),
        dataIndex: 'evalTplType',
        width: 160,
        render: this.evalTplTypeRender,
      },
      {
        title: intl
          .get(`spfm.evaluationTemplate.model.evaluationTemplate.weightFlag`)
          .d('权重式计算'),
        dataIndex: 'weightedFlag',
        width: 100,
        render: text => <Checkbox disabled value={text} />,
      },
      {
        title: intl
          .get(`sslm.evaluationTemplate.model.evaluationTemplate.evalFlag`)
          .d('是否用于考评档案'),
        dataIndex: 'evalFlag',
        width: 130,
        render: text => <Checkbox disabled value={text} />,
      },
      {
        title: (
          <Tooltip
            title={intl
              .get('sslm.common.model.formula.averageFlagTooltip')
              .d('评分人无权重，汇总时取平均分。')}
          >
            {intl
              .get(`sslm.evaluationTemplate.model.evaluationTemplate.averageFlag`)
              .d('平均式计算')}
            <Icon type="question-circle-o" style={{ marginLeft: 6 }} />
          </Tooltip>
        ),
        dataIndex: 'averageFlag',
        width: 120,
        render: text => <Checkbox disabled value={text} />,
      },
      {
        title: (
          <Tooltip
            title={intl
              .get('sslm.common.model.formula.abandonFlagTooltip')
              .d('允许评分人放弃打分，不计入总分。')}
          >
            {intl.get(`sslm.evaluationTemplate.model.evaluationTemplate.abandonFlag`).d('允许放弃')}
            <Icon type="question-circle-o" style={{ marginLeft: 6 }} />
          </Tooltip>
        ),
        dataIndex: 'abandonFlag',
        width: 120,
        render: text => <Checkbox disabled value={text} />,
      },
      {
        title: (
          <Tooltip
            title={intl
              .get('sslm.evaluationTemplate.model.template.isEvaluateTip')
              .d('考评档案最终结果发布至供应商后，配置是否允许供应商对分数进行申诉')}
          >
            {intl
              .get(`sslm.evaluationTemplate.model.template.supplierComplaint`)
              .d('允许供应商申诉')}
            <Icon type="question-circle-o" style={{ marginLeft: 6 }} />
          </Tooltip>
        ),
        dataIndex: 'allowAppealFlag',
        width: 140,
        render: text => <Checkbox disabled value={text} />,
      },
      {
        title: intl.get(`sslm.evaluationTemplate.model.template.lastUpdatedUser`).d('发布人'),
        dataIndex: 'publishUserName',
        width: 90,
        render: (val, record) => val || record.lastUpdatedUser,
      },
      {
        title: intl.get(`sslm.evaluationTemplate.model.template.lastUpdateDate`).d('版本发布时间'),
        dataIndex: 'publishTime',
        width: 170,
        render: (val, record) => dateTimeRender(val || record.lastUpdateDate),
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: '_action',
        width: 90,
        render: this.operationRender,
      },
    ];

    return defaultColumns.map(n => ({
      ...n,
      onCell: record =>
        Object.assign(
          {
            record,
            dataIndex: n.dataIndex,
            title: n.title,
            style: {
              overflow: 'hidden',
              maxWidth: 240,
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
            editable: false,
            contextConsumer: EditableContext.Consumer,
            render: n.render,
          },
          n.dataIndex === 'evalTplType'
            ? {
                kpiEvalTplTypeCode,
              }
            : {}
        ),
    }));
  }

  render() {
    const { dataSource = [], pagination, loading, defaultTableRowKey, onChange } = this.props;
    const tableProps = {
      onChange,
      dataSource,
      columns: this.getColumns(),
      rowKey: defaultTableRowKey,
      bordered: true,
      loading,
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) };
    return <Table {...tableProps} />;
  }
}
