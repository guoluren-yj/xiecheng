import React, { Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Popover, Checkbox, Row } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isFunction } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import style from '../index.less';

const CheckboxGroup = Checkbox.Group;

export default class ApplyToSection extends Component {
  constructor(props) {
    super(props);

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      checkedList: [],
      sectionList: [], // 所有标段数据
      visible: false,
    };
  }

  componentDidMount() {
    const { getSectionListData = () => {} } = this.props;
    const sectionList = getSectionListData();

    if (!isEmpty(sectionList)) {
      this.setState({ sectionList });
    }
  }

  renderOtherSection = () => {
    const { getSectionItemProps = {} } = this.props;
    const { sectionList, checkedList } = this.state;

    return (
      <div className={style.applySectionContainer}>
        <div className="title">
          <a className="selecAll" onClick={this.seclecAll}>
            {intl.get('ssrc.common.view.message.chooseAll').d('全选')}
          </a>
          <a onClick={this.cancleSelect}>{intl.get('hzero.common.button.cancel').d('取消')}</a>
        </div>

        <div>
          {sectionList.length ? (
            <CheckboxGroup
              onChange={this.checkboxChange}
              className="checkbox-grops"
              value={checkedList}
            >
              {sectionList?.map((item) => (
                <Row className="checkbox-line">
                  <Checkbox
                    value={item.projectLineSectionId}
                    key={item.projectLineSectionId}
                    {...(isFunction(getSectionItemProps) ? getSectionItemProps(item) || {} : {})}
                  >
                    {item.sectionName}
                  </Checkbox>
                </Row>
              ))}
            </CheckboxGroup>
          ) : (
            ''
          )}
        </div>
        <div className="footer">
          <Button onClick={this.cancle}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
          <Button color="primary" onClick={this.confirm} className="confirm">
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </div>
      </div>
    );
  };

  @Bind()
  checkboxChange(checkedList = []) {
    this.setState({
      checkedList,
    });
  }

  @Bind()
  seclecAll() {
    const { sectionList = [] } = this.state;
    if (isEmpty(sectionList)) {
      return;
    }

    const ids = [];
    sectionList.forEach((item = {}) => {
      const { projectLineSectionId = null } = item;
      if (projectLineSectionId) {
        ids.push(projectLineSectionId);
      }
    });

    this.setState({
      checkedList: ids,
    });
  }

  @Bind()
  cancleSelect() {
    this.setState({
      checkedList: [],
    });
  }

  @Bind()
  async confirm() {
    const { submitQuotationSection, types } = this.props;
    const { checkedList = [], sectionList = [] } = this.state;

    if (isEmpty(checkedList) || isEmpty(sectionList)) {
      return;
    }

    const sectionCheckedList = [];
    sectionList.forEach((item) => {
      const { projectLineSectionId } = item || {};
      const lineSelectedFlag = checkedList.find(
        (checkedItem) => checkedItem === projectLineSectionId
      );

      if (lineSelectedFlag) {
        sectionCheckedList.push(item);
      }
    });

    const paramData = {
      sectionCheckedList,
    };

    try {
      submitQuotationSection(types, paramData);
      this.cancle();
    } catch (error) {
      throw error;
    }
  }

  @Bind()
  cancle() {
    this.setState({
      visible: false,
      checkedList: [],
    });
  }

  // 点击popover
  popoverVisibleChange = (visibleFlag) => {
    if (!visibleFlag) {
      this.cancle();
    }

    this.setState({ visible: visibleFlag });
  };

  render() {
    const { visible } = this.state;
    const { textNode } = this.props;

    return (
      <div className={style['section-submit-portion-btn']}>
        <Popover
          content={this.renderOtherSection()}
          // trigger="click"
          placement="left"
          visible={visible}
          onVisibleChange={this.popoverVisibleChange}
        >
          {textNode || (
            <span>
              {intl.get(`ssrc.common.view.button.submitPortionBatchSection`).d('批量提交标段')}
            </span>
          )}
        </Popover>
      </div>
    );
  }
}
