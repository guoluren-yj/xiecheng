/**
 * 绩效tab版本备份
 */
import React, { Fragment, useRef, useState } from 'react';
import { Tabs, Divider } from 'choerodon-ui';
import { DataSet, Icon, Modal } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { compose } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import c7nCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import classnames from 'classnames';
import { ReportDs } from './ds';
import Detail from './Detail';
import ExportBtn from './ExportBtn';
import styles from './index.less';

const { TabPane } = Tabs;

function SupplierPerformanceReport(props) {
  const { monthDs, quarterDs, customizeTable } = props;
  const [quarterInit, setQuarterInit] = useState(false);
  const cache = useRef({ setKey: () => {} });
  // type: 月份/季度
  const getBaseColumns = (type) => {
    let columns = [
      { name: 'evalDimensionMeaning' },
      { name: 'evalDimensionCode', width: 130 },
      { name: 'evalDimensionName' },
      { name: 'suplierNum' },
      { name: 'supplierName' },
      { name: 'categoryCode' },
      { name: 'categoryName' },
      { name: 'itemCode' },
      { name: 'itemName' },
      { name: 'supplierCompanyCategory' },
      { name: 'evalDateYear', align: 'right' },
      { name: 'unitName' },
    ];
    const renderer = ({ record, name }) => {
      const suffKey = name.includes('m') ? name.slice(1) : `Q${name.slice(1)}`; // 后缀编码
      const flagList = record.get('flagList'); // 下降标识
      const score = record.get(`finalScore${suffKey}`); // 得分
      const level = record.get(`levelDesc${suffKey}`); // 等级
      const rank = record.get(`rkNum${suffKey}`); // 排名
      const num = parseInt(name.match(/\d+$/), 10); // 获取第几月份/季度
      const detailFlag = score ?? level ?? rank;
      return (
        <div
          className={classnames({ [styles['table-link-btn']]: detailFlag })} // 有数据添加点击样式
          onClick={() => {
            if (!detailFlag) return;
            Modal.open({
              key: Modal.key(),
              title: intl.get('sdrp.common.modal.detailTitle').d('评分明细'),
              style: { height: '60%', width: '70%' },
              contentStyle: { display: 'flex', flexDirection: 'column' },
              bodyStyle: { flex: '1', overflow: 'hidden' },
              children: <Detail record={record} type={type} monthOrQuarter={num} />,
            });
          }}
        >
          {score ?? '-'}
          {flagList?.includes(num) && <Icon type="trending_down" />}
          <Divider type="vertical" />
          {level ?? '-'}
          <Divider type="vertical" />
          {rank ?? '-'}
        </div>
      );
    };
    // 不同类型添加不同绩效情况字段
    if (type === 'MONTH') {
      columns = columns.concat(
        new Array(12).fill(1).map((item, index) => {
          return { name: `m${index + 1}`, width: 170, renderer };
        })
      );
    } else if (type === 'QUARTER') {
      columns = columns.concat(
        new Array(4).fill(1).map((item, index) => {
          return { name: `q${index + 1}`, width: 170, renderer };
        })
      );
    }
    return columns;
  };
  return (
    <Fragment>
      <Header title={intl.get('sdrp.supplierPerformance.title.report').d('供应商绩效查询')}>
        <ExportBtn
          monthDs={monthDs}
          quarterDs={quarterDs}
          onLoad={(setKey) => {
            cache.current.setKey = setKey;
          }}
        />
      </Header>
      <Content className={styles['supplier-performance-content']}>
        <Tabs
          className="tabs-wrap"
          defaultActiveKey="1"
          onChange={(_key) => {
            cache.current.setKey(_key);
            // tab切换时初始化季度报表 - 只通过该方法更新第一次
            // 使用该方法更新原因是tabPane添加forceRender属性后会默认加载内容, 去除forceRender会导致页面渲染异常
            if (_key === '2' && !quarterInit) {
              setQuarterInit(true);
            }
          }}
        >
          <TabPane
            tab={intl.get('sdrp.supplierPerformance.tab.monthlyTrend').d('月度绩效趋势')}
            key="1"
            forceRender
          >
            {customizeTable(
              { code: 'SDRP.SUPPLIER.PERFORMANCE_REPORT.MONTH_TABLE' },
              <SearchBarTable
                dataSet={monthDs}
                columns={getBaseColumns('MONTH')}
                searchCode="SDRP.SUPPLIER.PERFORMANCE_REPORT.SEARCH"
                style={{ maxHeight: 'calc(100% - 22px)' }}
                customizable
                customizedCode="SDRP.SUPPLIER.PERFORMANCE_REPORT.MONTH_TABLE"
                searchBarConfig={{
                  fieldProps: {
                    evalDateYearList: {
                      defaultValue: () => new Date().getFullYear(),
                    },
                  },
                }}
              />
            )}
          </TabPane>
          <TabPane
            tab={intl.get('sdrp.supplierPerformance.tab.quarterlyTrend').d('季度度绩效趋势')}
            key="2"
            forceRender
          >
            {quarterInit &&
              customizeTable(
                { code: 'SDRP.SUPPLIER.PERFORMANCE_REPORT.QUARTER_TABLE' },
                <SearchBarTable
                  dataSet={quarterDs}
                  columns={getBaseColumns('QUARTER')}
                  searchCode="SDRP.SUPPLIER.PERFORMANCE_REPORT.SEARCH"
                  style={{ maxHeight: 'calc(100% - 22px)' }}
                  customizable
                  customizedCode="SDRP.SUPPLIER.PERFORMANCE_REPORT.QUARTER_TABLE"
                  searchBarConfig={{
                    fieldProps: {
                      evalDateYearList: {
                        defaultValue: () => new Date().getFullYear(),
                      },
                    },
                  }}
                />
              )}
          </TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
}

export default compose(
  formatterCollections({
    code: ['sdrp.supplierPerformance', 'sdrp.common'],
  }),
  c7nCustomize({
    unitCode: [
      'SDRP.SUPPLIER.PERFORMANCE_REPORT.MONTH_TABLE',
      'SDRP.SUPPLIER.PERFORMANCE_REPORT.QUARTER_TABLE',
      'SDRP.SUPPLIER.PERFORMANCE_REPORT.SEARCH',
    ],
  }),
  withProps(
    () => {
      return {
        monthDs: new DataSet(ReportDs({ type: 'MONTH', standardFlag: true })),
        quarterDs: new DataSet(ReportDs({ type: 'QUARTER', standardFlag: true })),
      };
    },
    { cacheState: true }
  )
)(SupplierPerformanceReport);
