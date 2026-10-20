import React, { Component } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import styles from '../index.less';

export default class PcnHeaderInfo extends Component {
  render() {
    const { formDs, customizeForm, pageFlags } = this.props;
    const { searchFlag, approveFlag, sqeApproveFlag } = pageFlags;

    return (
      <div className={styles['form-info']}>
        {customizeForm(
          {
            code: 'SIEC.PCN_MANAGEWORK_BENCH_DETAI.WORKS.HEADER',
            __force_record_to_update__: true,
          },
          <Form useWidthPercent dataSet={formDs} columns={3} labelLayout="float">
            <Output name="pcnNum" />
            <Output name="statusCodeMeaning" />
            <Output name="creationDate" />
            <Output name="changeCategory" />
            <Output name="supplierPrincipal" />
            <Output name="principalContact" />
            <Output name="principalEmail" />
            <Output name="companyName" />
            <Output name="supplierCompanyName" />
            <Output name="effectiveDate" />
            <Output name="typeName" />
            {(searchFlag || sqeApproveFlag) && <Output name="evaluationOpinion" />}
            <Output name="remark" resize="vertical" newLine />
            {(searchFlag || approveFlag || sqeApproveFlag) && <Output name="finalEffectiveDate" />}
            <Output name="changeResson" newLine colSpan={3} resize="vertical" />
            <Output name="changeContent" newLine colSpan={3} resize="vertical" />
          </Form>
        )}
      </div>
    );
  }
}
