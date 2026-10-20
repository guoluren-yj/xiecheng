/*
 * @Description: 点数消耗看台
 * @Author: lqx(qingxiang.luo@going-link.com)
 * @Date: 2024-12-25 10:02:54
 * @Last Modified by: lqx(qingxiang.luo@going-link.com)
 * @Last Modified time: 2025-02-23 02:51:28
 */

import React, { useEffect, useState } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { isNil } from 'lodash';
import moment from 'moment';
import notification from 'utils/notification';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Header } from 'components/Page';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Alert, Icon, Popover } from 'choerodon-ui';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { SRM_DATA_SDAT } from '@/utils/config';
import ExcelExportPro from '@/components/ExcelExportPro';
import StaticSearchBar from '@/components/StaticSearchBar';
import { ReactComponent as AverageCost } from '@/assets/risk/averageCost.svg';

import { DefineListDS, fetchOrderStatus, fetchQuotaDetail } from './stores/pointWorkplaceDS';
import { getQueryConfig } from './queryConfig';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();

let commonQuery = {};
let queryFlag = 0;

function PointWorkplace({ listDS }) {
  const [orderStatus, setOrderStatus] = useState(false);
  const [timesParam, setTimesParam] = useState({});

  useEffect(() => {
    queryOrderStatus();

    return () => {
      commonQuery = {};
      queryFlag = 0;
    };
  }, []);

  const queryOrderStatus = async () => {
    const res = await fetchOrderStatus({
      openType: 3,
      applicationCode: 'AP_CREDIT',
      sceneCode: 'RISK_SCAN_V2',
      sourceTenantId: getCurrentOrganizationId(),
    });
    if (getResponse(res) && res.serviceCode) {
      setOrderStatus(true);
      const timesObj = await fetchQuotaDetail({ serviceCode: res.serviceCode });
      if (getResponse(timesObj)) {
        setTimesParam(timesObj);
        if (timesObj?.orderHeaderId) {
          commonQuery = { ...timesObj };
          if (queryFlag === 0) {
            handleFilterQueryAll();
          }
        }
      }
    }
  };

  const renderBusinessInfo = (text) => {
    if (text) {
      let dataArray = [];
      try {
        const tmp = JSON.parse(text);
        if (tmp instanceof Array) {
          dataArray = [...tmp];
        }
        // eslint-disable-next-line no-empty
      } catch {}
      if (dataArray.length > 2) {
        return (
          <Popover
            placement="leftTop"
            overlayStyle={{
              backgroundColor: '#FFF',
            }}
            content={
              <ul
                style={{
                  cursor: 'default',
                  margin: '0',
                  paddingInlineStart: '0px',
                  lineHeight: '20px',
                  display: 'inline-block',
                }}
              >
                {dataArray.map((i) => (
                  <li style={{ listStyleType: 'none' }}>
                    {i.name
                      ? intl.get(`sdat.pointWorkplace.view.subModel.${i.name}`) || i.name
                      : ''}
                    {`: ${['null', 'undefined'].includes(String(i.value)) ? '' : i.value}`}
                  </li>
                ))}
              </ul>
            }
          >
            <div style={{ margin: '-8px 0' }}>
              <ul
                style={{
                  cursor: 'default',
                  margin: '0',
                  paddingInlineStart: '0px',
                  lineHeight: '17px',
                }}
              >
                {dataArray.slice(0, 2).map((i) => (
                  <li style={{ listStyleType: 'none' }}>
                    {i.name
                      ? intl.get(`sdat.pointWorkplace.view.subModel.${i.name}`) || i.name
                      : ''}
                    {`: ${['null', 'undefined'].includes(String(i.value)) ? '' : i.value}`}
                  </li>
                ))}
              </ul>
              <Icon
                type="ellipsis"
                style={{
                  marginLeft: 8,
                }}
              />
            </div>
          </Popover>
        );
      } else if (dataArray.length === 2) {
        return (
          <ul
            style={{
              cursor: 'default',
              margin: '-8px 0',
              paddingInlineStart: '0px',
              lineHeight: '17px',
            }}
          >
            {dataArray.slice(0, 2).map((i) => (
              <li style={{ listStyleType: 'none' }}>
                {i.name ? intl.get(`sdat.pointWorkplace.view.subModel.${i.name}`) || i.name : ''}
                {`: ${['null', 'undefined'].includes(String(i.value)) ? '' : i.value}`}
              </li>
            ))}
          </ul>
        );
      } else {
        return (
          <div>
            {dataArray.map((item) => (
              <span>
                {item.name
                  ? intl.get(`sdat.pointWorkplace.view.subModel.${item.name}`) || item.name
                  : ''}
                {`: ${['null', 'undefined'].includes(String(item.value)) ? '' : item.value}`}
              </span>
            ))}
          </div>
        );
      }
    } else {
      return '';
    }
  };

  const columns = () => {
    return [
      {
        name: 'serviceName',
      },
      {
        name: 'creationDate',
      },
      {
        name: 'frequency',
      },
      {
        name: 'businessInfo',
        renderer: ({ text }) => renderBusinessInfo(text),
      },
      {
        name: 'operatorLoginName',
      },
      {
        name: 'operatorName',
      },
      {
        name: 'triggerTypeMeaning',
      },
      {
        name: 'remark',
      },
    ];
  };

  const getFilters = () => {
    return { ...getQueryConfig() };
  };

  // 处理过滤查询
  const handleFilterQueryAll = ({ params }) => {
    // 获取时间范围
    const timeRange = params?.dateRange_range?.split(',') ?? [];
    // 获取开始日期
    const startDate = timeRange && timeRange.length && timeRange[0] ? `${timeRange[0]}` : '';
    // 获取结束日期
    const endDate = timeRange && timeRange.length > 1 && timeRange[1] ? `${timeRange[1]}` : '';

    if (!startDate || !endDate) {
      notification.error({
        message: intl.get('sdat.pointWorkplace.searchBar.required.timeRange').d('必须选择时间范围'),
      });
      return;
    }

    if (moment(endDate)?.diff(moment(startDate), 'years') >= 1) {
      notification.error({
        message: intl
          .get('sdat.pointWorkplace.searchBar.tips')
          .d('请修改查询时间条件，最大查询时间范围不能超过1年'),
      });
      return;
    }

    // 加载数据
    listDS.queryDataSet.loadData([
      {
        ...params,
        sort: params.customizeOrderField,
        startDate,
        endDate,
        dateRange_range: '',
        customizeOrderField: '',
        customizeFilterComparison: '',
      },
    ]);
    // 设置查询参数
    listDS.setQueryParameter('sort', params?.customizeOrderField ?? 'lastUpdateDate:desc');
    // 如果有公共查询参数
    if (commonQuery?.orderHeaderId) {
      // 设置查询参数
      queryFlag = 1;
      listDS.setQueryParameter('orderHeaderId', commonQuery.orderHeaderId);
      // 查询
      listDS.query();
    }
  };

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'dateRange') {
      record.set('dateRange', value);
    }
  };

  return (
    <>
      {orderStatus ? (
        <div className={styles['point-workplace-basic']}>
          <Header title={intl.get('sdat.pointWorkplace.view.title.quotaConfig').d('额度消耗看台')}>
            <ExcelExportPro
              buttonText={intl.get('sdat.common.view.button.exportExcel').d('导出')}
              requestUrl={`${SRM_DATA_SDAT}/v1/${tenantId}/quota-stand/billing-ext-list-export`}
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                funcType: 'flat',
                mask: false,
              }}
              defaultSelectAll
              queryParams={() => {
                const arr = listDS?.queryDataSet?.toData() ?? [{}];
                const param = arr.length ? arr[0] : {};

                return { ...param, orderHeaderId: commonQuery?.orderHeaderId };
              }}
            />
          </Header>
          <div className={styles['content-top-card']}>
            <div className={styles['content-top-card-alert']}>
              <Alert
                showIcon
                iconType="help"
                message={intl
                  .get('sdat.pointWorkplace.view.title.dailyCost', {
                    count: timesParam?.avgQuantity ?? 0,
                  })
                  .d('当前日均消耗')}
              />
            </div>

            <div className={styles['content-top-card-points']}>
              <div className={styles['content-top-card-points-item']}>
                <div
                  className={styles['content-top-card-points-item-average']}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <AverageCost style={{ width: '18px' }} />
                  <div style={{ marginLeft: '8px' }}>
                    {intl.get('sdat.pointWorkplace.view.title.remainingTimes').d('当前剩余次数')}
                  </div>
                </div>
                <span>{(timesParam?.canUseQuantity ?? 0) - (timesParam?.usedQuantity ?? 0)}</span>
              </div>
              <div
                style={{
                  margin: '0 8px',
                  height: '8px',
                  width: '12px',
                  borderTop: '2px solid #1D2129',
                  borderBottom: '2px solid #1D2129',
                }}
              />
              <div className={styles['content-top-card-points-item']}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon type="content_paste" style={{ color: '#0161d5' }} />
                  <div style={{ marginLeft: '8px' }}>
                    {intl.get('sdat.pointWorkplace.view.title.totalTimes').d('订单总次数')}
                  </div>
                </div>
                <span>{timesParam?.canUseQuantity ?? 0}</span>
              </div>
              <div
                style={{
                  margin: '0 8px',
                  height: '2px',
                  width: '12px',
                  background: '#1D2129',
                }}
              />
              <div className={styles['content-top-card-points-item']}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon type="hourglass_empty" style={{ color: '#F56349' }} />
                  <div style={{ marginLeft: '8px' }}>
                    {intl.get('sdat.pointWorkplace.view.title.usedTimes').d('已消耗次数')}
                  </div>
                </div>
                <span>{timesParam?.usedQuantity ?? 0}</span>
              </div>
            </div>
          </div>

          <div className={styles['point-workplace-content']}>
            <div className={styles['risk-def-search-basic-panel']}>
              <StaticSearchBar
                cacheState
                clearButton
                searchCode="SDAT.POINT_WORKPLACE_SEARCH_BAR"
                filters={getFilters()}
                dataSet={[listDS]}
                onQuery={handleFilterQueryAll}
                onFieldChange={handleFieldChange}
                fieldProps={{
                  dateRange: {
                    required: true,
                    defaultValue: ({ record }) =>
                      isNil(record.get('dateRange'))
                        ? [
                            moment().subtract(12, 'month').add(1, 'day'),
                            moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                          ]
                        : record.get('dateRange'),
                  },
                }}
                editorProps={{
                  dateRange: { clearButton: false },
                }}
                showLoading={false}
              />
            </div>
            <div>
              <div style={{ height: 'calc(100vh - 422px)' }}>
                <Table
                  dataSet={listDS}
                  columns={columns()}
                  queryBar="none"
                  rowHeight="auto"
                  autoHeight={{ type: 'maxHeight', diff: 40 }}
                  customizable
                  customizedCode="SDAT.POINT_WORKPLACE_LIST"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            height: 'calc(100vh - 90px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            backgroundColor: '#fff',
            margin: '8px',
          }}
        >
          {intl
            .get('sdat.pointWorkplace.view.message.notOpenOrder')
            .d('您的订单未开通或已过期，请联系客户经理开通。')}
        </div>
      )}
    </>
  );
}

export default connect((state) => state)(
  formatterCollections({
    code: ['sdat.pointWorkplace', 'sdat.common'],
  })(
    withProps(
      () => {
        const listDS = new DataSet(DefineListDS());

        return {
          listDS,
        };
      },
      { cacheState: true, keepOriginDataSet: true } // 缓存数据状态+保持原来的DataSet对象
    )(PointWorkplace)
  )
);
