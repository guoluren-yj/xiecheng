/**
 * 即刻3.0相关常量
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/26
 * @copyright: Copyright (c) 2024, Zhenyun
 */
// 面板类型
export const CHAT_PANEL_TYPE = {
  MESSAGE: 'MESSAGE', // 消息
  ASSISTANT: 'ASSISTANT', // 助手
  AI_ASSISTANT: 'AI_ASSISTANT', // AI 助理
};

// 面板内容类型
export const CHAT_PANEL_CONTENT_TYPE = {
  EMPTY: 'EMPTY', // 空内容
  CHAT_ROOM: 'CHAT_ROOM', // 在线沟通
  NLP: 'NLP', // 问答助手
  CHAT_BI: 'CHAT-BI', // 分析助手
  ASSISTANT: 'ASSISTANT', // 事务助手
};

// 助手keys
export const ASSISTANT_KEY_LIST = [
  CHAT_PANEL_CONTENT_TYPE.NLP,
  CHAT_PANEL_CONTENT_TYPE.CHAT_BI,
  CHAT_PANEL_CONTENT_TYPE.ASSISTANT,
];
