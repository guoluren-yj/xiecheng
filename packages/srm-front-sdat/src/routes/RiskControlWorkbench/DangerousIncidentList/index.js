/**
 * 风险事件
 */
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import intl from 'utils/intl';
// import uuid from 'uuid/v4';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { Alert, Tag } from 'choerodon-ui';
import {
  TextField,
  Icon,
  Modal,
  Button,
  Spin,
  Tooltip,
  Pagination,
  CheckBox,
} from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { queryMapIdpValue } from 'services/api';
import { Button as PermissionButton } from 'components/Permission';
import ApproveModal from 'srm-front-boot/lib/components/ApproveModal';
import { queryBatchApprovaFlag } from 'srm-front-boot/lib/utils/utils';

import { getResponse } from '@/utils/utils';
import SortSelector from '@/components/SortSelector';
import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import { fetchOrderStatus } from '@/services/riskDefinitionService';
import {
  fetchRiskList,
  fetchRecallProcess,
  fetchCloseData,
  fetchSubmitData,
  fetchSubmitCastData,
  fetchApproveStatus,
  fetchCooperationFlag,
} from '@/services/riskWorkPlaceService';

import RiskVoucherDetails from '../RiskVoucherDetails';
import RiskIncidentDetail from '../RiskIncidentDetail';
import RiskVoucherModal from '../RiskVoucherModal';
import EditVoucherModal from '../EditVoucherModal';
import OperationRecord from '../OperationRecord';
import WithdrawalRecordModal from '../WithdrawalRecordModal';
import BroadcastModal from '../BroadcastModal';

import styles from './index.less';

let queryParam = {
  sort: 'lastUpdateTime,desc',
  userId: getCurrentUser().id,
  tenantId: getCurrentOrganizationId(),
  emptyFlag: false,
  page: 0,
  size: 10,
};
let toggleMap = {};
let lockKey = 1;
let riskList = [];
let approveStatusMap = {};
let globalUuid = '';

const createRiskKey = Modal.key();
const riskEventKey = Modal.key();
const voucherKey = Modal.key();
const operationRecordKey = Modal.key();
const withdrawalRecordKey = Modal.key();

