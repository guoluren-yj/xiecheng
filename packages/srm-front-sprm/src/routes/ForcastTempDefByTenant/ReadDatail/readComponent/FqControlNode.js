import React, { useContext } from 'react';
import { Output, Form, Row, Col } from 'choerodon-ui/pro';
import { Store } from '../../Detail/stores';
import styles from './index.less';

const FqControlNode = function FqControlNode() {
  const { headerDs } = useContext(Store);

  return (
    <Row>
      <Col span={18}>
        <Form
          dataSet={headerDs}
          labelAlign="left"
          columns={1}
          useColon={false}
          labelWidth={260}
          useWidthPercent
          className={styles['form-select-box']}
        >
          {/* <SelectBox name="deliverControlType" disabled vertical /> */}
          <Output name="deliverControlType" vertical disabled showHelp="label" />

          {/* <Output name='needFeedback' renderer={({ value }) => value === 1 ? intl.get(`${commonPrompt}.need`).d('需要') : intl.get(`${commonPrompt}.notNeed`).d('不需要')} />
      <Output name='feedbackAutoFill' renderer={({ value }) => value === 1 ? intl.get(`${commonPrompt}.equal`).d('等于') : intl.get(`${commonPrompt}.notEqual`).d('不等于')} />
      <Output name='offlineInputFlag' renderer={({ value }) => value === 1 ? intl.get(`${commonPrompt}.need`).d('需要') : intl.get(`${commonPrompt}.notNeed`).d('不需要')} />
      <Output name='detailFeedbackFlag' renderer={({ value }) => value === 1 ? intl.get('hzero.common.button.yes').d('是') : intl.get('hzero.common.button.no').d('否')} />
      <Output name="feedbackChangeCnf" vertical />
      <Output name="feedbackApprovalMethod" vertical disabled />
      <Output name="feedbackSyncFlag" renderer={({ val */}
          {/* <SelectBox name="deliverControlNode" disabled vertical /> */}
        </Form>
      </Col>
    </Row>
  );
};

export default FqControlNode;
