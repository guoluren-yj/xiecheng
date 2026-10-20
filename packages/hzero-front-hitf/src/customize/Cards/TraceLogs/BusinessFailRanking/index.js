/**
 * 工作台卡片-透传业务错误排行
 * @author wanjun.feng@hand-china.com
 * @date 2021/01/20
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { DataSet, Spin, Form, Lov, DateTimePicker } from 'choerodon-ui/pro';
import { Card, Icon } from 'choerodon-ui';
import 'echarts/lib/chart/tree';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import ReactEcharts from 'echarts-for-react';
import { Bind } from 'lodash-decorators';
import { FormDS, BusinessFailRankingDS } from '@/stores/customize/traceLogsDS';
import getLang from '@/langs/cardLang';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import moment from 'moment';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
class BusinessFailRankingCard extends React.Component {
  constructor(props) {
    super(props);
    this.businessFailRankingDS = new DataSet(
      BusinessFailRankingDS({
        onLoad: this.handleLoad,
      })
    );
    this.formDS = new DataSet(
      FormDS({
        onFieldUpdate: this.handleFieldUpdate,
      })
    );
    this.state = {
      name: '',
      interfaceArr: [],
      errorCountArr: [],
    };
  }

  componentDidMount() {
    const { name = '' } = this.props;
    this.setState({ name });
    this.init();
  }

  @Bind()
  init() {
    this.formDS.create();
    this.handleReload();
  }

  @Bind()
  handleLoad({ dataSet }) {
    const datasource = dataSet.toData();
    const interfaceArr = [];
    const errorCountArr = [];
    if (datasource) {
      datasource.map((item) => {
        interfaceArr.unshift(item.interfaceCode);
        errorCountArr.unshift(item.errorCount);
        return item;
      });
    }
    this.setState({
      interfaceArr,
      errorCountArr,
    });
  }

  setTimeTange() {
    const startDate = moment().startOf('month');
    const endDate = moment();
    this.formDS.current.set('timeRange', { startDate, endDate });
  }

  @Bind()
  handleFieldUpdate({ name, value }) {
    if (name === 'timeRange') {
      const { startDate, endDate } = value || {};
      this.businessFailRankingDS.setQueryParameter(
        'startDate',
        startDate ? dateTimeRender(startDate) : undefined
      );
      this.businessFailRankingDS.setQueryParameter(
        'endDate',
        endDate ? dateTimeRender(endDate) : undefined
      );
    } else if (name === 'tenantLov') {
      const { tenantId } = value || {};
      this.businessFailRankingDS.setQueryParameter('tenantId', tenantId);
    }
    this.businessFailRankingDS.query();
  }

  @Bind()
  handleReload() {
    this.setTimeTange();
    const {
      tenantId,
      timeRange: { startDate, endDate },
    } = this.formDS.current.toData();
    this.businessFailRankingDS.setQueryParameter('tenantId', tenantId);
    this.businessFailRankingDS.setQueryParameter('startDate', dateTimeRender(startDate));
    this.businessFailRankingDS.setQueryParameter('endDate', dateTimeRender(endDate));
    this.businessFailRankingDS.query();
  }

  /**
   * 配置
   */
  @Bind()
  getOption() {
    const { interfaceArr, errorCountArr } = this.state;
    return {
      tooltip: {
        trigger: 'axis',
        triggerOn: 'mousemove',
        label: {
          show: true,
          formatter: `${getLang('TRACE_LOGS_BUSINESS_FAIL_COUNT')}:{value}`,
        },
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: '1%',
        width: 'auto',
        height: 'auto',
        containLabel: true,
      },
      xAxis: {
        show: false,
        type: 'value',
        interval: 100,
        axisTick: {
          show: true,
          inside: true,
        },
      },
      yAxis: {
        type: 'category',
        name: getLang('TRACE_LOGS_INTERFACE_CODE'),
        data: interfaceArr,
        axisTick: false,
        axisLine: {
          show: false,
        },
        axisPointer: {
          type: 'shadow',
        },
      },
      series: [
        {
          name: getLang('TRACE_LOGS_BUSINESS_FAIL_COUNT'),
          type: 'bar',
          label: {
            show: true,
            position: 'right',
          },
          itemStyle: {
            barBorderRadius: 5,
            shadowBlur: 5,
            color: '#FF9966',
            shadowColor: '#FF9966',
          },
          data: errorCountArr,
        },
      ],
    };
  }

  render() {
    const { name } = this.state;
    return (
      <div id="businessFailRankingCard">
        <Card
          key="businessFailRankingCard"
          title={<h3>{name}</h3>}
          bordered={false}
          extra={
            <a onClick={() => this.handleReload()}>
              {getLang('RELOAD')}
              <Icon type="refresh" />
            </a>
          }
        >
          <Spin dataSet={this.businessFailRankingDS}>
            <Form dataSet={this.formDS} columns={1}>
              {!isTenantRoleLevel() && <Lov name="tenantLov" />}
              <DateTimePicker
                name="timeRange"
                label={getLang('TIME')}
                placeholder={[getLang('START_DATE'), getLang('END_DATE')]}
              />
            </Form>
            <ReactEcharts
              option={this.getOption()}
              opts={{ renderer: 'canvas', height: 'auto', width: 'auto' }}
            />
          </Spin>
        </Card>
      </div>
    );
  }
}

export default BusinessFailRankingCard;
