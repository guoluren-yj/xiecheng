/*
 * SupplyAbility - 供货能力清单
 * @Date: 2023-04-11 16:54:37
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Table, Lov, DataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';

import { queryAbilityFileCount } from '@/services/supplierInformService';
import { renderC7NAttachmentText } from '@/routes/components/utils';
import { dsDeleteData } from '@/routes/components/utils/utils';
import AttachmentModal from './AttachmentModal';
import { getAttachmentModalDS } from '../../../stores/getSupplyAbilityDS';

const SupplyAbility = ({ dataSet, isEdit, custLoading, customizeTable, supplierInformRemote }) => {
  // 附件上传回调
  const handleAttamentModal = useCallback(
    record => {
      const abilityLineId = record.get('abilityLineId');
      const attamentModalDs = new DataSet(getAttachmentModalDS(isEdit, abilityLineId));
      Modal.open({
        key: Modal.key(),
        drawer: true,
        style: { width: 1200 },
        cancelButton: isEdit,
        okText: isEdit
          ? intl.get('hzero.common.button.sure').d('确定')
          : intl.get('hzero.common.button.close').d('关闭'),
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        children: (
          <AttachmentModal
            isEdit={isEdit}
            dataSet={attamentModalDs}
            itemLineRecord={record}
            custLoading={custLoading}
            customizeTable={customizeTable}
          />
        ),
        onOk: () => {
          if (isEdit) {
            const objectVersionNumber = record.get('objectVersionNumber');
            record.set('objectVersionNumber', objectVersionNumber + 1); // 更新行上版本
            return attamentModalDs.submit();
          }
        },
        afterClose: () => {
          if (isEdit) {
            queryAbilityFileCount({ abilityLineId }).then(response => {
              const res = getResponse(response);
              if (res || res === 0) {
                record.set('fileCount', res);
              }
            });
          }
        },
      });
    },
    [isEdit]
  );

  const getButtons = useCallback(() => {
    return isEdit
      ? [
          'add',
          [
            'delete',
            {
              onClick: () => dsDeleteData({ dataSet }),
            },
          ],
        ]
      : [];
  }, [isEdit, dataSet]);

  const columns = [
    {
      name: 'itemCode',
      width: 120,
    },
    {
      name: 'itemName',
      width: 160,
      editor: false,
    },
    {
      name: 'categoryCode',
      width: 120,
      editor: isEdit && (
        <Lov
          name="categoryCode"
          searchFieldInPopup
          onOption={({ record: optionRecord }) => {
            return {
              disabled: optionRecord.get('isCheck') === false,
            };
          }}
          tableProps={{
            treeAsync: true,
            alwaysShowRowBox: true,
            selectionMode: 'rowbox',
            onRow: ({ record }) => {
              const nodeProps = {};
              if (record.get('hasChild') === '0') {
                nodeProps.isLeaf = true;
              }
              return nodeProps;
            },
          }}
        />
      ),
    },
    {
      name: 'categoryName',
      width: 160,
      editor: false,
    },
    {
      width: 100,
      name: 'supplyFlag',
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      width: 120,
      name: 'oneTimeFlag',
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'adapterProducts',
      width: 150,
    },
    {
      width: 150,
      name: 'countryId',
    },
    {
      width: 150,
      name: 'regionId',
    },
    {
      width: 150,
      name: 'cityId',
    },
    {
      width: 150,
      name: 'dateFrom',
    },
    {
      width: 150,
      name: 'dateTo',
    },
    {
      name: 'inventoryOrganizationId',
      width: 150,
    },
    {
      name: 'purchaseOrganizationId',
      width: 150,
    },
    {
      name: 'manufacturer',
      width: 150,
    },
    {
      name: 'attachment',
      width: 130,
      editor: false,
      renderer: ({ record }) => {
        return (
          <a disabled={record.status === 'add'} onClick={() => handleAttamentModal(record)}>
            {renderC7NAttachmentText({
              editable: isEdit,
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
  ].map(column => ({ editor: isEdit, ...column }));

  const buttons = supplierInformRemote
    ? supplierInformRemote.process(
        'SSLM_SUPPLIER_INFORM_NEW_SUPPLY_ABILITY_TABLE_BTNS',
        getButtons(),
        { dataSet, isEdit }
      )
    : getButtons();

  return customizeTable(
    {
      code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SUPPLY_ABILITY',
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      custLoading={custLoading}
      selectionMode={isEdit ? 'rowbox' : 'none'}
      style={{ maxHeight: 'calc(100vh - 400px)' }}
    />
  );
};

export default SupplyAbility;
