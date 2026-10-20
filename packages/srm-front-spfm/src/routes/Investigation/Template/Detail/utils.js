import React from 'react';
import { Input, InputNumber } from 'hzero-ui';
import lodashResult from 'lodash/result';
import intl from 'utils/intl';
import Upload from 'components/Upload';
import Switch from 'components/Switch';
import ValueList from 'components/ValueList';

// 组件属性配置映射
const ComponentPropsTypeMap = {
  Upload: {
    propsConfig: {
      templateAttachmentUUID: {
        type: 'File',
      },
      viewOnly: {
        type: 'Boolean',
      },
    },
    disabledField: 'viewOnly',
  },
  Input: {
    propsConfig: {
      maxLength: {
        type: 'Number',
        props: {
          min: 0, // 文本框的最大长度是一个自然数（非负整数）
        },
      },
      typeCase: {
        type: 'ValueList',
        props: {
          options: [
            {
              value: 'upper',
              meaning: intl.get(`spfm.investigationDefinition.view.message.upper`).d('转大写'),
            },
            {
              value: 'lower',
              meaning: intl.get(`spfm.investigationDefinition.view.message.lower`).d('转小写'),
            },
            {
              value: 'no',
              meaning: intl.get(`spfm.investigationDefinition.view.message.null`).d('不转换'),
            },
          ],
          style: {
            width: '100%',
          },
        },
      },
    },
  },
};

// 组件类型到组件映射
const ConfigMap = {
  ValueList,
  File: Upload,
  Boolean: Switch,
  Tinyint: Switch,
  String: Input,
  Integer: InputNumber,
  Number: InputNumber,
};

/**
 * getElement - 获取 Input 的 render
 * @param {Object} field - 字段
 */
export function getElement({
  componentType,
  attributeName,
  attributeValueType,
  disabled,
  extraComponentProps: baseExtraComponentProps,
}) {
  const componentTypeConfig = ComponentPropsTypeMap[componentType] || {};

  const propsConfig = lodashResult(componentTypeConfig, `propsConfig.${attributeName}`, {
    type: attributeValueType,
  });

  const ComponentClass = ConfigMap[propsConfig.type] || Input;

  const extraComponentProps = {};
  if (attributeName === 'disabled') {
    extraComponentProps.checkedValue = false;
    extraComponentProps.unCheckedValue = true;
  }
  if (disabled) {
    if (componentTypeConfig.disabledField) {
      return React.createElement(ComponentClass, {
        ...propsConfig.props,
        ...baseExtraComponentProps,
        ...extraComponentProps,
        [componentTypeConfig.disabledField]: false,
      });
    } else {
      return React.createElement(ComponentClass, {
        ...propsConfig.props,
        ...baseExtraComponentProps,
        ...extraComponentProps,
        disabled: false,
      });
    }
  } else {
    return React.createElement(ComponentClass, {
      ...propsConfig.props,
      ...baseExtraComponentProps,
      ...extraComponentProps,
    });
  }
}
