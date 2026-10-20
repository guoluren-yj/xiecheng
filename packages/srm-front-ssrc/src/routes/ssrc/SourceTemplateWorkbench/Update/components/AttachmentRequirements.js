import React, { useMemo, useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { isEmpty, noop } from 'lodash';

import { Alert } from 'choerodon-ui';
import { Table, Lov, IntlField, Attachment } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import Store from '../store/index';
import Style from '../../index.less';

const AttachmentRequirements = (props) => {
  const { setPageLoading = noop, initQuery = noop } = props;
  const {
    commonDs: { attachRequirementDs },
    getCustomizeUnitCode,
    customizeTable = noop,
  } = useContext(Store);

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    attachRequirementDs?.query();
  }, []);

  // change attachment type
  const handleChangeAttachmentType = (value, record) => {
    const { sourceNode, sourceNodeMeaning } = value || {};
    record.set({
      sourceNode,
      sourceNodeMeaning,
    });
  };

  // change file management
  const handleChangeFileManageId = (value, record) => {
    const tls = record?.get('_tls');
    const { remark, _tls = {} } = value || {};
    record.set({
      remark,
      _tls: {
        ...(tls || {}),
        ...(_tls || {}),
      },
    });
    if (!value) {
      record.set({
        editableFlag: 0,
      });
    }
  };

  // change attachment
  const onAttachmentsChange = (file, record) => {
    if (!file?.length) {
      record.set('attachmentUuid', null);
    }
  };

  // table columns
  const columns = useMemo(() => [
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
      name: 'attachmentUuid',
      editor: (record) => (
        <Attachment
          record={record}
          name="attachmentUuid"
          viewMode="popup"
          funcType="link"
          // multiple={false}
          labelLayout="float"
          onAttachmentsChange={(file) => onAttachmentsChange(file, record)}
        />
      ),
    },
    {
      name: 'fileManageId',
      editor: (record) => {
        return (
          <Lov
            record={record}
            name="fileManageId"
            onChange={(value) => handleChangeFileManageId(value, record)}
          />
        );
      },
    },
    {
      name: 'editableFlag',
      editor: true,
    },
    {
      name: 'remark',
      editor: (record) => <IntlField record={record} name="remark" />,
    },
    {
      name: 'requiredFlag',
      editor: true,
    },
    { name: 'sourceNodeMeaning' },
  ]);

  // batch delete
  const handleBatchDeleteAttachment = () => {
    const selectedRecords = attachRequirementDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.get('templateAttachmentId')) || [];

    // 删除新增数据
    attachRequirementDs.remove(addRecords);

    if (!isEmpty(oldRecords)) {
      setPageLoading(true);
      // 删除线上数据
      attachRequirementDs
        .delete(oldRecords, {
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
            .d('确认删除选中行？'),
        })
        .then(() => {
          initQuery().finally(() => setPageLoading(false));
        })
        .catch(() => setPageLoading(false));
    }
  };

  // table buttons
  const buttons = useMemo(() => ['add', ['delete', { onClick: handleBatchDeleteAttachment }]], [
    handleBatchDeleteAttachment,
  ]);

  return (
    <>
      <div className={Style['attachment-requirement-alert']}>
        <Alert
          showIcon
          message={intl
            .get('ssrc.sourceTemplate.view.message.attachmentRequirementsTips')
            .d('提示：模板附件支持上传本地文件或选择招标文件配置的模板，二种方式仅可选择其一。')}
          type="info"
          iconType="help"
          closable
          banner
          style={{ alignItems: 'center', marginBottom: '16px' }}
        />
      </div>
      {customizeTable(
        {
          code: getCustomizeUnitCode('attachmentRequirements'),
          dataSet: attachRequirementDs,
        },
        <Table dataSet={attachRequirementDs} columns={columns} buttons={buttons} />
      )}
    </>
  );
};

export default observer(AttachmentRequirements);
