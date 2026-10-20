/*
 * SupplyAbility - 供货能力清单
 * @Date: 2023-04-11 16:54:37
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import {
  renderC7NAttachmentText,
  renderStatus,
  handleExtTextRenderIntercept,
} from '@/routes/components/utils';
import AttachmentModal from './AttachmentModal';

const SupplyAbility = ({
  status,
  dataSet,
  custLoading,
  customizeTable,
  tableMaxHeight,
  handleCompareRender,
  customizeUnitCode,
  showUpdateFlag,
}) => {
  // 附件上传回调
  const handleAttamentModal = useCallback(record => {
    const abilityLineId = record.get('abilityLineId');
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 1200 },
      cancelButton: false,
      bodyStyle: { padding: 0 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('hzero.common.upload.modal.title').d('附件'),
      children: (
        <AttachmentModal
          abilityLineId={abilityLineId}
          custLoading={custLoading}
          customizeTable={customizeTable}
        />
      ),
    });
  }, []);

  const columns = [
    showUpdateFlag && {
      type: 'select',
      name: 'objectFlag',
      renderer: renderStatus,
    },
    {
      name: 'itemCode',
      width: 120,
      displayField: 'itemCode',
    },
    {
      name: 'itemName',
      width: 160,
    },
    {
      name: 'categoryCode',
      width: 120,
      displayField: 'categoryCode',
    },
    {
      name: 'categoryName',
      width: 160,
    },
    {
      width: 100,
      name: 'supplyFlag',
      type: 'boolean',
    },
    {
      width: 120,
      name: 'oneTimeFlag',
      type: 'boolean',
    },
    {
      name: 'adapterProducts',
      width: 150,
    },
    {
      width: 150,
      name: 'countryId',
      displayField: 'countryName',
    },
    {
      width: 150,
      name: 'regionId',
      displayField: 'regionName',
    },
    {
      width: 150,
      name: 'cityId',
      displayField: 'regionName',
    },
    {
      width: 150,
      name: 'dateFrom',
      type: 'date',
    },
    {
      width: 150,
      name: 'dateTo',
      type: 'date',
    },
    {
      name: 'inventoryOrganizationId',
      width: 150,
      type: 'Lov',
    },
    {
      name: 'purchaseOrganizationId',
      width: 150,
      displayField: 'organizationName',
    },
    {
      name: 'manufacturer',
      width: 150,
    },
    {
      name: 'attachment',
      width: 130,
      editor: false,
      renderer: ({ record, name }) => {
        return (
          <a
            disabled={status === 'history'}
            style={{
              color:
                (record.get(`${name}Flag`) === 'UPDATE' ||
                  record.get(`${name}StateFlag`) === 'update') &&
                'red',
            }}
            onClick={() => handleAttamentModal(record)}
          >
            {renderC7NAttachmentText({
              editable: false,
              fileCount: record.get('fileCount'),
            })}
          </a>
        );
      },
    },
    {
      name: 'remark',
      width: 150,
    },
  ]
    .filter(Boolean)
    .map(column => {
      const { type, displayField, ...others } = column;
      return {
        renderer: ({ value, record, name }) =>
          handleCompareRender({ value, record, name, type, displayField }),
        ...others,
      };
    });

  return customizeTable(
    {
      code: customizeUnitCode,
      readOnly: true,
      extTextRenderIntercept: handleExtTextRenderIntercept,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      style={tableMaxHeight}
      custLoading={custLoading}
      selectionMode="none"
    />
  );
};

export default SupplyAbility;
