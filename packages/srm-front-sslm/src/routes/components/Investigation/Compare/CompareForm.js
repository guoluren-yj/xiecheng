/*
 * @Date: 2022-06-09 15:03:23
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { isFunction } from 'lodash';
import { handleCompareRender } from '../../utils';

const Index = ({ dataSet, columns, getFieldProps = () => {} }) => {
  const fields = columns.map(column => {
    const { fieldCode, componentType: type } = column;
    const fieldProps =
      getFieldProps({ currentRecord: dataSet && dataSet.current, fieldName: fieldCode, type }) ||
      {};
    const { renderer: cuzRenderer, ...otherProps } = fieldProps;
    let cuzRendererFlag = false;
    if (isFunction(cuzRenderer)) {
      cuzRendererFlag = true;
    }
    return {
      name: fieldCode,
      renderer: ({ value, record, name }) =>
        cuzRendererFlag
          ? cuzRenderer({ value, record, name })
          : handleCompareRender({ value, record, name, type }),
      ...otherProps,
    };
  });

  return (
    <Form
      columns={3}
      dataSet={dataSet}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
    >
      {fields.map(field => (
        <Output {...field} />
      ))}
    </Form>
  );
};

export default Index;
