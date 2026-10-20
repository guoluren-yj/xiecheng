/**
 * NewHeader
 * @author Hugh <huazhen.wu01@going-link.com>
 * @date 2022/7/7
 * @copyright 2022 © ZHENYUN
 */

import React, { createElement, isValidElement } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Icon } from 'hzero-ui';
import classNames from 'classnames';
import DocumentTitle from 'react-document-title';
import { getEnvConfig } from 'utils/iocUtils';
import remote from 'utils/remote';
// ../../utils
import { getClassName } from '../../utils';
// layouts/components
import DefaultNoticeIcon from '../../../components/DefaultNoticeIcon';
import NewLanguageSelect from '../NewLanguageSelect';
// ../
import NewAvatar from '../NewAvatar';
import NewTenantSelect from '../NewTenantSelect';

function getDefaultHeaderClassName(...paths) {
  return getClassName('header', ...paths);
}

const NewHeader = function NewHeader(props) {
  const { currentUser, menuHidden, extraRight = [] } = props;
  const { logo, title, themeConfigVO = {} } = currentUser;
  const { navColor } = themeConfigVO;
  const { MULTIPLE_LANGUAGE_ENABLE, VERSION_IS_OP } = getEnvConfig();

  let hasMultiLanguage;
  try {
    hasMultiLanguage = MULTIPLE_LANGUAGE_ENABLE ? JSON.parse(MULTIPLE_LANGUAGE_ENABLE) : true;
  } catch (e) {
    hasMultiLanguage = true;
  }

  const renderIcon = () => {
    if (typeof logo === 'string') {
      if (logo.startsWith('http') || logo.startsWith('data:')) {
        return <img src={logo} alt="" className={getDefaultHeaderClassName('logo', 'icon-img')} />;
      }
      return <Icon type={logo} className={getDefaultHeaderClassName('logo', 'icon-icon')} />;
    }
    return logo;
  };
  const headStyle = {
    backgroundColor: navColor,
  };

  const renderHeaderCenter = () => {
    const { processRemote } = props;
    if (processRemote && processRemote.render) {
      return processRemote.render(
        'LAYOUT_HEADER_CENTER',
        null,
        {}
      );
    }
    return null;
  };

  return (
    <DocumentTitle title={title}>
      <div className={getDefaultHeaderClassName()} style={headStyle}>
        <div className={getDefaultHeaderClassName('left')}>
          <div
            className={getDefaultHeaderClassName('logo')
            }
          >
            <Link to="/">
              {renderIcon(logo)}
              {/*<h1 className={getDefaultHeaderClassName('title')}>{title}</h1>*/}
            </Link>
          </div>
        </div>
        <div className={getDefaultHeaderClassName('center')}>{renderHeaderCenter()}</div>
        <div className={getDefaultHeaderClassName('right')}>
          {
            ([].concat(extraRight)).map((eleOrComponent) => (
              <div className={classNames(getDefaultHeaderClassName('right', 'item'))}>
                {isValidElement(eleOrComponent)
                  ? eleOrComponent
                  : createElement(eleOrComponent)}
              </div>
            ))
          }
          {
            !VERSION_IS_OP && (
              <NewTenantSelect
                getClassName={getDefaultHeaderClassName}
                className={classNames(
                  getDefaultHeaderClassName('right', 'item'),
                  getDefaultHeaderClassName('right', 'item', 'select'),
                )}
                optionClassName={getDefaultHeaderClassName('right', 'item', 'select', 'option')}
              />
            )
          }
          {
            !menuHidden && hasMultiLanguage && (
              <NewLanguageSelect
                className={classNames(
                  getDefaultHeaderClassName('right', 'item'),
                  getDefaultHeaderClassName('right', 'item', 'select'),
                  getDefaultHeaderClassName('language', 'select'),
                )}
                popupContentClassName={getDefaultHeaderClassName('language', 'select', 'popup', 'content')}
                popupClassName={getDefaultHeaderClassName('language', 'select', 'popup')}
              />
            )
          }
          {
            !menuHidden && (
              <DefaultNoticeIcon
                className={classNames(
                  getDefaultHeaderClassName('right', 'item'),
                  getDefaultHeaderClassName('right', 'item', 'notice'),
                )}
                icon="notifications-o"
              />
            )
          }
          <NewAvatar getHeaderClassName={getDefaultHeaderClassName} />
        </div>
      </div>
    </DocumentTitle>
  );
};

export default connect(
  ({ user = {}, global = {} }) => ({
    currentUser: user.currentUser, // 当前用户
    menuHidden: global.menuHidden, // 隐藏菜单
  }),
  null,
  null,
  { pure: true },
)(remote({
  code: 'LAYOUT_HEADER',
  name: 'processRemote',
})(NewHeader));
