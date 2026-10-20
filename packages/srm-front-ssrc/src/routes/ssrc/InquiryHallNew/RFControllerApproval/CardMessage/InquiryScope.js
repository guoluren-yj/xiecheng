import React, { useMemo } from 'react';
import { Table, Tooltip } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import querystring from 'querystring';
import { observer } from 'mobx-react';
import { debounce } from 'lodash';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

import { historyDiffRenderComp } from '@/routes/ssrc/InquiryHallNew/RFController/utils.js';
import styles from './index.less';

const InquiryScope = (props) => {
  const {
    header,
    // remote,
    customizeTable,
    getCustomizeUnitCode,
    inquiryScopeDs,
    viewType,
    sslmLifeCycleFlag,
  } = props;

  // 跳转供应商生命周期管理
  const jumpSupplierLifeManagerDetail = debounce((record) => {
    const recordData = record.toData() || {};
    const { companyId } = header?.rfHeaderBaseInfoAdjustDTO || {};

    const {
      tenantId,
      partnerCompanyId,
      partnerTenantId,
      spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    } = recordData;
    if (
      !companyId ||
      !partnerCompanyId ||
      !partnerTenantId ||
      !spfmSupplierCompanyId ||
      !supplierCompanyId
    ) {
      return;
    }

    const params = {
      tenantId,
      companyId,
      partnerCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId: spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    };

    const searchParams = querystring.stringify(params);
    const currentPathUrl = sslmLifeCycleFlag
      ? '/sslm/supplier-detail-new'
      : '/sslm/include/supplier-manager/supplier-detail';

    if (window.top !== window) {
      window.parent.postMessage({
        type: 'link',
        data: JSON.stringify({
          pathname: currentPathUrl,
          search: searchParams,
        }),
      });
    } else {
      openTab({
        key: currentPathUrl,
        path: currentPathUrl,
        title: intl.get('hzero.common.view.message.360QueryDetail').d('供应商360查询'),
        search: searchParams,
        closable: true,
      });
    }
  }, 500);

  const columns = useMemo(
    () => [
      {
        name: 'supplierCompanyNum',
        width: 160,
        renderer: ({ record }) => (
          <Popover content={record.get('supplierCompanyNum')}>
            <a onClick={() => jumpSupplierLifeManagerDetail(record)}>
              {record.get('supplierCompanyNum')}
            </a>
          </Popover>
        ),
      },
      {
        name: 'supplierCompanyName',
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfLineSupplier', 'supplierCompanyName'),
      },
      {
        name: 'stageDescription',
        width: 200,
        renderer: ({ record, text }) => {
          const stageMismatchCnfFlag = record?.get('stageMismatchCnfFlag');
          const addFlag = record?.get('addFlag');

          return (
            <Tooltip
              title={
                stageMismatchCnfFlag
                  ? intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.supplierNotQuotation`)
                      .d('该供应商当前所在的生命周期阶段不可进行报价')
                  : ''
              }
            >
              <div style={{ color: addFlag === 1 || stageMismatchCnfFlag ? 'red' : 'black' }}>
                {text || '-'}
              </div>
            </Tooltip>
          );
        },
        // renderer: ({ record, dataSet }) =>
        //   historyDiffRenderComp(record, dataSet, 'rfLineSupplier', 'stageDescription'),
      },
      {
        width: 200,
        name: 'contactName',
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfLineSupplier', 'contactName'),
      },
      {
        name: 'contactPhone',
        width: 350,
        renderer: ({ record, dataSet }) => (
          <div style={{ display: 'flex' }}>
            {historyDiffRenderComp(
              record,
              dataSet,
              'rfLineSupplier',
              'internationalTelCode',
              record.getField('internationalTelCode')?.getText(record.get('internationalTelCode'))
            )}
            <span>|</span>
            {historyDiffRenderComp(record, dataSet, 'rfLineSupplier', 'contactPhone')}
          </div>
        ),
      },
      {
        width: 180,
        name: 'contactMail',
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfLineSupplier', 'contactMail'),
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <div className={styles['inquiryScope-table']}>
        {customizeTable(
          {
            code: getCustomizeUnitCode('supplier', viewType),
          },
          <Table dataSet={inquiryScopeDs} columns={columns} style={{ maxHeight: '4.5rem' }} />
        )}
      </div>
    </React.Fragment>
  );
};

export default observer(InquiryScope);
