/**
 * 消息中间件配置-多语言
 * @author baitao.huang@hand-china.com
 * @date 2020-5-9
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.dynamicMqConfig';

  const LANGS = {
    PREFIX,
    CREATE: intl.get('hzero.common.create').d('新建'),
    SAVE: intl.get('hzero.common.button.save').d('保存'),
    EDIT: intl.get('hzero.common.edit').d('编辑'),
    CANCEL: intl.get('hzero.common.button.cancel').d('取消'),
    DELETE: intl.get('hzero.common.button.delete').d('删除'),
    CLEAR: intl.get('hzero.common.button.clear').d('清空'),
    YES: intl.get('hzero.common.status.yes').d('是'),
    NO: intl.get('hzero.common.status.no').d('否'),
    ENABLED: intl.get('hzero.common.enable').d('启用'),
    DISABLED: intl.get('hzero.common.disable').d('禁用'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),
    INCREASE: intl.get('hzero.common.button.add').d('新增'),
    ENABLED_FLAG: intl.get('hzero.common.model.common.enableFlag').d('是否启用'),

    HEADER: intl.get(`${PREFIX}.view.title.dynamicMqConfig`).d('消息中间件配置'),
    DETAIL: intl.get(`${PREFIX}.view.title.detail`).d('消息中间件配置详情'),
    CREATE_HEADER: intl.get(`${PREFIX}.view.title.createHeader`).d('新建消息中间件配置'),
    PARAM_OPTION_HEADER: intl.get(`${PREFIX}.view.title.paramOptionHeader`).d('参数选项配置'),
    SEND_MESSAGE: intl.get(`${PREFIX}.view.title.sendMessage`).d('发送消息'),

    BIND: intl.get(`${PREFIX}.view.button.bind`).d('激活绑定'),
    UNBIND: intl.get(`${PREFIX}.view.button.unbind`).d('取消绑定'),
    PARAM_OPTION: intl.get(`${PREFIX}.view.button.paramOption`).d('参数选项'),
    SEND: intl.get(`${PREFIX}.view.button.send`).d('发送'),

    BASIC_INFO: intl.get(`${PREFIX}.view.title.basicInformation`).d('中间件配置'),
    DETAIL_INFO: intl.get(`${PREFIX}.view.title.detailInformation`).d('绑定配置'),

    BINDER_NAME: intl.get(`${PREFIX}.model.dynamicMqConfig.binderName`).d('中间件名称'),
    BINDER_TYPE: intl.get(`${PREFIX}.model.dynamicMqConfig.binderType`).d('中间件类型'),
    REMARK: intl.get(`${PREFIX}.model.dynamicMqConfig.remark`).d('备注说明'),

    BINDING_NAME: intl.get(`${PREFIX}.model.dynamicMqConfig.bindingName`).d('绑定名称(通道)'),
    BINDING_TYPE: intl.get(`${PREFIX}.model.dynamicMqConfig.bindingType`).d('绑定类型'),
    DESTINATION: intl.get(`${PREFIX}.model.dynamicMqConfig.destination`).d('目标(Topic)'),
    BINDING_GROUP: intl.get(`${PREFIX}.model.dynamicMqConfig.bindingGroup`).d('生产或消费组'),
    CONTENT_TYPE: intl.get(`${PREFIX}.model.dynamicMqConfig.contentType`).d('媒体类型(Mime Type)'),
    CHARSET: intl.get(`${PREFIX}.model.dynamicMqConfig.charset`).d('字符集'),

    PROPERTY_KEY: intl.get(`${PREFIX}.model.dynamicMqConfig.propertyKey`).d('属性键'),
    PROPERTY_VALUE: intl.get(`${PREFIX}.model.dynamicMqConfig.propertyValue`).d('属性值'),

    MESSAGE: intl.get(`${PREFIX}.model.dynamicMqConfig.message`).d('消息'),

    SAVE_VALIDATE: intl.get(`${PREFIX}.model.dynamicMqConfig.saveValidate`).d('请先完善必输内容'),
    SAVE_EMPTY: intl.get(`${PREFIX}.model.dynamicMqConfig.saveEmpty`).d('无修改内容,无需保存'),

    BIND_VALIDATE: intl
      .get(`${PREFIX}.model.dynamicMqConfig.bindValidate`)
      .d('只能激活绑定已启用的中间件，不能包含禁用数据'),
    UNBIND_VALIDATE: intl
      .get(`${PREFIX}.model.dynamicMqConfig.unbindValidate`)
      .d('只能取消绑定已启用的中间件，不能包含禁用数据'),

    CHECK_BIND: intl.get(`${PREFIX}.model.dynamicMqConfig.checkBind`).d('确定激活绑定吗'),
    CHECK_UNBIND: intl.get(`${PREFIX}.model.dynamicMqConfig.checkUnbind`).d('确定取消绑定吗'),
    CHECK_ENABLE: intl.get(`${PREFIX}.model.dynamicMqConfig.checkEnable`).d('确定启用吗'),
    CHECK_DISABLE: intl.get(`${PREFIX}.model.dynamicMqConfig.checkDisable`).d('确定禁用吗'),
  };
  return LANGS[key];
};

export default getLang;
