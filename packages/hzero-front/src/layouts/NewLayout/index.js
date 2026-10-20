/**
 * NewLayout
 * @author Hugh <huazhen.wu01@going-link.com>
 * @date 2022/7/7
 * @copyright 2022 © ZHENYUN
 */
import React, { useRef } from 'react';
import classnames from 'classnames';
import { connect } from 'dva';

import { getClassName } from './utils';
import NewHeader from './components/NewHeader';
import NewNav from './components/NewNav';
import NormalContent from '../DefaultLayout/components/NormalContent';
import DefaultLayoutAction from '../components/DefaultLayoutAction';
import DefaultCheckUserSafe from '../components/DefaultCheckUserSafe';
import DefaultListenAccessToken from '../components/DefaultListenAccessToken';
import NewListenWebSocket from './components/NewListenWebSocket';
import DefaultListenFavicon from '../components/DefaultListenFavicon';
import DefaultLicenseTip from '../components/DefaultLicenseTip';

import './styles.less';

function getContentClassName(...paths) {
  return getClassName('content', ...paths);
}

const NewLayout = function NewLayout(props) {
  const { extraHeaderRight, showLicenseTip } = props;
  const bodyRef = useRef();
  return (
    <div
      className={classnames(getClassName('container'), {
        [getClassName('container', 'has-tip')]: showLicenseTip,
      })}
    >
      <NewHeader extraRight={extraHeaderRight} />
      {showLicenseTip && <DefaultLicenseTip />}
      <div className={getClassName('body')}>
        <NewNav bodyRef={bodyRef} />
        <div className={getContentClassName()} ref={bodyRef}>
          <NormalContent getClassName={getContentClassName} />
        </div>
      </div>
      <DefaultLayoutAction />
      <DefaultCheckUserSafe />
      <DefaultListenAccessToken />
      <NewListenWebSocket />
      <DefaultListenFavicon />
    </div>
  );
};

export default connect(({ global = {} }) => ({
  showLicenseTip: global.showLicenseTip,
}))(NewLayout);
