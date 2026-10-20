import React, { Component } from 'react';
import { connect } from 'dva';
import {
  Form,
  Select,
  DatePicker,
  TextField,
  NumberField,
  TextArea,
  Lov,
  Tooltip,
  CheckBox,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

import styles from './style/index.less';

@connect()
@observer
export default class EditModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodeList: [],
    };
  }

  componentDidMount() {
    this.fetchActNodeList();
  }

  @Bind()
  fetchActNodeList() {
    const { isBatch, editData, dispatch } = this.props;
    if (isBatch) {
      return;
    }
    dispatch({
      type: 'automaticProcess/fetchActNodeList',
      params: {
        processKey: (editData || {}).processKey,
      },
    }).then((res) => {
      if (res && Array.isArray(res)) {
        this.setState({
          nodeList: res,
        });
      }
    });
  }

  @Bind()
  renderDynamicConditionItem() {
    const { processtimeOutOptions = [], record } = this.props;
    const processCondition = record ? record.get('processCondition') : undefined;
    // 固定时间
    if (processCondition === 'FIXED_PERIOD') {
      return (
        <>
          <DatePicker
            name="processStartDate"
            filter={(currentDate) =>
              !(
                (record &&
                  record.get('processEndDate') &&
                  moment(record.get('processEndDate')).isBefore(currentDate, 'day')) ||
                (currentDate && moment(currentDate).subtract(-1, 'days') < moment().endOf('day'))
              )
            }
          />
          <DatePicker
            name="processEndDate"
            filter={(currentDate) =>
              !(
                (record &&
                  record.get('processStartDate') &&
                  moment(record.get('processStartDate')).isAfter(currentDate, 'day')) ||
                (currentDate && moment(currentDate).subtract(-1, 'days') < moment().endOf('day'))
              )
            }
          />
        </>
      );
    } else if (processCondition === 'TIME_OUT') {
      return (
        <>
          <NumberField name="timeoutValue" />
          <Select name="timeoutUnit">
            {processtimeOutOptions.map((item) => (
              <Select.Option value={item.value}>{item.meaning}</Select.Option>
            ))}
          </Select>
        </>
      );
    } else {
      return null;
    }
  }

  @Bind()
  renderDynamicRuleItem() {
    const { record } = this.props;
    const processRule = record ? record.get('processRule') : undefined;
    if (processRule === 'AutoDelegate') {
      return <Lov name="delegateCode" />;
    } else if (processRule === 'AutoApprove') {
      return <TextArea name="processRemark" />;
    } else {
      return null;
    }
  }

  render() {
    const { isBatch, record } = this.props;
    const { nodeList } = this.state;
    return (
      <Form labelLayout="float" columns={1} record={record} className={styles['form-float']}>
        {!isBatch && <TextField name="processName" disabled />}
        <Select name="processCondition" />
        {this.renderDynamicConditionItem()}
        <Select name="processRule" />
        {this.renderDynamicRuleItem()}
        {record && record.get('processRule') === 'AutoDelegate' && (
          <>
            {!isBatch && (
              <Select name="delegateActId" searchable clearButton>
                {nodeList.map((n) => (
                  <Select.Option text={n.name} value={n.id}>
                    {n.name}
                  </Select.Option>
                ))}
              </Select>
            )}
            {record.get('processCondition') === 'FIXED_PERIOD' && (
              <CheckBox
                className={styles['form-float-switch']}
                name="hisDelegateFlag"
                label={
                  <>
                    {intl.get('hwfp.common.delegate.documentAutoDelegate').d('未审批单据自动转交')}
                    <Tooltip
                      title={intl
                        .get('hwfp.common.delegate.documentAutoDelegate.help')
                        .d(
                          '开启未审批单据自动转交，则到达转交开始时间，未审批单据会自动转交转交人'
                        )}
                    >
                      <Icon type="help" style={{ verticalAlign: 'sub', color: '#868D9C' }} />
                    </Tooltip>
                  </>
                }
              />
            )}
          </>
        )}
        <CheckBox name="enabledFlag" />
      </Form>
    );
  }
}
