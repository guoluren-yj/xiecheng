/**
 * 数据映射-多语言
 * @author baitao.huang@hand-china.com
 * @date 2020-7-8
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.dataMapping';
  const LANGS = {
    PREFIX,
    CREATE: intl.get('hzero.common.create').d('新建'),
    INCREASE: intl.get('hzero.common.button.add').d('新增'),
    SAVE: intl.get('hzero.common.button.save').d('保存'),
    SURE: intl.get('hzero.common.button.ok').d('确定'),
    EDIT: intl.get('hzero.common.edit').d('编辑'),
    VIEW: intl.get('hzero.common.button.view').d('查看'),
    CANCEL: intl.get('hzero.common.button.cancel').d('取消'),
    DELETE: intl.get('hzero.common.button.delete').d('删除'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),
    ENABLE: intl.get('hzero.common.enable').d('启用'),
    DISABLE: intl.get('hzero.common.disable').d('禁用'),
    ONLINE: intl.get('hzero.common.online').d('上线'),
    OFFLINE: intl.get('hzero.common.offline').d('下线'),
    TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),
    EXECUTE: intl.get(`${PREFIX}.view.button.exec`).d('执行'),
    MAPPING_MAINTAIN: intl.get(`${PREFIX}.view.button.mappingMaintain`).d('值映射维护'),
    ADD_CONDITION: intl.get(`${PREFIX}.view.button.addCondition`).d('添加条件'),
    VIEW_HISTORY: intl.get(`${PREFIX}.view.button.viewHistory`).d('查看历史版本'),
    REVERT: intl.get(`${PREFIX}.view.button.revert`).d('版本回退至'),
    RELEASE: intl.get(`${PREFIX}.view.button.release`).d('发布'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('数据映射'),
    DETAIL: intl.get(`${PREFIX}.view.title.detail`).d('数据映射明细'),
    CREATE_LINE: intl.get(`${PREFIX}.view.title.createLine`).d('创建转换维护信息'),
    EDIT_LINE: intl.get(`${PREFIX}.view.title.editLine`).d('更新转换维护信息'),
    BASIC_INFO: intl.get(`${PREFIX}.view.title.basicInfo`).d('基本信息'),
    DETAIL_INFO: intl.get(`${PREFIX}.view.title.detailInfo`).d('转换维护'),
    FORMULA_MAINTAIN: intl.get(`${PREFIX}.view.title.formulaMaintain`).d('公式维护'),
    CAST_VAL_MAINTAIN: intl.get(`${PREFIX}.view.title.castValMaintain`).d('值转换维护'),
    CONDITION_MAINTAIN: intl.get(`${PREFIX}.view.title.conditionMaintain`).d('条件维护'),

    SEQ_NUMBER: intl.get(`${PREFIX}.model.dataMapping.seqNumber`).d('序号'),
    CAST_CODE: intl.get(`${PREFIX}.model.dataMapping.castCode`).d('数据映射代码'),
    CAST_CODE_HELP: intl
      .get(`${PREFIX}.model.dataMapping.castCodeHelp`)
      .d('通过服务注册维护则按以下规则生成代码或名称：命名空间#服务代码#接口代码#映射目标#租户'),
    CAST_NAME: intl.get(`${PREFIX}.model.dataMapping.castName`).d('数据映射名称'),
    CAST_NAME_HELP: intl
      .get(`${PREFIX}.model.dataMapping.castNameHelp`)
      .d('通过服务注册维护则按以下规则生成代码或名称：命名空间#服务代码#接口代码#映射目标#租户'),
    DATA_TYPE: intl.get(`${PREFIX}.model.dataMapping.dataType`).d('数据映射类型'),
    VERSION_HISTORY: intl.get(`${PREFIX}.view.title.versionHistory`).d('历史版本'),
    STATUS: intl.get(`${PREFIX}.view.title.status`).d('状态'),
    VERSION: intl.get(`${PREFIX}.model.dataMapping.version`).d('版本'),
    FROM_VERSION: intl.get(`${PREFIX}.model.dataMapping.fromVersion`).d('来源版本'),

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

    CAST_LOV_CODE: intl.get(`${PREFIX}.model.dataMapping.castLovCode`).d('值集编码'),
    CAST_LOV_FIELD: intl.get(`${PREFIX}.model.dataMapping.castLovField`).d('值集转化字段'),
    CAST_LOV_LANG: intl.get(`${PREFIX}.model.dataMapping.castLovLang`).d('值集转化语言'),
    DESENSITIZE_RULE: intl.get(`${PREFIX}.model.dataMapping.desensitizeRule`).d('脱敏规则'),

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

    SAVE_VALIDATE: intl.get(`${PREFIX}.model.dataMapping.saveValidate`).d('请先完善必输内容'),
    SAVE_EMPTY: intl.get(`${PREFIX}.model.dataMapping.saveEmpty`).d('无修改内容,无需保存'),

    PATTERN_MISMACTH: intl
      .get('hzero.common.validation.codeUpper')
      .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),

    MODAL_EDIT_INFO: intl
      .get(`${PREFIX}.view.message.editInfo`)
      .d('关联接口已上线，不允许编辑当前配置'),

    DEBUG: intl.get(`${PREFIX}.button.debug`).d('调试'),
    DEBUG_TIP: intl
      .get(`${PREFIX}.button.debug.tip`)
      .d(
        '调试仅对来源报文执行数据映射处理，流程调试将同时执行字段映射处理与数据映射处理；如需执行流程调试，请确保字段映射或者数据映射至少配置了其中一个'
      ),
    FLOW_DEBUG: intl.get(`${PREFIX}.button.flowDebug`).d('流程调试'),
    FORMATTER: intl.get(`${PREFIX}.button.formatter`).d('格式化'),
    JSON_FORMATTER: intl.get(`${PREFIX}.debug.validation.formatter.json`).d('JSON格式有误'),
    XML_FORMATTER: intl.get(`${PREFIX}.debug.validation.formatter.xml`).d('XML格式有误'),
    SOURCE_DATA_REQUIRED: intl
      .get(`${PREFIX}.debug.validation.required.sourceData`)
      .d('请输入来源报文'),
    CAST_LINE_REQUIRED: intl
      .get(`${PREFIX}.debug.validation.required.castLine`)
      .d('请维护转换信息'),
  };
  return LANGS[key];
};

export default getLang;
