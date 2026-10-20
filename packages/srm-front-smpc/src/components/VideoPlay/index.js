import React, { useRef } from 'react';
import { Player, ControlBar } from 'video-react';

import styles from './index.less';
import 'video-react/dist/video-react.css';

export default function VideoPlay(props) {
  const { value, width, height } = props;
  const myPlayer = useRef();
  // const [setIsPlay] = useState(false);
  // useEffect(() => {
  //   if (myPlayer.current) {
  //     myPlayer.current.subscribeToStateChange((state) => {
  //       setIsPlay(!state.paused);
  //     });
  //   }
  // }, []);
  return (
    <div className={styles['video-wrapper']} style={{ width, height }}>
      <Player
        muted
        ref={(player) => {
          myPlayer.current = player;
        }}
      >
        <source src={value} />
        <ControlBar autoHide={false} />
      </Player>
    </div>
  );
}
