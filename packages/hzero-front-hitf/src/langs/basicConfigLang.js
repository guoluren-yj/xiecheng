/**
 * 接口基础配置-多语言
 * @author baitao.huang@hand-china.com
 * @date 2021-8-24
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.basicConfig';
  const LANGS = {
    PREFIX,
    SAVE: intl.get('hzero.common.button.save').d('保存'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('接口基础配置'),

    APPLY_CONFIG: intl.get(`${PREFIX}.view.title.applyConfig`).d('接口申请配置'),

    APPROVAL_TYPE: intl.get(`${PREFIX}.model.basicConfig.approvalType`).d('审批类型'),
    WORKFLOW: intl.get(`${PREFIX}.model.basicConfig.workflow`).d('工作流'),
    SEND_MESSAGE_CONFIG: intl
      .get(`${PREFIX}.model.basicConfig.sendMessageConfig`)
      .d('消息发送配置'),

    SAVE_VALIDATE: intl.get(`${PREFIX}.model.basicConfig.saveValidate`).d('请先完善必输内容'),
  };
  return LANGS[key];
};

export default getLang;
