import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { DataSet, Modal } from 'choerodon-ui/pro';
import React, { Fragment, useCallback } from 'react';
import { Button } from 'components/Permission';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  releaseFcstTemplateList,
  lockFcstTemplateList,
} from '@/services/forecastTemplateDefService';
import Operation from './Operation.js';
import { wholeDs, operateRecordDs } from './indexDs';

const Index = ({ dispatch }) => {
  const lineDs = new DataSet(wholeDs());
  const operateLineDs = new DataSet(operateRecordDs());
  const hanleDetailLink = useCallback(({ record }) => {
    if (record.get('templateStatus') === 'UNRELEASED') {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/forecast-lib-dimension/detail/${record.get('templateHeaderId')}`,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/forecast-lib-dimension/read-detail/${record.get('templateHeaderId')}`,
        })
      );
    }
  }, []);

  const handleRelease = (record) => {
    const data = record.toJSONData();
    releaseFcstTemplateList(data).then((res) => {
      if (res) {
        if (res.failed) {
          notification.error({ message: res.message });
        } else {
          lineDs.query();
        }
      }
    });
  };

  const handleLocked = (record) => {
    const data = record.toJSONData();
    lockFcstTemplateList(data).then((res) => {
      if (res) {
        if (res.failed) {
          notification.error({ message: res.message });
        } else {
          lineDs.query();
        }
      }
    });
  };

  const handleOperation = (record) => {
    const templateHeaderId = record.get('templateHeaderId');
    operateLineDs.setQueryParameter('templateHeaderId', templateHeaderId);
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operation`).d('操作记录'),
      children: <Operation operateLineDs={operateLineDs} templateHeaderId={templateHeaderId} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const renderAction = ({ record }) => {
    const templateStatus = record.get('templateStatus');
    const actions = [
      templateStatus === 'UNRELEASED' && (
        <Button type="text" onClick={() => handleRelease(record)} style={{ marginRight: '10px' }}>
          {intl.get(`hzero.common.button.release`).d('发布')}
        </Button>
      ),
      templateStatus === 'RELEASED' && (
        <Button type="text" onClick={() => handleLocked(record)} style={{ marginRight: '10px' }}>
          {intl.get(`hzero.common.button.unlock`).d('解锁')}
        </Button>
      ),
      <Button type="text" onClick={() => handleOperation(record)} style={{ marginRight: '10px' }}>
        {intl.get(`hzero.common.button.operation`).d('操作记录')}
      </Button>,
    ];
    return actions;
  };

  const lineColumns = [
    {
      name: 'templateStatus',
      width: 150,
      renderer: ({ record }) => record.get('templateStatusMeaning'),
    },
    {
      name: 'templateCode',
      width: 150,
      renderer: ({ text, record }) => <a onClick={() => hanleDetailLink({ record })}>{text}</a>,
    },
    { name: 'templateName', width: 200 },
    // { name: 'createdByName', width: 150 },
    { name: 'creationDate', width: 150 },
    {
      name: 'enabledFlag',
      width: 100,
      editor: (record) => record.get('isEdit'),
      renderer: ({ value }) => yesOrNoRender(Number(value)),
    },
    { name: 'operation', width: 150, renderer: ({ record }) => renderAction({ record }) },
  ];

  const handleCreateJump = useCallback(({ record }) => {
    if (record) {
      const templateHeaderId = record.get('templateHeaderId');
      dispatch(
        routerRedux.push({
          pathname: `/sprm/purchase-platform/erp-detail/${templateHeaderId}`,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: '/sprm/forecast-lib-dimension/detail/create',
        })
      );
    }
  }, []);

  return (
    <Fragment>
      <Header
        title={intl.get('sprm.forecastMgt.model.common.forecastMgtTempDef').d('预测管理模板定义')}
      >
        <Button
          onClick={handleCreateJump}
          color="primary"
          type="c7n-pro"
          funcType="raised"
          icon="add"
        >
          {intl.get('hzero.common.create').d('新建')}
        </Button>
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 260px)' }}>
          <SearchBarTable
            style={{ maxHeight: 'calc(100% - 22px)' }}
            searchCode="SPRM.FORECAST_TEMPLATE.SEARCHBAR"
            dataSet={lineDs}
            columns={lineColumns}
            data={[]}
            queryFieldsLimit={3}
            searchBarConfig={{
              editorProps: {
                templateStatus: {
                  optionsFilter: (options) =>
                    ['UNRELEASED', 'RELEASED'].includes(options.get('value')),
                },
              },
            }}
            cacheState
          />
        </div>
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['sprm.common', 'sprm.purchasePlatform', 'hzero.common', 'sprm.forecastMgt', 'sprm.fcst'],
})(connect()(Index));
