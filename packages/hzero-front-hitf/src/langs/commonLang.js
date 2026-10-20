/**
 * 通用-多语言
 * @author baitao.huang@hand-china.com
 * @date 2020-7-8
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.common';

  const LANGS = {
    PREFIX,

    IMPORT: intl.get('hzero.common.button.import').d('导入'),
    CONFIRM: intl.get('hzero.common.view.message.confirm').d('确认'),
    CLOSE: intl.get('hzero.common.view.message.close').d('关闭'),
    REFRESH: intl.get('hzero.common.button.refresh').d('刷新'),
    DOWNLOAD: intl.get('hzero.common.button.download').d('下载'),
    UP: intl.get('hzero.common.button.up').d('收起'),
    EXPAND: intl.get('hzero.common.button.expand').d('展开'),
    OK: intl.get('hzero.common.button.ok').d('确定'),

    BACK_TOP: intl.get(`${PREFIX}.view.button.backTop`).d('回到顶部'),
    BACK_BOTTOM: intl.get(`${PREFIX}.view.button.backBottom`).d('回到底部'),
    AUTO_WRAP: intl.get(`${PREFIX}.view.button.autoWrap`).d('自动换行'),

    DW_SCRIPT_TIP: intl
      .get(`${PREFIX}.view.tip.dw`)
      .d('请参考DataWeave Language语法编写映射脚本，官方文档参见'),

    AND: intl.get(`${PREFIX}.view.logicOperation.and`).d('与'),
    OR: intl.get(`${PREFIX}.view.logicOperation.or`).d('或'),
    EQUAL: intl.get(`${PREFIX}.view.logicOperation.equal`).d('等于'),
    NOT_EQUAL: intl.get(`${PREFIX}.view.logicOperation.notEqual`).d('不等于'),
    LESS: intl.get(`${PREFIX}.view.logicOperation.less`).d('小于'),
    LESS_OR_EQUAL: intl.get(`${PREFIX}.view.logicOperation.lessOrEqual`).d('小于等于'),
    GREATER: intl.get(`${PREFIX}.view.logicOperation.greater`).d('大于'),
    GREATER_OR_EQUAL: intl.get(`${PREFIX}.view.logicOperation.greaterOrEqual`).d('大于等于'),
    IS_EMPTY: intl.get(`${PREFIX}.view.logicOperation.isEmpty`).d('为空'),
    IS_NOT_EMPTY: intl.get(`${PREFIX}.view.logicOperation.isNotEmpty`).d('非空'),
    VALUE: intl.get(`${PREFIX}.view.logicOperation.value`).d('值'),
    CONDITION_FIELD: intl.get(`${PREFIX}.view.logicOperation.conditionField`).d('条件字段'),
    CONDITION: intl.get(`${PREFIX}.view.logicOperation.condition`).d('条件'),
    ADD_CONDITION_GROUP: intl
      .get(`${PREFIX}.view.logicOperation.addConditionGroup`)
      .d('添加条件分组'),
    ADD_CONDITION: intl.get(`${PREFIX}.view.logicOperation.addCondition`).d('添加条件'),
    NOT: intl.get(`${PREFIX}.view.logicOperation.not`).d('非'),
    SURE: intl.get(`${PREFIX}.view.logicOperation.sure`).d('确定'),
    DELETE_CONDITION_CONFIRM: intl
      .get(`${PREFIX}.view.logicOperation.deleteConditionConfirm`)
      .d('确定删除该条件'),
    DELETE_GROUP_CONFIRM: intl
      .get(`${PREFIX}.view.logicOperation.deleteGroupConfirm`)
      .d('确定删除该条件分组'),

    SAME_NAME_REL: intl.get(`${PREFIX}.view.button.sameNameRel`).d('同名关联'),
    SAME_LINE_REL: intl.get(`${PREFIX}.view.button.sameLineRel`).d('同行关联'),
    CANCEL_REL: intl.get(`${PREFIX}.view.button.cancelRel`).d('取消关联'),
    JSON_FILE: intl.get(`${PREFIX}.view.button.jsonFile`).d('JSON文件'),
    XML_FILE: intl.get(`${PREFIX}.view.button.xmlFile`).d('XML文件'),

    DW_SCRIPT: intl.get(`${PREFIX}.view.title.dwScript`).d('DW脚本维护'),

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

    DATA_TYPE: intl.get(`${PREFIX}.model.fieldMapping.dataType`).d('数据格式'),

    VALIDATE_IMPORT: intl.get(`${PREFIX}.model.fieldMapping.validateImport`).d('校验并导入'),

    XML_VALIDATE: intl.get(`${PREFIX}.model.fieldMapping.xmlValidate`).d('错误的XML格式数据'),
    SAVE_VALIDATE: intl.get(`${PREFIX}.model.fieldMapping.saveValidate`).d('请先完善必输内容'),
    SAVE_EMPTY: intl.get(`${PREFIX}.model.fieldMapping.saveEmpty`).d('无修改内容,无需保存'),
    JSON_VALIDATE: intl.get(`${PREFIX}.model.fieldMapping.jsonValidate`).d('错误的JSON格式数据'),

    VALIDATE_DATA_TYPE: intl
      .get(`${PREFIX}.model.fieldMapping.validate.dataType`)
      .d('字段映射类型不能为空'),

    IMPORT_CONFIRM_TIP: intl
      .get(`${PREFIX}.validation.import.confirm.tip`)
      .d('导入将覆盖已存在的来源报文和目标报文，是否确认导入报文?'),

    BATCH_INPUT: intl.get(`${PREFIX}.view.button.batchInput`).d('批量录入'),
    BATCH_INPUT_PLACEHOLDER: intl
      .get(`${PREFIX}.placeholder.bacthImport`)
      .d('每一行为一个健值对，健值对之间以: 分隔。\n示例：\nuserName: 张三\npassword: 123456'),
  };
  return LANGS[key];
};

export default getLang;
