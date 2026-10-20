/**
 * 字段映射-多语言
 * @author baitao.huang@hand-china.com
 * @date 2020-7-8
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.fieldMapping';
  const LANGS = {
    PREFIX,
    CREATE: intl.get('hzero.common.create').d('新建'),
    SAVE: intl.get('hzero.common.button.save').d('保存'),
    EDIT: intl.get('hzero.common.edit').d('编辑'),
    VIEW: intl.get('hzero.common.button.view').d('查看'),
    DELETE: intl.get('hzero.common.button.delete').d('删除'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),
    SURE: intl.get('hzero.common.button.ok').d('确定'),
    CLOSE: intl.get('hzero.common.button.close').d('关闭'),
    ENABLE: intl.get('hzero.common.enable').d('启用'),
    DISABLE: intl.get('hzero.common.disable').d('禁用'),
    ONLINE: intl.get('hzero.common.online').d('上线'),
    STATUS: intl.get('hzero.common.status').d('状态'),
    IMPORT: intl.get('hzero.common.button.import').d('导入'),
    CONFIRM: intl.get('hzero.common.view.message.confirm').d('确认'),
    TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),
    EXECUTE: intl.get(`${PREFIX}.view.button.exec`).d('执行'),
    VIEW_HISTORY: intl.get(`${PREFIX}.view.button.viewHistory`).d('查看历史版本'),
    REVERT: intl.get(`${PREFIX}.view.button.revert`).d('版本回退至'),
    RELEASE: intl.get(`${PREFIX}.view.button.release`).d('发布'),
    OFFLINE: intl.get(`${PREFIX}.view.button.offline`).d('下线'),
    SAME_NAME_REL: intl.get(`${PREFIX}.view.button.sameNameRel`).d('同名关联'),
    SAME_LINE_REL: intl.get(`${PREFIX}.view.button.sameLineRel`).d('同行关联'),
    CANCEL_REL: intl.get(`${PREFIX}.view.button.cancelRel`).d('取消关联'),
    IMPORT_JSON: intl.get(`${PREFIX}.view.button.importJSON`).d('导入JSON文件'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('字段映射'),
    DETAIL: intl.get(`${PREFIX}.view.title.detail`).d('字段映射明细'),
    BASIC_INFO: intl.get(`${PREFIX}.view.title.basicInfo`).d('基本信息'),
    DETAIL_INFO: intl.get(`${PREFIX}.view.title.detailInfo`).d('字段映射维护'),
    VERSION_HISTORY: intl.get(`${PREFIX}.view.title.versionHistory`).d('历史版本'),

    SEQ_NUMBER: intl.get(`${PREFIX}.model.fieldMapping.seqNumber`).d('序号'),
    TRANSFORM_CODE: intl.get(`${PREFIX}.model.fieldMapping.transformCode`).d('字段映射代码'),
    TRANSFORM_CODE_HELP: intl
      .get(`${PREFIX}.model.fieldMapping.transformCodeHelp`)
      .d('通过服务注册维护则按以下规则生成代码或名称：命名空间#服务代码#接口代码#映射目标#租户'),
    TRANSFORM_NAME: intl.get(`${PREFIX}.model.fieldMapping.transformName`).d('字段映射名称'),
    TRANSFORM_NAME_HELP: intl
      .get(`${PREFIX}.model.fieldMapping.transformNameHelp`)
      .d('通过服务注册维护则按以下规则生成代码或名称：命名空间#服务代码#接口代码#映射目标#租户'),
    TRANSFORM_TYPE: intl.get(`${PREFIX}.model.fieldMapping.transformType`).d('字段映射类型'),
    VERSION: intl.get(`${PREFIX}.model.fieldMapping.version`).d('版本'),
    FROM_VERSION: intl.get(`${PREFIX}.model.fieldMapping.fromVersion`).d('来源版本'),
    TRANSFORM_SCRIPT: intl.get(`${PREFIX}.model.fieldMapping.transformScript`).d('映射转化脚本'),
    SOURCE_STRUCTURE: intl.get(`${PREFIX}.model.fieldMapping.sourceStructure`).d('映射来源结构'),
    TARGET_STRUCTURE: intl.get(`${PREFIX}.model.fieldMapping.targetStructure`).d('映射目标结构'),

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

    ALL_TITLE: intl.get(`${PREFIX}.model.fieldMapping.allTitle`).d('来源及目标结构'),

    FIELD_DATA: intl.get(`${PREFIX}.view.modal.fieldData`).d('字段数据'),

    FILE_SOURCE: intl.get(`${PREFIX}.view.modal.fileSource`).d('文件来源'),

    IMPORT_JSON_STRUCT: intl.get(`${PREFIX}.model.fieldMapping.importJsonStruct`).d('导入JSON结构'),
    IMPORT_XML_STRUCT: intl.get(`${PREFIX}.model.fieldMapping.importXmlStruct`).d('导入XML结构'),
    XML_VALIDATE: intl.get(`${PREFIX}.model.fieldMapping.xmlValidate`).d('错误的XML格式数据'),

    EXEC_CONFIRM: intl.get(`${PREFIX}.view.modal.execConfirm`).d('确定执行映射转化吗'),

    SAVE_VALIDATE: intl.get(`${PREFIX}.model.fieldMapping.saveValidate`).d('请先完善必输内容'),
    SAVE_EMPTY: intl.get(`${PREFIX}.model.fieldMapping.saveEmpty`).d('无修改内容,无需保存'),
    JSON_VALIDATE: intl.get(`${PREFIX}.model.fieldMapping.jsonValidate`).d('错误的JSON格式数据'),
    EMPTY_SCRIPT: intl.get(`${PREFIX}.model.fieldMapping.emptyScript`).d('DW脚本不能为空'),

    MODAL_EDIT_INFO: intl
      .get(`${PREFIX}.view.message.editInfo`)
      .d('关联接口已上线，不允许编辑当前配置'),

    STRUCTURE_NAME: intl.get(`${PREFIX}.model.orchestration.structureName`).d('最外层结构名称'),

    DEBUG: intl.get(`${PREFIX}.button.debug`).d('调试'),
    DEBUG_LOG: intl.get(`${PREFIX}.button.debugLog`).d('调试日志'),
    TRANSFORM_TYPE_REQUIRED: intl
      .get(`${PREFIX}.validation.required.transformType`)
      .d('字段映射类型不能为空'),
    SOURCE_DATA_REQUIRED: intl
      .get(`${PREFIX}.debug.validation.required.sourceData`)
      .d('请输入来源报文'),
    SCRIPT_REQUIRED: intl.get(`${PREFIX}.debug.validation.required.script`).d('DW脚本脚本不能为空'),
    FIELD_CONFIG_REQUIRED: intl
      .get(`${PREFIX}.validation.required.sourceData`)
      .d('来源结构不能为空'),
    DOCUMENT: intl.get(`${PREFIX}.model.fieldMapping.document`).d('接口文档'),

    IMPORT_CONFIRM_TIP: intl
      .get(`${PREFIX}.validation.import.confirm.tip`)
      .d('导入将覆盖已存在的来源报文和目标报文，是否确认导入报文?'),
  };
  return LANGS[key];
};

export default getLang;
