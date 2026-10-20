import React from 'react';
import { Link } from 'dva/router';
import classNames from 'classnames';
import Exception from 'components/Exception';
import config from 'components/Exception/typeConfig';
import styles from "./style.less";

export default ({ className, linkElement = 'a', type, title, desc, img, actions, ...rest }) => {
  const pageType = '403';
  const clsString = classNames(styles.exception, className);
  return (
    <div className={clsString} {...rest}>
      <div className={styles.imgBlock}>
        <div
          className={styles.imgEle}
          style={{ backgroundImage: `url(${img || config[pageType].img})` }}
        />
        <div className={styles.desc}>
          {desc || (config[pageType].desc && config[pageType].desc())}
        </div>
      </div>
    </div>
  );
};
