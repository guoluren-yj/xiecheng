import React, { useImperativeHandle, useMemo, useEffect, useState } from 'react';
import { Form, Lov, DataSet } from 'choerodon-ui/pro';
import { difference, isEmpty } from 'lodash';
import { fetchAutoGetCompany, fetchAutoGetPurchasing } from '@/services/RequisitionPlanServices';
import { purchaseOrgInfoDs } from '../indexDS';
import styles from '../index.less';
// import intl from 'utils/intl';

let proxyDsCreate;

const PurchaseOrgInfo = React.forwardRef(
  ({ rpHeaderId, handleDetailField, onChangeLineUpdate, customizeForm, remote, baseRef }, ref) => {
    const purchaseOrgInfo = useMemo(
      () =>
        new DataSet({
          ...purchaseOrgInfoDs({ rpHeaderId, handleDetailField }),
          events: {
            update: ({ record, name, value = {}, dataSet }) => {
              if (name === 'companyId' && value) {
                fetchAutoGetCompany({ companyId: value?.companyId }).then((res) => {
                  if (res) {
                    const { ouId, ouCode, ouName, purchaseOrgId, purchaseOrgName } = res;
                    record.set({
                      purchaseOrgId: purchaseOrgId
                        ? {
                          purchaseOrgId,
                          purchaseOrgName,
                          organizationName: purchaseOrgName,
                        }
                        : null,
                      ouId: ouId ? { ouId, ouCode, ouName } : null,
                    });
                  }
                });
              }
              // 存在value?.ouCode说明是手动选择的Lov，避免使用loadData，重载数据后，值集变化查询数据，调用onChangeLineUpdate方法，导致行上的库存组织被更新
              if (name === 'ouId' && value && !isEmpty(difference(Object?.keys(value || {}), ['ouId', 'ouName']))) {
                fetchAutoGetCompany({
                  companyId: record.get('companyId')?.companyId,
                  ouId: value?.ouId,
                }).then((res) => {
                  if (res) {
                    const {
                      purchaseOrgId,
                      purchaseOrgName,
                      organizationId,
                      organizationName,
                    } = res;
                    record.set({
                      purchaseOrgId: purchaseOrgId
                        ? {
                          purchaseOrgId,
                          purchaseOrgName,
                          organizationName: purchaseOrgName,
                        }
                        : null,
                    });
                    onChangeLineUpdate({
                      invOrganizationId: {
                        organizationId,
                        organizationName,
                      },
                    });
                  }
                });
              }

              if (name === 'purchaseOrgId' && value) {
                fetchAutoGetPurchasing({ purchaseOrgId: value.purchaseOrgId }).then((res) => {
                  if (res) {
                    const { purchaseAgentId, purchaseAgentCode, purchaseAgentName } = res;
                    record.set({
                      purchaseAgentId: purchaseAgentId
                        ? {
                          purchaseAgentId,
                          purchaseAgentCode,
                          purchaseAgentName,
                        }
                        : null,
                    });
                  }
                });
              }
              // remote.event.fire
              remote.event.fireEvent('cuxHandleUpdate', {
                rpHeaderId,
                name,
                record,
                dataSet,
                getHeaderDsFc: baseRef.current?.saveCurrentData,
              });
            },
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
      ds: purchaseOrgInfo,
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
            code: 'SRPM.RP_PLATFORM_CREATE.PURCHASEORGINFO', // 必传，和unitCode一一对应
            dataSet: purchaseOrgInfo,
            proxyDsCreate,
          },
          <Form labelLayout="float" columns={3} dataSet={purchaseOrgInfo} useWidthPercent>
            <Lov name="companyId" />
            <Lov name="ouId" />
            <Lov name="purchaseOrgId" />
            <Lov name="unitId" />
            <Lov name="purchaseAgentId" />
          </Form>
        )}
      </div>
    );
  }
);

export default PurchaseOrgInfo;
