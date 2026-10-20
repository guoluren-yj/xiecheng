/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, Table, Spin, Pagination, DataSet } from 'choerodon-ui/pro';
import { ButtonColor, ButtonType } from 'choerodon-ui/pro/lib/button/enum';
import { Nav, Footer } from 'srm-front-boot/lib/components/PortalCard';
import request from 'hzero-front/lib/utils/request';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import Cookies from 'universal-cookie';
import { getResponse, setSession } from 'hzero-front/lib/utils/utils';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import styles from './index.less';

const cookie = new Cookies();
export default function ResourceCenter() {
  const langInfoRef = useMemo(() => ({ current: {}, valueListMeaningMap: {} }), []);
  // const [, setLangInfoLoaded] = useState({});
  const [pagination, setPagination] = useState({});
  const [init, setInit] = useState(false);
  const [loading, setLoading] = useState(true);
  const langInfo = langInfoRef.current || {};
  const dsRef = useMemo<{ current?: DataSet }>(() => ({ current: undefined }), []);
  useMemo(() => {
    dsRef.current = new DataSet({
      fields: [
        {
          name: 'title',
          label: langInfoRef.current['spfm.commonProblem.problem.title'] || '问题标题',
        },
        {
          name: 'publishDate',
          label: langInfoRef.current['spfm.commonProblem.problem.publish.date'] || '发布时间',
        },
      ],
    });
  }, [init]);

  useEffect(() => {
    Promise.all([
      queryIntl().then(() => {
        setInit(true);
        return searchCallback();
      }),
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  const queryIntl = useCallback(() => {
    const { HZERO_PLATFORM } = getEnvConfig() as any;
    const lang = cookie.get('language') || 'zh_CN';
    return request(`${HZERO_PLATFORM}/v1/prompt/${lang}`, {
      method: 'GET',
      query: {
        promptKey: 'spfm.commonProblem,hzero.common,srm.common,srm.oauth',
      },
    }).then((res) => {
      if (getResponse(res)) {
        langInfoRef.current = res;
        setSession(`${lang}-srm.portal`, res);
        // setLangInfoLoaded(true);
      }
    });
  }, []);

  const searchCallback = useCallback(() => {
    const input = document.getElementById('resource-search') as HTMLInputElement;
    processLoading(true);
    return queryList({ page: 0, size: 20, title: input.value })
      .then((res) => {
        if (res) {
          dsRef.current!.loadData(res.content);
          setPagination({ page: res.number + 1, pageSize: res.size, total: res.totalElements });
        }
      })
      .finally(() => {
        processLoading(false);
      });
  }, [dsRef.current!]);

  const handlePageChange = useCallback((page, pageSize) => {
    const input = document.getElementById('resource-search') as HTMLInputElement;
    processLoading(true);
    return queryList({ page: page - 1, pageSize, title: input.value })
      .then((res) => {
        if (res) {
          dsRef.current!.loadData(res.content);
          setPagination({ page: res.number + 1, pageSize: res.size, total: res.totalElements });
        }
      })
      .finally(() => {
        processLoading(false);
      });
  }, []);
  const processLoading = useCallback((status) => {
    setLoading(status);
    if (status) {
      dsRef.current!.status = DataSetStatus.loading;
    } else dsRef.current!.status = DataSetStatus.ready;
  }, []);

  const goDetail = useCallback((id) => {
    window.open(`/app/public/portal/common_problem/detail/${id}`);
  }, []);

  const columns = React.useMemo(
    () => [
      {
        name: 'title',
        renderer: (options) => {
          const { record, value } = options;
          return <a onClick={() => goDetail(record.get('id'))}>{value}</a>;
        },
      },
      {
        name: 'publishDate',
      },
    ],
    [init]
  );

  const isEmpty = !dsRef.current!.length;
  return (
    <Spin spinning={!init}>
      <div className={styles['resource-center']}>
        {init && <Nav auto />}
        <section className="search-area">
          <header>{langInfo['spfm.commonProblem.title'] || '常见问题'}</header>
          <form>
            <div className="search-input" onClick={interceptDefault}>
              <Icon type="search" />
              <input
                autoComplete="off"
                type="text"
                name="search"
                id="resource-search"
                placeholder={
                  langInfo['srm.oauth.platformNotice.enterWantQuery'] || '请输入您要查询的内容'
                }
              />
              <Button type={ButtonType.submit} color={ButtonColor.primary} onClick={searchCallback}>
                {langInfo['srm.common.view.title.search'] || '搜索'}
              </Button>
            </div>
          </form>
        </section>
        <section className="content">
          <Spin spinning={init && loading}>
            <section className={`content-detail${isEmpty ? ' no-data' : ''}`}>
              {isEmpty && <span>{langInfo['hzero.common.message.data.none'] || '暂无数据'}</span>}
              {!isEmpty && (
                <>
                  <Table
                    className="table-wrap-resource"
                    selectionMode={SelectionMode.none}
                    dataSet={dsRef.current!}
                    columns={columns}
                    style={{ height: 487 }}
                    headerRowHeight={18}
                    rowHeight="auto"
                    highLightRow={false}
                  />
                  <Pagination {...pagination} onChange={handlePageChange} />
                </>
              )}
            </section>
          </Spin>
        </section>
        {init && <Footer auto />}
      </div>
    </Spin>
  );
}

function interceptDefault(e) {
  e.stopPropagation();
  e.preventDefault();
}

function queryList(query): Promise<any> {
  const orgid = cookie.get('tenantId') || cookie.get('hostTenantId');
  const noticeUrl = `/marmot/v1/${orgid}/marmot-api-public/ulicjpM27rNibQicOsOmlN8pq1VuRk9A8UwdicZRY3SODsE`;
  return request(noticeUrl, { method: 'GET', query }).then((res) => {
    if (getResponse(res)) {
      return res;
    }
  });
}
