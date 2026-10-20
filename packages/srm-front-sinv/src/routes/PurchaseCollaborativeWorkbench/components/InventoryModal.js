/* eslint-disable camelcase */
import React, { useEffect } from 'react';
import { getCurrentOrganizationId } from 'utils/utils';
import { DataSet, Table } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { isNil } from 'lodash';
import { SRM_SPUC } from '_utils/config';
import intl from 'utils/intl';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();

function InventoryModal(props) {
  const { HeaderDs, lineData } = props;

  // 减
  const Num_subtract = (num1, num2) => {
    return Number(math.minus(num1, num2, true));
  };

  const bomDs = new DataSet({
    dataToJSON: 'all',
    autoQuery: false,
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'displayInvNum',
        label: intl.get(`sinv.inventoryBench.model.view.displayInvNum`).d('单据编号-行号'),
      },
      {
        name: 'strategyName',
        label: intl.get(`sinv.inventoryBench.model.view.strategyName`).d('单据类型'),
      },
      {
        name: 'quantity',
        label: intl.get(`sinv.inventoryBench.model.view.quantity`).d('数量'),
      },
      {
        name: 'creationDate',
        label: intl.get(`sinv.inventoryBench.model.view.creationDate`).d('创建时间'),
      },
      {
        label: intl.get(`sinv.inventoryBench.model.view.createdName`).d('创建人'),
        name: 'createdName',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { ...other } = data.params;
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/stockout/inv/line/detail/list`,
          method: 'POST',
          data: other,
        };
      },
    },
  });

  useEffect(() => {
    const {
      invDateFrom,
      invDateTo,
      invHeaderId,
      companyId,
      supplierCompanyId,
      strategyHeaderId,
      supplierId,
    } = HeaderDs?.current?.toData();
    bomDs.setQueryParameter('params', {
      ...lineData,
      invDateFrom,
      invDateTo,
      invHeaderId,
      strategyHeaderId,
      companyId,
      supplierCompanyId,
      supplierId,
    });
    bomDs.query();
  }, []);

  const columns = [
    {
      name: 'displayInvNum',
      width: 160,
      renderer: ({ value, record }) => {
        if (value) {
          return <span>{`${value}-${record.get('displayInvLineNum')}`}</span>;
        }
      },
    },
    {
      name: 'strategyName',
      width: 130,
    },
    {
      name: 'quantity',
      width: 120,
    },
    {
      width: 150,
      name: 'creationDate',
    },
    {
      width: 100,
      name: 'createdName',
    },
  ];
  return (
    <>
      <div className={styles.oWrap}>
        <div className={styles.oDiv}>
          <div className={styles.oContent}>
            <div className={styles.oText}>
              {intl.get(`sinv.inventoryBench.model.view.difference`).d('实际原料库存差')}
            </div>
            <div className={styles.oNum}>
              {!isNil(lineData?.internalAddQuantity) && !isNil(lineData?.internalReduceQuantity)
                ? Num_subtract(lineData.internalAddQuantity, lineData.internalReduceQuantity)
                : 0}
            </div>
          </div>
        </div>

        <div className={styles.equal}>=</div>

        <div className={styles.oInventory}>
          <div className={styles.oContent}>
            <div className={styles.oText}>
              {intl.get(`sinv.inventoryBench.model.view.ActualIssue`).d('实际发料')}
            </div>
            <div className={styles.oNum}>{lineData?.internalAddQuantity || 0}</div>
          </div>
        </div>

        <div className={styles.equal}>-</div>

        <div className={styles.oInventory}>
          <div className={styles.oContent}>
            <div className={styles.oText}>
              {intl.get(`sinv.inventoryBench.model.view.consumption`).d('实际消耗')}
            </div>
            <div className={styles.oNum}>{lineData?.internalReduceQuantity || 0}</div>
          </div>
        </div>
      </div>
      <Table
        dataSet={bomDs}
        columns={columns}
        customizable
        customizedCode="inventory-modal-workbench"
      />
    </>
  );
}

export default InventoryModal;
