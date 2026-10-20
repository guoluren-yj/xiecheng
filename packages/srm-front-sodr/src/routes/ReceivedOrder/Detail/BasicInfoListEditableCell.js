import React, { PureComponent } from 'react';
import { Form, Input } from 'hzero-ui';
import { isFunction, toSafeInteger } from 'lodash';

const FormItem = Form.Item;
const { TextArea } = Input;

export default class EditableCell extends PureComponent {
  constructor(props) {
    super(props);
    this.getFormItem = this.getFormItem.bind(this);
    // this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    // document.addEventListener('click', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    // document.removeEventListener('click', this.handleClickOutside, true);
  }

  // handleClickOutside(e) {
  //   const { form: { validateFields = o => o } } = this.props;
  //   if (
  //     this.cell !== e.target &&
  //     (this.cell && isFunction(this.cell.contains)) &&
  //     !this.cell.contains(e.target)
  //   ) {
  //     validateFields();
  //   }
  // }
  parserSort(value) {
    return toSafeInteger(value);
  }

  onRemarkBlur() {
    const {
      form: { getFieldValue = e => e },
      saveRowData = e => e,
      record,
    } = this.props;
    saveRowData({ ...record, remark: getFieldValue('remark') });
  }

  getFormItem() {
    const {
      form: { getFieldDecorator = e => e },
      dataIndex,
      record,
      text,
    } = this.props;
    const defaultFormItem = {
      remark: () => (
        <FormItem style={{ marginBottom: 0 }}>
          {getFieldDecorator(dataIndex, {
            initialValue: record[dataIndex],
          })(<TextArea onBlur={this.onRemarkBlur.bind(this)} style={{ resize: 'horizontal' }} />)}
        </FormItem>
      ),
    };
    return isFunction(defaultFormItem[dataIndex]) ? defaultFormItem[dataIndex]() : text;
  }

  render() {
    // const { children } = this.props;
    return (
      <div
        ref={node => {
          this.cell = node;
        }}
        className="editable-cell"
      >
        {this.getFormItem()}
      </div>
    );
  }
}
