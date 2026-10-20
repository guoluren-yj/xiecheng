import React, { PureComponent } from 'react';
import { Row, Col } from 'hzero-ui';
import { Form, TextField } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { FORM_COL_3_LAYOUT } from 'utils/constants';

export default class HeaderInfoForm extends PureComponent {
  render() {
    const { customizeForm, headerInfoDs = {}, sourceKey } = this.props;

    return (
      <div>
        <Row>
          <Col
            {...FORM_COL_3_LAYOUT}
            style={{ fontWeight: 600, fontSize: '16px', marginBottom: '16px' }}
          >
            {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
          </Col>
        </Row>
        {customizeForm(
          {
            code: `SSRC.${sourceKey}_HALL.BARGAIN.BASEINFO_FORM`,
            dataSet: headerInfoDs,
          },
          <Form dataSet={headerInfoDs} columns={3} labelLayout="float">
            <TextField name="rfxNum" />
            <TextField name="rfxTitle" />
          </Form>
        )}
      </div>
    );
  }
}
