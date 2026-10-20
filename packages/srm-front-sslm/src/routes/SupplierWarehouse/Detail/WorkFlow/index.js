/**
 * Detail - 简易供应商入库审批表单
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import querystring from 'querystring';
import { compose } from 'lodash';
import React, { useState, useMemo, useEffect, useCallback, Fragment } from 'react';
import { Button, DataSet, Form, Output } from 'choerodon-ui/pro';
import { Spin, Card, Tabs, Alert, Badge } from 'choerodon-ui';
import { AFBasic } from '_components/AFCards';
import { getTooltipShow } from '@/routes/components/utils';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { querySupplierInfo } from '@/services/supplierWarehouseService';
import DynamicTable from '@/routes/components/DynamicTable/components/DynamicTable';
import DynamicButtons from '_components/DynamicButtons';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import HeaderInfo from '../HeaderInfo';
import Contact from '../Contact';
import Address from '../Address';
import BankAccount from '../BankAccount';
import Attachment from '../Attachment';
import PurchaseInform from '../PurchaseInform';
import CompareHeaderInfo from './components/CompareHeaderInfo';
import CompareAddress from './components/CompareAddress';
import CompareAttachment from './components/CompareAttachment';
import CompareContact from './components/CompareContact';
import CompareBankAccount from './components/CompareBankAccount';
import ComparePurchaseInform from './components/PurchaseInform';
import styles from './index.less';
import {
  getHeaderInfoDS,
  getContactDS,
  getAddressDS,
  getBankAccountDS,
  getAttachmentDS,
  getPurchaseHeaderDS,
  getPurchaseLineDS,
  getCommonInfoDS,
} from '../../stores/detailDS';
import {
  getHeaderInfoDS as getCompareHeaderInfoDs,
  getContactDS as getCompareContactDS,
  getAddressDS as getCompareAddressDS,
  getBankAccountDS as getCompareBankAccountDS,
  getAttachmentDS as getCompareAttachmentDS,
  getPurchaseHeaderDS as getComparePurchaseHeadersDS,
  getPurchaseLineDS as getComparePurchaseLineDS,
} from '../../stores/infoCompareDS';

const { TabPane } = Tabs;
const customizeUnitCode =
  'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.AF_BASIC,SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.BASIC_INFO,SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.BANK_INFO,SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.ATTACHMENT,SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.CONTACT,SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.ADDRESS_INFO,SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.PURCHASE_HEADER,SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.PURCHASE_LINE';

const Detail = ({
  location,
  customizeForm,
  customizeCommon,
  customizeTable,
  custLoading,
  queryTemplateConfig,
  match: { params: { extSupplierReqId } = {} } = {},
}) => {
  const routerParam = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  const {
    supplierId,
    supplierNum,
    templateCode,
    templateVersion,
    stageCode,
    pageCode,
  } = routerParam;
  const isEdit = false;
  const workFlowCode = useMemo(
    () => ({
      cuszTplStageCode: stageCode,
      cuszTplPageCode: pageCode,
      cuszTplTemplateCode: templateCode,
      cuszTplVersion: templateVersion,
    }),
    [templateCode, templateVersion, stageCode, pageCode]
  );
  const commonInfoDs = useMemo(() => new DataSet(getCommonInfoDS({ isEdit })), [isEdit]);
  const headerInfoDs = useMemo(
    () =>
      new DataSet(
        getHeaderInfoDS({
          isEdit,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.BASIC_INFO',
        })
      ),
    [isEdit]
  );
  const compareHeaderInfoDs = useMemo(
    () =>
      new DataSet(
        getCompareHeaderInfoDs({
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.BASIC_INFO',
        })
      ),
    [extSupplierReqId]
  );
  const contactDs = useMemo(
    () =>
      new DataSet(
        getContactDS({
          isEdit,
          supplierId,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.CONTACT',
        })
      ),
    [isEdit, supplierId]
  );
  const compareContactDs = useMemo(
    () =>
      new DataSet(
        getCompareContactDS({
          onlyShowChange,
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.CONTACT',
        })
      ),
    [extSupplierReqId]
  );
  const addressDs = useMemo(
    () =>
      new DataSet(
        getAddressDS({
          isEdit,
          supplierId,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.ADDRESS_INFO',
        })
      ),
    [isEdit, supplierId]
  );
  const compareAddressDs = useMemo(
    () =>
      new DataSet(
        getCompareAddressDS({
          onlyShowChange,
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.ADDRESS_INFO',
        })
      ),
    [extSupplierReqId]
  );
  const bankAccountDs = useMemo(
    () =>
      new DataSet(
        getBankAccountDS({
          isEdit,
          supplierId,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.BANK_INFO',
        })
      ),
    [isEdit, supplierId]
  );
  const compareBankAccountDs = useMemo(
    () =>
      new DataSet(
        getCompareBankAccountDS({
          onlyShowChange,
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.BANK_INFO',
        })
      ),
    [extSupplierReqId]
  );
  const attachmentDs = useMemo(
    () =>
      new DataSet(
        getAttachmentDS({
          isEdit,
          supplierId,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.ATTACHMENT',
        })
      ),
    [isEdit, supplierId]
  );
  const compareAttachmentDs = useMemo(
    () =>
      new DataSet(
        getCompareAttachmentDS({
          onlyShowChange,
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.ATTACHMENT',
        })
      ),
    [extSupplierReqId]
  );
  const purchaseHeaderDs = useMemo(
    () =>
      new DataSet(
        getPurchaseHeaderDS({
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.PURCHASE_HEADER',
        })
      ),
    [isEdit, supplierId]
  );
  const comparePurchaseHeaderDs = useMemo(
    () =>
      new DataSet(
        getComparePurchaseHeadersDS({
          extSupplierReqId,
          compare: 2,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.PURCHASE_HEADER',
        })
      ),
    [extSupplierReqId]
  );
  const purchaseLineDs = useMemo(
    () =>
      new DataSet(
        getPurchaseLineDS({
          isEdit,
          supplierId,
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.PURCHASE_LINE',
        })
      ),
    [isEdit, supplierId]
  );
  const comparePurchaseLineDs = useMemo(() => {
    return new DataSet(
      getComparePurchaseLineDS({
        extSupplierReqId,
        compare: 2,
        customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.PURCHASE_LINE',
      })
    );
  }, [extSupplierReqId]);

  contactDs.bind(headerInfoDs, 'extSupplierContactReqs');
  addressDs.bind(headerInfoDs, 'extSupplierAddressReqs');
  bankAccountDs.bind(headerInfoDs, 'extSupBkAccountReqs');
  attachmentDs.bind(headerInfoDs, 'extSupplierAttachmentReqs');
  purchaseHeaderDs.bind(headerInfoDs, 'extSupplierPfReq');
  purchaseLineDs.bind(headerInfoDs, 'extSupplierPfLineReqs');

  const [spinning, setSpinning] = useState(false);
  const [reqTypeCode, setReqTypeCode] = useState('');
  const [relTableList, setRelTableList] = useState([]);
  const [relTableRef, setRelTableRef] = useState({});
  const [onlyShowChange, setOnlyShowChange] = useState(false);
  const [waitCustomize, setWaitCustomize] = useState(false);
  const [filterUnchangeTanpes, setFilterUnchangeTanpes] = useState([]);

  useEffect(() => {
    if (waitCustomize) {
      if (extSupplierReqId) {
        setSpinning(true);
        headerInfoDs.setQueryParameter('extSupplierReqId', extSupplierReqId);
        commonInfoDs.setQueryParameter('extSupplierReqId', extSupplierReqId);
        headerInfoDs.setQueryParameter('workFlowCode', workFlowCode);
        commonInfoDs.setQueryParameter('workFlowCode', workFlowCode);
        Promise.all([headerInfoDs.query(), commonInfoDs.query()])
          .then(res => {
            const [headerInfo] = res;
            if (getResponse(headerInfo)) {
              const { reqTypeCode: newReqTypeCode } = headerInfo;
              setReqTypeCode(newReqTypeCode);
            }
          })
          .finally(() => {
            setSpinning(false);
          });
      } else if (supplierId) {
        // 变更信息
        setSpinning(true);
        Promise.all([
          querySupplierInfo({
            supplierId,
            customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.AF_BASIC',
            ...workFlowCode,
          }),
          querySupplierInfo({ supplierId, customizeUnitCode, ...workFlowCode }),
        ])
          .then(res => {
            const [, headerInfo] = res;
            if (getResponse(headerInfo)) {
              updateSupplierInfo(res);
            }
          })
          .finally(() => setSpinning(false));
      }
      // 查询配置表
      queryRelTableConfig('sslm_external_supplier_req').then(res => {
        setRelTableList(res);
      });
    }
  }, [extSupplierReqId, supplierId, waitCustomize]);

  const setQueryParameters = useCallback(
    data => {
      data.forEach(i => {
        i.setQueryParameter('cuszTplStageCode', stageCode);
        i.setQueryParameter('cuszTplPageCode', pageCode);
        i.setQueryParameter('cuszTplTemplateCode', templateCode);
        i.setQueryParameter('cuszTplVersion', templateVersion);
      });
    },
    [stageCode, pageCode, templateCode, templateVersion]
  );

  useEffect(() => {
    if (reqTypeCode === 'SUP_UPDATE_REQ') {
      setSpinning(true);
      setQueryParameters([
        compareHeaderInfoDs,
        compareContactDs,
        compareAddressDs,
        compareBankAccountDs,
        compareAttachmentDs,
        comparePurchaseHeaderDs,
        comparePurchaseLineDs,
      ]);
      comparePurchaseLineDs.setState('onlyShowChange', true);
      compareAddressDs.setState('onlyShowChange', true);
      compareContactDs.setState('onlyShowChange', true);
      compareAttachmentDs.setState('onlyShowChange', true);
      compareBankAccountDs.setState('onlyShowChange', true);
      Promise.all([
        compareHeaderInfoDs.query(),
        compareContactDs.query(),
        compareAddressDs.query(),
        compareBankAccountDs.query(),
        compareAttachmentDs.query(),
        comparePurchaseHeaderDs.query(),
        comparePurchaseLineDs.query(),
      ])
        .then(res => {
          const [
            headerInfo,
            contactInfo,
            addressInfo,
            bankAccountInfo,
            attachmentInfo,
            purchaseHeadInfo,
            purchaseLineInfo,
          ] = res;
          const arr = [];
          if (
            getResponse(headerInfo) &&
            ['CREATE', 'UPDATE'].includes(getResponse(headerInfo).objectFlag)
          ) {
            arr.push('supplierBaseInfo');
          }
          if (getResponse(contactInfo)) {
            const flag = getResponse(contactInfo).some(i =>
              ['CREATE', 'UPDATE', 'DELETE'].includes(i.objectFlag)
            );
            if (flag) {
              arr.push('contact');
            }
          }
          if (getResponse(addressInfo)) {
            const flag = getResponse(addressInfo)?.some(i =>
              ['CREATE', 'UPDATE', 'DELETE'].includes(i.objectFlag)
            );
            if (flag) {
              arr.push('address');
            }
          }
          if (getResponse(bankAccountInfo)) {
            const flag = getResponse(bankAccountInfo)?.some(i =>
              ['CREATE', 'UPDATE', 'DELETE'].includes(i.objectFlag)
            );
            if (flag) {
              arr.push('bankAccount');
            }
          }
          if (getResponse(attachmentInfo)) {
            const flag = getResponse(attachmentInfo)?.some(i =>
              ['CREATE', 'UPDATE', 'DELETE'].includes(i.objectFlag)
            );
            if (flag) {
              arr.push('attachment');
            }
          }
          if (
            getResponse(purchaseHeadInfo) &&
            ['CREATE', 'UPDATE', 'DELETE'].includes(getResponse(purchaseHeadInfo).objectFlag)
          ) {
            const flag = getResponse(purchaseLineInfo)?.some(i =>
              ['CREATE', 'UPDATE', 'DELETE'].includes(i.objectFlag)
            );
            if (flag) {
              arr.push('purchaseInform');
            }
          }
          setFilterUnchangeTanpes(arr);
          comparePurchaseLineDs.setState('onlyShowChange', onlyShowChange);
          compareAddressDs.setState('onlyShowChange', onlyShowChange);
          compareContactDs.setState('onlyShowChange', onlyShowChange);
          compareAttachmentDs.setState('onlyShowChange', onlyShowChange);
          compareBankAccountDs.setState('onlyShowChange', onlyShowChange);
          compareContactDs.query();
          compareAddressDs.query();
          compareBankAccountDs.query();
          compareAttachmentDs.query();
          comparePurchaseHeaderDs.query();
          comparePurchaseLineDs.query();
        })
        .finally(() => {
          setSpinning(false);
        });
    }
  }, [
    reqTypeCode,
    extSupplierReqId,
    stageCode,
    pageCode,
    templateCode,
    templateVersion,
    onlyShowChange,
  ]);

  useEffect(() => {
    setWaitCustomize(true);
    const queryParams = new Promise(resolve => {
      resolve({
        templateCode,
        templateVersion,
      });
    });
    queryTemplateConfig(queryParams, {
      // 阶段编码，页面编码
      stageCode,
      pageCode,
    }).then(() => {
      setWaitCustomize(false);
    });
  }, [templateCode, templateVersion, stageCode, pageCode]);

  // 更新供应商信息
  const updateSupplierInfo = useCallback(params => {
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
  }, []);

  // 操作记录弹窗
  const handleOperationModal = useCallback(() => {
    operationRecordsModal({
      documentType: 'simpleSupplier',
      documentId: extSupplierReqId,
    });
  }, []);

  const onRef = useCallback(
    (form = {}, tableCode = '') => {
      const tableCodeRef = {
        [tableCode]: form,
      };
      setRelTableRef(tableCodeRef);
    },
    [relTableRef]
  );

  const fieldsConfig = {
    supplierName: {
      render: ({ value, record }) => {
        const reqNumber = record && record.get('reqNumber');
        return `【${value}】${intl
          .get('sslm.supplierWarehouse.view.warehous.change')
          .d('简易供应商入库及变更')}-${reqNumber}`;
      },
    },
    reqTypeCode: {
      render: ({ name, record }) => {
        return record && record.get(`${name}Meaning`);
      },
    },
    unitNameLov: {
      render: ({ record }) => {
        return `${intl
          .get('sslm.supplierWarehouse.model.warehouse.ownunitName')
          .d('所属部门')}:${(record && record.get(`unitName`)) || '-'}`;
      },
    },
  };

  const supplierWarehouseList = useMemo(() => {
    const tanpleList = [
      {
        title: intl.get('sslm.supplierWarehouse.view.warehous.baseInfo').d('基础信息'),
        key: 'supplierBaseInfo',
        component: HeaderInfo,
        compareComponent: CompareHeaderInfo,
        props: {
          dataSet: headerInfoDs,
          isEdit,
          customizeForm,
          custLoading,
          code: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.BASIC_INFO',
        },
        compareProps: {
          dataSet: compareHeaderInfoDs,
          customizeForm,
          custLoading,
          code: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.BASIC_INFO',
          onlyShowChange,
        },
      },
      {
        title: intl.get('sslm.supplierWarehouse.view.warehous.contact').d('联系人'),
        key: 'contact',
        component: Contact,
        compareComponent: CompareContact,
        props: {
          dataSet: contactDs,
          code: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.CONTACT',
          customizeTable,
          custLoading,
          isEdit,
        },
        compareProps: {
          dataSet: compareContactDs,
          customizeTable,
          custLoading,
          onlyShowChange,
          code: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.CONTACT',
        },
      },
      {
        title: intl.get('sslm.supplierWarehouse.view.warehous.address').d('地址'),
        key: 'address',
        component: Address,
        compareComponent: CompareAddress,
        props: {
          dataSet: addressDs,
          isEdit,
          code: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.ADDRESS_INFO',
          customizeTable,
          custLoading,
        },
        compareProps: {
          dataSet: compareAddressDs,
          code: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.ADDRESS_INFO',
          customizeTable,
          custLoading,
          onlyShowChange,
        },
      },
      {
        title: intl.get('sslm.supplierWarehouse.view.warehous.bankAccount').d('银行账户'),
        key: 'bankAccount',
        component: BankAccount,
        compareComponent: CompareBankAccount,
        props: {
          dataSet: bankAccountDs,
          isEdit,
          code: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.BANK_INFO',
          customizeTable,
          custLoading,
        },
        compareProps: {
          dataSet: compareBankAccountDs,
          customizeTable,
          onlyShowChange,
          custLoading,
          code: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.BANK_INFO',
        },
      },
      {
        title: intl.get('sslm.supplierWarehouse.view.warehous.attachment').d('附件'),
        key: 'attachment',
        component: Attachment,
        compareComponent: CompareAttachment,
        props: {
          dataSet: attachmentDs,
          isEdit,
          code: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.ATTACHMENT',
          customizeTable,
          custLoading,
        },
        compareProps: {
          dataSet: compareAttachmentDs,
          code: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.ATTACHMENT',
          customizeTable,
          onlyShowChange,
          custLoading,
        },
      },
      {
        title: intl.get('sslm.supplierInform.view.fixCatalog.purchaseInform').d('采购/财务信息'),
        key: 'purchaseInform',
        component: PurchaseInform,
        compareComponent: ComparePurchaseInform,
        props: {
          headerDs: purchaseHeaderDs,
          lineDs: purchaseLineDs,
          isEdit,
          headerCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.PURCHASE_HEADER',
          lineCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.PURCHASE_LINE',
          customizeTable,
          customizeForm,
          custLoading,
        },
        compareProps: {
          headerDs: comparePurchaseHeaderDs,
          lineDs: comparePurchaseLineDs,
          headerCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.PURCHASE_HEADER',
          lineCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.PURCHASE_LINE',
          customizeForm,
          customizeTable,
          custLoading,
          onlyShowChange,
        },
      },
    ];
    if (reqTypeCode === 'SUP_UPDATE_REQ') {
      return onlyShowChange
        ? tanpleList
            .filter(i => filterUnchangeTanpes.includes(i.key))
            .map(i => ({
              ...i,
              component: i.compareComponent,
              props: i.compareProps,
            }))
        : tanpleList.map(i => ({
            ...i,
            component: i.compareComponent,
            props: i.compareProps,
          }));
    }
    //
    return tanpleList;
  }, [filterUnchangeTanpes, onlyShowChange, reqTypeCode]);

  const ViewUpdateBtn = () => {
    return (
      reqTypeCode === 'SUP_UPDATE_REQ' && (
        <div className="detail-tabs">
          <div
            className={!onlyShowChange ? 'active-detail-key' : ''}
            onClick={() => {
              setOnlyShowChange(false);
              comparePurchaseLineDs.setState('onlyShowChange', false);
              compareAddressDs.setState('onlyShowChange', false);
              compareContactDs.setState('onlyShowChange', false);
              compareAttachmentDs.setState('onlyShowChange', false);
              compareBankAccountDs.setState('onlyShowChange', false);
            }}
          >
            {intl.get('sslm.supplierWarehouse.button.view.showAll').d('展示变更后单据')}
          </div>
          <div
            className={onlyShowChange ? 'active-detail-key' : ''}
            onClick={() => {
              setOnlyShowChange(true);
              comparePurchaseLineDs.setState('onlyShowChange', true);
              compareAddressDs.setState('onlyShowChange', true);
              compareContactDs.setState('onlyShowChange', true);
              compareAttachmentDs.setState('onlyShowChange', true);
              compareBankAccountDs.setState('onlyShowChange', true);
            }}
          >
            {intl.get('sslm.supplierWarehouse.button.view.changeContent').d('仅展示变更项')}
          </div>
        </div>
      )
    );
  };

  // 操作按钮集合
  const contentBottomRender = useCallback(() => {
    const buttons = [
      {
        btnComp: Button,
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: handleOperationModal,
          wait: 200,
          color: 'dark',
          waitType: 'throttle',
          spinning,
        },
        child: intl.get('hzero.common.button.operation').d('操作记录'),
      },
      {
        btnComp: ViewUpdateBtn,
      },
    ];
    return <DynamicButtons buttons={buttons} />;
  }, [onlyShowChange, reqTypeCode, spinning]);

  return (
    <Fragment>
      <Content className="warehouse-detail">
        {waitCustomize ? (
          <Spin spinning={waitCustomize} />
        ) : (
          <Spin spinning={spinning}>
            <div className={styles['warehouse-content']}>
              <div id="supplierWarehouseAnchor">
                {reqTypeCode === 'SUP_UPDATE_REQ' && (
                  <Alert
                    showIcon
                    type="info"
                    iconType="help"
                    message={intl
                      .get('sslm.supplierWarehouse.alert.help')
                      .d(
                        '表单变更的内容用红色字体标识，如需查看明细，请点击仅查看变更内容查看详情'
                      )}
                    closable
                    style={{ border: 0, color: '#0161D5' }}
                    className={styles['investigation-tab-alert-info']}
                  />
                )}
                {customizeCommon(
                  {
                    code: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.AF_BASIC',
                    processUnitTag: 'AF-BASIC',
                  },
                  <AFBasic
                    dataSet={commonInfoDs}
                    titleField="supplierName"
                    tagFields={['reqTypeCode']}
                    normalFields={['creator', 'unitNameLov', 'creationDate']}
                    fieldsConfig={fieldsConfig}
                    contentBottomRender={contentBottomRender}
                  />
                )}
                <Card
                  bordered={false}
                  bodyStyle={{
                    padding: 0,
                    marginBottom: '8px',
                  }}
                >
                  <div className="crad-detail-remark">
                    <div className="card-detail-title">
                      {intl.get('sslm.common.model.instructions').d('说明')}
                    </div>
                    <Form
                      columns={1}
                      dataSet={commonInfoDs}
                      labelLayout="vertical"
                      className="c7n-pro-vertical-form-display"
                    >
                      <Output name="remark" />
                    </Form>
                  </div>
                </Card>
                <Card
                  bordered={false}
                  bodyStyle={{
                    padding: 0,
                  }}
                  title={
                    <div className="card-titile">
                      {intl.get('spfm.enterprise.view.message.supplierinformation').d('供应商信息')}
                    </div>
                  }
                >
                  {
                    <Tabs
                      tabPosition="left"
                      tabBarStyle={{
                        width: '200px',
                        height: '400px',
                        margin: '0 -1px 0 0',
                        padding: '20px 0 0',
                        textAlign: 'left',
                      }}
                    >
                      {supplierWarehouseList.map(item => (
                        <TabPane
                          forceRender
                          tab={
                            <div>
                              {getTooltipShow(item.title, 14, 120)}
                              {filterUnchangeTanpes.includes(item.key) && !onlyShowChange && (
                                <Badge dot />
                              )}
                            </div>
                          }
                          key={item.key}
                        >
                          {React.createElement(item.component, item.props)}
                        </TabPane>
                      ))}
                      {!onlyShowChange &&
                        (relTableList || []).map(n => {
                          const modelTable = {
                            ...n,
                            extSupplierNum: supplierNum,
                            supplierId,
                          };
                          return (
                            <TabPane tab={<div id={n.tableCode}>{n.tableName}</div>} key={n.key}>
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
                            </TabPane>
                          );
                        })}
                    </Tabs>
                  }
                </Card>
              </div>
            </div>
          </Spin>
        )}
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
      'spfm.enterprise',
    ],
  }),
  WithCustomize({
    isTemplate: true,
  })
)(Detail);
