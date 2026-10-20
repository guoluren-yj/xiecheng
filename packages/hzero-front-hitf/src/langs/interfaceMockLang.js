/**
 * 接口MOCK-多语言
 * @author baitao.huang@hand-china.com
 * @date 2021-6-10
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.mock';
  const LANGS = {
    PREFIX,
    CREATE: intl.get('hzero.common.create').d('新建'),
    SAVE: intl.get('hzero.common.button.save').d('保存'),
    EDIT: intl.get('hzero.common.edit').d('编辑'),
    ADD: intl.get('hzero.common.button.add').d('新增'),
    TEST: intl.get('hzero.common.button.test').d('测试'),
    VIEW: intl.get('hzero.common.button.view').d('查看'),
    DELETE: intl.get('hzero.common.button.delete').d('删除'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),
    SURE: intl.get('hzero.common.button.ok').d('确定'),
    CLOSE: intl.get('hzero.common.button.close').d('关闭'),
    ENABLE: intl.get('hzero.common.enable').d('启用'),
    DISABLE: intl.get('hzero.common.disable').d('禁用'),
    STATUS: intl.get('hzero.common.status').d('状态'),
    IMPORT: intl.get('hzero.common.button.import').d('导入'),
    UP: intl.get('hzero.common.button.up').d('收起'),
    EXPAND: intl.get('hzero.common.button.expand').d('展开'),
    COPY: intl.get('hzero.common.button.copy').d('复制'),

    CONFIRM: intl.get('hzero.common.view.message.confirm').d('确认'),
    TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),

    COPY_URL: intl.get(`${PREFIX}.view.button.copyUrl`).d('复制MOCK地址'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('接口MOCK'),
    DETAIL: intl.get(`${PREFIX}.view.title.detail`).d('接口MOCK明细'),
    BASIC_INFO: intl.get(`${PREFIX}.view.title.basicInfo`).d('基本信息'),
    MOCK_LIST: intl.get(`${PREFIX}.view.title.mockList`).d('MOCK列表'),
    MOCK_INFO: intl.get(`${PREFIX}.view.title.mockInfo`).d('MOCK信息'),
    REQUEST_PARAM: intl.get(`${PREFIX}.view.title.requestParam`).d('请求参数'),
    REQUEST_HEADER: intl.get(`${PREFIX}.view.title.requestHeader`).d('请求头'),
    GET_OR_URL_PARAM: intl.get(`${PREFIX}.view.title.getOrUrlParam`).d('GET/URL参数'),
    PATH_PARAM: intl.get(`${PREFIX}.view.title.pathParam`).d('路径参数'),
    BODY_PARAM: intl.get(`${PREFIX}.view.title.bodyParam`).d('BODY参数'),
    RESPONSE_PARAM: intl.get(`${PREFIX}.view.title.responseParam`).d('响应参数'),
    RESPONSE_HEADER: intl.get(`${PREFIX}.view.title.responseHeader`).d('响应头'),
    RESPONSE_BODY: intl.get(`${PREFIX}.view.title.responseBody`).d('响应体'),
    PARAM_INFO: intl.get(`${PREFIX}.view.title.paramInfo`).d('参数信息'),
    TEMPLATE: intl.get(`${PREFIX}.view.title.template`).d('模板'),
    DATA: intl.get(`${PREFIX}.view.title.data`).d('数据'),
    REQUEST: intl.get(`${PREFIX}.view.title.request`).d('请求'),
    RESPONSE: intl.get(`${PREFIX}.view.title.response`).d('响应'),
    MOCK_URL: intl.get(`${PREFIX}.view.title.mockUrl`).d('MOCK地址'),
    TEST_RESULT: intl.get(`${PREFIX}.view.title.testResult`).d('测试结果'),

    COPY_SUCCESS: intl.get(`${PREFIX}.view.message.copySuccess`).d('复制成功'),

    MOCK_GROUP_CODE: intl.get(`${PREFIX}.model.mock.mockGroupCode`).d('MOCK组编码'),
    MOCK_GROUP_NAME: intl.get(`${PREFIX}.model.mock.mockGroupName`).d('MOCK组名称'),
    MOCK_CODE: intl.get(`${PREFIX}.model.mock.mockCode`).d('MOCK编码'),
    MOCK_NAME: intl.get(`${PREFIX}.model.mock.mockName`).d('MOCK名称'),
    MOCK_STRATEGY: intl.get(`${PREFIX}.model.mock.mockStrategy`).d('执行策略'),
    REMARK: intl.get(`${PREFIX}.model.mock.remark`).d('备注'),
    HTTP_STATUS_CODE: intl.get(`${PREFIX}.model.mock.httpStatusCode`).d('HTTP状态码'),
    MOCK_WEIGHT: intl.get(`${PREFIX}.model.mock.mockWeight`).d('权重'),
    TEMPLATE_TYPE: intl.get(`${PREFIX}.model.mock.templateType`).d('模板类型'),
    PARAM_NAME: intl.get(`${PREFIX}.model.mock.paramName`).d('参数名称'),
    PARAM_TYPE: intl.get(`${PREFIX}.model.mock.paramType`).d('参数类型'),
    PARAM_RULE: intl.get(`${PREFIX}.model.mock.paramRule`).d('参数规则'),
    PARAM_RULE_TIP: intl
      .get(`${PREFIX}.model.mock.paramRuleTip`)
      .d('请参考Mock.js规则语法编规则，官方文档参见'),
    OFFICIAL_DOCUMENT: intl.get(`${PREFIX}.model.mock.officialDocument`).d('数据模板定义'),
    PARAM_VALUE: intl.get(`${PREFIX}.model.mock.paramValue`).d('参数值'),
    PAREANT_PARAM: intl.get(`${PREFIX}.model.mock.parentParam`).d('父级参数'),
    DEFAULT_EXECUTE_FLAG: intl.get(`${PREFIX}.model.mock.defaultExecuteFlag`).d('默认执行标识'),
    PAYLOAD: intl.get(`${PREFIX}.model.mock.payload`).d('请求/响应报文'),
    PAYLOAD_FILE: intl.get(`${PREFIX}.model.mock.payloadFile`).d('报文文件'),

    IMPORT_CONFIRM: intl
      .get(`${PREFIX}.view.message.importWarning`)
      .d('导入会覆盖原数据，请确认是否继续导入'),
    SAVE_VALIDATE: intl.get(`${PREFIX}.view.validate.notEmpty`).d('请先完善必输内容'),
    JSON_VALIDATE: intl.get(`${PREFIX}.model.validate.jsonValidate`).d('错误的JSON格式数据'),
    EMPRY_DELETE: intl.get(`${PREFIX}.model.validate.delete`).d('请先勾选需要删除的参数行'),
    SINGLE_OBJECT_VALIDATE: intl
      .get(`${PREFIX}.model.rateLimit.singleObjectValidate`)
      .d('只能录入单层MAP对象结构'),
  };
  return LANGS[key];
};

export default getLang;
