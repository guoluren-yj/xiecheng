import React from 'react';
import intl from 'utils/intl';
import { Header } from 'components/Page';
import { Tag, Timeline } from 'choerodon-ui';
import { Icon } from 'choerodon-ui/pro';
import styles from './index.less';

const data = [
  { title: '发货工作台', quality: 10, tip: '超量送货' },
  { title: '发货工作台', quality: 10, tip: '超量送货' },
  { title: '发货工作台', quality: 10, tip: '超量送货' },
  { title: '发货工作台', quality: 10, tip: '超量送货' },
  { title: '发货工作台', quality: 10, tip: '超量送货' },
  { title: '发货工作台', quality: 10, tip: '超量送货' },
  { title: '发货工作台', quality: 10, tip: '超量送货' },
];

const Dashboard = props => {
  console.log(props, 'props');
  const { history } = props;
  return (
    <>
      <Header title={intl.get(`sinv.monitorDashboard.view.message.title`).d('异常数据监控平台')} />

      <div className={styles.wrap}>
        <div className={styles.left}>
          <div className={styles.leftTop}>
            <div className={styles.leftTopHeader}>
              <h3 className={styles.leftTopBusiness}>
                {intl.get(`sinv.monitorDashboard.view.message.title`).d('业务数据异常监控')}
              </h3>
              <div
                className={styles.showAll}
                onClick={() => history.push({ pathname: '/sinv/MonitorServiceDefine/index' })}
              >
                <span className={styles.all}>查看全部</span>
                <Icon style={{ paddingBottom: '3px' }} type="navigate_next" />
              </div>
            </div>

            <div className={styles.leftTopContent}>
              {data.map((i, index) => (
                <div className={`${styles.leftTopBottom} ${index}/3!==1?${styles.extra}:null`}>
                  <div className={styles.leftTopTitle}>{i.title}</div>
                  <div className={styles.leftTopQuality}>{i.quality}</div>
                  {/* <div>{i.tip}</div> */}
                  <Tag className={styles.leftTopTip} color="volcano">
                    {i.tip}
                  </Tag>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.leftBottom}>
            <div className={styles.leftTopHeader}>
              <h3 className={styles.leftTopServices}>
                {intl.get(`sinv.monitorDashboard.view.message.title`).d('服务数据异常监控')}
              </h3>
              <div className={styles.showAll}>
                <span className={styles.all}>查看全部</span>
                <Icon style={{ paddingBottom: '3px' }} type="navigate_next" />
              </div>
            </div>

            <div className={styles.leftTopContent}>
              {data.map(i => (
                <div className={styles.leftTopBottom}>
                  <div className={styles.leftTopTitle}>{i.title}</div>
                  <div className={styles.leftTopQuality}>{i.quality}</div>
                  {/* <div>{i.tip}</div> */}
                  <Tag className={styles.leftTopTip} color="volcano">
                    {i.tip}
                  </Tag>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.rightTitle}>
            {' '}
            {intl.get(`sinv.monitorDashboard.view.message.systemTitle`).d('系统消息')}
          </div>
          <div className={styles.rightTimeLine}>
            <Timeline>
              <Timeline.Item color="#FF7800" className={styles.rightTimeItem}>
                Create a services site 2015-09-01
              </Timeline.Item>
              <Timeline.Item color="#FF7800" className={styles.rightTimeItem}>
                Solve initial network problems 2015-09-01
              </Timeline.Item>
              <Timeline.Item color="#FF7800" className={styles.rightTimeItem}>
                Technical testing 2015-09-01
              </Timeline.Item>
              <Timeline.Item color="#FF7800" className={styles.rightTimeItem}>
                Network problems being solved 2015-09-01
              </Timeline.Item>
            </Timeline>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
