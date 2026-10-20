import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Popover } from 'choerodon-ui';
import { DataSet, Spin, TextField, Icon, Form, Button, Select, Lov } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import TagPro from '@/components/TagPro';
import { fetchIntentLetters } from './api';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

const DataList = observer(({ dataSet, letterId, onSelect }) => {
  return dataSet.length < 1 ? (
    <div className="no-data">{intl.get(`smpc.product.model.noData`).d('暂无数据')}</div>
  ) : (
    dataSet.map((m) => {
      const {
        letterId: lId,
        letterCode,
        letterStatus,
        sendCompanyName,
        letterStatusMeaning,
      } = m.get([
        'letterId',
        'letterCode',
        'letterStatus',
        'sendCompanyName',
        'letterStatusMeaning',
      ]);
      const letterStatusColor =
        letterStatus === 'APPROVE' ? 'success' : letterStatus === 'REJECT' ? 'invalid' : 'default';

      return (
        <div
          className={classNames({
            'intent-item': true,
            'intent-item-active': letterId === lId,
          })}
          onClick={() => onSelect(m.toData())}
        >
          <div className="intent-info">
            <span className="intent-num">{letterCode}</span>
            <TagPro color={letterStatusColor} fontWeight={600}>
              {letterStatusMeaning}
            </TagPro>
          </div>
          <div className="intent-company">
            {intl.get('smkt.busiOpport.view.intentCompany').d('意向方')}：{sendCompanyName}
          </div>
        </div>
      );
    })
  );
});

function FilterSearch({ dataSet, onSearch = (e) => e }) {
  const [visible, setVisible] = useState(false);
  const lovFocus = useRef(false);

  function handleVisibleChange(v) {
    if (!lovFocus.current) {
      setVisible(v);
    }
  }

  const filterContent = (
    <div className={styles['filter-content']}>
      <Form dataSet={dataSet} labelAlign="left" useColon={false}>
        <Select
          name="letterStatus"
          placeholder={intl.get('smkt.busiOpport.view.plsSelStatus').d('请选择状态')}
        />
        <Lov
          name="sendCompanyLov"
          // viewMode="popup"
          onFocus={() => {
            lovFocus.current = true;
          }}
          onBlur={() => {
            lovFocus.current = false;
          }}
          modalProps={{ title: intl.get('smkt.busiOpport.view.intentCompany').d('意向方') }}
          placeholder={intl.get('smkt.busiOpport.view.plsSelIntentQuery').d('请选择意向方查询')}
        />
      </Form>
      <div className="filter-footer">
        <Button
          color="primary"
          onClick={() => {
            setVisible(false);
            onSearch();
          }}
        >
          {intl.get('hzero.common.button.search').d('查询')}
        </Button>
        <Button style={{ marginRight: 8 }} onClick={() => dataSet.reset()}>
          {intl.get('hzero.common.button.reset').d('重置')}
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      visible={visible}
      content={filterContent}
      trigger="click"
      arrowPointAtCenter
      placement="bottomLeft"
      popupStyle={{ zIndex: 999 }}
      popupClassName={styles['filter-popover']}
      onVisibleChange={handleVisibleChange}
    >
      <div className={classNames({ 'search-filter': true, 'filter-visible': visible })}>
        <Icon type="filter_list" />
      </div>
    </Popover>
  );
}

export default function IntentList(props) {
  const { refresh, loading, letterId, onSelect = (e) => e } = props;
  const dataSet = useMemo(() => new DataSet({ paging: false }), []);
  const container = useRef();
  const contentDom = useRef();
  const pageRecord = useRef({
    page: 0,
    size: 20, // 每次加载条数
    initSize: 20, // 初次加载条数，目的是超过生成滚动条
    isMore: true, // 是否还有更多
  });

  const queryDataSet = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          { name: 'letterCode' },
          {
            name: 'letterStatus',
            lookupCode: 'SMKT.LETTER_STATUS',
            label: intl.get('hzero.common.status').d('状态'),
          },
          {
            name: 'sendCompanyLov',
            type: 'object',
            lovCode: 'SMKT.PURCHASE_COMPANY',
            lovPara: { tenantId: organizationId },
            label: intl.get('smkt.busiOpport.view.intentCompany').d('意向方'),
          },
          { name: 'sendCompanyId', bind: 'sendCompanyLov.companyId' },
        ],
      }),
    []
  );

  useEffect(() => {
    const { initSize } = pageRecord.current;
    if (container.current) {
      handleSearch();
      const contentHeight = container.current.clientHeight - 65;
      const maxSize = Math.ceil(contentHeight / 70) + 1;
      if (maxSize > initSize) {
        pageRecord.current = {
          ...pageRecord.current,
          initSize: maxSize,
        };
      }
      container.current.addEventListener('scroll', handleLoadMore);
    }
    handleSearch();
    return () => {
      container.current.removeEventListener('scroll', handleLoadMore);
    };
  }, [refresh]);

  async function handleSearch(loadMore = false) {
    const { page, size, initSize } = pageRecord.current;
    const params = queryDataSet.current.get(['letterCode', 'letterStatus', 'sendCompanyId']);
    const pages = loadMore ? { page: page + 1, size } : { page: 0, size: initSize };
    dataSet.status = 'loading';
    const res = getResponse(await fetchIntentLetters({ ...params, ...pages }));
    dataSet.status = 'ready';
    if (res) {
      const { totalElements, content } = res;
      if (loadMore) dataSet.appendData(content);
      else {
        dataSet.loadData(content);
        if (letterId) {
          const findLetter = content.find((f) => f.letterId === letterId);
          if (findLetter) {
            onSelect(findLetter);
          } else {
            onSelect(content[0] || {});
          }
        } else {
          onSelect(content[0] || {});
        }
      }
      pageRecord.current = {
        ...pageRecord.current,
        page: content.length > 0 ? page + 1 : page,
        isMore: dataSet.length < totalElements,
      };
    }
  }

  function handleLoadMore() {
    const { isMore } = pageRecord.current;
    const { scrollTop, clientHeight: containerHeight } = container.current;
    const { clientHeight: contentHeight } = contentDom.current;
    if (isMore && scrollTop + containerHeight >= contentHeight) {
      handleSearch(true);
    }
  }

  return (
    <div className={styles['intent-list-wrapper']} ref={container}>
      <Spin dataSet={dataSet} spinning={loading}>
        <div ref={contentDom}>
          <div className="intent-list-header">
            <TextField
              clearButton
              dataSet={queryDataSet}
              name="letterCode"
              style={{ width: 212, heigth: 32 }}
              placeholder={intl.get('smkt.busiOpport.view.plsIntentCode').d('请输入意向单编码查询')}
              prefix={<Icon type="search" />}
              onChange={() => handleSearch()}
            />
            <FilterSearch dataSet={queryDataSet} onSearch={() => handleSearch()} />
          </div>
          <div className="intent-list-body">
            <DataList dataSet={dataSet} letterId={letterId} onSelect={onSelect} />
          </div>
        </div>
      </Spin>
    </div>
  );
}
