import React, {
  cloneElement,
  CSSProperties,
  FunctionComponent,
  JSXElementConstructor,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { Button as C7NButton, Icon, Tooltip } from 'choerodon-ui';
import { computeConfig, fieldNameFx } from '../customizeTool';
import Customize, { CustomizeContext } from '../Customize';
import EventCenter from '../components/EventCenter';
import ProxyExport from '../components/ProxyExport/ProxyExport';
import { FieldPlainMap, parseNest, setColumnParent, toNest } from './common';
import { helpNodeStyle } from '../utils/constConfig';
import { useComputed } from './hooks';

type Options = {
  code: string;
  pro?: boolean;
  btnType?: 'c7n-pro' | 'h0' | 'c7n';
};
export default function custBtnGroup(
  this: Customize,
  options: Options,
  btnGroup: ReactElement[] | ReactElement
) {
  const { code = '', pro } = options;
  const { cache, custConfig, contextParams } = this;
  const isIncrement = this.manualQuery === "INCREMENT";
  if (
    isIncrement && (this.state.willUpdateCode || []).includes(code) ||
    !isIncrement && this.manualQuery && this.state.loading
  ) return btnGroup;
  if (!code || isEmpty(custConfig[code])) return btnGroup;

  return pro ? (
    <CustomizeContext.Provider value={{ cache, custConfig, contextParams }}>
      <ObserverWrapperPro component={btnGroup as ReactElement} options={options} />
    </CustomizeContext.Provider>
  ) : (
    <CustomizeContext.Provider value={{ cache, custConfig, contextParams }}>
      <ObserverWrapper component={btnGroup as ReactElement[]} options={options} />
    </CustomizeContext.Provider>
  );
}

const ObserverWrapper: FunctionComponent<{
  component: any[];
  options: Options;
}> = observer((props) => {
  const { component, options } = props;
  const { code = '' } = options;
  const { cache, contextParams: ctxParams, custConfig } = useContext(CustomizeContext);
  const [loadingStatus, setLoadingStatus] = useState({});
  const { fields } = useMemo(() => {
    // eslint-disable-next-line no-shadow
    const { fields = [] } = custConfig[code];
    cache[code].getAllValue = () => ({});
    cache[code].getValue = () => undefined;
    cache[code].type = 'btnGroup';
    cache[code].init = true;
    cache[code].eventCenter = new EventCenter({ unitCode: code });
    const newFields = [...fields].sort((p, n) => (p.seq || 999) - (n.seq || 999));
    cache[code].btnEvents = {};
    return { fields: newFields };
  }, [code, cache && cache[code]]);

  const childrenMap = {};
  const newChildren: any[] = [];
  component.forEach((i) => {
    if (i && i.props && (i.props.name !== undefined || i.props['data-name'])) {
      const name = i.props['data-name'] || i.props.name;
      childrenMap[name] = i;
    }
  });
  const tools = { cache, code, ctxParams };
  fields.forEach((i) => {
    // mode = "cover",
    const { fieldName, fieldCode, conditionHeaderDTOs, eventCode = fieldCode, helpMessage } = i;
    let { visible } = i;
    const condVisible = (conditionHeaderDTOs || []).find((item) => item.conType === 'visible');
    if (condVisible) {
      visible = computeConfig(condVisible, tools);
    }
    const btn = childrenMap[fieldCode];
    if (visible === 0) {
      delete childrenMap[fieldCode];
      return;
    }
    const helpNode = helpMessage ? (
      <Tooltip title={helpMessage}>
        <Icon type="help" style={helpNodeStyle as CSSProperties} className="cusz-help" />
      </Tooltip>
    ) : undefined;
    if (btn) {
      const { /* onClick， */ children } = btn.props;

      let child = children;
      if (typeof children === 'function') {
        child = children(fieldName, helpMessage);
      } else if (fieldName) {
        child = (
          <span>
            {fieldName}
            {helpNode}
          </span>
        );
      } else if (helpNode) {
        child = (
          <span>
            {child}
            {helpNode}
          </span>
        );
      }
      const newProps: any = {
        children: child,
      };

      // if(eventCode){
      //   newProps.onClick = (cache[code].btnEvents[fieldCode]||{}).callback;
      //   if(!newProps.onClick){
      //     // 按照设定，此处只会执行一次
      //     if(mode === "cover"){
      //       newProps.onClick = _e => {
      //         cache[code].eventCenter.emit(eventCode, cache);
      //       }
      //     } else {
      //       newProps.onClick = e => {
      //         onClick(e);
      //         cache[code].eventCenter.emit(eventCode, cache);
      //       }
      //     }
      //     cache[code].btnEvents[fieldCode] = {
      //       eventId: cache[code].eventCenter.on(eventCode),
      //       onClick: newProps.onClick,
      //     };
      //   }
      // }
      newChildren.push(cloneElement(btn, newProps));
    } else if (visible === 1) {
      let onClick: MouseEventHandler<any> = (cache[code].btnEvents[fieldCode] || {}).callback;
      if (eventCode && !onClick) {
        // 按照设定，此处只会执行一次
        onClick = () => {
          cache[code].eventCenter.emit(eventCode, cache, ctxParams, undefined, undefined, {
            setLoading: setLoadingStatus,
          });
        };
        cache[code].btnEvents[fieldCode] = {
          eventId: cache[code].eventCenter.on(eventCode),
          callback: onClick,
        };
      }
      newChildren.push(
        <C7NButton onClick={onClick} funcType="flat" loading={loadingStatus[fieldCode]}>
          {fieldName}
          {helpNode}
        </C7NButton>
      );
    }
    delete childrenMap[fieldCode];
  });
  Object.keys(childrenMap).forEach((i) => newChildren.push(childrenMap[i]));
  return <>{newChildren.reverse()}</>;
});
const noGroup = ['EXPORT'];
const ObserverWrapperPro: FunctionComponent<{
  component: ReactElement;
  options: Options;
}> = observer((props) => {
  const {
    component: {
      props: { buttons = [] },
    },
    options,
  } = props;
  const { code = '', btnType = 'c7n-pro' } = options;
  const { cache, contextParams: ctxParams, custConfig } = useContext(CustomizeContext);
  const [loadingStatus, setLoadingStatus] = useState({});
  const { fields } = useMemo(() => {
    // eslint-disable-next-line no-shadow
    const { fields = [] } = custConfig[code];
    cache[code].getAllValue = () => ({});
    cache[code].getValue = () => undefined;
    cache[code].type = 'btnGroup';
    cache[code].init = true;
    cache[code].eventCenter = new EventCenter({ unitCode: code });
    const newFields = [...fields].sort((p, n) => (p.seq || 999) - (n.seq || 999));
    cache[code].btnEvents = {};
    return { fields: newFields };
  }, [code, cache && cache[code]]);

  const memoColumns = useComputed(() => {
    const childrenMap = new Map<string, FieldPlainMap<ColumnProps>>();
    const newColumns: string[] = [];
    const groupColumns: string[][] = [];
    parseNest(childrenMap, buttons);
    const tools = { cache, code, ctxParams };
    fields.forEach((i) => {
      const {
        fieldName,
        fieldCode,
        conditionHeaderDTOs,
        aggregationCode,
        aggregationFlag,
        eventCode = fieldCode,
        fieldType = '',
        helpMessageConDTO,
      } = i;
      let { visible } = i;
      const condVisible = (conditionHeaderDTOs || []).find((item) => item.conType === 'visible');
      if (condVisible) {
        visible = computeConfig(condVisible, tools);
      }
      const helpMessage = fieldNameFx(tools, helpMessageConDTO) || i.helpMessage;
      const btn = childrenMap.get(fieldCode);
      if (visible === 0) {
        childrenMap.delete(fieldCode);
        return;
      }
      const helpNode = helpMessage ? (
        <Tooltip title={helpMessage}>
          <Icon type="help" style={helpNodeStyle as CSSProperties} className="cusz-help" />
        </Tooltip>
      ) : undefined;
      if (btn) {
        const { child: stdChild } = btn.column;
        let child = stdChild;
        if (typeof stdChild === 'function') {
          child = stdChild(fieldName, helpMessage);
        } else if (fieldName) {
          child = (
            <span>
              {fieldName}
              {helpNode}
            </span>
          );
        } else if (helpNode) {
          child = (
            <span>
              {child}
              {helpNode}
            </span>
          );
        }
        const newColumn: ColumnProps = {
          ...btn.column,
          child,
          text: fieldName,
        };
        if (aggregationFlag) newColumn.group = true;
        // 标准的按钮如果通过个性化强制显示，需要修改hidden属性为false
        if (visible === 1) newColumn.hidden = false;
        setColumn(childrenMap, newColumn);
      } else if (visible === 1) {
        let onClick: MouseEventHandler<any> = (cache[code].btnEvents[fieldCode] || {}).callback;
        if (eventCode && !onClick) {
          // 按照设定，此处只会执行一次
          onClick = (e) => {
            return cache[code].eventCenter.emit(eventCode, cache, ctxParams, e, undefined, {
              setLoading: setLoadingStatus,
            });
          };
          cache[code].btnEvents[fieldCode] = {
            eventId: cache[code].eventCenter.on(eventCode),
            callback: onClick,
          };
        }
        const newColumn: ColumnProps = {
          name: fieldCode,
          child: aggregationFlag ? (
            <C7NButton>
              {fieldName}
              {helpNode}
            </C7NButton>
          ) : (
            <span>
              {fieldName}
              {helpNode}
            </span>
          ),
          text: fieldName,
          btnProps: { onClick, funcType: 'flat', loading: loadingStatus[fieldCode] },
          btnType,
        };
        if (aggregationFlag && !noGroup.includes(fieldType)) newColumn.group = true;
        switch (fieldType) {
          case 'EXPORT':
            newColumn.btnComp = ProxyExport;
            newColumn.btnProps.help = helpNode;
            break;
          default:
        }
        setColumn(childrenMap, newColumn);
      }
      newColumns.push(fieldCode);
      if (aggregationCode) groupColumns.push([fieldCode, aggregationCode]);
    });
    groupColumns.forEach(([fieldCode, aggregationCode]) =>
      setColumnParent(childrenMap, fieldCode, aggregationCode)
    );
    return toNest(newColumns, childrenMap).reverse();
    /**
     * 修复：单元cache初始化时，因为init是可观察数据，修改时会触发重新渲染，故eventCenter相关初始化逻辑初始会执行两次
     * 所以存在扩展按钮逻辑on在第一次渲染时的eventCenter实例中，第二次重新new的实例则无对应的事件注册
     * 将cache[code].eventCenter加入useMemo的依赖项
     */
  }, [buttons, loadingStatus, cache[code].eventCenter]);
  return cloneElement(props.component, { buttons: memoColumns, unitCode: code });
});

type ColumnProps = {
  child: ReactNode;
  text?: string;
  childFor?: string;
  name: string;
  btnType?: 'h0' | 'c7n' | 'c7n-pro';
  btnComp?: JSXElementConstructor<any>;
  /** 为true时删除按钮的children属性 */
  noChild?: boolean;
  btnProps?: any;
  group?: boolean;
  hidden?: boolean;
  children?: Array<{
    child: ReactNode;
    text?: string;
    childFor?: string;
    name: string;
    btnComp?: JSXElementConstructor<any>;
    hidden?: boolean;
    /** 为true时删除按钮的children属性 */
    noChild?: boolean;
    btnType?: 'h0' | 'c7n' | 'c7n-pro';
    btnProps?: any;
  }>;
};
function setColumn(plainMap: Map<string, FieldPlainMap<ColumnProps>>, column: ColumnProps) {
  let currentField = plainMap.get(column.name);
  if (currentField) {
    currentField.column = column;
  } else currentField = { column };
  plainMap.set(column.name, currentField);
}
