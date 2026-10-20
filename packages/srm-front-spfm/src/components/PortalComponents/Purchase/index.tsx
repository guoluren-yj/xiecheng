/**
 * Purchase - 采购卡片
 * @date: 2022-07-18
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Icon, Collapse } from 'choerodon-ui';
import Cookies from 'universal-cookie';
import { getResponse } from 'utils/utils';
import request from 'utils/request';
// import qs from 'querystring';
import { getOrigin } from '@/utils/utils';
import { CollapseProps } from 'choerodon-ui/lib/collapse/Collapse';
import styles from './index.less';

const { Panel } = Collapse;
const cookies = new Cookies();
interface PortalPurchaseCardProps {
  icon?: string;
  title: string;
  _tls: any;
  cardTitleStatus?: number;
}
const PortalPurchaseCard: React.FC<PortalPurchaseCardProps> = ({
  icon,
  title = '',
  _tls = {},
  cardTitleStatus = 0,
}) => {
  const [language] = useState(cookies.get('language') || 'zh_CN');
  const [tenantId] = useState(cookies.get('tenantId') || 0);
  const [data, setData] = useState([]);
  const [defaultActiveKey, setDefaultActiveKey] = useState([]);

  const oauthIntl = useMemo(() => {
    const srmOauth = window.sessionStorage.getItem(`${language}-srm.portal`);
    if (srmOauth) {
      return JSON.parse(srmOauth);
    }
    return {};
  }, [language]);

  useEffect(() => {
    queryPurchase();
  }, []);

  const queryPurchase = () => {
    try {
      request(
        `${getOrigin()}/scux/v1/${tenantId}/generic-public-script-execution/scux_public_generic_common1/execute`,
        // `https://yankon.going-link.com/scux/v1/11973/generic-public-script-execution/scux_public_generic_common1/execute`
        {
          method: 'POST',
        }
      ).then((res) => {
        if (getResponse(res)) {
          setDefaultActiveKey(res.map((item) => item.id));
          setData(res);
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const collapseProps = useMemo((): CollapseProps => {
    return {
      bordered: false,
      expandIcon: () => <Icon type="navigate_next" />,
      expandIconPosition: 'text-right',
    };
  }, []);

  const getCollapse = (children) => {
    return children.map((item) => {
      if (item.children) {
        return (
          <Panel key={item.id} header={item.name}>
            <Collapse {...collapseProps}>{getCollapse(item.children)}</Collapse>
          </Panel>
        );
      }
      return (
        <p key={item.id} className="purchase-name">
          {item.name}
        </p>
      );
    });
  };

  return (
    <div className={styles['portal-purchase-container']}>
      {cardTitleStatus ? (
        <div className="purchase-header">
          {icon ? <Icon type={icon} /> : null}
          <div>{(_tls.title && _tls.title[language]) || title}</div>
        </div>
      ) : null}
      {data.length ? (
        <div className="purchase-collapse-container">
          <Collapse
            {...collapseProps}
            className="purchase-collapse-parent"
            defaultActiveKey={defaultActiveKey}
          >
            {getCollapse(data)}
          </Collapse>
        </div>
      ) : (
        <div className="purchase-wrapper purchase-empty">
          <img
            src={`${getOrigin()}/oauth/static/default/img/no_notice_new.svg`}
            alt="no_notice_new"
          />
          <div className="source-empty-text">
            {oauthIntl['srm.oauth.portalInfo.noData'] || '暂无数据'}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(PortalPurchaseCard);
