declare global {
  namespace model {
    // PS: 以下都是模型服务中的

    // 返回值：
    // queryModelDataService
    // queryRelationListService
    // 参数：
    // deleteModelList
    interface LogicModel extends BaseLogicModel {
      children: LogicModel[];
      conditions: data.DataObjectModelConditions[];
      dataModelId: string | number;
      logicModelCode: string;
      logicModelId: string | number;
      logicModelName: string;
      logicModelType: string;

      dataObjectId: string | number;
      joinType: string;
      masterFlag: number;
      orderSeq: number;
      parentId: string | number;
      publishStatus: string;
      relation: relation.ModelRelation[];
      relationCode: string;
      strongRelationFlag: number;
    }

    // 返回值：
    // queryFirstFieldsService
    // querySourceFieldsService
    // 参数：
    // queryFirstFieldsService
    // querySourceFieldsService
    interface BaseLogicModel extends common.common.AuditDomain {
      apiBinds: ApiBind[];
      appId?: string | number;
      assignPattern: string;
      code: string;
      dataSourceType: string;
      dataSourceTypeMeaning: string;
      description: string;
      enabledFlag: number;
      extendsParentCode: string;
      extendsParentName: string;
      grade: string;
      id: number;
      labelAssignList: common.Label[];
      modelFields: ModelField[];
      modelRelation: relation.ModelRelation;
      modelRelations: relation.ModelRelation[];
      multiLanguageFlag: number;
      name: string;
      operateFlag: boolean;
      primaryKey: string;
      publishStatus: string;
      redundantTableCode: string;
      redundantTableName: string;
      redundantTableType: string;
      refSchemaName: string;
      refDataSourceType: string;
      refServiceCode: string;
      refTableCode: string;
      refTableName: string;
      subCanAddFlagList: SubCanAddFlag[];
      tenantFlag: number;
      tenantId: string | number;
      type: string;
    }

    interface ApiBind extends common.AuditDomain {
      action: string;
      apiCode: string;
      apiMethod: string;
      apiName: string;
      apiPath: string;
      logicModelApiBindId: string | number;
      logicModelId: string | number;
      modelFieldMappings: ModelFieldMapping[];
      requestBodyBatchFlag: number;
      responseBodyBatchFlag: number;
      serviceCode: string;
      tenantId: 0;
    }

    interface SubCanAddFlag extends common.AuditDomain {
      code: string;
      dataSize: number;
      decimalDigits: number;
      defaultValue: string;
      description: string;
      id: string | number;
      jdbcType: number;
      refTableId: number;
      name: string;
      parentFieldFlag: number;
      primaryFlag: number;
      requiredFlag: number;
      subCanAddFlag: number;
      subCanEditFlag: number;
      tenantId: string | number;
      type: string;
    }

    // 返回值：
    // modelObjectsSelectService
    // fieldBatchUpdateService
    // getApiFieldsService
    // servicesListService
    // 参数：
    // modelObjectsSelectService
    // fieldBatchUpdateService
    // getApiFieldsService
    // servicesListService
    // 模型字段
    interface ModelField extends BaseModelField {
      code: string;
      description: string;
      enabledFlag: number;
      fieldType: string;
      formulaContent: string;
      id: string | number;
      logicModelCode: string;
      logicModelId: string | number;
      modelFieldGroupList: ModelFieldGroup[];
      multiLanguageFlag: number;
      physicalFieldDataSize: number;
      originDataType: string;
      physicalFieldRequiredFlag: number;
      parentFieldFlag: number;
      ruleName: string;
      sourceLogicModelId: string | number;
      subCanEditFlag: number;
      tenantId: string | number;
    }

    interface BaseModelField extends BaseField {
      defaultValue: string;
      encryptFlag: number; // 1表示加密
      fieldName: string;

      hiddenFlag: boolean;

      leftFieldUniqueKey: string;

      originRefTableName: string;

      primaryFlag: number;
      refSchemaName: string;
      refDataSourceType: string;
      refTableName: string;
      relationKey: number;
      requiredFlag: number;
      rightFieldUniqueKey: string;
      ruleCode: string;

      subCanAddFlag: number;

      valueListCode: string;
      valueListName: string;
    }

    interface BaseField extends common.AuditDomain {
      aliasName: string;
      dataSize: number;
      dataType: string;
      displayName: string;
    }

    interface ModelFieldMapping extends common.AuditDomain {
      apiBindId: string | number;
      logicModelFieldMappingId: string | number;
      logicModelId: string | number;
      mappingFieldCode: string;
      modelFieldCode: string;
      parameterCode: string;
      parameterDirection: string;
      parameterLocation: string;
      parameterName: string;
      parameterType: string;
      tenantId: string | number;
    }

    interface ModelFieldGroup extends common.AuditDomain {
      groupCode: string;
      logicModelCode: string;
      logicModelFieldGroupId: string | number;
      logicModelName: string;
      modelFieldCode: string;
      modelFieldDisplayName: string;
      modelFieldName: string;
      tenantId: string | number;
    }

    namespace data {
      // 返回值：
      // queryFirstFieldsService
      // querySourceFieldsService
      // 参数：
      // queryFirstFieldsService
      // querySourceFieldsService
      interface DataObjectFieldVO {
        logicModelCode: string;
        logicModelName: string;
        masterFlag: number;
        logicModelId: number | string;
        relationCode: string;
        relationName: string;
        modelFields: ModelField[];
      }

      // 这个是接口参数，包含了 modeler + lowcode 的所有属性
      // 返回值：
      // saveModelList
      // updateModel
      // fetchModelList
      // fetchModelListOnlyUnUesd
      // 参数：
      // queryRelationListService
      // saveModelList
      // updateModel
      interface DataObject extends BaseDataObject {
        children: DataObject[];
        publishStatus: string;
        sum: number;
        inUseFlag: boolean;
        componentType: string;
        componentName: string;
      }

      // 返回值:
      // querySourceListService
      interface BaseDataObject extends common.AuditDomain {
        assignPattern: string | null; // 数据对象授权模式
        dataModelFieldControlList: any[];
        dataObjectCategory: string; // 数据对象分类
        dataObjectCode: string; // 数据对象代码
        dataObjectId: number | string; // 表ID，主键，供其他表做外键
        dataObjectName: string; // 数据对象名称
        dataObjectOwnerType: string; // 数据对象Owner类型
        extendsParentCode?: string | null; // 继承父级数据对象的编码
        extendsParentName?: string;
        labelAssignList: common.Label[]; // 模型分配的标签列表
        logicModelCode: string; // 模型对象code，hmde_model_object.code
        masterModel: DataObjectModel; // 数据对象关联逻辑模型拟定

        publishStatus: string; // 发布状态
        tenantId: string | number; // 租户ID
        virtualFieldList: DataVirtualField[]; // 虚拟字段列表
      }

      interface DataObjectModel extends common.AuditDomain {
        children: DataObjectModel;
        conditions: DataObjectModelConditions[];
        dataModelId: string | number;
        dataObjectId: string | number;
        fields: BaseDataObjectField[];
        joinType: string;
        logicModelCode: string;
        logicModelId: string | number;
        logicModelName: string;
        logicModelType: string;
        masterFlag: number;
        operateFlag: boolean;
        orderSeq: number;
        parentId: string | number;
        publishStatus: string;
        redundantTableName: string;
        referenceSchemaName: string;
        referenceDataSourceType: string;
        referenceServiceCode: string;
        referenceTableName: string;
        relation: relation.ModelRelation;
        relationCode: string;
        strongRelationFlag: number;
        tenantFlag: number;
        tenantId: string | number;
        treeModelKey?: string; // 前端临时 变量，代替dataModelId
        treeParentModelKey?: string; // 前端临时变量
      }

      interface DataObjectModelConditions extends common.AuditDomain {
        dataConditionId: number | string;
        dataModelId: string | number;
        detailList: DataObjectConditionDetail[];
        groupCode: string;
        logicFormula: string;
        tenantId: string | numeber;
      }

      interface DataObjectConditionDetail extends common.AuditDomain {
        dataConditionDetailId: string | number;
        dataConditionId: string | number;
        fieldCode: string;
        leftDisplayText: string;
        leftFieldName: string;
        leftFieldType: string;
        leftFieldUniqueKey: string;
        leftHeaderRelationCode: string;
        leftHeaderRelationName: string;
        operatorType: string;
        orderSeq: number;
        rightDisplayText: string;
        rightFieldName: string;
        rightFieldUniqueKey: string;
        rightHeaderRelationCode: string;
        rightHeaderRelationName: string;
        tenantId: string | number;
        value: string;
        valueType: string;
      }

      // 参数：
      // 数据对象关联逻辑模型字段拟定
      interface BaseDataObjectField extends model.BaseModelField {
        dataFieldId: string | number;
        dataModelId: string | number;
        decimalDigits: number;
        fieldCode: string;
        headerOrderSeq: number;
        modelFieldCode: string;
        noSaveFlag: boolean;
      }

      // 数据对象虚拟字段拟定
      interface DataVirtualField extends model.BaseField {
        dataObjectId: string | number;
        dataVirtualFieldId: string | number;
        decimalDigits: number;
        description: string;
        fieldCode: string;
        formulaCompileResult: string;
        formulaContent: string;
        tenantId: string | number;
        virtualFieldType: string;
      }

      // 参数：
      // saveJsonData
      interface PageDataSource {
        _status: common.RecordStatus;
        source: DataObject[];
      }
    }

    namespace relation {
      // 返回值：
      // createLogicModelsService
      // queryRelationService
      // editLogicModelsService
      // 参数：
      // createLogicModelsService
      // editLogicModelsService
      interface ModelRelation extends BaseModelRelation {
        failed?: true;
      }

      interface BaseModelRelation extends common.AuditDomain {
        code: string;
        description: string;
        extendsParentCode: string;
        id: string | number;
        masterSchemaName: string;
        masterDataSourceType: string;
        masterLogicModelCode: string;
        masterLogicModelId: number | string;
        masterLogicModelName: string;
        masterTable: string;
        name: string;
        relationSchemaName?: string;
        relationDataSourceType?: string;
        relationFields: BaseModelRelationField[];
        relationLogicModelCode: string;
        relationLogicModelId: number | string;
        relationLogicModelName: string;
        relationTable?: string;
        relationType: string;
        tenantId: string | number;
      }

      interface BaseModelRelationField extends common.AuditDomain {
        id: number | string;
        masterModelFieldCode: string;
        masterModelFieldName: string;
        relationId: number | string;
        relationModelFieldCode: string;
        relationModelFieldName: string;
      }
    }
  }
}
export {};
