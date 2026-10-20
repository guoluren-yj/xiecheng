import { compose } from 'lodash';
import { routerRedux } from 'dva/router';
import { Spin } from 'choerodon-ui';
import { Collapse, Icon } from 'hzero-ui';
import React, { Fragment, useCallback, useMemo, useState, useEffect } from 'react';
import {
  DataSet,
  Button,
  DateTimePicker,
  Modal,
  TextField,
  Lov,
  NumberField,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';

import {
  handleCreate,
  handleFormSave,
  handleFormPublish,
} from '@/services/buyerApplyPublishService';
import { queryDelete } from '@/services/sampleSupplierApplyCallbackService';
import { numberSeparatorRender } from '@/routes/components/utils';
import OperationRecords from '../../../components/OperationRecords';
import HeaderInfo from './HeaderInfo';
import ComposeTable from './ComposeTable';
import { headerInfoDS, listLineDS } from '../../stores/createDS';

const organizationId = getCurrentOrganizationId();

const { Panel } = Collapse;

const customizeUnitCode =
  'SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_SAMPLE_INFO,SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_BASIC_INFO,SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_LINE_FORM';

const Detail = ({ dispatch, match, customizeTable, customizeForm, custLoading, location }) => {
  const reqId = useMemo(() => match.params.detailReqId, []);
  const reqStatus = useMemo(() => match.params.reqStatus, []);
  const isPub = useMemo(() => location.pathname.match('/pub/'), [location]);
  const tableDs = useMemo(() => new DataSet(listLineDS()), []);
  const formDs = useMemo(() => new DataSet(headerInfoDS(reqId)), []);
  const backPath = useMemo(() => `${isPub ? '/pub' : ''}/sslm/supplier-apply-callback/list`, [
    isPub,
  ]);
  const isEdit =
    reqStatus === 'FEEDBACKED_NEW' || reqStatus === 'RETURNED' || reqStatus === undefined;

  const [spinning, setSpinning] = useState(false);
  const [collapsedKeys, setCollapsedKeys] = useState(['basicInfo', 'sampleInfo']);

  // 物料改变时的回调
  const handleItemChange = (value, record) => {
    const {
      data: {
        itemId: oldItemId,
        itemCode: oldItemCode,
        itemName: oldItemName,
        itemDesc: oldItemDesc,
        uomId: oldUomId,
        uomCode: oldUomCode,
        uomName: oldUomName,
        uomCodeAndName: oldUomCodeAndName,
        uomPrecision: oldUomPrecision,
        itemCategoryCode: oldCategoryCode,
        itemCategoryName: oldCategoryName,
      } = {},
    } = record;
    record.set({
      itemId: value?.itemId || oldItemId,
      itemCode: value?.itemCode || oldItemCode,
      itemName: value?.itemName || oldItemName,
      itemDesc: value?.itemDesc || oldItemDesc,
    });
    record.set('uoLov', {
      uomId: value?.uomId || oldUomId,
      uomCode: value?.uomCode || oldUomCode,
      uomName: value?.uomName || oldUomName,
      uomCodeAndName: value?.uomCodeAndName || oldUomCodeAndName,
      uomPrecision: value?.uomPrecision || oldUomPrecision,
    });
    // 值集带出主营品类信息
    const categoryObj = {
      categoryId: value?.categoryId,
      categoryCode: value?.categoryCode,
      categoryName: value?.categoryName,
    };
    // 主营品类为空时，取维护值
    const oldCategoryObj = {
      ...oldCategoryCode,
      ...oldCategoryName,
    };
    record.set('itemCategoryCode', value?.categoryId ? categoryObj : oldCategoryObj);
    record.set('itemCategoryName', value?.categoryId ? categoryObj : oldCategoryObj);
  };

  const columns = [
    {
      name: 'lineNum',
      width: 70,
    },
    {
      name: 'itemLov',
      width: 180,
      editor: record =>
        isEdit && (
          <Lov
            name="itemLov"
            onChange={value => handleItemChange(value, record)}
            onClear={() => {
              record.set({
                itemId: null,
                itemCode: null,
                itemName: null,
                itemDesc: null,
                uoLov: {},
              });
            }}
          />
        ),
    },
    {
      name: 'itemName',
      width: 160,
      tooltip: 'overflow',
      editor: record => isEdit && !record.get('itemCode'),
    },
    {
      name: 'itemDesc',
      width: 160,
      tooltip: 'overflow',
      editor: isEdit,
    },
    {
      name: 'uoLov',
      width: 140,
      editor: isEdit,
    },
    {
      name: 'itemCategoryCode',
      width: 200,
      editor: isEdit && (
        <Lov
          name="itemCategoryCode"
          searchFieldInPopup
          onOption={({ record: optionRecord }) => {
            return {
              disabled: optionRecord.get('isCheck') === false,
            };
          }}
          tableProps={{
            virtual: true,
            virtualCell: true,
            treeAsync: true,
            alwaysShowRowBox: true,
            onRow: ({ record }) => {
              const nodeProps = {};
              if (record.get('hasChild') === '0') {
                nodeProps.isLeaf = true;
              }
              return nodeProps;
            },
          }}
        />
      ),
    },
    {
      name: 'itemCategoryName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'reqQuantity',
      width: 130,
      editor: record => {
        const precision = record.get('uomPrecision') === 0 ? 0 : record.get('uomPrecision') || 10;
        return isEdit && <NumberField precision={precision} />;
      },
      renderer: ({ record, value }) => {
        const precision = record.get('uomPrecision') === 0 ? 0 : record.get('uomPrecision') || 10;
        return numberSeparatorRender(value, precision);
      },
    },
    {
      name: 'reqTime',
      width: 200,
      editor: () => isEdit && <DateTimePicker />,
    },
    {
      name: 'expectedDeliveryDate',
      width: 200,
      editor: () => isEdit && <DateTimePicker />,
    },
    {
      name: 'sendTypeCode',
      width: 140,
      editor: isEdit,
    },
    {
      name: 'trackingNumber',
      width: 200,
      editor: record =>
        isEdit &&
        record.get('sendTypeCode') === 'EXPRESS_DELIVERY' && <TextField restrict="a-z,A-Z,0-9,-" />,
    },
    {
      name: 'tryUseDepartment',
      width: 120,
      editor: isEdit,
    },
    {
      name: 'tryUseWorkshop',
      width: 120,
      editor: isEdit,
    },
    {
      name: 'sampleResult',
      width: 140,
      editor: ['FEEDBACKED_NEW', undefined].includes(reqStatus),
      hidden: !['CONFIRMED', 'RETURNED'].includes(reqStatus),
    },
    {
      name: 'remark',
      width: 200,
      tooltip: 'overflow',
      editor: ['FEEDBACKED_NEW', undefined].includes(reqStatus),
      hidden: !['CONFIRMED', 'RETURNED'].includes(reqStatus),
    },
    {
      name: 'trialResultsUuid',
      width: 130,
      hidden: reqStatus !== 'RETURNED',
      renderer: ({ record }) => (
        <Upload
          viewOnly
          tenantId={organizationId}
          bucketName={PRIVATE_BUCKET}
          attachmentUUID={record.get('trialResultsUuid')}
          filePreview
        />
      ),
    },
  ];

  // 折叠面板回调
  const handleCollapseChange = useCallback(keys => {
    setCollapsedKeys(keys);
  }, []);

  useEffect(() => {
    if (reqId) {
      setSpinning(true);
      formDs.setQueryParameter('detailReqId', reqId);
      tableDs.setQueryParameter('detailReqId', reqId);
      formDs.query().finally(() => setSpinning(false));
      tableDs.query();
    }
  }, [reqId]);

  // 保存
  const handleSave = useCallback(async () => {
    if (formDs.dirty || tableDs.dirty) {
      const [formValidateFlag, tableValidateFlag] = await Promise.all([
        formDs.validate(),
        tableDs.validate(),
      ]);
      const formValues = formDs.current.toJSONData();
      const tableData = tableDs.toJSONData();
      const params = {
        ...formValues,
        infoDtoList: tableData,
        isPurchaseFlag: 1,
        customizeUnitCode,
      };
      if (formValidateFlag && tableValidateFlag) {
        setSpinning(true);
        // 有头id
        if (reqId) {
          return handleFormSave(params)
            .then(async (response = {}) => {
              const res = getResponse(response);
              if (res) {
                notification.success();
                await Promise.all([formDs.query(), tableDs.query()]);
              }
            })
            .finally(() => {
              setSpinning(false);
            });
        } else {
          handleCreate(params)
            .then((response = {}) => {
              const res = getResponse(response);
              if (res) {
                notification.success();
                const { reqId: newReqId = '', reqStatus: newReqStatus } = res;
                dispatch(
                  routerRedux.push({
                    pathname: `${
                      isPub ? '/pub' : ''
                    }/sslm/supplier-apply-callback/supplier/${newReqId}/${newReqStatus}`,
                  })
                );
              }
            })
            .finally(() => {
              setSpinning(false);
            });
        }
      } else {
        notification.warning({
          message: intl.get('sslm.sample.view.message.maintainInfo').d('请维护相关信息！'),
        });
      }
    } else {
      notification.warning({
        message: intl.get('sslm.sample.view.message.noNeedSaveData').d('暂无需要保存的数据！'),
      });
    }
  }, []);

  // 发布
  const handlePublish = useCallback(async () => {
    const formValues = formDs.current.toJSONData();
    const tableData = tableDs.toJSONData();
    const [formValidateFlag, tableValidateFlag] = await Promise.all([
      formDs.validate(),
      tableDs.validate(),
    ]);
    const params = {
      ...formValues,
      infoDtoList: tableData,
      isPurchaseFlag: 1,
      customizeUnitCode,
    };
    if (formValidateFlag && tableValidateFlag) {
      setSpinning(true);
      return handleFormPublish(params).then((response = {}) => {
        setSpinning(false);
        const res = getResponse(response);
        if (res) {
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: backPath,
            })
          );
        }
      });
    } else {
      notification.warning({
        message: intl.get('sslm.sample.view.message.maintainInfo').d('请维护相关信息！'),
      });
    }
  }, []);

  // 删除
  const handleDelete = async () => {
    const formValues = formDs.current.toJSONData();
    const tableData = tableDs.toJSONData();
    const payload = {
      data: {
        ...formValues,
        infoDtoList: tableData,
      },
      customizeUnitCode,
    };
    setSpinning(true);
    return queryDelete(payload)
      .then(res => {
        const data = getResponse(res);
        if (data) {
          dispatch(
            routerRedux.push({
              pathname: backPath,
            })
          );
        }
      })
      .finally(() => setSpinning(false));
  };

  //  操作记录
  const handleRecords = () => {
    Modal.open({
      key: Modal.key(),
      closable: true,
      movable: false,
      destroyOnClose: true,
      style: {
        width: 700,
      },
      title: intl.get('hzero.common.button.operated').d('操作记录'),
      children: <OperationRecords reqId={reqId} />,
      footer: null,
    });
  };

  // 样品行新增
  const handleTableAdd = useCallback(() => {
    const currentRow = tableDs.current;
    currentRow.set('reqId', reqId);
  }, []);

  const headerInfoProps = {
    formDs,
    custLoading,
    customizeForm,
    isEdit,
    spinning, // 用于个性化渲染render设置显示影藏
    code: 'SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_BASIC_INFO',
  };

  return (
    <Spin spinning={spinning}>
      <Header
        title={intl.get('sslm.sample.view.title.publish').d('送样申请发布')}
        backPath={backPath}
      >
        <Button
          type="primary"
          funcType="raised"
          icon="save"
          color="primary"
          disabled={!isEdit}
          onClick={handleSave}
          loading={spinning}
          wait={200}
          waitType="throttle"
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        {reqId && (
          <Fragment>
            <Fragment>
              <Button
                funcType="raised"
                icon="finished"
                disabled={!isEdit}
                onClick={handlePublish}
                wait={200}
                waitType="throttle"
                loading={spinning}
              >
                {intl.get('hzero.common.button.release').d('发布')}
              </Button>
              <Button
                funcType="raised"
                icon="delete"
                disabled={!isEdit}
                onClick={handleDelete}
                wait={200}
                waitType="throttle"
                loading={spinning}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </Fragment>
            <Button
              icon="schedule"
              onClick={handleRecords}
              wait={200}
              waitType="throttle"
              loading={spinning}
            >
              {intl.get('hzero.common.button.operated').d('操作记录')}
            </Button>
          </Fragment>
        )}
      </Header>
      <Content>
        <div>
          <div className="ued-detail-wrapper">
            <Collapse defaultActiveKey={collapsedKeys} onChange={handleCollapseChange}>
              <Panel
                key="basicInfo"
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`sslm.sample.view.message.basicInfo`).d('送样申请基础信息')}</h3>
                    <a>
                      {collapsedKeys.includes('basicInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                      {<Icon type={collapsedKeys.includes('basicInfo') ? 'up' : 'down'} />}
                    </a>
                  </Fragment>
                }
              >
                <HeaderInfo {...headerInfoProps} />
              </Panel>
              {reqId && (
                <Panel
                  key="sampleInfo"
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get(`sslm.sample.view.message.sampleInfo`).d('样品信息')}</h3>
                      <a>
                        {collapsedKeys.includes('sampleInfo')
                          ? intl.get('hzero.common.button.up').d('收起')
                          : intl.get('hzero.common.button.expand').d('展开')}
                        {<Icon type={collapsedKeys.includes('sampleInfo') ? 'up' : 'down'} />}
                      </a>
                    </Fragment>
                  }
                >
                  <ComposeTable
                    reqId={reqId}
                    isEdit={isEdit}
                    tableDs={tableDs}
                    columns={columns}
                    tableFormDs={formDs}
                    custLoading={custLoading}
                    customizeTable={customizeTable}
                    handleAdd={handleTableAdd}
                    customizeForm={customizeForm}
                    formCode="SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_LINE_FORM"
                    code="SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_SAMPLE_INFO"
                  />
                </Panel>
              )}
            </Collapse>
          </div>
        </div>
      </Content>
    </Spin>
  );
};

export default compose(
  formatterCollections({ code: ['sslm.sample'] }),
  WithCustomize({
    unitCode: [
      'SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_SAMPLE_INFO',
      'SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_BASIC_INFO',
      'SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_LINE_FORM',
    ],
  })
)(Detail);
