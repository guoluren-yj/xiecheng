/**
 * 详情
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Pagination } from 'choerodon-ui/pro/lib';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import Context, { IStore } from '@/routes/ScriptUtility/store';
import constructServicePointsDataSet from '@/routes/ScriptUtility/datasets/constructServicePointsDataSet';
import EmptyDataImg from '@/assets/empty_data.png';
import Card from '../Card';
import styles from '../index.less';

interface Info {
  servicePointCode?: string;
  servicePointDesc?: string;
}

export default observer(() => {
  const { store } = useContext<{ store: IStore }>(Context as any);
  const [utilityInfo, setUtilityInfo] = useState<Info>({});

  // on: init //

  const servicePointsDataSet = useMemo(() => {
    return constructServicePointsDataSet();
  }, []);

  useEffect(() => {
    const selectedServicePoint: any = store.getState('selectedServicePoint');
    servicePointsDataSet.setQueryParameter('servicePointId', selectedServicePoint.servicePointId);
    servicePointsDataSet.query();
    setUtilityInfo(selectedServicePoint);
  }, [store.state.selectedServicePoint]);

  // edit
  const handleEdit = (data) => {
    store.setState('scriptUtilityInfo', data);
    store.setState('mainPage', 'edit');
  };

  // render //
  return (
    <>
      {utilityInfo.servicePointCode ? (
        <div className={styles.header}>
          <div>
            <span className={styles.title}>{utilityInfo.servicePointCode}</span>
            <Button
              color={ButtonColor.primary}
              onClick={() => store.setState('currentPage', 'add')}
            >
              新建
            </Button>
          </div>
          <div className={styles.remark}>
            <span className={styles.desc}>描述:</span>
            <span>{utilityInfo.servicePointDesc}</span>
          </div>
        </div>
      ) : null}
      {servicePointsDataSet?.toData()?.length ? (
        <>
          <div className={styles.list}>
            {servicePointsDataSet.toData().map((item: any) => (
              <Card
                key={item.id}
                data={{ ...item, servicePointCode: utilityInfo.servicePointCode }}
                servicePointId={servicePointsDataSet.getQueryParameter('servicePointId')}
                handleEdit={handleEdit}
                handleRefresh={() => servicePointsDataSet.query()}
              />
            ))}
          </div>
          <Pagination
            dataSet={servicePointsDataSet}
            showPager
            showTotal={(total) => `共 ${total} 条`}
            pageSizeOptions={['10', '20', '50', '100']}
            className={styles.pagination}
          />
        </>
      ) : (
        <div className={styles.empty}>
          <img className={styles['empty-img']} src={EmptyDataImg} alt="" />
          <div className={styles['empty-title']}>暂无脚本应用</div>
        </div>
      )}
    </>
  );
});
