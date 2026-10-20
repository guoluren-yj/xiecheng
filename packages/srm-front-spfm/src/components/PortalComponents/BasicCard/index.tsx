/**
 * PortalBasicCard - 基础卡片
 * @date: 2021-07-07
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { ReactNode, useMemo, useState } from 'react';
import { Icon } from 'choerodon-ui';
import { RichText } from 'choerodon-ui/pro';
import Cookies from 'universal-cookie';
import { startsWith } from 'lodash';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';

import { PROTAL_CARD_CONTENT_TYPE } from '@/utils/utils';
import styles from './index.less';

const { RichTextViewer } = RichText;
const cookies = new Cookies();
interface PortalBasicCardProps {
  icon?: string;
  title: string;
  richTextObject?: any;
  _tls: any;
  cardTitleStatus?: number;
  link?: string;
  cardContentType?: string;
  match;
  location;
  history;
}
const PortalBasicCard: React.FC<PortalBasicCardProps> = ({
  icon,
  title = '',
  richTextObject,
  _tls = {},
  cardTitleStatus = 0,
  link,
  cardContentType,
  match,
  location,
  history,
}) => {
  const _cardTitleStatus = cardContentType === PROTAL_CARD_CONTENT_TYPE.CUSTOMIZE ? 0 : cardTitleStatus;
  const [language] = useState(cookies.get('language') || 'zh_CN');
  const iframeSrc = useMemo(() => {
    return `//${window.location.host}${window?.$$env?.BASE_PATH || '/'}${
      link && startsWith(link, '/') ? link.slice(1) : link
    }`;
  }, []);
  let contentNode: ReactNode = null;
  switch(cardContentType) {
    case PROTAL_CARD_CONTENT_TYPE.IFRAME: contentNode = (
      <iframe
        src={iframeSrc}
        title={title}
        id="includeFrame"
        width="100%"
        frameBorder="0"
        className="basic-rich-text"
      />
    ); break;
    case PROTAL_CARD_CONTENT_TYPE.CUSTOMIZE: contentNode = (
      <EmbedPage
        contentStyle={{ width: "100%", height: "100%" }}
        href={typeof link === 'string' ? link : ''}
        match={match}
        history={history}
        location={location}
      />
    ); break;
    default:
      contentNode = (
        <div className="basic-rich-text" style={_cardTitleStatus ? {} : { height: '100%' }}>
          <RichTextViewer
            style={{
            overflowY: 'auto',
            height: '100%',
          }}
            deltaOps={richTextObject ? richTextObject[language] : []}
          />
        </div>
      );
      break;
  }
  return (
    <div className={styles['portal-basic-container']}>
      {_cardTitleStatus ? (
        <div className="basic-header">
          {icon ? <Icon type={icon} /> : null}
          <div>{(_tls.title && _tls.title[language]) || title}</div>
        </div>
      ) : null}
      {contentNode}
    </div>
  );
};

export default React.memo(PortalBasicCard);
