/*
 * @Date: 2023-08-18 15:32:55
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext, useEffect } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import { Context } from '@/routes/SupplierMasterData/Context';
import { getAttachmentDS } from '../stores/getAttachmentDS';

const customizeCode = '';

const Attachment = () => {
  const context = useContext(Context);
  const {
    enterpriseBasicInfo: { attachmentList = [] } = {},
    customizeTable,
    tableMaxHeight,
  } = context;
  const dataSet = useDataSet(() => getAttachmentDS(), []);
  useEffect(() => {
    dataSet.loadData(attachmentList);
  });

  const columns = [
    {
      name: 'attachmentTypeMeaning',
      width: 180,
      renderer: ({ record }) => {
        const {
          attachmentType,
          attachmentTypeMeaning,
          subAttachment,
          subAttachmentMeaning,
        } = record.get([
          'attachmentType',
          'attachmentTypeMeaning',
          'subAttachment',
          'subAttachmentMeaning',
        ]);
        if (attachmentType && subAttachment && attachmentType !== subAttachment) {
          return `${attachmentTypeMeaning} / ${subAttachmentMeaning}`;
        } else {
          return attachmentTypeMeaning || subAttachmentMeaning;
        }
      },
    },
    {
      name: 'description',
      width: 160,
    },
    {
      name: 'purchaserAttachmentUuid',
      width: 120,
    },
    {
      name: 'attachmentUuid',
      width: 120,
    },
    {
      name: 'endDate',
      width: 100,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'longEffectiveFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'uploadDate',
      width: 100,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'freezeControlFlag',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'remark',
      width: 200,
    },
  ];
  return customizeTable(
    { code: customizeCode },
    <Table dataSet={dataSet} columns={columns} style={{ maxHeight: tableMaxHeight }} />
  );
};

export default Attachment;
