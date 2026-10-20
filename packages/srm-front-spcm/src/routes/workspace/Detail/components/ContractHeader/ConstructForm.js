import React from 'react';
import {
  TextField,
  Select,
  Lov,
  Switch,
  DatePicker,
  TextArea,
  Output,
  CheckBox,
  NumberField,
  SecretField,
} from 'choerodon-ui/pro';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import { yesOrNoRender } from 'utils/renderer';
import AISvg from '@/routes/components/AISvg';

// import { getLovTransformValue } from '../../utils/utils';

export default function ConstructForm(props) {
  const { formType, isEdit, headerProps = {}, aiIconFieldCode, ...rest } = props;
  const { remoteWorkDetail } = headerProps;
  const { name, dataSet } = rest;
  let otherProps = rest;
  if (!isEdit) {
    return (
      <Output
        {...otherProps}
        renderer={({ value, text, record }) => {
          const newName = aiIconFieldCode || name?.replace('Lov', '');
          const diffFlag = record?.get(`${newName}DiffFlag`);
          // 取智能提取的数据
          const diffValue = record?.get(`${newName}DiffValue`);
          if (!diffFlag) {
            return otherProps?.renderer?.({ value, text, record }) || text;
          }
          if (formType === 'CheckBox') {
            return <AISvg diffFlag={diffFlag}>{yesOrNoRender(value)}</AISvg>;
          }
          return (
            <AISvg diffFlag={diffFlag} text={text} diffValue={diffValue}>
              {otherProps?.renderer?.({ value, text, record }) || text}
            </AISvg>
          );
        }}
      />
    );
  }
  if (dataSet?.current) {
    const oldName = name?.replace('Lov', '');
    const newName = aiIconFieldCode || oldName;
    const diffFlag = dataSet?.current.get(`${newName}DiffFlag`);
    // 取智能提取出来的数据
    const diffValue = dataSet?.current.get(`${newName}DiffValue`);
    let text = dataSet?.current.get(`${newName}`);
    if (diffFlag) {
      dataSet.setState(`${oldName}-AiIconFieldCode`, newName);
      if (moment.isMoment(text) && formType === 'DatePicker') {
        text = moment(text).format(DEFAULT_DATE_FORMAT);
      }
      otherProps = Object.assign(otherProps, {
        prefix: <AISvg isInner diffFlag={diffFlag} text={text} diffValue={diffValue} />,
      });
    }
  }
  let refactorForm;
  switch (formType) {
    case 'TextField':
      refactorForm = <TextField {...otherProps} />;
      break;
    case 'Select':
      refactorForm = <Select {...otherProps} />;
      break;
    case 'Lov':
      refactorForm = <Lov {...otherProps} />;
      break;
    case 'Switch':
      refactorForm = <Switch {...otherProps} />;
      break;
    case 'DatePicker':
      refactorForm = <DatePicker {...otherProps} />;
      break;
    case 'TextArea':
      refactorForm = <TextArea {...otherProps} />;
      break;
    case 'DateTimePicker':
      refactorForm = <DatePicker {...otherProps} mode="dateTime" />;
      break;
    case 'SupplierLov':
      refactorForm = <SupplierLov {...otherProps} />;
      break;
    case 'CheckBox':
      refactorForm = <CheckBox {...otherProps} />;
      break;
    case 'NumberField':
      refactorForm = <NumberField {...otherProps} />;
      break;
    case 'SecretField':
      refactorForm = <SecretField {...otherProps} />;
      break;
    default:
      refactorForm = <Output {...otherProps} />;
      break;
  }
  return remoteWorkDetail
    ? remoteWorkDetail.process(`SPCM_WORKSPACE_DETAIL_HEADER_FORM_ITEM_${name}`, refactorForm, {
        props,
      })
    : refactorForm;
}
