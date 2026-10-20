/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-07-09 17:34:01
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2024-05-28 17:20:40
 */
import React, { Component, Fragment } from 'react';
import { DataSet, Form, Output } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import { ChangeDocumentDS } from './BaseInfoDS';

export default class baseInfo extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.FormDS = new DataSet(ChangeDocumentDS(props.documentTypeName));
  }

  componentDidMount() {
    const { header, onFormLoaded } = this.props;
    if (onFormLoaded && typeof onFormLoaded === 'function') {
      onFormLoaded(true);
    }
    this.FormDS.loadData([header.rfxHeaderBaseInfoAdjustDTO]);
  }

  @Bind()
  getClassName(field) {
    const { header = {}, currentMode } = this.props;
    const { adjustFields = [] } = header?.rfxHeaderBaseInfoAdjustDTO || {};
    let className = '';
    if (adjustFields?.includes(field)) {
      if (currentMode === 'current') {
        className = 'changeAfter';
      } else if (currentMode === 'history') {
        className = 'changeBefore';
      }
    }
    return className;
  }

  render() {
    const { customizeForm, custLoading, currentMode, custKey = '' } = this.props;
    return (
      <Fragment>
        {customizeForm(
          {
            code:
              currentMode === 'history'
                ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.BASE_INFO_HIS`
                : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.BASE_INFO_READONLY`,
          },
          <Form
            dataSet={this.FormDS}
            labelLayout="vertical"
            columns={3}
            custLoading={custLoading}
            className="c7n-pro-vertical-form-display"
          >
            <Output disabled name="rfxTitle" className={this.getClassName('rfxTitle')} />
            <Output name="budgetAmount" />
            <Output name="templateName" />
            <Output name="adjustRemark" />
            <Output name="adjustAttachmentUuid" />
            {/* <Attachment
              readOnly
              className={style.c7nUpload}
              fileSize={FIlESIZE}
              name="adjustAttachmentUuid"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-prequal"
              viewMode="popup"
            /> */}
            )
            <Output name="rfxRemark" className={this.getClassName('rfxRemark')} />
          </Form>
        )}
      </Fragment>
    );
  }
}
