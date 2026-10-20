import compile from './compile';
/**
 * 渲染模板
 * @param   {string|Object}     source  模板内容
 * @param   {Object}            data    数据
 * @param   {?Object}           options 选项
 * @return  {string}            渲染好的字符串
 */
export const render_old = (source, data, options?) => compile(source, options)(data);

/**
 * 渲染模板
 * @param   {string|Object}     source  模板内容
 * @param   {Object}            dataGets    数据
 * @param   {?Object}           options 选项
 * @return  {string}            渲染好的字符串
 */
export const render = (source: string | object, dataGets: object, rowKey?: string | number, options?: object) => compile(source, {...options, useDataGets: true})(dataGets, rowKey);
