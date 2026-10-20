/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/7/20
 * @copyright HAND ® 2021
 */
import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import {
  DataSet,
  Form,
  Switch,
  Spin,
  TextField,
  TextArea,
  Select,
  NumberField,
  Button,
} from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import { DESENSITIZE_WAY_CONSTANTS, DESENSITIZE_TYPE_CONSTANTS } from '@/constants/constants';
import {
  basicFormDS,
  debugFormDS,
  debugResultDS,
} from '@/stores/DesensitizeRule/DesensitizeRuleDS';
import getLang from '@/langs/desensitizeRuleLang';

export default class RuleDrawer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      desensitizeWay: '',
      desensitizeType: '',
      isNew: true,
      enabledFlag: false,
    };

    this.basicFormDS = new DataSet(
      basicFormDS({
        onFieldUpdate: this.handleFieldUpdate,
      })
    );
    this.debugFormDS = new DataSet(debugFormDS());
    this.debugResultDS = new DataSet(debugResultDS());
  }

  componentDidMount() {
    const { desensitizeRuleId } = this.props;
    if (!isUndefined(desensitizeRuleId)) {
      this.handleFetchDetail(desensitizeRuleId);
    } else {
      this.updateModalProps();
    }
  }

  @Bind()
  updateModalProps() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  @Bind()
  updateReadOnlyModalProps() {
    this.props.modal.update({
      cancelText: getLang('CLOSE'),
      cancelProps: { color: 'primary' },
      footer: (_okBtn, cancelBtn) => cancelBtn,
    });
  }

  @Bind()
  handleFieldUpdate({ name, value, record }) {
    const { MASK, TRUNCATION } = DESENSITIZE_WAY_CONSTANTS;
    if (name === 'desensitizeWay') {
      this.setState({
        desensitizeWay: value,
        desensitizeType: [MASK, TRUNCATION].includes(value) ? record.get('desensitizeType') : '',
      });
    }
    if (name === 'desensitizeType') {
      this.setState({ desensitizeType: value });
    }
    if (name === 'maskNum') {
      if (value < 1) {
        record.set('maskNum', 1);
      } else if (value > 10) {
        record.set('maskNum', 10);
      }
    }
    if (name === 'maskStart') {
      if (value < 1) {
        record.set('maskStart', 1);
      }
    }
    if (name === 'maskEnd') {
      if (value < 1) {
        record.set('maskEnd', 1);
      }
    }
  }

  /**
   * 查询
   */
  @Bind()
  handleFetchDetail(desensitizeRuleId) {
    const { isCurrentTenantCreate } = this.props;
    this.basicFormDS.setQueryParameter('desensitizeRuleId', desensitizeRuleId);
    this.basicFormDS.query().then((res = {}) => {
      const { desensitizeWay, desensitizeType, enabledFlag } = res;
      if (isCurrentTenantCreate && !enabledFlag) {
        this.updateModalProps();
      } else {
        this.updateReadOnlyModalProps();
      }
      this.setState({ desensitizeWay, desensitizeType, enabledFlag, isNew: false });
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const validate = await this.basicFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const { onRefresh } = this.props;
    return this.basicFormDS.submit().then((res) => {
      if (res && !res.failed) {
        this.handleFetchDetail(res.content[0]?.desensitizeRuleId);
        onRefresh();
      }
      return false;
    });
  }

  @Bind()
  async handleDebug() {
    const validate = await this.basicFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('BASIC_VALIDATE'),
      });
      return false;
    }
    if (!this.debugFormDS.current.get('testStr')) {
      notification.error({
        message: getLang('TEST_VALIDATE'),
      });
      return false;
    }
    const debugData = {
      ...this.basicFormDS.current.toData(),
      ...this.debugFormDS.current.toData(),
    };
    this.debugResultDS.setQueryParameter('debugData', debugData);

    return this.debugResultDS.query().then((res) => {
      if (res && !res.failed) {
        this.debugFormDS.current.set('debugResult', res);
      } else {
        this.debugFormDS.current.set('debugResult', undefined);
      }
    });
  }

  render() {
    const { isCurrentTenantCreate } = this.props;
    const { desensitizeWay, desensitizeType, isNew, enabledFlag } = this.state;
    const { MASK, TRUNCATION, SENSITIVE } = DESENSITIZE_WAY_CONSTANTS;
    const { FRONT, BEHIND, MIDDLE } = DESENSITIZE_TYPE_CONSTANTS;
    return (
      <Spin dataSet={this.basicFormDS}>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<h3>{getLang('BASIC_INFO')}</h3>}
        >
          <Form
            dataSet={this.basicFormDS}
            labelWidth={120}
            columns={2}
            disabled={!isCurrentTenantCreate || enabledFlag}
          >
            <TextField disabled={!isNew} name="ruleCode" />
            <TextField name="ruleName" />
            <Select name="desensitizeWay" />
            {[MASK, TRUNCATION].includes(desensitizeWay) && <Select name="desensitizeType" />}
            {[FRONT, MIDDLE].includes(desensitizeType) && <NumberField name="maskStart" />}
            {[MIDDLE, BEHIND].includes(desensitizeType) && <NumberField name="maskEnd" />}
            {desensitizeWay === SENSITIVE && <TextField name="sensitiveStrs" />}
            {[MASK, SENSITIVE].includes(desensitizeWay) && <Select name="maskStr" />}
            {[MASK, SENSITIVE].includes(desensitizeWay) && <NumberField name="maskNum" />}
            <Switch name="enabledFlag" />
            <TextArea newLine name="description" colSpan={2} />
          </Form>
        </Card>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<h3>{getLang('DEBUG')}</h3>}
        >
          <div style={{ textAlign: 'right' }}>
            <Button color="primary" onClick={this.handleDebug}>
              {getLang('DEBUG')}
            </Button>
          </div>
          <Form dataSet={this.debugFormDS}>
            <TextArea name="testStr" rows={5} suffix="test" />
            <TextArea name="debugResult" rows={5} />
          </Form>
        </Card>
      </Spin>
    );
  }
}
