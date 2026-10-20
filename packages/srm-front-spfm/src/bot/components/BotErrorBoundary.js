/**
 * BotErrorBoundary - 盘古 Bot 错误边界组件
 *
 * 类组件，使用 componentDidCatch 捕获子组件渲染异常。
 * 主要用于捕获 BotMarkdown 渲染异常（如畸形 Markdown 语法导致的 ReactMarkdown 崩溃）。
 *
 *
 *   捕获异常后显示"渲染异常，请刷新页面重试"提示 + 重新加载按钮
 *
 * @date: 2026-06-12
 */

import React from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import styles from './BotStyles.less';

class BotErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 可以在这里上报错误到日志系统
    console.error('BotErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles['bot-error-boundary']}>
          <div className={styles['bot-error-boundary-icon']}>
            <span role="img" aria-label="error">
              ⚠️
            </span>
          </div>
          <div className={styles['bot-error-boundary-title']}>
            {intl.get('spfm.bot.error.boundary.title').d('渲染异常')}
          </div>
          <div className={styles['bot-error-boundary-desc']}>
            {intl.get('spfm.bot.error.boundary.desc').d('Bot 消息渲染时发生异常，请刷新页面重试。')}
          </div>
          <Button
            onClick={this.handleReset}
            color="primary"
            className={styles['bot-error-boundary-btn']}
          >
            {intl.get('spfm.bot.error.boundary.retry').d('重试')}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BotErrorBoundary;
