/**
 * Navbar - 导航栏
 * @date: 2021-03-18
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import classnames from 'classnames';
import React, { useState } from 'react';
import { Icon, Anchor } from 'choerodon-ui';
import styles from './index.less';

const { Link } = Anchor;

const Navbar = ({ linkList }) => {
  const [anchorShow, setAnchorShow] = useState(false);

  const toggleAnchor = () => {
    setAnchorShow((preAnchorShow) => !preAnchorShow);
  };

  return (
    <div
      className={classnames(styles['page-anchor-container'], {
        [styles['toggle-show']]: !anchorShow,
      })}
    >
      <div className={styles['anchor-icon']} onClick={toggleAnchor}>
        <Icon
          type="baseline-arrow_right"
          className={
            anchorShow ? styles['anchor-icon-custom-right'] : styles['anchor-icon-custom-left']
          }
          style={{ fontSize: 27, marginLeft: -8 }}
        />
      </div>
      <div className={classnames(styles['anchor-content'])}>
        <Anchor
          getContainer={() => document.getElementsByClassName('page-container')[0] || document.body}
        >
          {linkList.map((n) => (
            <Link href={`#${n.key}`} title={n.title} />
          ))}
        </Anchor>
      </div>
    </div>
  );
};

export default Navbar;
