/**
 * 今日透传总量卡片
 * @author wanjun.feng@hand-china.com
 * @date 2021-1-14
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import React from 'react';
import { Row, Col, Icon } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import getLang from '@/langs/cardLang';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { interfaceServerInvokeQuery } from '@/services/cardService';
import { PanelCard } from '@/components/Card';
import { Bind } from 'lodash-decorators';
import QuestionPopover from '@/components/QuestionPopover';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class InterfaceServerInvokeCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      invokeTotalCount: 0,
      invokeFailCount: 0,
      businessFailCount: 0,
    };
  }

  componentDidMount() {
    const { name = '' } = this.props;
    this.setState({ name });
    this.fetchDetail();
  }

  @Bind()
  fetchDetail() {
    this.setState({
      invokeTotalCount: 0,
      invokeFailCount: 0,
      businessFailCount: 0,
    });
    interfaceServerInvokeQuery().then((res) => {
      if (res && !res.failed) {
        this.setState({ ...res });
      }
    });
  }

  render() {
    const {
      invokeTotalCount,
      invokeFailCount,
      businessFailCount,
      invokeTotalCountRate,
      invokeFailCountRate,
      businessFailCountRate,
      name,
    } = this.state;
    const invokeTotalCountProps = {
      title: getLang('INVOKE_COUNT'),
      content: invokeTotalCount,
      description: '与昨日同比',
      rate: invokeTotalCountRate,
    };
    const invokeFailCountProps = {
      title: getLang('INVOKE_FAIL_COUNT'),
      content: invokeFailCount,
      description: '与昨日同比',
      rate: invokeFailCountRate,
    };
    const businessFailCountProps = {
      title: getLang('INVOKE_BUSINESS_FAIL_COUNT'),
      content: businessFailCount,
      description: '与昨日同比',
      rate: businessFailCountRate,
    };
    return (
      <Card
        key="invokeCard"
        bordered={false}
        bodyStyle={{ padding: 5, overflow: 'hidden' }}
        style={{ backgroundColor: 'rgb(243, 244, 245)' }}
        title={
          <h3>
            <QuestionPopover text={name} message={getLang('INVOKE_TIP')} />
          </h3>
        }
        extra={
          <a onClick={() => this.fetchDetail()}>
            {getLang('RELOAD')}
            <Icon type="refresh" />
          </a>
        }
      >
        <Row style={{ margin: 'auto' }}>
          <Col span={8} style={{ paddingRight: 5 }}>
            <PanelCard {...invokeTotalCountProps} />
          </Col>
          <Col span={8} style={{ paddingLeft: 5, paddingRight: 5 }}>
            <PanelCard {...invokeFailCountProps} />
          </Col>
          <Col span={8} style={{ paddingLeft: 5 }}>
            <PanelCard {...businessFailCountProps} />
          </Col>
        </Row>
      </Card>
    );
  }
}
