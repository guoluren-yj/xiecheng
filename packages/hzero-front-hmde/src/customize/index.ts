/**
 * hlod 导入
 * @author WY <yang.wang06@hand-china.com>
 * @creationDate 2020/1/13
 * @copyright HAND ® 2020
 */

import React from 'react';

import { componentMapCustomizeBuilder, FeatureMapStore } from 'utils/customize/helpers';

/**
 * Hgat 组件没有加载成功
 * @param componentCode
 * @returns {*}
 * @constructor
 */
const ComponentNotLoad: React.FC<{ componentCode: string }> = () => {
  return null;
};
/**
 * Hgat 组件加载中
 * @returns {null}
 * @constructor
 */
const ComponentLoading = () => {
  return null;
};

interface SharedComponentProps {
  componentCode: string;
  componentProps: any;
}

interface CustomizeComponent {
  setComponent: (componentCode: string, factory: any) => FeatureMapStore;
  SharedComponent: (
    props: SharedComponentProps
  ) => React.FunctionComponentElement<React.SuspenseProps & any>;
}

const customizeComponent: CustomizeComponent = componentMapCustomizeBuilder('hmde', 'component', {
  NotFound: ComponentNotLoad,
  Loading: ComponentLoading,
});

const { SharedComponent } = customizeComponent;

export { SharedComponent };
