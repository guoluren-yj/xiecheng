/* eslint-disable react/jsx-indent */
import { compose } from 'lodash';
import { routerRedux } from 'dva/router';
// import { Collapse, Icon } from 'choerodon-ui';
import { Spin } from 'choerodon-ui';
import querystring from 'querystring';
import { Collapse, Icon } from 'hzero-ui';
import React, { Fragment, useCallback, useMemo, useState, useEffect } from 'react';
import { DataSet, Table, Button, DateTimePicker, Lov, NumberField } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId, getResponse, getCurrentUser } from 'utils/utils';

import {
  handleCreate,
  handleFormSave,
  handleFormPublish,
  queryUserDefaultMsg,
  querySupplierInfo,
} from '@/services/buyerApplyPublishService';
import { numberSeparatorRender } from '@/routes/components/utils';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import HeaderInfo from './HeaderInfo';
import { headerInfoDS, listLineDS } from '../stores/detailDS';

const user = getCurrentUser();
const organizationId = getCurrentOrganizationId();

const { Panel } = Collapse;

const customizeUnitCode =
  'SSLM.SAMPLE_DELIVERY_PUBLISH.BASIC_INFO,SSLM.SAMPLE_DELIVERY_PUBLISH.SAMPLE_INFO';

const Detail = ({
  remote,
  dispatch,
  match,
  customizeTable,
  customizeForm,
  custLoading,
  location,
}) => {
  const reqStatus = useMemo(() => match.params.reqStatus, [match]);
  const isDisable = reqStatus === 'RELEASE_APPROVING';
  const isEdit =
    reqStatus === 'NEW' ||
    reqStatus === 'SUPPLIER_RETURNED' ||
    reqStatus === 'RELEASE_REJECT' ||
    reqStatus === undefined;
  const reqId = useMemo(() => match.params.detailReqId, [match]);
  const isPub = useMemo(() => match.path.includes('/pub/'), [match]);

  const formDs = useMemo(
    () =>
      new DataSet(
        headerInfoDS({
          user,
          isDisable,
          setHidden: boolean => setConfirmationFlagHidden(boolean),
          setSourceHidden: boolean => setSourceResultFlag(boolean),
        })
      ),
    [isDisable]
  );
  const tableDs = useMemo(() => new DataSet(listLineDS()), []);
  tableDs.bind(formDs, 'infoDtoList');

  const routerParams = querystring.parse(location.search.substr(1));
  const { companyId, supplierCompanyId } = routerParams;

  const [confirmationFlagHidden, setConfirmationFlagHidden] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [status, setStatus] = useState(undefined);
  const [proxyDsCreate, setProxyDsCreate] = useState({});
  const [collapsedKeys, setCollapsedKeys] = useState(['basicInfo', 'sampleInfo']);
  const [sourceResultFlag, setSourceResultFlag] = useState(false);

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
    record.set('uomCode', {
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
        !isDisable && (
          <Lov
            name="itemLov"
            onChange={value => handleItemChange(value, record)}
            onClear={() => {
              record.set({
                itemId: null,
                itemCode: null,
                itemName: null,
                itemDesc: null,
                uomCode: {},
              });
            }}
          />
        ),
    },
    {
      name: 'itemName',
      width: 180,
      editor: record => !isDisable && !(record.get('itemLov') || {}).itemCode,
      tooltip: 'overflow',
    },
    {
      name: 'itemDesc',
      width: 180,
      editor: !isDisable,
      tooltip: 'overflow',
    },
    {
      name: 'uomCode',
      width: 140,
      editor: !isDisable,
    },
    {
      name: 'itemCategoryCode',
      width: 200,
      editor: !isDisable && (
        <Lov
          name="itemCategoryCode"
          searchFieldInPopup
          onOption={({ record: optionRecord }) => {
            return {
              disabled: optionRecord.get('isCheck') === false,
            };
          }}
          tableProps={{
            // selectionMode: 'rowbox',
            treeAsync: true,
            alwaysShowRowBox: true,
            virtual: true,
            virtualCell: true,
            onRow: ({ record }) => {
              const nodeProps = {};
              if (record.get('hasChild') === '0') {
                nodeProps.isLeaf = true;
              }
              return nodeProps;
            },
          }}
          onBeforeSelect={record => {
            const { selectable } = record || {};
            return selectable;
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
      editor: () => !isDisable && <DateTimePicker />,
    },
    {
      name: 'tryUseDepartment',
      width: 120,
      editor: !isDisable,
    },
    {
      name: 'tryUseWorkshop',
      width: 120,
      editor: !isDisable,
    },
    {
      name: 'sampleResult',
      width: 140,
      editor: !isDisable,
      hidden: confirmationFlagHidden,
    },
    {
      name: 'remark',
      width: 200,
      editor: !isDisable,
      tooltip: 'overflow',
      hidden: confirmationFlagHidden,
    },
    {
      name: 'trialResultsUuid',
      width: 130,
      hidden: confirmationFlagHidden,
      renderer: ({ record }) => (
        <Upload
          viewOnly={
            reqStatus !== 'FEEDBACKED' && reqStatus !== 'NEW' && reqStatus !== 'SUPPLIER_RETURNED'
          }
          tenantId={organizationId}
          bucketName={PRIVATE_BUCKET}
          attachmentUUID={record.get('trialResultsUuid')}
          afterOpenUploadModal={attUuid => {
            record.set('trialResultsUuid', attUuid);
          }}
          filePreview
        />
      ),
    },
    {
      name: 'sourceNum',
      width: 150,
      hidden: sourceResultFlag,
    },
    {
      name: 'itemNum',
      width: 100,
      hidden: sourceResultFlag,
    },
    {
      name: 'option',
      width: 300,
      lock: 'right',
      align: 'center',
      renderer: ({ record }) => {
        const { data: { sampleId } = {} } = record;
        if (sampleId) {
          return (
            <Fragment>
              <Upload
                icon=""
                viewOnly={isDisable}
                btnText={
                  isDisable
                    ? intl.get(`sslm.sample.model.evaluation.checkBuyer`).d('查看采购方附件')
                    : intl.get(`sslm.sample.model.sample.buyerUpload`).d('上传采购方附件')
                }
                tenantId={organizationId}
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="sslm-deliver"
                attachmentUUID={record.get('buyerAttachmentUuid')}
                afterOpenUploadModal={attUuid => {
                  record.set('buyerAttachmentUuid', attUuid);
                }}
                filePreview
              />
              <a onClick={() => handleJumpDetail(record)} style={{ marginLeft: 16 }}>
                {intl.get(`sslm.sample.model.sample.supplierUpload`).d('指定供应商附件')}
              </a>
            </Fragment>
          );
        }
      },
    },
  ];

  // 折叠面板回调
  const handleCollapseChange = useCallback(keys => {
    setCollapsedKeys(keys);
  }, []);

  // 跳转至供应商附件
  const handleJumpDetail = useCallback(record => {
    const {
      data: { sampleId },
    } = record;
    const pathname = isPub
      ? `/pub/sslm/buyer-apply-release/attach-upload/${sampleId}/${reqId}/${reqStatus}`
      : `/sslm/buyer-apply-release/attach-upload/${sampleId}/${reqId}/${reqStatus}`;
    dispatch(
      routerRedux.push({
        pathname,
      })
    );
  });

  useEffect(() => {
    if (reqId) {
      setSpinning(true);
      formDs.setQueryParameter('detailReqId', reqId);
      tableDs.setQueryParameter('detailReqId', reqId);
      formDs
        .query()
        .then(res => {
          const response = getResponse(res);
          if (response) {
            setStatus(response.reqStatus);
          }
        })
        .finally(() => setSpinning(false));
    } else {
      setSpinning(true);
      if (companyId || supplierCompanyId) {
        querySupplierInfo({ companyId, supplierCompanyId })
          .then(response => {
            const res = getResponse(response);
            if (res) {
              setProxyDsCreate({
                createNow: true,
                createData: {
                  ...res,
                  supplierName: res.supplierCompanyName,
                  supplierId: res.partnerCompanyId,
                  supplierTenantId: res.partnerTenantId,
                  recUserPhone: res.phone,
                  reqUserPhone: res.phone,
                  reqInternationalTelCode: res.userInternationalTelCode,
                  recInternationalTelCode: res.userInternationalTelCode,
                  receiveUnitId: res.unitId,
                  receiveUnitName: res.unitName,
                },
              });
            }
          })
          .finally(() => setSpinning(false));
      } else {
        queryUserDefaultMsg()
          .then((response = {}) => {
            const res = getResponse(response);
            if (res) {
              setProxyDsCreate({
                createNow: true,
                createData: {
                  ...res,
                  receiveUnitId: res.unitId,
                  receiveUnitName: res.unitName,
                  recUserPhone: res.phone,
                  reqUserPhone: res.phone,
                  recInternationalTelCode: res.internationalTelCode,
                  reqInternationalTelCode: res.internationalTelCode,
                  invOrganizationId: res.organizationId,
                  sampleSendAddress: res.defaultAddress,
                  companyAddress: res.addressDetail,
                },
              });
            }
          })
          .finally(() => setSpinning(false));
      }
    }
  }, [reqId, companyId, supplierCompanyId]);

  // 保存
  const handleSave = useCallback(async () => {
    if (formDs.dirty || tableDs.dirty) {
      const [formValidateFlag, tableValidateFlag] = await Promise.all([
        formDs.validate(),
        tableDs.validate(),
      ]);
      const formValues = formDs.current.toJSONData();
      const params = {
        ...formValues,
        customizeUnitCode,
      };
      if (formValidateFlag && tableValidateFlag) {
        setSpinning(true);
        // 第一次新建，跟后面的编辑是分开的接口
        if (reqId) {
          return new Promise(() => {
            handleFormSave(params)
              .then(async (response = {}) => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  await formDs.query();
                }
              })
              .finally(() => {
                setSpinning(false);
              });
          });
        } else {
          return new Promise(() => {
            handleCreate(params)
              .then((response = {}) => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  const { reqId: newReqId = '', reqStatus: newReqStatus } = res;
                  dispatch(
                    routerRedux.push({
                      pathname: `/sslm/buyer-apply-release/detail/${newReqId}/${newReqStatus}`,
                    })
                  );
                }
              })
              .finally(() => {
                setSpinning(false);
              });
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
    const [formValidateFlag, tableValidateFlag] = await Promise.all([
      formDs.validate(),
      tableDs.validate(),
    ]);
    const params = {
      ...formValues,
      customizeUnitCode,
    };
    if (formValidateFlag && tableValidateFlag) {
      setSpinning(true);
      return new Promise(() => {
        handleFormPublish(params)
          .then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: '/sslm/buyer-apply-release/list',
                })
              );
            }
          })
          .finally(() => {
            setSpinning(false);
          });
      });
    } else {
      notification.warning({
        message: intl.get('sslm.sample.view.message.maintainInfo').d('请维护相关信息！'),
      });
    }
  }, []);

  // 删除
  const handleDelete = useCallback(async () => {
    setSpinning(true);
    const data = getResponse(await formDs.delete(formDs.current));
    if (data && data.success) {
      dispatch(
        routerRedux.push({
          pathname: '/sslm/buyer-apply-release/list',
        })
      );
      setSpinning(false);
    } else {
      setSpinning(false);
    }
  }, []);

  //  操作记录
  const handleRecords = () => {
    operationRecordsModal({
      documentType: 'SAMPLE_SEND_REQ',
      documentId: reqId,
    });
  };

  // 样品行新增
  const handleTableAdd = useCallback(() => {
    const currentRow = tableDs.current;
    currentRow.set('reqId', reqId);
  }, []);

  const buttons = isDisable ? [] : [['add', { afterClick: handleTableAdd }], 'delete'];

  const headerInfoProps = {
    formDs,
    isDisable,
    custLoading,
    customizeForm,
    isEdit,
    proxyDsCreate,
    spinning, // 用于个性化渲染render设置显示影藏
  };

  const buttonShowFlag = !['NEW', 'SUPPLIER_RETURNED', 'RELEASE_REJECT', undefined].includes(
    status
  );

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.sample.view.title.publish').d('送样申请发布')}
        backPath={isPub ? '' : '/sslm/buyer-apply-release/list'}
      >
        {!isPub && (
          <Button
            type="primary"
            funcType="raised"
            icon="save"
            color="primary"
            hidden={buttonShowFlag}
            onClick={handleSave}
            loading={spinning}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        )}
        {reqId && (
          <Fragment>
            {!isPub && (
              <Fragment>
                <Button
                  funcType="raised"
                  icon="finished"
                  loading={spinning}
                  hidden={buttonShowFlag}
                  onClick={handlePublish}
                >
                  {intl.get('hzero.common.button.release').d('发布')}
                </Button>
                <Button
                  funcType="raised"
                  icon="delete"
                  loading={spinning}
                  hidden={buttonShowFlag}
                  onClick={handleDelete}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              </Fragment>
            )}
            <Button icon="schedule" onClick={handleRecords} loading={spinning}>
              {intl.get('hzero.common.button.operated').d('操作记录')}
            </Button>
          </Fragment>
        )}
      </Header>
      {remote.render('SSLM_SAMPLE_DELIVERY_RELEASE_DETAIL_EXTRA_NODE', null, { isPub, formDs })}
      <Content>
        <Spin spinning={spinning}>
          <div>
            <div className="ued-detail-wrapper">
              <Collapse defaultActiveKey={collapsedKeys} onChange={handleCollapseChange}>
                <Panel
                  key="basicInfo"
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>
                        {intl.get(`sslm.sample.view.message.basicInfo`).d('送样申请基础信息')}
                      </h3>
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
                    {remote.render(
                      'SSLM_SAMPLE_DELIVERY_RELEASE_DETAIL_SAMPLE_INFO_EXTRA_NODE',
                      null,
                      { isPub, reqStatus }
                    )}
                    {customizeTable(
                      {
                        code: 'SSLM.SAMPLE_DELIVERY_PUBLISH.SAMPLE_INFO',
                        buttonCode: 'SSLM.SAMPLE_DELIVERY_PUBLISH.SAMPLE_INFO_BTNS',
                        readOnly: isDisable,
                        __force_record_to_update__: true,
                      },
                      <Table
                        dataSet={tableDs}
                        columns={columns}
                        data={[]}
                        buttons={buttons}
                        custLoading={custLoading}
                      />
                    )}
                  </Panel>
                )}
              </Collapse>
            </div>
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({ code: ['sslm.sample', 'sslm.common'] }),
  WithCustomize({
    unitCode: [
      'SSLM.SAMPLE_DELIVERY_PUBLISH.BASIC_INFO',
      'SSLM.SAMPLE_DELIVERY_PUBLISH.SAMPLE_INFO',
      'SSLM.SAMPLE_DELIVERY_PUBLISH.SAMPLE_INFO_BTNS',
    ],
  }),
  remotes({
    code: 'SSLM_SAMPLE_DELIVERY_RELEASE_DETAIL',
    name: 'remote',
  })
)(Detail);
