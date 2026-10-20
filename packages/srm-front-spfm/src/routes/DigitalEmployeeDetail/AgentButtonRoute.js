import React, { useEffect, useState } from 'react';
import { Spin } from 'hzero-ui';
import intl from 'utils/intl';
import { resolveRequire } from 'utils/utils';
import { getDigitalEmployeeButtonComponent } from '@/customize/digitalEmployee';
import ErrorBoundary from './ErrorBoundary';

const AgentButtonRoute = props => {
  const { path, digitalEmployeeInfo } = props;
  const [component, setComponent] = useState(null);
  useEffect(() => {
    const lazyComponent = React.lazy(async () => {
      // 要求格式一定是/pub/spfm/xxxx，这里取出spfm
      const moduleFrom = path.split('/')[2];
      if (moduleFrom && window.loadCustomizeConfigWithPackage) {
        await Promise.all(window.loadCustomizeConfigWithPackage([`srm-front-${moduleFrom}`]));
      }
      const loader = getDigitalEmployeeButtonComponent(path);
      const ctor = loader ? await loader() : null;
      return Promise.resolve({
        __esModule: true,
        default:
          resolveRequire(ctor) ||
          (() => (
            <div style={{ color: 'grey' }}>
              {intl
                .get('spfm.digitalEmployee.view.message.title.notFound', {
                  path,
                })
                .d(`未找到按钮路由为“${path}”的组件`)}
            </div>
          )),
      });
    });
    setComponent(lazyComponent);
  }, [path]);
  const newProps = {
    digitalEmployeeInfo,
  };
  const InCustomizeComponent = component;
  if (InCustomizeComponent) {
    return (
      <React.Suspense fallback={<Spin spinning />}>
        <ErrorBoundary>
          <InCustomizeComponent {...newProps} />
        </ErrorBoundary>
      </React.Suspense>
    );
  }
  // maybe loading
  return null;
};

export default AgentButtonRoute;
