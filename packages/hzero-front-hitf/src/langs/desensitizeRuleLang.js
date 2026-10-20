/**
 * 脱敏规则-多语言
 * @author baitao.huang@hand-china.com
 * @date 2021-7-20
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.desensitizeRule';
  const LANGS = {
    PREFIX,
    CREATE: intl.get('hzero.common.create').d('新建'),
    SAVE: intl.get('hzero.common.button.save').d('保存'),
    EDIT: intl.get('hzero.common.edit').d('编辑'),
    VIEW: intl.get('hzero.common.button.view').d('查看'),
    CANCEL: intl.get('hzero.common.button.cancel').d('取消'),
    CLOSE: intl.get('hzero.common.button.close').d('关闭'),
    ENABLE: intl.get('hzero.common.enable').d('启用'),
    DISABLE: intl.get('hzero.common.disable').d('禁用'),
    PREVIEW: intl.get('hzero.common.preview').d('预览'),
    DELETE: intl.get('hzero.common.button.delete').d('删除'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),
    UPLOAD: intl.get('hzero.common.button.upload').d('上传'),
    ADD: intl.get('hzero.common.button.add').d('新增'),
    UP: intl.get('hzero.common.button.up').d('收起'),
    EXPAND: intl.get('hzero.common.button.expand').d('展开'),
    ENABLE_FLAG: intl.get('hzero.common.model.common.enableFlag').d('是否启用'),
    BELONG_TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),
    TENANT: intl.get('hzero.common.model.common.tenant').d('租户'),
    STATUS: intl.get('hzero.common.status').d('状态'),
    CUSTOM: intl.get('hzero.common.custom').d('自定义'),
    PRE_DEFINED: intl.get('hzero.common.predefined').d('预定义'),

    CODE_UPPER: intl
      .get('hzero.common.validation.codeUpper')
      .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('脱敏规则'),
    DETAIL: intl.get(`${PREFIX}.view.title.detail`).d('脱敏规则详情'),
    DEBUG: intl.get(`${PREFIX}.view.title.debug`).d('调试'),
    RULE_MAINTAIN: intl.get(`${PREFIX}.view.title.ruleMaintain`).d('脱敏规则维护'),

    BASIC_INFO: intl.get(`${PREFIX}.view.title.basicInfo`).d('基础信息'),

    REFERENCE: intl.get(`${PREFIX}.view.button.reference`).d('引用查询'),

    RULE_CODE: intl.get(`${PREFIX}.model.desensitizeRule.ruleCode`).d('规则代码'),
    RULE_NAME: intl.get(`${PREFIX}.model.desensitizeRule.ruleName`).d('规则名称'),
    DESENSITIZE_WAY: intl.get(`${PREFIX}.model.desensitizeRule.desensitizeWay`).d('脱敏方式'),
    DESENSITIZE_TYPE: intl.get(`${PREFIX}.model.desensitizeRule.desensitizeType`).d('脱敏格式'),
    SENSITIZE_STR: intl.get(`${PREFIX}.model.desensitizeRule.sensitiveStr`).d('敏感字符'),
    MASK_STR: intl.get(`${PREFIX}.model.desensitizeRule.maskStr`).d('掩码字符'),
    MASK_NUM: intl.get(`${PREFIX}.model.desensitizeRule.maskNum`).d('掩码字符个数'),
    MASK_NUM_TIP: intl
      .get(`${PREFIX}.model.desensitizeRule.maskNum`)
      .d('表示屏蔽的字符串用几个掩码字符代替，为空时代表被屏蔽字符长度，上限值=10'),

    MASK_START: intl.get(`${PREFIX}.model.desensitizeRule.maskStart`).d('保留前面n位'),
    MASK_END: intl.get(`${PREFIX}.model.desensitizeRule.maskEnd`).d('保留后面m位'),
    DESCRIPTION: intl.get(`${PREFIX}.model.desensitizeRule.description`).d('描述'),
    TEST_DATA: intl.get(`${PREFIX}.model.desensitizeRule.testData`).d('测试数据'),
    DEBUG_RESULT: intl.get(`${PREFIX}.model.desensitizeRule.debugResult`).d('调试结果'),
    CAST_CODE: intl.get(`${PREFIX}.model.desensitizeRule.castCode`).d('映射编码'),
    CAST_NAME: intl.get(`${PREFIX}.model.desensitizeRule.castName`).d('映射名称'),
    CAST_ROOT: intl.get(`${PREFIX}.model.desensitizeRule.castRoot`).d('字段路径'),
    CAST_FIELD: intl.get(`${PREFIX}.model.desensitizeRule.castField`).d('字段名称'),
    SOURCE_TYPE: intl.get(`${PREFIX}.model.desensitizeRule.sourceType`).d('来源类型'),

    SAVE_VALIDATE: intl.get(`${PREFIX}.model.desensitizeRule.saveValidate`).d('请先完善必输内容'),
    BASIC_VALIDATE: intl
      .get(`${PREFIX}.model.desensitizeRule.basicValidate`)
      .d('请先完善基础信息中的必输内容'),
    TEST_VALIDATE: intl.get(`${PREFIX}.model.desensitizeRule.testValidate`).d('请先录入测试数据'),
    DISABLE_CONFIRM: intl
      .get(`${PREFIX}.model.confirm.disable`)
      .d(
        '该脱敏规则已经被引用（具体引用的地方可通过【引用查询】查看），若禁用规则，数据映射脱敏处理会失效，是否确认禁用？'
      ),
    DELETE_CONFIRM: intl
      .get(`${PREFIX}.model.confirm.delete`)
      .d('无法删除该脱敏规则，该脱敏规则已经被引用（具体引用的地方可通过【引用查询】查看）'),
  };
  return LANGS[key];
};

export default getLang;
