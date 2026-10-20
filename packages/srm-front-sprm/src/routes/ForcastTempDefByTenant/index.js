import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { DataSet, Modal, Dropdown } from 'choerodon-ui/pro';
import { Tag, Menu, Icon } from 'choerodon-ui';
import React, { Fragment, useState, useMemo, useEffect } from 'react';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { compose } from 'lodash';
import injectGuide from 'srm-front-boot/lib/components/Guide/injectGuideList';
import { Button } from 'components/Permission';
// import { yesOrNoRender } from 'utils/renderer';
// import { SRM_SPRM } from '_utils/config';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  copyFrst,
  handleSynchronize,
  deleteOrgTemplateLines,
  queryAutoPlatData,
  handleEnableOrNot,
} from '@/services/forecastTemplateDefOrgService';
import Operation from './Operation.js';
import styles from './index.less';

import { wholeDs, operateRecordDs } from './indexDs';

const { Item: MenuItem } = Menu;
const config = () => {
  return [
    {
      enable: true,
      // 向导组编码
      code: 'SRPM_FORECAST_LIST',
      // 向导组类型
      type: 'strong',
      priority: 0,
      version: 1,
      title: intl.get('sprm.forecastMgt.model.common.autoPlatTitle').d('引用平台模板'),
      delay: 300,
      optionalSteps: true,
      steps: [
        {
          selector: '.button_autoplat',
          title: intl.get('sprm.forecastMgt.model.common.autoPlatTitle').d('引用平台模板'),
          htmlText: intl
            .get('sprm.forecastMgt.model.common.autoPlatdetail')
            .d('引用平台级预定义的标准预测管理模板，租户级引用后可按需调整'),
          placement: 'bottom-right',
        },
      ],
    },
  ];
};
const Index = ({ dispatch, lineDs }) => {
  const operateLineDs = useMemo(() => new DataSet(operateRecordDs()), []);
  const [autoPlatFlag, setAutoPlat] = useState(false);
  injectGuide(`/sprm/forecast-dimension-org/list`, config);
  const hanleDetailLink = (record, flag) => {
    if (record.get('templateStatus') === 'UNRELEASED' && flag === 1) {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/forecast-dimension-org/detail/${record.get('templateHeaderId')}`,
        })
      );
    } else if (record.get('templateStatus') === 'RELEASED' && flag === 1) {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/forecast-dimension-org/detail/${record.get('templateHeaderId')}`,
          search: 'type=change',
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/forecast-dimension-org/read-detail/${record.get('templateHeaderId')}`,
        })
      );
    }
  };

  // 初始化查询是否有数据可以同步平台级
  useEffect(() => {
    queryAutoPlatData({
      templateStatus: 'RELEASED',
      customizeUnitCode: 'SPRM.FORECAST_LIB.SEARCHBAR',
      customizeFilterComparison: 'templateStatus:=',
    }).then((res) => {
      if (res && res.content.length) {
        setAutoPlat(true);
      }
    });
    lineDs.query();
  }, []);

  // 删除采购申请行
  const handleDelete = (record) => {
    const deleteLine = record.toJSONData();
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      bodyStyle: { padding: '20px' },
      children: (
        <p>
          {intl
            .get('sprm.forecast.view.message.template.confirmDelete')
            .d('是否确认删除该预测模板?')}
        </p>
      ),
    }).then((button) => {
      if (button === 'ok') {
        deleteOrgTemplateLines(deleteLine).then((res) => {
          if (getResponse(res)) {
            notification.success();
            lineDs.unSelectAll();
            lineDs.clearCachedSelected();
            lineDs.query();
          }
        });
      }
    });
  };

  const handleOperation = (record) => {
    const templateHeaderId = record.get('templateHeaderId');
    operateLineDs.setQueryParameter('templateHeaderId', templateHeaderId);
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
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

  // 复制预测模版定义
  const handleCopy = (record) => {
    Modal.confirm({
      bodyStyle: { padding: '20px' },
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <p>
          {intl
            .get(`sprm.forecastMgt.view.message.copy`, { templateCode: record.get('templateCode') })
            .d(`确认复制${record.get('templateCode')}生成新预测模板`)}
        </p>
      ),
      onOk: () => {
        return new Promise((resolve) => {
          copyFrst({
            ...record.toData(),
          })
            .then((res) => {
              if (getResponse(res)) {
                notification.success();
                dispatch(
                  routerRedux.push({
                    pathname: `/sprm/forecast-dimension-org/detail/${res?.templateHeaderId}`,
                  })
                );
              }
            })
            .finally(() => {
              resolve();
            });
        });
      },
      onCancel: () => {},
    });
  };

  const renderAction = ({ record }) => {
    const templateStatus = record.get('templateStatusShow');
    const btnList = [
      {
        name: 'edit',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        func: () => hanleDetailLink(record, 1),
        hidden: templateStatus === 'DISABLED',
      },
      {
        name: 'delete',
        child: intl.get('hzero.common.button.delete').d('删除'),
        func: () => handleDelete(record),
        hidden: templateStatus !== 'UNRELEASED',
      },
      {
        name: 'copy',
        child: intl.get('hzero.common.button.copy').d('复制'),
        func: () => handleCopy(record),
        hidden: templateStatus !== 'RELEASED',
      },
      {
        name: 'disabled',
        func: () => handleEnable({ record }),
        child:
          templateStatus === 'RELEASED'
            ? intl.get('hzero.common.disable').d('禁用')
            : intl.get('hzero.common.button.enabled').d('启用'),
        hidden: templateStatus === 'UNRELEASED',
      },
      {
        name: 'opration',
        func: () => handleOperation(record),
        child: intl.get(`hzero.common.button.operation`).d('操作记录'),
        hidden: false,
      },
    ];
    const allShowButtonList = btnList.filter((e) => !e.hidden) || [];
    // const
    if (allShowButtonList.length <= 3) {
      return allShowButtonList.map((e) => (
        <Button funcType="link" type="c7n-pro" className={styles['sprm-col-btn']} onClick={e.func}>
          {e.child}
        </Button>
      ));
    } else {
      const [btn1, btn2, ...others] = allShowButtonList || [];
      const menu = (
        <Menu>
          {others.map((item) => {
            const { name, child, func } = item;
            return (
              <MenuItem key={name} onClick={func}>
                {child}
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
            onClick={btn1.func}
          >
            {btn1.child}
          </Button>
          <Button
            funcType="link"
            type="c7n-pro"
            className={styles['sprm-col-btn']}
            onClick={btn2.func}
          >
            {btn2.child}
          </Button>
          <Dropdown funcType="flat" overlay={menu}>
            <Button funcType="link" className={styles['sprm-col-btn']} type="c7n-pro">
              {intl.get('hzero.common.button.more').d('更多')}
              <Icon type="expand_more" style={{ fontSize: 14 }} />
            </Button>
          </Dropdown>
        </>
      );
    }
  };

  const lineColumns = [
    {
      name: 'templateStatus',
      width: 150,
      renderer: ({ record }) => {
        const templateStatusShow = record.get('templateStatusShow');
        if (templateStatusShow === 'RELEASED') {
          return (
            <Tag color="green" style={{ border: 'none' }}>
              {record.get('templateStatusShowMeaning')}
            </Tag>
          );
        } else if (templateStatusShow === 'DISABLED') {
          return (
            <Tag color="red" style={{ border: 'none' }}>
              {record.get('templateStatusShowMeaning')}
            </Tag>
          );
        } else {
          return (
            <Tag color="yellow" style={{ border: 'none' }}>
              {record.get('templateStatusShowMeaning')}
            </Tag>
          );
        }
      },
    },
    { name: 'operation', minWidth: 150, renderer: ({ record }) => renderAction({ record }) },
    {
      name: 'templateCode',
      width: 180,
      renderer: ({ text, record }) => <a onClick={() => hanleDetailLink(record)}>{text}</a>,
    },
    { name: 'templateName', width: 250 },
    { name: 'createdByName' },
    { name: 'creationDate' },
  ];

  const handleSynchronizeBtn = async () => {
    handleSynchronize().then((data) => {
      if (data) {
        if (data.failed) {
          notification.error({ message: data.message });
        } else {
          lineDs.query();
        }
      }
    });
  };

  const handleEnable = ({ record }) => {
    return new Promise((resolve) => {
      const data = record.toData();
      handleEnableOrNot({ ...data, enabledFlag: data?.enabledFlag === 0 ? 1 : 0 })
        .then((res) => {
          const result = getResponse(res);
          if (result) {
            notification.success();
            lineDs.query();
          }
        })
        .finally(() => {
          resolve();
        });
    });
  };

  const RenderBtn = observer(({ platFlag }) => {
    return (
      <Button
        onClick={handleSynchronizeBtn}
        icon="filter_none"
        type="c7n-pro"
        color="primary"
        disabled={platFlag}
        wait={500}
        className="button_autoplat"
      >
        {intl.get('sprm.forecastMgt.model.common.autoPlat').d('引用平台预测')}
      </Button>
    );
  });

  return (
    <Fragment>
      <Header
        title={intl.get('sprm.forecastMgt.model.common.forecastMgtTempDef').d('预测管理模板定义')}
      >
        <RenderBtn platFlag={autoPlatFlag} />
      </Header>
      <Content>
        <SearchBarTable
          style={{ maxHeight: 'calc(100vh - 190px)' }}
          searchCode="SPRM.FORECAST_LIB.SEARCHBAR"
          dataSet={lineDs}
          columns={lineColumns}
          data={[]}
          queryFieldsLimit={3}
          customizedCode="sprm_forcast_temp_tenant"
          cacheState
        />
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(() => ({})),
  formatterCollections({
    code: [
      'sprm.common',
      'sprm.purchasePlatform',
      'hzero.c7nProUI',
      'hzero.common',
      'sprm.forecast',
      'sprm.forecastMgt',
    ],
  }),
  withProps(
    () => {
      const lineDs = new DataSet(wholeDs());
      return {
        lineDs,
      };
    },
    { cacheState: true }
  )
)(Index);
