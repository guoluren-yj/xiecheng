/*
 * @Date: 2024-08-13 14:51:19
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import { Select, Icon, Table, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import SearchBar from '_components/SearchBarTable/SearchBar';

import { NoDataRender } from '@/routes/components/utils/render';
import { downLoadUrlFile, downLoadUuidFile } from '@/routes/components/utils/file';

import styles from './styles.less';
import ProductCard from './components/ProductCard';
import EnterpriseCard from './components/EnterpriseCard';

const { Option } = Select;

const Index = ({
  valueList,
  onInvite,
  dataSet,
  searchCode,
  onRiskScan,
  setLoading,
  dimensionValue,
  onDimensionChange,
}) => {
  const [noDataFlag, setNoDataFlag] = useState(true);
  const [renderFlag, setRenderFlag] = useState(false);

  const handleQuery = ({ params, currentPage }) => {
    dataSet.setQueryParameter('queryParams', params);
    dataSet.query(currentPage).then(response => {
      if (response && !isEmpty(response.content)) {
        setNoDataFlag(false);
      } else {
        setNoDataFlag(true);
      }
      setRenderFlag(true);
    });
  };

  const getButtons = record =>
    [
      {
        name: 'isScan',
        onClick: () => onRiskScan(record),
        child: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
      },
      {
        name: 'initiateInvitation',
        onClick: () => onInvite(record),
        child: intl.get('sslm.common.model.common.initiateInvitation').d('发起邀约'),
      },
      {
        name: 'scanReportDownload',
        hidden: !record?.get('fileUrl'),
        child: intl.get('sslm.common.view.button.scanReportDownload').d('扫描报告下载'),
        onClick: () => downLoadUrlFile({ url: record?.get('fileUrl'), setLoading }),
      },
      {
        name: 'riskInfoView',
        hidden: !record?.get('riskFileUrl'),
        child: intl.get('sslm.common.view.button.riskInfoView').d('风险信息查看'),
        onClick: () => downLoadUrlFile({ url: record?.get('riskFileUrl'), setLoading }),
      },
      {
        name: 'aptitudeDocDownload',
        hidden: dimensionValue !== 'product',
        child: intl.get('sslm.common.model.common.aptitudeDocDownload').d('资质文件下载'),
        onClick: () => downLoadUuidFile({ uuid: record?.get('authAttachmentUuid'), setLoading }),
      },
    ].filter(btn => !btn.hidden);

  // 筛选器左侧渲染
  const renderSearchBarLeft = () => {
    const { dimensionList = [] } = valueList;
    return (
      <Select
        clearButton={false}
        style={{ width: 120 }}
        value={dimensionValue}
        onChange={onDimensionChange}
        suffix={<Icon type="expand_more" style={{ marginLeft: -8 }} />}
      >
        {dimensionList.map(item => (
          <Option value={item.value}>{item.meaning}</Option>
        ))}
      </Select>
    );
  };

  const columns = [
    {
      name: 'combination',
      tooltip: 'none',
      renderer: ({ record }) => {
        return dimensionValue === 'product' ? (
          <ProductCard record={record} getButtons={getButtons} />
        ) : (
          <EnterpriseCard record={record} getButtons={getButtons} />
        );
      },
    },
  ];

  return (
    <div className={styles['member-supplier']}>
      <SearchBar
        cacheState
        key={searchCode}
        dataSet={[dataSet]}
        searchCode={searchCode}
        onQuery={handleQuery}
        left={{
          render: renderSearchBarLeft,
        }}
      />
      {renderFlag ? (
        noDataFlag ? (
          <NoDataRender style={{ height: 'calc(100vh - 400px)' }} />
        ) : (
          <Table
            queryBar="none"
            columns={columns}
            showHeader={false}
            highLightRow={false}
            dataSet={dataSet}
            virtual={false}
            virtualCell={false}
            style={{ maxHeight: `calc(100% - 130px)` }}
            pagination={{
              showTotal: false,
              showPager: true,
              showQuickJumper: false,
              showSizeChangerLabel: false,
              sizeChangerPosition: 'right',
              sizeChangerOptionRenderer: ({ text }) => {
                return intl
                  .get('sslm.common.table.pagination', {
                    num: text,
                  })
                  .d(`${text} 条/页`);
              },
            }}
          />
        )
      ) : (
        <Spin spinning />
      )}
    </div>
  );
};

export default Index;
