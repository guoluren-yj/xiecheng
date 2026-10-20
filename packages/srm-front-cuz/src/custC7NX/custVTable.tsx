import React, {
  cloneElement,
  FunctionComponent,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import moment from "moment";
import { isEmpty, isPlainObject } from 'lodash';
import { isObservableObject } from "mobx";
import { observer } from 'mobx-react';
import { DataSet, Icon, Tooltip } from 'choerodon-ui/pro';
import { numberRender } from '../utils';
import { getFieldValueObject, renderCheckBox, fieldNameFx } from '../customizeTool';
import template from '../utils/template';
import { transformCompProps } from './common';
import Customize, { CustomizeContext } from '../Customize';
import getComponent from './getComponent';
import { useComputed, useCustomizeDataSet, useDefaultValueReaction } from './hooks';

type Options = {
  code: string;
  readOnly?: boolean;
  readOnlyMode?: 'disabled' | 'output';
  dataSource: any[];
  dataSet: DataSet;
  /** 部分场景强制更改sync状态的record为update状态 */
  __force_record_to_update__?: boolean;
  afterCustomizeDs?: (code: string, dataSet: DataSet) => void;
  proxyDsCreate?: { createNow?: boolean; createData?: object; proxyQuery?: Function };
  extTextRenderIntercept?: (options: any, node) => ReactNode;
};

function getColumnsConfig({ fixed, width }) {
  const newColumnsConfig: any = {};
  if (fixed === 'L') {
    newColumnsConfig.fixed = 'left';
  } else if (fixed === 'R') {
    newColumnsConfig.fixed = 'right';
  } else if (fixed === 'N') {
    newColumnsConfig.fixed = undefined;
  }
  if (width !== undefined) {
    newColumnsConfig.width = width;
  }
  return newColumnsConfig;
}

export default function custVTable(this: Customize, options: any = {}, table: ReactElement) {
  const { cache, custConfig, contextParams } = this;
  const { code = '', dataSource = [] } = options;
  const isIncrement = this.manualQuery === "INCREMENT";
  if (
    isIncrement && (this.state.willUpdateCode || []).includes(code) ||
    !isIncrement && this.manualQuery && this.state.loading
  ) {
    return React.cloneElement(table, { loading: true, customizedCode: code });
  }
  if (!code || isEmpty(custConfig[code]) || !options || !options.dataSet) {
    return cloneElement(table, { customizedCode: code });
  }
  cache[code].dataSource = dataSource;

  return (
    <CustomizeContext.Provider value={{ cache, custConfig, contextParams }}>
      <ObserverWrapper component={table} options={options} />
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
  const {
    readOnly: readOnly1,
    code,
    dataSource = [],
    dataSet,
    __force_record_to_update__,
    extTextRenderIntercept,
  } = options;
  const { fields, unitAlias, readOnly2, tools, reactionFields } = useMemo(() => {
    // eslint-disable-next-line no-shadow
    const { unitAlias = [], readOnly: readOnly2, fields = [] } = custConfig[code];
    // 根据列顺序属性排序
    const newFields = fields.sort((before, after) => (before.seq || 999) - (after.seq || 999));
    cache[code].init = true;
    cache[code].type = 'vTable';
    cache[code].dataSet = dataSet;
    cache[code].dataSource = dataSource;
    cache[code].getValue = function(fieldCode, rowKey, _n, options) {
      if (rowKey === undefined) return;
      const currentData = dataSource[rowKey];
      if (!currentData) return;
      const { getPristineValue } = options || {};
      const record = currentData.record;
      if (record) {
        const field = record.dataSet.getField(fieldCode);
        const value = record.get(fieldCode);
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
      } else return currentData[fieldCode];
    };
    cache[code].getAllValue = function(rowKey) {
      if (rowKey === undefined) return {};
      const currentData = dataSource[rowKey];
      if (!currentData) return {};
      if (currentData.record) {
        return currentData.record.toData();
      } else return currentData;
    };
    // eslint-disable-next-line no-shadow
    const reactionFields = useCustomizeDataSet(options, customize);
    // eslint-disable-next-line no-shadow
    const tools = { cache, code, ctxParams };
    return { fields: newFields, unitAlias, readOnly2, tools, reactionFields };
  }, [code, dataSet, dataSource, cache && cache[code]]);
  useDefaultValueReaction(dataSet, reactionFields, code, { __force_record_to_update__ });
  const { columns } = component.props;
  const visibleCache = useComputed(
    () =>
      fields
        .map(item => {
          const { fieldCode } = item;
          /**
           * dynamicProps属性必须record存在
           * 表格假定record必定不存在
           * 表格假定record必定不存在，从dataSet上拿dynamicProps的值
           * visible为0的字段（表格的内置查询单元需要用到0）在ds中不存在，因此需要判断field
           */
          const field = dataSet.getField(fieldCode);
          let visible = field ? field.get('visible') : item.visible;
          if (visible === undefined) visible = -1;
          return visible;
        })
        .join(''),
    [columns]
  );
  const readOnly = readOnly1 || readOnly2;
  const memoColumns = useMemo(() => {
    const fieldMap = new Map(); // 标准列
    const stdDynamicFields: any[] = [];
    columns.forEach(item => {
      if ((item as any).isStdDynamic) stdDynamicFields.push(item);
      fieldMap.set(item.dataIndex, item);
    });
    // 根据列顺序属性排序
    let newColumns: any[] = [];
    fields.forEach(item => {
      const {
        width,
        fieldCode,
        fixed,
        renderOptions,
        renderRule,
        fieldType = '',
        fieldNameConDTO,
        helpMessageConDTO,
        numberPrecision,
        allowThousandth,
      } = item;
      const oldCol = fieldMap.get(fieldCode);
      /**
       * dynamicProps属性必须record存在
       * 表格假定record必定不存在，从dataSet上拿dynamicProps的值
       * visible为0的字段（表格的内置查询单元需要用到0）在ds中不存在，因此需要判断field
       */
      const field = dataSet.getField(fieldCode);
      let visible = field ? field.get('visible') : item.visible;
      if (visible === undefined) visible = -1;
      if ((oldCol && oldCol.isStdDynamic) || (!oldCol && visible === -1)) {
        fieldMap.delete(fieldCode);
        return;
      }
      let { fieldName, helpMessage } = item;
      if (fieldNameConDTO) {
        fieldName = fieldNameFx(tools, fieldNameConDTO) || fieldName;
      }
      if (helpMessageConDTO) {
        helpMessage = fieldNameFx(tools, helpMessageConDTO) || helpMessage;
      }
      if (fieldType !== 'EMPTY') {
        if (visible === 0) {
          fieldMap.delete(fieldCode);
          return;
        }
      }
      const newColumnsConfig = {
        dataIndex: fieldCode,
        key: fieldCode,
        resizable: true,
        ...getColumnsConfig({
          fixed,
          width,
        }),
      };
      if (fieldName !== undefined) {
        newColumnsConfig.title = fieldName;
      }
      if (helpMessage) {
        newColumnsConfig.title = (
          <>
            {newColumnsConfig.title || oldCol.title}
            <Tooltip title={helpMessage}>
              <Icon type="help_outline" />
            </Tooltip>
          </>
        );
      }
      // 20210731迭代改动，渲染方式为文本的受计算规则控制
      if (renderOptions === 'TEXT' && renderRule) {
        const dataGets = getFieldValueObject({
          relatedList: unitAlias,
          cache,
          code,
          ctxParams,
        });
        newColumnsConfig.render = options => {
          const node = (
            // eslint-disable-next-line react/no-danger
            <span
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: template.render(renderRule, dataGets, options.rowIndex),
              }}
            />
          );
          return extTextRenderIntercept ? extTextRenderIntercept(options, node) : node;
        };
      } else if (!oldCol) {
        const formFieldGen = ({ rowData, dataIndex }) => {
          if (rowData.record) {
            return getComponent(fieldType)(
              transformCompProps(item, {
                ctxParams,
                cache,
                unitCode: code,
                record: rowData.record,
                viewOnly: readOnly || renderOptions === 'TEXT',
                isGrid: true,
              })
            );
          }
          const visualValue = rowData[`${dataIndex}Meaning`] || rowData[dataIndex];
          if (visualValue instanceof Array) return visualValue.join('/');
          else if (typeof visualValue === 'object' && visualValue !== null) {
            return Object.values(visualValue).join('/');
          }
          return visualValue;
        };
        const isExecptFieldType = ['UPLOAD', 'LINK', 'RADIOGROUP'].includes(fieldType || '');
        if (!isExecptFieldType && (readOnly || renderOptions === 'TEXT')) {
          if (fieldType === 'DATE_PICKER') {
            newColumnsConfig.render = ({ rowData, dataIndex }) => {
              let data = rowData;
              if (rowData.record) {
                data = rowData.record.get([dataIndex]);
              }
              return data[dataIndex] && moment(data[dataIndex]).format(item.dateFormat);
            };
          } else if (fieldType === 'CHECKBOX' || fieldType === 'SWITCH') {
            newColumnsConfig.render = ({ rowData, dataIndex }) => {
              let data = rowData;
              if (rowData.record) {
                data = rowData.record.get([dataIndex]);
              }
              return renderCheckBox(data[dataIndex]);
            };
          } else if (['INPUT_NUMBER', 'CURRENCY'].includes(fieldType)) {
            newColumnsConfig.render = ({ rowData, dataIndex }) => {
              let data = rowData;
              if (rowData.record) {
                data = rowData.record.get([dataIndex]);
              }
              return numberRender(
                Number(data[dataIndex]),
                numberPrecision,
                !!allowThousandth,
                true
              );
            };
          } else {
            newColumnsConfig.render = ({ rowData, dataIndex }) => {
              let newDataIndex = dataIndex;
              if (/Lov$/.test(dataIndex)) {
                const match = dataIndex.match(/([\S]+)Lov$/);
                if (match) {
                  // eslint-disable-next-line prefer-destructuring
                  newDataIndex = match[1];
                }
              }
              const visualValue = rowData[`${newDataIndex}Meaning`] || rowData[newDataIndex];
              if (visualValue instanceof Array) return visualValue.join('/');
              else if (typeof visualValue === 'object' && visualValue !== null) {
                return Object.values(visualValue).join('/');
              }
              return visualValue;
            };
          }
          if (extTextRenderIntercept) {
            const tempRender = newColumnsConfig.render;
            newColumnsConfig.render = options => {
              return extTextRenderIntercept(options, tempRender(options));
            };
          }
        } else {
          newColumnsConfig.render = formFieldGen;
        }
      }
      fieldMap.delete(fieldCode);
      newColumns.push({
        ...oldCol,
        ...newColumnsConfig,
      });
    });
    // 代码中而配置中没有的字段
    newColumns = newColumns.concat(Array.from(fieldMap.values()));
    // 左固定前置， 右固定后置
    const leftFixedColumns: any[] = [];
    const rightFixedColumns: any[] = [];
    const centerFixedColumns: any[] = [];
    newColumns.forEach(item => {
      if (item.fixed === 'left' || item.fixed === true) {
        leftFixedColumns.push(item);
      } else if (item.fixed === 'right') {
        rightFixedColumns.push(item);
      } else {
        centerFixedColumns.push(item);
      }
    });
    return leftFixedColumns.concat(centerFixedColumns, stdDynamicFields).concat(rightFixedColumns);
  }, [visibleCache, columns, readOnly]);

  return cloneElement(component, {
    columns: memoColumns,
    customizedCode: code,
  });
});
