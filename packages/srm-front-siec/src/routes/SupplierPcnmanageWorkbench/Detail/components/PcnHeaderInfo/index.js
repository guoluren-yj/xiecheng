import React, { Component } from 'react';
import { Form, TextField, TextArea, DatePicker, Select, Lov } from 'choerodon-ui/pro';
// import Upload from '_components/C7NUpload';
// import { BUCKET_NAME, BUCKET_DIRECTORY } from '@/routes/components/utils/constant';
// import intl from 'utils/intl';
// import { colorRender } from '@/routes/components/utils/index';
import styles from '../../index.less';

export default class PcnHeaderInfo extends Component {
  render() {
    const { editableFlag, formDs, pageFlags, customizeForm, attachmentInfoDs } = this.props;
    const { searchFlag, approveFlag, sqeApproveFlag } = pageFlags;
    const creatFlag = !(searchFlag || approveFlag || sqeApproveFlag); // 新建页面标识
    const currentEditableFlag = editableFlag && creatFlag;

    return (
      <div className={styles['form-info']}>
        {customizeForm(
          {
            code: 'SIEC.SUPPIER_PCN_MANAGEWORK_BENCH_DETAI.HEADER',
            dataSet: formDs,
          },
          <Form useWidthPercent dataSet={formDs} columns={3} labelLayout="float">
            <TextField name="pcnNum" />
            <TextField name="statusCodeMeaning" />
            <DatePicker name="creationDate" />
            <Select name="changeCategory" disabled={!currentEditableFlag} />
            <TextField name="supplierPrincipal" disabled={!currentEditableFlag} />
            <TextField name="principalContact" disabled={!currentEditableFlag} />
            <TextField name="principalEmail" disabled={!currentEditableFlag} />
            <Lov name="companyLOV" disabled={!currentEditableFlag} />
            <Lov name="supplierCompanyLOV" disabled={!currentEditableFlag} />
            <DatePicker name="effectiveDate" disabled={!currentEditableFlag} />
            <Lov
              name="typeLOV"
              disabled={!currentEditableFlag}
              onChange={(e) => {
                // eslint-disable-next-line no-unused-expressions
                attachmentInfoDs?.current?.set({
                  attachmentUuidTemplate: e?.attachmentUuidTemplate || null,
                });
              }}
            />
            {/* <Output
              name="attachmentUuidTemplate"
              renderer={({ record }) => (
                <Upload
                  viewOnly
                  bucketName={BUCKET_NAME}
                  bucketDirectory={BUCKET_DIRECTORY}
                  name="attachmentUuidTemplate"
                  record={record}
                  label={intl
                    .get(`siec.pcnmanageWorkbench.view.attachmentUuidTemplate`)
                    .d('附件模板')}
                />
              )}
            />
            <Output
              name="supplierAttachmentUuid"
              renderer={({ record }) => (
                <Upload
                  viewOnly={!currentEditableFlag}
                  name="supplierAttachmentUuid"
                  bucketName={BUCKET_NAME}
                  bucketDirectory={BUCKET_DIRECTORY}
                  record={record}
                  label={intl
                    .get(`siec.pcnmanageWorkbench.view.supplierAttachmentUuid`)
                    .d('供应商附件')}
                />
              )}
            /> */}
            {(searchFlag || sqeApproveFlag) && (
              <Select name="evaluationOpinion" disabled={!editableFlag || !sqeApproveFlag} />
            )}
            <TextArea name="remark" disabled={!currentEditableFlag} resize="vertical" newLine />
            {/* {(searchFlag || approveFlag || sqeApproveFlag) && (
              <Output
                name="attachmentUuid"
                renderer={({ record }) => (
                  <Upload
                    viewOnly={!editableFlag && !(approveFlag || sqeApproveFlag)}
                    name="attachmentUuid"
                    bucketName={BUCKET_NAME}
                    bucketDirectory={BUCKET_DIRECTORY}
                    record={record}
                    label={intl.get(`siec.pcnmanageWorkbench.view.attachmentUuid`).d('采购方附件')}
                  />
                )}
              />
            )} */}
            {(searchFlag || approveFlag || sqeApproveFlag) && (
              <DatePicker name="finalEffectiveDate" disabled={searchFlag || !editableFlag} />
            )}
            <TextArea
              name="changeResson"
              disabled={!currentEditableFlag}
              newLine
              colSpan={3}
              resize="vertical"
            />
            <TextArea
              name="changeContent"
              disabled={!currentEditableFlag}
              newLine
              colSpan={3}
              resize="vertical"
            />
          </Form>
        )}
      </div>
    );
  }
}
