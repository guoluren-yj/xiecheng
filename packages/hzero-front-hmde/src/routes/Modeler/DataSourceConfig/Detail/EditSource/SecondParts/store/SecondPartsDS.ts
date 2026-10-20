/**
 * 模型详情页上方 模型详情信息
 */
// import { HZERO_HLOD } from '@/utils/config';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { isEmpty } from 'lodash';

import { isPresetField } from '@/routes/Modeler/ModelDesigner/utils/utils';

const handelSelecte = ({ dataSet, record, isSelect }) => {
  // 拿到孩子们（records）
  const getChildrenArr = (ds, parentRecord) =>
    ds.filter((_record) => _record.get('secParentCode') === parentRecord.get('secCode'));
  // 非主字段可以移动
  const modelCode = record.get('secParentCode');
  if (!modelCode) {
    // 父级
    const childrenArr = getChildrenArr(dataSet, record);
    childrenArr.forEach((item) => {
      if (item.selectable) {
        if (isSelect) {
          dataSet.select(item);
        } else {
          dataSet.unSelect(item);
        }
      }
    });
  } else {
    // 子集
    const parentRecord = dataSet.find(
      (_record) => _record.get('secCode') === record.get('secParentCode')
    );
    if (isSelect) {
      // 选中
    } else {
      parentRecord.isSelected = false;
    }
  }
};
export default (
  typePro = 'left',
  selection = 'multiple',
  completeData,
  otherFields: any[] = [],
  isTenant = false
) =>
  ({
    primaryKey: 'secCode',
    selection,
    parentField: 'secParentCode',
    idField: 'secCode',
    expandField: 'expand',
    autoLocateFirst: false,
    autoLocateAfterCreate: false,
    fields: [
      { name: 'secCode', type: 'string' },
      {
        name: 'aliasName',
        type: 'string',
        label: '字段名称',
        validator: (value, _, record: Record) => {
          let valueArr: Record[] = [];
          if (record.dataSet) {
            valueArr = record.dataSet.filter(
              (ele) =>
                value &&
                typePro === 'right' &&
                ele.get('aliasName') &&
                !Object.prototype.hasOwnProperty.call(ele.data, 'fields') &&
                ele.get('aliasName').toLowerCase() === value.toLowerCase()
            );
          }
          if (record.get('requiredFlag') === 1 && !value) {
            return `${record.get('displayName')}不能为空`;
          }
          return valueArr.length === 0 || valueArr.length === 1
            ? true
            : '存在相同字段名称，请处理冲突。'; // 找不到或只有一个字段跟当前字段相同 则没有冲突字段
        },
      },
      {
        name: 'displayName',
        type: 'string',
        label: '显示名称',
        dynamicProps: ({ record }) => {
          if (record.get('fieldName') && !record.get('fields')) {
            return {
              required: true,
            };
          }
        },
      },
      { name: 'expand', type: 'boolean', ignore: 'always', defaultValue: true },
      { name: 'isValidator', type: 'boolean', ignore: 'always', defaultValue: false }, // 设置校验属性,触发校验
      { name: 'edit', type: 'boolean', ignore: 'always', defaultValue: false }, // 设置编辑属性
      { name: 'secParentCode', type: 'string', parentFieldName: 'secCode' },
      ...otherFields,
    ],
    events: {
      select: (param) => handelSelecte({ ...param, isSelect: true }),
      unSelect: (param) => handelSelecte({ ...param, isSelect: false }),
      update: ({ record, name, value }) => {
        // 更改edit cell 更新缓存数据
        if (typePro === 'left' && completeData?.current) {
          // eslint-disable-next-line no-unused-expressions
          completeData?.current?.some?.((item) => {
            if (
              item.leftFieldUniqueKey === record.get('leftFieldUniqueKey') &&
              item.secParentCode === record.get('secParentCode')
            ) {
              Object.assign(item, { [name]: value });
              return true;
            }
            return false;
          });
        }
        if (typePro === 'right' && completeData?.current) {
          // eslint-disable-next-line no-unused-expressions
          completeData?.current?.some?.((item) => {
            if (
              item.modelFieldCode === record.get('modelFieldCode') &&
              item.secParentCode === record.get('secParentCode')
            ) {
              Object.assign(item, { [name]: value });
              return true;
            }
            return false;
          });
        }
      },
      load: ({ dataSet }) => {
        dataSet.forEach((record: Record) => {
          if (
            record.get('relationKey') ||
            record.get('primaryFlag') === 1 ||
            isPresetField(
              record.get('fieldName'),
              ['others', ['OBJECT_VERSION_NUMBER']],
              'indexOf'
            ) ||
            (isTenant && record.get('subCanAddFlag') !== 1)
          ) {
            Object.assign(record, { selectable: false });
          }
          if (record.get('fields')) {
            if (isTenant) {
              const subCanAddFields = record.get('fields').filter((item) => {
                return item.subCanAddFlag === 1;
              });
              if (isEmpty(subCanAddFields)) {
                Object.assign(record, { selectable: false });
              }
            }
          }
          if (record.get('modelFields')) {
            if (isTenant) {
              const subCanAddFields = record.get('modelFields').filter((item) => {
                return item.subCanAddFlag === 1;
              });
              if (isEmpty(subCanAddFields)) {
                Object.assign(record, { selectable: false });
              }
            }
            record.get('modelFields').forEach((i) => {
              if (
                i.relationKey ||
                i.primaryFlag === 1 ||
                isPresetField(
                  record.get('fieldName'),
                  ['others', ['OBJECT_VERSION_NUMBER']],
                  'indexOf'
                ) ||
                (isTenant && record.get('subCanAddFlag') !== 1)
              ) {
                Object.assign(i, { selectable: false });
              }
            });
          }
        });
      },
    },
  } as DataSetProps);
