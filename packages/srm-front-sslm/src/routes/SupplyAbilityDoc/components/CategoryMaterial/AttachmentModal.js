/*
 * @Date: 2023-11-01
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Table, useDataSet, Spin } from 'choerodon-ui/pro';
import C7nAddAttachmentBtn from '@/routes/components/C7nAddAttachmentBtn';

import intl from 'utils/intl';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';

import { dsDeleteData } from '@/routes/components/utils/utils';
import { downLoadFile } from '@/routes/components/utils';
import { getAttachmentDs } from './stores/getAttachmentDS';

const userInfo = getCurrentUser();
const organizationId = getCurrentOrganizationId();

const AttachmentModal = ({
  isEdit,
  lineRecord,
  modal,
  dataSet,
  customizeTable,
  customizeUnitCode,
}) => {
  const { abilityChangeLineId, abilityReqId, relationAbilityLineId } = lineRecord;
  const attachmentDs = useDataSet(() => getAttachmentDs({ isEdit }), []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    attachmentDs.setQueryParameter('queryParam', {
      customizeUnitCode,
      abilityChangeLineId,
    });
    attachmentDs.query();
    modal.update({
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          {isEdit && cancelBtn}
        </div>
      ),
      okText: isEdit
        ? intl.get('hzero.common.button.sure').d('确定')
        : intl.get('hzero.common.button.close').d('关闭'),
      onOk: async () => {
        let closeFlag = true;
        if (isEdit) {
          const validateFlag = await attachmentDs.validate();
          if (!attachmentDs.dirty) {
            closeFlag = true;
          } else if (validateFlag) {
            const res = await attachmentDs.submit();
            if (res) {
              closeFlag = true;
            } else {
              closeFlag = false;
            }
          } else {
            closeFlag = false;
          }
          if (closeFlag) {
            dataSet.query();
          }
        }
        return closeFlag;
      },
    });
  }, []);

  //  新增附件 确认按钮回调
  const handleOk = file => {
    const { realName, id } = userInfo;
    attachmentDs.create(
      {
        abilityReqId,
        abilityChangeLineId,
        relationAbilityLineId,
        uploadUserId: id,
        uploadUserName: realName,
        attachmentDesc: file.name,
        attachmentSize: file.size,
        attachmentUrl: file.response,
        tenantId: organizationId,
      },
      0
    );
  };

  const getButtons = useCallback(() => {
    return isEdit
      ? [
        <C7nAddAttachmentBtn onOk={handleOk} setLoading={setLoading} />,
          [
            'delete',
            {
              onClick: () => dsDeleteData({ dataSet: attachmentDs }),
            },
          ],
        ]
      : [];
  }, [isEdit, attachmentDs]);

  const columns = useMemo(
    () => [
      {
        name: 'attachmentDesc',
        width: 200,
      },
      {
        name: 'attachmentSize',
        width: 130,
        renderer: ({ value }) => `${value / (1024 * 1024)}`.substring(0, 5),
      },
      {
        name: 'uploadUserName',
        width: 120,
      },
      {
        name: 'uploadDate',
        width: 150,
      },
      {
        name: 'attachmentType',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'dueDate',
        width: 160,
        editor: isEdit,
      },
      {
        name: 'remark',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'option',
        width: 80,
        lock: 'right',
        renderer: ({ record }) => {
          const { tenantId, attachmentUrl } = record.get(['tenantId', 'attachmentUrl']);
          return (
            attachmentUrl && (
              <a
                href={downLoadFile({ tenantId, attachmentUrl })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {intl.get('hzero.common.button.download').d('下载')}
              </a>
            )
          );
        },
      },
    ],
    [isEdit]
  );

  const tableDom = (
    <Table
      dataSet={attachmentDs}
      customizable
      customizedCode="supply.ability.doc.line.att"
      columns={columns}
      buttons={getButtons()}
      autoHeight={{ type: 'maxHeight', diff: 35 }}
    />
  );

  return (
    <Spin spinning={loading}>
      {customizeTable
        ? customizeTable(
            {
              code: customizeUnitCode,
            },
            tableDom
          )
        : tableDom}
    </Spin>
  );
};

export default AttachmentModal;
