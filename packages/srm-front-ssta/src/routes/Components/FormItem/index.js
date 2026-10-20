import { memo, createElement } from 'react';
import {
  Output,
  Lov,
  TextField,
  TextArea,
  Select,
  NumberField,
  DatePicker,
  Attachment,
  SelectBox,
  IntlField,
  CheckBox,
} from 'choerodon-ui/pro';
import { isUndefined } from 'lodash';

const editorMap = {
  textfield: TextField,
  textarea: TextArea,
  lov: Lov,
  select: Select,
  numberfield: NumberField,
  datepicker: DatePicker,
  attachment: Attachment,
  selectbox: SelectBox,
  intlfield: IntlField,
  checkbox: CheckBox,
};

const FormItem = memo((props) => {
  const { editor = 'textfield', editable, disabled, autoRef, ...otherProps } = props;

  // 禁用取editable和disabled的并，编辑取isEditable和editable和disabled的或
  const isDisabled = !isUndefined(editable) ? editable && disabled : disabled;
  const isEditable = editable || isDisabled;

  if (!isEditable) {
    // 添加属性用来判断output已适配组件去除*必输符号
    FormItem.__PRO_OUTPUT = true;
    FormItem.displayName = 'Output';
  }

  if (props.help) {
    FormItem.defaultProps = {
      showHelp: isEditable ? 'tooltip' : 'label',
    };
  }
  const refProps = props.autoRef ? { ref: props.autoRef } : {};

  return isEditable
    ? createElement(editorMap[editor] || TextField, {
        ...otherProps,
        disabled: isDisabled,
        ...refProps,
      })
    : createElement(Output, otherProps);
});

export default FormItem;
