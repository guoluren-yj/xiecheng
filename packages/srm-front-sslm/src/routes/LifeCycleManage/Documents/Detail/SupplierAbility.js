/*
 * @Date: 2022-12-08 15:11:47
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo, useCallback } from 'react';
import { Table, Modal, DataSet, Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';

import { fetchAbilityFileCount } from '@/services/commonService';
import { dsDeleteData } from '@/routes/components/utils/utils';
import { renderC7NAttachmentText, c7nTableMaxHeight } from '@/routes/components/utils';

import AttachmentModal from './AttachmentModal';
import { getAttachmentModalDS } from '../stores/getAttachmentModalDS';

const SupplierAbility = ({
  dataSet,
  isEdit,
  custLoading,
  requisitionId,
  customizeTable,
  customizeUnitCode,
  buttonCode,
  readOnlyFlag,
  sourceKey,
}) => {
  // 附件上传回调
  const handleAttamentModal = useCallback(
    record => {
      const supplyRecordId = record.get('supplyRecordId');
      const attamentModalDs = new DataSet(
        getAttachmentModalDS(isEdit, requisitionId, supplyRecordId)
      );
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
          <AttachmentModal dataSet={attamentModalDs} isEdit={isEdit} itemLineRecord={record} />
        ),
        onOk: () => {
          if (isEdit) {
            return attamentModalDs.submit();
          }
        },
        afterClose: () => {
          if (isEdit) {
            fetchAbilityFileCount(supplyRecordId).then(response => {
              const res = getResponse(response);
              if (res || res === 0) {
                record.set('fileCount', res);
              }
            });
          }
        },
      });
    },
    [isEdit, requisitionId]
  );

  // 获取列
  const columns = useMemo(() => {
    return [
      {
        name: 'itemId',
        editor: isEdit,
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'itemCategoryId',
        width: 150,
        editor: isEdit && (
          <Lov
            searchFieldInPopup
            name="itemCategoryId"
            onOption={({ record: optionRecord }) => {
              return {
                disabled: optionRecord.get('isCheck') === false,
              };
            }}
            tableProps={{
              mode: 'tree',
              alwaysShowRowBox: true,
              selectionMode: 'rowbox',
            }}
          />
        ),
      },
      {
        name: 'itemCategoryName',
        width: 150,
      },
      {
        name: 'supplyFlag',
        width: 100,
        editor: isEdit,
        renderer: ({ value }) => yesOrNoRender(value) || '-',
      },
      {
        name: 'adapterProducts',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'countryId',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'regionId',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'cityId',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'validityDate',
        width: 180,
        editor: isEdit,
      },
      {
        name: 'supplyStatus',
        width: 100,
      },
      {
        name: 'psaEvaluationLevel',
        width: 100,
      },
      {
        name: 'psaEvaluationScore',
        width: 100,
      },
      {
        name: 'psaFinishDate',
        width: 120,
      },
      {
        name: 'spaEvaluationLevel',
        width: 100,
      },
      {
        name: 'spaEvaluationScore',
        width: 120,
      },
      {
        name: 'spaFinishDate',
        width: 120,
      },
      {
        name: 'evaluateRemark',
        width: 150,
      },
      {
        name: 'inventoryOrganizationId',
        width: 200,
        editor: isEdit,
      },
      {
        name: 'purchaseOrganizationId',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'manufacturer',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'attachment',
        width: 130,
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
    ];
  }, [isEdit, requisitionId]);

  const buttons = useMemo(() => {
    // 工作流-信息补录弹框里，不展示表格按钮
    return isEdit && sourceKey !== 'SUPPLEMENT'
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

  // 单据样式定制，审批表单只读
  const custProps = sourceKey === 'APPROVAL_FORM' ? { readOnly: true } : { readOnly: readOnlyFlag };

  return customizeTable(
    {
      code: customizeUnitCode,
      buttonCode,
      ...custProps,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      custLoading={custLoading}
      style={{ maxHeight: c7nTableMaxHeight }}
      selectionMode={isEdit && sourceKey !== 'SUPPLEMENT' ? 'rowbox' : 'none'}
    />
  );
};

export default SupplierAbility;
