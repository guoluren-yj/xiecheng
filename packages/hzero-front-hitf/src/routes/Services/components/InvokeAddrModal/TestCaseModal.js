import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import TestCase from '../../TestCase';

@connect(({ services, loading }) => ({
  services,
  recognizeParamLoading: loading.effects['services/recognizeParam'],
}))
export default class TestCaseModal extends PureComponent {
  componentDidMount() {
    this.queryTestCaseList();
  }

  /**
   * 查询测试用例列表
   * @param {object} params - 分页参数
   */
  @Bind()
  queryTestCaseList(params = {}) {
    const { dispatch, interfaceId } = this.props;
    dispatch({
      type: 'services/queryTestCase',
      payload: { page: params, interfaceId },
    });
  }

  /**
   * 参数识别
   */
  @Bind()
  handleRecognizeParams() {
    const { dispatch, interfaceId, tenantId } = this.props;
    dispatch({
      type: 'services/recognizeParam',
      payload: { interfaceId, organizationId: tenantId },
      interfaceId,
    });
  }

  render() {
    const { interfaceId, hiddenRequestMethodOption } = this.props;
    const testCaseProps = {
      interfaceId,
      hiddenRequestMethodOption,
      onSearch: this.queryTestCaseList,
    };

    return <TestCase {...testCaseProps} />;
  }
}
