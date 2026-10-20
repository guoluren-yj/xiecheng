// import sortBy from 'lodash/sortBy';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HMDE } from '@/utils/config';
import notification from 'utils/notification';
import { lowcodeOrganizationURL, capitalToHump } from '@/utils/common';
import { MySQLJdbcType, OracleJdbcType } from '@/routes/Modeler/ModelDesigner/utils/outJdbcType';

const redNameList = ['REDUNDANT_ID', 'REDUNDANT_RELATION_TABLE', 'REDUNDANT_RELATION_KEY'];

export default function (dataModelFieldDataSet, refDataSourceType) {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'name',
        type: 'string',
        label: '字段名称',
      },
      {
        name: 'description',
        type: 'string',
        label: '字段说明',
      },
    ],
    transport: {
      read: () => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/tables/columns/by-code?fieldType=REDUNDANT_FIELD`,
        method: 'get',
        transformResponse(response) {
          const data = JSON.parse(response);
          const cloneData = JSON.parse(JSON.stringify(data));
          if (Array.isArray(cloneData)) {
            let requestData: any[] = [];
            requestData = cloneData.filter(
              (item) =>
                // item.requiredFlag === 1 ||
                redNameList.includes(item.name) || item.primaryFlag
            );
            requestData = requestData.filter(
              (ele: any) =>
                !(dataModelFieldDataSet || [])
                  .toData()
                  .some(
                    (item) => item.fieldName.toLowerCase() === capitalToHump(ele.name).toLowerCase()
                  ) || ele.primaryFlag // 过滤出主键，如果与模型字段同名，最后保存前过滤掉
            );
            requestData.forEach((record: any) => {
              dataModelFieldDataSet.create({
                ...record,
                originDataType:
                  refDataSourceType !== 'Oracle'
                    ? MySQLJdbcType(record.jdbcType)
                    : OracleJdbcType(record.jdbcType, record.dataSize, record.decimalDigits),
                physicalFieldDataSize: record.dataSize,
                physicalFieldRequiredFlag: record.requiredFlag,
                fieldName: record.name && capitalToHump(record.name),
                dataType:
                  refDataSourceType !== 'Oracle'
                    ? MySQLJdbcType(record.jdbcType)
                    : OracleJdbcType(record.jdbcType, record.dataSize, record.decimalDigits),
                fieldType: 'REDUNDANT_FIELD',
                deleteFlag: true, // 判断是前端删除还是后端删除
                requiredFlag:
                  ['REDUNDANT_RELATION_TABLE', 'REDUNDANT_RELATION_KEY'].includes(record.name) ||
                  record.primaryFlag === 1
                    ? 0
                    : record.requiredFlag,
                displayName: (record.description && record.description.slice(0, 20)) || record.name,
              });
            });
            // cloneData = cloneData.filter(
            //   (ele) =>
            //     !(dataModelFieldDataSet || [])
            //       .toData()
            //       .some(
            //         (item) => item.fieldName.toLowerCase() === capitalToHump(ele.name).toLowerCase()
            //       )
            // );
            const diffRecords = getDiffRecords(cloneData, dataModelFieldDataSet.toData());
            return diffRecords;
          }
          notification.error({
            message: '警告',
            description: cloneData.message,
          });
        },
      }),
    },
    events: {
      load: ({ dataSet }) => {
        // 数据加载完成之后的回调
        dataModelFieldDataSet.forEach((ele) => {
          if (redNameList.includes(ele.get('fieldName')) || ele.get('primaryFlag')) {
            Object.assign(ele, { selectable: false });
          }
        });
        dataSet.remove(dataSet.selected);
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
