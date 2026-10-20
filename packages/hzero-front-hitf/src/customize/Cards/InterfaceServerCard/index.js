/**
 * 注册服务/接口总数卡片
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
import { interfaceServerQuery } from '@/services/cardService';
import { PanelCard } from '@/components/Card';
import { Bind } from 'lodash-decorators';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class InterfaceServerCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      interfaceSummary: 0,
      interfaceSummaryRate: '_',
      serverSummaryRate: '_',
      serverSummary: 0,
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
      interfaceSummary: 0,
      serverSummary: 0,
    });
    interfaceServerQuery().then((res) => {
      if (res && !res.failed) {
        this.setState({ ...res });
      }
    });
  }

  render() {
    const {
      interfaceSummary,
      interfaceSummaryRate,
      serverSummaryRate,
      serverSummary,
      name,
    } = this.state;
    const serverSummaryProps = {
      title: getLang('SERVER_SUMMARY'),
      content: serverSummary,
      description: `占服务比例`,
      rate: serverSummaryRate,
    };
    const interfaceSummaryProps = {
      title: getLang('INTERFACE_SUMMARY'),
      content: interfaceSummary,
      description: `占接口比例`,
      rate: interfaceSummaryRate,
    };
    return (
      <Card
        key="invokeCard"
        bordered={false}
        bodyStyle={{ padding: 5, overflow: 'hidden' }}
        style={{ backgroundColor: 'rgb(243, 244, 245)' }}
        title={<h3>{name}</h3>}
        extra={
          <a onClick={() => this.fetchDetail()}>
            {getLang('RELOAD')}
            <Icon type="refresh" />
          </a>
        }
      >
        <Row style={{ margin: 'auto' }}>
          <Col span={12} style={{ paddingRight: 5 }}>
            <PanelCard {...serverSummaryProps} />
          </Col>
          <Col span={12} style={{ paddingLeft: 5 }}>
            <PanelCard {...interfaceSummaryProps} />
          </Col>
        </Row>
      </Card>
    );
  }
}
