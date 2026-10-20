/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-filename-extension */

/**
 * index.js Form表单 以及ds封装
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
  Spin,
  Form,
  Output,
  DataSet,
  TextField,
  Attachment,
} from 'choerodon-ui/pro';
import './index.less';

interface IndexProps {
  className?: string;
  dataSet?: DataSet,
  columns?: number,
  width?: string;
  ref?: any;
}
interface propsProps {
  read?: any,
  load?: any,
  update?:any,
  deps?: any,
  select?: any,
  unSelect?: any,
  spinning?: boolean,
  readOnly?: boolean,
  workFlag?: boolean,
  autoCreate?: boolean,
  forceValidate?: boolean,
  column?: number,
  formWidth?: string,
  nodeStrategyId?: string,
  componentData?: Array<any>,

}

/**
 * index.js Form表单的公共封装
 * @date: 2022-11-14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 * 使用此组件的文件比较多，请勿做针对单个页面的修改,如需修改，请先在组件内修改，再在页面中修改，否则会导致其他页面报错
 * @扩展属性如下：
 * @compStats string 组件类型属性(目前仅用于TextArea, Attachment)
 * @compType Component 组件类型，传入引用的组件，必填！
 * @custHidden boolean 是否隐藏, true隐藏 false 展示 默认false
 */
const CustomForm: FC<IndexProps> = forwardRef((props: propsProps, ref?: any) => {
  const {
    deps,
    read,
    load,
    update,
    column,
    formWidth,
    spinning = false,
    readOnly = false,
    autoCreate = false,
    forceValidate = false,
    componentData = [],
  } = props;
  const ds = useMemo(() => new DataSet(indexDataSet({ componentData, autoCreate, forceValidate, read, load, update })), [deps]);

  useImperativeHandle(ref, () => ({ ref, ds }));

  return (
    <Spin spinning={spinning}>
      <Form
        dataSet={ds}
        columns={column}
        useWidthPercent
        style={{ width: formWidth || '75%' }}
        className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
        labelLayout={readOnly ? LabelLayout.vertical : LabelLayout.float}
      >
        {componentData.map((item) => {
          if (!item.custHidden) {
            if (["TextArea"].includes(item?.compStats)) {
                const Child = !readOnly ? (item?.compType) : Output;
                return <Child name={item?.name} resize={item?.resize || "both"} cols={item?.cols} colSpan={item?.colSpan} autoSize={item?.autoSize} maxLength={item?.maxLength} newLine />;
              }
              if (['Attachment'].includes(item?.compStats)) {
                const Child = (item?.compType) || Attachment;
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
              const Child = !readOnly ? (item?.compType || TextField) : Output;
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
  select = e => e,
  unSelect = e => e,
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
    read: ({ data, params, dataSet }) => read(data, params, dataSet),
  },
  events: {
    load: ({ dataSet }) => load(dataSet),
    validate: ({ dataSet, result }) => validate(dataSet, result),
    update: ({ record, name, value, dataSet }) => update(record, name, value, dataSet),
    select: ({ dataSet, record, previous }) => select(dataSet, record, previous),
    unSelect: ({ dataSet, record }) => unSelect(dataSet, record),
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
