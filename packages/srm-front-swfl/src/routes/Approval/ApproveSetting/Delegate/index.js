/**
 * model 自动转交配置
 * @date: 2018-8-25
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, DatePicker, Row, Col } from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import styles from '../index.less';

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
@formatterCollections({ code: ['hwfp.delegate'] })
export default class Delegate extends Component {
  state = {
    startDateString: '',
    endDateString: '',
    validateData: {
      errorFlag: false,
      errorMessage: '',
    },
  };

  componentDidMount() {
    this.queryDelegateSet();
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

  // 与当前时间比较
  compareDate(selectDate, startOrEnd) {
    const beginDateStamp = Math.floor(new Date().getTime() / 1000 / 60); // 获取当前时间，到分钟为止
    // let endDateStamp = Date.parse(selectDate)/1000/60;
    const endDateStamp = new Date(selectDate.replace(/-/g, '/')).getTime() / 1000 / 60; // 获取当前选择的时间，到分钟为止

    let timeCorrect = false;
    if (beginDateStamp > endDateStamp) {
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
      const { delegateStartDate, delegateEndDate } = values;
      if (!err && !errorFlag) {
        params = {
          type: 'delegate/addDelegateSet',
          payload: {
            ...values,
            delegateStartDate: delegateStartDate
              ? moment(delegateStartDate).format(saveFormat)
              : null,
            delegateEndDate: delegateEndDate ? moment(delegateEndDate).format(saveFormat) : null,
            delegateId: delegateSetDetail.delegateId,
            objectVersionNumber: delegateSetDetail.objectVersionNumber,
            delegateCode: delegateSetDetail.delegateCode,
            delegateName: delegateSetDetail.delegateName
              ? delegateSetDetail.delegateName
              : delegateSetDetail.delegateCode,
            organizationId,
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

  // @Bind()
  // handleReset() {
  //   const { form } = this.props;
  //   form.setFieldsValue({
  //     delegateStartDate: undefined,
  //     delegateEndDate: undefined,
  //     delegateCode: undefined,
  //   });
  //   this.setState({
  //     validateData: {
  //       errorFlag: false,
  //       errorMessage: '',
  //     },
  //   });
  // }
  @Bind()
  renderForm() {
    const {
      form,
      organizationId,
      delegate: { delegateSetDetail = {} },
    } = this.props;
    const { delegateStartDate, delegateEndDate, delegateCode, delegateName } = delegateSetDetail;
    const { getFieldDecorator, getFieldValue } = form;
    const { validateData } = this.state;
    const formItemLayout = {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 16,
      },
    };
    return (
      <Form
        style={{
          width: '500px',
          marginLeft: '-90px',
        }}
        className={styles['form-float']}
      >
        <FormItem
          label={intl.get('hwfp.delegate.view.message.delegateStartDate').d('转交开始日期')}
          {...formItemLayout}
        >
          {getFieldDecorator('delegateStartDate', {
            initialValue: delegateStartDate && moment(delegateStartDate, dateFormat),
          })(
            <DatePicker
              style={{ width: '100%' }}
              showTime={{ format: 'HH:mm' }}
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
          })(
            <DatePicker
              style={{ width: '100%' }}
              showTime={{ format: 'HH:mm' }}
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
          {getFieldDecorator('delegateCode', {
            initialValue: delegateName || delegateCode,
          })(
            <Lov
              textValue={getFieldValue('delegateCode')}
              queryParams={{ tenantId: organizationId, enabledFlag: 1 }}
              code="HPFM.EMPLOYEE"
              onChange={(text, record) => {
                const { dispatch } = this.props;
                const delegateSetDetailNew = {
                  ...delegateSetDetail,
                  delegateCode: record.employeeNum,
                  delegateName: record.name,
                };
                return dispatch({
                  type: 'delegate/changeDelegateSet',
                  payload: { delegateSetDetail: { ...delegateSetDetailNew } },
                });
              }}
            />
          )}
        </FormItem>
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
        {this.renderForm()}
        <div className={styles['footer-btn']}>
          <Button
            type="primary"
            htmlType="submit"
            loading={this.props.creating}
            onClick={this.handleSaveDelegate}
            className={styles['delegate-btn']}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="rollback" onClick={this.props.handleCancel}>
            {intl.get('hwfp.common.model.apply.cancel').d('取消')}
          </Button>
        </div>
      </>
    );
  }
}
