import React, { Component } from 'react';
import { Form, DataSet, Lov, Select } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { getResponse } from 'utils/utils';
import { fetchInitTemplate } from '@/services/inquiryHallNewService';
import { createTemplateDS } from './CreateModalDS';

export default class CreateModal extends Component {
  constructor(props) {
    super(props);
    const {
      selectData: { projectLineSections = [] },
    } = props; // 勾选标段长度
    this.props.onRef(this);
    this.templateDS = new DataSet(
      createTemplateDS(projectLineSections.length, props.bidFlag, { selectData: props?.selectData })
    );
    this.state = {
      qualificationType: null,
    };
  }

  componentDidMount() {
    this.getInitTemplate();
    this.handleCuxFunction();
  }

  /**
   * 模板数据初始化
   * @protected 此方法被 [永祥] 二开, 禁止修改方法名, 谨慎修改逻辑
   */
  @Bind()
  getInitTemplate() {
    const { selectData } = this.props;
    const { sourceProjectId } = selectData || {};
    const params = {
      sourceFrom: 'PROJECT',
      sourceProjectId,
    };
    const record = this.templateDS.current;
    fetchInitTemplate(params).then((res) => {
      const newResult = getResponse(res);
      if (!isEmpty(newResult)) {
        record.set('templateIdLov', {
          templateId: newResult.templateId,
          templateName: newResult.templateName,
        });
      }
    });
  }

  // cux event
  handleCuxFunction = () => {
    const { remote } = this.props;
    if (remote.event) {
      remote.event.fireEvent('handleCuxFunctionProjectCreateModal', {
        that: this,
        templateDS: this.templateDS,
      });
    }
  };

  // 变更模板
  @Bind()
  handleChangeTemplate(lovRecord) {
    const {
      selectData: { projectLineSections = [] },
    } = this.props; // 勾选标段长度
    const { qualificationType } = lovRecord || {};
    if (qualificationType !== 'PRE' || projectLineSections.length === 1) {
      // 无需资格预审, 清空
      this.templateDS.current.set('mergeType', null);
    }
    this.setState({
      qualificationType,
    });
  }

  render() {
    const {
      selectData: { projectLineSections = [] },
    } = this.props; // 勾选标段长度
    const { qualificationType } = this.state;
    return (
      <Form dataSet={this.templateDS} columns={1} labelLayout="float">
        <Lov name="templateIdLov" onChange={this.handleChangeTemplate} />
        {projectLineSections.length > 1 && qualificationType === 'PRE' && (
          <Select name="mergeType" clearButton={false} />
        )}
      </Form>
    );
  }
}
