/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/6/11
 * @copyright HAND ® 2021
 */
import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import {
  DataSet,
  Form,
  TextField,
  Select,
  Spin,
  TextArea,
  Lov,
  NumberField,
  Switch,
  DateTimePicker,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { paramFormDS } from '@/stores/InterfaceMock/InterfaceMockDS';
import getLang from '@/langs/interfaceMockLang';
import { MOCK_TAB_KEYS, PARAM_TYPE_CONSTANT } from '@/constants/constants';

export default class MockDrawer extends React.Component {
  constructor(props) {
    super(props);
    const { mockId, httpParamType, actionType } = props;
    this.paramFormDS = new DataSet(
      paramFormDS({
        mockId,
        httpParamType,
        actionType,
        onFieldUpdate: this.handleFieldUpdate,
      })
    );

    this.state = {
      paramType: PARAM_TYPE_CONSTANT.STRING,
    };
  }

  componentDidMount() {
    const { mockId, mockParamId, parentCode, tenantId, httpParamType, actionType } = this.props;
    if (!isUndefined(mockParamId) && isUndefined(parentCode)) {
      this.handleFetchDetail(mockParamId);
    } else {
      this.paramFormDS.create({ mockId, tenantId, httpParamType, actionType, parentCode });
    }
    this.updateDrawerProps();
  }

  updateDrawerProps() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  @Bind()
  handleFieldUpdate({ name, value }) {
    if (name === 'paramType') {
      this.paramFormDS.current.set('paramValue', undefined);
      this.setState({ paramType: value });
    }
  }

  /**
   * 查询
   */
  async handleFetchDetail(id) {
    this.paramFormDS.setQueryParameter('mockParamId', id);
    await this.paramFormDS.query();
    const { paramType } = this.paramFormDS.current.toData();
    this.setState({ paramType });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const { onRefresh } = this.props;
    const validate = await this.paramFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    return this.paramFormDS.submit().then((res) => {
      if (res && res.success) {
        onRefresh(res.content[0].mockId);
      }
    });
  }

  @Bind()
  handleOptionsFilter(record) {
    const { httpParamType } = this.props;
    const { RAW, FILE } = PARAM_TYPE_CONSTANT;
    const { HEADER, GET, PATH } = MOCK_TAB_KEYS;
    return [RAW, FILE].includes(record.get('value')) || [HEADER, GET, PATH].includes(httpParamType)
      ? record.get('tag') === 'query'
      : true;
  }

  /**
   * 根据不同的类型渲染paramValue组件
   */
  @Bind()
  renderParamTypeFormField() {
    const { paramType } = this.state;
    const { STRING, NUMBER, BOOLEAN, DATE_TIME, OBJECT, ARRAY } = PARAM_TYPE_CONSTANT;

    switch (paramType) {
      case BOOLEAN:
        return <Switch name="paramValue" />;
      case NUMBER:
        return <NumberField name="paramValue" />;
      case DATE_TIME:
        return <DateTimePicker name="paramValue" />;
      case OBJECT:
      case ARRAY:
        return;
      case STRING:
      default:
        return <TextField name="paramValue" />;
    }
  }

  render() {
    const { isNew, httpParamType } = this.props;

    return (
      <Spin dataSet={this.paramFormDS}>
        <Form dataSet={this.paramFormDS}>
          {!isNew && MOCK_TAB_KEYS.BODY === httpParamType && <Lov name="paramLov" />}
          <TextField name="paramName" />
          <Select name="paramType" optionsFilter={this.handleOptionsFilter} />
          <TextField name="paramRule" />
          {this.renderParamTypeFormField()}
          <TextArea name="remark" />
        </Form>
      </Spin>
    );
  }
}
