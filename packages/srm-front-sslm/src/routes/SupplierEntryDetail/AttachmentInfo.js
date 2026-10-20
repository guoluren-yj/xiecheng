/**
 * AttachmentInfo - 附件信息
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect } from 'react';
import moment from 'moment';
import { Table, Attachment, Cascader } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';

const AttachmentInfo = ({
  dataSet,
  isEdit: editFlag,
  disabledObj = {},
  custLoading,
  customizeTable,
  customizeUnitCode,
}) => {
  const { allDisabled } = disabledObj;
  const isEdit = editFlag && !allDisabled;

  useEffect(() => {
    dataSet.query();
  }, [dataSet]);

  /**
   * 设置最新更新时间
   * @param {object} record 行数据
   */
  const setLastUploadTime = record => {
    const time = moment();
    record.set(`uploadDate`, time.format(DEFAULT_DATETIME_FORMAT));
  };

  const columns = [
    {
      name: 'attachmentTypeMerge',
      width: 220,
      tooltip: 'none',
      editor: record => {
        return (
          isEdit && (
            <Cascader
              style={{ width: '100%' }}
              onChange={data => {
                if (data && data.length) {
                  record.set('attachmentType', data[0]);
                  record.set('subAttachment', data[1]);
                } else {
                  record.set('attachmentType', null);
                  record.set('subAttachment', null);
                }
              }}
              expandTrigger="hover"
              placeholder=""
            />
          )
        );
      },
    },
    {
      name: 'description',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'longEffectiveFlag',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'endDate',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'uploadDate',
      width: 180,
    },
    {
      name: 'attachmentUuid',
      width: 150,
      editor: record => (
        <Attachment
          name="attachmentUuid"
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="spfm-comp"
          funcType="link"
          viewMode="popup"
          readOnly={!isEdit}
          onAttachmentsChange={() => setLastUploadTime(record)}
        />
      ),
    },
    {
      name: 'remark',
      width: 200,
      editor: isEdit,
    },
  ];
  const buttons = isEdit
    ? [
        'add',
        [
          'delete',
          {
            onClick: () =>
              dataSet.delete(dataSet.selected, {
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: intl
                  .get('spfm.supplierRegister.view.message.deleteConfirm')
                  .d('确认删除选中行？'),
              }),
          },
        ],
      ]
    : [];
  return customizeTable(
    {
      code: customizeUnitCode,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      custLoading={custLoading}
      selectionMode={isEdit ? 'rowbox' : 'click'}
    />
  );
};
export default AttachmentInfo;
