import React, {
  cloneElement,
  FunctionComponent,
  ReactElement,
  useContext,
  useMemo,
  Children,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import Tabs, { TabGroupProps, TabPaneProps } from 'choerodon-ui/lib/tabs';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import { computeConfig } from '../customizeTool';
import Customize, { CustomizeContext } from '../Customize';
import { replace } from './common';

type Options = {
  code: string;
  cascade?: boolean;
  /** 如果传了headerFormCode要确保在当前页面单元组下的头表单始终存在且具有dataSet */
  headerFormCode?: string;
  custDefaultActive?: (key: any, otherInfo: any) => void;
};
export default function custTabPane(this: Customize, options: Options, tabs: ReactElement) {
  const { code = '' } = options;
  const { cache, custConfig, contextParams } = this;
  const isIncrement = this.manualQuery === "INCREMENT";
  if (
    isIncrement && (this.state.willUpdateCode || []).includes(code) ||
    !isIncrement && this.manualQuery && this.state.loading
  ) {
    return null;
  }
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
  const { code = '', cascade, custDefaultActive, headerFormCode } = options;
  const { defaultActiveKey, children, onChange: oldTabChange } = component.props;
  const { cache, contextParams: ctxParams, custConfig } = useContext(CustomizeContext);
  const { fields } = useMemo(() => {
    // eslint-disable-next-line no-shadow
    const { fields = [] } = custConfig[code];
    cache[code].init = true;
    cache[code].type = 'tabPane';
    cache[code].activeKey = observable({ key: { __default__: undefined } });
    cache[code].getAllValue = function () {
      return { activeKey: this.activeKey.key.__default__ };
    };
    cache[code].getValue = function (fieldCode) {
      return this.activeKey.key.__default__ === fieldCode ? fieldCode : undefined;
    };
    // 根据列顺序属性排序
    const newFields = [...fields].sort((before, after) => {
      if (before.seq === undefined && after.seq === undefined) return 0;
      if (before.seq === undefined) return 1;
      if (after.seq === undefined) return -1;
      return before.seq - after.seq;
    });
    return { fields: newFields };
  }, [code, cache && cache[code]]);
  const defaultActive: { __default__?: string; [x: string]: any } = {};
  const tools = { cache, code, ctxParams };

  const onTabChange = useCallback((newKey, oldKey) => {
    if (oldTabChange) {
      oldTabChange(newKey, oldKey);
    }
    cache[code].activeKey.key.__default__ = newKey;
  }, [oldTabChange]);
  const currentHiddenPaneKeys: string[] = [];
  const currentHiddenGroupKeys: string[] = [];

  const groupsMap = new Map<string, ReactElement>();
  const tabsMap = new Map<string, ReactElement>();
  const tabToGroupMap = new Map<string, string>();
  // 将groups和tabs进行分类存取，方便排序和隐藏
  Children.forEach(
    children,
    (c: ReactElement<{ children?: any } & (TabPaneProps | TabGroupProps)>) => {
      if (!c || !c.props || c.key === undefined || c.key === null) return;
      if (cascade) {
        groupsMap.set(String(c.key), c);
        Children.forEach(c.props.children, (i: ReactElement<TabPaneProps>) => {
          if (!i || !i.props || i.key === undefined || i.key === null) return;
          tabsMap.set(String(i.key), i);
          tabToGroupMap.set(String(i.key), String(c.key));
        })
      } else {
        tabsMap.set(String(c.key), c);
      }
    });
  const newGroups: ReactElement[] = [];
  // 分组模式下存储对应group的tab；
  const newGroupTabs = new Map<string, ReactElement[]>();
  const newDefaultTabs: ReactElement[] = [];
  fields.forEach((i) => {
    const { fieldName, fieldCode, conditionHeaderDTOs, linkHref: _href, aggregationCode, aggregationFlag, hiddenNumFlag } = i;
    let { visible } = i;

    const linkHref = _href ? replace(
      _href.match(/{([^{}]*)}/g) || [],
      _href,
      ctxParams.ctx,
      headerFormCode && cache[headerFormCode] && cache[headerFormCode].dataSet ? cache[headerFormCode].dataSet.current : undefined
    ) : undefined;
    const condVisible = (conditionHeaderDTOs || []).find((item) => item.conType === 'visible');
    if (condVisible) {
      visible = computeConfig(condVisible, tools);
    }
    // 优化，按照tab分组设置默认激活
    if(i.defaultActive === 1) {
      // 只要配置了聚合目标字段的，对应的默认激活优先级高于未配置的，若多个配置聚合字段且聚合字段不同的tab设置默认激活，取相对位置最后的一个
      if(aggregationCode && !defaultActive[aggregationCode]) defaultActive.__default__ = defaultActive[aggregationCode] = fieldCode;
      else if(!aggregationCode && !defaultActive.__default__) defaultActive.__default__ = fieldCode;
    }

    if (aggregationFlag) {
      if (visible === 0) {
        groupsMap.delete(fieldCode);
        currentHiddenGroupKeys.push(i.fieldCode);
        return;
      } else if (groupsMap.get(fieldCode)) {
        const oldGroup = groupsMap.get(fieldCode)!;
        newGroups.push(cloneElement(oldGroup, {
          tab: fieldName || oldGroup.props.tab,
          defaultActiveKey: defaultActive[fieldCode] || oldGroup.props.defaultActiveKey,
          hidden: visible === 1 ? false : oldGroup.props.hidden,
        }));
        groupsMap.delete(fieldCode);
      } else if (visible === 1) {
        newGroups.push((<Tabs.TabGroup key={fieldCode} tab={fieldName}/>))
      }
      return;
    }

    if (visible === 0) {
      tabsMap.delete(fieldCode);
      currentHiddenPaneKeys.push(i.fieldCode);
      return;
    } else if (tabsMap.get(fieldCode)) {
      const oldTab = tabsMap.get(fieldCode)!;
      tabsMap.set(fieldCode, cloneElement(oldTab, {
        tab: fieldName || oldTab.props.tab, count: hiddenNumFlag ? undefined : oldTab.props.count,
        hidden: visible === 1 ? false : oldTab.props.hidden,
      }));
    } else if (visible === 1 && !tabsMap.get(fieldCode)) {
      tabsMap.set(fieldCode, (
        <Tabs.TabPane key={fieldCode} tab={fieldName} forceRender>
          <EmbedPage href={linkHref} pageData={{ cache }} />
        </Tabs.TabPane>
      ))
    }

    const tab = tabsMap.get(fieldCode);
    let groupCode;
    if (!aggregationFlag && aggregationCode) {
      groupCode = aggregationCode !== "__no_aggregation__" ? aggregationCode : undefined;
    } else if(tabToGroupMap.get(String(fieldCode))) {
      groupCode = tabToGroupMap.get(String(fieldCode));
    }
    if (tab) {
      if (groupCode) {
        if (!newGroupTabs.get(groupCode)) newGroupTabs.set(groupCode, []);
        newGroupTabs.get(groupCode)!.push(tab);
        if (currentHiddenGroupKeys.includes(groupCode)) currentHiddenPaneKeys.push(fieldCode);
      } else newDefaultTabs.push(tab);
    }
    tabsMap.delete(fieldCode);
  });
  const deps = Object.keys(defaultActive).map(d => `${d}#${defaultActive[d]}`);
  useEffect(() => {
    cache[code].activeKey.key = defaultActive && defaultActive.__default__ ? defaultActive : {__default__: defaultActiveKey};
    if (custDefaultActive)
      // 两个first暂时不加入依赖项
      custDefaultActive(defaultActive.__default__, {
        firstRenderHiddenKeys: currentHiddenPaneKeys,
        firstRenderHiddenGroupKeys: currentHiddenGroupKeys,
        defaultActive,
      });
  }, deps);
  let newChilds: ReactNode[] = [];
  Array.from(tabsMap.values()).forEach(remainTab => {
    // 这时候tabsMap全部是未配置的tab，故存在分组的话肯定会有tabToGroupMap
    const groupCode = tabToGroupMap.get(String(remainTab.key));
    /**
     * 这里先判断存在tab分组编码且分组不是隐藏的
     * 然后又分为两种，一种是个性化配置且能和代码匹配的分组，一种是个性化未配置但代码中存在的分组
     * 只要满足两者之一，就去变更/创建对应分组
     * 不满足的判定为普通tab，在分组模式下，会被放在anonymous分组内
     */
    if(groupCode && !currentHiddenGroupKeys.includes(groupCode)){
      // 个性化配置分组的情况
      if(newGroupTabs.get(groupCode)){
        newGroupTabs.get(groupCode)!.push(remainTab);
      } else if (groupsMap.get(groupCode)) {
        // 个性化未配置分组且未配置Tab的情况
        newGroupTabs.set(groupCode, []).get(groupCode)!.push(remainTab);
        newGroups.push(groupsMap.get(groupCode)!);
        groupsMap.delete(groupCode);
      }
    } else newDefaultTabs.push(remainTab);
    tabsMap.delete(String(remainTab.key));
  });
  newGroups.push(...Array.from(groupsMap.values()));
  if(newGroups.length) {
    newChilds = newGroups.map(group => {
      const subTabs = newGroupTabs.get(String(group.key)) || [];
      return cloneElement(group, {
        children: subTabs,
        defaultActiveKey: defaultActive[String(group.key)] || group.props.defaultActiveKey ||subTabs.length && subTabs[0].key
      });
    });
    if (newDefaultTabs.length) {
      newChilds.push(
        <Tabs.TabGroup key="__anonymous__" tab="anonymous" defaultActiveKey={String(newDefaultTabs[0].key)}>
          {newDefaultTabs}
        </Tabs.TabGroup>
      )
    }
  } else {
    newChilds = newDefaultTabs;
  }

  return cloneElement(component, {
    defaultActiveKey: defaultActive.__default__ || defaultActiveKey,
    children: newChilds,
    customizedCode: code,
    onChange: onTabChange,
  });
});
