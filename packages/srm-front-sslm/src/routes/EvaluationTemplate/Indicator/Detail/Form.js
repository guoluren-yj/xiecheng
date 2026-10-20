/**
 * Search - 我发出的订单 - 明细页面表格
 * @date: 2019-01-21
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Input, InputNumber, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content } from 'components/Page';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import Indicators from './Indicators';

// Option组件初始化
const { Option } = Select;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};

const FormItem = Form.Item;

@formatterCollections({ code: ['sslm.supplierKpiIndicator'] })
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // actionSourceCode: 'CUSTOM',
    };

    // 方法注册
    // ['onSourceCodeChange'].forEach(method => {
    //   this[method] = this[method].bind(this);
    // });
    const { onRef = e => e } = this.props;
    onRef(this);
  }

  indicators;

  // onSourceCodeChange(actionSourceCode) {
  //   this.setState({
  //     actionSourceCode,
  //   });
  // }

  @Bind
  onIndicatorsRef(ref = {}) {
    this.indicators = ref;
  }

  render() {
    const {
      form: { getFieldDecorator = e => e, getFieldValue },
      dataSource: {
        evalTplIndId,
        indicatorCode,
        indicatorTypeMeaning,
        indicatorName,
        scoreType = null,
        scoreFrom,
        scoreTo,
        parentIndicatorId,
        parentIndicatorName,
        defaultScore,
        evalStandard,
        evalWeight,
        parentId,
        // isNoEnableChildren = true,
        indicatorType,
        indicatorScore,
        benchmarkScore,
        orderSeq,
      },
      status,
      scoreTypeCode,
      fetchListTree,
      processing = {},
      openFormula = e => e,
      evalTplId,
      assignRecord,
      optionsConfig,
      customizeTable,
      custLoading,
    } = this.props;
    const editable = evalTplIndId && status === 'edit';
    const indicatorsProps = {
      onRef: this.onIndicatorsRef,
      scoreType,
      fetchListTree,
      loading: processing.queryIndicatorsListTreeRefLoading,
      openFormula,
      optionsConfig,
      customizeTable,
      custLoading,
    };
    const style = { padding: '0 1px', width: '100%' };
    return (
      <Fragment>
        <Form style={{ marginBottom: 25 }}>
          <FormItem
            label={intl
              .get(`sslm.supplierKpiIndicator.model.sendOrder.parentIndicator`)
              .d('父级指标')}
            {...formLayout}
          >
            {getFieldDecorator('parentIndicatorId', {
              initialValue: parentIndicatorId || parentId,
            })(
              <Lov
                code="SSLM.KPI_EVALTPLIND"
                textValue={
                  parentIndicatorName ||
                  intl.get(`sslm.supplierKpiIndicator.model.sendOrder.rootNode`).d('根节点')
                }
                disabled
                queryParams={{ evalTplId, limitNodeId: evalTplIndId }}
              />
            )}
          </FormItem>
          {editable && (
            <Fragment>
              <FormItem
                label={intl
                  .get(`sslm.supplierKpiIndicator.model.sendOrder.indicatorCode`)
                  .d('指标编码')}
                {...formLayout}
              >
                {getFieldDecorator('indicatorCode', {
                  initialValue: indicatorCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sslm.supplierKpiIndicator.model.sendOrder.indicatorCode`)
                          .d('指标编码'),
                      }),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                })(<Input disabled={editable} />)}
              </FormItem>
              <FormItem
                label={intl
                  .get(`sslm.supplierKpiIndicator.model.sendOrder.indicatorName`)
                  .d('指标名称')}
                {...formLayout}
              >
                {getFieldDecorator('indicatorName', {
                  initialValue: indicatorName,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sslm.supplierKpiIndicator.model.sendOrder.indicatorName`)
                          .d('指标名称'),
                      }),
                    },
                    {
                      max: 600,
                      message: intl.get('hzero.common.validation.max', {
                        max: 600,
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </FormItem>
              <FormItem
                label={intl
                  .get(`spfm.supplierKpiIndicator.model.supplier.indicatorType`)
                  .d('指标类型')}
                {...formLayout}
              >
                {getFieldDecorator('indicatorTypeMeaning', {
                  initialValue: indicatorTypeMeaning,
                  rules: [
                    {
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`spfm.supplierKpiIndicator.model.supplier.indicatorType`)
                          .d('指标类型'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </FormItem>
              <FormItem
                label={intl
                  .get(`sslm.supplierKpiIndicator.model.sendOrder.scoreType`)
                  .d('评分方式')}
                {...formLayout}
              >
                {getFieldDecorator('scoreType', {
                  initialValue: scoreType,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sslm.supplierKpiIndicator.model.sendOrder.scoreType`)
                          .d('评分方式'),
                      }),
                    },
                  ],
                })(
                  <Select disabled allowClear>
                    {scoreTypeCode.map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem
                label={intl
                  .get(`sslm.supplierKpiIndicator.model.sendOrder.evalStandard`)
                  .d('评分标准')}
                {...formLayout}
              >
                {getFieldDecorator('evalStandard', {
                  initialValue: evalStandard,
                  // rules: [
                  //   {
                  //     max: 600,
                  //     message: intl.get('hzero.common.validation.max', {
                  //       max: 600,
                  //     }),
                  //   },
                  // ],
                })(<Input />)}
              </FormItem>
              <FormItem
                label={intl.get(`sslm.supplierKpiIndicator.model.sendOrder.evalWeight`).d('权重%')}
                {...formLayout}
              >
                {getFieldDecorator('evalWeight', {
                  initialValue: evalWeight,
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
                    // 需求11863需要取消100上限的限制
                    // max={100}
                    min={0}
                    step={0.01}
                    style={style}
                  />
                )}
              </FormItem>
              <FormItem
                label={intl.get(`sslm.supplierKpiIndicator.model.sendOrder.scoreFrom`).d('分值从')}
                {...formLayout}
              >
                {getFieldDecorator('scoreFrom', {
                  initialValue: scoreFrom,
                  rules: [
                    {
                      required:
                        indicatorType !== 'TICK' &&
                        indicatorType !== 'VETO' &&
                        indicatorType !== 'OPT',
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sslm.supplierKpiIndicator.model.sendOrder.scoreFrom`)
                          .d('分值从'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    disabled={indicatorType === 'TICK' || indicatorType === 'VETO'}
                    precision={2}
                    step={0.01}
                    style={style}
                  />
                )}
              </FormItem>
              <FormItem
                label={intl.get(`sslm.supplierKpiIndicator.model.sendOrder.scoreTo`).d('分值至')}
                {...formLayout}
              >
                {getFieldDecorator('scoreTo', {
                  initialValue: scoreTo,
                  rules: [
                    {
                      required:
                        indicatorType !== 'TICK' &&
                        indicatorType !== 'VETO' &&
                        indicatorType !== 'OPT',
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sslm.supplierKpiIndicator.model.sendOrder.scoreTo`)
                          .d('分值至'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    disabled={indicatorType === 'TICK' || indicatorType === 'VETO'}
                    precision={2}
                    step={0.01}
                    style={style}
                  />
                )}
              </FormItem>
              <FormItem
                label={intl
                  .get(`sslm.supplierKpiIndicator.model.sendOrder.defaultScore`)
                  .d('缺省分值')}
                {...formLayout}
              >
                {getFieldDecorator('defaultScore', {
                  initialValue: defaultScore || null,
                })(
                  <InputNumber
                    precision={2}
                    step={0.01}
                    style={style}
                    disabled={indicatorType !== 'SCORE'}
                  />
                )}
              </FormItem>
              <FormItem
                label={intl.get('spfm.supplierKpiIndicator.model.supplier.indiScore').d('指标分值')}
                {...formLayout}
              >
                {getFieldDecorator('indicatorScore', {
                  initialValue: indicatorScore || null,
                  rules: [
                    {
                      required: indicatorType === 'TICK',
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get('spfm.supplierKpiIndicator.model.supplier.indiScore')
                          .d('指标分值'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    disabled={indicatorType !== 'TICK'}
                    precision={2}
                    step={0.01}
                    style={style}
                  />
                )}
              </FormItem>
              {getFieldValue('parentIndicatorId') === -1 ? (
                <FormItem
                  label={intl
                    .get('spfm.supplierKpiIndicator.model.supplier.benchmarkScore')
                    .d('基准分值')}
                  {...formLayout}
                >
                  {getFieldDecorator('benchmarkScore', {
                    initialValue: benchmarkScore || 0,
                    rules: [
                      {
                        required: scoreType === 'MANUAL' && indicatorType === 'SCORE',
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
                      disabled={!(scoreType === 'MANUAL' && indicatorType === 'SCORE')}
                    />
                  )}
                </FormItem>
              ) : null}
              {/* 新增排序 */}
              <FormItem
                label={intl.get(`sslm.supplierKpiIndicator.model.sendOrder.orderSeq`).d('排序')}
                {...formLayout}
              >
                {getFieldDecorator('orderSeq', {
                  initialValue: orderSeq || 0,
                  rules: [
                    {
                      validator: (_, value, cb) => {
                        cb();
                        return value >= 0;
                      },
                      message: intl
                        .get(`sslm.supplierKpiIndicator.model.sendOrder.orderSeqWarn`)
                        .d('请输入大于等于0的数'),
                    },
                  ],
                })(<InputNumber min={0} style={style} />)}
              </FormItem>
            </Fragment>
          )}
        </Form>
        {!editable && (
          <Content>
            <Indicators {...indicatorsProps} />
          </Content>
        )}
      </Fragment>
    );
  }
}
