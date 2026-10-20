import React, { useCallback, useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';
import querystring from 'querystring';

import intl from 'utils/intl';

import Styles from '../../Update/index.less';

const Suppliers = (props = {}) => {
  const {
    // organizationId,
    doubleUnitFlag,
    // rfxHeaderId,
    customizeUnitCode,
    supplierDS,
    customizeTable = noop,
    custLoading,
    basicFormDS,
    history,
    sslmLifeCycleFlag = true,
  } = props;

  useEffect(() => {
    if (!supplierDS) {
      return;
    }

    supplierDS.query();
  }, []);

  // 360 query
  const directionSupplierQuery = useCallback(
    (record) => {
      if (!record || !basicFormDS.current) {
        return;
      }
      const {
        location: { pathname = null, search },
      } = history || {};
      const recordData = record.toData() || {};
      const companyId = basicFormDS.current.get('companyId');

      const {
        tenantId,
        partnerCompanyId,
        partnerTenantId,
        // spfmSupplierCompanyId,
        // spfmCompanyId,
        supplierCompanyId,
      } = recordData;

      if (
        !companyId ||
        !partnerCompanyId ||
        !partnerTenantId ||
        // !spfmSupplierCompanyId ||
        !supplierCompanyId
      ) {
        return;
      }

      const params = {
        tenantId,
        companyId,
        partnerCompanyId,
        partnerTenantId,
        // spfmPartnerCompanyId: spfmSupplierCompanyId,
        // spfmCompanyId,
        supplierCompanyId,
      };
      const url = sslmLifeCycleFlag
        ? '/sslm/include/supplier-manager/supplier-detail'
        : '/sslm/supplier-detail-new';
      const searchParams = querystring.stringify(params);
      const urlData = {
        pathname: url,
        search: searchParams,
        state: {
          historyBack: pathname + search,
          ...params,
        },
      };

      // 判断是否在iframe中
      if (window.top !== window) {
        // 是
        window.parent.postMessage(urlData);
      } else {
        history.push(urlData);
      }
    },
    [basicFormDS, history]
  );

  const getColumns = useCallback(() => {
    return [
      {
        name: 'supplierCompanyNum',
        width: 200,
        renderer: ({ value, record }) => {
          const supplierCompanyId = record.get('supplierCompanyId');
          return supplierCompanyId ? (
            <a onClick={() => directionSupplierQuery(record)}>{value}</a>
          ) : (
            value || ''
          );
        },
      },
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'contactName',
        width: 150,
      },
      {
        name: 'contactMobilephone',
        width: 150,
        renderer: ({ record, value }) => {
          const internationalTelCode = record.get('internationalTelCode');
          const phone =
            value && internationalTelCode
              ? `${internationalTelCode} | ${value}`
              : value || internationalTelCode || '';
          return phone;
        },
      },
      {
        name: 'contactMail',
        width: 180,
      },
      // {
      //   name: 'currentAttachmentUuid',
      //   width: 150,
      // },
    ].filter(Boolean);
  }, [doubleUnitFlag, directionSupplierQuery]);

  return (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{ marginBottom: '16px' }}>
        <div className={Styles['ssrc-border-left-line']} />
        {intl.get(`ssrc.common.supplier`).d('供应商')}
      </h3>

      {customizeTable(
        { code: customizeUnitCode },
        <Table
          bordered
          custLoading={custLoading}
          dataSet={supplierDS}
          rowKey="rfxLineItemId"
          columns={getColumns()}
          style={{ maxHeight: '40vh' }}
        />
      )}
    </div>
  );
};

export default observer(Suppliers);
