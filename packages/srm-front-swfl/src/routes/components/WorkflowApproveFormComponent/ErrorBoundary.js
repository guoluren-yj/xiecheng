import React, { Component } from 'react';
import { Result } from 'choerodon-ui';
import intl from 'utils/intl';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // 更新状态以显示备用UI
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      // 错误时显示的UI
      return (
        <Result
          status="error"
          subTitle={intl.get('hwfp.approveForm.page.error').d('审批表单页面出错了！')}
        />
      );
    }
    return this.props.children;
  }
}
