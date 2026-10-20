import { isEmpty } from 'lodash';
import { cloneElement } from 'react';
import { getFieldValueObject } from '../../customizeTool';
import generateTableColumns from './generateTableColumns';

export default function customizeTable(this: any, options: any = {}, table) {
  const { configModel: config, loading } = this.state;
  const { code, readOnly } = options;
  if (loading) {
    return cloneElement(table, { columns: [], scroll: { x: 0 } });
  }
  if (!code || isEmpty(config[code])) return table;
  const { unitAlias = [] } = config[code];
  const unitData = getFieldValueObject(unitAlias, this.getCache, code); // 获取当前单元的关联单元数据
  const { columns, scroll } = table.props;
  const newProps: any = {};
  const { columns: newColumns, noWidthCount, scrollWidth } = generateTableColumns(
    columns,
    config[code],
    { readOnly, unitData, code, getValueFromCache: this.getValueFromCache }
  );
  // eslint-disable-next-line no-param-reassign
  newProps.columns = newColumns;
  if (scroll !== undefined) {
    const originScroll = table.props.scroll;
    // eslint-disable-next-line no-param-reassign
    newProps.scroll = { ...originScroll, x: scrollWidth + noWidthCount * 200 };
  }
  return cloneElement(table, newProps);
}
