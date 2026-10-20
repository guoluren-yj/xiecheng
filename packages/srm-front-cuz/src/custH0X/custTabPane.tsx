import React, {
  Children,
  isValidElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { isEmpty } from 'lodash';
import { cloneElement, FunctionComponent, ReactElement } from 'react';
import { computeConfig } from '../customizeTool';
import Customize, { CustomizeContext } from '../Customize';
import { observer } from 'mobx-react-lite';
import { observable } from 'mobx';
import { TabPane, TabPaneProps } from 'hzero-ui/lib/tabs';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import { replace } from './getComponent';

type Options = {
  code: string;
  /** 如果传了headerFormCode要确保在当前页面单元组下的头表单始终存在且具有dataSource（不能为空） */
  headerFormCode?: string;
  custDefaultActive?: (key: any, otherInfo: any) => void;
};

export default function custTabPane(this: Customize, options: any = {}, tabs: ReactElement) {
  const { code = '' } = options;
  const { custConfig, cache, contextParams } = this;
  if (this.state.loading) return null;
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
}> = observer((props) => {
  const { component, options } = props;
  const { code = '', custDefaultActive, headerFormCode } = options;
  const { defaultActiveKey, children, onChange: oldTabChange } = component.props;
  const { cache, contextParams: ctxParams, custConfig } = useContext(CustomizeContext);
  const { fields } = useMemo(() => {
    // eslint-disable-next-line no-shadow
    const { fields = [] } = custConfig[code];
    cache[code].init = true;
    cache[code].type = 'tabPane';
    cache[code].activeKey = observable({ key: '' });
    cache[code].getAllValue = function () {
      return { activeKey: this.activeKey.key };
    };
    cache[code].getValue = function (fieldCode) {
      return this.activeKey.key === fieldCode ? fieldCode : undefined;
    };
    // 根据列顺序属性排序
    const newFields = [...fields].sort((before, after) => {
      if (before.seq === undefined && after.seq === undefined) return 0;
      if (before.seq === undefined) return 1;
      if (after.seq === undefined) return -1;
      return before.seq - after.seq;
    });
    return { fields: newFields };
  }, []);
  let defaultActive;
  const tools = { cache, code, ctxParams };

  const onTabChange = useCallback((newKey, oldKey) => {
    if (oldTabChange) {
      oldTabChange(newKey, oldKey);
    }
    cache[code].activeKey.key = newKey;
  }, []);
  const currentHiddenPaneKeys: string[] = [];
  const childMapForName = new Map<string, any>();
  Children.forEach(children, (c: ReactElement<{ children?: any } & TabPaneProps>) => {
    if (!c || !c.props || c.key === undefined || c.key === null) return;
    childMapForName.set(String(c.key), c);
  });

  const newChilds: ReactNode[] = [];
  fields.forEach((i, index) => {
    const { fieldName, fieldCode, conditionHeaderDTOs, linkHref: _href } = i;
    let { visible } = i;
    const linkHref = _href ? replace(
      _href.match(/{([^{}]*)}/g) || [],
      headerFormCode && cache[headerFormCode].dataSource || {},
      _href,
      ctxParams.ctx
    ) : undefined;
    const newProps: any = {
      hiddenNumFlag: i.hiddenNumFlag,
    };
    const condVisible = (conditionHeaderDTOs || []).find((item) => item.conType === 'visible');
    if (condVisible) {
      visible = computeConfig(condVisible, tools);
    }
    if (visible === 0) {
      currentHiddenPaneKeys.push(i.fieldCode);
      childMapForName.delete(fieldCode);
      return;
    }
    if (!defaultActive && i.defaultActive === 1) defaultActive = fieldCode;
    let tab = childMapForName.get(fieldCode);
    if (!tab && visible === 1) {
      tab = (
        <TabPane key={fieldCode} forceRender>
          <EmbedPage href={linkHref} pageData={{ cache }} />
        </TabPane>
      )
    }
    newChilds[index] = isValidElement(tab)
      ? cloneElement<any>(tab, {
        ...newProps,
        tab: fieldName || (tab.props as any).tab,
        customizeKey: `${fieldCode}${index}${defaultActive === fieldCode}`,
        hidden: visible === 1 ? false : (tab.props as any).hidden,
      })
      : tab;
    childMapForName.delete(fieldCode);
  });
  useEffect(() => {
    cache[code].activeKey.key = defaultActive || defaultActiveKey;
    if (custDefaultActive)
      custDefaultActive(defaultActive, {
        firstRenderHiddenKeys: currentHiddenPaneKeys,
      });
  }, [defaultActive]);

  return cloneElement(component, {
    defaultActiveKey: defaultActive || defaultActiveKey,
    children: newChilds.concat(Array.from(childMapForName.values())),
    customizedCode: code,
    onChange: onTabChange,
  });
});
