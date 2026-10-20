import React, { useMemo, useImperativeHandle, useEffect } from 'react';
import { observer } from 'mobx-react';
import { isEmpty, noop } from 'lodash';
import { Table, Lov, useDataSet, Button, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import DynamicButtons from '_components/DynamicButtons';
import { queryFileList } from 'services/api';
import notification from 'utils/notification';

import { fetchAttTemplateDataByAttType, generateAttTemplate } from '@/services/inquiryHallService';

import { fileTemplateAttachmentDS } from './storeDS';

const FileTemplateAttachment = (props) => {
  const {
    isNewRfx = false,
    bidFileTemplateAttachmentRef,
    rfxInfoDS,
    rfx,
    customizeBtnGroup = noop,
    customizeTable = noop,
  } = props;

  const { sourceKey = 'INQUIRY' } = rfx || {};

  const getSourceNode = () => {
    const node = 'RELEASE';

    return node;
  };

  const fileTemplateAttachmentDs = useDataSet(
    () =>
      fileTemplateAttachmentDS({
        isNewRfx,
        rfxInfoDS,
        customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.ATTACHMENT_REQUIREMENT_TABLE`,
        node: getSourceNode(),
      }),
    [isNewRfx, rfxHeaderId, sourceKey]
  );

  const { rfxHeaderId } = rfxInfoDS?.current?.get(['rfxHeaderId']) || {};

  useEffect(() => {
    if (rfxHeaderId) {
      fileTemplateAttachmentDs.setQueryParameter('sourceId', rfxHeaderId);
      fileTemplateAttachmentDs.query();
    }
  }, [rfxHeaderId]);

  // 暴露子组件的api给父组件使用
  useImperativeHandle(bidFileTemplateAttachmentRef, () => ({
    fileTemplateAttachmentDs,
  }));

  // change attachment type
  const handleChangeAttachmentType = (value, record) => {
    const { uniqueKey, sourceNode, sourceNodeMeaning } = value || {};
    const templateId = rfxInfoDS?.current?.get('templateId') || {};
    record.set({ sourceNode, sourceNodeMeaning });
    if (!templateId || !uniqueKey) return;
    fetchAttTemplateDataByAttType({
      sourceCategory: 'RFX',
      templateId,
      attachmentType: uniqueKey,
    }).then((res) => {
      if (getResponse(res)) {
        const { attachmentType, ...others } = res || {}; // attachmentType 默认更新
        record.set(others);
      }
    });
  };

  // 生成附件
  const handleGenerateAttachment = (record) => {
    const { fileManageId, attachmentUuid, editableFlag } =
      record.get(['fileManageId', 'attachmentUuid', 'editableFlag']) || {};
    const sourceId = fileTemplateAttachmentDs.getQueryParameter('sourceId');

    if (!sourceId || sourceId === 'null' || !fileManageId) return;

    return generateAttTemplate({
      sourceId,
      fileManageId,
      sourceCategory: 'RFX',
      attachmentUuid: editableFlag === 1 ? undefined : attachmentUuid, // 注意：editableFlag为1 表示寻源模板上的附件要求【限制文件不可修改】= 1
    }).then((res) => {
      if (getResponse(res)) {
        notification.success();
        if (!record.get('attachmentUuid')) {
          record.set('attachmentUuid', res.attachmentUuid);
        } else {
          record.set('attachmentUuid', null);
          record.set('attachmentUuid', res.attachmentUuid);
          queryFileList({
            organizationId: getCurrentOrganizationId(),
            bucketName: PRIVATE_BUCKET,
            bucketDirectory: 'ssrc-template-requirement',
            attachmentUUID: res.attachmentUuid,
          }).then((fileList) => {
            if (getResponse(fileList)) {
              record.getField('attachmentUuid').setAttachmentCount(fileList?.length || 0);
            }
          });
        }
      }
    });
  };

  // table columns
  const columns = [
    {
      name: 'attachmentType',
      editor: (record) => {
        return (
          <Lov
            record={record}
            name="attachmentType"
            onChange={(value) => handleChangeAttachmentType(value, record)}
          />
        );
      },
    },
    {
      name: 'templateAttachment',
      renderer: ({ record }) => {
        const sourceId = fileTemplateAttachmentDs.getQueryParameter('sourceId');
        if (record.get('fileManageId')) {
          // 来自于寻源模板的招标文件管理中的
          return (
            <Button
              funcType="flat"
              wait={1200}
              disabled={!sourceId || sourceId === 'null'}
              onClick={() => handleGenerateAttachment(record)}
            >
              {intl
                .get('ssrc.inquiryHall.model.fileTemplateAttachment.generateAttachment')
                .d('生成附件')}
            </Button>
          );
        } else if (record.get('tempAttachmentUuid')) {
          // 来自于寻源模板的上传本地附件
          return (
            <Attachment
              record={record}
              name="tempAttachmentUuid"
              viewMode="popup"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-template-requirement"
              labelLayout="float"
              readOnly
            >
              {intl.get('hzero.common.upload.view').d('查看附件')}
            </Attachment>
          );
        }
        return null;
      },
    },
    { name: 'remark' },
    {
      name: 'attachmentUuid',
      editor: true,
    },
  ];

  // batch delete
  const handleBatchDeleteAttachment = () => {
    const selectedRecords = fileTemplateAttachmentDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.get('attachmentLineId')) || [];

    // 删除新增数据
    if (!isEmpty(addRecords)) {
      fileTemplateAttachmentDs.remove(addRecords);
    }

    if (!isEmpty(oldRecords)) {
      // 删除线上数据
      fileTemplateAttachmentDs.delete(oldRecords, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
    }
  };

  // 新增
  const handleAdd = () => {
    fileTemplateAttachmentDs.create({}, 0);
  };

  // 批量删除按钮、复制禁用逻辑
  const batchDisabledFlag = useMemo(() => {
    return (
      !fileTemplateAttachmentDs ||
      !fileTemplateAttachmentDs.selected?.length ||
      (!fileTemplateAttachmentDs.length && !fileTemplateAttachmentDs.cachedRecords?.length) ||
      fileTemplateAttachmentDs?.status === 'loading'
    );
  }, [
    fileTemplateAttachmentDs?.selected,
    fileTemplateAttachmentDs.length,
    fileTemplateAttachmentDs.cachedRecords?.length,
    fileTemplateAttachmentDs?.status,
  ]);

  // // 表格按钮
  const headerButtons = useMemo(() => {
    const buttons = [
      {
        name: 'delete',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.batchDelete`).d('批量删除'),
        disabled: batchDisabledFlag,
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          waitType: 'throttle',
          wait: 1200,
          onClick: handleBatchDeleteAttachment,
        },
      },
      {
        name: 'add',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.add').d('新增'),
        btnProps: {
          icon: 'add',
          funcType: 'flat',
          waitType: 'throttle',
          wait: 1200,
          onClick: handleAdd,
        },
      },
    ];
    return customizeBtnGroup(
      {
        code: `SSRC.${sourceKey}_HALL.NEW_EDIT.ATTACHMENT_REQUIREMENT_BUTTONS`,
        pro: true,
      },
      <DynamicButtons buttons={buttons} />
    );
  }, [handleAdd, handleBatchDeleteAttachment]);

  return (
    <>
      <div style={{ marginBottom: '4px' }}>{headerButtons}</div>
      {customizeTable(
        {
          code: `SSRC.${sourceKey}_HALL.NEW_EDIT.ATTACHMENT_REQUIREMENT_TABLE`,
          dataSet: fileTemplateAttachmentDs,
        },
        <Table dataSet={fileTemplateAttachmentDs} columns={columns} style={{ maxHeight: 450 }} />
      )}
    </>
  );
};

export default observer(FileTemplateAttachment);
