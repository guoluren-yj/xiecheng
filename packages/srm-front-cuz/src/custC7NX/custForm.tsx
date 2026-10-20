import React, {
  cloneElement,
  FunctionComponent,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { isEmpty, isPlainObject } from 'lodash';
import { observer } from 'mobx-react-lite';
import { isObservableObject } from "mobx";
import moment from "moment";
import { numberRender } from '../utils';
import { FormLayout, LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import { Col, DataSet, Form, Output, Row } from 'choerodon-ui/pro';
import { getDateTimeFormat, getCurrentUserDateFormatPerfer, getDateFormat } from 'utils/utils';
import { fieldNameFx, getFieldValueObject, renderCheckBox, renderTelFieldOutput } from '../customizeTool';
import {
  assignOrderToField,
  assignRowColToField,
  parseNoneLayoutNode,
  parseTableLayoutNode,
  transformCompProps,
  transformStdCompProps,
} from './common';
import Customize, { CustomizeContext } from '../Customize';
import template from '../utils/template';
import { CtxParams, FieldConfig } from '../interfaces';
import getComponent from './getComponent';
import { extReg } from '../utils/constConfig.js';
import { useCustomizeDataSet, useDefaultValueReaction } from './hooks';

type Options = {
  code: string;
  afterCustomizeDs?: (code: string, dataSet: DataSet) => void;
  readOnly?: boolean;
  disableOutput?: boolean;
  /** 部分场景强制更改sync状态的record为update状态 */
  __force_record_to_update__?: boolean;
  /** @deprecated */
  enableEmpty?: boolean;
  gutter?: number;
  labelLayout?: string;
  extTextRenderIntercept?: ({ value, text, name, record, dataSet }, node) => ReactNode;
  customFieldPropsIntercept?: { [key: string]: ({ fieldProps, record }) => any };
  proxyDsCreate?: { createNow?: boolean; createData?: object; proxyQuery?: Function };
  disableMaxCol?: boolean,
};
export default function custForm(
  this: Customize,
  options: Options = { code: '' },
  form: ReactElement
) {
  const { cache, custConfig, contextParams } = this;
  const { code } = options;
  const isIncrement = this.manualQuery === "INCREMENT";
  if (
    isIncrement && (this.state.willUpdateCode || []).includes(code) ||
    !isIncrement && this.manualQuery && this.state.loading
  ) return cloneElement(form, { children: [] });
  if (!code || isEmpty(custConfig[code]) || !form || !form.props.dataSet) return form;
  return (
    <CustomizeContext.Provider value={{ cache, custConfig, contextParams }}>
      <ObserverWrapper options={options} component={form} />
    </CustomizeContext.Provider>
  );
}
const ObserverWrapper: FunctionComponent<{
  component: any;
  options: Options;
}> = observer(props => {
  const { component, options } = props;
  const customize = useContext(CustomizeContext);
  const { cache, contextParams: ctxParams, custConfig } = customize;
  const { dataSet, labelLayout: formLableLayout, columns: oriColumns } = component.props as {
    dataSet: DataSet;
    labelLayout: string;
    columns?
  };
  const {
    readOnly: readOnly1,
    enableEmpty,
    labelLayout = formLableLayout,
    code,
    proxyDsCreate,
    gutter,
    __force_record_to_update__,
    extTextRenderIntercept,
    customFieldPropsIntercept,
    disableMaxCol,
  } = options;
  let { disableOutput } = options;
  // float表单禁用Output
  if (formLableLayout === 'float') disableOutput = true;
  const { columns, unitAlias, readOnly2, fields, reactionFields } = useMemo(() => {
    const {
      maxCol = 3,
      // eslint-disable-next-line no-shadow
      readOnly: readOnly2,
      // eslint-disable-next-line no-shadow
      fields = [],
      // eslint-disable-next-line no-shadow
      unitAlias,
      showLines,
      firstShowFields = [],
    } = custConfig[code];
    cache[code].init = true;
    cache[code].type = 'collapseForm';
    cache[code].dataSet = dataSet;
    // eslint-disable-next-line func-names
    cache[code].getValue = function(fieldCode, _r, _n, options) {
      if (this.createData) {
        return this.createData[fieldCode];
      }
      const { getPristineValue } = options || {};
      if (this.dataSet.current) {
        const field = this.dataSet.getField(fieldCode);
        const value = this.dataSet.current.get(fieldCode);
        if (field && value) {
          const multiple = field.get('multiple');
          const valueField = field.get('valueField') || '__notconfig__';
          if (multiple && typeof value === 'object' && value.toJS) {
            if (getPristineValue) {
              return value.toJS();
            }
            return value
              .toJS()
              .map(i => (typeof i === 'object' ? i[valueField] || '' : i))
              .join(',');
          }
          if (isPlainObject(value) || isObservableObject(value)) {
            if (getPristineValue) {
              return value;
            }
            return value[valueField];
          }
          if (moment.isMoment(value)) {
            switch (field.type) {
              case 'dateTime':
                return value.format('YYYY-MM-DD HH:mm:ss');
              case 'date':
              default:
                return value.format('YYYY-MM-DD');
            }
          }
        }
        return value;
      }
    };
    cache[code].getAllValue = function() {
      if (this.createData) {
        return this.createData;
      }
      return this.dataSet.current ? this.dataSet.current.toData() : {};
    };
    // eslint-disable-next-line no-shadow
    const reactionFields = useCustomizeDataSet({ dataSet, ...options }, customize);
    return {
      unitAlias,
      columns: maxCol,
      readOnly2,
      fields,
      reactionFields,
      firstShowFields:
        firstShowFields.length > 0 ? firstShowFields : component.props.firstShowFields,
      showLines,
    };
  }, [code, dataSet, cache && cache[code]]);
  useDefaultValueReaction(dataSet, reactionFields, code, { __force_record_to_update__ });
  if (proxyDsCreate && proxyDsCreate.createNow) {
    const { createData, proxyQuery } = proxyDsCreate;
    if (typeof proxyQuery === 'function') {
      proxyQuery();
    } else {
      dataSet.loadData([]);
      dataSet.create(createData);
    }
    proxyDsCreate.createNow = false;
  }
  const tools = { cache, code, ctxParams };
  const { children, layout } = component.props;
  let fieldMap;
  let computedFields: FieldConfig[];
  let positionMap: Map<string, { rowIndex: number; colIndex: number, colSpan?: number; }>;
  if (layout === FormLayout.none) {
    fieldMap = parseNoneLayoutNode(children);
    const fieldMapKeys = Object.keys(fieldMap);
    const memoPosition = useMemo(
      () => assignRowColToField(fieldMap, fields, columns),
      [code, fieldMapKeys.length, dataSet].concat(fieldMapKeys.join())
    );
    positionMap = memoPosition.fieldToRowCol;
    computedFields = fields.concat(memoPosition.missFields);
  } else {
    fieldMap = parseTableLayoutNode(children);
    const fieldMapKeys = Object.keys(fieldMap);
    computedFields = useMemo(
      () => assignOrderToField(fieldMap, fields, columns),
      [code, fieldMapKeys.length, dataSet].concat(fieldMapKeys.join())
    );
  }
  const readOnly = readOnly1 || readOnly2;
  // 保证children中不存在数字类型之外的key
  /**
   * 珊格模式的dto {[k: string | number]: {node: any, colSpan?: number}}
   * 表格模式的dto {[k: string | number]: node}
   */
  const newChildren: any = {};
  const editorOptions = {
    unitAlias,
    cache,
    code,
    ctxParams,
    labelLayout,
    disableOutput,
    readOnly,
    extTextRenderIntercept,
    customFieldPropsIntercept,
    dataSet,
  };
  computedFields.forEach((item, index) => {
    const { fieldCode, colSpan, rowSpan } = item;
    const helpMessage = fieldNameFx(tools, item.helpMessageConDTO) || item.helpMessage;
    const newItem = {...item, helpMessage};
    let { seq = 10000 + index } = item;
    if (newChildren[seq]) seq = 10000 + index;
    const oldChild = fieldMap[fieldCode];
    /**
     * dynamicProps属性必须record存在
     * 表单假定record必定存在
     * 若不存在，条件显示功能回退至没有条件的场景
     * visible为0的字段（表格的内置查询单元需要用到0）在ds中不存在，因此需要判断field
     */
    const field = dataSet.getField(fieldCode);
    let visible = field ? field.get('visible', dataSet.current) : item.visible;
    if (visible === undefined) visible = -1;
    if (visible === 0) {
      delete fieldMap[fieldCode];
      if (enableEmpty) {
        const emptyProps: any = {
          name: fieldCode,
          colSpan,
          rowSpan,
        };
        newChildren[seq] = <div {...emptyProps} fieldClassName="cust-no-visible" />;
      }
      return;
    }
    if (layout === FormLayout.none) {
      // 这里面position不可能为空，如果为空，检查前面逻辑
      const position = positionMap.get(fieldCode)!;
      if (!newChildren[position.rowIndex]) {
        newChildren[position.rowIndex] = [] as any;
      }
      const newEditor = makeNewEditor(newItem, oldChild, visible, editorOptions);
      const node = fieldMap[fieldCode] ? (
        cloneElement(fieldMap[fieldCode].parentNode, undefined, newEditor)
      ) : (
        <Form.Item>{newEditor as any}</Form.Item>
      );

      newChildren[position.rowIndex][position.colIndex] = { node, colSpan: position.colSpan };
    } else {
      newChildren[seq] = makeNewEditor(newItem, oldChild, visible, editorOptions);
    }
  });
  let finalChildren;
  if (layout === FormLayout.none) {
    const rowKeys = Object.keys(newChildren).sort((p, n) => Number(p) - Number(n));
    finalChildren = rowKeys.map(row => {
      const rowFields: ReactNode[] = [];
      const rowNodes = newChildren[row];
      for (let i = 0; i < rowNodes.length; i++) {
        const { node, colSpan } = rowNodes[i] || {};
        if (node && node.props.children) {
          rowFields.push(<Col span={Math.floor(24 / columns) * (colSpan || 1)}>{node}</Col>);
        } else rowFields.push(<Col span={Math.floor(24 / columns) * (colSpan || 1)} />);
      }
      return <Row gutter={gutter}>{rowFields}</Row>;
    });
  } else {
    finalChildren = Object.keys(newChildren)
      .sort((p, n) => Number(p) - Number(n))
      .map(k => newChildren[k]);
  }

  return cloneElement(component, {
    columns: disableMaxCol ? oriColumns : columns,
    children: finalChildren,
  });
});

function makeNewEditor(
  item: FieldConfig,
  oldChild: any,
  visible: -1 | 0 | 1,
  options: {
    cache;
    code: string;
    ctxParams: CtxParams;
    unitAlias;
    readOnly?: boolean;
    disableOutput?: boolean;
    labelLayout?: string;
    extTextRenderIntercept?: ({ value, text, name, record, dataSet }, node) => ReactNode;
    customFieldPropsIntercept?: { [key: string]: (fieldProps: any) => any };
    dataSet: DataSet;
  }
): ReactNode {
  const {
    cache,
    code,
    ctxParams,
    unitAlias,
    labelLayout,
    disableOutput,
    readOnly,
    extTextRenderIntercept,
    customFieldPropsIntercept,
    dataSet,
  } = options;
  const {
    fieldCode,
    fieldName,
    renderOptions,
    renderRule,
    colSpan,
    rowSpan,
    fieldType,
    allowThousandth,
    numberPrecision,
    multipleFlag,
  } = item;
  const field = dataSet.getField(fieldCode);
  let fieldProps: any = {
    name: fieldCode,
    colSpan,
    rowSpan,
    label: field && field.get('label', dataSet.current) || fieldName,
  };
  if (customFieldPropsIntercept && customFieldPropsIntercept[fieldCode]) {
    fieldProps = customFieldPropsIntercept[fieldCode]({ fieldProps, record: dataSet.current });
  }
  // 20210731迭代改动，渲染方式为文本的受计算规则控制
  if (renderOptions === 'TEXT' && renderRule) {
    const dataGets = getFieldValueObject({
      relatedList: unitAlias || [],
      cache,
      code,
      ctxParams,
    });
    fieldProps.renderer = options => {
      const node = (
        // eslint-disable-next-line react/no-danger
        <span dangerouslySetInnerHTML={{ __html: template.render(renderRule, dataGets) }} />
      );
      return extTextRenderIntercept ? extTextRenderIntercept(options, node) : node;
    };
    return (
      <Output
        {...fieldProps}
        help={item.helpMessage}
        showHelp={labelLayout === LabelLayout.float ? ShowHelp.tooltip : ShowHelp.label}
      />
    );
  }
  // 做新增扩展字段处理
  if (!oldChild && visible !== -1) {
    const isExecptFieldType = ['UPLOAD', 'LINK'].includes(item.fieldType || '');
    const noRenderer = ['RADIOGROUP', 'LOV'].includes(item.fieldType || '');
    if (labelLayout === 'vertical' && !noRenderer) {
      fieldProps.renderer = ({ name, record, text }) => {
        const matchRes = name.match(extReg);
        let preStr = name;
        if (matchRes) {
          // eslint-disable-next-line prefer-destructuring
          preStr = matchRes[1];
        }
        const data = record ? record.get([`${preStr}Meaning`, preStr]) : {};
        const visualValue = data[`${preStr}Meaning`] || data[preStr];
        if (['INPUT_NUMBER', 'CURRENCY'].includes(fieldType!)) {
          return numberRender(visualValue, numberPrecision, !!allowThousandth, true);
        }
        if (visualValue instanceof Array) return multipleFlag === 1 ? text : visualValue.join('/');
        else if (typeof visualValue === 'object' && visualValue !== null) {
          return multipleFlag === 1 ? text : Object.values(visualValue).join('/');
        } else if (visualValue === null || visualValue === undefined) {
          return '-';
        }
        return visualValue;
      };
    }
    if (fieldType === 'CHECKBOX' || fieldType === 'SWITCH') {
      fieldProps.renderer = ({ value }) => renderCheckBox(value);
    } else if (fieldType === 'DATE_PICKER') {
      const format = getCurrentUserDateFormatPerfer() ? (item.dateFormat && !/HH|hh|mm|ss/.test(item.dateFormat) ? getDateFormat() : getDateTimeFormat()) : item.dateFormat;
      fieldProps.renderer = ({ value }) => (value ? moment(value).format(format || getDateTimeFormat()) : '-');
    } else if (['INPUT_NUMBER', 'CURRENCY'].includes(fieldType!)) {
      fieldProps.renderer = ({ value }) =>
        numberRender(value, numberPrecision, !!allowThousandth, true);
    } else if (fieldType === 'TEL_FIELD') {
      fieldProps.renderer = ({ record }) => renderTelFieldOutput({ name: fieldCode, record }); 
    }
    if (extTextRenderIntercept) {
      const cuszRenderer = fieldProps.renderer;
      fieldProps.renderer = options => {
        return extTextRenderIntercept(options, cuszRenderer ? cuszRenderer(options) : options.text);
      };
    }
    if (disableOutput || (!readOnly && renderOptions !== 'TEXT') || isExecptFieldType) {
      delete fieldProps.renderer;
      return getComponent(fieldType)({
        ...fieldProps,
        ...transformCompProps(item, {
          ctxParams,
          cache,
          viewOnly: readOnly || renderOptions === 'TEXT',
          showHelp: labelLayout === LabelLayout.float ? ShowHelp.tooltip : ShowHelp.label,
          disableOutput,
          unitCode: code,
        }),
      });
    } else {
      return (
        <Output
          {...fieldProps}
          help={item.helpMessage}
          showHelp={labelLayout === LabelLayout.float ? ShowHelp.tooltip : ShowHelp.label}
        />
      );
    }
  } else if (oldChild) {
    /**
     * FormVirtualGroup情况下，个性化无法控制内部标准字段的组件属性
     */
    let newProps: any = transformStdCompProps(item, {
      showHelp: labelLayout === LabelLayout.float ? ShowHelp.tooltip : ShowHelp.label,
    });
    if (colSpan) {
      newProps.colSpan = colSpan;
    }
    if (rowSpan) {
      newProps.rowSpan = rowSpan;
    }

    if (visible === 1) {
      newProps.hidden = false;
    }
    if (customFieldPropsIntercept && customFieldPropsIntercept[fieldCode]) {
      newProps = customFieldPropsIntercept[fieldCode]({ fieldProps: newProps, record: dataSet.current });
    }
    return cloneElement(oldChild.item, newProps);
  }
}
