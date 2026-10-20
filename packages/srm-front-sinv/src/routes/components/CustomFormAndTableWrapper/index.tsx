/* eslint-disable array-callback-return */
/**
 * index.js 收货管理配置-新
 * @date: 2022-11-14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, { FC, useMemo, forwardRef, useImperativeHandle } from 'react';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import intl from 'srm-front-boot/lib/utils/intl/index.js';
import {
  Lov,
  Spin,
  Form,
  Output,
  Select,
  DataSet,
  TextArea,
  TextField,
  IntlField,
  Attachment,
  NumberField,
  DatePicker,
} from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import './index.less';


const compTypeS = {
  Lov,
  Select,
  Output,
  TextArea,
  IntlField,
  TextField,
  Attachment,
  DatePicker,
  NumberField,
};

interface IndexProps {
  className?: string;
  dataSet?: DataSet,
  columns?: number,
  width?: string;
  ref?: any;
}
interface propsProps {
  deps?: any,
  componentData?: Array<any>,
  column?: number,
  spinning?: boolean,
  readOnly?: boolean,
  workFlag?: boolean,
  formWidth?: string,
  autoCreate?: boolean,
  read?: any,
  load?: any,
  update?: any,
  dataSet?: DataSet,
  nodeStrategyId?: string,
}

const CustomForm: FC<IndexProps> = forwardRef((props: propsProps, ref?: any) => {
  const {
    deps,
    column,
    spinning = false,
    readOnly = false,
    componentData = [],
    read,
    load,
    dataSet,
    nodeStrategyId,
  } = props;
  const ds = dataSet || useMemo(() => new DataSet(indexDataSet({ componentData, read, load })), [deps]);

  useImperativeHandle(ref, () => ({ ref, ds }));

  return !isNil(nodeStrategyId) ?
    (
      <Spin spinning={spinning}>
        <Form
          columns={3}
          dataSet={ds}
          useWidthPercent
          labelLayout={LabelLayout.vertical}
          className='form-readOnly'
        >
          {componentData.map((item) => {
            if (!item.custHidden) {
              return <Output name={item.name} />;
            }
          })}
        </Form>
      </Spin>
    )
    : (
      <Spin spinning={spinning}>
        <Form
          dataSet={ds}
          columns={column}
          useWidthPercent
          className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
          labelLayout={readOnly ? LabelLayout.vertical : LabelLayout.float}
        >
          {componentData.map((item) => {
            if (!item.custHidden) {
              if (['TextArea'].includes(item?.compType)) {
                const Child = !readOnly ? (compTypeS[item?.compType]) : Output;
                return <Child name={item?.name} resize={item?.resize} colSpan={item?.colSpan} autoSize={item?.autoSize} maxLength={item?.maxLength} newLine />;
              }
              if (['Attachment'].includes(item?.compType)) {
                const Child = (compTypeS[item.compType]) || Attachment;
                return (
                  <Child
                    name={item?.name}
                    bucketName={item?.bucketName}
                    readOnly={item?.readOnly || false}
                    labelLayout={item?.labelLayout || "float"}
                    help={
                      <span>
                        {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}:
                          .rar .zip .doc .docx .pdf .jpg...
                      </span>
                    }
                  />
                );
              }
              // 日期的特殊规格处理
              // if (['DatePicker'].includes(item?.compType)) {
              //   const Child = !readOnly ? (compTypeS[item?.compType]) : DatePicker;
              //   return (
              //     <Child
              //       name={item?.name}
              //       filter={filterDate}
              //     />
              //   );
              // }
              const Child = !readOnly ? (compTypeS[item.compType] || TextField) : Output;
              return <Child name={item?.name} />;
            }
          })}
        </Form>
      </Spin>
    );
});

/**
 * index.js DS的公共封装
 * @date: 2022-11-14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 * 使用此组件的文件比较多，请勿做针对单个页面的修改
 */
const indexDataSet = ({
  id = '',
  selection = 'multiple',
  componentData = [],
  paging = false,
  pageSize = 10,
  autoCreate = false,
  modifiedCheck = false,
  forceValidate = false,
  cacheModified = false,
  cacheSelection= false,
  read = e => e,
  load = e => e,
  update = e => e,
  validate = e => e,
}: any): DataSetProps => ({
  paging,
  pageSize,
  selection,
  autoCreate,
  primaryKey: id,
  cacheModified,
  forceValidate,
  modifiedCheck,
  cacheSelection,
  fields: arrFields(componentData),
  transport: {
    read: ({ data }) => read(data),
  },
  events: {
    load: ({ dataSet }) => load(dataSet),
    validate: ({ dataSet, result }) => validate(dataSet, result),
    update: ({ record, name, value, dataSet }) => update(record, name, value, dataSet),
  },
});
const arrFields = (data = []) => {
  const fields: Array<Object> = [];
  data.forEach((item?: any) => {
    const {
      width,
      editor,
      resize,
      command,
      colSpan,
      compType,
      readOnly,
      autoSize,
      renderer,
      maxLength,
      custHidden,
      labelLayout,
      ...others
    } = item;
    fields.push({ ...others });
  });
  return fields;
};

/**
     *  行Column处理
     * @delivery {*} params
     * return arr
 */
const lineDataColumns: (x: Array<any>) => any = (columns) => {
  const line = columns.map((item: any) => {
      const {custHidden, ...others } = item;
      if (!item?.custHidden) return { ...others };
      return null;
  });
  return line;
};

export { indexDataSet, lineDataColumns };

export default CustomForm;

