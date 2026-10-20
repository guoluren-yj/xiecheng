/*
 * @Date: 2022-11-04 13:41:59
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import classnames from 'classnames';
import querystring from 'querystring';
import React, { useCallback } from 'react';
import { Timeline } from 'choerodon-ui';
import { routerRedux } from 'dva/router';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import { getStatusClassName } from '@/routes/components/utils';
import { getTimelineColor } from '@/routes/components/OperationRecords/utils';
import { ReactComponent as NodalFree } from '@/assets/lifeConfig/nodal-free.svg';

const ProcessNode = ({ dispatch, dataSource }) => {
  // 跳转详情页
  const jumpDetail = useCallback(item => {
    const { nodeDocType, nodeDocId, nodeStatus, investigateTemplateId, evalType } = item;
    let pathname = '';
    let routerParams = {};
    switch (nodeDocType) {
      case 'INVESTIGATE':
        pathname = '/sslm/investigation-send/detail';
        routerParams = {
          investigateTemplateId,
          investgHeaderId: nodeDocId,
        };
        break;
      case 'SAMPLE':
        pathname = `/sslm/buyer-apply-query/detail/${nodeDocId}/${nodeStatus}`;
        routerParams = {
          isSupplier: 0,
        };
        break;
      case 'SITE':
        pathname = `/sslm/site-investigate-report/result/detail/${nodeDocId}/${evalType}/${nodeStatus}`;
        break;
      case 'LIFECYCLEAPP':
        break;
      default:
        break;
    }
    dispatch(
      routerRedux.push({
        pathname,
        search: querystring.stringify(routerParams),
      })
    );
  }, []);

  return (
    <Timeline>
      {isEmpty(dataSource) ? (
        <div className="no-process-node">
          <NodalFree />
          <div>{intl.get('sslm.common.view.message.noData').d('暂无数据')}</div>
        </div>
      ) : (
        dataSource.map(item => {
          const statusClassName = getStatusClassName(item.nodeExecuteStatus || 'UNSTART');
          return (
            <Timeline.Item key={item.id} color={getTimelineColor(item.nodeExecuteStatus)}>
              <div style={{ margin: '6px 0 4px' }}>
                <span className="process-node-name">{item.nodeDocTypeMeaning}</span>
                {item.nodeDocType && (
                  <span className={classnames('process-node-status', statusClassName)}>
                    {item.nodeExecuteStatusMeaning ||
                      intl.get('sslm.common.status.unStart').d('未开始')}
                  </span>
                )}
              </div>
              {item.nodeDocNum && (
                <div>
                  <span className="process-node-label">{item.nodeDocTypeMeaning}</span>
                  <span className="process-node-num" onClick={() => jumpDetail(item)}>
                    {item.nodeDocNum}
                  </span>
                </div>
              )}
            </Timeline.Item>
          );
        })
      )}
    </Timeline>
  );
};

export default ProcessNode;
