/**
 * 服务注册-多语言
 * @author baitao.huang@hand-china.com
 * @date 2020-03-12
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.mapping.debug';

  const LANGS = {
    PREFIX,
    CREATE: intl.get('hzero.common.create').d('新建'),
    INCREASE: intl.get('hzero.common.button.add').d('新增'),
    EDIT: intl.get('hzero.common.edit').d('编辑'),
    VIEW: intl.get('hzero.common.button.view').d('查看'),
    SURE: intl.get('hzero.common.button.ok').d('确定'),
    CLOSE: intl.get('hzero.common.button.close').d('关闭'),
    DELETE: intl.get('hzero.common.button.delete').d('删除'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),
    TENANT: intl.get('hzero.common.model.common.tenant').d('租户'),

    MAPPING_TYPE: intl.get(`${PREFIX}.view.model.mapping.type`).d('字段映射类型'),
    MAPPING_DEBUG: intl.get(`${PREFIX}.view.title.mappingDebug`).d('映射调试'),
    FIELD_CONFIG: intl.get(`${PREFIX}.model.fieldConfig`).d('字段映射配置'),
    SOURCE_DATA: intl.get(`${PREFIX}.model.sourceData`).d('来源报文'),
    TARGET_DATA: intl.get(`${PREFIX}.model.targetData`).d('目标报文'),
    SCRIPT_DATA: intl.get(`${PREFIX}.model.scriptData`).d('转化脚本'),
    DATA_CONFIG: intl.get(`${PREFIX}.model.dataConfig`).d('数据映射配置'),
    RESULT_DATA: intl.get(`${PREFIX}.model.resultData`).d('调试结果'),
    FIELD_MAPPING_DEBUG: intl.get(`${PREFIX}.view.title.fieldDebug`).d('字段映射调试'),
    DATA_MAPPING_DEBUG: intl.get(`${PREFIX}.view.title.dataDebug`).d('数据映射调试'),
    DATA_MAPPING_TIP: intl
      .get(`${PREFIX}.view.message.dataMappingTip`)
      .d(
        '调试仅对来源报文执行数据映射处理，流程调试将同时执行字段映射处理与数据映射处理；如需执行流程调试，请确保字段映射或者数据映射至少配置了其中一个'
      ),

    CREATE_LINE: intl.get(`${PREFIX}.view.title.createLine`).d('创建数据映射配置'),
    EDIT_LINE: intl.get(`${PREFIX}.view.title.editLine`).d('更新数据映射配置'),
    BASIC_INFO: intl.get(`${PREFIX}.view.title.basicInfo`).d('基本信息'),
    DETAIL_INFO: intl.get(`${PREFIX}.view.title.detailInfo`).d('转换维护'),
    FORMULA_MAINTAIN: intl.get(`${PREFIX}.view.title.formulaMaintain`).d('公式维护'),
    CAST_VAL_MAINTAIN: intl.get(`${PREFIX}.view.title.castValMaintain`).d('值转换维护'),
    CONDITION_MAINTAIN: intl.get(`${PREFIX}.view.title.conditionMaintain`).d('条件维护'),
    SEQ_NUMBER: intl.get(`${PREFIX}.model.dataMapping.seqNumber`).d('序号'),
    CAST_CODE: intl.get(`${PREFIX}.model.dataMapping.castCode`).d('数据映射代码'),
    CAST_NAME: intl.get(`${PREFIX}.model.dataMapping.castName`).d('数据映射名称'),
    DATA_TYPE: intl.get(`${PREFIX}.model.dataMapping.dataType`).d('数据映射类型'),
    STATUS: intl.get(`${PREFIX}.view.title.status`).d('状态'),
    CAST_TYPE: intl.get(`${PREFIX}.model.dataMapping.castType`).d('数据映射类型'),
    CAST_ROOT: intl.get(`${PREFIX}.model.dataMapping.castRoot`).d('字段路径'),
    CAST_FIELD: intl.get(`${PREFIX}.model.dataMapping.castField`).d('字段名称'),
    CAST_FORMULA: intl.get(`${PREFIX}.model.dataMapping.castFormula`).d('公式转换'),
    CAST_VAL: intl.get(`${PREFIX}.model.dataMapping.castVal`).d('值转换'),
    CAST_SQL: intl.get(`${PREFIX}.model.dataMapping.castSql`).d('SQL转换'),
    CAST_DATASOURCE: intl.get(`${PREFIX}.model.dataMapping.castDatasource`).d('数据源'),
    CAST_DATASOURCE_SCHEMA: intl
      .get(`${PREFIX}.model.dataMapping.castDatasourceSchema`)
      .d('数据源schema'),
    SQL: intl.get(`${PREFIX}.model.dataMapping.Sql`).d('SQL'),
    FORMULA: intl.get(`${PREFIX}.model.dataMapping.formula`).d('公式'),
    EXPR_SOURCE_TYPE: intl.get(`${PREFIX}.model.dataMapping.exprSourceType`).d('来源类型'),
    EXPR_SOURCE_VALUE: intl.get(`${PREFIX}.model.dataMapping.exprSourceValue`).d('来源值'),
    TARGET_VALUE: intl.get(`${PREFIX}.model.dataMapping.targetValue`).d('目标值'),
    CONDITION: intl.get(`${PREFIX}.model.dataMapping.condition`).d('条件'),
    CONJUNCTION: intl.get(`${PREFIX}.model.dataMapping.conjunction`).d('多条件连接符'),
    FIELD_TYPE: intl.get(`${PREFIX}.model.dataMapping.fieldType`).d('目标字段类型'),
    CONDITION_FIELD: intl.get(`${PREFIX}.model.dataMapping.conditionField`).d('条件字段'),
    VALUE: intl.get(`${PREFIX}.model.dataMapping.sourceValue`).d('值'),
    CAST_FORMULA_TIP_HEADER: intl
      .get(`${PREFIX}.view.message.castFormulaTip`)
      .d('不同的符号标注代表不同的含义：'),
    CAST_FORMULA_TIP_CONST: intl
      .get(`${PREFIX}.view.message.castFormulaConst`)
      .d('常量：双引号 "" 标注'),
    CAST_FORMULA_TIP_FORMULA: intl
      .get(`${PREFIX}.view.message.castFormulaFormula`)
      .d('公式：方括号 [] 标注'),
    CAST_FORMULA_TIP_RESPONSE: intl
      .get(`${PREFIX}.view.message.castFormulaResponse`)
      .d('变量：花括号 {} 标注'),

    IMPORT_MAPPING_CONFIG: intl.get(`${PREFIX}.button.importMappingConfig`).d('导入映射配置'),
    IMPORT_MAPPING_CONFIG_TIP: intl
      .get(`${PREFIX}.tip.importMappingConfig`)
      .d('导入JSON文件或者输入JSON格式数据'),
    SYNC_MAPPING_CONFIG: intl.get(`${PREFIX}.button.syncMappingConfig`).d('同步映射配置至接口'),
    SYNC_MAPPING_CONFIG_TIP: intl
      .get(`${PREFIX}.tip.syncMappingConfig`)
      .d('同步当前字段映射配置或者数据映射配置至服务注册已上线接口'),
    SYNC: intl.get(`${PREFIX}.button.sync`).d('同步'),
    DEBUG_EXECUTE: intl.get(`${PREFIX}.button.execute`).d('执行'),
    DEBUG: intl.get(`${PREFIX}.button.debug`).d('调试'),
    DEBUG_LOG: intl.get(`${PREFIX}.button.debugLog`).d('调试日志'),
    FLOW_DEBUG: intl.get(`${PREFIX}.button.flowDebug`).d('流程调试'),
    FORMATTER: intl.get(`${PREFIX}.button.formatter`).d('格式化'),

    SAVE_VALIDATE: intl.get(`${PREFIX}.validation.saveValidate`).d('请先完善必输内容'),
    JSON_FORMATTER: intl.get(`${PREFIX}.validation.formatter.json`).d('JSON格式有误'),
    XML_FORMATTER: intl.get(`${PREFIX}.validation.formatter.xml`).d('XML格式有误'),
    FIELD_CONFIG_REQUIRED: intl
      .get(`${PREFIX}.validation.required.fieldConfig`)
      .d('请维护字段映射结构数据'),
    SOURCE_STRUCT_REQUIRED: intl
      .get(`${PREFIX}.validation.required.sourceStruct`)
      .d('请输入来源结构'),
    TARGET_STRUCT_REQUIRED: intl
      .get(`${PREFIX}.validation.required.targetStruct`)
      .d('请输入目标结构'),
    SOURCE_DATA_REQUIRED: intl.get(`${PREFIX}.validation.required.sourceData`).d('请输入来源报文'),
    TARGET_DATA_REQUIRED: intl.get(`${PREFIX}.validation.required.targetData`).d('请输入目标报文'),
    SCRIPT_REQUIRED: intl.get(`${PREFIX}.validation.required.scrpt`).d('请输入转换脚本'),
    MAPPING_TYPE_REQUIRED: intl
      .get(`${PREFIX}.validation.required.mappingType`)
      .d('请输入映射类型'),
    FIELD_DATA_CONFIG_REQUIRED: intl
      .get(`${PREFIX}.validation.required.fieldDataConfig`)
      .d('流程调试至少需要配置【字段映射】或【数据映射】中的一个'),

    SAME_NAME_REL: intl.get(`${PREFIX}.view.button.sameNameRel`).d('同名关联'),
    SAME_LINE_REL: intl.get(`${PREFIX}.view.button.sameLineRel`).d('同行关联'),
    CANCEL_REL: intl.get(`${PREFIX}.view.button.cancelRel`).d('取消关联'),
    IMPORT_JSON: intl.get(`${PREFIX}.view.button.importJSON`).d('导入JSON文件'),
    DATA_CONFIG_REQUIRED: intl
      .get(`${PREFIX}.validation.required.dataConfig`)
      .d('请输入数据映射配置'),
    SOURCE_TITLE: intl.get(`${PREFIX}.model.fieldMapping.sourceTitle`).d('来源结构'),
    SOURCE_TITLE_TIP: intl
      .get(`${PREFIX}.model.fieldMapping.sourceTitle.tip`)
      .d(
        '来源结构，设定请求数据报文结构，即调用发起方能够给出的json报文结构样例或者xml报文结构样例。通过与目标结构连线构造出DW脚本。'
      ),
    TARGET_TITLE: intl.get(`${PREFIX}.model.fieldMapping.targetTitle`).d('目标结构'),
    TARGET_TITLE_TIP: intl
      .get(`${PREFIX}.model.fieldMapping.targetTitle.tip`)
      .d(
        '目标结构，设定响应数据报文结构，即调用响应方给出的原始json报文结构样例或者xml报文结构样例。通过与来源结构连线构造出DW脚本。'
      ),

    INVOKE_ABLE_INTERFACE: intl.get(`${PREFIX}.view.model.invokeAbleInterface`).d('透传接口'),
    NAMESPACE: intl.get(`${PREFIX}.view.model.namespace`).d('命名空间'),
    SERVER_CODE: intl.get(`${PREFIX}.view.model.serverCode`).d('服务名称'),
    INTERFACE_URL: intl.get(`${PREFIX}.view.model.interfaceUrl`).d('接口地址'),
    MAPPING_TARGET: intl.get(`${PREFIX}.view.model.mappingTarget`).d('映射目标'),
  };
  return LANGS[key];
};

export default getLang;
