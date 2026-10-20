/**
 * model 自动转交配置
 * @date: 2018-8-25
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Button, Form, DatePicker, Row, Col, Tooltip, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { omit, isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import { queryMapIdpValue } from 'services/api';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';

import { getCheckDelegateMessage, renderDelegateStatus } from '@/utils/util';

const FormItem = Form.Item;
const dateFormat = `${getDateFormat()} HH:mm`;
const saveFormat = `${getDateFormat()} HH:mm:00`;

@Form.create({ fieldNameProp: null })
@connect(({ loading, delegate }) => ({
  delegate,
  creating: loading.effects['delegate/addDelegateSet'],
  organizationId: getCurrentOrganizationId(),
  // dateFormat: getDateFormat(),
}))
@formatterCollections({ code: ['hwfp.delegate', 'hwfp.common'] })
export default class Delegate extends Component {
  state = {
    startDateString: '',
    endDateString: '',
    validateData: {
      errorFlag: false,
      errorMessage: '',
    },
    delegateStatusMap: {},
  };

  componentDidMount() {
    this.queryLovDatra();
    this.queryDelegateSet();
  }

  @Bind()
  queryLovDatra() {
    queryMapIdpValue({
      delegateStatusOptions: 'HWFP.AUTO_DELEGATE_CONFIG.STATUS',
    }).then((res) => {
      if (res && res.delegateStatusOptions && res.delegateStatusOptions.length) {
        const map = {};
        res.delegateStatusOptions.forEach((i) => {
          map[i.value] = i.meaning;
        });
        this.setState({
          delegateStatusMap: map,
        });
      }
    });
  }

  /**
   * @function queryDelegateSet - 查询当前转交设置
   */
  queryDelegateSet() {
    const { dispatch, organizationId } = this.props;
    return dispatch({
      type: 'delegate/queryDelegateSet',
      payload: { organizationId },
    });
  }

  // 开始时间
  onChangeStartDate = (date, dateString) => {
    this.handleFormUpdate('delegateStartDate', date);
    this.setState({
      startDateString: dateString,
    });
    if (
      this.compareDate(dateString, 'start') &&
      this.compareDate(this.state.endDateString, 'end')
    ) {
      this.compareDateTwo(this.state.endDateString, dateString);
    }
  };

  // 结束时间
  onChangeEndDate = (date, dateString) => {
    this.handleFormUpdate('delegateEndDate', date);
    const parasAll = this.props.form.getFieldsValue(['delegateStartDate', 'delegateEndDate']);

    this.setState({
      endDateString: dateString,
    });
    if (parasAll.delegateStartDate) {
      if (
        this.compareDate(dateString, 'end') &&
        this.compareDate(this.state.startDateString, 'start')
      ) {
        this.compareDateTwo(dateString, parasAll.delegateStartDate);
      }
    }
  };

  handleFormUpdate = (key, value) => {
    const {
      form: { setFields, getFieldValue },
    } = this.props;
    const delegateStartDate = getFieldValue('delegateStartDate');
    const delegateEndDate = getFieldValue('delegateEndDate');
    const delegateObj = getFieldValue('delegateObj');
    const formData = {
      delegateStartDate,
      delegateEndDate,
      delegateObj,
      [key]: value,
    };
    if (
      isEmpty(formData.delegateStartDate) &&
      isEmpty(formData.delegateEndDate) &&
      isEmpty(formData.delegateObj)
    ) {
      setFields({
        hisDelegateFlag: { value: 0 },
        delegateStartDate: { value: undefined, error: undefined },
        delegateEndDate: { value: undefined, error: undefined },
        delegateObj: { value: undefined, error: undefined },
      });
    }
  };

  // 与当前时间比较
  compareDate(selectDate, startOrEnd) {
    const beginDateStamp = moment().format("YYYY-MM-DD HH:mm"); // 获取当前时间，到分钟为止
    // let endDateStamp = Date.parse(selectDate)/1000/60;
    const endDateStamp = moment(selectDate).format("YYYY-MM-DD HH:mm"); // 获取当前选择的时间，到分钟为止

    let timeCorrect = false;
    if (moment(beginDateStamp).isAfter(endDateStamp)) {
      timeCorrect = true;
    } else {
      timeCorrect = false;
    }
    let params = {};
    if (timeCorrect) {
      if (startOrEnd === 'start') {
        params = {
          errorFlag: true,
          errorMessage: intl
            .get('hwfp.delegate.view.message.startIsBefore')
            .d('转交开始日期不能早于当前时间'),
        };
        this.setState({ validateData: params });
      } else if (startOrEnd === 'end') {
        params = {
          errorFlag: true,
          errorMessage: intl
            .get('hwfp.delegate.view.message.endIsBefore')
            .d('转交截止日期不能早于当前时间'),
        };
        this.setState({ validateData: params });
      }
      return false;
    } else {
      params = {
        errorFlag: false,
        errorMessage: '',
      };
      this.setState({ validateData: params });
      return true;
    }
  }

  // 开始时间和结束时间比较
  compareDateTwo(endDate, startDate) {
    const timeCorrect = moment(endDate).isBefore(moment(startDate).format(dateFormat));
    let params = {};
    if (timeCorrect) {
      params = {
        errorFlag: true,
        errorMessage: intl
          .get('hwfp.delegate.view.message.isBefore')
          .d('转交截止日期不能早于转交开始日期'),
      };
      this.setState({ validateData: params });
      return false;
    } else {
      params = {
        errorFlag: false,
        errorMessage: '',
      };
      this.setState({ validateData: params });
      return true;
    }
  }

  /**
   * @function handleSaveDelegate - 保存转交配置
   */
  @Bind()
  handleSaveDelegate() {
    const {
      dispatch,
      form,
      organizationId,
      delegate: { delegateSetDetail = {} },
    } = this.props;
    const {
      validateData: { errorFlag },
    } = this.state;
    let params = {};
    form.validateFields((err, values) => {
      if (!err && !errorFlag) {
        const { delegateStartDate, delegateEndDate, hisDelegateFlag } = values;
        const valuesNew = omit(values, ['delegateObj', 'delegateNameNew']);
        params = {
          type: 'delegate/addDelegateSet',
          payload: {
            ...valuesNew,
            delegateStartDate: delegateStartDate
              ? moment(delegateStartDate).format(saveFormat)
              : null,
            delegateEndDate: delegateEndDate ? moment(delegateEndDate).format(saveFormat) : null,
            delegateId: delegateSetDetail.delegateId,
            objectVersionNumber: delegateSetDetail.objectVersionNumber,
            organizationId,
            hisDelegateFlag: hisDelegateFlag || 0,
          },
        };
        dispatch(params).then((res) => {
          if (res) {
            notification.success();
            this.queryDelegateSet();
          }
        });
      }
    });
  }

  @Bind()
  handleReset() {
    const { form } = this.props;
    form.setFieldsValue({
      delegateStartDate: undefined,
      delegateEndDate: undefined,
      delegateCode: undefined,
      delegateName: undefined,
      delegateNameNew: undefined,
      delegateObj: undefined,
    });
    this.setState({
      validateData: {
        errorFlag: false,
        errorMessage: '',
      },
    });
  }

  @Bind()
  handleCheckDelegate(rule, value, callback) {
    if (value) {
      callback(getCheckDelegateMessage(value));
    } else {
      callback();
    }
  }

  @Bind()
  renderForm() {
    const {
      form,
      form: { setFieldsValue },
      organizationId,
      delegate: { delegateSetDetail = {} },
    } = this.props;
    const {
      delegateStartDate,
      delegateEndDate,
      delegateCode,
      delegateName,
      hisDelegateFlag,
      delegateStatus,
    } = delegateSetDetail;
    const { getFieldDecorator, getFieldValue } = form;
    const { validateData, delegateStatusMap } = this.state;
    const formItemLayout = {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 16,
      },
    };
    return (
      <Form style={{ width: '500px' }}>
        <FormItem
          label={intl.get('hwfp.common.model.apply.delegateStatus').d('转交配置状态')}
          {...formItemLayout}
        >
          {renderDelegateStatus({ value: delegateStatus, text: delegateStatusMap[delegateStatus] })}
        </FormItem>
        <FormItem
          label={intl.get('hwfp.delegate.view.message.delegateStartDate').d('转交开始日期')}
          {...formItemLayout}
        >
          {getFieldDecorator('delegateStartDate', {
            initialValue: delegateStartDate && moment(delegateStartDate, dateFormat),
            rules: [
              {
                required:
                  !isEmpty(getFieldValue('delegateEndDate')) ||
                  !isEmpty(getFieldValue('delegateObj')),
                message: intl
                  .get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hwfp.delegate.view.message.delegateStartDate')
                      .d('转交开始日期'),
                  })
                  .d(
                    `${intl
                      .get('hwfp.delegate.view.message.delegateStartDate')
                      .d('转交开始日期')}不能为空`
                  ),
              },
            ],
          })(
            <DatePicker
              style={{ width: '100%' }}
              showTime={{ format: 'HH:mm' }}
              placeholder=""
              format={dateFormat}
              onChange={this.onChangeStartDate}
              disabledDate={
                (currentDate) => currentDate && currentDate <= moment().startOf('day')
                // getFieldValue('delegateEndDate') &&
                // moment(getFieldValue('delegateEndDate')).isBefore(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get('hwfp.delegate.view.message.delegateEndDate').d('转交截止日期')}
          {...formItemLayout}
        >
          {getFieldDecorator('delegateEndDate', {
            initialValue: delegateEndDate && moment(delegateEndDate, dateFormat),
            rules: [
              {
                required:
                  !isEmpty(getFieldValue('delegateStartDate')) ||
                  !isEmpty(getFieldValue('delegateObj')),
                message: intl
                  .get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.delegate.view.message.delegateEndDate').d('转交截止日期'),
                  })
                  .d(
                    `${intl
                      .get('hwfp.delegate.view.message.delegateEndDate')
                      .d('转交截止日期')}不能为空`
                  ),
              },
            ],
          })(
            <DatePicker
              style={{ width: '100%' }}
              showTime={{ format: 'HH:mm' }}
              placeholder=""
              format={dateFormat}
              onChange={this.onChangeEndDate}
              disabledDate={(currentDate) =>
                getFieldValue('delegateStartDate') &&
                moment(getFieldValue('delegateStartDate')).isAfter(currentDate, 'day')
              }
            />
          )}
        </FormItem>
        <FormItem
          label={intl.get('hwfp.delegate.view.message.delegate').d('转交人')}
          {...formItemLayout}
        >
          {getFieldDecorator('delegateObj', {
            initialValue: delegateCode
              ? `${delegateName || ''}(${delegateCode})`
              : delegateName || '',
            rules: [
              {
                required:
                  !isEmpty(getFieldValue('delegateStartDate')) ||
                  !isEmpty(getFieldValue('delegateEndDate')),
                message: intl
                  .get('hzero.common.validation.notNull', {
                    name: intl.get('hwfp.delegate.view.message.delegate').d('转交人'),
                  })
                  .d(`${intl.get('hwfp.delegate.view.message.delegate').d('转交人')}不能为空`),
              },
              {
                validator: this.handleCheckDelegate,
              },
            ],
          })(
            <Lov
              queryParams={{ tenantId: organizationId, enabledFlag: 1 }}
              code="HWFP.EMPLOYEE"
              textField="delegateNameNew"
              lovOptions={{
                displayField: 'name',
                valueField: 'employeeNum',
              }}
              onChange={(text, record) => {
                this.handleFormUpdate('delegateObj', text);
                setFieldsValue({
                  delegateName: record.name,
                  delegateCode: text,
                  delegateNameNew: `${record.name}(${text})`,
                });
              }}
            />
          )}
          {getFieldDecorator('delegateCode', {
            initialValue: delegateCode,
          })}
          {getFieldDecorator('delegateName', {
            initialValue: delegateName,
          })}
        </FormItem>
        <Form.Item
          label={
            <>
              {intl.get('hwfp.common.delegate.documentAutoDelegate').d('未审批单据自动转交')}
              <Tooltip
                title={intl
                  .get('hwfp.common.delegate.documentAutoDelegate.help')
                  .d('开启未审批单据自动转交，则到达转交开始时间，未审批单据会自动转交转交人')}
              >
                <Icon type="question-circle" style={{ verticalAlign: 'middle' }} />
              </Tooltip>
            </>
          }
          {...formItemLayout}
        >
          {getFieldDecorator('hisDelegateFlag', {
            initialValue: hisDelegateFlag || 0,
          })(
            <Switch
              disabled={
                isEmpty(getFieldValue('delegateStartDate')) &&
                isEmpty(getFieldValue('delegateEndDate')) &&
                isEmpty(getFieldValue('delegateObj'))
              }
            />
          )}
        </Form.Item>
        <Row>
          <Col offset={8}>
            <span style={{ color: 'red', display: validateData.errorFlag ? 'block' : 'none' }}>
              {validateData.errorMessage}
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    return (
      <>
        <Header title={intl.get('hwfp.delegate.view.message.title.delegate').d('自动转交设置')}>
          <Button
            icon="save"
            type="primary"
            htmlType="submit"
            loading={this.props.creating}
            onClick={this.handleSaveDelegate}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="rollback" onClick={this.handleReset}>
            {intl.get('hzero.common.button.clean').d('清除')}
          </Button>
        </Header>
        <Content>{this.renderForm()}</Content>
      </>
    );
  }
}
