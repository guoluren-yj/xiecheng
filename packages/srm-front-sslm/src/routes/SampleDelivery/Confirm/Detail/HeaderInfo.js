/**
 * 送样申请确认/我发出的送样申请/我收到的送样申请 基础信息组件公用
 */
import React from 'react';
import { Form, Output, TextField, Lov, TelField } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';

/**
 * entry 判断入口
 * entry === "confirm"  送样申请确认
 * entry === "received" 我发出的送样申请
 * entry === "send" 我收到的送样申请
 * reqStatus 申请单状态
 */
const HeaderInfo = ({
  dataSet,
  isDisable,
  customizeForm = () => {},
  custLoading = false,
  isSupplierFlag = false,
  code = '',
  tenantId,
}) => {
  return customizeForm(
    {
      code,
    },
    !isSupplierFlag ? (
      <Form dataSet={dataSet} columns={3} custLoading={custLoading} labelAlign="left">
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
        <Output name="sampleSendAddress" />
        <Output name="needFeedbackFlag" renderer={({ value }) => yesOrNoRender(value)} />
        <Output name="confirmationFlag" renderer={({ value }) => yesOrNoRender(value)} />
        {isDisable ? <Output name="confirmRemark" /> : <TextField name="confirmRemark" />}
        <Output name="remark" />
        <Output
          name="sampleAttachmentUuid"
          renderer={() => (
            <Upload
              viewOnly={isDisable}
              tenantId={tenantId}
              bucketName={PRIVATE_BUCKET}
              attachmentUUID={dataSet.current && dataSet.current.get('sampleAttachmentUuid')}
              afterOpenUploadModal={attUuid => {
                dataSet.current.set('sampleAttachmentUuid', attUuid);
              }}
              filePreview
            />
          )}
        />
        <Output name="documentSource" />
      </Form>
    ) : (
      <Form
        dataSet={dataSet}
        columns={3}
        custLoading={custLoading}
        className="addon-before-style"
        labelAlign="left"
      >
        <Output name="reqNum" />
        <Output name="reqUserName" />
        <Output name="reqStatus" />
        <Output name="companyName" />
        {isDisable ? <Output name="ou" /> : <Lov name="ou" noCache />}
        {isDisable ? <Output name="organization" /> : <Lov name="organization" noCache />}
        <Output name="supplierName" />
        <Output name="supplierTypeCodeMeaning" />
        <Output name="creationDate" />
        <Output name="originFactoryName" />
        <Output name="typeCodeMeaning" />
        <Output name="urgencyDegreeMeaning" />
        {isDisable ? <Output name="recUserName" /> : <TextField name="recUserName" />}
        {isDisable ? <Output name="recUserPhone" /> : <TelField name="recUserPhone" />}
        <Output name="reqUserPhone" />
        {isDisable ? <Output name="receiveUnitLov" /> : <Lov name="receiveUnitLov" noCache />}
        {isDisable ? <Output name="sampleSendAddress" /> : <TextField name="sampleSendAddress" />}
        {isDisable ? <Output name="confirmRemark" /> : <TextField name="confirmRemark" />}
        {isDisable ? <Output name="remark" /> : <TextField name="remark" />}
        <Output
          name="sampleAttachmentUuid"
          renderer={() => (
            <Upload
              viewOnly={isDisable}
              tenantId={tenantId}
              bucketName={PRIVATE_BUCKET}
              attachmentUUID={dataSet.current && dataSet.current.get('sampleAttachmentUuid')}
              afterOpenUploadModal={attUuid => {
                dataSet.current.set('sampleAttachmentUuid', attUuid);
              }}
              filePreview
            />
          )}
        />
      </Form>
    )
  );
};

export default HeaderInfo;
