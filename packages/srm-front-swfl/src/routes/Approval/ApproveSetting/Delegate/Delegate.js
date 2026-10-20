/**
 * model 自动转交配置
 * @date: 2021-8-28
 * @author: sx <xia.shen@going-link.com>
 * @copyright Copyright (c) 2021, Hand
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col } from 'hzero-ui';
import {
  DataSet,
  Form,
  DateTimePicker,
  Lov,
  Button,
  Tooltip,
  Output,
  CheckBox,
} from 'choerodon-ui/pro';
import { Icon, Alert } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import notification from 'utils/notification';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat, getLocaleDate } from 'utils/utils';
import { delegateFormDS } from '@/stores/automaticProcessDS';
import { renderDelegateStatus } from '@/utils/util';
import styles from '../index.less';

const dateFormat = `${getDateFormat()} HH:mm:ss`;
const saveFormat = `YYYY-MM-DD HH:mm:00`;

@connect(({ loading, delegate }) => ({
  delegate,
  creating: loading.effects['delegate/addDelegateSet'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hwfp.delegate'] })
@withProps(() => {
  const formDs = new DataSet(delegateFormDS());
  return { formDs };
}, {})
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
    dispatch({
      type: 'delegate/queryDelegateSet',
      payload: { organizationId },
    }).then((res) => {
      if (res) {
        const { formDs } = this.props;
        const {
          delegateStartDate = null,
          delegateEndDate = null,
          delegateUserLov = null,
          delegateCode = null,
          delegateName = null,
          hisDelegateFlag,
          delegateStatus,
        } = res;
        formDs.current.set(
          'delegateStartDate',
          delegateStartDate ? moment(delegateStartDate) : null
        );
        formDs.current.set('delegateEndDate', delegateEndDate ? moment(delegateEndDate) : null);
        formDs.current.set('delegateUserLov', delegateUserLov);
        formDs.current.set('delegateCode', delegateCode);
        formDs.current.set('delegateName', delegateName);
        formDs.current.set(
          'textValue',
          delegateCode ? `${delegateName || ''}(${delegateCode})` : `${delegateName || ''}`
        );
        formDs.current.set('hisDelegateFlag', hisDelegateFlag || 0);
        formDs.current.set('delegateStatus', delegateStatus);
        formDs.current.validate();
      }
    });
  }

  // 开始时间
  onChangeStartDate = (value) => {
    const { formDs } = this.props;
    formDs.current.set('delegateStartDate', value);
    const dateString = value ? value.format('YYYY-MM-DD HH:mm:ss') : null;
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
  onChangeEndDate = (value) => {
    const { formDs } = this.props;
    formDs.current.set('delegateEndDate', value);
    const dateString = value ? value.format('YYYY-MM-DD HH:mm:ss') : null;
    const delegateStartDate = formDs.current.get('delegateStartDate');
    this.setState({
      endDateString: dateString,
    });
    if (delegateStartDate) {
      if (
        this.compareDate(dateString, 'end') &&
        this.compareDate(this.state.startDateString, 'start')
      ) {
        this.compareDateTwo(dateString, delegateStartDate);
      }
    }
  };

  // 与当前时间比较
  compareDate(selectDate, startOrEnd) {
    if (!selectDate) {
      return;
    }
    const beginDateStamp = Math.floor(new Date(getLocaleDate()).getTime() / 1000 / 60); // 获取当前时间，到分钟为止
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
  async handleSaveDelegate() {
    const {
      dispatch,
      formDs,
      organizationId,
      delegate: { delegateSetDetail = {} },
    } = this.props;
    const {
      validateData: { errorMessage, errorFlag },
    } = this.state;
    let params = {};
    if (!formDs.current) {
      return;
    }
    const flag = await formDs.current.validate();
    if (!flag) {
      return;
    }
    const {
      delegateStartDate,
      delegateEndDate,
      delegateCode,
      delegateName,
      hisDelegateFlag,
    } = formDs.current.get([
      'delegateStartDate',
      'delegateEndDate',
      'delegateCode',
      'delegateName',
      'hisDelegateFlag',
    ]);
    if (errorFlag) {
      notification.warning({
        message: errorMessage,
      });
    } else {
      params = {
        type: 'delegate/addDelegateSet',
        payload: {
          ...delegateSetDetail,
          delegateStartDate: delegateStartDate
            ? moment(delegateStartDate).format(saveFormat)
            : null,
          delegateEndDate: delegateEndDate ? moment(delegateEndDate).format(saveFormat) : null,
          delegateCode,
          delegateName: delegateName || delegateCode,
          organizationId,
          hisDelegateFlag: hisDelegateFlag || 0,
        },
      };
      const res = await dispatch(params);
      if (res) {
        notification.success();
        this.queryDelegateSet();
      }
    }
  }

  @Bind()
  handleLovChange(value) {
    const { employeeNum = '', name = '' } = value || {};
    const { formDs } = this.props;
    formDs.current.set('delegateCode', employeeNum);
    formDs.current.set('delegateName', name);
    formDs.current.set('textValue', employeeNum ? `${name}(${employeeNum})` : `${name}`);
  }

  @Bind()
  renderForm() {
    const { formDs } = this.props;
    const { validateData } = this.state;
    return (
      <Form
        style={{
          width: '450px',
          marginLeft: '20px',
          height: '80vh',
          marginTop: '16px',
        }}
        dataSet={formDs}
        labelLayout="float"
        className={classnames(styles['delegate-form-float'], styles['form-float'])}
      >
        <Output name="delegateStatus" renderer={renderDelegateStatus} />
        <DateTimePicker
          style={{ width: '100%' }}
          name="delegateStartDate"
          onChange={this.onChangeStartDate}
          min={moment().startOf('day')}
        />
        <DateTimePicker
          style={{ width: '100%' }}
          name="delegateEndDate"
          onChange={this.onChangeEndDate}
          min={
            moment().startOf('day') > moment(formDs.current.get('delegateStartDate'))
              ? moment().startOf('day')
              : moment(formDs.current.get('delegateStartDate'))
          }
        />
        <Lov name="delegateUserLov" onChange={this.handleLovChange} />
        <CheckBox
          name="hisDelegateFlag"
          label={
            <>
              {intl.get('hwfp.common.delegate.documentAutoDelegate').d('未审批单据自动转交')}
              <Tooltip
                title={intl
                  .get('hwfp.common.delegate.documentAutoDelegate.help')
                  .d('开启未审批单据自动转交，则到达转交开始时间，未审批单据会自动转交转交人')}
              >
                <Icon
                  type="help"
                  style={{
                    verticalAlign: 'sub',
                    fontSize: '16px',
                    color: '#c9cdd4',
                    marginLeft: '4px',
                  }}
                />
              </Tooltip>
            </>
          }
        />
        <Row>
          <Col offset={0}>
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
        <Alert
          closable
          type="info"
          showIcon
          className={styles['automatic-process-alert']}
          description={intl
            .get('hwfp.common.view.message.delegate.alert')
            .d(
              '提示：自动转交设置可配置一段时间内，您收到的工作流待办系统全部自动转交给“转交人”进行审批；开启“未审批单据自动转交”，则到达转交开始时间，未审批单据会自动转交转交人，若您需要按照流程配置流程自动处理规则，请在【自动规则】页签进行配置'
            )}
        />
        {this.renderForm()}
        <div className={styles['footer-btn']}>
          <Button onClick={this.handleSaveDelegate} className={styles['delegate-btn']}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button onClick={this.props.handleCancel}>
            {intl.get('hwfp.common.model.apply.cancel').d('取消')}
          </Button>
        </div>
      </>
    );
  }
}
