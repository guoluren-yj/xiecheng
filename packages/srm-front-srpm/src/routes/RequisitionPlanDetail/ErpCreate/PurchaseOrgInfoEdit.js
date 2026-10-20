import React, { useImperativeHandle, useMemo, useEffect, useState } from 'react';
import { Form, Lov, DataSet } from 'choerodon-ui/pro';
import { purchaseOrgInfoDs } from '../indexDS';
import styles from '../index.less';
// import { fetchAutoGetCompany, fetchAutoGetPurchasing } from '@/services/RequisitionPlanServices';
// import intl from 'utils/intl';

let proxyDsCreate;

const PurchaseOrgInfo = React.forwardRef(
  (
    {
      rpHeaderId,
      handleDetailField,
      // onChangeLineUpdate,
      customizeForm,
    },
    ref
  ) => {
    const purchaseOrgInfo = useMemo(
      () =>
        new DataSet({
          ...purchaseOrgInfoDs({ rpHeaderId, handleDetailField }),
          events: {
            // update: ({ record, name, value = {} }) => {
            //   if (name === 'companyId' && value) {
            //     fetchAutoGetCompany({ companyId: value?.companyId }).then((res) => {
            //       if (res) {
            //         const { ouId, ouCode, ouName, purchaseOrgId, purchaseOrgName } = res;
            //         record.set({
            //           purchaseOrgId: purchaseOrgId
            //             ? {
            //                 purchaseOrgId,
            //                 purchaseOrgName,
            //                 organizationName: purchaseOrgName,
            //               }
            //             : null,
            //           ouId: ouId ? { ouId, ouCode, ouName } : null,
            //         });
            //       }
            //     });
            //   }
            //   if (name === 'ouId' && value) {
            //     fetchAutoGetCompany({
            //       companyId: record.get('companyId')?.companyId,
            //       ouId: value?.ouId,
            //     }).then((res) => {
            //       if (res) {
            //         const {
            //           purchaseOrgId,
            //           purchaseOrgName,
            //           organizationId,
            //           organizationName,
            //         } = res;
            //         record.set({
            //           purchaseOrgId: purchaseOrgId
            //             ? {
            //                 purchaseOrgId,
            //                 purchaseOrgName,
            //                 organizationName: purchaseOrgName,
            //               }
            //             : null,
            //         });
            //         onChangeLineUpdate({
            //           invOrganizationId: {
            //             organizationId,
            //             organizationName,
            //           },
            //         });
            //       }
            //     });
            //   }
            //   if (name === 'purchaseOrgId' && value) {
            //     fetchAutoGetPurchasing({ purchaseOrgId: value.purchaseOrgId }).then((res) => {
            //       if (res) {
            //         const { purchaseAgentId, purchaseAgentCode, purchaseAgentName } = res;
            //         record.set({
            //           purchaseAgentId: purchaseAgentId
            //             ? {
            //                 purchaseAgentId,
            //                 purchaseAgentCode,
            //                 purchaseAgentName,
            //               }
            //             : null,
            //         });
            //       }
            //     });
            //   }
            // },
          },
        }),
      []
    );

    useEffect(() => {
      proxyDsCreate = {
        createNow: true,
        createData: {},
      };
      return () => {
        proxyDsCreate = undefined;
      };
    }, []);

    // 函数组件调用到子组件的函数
    useImperativeHandle(ref, () => ({
      loadCurrentData,
      loadIntCompany,
      handleGetDeatial,
      saveCurrentData,
      ref: ref.current,
    }));

    const loadIntCompany = (data) => {
      // eslint-disable-next-line no-unused-expressions
      purchaseOrgInfo.current?.set(data);
    };

    const [init, setInit] = useState(false);

    const loadCurrentData = (data) => {
      if (!init) {
        proxyDsCreate = {
          createNow: true,
          proxyQuery: () => proxyLoadData(data),
        };
        setInit(true);
      } else {
        proxyLoadData(data);
      }
    };

    const proxyLoadData = (data) => {
      purchaseOrgInfo.loadData([]);
      purchaseOrgInfo.create({ ...data });
    };

    const saveCurrentData = () => {
      purchaseOrgInfo.current.status = 'update';
      return purchaseOrgInfo;
    };

    const handleGetDeatial = (detailField) => purchaseOrgInfo.current?.get(detailField);
    return (
      <div className={styles['rfx-card-item-form']}>
        {customizeForm(
          {
            code: 'SRPM.RP_PLATFORM_ERP_CREATE.PURCHASEORGINFO', // 必传，和unitCode一一对应
            dataSet: purchaseOrgInfo,
            proxyDsCreate,
          },
          <Form labelLayout="float" columns={3} dataSet={purchaseOrgInfo} useWidthPercent>
            <Lov name="companyId" disabled />
            <Lov name="ouId" disabled />
            <Lov name="purchaseOrgId" disabled />
            <Lov name="unitId" disabled />
            <Lov name="purchaseAgentId" disabled />
          </Form>
        )}
      </div>
    );
  }
);

export default PurchaseOrgInfo;
