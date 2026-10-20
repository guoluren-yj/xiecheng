/*
 * SupplierLifeCycle - 供应商生命周期
 * @Date: 2023-08-16 13:55:38
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useContext, useState } from 'react';

import { getResponse } from 'utils/utils';

import { Context } from '@/routes/SupplierDetailNew/Context';
import { fetchLifeCycle } from '@/services/supplierDetailService';
import LifeCycleTimeline from '@/routes/components/LifeCycleTimeline';

const SupplierLifeCycle = () => {
  const [dataSource, setDataSource] = useState([]);
  const context = useContext(Context);
  const { dispatch, companyId, supplierCompanyId } = context;

  useEffect(() => {
    handleQuery();
  }, [companyId]);

  const handleQuery = () => {
    if (companyId && supplierCompanyId) {
      fetchLifeCycle({
        companyId,
        supplierCompanyId,
      }).then(response => {
        const res = getResponse(response);
        if (res) {
          setDataSource(res);
        }
      });
    }
  };

  return (
    <div className="supplier-detail-content" id="lifeCycleCourse">
      <LifeCycleTimeline
        dispatch={dispatch}
        dataSource={dataSource}
        wrapStyle={{ padding: '16px 20px 20px' }}
      />
    </div>
  );
};

export default SupplierLifeCycle;
