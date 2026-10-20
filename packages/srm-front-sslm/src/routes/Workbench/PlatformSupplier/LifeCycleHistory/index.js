/**
 * LifeCycleHistory - 生命周期历史
 * @date: 2021-10-11
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Timeline, Spin } from 'choerodon-ui';
import queryString from 'querystring';
import { withRouter } from 'dva/router';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { getResponse, filterNullValueObject } from 'utils/utils';

import { queryLifeCycleHistory } from '@/services/workbenchService';
import { ReactComponent as Nodata } from '@/assets/icons/no-data.svg';
import styles from '../../index.less';

const Index = ({ record, history }) => {
  const [dataSource, setDataSource] = useState([]);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const { data: { companyId, supplierCompanyId } = {} } = record;
    setSpinning(true);
    queryLifeCycleHistory({ companyId, supplierCompanyId })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          setDataSource(res);
        }
      })
      .finally(() => setSpinning(false));
  }, []);

  // 查看申请单
  const jumpToApplication = (data = {}) => {
    const { lifeCycleUrl, requisitionId, toStageId, documentType } = data;
    const search = queryString.stringify(
      filterNullValueObject({ requisitionId, toStageId, documentType })
    );
    let pathname = lifeCycleUrl;
    if (documentType) {
      pathname = '/sslm/life-cycle-manage/read';
    }
    history.push({
      pathname,
      search,
    });
  };

  return (
    <Spin spinning={spinning}>
      {!isEmpty(dataSource) ? (
        <Timeline>
          {dataSource.map(data => {
            const color = data.gradeCode === 'DEGRADE' ? '#F56349' : '#47B881';
            // 手工发起标识
            const manuallyFlag = data.documentFromHistory === 'MANUALLY';
            const type =
              data.gradeCode === 'DEGRADE'
                ? intl.get('sslm.common.view.message.degrade').d('降级')
                : intl.get('sslm.common.view.message.upgrade').d('升级');
            return (
              <Timeline.Item color={color}>
                <div className={styles['life-cycle-history']}>
                  <div>
                    <span style={{ fontWeight: 500 }}>
                      {intl.get('sslm.common.view.supplier.supplierCompany').d('供应商')}
                      <span style={{ color }}> {` ${type} `} </span>
                      {intl.get('sslm.workbench.model.platformSupplier.to').d('为')}
                      <span>【{data.reqStage}】</span>
                    </span>
                    <a
                      style={{ marginLeft: 8 }}
                      disabled={!data.applyFlag}
                      onClick={() => jumpToApplication(data)}
                    >
                      {intl
                        .get('sslm.workbench.model.platformSupplier.viewApplication')
                        .d('查看申请单')}
                    </a>
                  </div>
                  <div>
                    {manuallyFlag && (
                      <div className={styles['life-cycle-history-info']}>
                        <div className={styles['life-cycle-history-info-left']}>
                          {intl.get('sslm.workbench.model.platformSupplier.proposer').d('申请人')}
                        </div>
                        <div>{data.proposer}</div>
                      </div>
                    )}
                    {manuallyFlag && (
                      <div className={styles['life-cycle-history-info']}>
                        <div className={styles['life-cycle-history-info-left']}>
                          {intl.get('sslm.workbench.model.platformSupplier.approver').d('审批人')}
                        </div>
                        <div>{data.approver}</div>
                      </div>
                    )}
                    <div className={styles['life-cycle-history-info']}>
                      <div className={styles['life-cycle-history-info-left']}>
                        {intl.get('sslm.common.field.action').d('动作')}
                      </div>
                      <div>{data.documentFromHistoryMeaning || '-'}</div>
                    </div>
                    <div className={styles['life-cycle-history-info']}>
                      <div className={styles['life-cycle-history-info-left']}>
                        {intl.get('sslm.workbench.model.platformSupplier.date').d('日期')}
                      </div>
                      <div>{dateTimeRender(data.reqProcessDate)}</div>
                    </div>
                  </div>
                </div>
              </Timeline.Item>
            );
          })}
        </Timeline>
      ) : (
        <div className={styles['life-cycle-history-no-data']}>
          <Nodata />
          <div>{intl.get('sslm.common.view.message.noData').d('暂无数据')}</div>
        </div>
      )}
    </Spin>
  );
};

export default withRouter(Index);
