import React, { useContext, useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { Collapse, Icon } from 'choerodon-ui';
import { DataSet, Form, Lov } from 'choerodon-ui/pro/lib';
import Context, { IStore } from '@/routes/ScriptUtility/store';
import { List } from 'components/Page';
import { constructQueryPointsDataSet } from '@/routes/ScriptUtility/datasets/constructQueryPointsDataSet';
import { compact } from 'lodash';

import styles from './index.less';

const { Panel } = Collapse;

export default observer(() => {
  const { store } = useContext<{ store: IStore }>(Context as any);
  const [servicePointId, setServicePointId] = useState<string>('');
  const [activeKey, setActiveKey] = useState<string[]>([]);

  // on: init //
  const queryPointsDataDS = useMemo(() => {
    return constructQueryPointsDataSet();
  }, []);

  const queryPointsItemDataDS = useMemo(() => {
    return constructQueryPointsDataSet();
  }, []);

  // get data
  const handleSearchData = async (params, isFirst?: boolean) => {
    const current = queryPointsDataDS.current?.get('data');
    const num = current.findIndex(
      (r) => r.serviceName === params.serviceName && !r.servicePoints?.length
    );
    if (num === -1) return;
    queryPointsItemDataDS.setQueryParameter('serviceName', params.serviceName);
    const res = await queryPointsItemDataDS.query();
    if (queryPointsDataDS.current && res?.data[0]) {
      current.splice(num, 1, res.data[0]);
      queryPointsDataDS.current.set('data', current);
    }
    if (isFirst && res?.data[0]) {
      const first = res?.data[0];
      if (first?.servicePoints[0]) handleJumpDetail(first?.servicePoints[0]);
    }
  };

  const handleCollapseChange = (word) => {
    setActiveKey(word);
    if (word.length > activeKey.length) {
      // 展开
      handleSearchData({ serviceName: word[word.length - 1] });
    }
  };

  const handleJumpDetail = (val) => {
    setServicePointId(val.servicePointId);
    store.setState('selectedServicePoint', val);
    store.setState('currentServiceName', val.pointServiceName);
    store.setState('mainPage', 'detail');
  };

  useEffect(() => {
    if (!queryPointsDataDS.toData().length) return;
    const list: any = queryPointsDataDS.toData()[0];
    const result = list.data || [];
    if (!result?.length) return;
    if (!activeKey.length) {
      // 首次加载,默认请求第一列子集,并展开
      setActiveKey([result[0]?.serviceName]);
      handleSearchData({ serviceName: result[0].serviceName }, true);
    } else {
      setActiveKey(compact(result.map((item) => item.servicePoints && item.serviceName)));
    }
  }, [queryPointsDataDS.current]);

  useEffect(() => {
    //
  }, [queryPointsDataDS.toData()]);

  // render //
  return (
    <List
      className={styles.sidelist}
      title="serviceName"
      content={[
        {
          name: 'serviceName',
          render: () => {
            // const { data } = res;
            const { data }: any = queryPointsDataDS.toData()[0];
            if (!queryPointsDataDS.toData()?.length) return;
            return (
              <Collapse bordered={false} onChange={handleCollapseChange} activeKey={activeKey}>
                {data?.map((val) => (
                  <Panel header={val.serviceName} key={val.serviceName}>
                    {val?.servicePoints?.map((v) => (
                      <div
                        key={v.serviceName}
                        className={classnames({
                          [styles['accordion-comp']]: true,
                          [styles.active]: v.servicePointId === servicePointId,
                        })}
                        onClick={() => handleJumpDetail(v)}
                      >
                        <div className={styles['accordion-code']}>
                          <Icon type="project_filled" />
                          <span>{v.servicePointCode}</span>
                        </div>
                        <div className={styles['accordion-desc']}>{v.servicePointDesc}</div>
                      </div>
                    ))}
                  </Panel>
                ))}
              </Collapse>
            );
          },
        },
      ]}
      // itemRender={() => {
      //   // const { data } = res;
      //   const { data }: any = queryPointsDataDS.toData()[0];
      //   if (!queryPointsDataDS.toData()?.length) return;
      //   return (
      //     <Collapse bordered={false} onChange={handleCollapseChange} activeKey={activeKey}>
      //       {data?.map((val) => (
      //         <Panel header={val.serviceName} key={val.serviceName}>
      //           {val?.servicePoints?.map((v) => (
      //             <div
      //               key={v.serviceName}
      //               className={classnames({
      //                 [styles['accordion-comp']]: true,
      //                 [styles.active]: v.servicePointId === servicePointId,
      //               })}
      //               onClick={() => handleJumpDetail(v)}
      //             >
      //               <div className={styles['accordion-code']}>
      //                 <Icon type="project_filled" />
      //                 <span>{v.servicePointCode}</span>
      //               </div>
      //               <div className={styles['accordion-desc']}>{v.servicePointDesc}</div>
      //             </div>
      //           ))}
      //         </Panel>
      //       ))}
      //     </Collapse>
      //   );
      // }}
      dataSet={queryPointsDataDS}
      // @ts-ignore
      searchForm={() => <SearchForm queryDS={queryPointsDataDS.queryDataSet!} />}
      // renderSearchForm={() => <SearchForm queryDS={queryPointsDataDS.queryDataSet!} />}
      autoLoadMore={false}
    />
  );
});

function SearchForm(props: { queryDS: DataSet }) {
  return (
    <Form dataSet={props.queryDS}>
      <Lov name="organizationIdLov" />
    </Form>
  );
}
