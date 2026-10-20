/*
 * @Descripttion: 
 * @version: 
 * @Author: yanglin
 * @Date: 2022-07-21 16:52:03
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-23 07:41:34
 */
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';


export const SearchInputDS = (fuzzyQueryCode) =>
  ({
    fields: [
      {
        name: fuzzyQueryCode,
        type: FieldType.string,
      },
    ],
  } as DataSetProps);
