/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Icon, Form, Input, InputNumber, Select, Tooltip } from 'hzero-ui';
import { sum, isNumber, cloneDeep } from 'lodash';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import { Button } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';

const { Option } = Select;

const organizationId = getCurrentOrganizationId();

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
@formatterCollections({ code: ['spfm.supplierKpiIndicator'] })
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    [
      'onCell',
      'operiationRender',
      'formulaConfigurationRender',
      'handleEditRow',
      'findNode',
      'findAndSetNodeProps',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * onCell - 设置表格单元格属性函数
   */
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
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

  /**
   * operiationRender - 操作render
   * @param {String} text - 显示内容
   * @param {object} record - 行数据
   */
  operiationRender(text, record) {
    const {
      // openIndicatorDetail = (e) => e,
      addChildIndicator = e => e,
      openIndicationAssign = e => e,
      enable = e => e,
      handleDelete = e => e,
      actionRowKey,
      evalTplStatusAction,
      assignRecord = {},
      evalStatusCode,
    } = this.props;
    const { averageFlag = true } = assignRecord;
    // evalDimension:打分维度 RESP_SUPPLIER(评分人+供应商) | RESP(评分人)
    // respWeightVerifyFlag:评分人权重校验标识 0:通过 ｜ 1:不通过
    const { _status, evalDimension, respWeightVerifyFlag = 0 } = record;
    const hideDeleteflag = ['PUBLISHED'].includes(evalStatusCode);
    // 当模板为非平均式计算,且评分人权重不等于100%时，字段标红提示
    const showTipFlag = !averageFlag && Boolean(+respWeightVerifyFlag);
    const tipTltle =
      evalDimension === 'RESP'
        ? intl.get(`spfm.supplierKpiIndicator.view.respTooltip`).d('细项权限的权重之和必须为100')
        : evalDimension === 'RESP_SUPPLIER'
        ? intl
            .get(`spfm.supplierKpiIndicator.view.respSipplierTooltip`)
            .d('同一供应商细项权限的权重之和须为100')
        : '';
    const isEdit = _status === 'update';
    return (
      <span className="action-link">
        {evalTplStatusAction === 'edit' && +record.enabledFlag === 1 && (
          <a onClick={() => addChildIndicator(record)}>
            {intl.get(`spfm.supplierKpiIndicator.view.button.addChildIndicator`).d('新增下级指标')}
          </a>
        )}
        {evalTplStatusAction === 'edit' &&
          +record.enabledFlag === 1 &&
          (isEdit ? (
            <a onClick={() => this.handleEditRow(record, false)}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </a>
          ) : (
            <a onClick={() => this.handleEditRow(record, true)}>
              {intl.get(`hzero.common.button.edit`).d('编辑')}
            </a>
          ))}
        {evalTplStatusAction === 'edit' && (
          <a onClick={() => enable(record)}>
            {actionRowKey === record.indicatorId ? (
              <Icon type="loading" />
            ) : +record.enabledFlag === 1 ? (
              intl.get('hzero.common.status.disable').d('禁用')
            ) : (
              intl.get('hzero.common.status.enable').d('启用')
            )}
          </a>
        )}
        {record.scoreType !== 'SYSTEM' && +record.enabledFlag === 1 && (
          <Tooltip title={showTipFlag ? tipTltle : ''}>
            <Button
              type="text"
              onClick={() => openIndicationAssign(record)}
              permissionList={[
                {
                  code: 'srm.partner.evaluation-template.evaluation-template.button.rule.detail',
                  type: 'button',
                  meaning: '分配指标-细项权限',
                },
              ]}
              style={showTipFlag ? { color: 'red' } : {}}
            >
              {evalTplStatusAction === 'edit'
                ? intl.get(`spfm.supplierKpiIndicator.view.title.indicationAssign`).d('细项权限')
                : intl
                    .get(`spfm.supplierKpiIndicator.view.button.viewIndicationAssign`)
                    .d('查看细项权限')}
            </Button>
          </Tooltip>
        )}
        {!hideDeleteflag && (
          <a onClick={() => handleDelete(record)}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        )}
        {/* {(isEmpty(record.children) || record.isNoEnableChildren) &&
          record.scoreType !== 'SYSTEM' &&
          record.enabledFlag === 1 && (
            <a onClick={() => openIndicationAssign(record)}>
              {evalTplStatusAction === 'edit'
                ? intl.get(`spfm.supplierKpiIndicator.view.title.indicationAssign`).d('细项权限')
                : intl
                    .get(`spfm.supplierKpiIndicator.view.button.viewIndicationAssign`)
                    .d('查看细项权限')}
            </a>
          )} */}
      </span>
    );
  }

  /**
   * formulaConfigurationRender - 操作记录render
   * @param {String} text - 显示内容
   * @param {object} params - 查询条件
   */
  formulaConfigurationRender(text, record) {
    const {
      formulaConfig = e => e,
      optionsConfig = e => e,
      scoreAlertConfig = e => e,
    } = this.props;
    const configFlag = record.isNoChildren || record.isNoEnableChildren;
    const formulaConfigFlag = record.scoreType === 'SYSTEM';
    const optionsConfigFlag = record.scoreType === 'MANUAL' && record.indicatorType === 'OPT';
    return (
      <span>
        {configFlag &&
          ((formulaConfigFlag && (
            <a onClick={() => formulaConfig(record)}>
              {intl.get('spfm.supplierKpiIndicator.view.button.formulaConfig').d('公式配置')}
            </a>
          )) ||
            (optionsConfigFlag && (
              <a onClick={() => optionsConfig(record)}>
                {intl.get('spfm.supplierKpiIndicator.view.button.optionsConfig').d('选项配置')}
              </a>
            )))}
        <span
          style={{ paddingLeft: configFlag && (formulaConfigFlag || optionsConfigFlag) ? 5 : '' }}
        >
          <a onClick={() => scoreAlertConfig(record)}>
            {intl.get('spfm.supplierKpiIndicator.view.button.scoreAlertConfig').d('分数提醒配置')}
          </a>
        </span>
      </span>
    );
  }

  /**
   * 批量编辑/取消行
   * @param {object} record 每行数据 flag 新建/取消标识
   */
  handleEditRow(record, flag = false) {
    const { dataSource, defaultTableRowKey, updateDataSource = () => {} } = this.props;
    const { levelPath, parentId } = record;
    let newData = dataSource;

    if (+parentId !== -1) {
      const parentCursor = levelPath.split('/').map(item => item);
      const parentNode = this.findNode(
        newData,
        parentCursor.splice(0, parentCursor.length - 1),
        'indicatorCode'
      );
      const newChildren = cloneDeep(parentNode.children);
      const index = newChildren.findIndex(
        item => item[defaultTableRowKey] === record[defaultTableRowKey]
      );
      if (flag) {
        newChildren.splice(index, 1, {
          ...record,
          _status: 'update',
        });
      } else {
        const { _status, ...other } = record;
        newChildren.splice(index, 1, other);
      }
      newData = this.findAndSetNodeProps(
        dataSource,
        parentNode.levelPath.split('/').map(item => item),
        newChildren
      );
    } else {
      const index = newData.findIndex(
        item => item[defaultTableRowKey] === record[defaultTableRowKey]
      );
      if (flag) {
        newData.splice(index, 1, {
          ...dataSource[index],
          _status: 'update',
        });
      } else {
        const { _status, ...other } = dataSource[index];
        newData.splice(index, 1, other);
      }
    }
    updateDataSource(newData);
  }

  /**
   * 根据节点路径，在树形结构树中的对应节点
   * @param {Array} collections 树形结构树
   * @param {Array} cursorList 节点路径
   * @param {String} keyName 指标编码
   * @returns {Object} 节点信息
   */
  findNode(collection, cursorList = [], keyName) {
    let newCursorList = cursorList;
    const cursor = newCursorList[0];
    for (let i = 0; i < collection.length; i++) {
      if (collection[i][keyName] === cursor) {
        if (newCursorList[1]) {
          newCursorList = newCursorList.slice(1);
          return this.findNode(collection[i].children, newCursorList, keyName);
        }
        return collection[i];
      }
    }
  }

  /**
   * 根据节点路径，在树形结构树中的对应节点添加或替换children属性
   * @param {Array} collections 树形结构树
   * @param {Array} cursorList 节点路径
   * @param {Array} data  追加或替换的children数据
   * @returns {Array} 新的树形结构
   */
  findAndSetNodeProps(collections, cursorPath = [], data) {
    let newCursorList = cursorPath;
    const cursor = newCursorList[0];
    const tree = collections.map(n => {
      const m = n;
      if (m.indicatorCode === cursor) {
        if (newCursorList[1]) {
          if (!m.children) {
            m.children = [];
          }
          newCursorList = newCursorList.filter(o => newCursorList.indexOf(o) !== 0);
          m.children = this.findAndSetNodeProps(m.children, newCursorList, data);
        } else {
          m.children = [...data];
        }
        if (m.children.length === 0) {
          const { children, ...others } = m;
          return { ...others };
        } else {
          return m;
        }
      }
      return m;
    });
    return tree;
  }

  render() {
    const {
      loading,
      onChange,
      pagination,
      dataSource = [],
      defaultTableRowKey,
      expandedRowKeys = [],
      onExpand = e => e,
      assignRecord,
      customizeTable,
      custLoading,
      isVetoSelectList,
    } = this.props;
    const style = { padding: '0 1px', width: '100%' };
    const tableProps = {
      dataSource,
      columns: [
        {
          title: intl.get(`spfm.supplierKpiIndicator.model.supplier.indicatorCode`).d('指标编码'),
          dataIndex: 'indicatorCode',
          width: 150,
          fixed: 'left',
          onCell: this.onCell,
        },
        {
          title: intl.get(`spfm.supplierKpiIndicator.model.supplier.indicatorName`).d('指标名称'),
          dataIndex: 'indicatorName',
          width: 180,
          fixed: 'left',
          onCell: this.onCell,
        },
        {
          title: intl.get(`spfm.supplierKpiIndicator.model.supplier.scoreType`).d('评分方式'),
          dataIndex: 'scoreTypeMeaning',
          width: 120,
          fixed: 'left',
          onCell: this.onCell,
          render: (text, record) =>
            (record.isNoChildren || record.isNoEnableChildren) && +record.enabledFlag === 1
              ? text
              : null,
        },
        {
          title: intl.get(`spfm.supplierKpiIndicator.model.supplier.indicatorType`).d('指标类型'),
          dataIndex: 'indicatorTypeMeaning',
          width: 180,
          onCell: this.onCell,
        },
        {
          title: intl.get(`spfm.supplierKpiIndicator.model.suKpiIn.evalStandard`).d('评分标准'),
          dataIndex: 'evalStandard',
          width: 250,
          onCell: this.onCell,
          render: (value, record) => {
            if (record._status === 'update') {
              const { getFieldDecorator } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('evalStandard', {
                    initialValue: value,
                  })(<Input />)}
                </Form.Item>
              );
            } else {
              return value;
            }
          },
        },
        {
          title: intl.get(`spfm.supplierKpiIndicator.model.suKpiIn.respWeight`).d('权重%'),
          dataIndex: 'evalWeight',
          width: 100,
          onCell: this.onCell,
          render: (value, record) => {
            if (record._status === 'update') {
              const { getFieldDecorator } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('evalWeight', {
                    initialValue: value,
                    rules: [
                      {
                        required: assignRecord && assignRecord.weightedFlag,
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl
                            .get(`sslm.supplierKpiIndicator.model.sendOrder.evalWeight`)
                            .d('权重%'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      disabled={assignRecord && !assignRecord.weightedFlag}
                      precision={2}
                      min={0}
                      step={0.01}
                      style={style}
                    />
                  )}
                </Form.Item>
              );
            } else {
              return value;
            }
          },
        },
        {
          title: intl.get(`spfm.supplierKpiIndicator.model.suKpiIn.score`).d('分值'),
          dataIndex: 'score',
          width: 200,
          children: [
            {
              title: intl.get(`spfm.supplierKpiIndicator.model.supplier.scoreFrom`).d('分值从'),
              width: 100,
              align: 'right',
              dataIndex: 'scoreFrom',
              render: (value, record) => {
                if (record._status === 'update') {
                  const { getFieldDecorator } = record.$form;
                  return (
                    <Form.Item>
                      {getFieldDecorator('scoreFrom', {
                        initialValue: value,
                        rules: [
                          {
                            required:
                              record.indicatorType !== 'TICK' &&
                              record.indicatorType !== 'VETO' &&
                              record.indicatorType !== 'OPT',
                            message: intl.get(`hzero.common.validation.notNull`, {
                              name: intl
                                .get(`sslm.supplierKpiIndicator.model.sendOrder.scoreFrom`)
                                .d('分值从'),
                            }),
                          },
                        ],
                      })(
                        <InputNumber
                          disabled={
                            record.indicatorType === 'TICK' || record.indicatorType === 'VETO'
                          }
                          precision={2}
                          step={0.01}
                          style={style}
                        />
                      )}
                    </Form.Item>
                  );
                } else {
                  return value;
                }
              },
            },
            {
              title: intl.get(`spfm.supplierKpiIndicator.model.supplier.scoreTo`).d('分值至'),
              width: 100,
              align: 'right',
              dataIndex: 'scoreTo',
              render: (value, record) => {
                if (record._status === 'update') {
                  const { getFieldDecorator } = record.$form;
                  return (
                    <Form.Item>
                      {getFieldDecorator('scoreTo', {
                        initialValue: value,
                        rules: [
                          {
                            required:
                              record.indicatorType !== 'TICK' &&
                              record.indicatorType !== 'VETO' &&
                              record.indicatorType !== 'OPT',
                            message: intl.get(`hzero.common.validation.notNull`, {
                              name: intl
                                .get(`sslm.supplierKpiIndicator.model.sendOrder.scoreTo`)
                                .d('分值至'),
                            }),
                          },
                        ],
                      })(
                        <InputNumber
                          disabled={
                            record.indicatorType === 'TICK' || record.indicatorType === 'VETO'
                          }
                          precision={2}
                          step={0.01}
                          style={style}
                        />
                      )}
                    </Form.Item>
                  );
                } else {
                  return value;
                }
              },
            },
          ],
        },
        {
          title: intl.get(`spfm.supplierKpiIndicator.model.supplier.defaultScore`).d('缺省分值'),
          dataIndex: 'defaultScore',
          width: 100,
          render: (value, record) => {
            if (record._status === 'update') {
              const { getFieldDecorator } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('defaultScore', {
                    initialValue: value,
                  })(
                    <InputNumber
                      precision={2}
                      step={0.01}
                      style={style}
                      disabled={record.indicatorType !== 'SCORE'}
                    />
                  )}
                </Form.Item>
              );
            } else {
              return value;
            }
          },
        },
        {
          title: intl.get(`spfm.supplierKpiIndicator.model.supplier.indiScore`).d('指标分值'),
          dataIndex: 'indicatorScore',
          width: 100,
          render: (value, record) => {
            if (record._status === 'update') {
              const { getFieldDecorator, setFieldsValue, getFieldValue } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('indicatorScore', {
                    initialValue: value,
                    rules: [
                      {
                        required: record.indicatorType === 'TICK',
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl
                            .get('spfm.supplierKpiIndicator.model.supplier.indiScore')
                            .d('指标分值'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      disabled={record.indicatorType !== 'TICK'}
                      precision={2}
                      step={0.01}
                      style={style}
                      onChange={newValue => {
                        switch (record.indicatorType) {
                          case 'TICK':
                            if (+getFieldValue('isStandard') === 1) {
                              setFieldsValue({ defaultScore: newValue });
                            }
                            break;

                          default:
                            break;
                        }
                      }}
                    />
                  )}
                </Form.Item>
              );
            } else {
              return value;
            }
          },
        },
        {
          title: intl
            .get(`spfm.supplierKpiIndicator.model.supplier.isStandard`)
            .d('勾选式/否决项缺省值'),
          dataIndex: 'isStandard',
          width: 180,
          render: (value, record) => {
            if (record._status === 'update') {
              const { getFieldDecorator, setFieldsValue, getFieldValue } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('isStandard', {
                    initialValue: value,
                  })(
                    <Select
                      style={{ width: '100%' }}
                      disabled={record.indicatorType !== 'TICK' && record.indicatorType !== 'VETO'}
                      onChange={val => {
                        // 指标类型为勾选式，保留原带值逻辑
                        if (record.indicatorType === 'TICK') {
                          if (+val === 0) {
                            setFieldsValue({ defaultScore: 0 });
                          } else {
                            setFieldsValue({ defaultScore: getFieldValue('indicatorScore') });
                          }
                        }
                      }}
                    >
                      {isVetoSelectList.map(n => (
                        <Option key={n.value} value={+n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              );
            } else {
              return record.isStandardMeaning;
            }
          },
        },
        {
          title: intl
            .get('spfm.supplierKpiIndicator.model.supplier.indicatorOpt')
            .d('选择项缺省值'),
          dataIndex: 'evalTplIndOptId',
          width: 180,
          render: (value, record) => {
            if (record._status === 'update') {
              const { getFieldDecorator, setFieldsValue } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('evalTplIndOptId', {
                    initialValue: value,
                  })(
                    <Lov
                      disabled={record.indicatorType !== 'OPT'}
                      code="SSLM.SELECT_TPL_IND_OPT"
                      textValue={record.evalTplIndOptIdMeaning}
                      queryParams={{ evalTplIndId: record.evalTplIndId, tenantId: organizationId }}
                      onChange={(_, lovRecord) => {
                        const { score } = lovRecord || {};
                        setFieldsValue({ defaultScore: score });
                      }}
                    />
                  )}
                </Form.Item>
              );
            } else {
              return record.evalTplIndOptIdMeaning;
            }
          },
        },
        {
          title: intl.get('hzero.common.status').d('状态'),
          dataIndex: 'enabledFlag',
          width: 100,
          render: enableRender,
        },
        {
          title: intl.get('spfm.supplierKpiIndicator.model.supplier.benchmarkScore').d('基准分值'),
          dataIndex: 'benchmarkScore',
          width: 100,
          render: (value, record) => {
            if (record._status === 'update' && +record.parentId === -1) {
              const { getFieldDecorator } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('benchmarkScore', {
                    initialValue: value || 0,
                    rules: [
                      {
                        required: record.scoreType === 'MANUAL' && record.indicatorType === 'SCORE',
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl
                            .get('spfm.supplierKpiIndicator.model.supplier.benchmarkScore')
                            .d('基准分值'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      style={{ width: '100%' }}
                      disabled={
                        !(record.scoreType === 'MANUAL' && record.indicatorType === 'SCORE')
                      }
                    />
                  )}
                </Form.Item>
              );
            } else {
              return value;
            }
          },
        },
        // 新增排序
        {
          title: intl.get('spfm.supplierKpiIndicator.model.supplier.orderSeq').d('排序'),
          dataIndex: 'orderSeq',
          width: 100,
          render: (value, record) => {
            if (record._status === 'update') {
              const { getFieldDecorator } = record.$form;
              return (
                <Form.Item>
                  {getFieldDecorator('orderSeq', {
                    initialValue: value || 0,
                  })(<InputNumber min={0} style={style} />)}
                </Form.Item>
              );
            } else {
              return value;
            }
          },
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          width: 310,
          dataIndex: 'action',
          render: this.operiationRender,
        },
        {
          title: intl
            .get(`spfm.supplierKpiIndicator.view.title.formulaConfiguration`)
            .d('公式配置'),
          width: 200,
          dataIndex: 'formulaConfiguration',
          render: this.formulaConfigurationRender,
        },
      ],
      rowKey: defaultTableRowKey,
      bordered: true,
      loading,
      onChange,
      pagination,
      expandedRowKeys,
      onExpand,
      custLoading,
    };
    tableProps.scroll = {
      x: sum(tableProps.columns.map(n => (isNumber(n.width) ? n.width : 150))),
      y: 'calc(100vh - 352px)',
    };
    return customizeTable(
      {
        code: 'SSLM.EVALUATION_TEMPLATE.ASSIGN_INDICATORS_TABLE',
      },
      <EditTable {...tableProps} />
    );
  }
}
