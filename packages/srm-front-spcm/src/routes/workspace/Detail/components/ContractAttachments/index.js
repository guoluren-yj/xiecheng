import React, { useImperativeHandle } from 'react';
import { Form, Attachment as C7nAttachment, useDataSet } from 'choerodon-ui/pro';
import { TopSection, SecondSection } from '_components/Section';
import intl from 'utils/intl';
import { getCurrentUserId } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import AttachmentGroup from './AttachmentGroup';
import {
  purchaserAttachmentDS,
  archiveAttachmentDS,
  esignAttachmentDS,
  offlineMutualSignDS,
  customAttachmentDS,
} from './AttachmentDS';
import styles from './index.less';

const currentUserId = getCurrentUserId();

const ContractAttachments = (props) => {
  const {
    customizeForm,
    headerFormDs,
    templateListFlag,
    attachmentProps,
    uploadProps = {},
    electricSignAttachmentProps,
    showSignAttachement,
    handleSaveUuid,
    getHocInstance,
    custCode,
    attachmentRef,
    intelligentBlock,
    custCardCode,
    remoteWorkDetail,
    parentDs,
    showTextMode,
    isBlacklistTenant,
  } = props;

  const headerInfo = headerFormDs?.current?.toJSONData() || {};

  const {
    pcStatusCode,
    archiveAttachmentUuid,
    supplementFlag,
    electricSignFlag,
    enabledArchiveFlag,
    createdBy,
    enableWhiteSettingFlag, // 配置表《协议新功能白名单》增加一项配置【归档后不能上传文件】,0:不在白名单，1:在白名单
  } = headerInfo;

  /**
   * 附件要有自己的源数据，不要直接用headerFormDs，如果协议头个性化单元和附件个性化单元中同时配置了同一字段，
   * 协议头上个性化字段配置的显示/编辑/必输，会影响到附件的个性化字段显示/编辑/必输。
   * 所以将下面五类附件各自拆分出自己独立的源。
   */
  const purchaserAttachmentDs =
    parentDs || useDataSet(() => purchaserAttachmentDS(headerInfo, headerFormDs), []);
  const archiveAttachmentDs =
    parentDs || useDataSet(() => archiveAttachmentDS(headerInfo, headerFormDs), []);
  const esignAttachmentDs =
    parentDs || useDataSet(() => esignAttachmentDS(headerInfo, headerFormDs), []);
  const offlineMutualSignDs =
    parentDs || useDataSet(() => offlineMutualSignDS(headerInfo, headerFormDs), []);
  const customAttachmentDs =
    parentDs || useDataSet(() => customAttachmentDS(headerInfo, headerFormDs), []);

  if (attachmentRef) {
    useImperativeHandle(
      attachmentRef,
      () => ({
        purchaserAttachmentDs,
        archiveAttachmentDs,
        esignAttachmentDs,
        offlineMutualSignDs,
        customAttachmentDs,
      }),
      [
        purchaserAttachmentDs,
        archiveAttachmentDs,
        esignAttachmentDs,
        offlineMutualSignDs,
        customAttachmentDs,
      ]
    );
  }

  const { bucketName, bucketDirectory } = uploadProps;

  const newElectricSignAttachmentProps = remoteWorkDetail
    ? remoteWorkDetail.process(
        'SPCM_WORKSPACE_DETAIL_ATTACHMENT_ELECSIGNPROPS',
        electricSignAttachmentProps,
        {
          currentProps: props,
        }
      )
    : electricSignAttachmentProps;


  const newShowSignAttachement = remoteWorkDetail
    ? remoteWorkDetail.process(
      'SPCM_WORKSPACE_DETAIL_ATTACHMENT_SHOWSIGNATTSCHMENT',
      showSignAttachement,
      {
        currentProps: props,
      }
    )
    : showSignAttachement;


  const newAttachmentProps = remoteWorkDetail
    ? remoteWorkDetail.process(
        'SPCM_WORKSPACE_DETAIL_ATTACHMENT_ATTACHMENTPROPS',
        attachmentProps,
        {
          currentProps: props,
        }
      )
    : attachmentProps;

  const newUploadProps = remoteWorkDetail
    ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_ATTACHMENT_UPLOADPROPS', uploadProps, {
        currentProps: props,
      })
    : uploadProps;

  const {
    viewOnly,
    fileMaxNum,
    fileType = '',
    afterOpenUploadModal,
    ...otherProps
  } = newElectricSignAttachmentProps;
  const commonProps = {
    accept: fileType?.split(',') || [],
    max: fileMaxNum,
  };
  const toBeSignedProps = {
    ...otherProps,
    ...commonProps,
    name: 'pcHeaderElectronicSignatureAttachment',
    readOnly: viewOnly,
    label: intl.get(`spcm.common.attachment.toBeSigned`).d('待签署附件'),
  };

  const signedProps = {
    ...otherProps,
    ...commonProps,
    name: 'pcHeaderElectronicSignatureAttachmentIsSigned',
    readOnly: true,
    label: intl.get(`spcm.common.attachment.Signed`).d('已签署附件'),
  };

  const isShowArchive = pcStatusCode === 'ARCHIVE' || archiveAttachmentUuid;

  /**
   * 条件1:非补充协议且非电签且状态=待生效/生效审批中/已归档/归档审批中/补充协议中/已确认
   * 条件2:补充协议且非电签且状态=补充完成/待生效/生效审批中
   * 满足条件1或条件2的协议，只读页面需要展示线下签署协议附件
   */
  const isShowOfflineMutual =
    !electricSignFlag &&
    ((supplementFlag && pcStatusCode === 'SUPPLEMENT_COMPLETE') ||
      (!supplementFlag &&
        ['ARCHIVE', 'ARCHIVE_TO_APPROVAL', 'REPLENISHING', 'CONFIRMED'].includes(pcStatusCode)) ||
      ['TO_BE_VALID', 'EFFECTED_TO_APPROVAL'].includes(pcStatusCode));

  const attachmentGroupProps = {
    ...newAttachmentProps,
    custCode,
    customizeForm,
    bucketName,
    bucketDirectory,
    headerFormDs,
    customAttachmentDs,
    showTextMode,
    isBlacklistTenant,
  };

  const attachmentBlock = (type) => {
    switch (type) {
      case 'PURCHASER_ATTACHMENT':
        return customizeForm(
          {
            code: custCode?.PURCHASER_ATTACHMENT,
          },
          <Form
            dataSet={purchaserAttachmentDs}
            labelLayout="float"
            columns={1}
            className={styles.formWrapper}
          >
            <C7nAttachment
              {...newUploadProps}
              readOnly={newUploadProps?.viewOnly}
              name="purchaserAttachmentUuid"
              onChange={(uuid) => handleSaveUuid(uuid)}
            />
            {remoteWorkDetail
              ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_ATTACHMENT_PURCHASERATTACHMENT', null, {
                  currentProps: props,
                  newUploadProps,
                  purchaserAttachmentDs,
                })
              : null}
          </Form>
        );
      case 'ARCHIVE_ATTACHMENT':
        return customizeForm(
          {
            code: custCode?.ARCHIVE_ATTACHMENT,
          },
          <Form
            dataSet={archiveAttachmentDs}
            labelLayout="float"
            columns={1}
            className={styles.formWrapper}
          >
            <C7nAttachment
              readOnly={
                enabledArchiveFlag !== 1 ||
                createdBy !== currentUserId ||
                enableWhiteSettingFlag !== '0'
              }
              name="archiveAttachmentUuid"
              onUploadSuccess={() => archiveAttachmentDs.submit()}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="spcm-supplier"
            />
          </Form>
        );
      case 'ESIGN_ATTACHMENT':
        return customizeForm(
          {
            code: custCode?.ESIGN_ATTACHMENT,
          },
          <Form
            dataSet={esignAttachmentDs}
            labelLayout="float"
            columns={1}
            className={styles.formWrapper}
          >
            <C7nAttachment {...toBeSignedProps} onChange={(uuid) => afterOpenUploadModal(uuid)} />
            <C7nAttachment {...signedProps} />
          </Form>
        );
      case 'OFFLINE_MUTUAL_ATTACHMENT':
        return customizeForm(
          {
            code: custCode?.OFFLINE_MUTUAL_ATTACHMENT,
          },
          <Form
            dataSet={offlineMutualSignDs}
            labelLayout="float"
            columns={1}
            className={styles.formWrapper}
          >
            <C7nAttachment readOnly bucketName={PRIVATE_BUCKET} name="offlineMutualSignUuid" />
          </Form>
        );
      case 'CUSTOM_ATTACHMENT':
        return customizeForm(
          {
            code: custCode?.CUSTOM_ATTACHMENT,
          },
          <AttachmentGroup {...attachmentGroupProps} />
        );
      default:
        return null;
    }
  };

  if (intelligentBlock) {
    return attachmentBlock(intelligentBlock);
  }

  return (
    <div className={styles['spcm-attachment']}>
      <TopSection
        code={custCardCode?.ATTACHMENTCARD1 || 'SPCM.WORKSPACE_DETAIL.ATTACHMENT_CARD'}
        getHocInstance={getHocInstance}
        className={styles.topSectionWrapper}
      >
        <SecondSection
          key="purchaserAttachment"
          code="SPCM.WORKSPACE_DETAIL.PURCHASER_ATTACHMENT"
          title={intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件')}
        >
          {attachmentBlock('PURCHASER_ATTACHMENT')}
        </SecondSection>
        {isShowArchive && (
          <SecondSection
            key="archiveAttachment"
            code="SPCM.WORKSPACE_DETAIL.ARCHIVE_ATTACHMENT"
            title={intl.get(`spcm.common.attachmentUuid`).d('归档文件')}
          >
            {attachmentBlock('ARCHIVE_ATTACHMENT')}
          </SecondSection>
        )}
      </TopSection>
      <div className={styles['spcm-attachmentInfo-divider']} />
      <TopSection
        code={custCardCode?.ATTACHMENTCARD2 || 'SPCM.WORKSPACE_DETAIL.ATTACHMENT_CARD2'}
        getHocInstance={getHocInstance}
        className={styles.topSectionWrapper}
      >
        {newShowSignAttachement && (
          <SecondSection
            key="electronicSignatureAttachment"
            code="SPCM.WORKSPACE_DETAIL.ESIGN_ATTACHMENT"
            title={intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件')}
          >
            {attachmentBlock('ESIGN_ATTACHMENT')}
          </SecondSection>
        )}
        {templateListFlag && (
          <SecondSection
            code="SPCM.WORKSPACE_DETAIL.CUSTOM_ATTACHMENT"
            key="customAttachment"
            title={intl.get(`entity.attachment.tag.spcm`).d('附件')}
          >
            {attachmentBlock('CUSTOM_ATTACHMENT')}
          </SecondSection>
        )}
        {isShowOfflineMutual && (
          <SecondSection
            code="SPCM.WORKSPACE_DETAIL.OFFLINE_MUTUAL_ATTACHMENT"
            key="offlineMutualSign"
            title={intl.get(`spcm.common.model.offlineMutualSignUuid`).d('线下双方签章文件')}
          >
            {attachmentBlock('OFFLINE_MUTUAL_ATTACHMENT')}
          </SecondSection>
        )}
      </TopSection>
    </div>
  );
};

export default ContractAttachments;
