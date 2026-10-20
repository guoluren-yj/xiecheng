import React from 'react';
import { withRouter } from 'dva/router';
import querystring from 'querystring';
import { isFunction } from 'lodash';
import { Spin } from 'hzero-ui';
import { overWriteConfig } from 'hzero-boot';
import intl from 'utils/intl';
import { resolveRequire } from 'utils/utils';
import { loadApproveFormWithCustomSubmit } from 'hzero-front/lib/customize/workflowApproveForm';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import ErrorBoundary from './ErrorBoundary';

@withRouter
export default class workflowApproveFormComponent extends React.Component {
  constructor(props) {
    super(props);
    const { code, formKey, module, onFormLoaded } = props;
    this.state = {};
    this.workflowApproveFormComponent = React.lazy(async () => {
      // lazy must be () => import();
      // import is __esModule, so there return __esModule
      const moduleFrom = module ? module.split(',') : [];
      const {
        approveForm: ctorTemp,
        customSubmit = false,
      } = (await loadApproveFormWithCustomSubmit(code, moduleFrom)) || { approveForm: null };
      const { approveForm: ctor } = (await loadApproveFormWithCustomSubmit(
        formKey,
        moduleFrom
      )) || {
        approveForm: null,
      };
      if (resolveRequire(ctorTemp) || resolveRequire(ctor)) {
        overWriteConfig({
          patchRequestHeader: () => {
            const params = {};
            // 只作用于工作流
            try {
              if (window.top.location.href.includes('/hwfp')) {
                params['H-Menu-Id'] = window.top.dvaApp._store.getState().global.activeTabMenuId;
                const urlParams = querystring.parse(window.top.location.search.substr(1));
                if (urlParams['s-workflow-token']) {
                  params['s-workflow-token'] = urlParams['s-workflow-token'];
                }
              }
            } catch (e) {
              console.log(e);
            }
            return params;
          },
        });
      }
      // 有自定义审批逻辑，按钮仍不可点击，由模块控制可点击的逻辑。
      // 无自定义审批逻辑，按钮可点击
      if (isFunction(onFormLoaded)) {
        onFormLoaded(!customSubmit);
      }

      return Promise.resolve({
        __esModule: true,
        default:
          resolveRequire(ctorTemp) ||
          resolveRequire(ctor) ||
          (() => (
            <div style={{ color: 'grey' }}>
              {intl
                .get('hwfp.approveForm.view.message.title.notFound', {
                  code,
                })
                .d(`未找到对应编码为“${code}”的审批表单`)}
            </div>
          )),
      });
    });
    // 标准单据样式工作流表单，获取formKey上的参数来设置审批按钮是否可点击
    if (
      code &&
      code.split(':').length > 1 &&
      code.split(':')[1] === 'EMBEDPAGE' &&
      isFunction(onFormLoaded)
    ) {
      const value = formKey.split('customSubmit=')[1]
        ? formKey.split('customSubmit=')[1].split('&')[0] === 'true'
        : false;
      onFormLoaded(!value);
    }
  }

  embedPageLocationParams = (formKey) => {
    const paramStr = formKey.indexOf('?') === -1 ? '' : formKey.split('?')[1];
    if (paramStr) {
      return {
        workflowTemplateProps: querystring.parse(paramStr),
      };
    } else {
      return {};
    }
  };

  parseUrlParams(originUrl, realUrl) {
    const params = {};
    if (originUrl && realUrl && originUrl.indexOf('${') !== -1) {
      const originPathParts = originUrl.split('?')[0].split('/');
      const realPathParts = realUrl.split('?')[0].split('/');
      originPathParts.forEach((item, index) => {
        if (/\$\{.*\}/.test(item)) {
          const key = item.replace('${', '').replace('}', '');
          params[key] = realPathParts[index];
        }
      });
    }
    return params;
  }

  parseRoutePath = (path) => {
    const noParamPath = path.indexOf('?') === -1 ? path : path.substr(0, path.indexOf('?'));
    const routePath = noParamPath.replace('${', ':').replace('}', '');
    return routePath;
  };

  render() {
    const {
      match = {},
      location = {},
      history = {},
      originFormKey = '',
      formKey = '',
      workProcessInfo = {},
      code,
    } = this.props;
    const pathname = formKey.split('?')[0];
    const newLocation = {
      pathname: pathname.startsWith('/') ? pathname : `/${pathname}`,
      search: formKey.indexOf('?') === -1 ? '' : formKey.substr(formKey.indexOf('?')),
    };
    const originFormKeyUrl = originFormKey.startsWith('/') ? originFormKey : `/${originFormKey}`;
    const newMatch = {
      params: this.parseUrlParams(originFormKey, formKey),
      path: this.parseRoutePath(originFormKeyUrl),
      url: formKey.startsWith('/') ? formKey : `/${formKey}`,
    };
    const newProps = {
      ...this.props,
      workProcessInfo,
      history: {
        ...history,
        location: {
          ...history.loation,
          ...newLocation,
        },
      },
      location: {
        ...location,
        ...newLocation,
      },
      match: {
        ...match,
        ...newMatch,
      },
    };
    let isEmbedPageType = false;

    if (code && code.split(':').length > 1 && code.split(':')[1] === 'EMBEDPAGE') {
      isEmbedPageType = true;
    }

    if (isEmbedPageType) {
      const embedPageLocationParams = this.embedPageLocationParams(formKey);
      const embedPageProps = {
        ...newProps,
        ...embedPageLocationParams,
        href: newMatch.path || newMatch.url || '',
      };
      return (
        <React.Suspense fallback={<Spin spinning />}>
          <ErrorBoundary>
            <EmbedPage {...embedPageProps} />
          </ErrorBoundary>
        </React.Suspense>
      );
    } else {
      const InCustomizeComponent = this.workflowApproveFormComponent;
      if (InCustomizeComponent) {
        return (
          <React.Suspense fallback={<Spin spinning />}>
            <ErrorBoundary>
              <InCustomizeComponent {...newProps} />
            </ErrorBoundary>
          </React.Suspense>
        );
      }
    }

    // maybe loading
    return null;
  }
}
