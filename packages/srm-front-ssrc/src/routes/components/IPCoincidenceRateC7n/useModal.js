import React from 'react';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { INQUIRY } from '@/utils/globalVariable';

import IPDS from './store/storeDS';

const useIpRateModal = () => {
  const columns = [
    {
      name: 'supplierCompanyName',
      width: 150,
    },
    {
      name: 'supplierCompanyIp',
      width: 120,
    },
    {
      name: 'companyIpRate',
      width: 120,
      // renderer: ({ value }) => `${value}%`,
    },
    {
      name: 'coincidenceCompanyName',
      width: 150,
    },
    {
      name: 'coincidenceSupplierIp',
      width: 120,
    },
  ];

  const openModal = (props, modalProps) => {
    const { sourceKey = INQUIRY, rfxHeaderId, bidFlag } = props;
    const ds = new DataSet(IPDS({ sourceKey, bidFlag }));
    ds.setQueryParameter('rfxHeaderId', rfxHeaderId);
    ds.query();
    // 打开弹框
    const modal = Modal.open({
      key: Modal.key(),
      closable: true,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.button.IPCoincidenceRate`).d('IP重合率'),
      style: { width: '742px', zIndex: 2 },
      children: (
        <>
          <div style={{ marginBottom: '16px' }}>
            {intl.get('ssrc.common.view.ipOnlyReferenceWarning').d('供应商报价/投标时，IP可通过使用代理服务等操作进行包装，此结果仅用于参考')}
          </div>
          <Table dataSet={ds} columns={columns} style={{ maxHeight: '430px' }} />
        </>),
      cancelText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
      footer: (_, cancelBtn) => cancelBtn,
      cancelProps: {
        color: 'primary',
      },
      ...modalProps,
    });
    return modal;
  };
  return {
    openModal,
  };
};

export default useIpRateModal;
