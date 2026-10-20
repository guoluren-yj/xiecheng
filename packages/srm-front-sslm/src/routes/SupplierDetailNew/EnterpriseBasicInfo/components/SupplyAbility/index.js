/*
 * SupplyAbility - 供货能力清单
 * @Date: 2023-08-17 14:43:17
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useContext } from 'react';
import { Table, DataSet, Modal, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';

import { Context } from '@/routes/SupplierDetailNew/Context';
import { renderC7NAttachmentText } from '@/routes/components/utils';
import { getSupplyAbilityDS, getAttachmentModalDS } from '../../stores/getSupplyAbilityDS';
import AttachmentModal from './AttachmentModal';

const customizeUnitCode = 'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.ABILITY';

const SupplyAbility = () => {
  const dataSet = useDataSet(() => getSupplyAbilityDS(), []);
  const context = useContext(Context);
  const { companyId, customizeTable, supplierCompanyId, tableMaxHeight } = context;

  useEffect(() => {
    if (companyId && supplierCompanyId) {
      dataSet.setQueryParameter('params', {
        companyId,
        customizeUnitCode,
        supplierCompanyId,
      });
      dataSet.query();
    }
  }, [companyId]);

  // 附件上传回调
  const handleAttamentModal = record => {
    const abilityLineId = record.get('abilityLineId');
    const attamentModalDs = new DataSet(getAttachmentModalDS({ abilityLineId }));
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 1200 },
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('hzero.common.upload.modal.title').d('附件'),
      children: <AttachmentModal dataSet={attamentModalDs} tableMaxHeight={tableMaxHeight} />,
    });
  };

  const columns = [
    {
      name: 'itemCode',
      width: 140,
    },
    {
      name: 'itemName',
      width: 140,
    },
    {
      name: 'itemCategoryCode',
      width: 140,
    },
    {
      name: 'itemCategoryName',
      width: 140,
    },
    {
      name: 'supplyFlag',
      width: 90,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'adapterProducts',
      width: 140,
    },
    {
      width: 140,
      name: 'countryIdMeaning',
    },
    {
      width: 140,
      name: 'regionIdMeaning',
    },
    {
      width: 140,
      name: 'cityIdMeaning',
    },
    {
      name: 'dateFrom',
      width: 120,
    },
    {
      name: 'dateTo',
      width: 120,
    },
    {
      width: 100,
      name: 'supplyStatus',
    },
    {
      width: 100,
      name: 'psaEvaluationLevel',
    },
    {
      width: 100,
      name: 'psaEvaluationScore',
    },
    {
      width: 120,
      name: 'psaFinishDate',
      renderer: ({ value }) => dateRender(value),
    },
    {
      width: 100,
      name: 'spaEvaluationLevel',
    },
    {
      width: 100,
      name: 'spaEvaluationScore',
    },
    {
      width: 120,
      name: 'spaFinishDate',
      renderer: ({ value }) => dateRender(value),
    },
    {
      width: 200,
      name: 'evaluateRemark',
    },
    {
      name: 'quotaRatio',
      width: 200,
    },
    {
      width: 200,
      name: 'inventoryOrganizationId',
    },
    {
      width: 120,
      name: 'attachmentUuid',
      renderer: ({ record }) => {
        return (
          <a onClick={() => handleAttamentModal(record)}>
            {renderC7NAttachmentText({
              editable: false,
              fileCount: record.get('fileCount'),
            })}
          </a>
        );
      },
    },
    {
      width: 120,
      name: 'createUserDepartment',
    },
    {
      name: 'purchaseOrganizationName',
      width: 150,
    },
    {
      name: 'manufacturer',
      width: 150,
    },
    {
      name: 'lastUpdateUserName',
      width: 150,
    },
    {
      name: 'lastUpdateDate',
      width: 100,
      renderer: ({ value }) => dateRender(value),
    },
  ];
  return customizeTable(
    {
      code: customizeUnitCode,
    },
    <Table dataSet={dataSet} columns={columns} style={{ maxHeight: tableMaxHeight }} />
  );
};

export default SupplyAbility;
