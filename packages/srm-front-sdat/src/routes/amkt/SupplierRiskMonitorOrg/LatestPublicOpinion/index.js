/**
 * 最新舆情卡片
 * @date: 2022-09-07
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useEffect } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { Tag, Result, Icon, Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import { Button as PermissionButton } from 'components/Permission';

import { getMsgByLovCode } from '@/services/supplierRiskMonitorOrgService';
import style from './index.less';

const checkOpinionPmn = 'srm.bg.manager.enterprise-control.monitor-overview.api.check-more-news'; // 查看更多的权限集

export default function LatestPublicOpinion(props = {}) {
  const { newsListDs, canSearch = false } = props;

  const [emotionMap, setEmotionMap] = useState({});
  const [typeMap, setTypeMap] = useState({});
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    // 获取表情映射关系
    getMsgByLovCode({ code: 'SDAT.RISK_NEWS_EMOTION_TYPE' }).then((res) => {
      const mapObj = {};
      (res || []).forEach((item) => {
        Object.assign(mapObj, { [item?.value]: item?.meaning });
      });
      setEmotionMap(mapObj);
    });
    // 查询新闻类型map
    getMsgByLovCode({ code: 'SDAT.RISK_NEWS_CATEGORY' }).then((res) => {
      const mapObj = {};
      (res || []).forEach((item) => {
        Object.assign(mapObj, { [item?.value]: item?.meaning });
      });
      setTypeMap(mapObj);
    });
  }, []);

  useEffect(() => {
    if (Object.keys(emotionMap)?.length !== 0 && Object.keys(typeMap)?.length !== 0 && canSearch) {
      setSpinning(true);
      newsListDs.pageSize = 20;
      newsListDs.query(1, { page: 0, pageSize: 20 }).finally(() => {
        setSpinning(false);
      });
    }
  }, [emotionMap, typeMap, canSearch]);

  /**
   * renderTag: 渲染标签
   * @param {*} type
   * @returns
   */
  const renderTag = (type = 'none') => {
    const typeColorMap = { none: '#F2F3F5', positive: 'green', negative: 'red' };
    return (
      emotionMap[type] && (
        <Tag
          color={typeColorMap[type]}
          style={{
            cursor: 'default',
            borderColor: 'transparent',
            color: type === 'none' && '#4E5769',
          }}
        >
          {emotionMap[type]}
        </Tag>
      )
    );
  };

  /**
   * handleMore: 点击查看更多:跳转新闻舆情
   */
  const handleMore = () => {
    props.dispatch(
      routerRedux.push({
        pathname: '/sdat/supplier-risk-monitor-org/news-public-opinion',
      })
    );
  };

  /**
   * renderStuffsList : 渲染列表DOM
   */
  const renderStuffsList = React.useMemo(() => {
    return (newsListDs?.toData() ?? []).map((item) => (
      <div className={style['content-line']}>
        <div className={style['line-left-box']}>
          <div className={style['line-left-top-box']}>
            {renderTag(item?.EmotionType)}
            <Tooltip title={item?.Title ?? ''} placement="topLeft">
              <div className={style['news-box']}>{item?.Title ?? ''}</div>
            </Tooltip>
          </div>
          <div className={style['line-left-bottom-box']}>
            {(item?.Category ?? '')?.split(',')?.map(
              (tagItem) =>
                (typeMap[tagItem] || '') && (
                  <Tag
                    color="gray"
                    style={{ cursor: 'default', marginRight: '8px' }}
                    className={style['black-border-tag']}
                  >
                    {typeMap[tagItem]}
                  </Tag>
                )
            )}
            {(item?.NewsTags?.split(',') ?? []).map((relationItem) => (
              <span style={{ marginRight: '8px' }}>{relationItem && `#${relationItem}`}</span>
            ))}
          </div>
        </div>
        <div className={style['line-right-box']}>
          <div className={style['date-box']}>{item?.PublishTime ?? ''}</div>
          <div className={style['date-box']}>
            {`${intl.get('sdat.supplierRiskMonitor.view.panel.source').d('来源: ')}${
              item?.Source ?? ''
            }`}
          </div>
        </div>
      </div>
    ));
  }, [newsListDs?.length, typeMap, emotionMap]);

  return (
    <div className={style['out-box']}>
      <div className={style['title-bar']}>
        <div className={style['title-div']}>
          {intl.get('sdat.supplierRiskMonitor.view.title.latestPublicOpinion').d('最新舆情')}
        </div>
        <div className={style['right-box']}>
          <PermissionButton
            permissionList={[{ code: checkOpinionPmn }]}
            type="text"
            onClick={handleMore}
            className={style['selection-box']}
          >
            {intl.get('sdat.supplierRiskMonitor.view.button.checkMore').d('查看更多')}
          </PermissionButton>
        </div>
      </div>
      {spinning && <Spin />}
      {newsListDs?.toData()?.length === 0 ? (
        <Result
          className={style['no-data-result']}
          icon={<Icon className={style['no-data-icon']} />}
          title={
            <span>
              {intl.get('sdat.supplierRiskMonitor.view.notification.noData').d('暂无数据')}
            </span>
          }
        />
      ) : (
        <div className={style['content-bar']}>{renderStuffsList}</div>
      )}
    </div>
  );
}
