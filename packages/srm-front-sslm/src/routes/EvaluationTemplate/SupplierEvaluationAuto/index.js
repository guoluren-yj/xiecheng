/**
 * index - 自动考评设置
 * @date: 2019-07-29
 * @author: lvshuo <Shuo.Lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Input, Drawer, Form, Select, DatePicker, Checkbox, Row, Col, Button } from 'hzero-ui';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import Lov from 'components/Lov';

import { getDateFormat, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const dateFormat = getDateFormat();

const DATE_FORMAT = 'YYYY-MM-DD 00:00:00';

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['sslm.supplierKpiIndicator', 'spfm.supplierKpiIndicator'] })
export default class SupplierEvaluationAuto extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      realName: getCurrentUser().realName,
      realId: getCurrentUser().id,
    };
    // 方法注册
    [
      'cancel',
      'handleFetchEvaluationAuto',
      'handleSave',
      'handleChangeMouth',
      'dateGet',
      'handleCheckBox',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.handleFetchEvaluationAuto();
  }

  /*
   *查询
   */
  @Bind()
  handleFetchEvaluationAuto() {
    const { fetchEvaluationAuto = e => e, actionDataSource = {} } = this.props;
    fetchEvaluationAuto(actionDataSource.evalTplId);
  }

  /*
   *当月最后一天的回调
   */
  @Bind()
  handleChangeMouth() {
    const evalInitTgrDate = this.props.form.getFieldValue('evalInitTgrDate');
    if (!isEmpty(evalInitTgrDate)) {
      const lastDate = moment(evalInitTgrDate).endOf('month');
      this.props.form.setFieldsValue({ evalInitTgrDate: lastDate });
    }
  }

  /*
   *开始日期,考评周期决定日期至
   */
  @Bind()
  dateGet() {
    const DateFrom = this.props.form.getFieldValue('evalDateFrom');
    const evalCycle = this.props.form.getFieldValue('evalCycle');
    if (!isEmpty(DateFrom)) {
      if (evalCycle === 'MONTH') {
        const DateTo = moment(DateFrom)
          .add(1, 'months')
          .subtract(1, 'days');
        return DateTo;
      } else if (evalCycle === 'QUARTER') {
        const DateTo = moment(DateFrom)
          .add(3, 'months')
          .subtract(1, 'days');
        return DateTo;
      } else if (evalCycle === 'HALF-YEAR') {
        const DateTo = moment(DateFrom)
          .add(6, 'months')
          .subtract(1, 'days');
        return DateTo;
      } else if (evalCycle === 'YEAR') {
        const DateTo = moment(DateFrom)
          .add(12, 'months')
          .subtract(1, 'days');
        return DateTo;
      }
    }
  }

  /*
   *保存
   */
  @Bind()
  handleSave() {
    const { validateFields = e => e } = this.props.form;
    const {
      saveEvaluationAuto = e => e,
      actionDataSource = {},
      EvaluationAutoData = {},
    } = this.props;
    validateFields((error, values) => {
      if (isEmpty(error)) {
        saveEvaluationAuto(
          {
            ...EvaluationAutoData,
            ...values,
            evalInitDate: moment(values.evalDateFrom).format(DATE_FORMAT),
            evalTplId: actionDataSource.evalTplId,
            evalInitTgrDate: moment(values.evalInitTgrDate).format(DATE_FORMAT),
          },
          () => {
            this.handleFetchEvaluationAuto();
          }
        );
      }
    });
  }

  /*
   *日期变化，checkout默认不勾选
   */
  @Bind()
  handleCheckBox() {
    this.props.form.setFieldsValue({ lastDayFlag: 0 });
  }

  /*
   *日期变化，触发日期重新填写
   */
  @Bind()
  handlEvalInitTgrDate() {
    this.props.form.setFieldsValue({ evalInitTgrDate: null });
  }

  /**
   * cancel - 关闭抽屉
   */
  @Bind()
  cancel() {
    const { close = e => e } = this.props;
    close();
  }

  render() {
    const { realName, realId } = this.state;
    const {
      visible,
      kpiEvalCycleCode = [],
      triggerTimeCode = [],
      actionDataSource,
      EvaluationAutoData,
    } = this.props;
    const formLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const formLayoutText = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };

    const title = intl
      .get(`spfm.supplierKpiIndicator.view.title.SupplierEvaluationAuto`)
      .d('自动考评配置');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      width: 900,
      onClose: this.cancel,
      wrapClassName: styles['evaluation-drawer'],
    };

    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <Fragment>
        <Drawer {...drawerProps}>
          <Form layout="horizontal">
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  label={intl
                    .get(`sslm.supplierKpiIndicator.model.supplier.evalName`)
                    .d('档案描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalName', {
                    initialValue: EvaluationAutoData.evalName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sslm.supplierKpiIndicator.model.supplier.evalName`)
                            .d('档案描述'),
                        }),
                      },
                    ],
                  })(<Input disabled={actionDataSource.evalStatusCode === 'PUBLISHED'} />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  label={intl
                    .get(`sslm.supplierKpiIndicator.model.supplier.evalTmplName`)
                    .d('考评负责人')}
                  {...formLayout}
                >
                  {getFieldDecorator('leadingCadreId', {
                    initialValue: EvaluationAutoData.leadingCadreId || realId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sslm.supplierKpiIndicator.model.supplier.evalTmplName`)
                            .d('考评负责人'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SSLM.USER"
                      textValue={EvaluationAutoData.userName || realName}
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                      disabled={actionDataSource.evalStatusCode === 'PUBLISHED'}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  label={intl
                    .get(`sslm.supplierKpiIndicator.model.supplier.evalCycle`)
                    .d('考评周期')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalCycle', {
                    initialValue: EvaluationAutoData.evalCycle,
                    rules: [
                      {
                        required: true,
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl
                            .get(`sslm.supplierKpiIndicator.model.supplier.evalCycle`)
                            .d('考评周期'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      allowClear
                      disabled={actionDataSource.evalStatusCode === 'PUBLISHED'}
                      onChange={this.handlEvalInitTgrDate}
                    >
                      {kpiEvalCycleCode
                        .filter(item => item.value !== 'CUSTOM')
                        .map(item => (
                          <Select.Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  label={intl
                    .get(`sslm.supplierKpiIndicator.model.supplier.evalDateFrom`)
                    .d('考评日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalDateFrom', {
                    initialValue: EvaluationAutoData.evalInitDate
                      ? moment(EvaluationAutoData.evalInitDate, DEFAULT_DATE_FORMAT)
                      : undefined,
                    rules: [
                      {
                        required: true,
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl
                            .get(`sslm.supplierKpiIndicator.model.supplier.evalDateFrom`)
                            .d('考评日期从'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      format={dateFormat}
                      disabled={actionDataSource.evalStatusCode === 'PUBLISHED'}
                      placeholder={intl
                        .get(`sslm.supplierKpiIndicator.model.supplier.evalTitle`)
                        .d('选择第一次触发考评时的开始日期')}
                      style={{ width: '100%' }}
                      onChange={this.handlEvalInitTgrDate}
                      // disabledDate={currentDate => moment(new Date()).isAfter(currentDate, 'day')}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  label={intl
                    .get(`sslm.supplierKpiIndicator.model.supplier.evalDateTo`)
                    .d('考评日期至')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalDateTo', {
                    initialValue: this.dateGet(),
                  })(
                    <DatePicker
                      format={dateFormat}
                      disabled
                      style={{ width: '100%' }}
                      placeholder={intl
                        .get(`sslm.supplierKpiIndicator.model.supplier.evalDateToTitle`)
                        .d('依据考评开始日期和考评周期自动计算')}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  label={intl
                    .get(`sslm.supplierKpiIndicator.model.supplier.initTgrDate`)
                    .d('考评触发日期')}
                  {...formLayout}
                >
                  {getFieldDecorator('evalInitTgrDate', {
                    initialValue: EvaluationAutoData.evalInitTgrDate
                      ? moment(EvaluationAutoData.evalInitTgrDate, DEFAULT_DATE_FORMAT)
                      : undefined,
                    rules: [
                      {
                        required: true,
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl
                            .get(`sslm.supplierKpiIndicator.model.supplier.evalInitTgrDate`)
                            .d('考评触发日期'),
                        }),
                      },
                    ],
                  })(
                    <DatePicker
                      format={dateFormat}
                      disabled={
                        actionDataSource.evalStatusCode === 'PUBLISHED' ||
                        !getFieldValue('evalDateTo')
                      }
                      placeholder={intl
                        .get(`sslm.supplierKpiIndicator.model.supplier.initTgrTitle`)
                        .d('选择第一次触发考评的日期，后续每次触发考评的时间根据考评周期自动计算')}
                      disabledDate={currentDate =>
                        getFieldValue('evalDateTo') &&
                        moment
                          .max(
                            moment(new Date()),
                            moment(getFieldValue('evalDateTo')).add(1, 'days')
                          )
                          .isAfter(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      onOpenChange={this.handleCheckBox}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem>
                  {getFieldDecorator('lastDayFlag', {
                    initialValue: EvaluationAutoData.lastDayFlag || 0,
                  })(
                    <Checkbox
                      checkedValue={1}
                      unCheckedValue={0}
                      disabled={actionDataSource.evalStatusCode === 'PUBLISHED'}
                      onChange={this.handleChangeMouth}
                    >
                      {intl
                        .get(`sslm.supplierKpiIndicator.model.supplier.lastDayFlag`)
                        .d('是否为每月最后一天')}
                    </Checkbox>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  label={intl
                    .get('sslm.supplierKpiIndicator.model.cycle.triggerTime')
                    .d('触发时间')}
                  {...formLayoutText}
                >
                  {getFieldDecorator('evalTgrHour', {
                    initialValue: EvaluationAutoData.evalTgrHour,
                  })(
                    <Select allowClear disabled={actionDataSource.evalStatusCode === 'PUBLISHED'}>
                      {triggerTimeCode.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  label={intl
                    .get(`sslm.supplierKpiIndicator.model.supplier.ruleRemark`)
                    .d('考评规则说明')}
                  {...formLayoutText}
                >
                  {getFieldDecorator('evalRuleRemark', {
                    initialValue: EvaluationAutoData.evalRuleRemark,
                  })(
                    <TextArea
                      rows={2}
                      style={{ marginTop: '10px' }}
                      disabled={actionDataSource.evalStatusCode === 'PUBLISHED'}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={18}>
                <FormItem
                  label={intl
                    .get(`sslm.supplierKpiIndicator.model.supplier.evalRemark`)
                    .d('考评说明')}
                  {...formLayoutText}
                >
                  {getFieldDecorator('evalRemark', {
                    initialValue: EvaluationAutoData.evalRemark,
                  })(
                    <TextArea
                      rows={2}
                      style={{ marginTop: '10px' }}
                      disabled={actionDataSource.evalStatusCode === 'PUBLISHED'}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              borderTop: '1px solid #e8e8e8',
              padding: '10px 16px',
              textAlign: 'right',
              left: 0,
              background: '#fff',
              borderRadius: '0 0 4px 4px',
              zIndex: 1,
            }}
          >
            <Button onClick={this.cancel} disabled={false} style={{ marginRight: 8 }}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
            {actionDataSource.evalStatusCode !== 'PUBLISHED' && (
              <Button
                type="primary"
                // loading={deleteEvalTplScopeLoading || saveEvalTplScopeLoading}
                onClick={this.handleSave}
              >
                {intl.get(`hzero.common.button.ok`).d('确定')}
              </Button>
            )}
          </div>
        </Drawer>
      </Fragment>
    );
  }
}
