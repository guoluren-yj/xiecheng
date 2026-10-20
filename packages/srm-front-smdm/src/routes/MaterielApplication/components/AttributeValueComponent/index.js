/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-09-21 10:59:39
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-08-15 09:31:49
 */
import React from 'react';
import { isNumber } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { Input, DatePicker, InputNumber } from 'hzero-ui';
import AttributeMultipleSelect from './AttributeMultipleSelect';
import AttributeSelect from './AttributeSelect';

export default (props) => {
  const { recordSource, onChangeRecordSource, ...otherProps } = props;

  const { templateJson } = recordSource;
  const { maintenanceMethod, scale } = JSON.parse(templateJson);

  const renderComponent = () => {
    let component = <div />;
    switch (maintenanceMethod) {
      case 'TEXT':
        component = <Input {...otherProps} />;
        break;
      case 'DATE':
        component = <DatePicker {...otherProps} />;
        break;
      case 'MULTIPLE':
        component = <AttributeMultipleSelect {...props} />;
        break;
      case 'INTEGER':
        component = (
          <InputNumber
            precision={0}
            max={isNumber(scale) ? math.pow(10, scale) - 1 : undefined}
            style={{ width: '100%' }}
            {...otherProps}
          />
        );
        break;
      case 'FLOAT':
        component = <InputNumber precision={scale} style={{ width: '100%' }} {...otherProps} />;
        break;
      default:
        component = <AttributeSelect {...props} />;
        break;
    }
    return component;
  };

  return <>{renderComponent()}</>;
};
