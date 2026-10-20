import React, { Fragment } from 'react';
import { List } from 'choerodon-ui';
import { isArray, isFunction } from 'lodash';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';

import styles from './index.less';

interface WarnMsgListProps {
  msgList: object[];
  msgListPrompt?: string;
}

const WarnMsgList = (props: WarnMsgListProps) => {
  const { msgList, msgListPrompt } = props;

  return (
    <Fragment>
      <div className={styles['msg-list-prompt']}>{msgListPrompt}</div>
      <List
        dataSource={msgList}
        renderItem={item => <List.Item>{item?.msg}</List.Item>}
        className={styles['msg-list']}
      />
    </Fragment>
  );
};

type GetCustomValidationResponse = (
  res: {
    validatedCode?: string;
    msg?: string;
    msgList?: object[];
  },
  onNext: (action?: 'ok') => any,
  options?: {
    // 表格类型警告弹窗标语
    msgListPrompt?: string;
    // 警告类型弹窗取消回调
    onWarnCancel?: () => any;
    // 外部系统错误回调
    onExternalError?: () => any;
    okText?: string,
  }
) => any;


const getCustomValidationResponse: GetCustomValidationResponse = (res, onNext, options) => {
  const { onWarnCancel, onExternalError, msgListPrompt, okText } = options || {};
  if (!isFunction(onNext)) return false;
  const { validatedCode, msg, msgList } = res || {};
  if (validatedCode === 'WARNING') {
    // 警告，确认操作
    Modal.confirm({
      title: intl.get('ssta.common.view.message.tip').d('提示'),
      children: isArray(msgList) ? <WarnMsgList msgList={msgList} msgListPrompt={msgListPrompt} /> : msg,
      autoCenter: true,
      contentStyle: { overflowWrap: 'anywhere' },
      onOk: () => onNext('ok'),
      onCancel: () => isFunction(onWarnCancel) ? onWarnCancel() : true,
      okText: okText || intl.get('hzero.common.button.confirm').d('确定'),
    });
  } else if (validatedCode === 'ERROR') {
    // 错误，提示错误信息
    notification.error({
      message: intl.get('hzero.common.notification.error').d('操作失败'),
      description: msg,
      style: {
        whiteSpace: 'pre-line',
      },
    });
    return false;
  } else if (validatedCode === 'EXTERNAL_ERROR') {
    // 外部系统错误,版本号会更新
    notification.error({
      message: intl.get('hzero.common.notification.error').d('操作失败'),
      description: msg,
    });
    return isFunction(onExternalError) ? onExternalError() : false;
  } else {
    return onNext();
  }
};


export { WarnMsgList, getCustomValidationResponse };
