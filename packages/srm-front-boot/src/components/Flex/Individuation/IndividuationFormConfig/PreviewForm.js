import React from 'react';
import { omit, isNumber, groupBy, isFunction } from 'lodash';
import { Form, Input, Checkbox, Row, Col, Select, Switch, InputNumber, DatePicker } from 'hzero-ui';
import moment from 'moment';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
import HzeroSwitch from 'components/Switch';

const FormItem = Form.Item;
const { Option } = Select;

function getFormItemComponent(formItemType, form = {}) {
  const { getFieldDecorator = () => {} } = form;
  const defaultFormItems = {
    INPUT: ({ formItemProps = {}, fieldName, itemPropsOptions, itemProps }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(fieldName, itemPropsOptions)(<Input {...itemProps} />)}
      </FormItem>
    ),
    INPUTNUMBER: ({ formItemProps = {}, fieldName, itemPropsOptions, itemProps }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(fieldName, itemPropsOptions)(<InputNumber {...itemProps} />)}
      </FormItem>
    ),
    CHECKBOX: ({ formItemProps = {}, fieldName, itemPropsOptions, itemProps }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(fieldName, itemPropsOptions)(<Checkbox {...itemProps} />)}
      </FormItem>
    ),
    SWITCH: ({ formItemProps = {}, fieldName, itemPropsOptions, itemProps }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(fieldName, itemPropsOptions)(<Switch {...itemProps} />)}
      </FormItem>
    ),
    LOV: ({ formItemProps = {}, fieldName, itemPropsOptions, itemProps }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(fieldName, itemPropsOptions)(<Lov {...itemProps} />)}
      </FormItem>
    ),
    TLEDITOR: ({ formItemProps = {}, fieldName, itemPropsOptions, itemProps }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(fieldName, itemPropsOptions)(<TLEditor {...itemProps} />)}
      </FormItem>
    ),
    SELECT: ({ formItemProps = {}, fieldName, itemPropsOptions, itemProps, dataSource = [] }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(fieldName, itemPropsOptions)(
          <Select {...itemProps}>
            {dataSource.map(n => (
              <Option key={n.value} value={n.value}>
                {n.description}
              </Option>
            ))}
          </Select>
        )}
      </FormItem>
    ),
    DATEPICKER: ({ formItemProps = {}, fieldName, itemPropsOptions, itemProps }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(fieldName, {
          ...itemPropsOptions,
          initialValue: itemPropsOptions.initialValue
            ? moment(itemPropsOptions.initialValue)
            : undefined,
        })(<DatePicker {...itemProps} />)}
      </FormItem>
    ),
    HZEROSWITCH: ({ formItemProps = {}, fieldName, itemPropsOptions, itemProps }) => (
      <FormItem {...formItemProps}>
        {getFieldDecorator(fieldName, itemPropsOptions)(<HzeroSwitch {...itemProps} />)}
      </FormItem>
    ),
  };

  const item = defaultFormItems[(formItemType || '').toUpperCase()];
  return isFunction(item) ? item : null;
}

function assignIndividuationSchemaLayout(individuationSchema = {}, dataSource) {
  const newIndividuationSchema = individuationSchema;
  let flatIndividuationSchema = [];
  Object.keys(individuationSchema).forEach(n => {
    flatIndividuationSchema = flatIndividuationSchema.concat(
      ...individuationSchema[n].children.map(o => ({ ...o, row: Number(n) }))
    );
  });

  const individuationSchemaGroup = groupBy(
    flatIndividuationSchema.map(n => {
      const { fieldProps = {} } = dataSource.find(o => o.fieldName === n.fieldName) || {};
      const { row, col } = fieldProps;
      return { ...n, row: isNumber(row) ? row : n.row, index: isNumber(col) ? col : n.index };
    }),
    'row'
  );
  Object.keys(newIndividuationSchema).forEach(n => {
    newIndividuationSchema[n].children = (individuationSchemaGroup[n] || []).sort(
      (a, b) => a.index - b.index
    );
  });

  return newIndividuationSchema;
}

@Form.create({ fieldNameProp: null })
export default class PreviewForm extends React.Component {
  render() {
    const { children, individuationSchema, dataSource, formComponentObject, ...rest } = this.props;
    const { form = {} } = rest;
    // const { getFieldDecorator = () => {} } = form;
    const newChildren = [];
    const newIndividuationSchema = assignIndividuationSchemaLayout(individuationSchema, dataSource);

    Object.keys(newIndividuationSchema).forEach(n => {
      newChildren.push(
        <Row {...newIndividuationSchema[n].props}>
          {(newIndividuationSchema[n].children || []).map(o => {
            const Item = getFormItemComponent(o.fieldType, form);
            const { fieldDescription, fieldEnabledFlag, fieldProps = {} } =
              dataSource.find(m => m.fieldName === o.fieldName) || {};
            const formItemProps = {
              ...o.formItemProps,
              label: fieldDescription || o.formItemProps.label,
            };

            const newFieldEnabledFlag = isNumber(fieldEnabledFlag) ? fieldEnabledFlag : 1;
            const { required } = fieldProps;
            const itemPropsOptions = {
              ...o.itemPropsOptions,
              rules: ((o.itemPropsOptions || {}).rules || []).concat({
                required,
                message: intl.get('hzero.common.validation.notNull', {
                  name: fieldDescription,
                }),
              }),
            };
            const itemProps = {
              ...o.itemProps,
              ...omit(fieldProps, ['row', 'col']),
            };
            if (o.fieldType === 'Select') {
              itemProps.dataSource = o.dataSource;
            }
            return (
              newFieldEnabledFlag === 1 &&
              Item && (
                <Col {...o.colProps}>
                  <Item
                    {...itemProps}
                    formItemProps={formItemProps}
                    form={form}
                    fieldName={o.fieldName}
                    itemProps={itemProps}
                    itemPropsOptions={itemPropsOptions}
                  />
                </Col>
              )
            );
          })}
        </Row>
      );
    });

    return <Form {...rest}>{newChildren}</Form>;
  }
}
