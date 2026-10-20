/**
 * 新建逻辑模型左边基础表字段DS
 */
// import sortBy from 'lodash/sortBy';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HMDE } from '@/utils/config';
import notification from 'utils/notification';
import { lowcodeOrganizationURL, capitalToHump } from '@/utils/common';
import { MySQLJdbcType, OracleJdbcType } from '@/routes/Modeler/ModelDesigner/utils/outJdbcType';
import uuidv4hyphenless from '@/utils/uuidv4hyphenless';

const whoNameList = ['OBJECT_VERSION_NUMBER'];
export default function (
  dataModelFieldDataSet,
  refDataSourceType,
  logicModelId,
  resourceUponRoleHierarchy,
  extendsParentCode
) {
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
      {
        name: 'subCanAddFlag',
        label: '是否允许租户自定义',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/tables/columns/by-code-model?refDataSourceType=${refDataSourceType}&logicModelId=${logicModelId}`,
          method: 'get',
          transformResponse(response) {
            const data = JSON.parse(response);
            let cloneData = JSON.parse(JSON.stringify(data));
            if (Array.isArray(cloneData)) {
              let requestData: any[] = [];
              // dataModelFieldDataSet.reset(); // 不能放开 重置会导致移动数据丢失
              // cloneData = sortBy(cloneData, [(o) => !o.primaryFlag, (o) => o.requiredFlag === 1]);
              requestData = cloneData.filter(
                // item => item.requiredFlag === 1 || item.primaryFlag === 1
                (item) => item.primaryFlag === 1 || whoNameList.includes(item.name)
              );
              const dataModelFieldDataSetData = dataModelFieldDataSet.toData(); // 缓存dataModelFieldDataSet的data
              requestData = requestData.filter(
                (ele: any) =>
                  !dataModelFieldDataSetData.some(
                    (item) => item.fieldName.toLowerCase() === capitalToHump(ele.name).toLowerCase()
                  )
              );
              requestData.forEach((record: any) => {
                dataModelFieldDataSet.create({
                  ...record,
                  code: uuidv4hyphenless(),
                  physicalFieldCode: record.code,
                  requiredFlag: 0, // 后端说前端模型这边改成非必输 防止页面那边必输校验
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
                  fieldType: 'TABLE_FIELD',
                  deleteFlag: true, // 判断是前端删除还是后端删除
                  displayName:
                    (record.description && record.description.slice(0, 20)) || record.name,
                });
              });
              // cloneData = cloneData.filter(item => item.primaryFlag !== 1 && item.requiredFlag !== 1);
              // 主键一定强制带入右侧模型表，所以不参与接下来的比对过滤 //
              cloneData = cloneData.filter((item) => item.primaryFlag !== 1);
              // 计算左侧基础表表格中的行们，只返回不在dataModelFieldDataSetData中的行记录 //
              // cloneData = cloneData.filter(
              //   (ele) =>
              //     !dataModelFieldDataSetData
              //       .some(
              //         (item) =>
              //           item.fieldName.toLowerCase() === capitalToHump(ele.name).toLowerCase()
              //       )
              // );
              const diffRecords = getDiffRecords(cloneData, dataModelFieldDataSetData);
              return diffRecords;
            }
            notification.error({
              message: '警告',
              description: cloneData.message,
            });
          },
        };
      },
    },
    events: {
      load: (args) => {
        const { dataSet } = args;
        if (resourceUponRoleHierarchy === 'tenant' && extendsParentCode) {
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
