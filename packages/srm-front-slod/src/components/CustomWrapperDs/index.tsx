
/**
* index.js 全局ds封装(多处使用，改动需谨慎)
* @date: 2023-02-07
* @author: zuoxiangyu <xiangyu.zuo@going-link.com>
* @version: 0.0.1
* @copyright Copyright (c) 2023, Hand
*/
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

/**
* 行Column处理
* @delivery {*} params
* return arr
* name: 字段名，必输
* width: 宽度
* type: 类型,默认string
* label：标题，必输
* editor: 是否可编辑,默认false
* renderer: 渲染
* command: 操作
* custHidden: 是否隐藏: true隐藏 false不隐藏, 默认false, 针对一些无需展示在页面的字段，例如：bind绑定，
* 例子：{ name: 'bind', label: '绑定', custHidden: true }
*/
const lineDataColumns: (x: Array<any>) => any = (columns) => {
const line = columns.map((item: any) => {
const { name = '', width, editor = false, renderer = undefined, command=undefined, custHidden = false } = item;
if (!custHidden) return { name, width, editor, renderer, command };
return null;
});
return line;
};

/**
* dsa封装
* @componentData arr 数据源,
* id = '',
* selection = 'multiple',
* dataToJSON= 'all',
* componentData = [],
* queryParams=false,
* paging = false,
* pageSize= 10,
* autoQuery =false,
* read = e => e,
* load = e => e,
* 可自行补充属性与方法......
*/
const indexDataSet = ({
id = '',
selection = 'multiple',
dataToJSON= 'all',
componentData = [],
queryParams=false,
paging = false,
pageSize= 10,
autoQuery =false,
read = e => e,
load = e => e,
}: any): DataSetProps => ({
paging,
pageSize,
selection,
autoQuery,
dataToJSON,
primaryKey: id,
forceValidate: true,
fields: arrFields(componentData),
queryFields: queryParams,
transport: {
read: ({ data }) => read(data),
},
events: {
load: ({ dataSet }) => load(dataSet),
},
});

const arrFields = (data = []) => {
const fields:any[] = [];
data.forEach((item: any) => {
const { width, compType, custHidden, command, renderer, editor, ...others } = item;
fields.push({ ...others });
});
return fields;
};
export { lineDataColumns };
export default indexDataSet;
