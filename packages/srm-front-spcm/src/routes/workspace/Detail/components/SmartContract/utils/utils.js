/*
 * @Description:
 * @Date: 2025-09-01 15:26:28
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import { marked } from 'marked';
import DeltaToHtml from 'quill-delta-to-html';

// 校验html格式字符串
export const isHtmlStr = (str) => {
  return /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>|<\w+[^>]*\/>/.test(str);
};

// 校验markdown格式字符串
export const isMarkdownStr = (text) => {
  const markdownTokens = [
    '# ',
    '## ',
    '### ', // 标题
    '- ',
    '* ',
    '+ ', // 无序列表
    '1. ',
    '2. ', // 有序列表
    '[',
    '](', // 链接
    '![',
    '](', // 图片
    '```',
    '`', // 代码块
    '**',
    '__', // 粗体
    '*',
    '_', // 斜体
    '> ', // 引用
    '---',
    '===',
    '***', // 分割线
  ];

  const score = markdownTokens.reduce((count, token) => count + (text.includes(token) ? 1 : 0), 0);

  // 如果匹配到多个 Markdown 特征，则认为是 Markdown
  return score >= 3;
};

// markdown转html
export const hanldeMdToHtml = (str) => {
  let formatToHtml = str;
  if (!str) {
    return formatToHtml;
  }
  // 字符串转对象，如果能成功，则不是md格式字符串
  let isJson = false;
  try {
    // 字符串转对象
    isJson = JSON.parse(str);
  } catch (error) {
    isJson = false;
  }
  // 转对象成功就不是md格式，return
  if (isJson) {
    return false;
  }
  // 转化失败在校验字符串格式
  const falg = isMarkdownStr(str);
  // 不是md格式 return
  if (!falg) {
    return false;
  }
  try {
    formatToHtml = marked.parse(str);
  } catch (error) {
    formatToHtml = false;
    // console.log("markdown格式错误", error);
  }
  return formatToHtml;
};

// delta转html
export const hanldeDeltaToHtml = (str) => {
  let formatToHtml = str;
  if (!str) {
    return formatToHtml;
  }
  try {
    // 字符串转对象
    formatToHtml = JSON.parse(str);
    const converter = new DeltaToHtml(formatToHtml);
    // 使用convert()转化不成功不会报错，如果转化不成功会返回空字符串，|| str返回原字符串
    formatToHtml = converter.convert() || str;
  } catch (error) {
    formatToHtml = false;
    // console.log("delta格式错误", error);
  }
  return formatToHtml;
};
