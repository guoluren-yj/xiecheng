/*
 * @Description: AI Icon
 * @Date: 2025-01-24 11:22:12
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Icon } from 'choerodon-ui';
import { EventManager } from '_utils/utils';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import classNames from 'classnames';
import { ReactComponent as AiSvg } from '@/assets/ai.svg';
import { ReactComponent as GreyAiSvg } from '@/assets/greyAi.svg';
import { ReactComponent as AiEditorSvg } from '@/assets/editor_ai.svg';
import styles from './index.less';

const AISvg = ({ diffFlag: flag, text, children, isInner, isRender, mustIcon, diffValue = '' }) => {
  const diffFlag = Number(flag);
  if (!diffFlag && !mustIcon) {
    return text || children || null;
  }
  const handleAiClick = () => {
    EventManager.emit('SPCM_CLOSE_LINE_MODAL'); // 关闭行编辑弹窗
    EventManager.emit('SPCM_SWITCH_MODE_TAB', { tabKey: 'SPLIT', extractValue: text || children }); // 切换到分割模式并选中当前文本
    EventManager.emit('SEARCH_KEY_INFO', text || children); // 搜索当前文本
  };

  let aiElement = null;
  if (diffFlag === 1) {
    aiElement = <GreyAiSvg />;
  } else if (diffFlag === 2) {
    aiElement = <AiEditorSvg />;
  } else if (diffFlag === 3) {
    aiElement = <AiSvg onClick={handleAiClick} />;
  }
  if (isInner) {
    return (
      <span onMouseDown={(e) => e.stopPropagation()} className={classNames({ [styles.RenderAISvg]: isRender, [styles.InnerAISvg]: true })}>
        <Tooltip
          title={diffValue}
          placement="left"
        >
          <span className={styles['inner-ai-icon']}>{aiElement}</span>
        </Tooltip>
        {children}
      </span>
    );
  }
  return (
    <div className={styles.AISvg}>
      <Tooltip title={diffValue} placement="top">
        <span className={styles['ai-icon']}>{aiElement}</span>
      </Tooltip>
      <span>{children}</span>
      {mustIcon && (
        <Tooltip title={intl.get('spcm.common.view.message.required').d('必填项不能为空')}>
          <Icon className={styles.icon} type="info" />
        </Tooltip>
      )}
    </div>
  );
};

export default AISvg;
