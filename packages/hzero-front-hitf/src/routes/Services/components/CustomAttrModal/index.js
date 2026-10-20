/**
 * 自定义属性弹窗（服务和接口公用）
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2021/8/23
 * @copyright HAND ® 2021
 */
import React from 'react';
import { Divider } from 'choerodon-ui';
import { Form, TextField, DataSet, Button, Output, Switch } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import uuid from 'uuid/v4';
import getLang from '@/langs/serviceLang';
import { basicFormDS, paramFormDS } from '@/stores/Services/customAttrDS';
import TextAreaPopover from '@/components/TextAreaPopover';

class CustomAttrModal extends React.Component {
  constructor(props) {
    super(props);
    this.basicFormDS = new DataSet(basicFormDS());
    this.state = {
      uuids: [],
    };
  }

  componentDidMount() {
    const { customParamsData = {} } = this.props;
    const { customParams = '[]', ...others } = customParamsData;
    this.handleLoadParamFormData(JSON.parse(customParams));
    this.basicFormDS.create(others);
    this.updateModalProps();
  }

  /**
   * 加载paramFormDS数据
   */
  @Bind()
  handleLoadParamFormData(data = []) {
    this.paramFormDS = new DataSet(paramFormDS());
    let formatedData = {};
    const uuids = [];
    data.forEach((param) => {
      const { key, value } = param;
      const id = uuid();
      uuids.push(id);
      this._addField(id);
      formatedData = {
        ...formatedData,
        [`key_${id}`]: key,
        [`value_${id}`]: value,
      };
    });
    this.paramFormDS.create(formatedData);
    this.setState({ uuids });
  }

  @Bind()
  updateModalProps() {
    this.props.modal.update({
      onOk: this.handleOk,
    });
  }

  @Bind()
  async handleOk() {
    const validates = await Promise.all([this.basicFormDS.validate(), this.paramFormDS.validate()]);
    if (validates.includes(false)) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const { onSetCustomParams = () => {} } = this.props;
    const { customParamsFlag } = this.basicFormDS.current.toData();
    const customParams = this.getData();
    onSetCustomParams({ customParamsFlag, customParams: JSON.stringify(customParams) });
    return true;
  }

  /**
   * 获取数据
   */
  @Bind()
  getData() {
    const { uuids } = this.state;
    const data = [];
    uuids.forEach((id) => {
      const key = this.paramFormDS.current.get(`key_${id}`);
      const value = this.paramFormDS.current.get(`value_${id}`);
      data.push({ key, value });
    });
    return data;
  }

  _addField(id) {
    this.paramFormDS.addField(`key_${id}`, {
      label: getLang('ATTR_NAME'),
      type: 'string',
      validator: (_value, _name, _record) => {
        if (_record?.get(`isExist_${id}`)) {
          return getLang('ATTR_NAME_VALIDATE');
        }
        return true;
      },
      dynamicProps: {
        required: ({ record }) => !record.get(`isDeleted_${id}`),
      },
    });
    this.paramFormDS.addField(`value_${id}`, {
      label: getLang('ATTR_VALUE'),
      type: 'string',
      dynamicProps: {
        required: ({ record }) => !record.get(`isDeleted_${id}`),
      },
    });
  }

  /**
   * 添加子表单
   */
  @Bind()
  handleAddFormItem() {
    const { uuids } = this.state;
    const id = uuid();
    this._addField(id);
    this.setState({ uuids: [...uuids, id] });
  }

  @Bind()
  handleKeyChange(value, id) {
    const { uuids } = this.state;
    const data = uuids
      .filter((item) => item !== id)
      .map((item) => this.paramFormDS.current.get(`key_${item}`));
    if (data.includes(value)) {
      this.paramFormDS.current.set(`isExist_${id}`, true);
    } else {
      this.paramFormDS.current.set(`isExist_${id}`, false);
    }
  }

  /**
   * 添加单行formItem
   */
  @Bind()
  renderFormItem() {
    const { uuids } = this.state;
    const formItems = [];
    uuids.forEach((id) => {
      formItems.push(
        <TextField
          name={`key_${id}`}
          colSpan={11}
          onChange={(val) => this.handleKeyChange(val, id)}
        />
      );
      formItems.push(
        <Output key={`equal_${id}`} renderer={() => <div style={{ textAlign: 'center' }}>=</div>} />
      );
      formItems.push(<TextField name={`value_${id}`} colSpan={11} />);
      formItems.push(
        <Button
          funcType="flat"
          icon="delete_forever"
          key={`delete_${id}`}
          onClick={() => this.handleDeleteParam(id)}
        />
      );
    });
    return formItems;
  }

  @Bind()
  handleDeleteParam(id) {
    const { uuids } = this.state;
    const temps = uuids.filter((item) => item !== id);
    this.paramFormDS.current.set(`isDeleted_${id}`, true);
    this.setState({ uuids: temps });
  }

  @Bind()
  handleClearParam() {
    this.paramFormDS = new DataSet(paramFormDS());
    this.setState({ uuids: [] });
  }

  /**
   * 批量录入
   */
  @Bind()
  handleBatchInput(data) {
    this.handleLoadParamFormData(data);
  }

  render() {
    const { readOnly } = this.props;
    const Content = (
      <>
        {!readOnly && (
          <div style={{ marginBottom: '5px' }}>
            <Button
              key="addParam"
              funcType="flat"
              icon="add"
              color="primary"
              onClick={this.handleAddFormItem}
            >
              {getLang('ADD_ATTR')}
            </Button>
            <Button
              key="clearParam"
              funcType="flat"
              icon="clear_all"
              color="default"
              onClick={this.handleClearParam}
            >
              {getLang('CLEAR_ATTR')}
            </Button>
            <div style={{ float: 'right' }}>
              <TextAreaPopover onGetdata={this.getData} onCallback={this.handleBatchInput} />
            </div>
            <div style={{ clear: 'both' }} />
          </div>
        )}
        <Form
          dataSet={this.paramFormDS}
          columns={24}
          labelLayout="placeholder"
          useColon={false}
          disabled={readOnly}
        >
          {this.renderFormItem()}
        </Form>
      </>
    );
    return (
      <>
        <Form disabled={readOnly} dataSet={this.basicFormDS} labelWidth={130}>
          <Switch name="customParamsFlag" />
        </Form>
        <Divider />
        {Content}
      </>
    );
  }
}
export default CustomAttrModal;
