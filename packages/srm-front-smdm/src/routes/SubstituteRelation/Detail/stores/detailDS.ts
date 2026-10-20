import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { langPrefixCode, DetailCustomizeCode } from '../../utils/constant';

const tenantId = getCurrentOrganizationId();

// 基本信息ds
export const subRelationHeaderFormDS = ({ subRelationId }): DataSetProps => {
  return {
    primaryKey: 'subRelationId',
    fields: [
      {
        name: 'displaySubRelationNum',
        type: FieldType.string,
        label: intl.get(`${langPrefixCode}.model.common.subRelationCode`).d('替代方案编码'),
      },
      {
        name: 'subRelationName',
        type: FieldType.string,
        required: true,
        label: intl.get(`${langPrefixCode}.model.common.subRelationName`).d('替代方案名称'),
      },
      {
        name: 'versionNumber',
        type: FieldType.number,
        required: true,
        defaultValue: 1,
        disabled: true,
        label: intl.get(`${langPrefixCode}.model.common.version`).d('版本'),
      },
      {
        name: 'enabledFlag',
        type: FieldType.boolean,
        required: true,
        trueValue: 1,
        falseValue: 0,
        label: intl.get(`${langPrefixCode}.model.common.isEnable`).d('是否启用'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get(`${langPrefixCode}.model.common.remark`).d('备注'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_MDM}/v1/${tenantId}/sub-relation/detail/query`,
          method: 'GET',
          params: {
            subRelationId,
            customizeUnitCode: DetailCustomizeCode.BaseInfoCode,
          },
        };
      },
    },
  };
};


// 表格ds
export const subRelationLineDS = ({ subRelationId }): DataSetProps => {
  return {
    primaryKey: 'subRelationItemId',
    selection: false,
    fields: [
      {
        name: 'displayLineNum',
        type: FieldType.string,
        label: intl.get(`${langPrefixCode}.model.common.displayLineNum`).d('行号'),
      },
      {
        name: 'itemCode',
        type: FieldType.string,
        label: intl.get(`${langPrefixCode}.model.common.itemCode`).d('物料编码'),
      },
      {
        name: 'itemName',
        type: FieldType.string,
        label: intl.get(`${langPrefixCode}.model.common.itemName`).d('物料名称'),
      },
      {
        name: 'mainItemFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        label: intl.get(`${langPrefixCode}.model.common.mainItemFlag`).d('是否为主物料'),
      },
      {
        name: 'specifications',
        type: FieldType.string,
        label: intl.get(`${langPrefixCode}.model.common.specifications`).d('规格'),
      },
      {
        name: 'categoryName',
        type: FieldType.string,
        label: intl.get(`${langPrefixCode}.model.common.categoryName`).d('物料类别'),
      },
      {
        name: 'uomName',
        type: FieldType.string,
        label: intl.get(`${langPrefixCode}.model.common.uomName`).d('单位'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_MDM}/v1/${tenantId}/sub-relation/item/query`,
          method: 'GET',
          params: {
            customizeUnitCode: DetailCustomizeCode.LineTableCode,
          },
          data: {
            subRelationId,
          },
        };
      },
    },
  };
};