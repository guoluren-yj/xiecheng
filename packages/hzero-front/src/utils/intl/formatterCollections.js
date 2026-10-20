import React from 'react';
import { connect } from 'dva';
import { Spin } from 'hzero-ui';
import { isArray, isString } from 'lodash';
import request from 'utils/request';
import { getCurrentOrganizationId, getSession } from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import loadPromptLocale from './loadPromptLocale';
import intl from '.';

const { HZERO_PLATFORM, BASE_PATH, ENV_FLAG } = getEnvConfig();

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function formatterCollections({ code = '' } = {}) {
  return (Component) => {
    class IntlComponent extends React.Component {
      static displayName = `IntlComponent(${getDisplayName(Component)})`;

      state = {
        localeLoaded: false,
      };

      loading = false;

      currentLanguage = null;

      async loadLocale(language) {
        try {
          const organizationId = getCurrentOrganizationId() || 0;
          // 去掉最后一个/
          let basePath = BASE_PATH;
          if (basePath) {
            basePath =
              basePath.length > 1 && basePath.endsWith('/')
                ? basePath.substr(0, basePath.length - 1)
                : basePath;
          }
          if (
            window &&
            ENV_FLAG === 'dev' &&
            window.intl &&
            window.intl.missPrompt &&
            window.intl.missPrompt.length > 0 &&
            (organizationId === 0 || organizationId === 30 || organizationId === 1052) && // 只有 srm平台 | 甄云租户 | 森林木有限公司(商城使用) 可以刷入多语言
            !window.location.pathname.startsWith(`${basePath || '/'}/public`) // 修复 public 页面触发接口401问题
          ) {
            request(`${HZERO_PLATFORM}/v1/prompt-translate/insert`, {
              method: 'POST',
              body: window.intl.missPrompt,
            }).then((res) => {
              if (res && res.failed === true) {
                window.intl.missPrompt = [];
              }
            });
          }
          // eslint-disable-next-line no-empty
        } catch (e) {
        }
        if (language && this.currentLanguage !== language) {
          // 必须要 language 有值
          this.currentLanguage = language;
          const multipleCode = isString(code) ? [code] : isArray(code) ? code : [];
          if (multipleCode.length) {
            this.loading = true;
            try {
              const organizationId = getCurrentOrganizationId() || 0;
              await Promise.all(multipleCode.map((code) => (
                loadPromptLocale(organizationId, language, code)
              )));
            } finally {
              this.loading = false;
              this.setState({
                localeLoaded: true,
              });
            }
          } else {
            this.setState({
              localeLoaded: true,
            });
          }
        }
      }

      componentDidMount() {
        const { language } = this.props;
        this.loadLocale(language || getSession('language'));
      }

      componentDidUpdate() {
        this.loadLocale(this.props.language);
      }

      shouldComponentUpdate() {
        return !this.loading;
      }

      render() {
        const { localeLoaded } = this.state;
        return localeLoaded ? <Component intl={intl} {...this.props} /> : <Spin />;
      }
    }

    return connect(({ global = {} }) => ({
      language: global.language,
    }))(IntlComponent);
  };
}
