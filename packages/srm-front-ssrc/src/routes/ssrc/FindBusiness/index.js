/*
 * @author: biao.zhu@going-link.com
 * @Date: 2024-08-14 20:00:00
 * @LastEditTime: 2024-09-27 11:19:34
 * @Description: 发现商机
 * @copyright: Copyright (c) 2020, Hand
 */
import qs from 'query-string';
import { compose } from 'lodash';
import { Spin } from 'choerodon-ui';
import { observer } from 'mobx-react';
import React, { useState, useEffect } from 'react';
import { DataSet, Table, TextField, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { Header } from 'components/Page';
import FilterBarTable from '_components/FilterBarTable';
import { getResponse, getCurrentLanguage } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryPrintUuid } from '@/services/findBusinessService';

import { sizeChangerRenderer } from './render';
import ColumnItem from './components/ColumnItem';
import { memberShipQuery } from './utils';
import { tableDS, searchDS } from './store';

import styles from './index.less';

const { Column } = Table;
const Index = (props) => {
  const { history, tableDs, searchDs } = props || {};

  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);

  const init = async () => {
    tableDs.query();
  };

  useEffect(() => {
    init();
  }, []);

  const handleSearch = () => {
    const searchText = searchDs?.current?.get('searchText');
    tableDs.setQueryParameter('searchText', searchText);
    tableDs.query();
  };

  const handleView = async (record) => {
    setLoading(true);
    const rfxHeaderVipId = record.get('rfxHeaderVipId');
    // const printUuid = '3099a3c4b5a32d42d99e89aaa77c639022'; // 测试使用
    const language = getCurrentLanguage();
    // 获取不同语言环境的附件ID
    const uuid = language === 'zh_CN' ? 'previewZhUuid' : 'previewEnUuid';
    const previewUuid = record.get(uuid);
    if (previewUuid) {
      history.push({
        pathname: `/ssrc/find-business-opportunities/${rfxHeaderVipId}`,
        search: qs.stringify({
          attachmentUUID: previewUuid,
        }),
      });
    } else {
      const res = await queryPrintUuid({ rfxHeaderVipId });
      const previewUUid = res[uuid];
      if (getResponse(res) && previewUUid) {
        history.push({
          pathname: `/ssrc/find-business-opportunities/${rfxHeaderVipId}`,
          search: qs.stringify({
            attachmentUUID: previewUUid,
          }),
        });
      }
    }
    setLoading(false);
  };

  const leftRender = () => (
    <>
      <div className="search-title">
        {intl.get('ssrc.findBusiness.view.message.title.menu').d('发现商机')}
      </div>
      <TextField
        name="searchText"
        wait={300}
        trim
        clearButton
        dataSet={searchDs}
        onClear={handleSearch}
        onEnterDown={handleSearch}
        placeholder={intl
          .get('ssrc.findBusiness.view.message.title.search.placeholder')
          .d('请输入您要查询的内容')}
      />
      <Button funcType="raised" icon="null" color="primary" onClick={handleSearch}>
        {intl.get('ssrc.findBusiness.button.query').d('搜索')}
      </Button>
    </>
  );

  return (
    <>
      <Header title={intl.get('ssrc.findBusiness.view.message.title.menu').d('发现商机')} />
      <div className={styles['business-page-content']}>
        <div className={styles['page-content']}>
          <div className="total">
            {intl
            .getHTML('ssrc.findBusiness.view.message.table.total', {
              total: tableDs.totalCount || 0,
            })
            .d('共 <span class="count">{total}</span> 条筛选结果')}
          </div>
          <Spin spinning={loading}>
            <FilterBarTable
              dataSet={tableDs}
              cacheState
              className={styles['business-table-wrapper']}
              showHeader={false}
              rowHeight={92}
              style={{ maxHeight: 'calc(100vh - 230px)', minHeight: '350px' }}
              filterBarConfig={{
              cacheKey: 'find-business-list',
              refreshButton: false,
              expand: true,
              fields: [
                {
                  name: 'releasedDate',
                  type: 'date',
                  lock: true,
                  display: true,
                  sortFlag: true,
                  order: 'desc',
                  range: ['start', 'end'],
                  label: intl.get('ssrc.findBusiness.model.common.releaseDate').d('发布日期'),
                },
                {
                  name: 'quotationEndDate',
                  sortFlag: true,
                  order: 'desc',
                  label: intl
                    .get('ssrc.findBusiness.model.common.quotationEndDate')
                    .d('报价截止时间'),
                },
                {
                  name: 'bidFileExpense',
                  type: 'number',
                  lock: true,
                  display: true,
                  range: ['start', 'end'],
                  label: intl.get('ssrc.findBusiness.model.common.bidFileExpense').d('招标文件费'),
                },
                {
                  name: 'bidBond',
                  type: 'number',
                  lock: true,
                  display: true,
                  range: ['start', 'end'],
                  label: intl.get('ssrc.findBusiness.model.common.bidBond').d('保证金'),
                },
              ],
              left: {
                render: (_, ds) => leftRender(ds),
              },
              defaultSortedField: 'releasedDate',
              defaultSortedOrder: 'desc',
            }}
              pagination={{
              hideOnSinglePage: false,
              showSizeChangerLabel: false,
              showTotal: false,
              showPager: true,
              showQuickJumper: false,
              sizeChangerPosition: 'right',
              sizeChangerOptionRenderer: sizeChangerRenderer,
            }}
            >
              <Column
                name="business"
                header={null}
                renderer={({ record, dataSet }) => (
                  <ColumnItem dataSet={dataSet} record={record} onClick={() => handleView(record)} />
              )}
              />
            </FilterBarTable>
          </Spin>
        </div>
      </div>
    </>
  );
};

export default compose(
  formatterCollections({
    code: ['ssrc.findBusiness', 'hzero.common', 'ssrc.common'],
  }),
  withProps(
    () => {
      const tableDs = new DataSet(tableDS({}));
      const searchDs = new DataSet(searchDS({}));
      return {
        tableDs,
        searchDs,
      };
    },
    { cacheState: true }
  ),
  memberShipQuery()
)(observer(Index));
