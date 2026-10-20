import React, { Fragment, useState } from 'react'; // useEffect
import { compose, isEmpty } from 'lodash';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';

import { Header, Content } from 'components/Page';
import { DataSet, Button, Modal, Dropdown } from 'choerodon-ui/pro';
import { Menu, Icon, Spin } from 'choerodon-ui';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import { yesOrNoRender, dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
// import CopyModal from './components/CopyModal';
// import { getCurrentOrganizationId } from 'utils/utils';
import { copyContainer, fetchContainerHistory } from '@/services/RequisitionPlanConfigServices';
import { listLineDS } from './stores/indexDS';
import { colorRender } from './util';
import styles from './index.less';

// const organizationId = getCurrentOrganizationId();
const Index = ({ dispatch, lineDs, customizeTable, location }) => {
  const [init, setInit] = React.useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleCopy = (record) => {
    const { containerCode } = record.get(['containerCode']);
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <p>
          {intl
            .get('srpm.common.view.copy_record', { containerCode })
            .d(`确认复制选中行【${containerCode}】？`)}
        </p>
      ),
      onOk: async () => {
        const data = getResponse(await copyContainer({ ...record.toData() }));
        if (data) {
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: `/srpm/requisition-plan-config/detail/${data.containerId}`,
            })
          );
        }
      },
    });
  };

  const toHistory = (e) => {
    openTab({
      key: `/srpm/requisition-plan-config/history/${e.containerId}`,
      title: `${e.containerName}-${e.version}`,
    });
  };

  const renderViewHistoryMenu = () => {
    return (
      <Spin spinning={historyLoading}>
        <Menu style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {!isEmpty(historyList) ? (
            historyList.map((e) => (
              <Menu.Item className={styles['menu-list-history']}>
                <a onClick={() => toHistory(e)}>
                  <div className={styles.version}>
                    {`${intl.get(`hzero.common.components.dataAudit.version`).d('版本')}${
                      e.version
                    }`}{' '}
                  </div>
                  <div className={styles.lastupdate_info}>
                    {`${e.lastUpdatedByName}${dateTimeRender(e.lastUpdateDate)}`}
                  </div>
                </a>
              </Menu.Item>
            ))
          ) : (
            <Menu.Item disabled>
              <span>{intl.get(`hzero.common.button.historyEmpty`).d('暂无历史版本信息')}</span>
            </Menu.Item>
          )}
        </Menu>
      </Spin>
    );
  };

  const renderAction = ({ record }) => {
    const btnList = [
      {
        name: 'edit',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        func: () => handleJumpDetail(record, 'edit'),
        hidden: false,
      },
      {
        name: 'copy',
        child: intl.get('hzero.common.button.copy').d('复制'),
        func: () => handleCopy(record),
        hidden: false,
      },
      {
        name: 'history',
        child: intl.get(`hzero.common.button.History`).d('历史版本'),
        hidden: record.get('version') === 1,
      },
    ];
    return btnList
      .filter((i) => !i.hidden)
      .map((e) => {
        if (e.name !== 'history') {
          return (
            <Button
              funcType="link"
              type="c7n-pro"
              onClick={e.func}
              className={styles['srpm-col-btn']}
            >
              {e.child}
            </Button>
          );
        } else {
          return (
            <Dropdown
              overlay={renderViewHistoryMenu()}
              onHiddenBeforeChange={(hidden) => {
                fetchHistoryList(record, hidden);
              }}
            >
              <Button
                type="c7n-pro"
                funcType="link"
                color="primary"
                className={styles['srpm-col-btn']}
              >
                {e.child}
                <Icon type="expand_more" style={{ fontSize: '14px' }} />
              </Button>
            </Dropdown>
          );
        }
      });
  };

  // 获取历史数据
  const fetchHistoryList = (record, hidden) => {
    // 隐藏
    if (!hidden) {
      // 已经查出来过，直接设值
      if (record.get('historyList')) {
        setHistoryList(record.get('historyList'));
      } else {
        setHistoryLoading(true);
        fetchContainerHistory(record.get('containerId'))
          .then((res) => {
            if (getResponse(res)) {
              setHistoryList(res);
              record.set({ historyList: res });
            } else {
              setHistoryList([]);
              record.set({ historyList: [] });
            }
          })
          .finally(() => {
            setHistoryLoading(false);
          });
      }
    } else {
      setHistoryList([]);
    }
  };

  const handleJumpDetail = (record, type) => {
    if (record) {
      if (type === 'edit') {
        dispatch(
          routerRedux.push({
            pathname: `/srpm/requisition-plan-config/detail/${record.get('containerId')}`,
          })
        );
      } else {
        dispatch(
          routerRedux.push({
            pathname: `/srpm/requisition-plan-config/detail-query/${record.get('containerId')}`,
          })
        );
      }
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/srpm/requisition-plan-config/detail/new`,
        })
      );
    }
  };

  const HeaderBtn = observer(() => {
    return (
      <Button
        icon="add"
        color="primary"
        type="c7n-pro"
        funcType="raised"
        onClick={() => handleJumpDetail()}
      >
        {intl.get(`hzero.common.button.create`).d('新建')}
      </Button>
    );
  });

  const handleQuery = ({ params = {} }) => {
    const { state: { _back } = {} } = location;
    lineDs.queryDataSet.loadData([{ ...params }]);
    if (_back === -1 && !init) {
      lineDs.query(lineDs.currentPage);
    } else {
      lineDs.query();
    }
    setInit(true);
  };

  const lineColumns = [
    {
      name: 'containerStatus',
      width: 150,
      renderer: ({ value, record }) => colorRender(value, record.get('containerStatusMeaning')),
    },
    {
      name: 'operator',
      width: 180,
      renderer: ({ record }) => renderAction({ record }),
    },
    {
      name: 'containerCode',
      width: 200,
      tooltip: 'overflow',
      renderer: ({ value, record }) => (
        <div className="row-agent-column">
          <a onClick={() => handleJumpDetail(record)} style={{ paddingRight: '8px' }}>
            {value}
          </a>
        </div>
      ),
    },
    {
      name: 'containerName',
      width: 300,
      tooltip: 'overflow',
    },
    // {
    //   name: 'templateType',
    //   width: 120,
    //   tooltip: 'overflow',
    // },
    {
      name: 'version',
      width: 150,
      tooltip: 'overflow',
    },
    // {
    //   name: 'enabledFlag',
    //   width: 150,
    //   tooltip: 'overflow',
    //   renderer: ({ value }) => yesOrNoRender(Number(value)),
    // },
    {
      name: 'defaultCheckFlag',
      width: 150,
      tooltip: 'overflow',
      renderer: ({ value }) => yesOrNoRender(Number(value)),
    },
    {
      name: 'effectiveTime',
      width: 300,
      tooltip: 'overflow',
    },
    {
      name: 'creationDate',
      width: 150,
      tooltip: 'overflow',
    },
  ];

  return (
    <Fragment>
      <Header title={intl.get('srpm.common.title.requisitionPlanConfig').d('需求计划配置')}>
        <HeaderBtn currentDs={lineDs} />
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 196px)' }}>
          {customizeTable(
            {
              code: 'SRPM.RP_CONFIG_LIST.TABLE',
            },
            <SearchBarTable
              style={{ maxHeight: 'calc(100% - 22px)' }}
              searchCode="SRPM.RP_CONFIG_LIST.SEARCHBAR"
              dataSet={lineDs}
              columns={lineColumns}
              cacheState
              searchBarConfig={{
                onQuery: handleQuery,
                checkDataSetStatus: false,
              }}
            />
          )}
        </div>
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(),
  formatterCollections({
    code: [
      'srpm.common',
      'hzero.common',
      'hzero.c7nProUI',
      'entity.company',
      'entity.business',
      'entity.organization',
      'entity.roles',
      'entity.item',
    ],
  }),
  withCustomize({
    unitCode: ['SRPM.RP_CONFIG_LIST.TABLE'],
  }),
  withProps(
    () => {
      const lineDs = new DataSet(listLineDS());
      return {
        lineDs,
      };
    },
    { cacheState: true }
  )
)(Index);
