import React, { Component } from 'react';
import { TextField, TextArea, Select, Form, Row, Col, IntlField } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();
@formatterCollections({ code: ['smbl.purchaseRobotConfig', 'hzero.common', 'smbl.common'] })
export default class BasicInfo extends Component {
  render() {
    const { canEdit } = this.props;
    return (
      <Row code="basicInfo">
        <Col>
          {!canEdit ? (
            <Form
              dataSet={this.props.skillBasicInfoDataSet}
              columns={4}
              labelLayout="float"
              useColon={false}
            >
              <TextField name="skillName" readOnly border={false} />
              <TextField name="skillCode" readOnly border={false} />
              <TextField name="skillObjectMeaning" readOnly border={false} />
              <TextField name="skillTypeMeaning" readOnly border={false} />
              <TextArea
                name="remark"
                colSpan={2}
                readOnly
                border={false}
                renderer={({ value }) => value || '-'}
              />
              <TextField
                name="tenantId"
                colSpan={2}
                readOnly
                border={false}
                renderer={({ value }) => {
                  if (!value && value !== 0) {
                    return intl
                      .get('smbl.purchaseRobotConfig.model.skillSource.preDefine')
                      .d('预定义');
                  }
                  return Number(value) === Number(organizationId)
                    ? intl.get('smbl.purchaseRobotConfig.model.skillSource.selfDefine').d('自定义')
                    : intl.get('smbl.purchaseRobotConfig.model.skillSource.preDefine').d('预定义');
                }}
              />
            </Form>
          ) : (
            <Form
              dataSet={this.props.skillBasicInfoDataSet}
              columns={4}
              labelLayout="float"
              useColon={false}
            >
              <IntlField name="skillName" disabled={!this.props.canEdit} />
              <TextField
                restrict="A-Za-z-_"
                name="skillCode"
                disabled={!this.props.canEdit || this.props.skillId}
              />
              <Select name="skillObjectLov" disabled={!this.props.canEdit || this.props.skillId} />
              <Select name="skillTypeLov" disabled={!this.props.canEdit || this.props.skillId} />
              <IntlField
                name="remark"
                type="multipleLine"
                disabled={!this.props.canEdit}
                colSpan={2}
                rows={4}
                resize="none"
              />
              <TextField
                name="tenantId"
                colSpan={2}
                readOnly
                border={false}
                renderer={({ value }) => {
                  if (!value && value !== 0) {
                    return intl
                      .get('smbl.purchaseRobotConfig.model.skillSource.preDefine')
                      .d('预定义');
                  }
                  return Number(value) === Number(organizationId)
                    ? intl.get('smbl.purchaseRobotConfig.model.skillSource.selfDefine').d('自定义')
                    : intl.get('smbl.purchaseRobotConfig.model.skillSource.preDefine').d('预定义');
                }}
              />
            </Form>
          )}
        </Col>
      </Row>
    );
  }
}
