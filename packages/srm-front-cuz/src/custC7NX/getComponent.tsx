import React, { Component } from 'react';
import {
  TextField,
  Switch,
  Select,
  CheckBox,
  TextArea,
  Lov,
  DatePicker,
  Currency,
  Rate,
  Attachment,
  SelectBox,
  Output,
  TelField,
  EmailField,
} from 'choerodon-ui/pro';
// @ts-ignore
/** NumberField及其样式单独引入，解决页面无标准数字字段时样式缺失问题 */
import NumberField from 'choerodon-ui/pro/lib/number-field';
import 'choerodon-ui/pro/lib/number-field/style';
import { ComponentGenProps } from './interface';
import { isString } from 'lodash';
import { FlexLink } from './FlexLink';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

/**
 * 根据类型参数生成不同的表单组件
 * @param type 组件类型
 */
export default function getComponent(type): (p: ComponentGenProps) => any {
  let Component: any = null;
  switch (type) {
    case 'EMPTY':
      Component = () => <div />;
      break;
    case 'INPUT':
      Component = (props) => <TextField {...props} />;
      break;
    case 'CURRENCY':
      Component = (props) => <Currency {...props} />;
      break;
    case 'CURRENCY':
      Component = (props) => <Currency {...props} />;
      break;
    case 'INPUT_NUMBER':
      Component = (props) => <NumberField {...props} />;
      break;
    case 'SELECT':
      Component = (props) => <Select {...props} />;
      break;
    case 'RADIOGROUP':
      Component = (props) => <SelectBox {...props} />;
      break;
    case 'CHECKBOX':
      Component = (props) => <CheckBox {...props} unCheckedValue={0} checkedValue={1} />;
      break;
    case 'SWITCH':
      Component = (props) => <Switch {...props} unCheckedValue={0} checkedValue={1} />;
      break;
    case 'LOV':
      Component = (props) => <Lov {...props} tableProps={{ mode: "tree" }} />;
      break;
    case 'DATE_PICKER':
      Component = (props) => <DatePicker {...props} />;
      break;
    case 'UPLOAD':
      Component = (props) => <Attachment {...props} />;
      break;
    // case 'TL_EDITOR':
    //   Component = FlexIntlField;
    //   break;
    case 'TEXT_AREA':
      Component = (props) => <TextArea {...props} />;
      break;
    case 'LINK':
      Component = (props) => <FlexLink {...props} />;
      break;
    case 'RATE':
      Component = (props) => <Rate {...props} />;
      break;
    case 'TEL_FIELD':
      Component = (props) => {
        return (
          <TelFieldCUX {...props} />
        )
      }
      // Component = (props) => <TelField {...props} />;
      break;
    case 'EMAIL_FIELD':
      Component = (props) => <EmailField {...props} />;
      break;  
    default:
      Component = (props) => <TextField {...props} />;
  }
  return Component;
}


class TelFieldCUX extends Component {
  inputRef: any;
  wrapperaRef: any;

  searchMatcher({ record, text, textField, valueField }) {
    const textValue = record.get(textField);
    const value = record.get(valueField);
     return (isString(textValue) ? textValue.toLowerCase() : textValue)?.indexOf(text.toLowerCase()) !== -1
      || (isString(value) ? value.toLowerCase() : value)?.indexOf(text.toLowerCase()) !== -1;
  }

  render() {
    const props: any = this.props;
    return (
      <Output
       {...props}
        className='srm-tel-field-group'
        name={props.name}
        ref={ref => this.wrapperaRef = ref}
        labelLayout={LabelLayout.none}
        onFocus={() => {
          this.inputRef && this.inputRef.focus();
        }}
        renderer={({ record, dataSet }) => {
          return (
            <div className='srm-tel-field'>
              <Select
                disabled={props.disabled}
                record={record!}
                dataSet={dataSet!}
                readOnly={props.readOnly}
                label={undefined}
                onFocus={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                }}
                clearButton={false}
                isFlat
                name={`${props.name}TelCode`}
                searchable
                searchFieldInPopup
                searchFieldProps={{
                  onFocus: (event) => {
                    event.stopPropagation();
                  }
                }}
                searchMatcher={this.searchMatcher}
              />
              <TextField {...props} record={record!} dataSet={dataSet!} ref={ref => this.inputRef = ref} name={props.name} />
            </div>
          );
        }}
      />
    )   
  }
 
}