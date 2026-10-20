import React, { Component } from 'react';
import { Checkbox, Row } from 'choerodon-ui';
import { DataSet, Form, Output, Switch } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

// import { PrefixV2 } from '@/utils/globalVariable';
// import { getCurrentOrganizationId } from 'utils/utils';

import styles from './sectionBidding.less';

const CheckboxGroup = Checkbox.Group;

export default class sectionBidding extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }

    this.state = {
      switchValue: props.remote
        ? props.remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_SECTION_BID_SWITCH', false, {
            that: this,
          })
        : false,
      indeterminate: false,
      checkAll: true,
      sectionList: [],
      checkedList: [],
    };
    this.sectionInfoDS = new DataSet(() => ({
      selection: false,
      paging: false,
      fields: [
        {
          name: 'sectionName',
          type: 'string',
          label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currentSection`).d('当前标段'),
        },
      ],
    }));
  }

  componentDidMount() {
    const { sectionList = [], sectionName, remote } = this.props;
    this.sectionInfoDS.loadData([{ sectionName }]);
    this.setState({
      sectionList,
      checkedList: remote
        ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_SECTION_BID_CHECKED_LIST', [], {
            sectionList,
            that: this,
          })
        : [],
    });
  }

  @Bind()
  changeSectionSelect(value) {
    const { sectionList = [] } = this.state;
    this.setState({
      switchValue: value,
      checkedList: value ? [...sectionList] : [],
    });
  }

  @Bind()
  checkboxChange(checkedList) {
    const { sectionList } = this.state;
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && checkedList.length < sectionList.length,
      checkAll: checkedList.length === sectionList.length,
    });
  }

  @Bind()
  onCheckAllChange(e) {
    const { sectionList } = this.state;
    this.setState({
      checkedList: e.target.checked ? [...sectionList] : [],
      indeterminate: false,
      checkAll: e.target.checked,
    });
  }

  // 清除modal state
  clearSectionBiddingModalState = () => {
    this.setState({
      switchValue: false,
      indeterminate: false,
      checkAll: true,
      checkedList: [],
    });
  };

  render() {
    const { remote } = this.props;
    const { switchValue, sectionList, checkAll, indeterminate, checkedList } = this.state;

    return (
      <div className={styles.bidding}>
        <Form labelLayout="vertical" dataSet={this.sectionInfoDS}>
          <Output
            name="sectionName"
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.currentSection`).d('当前标段')}
          />
        </Form>
        <div className="select-section-switch">
          <div>
            <Switch
              onChange={this.changeSectionSelect}
              checked={switchValue}
              disabled={
                remote
                  ? remote.process(
                      'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_SECTION_BID_CHECK_LIST',
                      false,
                      { that: this }
                    )
                  : false
              }
            />
          </div>
          <div className="select-section-header">
            <div>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.selectOthersSection').d('选择其他标段')}
            </div>
            <div className="select-section-explain">
              {intl
                .get('ssrc.inquiryHall.model.inquiryHall.canSelectOthersSection')
                .d('可以选择同一项目下的其他标段一起开标')}
            </div>
          </div>
        </div>
        {switchValue && (
          <div className="select-section-lists">
            <Row className="checkbox-line">
              <Checkbox
                checked={checkAll}
                indeterminate={indeterminate}
                onChange={this.onCheckAllChange}
                disabled={
                  remote
                    ? remote.process(
                        'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_SECTION_BID_CHECK_LIST',
                        false,
                        { that: this }
                      )
                    : false
                }
              >
                {intl.get('ssrc.common.view.message.chooseAll').d('全选')}
              </Checkbox>
            </Row>
            <CheckboxGroup
              onChange={this.checkboxChange}
              className="checkbox-grops"
              value={checkedList}
            >
              {sectionList.map((item) => (
                <Row className="checkbox-line">
                  <Checkbox
                    disabled={
                      remote
                        ? remote.process(
                            'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_SECTION_BID_CHECK_LIST',
                            false,
                            { that: this }
                          )
                        : false
                    }
                    value={item}
                  >
                    {item.sectionName}
                  </Checkbox>
                </Row>
              ))}
            </CheckboxGroup>
          </div>
        )}
      </div>
    );
  }
}
