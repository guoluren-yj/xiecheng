import React, { Component } from 'react';
import {
  Form,
  DataSet,
  Row,
  Col,
  Select,
  NumberField,
  Lov,
  TextArea,
  Attachment,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import moment from 'moment';

import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { renderpretialMemberLovTooltip } from '@/routes/ssrc/InquiryHallNew/Update/utils/renderer';
import { ChunkUploadProps } from '@/utils/SsrcRegx';
import { PrequalificationDS } from './PrequalificationDS';
import {
  ComponentDiffRender,
  TimeSelectionWrapper,
  ComponentDiffLovRender,
  AttachmentComponentDiffRender,
  ComponentSelectDiffRender,
} from './utils';

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
      reviewMethod: '',
      prequalificationDisabled: false,
      prequalStatusFlag: false,
      prequalExistFlag: false,
    };
    this.prequalificationDS = new DataSet(PrequalificationDS(props.organizationId));
  }

  _modal = {};

  // 字段字典
  fieldsDictionary = {
    prequalEndDate: {
      label: intl.get(`${promptCode}.model.quoController.pretrialDeadline`).d('预审截止时间'),
      placeholder: intl.get(`${promptCode}.model.quoController.pretrialDeadline`).d('预审截止时间'),
      format: DEFAULT_DATETIME_FORMAT,
      min: moment(new Date()).format(DEFAULT_DATETIME_FORMAT),
    },
  };

  // 初始化ds
  initDSFields(fields = {}) {
    const config = [];
    const configData = {};
    const {
      fieldPropertyDTOList = [],
      nowAdjustedField = null,
      prequalSectionDesc = null,
      reviewMethod,
      rfxRequirePrequalHeaderDTO,
    } = fields;
    const { fieldsDictionary = {} } = this;
    const { existPrequalLineApprovedFlag = 1, prequalStatus = null } = rfxRequirePrequalHeaderDTO;
    fieldPropertyDTOList.forEach((field = {}) => {
      const {
        name = null,
        visible = 0,
        value: defaultValue = null,
        required = 0,
        disabled = 0,
      } = field;
      if (!name || !visible) {
        return;
      }

      const constantProperty = fieldsDictionary[name] || {};
      const newField = { ...field, ...constantProperty, defaultValue, prequalSectionDesc };

      const isCurrentDateAdjust = nowAdjustedField && nowAdjustedField.indexOf(name);
      const TimeWrapper = `${name}Wrapper`;
      this.prequalificationDS.addField(name, {
        ...newField,
        required: false,
        dynamicProps: {
          required({ record }) {
            return record.get(TimeWrapper) === 'custom' && required === 1;
          },
        },
      });
      this.prequalificationDS.addField(TimeWrapper, { ...newField, required: false });

      configData[name] = defaultValue;
      configData[TimeWrapper] =
        isCurrentDateAdjust !== 0 || isCurrentDateAdjust === null ? 'custom' : 'start';

      config.push(newField);
      if (name === 'prequalEndDate' && disabled === 1) {
        this.setState({ prequalificationDisabled: true });
        this.prequalificationDS.setState('prequalificationDisabled', true);
      } else if (name === 'prequalEndDate' && !disabled) {
        this.setState({ prequalificationDisabled: false });
        this.prequalificationDS.setState('prequalificationDisabled', false);
      }
    });

    const prequalExistFlag = existPrequalLineApprovedFlag === 1;
    const prequalStatusFlag = prequalStatus === 'APPROVED';

    this.setState({
      config,
      reviewMethod,
      prequalExistFlag,
      prequalStatusFlag,
    });

    this.prequalificationDS.setState('prequalExistFlag', prequalExistFlag);
    this.prequalificationDS.setState('prequalStatusFlag', prequalStatusFlag);

    this.prequalificationDS.loadData([{ ...fields, ...configData }]);
    this.forceUpdate();
  }

  // componentDidMount() {
  //   const { header = {} } = this.props;
  //   this.initDSFields(header.rfxRequirePrequalHeaderAdjustDTO);
  // }

  @Bind()
  renderFields() {
    const { config = [] } = this.state;
    if (isEmpty(config)) {
      return null;
    }
    const fields = config.map((item = {}) => {
      const { visible = 0, name = '', prequalSectionDesc = '' } = item;
      if (!visible) {
        return null;
      }

      return (
        <ComponentDiffRender
          record={this.prequalificationDS.current}
          historyDTO="rfxRequirePrequalHeaderDTO"
          name={name}
          key={name}
        >
          <TimeSelectionWrapper
            data={item}
            name={name}
            dataSet={this.prequalificationDS}
            selectProps={
              prequalSectionDesc ? { showHelp: 'tooltip', help: prequalSectionDesc } : {}
            }
            dateTimeProps={{
              styles: { width: '72%' },
            }}
          />
        </ComponentDiffRender>
      );
    });
    return fields;
  }

  @Bind()
  changeAttachment(name) {
    const adjustFields = this.prequalificationDS?.current?.get('adjustFields') || [];
    if (!adjustFields.length) {
      adjustFields.push(name);
    } else if (!adjustFields.includes(name)) {
      adjustFields.push(name);
    }
    this.prequalificationDS.current.set('adjustFields', adjustFields.length ? adjustFields : null);
  }

  @Bind()
  changePreGroupLeaderLov(value) {
    const record = this.prequalificationDS?.current || null;
    let otherValue = value;
    if (value) {
      otherValue = { ...value, userId: value.id, leaderFlag: 1 };
    }
    record.set('preGroupLeaderLov', otherValue);
  }

  @Bind()
  changePreGroupMemberLov(value) {
    const record = this.prequalificationDS?.current || null;
    let otherValue = [];
    if (value) {
      value.map(item => {
        return otherValue.push({ ...item, userId: item.id, leaderFlag: 0 });
      });
    } else {
      otherValue = null;
    }
    record.set('preGroupMemberLov', otherValue);
  }

  @Bind()
  changeReviewMethod(value) {
    const record = this.prequalificationDS?.current || null;
    if (value !== 'LIMITED_QUANTITY') {
      record.set('qualifiedLimit', null);
    }
    this.setState({ reviewMethod: value });
  }

  render() {
    const { customizeForm, custLoading, custKey } = this.props;
    const {
      reviewMethod,
      prequalificationDisabled,
      prequalStatusFlag,
      prequalExistFlag,
    } = this.state;
    const record = this.prequalificationDS?.current || null;
    // const reviewMethod = record?.get('reviewMethod');
    const normalDisabled = !(prequalificationDisabled || prequalStatusFlag || prequalExistFlag);
    const memberDisabled = !(prequalificationDisabled || prequalStatusFlag);
    const timeFields = this.renderFields();
    return (
      <Row>
        <Col>
          <Form
            dataSet={this.prequalificationDS}
            labelLayout="float"
            columns={3}
            custLoading={custLoading}
            useWidthPercent
          >
            {timeFields}
          </Form>
        </Col>
        <Col style={{ marginTop: timeFields?.length > 0 ? 16 : 0 }}>
          {customizeForm(
            {
              code: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.PREQUALIFICATION`,
              dataSet: this.prequalificationDS,
            },
            <Form
              dataSet={this.prequalificationDS}
              labelLayout="float"
              columns={3}
              custLoading={custLoading}
              useWidthPercent
            >
              {normalDisabled && (
                <ComponentSelectDiffRender
                  record={record}
                  name="reviewMethod"
                  historyDTO="rfxRequirePrequalHeaderDTO"
                >
                  <Select
                    name="reviewMethod"
                    onChange={value => {
                      this.changeReviewMethod(value);
                    }}
                    style={{ width: '100%' }}
                    disabled={prequalificationDisabled || prequalStatusFlag || prequalExistFlag}
                  />
                </ComponentSelectDiffRender>
              )}
              {reviewMethod === 'LIMITED_QUANTITY' && normalDisabled && (
                <ComponentDiffRender
                  record={record}
                  name="qualifiedLimit"
                  historyDTO="rfxRequirePrequalHeaderDTO"
                >
                  <NumberField
                    name="qualifiedLimit"
                    disabled={prequalificationDisabled || prequalStatusFlag || prequalExistFlag}
                  />
                </ComponentDiffRender>
              )}
              {memberDisabled && (
                <ComponentDiffLovRender
                  record={this.prequalificationDS}
                  historyDTO="rfxRequirePrequalHeaderDTO"
                  lovName="preGroupLeaderLov"
                  name="preGroupLeaderLov"
                  textName="realName"
                  bindId="id"
                >
                  <Lov
                    name="preGroupLeaderLov"
                    renderer={({ value }) => renderpretialMemberLovTooltip(value)}
                    modalProps={{
                      title: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMain`)
                        .d('预审小组组长'),
                    }}
                    onChange={value => this.changePreGroupLeaderLov(value)}
                    disabled={prequalificationDisabled || prequalStatusFlag}
                  />
                </ComponentDiffLovRender>
              )}
              {memberDisabled && (
                <ComponentDiffLovRender
                  record={this.prequalificationDS}
                  historyDTO="rfxRequirePrequalHeaderDTO"
                  lovName="preGroupMemberLov"
                  name="preGroupMemberLov"
                  textName="realName"
                  bindId="id"
                >
                  <Lov
                    name="preGroupMemberLov"
                    modalProps={{
                      title: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMember`)
                        .d('预审小组成员'),
                    }}
                    onChange={value => this.changePreGroupMemberLov(value)}
                    disabled={prequalificationDisabled || prequalStatusFlag}
                  />
                </ComponentDiffLovRender>
              )}
              {normalDisabled && (
                <ComponentDiffRender
                  record={record}
                  name="prequalRemark"
                  historyDTO="rfxRequirePrequalHeaderDTO"
                >
                  <TextArea
                    name="prequalRemark"
                    clearButton
                    resize
                    disabled={prequalificationDisabled || prequalStatusFlag || prequalExistFlag}
                  />
                </ComponentDiffRender>
              )}
              {normalDisabled && (
                <AttachmentComponentDiffRender record={record} name="prequalAttachmentUuid">
                  <Attachment
                    name="prequalAttachmentUuid"
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfx-prequal"
                    disabled={prequalificationDisabled || prequalStatusFlag || prequalExistFlag}
                    onAttachmentsChange={() => this.changeAttachment('prequalAttachmentUuid')}
                    {...ChunkUploadProps}
                  />
                </AttachmentComponentDiffRender>
              )}
            </Form>
          )}
        </Col>
      </Row>
    );
  }
}
