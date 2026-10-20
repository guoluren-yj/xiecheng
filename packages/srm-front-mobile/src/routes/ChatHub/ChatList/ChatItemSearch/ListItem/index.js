/**
 * 即刻3.0搜索结果列表
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/26
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import React, { memo } from 'react';
import CLN from 'classnames';
import DefaultAvator from '@/assets/detault_avatar.jpg';
import styles from './index.less';

const ListItem = (props) => {
  const { className, active, data, onClick } = props;
  const { roomName, messageNum, roomIcon } = data;

  return (
    <div
      className={CLN(styles['list-item'], className, { [styles.active]: active })}
      onClick={() => onClick?.(data)}
    >
      <img className={styles['list-item-avatar']} src={roomIcon || DefaultAvator} alt="" />
      <div className={styles['list-item-right']}>
        <div className={styles.ellipsis}>{roomName}</div>
        {!!messageNum && (
          <div className={CLN(styles['list-item-msg'], styles.ellipsis)}>
            {`${messageNum}条相关记录`}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ListItem);
