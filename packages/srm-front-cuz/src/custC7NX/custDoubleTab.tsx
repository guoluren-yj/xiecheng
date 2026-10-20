import { isEmpty } from 'lodash';
import React, { cloneElement, FunctionComponent, ReactElement, useContext, useMemo } from 'react';
import { computeConfig } from '../customizeTool';
import Customize, { CustomizeContext } from '../Customize';

type Options = {
  code: string;
};
export default function custDoubleTab(this: Customize, options: Options, tabs: ReactElement) {
  const { code = '' } = options;
  const { cache, custConfig, contextParams } = this;
  const isIncrement = this.manualQuery === "INCREMENT";
  if (
    isIncrement && (this.state.willUpdateCode || []).includes(code) ||
    !isIncrement && this.manualQuery && this.state.loading
  ) return null;
  if (!code || isEmpty(custConfig[code])) return tabs;
  return (
    <CustomizeContext.Provider value={{ cache, custConfig, contextParams }}>
      <ObserverWrapper component={tabs} options={options} />
    </CustomizeContext.Provider>
  );
}

const ObserverWrapper: FunctionComponent<{
  component: any;
  options: Options;
}> = (props) => {
  const { component, options } = props;
  const { code = '' } = options;
  const { defaultActiveKeys = [], subList = [] } = component.props;
  const { cache, contextParams: ctxParams, custConfig } = useContext(CustomizeContext);
  let newDefaultActiveKeys = defaultActiveKeys;
  const { fields } = useMemo(() => {
    // eslint-disable-next-line no-shadow
    const { fields = [] } = custConfig[code];
    cache[code].init = true;
    cache[code].type = 'tabPane';
    cache[code].getAllValue = () => ({});
    cache[code].getValue = () => undefined;
    // 根据列顺序属性排序
    const newFields = [...fields].sort((before, after) => {
      if (before.seq === undefined && after.seq === undefined) return 0;
      if (before.seq === undefined) return 1;
      if (after.seq === undefined) return -1;
      return before.seq - after.seq;
    });
    return { fields: newFields };
  }, [code, cache && cache[code]]);
  const defaultActive = fields.find((field) => field.defaultActive === 1);
  const childrenMap = {};
  const tools = { cache, code, ctxParams };
  if (subList.length > 0) {
    subList.forEach((i) => {
      if (i && i.key !== undefined) {
        childrenMap[i.key] = i;
      }
    });
  }
  if (defaultActive) {
    newDefaultActiveKeys = [defaultActiveKeys[0], defaultActive.fieldCode];
  }

  const newSubList = useMemo(() => {
    const newChildren: any[] = [];
    fields.forEach((i) => {
      const { fieldName, fieldCode, conditionHeaderDTOs, hiddenNumFlag } = i;
      let { visible } = i;
      const condVisible = (conditionHeaderDTOs || []).find((item) => item.conType === 'visible');
      if (condVisible) {
        visible = computeConfig(condVisible, tools);
      }
      const targetPane = childrenMap[fieldCode];
      if (!targetPane) return;
      if (fieldName !== undefined && targetPane) {
        targetPane.node = fieldName;
      }
      if (visible === 0) {
        targetPane.hidden = true;
      }
      targetPane.hiddenNumFlag = hiddenNumFlag;
      newChildren.push(targetPane);
      delete childrenMap[fieldCode];
    });
    Object.keys(childrenMap).forEach((i) => newChildren.push(childrenMap[i]));
    return newChildren;
  }, [subList]);

  return cloneElement(component, {
    defaultActiveKeys: newDefaultActiveKeys,
    subList: newSubList,
  });
};
