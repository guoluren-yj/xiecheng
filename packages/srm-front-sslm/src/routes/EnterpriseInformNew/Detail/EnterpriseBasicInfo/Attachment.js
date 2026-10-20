/*
 * Attachment - 附件信息
 * @Date: 2023-08-29 20:54:40
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import moment from 'moment';
import { isArray, isEmpty } from 'lodash';
import React, { useCallback, useState } from 'react';
import { Table, Cascader, Attachment as C7nAttachment, Spin } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';

import { dsDeleteData } from '@/routes/components/utils/utils';
import { renderStatus } from '@/routes/components/utils';
import { updateUploadDate } from '@/services/enterpriseInformService';
import styles from '@/routes/index.less';

const Attachment = ({
  dataSet,
  isEdit,
  custLoading,
  customizeTable,
  tableMaxHeight,
  handleFieldRender = () => {},
  isAllPlatform = true,
  partnerTenantId,
  code = '',
  mustLineTabObj = {},
  tabName,
}) => {
  const [loading, setLoading] = useState(false);

  const getButtons = useCallback(() => {
    return isEdit
      ? [
          ['add', { afterClick: () => handleAdd() }],
          [
            'delete',
            {
              onClick: () => {
                // 过滤出已保存的数据
                const isSavedData = dataSet.selected.filter(
                  record => record.get('attachmentReqId') || record.get('comAttachmentReqId')
                );
                if (isEmpty(isSavedData)) {
                  dataSet.delete(dataSet.selected, false);
                } else {
                  dsDeleteData({ dataSet });
                }
              },
            },
          ],
          [
            'save',
            {
              onClick: () => {
                dataSet.submit().then(res => {
                  if (res) {
                    dataSet.query();
                  }
                });
              },
            },
          ],
        ]
      : [];
  }, [isEdit, dataSet]);

  const handleAdd = useCallback(() => {
    const currentRow = dataSet.current;
    if (currentRow && !isAllPlatform) {
      currentRow.set({
        tenantId: partnerTenantId,
      });
    }
  }, [isAllPlatform, partnerTenantId]);

  // 更新最后上传时间
  const setLastUploadTime = useCallback(record => {
    // 已保存行
    const savedFlag = record.get('attachmentReqId') || record.get('comAttachmentReqId');
    // 新建行更新最后上传时间
    if (!savedFlag) {
      record.set({ uploadDate: moment() });
    }
  }, []);

  const editColumns = [
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
            crossTenant
            funcType="link"
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
        isPlatformFlag: isAllPlatform,
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

  const viewColumns = [
    {
      name: 'objectFlag',
      ignore: true,
      renderer: renderStatus,
    },
    {
      name: 'attachmentFileType',
      width: 200,
    },
    {
      name: 'description',
      width: 200,
    },
    {
      name: 'endDate',
      width: 150,
      type: 'date',
    },
    {
      name: 'longEffectiveFlag',
      width: 120,
      type: 'CHECKBOX',
    },
    {
      name: 'uploadDate',
      width: 160,
      type: 'date',
    },
    {
      name: 'attachmentUuid',
      width: 120,
      ignore: true,
      editor: (record, name) => handleFieldRender({ record, name, type: 'Upload' }),
    },
    {
      name: 'remark',
    },
  ].map(column => {
    const { type, ignore, ...others } = column;
    const cuzRenderFlag = ['attachmentFileType'].includes(column.name);
    if (cuzRenderFlag) {
      return {
        renderer: ({ record }) =>
          handleFieldRender({
            value: record.get('attachmentMeaning'),
            record,
            name: 'attachmentMeaning',
          }),
        ...others,
      };
    }
    return ignore
      ? column
      : {
          renderer: ({ value, record, name }) => handleFieldRender({ value, record, name, type }),
          ...others,
        };
  });

  const showAlert = !!mustLineTabObj.ATTACHMENT && isEdit;

  return (
    <Spin spinning={loading}>
      {showAlert && (
        <Alert
          showIcon
          type="info"
          message={intl
            .get('sslm.common.view.tooltip.leastOneLine', {
              name: tabName,
              number: mustLineTabObj.ATTACHMENT,
            })
            .d(`请至少填写${mustLineTabObj.ATTACHMENT}条${tabName}`)}
          style={{ marginBottom: 16, border: 0 }}
          className={styles['alert-styles']}
        />
      )}
      {customizeTable(
        {
          code,
          readOnly: !isEdit,
        },
        <Table
          dataSet={dataSet}
          columns={isEdit ? editColumns : viewColumns}
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
