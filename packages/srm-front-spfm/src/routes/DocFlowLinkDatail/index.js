/**
 * DocInfo
 * 单据流单据信息
 * @date: 2021-09-08
 * @author: xiaopeng <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Suspense, useState, useEffect } from 'react';
import EmbedPage from '_components/EmbedPage';
import intl from 'utils/intl';
import qs from 'querystring';
import { overWriteConfig } from 'hzero-boot';
import { getCurrentOrganizationId } from 'utils/utils';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { queryMenuId, queryToken } from './docFlowService';

const DocLinkDetail = (props) => {
  const {
    location: { state = {} },
    location,
  } = props || { location: { state } };
  const [init, setInitValue] = useState(false);
  const params = qs.parse(location.search.substr(1)) || {};
  const { link = '', ...otherParams } = params;
  const detailParams = link.indexOf('?') ? link.substr(link.indexOf('?'), link.length) : null;
  const _location = {
    hash: '',
    pathname: link,
    search: detailParams,
  };
  const flexLinkProps = {
    path: link,
    location: _location,
    match: {
      params: { ...otherParams },
      path: link,
    },
    history: {
      ...window.dvaApp._history,
      location: _location,
    },
  };

  useEffect(() => {
    const linkParams = qs.parse(location.search.substr(1)) || {};

    queryMenuId({ currentOrganizationId: getCurrentOrganizationId() })
      .then((res) => {
        const response = getResponse(res);
        if (response && response?.id) {
          if (Number(linkParams?.linkCheckFlag) !== 1) {
            queryToken({
              activeTabMenuId: response?.id,
              currentOrganizationId: getCurrentOrganizationId(),
            })
              .then((data) => {
                const urlOther = {
                  activeTabMenuId: response?.id,
                  's-workflow-token': data,
                };
                window.history.pushState(
                  null,
                  null,
                  location.search
                    ? '?'.concat(qs.stringify({ ...linkParams, ...urlOther }))
                    : '?'.concat(urlOther)
                );
              })
              .finally(() => {
                overWriteConfig({
                  patchRequestHeader: () => {
                    const docParams = {};
                    // 只作用于工作流
                    try {
                      if (window.top.location.href.includes('/doc-link')) {
                        const urlParams = qs.parse(window.top.location.search.substr(1));
                        docParams['H-Menu-Id'] = window.top.location.href.includes('/doc-link')
                          ? urlParams.activeTabMenuId
                          : window.top.dvaApp._store.getState().global.activeTabMenuId;
                        if (urlParams['s-workflow-token']) {
                          docParams['s-workflow-token'] = urlParams['s-workflow-token'];
                        }
                      }
                    } catch (e) {
                      console.log(e);
                    }
                    return docParams;
                  },
                });
                setInitValue(true);
              });
          }
        } else {
          setInitValue(true);
        }
      })
      .finally(() => {
        setInitValue(true);
      });
  }, []);
  return (
    <Suspense
      fallback={<div>{intl.get('hzero.common.view.load.loadingMsg').d('正在加载...')}</div>}
    >
      {init && <EmbedPage href={link} {...flexLinkProps} />}
    </Suspense>
  );
};

export default DocLinkDetail;
