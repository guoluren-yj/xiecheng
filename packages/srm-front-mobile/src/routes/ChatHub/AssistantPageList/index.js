/**
 * 即刻3.0助手iframe组合页
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/26
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import React, { useState, memo, useEffect } from 'react';
import CLN from 'classnames';
import { Spin } from 'choerodon-ui/pro';
import { ASSISTANT_KEY_LIST, CHAT_PANEL_CONTENT_TYPE, CHAT_PANEL_TYPE } from '../constant';
import MessageHandler from '@/components/Chat/Message/message-handler';
import styles from './index.less';

const AssistantPageList = (props) => {
  const { className, panelType, showContent, assistantList = [] } = props;
  const [assistantManager, setAssistatntManager] = useState({});
  // 是否显示助手iframe
  const showAssistant =
    ASSISTANT_KEY_LIST.includes(showContent) && panelType === CHAT_PANEL_TYPE.MESSAGE;

  useEffect(() => {
    const manager = assistantManager[showContent];
    // 如果打开内容不是助手或者已经加载过，则不做处理
    if (!showAssistant || manager?.loading !== null) return;
    setAssistatntManager(
      Object.assign({}, assistantManager, { [showContent]: { ...manager, loading: true } })
    );
  }, [showContent, panelType]);

  useEffect(() => {
    if (!assistantList?.length) return;
    // 助手列表整合为对象 loading: null-未加载 false-加载完成 true-加载中
    const newAssistantManager = ASSISTANT_KEY_LIST.reduce((prev, next) => {
      const info = assistantList.find((assistant) => assistant.type === next);
      return Object.assign(prev, {
        [next]: { title: info?.roomName, url: info?.url + info?.urlExtra, loading: null },
      });
    }, {});
    setAssistatntManager(newAssistantManager);
  }, [assistantList]);

  // 避免多次加载iframe，非助手页面通过Dom元素覆盖进行隐藏
  return (
    <div
      className={CLN(styles['assistant-page-list'], className, {
        [styles.hide]: !showAssistant,
      })}
    >
      <Spin spinning={!!assistantManager[showContent]?.loading} />
      {ASSISTANT_KEY_LIST.map((key) => {
        if (!assistantManager[key]?.url) return null;
        return (
          <iframe
            key={key}
            height="100%"
            width="100%"
            allow="clipboard-read; clipboard-write"
            title={assistantManager[key].roomName}
            className={CLN({ [styles.hide]: showContent !== key })}
            src={assistantManager[key].url}
            onLoad={(e) => {
              // 记录问答助手iframe，方便postMessage通信
              if (key === CHAT_PANEL_CONTENT_TYPE.NLP) {
                MessageHandler.iframe = e.currentTarget;
              }
              setAssistatntManager(
                Object.assign({}, assistantManager, {
                  [key]: { ...assistantManager[key], loading: false },
                })
              );
            }}
          />
        );
      })}
    </div>
  );
};

export default memo(AssistantPageList);
