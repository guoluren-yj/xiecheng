/* eslint-disable react/no-array-index-key */
/* eslint-disable react/no-danger */
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { marked } from 'marked';

import { textReplaceEmoji } from '../../functions/message'; // textReplaceLink,
import styles from './TextMessage.less';
import QuoteMessage from '../QuoteMessage';

const MarkdownRenderer = ({ markdownText }) => {
  // 自定义 renderer
  const renderer = new marked.Renderer();

  // 重写 table 渲染方法，外层包裹 div，实现横向滚动
  renderer.table = params => {
    const { header = [], rows = [] } = params;

    return `
      <div class="table-container" style="overflow-x: auto; margin: 4px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              ${(header || [])
                .map(
                  col => `
                <th style="
                  border: 1px solid #ddd;
                  padding: 8px 12px;
                  text-align: left;
                  background-color: #f3f4f5;
                ">
                  ${col.text}
                </th>
              `
                )
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${(rows || [])
              .map(
                (row, rowIndex) => `
              <tr key="${rowIndex}" style="background-color: white;">
                ${row
                  .map(
                    (cell, cellIndex) => `
                  <td key="${cellIndex}" style="
                    border: 1px solid #ddd;
                    padding: 8px 12px;
                    text-align: left;
                  ">
                    ${cell.text}
                  </td>
                `
                  )
                  .join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  marked.use({
    baseUrl: null,
    breaks: false,
    gfm: true,
    sanitize: false, // 不禁用HTML（若为true会过滤图片标签）
    renderer,
  });

  // 解析 markdown
  const htmlContent = marked.parse(markdownText);

  return <pre style={{ overflowX: 'auto' }} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default class TextMessage extends PureComponent {
  onRightClick = e => {
    const { onRightClick, record } = this.props;
    if (typeof onRightClick === 'function') {
      onRightClick(e, record);
    }
  };

  render() {
    const { id, record = {}, style, onClickQuote } = this.props;
    const cls = classnames(styles['smbl-text-message'], {
      [styles['smbl-text-message-left']]: record.float === 'left',
      [styles['smbl-text-message-right']]: record.float === 'right',
    });
    // const atText = record.receiverHide
    //   ? ''
    //   : (record.receiverNames || []).map(e => `@${e}`).join(' ');
    const _id = id || record.msgId;
    // let text = atText.length ? `${atText} ` : '';
    // text += textReplaceLink(record.msgContent);
    // text = record?.sender === 'AI' ? marked.parse(textReplaceEmoji(text)) : textReplaceEmoji(text);

    let text = record.msgContent || '';
    text = textReplaceEmoji(text);

    return (
      <div id={_id} onContextMenu={this.onRightClick} className={cls} style={style}>
        {record.quoteMsg && (
          <QuoteMessage
            quoteMsg={record.quoteMsg}
            style={{ padding: '8px 12px' }}
            onClick={onClickQuote}
          />
        )}
        <MarkdownRenderer markdownText={text} />
        {/* <pre dangerouslySetInnerHTML={{ __html: text }} /> */}
      </div>
    );
  }
}
