import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import intl from 'srm-front-boot/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL, uuid } from '@/utils/common';

// 打平数据根据parentId寻找所有父对象列表 返回一个按照父节点顺序从上而下排列的list
export const getParentObjList = (dataSet, parentId) => {
  const objList: any[] = [];
  const getParentObj = (_dataSet, _parentId) => {
    const parentNode = _dataSet.find(item => item.get('secCode') === _parentId);
    objList.unshift(parentNode);
    const curPid = parentNode.get('secParentCode');
    // _dataSet.splice(index, 1);
    if (curPid) {
      getParentObj(_dataSet, curPid);
    }
  };
  getParentObj(dataSet, parentId);
  return objList;
};

// 拿到孩子们（records）
const getChildrenArr = (ds, parentRecord, isSelect) => {
  const childList = ds.filter(
    _record => parentRecord.secCode && _record.get('secParentCode') === parentRecord.secCode
  );
  childList.forEach(_record => {
    if (_record.get('relateType') && _record.get('secParentCode')) {
      handelSelect({ dataSet: ds, record: _record, isSelect });
    }
  });
  return childList;
};

const handelSelect = ({ dataSet, record, isSelect }) => {
  const _record = record.toData();
  // 非主字段可以移动
  const modelCode = _record.secParentCode;
  const { relateType } = _record;
  if (!modelCode || relateType) {
    // 父级
    const childrenArr = getChildrenArr(dataSet, _record, isSelect);
    childrenArr.forEach(item => {
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
    const parentRecordList = getParentObjList(dataSet, _record.secParentCode);
    if (!isSelect && parentRecordList) {
      parentRecordList.forEach(pRecord => {
        Object.assign(pRecord, { isSelected: false });
      });
    }
  }
};

const handleEnabled = params => {
  if (params.value) {
    handleParentEabled(params);
    // handleChidrenEabled(params);
  }
};

// const handleChidrenEabled = ({ dataSet, record: parentRecord, name, value }) => {
//   const childList = dataSet.filter(
//     _record =>
//       parentRecord.get('secCode') && _record.get('secParentCode') === parentRecord.get('secCode')
//   );
//   childList.forEach(_record => {
//     _record.set(name, value);
//     handleChidrenEabled({ dataSet, record: _record, name, value });
//   });
// };

const handleParentEabled = ({ dataSet, record, name, value }) => {
  const parent = dataSet.find(
    parentRecord =>
      record.get('secParentCode') && record.get('secParentCode') === parentRecord.get('secCode')
  );
  if (parent && parent.get('relateType') !== 'MASTER') {
    parent.set(name, value);
    handleParentEabled({ dataSet, record: parent, name, value });
  }
};

const addSecCodeAndSecParentCode = (res, children = 'childList') => {
  res.forEach((item: any) => {
    const id = item.id ? item.id : uuid();
    Object.assign(item, { secCode: id });
    if (item[children] && item[children].length > 0) {
      item[children].forEach(child => {
        Object.assign(child, { secParentCode: id });
      });
      addSecCodeAndSecParentCode(item[children], children);
    }
  });
};
const tableDS = () =>
  ({
    autoQuery: false,
    autoCreate: false,
    selection: 'multiple',
    childrenField: 'childList',
    pageSize: 10,
    transport: {
      read: ({ params }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-objects-export-template-columns/tree`,
        method: 'GET',
        params,
        transformResponse: data => {
          if (!data) return null;
          try {
            const originData = JSON.parse(data);
            addSecCodeAndSecParentCode([originData], 'childList');
            const result = [originData];
            if (originData.templateFormulaFields && originData.templateFormulaFields.length > 0) {
              result.push(...originData.templateFormulaFields);
            }
            return result;
          } catch (e) {
            return null;
          }
        },
      }),
      destroy: ({ data }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-objects-export-template-columns/batch`,
        method: 'DELETE',
        data,
      }),
      submit: ({ data, dataSet }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-objects-export-template-columns/batch`,
        method: 'POST',
        data: data.filter(item => item.relateType !== 'MASTER'),
        params: {
          businessObjectExportTemplateId: dataSet?.getQueryParameter(
            'businessObjectExportTemplateId'
          ),
        },
      }),
    },
    events: {
      select: param => handelSelect({ ...param, isSelect: true }),
      unSelect: param => handelSelect({ ...param, isSelect: false }),
      load: ({ dataSet }) => {
        dataSet.forEach(i => {
          if (i?.get('tenantId') !== getCurrentOrganizationId()) {
            Object.assign(i, { selectable: false });
          }
        });
      },
      update: config => {
        if (config.name === 'enabledFlag') {
          handleEnabled(config);
        }
      },
    },
    fields: [
      {
        label: intl.get('hmde.boComposition.view.message.header.businessObject').d('业务对象'),
        name: 'businessObjectName',
        type: 'string',
      },
      {
        label: intl.get('hmde.common.view.message.orderSeq').d('排序'),
        name: 'orderSeq',
        type: 'number',
        dynamicProps: {
          required: ({ record }) => {
            return record.get('relateType') !== 'MASTER';
          },
        },
      },
      {
        name: 'aliasName',
        type: 'string',
        label: intl
          .get('hmde.boComposition.exportTemplateField.view.message.header.aliasName')
          .d('字段编码别名'),
        pattern: /^[_a-z][0-9a-zA-Z]{0,}[0-9a-zA-Z_]$/,
      },
      {
        name: 'displayName',
        type: 'intl',
        label: intl
          .get('hmde.boComposition.exportTemplateField.view.message.header.displayName')
          .d('列字段别名'),
        dynamicProps: {
          required: ({ record }) => record.get('businessObjectCode') === '_$_FORMULA_OBJECT_$_',
        },
      },
      {
        label: intl
          .get('hmde.boComposition.exportTemplateField.view.message.header.columnField')
          .d('列字段'),
        name: 'businessObjectFieldName',
        type: 'string',
      },
      // {
      //   name: 'businessObjectFieldCode',
      //   type: 'string',
      // },
      {
        name: 'businessObjectFieldCode',
        type: 'string',
        label: intl.get('hmde.boComposition.view.message.header.fieldCode').d('字段编码'),
        dynamicProps: {
          required: ({ record }) => record.get('businessObjectCode') === '_$_FORMULA_OBJECT_$_',
        },
      },
      // {
      //   label: intl.get('hmde.common.label.remark').d('描述'),
      //   name: 'remark',
      //   type: 'string',
      // },
      {
        label: intl
          .get('hmde.boComposition.exportTemplateField.view.message.header.defaultExportFlag')
          .d('默认勾选'),
        name: 'defaultExportFlag',
        type: 'boolean',
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hmde.bo.model.status.enabledFlag').d('启用'),
      },
    ],
  } as DataSetProps);

const treeDS = () =>
  ({
    autoQuery: false,
    autoCreate: false,
    selection: 'multiple',
    paging: false,
    // parentField: 'parentId',
    // idField: 'id',
    childrenField: 'childList',
    transport: {
      read: ({ params }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-objects-export-template-columns/tree`,
        method: 'GET',
        params,
      }),
    },
    fields: [
      { name: 'id', type: 'string' },
      { name: 'parentId', type: 'string', parentFieldName: 'id' },
      {
        name: 'aliasName',
        type: 'string',
      },
      {
        name: 'businessObjectCode',
        type: 'string',
      },
      {
        name: 'businessObjectExportTemplateColumnId',
        type: 'string',
      },
      {
        name: 'businessObjectFieldCode',
        type: 'string',
      },
      {
        name: 'businessObjectFieldName',
        type: 'string',
        label: intl.get('hmde.boComposition.view.message.header.fieldName').d('字段名称'),
      },
      {
        name: 'businessObjectName',
        type: 'string',
        label: intl
          .get('hmde.boComposition.exportTemplateField.view.message.header.businessObjectName')
          .d('所属对象'),
      },
      {
        name: 'defaultExportFlag',
        type: 'boolean',
        label: intl
          .get('hmde.boComposition.exportTemplateField.view.message.header.defaultExportFlag')
          .d('默认勾选'),
      },
      {
        name: 'businessObjectFieldCode',
        type: 'string',
        label: intl.get('hmde.boComposition.view.message.header.fieldCode').d('字段编码'),
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach(record => {
          if (
            (record?.get('relateType') && record?.get('relateType') === 'MASTER') ||
            record?.get('businessObjectExportTemplateColumnId')
          ) {
            Object.assign(record, { selectable: false });
          }
          return record;
        });
      },
    },
  } as DataSetProps);

