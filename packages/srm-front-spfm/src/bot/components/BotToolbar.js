/**
 * BotToolbar - 盘古 Bot 工具栏组件
 *
 * 仅保留"修改&运行脚本"开关（Switch）。
 *   其他操作按钮（清空、导出）放在 Session bar 中。
 *
 * TG BotToolbar 布局：
 *   [计划书按钮] [修改&运行脚本 Switch] [Token统计]
 *
 * PG BotToolbar 布局（暂缺计划书和Token统计，仅保留核心开关）：
 *   [修改&运行脚本 Switch]
 *
 * @date: 2026-06-12
 */

import React from 'react';
import { Switch } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import styles from './BotStyles.less';

/**
 * @param {Object} props
 * @param {boolean} props.scriptModifyEnabled - 脚本修改开关是否启用
 * @param {Function} props.onScriptModifyToggle - () => void 切换脚本修改开关
 */
function BotToolbar({ scriptModifyEnabled, onScriptModifyToggle }) {
  return (
    <div className={styles['bot-toolbar']}>
      {/* 修改&运行脚本开关 */}
      <div className={styles['bot-toolbar-switch-inline']}>
        <Switch checked={scriptModifyEnabled} onChange={onScriptModifyToggle} />
        <span className={styles['bot-toolbar-switch-label-inline']}>
          {intl.get('spfm.bot.settings.scriptModify').d('修改&运行脚本')}
        </span>
      </div>
    </div>
  );
}

export default BotToolbar;
