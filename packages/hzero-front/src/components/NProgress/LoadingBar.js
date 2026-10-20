import React from 'react';
import { Spin } from 'hzero-ui';
import NProgress from './index';

export default class LoadingBar extends React.Component {
  componentDidMount() {
    NProgress.start();
  }

  componentWillUnmount() {
    NProgress.done();
  }

  render() {
    return <Spin size='large' style={{ position: 'absolute', top: '50%', left: '50%' }} />;
  }
}
