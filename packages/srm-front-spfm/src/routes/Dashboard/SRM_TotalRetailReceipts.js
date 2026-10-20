/**
 * SupplyReport -零售道具采购总额表
 * @date: 2021-02-01
 * @author ZXM <ximin.zhang@hand-china.com>
 */
import React from 'react';
import { isEmpty, isNil } from 'lodash';
import echarts from 'echarts';
import { Bind } from 'lodash-decorators';
import { DataSet, Form, Select, Lov } from 'choerodon-ui/pro';
import { Tabs, notification } from 'choerodon-ui';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './Cards.less';
// import chartImg from '../../assets/dashboard/no-chart.svg';
import { fetchTotalRetailReceipts } from '@/services/srmCardsService';
// import reportNoData from '../../assets/dashboard/report-no-data.svg';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['dashboard.srmCards'] })
export default class TotalRetailReceipts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 'month',
      heightAuto: '',
    };
  }

  formDataDs = new DataSet({
    autoCreate: true,
    autoQuery: false,
    fields: [
      {
        name: 'yearCode',
        type: 'string',
        lookupCode: 'SPUC.REPORT_YEAR',
      },
      {
        name: 'monthCode',
        type: 'string',
        lookupCode: 'SPUC.REPORT_MONTH',
      },
      {
        name: 'largeClassCode',
        type: 'object',
        lovCode: 'SCUX.XTEP_STORE_SELECT',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'goodsDesc',
        type: 'object',
        lovCode: 'SCUX.XTEP_RETAIL_SELECT',
        lovPara: { tenantId: organizationId },
      },
    ],
  });

  componentDidMount() {
    this.fetchData('XTEP_TOTAL');
  }

  /**
   * 查询
   */
  @Bind()
  fetchData(type, key = 'totalAmount', filterData = {}) {
    let heightAuto;
    if (key === 'totalAmount') {
      heightAuto = document.getElementById('chart')
        ? document.getElementById('chart').style.height
        : 'auto';
    } else if (key === 'store') {
      heightAuto = document.getElementById('store')
        ? document.getElementById('store').style.height
        : 'auto';
    } else {
      heightAuto = document.getElementById('retail')
        ? document.getElementById('retail').style.height
        : 'auto';
    }
    this.setState({ heightAuto });
    const response = fetchTotalRetailReceipts(type, filterData);
    response.then((res) => {
      if (res) {
        if (res.failed) {
          notification.warning({
            message: res.message,
            placement: 'bottomRight',
          });
        } else {
          this.renderCharts(res, key);
        }
      }
    });
  }

  /**
   * 渲染图表
   */
  @Bind()
  renderCharts(data, key = 'totalAmount') {
    this.chartRefA =
      key === 'totalAmount'
        ? this.chartRef && echarts.init(this.chartRef)
        : key === 'store'
        ? this.storeRef && echarts.init(this.storeRef)
        : this.retailRef && echarts.init(this.retailRef);
    const { xtepAmountDTOMap, amount } = data;
    const flag =
      !isEmpty(xtepAmountDTOMap) && xtepAmountDTOMap[Object.keys(xtepAmountDTOMap)[0]][0].dayCode;
    const monthIntl = intl.get(`dashboard.srmCards.moedl.month`).d('月');
    const yearIntl = intl.get('dashboard.srmCards.moedl.year').d('年');
    const xAxis = {
      type: 'category',
      data: flag
        ? xtepAmountDTOMap[Object.keys(xtepAmountDTOMap)[0]].map((item) => item.dayCode)
        : [
            `1${monthIntl}`,
            `2${monthIntl}`,
            `3${monthIntl}`,
            `4${monthIntl}`,
            `5${monthIntl}`,
            `5${monthIntl}`,
            `7${monthIntl}`,
            `8${monthIntl}`,
            `9${monthIntl}`,
            `10${monthIntl}`,
            `11${monthIntl}`,
            `12${monthIntl}`,
          ],
      max: flag ? '' : 11,
      boundaryGap: false,
    };
    const yAxis = {
      type: 'value',
      name: intl.get('dashboard.srmCards.title.totalProcurement').d('采购总额(万元)'),
      splitNumber: 4,
      splitLine: {
        lineStyle: {
          color: ['#ddd'],
          type: 'dotted',
        },
      },
    };
    const legend = {
      data: !isEmpty(xtepAmountDTOMap)
        ? Object.keys(xtepAmountDTOMap).map((item) => `${item}${yearIntl}`)
        : [],
      bottom: 0,
      left: 'center',
    };
    const series = [];
    if (!isEmpty(xtepAmountDTOMap)) {
      if (xtepAmountDTOMap[Object.keys(xtepAmountDTOMap)[0]][0].dayCode) {
        Object.keys(xtepAmountDTOMap).forEach((item) => {
          series.push({
            name: `${item}${yearIntl}`,
            type: 'line',
            data: xtepAmountDTOMap[item].map((i) => i.purchaseAmount),
          });
        });
      } else {
        Object.keys(xtepAmountDTOMap).forEach((item) => {
          series.push({
            name: `${item}${yearIntl}`,
            type: 'line',
            data: xtepAmountDTOMap[item].map((i) => i.purchaseAmount),
          });
        });
      }
    }

    const option = {
      title: {
        text: !isNil(amount) ? `总额${amount}万元` : '',
        textStyle: {
          color: '#6d7a80',
          fontWeight: '400',
          fontSize: 14,
          lineHeight: 10,
        },
      },
      tooltip: {
        trigger: 'axis',
      },
      color: ['#5470c6', '#91cc75', '#fac858'],
      xAxis,
      yAxis,
      legend,
      series,
    };
    if(this.chartRefA) {
      this.chartRefA.setOption(option, true);
    }
  }

  @Bind()
  handleChangeTab(key) {
    this.formDataDs.reset();
    if (key === 'totalAmount') {
      this.fetchData('XTEP_TOTAL', key);
    } else if (key === 'store') {
      this.fetchData('XTEP_STORE', key);
    } else {
      this.fetchData('XTEP_RETAIL', key);
    }
  }

  @Bind()
  handleChangeSearch(value, flag, type = '', key = '') {
    const { monthCode, yearCode, goodsDesc, largeClassCode } = this.formDataDs.current.toData();
    const filterData = {
      monthCode: flag === 1 ? value : !isEmpty(monthCode) ? monthCode : undefined,
      yearCode: flag === 4 ? value : !isEmpty(yearCode) ? yearCode : undefined,
      goodsDesc:
        flag === 2 ? value.goodsDesc : !isEmpty(goodsDesc) ? goodsDesc.goodsDesc : undefined,
      largeClassCode:
        flag === 3 ? value.lovCode : !isEmpty(largeClassCode) ? largeClassCode.lovCode : undefined,
    };
    this.fetchData(type, key, filterData);
  }

  render() {
    return (
      <div className={styles.report} id="reports">
        <Tabs onChange={this.handleChangeTab} animated={false}>
          <TabPane
            tab={intl.get('dashboard.srmCards.title.totalAmount').d('采购总额')}
            key="totalAmount"
          >
            <div style={{ width: '190px', position: 'absolute', right: '0px', top: '36px' }}>
              <Form columns={2} dataSet={this.formDataDs}>
                <Select
                  name="monthCode"
                  placeholder={intl.get('dashboard.srmCards.title.monthly').d('月度')}
                  onChange={(value) =>
                    this.handleChangeSearch(value, 1, 'XTEP_TOTAL', 'totalAmount')
                  }
                />
                <Select
                  name="yearCode"
                  placeholder={intl.get('dashboard.srmCards.title.year').d('年度')}
                  onChange={(value) =>
                    this.handleChangeSearch(value, 4, 'XTEP_TOTAL', 'totalAmount')
                  }
                />
              </Form>
            </div>
            <div
              style={{ height: '300px', margin: '6px 0' }}
              ref={(vnode) => {
                this.chartRef = vnode;
              }}
              id="chart"
            />
          </TabPane>
          <TabPane tab={intl.get('dashboard.srmCards.title.store').d('门店')} key="store">
            <div style={{ width: '190px', position: 'absolute', right: '0px', top: '29px' }}>
              <Form columns={2} dataSet={this.formDataDs} className={styles.formStyle}>
                <Lov
                  name="largeClassCode"
                  colSpan={2}
                  onChange={(value) => this.handleChangeSearch(value, 2, 'XTEP_STORE', 'store')}
                />
                <Select
                  name="monthCode"
                  placeholder={intl.get('dashboard.srmCards.title.monthly').d('月度')}
                  onChange={(value) => this.handleChangeSearch(value, 1, 'XTEP_STORE', 'store')}
                />
                <Select
                  name="yearCode"
                  placeholder={intl.get('dashboard.srmCards.title.year').d('年度')}
                  onChange={(value) => this.handleChangeSearch(value, 4, 'XTEP_STORE', 'store')}
                />
              </Form>
            </div>
            <div
              style={{ height: '300px', margin: '6px 0' }}
              ref={(vnode) => {
                this.storeRef = vnode;
              }}
              id="store"
            />
          </TabPane>
          <TabPane tab={intl.get('dashboard.srmCards.title.retail').d('零售')} key="retail">
            <div style={{ width: '190px', position: 'absolute', right: '0px', top: '29px' }}>
              <Form columns={2} dataSet={this.formDataDs} className={styles.formStyle}>
                <Lov
                  name="goodsDesc"
                  colSpan={2}
                  onChange={(value) => this.handleChangeSearch(value, 3, 'XTEP_RETAIL', 'retail')}
                />
                <Select
                  name="monthCode"
                  placeholder={intl.get('dashboard.srmCards.title.monthly').d('月度')}
                  onChange={(value) => this.handleChangeSearch(value, 1, 'XTEP_RETAIL', 'retail')}
                />
                <Select
                  name="yearCode"
                  placeholder={intl.get('dashboard.srmCards.title.year').d('年度')}
                  onChange={(value) => this.handleChangeSearch(value, 4, 'XTEP_RETAIL', 'retail')}
                />
              </Form>
            </div>
            <div
              style={{ height: '300px', margin: '6px 0' }}
              ref={(vnode) => {
                this.retailRef = vnode;
              }}
              id="retail"
            />
          </TabPane>
        </Tabs>
        {/* {time === 'month' && (amounts === 0 || isEmpty(reports)) && (
          <div style={{ textAlign: 'center' }}>
            <img src={reportNoData} alt="" style={{ marginTop: '35px' }} />
            <div className={styles.commonlyUsed}>
              <div className={styles['common-dashboard-no-data']}>
                {intl.get(`spfm.dashboard.model.common.reportNoData`).d('暂无工作报表')}
              </div>
            </div>
          </div>
        )} */}
      </div>
    );
  }
}
