/**
 * TemplateList - 供应商绩效标准指标定义 - 列表组件
 * @date: 2023-5-30
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Dropdown, Icon, Menu, Tooltip, Form, Input, Select } from 'hzero-ui';
import { sum, uniqBy, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import EditTable from 'components/EditTable';

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

const FormItem = Form.Item;
const { Option } = Select;

@formatterCollections({
  code: ['spfm.evaluationTemplate', 'sslm.evaluationTemplate', 'sslm.common'],
})
export default class TemplateList extends PureComponent {
  constructor(props) {
    super(props);
    this.props.onRef(this);
  }

  /**
   * operiationRender - 操作render
   * @param {String} text - 显示内容
   * @param {object} record - 行数据
   */
  @Bind()
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
      <Menu.Item key="copy">{intl.get('hzero.common.button.copy').d('复制')}</Menu.Item>,
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

  @Bind()
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
      onCopy = e => e,
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
          ),
          record
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
      copy: () => onCopy(record),
    };
    if (action[key]) {
      action[key]();
    }
  }

  @Bind()
  assignIndicatorsRender(text, record = {}) {
    const { redirectIndicators, defaultTableRowKey } = this.props;
    const showText = record._status === 'update' || record._status === 'create';
    return showText ? (
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

  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 2400,
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

  @Bind()
  getColumns() {
    const { kpiEvalTplTypeCode = [] } = this.props;
    const columns = [
      {
        title: intl
          .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplCode`)
          .d('评分模板编码'),
        dataIndex: 'evalTplCode',
        width: 180,
        render: (text, record) => {
          if (record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('evalTplCode', {
                  initialValue: text,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplCode`)
                          .d('评分模板编码'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                })(<Input inputChinese={false} />)}
              </FormItem>
            );
          } else {
            return text;
          }
        },
      },
      {
        title: intl
          .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplDesc`)
          .d('评分模板名称'),
        dataIndex: 'evalTplName',
        width: 200,
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('evalTplName', {
                  initialValue: text,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplDesc`)
                          .d('评分模板名称'),
                      }),
                    },
                    {
                      max: 240,
                      message: intl.get('hzero.common.validation.max', {
                        max: 240,
                      }),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            );
          } else {
            return text;
          }
        },
        onCell: this.onCell,
      },
      {
        title: intl.get(`spfm.evaluationTemplate.model.evaluationTemplate.status`).d('模板状态'),
        dataIndex: 'evalStatusCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`spfm.evaluationTemplate.model.evaluationTemplate.versionNum`).d('版本'),
        dataIndex: 'versionNum',
        width: 100,
      },
      {
        title: intl.get(`sslm.evaluationTemplate.view.title.assignIndicators`).d('分配指标'),
        width: 100,
        dataIndex: 'assignIndicators',
        render: this.assignIndicatorsRender,
      },
      {
        title: intl
          .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplType`)
          .d('模版类型'),
        dataIndex: 'evalTplType',
        width: 160,
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator = e => e, setFieldsValue = e => e } = record.$form || {};
            return (
              <FormItem>
                {getFieldDecorator('evalTplType', {
                  initialValue: text,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`spfm.evaluationTemplate.model.evaluationTemplate.evalTplType`)
                          .d('模版类型'),
                      }),
                    },
                  ],
                })(
                  <Select
                    allowClear
                    style={{ minWidth: 120 }}
                    onChange={value => {
                      if (value === 'HGGYSZR' || value === 'GYSKP_XC' || value === 'GYSKP_ORDER') {
                        setFieldsValue({ evalFlag: 0, averageFlag: 0 });
                      } else {
                        setFieldsValue({ evalFlag: 1 });
                      }
                    }}
                    disabled={record._status === 'update'}
                  >
                    {kpiEvalTplTypeCode.map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            );
          } else {
            return record.evalTplTypeMeaning;
          }
        },
      },
      {
        title: intl
          .get(`spfm.evaluationTemplate.model.evaluationTemplate.weightFlag`)
          .d('权重式计算'),
        dataIndex: 'weightedFlag',
        width: 100,
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('weightedFlag', {
                  initialValue: isNil(text) ? 1 : text,
                })(<Checkbox />)}
              </FormItem>
            );
          } else {
            return <Checkbox disabled value={text} />;
          }
        },
      },
      {
        title: intl
          .get(`sslm.evaluationTemplate.model.evaluationTemplate.evalFlag`)
          .d('是否用于考评档案'),
        dataIndex: 'evalFlag',
        width: 130,
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator = e => e, setFieldsValue = e => e, getFieldValue = e => e } =
              record.$form || {};
            return (
              <FormItem>
                {getFieldDecorator('evalFlag', {
                  initialValue: isNil(text) ? 0 : text,
                })(
                  <Checkbox
                    onChange={e => {
                      if (e.target.value === 1) {
                        setFieldsValue({ abandonFlag: 0, allowAppealFlag: 0 });
                      }
                      // "业务单据评价","是否用于考评档案"改变时，清空"平均式计算"
                      if (
                        ['BDKPI_EVAL'].includes(getFieldValue('evalTplType') || record.evalTplType)
                      ) {
                        setFieldsValue({ averageFlag: 0 });
                      }
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return <Checkbox disabled value={text} />;
          }
        },
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
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator = e => e, setFieldsValue = e => e, getFieldValue = e => e } =
              record.$form || {};
            return (
              <FormItem>
                {getFieldDecorator('averageFlag', {
                  initialValue: isNil(text) ? 0 : text,
                })(
                  <Checkbox
                    disabled={
                      !(
                        getFieldValue('evalTplType') === 'GYSKP' ||
                        getFieldValue('evalTplType') === 'GYSKP_AUTO' ||
                        getFieldValue('evalTplType') === 'GYSKP_XC' ||
                        record.evalTplType === 'GYSKP' ||
                        record.evalTplType === 'GYSKP_AUTO' ||
                        record.evalTplType === 'GYSKP_XC' ||
                        (['BDKPI_EVAL'].includes(
                          getFieldValue('evalTplType') || record.evalTplType
                        ) &&
                          getFieldValue('evalFlag'))
                      )
                    }
                    onChange={e => {
                      if (e.target.value === 1) {
                        setFieldsValue({ abandonFlag: 0 });
                      }
                    }}
                  />
                )}
              </FormItem>
            );
          } else {
            return <Checkbox disabled value={text} />;
          }
        },
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
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator = e => e, getFieldValue = e => e } = record.$form || {};
            return (
              <FormItem>
                {getFieldDecorator('abandonFlag', {
                  initialValue: isNil(text) ? 0 : text,
                })(
                  <Checkbox
                    disabled={
                      !(
                        getFieldValue('evalTplType') === 'GYSKP' ||
                        getFieldValue('evalTplType') === 'GYSKP_AUTO' ||
                        getFieldValue('evalTplType') === 'GYSKP_XC' ||
                        record.evalTplType === 'GYSKP' ||
                        record.evalTplType === 'GYSKP_AUTO' ||
                        record.evalTplType === 'GYSKP_XC' ||
                        getFieldValue('evalFlag')
                      ) || !getFieldValue('averageFlag')
                    }
                  />
                )}
              </FormItem>
            );
          } else {
            return <Checkbox disabled value={text} />;
          }
        },
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
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator = e => e, getFieldValue = e => e } = record.$form || {};
            return (
              <FormItem>
                {getFieldDecorator('allowAppealFlag', {
                  initialValue: isNil(text) ? 0 : text,
                })(<Checkbox disabled={!getFieldValue('evalFlag')} />)}
              </FormItem>
            );
          } else {
            return <Checkbox disabled value={text} />;
          }
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 90,
        render: (text, record) => {
          if (record._status === 'update' || record._status === 'create') {
            return (
              <FormItem>
                {record.$form.getFieldDecorator('enabledFlag', {
                  initialValue: isNil(text) ? 1 : text,
                })(<Checkbox />)}
              </FormItem>
            );
          } else {
            return enableRender(text);
          }
        },
        // render: enableRender,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'action',
        width: 90,
        // fixed: 'right',
        render: this.operationRender,
      },
    ];
    return columns;
  }

  render() {
    const {
      dataSource = [],
      pagination,
      loading,
      defaultTableRowKey,
      onChange = e => e,
      customizeTable = () => {},
      custLoading = false,
    } = this.props;
    const columns = this.getColumns();
    const scrollX = sum(columns.map(n => n.width));
    return customizeTable(
      {
        code: 'SSLM.EVALUATION_TEMPLATE.LIST.TABLE',
      },
      <EditTable
        bordered
        scroll={{ x: scrollX }}
        rowKey={defaultTableRowKey}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onChange}
        loading={loading}
        custLoading={custLoading}
      />
    );
  }
}
