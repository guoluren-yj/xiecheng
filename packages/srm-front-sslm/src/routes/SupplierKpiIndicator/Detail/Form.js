/**
 * Search - 标准指标定义 - 明细页面表单
 * @date: 2019-01-21
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Input, InputNumber, Select, Row, Col, Radio } from 'hzero-ui';

import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
import formatterCollections from 'utils/intl/formatterCollections';
import { compact, isNil } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';

import styles from '@/routes/index.less';
import Indicators from './Indicators';

const RadioGroup = Radio.Group;

// Option组件初始化
const { Option } = Select;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const FormItem = Form.Item;

const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['spfm.supplierKpiIndicator', 'sslm.scoreIndic', 'sslm.supplierKpiIndicator'],
})
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      actionSourceCode: 'CUSTOM',
    };

    // 方法注册
    ['onSourceCodeChange'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    const { onRef = e => e } = this.props;
    onRef(this);
  }

  /**
   * onSourceCodeChange - 数据源onChange事件
   * @param {number} actionSourceCode - 行数据(主键)key
   */
  onSourceCodeChange(actionSourceCode) {
    this.setState({
      actionSourceCode,
    });
  }

  /**
   * 指标分值change事件
   */
  @Bind()
  handleIndicatorScoreChange(value) {
    const {
      form: { getFieldValue, setFieldsValue },
    } = this.props;
    const indicatorType = getFieldValue('indicatorType');
    switch (indicatorType) {
      case 'TICK':
        if (+getFieldValue('isStandard') === 1) {
          setFieldsValue({ defaultScore: value });
        }
        break;

      default:
        break;
    }
  }

  render() {
    const {
      form: { getFieldDecorator = e => e, getFieldValue, setFieldsValue },
      dataSource,
      dataSource: {
        indicatorId,
        indicatorCode,
        indicatorName,
        scoreType,
        scoreFrom,
        scoreTo,
        parentIndicatorId,
        parentIndicatorName,
        sourceCode,
        defaultScore,
        indicatorType,
        indicatorScore,
        isNoEnableChildren = true,
        benchmarkScore,
        _token,
        evalStandard,
        orderSeq,
        isStandard,
        indicatorOptId,
        indicatorOptIdMeaning,
      },
      status,
      scoreTypeCode,
      dataSourceCode,
      fetchListTree,
      processing = {},
      isVetoSelectList,
      indicatorTypeCode,
      customizeForm,
      custLoading,
      openFormula = e => e,
    } = this.props;
    const { actionSourceCode } = this.state;
    const editable = indicatorId && status === 'edit';
    const indicatorsProps = {
      onRef: node => {
        this.indicators = node;
      },
      fetchListTree,
      loading: processing.queryIndicatorsListTreeLoading,
      openFormula,
    };
    getFieldDecorator('isStandard');
    return (
      <Fragment>
        {customizeForm(
          {
            code: 'SSLM.KPI.INDICATOR.LIST.EDIT_FORM',
            form: this.props.form,
            dataSource,
          },
          <Form
            custLoading={custLoading}
            layout="horizontal"
            className={styles['supplierKpiIndicator-detail-form']}
          >
            {!editable && (
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem
                    label={intl.get('sslm.scoreIndic.view.message.form.select').d('指标生成方式')}
                    {...formLayout}
                  >
                    {getFieldDecorator('sourceCode', {
                      initialValue: sourceCode || 'CUSTOM',
                    })(
                      <Select allowClear onChange={this.onSourceCodeChange}>
                        {dataSourceCode.map(n => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  label={intl
                    .get('sslm.supplierKpiIndicator.model.sendOrder.parentIndicator')
                    .d('父级指标')}
                  {...formLayout}
                >
                  {getFieldDecorator('parentIndicatorId', {
                    initialValue: parentIndicatorId || -1,
                  })(
                    <Lov
                      code="SSLM.KPI_EDIT_INDICATOR"
                      disabled
                      textValue={
                        parentIndicatorName ||
                        intl
                          .get('spfm.supplierKpiIndicator.model.suKpiIn.parentIndicatorRoot')
                          .d('根节点')
                      }
                      queryParams={{ editIndicatorId: indicatorId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            {actionSourceCode === 'CUSTOM' && (
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierKpiIndicator.model.supplier.indicatorCode')
                      .d('指标编码')}
                    {...formLayout}
                  >
                    {getFieldDecorator('indicatorCode', {
                      initialValue: indicatorCode,
                      rules: compact([
                        {
                          required: true,
                          message: intl.get(`hzero.common.validation.notNull`, {
                            name: intl
                              .get('spfm.supplierKpiIndicator.model.supplier.indicatorCode')
                              .d('指标编码'),
                          }),
                        },
                        editable
                          ? false
                          : {
                              max: 29,
                              message: intl.get('hzero.common.validation.max', {
                                max: 30,
                              }),
                            },
                      ]),
                    })(<Input inputChinese={false} disabled={editable} />)}
                  </FormItem>
                </Col>
              </Row>
            )}
            {actionSourceCode === 'CUSTOM' && (
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierKpiIndicator.model.supplier.indicatorName')
                      .d('指标名称')}
                    {...formLayout}
                  >
                    {getFieldDecorator('indicatorName', {
                      initialValue: indicatorName,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('spfm.supplierKpiIndicator.model.supplier.indicatorName')
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
                    })(
                      <TLEditor
                        label={intl
                          .get('spfm.supplierKpiIndicator.model.supplier.indicatorName')
                          .d('指标名称')}
                        field="indicatorName"
                        token={_token}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {actionSourceCode === 'CUSTOM' && (
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierKpiIndicator.model.supplier.scoreType')
                      .d('评分方式')}
                    {...formLayout}
                  >
                    {getFieldDecorator('scoreType', {
                      initialValue: scoreType,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('spfm.supplierKpiIndicator.model.supplier.scoreType')
                              .d('评分方式'),
                          }),
                        },
                      ],
                    })(
                      <Select
                        allowClear
                        disabled={!isNoEnableChildren}
                        onChange={() => {
                          setFieldsValue({
                            indicatorType: null,
                            indicatorScore: null,
                          });
                        }}
                      >
                        {scoreTypeCode.map(n => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {actionSourceCode === 'CUSTOM' && (
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierKpiIndicator.model.supplier.indicatorType')
                      .d('指标类型')}
                    {...formLayout}
                  >
                    {getFieldDecorator('indicatorType', {
                      initialValue: indicatorType,
                      rules: [
                        {
                          required: getFieldValue('scoreType') !== 'SYSTEM',
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('spfm.supplierKpiIndicator.model.supplier.indicatorType')
                              .d('指标类型'),
                          }),
                        },
                      ],
                    })(
                      <Select
                        disabled={getFieldValue('scoreType') !== 'MANUAL'}
                        allowClear
                        onChange={val => {
                          if (val !== 'SCORE') {
                            setFieldsValue({
                              benchmarkScore: benchmarkScore || 0,
                            });
                          }
                          if (val === 'TICK' && isNoEnableChildren) {
                            setFieldsValue({
                              scoreFrom: '',
                              scoreTo: '',
                              defaultScore: '',
                            });
                          } else if (val === 'VETO' && isNoEnableChildren) {
                            setFieldsValue({
                              scoreFrom: '',
                              scoreTo: '',
                              defaultScore: '',
                              indicatorScore: '',
                            });
                          } else {
                            setFieldsValue({
                              indicatorScore: '',
                            });
                          }
                          if (val !== 'TICK') {
                            setFieldsValue({ isStandard: null });
                          }
                        }}
                      >
                        {indicatorTypeCode.map(n => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {actionSourceCode === 'CUSTOM' && (
              <Row gutter={24}>
                <Col span={24}>
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
                </Col>
              </Row>
            )}
            {actionSourceCode === 'CUSTOM' && (
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierKpiIndicator.model.supplier.scoreFrom')
                      .d('分值从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('scoreFrom', {
                      initialValue: scoreFrom,
                      rules: [
                        {
                          required:
                            getFieldValue('indicatorType') !== 'TICK' &&
                            getFieldValue('indicatorType') !== 'VETO' &&
                            getFieldValue('indicatorType') !== 'OPT',
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('spfm.supplierKpiIndicator.model.supplier.scoreFrom')
                              .d('分值从'),
                          }),
                        },
                      ],
                    })(
                      <InputNumber
                        disabled={
                          getFieldValue('indicatorType') === 'TICK' ||
                          getFieldValue('indicatorType') === 'VETO'
                        }
                        style={{ width: '100%' }}
                        precision={2}
                        step={0.01}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {actionSourceCode === 'CUSTOM' && (
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem
                    label={intl.get('spfm.supplierKpiIndicator.model.supplier.scoreTo').d('分值至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('scoreTo', {
                      initialValue: scoreTo,
                      rules: [
                        {
                          required:
                            getFieldValue('indicatorType') !== 'TICK' &&
                            getFieldValue('indicatorType') !== 'VETO' &&
                            getFieldValue('indicatorType') !== 'OPT',
                          message: intl.get(`hzero.common.validation.notNull`, {
                            name: intl
                              .get('spfm.supplierKpiIndicator.model.supplier.scoreTo')
                              .d('分值至'),
                          }),
                        },
                      ],
                    })(
                      <InputNumber
                        disabled={
                          getFieldValue('indicatorType') === 'TICK' ||
                          getFieldValue('indicatorType') === 'VETO'
                        }
                        style={{ width: '100%' }}
                        precision={2}
                        step={0.01}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {actionSourceCode === 'CUSTOM' && (
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierKpiIndicator.model.supplier.defaultScore')
                      .d('缺省分值')}
                    {...formLayout}
                  >
                    {getFieldDecorator('defaultScore', {
                      initialValue: defaultScore,
                    })(
                      <InputNumber
                        disabled={
                          getFieldValue('indicatorType') === 'TICK' ||
                          getFieldValue('indicatorType') === 'VETO' ||
                          getFieldValue('indicatorType') === 'OPT'
                        }
                        style={{ width: '100%' }}
                        precision={2}
                        step={0.01}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {actionSourceCode === 'CUSTOM' && (
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierKpiIndicator.model.supplier.indiScore')
                      .d('指标分值')}
                    {...formLayout}
                  >
                    {getFieldDecorator('indicatorScore', {
                      initialValue: indicatorScore,
                      rules: [
                        {
                          required:
                            getFieldValue('scoreType') === 'MANUAL' &&
                            getFieldValue('indicatorType') !== 'SCORE' &&
                            getFieldValue('indicatorType') !== 'VETO' &&
                            getFieldValue('indicatorType') !== 'OPT',
                          message: intl.get(`hzero.common.validation.notNull`, {
                            name: intl
                              .get('spfm.supplierKpiIndicator.model.supplier.indiScore')
                              .d('指标分值'),
                          }),
                        },
                      ],
                    })(
                      <InputNumber
                        disabled={
                          getFieldValue('indicatorType') === 'SCORE' ||
                          getFieldValue('indicatorType') === 'VETO' ||
                          getFieldValue('scoreType') !== 'MANUAL' ||
                          getFieldValue('indicatorType') === 'OPT'
                        }
                        onChange={this.handleIndicatorScoreChange}
                        style={{ width: '100%' }}
                        precision={2}
                        step={0.01}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {actionSourceCode === 'CUSTOM' && (
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierKpiIndicator.model.supplier.isStandard')
                      .d('勾选式/否决项缺省值')}
                    {...formLayout}
                  >
                    {getFieldDecorator('isStandard', {
                      initialValue: isStandard,
                    })(
                      <RadioGroup
                        disabled={
                          getFieldValue('indicatorType') !== 'TICK' &&
                          getFieldValue('indicatorType') !== 'VETO'
                        }
                        onChange={e => {
                          // 指标类型为勾选式，保留原带值逻辑
                          if (getFieldValue('indicatorType') === 'TICK') {
                            if (+e.target.value === 0) {
                              setFieldsValue({ defaultScore: 0 });
                            } else {
                              setFieldsValue({ defaultScore: getFieldValue('indicatorScore') });
                            }
                          }
                        }}
                      >
                        {isVetoSelectList.map(n => (
                          <Radio key={n.value} value={+n.value}>
                            {n.meaning}
                          </Radio>
                        ))}
                      </RadioGroup>
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {actionSourceCode === 'CUSTOM' && (
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem
                    label={intl
                      .get('spfm.supplierKpiIndicator.model.supplier.indicatorOpt')
                      .d('选择项缺省值')}
                    {...formLayout}
                  >
                    {getFieldDecorator('indicatorOptId', {
                      initialValue: indicatorOptId,
                    })(
                      <Lov
                        code="SSLM.SELECT_INDICATOR_OPT"
                        queryParams={{ indicatorId, tenantId: organizationId }}
                        disabled={getFieldValue('indicatorType') !== 'OPT'}
                        textValue={indicatorOptIdMeaning}
                        onChange={(_, record) => {
                          const { score } = record || {};
                          setFieldsValue({ defaultScore: score });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {actionSourceCode === 'CUSTOM' && getFieldValue('parentIndicatorId') === -1 && (
              <Row gutter={24}>
                <Col span={24}>
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
                          required:
                            getFieldValue('scoreType') === 'MANUAL' &&
                            getFieldValue('indicatorType') === 'SCORE',
                          message: intl.get(`hzero.common.validation.notNull`, {
                            name: intl
                              .get('spfm.supplierKpiIndicator.model.supplier.indiScore')
                              .d('指标分值'),
                          }),
                        },
                      ],
                    })(
                      <InputNumber
                        disabled={
                          !(
                            getFieldValue('scoreType') === 'MANUAL' &&
                            getFieldValue('indicatorType') === 'SCORE'
                          )
                        }
                        style={{ width: '100%' }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            <Row gutter={24}>
              <Col span={24}>
                <FormItem
                  label={intl.get('spfm.supplierKpiIndicator.model.supplier.orderSeq').d('排序')}
                  {...formLayout}
                >
                  {getFieldDecorator('orderSeq', {
                    initialValue: isNil(orderSeq) ? 1 : orderSeq,
                  })(<InputNumber min={0} style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        {actionSourceCode !== 'CUSTOM' && <Indicators {...indicatorsProps} />}
      </Fragment>
    );
  }
}
