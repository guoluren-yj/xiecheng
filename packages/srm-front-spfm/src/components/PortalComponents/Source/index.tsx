/**
 * PortalSource - 招标寻源
 * @date: 2021-07-06
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { SelectionMode, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';

import { getAccessToken } from 'hzero-front/lib/utils/utils';
import Cookies from 'universal-cookie';
import qs from 'querystring';
import Captcha from '@/components/Captcha';
import { getOrigin } from '@/utils/utils';

import styles from './index.less';

const cookies = new Cookies();
const MORELINK = `${window.$$env.BASE_PATH || '/'}public/bid-source-notice`;
const NEWSOURCEFROM = ['RFP', 'RFI'];
const NEWSOURCECATEGORY = ['RFA', 'RFQ'];
const NEW_BID = 'NEW_BID'; // 新招标
interface PortalSourceProps {
  icon?: string;
  title: string;
  _tls?: any;
  cardTitleStatus?: number;
  remote: any;
}

const PortalSource: React.FC<PortalSourceProps> = ({
  icon,
  title,
  remote,
  _tls = {},
  cardTitleStatus = 0,
}) => {
  const [accessToken] = useState(getAccessToken());
  const [userId] = useState(Number(cookies.get('tenantId')) || 'NO_TENANT');
  const [language] = useState(cookies.get('language') || 'zh_CN');
  const [isEmpty, setEmpty] = useState(true);
  const oauthIntl = useMemo(() => {
    const srmOauth = window.sessionStorage.getItem(`${language}-srm.portal`);
    if (srmOauth) {
      return JSON.parse(srmOauth);
    }
    return {};
  }, [language]);
  useEffect(() => {
    const referrerMeta = document.querySelector('meta[content="no-referrer"]');
    if (referrerMeta) {
      referrerMeta.setAttribute('content', 'no-referrer-when-downgrade');
    }
  }, []);
  const sourceDs = useMemo(
    () => { 
      const dsProps = {
        autoQuery: true,
        pageSize: 100,
        fields: [
          {
            name: 'bidTitle',
            type: FieldType.string,
            label: oauthIntl['srm.oauth.resourceDownload.title'] || '标题',
          },
          {
            name: 'companyName',
            type: FieldType.string,
            label: oauthIntl['srm.oauth.bidNotice.purchasingCompany'] || '采购企业',
          },
          {
            name: 'sourceCategoryMeaning',
            type: FieldType.string,
            label: oauthIntl['srm.oauth.bidSource.sourceCategory'] || '寻源类型',
          },
          {
            name: 'approvedDate',
            type: FieldType.string,
            label: oauthIntl['srm.oauth.platformNotice.releaseDate'] || '发布日期',
          },
        ],
        transport: {
          read: () => {
            // 获取招标寻源列表
            return {
              url: `${getOrigin()}/ssrc/v1/${userId}/source-notices/br-list/${
                accessToken ? '' : 'public'
              }`,
              method: 'get',
              params: {
                access_token: accessToken,
                lang: language,
                size: 100,
                asyncCountFlag: 'Y',
              },
            };
          },
        },
        events: {
          load: ({ dataSet }) => {
            setEmpty(!dataSet.length);
          },
        },
      };
      const remoteDsProps = remote ? remote?.process('BID_SOURCE_SOURCE_DS_PROPS', dsProps, { oauthIntl, }) : dsProps;
      return new DataSet(remoteDsProps); 
    },
    [oauthIntl, remote]
  );

  /**
   *  标签样式
   */
  const getSourceType = (type) => {
    let style = {};
    switch (type) {
      case 'RFQ':
        style = {
          color: '#3095f2',
          fontWeight: 600,
          background: '#eaf4fd',
          borderRadius: '0.02rem',
        };
        break;
      default:
        style = {
          color: '#47b881',
          fontWeight: 600,
          background: '#ecf7f2',
          borderRadius: '0.02rem',
        };
        break;
    }
    return style;
  };

  const handleCaptchaModal = () => {
    return new Promise((resolve, reject) => {
      let modal;
      modal = Modal.open({
        key: Modal.key(),
        destroyOnClose: true,
        title: oauthIntl['srm.oauth.portalInfo.inputCaptcha'] || '请输入验证码',
        children: <Captcha modal={modal} resolve={resolve} reject={reject} language={language}/>,
        style: { width: '460px' },
        closable: true,
      });
    });
  }

  /**
   *  跳转地址
   */
  const renderTitle = useCallback(({ value, record }) => {
    const {
      sourceHeaderId,
      sourceFrom,
      tenantId,
      sourceCategory,
      secondarySourceCategory,
    } = record.get([
      'sourceHeaderId',
      'sourceFrom',
      'tenantId',
      'sourceCategory',
      'secondarySourceCategory',
    ]);
    const hall = secondarySourceCategory === NEW_BID ? 'new-bid-hall' : 'new-inquiry-hall';
    const basePath = window.$$env.BASE_PATH || '/';

    const handleClick = async (e, link,) => {
      e.preventDefault();
      const modalRes = await handleCaptchaModal();
      console.log('modalRes', modalRes);
      if (!modalRes) return false;
      window.open(link, '_blank');
    };

    if (NEWSOURCEFROM.includes(sourceFrom) || NEWSOURCECATEGORY.includes(sourceCategory)) {
      const href = `${basePath}public/ssrc/${hall}/tender-bid-notice-preview/${sourceFrom}/${tenantId}/${sourceHeaderId}?organizationId=${tenantId}&language=${language}`;
      return (
        <a onClick={(e) => handleClick(e, href,)} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      );
    } else {
      const params = qs.stringify({
        sourceHeaderId,
        tenantId,
        language,
      });
      const href = `${basePath}public/ssrc/bid-hall/bid-notice?${params}`;
      return (
        <a onClick={(e) => handleClick(e, href,)}target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      );
    }
  }, []);

  /**
   *  渲染日期格式
   */
  const renderApprovedDate = useCallback(({ value }) => {
    return value ? value.split(' ')[0] : '';
  }, []);

  /**
   *  渲染类型
   */
  const renderSourceType = useCallback(({ record, value }) => {
    const style = getSourceType(record.get('sourceCategory'));
    return (
      <span className="source-source-type" style={style}>
        {value}
      </span>
    );
  }, []);

  const columns = useMemo(
    (): ColumnProps[] => {
      const standard = [
        { name: 'bidTitle', renderer: renderTitle },
        {
          name: 'sourceCategoryMeaning',
          width: 100,
          renderer: renderSourceType,
        },
        {
          name: 'companyName',
          width: 120,
        },
        { name: 'approvedDate', width: 120, renderer: renderApprovedDate },
        // { name: 'enabledFlag', width: 100, renderer: renderStatus },
      ];
      return remote ? remote?.process?.('BID_SOURCE_TABLE_COLUMNS', standard, { sourceDs, renderTitle, renderSourceType }) : standard;
    },
    [remote]
  );

  return (
    <div className={styles['portal-source-container']}>
      {cardTitleStatus ? (
        <div className="source-header">
          {icon ? <Icon type={icon} /> : null}
          <div>{(_tls.title && _tls.title[language]) || title}</div>
          <a className="source-more-link" href={MORELINK} target="_blank" rel="noopener noreferrer">
            {oauthIntl['srm.oauth.portalInfo.seeMore'] || '查看更多'}
          </a>
        </div>
      ) : null}
      {isEmpty ? (
        <div className="source-wrapper source-empty">
          <img
            src={`${getOrigin()}/oauth/static/default/img/no_notice_new.svg`}
            alt="no_notice_new"
          />
          <div className="source-empty-text">
            {oauthIntl['srm.oauth.portalInfo.noData'] || '暂无数据'}
          </div>
        </div>
      ) : (
        <Table
          className="table-wrap-resource"
          selectionMode={SelectionMode.none}
          border={false}
          columns={columns}
          dataSet={sourceDs}
          autoHeight={{ type: TableAutoHeightType.minHeight, diff: 16 }}
          pagination={false}
          customizable={false}
        />
      )}
    </div>
  );
};

export default React.memo(PortalSource);
