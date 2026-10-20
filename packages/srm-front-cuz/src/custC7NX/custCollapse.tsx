import React, {
  cloneElement,
  FunctionComponent,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { isEmpty, isArray } from 'lodash';
import { observer } from 'mobx-react';
import { Collapse } from 'choerodon-ui';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import { computeConfig, fieldNameFx } from '../customizeTool';
import Customize, { CustomizeContext } from '../Customize';
import { Tooltip, Icon } from 'choerodon-ui';

type Options = {
  code: string;
  custDefaultActive?: (key: any) => void;
  extPanelHeader?: (key: any) => ReactNode;
};
export default function custCollapse(this: Customize, options: Options, collapse: ReactElement) {
  const { code = '' } = options;
  const { cache, custConfig, contextParams } = this;
  const isIncrement = this.manualQuery === "INCREMENT";
  if (
    isIncrement && (this.state.willUpdateCode || []).includes(code) ||
    !isIncrement && this.manualQuery && this.state.loading
  ) {
    return null;
  }
  if (!code || isEmpty(custConfig[code])) return collapse;

  return (
    <CustomizeContext.Provider value={{ cache, custConfig, contextParams }}>
      <ObserverWrapper component={collapse} options={options} />
    </CustomizeContext.Provider>
  );
}

const ObserverWrapper: FunctionComponent<{
  component: any;
  options: Options;
}> = observer((props) => {
  const { component, options } = props;
  const { code = '', custDefaultActive, extPanelHeader } = options;
  const { defaultActiveKey, children } = component.props;
  const { cache, contextParams: ctxParams, custConfig } = useContext(CustomizeContext);
  const { fields } = useMemo(() => {
    // eslint-disable-next-line no-shadow
    const { fields = [] } = custConfig[code];
    cache[code].init = true;
    cache[code].type = 'collapse';
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
  const defaultActive: string[] = [];
  const originDefaultActive: string[] = [...(defaultActiveKey || [])];
  fields.forEach((field) => {
    if (
      field.defaultActive === 1 ||
      (field.defaultActive === -1 && originDefaultActive.includes(field.fieldCode))
    ) {
      defaultActive.push(field.fieldCode);
    }
  });
  useEffect(() => {
    if (custDefaultActive) custDefaultActive(defaultActive);
  }, defaultActive);
  const childrenMap = {};
  const newChildren: any[] = [];
  if (isArray(children)) {
    children.forEach((i) => {
      // 适配部分使用JSX，另一部分使用数组的情况
      if (isArray(i)) {
        i.forEach((j) => {
          if (j && j.props && j.key !== undefined) {
            childrenMap[j.key] = j;
          }
        });
      } else if (i && i.props && i.key !== undefined) {
        childrenMap[i.key] = i;
      }
    });
  } else if (children && children.props && children.key) {
    childrenMap[children.key] = children;
  }
  const tools = { cache, code, ctxParams };
  fields.forEach((i) => {
    const { fieldName, fieldCode, conditionHeaderDTOs, isStandardField, linkHref, helpMessageConDTO } = i;
    let { visible } = i;
    const condVisible = (conditionHeaderDTOs || []).find((item) => item.conType === 'visible');
    if (condVisible) {
      visible = computeConfig(condVisible, tools);
    }
    const helpMessage = fieldNameFx(tools, helpMessageConDTO) || i.helpMessage;
    let targetPane = childrenMap[fieldCode];
    if (visible === 1 && !isStandardField && !targetPane) {
      const extHeader = <h3>{fieldName}</h3>;
      targetPane = (
        <Collapse.Panel key={fieldCode} header={extHeader} forceRender>
          <EmbedPage href={linkHref} pageData={{ cache }} />
        </Collapse.Panel>
      );
    }
    if (!targetPane) return;
    const paneProps: any = {};
    let oldHeader;
    if (targetPane.props) {
      oldHeader = targetPane.props.header;
      if (typeof oldHeader === 'function') {
        paneProps.header = oldHeader(fieldName);
      } else if (fieldName !== undefined) {
        paneProps.header = extPanelHeader ? extPanelHeader(fieldName) : <h3 style={{display: "inline-block", fontSize: "16px"}}>{fieldName}</h3>;
      }
    }
    if (helpMessage) {
      paneProps.header = (
        <>
          {paneProps.header || oldHeader}
          <Tooltip title={helpMessage}>
            <Icon type="help_outline" style={{color: "#000", fontWeight: 400, fontSize: "16px", verticalAlign: "text-bottom"}} />
          </Tooltip>
        </>
      )
    }
    if (visible !== 0) {
      newChildren.push(cloneElement(targetPane, {
        ...paneProps,
        forceRender: true,
        hidden: visible === 1 ? false : (targetPane.props as any).hidden,
      }));
    }
    delete childrenMap[fieldCode];
  });
  Object.keys(childrenMap).forEach((i) => newChildren.push(childrenMap[i]));
  return cloneElement(component, {
    children: newChildren,
    defaultActiveKey: defaultActive,
  });
});
