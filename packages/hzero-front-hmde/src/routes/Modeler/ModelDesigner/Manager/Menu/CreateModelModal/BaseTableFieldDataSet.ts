/**
 * 新建逻辑模型左边基础表字段DS
 */
/* eslint-disable no-unused-vars */
// import sortBy from 'lodash/sortBy';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

import { HZERO_HMDE } from '@/utils/config';
import { MySQLJdbcType, OracleJdbcType } from '@/routes/Modeler/ModelDesigner/utils/outJdbcType';
import { lowcodeOrganizationURL, capitalToHump } from '@/utils/common';
import uuidv4hyphenless from '@/utils/uuidv4hyphenless';

// import uuidv4 from 'uuid/v4';

const whoNameList = ['OBJECT_VERSION_NUMBER'];

export default function (dataModelFieldDataSet, resourceUponRoleHierarchy) {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'name',
        type: FieldType.string,
        label: '字段名称',
      },
      {
        name: 'description',
        type: FieldType.string,
        label: '字段说明',
      },
      {
        name: 'code',
        type: FieldType.string,
        label: '字段编码',
      },
      {
        name: 'subCanAddFlag',
        label: '是否允许租户自定义',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: ({ data: params }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/tables/columns/by-code-model`,
        method: 'get',
        transformResponse: (data) => {
          let primItemArr: any[] = [];
          let parseData = JSON.parse(data);
          if (parseData?.failed) {
            console.error(parseData?.message);
            parseData = [];
          }
          // dataModelFieldDataSet.reset(); // 不能放开 重置会导致移动的数据失效
          dataModelFieldDataSet.forEach((record) => {
            // 删除上一次的主键和who字段
            if (record.get('primaryFlag') === 1 || whoNameList.includes(record.get('name'))) {
              dataModelFieldDataSet.remove(record);
            }
          });
          const dataModelFieldDataSetData = dataModelFieldDataSet.toData(); // 缓存dataModelFieldDataSet的data
          primItemArr = parseData.filter(
            (item) =>
              item.primaryFlag === 1 ||
              whoNameList.includes(item.name) ||
              (resourceUponRoleHierarchy === 'tenant' && item.parentFieldFlag === 1) // parentFieldFlag 继承时是否为表示父模型有的字段 继承的时候把父模型全部移过去
          );
          primItemArr = primItemArr.filter(
            (ele) =>
              !dataModelFieldDataSetData.some(
                (item) => item.fieldName.toLowerCase() === capitalToHump(ele.name).toLowerCase()
              )
          );
          primItemArr.forEach((primItem) => {
            dataModelFieldDataSet.create({
              ...primItem,
              code: uuidv4hyphenless(),
              physicalFieldCode: primItem.code,
              requiredFlag: 0, // 后端说前端模型这边改成非必输 防止页面那边必输校验
              physicalFieldDataSize: primItem.dataSize,
              physicalFieldRequiredFlag: primItem.requiredFlag,
              fieldName: primItem.name && capitalToHump(primItem.name),
              dataType:
                params.refDataSourceType !== 'Oracle'
                  ? MySQLJdbcType(primItem.jdbcType)
                  : OracleJdbcType(primItem.jdbcType, primItem.dataSize, primItem.decimalDigits),
              originDataType:
                params.refDataSourceType !== 'Oracle'
                  ? MySQLJdbcType(primItem.jdbcType)
                  : OracleJdbcType(primItem.jdbcType, primItem.dataSize, primItem.decimalDigits),
              fieldType: 'TABLE_FIELD',
              displayName:
                (primItem.description && primItem.description.slice(0, 20)) || primItem.name,
            });
          });
          parseData = parseData.filter((item) => item.primaryFlag !== 1);
          // parseData = parseData.filter(
          //   (ele) =>
          //     !dataModelFieldDataSet
          //       .toData()
          //       .some(
          //         (item) => item.fieldName.toLowerCase() === capitalToHump(ele.name).toLowerCase()
          //       )
          // );
          // return parseData;
          const diffRecords = getDiffRecords(parseData, dataModelFieldDataSet.toData());
          return diffRecords;
        },
      }),
    },
    // 前端生成uuid覆盖掉原code
    events: {
      load: (args) => {
        const { dataSet } = args;
        if (resourceUponRoleHierarchy === 'tenant' && dataSet.getState('extendsParentCode')) {
          // 继承添加模型字段弹窗，第二步的左边，如果没有subCanAddFlag或subCanAddFlag ===  0 则不能添加到右边
          dataSet.records.forEach((record) => {
            // eslint-disable-next-line
            record.selectable = !!record.get('subCanAddFlag');
          });
        }
      },
    },
  } as DataSetProps;
}

/**
 * 比对基础表records和模型表records，返回不在模型表中的records
 * 这是一个单向diff，因为模型表records必包含于基础表records
 */
function getDiffRecords(baseRecords: any[], modelRecords: any[]) {
  const modelRecordsDict = {};
  const diffRecords: any[] = [];

  modelRecords.forEach((record) => {
    modelRecordsDict[record.fieldName.toLowerCase()] = record;
  });

  baseRecords.forEach((record) => {
    if (!modelRecordsDict[capitalToHump(record.name).toLowerCase()]) {
      diffRecords.push(record);
    }
  });

  return diffRecords;
}
