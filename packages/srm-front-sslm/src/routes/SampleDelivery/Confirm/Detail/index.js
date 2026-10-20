import { compose, isFunction } from 'lodash';
import queryString from 'querystring';
import { routerRedux } from 'dva/router';
// import { Collapse, Icon } from 'hzero-ui';
import { Spin, Collapse } from 'choerodon-ui';
import { DataSet, Button, Lov } from 'choerodon-ui/pro';
import React, { Fragment, useMemo, useCallback, useState, useEffect } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import { openTab } from 'utils/menuTab';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import {
  singleReturn,
  singleConfirm,
  confirmSave,
  singleClosed,
} from '@/services/buyerApplyConfirmService';
import { numberSeparatorRender } from '@/routes/components/utils';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import styles from '@/routes/index.less';
import HeaderInfo from './HeaderInfo';
import ComposeTable from '../../components/ComposeTable';
import { basicInfoDS, listLineDS } from '../stores/detailDS';

const organizationId = getCurrentOrganizationId();

const { Panel } = Collapse;

const Detail = ({
  remote,
  dispatch,
  match,
  customizeTable,
  customizeForm,
  customizeCollapse,
  custLoading,
  location,
  onLoad,
  code: workflowFormCode,
  ...rest
}) => {
  const detailReqId = useMemo(() => match.params.detailReqId || match.params.reqId, [match]);
  const reqStatus = useMemo(() => match.params.reqStatus, [match]);
  const routerParam = queryString.parse(location.search.substr(1));
  const { isSupplier, pubEdit = 0, nodeEdit = 0 } = routerParam;
  const isSupplierFlag = useMemo(() => !!Number(isSupplier), []);
  const pubEditFlag = useMemo(() => !!Number(pubEdit), []); // 判断工作流是否可编辑
  const pubNodeEditFlag = useMemo(() => !!Number(nodeEdit), []); // 工作流某些节点拓展页签可编辑，给二开代码使用
  const isPub = useMemo(() => match.path.includes('/pub/'), [match]);
  const formDs = useMemo(
    () =>
      new DataSet(
        basicInfoDS({
          detailReqId,
          setSourceHidden: boolean => setSourceResultFlag(boolean),
        })
      ),
    [detailReqId]
  );
  const tableDs = useMemo(
    () =>
      new DataSet(
        remote.process(
          'SSLM_SAMPLE_DELIVERY_CONFIRM_DETAIL_TABLE_DS_PROPS',
          listLineDS({ detailReqId, isSupplierFlag }),
          { isPub, pubEditFlag, ...rest }
        )
      ),
    [detailReqId, isSupplierFlag]
  );

  tableDs.bind(formDs, 'infoDtoList');

  const isDisable = ['FEEDBACKED', 'CONFIRM_REJECT'].includes(reqStatus);

  const headerCode = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_CONFIRM.SUPPLIER_BASIC_INFO'
    : 'SSLM.SAMPLE_DELIVERY_CONFIRM.BASIC_INFO';
  const headerCodeAll = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_CONFIRM.SUPPLIER_BASIC_INFO,SSLM.SAMPLE_DELIVERY_CONFIRM.SUPPLIER_LINE_FORM'
    : 'SSLM.SAMPLE_DELIVERY_CONFIRM.BASIC_INFO,SSLM.SAMPLE_DELIVERY_CONFIRM.LINE_FORM';
  const lineCode = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_CONFIRM.SUPPLIER_SAMPLE_INFO'
    : 'SSLM.SAMPLE_DELIVERY_CONFIRM.SAMPLE_INFO';
  const customizeUnitCode = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_CONFIRM.SUPPLIER_BASIC_INFO,SSLM.SAMPLE_DELIVERY_CONFIRM.SUPPLIER_SAMPLE_INFO,SSLM.SAMPLE_DELIVERY_CONFIRM.SUPPLIER_LINE_FORM'
    : 'SSLM.SAMPLE_DELIVERY_CONFIRM.BASIC_INFO,SSLM.SAMPLE_DELIVERY_CONFIRM.SAMPLE_INFO,SSLM.SAMPLE_DELIVERY_CONFIRM.LINE_FORM';
  const formCode = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_CONFIRM.SUPPLIER_LINE_FORM'
    : 'SSLM.SAMPLE_DELIVERY_CONFIRM.LINE_FORM';
  const [spinning, setSpinning] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [status, setStatus] = useState(undefined);
  const [collapsedKeys, setCollapsedKeys] = useState(['basicInfo', 'sampleInfo']);
  const [sourceResultFlag, setSourceResultFlag] = useState(false);

  useEffect(() => {
    formDs.setState({
      pubNodeEditFlag,
      detailReqId,
    });
    setSpinning(true);
    formDs.setQueryParameter('customizeUnitCode', headerCodeAll);
    tableDs.setQueryParameter('customizeUnitCode', lineCode);
    formDs
      .query()
      .then(res => {
        const response = getResponse(res);
        if (response) {
          if (formDs.current) {
            formDs.current.set('workflowFormCode', workflowFormCode);
          }
          setStatus(response.reqStatus);
        }
      })
      .finally(() => setSpinning(false));
    tableDs.query();

    // 处理工作流审批保存
    if (isFunction(onLoad)) {
      onLoad({
        submit: handlePubSubmit,
      });
    }
  }, [detailReqId]);

  // 工作流中审批通过、拒绝的回调
  const handlePubSubmit = async approveResult => {
    const [formValidateFlag, tableValidateFlag] = await Promise.all([
      formDs.validate(),
      tableDs.validate(),
    ]);
    return new Promise((resolve, reject) => {
      if (approveResult === 'Approved') {
        if (formValidateFlag && tableValidateFlag) {
          setSpinning(true);
          const headerInfo = formDs.current.toJSONData(); // 获取头信息
          const infoDtoList = tableDs.toData(); // 获取行信息
          const data = { ...headerInfo, infoDtoList, customizeUnitCode };
          confirmSave(data)
            .then(response => {
              const res = getResponse(response);
              if (res) {
                resolve(res);
              } else {
                reject(new Error(res)); // 异常
              }
            })
            .finally(() => setSpinning(false));
        } else {
          reject();
        }
      } else {
        resolve();
      }
    });
  };

  // 折叠面板回调
  const handleCollapseChange = useCallback(keys => {
    setCollapsedKeys(keys);
  }, []);

  // 跳转供应商附件
  const handleJumpDetail = useCallback(record => {
    const {
      data: { reqId, sampleId },
    } = record;
    if (isPub) {
      openTab({
        key: `/sslm/buyer-apply-confirm/attach-upload/${sampleId}/${reqId}/${reqStatus}`,
        title: intl.get('sslm.sample.view.title.sampleConfirm').d('送样申请确认'),
        search: queryString.stringify({
          isView: true,
        }),
        state: {
          backPath: '',
          title: intl.get('sslm.sample.view.title.checkSupplierAttachments').d('查看供应商附件'),
        },
      });
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sslm/buyer-apply-confirm/attach-upload/${sampleId}/${reqId}/${reqStatus}`,
          search: queryString.stringify({
            isView: true,
          }),
          state: {
            backPath: `/sslm/buyer-apply-confirm/detail/${detailReqId}/${reqStatus}`,
            title: intl.get('sslm.sample.view.title.checkSupplierAttachments').d('查看供应商附件'),
          },
        })
      );
    }
  }, []);

  // 保存／确认／退回/关闭
  const buttonAction = async action => {
    const [formValidateFlag, tableValidateFlag] = await Promise.all([
      formDs.validate(),
      tableDs.validate(),
    ]);
    if (formValidateFlag && tableValidateFlag) {
      return new Promise(() => {
        setSpinning(true);
        const headerInfo = formDs.current.toJSONData(); // 获取头信息
        const infoDtoList = tableDs.toData(); // 获取行信息
        const data = { ...headerInfo, infoDtoList, customizeUnitCode };
        switch (action) {
          case 'save': {
            confirmSave(data)
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  setQueryLoading(true);
                  Promise.all([formDs.query(), tableDs.query()]).finally(() =>
                    setQueryLoading(false)
                  );
                }
              })
              .finally(() => {
                setSpinning(false);
              });
            break;
          }
          case 'confirm': {
            singleConfirm(data)
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  dispatch(
                    routerRedux.push({
                      pathname: '/sslm/buyer-apply-confirm/list',
                    })
                  );
                }
              })
              .finally(() => {
                setSpinning(false);
              });
            break;
          }
          case 'close':
            singleClosed(data)
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  dispatch(
                    routerRedux.push({
                      pathname: '/sslm/buyer-apply-confirm/list',
                    })
                  );
                }
              })
              .finally(() => {
                setSpinning(false);
              });
            break;
          default: {
            singleReturn(data)
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  notification.success();
                  dispatch(
                    routerRedux.push({
                      pathname: '/sslm/buyer-apply-confirm/list',
                    })
                  );
                }
              })
              .finally(() => {
                setSpinning(false);
              });
            break;
          }
        }
      });
    } else {
      notification.warning({
        message: intl.get('sslm.sample.view.message.required').d('存在必填字段未填写！'),
      });
    }
  };

  //  操作记录
  const handleRecords = () => {
    operationRecordsModal({
      documentType: 'SAMPLE_SEND_REQ',
      documentId: detailReqId,
    });
  };

  const cols = [
    {
      name: 'lineNum',
      width: 70,
    },
    {
      name: 'itemCode',
      width: 180,
    },
    {
      name: 'itemName',
      width: 180,
      tooltip: 'overflow',
    },
    {
      name: 'itemDesc',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'uomName',
      width: 100,
      tooltip: 'overflow',
      renderer: ({ record = {} }) => {
        const isShowUomCodeFlag = formDs?.current?.get('isShowUomCodeFlag');
        const { data: { uomCodeAndName, uomName } = {} } = record;
        return !isShowUomCodeFlag ? uomName : uomCodeAndName;
      },
    },
    {
      name: 'itemCategoryCode',
      width: 180,
    },
    {
      name: 'itemCategoryName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'reqQuantity',
      width: 120,
      renderer: ({ record, value }) => {
        const precision = record.get('uomPrecision') === 0 ? 0 : record.get('uomPrecision') || 10;
        return numberSeparatorRender(value, precision);
      },
    },
    {
      name: 'reqTime',
      width: 160,
    },
    {
      name: 'expectedDeliveryDate',
      width: 160,
    },
    {
      name: 'sendTypeCodeMeaning',
      width: 140,
    },
    {
      name: 'trackingNumber',
      width: 200,
    },
    {
      name: 'tryUseDepartment',
      width: 120,
    },
    {
      name: 'tryUseWorkshop',
      width: 120,
    },
    {
      name: 'sampleResult',
      width: 140,
      editor: isDisable,
    },
    {
      name: 'remark',
      width: 200,
      editor: isDisable,
      tooltip: 'overflow',
    },
    {
      name: 'trialResultsUuid',
      width: 130,
      renderer: ({ record }) => (
        <Upload
          viewOnly={!isDisable}
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
      lock: 'right',
      align: 'center',
      width: 300,
      renderer: ({ record }) => {
        return (
          <Fragment>
            <Upload
              icon=""
              viewOnly
              btnText={intl.get(`sslm.sample.model.evaluation.checkBuyer`).d('查看采购方附件')}
              tenantId={organizationId}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="sslm-deliver"
              attachmentUUID={record.get('buyerAttachmentUuid')}
              filePreview
            />
            <a onClick={() => handleJumpDetail(record)} style={{ marginLeft: 16 }}>
              {intl.get(`sslm.sample.model.evaluation.checkSupplier`).d('查看供应商附件')}
            </a>
          </Fragment>
        );
      },
    },
  ];

  const columns = remote.process('SSLM_SAMPLE_DELIVERY_CONFIRM_DETAIL_TABLE_COLUMNS', cols, {
    reqStatus,
    isSupplierFlag,
    pubEdit,
    sourceResultFlag,
    ...rest,
  });

  const supplierColumns = [
    {
      name: 'lineNum',
      width: 70,
    },
    {
      name: 'itemLov',
      width: 180,
      editor: isDisable,
    },
    {
      name: 'itemName',
      width: 180,
      tooltip: 'overflow',
      editor: isDisable,
    },
    {
      name: 'itemDesc',
      width: 200,
      tooltip: 'overflow',
      editor: isDisable,
    },
    {
      name: 'uoLov',
      width: 140,
      editor: isDisable,
    },
    {
      name: 'itemCategoryCode',
      width: 180,
      editor: isDisable && <Lov name="itemCategoryCode" tableProps={{ treeAsync: true }} />,
    },
    {
      name: 'itemCategoryName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'reqQuantity',
      width: 120,
      renderer: ({ record, value }) => {
        const precision = record.get('uomPrecision') === 0 ? 0 : record.get('uomPrecision') || 10;
        return numberSeparatorRender(value, precision);
      },
    },
    {
      name: 'reqTime',
      width: 160,
      editor: isDisable,
    },
    {
      name: 'expectedDeliveryDate',
      width: 160,
    },
    {
      name: 'sendTypeCodeMeaning',
      width: 140,
    },
    {
      name: 'trackingNumber',
      width: 200,
    },
    {
      name: 'tryUseDepartment',
      width: 120,
      editor: isDisable,
    },
    {
      name: 'tryUseWorkshop',
      width: 120,
      editor: isDisable,
    },
    {
      name: 'sampleResult',
      width: 140,
      editor: isDisable,
    },
    {
      name: 'trialResultsUuid',
      width: 130,
      renderer: ({ record }) => (
        <Upload
          viewOnly={!isDisable}
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
      name: 'remark',
      width: 200,
      editor: isDisable,
      tooltip: 'overflow',
    },
  ];

  const allLoading = queryLoading || spinning;
  const buttonShowFlag = !['FEEDBACKED', 'CONFIRM_REJECT'].includes(status);

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.sample.view.title.sampleConfirm').d('送样申请确认')}
        backPath={isPub ? '' : '/sslm/buyer-apply-confirm/list'}
      >
        {!isPub && isDisable && (
          <Fragment>
            <Button
              icon="check"
              color="primary"
              loading={allLoading}
              onClick={() => buttonAction('confirm')}
              hidden={buttonShowFlag}
              wait={500}
              waitType="throttle"
            >
              {intl.get('hzero.common.button.confirm').d('确认')}
            </Button>
            <Button
              icon="save"
              loading={allLoading}
              onClick={() => buttonAction('save')}
              hidden={buttonShowFlag}
              wait={500}
              waitType="throttle"
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button
              icon="arrow_back"
              loading={allLoading}
              onClick={buttonAction}
              hidden={buttonShowFlag}
              wait={500}
              waitType="throttle"
            >
              {intl.get('sslm.sample.view.button.rollback').d('退回')}
            </Button>
            <Button
              icon="close"
              loading={allLoading}
              hidden={buttonShowFlag}
              onClick={() => buttonAction('close')}
              wait={500}
              waitType="throttle"
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </Fragment>
        )}
        <Button icon="schedule" loading={allLoading} onClick={handleRecords}>
          {intl.get('hzero.common.button.operated').d('操作记录')}
        </Button>
      </Header>
      {remote.render('SSLM_SAMPLE_DELIVERY_CONFIRM_DETAIL_EXTRA_NODE', null, { isPub, formDs })}
      <Content wrapperClassName={styles['content-wrap']} className={styles['customize-wrap']}>
        <Spin spinning={allLoading}>
          <div className="ued-detail-wrapper">
            {customizeCollapse(
              {
                code: 'SSLM.SAMPLE_DELIVERY_CONFIRM.DETAIL_COLLAPSE',
                custDefaultActive: key => {
                  handleCollapseChange(key);
                },
              },
              <Collapse
                bordered={false}
                defaultActiveKey={collapsedKeys}
                onChange={handleCollapseChange}
                custLoading={custLoading}
                expandIconPosition="text-right"
                trigger="text-icon"
              >
                <Panel
                  key="basicInfo"
                  header={intl.get(`sslm.sample.view.message.basicInfo`).d('送样申请基础信息')}
                  forceRender
                >
                  <HeaderInfo
                    dataSet={formDs}
                    isDisable={!isDisable}
                    custLoading={custLoading}
                    customizeForm={customizeForm}
                    isSupplierFlag={isSupplierFlag}
                    code={headerCode}
                    tenantId={organizationId}
                  />
                </Panel>
                <Panel
                  key="sampleInfo"
                  header={intl.get(`sslm.sample.view.message.sampleInfo`).d('样品信息')}
                  forceRender
                >
                  <ComposeTable
                    tableDs={tableDs}
                    columns={isSupplierFlag ? supplierColumns : columns}
                    tableFormDs={formDs}
                    pubEditFlag={pubEditFlag}
                    custLoading={custLoading}
                    customizeForm={customizeForm}
                    customizeTable={customizeTable}
                    confirmEdit={isDisable}
                    code={lineCode}
                    formCode={formCode}
                  />
                </Panel>
              </Collapse>
            )}
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.sample'],
  }),
  WithCustomize({
    unitCode: [
      'SSLM.SAMPLE_DELIVERY_CONFIRM.BASIC_INFO',
      'SSLM.SAMPLE_DELIVERY_CONFIRM.SAMPLE_INFO',
      'SSLM.SAMPLE_DELIVERY_CONFIRM.SUPPLIER_BASIC_INFO',
      'SSLM.SAMPLE_DELIVERY_CONFIRM.SUPPLIER_SAMPLE_INFO',
      'SSLM.SAMPLE_DELIVERY_CONFIRM.LINE_FORM',
      'SSLM.SAMPLE_DELIVERY_CONFIRM.DETAIL_COLLAPSE',
      'SSLM.SAMPLE_DELIVERY_CONFIRM.SUPPLIER_LINE_FORM',
    ],
  }),
  remotes({
    code: 'SSLM_SAMPLE_DELIVERY_CONFIRM_DETAIL',
    name: 'remote',
  })
)(Detail);
