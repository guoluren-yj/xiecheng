import { isEmpty, remove } from 'lodash';
import { DataToJSON, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';

const { HZERO_HMDE, HZERO_PLATFORM } = getEnvConfig();
const organizationId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();
const apiPrefix = isTenant ? `${HZERO_HMDE}/v1/${organizationId}` : `${HZERO_HMDE}/v1`;

const baseQueryDS = (formProps) => {
  let fields = [
    {
      name: 'fileName',
      label: intl.get(`hzero.common.components.export.file`).d('自定义文件名'),
      type: FieldType.string,
    },
    {
      name: 'fillerType',
      label: intl.get(`hzero.common.components.export.type`).d('导出类型'),
      type: FieldType.string,
      lookupCode: 'HPFM.EXCEL_EXPORT_TYPE',
      defaultValue: 'single-sheet',
    },
    {
      name: 'async',
      label: intl.get(`hzero.common.components.export.async`).d('异步导出'),
      type: FieldType.boolean,
      lookupCode: 'HPFM.TRUE_FALSE',
      trueValue: 'true',
      falseValue: 'false',
      computedProps: {
        defaultValue: ({ dataSet }) => {
          return dataSet.getState('defaultRequestMode') === 'ASYNC' ? 'true' : 'false';
        },
      },
    },
    {
      name: 'singleSheetMaxRow',
      label: intl.get(`hzero.common.components.export.singleSheet`).d('单sheet最大行数'),
      type: FieldType.number,
      precision: 0,
      max: 1048575,
    },
    {
      name: 'singleExcelMaxSheetNum',
      label: intl.get(`hzero.common.components.export.maxSheet`).d('文件最大sheet数'),
      type: FieldType.number,
      precision: 0,
      defaultValue: 5,
      max: 9999999,
    },
    {
      name: 'fileType',
      label: intl.get(`hzero.common.components.export.fileType`).d('导出类型'),
      type: FieldType.string,
      lookupCode: 'HMDE.BUSINESS_OBJECT.EXPORT.FILE_TYPE',
    },
  ];
  if (!isEmpty(formProps)) {
    fields = fields.map((field) => {
      if (formProps[field.name]) {
        return {
          ...field,
          ...formProps[field.name],
        };
      } else {
        return field;
      }
    });
  }
  return {
    autoQuery: false,
    fields,
  };
};

const exportTreeDS = () => ({
  id: 'id',
  autoQuery: false,
  idField: 'id',
  parentField: 'parentId',
  checkField: 'checked',
  dataToJSON: DataToJSON.selected,
  fields: [
    {
      name: 'title',
      type: FieldType.string,
    },
    {
      name: 'id',
      type: FieldType.number,
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const {
        requestUrl,
        method,
        defaultSelectAll,
        templateCode,
        templateType,
        ...otherData
      } = data;
      const tableColumns = dataSet?.getState('tableColumns');
      return {
        url: requestUrl,
        method,
        data: {
          ...otherData,
          exportTemplateCode: templateCode,
          exportTemplateType: templateType,
          exportType: 'COLUMN',
        },
        transformResponse: (res) => {
          let parsedData = {};
          try {
            parsedData = JSON.parse(res);
          } catch (e) {
            // do nothing, use default error deal
          }
          if (parsedData) {
            const newData = [];
            const getNewData = (collections = []) => {
              collections.forEach((n) => {
                const { children, ...other } = n;
                let newOtherData = other;
                if (defaultSelectAll) {
                  newOtherData = {
                    ...other,
                    checked: true,
                  };
                }
                // @ts-ignore
                newData.push(newOtherData);
                if (!isEmpty(n.children)) {
                  getNewData(n.children);
                }
              });
            };
            // @ts-ignore
            getNewData([parsedData]);
            if (
              templateCode &&
              Array.isArray(tableColumns.slice()) &&
              tableColumns.slice().length > 0
            ) {
              let order = 1;
              tableColumns.slice().forEach((item) => {
                const pageField = newData.find((i) => i.name === item.name);
                if (pageField) {
                  remove(newData, (value) => {
                    return value.name === item.name;
                  });
                  const fieldData = {
                    ...pageField,
                    title: item.title,
                    checked: true,
                  };
                  newData.splice(order, 0, fieldData);
                  order++;
                }
              });
            }
            return newData;
          }
        },
      };
    },
  },
  events: {
    update: ({ dataSet }) => dataSet.setState('changeFlag', true),
  },
});

const templateListDS = () => ({
  id: 'id',
  autoQuery: false,
  idField: 'id',
  parentField: 'parentId',
  checkField: 'checked',
  dataToJSON: DataToJSON.selected,
  fields: [
    {
      name: 'title',
      type: FieldType.string,
    },
    {
      name: 'id',
      type: FieldType.number,
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${apiPrefix}/bo-user-export-tpls/list-with-predefined`,
        method: 'GET',
        data: {
          exportType: 'COLUMN',
        },
      };
    },
  },
});

const exportHistoryDS = () => ({
  autoQuery: true,
  queryFields: [
    {
      name: 'taskCode',
      label: intl.get('hzero.common.component.excelExport.hd.m.hd.taskCode').d('任务编号'),
      type: FieldType.string,
    },
    {
      name: 'taskName',
      label: intl.get('hzero.common.component.excelExport.hd.m.hd.taskName').d('任务名称'),
      type: FieldType.string,
    },
    {
      name: 'state',
      label: intl.get('hzero.common.component.excelExport.hd.m.hd.state').d('任务状态'),
      type: FieldType.string,
      lookupCode: 'HPFM.ASYNC.TASK.STATE',
    },
  ],
  fields: [
    {
      name: 'taskCode',
      label: intl.get('hzero.common.component.excelExport.hd.m.hd.taskCode').d('任务编号'),
      type: FieldType.string,
    },
    {
      name: 'taskName',
      label: intl.get('hzero.common.component.excelExport.hd.m.hd.taskName').d('任务名称'),
      type: FieldType.string,
    },
    {
      name: 'serviceName',
      label: intl.get('hzero.common.component.excelExport.hd.m.hd.serviceName').d('所属服务'),
      type: FieldType.string,
    },
    {
      name: 'state',
      label: intl.get('hzero.common.component.excelExport.hd.m.hd.state').d('任务状态'),
      type: FieldType.string,
      lookupCode: 'HPFM.ASYNC.TASK.STATE',
    },
    {
      name: 'endDateTime',
      label: intl.get('hzero.common.component.excelExport.hd.m.hd.endDateTime').d('任务结束时间'),
      type: FieldType.dateTime,
    },
    {
      name: 'errorInfo',
      label: intl.get('hzero.common.component.excelExport.hd.m.hd.errorInfo').d('异常信息'),
      type: FieldType.string,
    },
  ],
  transport: {
    read: () => ({
      url: `${HZERO_PLATFORM}/v1/${organizationId}/self/export-task`,
      method: 'GET',
    }),
  },
});

export { baseQueryDS, exportTreeDS, templateListDS, exportHistoryDS };
