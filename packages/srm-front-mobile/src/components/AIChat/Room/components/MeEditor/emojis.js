import React, { Component } from 'react';
import { emojiList } from '../../functions/message';
import commonStyles from '../../common/index.less';
import styles from './index.less';

const tabIcon = require('../../../../../assets/icon_face.png');

export default class EmojiBoard extends Component {
  emojis = emojiList;

  selectEmoji = (name) => {
    this.props.onSelect(name);
  };

  render() {
    return (
      <div className={styles['smbl-emoji-board']}>
        <div className={`${styles['smbl-emoji-list']} ${commonStyles['smbl-lum-scrollbar']}`}>
          {this.emojis.emojis.map((name, i) => {
            // eslint-disable-next-line import/no-dynamic-require
            const icon = require(`../../../../../assets/emoji/emoji_${i}.gif`);
            return (
              <img
                className={styles['smbl-emoji-img']}
                src={icon}
                alt=""
                onClick={() => this.selectEmoji(name)}
              />
            );
          })}
        </div>
        <div className={styles['smbl-emoji-tab']}>
          <div className={styles['smbl-emoji-tab-item']}>
            <img src={tabIcon} alt="" />
          </div>
        </div>
      </div>
    );
  }
}
