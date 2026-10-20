import React, { Fragment } from 'react';
import { Form, Spin, TextArea } from 'choerodon-ui/pro';
import styles from '../index.less';

// 附件信息
const ApprovalInfo = (props) => {
  const { approvalInfoDs, customizeForm, editableFlag, pageFlags, location } = props;
  const { approveFlag, sqeApproveFlag } = pageFlags;

  return (
    <Fragment>
      <Spin dataSet={approvalInfoDs}>
        <div className={styles['form-info']}>
          {customizeForm(
            {
              code: null,
              __force_record_to_update__: true,
            },
            <Form
              useWidthPercent
              columns={1}
              style={{ padding: '0px' }}
              labelLayout="float"
              dataSet={approvalInfoDs}
            >
              {approveFlag && !location.pathname.includes('/pub') && (
                <TextArea name="approveMessage" resize="vertical" disabled={!editableFlag} />
              )}
              {sqeApproveFlag && (
                <TextArea name="recheckApproveMessage" resize="vertical" disabled={!editableFlag} />
              )}
            </Form>
          )}
        </div>
      </Spin>
    </Fragment>
  );
};

export default ApprovalInfo;
