/**
 * 新增风险事件卡片
 * @date: 2022-09-02
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useEffect } from 'react';
import { Tooltip, Dropdown, Button } from 'choerodon-ui/pro';
import { Tag, Result, Icon, Spin, Menu } from 'choerodon-ui';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import { Button as PermissionButton } from 'components/Permission';

import { getMsgByLovCode } from '@/services/supplierRiskMonitorOrgService';

import style from './index.less';

const checkRiskStuffPmn = 'srm.bg.manager.enterprise-control.monitor-overview.api.check-more-news'; // 查看更多的权限集

export default function AddRiskStuff(props = {}) {
  const { eventsListDs, canSearch = false } = props;

  const [filter, setFilter] = useState(
    intl.get('sdat.supplierRiskMonitor.view.select.all').d('全部')
  );
  const [typeArr, setTypeArr] = useState([]);
  const [typeMap, setTypeMap] = useState({});
  const [codeMap, setCodeMap] = useState({});
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    // 获取信息类型关系
    getMsgByLovCode({ code: 'SDAT.RISK_EVENT_LEVEL' }).then((res) => {
      setTypeArr(res instanceof Array ? res : []);
      const mapObj = {};
      (res || []).forEach((item) => {
        Object.assign(mapObj, { [item?.value]: item?.meaning });
      });
      setTypeMap(mapObj);
    });
    // 查询新闻类型map
    getMsgByLovCode({ code: 'SDAT.EVENT_DIMENSION_LEVEL_FOUR' }).then((res) => {
      const mapObj = {};
      (res || []).forEach((item) => {
        Object.assign(mapObj, { [item?.value]: item?.meaning });
      });
      setCodeMap(mapObj);
    });
  }, []);

  useEffect(() => {
    // canSearch 是false时不能查询
    if (typeArr.length === 0 || !typeMap || !canSearch) return;
    // 查询事件
    setSpinning(true);
    eventsListDs.pageSize = 20;
    eventsListDs.query(1, { page: 0, pageSize: 20 }).finally(() => {
      setSpinning(false);
    });
  }, [typeMap, codeMap, canSearch]);

  // 过滤条件下拉框发生更改时
  const handleFilterChange = (value) => {
    setSpinning(true);
    if (value === 'all') eventsListDs.setQueryParameter('riskLevel', '');
    else eventsListDs.setQueryParameter('riskLevel', value);
    eventsListDs.query(1, { page: 0, pageSize: 20 }).finally(() => {
      setFilter(typeMap[value] || intl.get('sdat.supplierRiskMonitor.view.select.all').d('全部'));
      setSpinning(false);
    });
  };

  const renderTag = (riskLevel = 0) => {
    const typeColorMap = { 0: 'dark', 1: 'green', 2: '#F2F3F5', 3: 'gold', 4: 'volcano', 5: 'red' };
    return (
      typeMap[riskLevel] && (
        <Tag
          color={typeColorMap[riskLevel]}
          style={{
            cursor: 'default',
            borderColor: 'transparent',
            // eslint-disable-next-line eqeqeq
            color: riskLevel == 2 && '#4E5769',
          }}
        >
          {typeMap[riskLevel]}
        </Tag>
      )
    );
  };

  /**
   * handleSkipToMonitorStuff: 跳转至监控事件
   */
  const handleSkipToMonitorStuff = () => {
    props.dispatch(
      routerRedux.push({
        pathname: '/sdat/supplier-risk-monitor-org/monitor-stuff',
      })
    );
  };

  /**
   * renderStuffsList : 渲染列表
   */
  const renderStuffsList = React.useMemo(() => {
    // return ((eventsListDs?.toData() ?? []) || []).map(item => (
    //   <div className={style['content-line']}>
    //     <div className={style['line-left-box']}>
    //       <div className={style['line-left-top-box']}>
    //         {renderTag(item?.riskLevel)}
    //         {item?.dimensionCode && (
    //           <Tag color="gray" style={{ cursor: 'default' }} className={style['black-border-tag']}>
    //             {codeMap[item?.dimensionCode]}
    //           </Tag>
    //         )}
    //         <Tooltip title={item?.overview ?? ''}>
    //           <div className={style['news-box']}>{item?.overview ?? ''}</div>
    //         </Tooltip>
    //       </div>
    //       <div className={style['line-left-bottom-box']}>{item?.enterpriseName}</div>
    //     </div>
    //     <div className={style['line-right-box']}>{item?.publishDate ?? ''}</div>
    //   </div>
    // ));

    return ((eventsListDs?.toData() ?? []) || []).map((item) => (
      <div className="content-line">
        <div className="line-left-box">
          <div className="line-left-top-box">
            {renderTag(item?.riskLevel)}
            {item?.dimensionCode && (
              <Tag color="gray" style={{ cursor: 'default' }} className="black-border-tag">
                {codeMap[item?.dimensionCode]}
              </Tag>
            )}
            <Tooltip title={item?.overview ?? ''}>
              <div className="news-box">{item?.overview ?? ''}</div>
            </Tooltip>
          </div>
          <div className="line-left-bottom-box">{item?.enterpriseName}</div>
        </div>
        <div className="line-right-box">{item?.publishDate ?? ''}</div>
      </div>
    ));
  }, [eventsListDs?.length, codeMap, typeMap, spinning]);

  return (
    <div className={style['out-box']}>
      <div className={style['title-bar']}>
        <div className={style['title-div']}>
          {intl.get('sdat.supplierRiskMonitor.view.title.addRiskStuff').d('新增风险事件')}
        </div>
        <div className={style['right-box']}>
          {canSearch && (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="all"
                    onClick={() => {
                      handleFilterChange('all');
                    }}
                  >
                    {intl.get('sdat.supplierRiskMonitor.view.select.all').d('全部')}
                  </Menu.Item>
                  {typeArr?.map((item) => (
                    <Menu.Item
                      key={item?.value ?? ''}
                      onClick={() => {
                        handleFilterChange(item?.value ?? '');
                      }}
                    >
                      {item?.meaning ?? ''}
                    </Menu.Item>
                  ))}
                </Menu>
              }
              className={style['selection-box']}
            >
              <Button funcType="flat" className={style['selection-box-btn']} color="black">
                {filter} <Icon type="expand_more" style={{ marginLeft: '8px' }} />
              </Button>
            </Dropdown>
          )}
          <PermissionButton
            permissionList={[{ code: checkRiskStuffPmn }]}
            type="text"
            onClick={handleSkipToMonitorStuff}
            className={style['selection-box']}
          >
            {intl.get('sdat.supplierRiskMonitor.view.button.checkMore').d('查看更多')}
          </PermissionButton>
        </div>
      </div>
      <Spin spinning={spinning}>
        <>
          {eventsListDs?.toData()?.length === 0 ? (
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
            // <div className={style['content-bar']}>{renderStuffsList}</div>
            renderStuffsList
          )}
        </>
      </Spin>
    </div>
  );
}
