import React from 'react';
import { List } from 'hzero-ui';
import classNames from 'classnames';

import { TagRender } from 'utils/renderer';

import styles from './NoticeList.less';

export default function NoticeList({
  data = [],
  onClick,
  emptyImage,
  emptyContent,
  contentTitleAction,
  contentItemAction, // 进入消息列表
}) {
  let content;

  const status = [
    { status: 'UPLOADING', color: 'rgba(252,160,0,0.10)' /* , text: 'Excel导入' */ },
    { status: 'UPLOADED', color: 'rgba(252,160,0,0.10)' /* , text: '验证成功' */ },
    { status: 'CHECKING', color: 'rgba(252,160,0,0.10)' /* , text: '验证失败' */ },
    { status: 'CHECKED', color: 'rgba(71,184,129,0.10)' /* , text: '导入成功' */ },
    {
      status: 'CHECK_FAILED',
      color: 'rgba(245,99,73,0.10)' /* , text: '数据校验失败' */,
    },
    { status: 'IMPORTING', color: 'rgba(252,160,0,0.10)' /* , text: '导入失败' */ },
    { status: 'IMPORTED', color: 'rgba(71,184,129,0.10)' /* , text: '数据异常' */ },
    {
      status: 'IMPORT_FAILED',
      color: 'rgba(245,99,73,0.10)' /* , text: '数据导入失败' */,
    },
  ];
  const fontColor = [
    { status: 'UPLOADING', color: '#F88D10' /* , text: 'Excel导入' */ },
    { status: 'UPLOADED', color: '#F88D10' /* , text: '验证成功' */ },
    { status: 'CHECKING', color: '#F88D10' /* , text: '验证失败' */ },
    { status: 'CHECKED', color: 'rgba(71,184,129)' /* , text: '导入成功' */ },
    { status: 'CHECK_FAILED', color: 'rgba(245,99,73)' /* , text: '数据校验失败' */ },
    { status: 'IMPORTING', color: '#F88D10' /* , text: '导入失败' */ },
    { status: 'IMPORTED', color: 'rgba(71,184,129)' /* , text: '数据异常' */ },
    { status: 'IMPORT_FAILED', color: 'rgba(245,99,73)' /* , text: '数据导入失败' */ },
  ];

  const exportStatus = [
    { status: 'DOING', color: 'rgba(71,184,129,0.10)' /* , text: '导出' */ },
    { status: 'DONE', color: 'rgba(71,184,129,0.10)' /* , text: '导出成功' */ },
    { status: 'FAILED', color: 'rgba(245,99,73,0.10)' /* , text: '导出失败' */ },
    { status: 'CANCELLED', color: 'rgba(0,0,0,0.08)' /* , text: 导出失败' */ },
  ];
  const exportFontColor = [
    { status: 'DOING', color: 'rgba(71,184,129)' /* , text: '导出' */ },
    { status: 'DONE', color: 'rgba(71,184,129)' /* , text: '导出成功' */ },
    { status: 'FAILED', color: 'rgba(245,99,73)' /* , text: '导出成功' */ },
    { status: 'CANCELLED', color: 'rgba(0,0,0,0.65)' /* , text: 导出失败' */ },
  ];

  if (data.length === 0) {
    if (emptyContent) {
      content = emptyContent;
    } else {
      content = (
        <div className={styles.notFound}>
          <img src={emptyImage} alt="not found" />
        </div>
      );
    }
  } else {
    content = (
      <List className={styles.list}>
        {data.map((item, i) => {
          let tag;
          if (item.importStatus) {
            const tagItem = status.find((t) => t.status === item.importStatus) || {};
            const tagFontColor = fontColor.find((t) => t.status === item.importStatus) || {};
            tag = (
              <div>
                {TagRender(
                  item.importStatus,
                  [
                    {
                      status: item.importStatus,
                      text: item.importStatusMeaning,
                      color: tagItem?.color,
                    },
                  ],
                  '',
                  tagFontColor?.color
                )}
              </div>
            );
          }
          if (item.exportStatus) {
            const tagItem = exportStatus.find((t) => t.status === item.exportStatus) || {};
            const tagFontColor = exportFontColor.find((t) => t.status === item.exportStatus) || {};
            tag = (
              <div>
                {TagRender(
                  item.exportStatus,
                  [
                    {
                      status: item.exportStatus,
                      text: item.exportStatusMeaning,
                      color: tagItem?.color,
                    },
                  ],
                  '',
                  tagFontColor?.color
                )}
              </div>
            );
          }
          const itemCls = classNames(styles.item, {
            [styles.read]: item.read,
            [styles.default]: !!tag,
          });

          return (
            <List.Item
              className={itemCls}
              key={item.key || i}
              onClick={() => {
                if (onClick) {
                  onClick(item);
                }
              }}
            >
              <List.Item.Meta
                className={styles.meta}
                // avatar={item.avatar ? <Avatar className={styles.avatar} src={item.avatar} /> : null}
                title={
                  <div className={styles.title}>
                    <span dangerouslySetInnerHTML={{ __html: item.title }} />
                  </div>
                }
                description={
                  <div className={styles.description}>
                    <div>
                      {item.userMessageTypeMeaning !== undefined ? (
                        <span dangerouslySetInnerHTML={{ __html: item.userMessageTypeMeaning }} />
                      ) : (
                        tag
                      )}
                    </div>
                    <div>{item.datetime}</div>
                  </div>
                }
                onClick={(e) => contentItemAction(e)}
              />
            </List.Item>
          );
        })}
      </List>
    );
  }
  const title = (
    <div className={styles.content}>
      <span className={styles['content-action']}>{contentTitleAction}</span>
    </div>
  );
  return (
    <div>
      {content}
      {title}
    </div>
  );
}
