/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { Spin } from 'choerodon-ui/pro';
import { PageContext } from 'components/Page';

import { connect } from 'dva';
import styles from './style.less';

@connect()
export default class EmbedPage extends React.Component {

  coverPageProps = {};

  constructor(props) {
    super(props);
    this.state = {
      Page: null,
      subPageDataLoading: props.subPageDataLoading || false,
    };
    if (props.onRef) props.onRef(this);
    this.setPage(true);
  }

  componentDidUpdate(prevProps) {
    if (this.props.href && prevProps.href !== this.props.href) {
      this.setPage();
    }
  }

  setPage(init = false) {
    const { href, coverPagePropsHook } = this.props;
    if (href && window.loadMicroModule) {
      const newState = {
        pageKey: href,
        Page: null,
      };
      const matchHref = href.split('?')[0];
      const store = window.dvaApp._store;
      let currentMatch;
      const routes = store.getState().global.routerData;
      Object.keys(routes).forEach((key) => {
        const route = routes[key];
        if (!route.component) return;
        if (route.pathRegexp && route.pathRegexp.test(matchHref)) {
          if (!currentMatch) {
            currentMatch = route;
          } else if (route.priority >= (currentMatch.priority || 0)) {
            currentMatch = route;
          }
          if (currentMatch && coverPagePropsHook) {
            this.coverPageProps = coverPagePropsHook(currentMatch);
          }
        }
      });
      newState.Page = currentMatch ? currentMatch.component : undefined;
      if (!newState.Page) {
        (async (pathname) => {
          await window.loadMicroModule({ pathname });
          try {
            let currentMatch2;
            const routes2 = store.getState().global.routerData;
            Object.keys(routes2).forEach((key) => {
              const route = routes2[key];
              if (!route.component) return;
              if (route.pathRegexp && route.pathRegexp.test(matchHref)) {
                if (!currentMatch2) {
                  currentMatch2 = route;
                } else if (route.priority >= (currentMatch2.priority || 0)) {
                  currentMatch2 = route;
                }
                if (currentMatch2 && coverPagePropsHook) {
                  this.coverPageProps = coverPagePropsHook(currentMatch2);
                }
              }
            });
            this.setState({
              pageKey: href,
              Page: currentMatch2 ? currentMatch2.component : undefined,
            });
            // eslint-disable-next-line no-empty
          } catch (e) {}
        })(matchHref);
      } else if (init) {
        this.state = {
          ...this.state,
          ...newState,
        };
      } else {
        this.setState(newState);
      }
    }
  }

  loadingNode = (
    <div className="overlay-spinning">
      <Spin spinning />
    </div>
  );

  toggleLoading = (newLoading) => {
    this.setState({ subPageDataLoading: newLoading });
  };

  render() {
    const { subPageDataLoading } = this.state;
    const { contentStyle, modal, pageData, href, loadingNode, history, ...others } = this.props;
    const { Page, pageKey } = this.state;
    const loading = loadingNode || this.loadingNode;

    return (
      <PageContext.Provider value={{ modal, history }}>
        <div className={styles['sub-page-wrapper']}>
          <div style={{ ...contentStyle, display: subPageDataLoading ? 'none' : 'block' }}>
            {href === pageKey && Page ? (
              // 避免href变更Page没清空的bug
              <Page
                href={href}
                pageData={pageData}
                {...others}
                history={history}
                {...(this.coverPageProps || {})}
                modal={modal}
                toggleLoading={this.toggleLoading}
              />
            ) : null}
          </div>
          {subPageDataLoading && loading}
        </div>
      </PageContext.Provider>
    );
  }
}
