/*
 * SupplierLifeCycle - 供应商生命周期
 * @Date: 2023-08-16 13:55:38
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { CheckBox } from 'choerodon-ui/pro';
import React, { useEffect, useContext, useState } from 'react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { fetchLifeCycle } from '@/services/lifeCycleManageService';
import LifeCycleTimeline from '@/routes/components/LifeCycleTimeline';

import { Context } from '../../Context';

const Index = () => {
  // 总数据源
  const [dataSource, setDataSource] = useState([]);
  // 当前展示数据源
  const [curDataSource, setCurDataSource] = useState([]);

  const context = useContext(Context);
  const { dispatch, companyId, supplierCompanyId, requisitionId } = context;

  useEffect(() => {
    handleQuery();
  }, [supplierCompanyId]);

  const handleQuery = () => {
    if (supplierCompanyId) {
      fetchLifeCycle({
        companyId,
        requisitionId,
        supplierCompanyId,
      }).then(response => {
        const res = getResponse(response);
        if (res) {
          // 最后一条数据为当前单据，故不进行跳转
          const newList = res.map((item, index) => {
            if (index === 0) {
              return { ...item, documentFrom: 'NO_JUMP' };
            } else {
              return item;
            }
          });
          setDataSource(newList);
          setCurDataSource(newList.slice(0, 2));
        }
      });
    }
  };

  // 【展示完整升降级时间线】回调
  const handleFullTimeLine = value => {
    if (value) {
      setCurDataSource(dataSource);
    } else {
      setCurDataSource(dataSource.slice(0, 2));
    }
  };

  return (
    <div className="card-wrap">
      <div className="card-detail-title">
        {intl.get('sslm.common.view.title.lifeCycleCourse').d('生命周期升降级历程')}
        <span className="card-detail-checkbox">
          <CheckBox onChange={handleFullTimeLine}>
            {intl.get('sslm.common.view.title.fullTimeLine').d('展示完整升降级时间线')}
          </CheckBox>
        </span>
      </div>
      <LifeCycleTimeline dispatch={dispatch} dataSource={curDataSource} />
    </div>
  );
};

export default Index;
