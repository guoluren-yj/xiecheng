/* eslint-disable react/no-danger */
/**
 * 新闻舆情
 * @date: 2022-09-02
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useEffect } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser, getResponse } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';
import StaticSearchBar from '@/components/StaticSearchBar';

import { getMsgByLovCode, getNewsContent } from '@/services/newsPublicOpinionService';
import { ReactExportButton } from './ReactExportButton';

import { newsListDS } from './store/NewsPublicOpinionDS';
import { getQueryConfig } from './queryConfig';

import style from './index.less';

const { Column } = Table;

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

const exportRequestUrl = `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/risk-news-export`;

let currentModal = null;

function NewsPublicOpinion(props = {}) {
  const { newsListDs } = props.valueDs;
  const [typeMap, setTypeMap] = useState({});

  // 查询新闻类型map
  useEffect(() => {
    getMsgByLovCode({ code: 'SDAT.RISK_NEWS_CATEGORY' }).then((res) => {
      const mapObj = {};
      (res || []).forEach((item) => {
        Object.assign(mapObj, { [item?.value]: item?.meaning });
      });
      setTypeMap(mapObj);
    });
  }, []);

  // 退出本组件时关闭弹窗
  useEffect(() => {
    return () => {
      // eslint-disable-next-line no-unused-expressions
      currentModal?.close();
    };
  }, []);

  // getFilters: 获取配置对象
  const getFilters = () => ({ ...getQueryConfig() });

  const handleFilterQueryAll = ({ params }) => {
    // 处理一下时间
    const { publishDate_range: rangeTime = '' } = params;
    const [startDate = undefined, endDate = undefined] = rangeTime?.split(',') ?? [];
    newsListDs.queryParameter = { ...params, startDate, endDate };
    newsListDs.query();
  };

  const handleClear = () => {
    newsListDs.queryParameter = {};
    newsListDs.query();
  };

  const renderTypeTag = ({ text = '', value = '' }) => {
    const typeColorMap = { none: '#F2F3F5', positive: 'green', negative: 'red' };
    return (
      text && (
        <Tag
          color={typeColorMap[value] || 'gray'}
          style={{
            cursor: 'default',
            borderColor: 'transparent',
            color: value === 'none' && '#4E5769',
          }}
        >
          {text}
        </Tag>
      )
    );
  };

  const renderCategory = ({ value = '' }) => {
    const str = value
      ?.split(',')
      ?.map((i) => typeMap[i])
      ?.filter((item) => !!item)
      ?.join(' ; ');
    return str;
  };

  const renderNewsTags = ({ value = '' }) =>
    (value?.split(',') ?? []).map((item) => (item ? `#${item}` : '')).join(' ; ');

  const renderTitle = ({ value, record }) => {
    const newsId = record?.get('NewsId') ?? '';
    return newsId ? (
      <a
        onClick={() => {
          // 查询
          newsListDs.status = 'loading';
          getNewsContent({ newsId })
            .then((res) => {
              if (getResponse(res)) {
                handleOpenIframe(res?.htmlContent, record);
              }
            })
            .finally(() => {
              newsListDs.status = 'ready';
            });
        }}
      >
        {value}
      </a>
    ) : (
      value
    );
  };

  const handleOpenIframe = (htmlContent, record) => {
    // eslint-disable-next-line no-unused-expressions
    currentModal?.close();
    const {
      Title: title,
      Source: source,
      PublishTime: publishTime,
      EmotionType: emotionType,
      NewsTags: newsTag,
    } = record?.get(['Title', 'Source', 'PublishTime', 'EmotionType', 'NewsTags']);

    const { meaning: emotionText } = record?.getField('EmotionType')?.getLookupData() ?? {};
    // 处理a标签
    const reg1 = htmlContent.replace(/<a href="([^"]+)" target="_blank">/g, '<span>');
    const reg2 = reg1.replace(/<\/a>/g, '</span>');
    currentModal = Modal.open({
      title: intl.get('sdat.newsPublicOpinion.view.header.newsDetail').d('新闻详情'),
      drawer: true,
      style: { width: '60%' },
      footer: (okBtn) => okBtn,
      okText: intl.get('sdat.newsPublicOpinion.view.button.close').d('关闭'),
      closable: false,
      mask: false,
      children: (
        <>
          <div className={style['title-box']}>
            <div className="title">{title}</div>
            <div className="sub-title">
              <span className="source">{source}</span>
              <span className="date">{publishTime?.format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
            <div className="tag-box">
              {renderTypeTag({ text: emotionText, value: emotionType })}
              {newsTag?.split(',')?.map((item) => (
                <Tag color="#F2F3F5" className="tag-item">
                  {`#${item}`}
                </Tag>
              ))}
            </div>
          </div>
          <div dangerouslySetInnerHTML={{ __html: reg2 }} className={style['html-box']} />
        </>
      ),
    });
  };

  return (
    <>
      <Header
        title={intl.get('sdat.newsPublicOpinion.view.header.monitorOrganization').d('新闻舆情')}
        backPath="/sdat/supplier-risk-monitor-org/list"
      >
        <ReactExportButton
          btnText={intl.get('sdat.newsPublicOpinion.view.button.export').d('导出')}
          exportRequestUrl={exportRequestUrl}
          params={{ ...passParams }}
          ds={newsListDs}
        />
      </Header>
      <Content>
        <StaticSearchBar
          key="monitor-org-bar"
          cacheState
          clearButton
          searchCode="SDAT.NEWS_OPINION"
          filters={getFilters()}
          dataSet={[newsListDs]}
          onQuery={handleFilterQueryAll}
          onClear={handleClear}
          onReset={handleClear}
          showLoading={false}
          defaultExpand={false}
          // fieldProps={fieldProps}
        />
        <div className={style['table-box']}>
          <Table
            dataSet={newsListDs}
            queryBar="none"
            border={false}
            autoHeight={{ type: 'maxHeight', diff: 40 }}
          >
            <Column name="EnterpriseName" width={150} />
            <Column name="EmotionType" width={100} renderer={renderTypeTag} />
            <Column name="Category" width={150} renderer={renderCategory} />
            <Column name="Title" renderer={renderTitle} />
            <Column name="NewsTags" width={200} renderer={renderNewsTags} />
            <Column name="PublishTime" width={180} />
            <Column name="Source" width={150} />
          </Table>
        </div>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['sdat.newsPublicOpinion'],
})(
  withProps(
    () => {
      const newsListDs = new DataSet({ ...newsListDS() });

      const valueDs = { newsListDs };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(NewsPublicOpinion)
);
