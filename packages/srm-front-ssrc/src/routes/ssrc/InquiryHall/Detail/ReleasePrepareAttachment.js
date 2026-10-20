import React from 'react';
import { Attachment } from 'choerodon-ui/pro';

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { TopSection } from '_components/Section';
import CollapseForm from '_components/CollapseForm';

import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';

import FileTemplateAttachment from './components/FileTemplateAttachment';

export default function ReleasePrepareAttachment(props) {
  const {
    customizeCollapseForm,
    ReleasePrepareAttachmentDS,
    viewOnly = false,
    rfx = {},
    getHocInstance = null,
    isSection = false,
    fileTemplateManageFlag, // 是否启用招标文件管理标识
    header,
    remote,
    ...otherProps
  } = props;
  const { unitCodeSymbol } = rfx || {};

  const file = {
    name: 'file',
    title: <div>{intl.get('ssrc.common.attachment').d('附件')}</div>,
    content: (
      <>
        {fileTemplateManageFlag !== -1 &&
          (fileTemplateManageFlag ? (
            <FileTemplateAttachment {...props} />
          ) : (
            customizeCollapseForm(
              {
                code: `SSRC.${unitCodeSymbol}_DETAIL.ATTACHMENT`,
                dataSet: ReleasePrepareAttachmentDS,
              },
              <CollapseForm
                dataSet={ReleasePrepareAttachmentDS}
                showLines={6}
                columns={2}
                labelLayout="float"
                code="fileForm"
                useWidthPercent
              >
                <Attachment
                  name="businessAttachmentUuid"
                  readOnly={viewOnly}
                  data={{
                    tenantId: getCurrentOrganizationId(),
                  }}
                  {...otherProps}
                />
                <Attachment
                  name="techAttachmentUuid"
                  readOnly={viewOnly}
                  data={{
                    tenantId: getCurrentOrganizationId(),
                  }}
                  {...otherProps}
                />
              </CollapseForm>
            )
          ))}
      </>
    ),
  };

  let content = (
    <TopSection
      title={() => <div>{intl.get('ssrc.common.attachment').d('附件')}</div>}
      code={`SSRC.${unitCodeSymbol}_DETAIL.ATTACHMENT_CARD`}
      getHocInstance={getHocInstance}
      className={
        isSection ? styles['detail-file-card-content-section'] : styles['detail-file-card-content']
      }
      // id="attachments"
    >
      {file.content}
    </TopSection>
  );

  content = remote
    ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_FILE_RENDER_DATA_OBJECT', content, {
        that: this,
        data: file,
      })
    : content;

  return <div id="attachments">{content}</div>;
}
