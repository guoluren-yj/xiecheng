/* eslint-disable no-unused-expressions */
/**
 * 绩效无tab版本
 */
import React, { Fragment, useMemo, useState, useRef } from 'react';
import { Divider } from 'choerodon-ui';
import { DataSet, Icon, Modal } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { compose, isNil } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import c7nCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import notification from 'utils/notification';
import classnames from 'classnames';

import { ReportDs } from './ds';
import Detail from './Detail';
import ExportBtn from './ExportBtn';
import styles from './index.less';

function SupplierPerformanceReport(props) {
  const { ds, customizeTable } = props;
  const [type, setType] = useState('MONTH');
  const cache = useRef({});

  const classMap = {
    高风险: styles['tag-high'],
    中风险: styles['tag-middle'],
    低风险: styles['tag-low'],
    较低风险: styles['tag-low'],
  };

  // type: 月份/季度
  const columns = useMemo(() => {
    const renderer = ({ record, name, dataSet }) => {
      const num = parseInt(name.match(/\d+$/), 10); // 获取第几月份/季度
      const flagList = record.get('flagList'); // 下降标识
      const score = record.get(`finalScore${num}`); // 得分
      const level = record.get(`levelDesc${num}`); // 等级
      const rank = record.get(`rkNum${num}`); // 排名
      const detailFlag = !isNil(score ?? level ?? rank);
      return (
        <div
          className={classnames({ [styles['table-link-btn']]: detailFlag })} // 有数据添加点击样式
          onClick={() => {
            if (!detailFlag) return;
            Modal.open({
              key: Modal.key(),
              title: intl.get('sdrp.supplierPerformance.modal.detailTitle').d('评分明细'),
              style: { height: '450px', width: '70%' },
              autoCenter: false,
              okCancel: false,
              contentStyle: { display: 'flex', flexDirection: 'column' },
              bodyStyle: { display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' },
              children: (
                <Detail
                  record={record}
                  type={dataSet.queryDataSet?.current.get('selectType')}
                  monthOrQuarter={num}
                />
              ),
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
    const columnConfigMap = {
      MONTH: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => {
        return { name: `m${item}`, width: 170, renderer };
      }),
      QUARTER: [3, 6, 9, 12].map((item) => {
        return { name: `q${item}`, width: 170, renderer };
      }),
      'HALF-YEAR': [
        { name: 'hy6', width: 170, renderer },
        { name: 'hy12', width: 170, renderer },
      ],
      YEAR: [{ name: 'y12', width: 170, renderer }],
    };
    return [
      { name: 'evalDimensionMeaning' },
      { name: 'evalDimensionCode', width: 130 },
      { name: 'evalDimensionName' },
      type === 'MONTH' && { name: 'sdrpDecimal1' },
      type === 'MONTH' && { name: 'sdrpBigint1' },
      type === 'MONTH' && {
        name: 'sdrpVarchar1',
        renderer: ({ text }) => {
          return <span className={classMap[text]}>{text}</span>;
        },
      },
      { name: 'suplierNum' },
      { name: 'supplierName' },
      { name: 'categoryCode' },
      { name: 'categoryName' },
      { name: 'itemCode' },
      { name: 'itemName' },
      { name: 'supplierCompanyCategory' },
      { name: 'evalDateYear', align: 'right' },
      { name: 'unitName' },
      ...(columnConfigMap[type] || []),
    ].filter(Boolean);
  }, [type]);
  const onFieldChange = ({ name, value }) => {
    if (name === 'selectType') {
      setType(value);
      cache.current?.setKey(value);

      // if(!value) {
      //   notification.error({
      //     message: intl
      //       .get('sdrp.supplierPerformance.filterBar.noData')
      //       .d('请选择周期'),
      //   });
      // }
    }
  };

  const handleFilterQuery = ({ params }) => {
    const { selectType = '' } = params;
    if (!selectType) {
      notification.error({
        message: intl.get('sdrp.supplierPerformance.filterBar.noData').d('请选择周期'),
      });
      return;
    }

    ds.queryParameter = { ...params };
    ds.query();
  };

  return (
    <Fragment>
      <Header title={intl.get('sdrp.supplierPerformance.title.report').d('供应商绩效查询')}>
        <ExportBtn
          ds={ds}
          defaultKey="MONTH"
          onLoad={(setKey) => {
            cache.current.setKey = setKey;
          }}
        />
      </Header>
      <Content>
        {customizeTable(
          { code: 'SDRP.SUPPLIER.PERFORMANCE_REPORT.TABLE' },
          <SearchBarTable
            dataSet={ds}
            columns={columns}
            searchCode="SDRP.SUPPLIER.PERFORMANCE_REPORT.T_SEARCH"
            style={{ maxHeight: 'calc(100% - 22px)' }}
            customizable
            customizedCode="SDRP.SUPPLIER.PERFORMANCE_REPORT.TABLE"
            searchBarConfig={{
              onFieldChange,
              onQuery: handleFilterQuery,
              fieldProps: {
                evalDateYearList: {
                  defaultValue: () => new Date().getFullYear(),
                },
              },
              editorProps: {
                selectType: {
                  optionsFilter: (record) => {
                    return record.get('value') !== 'CUSTOM';
                  },
                },
              },
            }}
          />
        )}
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
      'SDRP.SUPPLIER.PERFORMANCE_REPORT.TABLE',
      'SDRP.SUPPLIER.PERFORMANCE_REPORT.T_SEARCH',
    ],
  }),
  withProps(
    () => {
      return {
        ds: new DataSet(
          ReportDs({
            standardFlag: false,
            customizeUnitCodes: [
              'SDRP.SUPPLIER.PERFORMANCE_REPORT.TABLE',
              'SDRP.SUPPLIER.PERFORMANCE_REPORT.T_SEARCH',
            ],
          })
        ),
      };
    },
    { cacheState: true }
  )
)(SupplierPerformanceReport);
