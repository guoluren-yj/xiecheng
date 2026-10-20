/*
 * @Description:
 * @Date: 2025-01-26 11:43:51
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Tooltip, Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import styles from './index.less';

/**
 * 模式切换
 * @object props
 * */
export default function SwitchTab(props) {
  const {
    switchTabKey: switchKey = 'SPLIT',
    useHdChange = (e) => e,
    intelligent = false, // 开启分屏模式场景，所有按钮都展示
    notIntelligentShowBtnFlag = false, // 没开启分屏模式，再看这个标识
    loading = false,
    headerInfo = {},
  } = props;
  const { showAttachmentFlag } = headerInfo;
  if (Number(showAttachmentFlag) === 1) {
    return null;
  }
  // const [switchKey, setSwitchKey] = useState(switchTabKey);
  const handleSwitch = (key) => {
    useHdChange({ tabKey: key });
    // setSwitchKey(key);
  };
  // 按钮隐藏标识
  const hiddenTab = !intelligent && !notIntelligentShowBtnFlag;
  return !hiddenTab ? (
    <div className={styles['switch-tab-wrapper']}>
      <Spin spinning={loading}>
        <div className={styles['toggle-key']}>
          {intelligent && (
            <div
              onClick={() => handleSwitch('SPLIT')}
              className={styles[switchKey === 'SPLIT' ? 'activity' : 'toggle-key-btn']}
            >
              <Tooltip title={intl.get('spcm.workspace.view.message.splitMode').d('分屏模式')}>
                <span className={styles['toggle-btn']}>
                  {intl.get('spcm.workspace.view.message.splitMode').d('分屏模式')}
                </span>
              </Tooltip>
            </div>
          )}
          <div
            onClick={() => handleSwitch('DOC')}
            className={styles[switchKey === 'DOC' ? 'activity' : 'toggle-key-btn']}
          >
            <Tooltip title={intl.get('spcm.workspace.view.message.documentsMode').d('单据模式')}>
              <span className={styles['toggle-btn']}>
                {intl.get('spcm.workspace.view.message.documentsMode').d('单据模式')}
              </span>
            </Tooltip>
          </div>
          <div
            onClick={() => handleSwitch('TEXT')}
            className={styles[switchKey === 'TEXT' ? 'activity' : 'toggle-key-btn']}
          >
            <Tooltip title={intl.get('spcm.workspace.view.message.textMode').d('文本模式')}>
              <span>{intl.get('spcm.workspace.view.message.textMode').d('文本模式')}</span>
            </Tooltip>
          </div>
        </div>
      </Spin>
    </div>
  ) : null;
}
