/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-07-09 17:34:01
 * @LastEditors: wangmiao
 * @LastEditTime: 2021-10-27 16:21:54
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Form, TextField, Attachment, TextArea } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';

import intl from 'utils/intl';
// import Upload from '_components/C7NUpload';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
// import { getCurrentOrganizationId } from 'utils/utils';

import { ChangeDocumentDS } from './BaseInfoDS';
import { ComponentDiffRender } from './utils';

export default class baseInfo extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.FormDS = new DataSet(ChangeDocumentDS(props.documentTypeName));
  }

  initDSFields(result = []) {
    this.FormDS.loadData(result);
    this.forceUpdate();
  }

  render() {
    const { customizeForm, custLoading, custKey } = this.props;
    return (
      <Fragment>
        {customizeForm(
          {
            code: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.BASE_INFO`,
            dataSet: this.FormDS,
          },
          <Form
            dataSet={this.FormDS}
            labelLayout="float"
            columns={3}
            custLoading={custLoading}
            useWidthPercent
          >
            <ComponentDiffRender
              record={this.FormDS?.current}
              historyDTO="rfxHeaderBaseInfoDTO"
              name="rfxTitle"
            >
              <TextField name="rfxTitle" style={{ width: '100%' }} />
            </ComponentDiffRender>
            <TextField name="budgetAmount" disabled />
            <TextField name="templateName" disabled />
            <TextField name="adjustRemark" />
            <Attachment
              name="adjustAttachmentUuid"
              fileSize={FIlESIZE}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-prequal"
              viewMode="popup"
              label={intl.get(`hzero.common.upload.modal.title`).d('附件')}
              labelLayout="float"
              {...ChunkUploadProps}
            />
            <ComponentDiffRender
              record={this.FormDS?.current}
              historyDTO="rfxHeaderBaseInfoDTO"
              name="rfxRemark"
            >
              <TextArea name="rfxRemark" style={{ width: '100%' }} resize />
            </ComponentDiffRender>
          </Form>
        )}
      </Fragment>
    );
  }
}
