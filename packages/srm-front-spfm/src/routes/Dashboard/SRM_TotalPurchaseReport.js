/**
 * PurchasingReport -采购报表
 * @date: 2019-02-21
 * @author YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Col, Row, Select, Form, DatePicker } from 'hzero-ui';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import MiniArea from './MiniAreaLines';
import styles from './Cards.less';
// import chartImg from '../../assets/dashboard/no-chart.svg';
import reportNoData from '../../assets/dashboard/report-no-data.svg';
import { formatAumont } from './hook';

const { YearPicker } = DatePicker;

const currentLanguage = getCurrentLanguage();

const yearTooltip = [
  'x*y',
  (x, y) => {
    const amount = formatAumont(y);
    return {
      name: x,
      value: intl
        .get('spfm.dashboard.model.leadershipReport.purchases', {
          name: amount,
        })
        .d(`采购额：${amount}(万元)`),
    };
  },
];

const monthToolTip = [
  'x*y',
  (x, y) => {
    return {
      name: intl
        .get('spfm.dashboard.model.leadershipReport.date', {
          month: x.split('/')[0],
          day: x.split('/')[1],
        })
        .d(`日期：${x.split('/')[0]}月${x.split('/')[1]}日`),
      value: intl
        .get('spfm.dashboard.model.leadershipReport.purchases', {
          name: y,
        })
        .d(`采购额：${y}(万元)`),
    };
  },
];

const x = {
  name: 'creationDate',
  line: {
    lineWidth: 3,
  },
  label: {
    textStyle: {
      textAlign: 'center', // 文本对齐方向，可取值为： left center right
      fill: '#8C8C8C', // 文本的颜色
      fontSize: '12', // 文本大小
    },
  },
  tickLine: {
    lineWidth: 1, // 刻度线宽
    stroke: '#ccc', // 刻度线的颜色
    length: 5, // 刻度线的长度, **原来的属性为 line**,可以通过将值设置为负数来改变其在轴上的方向
  },
};

const y = {
  // name: 'taxIncludedLineAmount',
  // line: {
  //   lineWidth: 3,
  // },
  grid: {
    lineStyle: {
      stroke: '#d9d9d9',
      lineWidth: 1,
      lineDash: [2, 2],
    },
  },
  label: {
    textStyle: {
      textAlign: 'right', // 文本对齐方向，可取值为： left center right
      fill: '#8C8C8C', // 文本的颜色
      fontSize: '12', // 文本大小
    },
    formatter(text) {
      if (typeof text === 'string') {
        return formatAumont(Number(text));
      }
      return text;
    },
  },
};

const currentDate = new Date();
const currentFullYear = currentDate.getFullYear();
const monthLayout = {
  wrapperCol: { span: 23 },
};

@Form.create({ fieldNameProp: null })
@connect(({ srmCards, loading }) => ({
  srmCards,
  loading: loading.effects['srmCards/queryTotalPurchaseReport'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class PurchasingReport extends React.Component {
  state = {
    startYearDate: currentFullYear,
    startMonthDate: '',
    categoryId: '',
    height: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    // 查询下拉框值集
    dispatch({ type: 'srmCards/init' });
    this.handleSearch(this.state);
    // window.onresize = this.handleHeight();
    // 手动触发一次
    this.handleHeight();
    window.addEventListener('resize', this.handleHeight);
  }

  /**
   * 查询采购方报表
   */
  @Bind()
  handleSearch(time) {
    const { dispatch } = this.props;
    const { startYearDate = '', startMonthDate = '', categoryId = '' } = time;
    dispatch({
      type: 'srmCards/queryTotalPurchaseReport',
      payload: {
        startYearDate,
        startMonthDate,
        categoryId,
      },
    });
  }

  /**
   * 获取页面高度，使报表高度自适应
   */
  @Bind()
  handleHeight() {
    if (document.getElementById('total_purchasing')) {
      const height = document.getElementById('total_purchasing').scrollHeight - 220;
      this.setState({ height });
    }
  }

  /**
   * 月度查询
   */
  @Bind()
  handleQueryMonth(month) {
    const { startYearDate, categoryId } = this.state;
    this.handleSearch({ startMonthDate: month, startYearDate, categoryId });
    this.setState({
      startMonthDate: month,
    });
  }

  /**
   * 年度查询
   */
  @Bind()
  handleQueryYear(__, dateString) {
    const { startMonthDate, categoryId } = this.state;
    this.handleSearch({
      startYearDate: parseInt(dateString, 0) || currentFullYear,
      startMonthDate,
      categoryId,
    });
    this.setState({
      startYearDate: parseInt(dateString, 0) || currentFullYear,
    });
  }

  /**
   * 查询选择品类下的子品类（包含当前选择品类节点）
   */
  @Bind()
  handleCategory(categoryId) {
    if (categoryId) {
      const { startYearDate, startMonthDate } = this.state;
      this.setState({ categoryId });
      this.handleSearch({ startYearDate, startMonthDate, categoryId });
    } else {
      this.setState({ categoryId: '' });
      const { startYearDate, startMonthDate } = this.state;
      this.handleSearch({ startYearDate, startMonthDate, categoryId: '' });
    }
  }

  /**
   * 找入口品类节点
   * @param {*} content
   * @param {*} categoryId
   */
  @Bind()
  getTreeLevel(content, categoryId, newArray = []) {
    content.forEach((i) => {
      if (i.categoryId === categoryId) {
        newArray.push(categoryId);
        this.getIndex(i, newArray);
      } else if ('children' in i) {
        this.getTreeLevel(i.children, categoryId, newArray);
      }
    });
    if (newArray.length > 0) {
      return newArray;
    }
  }

  /**
   * 找入口品类节点下的子节点
   * @param {*} i
   * @param {*} newArray
   */
  @Bind()
  getIndex(i, newArray) {
    if ('children' in i) {
      const { children = [] } = i;
      children.forEach((item) => {
        newArray.push(item.categoryId);
      });
      children.forEach((item) => {
        this.getIndex(item, newArray);
      });
    }
  }

  render() {
    const {
      form: { getFieldDecorator },
      srmCards: { totalPurchaseAmount, enumMap = {}, totalPurchaseReport = [] } = {},
    } = this.props;
    const newTotalPurchaseReport =
      currentLanguage === 'en_US'
        ? totalPurchaseReport.map((item) => ({
            x: item.x,
            y: item.y * 10000,
          }))
        : totalPurchaseReport;
    const { monthCode = [] } = enumMap;
    const { height, startYearDate, startMonthDate } = this.state;
    return (
      <div className={styles.report} id="total_purchasing">
        <Form layout="inline" className="more-fields-search-form">
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col span={16} className={styles['total-report-title']}>
              {intl.get('spfm.dashboard.view.leadershipReport.title').d('采购总额')}
              {currentLanguage === 'en_US' ? (
                <span className={styles['report-number-title']}>
                  {formatAumont(totalPurchaseAmount * 10000)}
                </span>
              ) : (
                <span className={styles['report-number-title']}>
                  {formatAumont(totalPurchaseAmount)}
                </span>
              )}
              {intl.get('spfm.dashboard.view.leadershipReport.statementAmount').d('万元')}
            </Col>
            <Col span={8} style={{ textAlign: 'right', marginTop: '10px' }}>
              <Row {...SEARCH_FORM_ROW_LAYOUT}>
                <Form.Item>
                  {getFieldDecorator('categoryId')(
                    <Lov
                      code="SPRM.ITEM_CATEGOR"
                      textField="categoryName"
                      lovOptions={{ valueField: 'categoryId', displayField: 'categoryName' }}
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                        enabledFlag: 1,
                      }}
                      placeholder={intl
                        .get('spfm.dashboard.view.leadershipReport.category')
                        .d('品类')}
                      onChange={this.handleCategory}
                    />
                  )}
                </Form.Item>
              </Row>
            </Col>
          </Row>
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col span={16} className={styles['total-report-title']} />
            <Col span={8} style={{ textAlign: 'right', marginTop: '10px' }}>
              <Row>
                <Col span={12}>
                  <Form.Item {...monthLayout}>
                    {getFieldDecorator('month')(
                      <Select
                        style={{ width: '100%' }}
                        allowClear
                        placeholder={intl
                          .get('spfm.dashboard.view.leadershipReport.month')
                          .d('月度')}
                        onChange={this.handleQueryMonth}
                      >
                        {monthCode.map((n) => (
                          <Select.Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item>
                    {getFieldDecorator('year')(
                      <YearPicker
                        onChange={this.handleQueryYear}
                        placeholder={intl
                          .get('spfm.dashboard.view.leadershipReport.yearly')
                          .d('年度')}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            {intl.get('spfm.dashboard.view.leadershipReport.message.purchases').d('采购额（万元）')}
          </Row>
        </Form>
        {!isEmpty(totalPurchaseReport) && (
          <div style={{ marginTop: '45px' }}>
            <MiniArea
              tooltip={startMonthDate ? monthToolTip : yearTooltip}
              height={height}
              data={newTotalPurchaseReport}
              xAxis={x}
              yAxis={y}
              startYearDate={startYearDate}
            />
          </div>
        )}
        {(isEmpty(totalPurchaseReport) || totalPurchaseAmount === 0) && (
          <div style={{ textAlign: 'center' }}>
            <img src={reportNoData} alt="" style={{ marginTop: '35px' }} />
            <div className={styles.commonlyUsed}>
              <div className={styles['common-dashboard-no-data']}>
                {intl.get(`spfm.dashboard.model.common.reportNoData`).d('暂无工作报表')}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
