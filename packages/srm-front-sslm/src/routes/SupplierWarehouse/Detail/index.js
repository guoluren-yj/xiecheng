/**
 * Detail - 简易供应商入库详情页
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import querystring from 'querystring';
import { compose, concat, isFunction, isEmpty, isBoolean } from 'lodash';
import { routerRedux } from 'dva/router';
import React, { useState, useMemo, useEffect, useCallback, Fragment } from 'react';
import { DataSet, Spin as NewSpin, Modal } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { TopSection, SecondSection } from '_components/Section';
import PositionAnchor from '_components/PositionAnchor';
import remote from 'utils/remote';

import intl from 'utils/intl';
import { getResponse, getCurrentUserId } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import {
  submitAll,
  deleteAll,
  querySupplierInfo,
  queryCreatorInfo,
  saveAll,
  queryRequiredTabsInfo,
  queryDefaultSupplierInfo,
  queryCheckMode,
} from '@/services/supplierWarehouseService';
import DynamicTable from '@/routes/components/DynamicTable/components/DynamicTable';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { checkBankAccountCommon } from '@/services/commonService';
import { getDefaultBankCountryInfo } from '@/services/enterpriseInformService';
import { getBankAccountTips, BANK_ACCOUNT_CONSTANT } from '@/routes/components/utils';
import { queryAllApprovalData } from '@/routes/components/WorkFlowApproval';

import HeaderInfo from './HeaderInfo';
import Contact from './Contact';
import Address from './Address';
import BankAccount from './BankAccount';
import Attachment from './Attachment';
import InfoCompare from '../InfoCompare';
import PurchaseInform from './PurchaseInform';
import HeaderBtns from './HeaderBtns';
import styles from '../index.less';
import {
  getHeaderInfoDS,
  getContactDS,
  getAddressDS,
  getBankAccountDS,
  getAttachmentDS,
  getPurchaseHeaderDS,
  getPurchaseLineDS,
} from '../stores/detailDS';

const { Link } = PositionAnchor;
const currentUserId = getCurrentUserId().toString();
const customizeUnitCode =
  'SSLM.EASY_SUPPLIER_WAREHOUSE.BASIC_INFO,SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT,SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO,SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO,SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT,SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_HEADER,SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE';

const Detail = ({
  dispatch,
  location,
  onLoad,
  customizeForm,
  customizeTable,
  customizeCollapse,
  custLoading,
  getHocInstance,
  match: { params: { extSupplierReqId, reqStatus, userId } = {} } = {},
  supplierWarehouseRemote,
}) => {
  const isPub = useMemo(() => location.pathname.match('/pub/'), [location.pathname]);

  const routerParam = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  const { supplierId, supplierNum, pubEdit = 0 } = routerParam;
  const isEdit = useMemo(
    () => ['NEW', 'REJECTED', undefined].includes(reqStatus) && userId === currentUserId && !isPub,
    [reqStatus, userId]
  );
  // 提交按钮显示逻辑
  const submitFlag = useMemo(
    () => ['NEW', 'REJECTED'].includes(reqStatus) && userId === currentUserId && !isPub,
    [reqStatus, userId]
  );
  const headerDsProps = getHeaderInfoDS({
    isEdit,
    customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.BASIC_INFO',
  });
  const remoteHeraderDsProps = supplierWarehouseRemote.process(
    'SSLM_SUPPLIER_WAREHOUSE_DETAIL_HEADER_DS_PROPS',
    headerDsProps,
    {}
  );
  const headerInfoDs = useMemo(() => new DataSet(remoteHeraderDsProps), [isEdit]);
  const contactDs = useMemo(
    () =>
      new DataSet(
        getContactDS({
          isEdit,
          supplierId,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO',
        })
      ),
    [isEdit, supplierId]
  );
  const addressDs = useMemo(
    () =>
      new DataSet(
        getAddressDS({
          isEdit,
          supplierId,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO',
        })
      ),
    [isEdit, supplierId]
  );
  const bankAccountDs = useMemo(
    () =>
      new DataSet(
        getBankAccountDS({
          isEdit,
          supplierId,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT',
        })
      ),
    [isEdit, supplierId]
  );
  const attachmentDs = useMemo(
    () =>
      new DataSet(
        getAttachmentDS({
          isEdit,
          supplierId,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT',
        })
      ),
    [isEdit, supplierId]
  );
  const purchaseHeaderDs = useMemo(
    () =>
      new DataSet(
        getPurchaseHeaderDS({ customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_HEADER' })
      ),
    [isEdit, supplierId]
  );
  const purchaseLineDs = useMemo(
    () =>
      new DataSet(
        getPurchaseLineDS({
          isEdit,
          supplierId,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE',
        })
      ),
    [isEdit, supplierId]
  );
  const pubEditFlag = useMemo(() => !!Number(pubEdit), [pubEdit]); // 判断工作流是否可编辑

  contactDs.bind(headerInfoDs, 'extSupplierContactReqs');
  addressDs.bind(headerInfoDs, 'extSupplierAddressReqs');
  bankAccountDs.bind(headerInfoDs, 'extSupBkAccountReqs');
  attachmentDs.bind(headerInfoDs, 'extSupplierAttachmentReqs');
  purchaseHeaderDs.bind(headerInfoDs, 'extSupplierPfReq');
  purchaseLineDs.bind(headerInfoDs, 'extSupplierPfLineReqs');

  const [spinning, setSpinning] = useState(false);
  const [relTableList, setRelTableList] = useState([]);
  const [relTableRef, setRelTableRef] = useState({});
  const [mustTabs, setMustTabs] = useState([]);
  const [anchorRef, setAnchorRef] = useState(null);
  const [proxyDsCreate, setProxyDsCreate] = useState({});
  const [checkMode, setCheckMode] = useState('noCheck'); // 业务规则定义银行名称校验方式
  const [bankDefaultInfo, setBankDefaultInfo] = useState({});
  const [approvalBtnInfo, setApprovalBtnInfo] = useState({});
  const [headerData, setHeaderData] = useState({});

  useEffect(() => {
    // 获取银行默认值
    handleBankTabCreateData();
    // 获取业务规则定义tab页必输配置
    queryRequiredTabsInfo().then(async mustResponse => {
      const mustRes = getResponse(mustResponse) || [];
      if (mustRes) {
        setMustTabs(mustRes);
      }

      if (extSupplierReqId) {
        setSpinning(true);
        headerInfoDs.setQueryParameter('extSupplierReqId', extSupplierReqId);
        headerInfoDs
          .query()
          .then(res => {
            if (res) {
              setHeaderData(res);
              // 查询审批/撤销审批
              handleAllApprovalData(res);
            }
          })
          .finally(() => {
            setSpinning(false);
          });
      } else if (supplierId) {
        // 变更信息
        setSpinning(true);
        querySupplierInfo({ supplierId, customizeUnitCode })
          .then(response => {
            const res = getResponse(response);
            if (res) {
              updateSupplierInfo(res);
            }
          })
          .finally(() => setSpinning(false));
      } else {
        // 新建时默认带出申请人，创建人部门
        // 新建头ds，然后接口请求成功之后再更新数据，目的是解决头ds没有创建，采购财务头ds新建报错
        const cuxInitAttributeData = await supplierWarehouseRemote?.process(
          'cuxHandleCreateInfo',
          {},
          {}
        );
        headerInfoDs.create({ ...(cuxInitAttributeData || {}) });
        setSpinning(true);
        Promise.all([queryCreatorInfo(), queryDefaultSupplierInfo()])
          .then(resp => {
            const [userInfo, supplierInfo] = resp;
            if (getResponse(userInfo)) {
              const { realName, unitId, unitName } = userInfo;
              if (headerInfoDs.current) {
                headerInfoDs.current.set({
                  creator: realName,
                  unitId,
                  unitName,
                });
              } else {
                headerInfoDs.create({
                  creator: realName,
                  unitId,
                  unitName,
                });
              }
              // 至少填写一条数据,默认带出一条
              // autoCreate会影响变更信息
              // 补充：需要根据业务规则配置，判断是否需要默认带出一条数据
              // ADDRESS：地址 | CONTACT：联系人 | BANK：银行
              if (mustRes && mustRes.includes('CONTACT')) {
                contactDs.create({}, 0);
              }
              if (mustRes && mustRes.includes('ADDRESS')) {
                addressDs.create({}, 0);
              }
              if (mustRes && mustRes.includes('BANK')) {
                bankAccountDs.create({}, 0);
              }
            }
            if (getResponse(supplierInfo)) {
              if (!isEmpty(supplierInfo)) {
                const { extSupplierPfLineReqs = [] } = supplierInfo;
                extSupplierPfLineReqs.forEach(purchaseLine => {
                  purchaseLineDs.create(purchaseLine);
                });
              }
            }
          })
          .finally(() => {
            setSpinning(false);
            // 新建采购财务默认值支持
            setProxyDsCreate({
              createNow: true,
              createData: {},
            });
          });
      }
    });
    // 获取规则定义银行名称校验方式
    queryCheckMode({ supplierType: 'IMPORTED_SUPPLIER' }).then(res => {
      const response = getResponse(res);
      if (response) {
        setCheckMode(response.checkMode);
      }
    });
    // 查询配置表
    queryRelTableConfig('sslm_external_supplier_req').then(res => {
      setRelTableList(res);
    });
    // 处理工作流审批保存
    if (isFunction(onLoad)) {
      onLoad({
        submit: workflowSubmit,
      });
    }
  }, [extSupplierReqId, supplierId]);

  const workflowSubmit = useCallback(approveResult => {
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved') {
        const res = await handleSave();
        if (res) {
          resolve(res);
        } else {
          reject(new Error(res)); // 异常
        }
      } else {
        resolve();
      }
    });
  }, []);

  const handleAllApprovalData = (params = {}) => {
    const { businessKey } = params || {};
    if (businessKey) {
      queryAllApprovalData({ businessKeys: [businessKey], queryHistoryFlag: false }).then(res => {
        if (res) {
          const { approvalDataMap, revokeDataMap } = res;
          setApprovalBtnInfo({
            approvalDataMap,
            revokeDataMap,
          });
        }
      });
    } else {
      setApprovalBtnInfo({});
    }
  };

  // 获取银行页签新建默认带出数据
  const handleBankTabCreateData = useCallback(() => {
    getDefaultBankCountryInfo().then(res => {
      if (getResponse(res)) {
        setBankDefaultInfo(res);
      }
    });
  }, [extSupplierReqId, supplierId]);

  // 更新供应商信息
  const updateSupplierInfo = params => {
    const {
      extSupplierContactReqs = [],
      extSupplierAddressReqs = [],
      extSupBkAccountReqs = [],
      extSupplierAttachmentReqs = [],
      extSupplierPfReq = {},
      extSupplierPfLineReqs = [],
      ...headerInfo
    } = params;
    headerInfoDs.create({ ...headerInfo, reqTypeCode: 'SUP_UPDATE_REQ' });
    extSupplierContactReqs.forEach(contact => {
      contactDs.create(contact);
    });
    extSupplierAddressReqs.forEach(address => {
      addressDs.create(address);
    });
    extSupBkAccountReqs.forEach(account => {
      bankAccountDs.create(account);
    });
    extSupplierAttachmentReqs.forEach(attachment => {
      attachmentDs.create(attachment);
    });
    purchaseHeaderDs.create({ ...extSupplierPfReq });
    extSupplierPfLineReqs.forEach(purchaseLine => {
      purchaseLineDs.create(purchaseLine);
    });
    // 变更信息-二开处理额外的数据加载
    supplierWarehouseRemote.event.fireEvent('cuxHandleUpdateInit', {
      headerInfoDs,
      supplierId,
      extSupplierReqId,
    });
  };

  // 保存
  const handleSave = useCallback(async () => {
    // 校验模型表数据
    let checkModelTableFlag = true;
    let modelDatas = [];
    relTableList.forEach(n => {
      if (relTableRef[n.tableCode]) {
        const tableData = relTableRef[n.tableCode].checkData();
        if (checkModelTableFlag) {
          checkModelTableFlag = tableData;
        }
        if (tableData) {
          modelDatas = concat(modelDatas, tableData);
        }
      }
    });
    if ((await headerInfoDs.validate()) && checkModelTableFlag) {
      setSpinning(true);
      let params = headerInfoDs.current ? headerInfoDs.current.toJSONData() : {};
      // 处理采购财务-头信息，表单只取一条数据
      const extSupplierPfReq = purchaseHeaderDs.current
        ? purchaseHeaderDs.current.toJSONData()
        : null;
      params = {
        ...params,
        extSupplierPfReq,
      };
      return new Promise(resolve => {
        saveAll({ ...params, modelDatas, customizeUnitCode })
          .then(async response => {
            const res = getResponse(response);
            if (res) {
              const {
                _status,
                createdBy,
                extSupplierReqId: newExtSupplierReqId,
                reqStatus: newReqStatus,
              } = res;
              if (_status === 'create') {
                resolve(res);
                dispatch(
                  routerRedux.push({
                    pathname: `/sslm/supplier-warehouse/detail/${newExtSupplierReqId}/${newReqStatus}/${createdBy}`,
                  })
                );
              } else {
                relTableList.forEach(n => {
                  if (relTableRef[n.tableCode]) {
                    relTableRef[n.tableCode].queryDynamicTable();
                  }
                });
                try {
                  await headerInfoDs.query();
                } finally {
                  resolve(res);
                }
              }
            } else {
              resolve(false);
            }
          })
          .finally(() => setSpinning(false));
      });
    } else {
      notification.error({
        description: intl
          .get('sslm.common.view.message.requiredMsg')
          .d('请检查是否有必填项未填写！'),
      });
    }
  }, [relTableList, relTableRef]);

  // 校验银行名称不一致
  const handleCheckBankAccount = ({ params, modelDatas }) => {
    const { supplierName } = params;
    const data = params.extSupBkAccountReqs || [];
    const bankAccountList = data.map(n => {
      const { extBkAccountReqId, bankAccountName, bankAccountNum, enabledFlag } = n;
      return {
        bankAccountId: extBkAccountReqId,
        bankAccountName,
        bankAccountNum,
        enabledFlag,
      };
    });
    setSpinning(true);
    return checkBankAccountCommon({
      bankAccountList,
      documentSource: 'EXT_SUPPLIER_REQ',
      companyName: supplierName,
      documentId: extSupplierReqId || -1,
    }).then(res => {
      if (getResponse(res)) {
        const { bankDataFlag = true, bankNameFlag = true } = res || {};
        const checkRepeat = isBoolean(bankDataFlag) && !bankDataFlag;
        // 银行名称不一致需要前端校验的场景
        const checkDifferent =
          isBoolean(bankNameFlag) && !bankNameFlag && checkMode === 'weakCheck';
        if (checkRepeat || checkDifferent) {
          const bankRepeatMsg = checkRepeat
            ? getBankAccountTips(BANK_ACCOUNT_CONSTANT.DUPLICATE)
            : '';
          const bankAccountDifferentMsg = checkDifferent ? getBankAccountTips() : '';
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: (
              <Fragment>
                <div>{bankRepeatMsg}</div>
                <div>{bankAccountDifferentMsg}</div>
              </Fragment>
            ),
            onOk: () => {
              return new Promise(resolve => {
                onSubmit({ params, modelDatas, customizeUnitCode }).finally(() => {
                  setSpinning(false);
                  resolve(true);
                });
              });
            },
            onCancel: () => {
              setSpinning(false);
            },
          });
        } else {
          return onSubmit({ params, modelDatas, customizeUnitCode }).finally(() => {
            setSpinning(false);
          });
        }
      } else {
        setSpinning(false);
      }
    });
  };

  // 提交
  const handleSubmit = useCallback(async () => {
    // 校验模型表数据
    let checkModelTableFlag = true;
    let modelDatas = [];
    relTableList.forEach(n => {
      if (relTableRef[n.tableCode]) {
        const tableData = relTableRef[n.tableCode].checkData();
        if (checkModelTableFlag) {
          checkModelTableFlag = tableData;
        }
        if (tableData) {
          modelDatas = concat(modelDatas, tableData);
        }
      }
    });
    if ((await headerInfoDs.validate()) && checkModelTableFlag) {
      let params = headerInfoDs.current ? headerInfoDs.current.toJSONData() : {};
      // 处理采购财务-头信息，表单只取一条数据
      const extSupplierPfReq = purchaseHeaderDs.current
        ? purchaseHeaderDs.current.toJSONData()
        : null;
      params = {
        ...params,
        extSupplierPfReq,
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      const cuxRes = await supplierWarehouseRemote.event.fireEvent('cuxHandleSubmitModal', {
        headerInfoDs,
      });
      if (!cuxRes) {
        return;
      }
      return new Promise(resolve => {
        handleCheckBankAccount({ params, modelDatas }).finally(() => resolve(true));
      });
    } else {
      notification.error({
        description: intl
          .get('sslm.common.view.message.requiredMsg')
          .d('请检查是否有必填项未填写！'),
      });
    }
  }, [relTableList, relTableRef, checkMode]);

  const onSubmit = ({ params, modelDatas }) => {
    return submitAll({ ...params, modelDatas, customizeUnitCode }).then(response => {
      const res = getResponse(response);
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: '/sslm/supplier-warehouse/list',
          })
        );
      }
    });
  };

  // 删除
  const handleDelete = useCallback(() => {
    let params = headerInfoDs.current ? headerInfoDs.current.toJSONData() : {};
    // 处理采购财务-头信息，表单只取一条数据
    const extSupplierPfReq = purchaseHeaderDs.current
      ? purchaseHeaderDs.current.toJSONData()
      : null;
    params = {
      ...params,
      extSupplierPfReq,
    };
    const { extSupplierReqId: newExtSupplierReqId } = params;
    if (newExtSupplierReqId) {
      setSpinning(true);
      deleteAll({ ...params, customizeUnitCode })
        .then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: '/sslm/supplier-warehouse/list',
              })
            );
          }
        })
        .finally(() => setSpinning(false));
    } else {
      dispatch(
        routerRedux.push({
          pathname: '/sslm/supplier-warehouse/list',
        })
      );
    }
  }, []);

  // 信息比对
  const handleInfoCompare = useCallback(() => {
    Modal.open({
      key: Modal.key(),
      closable: true,
      movable: false,
      fullScreen: true,
      footer: null,
      title: intl.get('hzero.common.button.infoCompare').d('信息比对'),
      children: (
        <InfoCompare
          customizeForm={customizeForm}
          customizeTable={customizeTable}
          custLoading={custLoading}
          extSupplierReqId={extSupplierReqId}
          customizeCollapse={customizeCollapse}
        />
      ),
    });
  }, []);

  const linkList = [
    {
      key: 'supplierBaseInfo',
      title: intl.get('sslm.supplierWarehouse.view.warehous.supplierBaseInfo').d('供应商基础信息'),
    },
    {
      key: 'contact',
      title: intl.get('sslm.supplierWarehouse.view.warehous.contact').d('联系人'),
    },
    {
      key: 'address',
      title: intl.get('sslm.supplierWarehouse.view.warehous.address').d('地址'),
    },
    {
      key: 'bankAccount',
      title: intl.get('sslm.supplierWarehouse.view.warehous.bankAccount').d('银行账户'),
    },
    {
      key: 'attachment',
      title: intl.get('sslm.supplierWarehouse.view.warehous.attachment').d('附件'),
    },
    {
      key: 'purchaseInform',
      title: intl.get('sslm.supplierInform.view.fixCatalog.purchaseInform').d('采购/财务信息'),
    },
  ];

  // 操作记录弹窗
  const handleOperationModal = useCallback(() => {
    operationRecordsModal({
      documentType: 'simpleSupplier',
      documentId: extSupplierReqId,
    });
  }, []);

  const relTableLink = (relTableList || []).map(n => {
    return {
      key: n.tableCode,
      title: n.tableName,
    };
  });

  const onRef = useCallback(
    (form = {}, tableCode = '') => {
      const tableCodeRef = {
        [tableCode]: form,
      };
      setRelTableRef(prevState => ({ ...prevState, ...tableCodeRef }));
    },
    [relTableRef]
  );

  // 渲染定位轴中的link
  const renderLinks = useCallback(() => {
    const allLinkList = linkList.concat(relTableLink);
    return allLinkList.map(link => <Link href={`#${link.key}`} title={link.title} />);
  }, [linkList, relTableLink]);

  const handleRefresh = useCallback(() => {
    setSpinning(true);
    headerInfoDs
      .query()
      .then(res => {
        if (res) {
          // 查询审批/撤销审批
          handleAllApprovalData(res);
        }
      })
      .finally(() => setSpinning(false));
  }, []);

  return (
    <Fragment>
      <Header
        backPath="/sslm/supplier-warehouse/list"
        title={intl
          .get('sslm.supplierWarehouse.view.title.simpleSupplierWarehouse')
          .d('简易供应商入库')}
      >
        <HeaderBtns
          submitFlag={submitFlag}
          handleSubmit={handleSubmit}
          loading={spinning}
          handleSave={handleSave}
          isEdit={isEdit}
          headerData={headerData}
          handleDelete={handleDelete}
          handleInfoCompare={handleInfoCompare}
          handleOperationModal={handleOperationModal}
          extSupplierReqId={extSupplierReqId}
          approvalBtnInfo={approvalBtnInfo}
          handleRefresh={handleRefresh}
          isPub={isPub}
        />
      </Header>
      <Content>
        <Spin spinning={spinning}>
          <div className={styles['warehouse-content']}>
            <div id="supplierWarehouseAnchor">
              <TopSection
                code="SSLM.EASY_SUPPLIER_WAREHOUSE.CARDS"
                getHocInstance={getHocInstance}
                getPositionAnchor={() => {
                  return anchorRef;
                }}
              >
                <SecondSection
                  title={
                    <div id="supplierBaseInfo">
                      {intl
                        .get('sslm.supplierWarehouse.view.warehous.supplierBaseInfo')
                        .d('供应商基础信息')}
                    </div>
                  }
                  code="supplierBaseInfo"
                >
                  <NewSpin dataSet={headerInfoDs}>
                    <HeaderInfo
                      dataSet={headerInfoDs}
                      isEdit={isEdit}
                      pubEditFlag={pubEditFlag}
                      customizeForm={customizeForm}
                      custLoading={custLoading}
                      remote={supplierWarehouseRemote}
                      code="SSLM.EASY_SUPPLIER_WAREHOUSE.BASIC_INFO"
                    />
                  </NewSpin>
                </SecondSection>
                <SecondSection
                  title={
                    <div id="contact" className={styles['simple-card-title']}>
                      {intl.get('sslm.supplierWarehouse.view.warehous.contact').d('联系人')}
                      <span style={{ display: isEdit ? 'inline-block' : 'none' }}>
                        {mustTabs.includes('CONTACT') &&
                          intl
                            .get('sslm.supplierWarehouse.view.warehous.contactAtLastOne')
                            .d('请至少维护一条默认联系人。')}
                      </span>
                    </div>
                  }
                  code="contact"
                >
                  <Contact
                    dataSet={contactDs}
                    isEdit={isEdit}
                    code="SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO"
                    buttonCode="SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO_BTNS"
                    customizeTable={customizeTable}
                    custLoading={custLoading}
                  />
                </SecondSection>
                <SecondSection
                  title={
                    <div id="address" className={styles['simple-card-title']}>
                      {intl.get('sslm.supplierWarehouse.view.warehous.address').d('地址')}
                      <span style={{ display: isEdit ? 'inline-block' : 'none' }}>
                        {mustTabs.includes('ADDRESS') &&
                          intl
                            .get('sslm.supplierWarehouse.view.warehous.addressAtLastOne')
                            .d('请至少维护一条地址信息。')}
                      </span>
                    </div>
                  }
                  code="address"
                >
                  <Address
                    dataSet={addressDs}
                    isEdit={isEdit}
                    code="SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO"
                    buttonCode="SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO_BTNS"
                    customizeTable={customizeTable}
                    custLoading={custLoading}
                  />
                </SecondSection>
                <SecondSection
                  title={
                    <div id="bankAccount" className={styles['simple-card-title']}>
                      {intl.get('sslm.supplierWarehouse.view.warehous.bankAccount').d('银行账户')}
                      <span style={{ display: isEdit ? 'inline-block' : 'none' }}>
                        {mustTabs.includes('BANK') &&
                          intl
                            .get('sslm.supplierWarehouse.view.warehous.bankAccountAtLastOne')
                            .d('请至少维护一条银行主账户。')}
                      </span>
                    </div>
                  }
                  code="bankAccount"
                >
                  <BankAccount
                    dataSet={bankAccountDs}
                    isEdit={isEdit}
                    code="SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT"
                    buttonCode="SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT_BTNS"
                    customizeTable={customizeTable}
                    custLoading={custLoading}
                    bankDefaultInfo={bankDefaultInfo}
                    supplierWarehouseRemote={supplierWarehouseRemote}
                  />
                </SecondSection>
                <SecondSection
                  title={
                    <div id="attachment" className={styles['simple-card-title']}>
                      {intl.get('sslm.supplierWarehouse.view.warehous.attachment').d('附件')}
                      <span style={{ display: isEdit ? 'inline-block' : 'none' }}>
                        {mustTabs.includes('ATTACHMENT') &&
                          intl
                            .get('sslm.supplierWarehouse.view.warehous.attachmentAccountAtLastOne')
                            .d('请至少填写一条附件信息。')}
                      </span>
                    </div>
                  }
                  code="attachment"
                >
                  <Attachment
                    dataSet={attachmentDs}
                    isEdit={isEdit}
                    code="SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT"
                    buttonCode="SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT_BTNS"
                    customizeTable={customizeTable}
                    custLoading={custLoading}
                    supplierWarehouseRemote={supplierWarehouseRemote}
                  />
                </SecondSection>
                <SecondSection
                  title={
                    <div id="purchaseInform" className={styles['simple-card-title']}>
                      {intl
                        .get('sslm.supplierInform.view.fixCatalog.purchaseInform')
                        .d('采购/财务信息')}
                      <span style={{ display: isEdit ? 'inline-block' : 'none' }}>
                        {mustTabs.includes('FINANCIAL') &&
                          intl
                            .get('sslm.supplierWarehouse.view.warehous.purchaseInformAtLastOne')
                            .d('请至少填写一条采购/财务信息。')}
                      </span>
                    </div>
                  }
                  code="purchaseInform"
                >
                  <PurchaseInform
                    proxyDsCreate={proxyDsCreate}
                    headerDs={purchaseHeaderDs}
                    lineDs={purchaseLineDs}
                    isEdit={isEdit}
                    headerCode="SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_HEADER"
                    lineCode="SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE"
                    buttonCode="SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE_BTNS"
                    customizeTable={customizeTable}
                    customizeForm={customizeForm}
                    custLoading={custLoading}
                  />
                </SecondSection>
              </TopSection>
              <TopSection getHocInstance={getHocInstance} className={styles['second-top-section']}>
                {(relTableList || []).map(n => {
                  const modelTable = {
                    ...n,
                    extSupplierNum: supplierNum,
                    supplierId,
                  };
                  return (
                    <SecondSection title={<div id={n.tableCode}>{n.tableName}</div>}>
                      <DynamicTable
                        modelTable={modelTable}
                        relationId={extSupplierReqId}
                        c7nButton
                        viewSaveButton={!!extSupplierReqId}
                        readOnly={!isEdit}
                        onRef={(ref = {}) => {
                          onRef(ref, n.tableCode);
                        }}
                        interfaceChange={!!supplierId}
                        readyQuery={!!supplierId}
                      />
                    </SecondSection>
                  );
                })}
              </TopSection>
            </div>
            {/* 个性化card和定位置兼容 */}
            <PositionAnchor
              getContainer={() => document.getElementById('supplierWarehouseAnchor')}
              onRef={ref => {
                setAnchorRef(ref);
              }}
            >
              {renderLinks()}
            </PositionAnchor>
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.supplierWarehouse',
      'sslm.common',
      'hzero.common',
      'sslm.supplierInform',
      'spfm.importErp',
      'spfm.bank',
    ],
  }),
  WithCustomize({
    unitCode: [
      'SSLM.EASY_SUPPLIER_WAREHOUSE.BASIC_INFO',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_HEADER',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.CARDS',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.COLLAPSE',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO_BTNS',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO_BTNS',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT_BTNS',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT_BTNS',
      'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE_BTNS',
    ],
  }),
  remote(
    {
      code: 'SSLM_SUPPLIER_WAREHOUSE_DETAIL',
      name: 'supplierWarehouseRemote',
    },
    {
      events: {
        cuxHandleUpdateInit() {}, // 变更信息-二开增加额外的数据初始化
        cuxHandleSubmitModal() {}, // 提交增加弱弹框
      },
    }
  )
)(Detail);