const flatTreeDS = () =>
({
  autoQuery: false,
  autoCreate: false,
  selection: 'multiple',
  paging: false,
  idField: 'columnId',
  parentField: 'parentColumnId',
  dataKey: 'childList',
  transport: {
    read: ({ params }) => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/business-objects-export-template-columns/tree`,
      method: 'GET',
      params: {
        ...(params || {}),
        platFlag: true,
      },
    }),
  },
  fields: [
    { name: 'id', type: 'string' },
    { name: 'parentId', type: 'string', parentFieldName: 'id' },
    {
      name: 'aliasName',
      type: 'string',
    },
    {
      name: 'businessObjectCode',
      type: 'string',
    },
    {
      name: 'businessObjectExportTemplateColumnId',
      type: 'string',
    },
    {
      name: 'businessObjectFieldCode',
      type: 'string',
    },
    {
      name: 'businessObjectFieldName',
      type: 'string',
      label: intl.get('hmde.boComposition.view.message.header.fieldName').d('字段名称'),
    },
    {
      name: 'businessObjectName',
      type: 'string',
      label: intl
        .get('hmde.boComposition.exportTemplateField.view.message.header.businessObjectName')
        .d('所属对象'),
    },
    {
      name: 'defaultExportFlag',
      type: 'boolean',
      label: intl
        .get('hmde.boComposition.exportTemplateField.view.message.header.defaultExportFlag')
        .d('默认勾选'),
    },
    {
      name: 'businessObjectFieldCode',
      type: 'string',
      label: intl.get('hmde.boComposition.view.message.header.fieldCode').d('字段编码'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (
          (record?.get('relateType') && record?.get('relateType') === 'MASTER') ||
          record?.get('businessObjectExportTemplateColumnId')
        ) {
          Object.assign(record, { selectable: false });
        }
        return record;
      });
    },
  },
} as DataSetProps);

export { tableDS, treeDS, flatTreeDS };
