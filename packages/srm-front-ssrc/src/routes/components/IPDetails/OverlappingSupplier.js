/* eslint-disable no-unused-expressions */
import React, { useMemo, useEffect, useState } from 'react';
import { Spin } from 'choerodon-ui';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import { fetchIPDetail } from '@/services/commonService.js';
import { ReactComponent as NoProcessAttach } from '@/assets/no-over-supplier.svg';

import { OverlappingSupplierDS } from './indexDS';
import styles from './index.less';

const OverlappingSupplier = ({ rfxHeaderId }) => {
  const dsMap = useMemo(() => new Map(), []);
  const [supplierList, setSupplierList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSupplierList();
  }, []);

  const fetchSupplierList = async () => {
    setLoading(true);
    const res = await fetchIPDetail({
      page: 0,
      size: 10,
      rfxHeaderId,
      checkIpType: 'MUlTI_IP_CHECK_COINCIDE',
    });
    setLoading(false);
    if (getResponse(res)) {
      res?.content?.forEach((item) => {
        dsMap.set(
          item.quotationHeaderId,
          new DataSet(
            OverlappingSupplierDS({ rfxHeaderId, quotationHeaderId: item.quotationHeaderId })
          )
        );
        dsMap
          ?.get(item.quotationHeaderId)
          .loadData(
            item?.supplierIpCheckQueryResultDTOPage?.content,
            item?.supplierIpCheckQueryResultDTOPage?.totalElements
          );
      });
      setSupplierList(res?.content);
    }
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'quotationIpAddress',
        width: 150,
      },
      {
        name: 'operateIpNodesMeaning',
        width: 150,
      },
      {
        name: 'coincideSupplier',
        width: 250,
      },
      {
        name: 'coincideNodeMeaning',
        width: 150,
      },
      {
        name: 'ipAcquisitionDate',
        width: 150,
      },
      {
        name: 'ipAddressLocation',
        width: 150,
      },
    ];
  }, []);

  return (
    <Spin spinning={loading}>
      {supplierList?.length ? (
        supplierList?.map((item, index) => (
          <React.Fragment>
            <div
              className={styles['supplier-title']}
              style={{ marginBottom: '16px', marginTop: index === 0 ? '' : '16px' }}
            >
              <div className={styles['supplier-title-line']} />
              <div className={styles['supplier-title-name']}>{item.supplierCompanyName}</div>
            </div>
            <Table
              columns={columns}
              dataSet={dsMap?.get(item.quotationHeaderId)}
              style={{ maxHeight: '430px' }}
              customizable
              customizedCode="code"
            />
          </React.Fragment>
        ))
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            height: 'calc(100vh - 210px)',
          }}
        >
          <NoProcessAttach />
          <div style={{ fontSize: '14px', marginTop: '16px', color: '#868d9c' }}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.noProcessAttach`).d('无重合供应商')}
          </div>
        </div>
      )}
    </Spin>
  );
};

export default observer(OverlappingSupplier);
