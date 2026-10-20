import { cloneElement } from 'react';
import { ComponentNames, ComponentMap } from './types';

export default function renderDynamicFormItem(renderOptions, renderProps) {
  const renderComponent = () => {
    const { componentType = ComponentNames.TEXT_FIELD } = renderOptions;
    const { name, record, dataSet } = renderProps;
    if (!ComponentMap[componentType]) return '-';

    const component = ComponentMap[componentType];
    return cloneElement(component, {
      ...renderProps,
      name,
      record,
      dataSet,
    });
  };
  return renderComponent();
}
