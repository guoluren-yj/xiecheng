/**
 * 风控工作台
 */
import React, { useEffect, useState, useMemo, useRef } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet, Row, Col, Button, Modal, Dropdown, Menu, Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import notification from 'utils/notification';
import ExcelExportPro from 'srm-front-boot/lib/components/ExcelExportPro';
import { getCurrentOrganizationId } from 'utils/utils';
import { compose } from 'lodash';
import { queryMapIdpValue } from 'services/api';
import { Button as PermissionButton } from 'components/Permission';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { SRM_DATA_SDAT } from '@/utils/config';
import { getResponse } from '@/utils/utils';

import { fetchEventTree, fetchPermissions } from '@/services/riskNewWorkPlaceService';
import '@/utils/elementResizeEventPolyfill';

import LeftMenu from './LeftMenu';
import DangerousIncidentList from './DangerousIncidentList';
import DangerousIncidentChart from './DangerousIncidentChart';
import EntranceComp from './EntranceComp';
import EventTypeDistribution from './EventTypeDistribution';
import RiskLevelDistribution from './RiskLevelDistribution';
import EventCreateModal from './EventCreateModal';

import {
  IncidentDetailDS,
  DisposalDS,
  EventCreateDS,
  BroadcastDS,
  CloseFormDS,
  CloseTableDS,
} from './stores/riskControlDS';

import styles from './index.less';

