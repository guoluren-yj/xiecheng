import React from 'react';
import { Attachment, Row, Col, Form } from 'choerodon-ui/pro';
import { noop } from 'lodash';
// import classnames from 'classnames';

import CollapseForm from '_components/CollapseForm';

// import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import PageStyles from '../index.less';

export default function Attachments(props) {
  const {
    customizeCollapseForm = noop,
    headerInfoDS,
    // viewOnly = false,
    // getCustomizeUnitCode = noop,
    // isBidSectionData,
    // custLoading,
    sourceKey = '',
    custLoading,
  } = props;

  return (
    <>
      <div className={PageStyles['ssrc-price-clarification-editor-attachments-wrap']}>
        {customizeCollapseForm(
          {
            code: `SSRC.${sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_DETAIL_ATTACHMENTS`,
            dataSet: headerInfoDS,
            gutter: 8,
          },
          <CollapseForm
            dataSet={headerInfoDS}
            labelLayout="float"
            layout="none"
            showLines={1}
            columns={3}
            custLoading={custLoading}
            firstShowFields={['businessAttachmentUuid']}
          >
            <Row gutter={8}>
              <Col span={8}>
                <Form.Item>
                  <Attachment name="businessAttachmentUuid" readOnly />
                </Form.Item>
              </Col>
            </Row>
          </CollapseForm>
        )}
      </div>
    </>
  );
}
