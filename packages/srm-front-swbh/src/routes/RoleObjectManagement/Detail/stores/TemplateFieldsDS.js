import intl from 'srm-front-boot/lib/utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { SRM_SWBH } from '../../../components/utils/config';

const organizationId = getCurrentOrganizationId();
// 打平数据根据parentId寻找所有父对象列表 返回一个按照父节点顺序从上而下排列的list
export const getParentObjList = (dataSet, parentId) => {
  const objList = [];
  const getParentObj = (_dataSet, _parentId) => {
    const parentNode = _dataSet.find((item) => item.get('secCode') === _parentId);
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
    (_record) => parentRecord.secCode && _record.get('secParentCode') === parentRecord.secCode
  );
  childList.forEach((_record) => {
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
    const parentRecordList = getParentObjList(dataSet, _record.secParentCode);
    if (!isSelect && parentRecordList) {
      parentRecordList.forEach((pRecord) => {
        Object.assign(pRecord, { isSelected: false });
      });
    }
  }
};

// 字段选择
const tableDS = () => ({
  autoQuery: false,
  autoCreate: false,
  selection: 'multiple',
  transport: {
    read: () => ({
      url: isTenantRoleLevel()
        ? `${SRM_SWBH}/v1/${organizationId}/doc-object-rel-fields?tenantId=${organizationId}`
        : `${SRM_SWBH}/v1/doc-object-rel-fields`,
      method: 'GET',
    }),
    destroy: ({ data }) => ({
      url: isTenantRoleLevel()
        ? `${SRM_SWBH}/v1/${organizationId}/doc-object-rel-fields?tenantId=${organizationId}`
        : `${SRM_SWBH}/v1/doc-object-rel-fields`,
      method: 'DELETE',
      data,
    }),
    submit: ({ data, dataSet }) => ({
      url: isTenantRoleLevel()
        ? `${SRM_SWBH}/v1/${organizationId}/doc-object-rel-fields?tenantId=${organizationId}`
        : `${SRM_SWBH}/v1/doc-object-rel-fields`,
      method: 'PUT',
      data,
      params: {
        docObjectRelId: dataSet?.getQueryParameter('docObjectRelId'),
      },
    }),
  },
  fields: [
    {
      name: 'relFieldId',
      type: 'string',
    },
    {
      label: intl.get('swbh.roManagement.view.message.header.docObjectRelId').d('关联对象ID'),
      name: 'docObjectRelId',
      type: 'string',
    },
    {
      label: intl.get('swbh.roManagement.view.message.relBusinessObjectName').d('对象名称'),
      name: 'relBusinessObjectName',
      type: 'string',
    },
    {
      label: intl.get('swbh.roManagement.view.message.boFieldId').d('单据对象字段ID'),
      name: 'boFieldId',
      type: 'string',
    },
    {
      label: intl.get('swbh.roManagement.view.message.boFieldName').d('列字段'),
      name: 'boFieldName',
      type: 'string',
    },
    {
      label: intl.get('swbh.roManagement.view.message.boFieldCode').d('字段编码'),
      name: 'boFieldCode',
      type: 'string',
    },
    {
      label: intl.get('swbh.roManagement.view.message.orderSeq').d('排序'),
      name: 'orderSeq',
      type: 'number',
      required: true,
    },
    {
      label: intl.get('swbh.roManagement.view.message.indexFlag').d('索引'),
      name: 'indexFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`swbh.roManagement.view.message.translateType`).d('翻译类型'),
      name: 'translateType',
      type: 'string',
      lookupCode: 'SWBH.FIELD.TRANSLATE_TYPE',
    },
    {
      label: intl.get('swbh.roManagement.view.message.linkRelFlag').d('关联主数据'),
      name: 'linkRelFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get('swbh.roManagement.view.message.publishStatus').d('发布状态'),
      name: 'publishStatus',
      type: 'string',
    },
  ],
});

const treeDS = () => ({
  autoQuery: false,
  autoCreate: false,
  selection: 'multiple',
  paging: false,
  // parentField: 'parentId',
  // idField: 'id',
  childrenField: 'childList',
  transport: {
    read: ({ params }) => ({
      url: isTenantRoleLevel()
        ? `${SRM_SWBH}/v1/${organizationId}/doc-object-rel-fields?tenantId=${organizationId}`
        : `${SRM_SWBH}/v1/doc-object-rel-fields`,
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
      label: intl.get('swbh.roManagement.view.message.header.fieldName').d('字段名称'),
    },
    {
      name: 'businessObjectName',
      type: 'string',
      label: intl.get('swbh.roManagement.templateField.view.message.header.businessObjectName').d('所属对象'),
    },
    {
      name: 'defaultExportFlag',
      type: 'boolean',
      label: intl.get('swbh.roManagement.templateField.view.message.header.defaultExportFlag').d('默认勾选'),
    },
    {
      name: 'businessObjectFieldCode',
      type: 'string',
      label: intl.get('swbh.roManagement.view.message.header.fieldCode').d('字段编码'),
    },
  ],
});

export { tableDS, treeDS };
