/**
 * ScoreLevel - 定义评分等级
 * @date: 2019-2-15
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import qs from 'querystring';
import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { PureComponent } from 'react';
import { sum, isNumber, isEmpty, forEach } from 'lodash';
import LovMultiple from '@/routes/components/LovMultiple';
import {
  Form,
  Input,
  Button,
  InputNumber,
  Row,
  Col,
  Select,
  Tabs,
  Icon,
  Tooltip,
  Modal,
} from 'hzero-ui';

import intl from 'utils/intl';
import { getEditTableData } from 'utils/utils';
import Checkbox from 'components/Checkbox';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import EditTable from 'components/EditTable';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import CreateIndicatorDrawer from './CreateIndicatorDrawer';
import '@/routes/index.less';

// Form.Item 组件
const FormItem = Form.Item;
const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 定义评分等级组件
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} scoreLevel - 数据源
 * @reactProps {Boolean} addLoading - 新增或修改评分模板
 * @reactProps {Boolean} fetchLoading - 获取评分模板信息
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: [
    'sslm.scoreLevel',
    'spfm.supplierKpiIndicator',
    'sslm.evaluationQuery',
    'sslm.commonApplication',
  ],
})
@connect(({ scoreLevel, loading }) => ({
  scoreLevel,
  addLoading: loading.effects['scoreLevel/addScoreLevel'],
  fetchLoading: loading.effects['scoreLevel/fetchScoreLevel'],
}))
@Form.create({ fieldNameProp: null })
export default class ScoreLevel extends PureComponent {
  /**
   * @param {object} props 属性
   */
  constructor(props) {
    super(props);
    const routerParams = qs.parse(props.location.search.substr(1));
    const { templateId, evalTplCode, routeType = '' } = routerParams;
    this.state = {
      dataSource: [],
      indicatorsScoresDataSource: [],
      action: props.match.params.action,
      templateId,
      evalTplCode,
      routeType,
      defaultTabKey: 'definedByTotalPoints',
      detailDrawerVisible: false,
      totalLevelIsChooseUpGrade: undefined,
      indicatorLevelIsChooseUpGrade: undefined,
    };
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    this.init();
  }

  /**
   * onCell - 设置表格单元格属性函数
   */
  @Bind()
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
   * 指标等级选中时的回调
   */
  @Bind()
  changeIndLevelSelectRows(selectRows, record, fieldCode = 'indLevelSelectRows') {
    if (record.$form) {
      // eslint-disable-next-line no-unused-expressions
      record.$form.setFieldsValue({
        [fieldCode]: selectRows,
      });
    }
  }

  /**
   * 拼接文本
   */
  @Bind()
  mergeText(dataList = {}, symbol = '/') {
    const tempList = [];
    forEach(dataList, item => {
      tempList.push(item);
    });
    return tempList.join(symbol);
  }

  /**
   * 初始化查询
   */
  @Bind()
  init() {
    const { dispatch } = this.props;
    const { templateId, evalTplCode, routeType } = this.state;
    this.queryList();
    const lovCodes = {
      conditionsList: 'SSLM.EVAL_LEVAEL_CONDITION', // 满足条件
      upGradeStrategyCods: 'SSLM.KPI_TPL_UP_GRADE_STRATEGY',
    };
    if (routeType && routeType === 'HistoricalVersion') {
      dispatch({
        type: 'scoreLevel/fetchTmplInfoHistory',
        payload: {
          templateId,
          evalTplCode,
        },
      }).then(res => {
        if (res) {
          const { totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade } = res;
          this.setState({ totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade });
        }
      });
    } else {
      dispatch({
        type: 'scoreLevel/fetchTmplInfo',
        payload: { templateId },
      }).then(res => {
        if (res) {
          const { totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade } = res;
          this.setState({ totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade });
        }
      });
    }
    dispatch({
      type: 'scoreLevel/init',
      payload: lovCodes,
    });
  }

  /**
   * 查询等级信息
   */
  @Bind()
  queryList(activeKey = '') {
    const { dispatch } = this.props;
    const { templateId, defaultTabKey } = this.state;
    const currentTabKey = activeKey || defaultTabKey;
    if (currentTabKey === 'definedByTotalPoints') {
      dispatch({
        type: 'scoreLevel/fetchScoreLevel',
        payload: { templateId },
      }).then(res => {
        this.setState({ dataSource: res });
      });
    }
    if (currentTabKey === 'definedByIndexScores') {
      dispatch({
        type: 'scoreLevel/fetchIndexScoreLevel',
        payload: { templateId },
      }).then(res => {
        this.setState({ indicatorsScoresDataSource: res });
      });
    }
  }

  @Bind()
  handleEditChange(totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade) {
    const { form } = this.props;
    if (!(totalLevelIsChooseUpGrade && indicatorLevelIsChooseUpGrade)) {
      form.setFieldsValue({
        upGradeStrategyFlag: null,
      });
    }
  }

  @Bind()
  upgradeFlagChange(e, record, currentChangeField, linkageField) {
    const { defaultTabKey, dataSource, indicatorsScoresDataSource } = this.state;
    const checkData =
      defaultTabKey === 'definedByTotalPoints' ? dataSource : indicatorsScoresDataSource;
    const checkFlag = checkData.map(item => {
      if (item.$form) {
        return item.evalLevelId === record.evalLevelId
          ? e.target.checked && item.$form.getFieldValue(linkageField)
          : item.$form.getFieldValue(currentChangeField) && item.$form.getFieldValue(linkageField);
      } else {
        return item[currentChangeField] && item[linkageField];
      }
    });

    if (defaultTabKey === 'definedByTotalPoints') {
      this.setState(
        {
          totalLevelIsChooseUpGrade: checkFlag.findIndex(i => i === 1) === -1 ? 0 : 1,
        },
        () => {
          const { totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade } = this.state;
          this.handleEditChange(totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade);
        }
      );
    }

    if (defaultTabKey === 'definedByIndexScores') {
      this.setState(
        {
          indicatorLevelIsChooseUpGrade: checkFlag.findIndex(i => i === 1) === -1 ? 0 : 1,
        },
        () => {
          const { totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade } = this.state;
          this.handleEditChange(totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade);
        }
      );
    }
  }

  /**
   * 生成表格表头和行内编辑控件
   * @returns
   */
  @Bind()
  createColumns(tabKey) {
    const {
      scoreLevel: {
        code: { stageList = [], conditionsList = [] },
        tmplInfo = {},
      },
    } = this.props;
    const { action, templateId } = this.state;
    const { evalGranularity, evalFlag, evalTplType } = tmplInfo;
    // 判断是否为现场考察模版
    const isSiteInvestigateFlag = evalTplType === 'GYSKP_XC';
    const col = [
      {
        title: intl.get('sslm.scoreLevel.model.scoreLevel.levelCode').d('等级编码'),
        dataIndex: 'levelCode',
        width: 120,
        render: (text, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('levelCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.scoreLevel.model.scoreLevel.levelCode').d('等级编码'),
                    }),
                  },
                  {
                    max: 20,
                    message: intl.get('hzero.common.validation.max', {
                      max: 20,
                    }),
                  },
                ],
                initialValue: record.levelCode,
              })(<Input typeCase="upper" trim inputChinese={false} />)}
            </FormItem>
          ) : (
            text
          ),
      },
      {
        title: intl.get('sslm.scoreLevel.model.scoreLevel.levelDesc').d('等级描述'),
        dataIndex: 'levelDesc',
        width: 300,
        render: (text, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('levelDesc', {
                initialValue: record.levelDesc,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.scoreLevel.model.scoreLevel.levelDesc').d('等级描述'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', {
                      max: 120,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          ) : (
            text
          ),
      },
      {
        title: intl.get('sslm.scoreLevel.view.menu.score').d('分值'),
        width: 220,
        children: [
          {
            title: intl.get('sslm.scoreLevel.model.scoreLevel.scoreFromTitle').d('分值从(=)'),
            dataIndex: 'scoreFrom',
            width: 110,
            render: (text, record) =>
              ['create', 'update'].includes(record._status) ? (
                <FormItem>
                  {record.$form.getFieldDecorator('scoreFrom', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('sslm.scoreLevel.model.scoreLevel.scoreFrom').d('分值从'),
                        }),
                      },
                    ],
                    initialValue: record.scoreFrom,
                  })(
                    <InputNumber
                      // min={0}
                      style={{ width: 70 }}
                    />
                  )}
                </FormItem>
              ) : (
                text
              ),
          },
          {
            title: intl.get('sslm.scoreLevel.model.scoreLevel.scoreToTitle').d('分值至(<)'),
            dataIndex: 'scoreTo',
            width: 110,
            render: (text, record) =>
              ['create', 'update'].includes(record._status) ? (
                <FormItem>
                  {record.$form.getFieldDecorator('scoreTo', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('sslm.scoreLevel.model.scoreLevel.scoreTo').d('分值至'),
                        }),
                      },
                    ],
                    initialValue: record.scoreTo,
                  })(
                    <InputNumber
                      // min={0}
                      style={{ width: 70 }}
                    />
                  )}
                </FormItem>
              ) : (
                text
              ),
          },
        ],
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 300,
        render: (text, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('remark', {
                initialValue: record.remark,
                rules: [
                  {
                    max: 190,
                    message: intl.get('hzero.common.validation.max', {
                      max: 190,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          ) : (
            text
          ),
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: (text, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('enabledFlag', {
                initialValue: record.enabledFlag === undefined ? 1 : record.enabledFlag,
              })(
                <Checkbox
                  onChange={e => this.upgradeFlagChange(e, record, 'enabledFlag', 'upgradeFlag')}
                />
              )}
            </FormItem>
          ) : (
            enableRender(text)
          ),
      },
    ];
    if (tabKey === 'definedByTotalPoints' && isSiteInvestigateFlag) {
      col.splice(3, 0, {
        title: intl.get(`sslm.scoreLevel.model.scoreLevel.indexRankRule`).d('指标等级规则'),
        dataIndex: 'indLevel',
        width: 180,
        render: (text, record) => {
          if (['create', 'update'].includes(record._status)) {
            const initialIndLevelMeaning = this.mergeText(record.indLevels, ',') || '';
            // 绑定描述字段和默认选择字段
            // eslint-disable-next-line no-unused-expressions
            record?.$form?.getFieldDecorator('indLevelMeaning');
            // eslint-disable-next-line no-unused-expressions
            record?.$form?.getFieldDecorator('indLevelSelectRows');
            // 指标等级规则默认勾选值
            const initialIndLevelList = record.indLevels
              ? Object.entries(record.indLevels).map(([key, value]) => {
                  return {
                    evalLevelId: key,
                    indLevelMeaning: value,
                  };
                })
              : [];
            if (
              record.$form.getFieldValue('indLevel')?.split(',').length !==
              record.$form.getFieldValue('indLevelMeaning')?.split(',').length
            ) {
              // eslint-disable-next-line no-unused-expressions
              record?.$form?.setFieldsValue({
                indLevelMeaning: initialIndLevelMeaning,
                indLevelSelectRows: initialIndLevelList || [],
              });
            }
            return (
              <FormItem>
                {record.$form.getFieldDecorator('indLevel', {
                  initialValue: record.indLevel,
                })(
                  <LovMultiple
                    textField="indLevelMeaning"
                    code="SSLM.KPI_TPL_EVAL_IND_LEVEL"
                    queryParams={{ templateId }}
                    changeSelectRows={lovRecord => this.changeIndLevelSelectRows(lovRecord, record)}
                    selectedRows={record.$form.getFieldValue('indLevelSelectRows')}
                  />
                )}
              </FormItem>
            );
          } else {
            return (
              <Tooltip placement="topLeft" title={this.mergeText(record.indLevels)}>
                {this.mergeText(record.indLevels)}
              </Tooltip>
            );
          }
        },
      });
    }
    if (evalFlag || isSiteInvestigateFlag) {
      // if (tabKey === 'definedByTotalPoints') {
      if (evalFlag) {
        col.splice(
          4,
          0,
          {
            title: intl.get('sslm.scoreLevel.model.scoreLevel.isAutoLift').d('是否自动升降级'),
            dataIndex: 'upgradeFlag',
            width: 120,
            render: (text, record) =>
              ['create', 'update'].includes(record._status) ? (
                <FormItem>
                  {record.$form.getFieldDecorator('upgradeFlag', {
                    initialValue: record.upgradeFlag || 0,
                  })(
                    <Checkbox
                      onChange={e =>
                        this.upgradeFlagChange(e, record, 'upgradeFlag', 'enabledFlag')
                      }
                    />
                  )}
                </FormItem>
              ) : (
                yesOrNoRender(text)
              ),
          },
          {
            title: intl.get('sslm.scoreLevel.model.scoreLevel.currentStage').d('当前阶段'),
            dataIndex: 'fromStageDescription',
            width: 130,
            render: (text, record) =>
              ['create', 'update'].includes(record._status) ? (
                <FormItem>
                  {record.$form.getFieldDecorator('fromStageId', {
                    initialValue: record.fromStageId,
                  })(
                    <Select
                      allowClear
                      style={{ width: '100%' }}
                      disabled={!record.$form.getFieldValue('upgradeFlag')}
                    >
                      {stageList.map(stage => (
                        <Option key={stage.value} value={stage.value}>
                          {stage.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              ) : (
                text
              ),
          },
          {
            title: intl.get('sslm.scoreLevel.model.scoreLevel.targetStage').d('目标阶段'),
            dataIndex: 'toStageDescription',
            width: 130,
            render: (text, record) =>
              ['create', 'update'].includes(record._status) ? (
                <FormItem>
                  {record.$form.getFieldDecorator('toStageId', {
                    initialValue: record.toStageId,
                    rules: [
                      {
                        required: record.$form.getFieldValue('upgradeFlag'),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.scoreLevel.model.scoreLevel.targetStage')
                            .d('目标阶段'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      style={{ width: '100%' }}
                      disabled={!record.$form.getFieldValue('upgradeFlag')}
                    >
                      {stageList.map(stage => (
                        <Option key={stage.value} value={stage.value}>
                          {stage.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              ) : (
                text
              ),
          },
          {
            title: (
              <Tooltip
                title={intl
                  .get('sslm.scoreLevel.model.scoreLevel.conditionsTooltip')
                  .d(
                    '当考评维度为供应商+物料/品类时，配置供应商任意一行物料/品类满足条件即可升降级或全部满足。'
                  )}
              >
                {intl.get('sslm.scoreLevel.model.scoreLevel.conditions').d('满足条件')}
                <Icon type="question-circle-o" style={{ marginLeft: 6 }} />
              </Tooltip>
            ),
            dataIndex: 'matchConditionMeaning',
            width: 130,
            render: (text, record) =>
              ['create', 'update'].includes(record._status) ? (
                <FormItem>
                  {record.$form.getFieldDecorator('matchCondition', {
                    initialValue: record.matchCondition,
                    rules: [
                      {
                        required:
                          record.$form.getFieldValue('upgradeFlag') && evalGranularity !== 'SU',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.scoreLevel.model.scoreLevel.conditions')
                            .d('满足条件'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      style={{ width: '100%' }}
                      disabled={
                        !record.$form.getFieldValue('upgradeFlag') || evalGranularity === 'SU'
                      }
                    >
                      {conditionsList.map(stage => (
                        <Option key={stage.value} value={stage.value}>
                          {stage.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              ) : (
                text
              ),
          },
          {
            title: intl.get('sslm.scoreLevel.model.scoreLevel.priority').d('优先级'),
            dataIndex: 'orderReq',
            width: 110,
            render: (text, record) =>
              ['create', 'update'].includes(record._status) ? (
                <FormItem>
                  {record.$form.getFieldDecorator('orderReq', {
                    initialValue: record.orderReq,
                    rules: [
                      {
                        required: record.$form.getFieldValue('upgradeFlag'),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('sslm.scoreLevel.model.scoreLevel.priority').d('优先级'),
                        }),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      disabled={!record.$form.getFieldValue('upgradeFlag')}
                      style={{ width: 70 }}
                    />
                  )}
                </FormItem>
              ) : (
                text
              ),
          }
        );
      }
      // }
      if (tabKey === 'definedByIndexScores') {
        col.splice(
          0,
          0,
          {
            title: intl.get(`sslm.scoreLevel.model.scoreLevel.indicatorCode`).d('指标编码'),
            dataIndex: 'indicatorCode',
            width: 150,
            onCell: this.onCell,
          },
          {
            title: intl.get(`sslm.scoreLevel.model.scoreLevel.indicatorName`).d('指标名称'),
            dataIndex: 'indicatorName',
            width: 180,
            onCell: this.onCell,
          },
          {
            title: intl.get(`sslm.scoreLevel.model.scoreLevel.scoreType`).d('评分方式'),
            dataIndex: 'scoreTypeMeaning',
            width: 120,
            onCell: this.onCell,
          },
          {
            title: intl.get('sslm.scoreLevel.view.menu.indicatorsScore').d('指标分值'),
            width: 220,
            children: [
              {
                title: intl.get('sslm.scoreLevel.model.scoreLevel.scoreFromTitle').d('分值从(=)'),
                dataIndex: 'indicatorScoreFrom',
                width: 110,
              },
              {
                title: intl.get('sslm.scoreLevel.model.scoreLevel.scoreToTitle').d('分值至(<)'),
                dataIndex: 'indicatorScoreTo',
                width: 110,
              },
            ],
          }
        );
      }
    }
    if (action === 'edit') {
      col.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        render: (_, record) => (
          <React.Fragment>
            {record._status === 'update' && (
              <a onClick={() => this.handlerEditScoreLevel(record, false)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {!(record._status === 'create') && !(record._status === 'update') && (
              <a onClick={() => this.handlerEditScoreLevel(record, true)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
            {record._status === 'create' && (
              <a onClick={() => this.handlerReset(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            )}
          </React.Fragment>
        ),
      });
    }
    return col;
  }

  /**
   * 新建
   */
  @Bind()
  handlerAddScoreLevel() {
    const { dataSource } = this.state;
    this.setState({
      dataSource: [{ evalLevelId: uuidv4(), _status: 'create' }, ...dataSource],
    });
  }

  /**
   * 清除
   * @param {object} record 行数据
   */
  @Bind()
  handlerReset(record) {
    const { dataSource, defaultTabKey, indicatorsScoresDataSource } = this.state;
    if (defaultTabKey === 'definedByTotalPoints') {
      const newList = dataSource.filter(item => item.evalLevelId !== record.evalLevelId);
      this.setState({
        dataSource: newList,
      });
    }
    if (defaultTabKey === 'definedByIndexScores') {
      const newList = indicatorsScoresDataSource.filter(
        item => item.evalLevelId !== record.evalLevelId
      );
      this.setState({
        indicatorsScoresDataSource: newList,
      });
    }
  }

  /**
   * 编辑事件/取消编辑
   * @param {object} record 行数据
   * @param {boolean} flag 是否编辑状态标记
   */
  @Bind()
  handlerEditScoreLevel(record, flag) {
    const { dataSource, defaultTabKey, indicatorsScoresDataSource } = this.state;

    if (defaultTabKey === 'definedByTotalPoints') {
      const newList = dataSource.map(n =>
        n.evalLevelId === record.evalLevelId
          ? { ...n, _status: flag ? 'update' : '', $form: flag ? n.$form : undefined }
          : n
      );

      const checkFlag = newList.map(item => {
        if (item.$form) {
          return item.$form.getFieldValue('upgradeFlag') && item.$form.getFieldValue('enabledFlag');
        } else {
          return item.upgradeFlag && item.enabledFlag;
        }
      });

      this.setState(
        {
          dataSource: newList,
          totalLevelIsChooseUpGrade: checkFlag.findIndex(i => i === 1) === -1 ? 0 : 1,
        },
        () => {
          const { totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade } = this.state;
          this.handleEditChange(totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade);
        }
      );
    }
    if (defaultTabKey === 'definedByIndexScores') {
      const newList = indicatorsScoresDataSource.map(n =>
        n.evalLevelId === record.evalLevelId
          ? { ...n, _status: flag ? 'update' : '', $form: flag ? n.$form : undefined }
          : n
      );

      const checkFlag = newList.map(item => {
        if (item.$form) {
          return item.$form.getFieldValue('upgradeFlag') && item.$form.getFieldValue('enabledFlag');
        } else {
          return item.upgradeFlag && item.enabledFlag;
        }
      });

      this.setState(
        {
          indicatorsScoresDataSource: newList,
          indicatorLevelIsChooseUpGrade: checkFlag.findIndex(i => i === 1) === -1 ? 0 : 1,
        },
        () => {
          const { totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade } = this.state;
          this.handleEditChange(totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade);
        }
      );
    }
  }

  /**
   * 保存数据
   */
  @Bind()
  handlerSaveScoreLevel() {
    const {
      dispatch,
      form,
      scoreLevel: { templateInfo },
    } = this.props;
    const { dataSource, templateId, defaultTabKey, indicatorsScoresDataSource } = this.state;
    const saveData =
      defaultTabKey === 'definedByTotalPoints' ? dataSource : indicatorsScoresDataSource;
    const data = getEditTableData(saveData).map(i => ({
      ...i,
      levelType: defaultTabKey === 'definedByTotalPoints' ? 1 : 2,
      evalLevelId: i._status === 'create' ? '' : i.evalLevelId,
    }));
    const isEditing = !!saveData.find(d => d._status === 'create' || d._status === 'update');
    if (isEditing && isEmpty(data)) {
      return;
    }
    form.validateFieldsAndScroll({ force: true }, (err, fieldsValue) => {
      if (!err) {
        if (!isEmpty(data)) {
          if (data.filter(a => a.scoreFrom >= a.scoreTo).length > 0) {
            notification.error({
              message: intl.get('sslm.scoreLevel.view.message.error').d('分值从不能大于分值至！'),
            });
          } else {
            dispatch({
              type: 'scoreLevel/addScoreLevel',
              payload: {
                templateId,
                kpiEvalLevelList: data,
                kpiEvalTpl: {
                  ...templateInfo,
                  ...fieldsValue,
                },
              },
            }).then(response => {
              if (response) {
                form.resetFields();
                this.queryList();
                this.init();
                if (response.validResult) {
                  notification.info({
                    message: intl
                      .get('sslm.scoreLevel.view.message.info')
                      .d('录入的分值范围和评分指标的分值范围不一致！'),
                  });
                } else {
                  notification.success();
                }
              }
            });
          }
        } else {
          dispatch({
            type: 'scoreLevel/addScoreLevel',
            payload: {
              templateId,
              kpiEvalLevelList: data,
              kpiEvalTpl: {
                ...templateInfo,
                ...fieldsValue,
              },
            },
          }).then(response => {
            if (response) {
              form.resetFields();
              this.queryList();
              this.init();
              if (response.validResult) {
                notification.info({
                  message: intl
                    .get('sslm.scoreLevel.view.message.info')
                    .d('录入的分值范围和评分指标的分值范围不一致！'),
                });
              } else {
                notification.success();
              }
            }
          });
        }
      }
    });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  @Bind()
  renderForm() {
    const {
      scoreLevel: {
        tmplInfo = {},
        code: { upGradeStrategyCods = [] },
      },
      form: { getFieldDecorator },
    } = this.props;
    const { totalLevelIsChooseUpGrade, indicatorLevelIsChooseUpGrade, action } = this.state;
    const { evalFlag, evalTplType } = tmplInfo;
    // 判断是否为现场考察模版
    const isSiteInvestigateFlag = evalTplType === 'GYSKP_XC';
    const showByIndexScores = isSiteInvestigateFlag || evalFlag;
    return (
      <Form className="ued-edit-form form-wrap">
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.scoreLevel.model.scoreLevel.templateCode').d('评分模板代码')}
            >
              {getFieldDecorator('templateCode', {
                initialValue: tmplInfo.templateCode,
              })(<span>{tmplInfo.templateCode}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.scoreLevel.model.scoreLevel.templateName').d('评分模板描述')}
            >
              {getFieldDecorator('templateName', {
                initialValue: tmplInfo.templateName,
              })(<span>{tmplInfo.templateName}</span>)}
            </FormItem>
          </Col>
          {showByIndexScores && (
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.scoreLevel.model.scoreLevel.autoStrategy')
                  .d('自动升降级策略')}
              >
                {getFieldDecorator('upGradeStrategyFlag', {
                  initialValue: tmplInfo.upGradeStrategyFlag,
                  rules: [
                    {
                      required: totalLevelIsChooseUpGrade && indicatorLevelIsChooseUpGrade,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sslm.scoreLevel.model.scoreLevel.autoStrategy')
                          .d('自动升降级策略'),
                      }),
                    },
                  ],
                })(
                  action === 'edit' ? (
                    <Select
                      style={{ width: '100%' }}
                      disabled={!(totalLevelIsChooseUpGrade && indicatorLevelIsChooseUpGrade)}
                      allowClear
                    >
                      {upGradeStrategyCods.map(n => (
                        <Option style={{ width: '100%' }} key={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <span>{tmplInfo.upGradeStrategyFlagMeaning}</span>
                  )
                )}
              </FormItem>
            </Col>
          )}
        </Row>
      </Form>
    );
  }

  /**
   * 新建 - 按指标分数定义等级
   */
  @Bind()
  handlerAdd() {
    this.setState({
      detailDrawerVisible: true,
    });
  }

  @Bind()
  handleCancel() {
    this.setState({
      detailDrawerVisible: false,
    });
  }

  // 新增
  @Bind()
  handleCreate(createRows) {
    const { indicatorsScoresDataSource } = this.state;

    const newCreateRows = createRows.map(i => {
      const { scoreFrom, scoreTo, enabledFlag, parentPath, ...others } = i;
      return {
        evalLevelId: uuidv4(),
        ...others,
        indicatorScoreFrom: scoreFrom,
        indicatorScoreTo: scoreTo,
        _status: 'create',
      };
    });
    this.setState({
      indicatorsScoresDataSource: [...newCreateRows, ...indicatorsScoresDataSource],
      detailDrawerVisible: false,
    });
  }

  @Bind()
  handleTabChange(activeKey) {
    const { dataSource, indicatorsScoresDataSource } = this.state;
    const editData = activeKey === 'definedByTotalPoints' ? indicatorsScoresDataSource : dataSource;
    const data = getEditTableData(editData);
    if (data.length === 0) {
      this.setState({ defaultTabKey: activeKey });
      this.queryList(activeKey);
    } else {
      Modal.error({
        title: intl
          .get('sslm.common.validation.nowDataNotSaveError')
          .d('当前页签有数据未保存。请先保存数据'),
      });
    }
  }

  /**
   * 渲染事件
   * @returns
   */
  render() {
    const {
      match,
      addLoading,
      fetchLoading,
      scoreLevel: { tmplInfo = {} },
    } = this.props;
    const {
      action,
      dataSource,
      indicatorsScoresDataSource,
      defaultTabKey,
      detailDrawerVisible,
      templateId,
      evalTplCode,
      routeType,
    } = this.state;
    const { evalFlag, evalTplType } = tmplInfo;
    // 判断是否为现场考察模版
    const isSiteInvestigateFlag = evalTplType === 'GYSKP_XC';
    // 按指标分数定义等级tab显示标识
    const showByIndexScores = isSiteInvestigateFlag || evalFlag;
    const basePath = match.path.substring(0, match.path.indexOf('/score-level'));
    const columns = this.createColumns('definedByTotalPoints');
    const indicatorsScoresColumns = this.createColumns('definedByIndexScores');
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    const indicatorsScoresScrollX = sum(
      indicatorsScoresColumns.map(n => (isNumber(n.width) ? n.width : 150))
    );

    const createIndicatorDrawerProps = {
      visible: detailDrawerVisible,
      onClose: this.handleCancel,
      handleCreate: this.handleCreate,
      evalTplId: templateId,
    };

    const onAddFunction = {
      definedByTotalPoints: this.handlerAddScoreLevel,
      definedByIndexScores: this.handlerAdd,
    };
    const backPath =
      routeType && routeType === 'HistoricalVersion'
        ? `${basePath}/historical-version/list?evalTplCode=${evalTplCode}`
        : `${basePath}/list`;

    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.scoreLevel.view.message.title').d('评分等级定义')}
          backPath={backPath}
        >
          {action !== 'view' && (
            <React.Fragment>
              <Button
                icon="plus"
                type="primary"
                loading={addLoading || fetchLoading}
                onClick={onAddFunction[defaultTabKey]}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <Button
                icon="save"
                loading={addLoading || fetchLoading}
                onClick={this.handlerSaveScoreLevel}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        <Content>
          <div style={{ marginBottom: 16 }}>{this.renderForm()}</div>
          <Tabs activeKey={defaultTabKey} onChange={this.handleTabChange} animated={false}>
            <Tabs.TabPane
              tab={intl
                .get(`sslm.scoreLevel.model.scoreLevel.definedByTotalPoints`)
                .d('按总分定义等级')}
              key="definedByTotalPoints"
            >
              <EditTable
                loading={fetchLoading}
                rowKey="evalLevelId"
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                scroll={{ x: scrollX }}
                bordered
              />
            </Tabs.TabPane>
            {showByIndexScores && (
              <Tabs.TabPane
                tab={intl
                  .get(`sslm.scoreLevel.model.scoreLevel.definedByIndexScores`)
                  .d('按指标分数定义等级')}
                key="definedByIndexScores"
              >
                <EditTable
                  loading={fetchLoading}
                  rowKey="evalLevelId"
                  dataSource={indicatorsScoresDataSource}
                  columns={indicatorsScoresColumns}
                  pagination={false}
                  scroll={{ x: indicatorsScoresScrollX }}
                  bordered
                />
              </Tabs.TabPane>
            )}
          </Tabs>
        </Content>
        {detailDrawerVisible && <CreateIndicatorDrawer {...createIndicatorDrawerProps} />}
      </React.Fragment>
    );
  }
}
