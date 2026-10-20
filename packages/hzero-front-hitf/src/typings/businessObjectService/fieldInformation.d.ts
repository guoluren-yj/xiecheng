// 业务对象组合接口
declare global {
  namespace boModel {
    namespace combine {
      // 业务对象字段信息
      interface IBusinessObjectRelationFieldList extends common.BusinessDomain {
        // ... 字段信息
        aliasName: string;
        businessObjectFieldCode: string;
        businessObjectFieldId: number;
        businessObjectFieldName: string;
        businessObjectRelationFieldId: number;
        businessObjectRelationId: number;
        componentType: string;
        displayName: string;
        tenantId: number;
      }

      interface IRelateConditions {
        fieldCode: string;
        type: string;
        value: string;
      }
      //
      // 业务对象组合信息
      interface IBusinessObject extends common.BusinessDomain {
        businessObjectCode: string;
        businessObjectId: number; // 组合业务对象
        businessObjectName: string;
        relBusinessObjectName: string;
        relBusinessObjectPrimaryKeyCode: string;
        businessObjectRelationFieldList: IBusinessObjectRelationFieldList[];
        businessObjectRelationId: number; // 主键
        businessObjectRelationList: IBusinessObject[];
        orderSeq: number;
        parentBusinessObjectFieldId: number;
        parentId: undefined | string;
        relBusinessObjectId: number; // 单个业务对象
        refBusinessObjectFieldName: string;
        relateBusinessObjectCode: string;
        relateBusinessObjectFieldId: number;
        relateBusinessObjectId: number;
        relateType: string;
        tenantId: number;
        relBusinessObjectAssociateName: number; // 高级关系名称
        linkRelationType?: string;
        relateConditions?: IRelateConditions[];
        relateBusinessObjectFieldCode?: string;
        parentBusinessObjectFieldCode?: string;
      }
    }
  }
}
export {};
