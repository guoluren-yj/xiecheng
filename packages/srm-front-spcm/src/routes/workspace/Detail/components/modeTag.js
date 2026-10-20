import React from 'react';
import classnames from 'classnames';
import intl from 'utils/intl';
import styles from './modeTag.less';

const ModeTag = (props) => {
  // const [activeKey, setActiveKey] = useState('');
  const { activeKey, onRightClick, onLeftClick, leftTitle, rightTitle } = props;
  return (
    <div className={styles.wrapper}>
      <div
        onClick={() => {
          // eslint-disable-next-line no-unused-expressions
          onRightClick && onRightClick();
        }}
        className={classnames({
          [styles.wrapperText]: true,
          [styles.wrapperActive]: activeKey,
        })}
      >
        {leftTitle || intl.get('spcm.workspace.view.message.textMode').d('文本模式')}
      </div>
      <div
        onClick={() => {
          // eslint-disable-next-line no-unused-expressions
          onLeftClick && onLeftClick();
        }}
        className={classnames({
          [styles.wrapperText]: true,
          [styles.wrapperActive]: !activeKey,
        })}
      >
        {rightTitle || intl.get('spcm.workspace.view.message.documentsMode').d('单据模式')}
      </div>
    </div>
  );
};

export default ModeTag;
