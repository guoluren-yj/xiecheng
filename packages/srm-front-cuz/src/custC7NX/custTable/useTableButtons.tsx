import React, {
  cloneElement,
  ReactElement,
  useMemo,
  useContext,
  isValidElement,
  MouseEventHandler,
  CSSProperties,
} from 'react';
import { isPlainObject } from 'lodash';
import { Button, Icon, Tooltip } from 'choerodon-ui/pro';
import { Buttons } from 'choerodon-ui/pro/lib/table/interface';
import { ButtonProps } from 'choerodon-ui/lib/button';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { CustomizeContext } from '../../Customize';
import { computeConfig } from '../../customizeTool';
import {
  FieldPlainMap,
  setColumnParent,
  toNest,
  setColumn as setColumnCommon,
} from '../common';
import { helpNodeStyle } from '../../utils/constConfig';
import EventCenter from '../../components/EventCenter';
import ConfigDropdown, { ConfigDropdownProps } from '../../components/ConfigDropdown';
import { useComputed } from '../hooks';

/** 表格头按钮 */
export function useTableButtons(tableButtons: Buttons[], options): Buttons[] {
  const { code, namespace } = options;
  const { cache, contextParams: ctxParams, custConfig } = useContext(CustomizeContext);
  if (!code || !custConfig[code]) return tableButtons;
  const memoFields = useMemo(() => {
    cache[code].getAllValue = () => ({});
    cache[code].getValue = () => undefined;
    cache[code].type = 'tableBtnGroup';
    cache[code].init = true;
    cache[code].eventCenter = new EventCenter({ unitCode: code });
    const { fields = [] } = custConfig[code];
    const newFields = [...fields].sort((before, after) => {
      if (before.seq === undefined && after.seq === undefined) return 0;
      if (before.seq === undefined) return 1;
      if (after.seq === undefined) return -1;
      return before.seq - after.seq;
    });
    cache[code].btnEvents = {};
    return newFields;
  }, [code, cache && cache[code]]);
  const [columnsWithSeq, fieldMap] = useComputed(() => {
    const stdBtnMap = parseTableButtons(tableButtons);

    const columnsSeq: string[] = [];
    const groupColumns: string[][] = [];
    const tools = { cache, code, ctxParams };
    memoFields.forEach(field => {
      const {
        fieldCode,
        fieldName,
        fieldType,
        isStandardField,
        eventCode = fieldCode,
        aggregationCode,
        aggregationFlag,
        helpMessage,
        conditionHeaderDTOs,
      } = field;
      /**
       * hidden分三种
       * 1、stdBtn.column.hidden 无效
       * 2、stdBtn.hidden 个性化解析过程中生效
       * 3、stdBtn.column.otherProps.hidden ui层面生效
       */
      let { visible } = field;
      const condVisible = (conditionHeaderDTOs || []).find(item => item.conType === 'visible');
      if (condVisible) {
        visible = computeConfig(condVisible, tools);
      }
      if (visible === 0) {
        stdBtnMap.delete(fieldCode);
        return;
      }
      let stdBtn = stdBtnMap.get(fieldCode);
      const helpNode = helpMessage ? (
        <Tooltip title={helpMessage}>
          <Icon type="help" style={helpNodeStyle as CSSProperties} className="cusz-help" />
        </Tooltip>
      ) : (
        undefined
      );
      if (!stdBtn) {
        if (visible === -1) return;
        const columnConfig: any = {
          isAggregation: !!aggregationFlag,
          name: fieldCode,
          isExt: true,
          otherConfig: {
            // 修正，扩展字段的fieldName必定是存在的
            children: fieldName,
            hidden: visible === 0 || visible === -1,
          }
        };
        if (fieldType && !isStandardField) {
          columnConfig.type = BtnType.UI_PRESET;
          switch (fieldType) {
            case 'ADD':
              columnConfig.name = 'add';
              break;
            case 'DELETE':
              columnConfig.name = 'delete';
              break;
            case 'REMOVE':
              columnConfig.name = 'remove';
              break;
            case 'SAVE':
              columnConfig.name = 'save';
              break;
            case 'QUERY':
              columnConfig.name = 'query';
              break;
            case 'RESET':
              columnConfig.name = 'reset';
              break;
            case 'EXPANDALL':
              columnConfig.name = 'expandAll';
              break;
            case 'COLLAPSEALL':
              columnConfig.name = 'collapseAll';
              break;
            case 'EXPORT':
              columnConfig.name = 'export';
              break;
            default:
              return;
          }
          setColumnCommon(stdBtnMap, columnConfig);
          return;
        }
        columnConfig.type = BtnType.REACT_ELE;
        if (aggregationFlag) {
          columnConfig.originEle = (
            <ConfigDropdown overlay={[]} name={fieldCode} trigger={['click']}>
              <Button funcType={FuncType.flat} color={ButtonColor.primary}>
                {fieldName}
                {helpNode}
              </Button>
            </ConfigDropdown>
          );
          setColumnCommon(stdBtnMap, columnConfig);
          return;
        }
        let onClick: MouseEventHandler<any> = (cache[code].btnEvents[fieldCode] || {}).callback;
        if (eventCode && !onClick) {
          // 按照设定，此处只会执行一次
          onClick = e => {
            return cache[code].eventCenter.emit(eventCode, cache, ctxParams, e, namespace);
          };
          cache[code].btnEvents[fieldCode] = {
            eventId: cache[code].eventCenter.on(eventCode),
            callback: onClick,
          };
        }
        if (aggregationCode) {
          columnConfig.type = BtnType.MENU_ITEM;
          columnConfig.otherConfig.name = fieldCode;
          columnConfig.otherConfig.key = fieldCode;
          columnConfig.otherConfig.children = (
            <span>
              {fieldName}
              {helpNode}
            </span>
          );
          columnConfig.otherConfig.onClick = onClick;
          setColumnCommon(stdBtnMap, columnConfig);
          groupColumns.push([fieldCode, aggregationCode]);
          return;
        }
        columnConfig.originEle = (
          <Button funcType={FuncType.flat} onClick={onClick} color={ButtonColor.primary}>
            {fieldName}
            {helpNode}
          </Button>
        );

        setColumnCommon(stdBtnMap, columnConfig);
      } else {
        let columnConfig = { ...stdBtn.column };
        if (!columnConfig.otherConfig) columnConfig.otherConfig = {};
        // 如若通过个性化强制显示标准字段，则兼容标准代码使用hidden属性的场景
        else if (visible === 1 && !aggregationCode) columnConfig.otherConfig.hidden = false;
        // 理论上讲，满足这个判断的应该只有内置类型的表格头按钮
        if (fieldType && fieldName) {
          columnConfig.otherConfig.fieldName = fieldName;
        } else if (!fieldType && fieldName) {
          columnConfig.customizeName = (
            <span>
              {fieldName}
              {helpNode}
            </span>
          );
        }
        setColumnCommon(stdBtnMap, columnConfig);
      }
      if (aggregationCode) {
        groupColumns.push([fieldCode, aggregationCode]);
      }
      columnsSeq.push(fieldCode);
    });

    groupColumns.forEach(([fieldCode, aggregationCode]) => {
      setColumnParent(stdBtnMap, fieldCode, aggregationCode);
    });
    return [columnsSeq, stdBtnMap];
  }, [tableButtons]);

  return (toNest(columnsWithSeq, new Map(fieldMap)) as {
    name: string;
    type: BtnType;
    customizeName?: string;
    otherConfig?: (ButtonProps & { name: string });
    isAggregation?: boolean;
    originEle?: ReactElement<any>;
    children?: {
      name: string;
      type: BtnType;
      otherConfig?: Buttons | (ButtonProps & { name: string }) | ReactElement<ConfigDropdownProps>;
      isAggregation?: boolean;
      originEle?: ReactElement<any>;
      [x: string]: any;
    }[];
  }[])
    .map(btn => {
      switch (btn.type) {
        case BtnType.UI_PRESET:
          if (btn.otherConfig) return [btn.name, btn.otherConfig];
          return btn.name as TableButtonType;
        case BtnType.REACT_ELE:
          const newProps: any = {};
          if (btn.customizeName) {
            newProps.children = btn.customizeName;
          }
          if (btn.isAggregation) {
            return cloneElement(btn.originEle!, {
              ...btn.otherConfig,
              ...newProps,
              overlay: (btn.children || []).map(i => i.otherConfig),
            });
          }
          return cloneElement(btn.originEle!, { ...btn.otherConfig, ...newProps });
        case BtnType.PLAIN_OBJ:
          return btn.otherConfig!;
        default:
          return null;
      }
    })
    .filter(i => !!i) as Buttons[];
}
enum BtnType {
  UI_PRESET = 0,
  REACT_ELE = 1,
  PLAIN_OBJ = 2,
  MENU_ITEM = 3,
}
function parseTableButtons(
  tableButtons: (Buttons | (ButtonProps & { name: string }) | ReactElement<ConfigDropdownProps>)[]
) {
  const btnMap = new Map<string, FieldPlainMap<any>>();
  tableButtons.forEach(btnConfig => {
    if (typeof btnConfig === 'string') {
      setColumnCommon(btnMap, {
        name: btnConfig,
        type: BtnType.UI_PRESET,
        otherConfig: {},
      });
    } else if (btnConfig instanceof Array) {
      setColumnCommon(btnMap, {
        name: btnConfig[0],
        type: BtnType.UI_PRESET,
        otherConfig:  btnConfig[1],
      });
    } else if (isValidElement(btnConfig)) {
      const btnMapConfig: any = {
        name: btnConfig.props.name,
        type: BtnType.REACT_ELE,
        isAggregation: btnConfig.type === ConfigDropdown,
        // 因为要修改hidden属性，需要浅拷贝，否则在react的dev模式启动时，会报错
        otherConfig: {...btnConfig.props} || {},
        originEle: btnConfig,
      };
      setColumnCommon(btnMap, btnMapConfig);
      if (
        btnConfig.type === ConfigDropdown &&
        (btnConfig as ReactElement<ConfigDropdownProps>).props.overlay
      ) {
        btnMapConfig.overlay = (btnConfig as ReactElement<
          ConfigDropdownProps
        >).props.overlay.forEach(item => {
          setColumnCommon(btnMap, {
            name: item.name,
            type: BtnType.MENU_ITEM,
            otherConfig: btnConfig,
          });
          setColumnParent(btnMap, item.name, btnConfig.props.name!);
        });
      }
    } else if (isPlainObject(btnConfig)) {
      setColumnCommon(btnMap, {
        name: btnConfig.name,
        type: BtnType.PLAIN_OBJ,
        otherConfig: btnConfig,
      });
    }
  });
  return btnMap;
}