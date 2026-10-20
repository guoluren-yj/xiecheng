/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Dropdown, Icon, Menu, Tooltip } from 'hzero-ui';
import { sum, uniqBy, isEmpty } from 'lodash';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import EditableRow from './EditableRow';
import EditableCell from './EditableCell';
// import { MenuRoute } from 'components/Router';

// EditableContext组件初始化
const EditableContext = React.createContext();

function isNewRow(editableRows, index) {
  const editableRow = editableRows.some(o => o.key === index && o.isCreate);
  return editableRow;
}

/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @extends {Component} - React.Component
 * @reactProps {function} [ref= (e => e)] - react ref属性
 * @reactProps {boolean} [loading=false] - 表格处理状态
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @reactProps {object} [pagination={}] - 分页数据
 * @reactProps {Array<Object>} [dataSource=[]] - 表格数据源
 * @reactProps {object} [rowSelection={}] - 表格选择框配置
 * @return React.element
 */

// 已废弃

@formatterCollections({
  code: ['spfm.evaluationTemplate', 'sslm.evaluationTemplate', 'sslm.common'],
})
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    [
      'operationRender',
      'onOperationRenderMenuClick',
      'assignIndicatorsRender',
      'getColumns',
      'onTableRow',
      'setTableRowForms',
      'evalStatusCodeRender',
      'evalTplTypeRender',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
    this.props.onRef(this);
  }

  /**
   * operiationRender - 操作render
   * @param {String} text - 显示内容
   * @param {object} record - 行数据
   */
  operationRender(text, record) {
    const {
      editableRows,
      cancelEditing = e => e,
      deleteNewRow = e => e,
      defaultTableRowKey,
      unlockingRowData = [],
      enadledRowProcessingKeys = [],
      publishingRowData = [],
    } = this.props;
    const defaultMenuItemsGroup = [
      unlockingRowData.some(o => o[defaultTableRowKey] === record[defaultTableRowKey]) ? (
        <Menu.Item key="unlocking">
          <Icon type="loading" />
        </Menu.Item>
      ) : record.evalStatusCode === 'PUBLISHED' ? (
        <Menu.Item key="unlock">{intl.get('sslm.common.view.button.unlock').d('解锁')}</Menu.Item>
      ) : (
        <Menu.Item key="edit">{intl.get('hzero.common.button.edit').d('编辑')}</Menu.Item>
      ),
      record.evalStatusCode !== 'PUBLISHED' && (
        <Menu.Item key="publish">
          {publishingRowData.some(o => o === record[defaultTableRowKey]) ? (
            <Icon type="loading" />
          ) : (
            <a>{intl.get(`hzero.common.button.release`).d('发布')}</a>
          )}
        </Menu.Item>
      ),
      <Menu.Item key="enable">
        {enadledRowProcessingKeys.some(o => o === record[defaultTableRowKey]) ? (
          <Icon type="loading" />
        ) : record.enabledFlag === 1 ? (
          intl.get('hzero.common.status.disable')
        ) : (
          intl.get('hzero.common.status.enable')
        )}
      </Menu.Item>,
    ];
    // 当模板类型不是下单推荐供应商需要增加两个默认按钮
    if (record.evalTplType !== 'GYSKP_ORDER') {
      defaultMenuItemsGroup.push(
        <Menu.Item key="assignScoreLevel">
          {record.evalStatusCode === 'PUBLISHED'
            ? intl.get(`sslm.evaluationTemplate.view.button.viewScoreLevel`).d('查看评分等级')
            : intl.get(`sslm.evaluationTemplate.view.button.assignScoreLevel`).d('定义评分等级')}
        </Menu.Item>,
        <Menu.Item key="assignCompany">
          {record.evalStatusCode === 'PUBLISHED'
            ? intl.get(`sslm.evaluationTemplate.view.button.viewCompany`).d('查看适用公司')
            : intl.get(`sslm.evaluationTemplate.view.button.assignCompany`).d('分配适用公司')}
        </Menu.Item>
      );
    }
    if (record.evalFlag === 1) {
      defaultMenuItemsGroup.push(
        <Menu.Item key="assignSupplierCategory">
          {record.evalStatusCode === 'PUBLISHED'
            ? intl
                .get(`sslm.evaluationTemplate.view.button.viewSupplierCategory`)
                .d('查看供应商及品类')
            : intl
                .get(`sslm.evaluationTemplate.view.button.assignSupplierCategory`)
                .d('分配供应商及品类')}
        </Menu.Item>
      );
    }
    const menuItemsGroup = {
      // GYSKP: [
      //   record.evalFlag === 1 ? (
      //     <Menu.Item key="assignSupplierCategory">
      //       {record.evalStatusCode === 'PUBLISHED'
      //         ? intl
      //             .get(`sslm.evaluationTemplate.view.button.viewSupplierCategory`)
      //             .d('查看供应商及品类')
      //         : intl
      //             .get(`sslm.evaluationTemplate.view.button.assignSupplierCategory`)
      //             .d('分配供应商及品类')}
      //     </Menu.Item>
      //   ) : (
      //     ''
      //   ),
      // ],
      HGGYSZR: [
        <Menu.Item key="assignPurchaseCategory">
          {record.evalStatusCode === 'PUBLISHED'
            ? intl.get(`sslm.evaluationTemplate.view.button.viewPurchaseCategory`).d('查看采购品类')
            : intl.get(`sslm.evaluationTemplate.view.button.purchaseCategory`).d('分配采购品类')}
        </Menu.Item>,
      ],
      GYSKP_AUTO: [
        // record.evalFlag === 1 ? (
        //   <Menu.Item key="assignSupplierCategory">
        //     {record.evalStatusCode === 'PUBLISHED'
        //       ? intl
        //           .get(`sslm.evaluationTemplate.view.button.viewSupplierCategory`)
        //           .d('查看供应商及品类')
        //       : intl
        //           .get(`sslm.evaluationTemplate.view.button.assignSupplierCategory`)
        //           .d('分配供应商及品类')}
        //   </Menu.Item>
        // ) : (
        //   ''
        // ),
        <Menu.Item key="supplierEvaluationAuto">
          {record.evalStatusCode === 'PUBLISHED'
            ? intl
                .get(`sslm.evaluationTemplate.view.button.viewPurchaseCategoryAuto`)
                .d('查看自动考评配置')
            : intl
                .get(`sslm.evaluationTemplate.view.button.purchaseCategoryAuto`)
                .d('自动考评配置')}
        </Menu.Item>,
      ],
      // BDKPI_EVAL: [
      //   <Menu.Item key="assignSupplierCategory">
      //     {record.evalStatusCode === 'PUBLISHED'
      //       ? intl
      //           .get(`sslm.evaluationTemplate.view.button.viewSupplierCategory`)
      //           .d('查看供应商及品类')
      //       : intl
      //           .get(`sslm.evaluationTemplate.view.button.assignSupplierCategory`)
      //           .d('分配供应商及品类')}
      //   </Menu.Item>,
      // ],
    };
    if (record.evalStatusCode !== 'NEW') {
      defaultMenuItemsGroup.push(
        <Menu.Item key="viewHistory">
          {intl.get(`hzero.common.button.viewHistory`).d('查看历史版本')}
        </Menu.Item>
      );
    }
    const menu = (
      <Menu onClick={({ key }) => this.onOperationRenderMenuClick(key, record)}>
        {defaultMenuItemsGroup.concat(menuItemsGroup[record.evalTplType])}
      </Menu>
    );
    let actionRender = (
      <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
        <a className="ant-dropdown-link">
          {intl.get('hzero.common.button.action').d('操作')} <Icon type="down" />
        </a>
      </Dropdown>
    );
    if (editableRows.some(o => o.key === record[defaultTableRowKey])) {
      actionRender =
        record._status === 'create' ? (
          <a onClick={() => deleteNewRow((record || {})[defaultTableRowKey])}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        ) : (
          <a onClick={() => cancelEditing(record[defaultTableRowKey])}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </a>
        );
    }
    return actionRender;
  }

  onOperationRenderMenuClick(key, record) {
    const {
      editableRows,
      setRowEditable = e => e,
      defaultTableRowKey,
      openAssignSupplierCategory = e => e,
      openViewHistory = e => e,
      unlockEvalTpl = e => e,
      enableEvalTemplate = e => e,
      publishEvalTpl = e => e,
      onHandleViewCompany = e => e,
      toScoreLevel = e => e,
      toPurchaseCate = e => e,
      openSupplierEvaluationAuto = e => e,
    } = this.props;
    const action = {
      edit: () => {
        setRowEditable(
          uniqBy(
            editableRows.concat({
              key: record[defaultTableRowKey],
              defaultRowDataSource: record,
              isCreate: false,
            }),
            'key'
          )
        );
      },
      supplierEvaluationAuto: () => openSupplierEvaluationAuto(record),
      assignSupplierCategory: () => openAssignSupplierCategory(record),
      viewHistory: () => openViewHistory(record),
      assignCompany: () => onHandleViewCompany(true, record),
      assignScoreLevel: () => toScoreLevel(record),
      assignPurchaseCategory: () => toPurchaseCate(record),
      unlock: () => unlockEvalTpl(record),
      enable: () =>
        enableEvalTemplate({ ...record, enabledFlag: record.enabledFlag === 1 ? 0 : 1 }),
      publish: () => publishEvalTpl(record),
    };
    if (action[key]) {
      action[key]();
    }
  }

  assignIndicatorsRender(text, record = {}) {
    const { redirectIndicators, defaultTableRowKey, editableRows = [] } = this.props;
    return editableRows.some(o => o.key === record[defaultTableRowKey]) ? (
      intl.get(`sslm.evaluationTemplate.view.title.assignIndicators`).d('分配指标')
    ) : (
      <a
        onClick={() =>
          redirectIndicators(
            record,
            record[defaultTableRowKey],
            record.evalStatusCode !== 'PUBLISHED' ? 'edit' : 'view'
          )
        }
      >
        {intl.get(`sslm.evaluationTemplate.view.title.assignIndicators`).d('分配指标')}
      </a>
    );
  }

  evalStatusCodeRender(text, record) {
    const {
      publishEvalTpl = e => e,
      publishingRowData,
      defaultTableRowKey,
      editableRows,
    } = this.props;
    return record.evalStatusCode !== 'PUBLISHED' &&
      record.enabledFlag === 1 &&
      editableRows.every(o => o.key !== record[defaultTableRowKey]) ? (
      publishingRowData[defaultTableRowKey] === record[defaultTableRowKey] ? (
        <Icon type="loading" />
      ) : (
        <a onClick={() => publishEvalTpl(record)}>
          {intl.get(`hzero.common.button.release`).d('发布')}
        </a>
      )
    ) : (
      record.evalStatusCodeMeaning
    );
  }

  evalTplTypeRender(...rest) {
    const record = rest[1] || {};
    return record.evalTplTypeMeaning;
  }

  getColumns() {
    const { editableRows = [], defaultTableRowKey, kpiEvalTplTypeCode = [] } = this.props;
    const defaultColumns = [
      {
        title: intl
          .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplCode`)
          .d('评分模板编码'),
        dataIndex: 'evalTplCode',
        width: 180,
      },
      {
        title: intl
          .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplDesc`)
          .d('评分模板名称'),
        dataIndex: 'evalTplName',
        width: 200,
      },
      {
        title: intl.get(`spfm.evaluationTemplate.model.evaluationTemplate.status`).d('模板状态'),
        dataIndex: 'evalStatusCodeMeaning',
        width: 100,
        // render: this.evalStatusCodeRender,
      },
      {
        title: intl.get(`spfm.evaluationTemplate.model.evaluationTemplate.versionNum`).d('版本'),
        dataIndex: 'versionNum',
        width: 100,
      },
      {
        title: intl.get(`sslm.evaluationTemplate.view.title.assignIndicators`).d('分配指标'),
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
        width: 130,
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
        width: 130,
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
        width: 150,
        render: text => <Checkbox disabled value={text} />,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 90,
        render: enableRender,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: '_action',
        width: 90,
        // fixed: 'right',
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
            editable: editableRows.some(o => o.key === record[defaultTableRowKey]),
            status: isNewRow(editableRows, record[defaultTableRowKey]) ? 'add' : 'update',
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

  onTableRow(record = {}) {
    // const { editableRows = [], defaultTableRowKey } = this.props;
    return Object.assign(
      {
        onRef: node => {
          this.setTableRowForms(node, record);
        },
        contextProvider: EditableContext.Provider,
      }
      // editableRows.some(o => o.key === record[defaultTableRowKey])
      //   ? {
      //       style: {
      //         height: 40,
      //       },
      //     }
      //   : {}
    );
  }

  /**
   * setTableRowForms - 设置行缓存
   * @param {!object} node - 表格行this对象
   * @param {object} record - 行数据
   */
  setTableRowForms(node, record) {
    const { defaultTableRowKey } = this.props;
    if (isEmpty(this.tableRowForms)) {
      this.tableRowForms = []; // new Map();
    }
    // this.tableRowForms = this.tableRowForms.set(record.key, node);

    // this.tableRowForms = uniqBy(
    //   this.tableRowForms.concat({ key: record[defaultTableRowKey], row: node }),
    //   'key'
    // );
    const duplicateKey = this.tableRowForms.filter(n => n.key === record[defaultTableRowKey]);
    // 去重，取新的form
    if (!isEmpty(duplicateKey)) {
      this.tableRowForms = this.tableRowForms.map(n => {
        if (n.key === record[defaultTableRowKey]) {
          return {
            key: record[defaultTableRowKey],
            row: node,
          };
        } else {
          return n;
        }
      });
    } else {
      this.tableRowForms = this.tableRowForms.concat({
        key: record[defaultTableRowKey],
        row: node,
      });
    }
  }

  render() {
    const {
      dataSource = [],
      pagination,
      loading,
      defaultTableRowKey,
      onChange = e => e,
    } = this.props;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const tableProps = {
      dataSource,
      components,
      columns: this.getColumns(),
      rowKey: defaultTableRowKey,
      bordered: true,
      loading,
      pagination,
      onRow: this.onTableRow,
      onChange,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) };
    return <Table {...tableProps} />;
  }
}
