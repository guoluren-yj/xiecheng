import React, { Fragment, useMemo, useState } from 'react';
import { Button, DataSet, CheckBox, Dropdown, Menu, Modal, Icon, Spin } from 'choerodon-ui/pro';
import { Tag, Popconfirm } from 'choerodon-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { compose, isEmpty } from 'lodash';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { fetchHistory, unlock, copy, enable, disable } from '@/services/budgetTemplateService';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { dateTimeRender } from 'utils/renderer'; //日期时间格式化
import TableDs from './stores/listDs';
import { colorRender } from './util';

import styles from './index.less';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
const { Item: MenuItem } = Menu;
const Index = function Index(props) {
  const { customizeTable, dispatch, tableDs } = props;

  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState([]);

  // 进入编辑和新建详情页
  const handleToEditDetail = record => {
    if (record) {
      dispatch(
        routerRedux.push({
          pathname: `/sbud/budget-template/detail/${record.get('budgetTemplateId')}`,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sbud/budget-template/detail/new`,
        })
      );
    }
  };

  // 获取历史数据
  const fetchHistoryList = (record, hidden) => {
    // 隐藏
    if (!hidden) {
      setHistoryLoading(true);
      fetchHistory(record.get('budgetTemplateId'))
        .then(res => {
          if (getResponse(res)) {
            setHistoryList(res);
          } else {
            setHistoryList([]);
          }
        })
        .finally(() => {
          setHistoryLoading(false);
        });
    } else {
      setHistoryList([]);
    }
  };

  // 复制
  const handleCopy = record => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: <div>{intl.get(`${commonPrompt}.copyLine`).d('确认复制该行？')}</div>,
    }).then(button => {
      if (button === 'ok') {
        const { selected } = tableDs;
        const data = selected.map(record => record.toData());
        return new Promise(resolve => {
          copy({
            ...record.toData(),
          })
            .then(res => {
              if (getResponse(res)) {
                notification.success();
                dispatch(
                  routerRedux.push({
                    pathname: `/sbud/budget-template/detail/${res.budgetTemplateId}`,
                  })
                );
              }
            })
            .finally(() => {
              resolve();
            });
        });
      }
    });
  };

  // 解锁
  const handleUnlock = record => {
    return new Promise(resolve => {
      unlock({
        ...record.toData(),
      })
        .then(res => {
          if (getResponse(res)) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/sbud/budget-template/detail/${res.budgetTemplateId}`,
              })
            );
          }
        })
        .finally(() => {
          resolve();
        });
    });
  };

  // 启用或禁用
  const statusChange = record => {
    return new Promise(resolve => {
      const request = String(record.get('enabledFlag')) === '0' ? enable : disable;

      request({
        ...record.toData(),
        enabledFlag: String(record.get('enabledFlag')) === '1' ? '0' : '1',
      })
        .then(res => {
          if (getResponse(res)) {
            notification.success();
            tableDs.query();
          }
        })
        .finally(() => {
          resolve();
        });
    });
  };

  // 进入历史查看页面
  const toHistory = e => {
    dispatch(
      routerRedux.push({
        pathname: `/sbud/budget-template/history/${e.budgetTemplateId}`,
        search: `?version=${e.version}`,
      })
    );
  };

  // 进入只读详情页
  const toReadOnlyDetail = record => {
    const type =
      (!record?.parent || record.parent?.get('enabledFlag') === 1) &&
        record.get('templateStatus') === 'UNRELEASED'
        ? 'edit'
        : 'read';

    dispatch(
      routerRedux.push({
        pathname: `/sbud/budget-template/read-only/${record.get('budgetTemplateId')}`,
        search: `?type=${type}`,
      })
    );
  };

  const renderViewHistoryMenu = () => {
    return (
      <Spin spinning={historyLoading}>
        <Menu>
          {!isEmpty(historyList) ? (
            historyList.map(e => (
              <Menu.Item style={{ height: 'auto' }}>
                <div className={styles['history-item-wrapper']}>
                  <div className={styles[`history-content`]} onClick={() => toHistory(e)}>
                    {`${intl.get(`hzero.common.components.dataAudit.version`).d('版本')}v${e.version
                      }`}
                    <div className={styles[`history-extra`]}>
                      {e.releaseByName
                        ? `${e.releaseByName || ''} ${dateTimeRender(e.creationDate)}`
                        : dateTimeRender(e.creationDate)}
                    </div>
                  </div>
                </div>
              </Menu.Item>
            ))
          ) : (
            <Menu.Item disabled>
              <span>{intl.get(`${commonPrompt}.historyEmpty`).d('暂无历史版本信息')}</span>
            </Menu.Item>
          )}
        </Menu>
      </Spin>
    );
  };

  // 建议操作
  const renderAction = ({ record }) => {
    const buttonList = [
      {
        name: 'enabledOrDisableBtn',
        func: () => statusChange(record),
        child:
          String(record.get('enabledFlag')) === '1'
            ? intl.get('hzero.common.button.disable').d('禁用')
            : intl.get('hzero.common.button.enabled').d('启用'),
        showFlag: ['DISABLED', 'RELEASED'].includes(record.get('templateStatus')),
      },
      {
        name: 'edit',
        func: () => handleToEditDetail(record),
        child: intl.get('hzero.common.button.edit').d('编辑'),
        showFlag:
          (!record?.parent || record.parent?.get('enabledFlag') === 1) &&
          record.get('templateStatus') === 'UNRELEASED',
      },
      {
        name: 'unlockEdit',
        func: () => handleUnlock(record),
        child: intl.get('hzero.common.button.edit').d('编辑'),
        showFlag:
          record.get('enabledFlag') === 1 &&
          record.get('templateStatus') === 'RELEASED' &&
          String(record.get('latestFlag')) === '1',
      },
      {
        name: 'copy',
        func: () => handleCopy(record),
        child: intl.get('hzero.common.button.copy').d('复制'),
        showFlag: true,
      },
      {
        name: 'hisory',
        func: () => { },
        child: (
          <Dropdown
            overlay={renderViewHistoryMenu()}
            onHiddenBeforeChange={hidden => {
              fetchHistoryList(record, hidden);
            }}
          >
            <Button
              type="c7n-pro"
              funcType="link"
              color="primary"
              className={styles['sprm-col-btn']}
            >
              {intl.get(`${commonPrompt}.viewHistory`).d('查看历史版本')}
              <Icon type="expand_more" style={{ fontSize: '14px' }} />
            </Button>
          </Dropdown>
        ),
        showFlag:
          String(record.get('version')) !== '1' &&
          ['DISABLED', 'RELEASED'].includes(record.get('templateStatus')),
      },
    ];
    const allShowButtonList = buttonList.filter(e => e.showFlag) || [];

    if (allShowButtonList.length > 3) {
      const [bt1, bt2, ...others] = allShowButtonList;
      const menu = (
        <Menu>
          {others.map(item => {
            const { name, child, func } = item;
            return name !== 'hisory' ? (
              <MenuItem key={name} onClick={func}>
                {child}
              </MenuItem>
            ) : (
              <MenuItem key={name}>
                <Dropdown
                  overlay={renderViewHistoryMenu()}
                  onHiddenBeforeChange={hidden => {
                    fetchHistoryList(record, hidden);
                  }}
                >
                  <Button
                    key={name}
                    type="c7n-pro"
                    funcType="link"
                    color="dark"
                    className={styles['history-btn']}
                  >
                    {intl.get(`${commonPrompt}.viewHistory`).d('查看历史版本')}
                    <Icon
                      type="keyboard_arrow_right"
                      style={{
                        fontSize: '14px',
                        float: 'right',
                        position: 'relative',
                        right: '-14px',
                      }}
                    />
                  </Button>
                </Dropdown>
              </MenuItem>
            );
          })}
        </Menu>
      );
      return (
        <>
          <Button
            funcType="link"
            type="c7n-pro"
            className={styles['sprm-col-btn']}
            onClick={bt1.func}
          >
            {bt1.child}
          </Button>
          <Button
            funcType="link"
            type="c7n-pro"
            className={styles['sprm-col-btn']}
            onClick={bt2.func}
          >
            {bt2.child}
          </Button>
          <Dropdown funcType="flat" overlay={menu}>
            <Button funcType="link" className={styles['sprm-col-btn']}>
              {intl.get('hzero.common.button.more').d('更多')}
              <Icon type="expand_more" style={{ fontSize: 14 }} />
            </Button>
          </Dropdown>
        </>
      );
    } else {
      return allShowButtonList.map(e =>
        e.name !== 'history' ? (
          <Button
            funcType="link"
            type="c7n-pro"
            className={styles['sprm-col-btn']}
            onClick={e.func}
          >
            {e.child}
          </Button>
        ) : (
          e.child
        )
      );
    }
  };

  const columns = useMemo(() => {
    return [
      // {
      //   name: 'enabledFlag',
      //   width: 180,
      //   renderer: ({ value }) => {
      //     return String(value) === '1' ? (
      //       <Tag color="green" style={{ border: 'none' }}>
      //         {intl.get(`${commonPrompt}.enable`).d('启用')}
      //       </Tag>
      //     ) : (
      //       <Tag color="yellow" style={{ border: 'none' }}>
      //         {intl.get(`${commonPrompt}.unenable`).d('未启用')}
      //       </Tag>
      //     );
      //   },
      // },
      {
        name: 'templateStatus',
        width: 150,
        headerStyle: { paddingLeft: 45 },
        renderer: ({ value, record }) => colorRender(value, record.get('templateStatusMeaning')),
      },
      {
        name: 'operation',
        width: 250,
        renderer: renderAction,
      },
      {
        name: 'budgetTemplateCode',
        width: 200,
        renderer: ({ record, value }) => <a onClick={() => toReadOnlyDetail(record)}>{value}</a>,
      },
      {
        name: 'budgetTemplateDesc',
        width: 200,
      },
      {
        name: 'createdByName',
        width: 180,
      },
      {
        name: 'creationDate',
        width: 200,
      },
      {
        name: 'version',
        width: 120,
      },
    ];
  });

  return (
    <Fragment>
      <Header title={intl.get(`${commonPrompt}.budgetTemplate`).d('预算模板')}>
        <Button type="c7n-pro" color="primary" icon="add" onClick={() => handleToEditDetail()}>
          {intl.get(`hzero.common.button.create`).d('新建')}
        </Button>
      </Header>
      <Content>
        {customizeTable(
          {
            code: 'SBUD_BUDGET_TEMPLATE.LIST',
            dataSet: tableDs,
          },
          <SearchBarTable
            mode="tree"
            style={{ maxHeight: 'calc(100vh - 190px)' }}
            searchCode="SBUD_BUDGET_TEMPLATE.SEARCH"
            dataSet={tableDs}
            cacheState
            columns={columns}
            queryFieldsLimit={3}
            // virtual
            // virtualCell
            // virtualSpin
            pagination={{
              pageSizeOptions: ['10', '20', '50', '100', '200'],
            }}
            searchBarConfig={{
              editorProps: {
                templateStatus: {
                  optionsFilter: options => !['BECAME_INVALID'].includes(options.get('value')),
                },
              },
            }}
          />
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(),
  formatterCollections({
    code: ['sbdm.common'],
  }),
  withCustomize({
    unitCode: ['SBUD_BUDGET_TEMPLATE.SEARCH', 'SBUD_BUDGET_TEMPLATE.LIST'],
  }),
  withProps(
    () => {
      const tableDs = new DataSet(TableDs());
      return {
        tableDs,
      };
    },
    { cacheState: true }
  )
)(Index);
