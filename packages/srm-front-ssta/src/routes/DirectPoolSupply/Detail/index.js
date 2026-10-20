/* eslint-disable react/jsx-indent */
/* eslint-disable import/named */
import React, { useMemo, useEffect, useState } from 'react';
import { compose } from 'lodash';
import { DataSet, Button, Form, Modal } from 'choerodon-ui/pro';
import { Card, Spin, Tabs } from 'choerodon-ui';
import queryString from 'querystring';
import { observer } from 'mobx-react';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import intl from 'utils/intl';
import { Content, Header } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';

import { FormItem } from '@/routes/Components';
import { getDetail, save, submit } from '@/services/directPoolSupplyService';
import { btnsFormat } from '@/utils/utils';
import { formInfoDs, tableInfoDs } from './mainDS';
import AddModal from './AddModal';

import Styles from '@/routes/common.less';
import './index.less';

const InvoiceRuleDetail = (props) => {
  const {
    location: { search },
    history,
    customizeTable,
    customizeBtnGroup,
    customizeForm,
  } = props;

  const { type, applyHeaderList = [], applyHeaderId: applyId } = React.useMemo(() => {
    const {
      location: { search: copySearch },
    } = props;
    return queryString.parse(copySearch.substring(1));
  }, [search]);

  const formDs = useMemo(() => new DataSet(formInfoDs()), []);
  const tableDs = useMemo(() => new DataSet(tableInfoDs()), []);

  const [loading, setLoading] = useState(false);
  const [applyHeaderId, setApplyHeaderId] = useState(undefined);
  // const [applyHeaderNum, setApplyHeaderNum] = useState('');
  const [applyList, setApplyList] = useState([]);
  const [editFlag, setEditFlag] = useState(['UPDATE', 'CREATE'].includes(type));
  // 有些只能在手工新建的时候能编辑，CREATE手工新建
  const updateFlag = type === 'CREATE';

  useEffect(() => {
    let list = [];
    try {
      list = JSON.parse(applyHeaderList);
    } catch {
      list = [];
    }
    const id = list[0] ? list[0].applyHeaderId : applyId;
    setApplyHeaderId(id);
    setApplyList(list);
  }, []);

  useEffect(() => {
    initData();
  }, [applyHeaderId]);

  const initData = async () => {
    if (applyHeaderId) {
      setLoading(true);
      const res = getResponse(await getDetail(applyHeaderId, 'transform'));
      if (res) {
        if (res.failed) {
          notification.error({
            message: res.message,
          });
        } else {
          const { applyStatus } = res;
          setEditFlag(applyStatus === 'NEW');
          formDs.loadData([res]);
        }
      }
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'lineNum',
        width: 40,
      },
      {
        name: 'applyLineTypeMeaning',
        width: 120,
      },
      {
        name: 'commodityCode',
        width: 120,
      },
      {
        name: 'projectName',
        width: 120,
      },
      {
        name: 'model',
        width: 120,
      },
      {
        name: 'uom',
        width: 80,
      },
      {
        name: 'quantity',
        width: 80,
      },
      {
        name: 'netAmount',
        width: 100,
      },
      {
        name: 'taxRate',
        width: 80,
      },
      {
        name: 'taxAmount',
        width: 120,
      },
      {
        name: 'amount',
        width: 100,
      },
      {
        name: 'deductionAmount',
        width: 100,
      },
      {
        name: 'netPrice',
        width: 100,
      },
      {
        name: 'price',
        width: 100,
      },
      {
        name: 'freeTaxMark',
        width: 120,
      },
      {
        name: 'preferentialPolicyFlag',
        width: 120,
      },
      {
        name: 'specialManagementVat',
        width: 120,
      },
      {
        name: 'vehicleType',
        width: 120,
      },
      {
        name: 'brandModel',
        width: 120,
      },
      {
        name: 'productArea',
        width: 120,
      },
      {
        name: 'certificateNum',
        width: 120,
      },
      {
        name: 'importExportCertificateNum',
        width: 120,
      },
      {
        name: 'commodityInspectionNum',
        width: 120,
      },
      {
        name: 'engineNum',
        width: 120,
      },
      {
        name: 'vehicleNum',
        width: 120,
      },
      {
        name: 'taxPaymentCertificateNum',
        width: 120,
      },
      {
        name: 'tonnage',
        width: 100,
      },
      {
        name: 'passengersLimit',
        width: 100,
      },
      {
        name: 'organizationCode',
        width: 120,
      },
      {
        name: 'settleNum',
        width: 120,
      },
    ];
  }, []);

  const getTableButtons = () => {
    if (editFlag) {
      return [
        <Button icon="playlist_add" onClick={() => handleAdd()} key="add">
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>,
        <Button
          icon="cancel"
          disabled={tableDs.selected.length <= 0}
          onClick={() => handleCancel()}
          key="add"
        >
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>,
      ];
    } else {
      return [];
    }
  };

  const handleAdd = () => {
    Modal.open({
      drawer: true,
      title: intl.get('ssta.reconciliationWorkbench.view.title.add').d('新增'),
      key: Modal.key(),
      className: Styles['ssta-large-modal'],
      children: <AddModal afterAddLines={afterAddLines} headerInfo={formDs?.toData()} />,
      footer: null,
    });
  };

  const afterAddLines = () => {
    initData();
    tableDs.query();
  };

  const handleCancel = async () => {
    const res = await tableDs.delete(tableDs.selected);
    if (res && res.success) {
      await tableDs.query();
      tableDs.clearCachedSelected();
    }
  };

  const getSaveSendData = async () => {
    formDs.current.status = 'create';
    const headerValidateFlag = await formDs.current?.validate(true);
    const linesValidateFlag = await tableDs.validate();
    if (headerValidateFlag && linesValidateFlag) {
      const headerData = formDs.toData()[0] ? formDs.toData()[0] : {};
      const lineData = tableDs.toData() ? tableDs.toData() : [];
      const sendData = {
        ...headerData,
        directInvoiceApplyLineDTOList: lineData,
      };
      return sendData;
    } else {
      return false;
    }
  };

  const handleSave = async () => {
    const sendData = await getSaveSendData();
    if (sendData) {
      setLoading(true);
      const res = getResponse(await save({ ...sendData }, type));
      if (res) {
        if (res.failed) {
          notification.error({
            message: res.message,
          });
        } else {
          const id = res?.applyHeaderId;
          setApplyHeaderId(id);
          tableDs.setState('applyHeaderId', id);
          tableDs.query();

          notification.success();
          if (type === 'CREATE') {
            history.push({
              pathname: '/ssta/direct-pool-supply/detail',
              search: queryString.stringify({ applyHeaderId: id, type: 'UPDATE' }),
            });
          }
        }
      }

      setLoading(false);
    } else {
      notification.error({
        description: intl.get('hzero.common.view.message.notpassRequire').d('请填写必填字段后保存'),
      });
    }
  };

  const handleSubmit = async () => {
    const sendData = await getSaveSendData();
    if (sendData) {
      setLoading(true);
      const res = getResponse(await submit(sendData));
      if (res) {
        if (res.failed) {
          notification.error({
            message: res.message,
          });
        } else {
          const id = res?.applyHeaderId;
          setApplyHeaderId(id);
          tableDs.setState('applyHeaderId', id);
          // tableDs.queryDataSet.loadData([{ applyHeaderId: id }]);
          tableDs.query();
          notification.success();
        }
      }
      setLoading(false);
    } else {
      notification.error({
        description: intl.get('hzero.common.view.message.notpassRequire').d('请填写必填字段后保存'),
      });
    }
  };

  const onTabChange = (activeKey) => {
    setApplyHeaderId(activeKey);
    tableDs.setState('applyHeaderId', activeKey);
    // tableDs.queryDataSet.loadData([{ applyHeaderId: activeKey }]);
    tableDs.query();
  };

  const headerBtns = () => {
    const allBtns = [
      applyHeaderId && {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          className: Styles['ssta-detail-button'],
          icon: 'check',
          disabled: !editFlag,
          loading,
          onClick: () => handleSubmit(),
          wait: 1500,
          waitType: 'throttle',
        },
      },
      {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          className: Styles['ssta-detail-button'],
          icon: 'save',
          disabled: !editFlag,
          loading,
          onClick: () => handleSave(),
          wait: 1500,
          waitType: 'throttle',
        },
      },
      // {
      //   name: 'cancel',
      //   child: intl.get('hzero.common.button.cancel').d('取消'),
      //   btnProps: {
      //     className: Styles['ssta-detail-button'],
      //     icon: 'cancel',
      //     disabled: !editFlag,
      //     loading,
      //     onClick: () => saveRule(),
      //     wait: 1500,
      //     waitType: 'throttle',
      //   },
      // },
      // {
      //   name: 'operate',
      //   child: intl.get('hzero.common.button.operating').d('操作记录'),
      //   btnProps: {
      //     className: Styles['ssta-detail-button'],
      //     icon: 'operation_service_request',
      //     disabled: !editFlag,
      //     loading,
      //     onClick: () => publishRule(),
      //     wait: 1500,
      //     waitType: 'throttle',
      //   },
      // },
    ];
    return btnsFormat(allBtns);
  };

  const detailTabPaneRender = () => {
    return (
      <Spin spinning={loading}>
        <Content>
          <h3 className="ssta-form-title" id="CostSheet-header">
            {intl.get(`ssta.costSheet.view.message.panel.baseInfoss`).d('发票头信息')}
          </h3>
          <div className="card-content">
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={intl.get(`ssta.costSheet.view.message.panel.baseInfos`).d('基本信息')}
            >
              {customizeForm(
                { code: 'SDIM.POOL_SUPPLY_DETAIL.APPLY_HEADER', readOnly: !editFlag },
                <Form
                  useWidthPercent
                  columns={3}
                  useColon={false}
                  dataSet={formDs}
                  labelLayout={editFlag ? 'float' : 'vertical'}
                >
                  <FormItem name="applyNum" editable={editFlag} disabled />
                  <FormItem name="applyStatus" editor="select" disabled={editFlag} />
                  <FormItem name="applyType" editor="select" editable={editFlag} disabled />
                  <FormItem
                    name="ruleLov"
                    editor="lov"
                    editable={editFlag}
                    disabled={!updateFlag}
                  />
                  <FormItem
                    name="billingType"
                    editable={editFlag}
                    editor="select"
                    // disabled={!editFlag}
                  />
                  <FormItem name="invoiceCode" editable={editFlag} disabled={!editFlag} />
                  <FormItem name="invoiceNum" editable={editFlag} disabled={!editFlag} />
                  <FormItem
                    name="invoiceType"
                    editor="select"
                    editable={editFlag}
                    disabled={!updateFlag}
                  />
                  <FormItem name="redInfoNumber" editable={editFlag} disabled={!editFlag} />
                  <FormItem
                    name="invoiceListMark"
                    editable={editFlag}
                    editor="select"
                    disabled={!updateFlag}
                  />
                  <FormItem
                    name="supplierCompanyLov"
                    editable={editFlag}
                    editor="lov"
                    disabled={!updateFlag}
                  />
                  <FormItem
                    name="companyNameLov"
                    editable={editFlag}
                    editor="lov"
                    disabled={!updateFlag}
                  />

                  <FormItem name="extNumber" editable={editFlag} disabled={!editFlag} />
                  <FormItem name="netAmount" editable={editFlag} disabled />
                  <FormItem name="taxAmount" editable={editFlag} disabled />
                  <FormItem name="amount" editable={editFlag} disabled />
                </Form>
              )}
            </Card>
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={intl
                .get(`ssta.directPoolSupply.model.directPoolSupply.purchaseInfo`)
                .d('购方信息')}
            >
              {customizeForm(
                { code: 'SDIM.POOL_SUPPLY_DETAIL.PURCHASE_INFO', readOnly: !editFlag },
                <Form
                  useWidthPercent
                  columns={3}
                  useColon={false}
                  dataSet={formDs}
                  labelLayout={editFlag ? 'float' : 'vertical'}
                >
                  <FormItem
                    name="purchaseCompanyLov"
                    editable={editFlag}
                    editor="lov"
                    disabled={!updateFlag}
                  />
                  <FormItem
                    name="purchaseCompanyType"
                    editable={editFlag}
                    editor="select"
                    // disabled={!editFlag}
                  />
                  <FormItem name="purUnifiedSocialCode" editable={editFlag} disabled />
                  <FormItem name="purAddressTel" editable={editFlag} disabled />
                  <FormItem name="purBankAndAccount" editable={editFlag} disabled />
                </Form>
              )}
            </Card>
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={intl
                .get(`ssta.directPoolSupply.model.directPoolSupply.saleInfo`)
                .d('销方信息')}
            >
              {customizeForm(
                { code: 'SDIM.POOL_SUPPLY_DETAIL.SALE_INFO', readOnly: !editFlag },
                <Form
                  useWidthPercent
                  columns={3}
                  useColon={false}
                  dataSet={formDs}
                  labelLayout={editFlag ? 'float' : 'vertical'}
                >
                  <FormItem
                    name="saleCompanyLov"
                    editable={editFlag}
                    editor="lov"
                    disabled={!updateFlag}
                  />
                  <FormItem
                    name="saleCompanyType"
                    editable={editFlag}
                    editor="select"
                    // disabled={!editFlag}
                  />
                  <FormItem name="saleUnifiedSocialCode" editable={editFlag} disabled />
                  <FormItem name="saleAddressTel" editable={editFlag} disabled />
                  <FormItem name="saleBankAndAccount" editable={editFlag} disabled />
                </Form>
              )}
            </Card>
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={intl.get(`ssta.costSheet.view.message.panel.othersInf`).d('其他信息')}
            >
              {customizeForm(
                { code: 'SDIM.POOL_SUPPLY_DETAIL.APPLY_HEADER_OTHER_INFO', readOnly: !editFlag },
                <Form
                  useWidthPercent
                  columns={3}
                  useColon={false}
                  dataSet={formDs}
                  labelLayout={editFlag ? 'float' : 'vertical'}
                >
                  <FormItem name="invoiceBy" editable={editFlag} disabled={!editFlag} />
                  <FormItem name="payee" editable={editFlag} disabled={!editFlag} />

                  <FormItem name="reviewer" editable={editFlag} disabled={!editFlag} />
                  <FormItem name="receiver" editable={editFlag} disabled={!editFlag} />
                  <FormItem name="recipientPhone" editable={editFlag} disabled={!editFlag} />
                  <FormItem name="recipientAddress" editable={editFlag} disabled={!editFlag} />
                  <FormItem
                    name="remark"
                    editor="textarea"
                    editable={editFlag}
                    disabled={!editFlag}
                  />
                </Form>
              )}
            </Card>
          </div>
        </Content>
        {applyHeaderId && (
          <Content>
            <h3 className="ssta-form-title" id="CostSheet-header">
              {intl.get(`ssta.costSheet.view.message.invoiceLineInfo`).d('发票明细信息')}
            </h3>
            {customizeTable(
              { code: 'SDIM.POOL_SUPPLY_DETAIL.APPLY_LINE', readOnly: !editFlag },
              <SearchBarTable
                searchCode="SDIM.POOL_SUPPLY_DETAIL.APPLY_LINE_SEARCH_BAR"
                columns={columns}
                dataSet={tableDs}
                queryFieldsLimit={3}
                buttons={getTableButtons()}
                selectionMode={editFlag ? 'rowbox' : 'none'}
                searchBarConfig={{
                  closeFilterSelector: true,
                  onQuery: () => {
                    tableDs.setState('applyHeaderId', applyHeaderId);
                    // tableDs.queryDataSet.loadData([{ ...params, applyHeaderId }]);
                    tableDs.query();
                  },
                }}
              />
            )}
          </Content>
        )}
      </Spin>
    );
  };

  const title = useMemo(() => {
    return type === 'CREATE'
      ? intl
          .get('ssta.directPoolSupply.model.directPoolSupply.directInvoiceMaintainCreate')
          .d('新建开票申请单')
      : type === 'UPDATE'
      ? intl
          .get('ssta.directPoolSupply.model.directPoolSupply.directInvoiceMaintainUpdate')
          .d('编辑开票申请单')
      : intl
          .get('ssta.directPoolSupply.model.directPoolSupply.directInvoiceMaintainView')
          .d('查看开票申请单');
  }, [type]);
  return (
    <>
      <Header title={title} backPath="/ssta/direct-pool-supply/list">
        {customizeBtnGroup(
          { code: 'SDIM.POOL_SUPPLY_DETAIL.BTNS', pro: true },
          <DynamicButtons buttons={headerBtns()} />
        )}
      </Header>
      <div className={Styles['ssta-detail-content']}>
        {applyList.length > 1 ? (
          <Tabs defaultActiveKey={applyHeaderId} tabPosition="left" onChange={onTabChange}>
            {applyList.map((item) => (
              <Tabs.TabPane tab={item.applyHeaderNum} key={item.applyHeaderId}>
                {detailTabPaneRender()}
              </Tabs.TabPane>
            ))}
          </Tabs>
        ) : (
          detailTabPaneRender()
        )}
      </div>
    </>
  );
};

export default compose(
  formatterCollections({
    code: [
      'ssta.common',
      'ssta.directPoolSupply',
      'ssta.invoiceRule',
      'ssta.costSheet',
      'ssta.supplySettle',
      'ssta.commodity',
    ],
  }),
  withCustomize({
    unitCode: [
      'SDIM.POOL_SUPPLY_DETAIL.BTNS',
      'SDIM.POOL_SUPPLY_DETAIL.APPLY_HEADER',
      'SDIM.POOL_SUPPLY_DETAIL.PURCHASE_INFO',
      'SDIM.POOL_SUPPLY_DETAIL.SALE_INFO',
      'SDIM.POOL_SUPPLY_DETAIL.APPLY_HEADER_OTHER_INFO',
      'SDIM.POOL_SUPPLY_DETAIL.APPLY_LINE',
      'SDIM.POOL_SUPPLY_DETAIL.APPLY_LINE_SEARCH_BAR',
    ],
  }),
  observer
)(InvoiceRuleDetail);
