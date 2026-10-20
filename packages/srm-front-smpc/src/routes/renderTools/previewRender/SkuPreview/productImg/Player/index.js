import React from 'react';
import { Player } from 'video-react';

import styles from './index.less';
import 'video-react/dist/video-react.css';

export default function VideoPlayer(props) {
  const { imagePath } = props;
  return (
    <div className={styles['img-container']}>
      <Player src={imagePath} muted />
    </div>
  );
}
