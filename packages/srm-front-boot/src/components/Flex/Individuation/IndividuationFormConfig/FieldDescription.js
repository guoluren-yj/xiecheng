import React, { PureComponent } from 'react';
import { Icon, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import TLEditor from 'components/TLEditor';

@Form.create({ fieldNameProp: null })
export default class FieldDescription extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      editable: false,
    };
  }

  componentDidUpdate() {}

  @Bind()
  handleOnClick(e) {
    e.stopPropagation();
    const { disabled } = this.props;
    if (!disabled) {
      this.setState({
        editable: true,
      });
    }
  }

  @Bind()
  cancel(e) {
    e.stopPropagation();
    const { onFieldDescriptionChange = () => {}, form = {} } = this.props;
    const { getFieldsValue = () => {} } = form;
    if (e.type === 'click' || (e.type === 'keydown' && e.keyCode === 13)) {
      onFieldDescriptionChange(getFieldsValue());
      this.setState({
        editable: false,
      });
    }
  }

  render() {
    const { editable } = this.state;
    const { form = {}, value, color } = this.props;
    const { getFieldDecorator = () => {} } = form;
    return editable ? (
      <span onClick={e => e.stopPropagation()}>
        {getFieldDecorator('fieldDescription', {
          initialValue: value,
        })(
          <TLEditor
            label={value}
            field="fieldDescription"
            inputSize={{ zh: 64, en: 64 }}
            onKeyDown={this.cancel}
            style={{ width: 140 }}
            onClick={e => e.stopPropagation()}
            // token={_token}
          />
        )}
        <Icon style={{ marginLeft: 8 }} onClick={this.cancel} type="check" />
      </span>
    ) : (
      <span style={{ color }}>
        {value}
        <Icon style={{ marginLeft: 8 }} onClick={this.handleOnClick} type="edit" />
      </span>
    );
  }
}