const RiskControlWorkbench = (props) => {
  const { history, customizeForm, remote } = props;

  const disposalDS = useMemo(() => new DataSet(DisposalDS()), []); // 风险凭证处置信息
  const broadcastDS = useMemo(() => new DataSet(BroadcastDS()), []); // 风险广播DS
  const voucherDisposalDS = useMemo(() => new DataSet(DisposalDS()), []); // 风险凭证处置信息
  const voucherBroadcastDS = useMemo(() => new DataSet(BroadcastDS()), []); // 风险广播详情
  const incidentDetailDS = useMemo(() => new DataSet(IncidentDetailDS()), []);
  const eventCreateDS = useMemo(() => new DataSet(EventCreateDS()), []); // 新增风险事件DS
  const closeFormDS = useMemo(() => new DataSet(CloseFormDS()), []); // 关闭事件DS
  const closeTableDS = useMemo(() => new DataSet(CloseTableDS()), []); // 关闭事件DS

  const [levelList, setLevelList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [eventList, setEventList] = useState([]);

  const [filterParams, setFilters] = useState({}); // 左侧筛选条件数据

  const [searchContent, setSearchContent] = useState({}); // 文本框查询条件
  const [selectList, setSelectList] = useState([]);
  const [openType, setOpenType] = useState('');
  const [permissions, setPermissions] = useState([]);

  const filterRef = useRef(null);
  const incidentListRef = useRef(null);

  useEffect(() => {
    handleQueryEventTree();
    getPermissions();

    queryMapIdpValue({
      levelList: 'SDAT.WORKBENCH_EVENT_LEVEL',
      statusList: 'SDAT.WORKBENCH_EVENT_STATUS',
    }).then((res) => {
      if (getResponse(res)) {
        setLevelList(res?.levelList ?? []);
        setStatusList(res?.statusList ?? []);
      }
    });
  }, []);

  // 获取快捷入口权限
  const getPermissions = () => {
    fetchPermissions([
      'risk-workbench-new.api.black-list-entrance',
      'risk-workbench-new.api.risk-scan-plan-entrance',
      'risk-workbench-new.api.risk-monitor-plan-entrance',
      'risk-workbench-new.api.risk-manage-entrance',
      'risk-workbench-new.api.risk-index-manage',
    ]).then((res) => {
      if (getResponse(res) && res.length > 0) {
        const authList = res.filter((item) => item.approve).map((item) => item.code);
        setPermissions(authList);
      }
    });
  };

  const handleQueryEventTree = () => {
    fetchEventTree().then((res) => {
      if (getResponse(res)) {
        setEventList(res || []);
      }
    });
  };

  const validateOrderStatus = async () => {
    // const res = await fetchOrderStatus();
    return true;
  };

  /**
   * 修改筛选条件
   * @param {*} param
   */
  const handleChangeFilter = (param) => {
    setFilters(param);
  };

  /**
   * 改变文本框查询条件
   */
  const handleChangeSearchKey = (param) => {
    setSearchContent(param);
  };

  /**
   * 处置信息后 刷新筛选条件
   */
  const handleBackChangeFilter = () => {
    if (filterRef && filterRef.current) {
      if (filterRef.current.resetFilter) {
        filterRef.current.resetFilter();
      }
    }
  };

  /**
   * 刷新全页面
   */
  const refreshPage = () => {
    setFilters({
      ...filterParams,
      t: new Date().getTime(),
    });
  };

  /**
   * 新建风险事件
   */
  const handleCreateRiskEvent = async () => {
    let modal = null;

    const result = await validateOrderStatus();

    if (!(result && !result.failed)) {
      return notification.info({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl
          .get('sdat.riskControl.view.message.createEventNoOrder')
          .d('新建风险事件失败，失败原因是服务未生效或额度不足，请联系客户经理进行确认'),
      });
    }

    const handleCloseModal = () => {
      if (modal) {
        eventCreateDS.data = [];
        eventCreateDS.reset();
        modal.close();
      }

      handleQueryEventTree();
    };

    const handleApprove = async () => {
      const res = await validateOrderStatus();

      if (!(res && !res.failed)) {
        return notification.info({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl
            .get('sdat.riskControl.view.message.createEventNoOrder')
            .d('新建风险事件失败，失败原因是服务未生效或额度不足，请联系客户经理进行确认'),
        });
      }

      // 新建风险事件保存
      const isValid = await eventCreateDS.validate();

      if (eventCreateDS && eventCreateDS.current) {
        const scope = eventCreateDS.current.get('dimension');
        eventCreateDS.current.set('scope', scope);
        eventCreateDS.current.set('status', 'PENDING');
      }

      if (isValid) {
        return eventCreateDS.submit().then(() => {
          setFilters({
            ...filterParams,
            t: new Date().getTime(),
          });
          handleCloseModal();
        });
      }

      return false;
    };

    modal = Modal.open({
      title: intl.get('sdat.riskControl.view.title.createRiskEvent').d('新建风险事件'),
      children: <EventCreateModal customizeForm={customizeForm} eventCreateDS={eventCreateDS} />,
      closable: false,
      drawer: true,
      mask: true,
      destroyOnClose: true,
      style: {
        width: '432px',
      },

      footer: (
        <>
          <Button color="primary" onClick={handleApprove}>
            {intl.get(`sdat.riskControl.view.button.approve`).d('提交')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`sdat.riskControl.view.button.cancel`).d('取消')}
          </Button>
        </>
      ),
    });
  };

  /**
   * 批量开启
   */
  const handleBatchOpen = () => {
    if (incidentListRef && incidentListRef.current) {
      const { batchOpen } = incidentListRef.current;

      if (batchOpen && typeof batchOpen === 'function') {
        batchOpen();
      }
    }
  };

  /**
   * 批量关闭
   */
  const handleBatchClose = () => {
    if (incidentListRef && incidentListRef.current) {
      const { batchClose } = incidentListRef.current;

      if (batchClose && typeof batchClose === 'function') {
        batchClose();
      }
    }
  };

  const handleSelectedList = (list = []) => {
    setSelectList(list || []);
  };

  const onClearCache = () => {
    setSelectList([]);
    setOpenType('');
  };

  /**
   * 打开多选按钮框
   * @param {*} flag
   */
  const openSelectFlag = (flag) => {
    setOpenType(flag);
  };

  const handleCancelSelect = () => {
    setOpenType('');

    if (incidentListRef && incidentListRef.current) {
      const { clearSelect } = incidentListRef.current;

      if (clearSelect && typeof clearSelect === 'function') {
        clearSelect();
      }
    }
  };

  /**
   * 确认批量更新操作
   */
  const handleConfirmSelect = () => {
    if (openType === 'open') {
      handleBatchOpen();
    } else if (openType === 'close') {
      handleBatchClose();
    }
  };

  const menu = () => {
    return (
      <Menu>
        <Menu.Item>
          <span onClick={() => openSelectFlag('open')}>
            {intl.get('sdat.riskControl.view.button.batchOpen').d('批量开启')}
          </span>
        </Menu.Item>
        <Menu.Item>
          <span onClick={() => openSelectFlag('close')}>
            {intl.get('sdat.riskControl.view.button.batchClose').d('批量关闭')}
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  return (
    <div className={styles['risk-workbench-new-basic']}>
      <div
        style={{
          width: '100%',
          display: 'flex',
        }}
      >
        <div
          style={{
            display: 'flex',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.12)',
            width: '67%',
          }}
        >
          <div
            style={{
              width: '25%',
            }}
          >
            <div
              style={{
                background: '#fff',
                height: 'calc(100vh - 100px)',
              }}
            >
              <div
                className={styles['risk-workbench-new-panel-title']}
                style={{
                  padding: '20px 0 0 20px',
                }}
              >
                {intl.get('sdat.riskControl.view.title.filter').d('筛选')}
              </div>
              <LeftMenu
                ref={filterRef}
                statusList={statusList}
                levelList={levelList}
                eventList={eventList}
                onChangeFilter={handleChangeFilter}
              />
            </div>
          </div>
          <div
            style={{
              width: '75%',
            }}
          >
            <div className={styles['risk-control-left-tab']}>
              <div
                className={styles['risk-workbench-new-panel-title']}
                style={{
                  marginBottom: '16px',
                }}
              >
                <span>{intl.get('sdat.riskControl.view.title.riskIncident').d('风险事件')}</span>
                <div>
                  <ExcelExportPro
                    buttonText={intl.get('hzero.common.view.button.export').d('导出')}
                    requestUrl={`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-event/events-export`}
                    method="POST"
                    templateCode="SRM_C_SDAT_WORKBENCH2_RISK_EVENT_EXPORT"
                    otherButtonProps={{
                      icon: 'unarchive',
                      type: 'c7n-pro',
                      funcType: 'flat',
                      style: {
                        fontSize: '12px',
                      },
                      permissionList: [
                        // {
                        //   code: '',
                        //   type: 'button',
                        // },
                      ],
                    }}
                    defaultSelectAll
                    queryParams={{
                      ...searchContent,
                      ...filterParams,
                    }}
                  />
                  {openType ? (
                    <>
                      <Button
                        funcType="flat"
                        icon="close"
                        style={{
                          fontSize: '12px',
                        }}
                        onClick={handleCancelSelect}
                      >
                        {intl.get('hzero.common.button.cancel').d('取消')}
                      </Button>
                      <Button
                        color="primary"
                        icon="check"
                        funcType="flat"
                        style={{
                          fontSize: '12px',
                        }}
                        disabled={!selectList.length}
                        onClick={handleConfirmSelect}
                      >
                        {openType === 'open'
                          ? intl.get('sdat.riskControl.view.button.confirmOpen').d('确定开启')
                          : intl.get('sdat.riskControl.view.button.confirmClose').d('确定关闭')}
                      </Button>
                    </>
                  ) : (
                    <Dropdown overlay={menu}>
                      <Button funcType="flat" style={{ fontSize: '12px', fontWeight: '500' }}>
                        {intl.get('sdat.riskControl.view.button.batchOperation').d('批量操作')}
                        &nbsp;
                        <Icon type="expand_more" style={{ fontSize: '12px', fontWeight: '500' }} />
                      </Button>
                    </Dropdown>
                  )}
                  <PermissionButton
                    permissionList={[
                      {
                        code: 'risk-workbench-new.api.workplace-eventCreate',
                      },
                    ]}
                    icon="add"
                    type="c7n-pro"
                    funcType="flat"
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                    onClick={handleCreateRiskEvent}
                  >
                    {intl.get('sdat.riskControl.view.button.create').d('新建')}
                  </PermissionButton>
                </div>
              </div>
              <DangerousIncidentList
                ref={incidentListRef}
                remote={remote}
                openType={openType}
                levelList={levelList}
                statusList={statusList}
                filterParams={filterParams}
                incidentDetailDS={incidentDetailDS}
                disposalDS={disposalDS}
                broadcastDS={broadcastDS}
                closeFormDS={closeFormDS}
                closeTableDS={closeTableDS}
                voucherDisposalDS={voucherDisposalDS}
                voucherBroadcastDS={voucherBroadcastDS}
                onChangeSearchKey={handleChangeSearchKey}
                onCallBackChangeFilter={handleBackChangeFilter}
                onChangeFilterForRefreshPage={refreshPage}
                onClearCache={onClearCache}
                onSelectedList={handleSelectedList}
                customizeForm={customizeForm}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            width: '33%',
          }}
        >
          <div className={styles['risk-workbench-new-right']}>
            {permissions?.length ? (
              <div className={styles['risk-workbench-new-background-common']}>
                <EntranceComp history={history} permissions={permissions} />
              </div>
            ) : null}
            {/* <div className={styles['risk-workbench-new-background-common']}>
              <EntranceComp history={history} permissions={permissions} />
            </div> */}
            <Row
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginRight: '4px',
              }}
            >
              <Col span={12} className={styles['risk-workbench-new-background-common']}>
                <EventTypeDistribution
                  filterParams={filterParams}
                  statusList={statusList}
                  searchContent={searchContent}
                />
              </Col>
              <Col
                span={12}
                style={{
                  marginLeft: '8px',
                }}
                className={styles['risk-workbench-new-background-common']}
              >
                <RiskLevelDistribution
                  filterParams={filterParams}
                  levelList={levelList}
                  searchContent={searchContent}
                />
              </Col>
            </Row>
            <div
              style={{
                marginTop: '8px',
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
              }}
              className={styles['risk-workbench-new-background-common']}
            >
              <DangerousIncidentChart filterParams={filterParams} searchContent={searchContent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default compose(
  withCustomize({
    unitCode: [`SDAT.RISK_WORKPLACT_CUSTOMIZE_GROUP`],
  }),
  cuxRemote({
    code: 'SDAT_RISK_WORKPLACE_RISK_EVENT',
    name: 'remote',
  }),
  formatterCollections({
    code: [
      'sdat.riskControl',
      'sdat.eventStuff',
      'srm.filterBar',
      'sdat.monitorStuff',
      'sdat.riskNewDefinition',
      'sdat.monitorBusiness',
      'sdat.riskScanConfig',
    ],
  })
)(RiskControlWorkbench);
