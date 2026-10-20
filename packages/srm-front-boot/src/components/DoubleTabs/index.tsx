/* eslint-disable prefer-destructuring */
import type { ReactNode} from 'react';
import React, { useCallback, useMemo } from 'react';
import { Menu, Tabs } from 'choerodon-ui';

const { TabPane } = Tabs;

type DoubleTabsProps = {
  invideLine?: boolean;
  // eslint-disable-next-line no-unused-vars
  onTabChange: (changeKey: string, currentKeys: Array<string | void | Array<string>>, isParent: boolean) => void;
  parentDot?: boolean;
  defaultActiveKeys?: string[];
  activeKeys?: string[];
  parentList?: ParentProps[];
  subList?: SubProps[];
  disableActiveFirst: boolean;
  noChild?: boolean;
}
type DoubleTabsState = {
  parentActiveKey?: string;
  subActiveKey?: string;
  subList: SubProps[];
}
type ParentProps = {
  key: string;
  node: string;
  hidden?: boolean;
  dot?: boolean;
};
type SubProps = {
  key: string;
  node: string;
  parentKey: string;
  hidden?: boolean;
  hiddenNumMark?: 0 | 1 | boolean;
  render?: () => ReactNode;
  num?: number;
};
export default class DoubleTabs extends React.Component<DoubleTabsProps, DoubleTabsState> {

  state = {
    parentActiveKey: undefined,
    subActiveKey: undefined,
    subList: [],
  }

  static defaultProps = {
    invideLine: true,
  }

  tabChange = (key, type) => {
    const { defaultActiveKeys = [], activeKeys, subList = [], disableActiveFirst } = this.props;
    const { parentActiveKey, subActiveKey } = this.state;

    let pKey: string | undefined = parentActiveKey || defaultActiveKeys[0];
    let sKey: string | undefined = subActiveKey || defaultActiveKeys[1];
    let subListKeys;
    if (activeKeys && activeKeys.length === 2) {
      pKey = activeKeys[0];
      sKey = activeKeys[1];
    }
    if (type === "l") {
      pKey = key;
      subListKeys = subList.filter(l => l.parentKey === pKey).map(k => k.key);
      // eslint-disable-next-line no-multi-assign
      if (subListKeys.length === 0) sKey = subListKeys = undefined;
      if (disableActiveFirst) sKey = undefined;
      else sKey = subListKeys[0];
    } else {
      sKey = key;
    }
    this.setState({ parentActiveKey: pKey, subActiveKey: sKey }, () => this.props.onTabChange(key, [pKey, sKey || subListKeys], type === "l"));
  }

  subListHook = (newStateSubList) => {
    this.setState({ subList: newStateSubList });
  }

  render() {
    const {
      props: {
        invideLine,
        defaultActiveKeys = [],
        activeKeys,
        parentList,
        subList,
        parentDot,
        noChild,
      },
      state: {
        parentActiveKey,
        subActiveKey,
        subList: stateSubList,
      },
    } = this;
    let pKey: string | undefined = parentActiveKey || defaultActiveKeys[0];
    let sKey: string | undefined = subActiveKey || defaultActiveKeys[1];
    if (activeKeys && activeKeys.length === 2) {
      pKey = activeKeys[0];
      sKey = activeKeys[1];
    }
    return (
      <div
        className={`double-tabs-tab-container${invideLine ? " invide": ''}`}
      >
        <LeftTab
          dot={parentDot}
          activeKey={pKey}
          list={parentList}
          onChange={this.tabChange}
          defaultActiveKey={defaultActiveKeys && defaultActiveKeys[0]}
        />
        <span
          className={invideLine ? 'double-tabs-invide-line' : 'double-tabs-invide-line-none'}
        />
        <RightTab
          list={subList}
          parentKey={pKey}
          activeKey={sKey}
          subListHook={this.subListHook}
          onChange={this.tabChange}
          defaultActiveKey={defaultActiveKeys && defaultActiveKeys[1]}
        />
        {
          !noChild && (
            <TabsContent
              list={stateSubList}
              activeKey={sKey}
            />
          )
        }
      </div>
    );
  }
}

/**
 * 双tab组件的左侧部分
 * @param {*} props
 */
const LeftTab = (
  props: {
    list?: ParentProps[],
    onChange: Function,
    dot?: boolean,
    activeKey?: string,
    defaultActiveKey?: string,
  }) => {
  const {
    dot,
    activeKey,
    defaultActiveKey,
    list = [],
    onChange,
  } = props;

  const innerChange = useCallback(({ key }) => onChange(key, "l"), []);
  return (
    <div className='double-tabs-left-wrapper'>
      <div className={`double-tabs-left-tab${dot ? ' double-tabs-dot' : ""}`}>
        <Menu
          defaultSelectedKeys={defaultActiveKey ? [defaultActiveKey] : []}
          selectedKeys={activeKey ? [activeKey] : undefined}
          prefixCls="double-tabs" // 该Tab样式重组
          onClick={innerChange}
        >
          {list.map((m) => m.hidden ? null : (
            <Menu.Item key={m.key} title={m.node} className={m.dot ? "dot" : ""}>{m.node}</Menu.Item>
          ))}
        </Menu>
      </div>
    </div>
  );
};

/**
 * 双tab组件的右侧部分
 * @param {*} props
 */
const RightTab = (
  props: {
    list?: SubProps[],
    onChange: Function,
    parentKey?: string;
    activeKey?: string,
    defaultActiveKey?: string,
    subListHook: Function,
  }) => {
  const {
    activeKey,
    parentKey,
    defaultActiveKey,
    list = [],
    onChange,
    subListHook,
  } = props;

  const currentList = useMemo(() => {
    const newList = list.filter(l => l.parentKey === parentKey);
    // 要求不能在页面组件内使用DoubleTabs时，subList不能使用字面量方式创建
    subListHook(newList);
    return newList;
  }, [list, parentKey]);
  const innerChange = useCallback(({ key }) => onChange(key, "r"), []);
  return (
    <div className='double-tabs-right-wrapper'>
      <div className='double-tabs-right-tab'>
        <Menu
          openAnimation="close"
          defaultSelectedKeys={defaultActiveKey ? [defaultActiveKey] : []}
          selectedKeys={activeKey ? [activeKey] : undefined}
          prefixCls="double-tabs" // 该Tab样式重组
          onClick={innerChange}
        >
          {currentList.map((m) => {
            const { key, node, num = 0, hidden, hiddenNumMark } = m;
            if (hidden) return null;
            return (
              <Menu.Item key={key}>
                <span>
                  {node}
                  {hiddenNumMark ? null : (<span className="double-tabs-count">{num > 99 ? "99+" : num}</span>)}
                </span>
              </Menu.Item>
            );
          })}
        </Menu>
      </div>
    </div>
  );
};

const TabsContent = (
  props: {
    list?: SubProps[],
    activeKey?: string,
  }) => {
  const {
    activeKey,
    list = [],
  } = props;

  return (
    <div className='double-tabs-bottom-tab'>
      <Tabs activeKey={activeKey} animated={false}>
        {list.map((m) => {
          const { key, hidden, render = () => undefined } = m;
          if (hidden) return null;
          return (
            <TabPane
              key={key}
              tab={null}
            >
              {render()}
            </TabPane>
          );
        })}
      </Tabs>
    </div>
  );
};