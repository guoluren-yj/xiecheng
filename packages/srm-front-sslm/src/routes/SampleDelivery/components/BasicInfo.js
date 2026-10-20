/**
 * 我发出的送样申请/我收到的送样申请 基础信息组件公用
 */
import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * reqStatus 申请单状态
 * code 个性化单元编码
 */
const BasicInfo = ({
  formDs,
  reqStatus = '',
  code = '',
  customizeForm = () => {},
  custLoading = false,
  isShowConfirmation = false,
  isSupplierFlag = true,
}) => {
  return customizeForm(
    {
      code,
    },
    <Form dataSet={formDs} columns={3} custLoading={custLoading} labelAlign="left">
      <Output name="reqNum" />
      <Output name="reqUserName" />
      <Output name="reqStatus" />
      <Output name="companyName" />
      <Output name="ouName" />
      <Output name="organizationName" />
      <Output name="supplierName" />
      <Output name="supplierTypeCodeMeaning" />
      <Output name="creationDate" />
      <Output name="originFactoryName" />
      <Output name="typeCodeMeaning" />
      <Output name="urgencyDegreeMeaning" />
      <Output name="recUserName" />
      <Output name="recUserPhone" />
      <Output name="reqUserPhone" />
      <Output name="receiveUnitName" />
      <Output name="needFeedbackFlag" renderer={({ value }) => yesOrNoRender(value)} />
      {isShowConfirmation && (
        <Output name="confirmationFlag" renderer={({ value }) => yesOrNoRender(value)} />
      )}
      <Output name="sampleSendAddress" />
      {!['NEW', 'PUBLISHED', 'RELEASE_REJECT', 'RELEASE_APPROVING'].includes(reqStatus) && (
        <Output name="confirmRemark" />
      )}
      <Output name="remark" />
      <Output
        name="sampleAttachmentUuid"
        renderer={() => (
          <Upload
            viewOnly
            tenantId={organizationId}
            bucketName={PRIVATE_BUCKET}
            attachmentUUID={formDs.current && formDs.current.get('sampleAttachmentUuid')}
            filePreview
          />
        )}
      />
      <Output name="documentSource" hidden={isSupplierFlag} />
    </Form>
  );
};

export default BasicInfo;
