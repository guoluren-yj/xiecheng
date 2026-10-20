import React, { useContext, useEffect, useState } from 'react';
import { Table, Form, Output, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { getResponse, getCurrentTenant } from 'utils/utils';
import querystring from 'querystring';
import { isEmpty } from 'lodash';

import { fetchConfigSheet } from '@/services/inquiryHallService';

import { StoreContext } from '../store/StoreProvider';

// 标段/包信息
const supplierLineTable = observer(() => {
  const {
    commonDs: { supplierLineTableDs, headerDs } = {},
    organizationId,
    history,
    history: {
      location: { pathname = null, search },
    },
    customizeForm,
    customizeTable,
    getCustomizeUnitCode,
  } = useContext(StoreContext);

  const [supplierConfigOldUserFlag, setSupplierConfigOldUserFlag] = useState(true); // 采购方租户是否在配置表中

  const {
    companyId,
    sourceMethod,
    subjectMatterRule, // 是否分标段
  } = headerDs?.current?.get(['companyId', 'sourceMethod', 'subjectMatterRule']) || {};

  useEffect(() => {
    fetchSupplierOldUserConfig();
  }, []);

  const fetchSupplierOldUserConfig = async () => {
    try {
      let result = await fetchConfigSheet({
        organizationId,
        configCode: 'sslm_life_cycle_new_360_bk',
        data: {
          tenantNum: getCurrentTenant().tenantNum,
        },
      });
      result = getResponse(result);
      if (!result) {
        return;
      }
      if (isEmpty(result)) {
        setSupplierConfigOldUserFlag(false);
      }
    } catch (e) {
      throw e;
    }
  };

  // 跳转360
  const jumpSupplierLifeManagerDetail = (record, supplierTabKey = null) => {
    // 根据当前登陆账号，查配置表，判断是老租户还是新租户
    const {
      tenantId,
      partnerCompanyId,
      partnerTenantId,
      spfmSupplierCompanyId,
      spfmCompanyId,
      supplierCompanyId,
    } =
      record.get([
        'tenantId',
        'partnerCompanyId',
        'partnerTenantId',
        'spfmSupplierCompanyId',
        'spfmCompanyId',
        'supplierCompanyId',
      ]) || {};

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

    if (supplierTabKey) {
      // 判断是否在iframe中
      if (window.top !== window) {
        // 是
        window.parent.postMessage({
          type: 'link',
          data: JSON.stringify({
            pathname: `${supplierTabKey}`,
            search: searchParams,
          }),
        });
      } else {
        history.push({
          pathname: `${supplierTabKey}`,
          search: searchParams,
          state: {
            historyBack: pathname + search,
            ...params,
          },
        });
      }
    }
  };

  const columns = [
    {
      name: 'supplierCompanyNum',
      renderer: ({ value, record }) => {
        // 判断有无供应商生命周期/供应商生命周期汇总菜单权限
        const supplierTabKey = supplierConfigOldUserFlag
          ? '/sslm/include/supplier-manager/supplier-detail'
          : '/sslm/supplier-detail-new';
        return supplierTabKey && record?.get('supplierCompanyId') && value ? (
          <>
            <Button
              funcType="link"
              onClick={() => jumpSupplierLifeManagerDetail(record, supplierTabKey)}
            >
              {value}
            </Button>
          </>
        ) : (
          value
        );
      },
    },
    {
      name: 'supplierCompanyName',
    },
    {
      name: 'supplierCategoryDescription',
    },
    {
      name: 'stageDescription',
    },
    {
      name: 'contactName',
    },
    {
      name: 'contactMobilephone',
      renderer: ({ record }) => {
        return record?.get('internationalTelCode')
          ? `${record?.get('internationalTelCode')} | ${record?.get('contactMobilephone') ?? ''}`
          : record?.get('contactMobilephone');
      },
    },
    {
      name: 'contactMail',
    },
    subjectMatterRule === 'PACK' && {
      name: 'allocatedLot',
      renderer: ({ record }) => {
        return record
          ?.get('supSectionAssignLovDTOS')
          ?.map((lot) => lot.sectionName)
          ?.join(',');
      },
    },
  ];

  return (
    <>
      {customizeForm(
        {
          code: getCustomizeUnitCode('sourceMethodForm'),
          dataSet: headerDs,
        },
        <Form
          dataSet={headerDs}
          columns={1}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          <Output name="sourceMethodMeaning" />
        </Form>
      )}
      {sourceMethod === 'INVITE' && (
        <div style={{ marginTop: '16px' }}>
          {customizeTable(
            {
              code: getCustomizeUnitCode('supplierTable'),
              dataSet: supplierLineTableDs,
            },
            <Table
              dataSet={supplierLineTableDs}
              columns={columns}
              style={{ maxHeight: '4.5rem' }}
            />
          )}
        </div>
      )}
    </>
  );
});

export default supplierLineTable;
