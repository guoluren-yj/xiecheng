import React, { Component } from 'react';
import { Form, DataSet, Row, Col, Output, Attachment, TextArea } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty, isFunction } from 'lodash';
import intl from 'utils/intl';

import formatterCollections from 'utils/intl/formatterCollections';
import { PRIVATE_BUCKET } from '_utils/config';
import { dateTimeRender } from 'utils/renderer';

import { ChunkUploadProps } from '@/utils/SsrcRegx';
import { PrequalificationDS } from './PrequalificationDS';

import style from './index.less';

const promptCode = 'ssrc.quoController';

@formatterCollections({
  code: ['ssrc.quoController', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.biddingHall'],
})
export default class PreQualification extends Component {
  constructor(props) {
    super(props);
    if (props.getPreQualification) {
      props.getPreQualification(this);
    }

    this.state = {
      config: [], // 配置信息
    };
    this.prequalificationDS = new DataSet(PrequalificationDS());
  }

  _modal = {};

  // 针对改变前后的值是否一样，若不一样则显示不同的背景色
  getClassName = (field) => {
    const { header = {}, currentMode } = this.props;
    const { adjustFields = [] } = header?.rfxRequirePrequalHeaderAdjustDTO || {};
    let className = '';
    if (adjustFields?.includes(field)) {
      if (currentMode === 'current') {
        className = 'changeAfter';
      } else if (currentMode === 'history') {
        className = 'changeBefore';
      }
    }
    return className;
  };

  // 字段字典
  fieldsDictionary() {
    return {
      prequalEndDate: {
        label: intl.get(`${promptCode}.model.quoController.pretrialDeadline`).d('预审截止时间'),
        renderer: <Output name="prequalEndDate" className={this.getClassName('prequalEndDate')} />,
      },
    };
  }

  renderStartText = (name = null) => {
    const StartReg = /Start/;
    const StartFlag = name && StartReg.test(name);
    return StartFlag
      ? intl.get('ssrc.quoController.view.selectStartByPublish').d('发布即开始')
      : intl.get('ssrc.quoController.view.selectEndByPublish').d('发布即截至');
  };

  // 初始化ds
  initDSFields(fields = {}) {
    const config = [];
    const configData = {};
    const fieldsDictionary = this.fieldsDictionary();
    const { nowAdjustedField = null } = fields;
    const nowAdjustedFieldList = (nowAdjustedField || '').split(',').filter(Boolean);

    const fieldPropertyDTOList = [
      {
        name: 'prequalEndDate',
        visible: 1,
        value: fields.prequalEndDate,
        renderType: dateTimeRender,
      },
    ].filter(Boolean);

    if (fieldPropertyDTOList?.length) {
      fieldPropertyDTOList.forEach((field = {}) => {
        const { name = null, visible = 0, value: defaultValue = null, renderType } = field;
        if (!name || !visible) {
          return;
        }

        let currentTextValue =
          defaultValue && renderType && isFunction(renderType)
            ? renderType(defaultValue)
            : defaultValue;
        if (nowAdjustedFieldList.indexOf(name) !== -1) {
          currentTextValue = this.renderStartText(name);
        }

        const constantProperty = fieldsDictionary[name] || {};
        const newField = { name, ...constantProperty, defaultValue, visible };
        this.prequalificationDS.addField(name, newField);
        configData[name] = currentTextValue;
        config.push(newField);
      });
    }

    this.setState({
      config,
    });
    this.prequalificationDS.loadData([{ ...fields, ...configData }]);
    this.forceUpdate();
  }

  componentDidMount() {
    const { header = {} } = this.props;
    this.initDSFields(header.rfxRequirePrequalHeaderAdjustDTO);
  }

  @Bind()
  renderFields() {
    const { config = [] } = this.state;
    if (isEmpty(config)) {
      return null;
    }

    const fields = config.map((item = {}) => {
      const { visible = 0, renderer = null } = item;
      if (!visible) {
        return null;
      }
      return renderer;
    });

    return fields;
  }

  render() {
    // const { customizeForm } = this.props;
    return (
      <Row>
        {/* {customizeForm(
          {
            code: 'SSRC.XXXQUOTATION_CONTROLLER_DETAIL.PRE_ONLYREAD',
          },
          <Form
            className={style.quotationFormContainer}
            dataSet={this.prequalificationDS}
            labelLayout="float"
            columns={2}
          />
        )} */}
        <Col span={16} className={style.quotationFormContainer}>
          <Form
            dataSet={this.prequalificationDS}
            labelLayout="vertical"
            columns={2}
            className="c7n-pro-vertical-form-display"
          >
            {this.renderFields()}
            <Output name="reviewMethod" className={this.getClassName('reviewMethod')} />,
            {this.prequalificationDS?.current?.get &&
            this.prequalificationDS?.current?.get('reviewMethod') === 'LIMITED_QUANTITY' ? (
              <Output name="qualifiedLimit" className={this.getClassName('qualifiedLimit')} />
            ) : null}
            <Output
              name="preGroupLeaderLov"
              className={this.getClassName('preGroupLeaderLov')}
              renderer={({ value }) => {
                return value?.realName;
              }}
            />
            <Output
              name="preGroupMemberLov"
              className={this.getClassName('preGroupMemberLov')}
              renderer={({ value }) => {
                return (value || []).map(
                  (item, index) => `${item?.realName}${index + 1 === value.length ? '' : ','}`
                );
              }}
            />
            <TextArea
              name="prequalRemark"
              clearButton
              resize
              readOnly
              className={this.getClassName('prequalRemark')}
            />
            <Attachment
              name="prequalAttachmentUuid"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-prequal"
              readOnly
              {...ChunkUploadProps}
              className={this.getClassName('prequalAttachmentUuid')}
            />
          </Form>
        </Col>
      </Row>
    );
  }
}
