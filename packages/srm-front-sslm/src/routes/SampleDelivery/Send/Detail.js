import { compose } from 'lodash';
import queryString from 'querystring';
import { routerRedux } from 'dva/router';
import { Collapse, Icon } from 'hzero-ui';
// import { Collapse, Icon } from 'choerodon-ui';
import { Spin } from 'choerodon-ui';
import { DataSet, Button, Modal, Form, Output } from 'choerodon-ui/pro';
import React, { Fragment, useMemo, useState, useCallback, useEffect } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Button as PerButton } from 'components/Permission';
import { PRIVATE_BUCKET } from '_utils/config';

import { observer } from 'mobx-react-lite';
import { confirmPrint, batchClosed } from '@/services/buyerApplyConfirmService';
import { handleFormSave } from '@/services/buyerApplySendService';
import { sampleCheckLastOperationTime } from '@/services/buyerApplyQueryService';
import { numberSeparatorRender } from '@/routes/components/utils';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import BasicInfo from '../components/BasicInfo';
import ComposeTable from '../components/ComposeTable';
import { basicInfoDS, listLineDS } from './stores/detailDS';

const organizationId = getCurrentOrganizationId();

const { Panel } = Collapse;

const Detail = ({
  remote,
  dispatch,
  match,
  customizeTable,
  customizeForm,
  custLoading,
  location,
  customizeBtnGroup,
}) => {
  const detailReqId = useMemo(() => match.params.detailReqId, [match]);
  const reqStatus = useMemo(() => match.params.reqStatus, []);
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
  const tableDs = useMemo(() => new DataSet(listLineDS({ detailReqId })), [detailReqId]);
  const isPub = useMemo(() => match.path.includes('/pub/'), []);

  const routerParam = queryString.parse(location.search.substr(1));
  const { isSupplier, sampleSource, openTab } = routerParam;
  const isSupplierFlag = useMemo(() => !!Number(isSupplier), []);
  const { state: locationParam = {} } = location;
  const { historyBack = '' } = locationParam;

  const headerCode = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_SEND.SUPPLIER_BASIC_INFO'
    : 'SSLM.SAMPLE_DELIVERY_SEND.BASIC_INFO';
  const customizeUnitCode = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_SEND.SUPPLIER_BASIC_INFO,SSLM.SAMPLE_DELIVERY_SEND.SUPPLIER_SAMPLE_INFO,SSLM.SAMPLE_DELIVERY_SEND.SUPPLER_SAMPLE_FORMINFO'
    : 'SSLM.SAMPLE_DELIVERY_SEND.BASIC_INFO,SSLM.SAMPLE_DELIVERY_SEND.SAMPLE_INFO,SSLM.SAMPLE_DELIVERY_SEND.SAMPLE_FORMINFO';
  const lineCode = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_SEND.SUPPLIER_SAMPLE_INFO'
    : 'SSLM.SAMPLE_DELIVERY_SEND.SAMPLE_INFO';

  const formCode = isSupplierFlag
    ? 'SSLM.SAMPLE_DELIVERY_SEND.SUPPLER_SAMPLE_FORMINFO'
    : 'SSLM.SAMPLE_DELIVERY_SEND.SAMPLE_FORMINFO';

  const isView = reqStatus === 'CONFIRMED';

  const [spinning, setSpinning] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [collapsedKeys, setCollapsedKeys] = useState(['basicInfo', 'sampleInfo']);
  const [sourceResultFlag, setSourceResultFlag] = useState(false);

  const allLoading = closeLoading || spinning;

  useEffect(() => {
    setSpinning(true);
    formDs.setQueryParameter('customizeUnitCode', customizeUnitCode);
    tableDs.setQueryParameter('customizeUnitCode', lineCode);
    formDs.query().finally(() => setSpinning(false));
    tableDs.query();
  }, [detailReqId]);

  // 折叠面板回调
  const handleCollapseChange = useCallback(keys => {
    setCollapsedKeys(keys);
  }, []);

  // 查询供应商附件
  const handleJumpAttachment = record => {
    const {
      data: { reqId, sampleId },
    } = record;
    const pathname = isPub
      ? `/pub/sslm/buyer-apply-query/attach-upload/${sampleId}/${reqId}`
      : `/sslm/buyer-apply-query/attach-upload/${sampleId}/${reqId}`;
    const backPath = isPub
      ? `/pub/sslm/buyer-apply-query/detail/${reqId}/${reqStatus}?${queryString.stringify(
          routerParam
        )}`
      : `/sslm/buyer-apply-query/detail/${reqId}/${reqStatus}`;
    dispatch(
      routerRedux.push({
        pathname,
        search: queryString.stringify({
          isView: true,
        }),
        state: {
          backPath,
          title: intl.get('sslm.sample.view.title.checkSupplierAttachments').d('查看供应商附件'),
        },
      })
    );
  };

  //  操作记录
  const handleRecords = () => {
    operationRecordsModal({
      documentType: 'SAMPLE_SEND_REQ',
      documentId: detailReqId,
    });
  };

  //  打印
  const handlePrint = () => {
    const params = { detailReqId };
    setSpinning(true);
    confirmPrint(params)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          if (res.type.indexOf('application/json') > -1) {
            notification.warning({
              description: intl
                .get(`sslm.common.view.printwarning.noTemplate`)
                .d('未设置打印模板，不可打印'),
            });
            return;
          }
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow) {
            printWindow.print();
          }
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  };

  //  文件归档
  const handledocFiling = () => {
    Modal.open({
      key: Modal.key(),
      closable: true,
      movable: false,
      destroyOnClose: true,
      style: { width: 400 },
      title: intl.get('hzero.common.title.uploadAttach').d('上传附件'),
      children: (
        <Form record={formDs.current} columns={1}>
          <Output
            name="documentsUuid"
            renderer={() => (
              <Upload
                bucketName={PRIVATE_BUCKET}
                attachmentUUID={formDs.current && formDs.current.get('documentsUuid')}
                afterOpenUploadModal={attUuid => {
                  formDs.current.set('documentsUuid', attUuid);
                }}
                filePreview
              />
            )}
          />
        </Form>
      ),
      onOk: () => {
        const headerInfo = formDs.current.toJSONData(); // 获取头信息
        const infoDtoList = tableDs.toData(); // 获取行信息
        const data = {
          ...headerInfo,
          infoDtoList,
          customizeUnitCode: 'SSLM.SAMPLE_DELIVERY_SEND.BASIC_INFO',
        };
        return handleFormSave(data).then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            setSpinning(true);
            formDs.query().finally(() => setSpinning(false));
            tableDs.query();
          }
        });
      },
    });
  };

  const columns = [
    {
      name: 'lineNum',
      width: 70,
    },
    {
      name: 'itemCode',
      width: 160,
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
      width: 180,
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
      name: 'sampleResultMeaning',
      width: 160,
      tooltip: 'overflow',
      hidden: ['NEW', 'PUBLISHED', 'RELEASE_REJECT', 'RELEASE_APPROVING'].includes(reqStatus),
    },
    {
      name: 'trialResultsUuid',
      width: 130,
      hidden: ['NEW', 'PUBLISHED', 'RELEASE_REJECT', 'RELEASE_APPROVING'].includes(reqStatus),
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
    {
      name: 'remark',
      width: 200,
      tooltip: 'overflow',
      hidden: ['NEW', 'PUBLISHED', 'RELEASE_REJECT', 'RELEASE_APPROVING'].includes(reqStatus),
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
            <a onClick={() => handleJumpAttachment(record)} style={{ marginLeft: 16 }}>
              {intl.get('sslm.sample.view.title.checkSupplierAttachments').d('查看供应商附件')}
            </a>
          </Fragment>
        );
      },
    },
  ];

  const supplierColumns = [
    {
      name: 'lineNum',
      width: 70,
    },
    {
      name: 'itemCode',
      width: 160,
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
        const { data: { uomCodeAndName } = {} } = record;
        return uomCodeAndName;
      },
    },
    {
      name: 'itemCategoryCode',
      width: 180,
    },
    {
      name: 'itemCategoryName',
      width: 180,
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
      name: 'sampleResultMeaning',
      width: 160,
      tooltip: 'overflow',
      hidden: ['NEW', 'PUBLISHED', 'RELEASE_REJECT', 'RELEASE_APPROVING'].includes(reqStatus),
    },
    {
      name: 'remark',
      width: 200,
      tooltip: 'overflow',
      hidden: ['NEW', 'PUBLISHED', 'RELEASE_REJECT', 'RELEASE_APPROVING'].includes(reqStatus),
    },
    {
      name: 'trialResultsUuid',
      width: 130,
      renderer: ({ record }) => (
        <Upload
          viewOnly={reqStatus !== 'FEEDBACKED'}
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
  ];

  const OperationButtons = observer(({ dataSet }) => {
    const reqSts = dataSet.current && dataSet.current.get('reqStatus');
    const isShowCloseBtn =
      reqSts === 'PUBLISHED' || reqSts === 'RETURNED' || reqSts === 'CONFIRM_REJECT';
    // 关闭
    const handleClose = () => {
      setSpinning(true);
      sampleCheckLastOperationTime([detailReqId])
        .then(res => {
          if (res) {
            Modal.confirm({
              title: intl
                .get('sslm.sample.view.message.sevenWarn')
                .d('该样品待反馈时间未超过7天，是否确认关闭'),
              onOk: () => {
                setCloseLoading(true);
                batchClosed([detailReqId])
                  .then(() => {
                    formDs.setQueryParameter('customizeUnitCode', customizeUnitCode);
                    tableDs.setQueryParameter('customizeUnitCode', lineCode);
                    Promise.all([formDs.query(), tableDs.query()]).finally(() =>
                      setCloseLoading(false)
                    );
                  })
                  .catch(() => setCloseLoading(false));
              },
            });
          } else {
            setCloseLoading(true);
            batchClosed([detailReqId])
              .then(() => {
                formDs.setQueryParameter('customizeUnitCode', customizeUnitCode);
                tableDs.setQueryParameter('customizeUnitCode', lineCode);
                Promise.all([formDs.query(), tableDs.query()]).finally(() =>
                  setCloseLoading(false)
                );
              })
              .catch(() => setCloseLoading(false));
          }
        })
        .finally(() => {
          setSpinning(false);
        });
    };
    return (
      <React.Fragment>
        {isShowCloseBtn && !isPub && (
          <Button
            icon="close"
            onClick={handleClose}
            loading={allLoading}
            wait={500}
            waitType="throttle"
          >
            {intl.get('sslm.sample.view.header.closeButton').d('关闭')}
          </Button>
        )}
      </React.Fragment>
    );
  });

  /**
   * 处理返回按钮
   * @param {*} sampleSource 来源， related表示关联单据
   * @param {*} historyBack location.state取值，目前只有pub页会传
   * @param {*} routerParam 路径拼接参数
   */
  const handleBackPath = useCallback(() => {
    let backPath = '';
    switch (sampleSource) {
      case 'related': // 关联单据pub页过来的
        backPath = '/pub/sslm/supplier-related-doc/list';
        break;
      default:
        break;
    }
    return (
      historyBack ||
      (backPath
        ? `${backPath}?${queryString.stringify(routerParam)}`
        : '/sslm/buyer-apply-query/list')
    );
  }, [sampleSource]);

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.sample.view.title.sampleApplyCheck').d('送样申请单查看')}
        backPath={Number(openTab) ? '' : handleBackPath()}
      >
        {customizeBtnGroup(
          {
            code: 'SSLM.SAMPLE_DELIVERY_SEND.DETAIL.BTN_GROUP',
          },
          [
            <Button
              data-name="operated"
              icon="schedule"
              color="primary"
              onClick={handleRecords}
              loading={allLoading}
              wait={500}
              waitType="throttle"
            >
              {intl.get('hzero.common.button.operated').d('操作记录')}
            </Button>,
            <PerButton
              data-name="print"
              icon="print-o"
              type="c7n-pro"
              disabled={isPub}
              loading={allLoading}
              wait={500}
              waitType="throttle"
              permissionList={[
                {
                  code: `srm.partner.buyer-apply-publish.buyer-apply-query.ps.button.print`,
                  type: 'button',
                  meaning: '我发出的送样申请-打印',
                },
              ]}
              onClick={handlePrint}
            >
              {intl.get('hzero.common.button.print').d('打印')}
            </PerButton>,
            isView && (
              <Button
                data-name="docFiling"
                icon="file_upload"
                onClick={handledocFiling}
                loading={allLoading}
                wait={500}
                waitType="throttle"
              >
                {intl.get('sslm.sample.view.button.docFiling').d('文件归档')}
              </Button>
            ),
            <OperationButtons data-name="close" dataSet={formDs} />,
          ]
        )}
      </Header>
      {remote.render('SSLM_SAMPLE_DELIVERY_SEND_DETAIL_EXTRA_NODE', null, { isPub, formDs })}
      <Content>
        <Spin spinning={allLoading}>
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
                <BasicInfo
                  formDs={formDs}
                  reqStatus={reqStatus}
                  custLoading={custLoading}
                  customizeForm={customizeForm}
                  code={headerCode}
                  isShowConfirmation
                  isSupplierFlag={isSupplierFlag}
                />
              </Panel>
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
                      {<Icon type={collapsedKeys.includes('basicInfo') ? 'up' : 'down'} />}
                    </a>
                  </Fragment>
                }
              >
                <ComposeTable
                  tableDs={tableDs}
                  columns={isSupplierFlag ? supplierColumns : columns}
                  tableFormDs={formDs}
                  custLoading={custLoading}
                  customizeForm={customizeForm}
                  customizeTable={customizeTable}
                  code={lineCode}
                  formCode={formCode}
                />
              </Panel>
            </Collapse>
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.sample', 'sslm.common'],
  }),
  WithCustomize({
    unitCode: [
      'SSLM.SAMPLE_DELIVERY_SEND.BASIC_INFO',
      'SSLM.SAMPLE_DELIVERY_SEND.SAMPLE_INFO',
      'SSLM.SAMPLE_DELIVERY_SEND.SUPPLIER_BASIC_INFO',
      'SSLM.SAMPLE_DELIVERY_SEND.SUPPLIER_SAMPLE_INFO',
      'SSLM.SAMPLE_DELIVERY_SEND.SUPPLER_SAMPLE_FORMINFO',
      'SSLM.SAMPLE_DELIVERY_SEND.SAMPLE_FORMINFO',
      'SSLM.SAMPLE_DELIVERY_SEND.DETAIL.BTN_GROUP',
    ],
  }),
  remotes({
    code: 'SSLM_SAMPLE_DELIVERY_SEND_DETAIL',
    name: 'remote',
  })
)(Detail);