const DangerousIncidentList = forwardRef((props, ref) => {
  const {
    openType = '',
    incidentDetailDS,
    disposalDS,
    broadcastDS,
    voucherDisposalDS,
    voucherBroadcastDS,
    levelList = [],
    statusList = [],
    filterParams = {},
    onSelectedList = () => {},
    onChangeSearchKey = () => {},
    onCallBackChangeFilter = () => {},
    onChangeFilterForRefreshPage = () => {},
    onClearCache = () => {},
  } = props;

  const [levelMap, setLevelMap] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [approveMap, setApproveMap] = useState({});
  const [loadingMap, setLoading] = useState({});
  const [loading, setFetchLoading] = useState(false);
  const [feedMap, setFeedMap] = useState({}); // 反馈
  const [actionMap, setActionMap] = useState({}); // 处置动作
  const [allData, setAllData] = useState(0); // 记录接口返回的所有数据
  const [showInfo, setShowInfo] = useState(false);
  const [defaultSortField, setDefaultSortField] = useState('lastUpdateTime');
  const [selectRows, setSelectRows] = useState([]);

  const [refresh, setRefresh] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    queryMapIdpValue({
      actionArr: 'SDAT.PROCESS_ACTION',
      feedBackList: 'SDAT.PROCESS_FEEDBACK',
      approveList: 'SDAT.PROCESS_STATUS',
    }).then(res => {
      if (getResponse(res)) {
        const obj1 = {};
        const obj2 = {};
        const obj3 = {};

        if (res.actionArr && res.actionArr.length) {
          res.actionArr.forEach(item => {
            obj1[item.value] = item.meaning;
          });
        }

        if (res.approveList && res.approveList.length) {
          res.approveList.forEach(item => {
            obj3[item.value] = item.meaning;
          });
        }

        if (res.feedBackList && res.feedBackList.length) {
          res.feedBackList.forEach(item => {
            obj2[item.value] = item.meaning;
          });
        }

        setActionMap(obj1);
        setFeedMap(obj2);
        setApproveMap(obj3);
      }
    });

    return () => {
      queryParam = {
        sort: 'lastUpdateTime,desc',
        userId: getCurrentUser().id,
        tenantId: getCurrentOrganizationId(),
        page: 0,
        size: 10,
      };
      lockKey = 1;
      riskList = [];
      toggleMap = {};
      approveStatusMap = {};
      globalUuid = '';
    };
  }, []);

  useEffect(() => {
    if (filterParams && Object.keys(filterParams).length) {
      queryParam = {
        ...queryParam,
        ...filterParams,
        page: 0,
        emptyFlag:
          !filterParams?.statusList?.length ||
          !filterParams?.levelList?.length ||
          !filterParams?.codeList?.length,
      };
      handleQueryList({ ...queryParam }, 'show');
    }
  }, [filterParams]);

  useEffect(() => {
    if (statusList.length) {
      const obj = {};
      if (statusList.length) {
        statusList.forEach(item => {
          obj[item.value] = item.meaning;
        });
      }
      setStatusMap(obj);
    }
    if (levelList.length) {
      const obj = {};
      if (levelList.length) {
        levelList.forEach(item => {
          obj[item.value] = item.meaning;
        });
      }
      setLevelMap(obj);
    }
  }, [levelList, statusList]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const handleQueryList = (params = {}, flag) => {
    setFetchLoading(true);
    fetchRiskList({ ...params })
      .then(res => {
        if (getResponse(res)) {
          setFetchLoading(false);
          riskList = res?.content ?? [];
          setAllData(res?.totalElements ?? 0);
          setToggleMap(res?.content ?? []);

          const toggleList = [];

          riskList.forEach(item => {
            if (toggleMap[item?.riskEventId] && item?.customerRiskProcessList.length) {
              item.customerRiskProcessList.forEach(item2 => {
                if (item2.stastus === '1') {
                  toggleList.push(item2.businessId);
                }
              });
            }
          });

          if (toggleList.length) {
            getBatchStatus(toggleList);
          }

          if (flag) {
            setShowInfo(true);
          }
        } else {
          setAllData(0);
          riskList = [];
          setToggleMap([]);
          setFetchLoading(false);
        }
        setRefresh(true);
        if (scrollRef && scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      })
      .catch(() => {
        setFetchLoading(false);
      });
  };

  const getBatchStatus = (arr = []) => {
    // 查询审批列表状态
    fetchApproveStatus({
      businessKeyList: arr,
    }).then(res => {
      if (getResponse(res)) {
        Object.keys(res).forEach(item => {
          if (res[item]) {
            const list = Object.values(res[item]);

            const names = [];
            if (list.length) {
              list.forEach(objs => {
                names.push(...objs);
              });
            }
            approveStatusMap[item] = names.map(obj => obj.realName);
          }
        });
        setRefresh(true);
      }
    });
  };

  /**
   * 切换page
   */
  const handleChange = (page = 0, pageSize = 10) => {
    queryParam.page = page > 0 ? page - 1 : 0;
    queryParam.size = pageSize;
    handleQueryList({ ...queryParam });
  };

  const setToggleMap = (data = []) => {
    const loop = list => {
      if (list.length) {
        list.forEach(item => {
          if (item.customerRiskProcessList && item.customerRiskProcessList.length) {
            loop(item.customerRiskProcessList);
          }
        });
      }
    };

    loop(data);
  };

  /**
   * 输入查询关键字
   * @param {*} e
   */
  const handleInputValue = e => {
    queryParam.page = 0;
    queryParam.size = 10;
    queryParam.enterpriseName = e?.target?.value ?? '';
  };

  const handleClear = () => {
    queryParam.enterpriseName = '';
    queryParam.page = 0;
    queryParam.size = 10;
    onChangeSearchKey({ enterpriseName: '' });
    handleQueryList({ ...queryParam });
  };

  const handleQuerySort = (sortFieldCode, sortType) => {
    queryParam.sort = `${sortFieldCode},${sortType?.toLowerCase() ?? ''}`;
    queryParam.page = 0;
    queryParam.size = 10;
    handleQueryList({ ...queryParam });
  };

  const handleQuery = () => {
    onChangeSearchKey({ enterpriseName: queryParam.enterpriseName });
    queryParam.page = 0;
    queryParam.size = 10;
    handleQueryList({ ...queryParam }, 'show');
  };

  /**
   * 关闭操作
   * @param {*} item
   */
  const handleNeglect = async (item, tag) => {
    const result = await validateOrderStatus();
    const desc =
      tag === 'close'
        ? intl
            .get('sdat.riskControl.view.message.closeNoOrder')
            .d('关闭风险事件失败，失败原因是服务未生效或额度不足，请联系客户经理进行确认')
        : intl
            .get('sdat.riskControl.view.message.openNoOrder')
            .d('开启风险事件失败，失败原因是服务未生效或额度不足，请联系客户经理进行确认');

    if (!(result && !result.failed)) {
      return notification.info({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: desc,
      });
    }

    if (item && item.riskEventId) {
      const msg =
        tag === 'close'
          ? intl.get('sdat.riskControl.view.message.confirmClose').d('是否确认关闭？')
          : intl.get('sdat.riskControl.view.message.confirmOpen').d('是否确认开启？');

      const status =
        tag === 'close'
          ? 'FINISH'
          : item.customerRiskProcessList && item.customerRiskProcessList.length
          ? 'HANDLING'
          : 'PENDING';

      return Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: <div>{msg}</div>,
      }).then(async button => {
        if (button === 'ok' && lockKey === 1) {
          lockKey = 0;
          setLoading({
            [item.riskEventId]: true,
          });

          const res = await fetchCloseData([
            {
              ...item,
              status,
            },
          ]);

          setLoading({
            [item.riskEventId]: false,
          });
          lockKey = 1;
          if (getResponse(res)) {
            notification.success();
            queryParam.page = 0;
            queryParam.size = 10;
            onChangeFilterForRefreshPage();
            // handleQueryList({ ...queryParam });
          }
        }
      });
    }
  };

  /**
   * 撤回凭证
   * @param {*} item
   */
  const handleWithdrawalVoucher = async item => {
    const result = await validateOrderStatus();
    if (!(result && !result.failed)) {
      return notification.info({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl
          .get('sdat.riskControl.view.message.recallNoOrder')
          .d('撤回风险处置失败，失败原因是服务未生效或额度不足，请联系客户经理进行确认'),
      });
    }

    if (item && item.riskProcessId) {
      return Modal.confirm({
        title: intl.get('hzero.common.view.button.confirm').d('确认'),
        children: (
          <div>{intl.get('sdat.riskControl.view.message.confirmRecall').d('是否确认撤回？')}</div>
        ),
      }).then(async button => {
        if (button === 'ok' && lockKey === 1) {
          lockKey = 0;
          fetchRecallProcess({ riskProcessId: item.riskProcessId }).then(res => {
            lockKey = 1;
            if (getResponse(res)) {
              notification.success();
              queryParam.page = 0;
              queryParam.size = 10;
              handleQueryList({ ...queryParam });
            }
          });
        }
      });
    }
  };

  /**
   * 查看凭证详情
   * @param {*} item
   */
  const openVoucherDetail = (item, attachmentUuid = '') => {
    let modal = null;
    const typeMode = item.processAction === 'RISK_BROADCAST'; // 是否风险广播
    let commonDS = voucherDisposalDS;
    if (item.processAction === 'RISK_BROADCAST') {
      commonDS = voucherBroadcastDS;
    }

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    const handleWithdrawal = async obj => {
      const rcd = await validateOrderStatus();
      if (!(rcd && !rcd.failed)) {
        return notification.info({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl
            .get('sdat.riskControl.view.message.recallNoOrder')
            .d('撤回风险处置失败，失败原因是服务未生效或额度不足，请联系客户经理进行确认'),
        });
      }

      if (obj && obj.riskProcessId && lockKey === 1) {
        lockKey = 0;
        const res = await fetchRecallProcess({ riskProcessId: obj.riskProcessId });
        lockKey = 1;
        if (getResponse(res)) {
          notification.success();
          handleCloseModal();
          queryParam.page = 0;
          queryParam.size = 10;
          handleQueryList({ ...queryParam });
        }
      }
    };

    modal = Modal.open({
      title: typeMode
        ? intl.get('sdat.riskControl.view.button.riskBroadcast').d('风险广播')
        : intl.get('sdat.riskControl.view.title.riskVoucherDetail').d('风险处置详情'),
      key: voucherKey,
      children: (
        <RiskVoucherDetails
          parentAttach={attachmentUuid}
          typeMode={typeMode}
          localRecord={item}
          voucherDisposalDS={commonDS}
          companyId={item?.defineCompanyId}
          globalUuid={globalUuid}
          eventNumber={item.eventNumber}
        />
      ),
      closable: false,
      drawer: true,
      mask: true,
      destroyOnClose: true,
      style: { width: '742px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
          {['1'].includes(item.stastus) && item.createdBy === getCurrentUser().id ? (
            <PermissionButton
              permissionList={[{ code: 'risk-control-workbench.api.workplace-recall' }]}
              type="c7n-pro"
              onClick={() => handleWithdrawal(item)}
            >
              {intl.get('sdat.riskControl.view.button.withdrawalVoucher').d('撤回')}
            </PermissionButton>
          ) : null}
          <Button onClick={() => openRecordModal(item)}>
            {intl.get(`sdat.riskControl.view.button.operationRecord`).d('操作记录')}
          </Button>
        </div>
      ),
    });
  };

  const handleCallChangeFilter = item => {
    toggleMap[item.riskEventId] = true;
    queryParam.sort = 'lastUpdateTime,desc';
    setDefaultSortField('lastUpdateTime');
    onCallBackChangeFilter();
  };

  /**
   * 风险广播
   */
  const handleBroadcast = async item => {
    let modal = null;

    const result = await validateOrderStatus();
    if (!(result && !result.failed)) {
      return notification.info({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl
          .get('sdat.riskControl.view.message.broadcastNoOrder')
          .d('广播风险事件失败，失败原因是服务未生效或额度不足，请联系客户经理进行确认'),
      });
    }

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    /**
     * 提交操作
     */
    const handleSubmit = async () => {
      const rcd = await validateOrderStatus();
      if (!(rcd && !rcd.failed)) {
        return notification.info({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl
            .get('sdat.riskControl.view.message.broadcastNoOrder')
            .d('广播风险事件失败，失败原因是服务未生效或额度不足，请联系客户经理进行确认'),
        });
      }

      const isValid = await broadcastDS.validate();
      if (isValid) {
        const obj = broadcastDS?.current?.toData() ?? {};

        // 风险广播，锁定升级
        if (
          obj.processAction &&
          obj.processAction.includes('RISK_BROADCAST') &&
          (!obj.customerRiskProcessPersonList || !obj.customerRiskProcessPersonList.length)
        ) {
          notification.info({
            message: intl.get('hzero.common.message.confirm.title').d('提示'),
            description: intl
              .get('sdat.riskControl.view.message.mustSelectPeople')
              .d('广播人群未维护，无法提交，请确认'),
          });
          return false;
        }

        return Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <div>{intl.get('sdat.riskControl.view.message.isConfirmSubmit').d('是否确认提交')}</div>
          ),
        }).then(async button => {
          if (button === 'ok' && lockKey === 1) {
            lockKey = 0;
            try {
              const param = broadcastDS?.current?.toData() ?? {};
              const res = await fetchSubmitCastData({ ...param, riskProcessUuid: globalUuid });

              lockKey = 1;
              if (getResponse(res)) {
                modal.close();
                handleCallChangeFilter(item);
              }
            } catch (error) {
              lockKey = 1;
            }
          }
        });
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.riskControl.view.button.riskBroadcast').d('风险广播'),
      key: createRiskKey,
      children: <BroadcastModal localRecord={item} broadcastDS={broadcastDS} />,
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '742px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleSubmit}>
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const validateOrderStatus = async () => {
    const res = await fetchOrderStatus();
    return res;
  };

  const handleChangeUuid = str => {
    globalUuid = str;
  };

  /**
   * 生成凭证
   * @param {*} item
   */
  const handleGenerateCard = async (item, type = '', attachmentUuid = '') => {
    const result = await validateOrderStatus();

    const desc =
      type === 'edit'
        ? intl
            .get('sdat.riskControl.view.message.editNoOrder')
            .d('编辑风险处置失败，失败原因是服务未生效或额度不足，请联系客户经理进行确认')
        : intl
            .get('sdat.riskControl.view.message.disposalNoOrder')
            .d('处置风险事件失败，失败原因是服务未生效或额度不足，请联系客户经理进行确认');

    if (!(result && !result.failed)) {
      return notification.info({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: desc,
      });
    }

    let modal = null;
    let CommonComp = RiskVoucherModal;

    const typeMode = item.processAction === 'RISK_BROADCAST'; // 是否风险广播
    let commonDS = disposalDS;

    if (type === 'edit') {
      CommonComp = EditVoucherModal;
    }

    if (item.processAction === 'RISK_BROADCAST') {
      commonDS = voucherBroadcastDS;
    }

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    /**
     * 提交操作
     */
    const handleSubmit = async () => {
      const rcd = await validateOrderStatus();
      if (!(rcd && !rcd.failed)) {
        return notification.info({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: desc,
        });
      }

      const isValid = await commonDS.validate();

      if (isValid) {
        const obj = commonDS?.current?.toData() ?? {};

        // 风险广播，锁定升级
        if (
          obj.processAction &&
          obj.processAction.includes('RISK_BROADCAST') &&
          (!obj.customerRiskProcessPersonList || !obj.customerRiskProcessPersonList.length)
        ) {
          notification.info({
            message: intl.get('hzero.common.message.confirm.title').d('提示'),
            description: intl
              .get('sdat.riskControl.view.message.mustSelectPeople')
              .d('广播人群未维护，无法提交，请确认'),
          });
          return false;
        }

        return Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <div>{intl.get('sdat.riskControl.view.message.isConfirmSubmit').d('是否确认提交')}</div>
          ),
        }).then(async button => {
          if (button === 'ok' && lockKey === 1) {
            lockKey = 0;
            try {
              const param = commonDS?.current?.toData() ?? {};

              const res = await fetchSubmitData({
                ...param,
                riskProcessUuid: globalUuid,
                supplierCompanyId: item?.defineCompanyId,
              });

              lockKey = 1;
              if (getResponse(res)) {
                modal.close();
                handleCallChangeFilter(item);
              }
            } catch (error) {
              lockKey = 1;
            }
          }
        });
      }
    };

    const cooperate = await fetchCooperationFlag({
      companyId: item.defineCompanyId,
    });

    const cooperationFlag = cooperate && typeof cooperate === 'boolean';

    modal = Modal.open({
      title: intl.get('sdat.riskControl.view.button.dealWith').d('处置'),
      key: createRiskKey,
      children: (
        <CommonComp
          typeMode={typeMode}
          parentAttach={attachmentUuid}
          localRecord={item}
          disposalDS={commonDS}
          cooperationFlag={cooperationFlag}
          companyId={item?.defineCompanyId}
          globalUuid={globalUuid}
          eventNumber={item.eventNumber}
          onChangeUuid={handleChangeUuid}
        />
      ),
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '742px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleSubmit}>
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * 查看操作记录
   */
  const openOperationRecordModal = item => {
    let modal = null;

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get(`sdat.riskControl.view.button.operationRecord`).d('操作记录'),
      children: <OperationRecord localRecord={item} modalType="riskDetail" />,
      key: operationRecordKey,
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '432px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * 处置信息操作记录
   * @param {*} item
   */
  const openRecordModal = async item => {
    let modal = null;

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get(`sdat.riskControl.view.button.operationRecord`).d('操作记录'),
      children: <WithdrawalRecordModal localRecord={item} />,
      key: withdrawalRecordKey,
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '432px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * ⻛险事件详情
   * @param {*} item
   */
  const openEventDetail = item => {
    let modal = null;

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.riskControl.view.title.riskIncidentDetail').d('风险事件详情'),
      children: <RiskIncidentDetail localRecord={item} dataSet={incidentDetailDS} />,
      key: riskEventKey,
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '742px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
          <Button onClick={() => openOperationRecordModal(item)}>
            {intl.get(`sdat.riskControl.view.button.operationRecord`).d('操作记录')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * 切换展开面板
   * @param {*} riskEventId
   */
  const handleToggleStatus = riskEventId => {
    toggleMap[riskEventId] = !toggleMap[riskEventId];

    if (toggleMap[riskEventId]) {
      const approveList = riskList.filter(item => riskEventId && item.riskEventId === riskEventId);

      // businessKey 列表
      const arr = approveList.length
        ? approveList[0]?.customerRiskProcessList
            ?.filter(item => item.stastus === '1')
            ?.map(item => item.businessId)
        : [];

      if (!arr.length) {
        setRefresh(true);
        return false;
      }
      // 查询审批列表状态
      fetchApproveStatus({
        businessKeyList: arr,
      }).then(res => {
        if (getResponse(res)) {
          Object.keys(res).forEach(item => {
            if (res[item]) {
              const list = Object.values(res[item]);

              const names = [];
              if (list.length) {
                list.forEach(objs => {
                  names.push(...objs);
                });
              }
              approveStatusMap[item] = names.map(obj => obj.realName);
            }
          });

          setRefresh(true);
        }
      });
    } else {
      setRefresh(true);
    }
  };

  const handleSelectItem = (newValue, oldValue) => {
    const list = [...selectRows];
    let selectArray = [];
    if (!newValue && oldValue) {
      // 取消选中
      selectArray = list.filter(item => item !== oldValue);
    }

    if (newValue && !oldValue) {
      selectArray = list.indexOf(newValue) !== -1 ? [...list] : [...list, newValue];
    }

    setSelectRows(selectArray);
    if (onSelectedList && typeof onSelectedList === 'function') {
      onSelectedList(selectArray);
    }
  };

  /**
   * 列表全选
   * @param {*} newValue
   * @param {*} oldValue
   */
  const handleSelectAll = (newValue, oldValue) => {
    let arr = [];
    if (!newValue && oldValue) {
      // 取消选中
      arr = [];
    }

    if (newValue && !oldValue) {
      // 全选
      arr = riskList.filter(item => item.processPerson).map(item => item.riskEventId);
    }

    setSelectRows(arr);
    if (onSelectedList && typeof onSelectedList === 'function') {
      onSelectedList(arr);
    }
  };

  /**
   * 绘制列表
   * @returns
   */
  const drawIncidentList = (arr = []) => {
    if (!arr.length) {
      return null;
    }

    return (arr || []).map(item => {
      const classnames = [3, '3'].includes(item.eventLevel)
        ? styles['incident-item-tag-high']
        : [2, '2'].includes(item.eventLevel)
        ? styles['incident-item-tag-middle']
        : styles['incident-item-tag-low'];

      const classesMap = {
        PENDING: styles['incident-item-tag-pending'],
        HANDLING: styles['incident-item-tag-handle'],
        FINISH: styles['incident-item-tag-finish'],
      };

      return (
        <div key={item.riskEventId} style={{ display: 'flex' }} ref={ref}>
          {openType ? (
            <div style={{ width: '30px', paddingTop: '20px' }}>
              <CheckBox
                disabled={
                  !(
                    (item.processPerson &&
                      openType === 'open' &&
                      !['PENDING', 'HANDLING'].includes(item.status)) ||
                    (item.processPerson &&
                      openType === 'close' &&
                      ['PENDING', 'HANDLING'].includes(item.status))
                  )
                }
                value={item.riskEventId}
                checked={selectRows.indexOf(item.riskEventId) !== -1}
                onChange={handleSelectItem}
              />
            </div>
          ) : null}

          <div
            className={styles['incident-scroll-card']}
            style={{
              paddingBottom:
                item.customerRiskProcessList && item.customerRiskProcessList.length ? 0 : '12px',
              flex: 1,
            }}
          >
            <div style={{ display: 'flex' }}>
              <div
                style={{
                  flex: '3',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  maxWidth: '80%',
                }}
                onClick={() => openEventDetail(item)}
              >
                <div
                  className={styles['incident-item-title']}
                  style={{ width: '100%', overflow: 'hidden' }}
                >
                  <span style={{ display: 'flex', width: '100%' }}>
                    <Tag className={classnames}>{levelMap[String(item.eventLevel)]}</Tag>
                    <Tooltip title={`${item.eventNumber}  ${item.eventName}`}>
                      <span
                        style={{
                          color: '#000000',
                          fontWeight: '500',
                          display: 'inline-block',
                          lineHeight: '18px',
                          width: '100%',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                        }}
                      >
                        {item.eventNumber}
                        <span style={{ display: 'inline-block', width: '8px' }} />
                        {item.eventName}
                      </span>
                    </Tooltip>
                  </span>
                </div>
                <div className={styles['incident-card-second-row']}>
                  <span
                    style={{
                      lineHeight: '18px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.enterpriseName}
                    <span style={{ display: 'inline-block', width: '16px' }} />
                    {item.lastUpdateDate}
                  </span>
                </div>
              </div>
              <div
                style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'end' }}
              >
                <span style={{ display: 'inline-block' }} className={classesMap[item.status]}>
                  {statusMap[item.status]}
                </span>
                <span style={{ display: 'inline-block', marginTop: '8px' }}>
                  {['PENDING', 'HANDLING'].includes(item.status) && item.processPerson ? (
                    <PermissionButton
                      permissionList={[{ code: 'risk-control-workbench.api.workplace-dealWith' }]}
                      type="text"
                      onClick={() => handleBroadcast(item, 'normal')}
                    >
                      {intl.get('sdat.riskControl.view.button.listBroadcast').d('广播')}
                    </PermissionButton>
                  ) : null}

                  {['PENDING', 'HANDLING'].includes(item.status) && item.processPerson ? ( // 待处理、处理中
                    <PermissionButton
                      permissionList={[{ code: 'risk-control-workbench.api.workplace-close' }]}
                      type="text"
                      style={{ marginLeft: '10px' }}
                      loading={loadingMap[item.riskEventId]}
                      onClick={() => handleNeglect(item, 'close')}
                    >
                      {intl.get('sdat.riskControl.view.button.close').d('关闭')}
                    </PermissionButton>
                  ) : null}

                  {item.status === 'FINISH' && item.processPerson ? (
                    <PermissionButton
                      permissionList={[{ code: 'risk-control-workbench.api.workplace-open' }]}
                      type="text"
                      loading={loadingMap[item.riskEventId]}
                      onClick={() => handleNeglect(item, 'open')}
                    >
                      {intl.get('sdat.riskControl.view.button.open').d('开启')}
                    </PermissionButton>
                  ) : null}

                  {['PENDING', 'HANDLING'].includes(item.status) && item.processPerson ? (
                    <PermissionButton
                      permissionList={[{ code: 'risk-control-workbench.api.workplace-dealWith' }]}
                      type="text"
                      style={{ marginLeft: '10px' }}
                      onClick={() => handleGenerateCard(item, 'normal', item?.attachmentUuid ?? '')}
                    >
                      {intl.get('sdat.riskControl.view.button.dealWith').d('处置')}
                    </PermissionButton>
                  ) : null}
                </span>
              </div>
            </div>
            <div>
              <div
                style={{
                  display: toggleMap[item.riskEventId] ? 'block' : 'none',
                  marginTop: '8px',
                }}
              >
                {item.customerRiskProcessList && item.customerRiskProcessList.length
                  ? drawRiskEventList(item.customerRiskProcessList, item?.attachmentUuid ?? '')
                  : null}
              </div>
              <div style={{ textAlign: 'center' }}>
                {item.customerRiskProcessList && item.customerRiskProcessList.length ? (
                  <Tooltip
                    title={
                      toggleMap[item.riskEventId]
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')
                    }
                  >
                    <Icon
                      type={toggleMap[item.riskEventId] ? 'arrow_drop_up' : 'arrow_drop_down'}
                      style={{ cursor: 'pointer', fontSize: '16px', color: '#4E5769' }}
                      onClick={() => handleToggleStatus(item.riskEventId)}
                    />
                  </Tooltip>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  // 审批操作
  const handleApprove = async item => {
    let modal = null;

    const handleClose = () => {
      if (modal && modal.close) modal.close();
      handleQuery();
    };

    const businessId = item?.businessId ?? '';
    if (!businessId) return false;

    const map = await queryBatchApprovaFlag([businessId]);
    const obj = map[businessId];

    modal = Modal.open({
      title: null,
      header: null,
      key: Modal.key(),
      closable: true,
      children: (
        <>
          <Icon type="close" className={styles['approve-modal-basic']} onClick={handleClose} />
          <ApproveModal
            taskId={obj?.taskId ?? ''}
            processInstanceId={item.workflowId}
            onSuccess={handleClose}
          />
        </>
      ),
      drawer: true,
      maskClosable: true,
      destroyOnClose: true,
      style: { width: '1000px' },
      bodyStyle: { padding: 0 },
      footer: null,
    });
  };

  /**
   * 绘制事件列表
   * @returns
   */
  const drawRiskEventList = (data = [], attachmentUuid = '') => {
    const switchClass = {
      0: styles['incident-item-tag-recall'], // 已撤回
      1: styles['incident-item-tag-approving'], // 审批中
      2: styles['incident-item-tag-approved'], // 审批通过
      3: styles['incident-item-tag-refuse'], // 审批拒绝
    };

    return (data || []).map(item => {
      const approveNames = switchClass[item.stastus];

      const codeList = item?.processAction?.split(',') ?? [];
      const str = codeList.map(rcd => `${actionMap[rcd]} `);

      return (
        <div key={item.riskProcessId} className={styles['incident-event-scroll-card']}>
          <div style={{ display: 'flex' }}>
            <div
              style={{
                flex: '3',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                maxWidth: '82%',
              }}
              onClick={() => openVoucherDetail(item, attachmentUuid)}
            >
              <span
                style={{
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: '#000',
                }}
              >
                {str.join('，')}
              </span>

              <Tooltip title={item?.processReason ?? ''}>
                <div
                  style={{
                    lineHeight: '18px',
                    height: '18px',
                    width: '100%',
                    marginTop: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#4E5769',
                    fontWeight: '400',
                  }}
                >
                  {item?.processReason ?? ''}
                </div>
              </Tooltip>

              <div
                style={{
                  lineHeight: '18px',
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#4E5769',
                  fontWeight: '400',
                }}
              >
                <span>
                  {feedMap[item.processFeedback]}
                  {item.processFeedback ? (
                    <span style={{ display: 'inline-block', width: '16px' }} />
                  ) : null}
                  {item.lastUpdateDate}
                </span>
              </div>
            </div>
            <div
              style={{
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'end',
                justifyContent: 'space-between',
              }}
            >
              <div className={styles['hover-full-pointer']}>
                {item.stastus ? (
                  <Tag className={approveNames}>{approveMap[String(item.stastus)]}</Tag>
                ) : null}
              </div>

              <div
                style={{
                  lineHeight: '18px',
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#4E5769',
                  fontWeight: '400',
                }}
              >
                <span>
                  {item.stastus === '1' &&
                  item.createdBy === getCurrentUser().id &&
                  item.processPerson ? (
                    <PermissionButton
                      permissionList={[{ code: 'risk-control-workbench.api.workplace-recall' }]}
                      type="text"
                      style={{ marginLeft: '10px' }}
                      onClick={() => handleWithdrawalVoucher(item)}
                    >
                      {intl.get('sdat.riskControl.view.button.withdrawal').d('撤回')}
                    </PermissionButton>
                  ) : null}
                  {// 已撤回 可以编辑 除非处置操作
                  item.stastus === '0' && item.processPerson ? (
                    <PermissionButton
                      permissionList={[{ code: 'risk-control-workbench.api.workplace-edit' }]}
                      type="text"
                      style={{ marginLeft: '10px' }}
                      onClick={() => handleGenerateCard(item, 'edit', attachmentUuid)}
                    >
                      {intl.get('hzero.common.button.edit').d('编辑')}
                    </PermissionButton>
                  ) : null}
                  {// 已撤回 可以编辑 除非处置操作
                  approveStatusMap[item.businessId] &&
                  approveStatusMap[item.businessId].length &&
                  approveStatusMap[item.businessId].includes(getCurrentUser().realName) &&
                  item.stastus === '1' ? (
                    <PermissionButton
                      permissionList={[{ code: 'risk-control-workbench.api.workplace-edit' }]}
                      type="text"
                      style={{ marginLeft: '10px' }}
                      onClick={() => handleApprove(item)}
                    >
                      {intl.get('hzero.common.button.approval').d('审批')}
                    </PermissionButton>
                  ) : null}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  /**
   * 批量开启
   */
  const handleBatchOpen = async () => {
    const selectRowList = [];
    if (selectRows.length && riskList.length) {
      riskList.forEach(item => {
        if (selectRows.includes(item.riskEventId)) {
          selectRowList.push({
            ...item,
            status:
              item.customerRiskProcessList && item.customerRiskProcessList.length
                ? 'HANDLING'
                : 'PENDING',
          });
        }
      });
    }

    if (selectRowList.length) {
      return handleContinueUpdate(selectRowList, 'open');
    }
  };

  /**
   * 批量关闭
   */
  const handleBatchClose = async () => {
    const selectRowList = [];
    if (selectRows.length && riskList.length) {
      riskList.forEach(item => {
        if (selectRows.includes(item.riskEventId)) {
          selectRowList.push({
            ...item,
            status: 'FINISH',
          });
        }
      });
    }
    if (selectRowList.length) {
      return handleContinueUpdate(selectRowList, 'close');
    }
  };

  /**
   * 更新操作
   * @param {*} data
   */
  const handleContinueUpdate = async (data, tag) => {
    const result = await validateOrderStatus();
    const desc =
      tag === 'close'
        ? intl
            .get('sdat.riskControl.view.message.closeNoOrder')
            .d('关闭风险事件失败，失败原因是服务未生效或额度不足，请联系客户经理进行确认')
        : intl
            .get('sdat.riskControl.view.message.openNoOrder')
            .d('开启风险事件失败，失败原因是服务未生效或额度不足，请联系客户经理进行确认');

    if (!(result && !result.failed)) {
      return notification.info({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: desc,
      });
    }

    const msg =
      tag === 'close'
        ? intl.get('sdat.riskControl.view.message.confirmClose').d('是否确认关闭？')
        : intl.get('sdat.riskControl.view.message.confirmOpen').d('是否确认开启？');

    return Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: <div>{msg}</div>,
    }).then(async button => {
      if (button === 'ok' && lockKey === 1) {
        lockKey = 0;

        const res = await fetchCloseData([...data]);

        lockKey = 1;
        if (getResponse(res)) {
          notification.success();
          queryParam.page = 0;
          queryParam.size = 10;
          onChangeFilterForRefreshPage();
          setSelectRows([]);
          onClearCache();
          return res;
        }
      }
    });
  };

  useImperativeHandle(ref, () => ({
    batchOpen: () => handleBatchOpen(),
    batchClose: () => handleBatchClose(),
    clearSelect: () => setSelectRows([]),
  }));

  /**
   * 排序字段
   */
  const fields = [
    {
      name: 'lastUpdateTime',
      label: intl.get(`sdat.riskDefinition.model.lastUpdateTime`).d('最后更新时间'),
    },
  ];

  const message = (
    <span>
      <Icon type="help" style={{ marginRight: '10px' }} />
      <span style={{ verticalAlign: 'middle' }}>
        {intl.get('sdat.riskControl.view.message.searchListLength', { name: allData })}
      </span>
    </span>
  );

  const sizeChangerRenderer = ({ text }) => {
    return intl.get('srm.common.view.message.numberPage', { num: text });
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['incident-search-basic-panel']}>
        {showInfo ? (
          <Alert
            className={styles['incident-search-top-info']}
            message={message}
            closable
            onClose={() => setShowInfo(false)}
          />
        ) : null}
        <div
          className={styles['incident-search-bar']}
          style={{ marginTop: showInfo ? '10px' : '0' }}
        >
          <span>
            <TextField
              placeholder={intl.get('sdat.riskControl.view.title.queryKeyValue').d('关键字查询')}
              clearButton
              prefix={<Icon type="search" />}
              onInput={handleInputValue}
              onClear={handleClear}
              onEnterDown={handleQuery}
            />
          </span>
          <span>
            <SortSelector
              sortFieldCode={defaultSortField}
              onSortQuery={handleQuerySort}
              fields={fields}
            />
          </span>
        </div>

        {riskList.length ? (
          <div
            className={styles['incident-scroll-list']}
            // onScrollCapture={onScrollHandle}
            style={{ height: showInfo ? 'calc(100vh - 340px)' : 'calc(100vh - 290px)' }}
            ref={scrollRef}
          >
            {drawIncidentList(riskList)}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: `calc(100vh - ${showInfo ? 272 : 220}px)`,
            }}
          >
            <div>
              <div
                style={{ textAlign: 'center' }}
                className={styles['risk-workplace-list-none-content']}
              >
                <NoContent />
              </div>
              <div
                style={{
                  marginTop: '8px',
                  color: '#868D9C',
                  fontSize: '14px',
                  textAlign: 'center',
                }}
              >
                {intl.get('hzero.common.message.data.none').d('暂无数据')}
              </div>
            </div>
          </div>
        )}

        {riskList.length ? (
          <div
            style={{
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            className={styles['incident-scroll-list-pagination']}
          >
            {openType ? (
              <CheckBox
                checked={
                  riskList?.length &&
                  selectRows.length &&
                  riskList.filter(
                    item =>
                      (item.processPerson &&
                        openType === 'open' &&
                        !['PENDING', 'HANDLING'].includes(item.status)) ||
                      (item.processPerson &&
                        openType === 'close' &&
                        ['PENDING', 'HANDLING'].includes(item.status))
                  )?.length === selectRows.length
                }
                onChange={handleSelectAll}
                disabled={
                  !(
                    riskList?.length &&
                    riskList.filter(
                      item =>
                        (item.processPerson &&
                          openType === 'open' &&
                          !['PENDING', 'HANDLING'].includes(item.status)) ||
                        (item.processPerson &&
                          openType === 'close' &&
                          ['PENDING', 'HANDLING'].includes(item.status))
                    )?.length
                  )
                }
              >
                {intl.get('hzero.common.button.selectAll').d('全选')}
              </CheckBox>
            ) : null}

            <Pagination
              showSizeChangerLabel={false}
              showTotal={false}
              showPager
              sizeChangerPosition="right"
              sizeChangerOptionRenderer={sizeChangerRenderer}
              // itemRender={pagerRenderer}
              total={allData}
              page={(queryParam?.page ?? 0) + 1}
              pageSize={queryParam?.size ?? 10}
              onChange={handleChange}
            />
          </div>
        ) : null}
      </div>
    </Spin>
  );
});

export default DangerousIncidentList;
