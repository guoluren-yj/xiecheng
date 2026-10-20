/**
 * 运维配置
 */
import React, { PureComponent } from 'react';
import { DataSet, Form, Select, Spin, Switch, Lov, NumberField } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import { basicFormDS } from '@/stores/Services/maintainConfigDS';
import getLang from '@/langs/serviceLang';

export default class MaintenanceConfig extends PureComponent {
  constructor(props) {
    super(props);
    const { interfaceId } = props;
    this.basicFormDS = new DataSet(
      basicFormDS({
        interfaceId,
        onFieldUpdate: this.handleFieldUpdate,
        onLoad: this.handleLoad,
      })
    );
    this.state = {
      healthCheckFlag: false,
    };
  }

  componentDidMount() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  @Bind()
  handleFieldUpdate({ name, value, record }) {
    if (name === 'healthCheckFlag') {
      if (value === 1) {
        this.props.modal.update({
          style: { width: 750 },
        });
      } else {
        this.props.modal.update({
          style: undefined,
        });
      }
      this.setState({ healthCheckFlag: value });
    }
    if (name === 'checkPeriod') {
      const minValue = record.get('checkRoundRobin') * record.get('checkThreshold');
      if (value < minValue) {
        record.set('checkPeriod', minValue);
      }
    }
  }

  @Bind()
  handleLoad({ dataSet }) {
    const { healthCheckFlag, invokeStatisticsFlag } = dataSet.records[0].toData();
    if (invokeStatisticsFlag === 1 || healthCheckFlag === 1) {
      this.props.modal.update({
        style: { width: 750 },
      });
    }
    this.setState({ healthCheckFlag });
  }

  @Bind()
  async handleSave() {
    const validate = await this.basicFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    return this.basicFormDS.submit();
  }

  render() {
    const { healthCheckFlag } = this.state;
    return (
      <Spin dataSet={this.basicFormDS}>
        <Card
          key="invokeDimension"
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<h3>{getLang('INVOKE_DIMENSION')}</h3>}
        >
          <Form dataSet={this.basicFormDS}>
            <Select name="invokeDetailsFlag" />
          </Form>
        </Card>
        <Card
          key="healthExamination"
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<h3>{getLang('HEALTH_EXAMINATION')}</h3>}
        >
          <Form dataSet={this.basicFormDS} labelWidth={120} columns={2}>
            <Switch name="healthCheckFlag" />
            {healthCheckFlag === 1 && <Lov name="checkUsecaseLov" />}
            {healthCheckFlag === 1 && <NumberField name="checkRoundRobin" />}
            {healthCheckFlag === 1 && <NumberField name="checkThreshold" />}
            {healthCheckFlag === 1 && <NumberField name="checkPeriod" />}
            {healthCheckFlag === 1 && <Lov name="checkWarningMsgTplLov" />}
          </Form>
        </Card>
        <Card
          key="alertInfo"
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<h3>{getLang('ALERT_INFO')}</h3>}
        >
          <Form dataSet={this.basicFormDS}>
            <Lov name="alertLov" />
          </Form>
        </Card>
      </Spin>
    );
  }
}
