/*
 * Attachment - 附件信息
 * @Date: 2023-04-11 11:16:57
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import { isArray, isEmpty } from 'lodash';
import { useObserver } from 'mobx-react-lite';
import React, { useCallback, useState } from 'react';
import { Table, Cascader, Attachment as C7nAttachment, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';

import { dsDeleteData } from '@/routes/components/utils/utils';
import { updateUploadDate } from '@/services/enterpriseInformService';

const Attachment = ({ dataSet, isEdit, custLoading, customizeTable, tableMaxHeight }) => {
  const [loading, setLoading] = useState(false);

  const getButtons = useCallback(() => {
    const isDisabled = useObserver(() => isEmpty(dataSet.selected));
    return isEdit
      ? [
        <PermissionButton
          type="c7n-pro"
          icon="playlist_add"
          onClick={() => {
              dataSet.create({}, 0);
            }}
          permissionList={[
              {
                code: 'srm.partner.my-partner.supplier-inform-change-new.button.attachment-add',
                type: 'button',
                meaning: '附件信息-新增',
              },
            ]}
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </PermissionButton>,
        <PermissionButton
          type="c7n-pro"
          icon="delete_sweep"
          disabled={isDisabled}
          onClick={() => dsDeleteData({ dataSet })}
          permissionList={[
              {
                code: 'srm.partner.my-partner.supplier-inform-change-new.button.attachment-delete',
                type: 'button',
                meaning: '附件信息-删除',
              },
            ]}
        >
          {intl.get('sslm.common.button.batchDelete').d('批量删除')}
        </PermissionButton>,
        ]
      : [];
  }, [isEdit, dataSet]);

  // 更新最后上传时间
  const setLastUploadTime = useCallback(record => {
    // 已保存行
    const savedFlag = record.get('attachmentReqId');
    // 新建行更新最后上传时间
    if (!savedFlag) {
      record.set({ uploadDate: moment() });
    }
  }, []);

  const columns = [
    {
      name: 'attachmentFileType',
      width: 200,
      editor: record =>
        isEdit && (
          <Cascader
            onChange={data => {
              if (data && isArray(data)) {
                record.set('attachmentType', data[0]);
                record.set('subAttachment', data[1]);
              } else {
                record.set('attachmentType', null);
                record.set('subAttachment', null);
              }
            }}
          />
        ),
    },
    {
      name: 'description',
      width: 200,
    },
    {
      name: 'endDate',
      width: 150,
    },
    {
      name: 'longEffectiveFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'uploadDate',
      width: 160,
      editor: false,
    },
    {
      name: 'attachmentUuid',
      width: 120,
      editor: record =>
        isEdit && (
          <C7nAttachment
            funcType="link"
            crossTenant
            viewMode="popup"
            afterUpload={() => {
              setLastUploadTime(record);
              handleLastUploadDate(record, 'ADD');
            }}
            afterDelete={() => {
              setLastUploadTime(record);
              handleLastUploadDate(record, 'DELETE');
            }}
          />
        ),
    },
    {
      name: 'remark',
    },
  ].map(column => ({ editor: isEdit, ...column }));

  // 处理附件信息最后上传日期
  const handleLastUploadDate = useCallback((record = {}, updateType = 'ADD') => {
    const currentData = record.toData() || {};
    // 这里取功能表的uuid，当功能表存上uuid的时候才更新行上的相关信息
    // 获取字段初始值
    const hasUUid = record.getPristineValue('attachmentUuid');
    if (!isEmpty(currentData) && hasUUid) {
      setLoading(true);
      updateUploadDate({
        ...currentData,
        updateType,
      })
        .then(res => {
          if (getResponse(res)) {
            const { objectVersionNumber, uploadDate, longEffectiveFlag, endDate } = res;
            record.set({
              objectVersionNumber,
              uploadDate,
              longEffectiveFlag,
              endDate,
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <Spin spinning={loading}>
      {customizeTable(
        {
          code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ATTACHMENT',
        },
        <Table
          dataSet={dataSet}
          columns={columns}
          virtualCell={false}
          buttons={getButtons()}
          custLoading={custLoading}
          style={tableMaxHeight}
          selectionMode={isEdit ? 'rowbox' : 'none'}
        />
      )}
    </Spin>
  );
};

export default Attachment;
