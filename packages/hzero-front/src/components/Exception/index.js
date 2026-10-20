import React, { createElement, useEffect, useMemo } from 'react';
import { Modal, Icon, Button } from "choerodon-ui/pro";
import classNames from 'classnames';
import Cookies from 'universal-cookie';
import { HZERO_PLATFORM } from 'utils/config';

import { getResponse } from '../../utils/utils';
import request from '../../utils/request';
import config from './typeConfig';
import styles from './index.less';

const cookies = new Cookies();

const Exception = ({ className, linkElement = 'a', type, title, desc, img, actions, ...rest }) => {
  const pageType = type in config ? type : '404';
  const clsString = classNames(styles.exception, className);
  const render404 = useMemo(() => {
    return (
      <div className={clsString} {...rest}>
        <div className={styles.imgBlock404}>
          <div
            className={styles.imgEle}
          >
            {config[pageType].img}
            <div className={styles.desc404}>
              {desc || (config[pageType].desc && config[pageType].desc())}
            </div>
            <div className={styles.actions}>
              {actions ||
                createElement(linkElement, {
                  to: '/',
                  href: '/',
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }, []);

  const render403 = useMemo(() => {
    return (
      <div className={clsString} {...rest}>
        <div className={styles.imgBlock403}>
          <div
            className={styles.imgEle}
          >
            {config[pageType].img}
            <div className={styles.desc403}>
              {desc || (config[pageType].desc && config[pageType].desc())}
            </div>
            <div className={styles.actions}>
              {actions ||
                createElement(linkElement, {
                  to: '/',
                  href: '/',
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }, []);
  useEffect(() => {
    let errors = null;
    try {
      errors = JSON.parse(localStorage.getItem("SRM-SELF-ERROR-500-RECORDS") || "[]");
    } catch(e) {};
    if (type == 500 && errors && errors.length) {
      queryIntl('hzero.common').then(res => {
        Modal.open({
          title: null,
          closable: true,
          style: { width: "800px" },
          children: (
            <>
              <div style={{marginTop: "-24px", display: 'flex', alignItems: "center"}}>
                <Icon type="warning" style={{color: "red", marginRight: '8px'}} />
                <span style={{fontSize: '14px'}}>{res["hzero.common.exception.self.errorTip"] || "网络出现波动，请稍后点击刷新按钮重新加载页面"}</span>
              </div>
              <div style={{marginTop: "24px", display: 'flex', alignItems: "center", justifyContent: "flex-end"}}>
                <Button icon="replay" color="primary" onClick={() => window.location.reload()}>{res["hzero.common.button.refresh"] || "刷新"}</Button>
              </div>
            </>
          ),
          footer: null,
        });
      });
    }
  }, []);
  const render500 = useMemo(() => {

    return (
      <div className={clsString} {...rest}>
        <div className={styles.content}>
          <h1>{title || config[pageType].title}</h1>
          <div className={styles.desc}>
            {desc || (config[pageType].desc && config[pageType].desc())}
          </div>
          <div className={styles.actions}>
            {actions ||
              createElement(linkElement, {
                to: '/',
                href: '/',
              })}
          </div>
        </div>
        <div className={styles.imgBlock}>
          <div
            className={styles.imgEle}
          >
            {config[pageType].img}
          </div>
        </div>
      </div>
    );
  }, []);

  // return (
  //   <div className={clsString} {...rest}>
  //     <div className={styles.imgBlock}>
  //       <div
  //         className={styles.imgEle}
  //       >
  //         {config[pageType].img}
  //       </div>
  //     </div>
  //     <div className={styles.content}>
  //       <h1>{title || config[pageType].title}</h1>
  //       <div className={styles.desc}>
  //         {desc || (config[pageType].desc && config[pageType].desc())}
  //       </div>
  //       <div className={styles.actions}>
  //         {actions ||
  //           createElement(linkElement, {
  //             to: '/',
  //             href: '/',
  //           })}
  //       </div>
  //     </div>
  //   </div>
  // );
  switch (pageType) {
    case "403": return render403;
    case "404": return render404;
    default: return render500;
  }
};

async function queryIntl(promptKey) {
  const language = cookies.get('language') || 'zh_CN';
  const tenantId = cookies.get('hostTenantId') || cookies.get('tenantId') || 0;
  const res = await request(
    `${HZERO_PLATFORM}/v1/${tenantId}/prompt/${language}?promptKey=${promptKey}`
  );
  if (getResponse(res)) {
    return res;
  }
  return {};
};

export default Exception;
