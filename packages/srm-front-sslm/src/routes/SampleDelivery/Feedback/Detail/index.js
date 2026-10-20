import { compose } from 'lodash';
import queryString from 'querystring';
import { routerRedux } from 'dva/router';
import { Collapse, Icon } from 'hzero-ui';
import { Spin } from 'choerodon-ui';
import {
  DataSet,
  Button,
  DateTimePicker,
  TextField,
  Modal,
  Form,
  TextArea,
} from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useState, useMemo, useEffect } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { Button as PerButton } from 'components/Permission';
import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import {
  handleSingleSubmit,
  handleSaveBackInfo,
  handleBackCallback,
} from '@/services/sampleSupplierApplyCallbackService';
import { numberSeparatorRender } from '@/routes/components/utils';
import HeaderInfo from './HeaderInfo';
import ComposeTable from '../../components/ComposeTable';
import { basicInfoDS, listLineDS } from '../stores/detailDS';

const organizationId = getCurrentOrganizationId();
const { Panel } = Collapse;

const customizeUnitCode =
  'SSLM.SAMPLE_DELIVERY_CALLBACK.SAMPLE_INFO,SSLM.SAMPLE_DELIVERY_CALLBACK.BASIC_INFO,SSLM.SAMPLE_DELIVERY_CALLBACK.LINE_FORM';

const Detail = ({
  remote,
  dispatch,
  match,
  customizeTable,
  custLoading,
  customizeForm,
  location,
}) => {
  const detailReqId = useMemo(() => match.params.detailReqId, [match]);
  const formDs = useMemo(() => new DataSet(basicInfoDS({ detailReqId })), [detailReqId]);
  const tableDs = useMemo(() => new DataSet(listLineDS({ detailReqId })), [detailReqId]);
  const reqStatus = useMemo(() => match.params.reqStatus, [match]);
  const isPub = useMemo(() => location.pathname.match('/pub/'), [location]);
  const backPath = useMemo(() => `${isPub ? '/pub' : ''}/sslm/supplier-apply-callback/list`, [
    isPub,
  ]);

  const [spinning, setSpinning] = useState(false);
  const [status, setStatus] = useState(undefined);
  const [collapsedKeys, setCollapsedKeys] = useState(['basicInfo', 'sampleInfo']);

  // 折叠面板回调
  const handleCollapseChange = useCallback(keys => {
    setCollapsedKeys(keys);
  }, []);

  useEffect(() => {
    formDs.query().then(res => {
      const response = getResponse(res);
      if (response) {
        setStatus(response.reqStatus);
      }
    });
  }, [detailReqId]);

  // 保存/提交审批
  const saveAndSubmit = async flag => {
    const [formValidateFlag, tableValidateFlag] = await Promise.all([
      formDs.validate(),
      tableDs.validate(),
    ]);
    if (formValidateFlag && tableValidateFlag) {
      return new Promise(() => {
        setSpinning(true);
        const formData = formDs.current?.toJSONData() || {};
        const infoDtoList = tableDs.toData();
        const data = {
          ...formData,
          infoDtoList,
          customizeUnitCode,
        };
        if (flag) {
          handleSaveBackInfo(data)
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
          handleSingleSubmit(data)
            .then((response = {}) => {
              const res = getResponse(response);
              if (res) {
                notification.success();
                dispatch(routerRedux.push({ pathname: backPath }));
              }
            })
            .finally(() => {
              setSpinning(false);
            });
        }
      });
    }
  };

  // 跳转供应商附件
  const handleJumpDetail = useCallback(record => {
    const {
      data: { sampleId, reqId },
    } = record;
    dispatch(
      routerRedux.push({
        pathname: `${
          isPub ? '/pub' : ''
        }/sslm/supplier-apply-callback/attach-upload/${sampleId}/${reqId}`,
        search: queryString.stringify({
          isView: false,
        }),
        state: {
          backPath: `${
            isPub ? '/pub' : ''
          }/sslm/supplier-apply-callback/detail/${detailReqId}/${reqStatus}`,
          title: intl.get(`sslm.sample.model.upload.supplierAttachment`).d('上传供应商附件'),
        },
      })
    );
  }, []);

  const handleBackOk = useCallback((modal, ds) => {
    Modal.confirm({
      title: intl.get('sslm.sample.view.title.supplierBackTip').d('是否将送样申请退回给采购方?'),
      onOk: () => {
        const reqIds = formDs.toJSONData().map(({ reqId }) => reqId);
        const payload = {
          reqIds,
          remark: ds?.current?.get('remark'),
        };
        return new Promise((resolve, reject) => {
          handleBackCallback(payload).then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              // eslint-disable-next-line no-unused-expressions
              ds?.current?.reset();
              modal.close();
              resolve();
              dispatch(routerRedux.push({ pathname: backPath }));
            } else {
              reject(new Error(res));
            }
          });
        });
      },
    });
  }, []);

  // 供应商退回
  const handleBack = useCallback(() => {
    const ds = new DataSet({
      fields: [
        {
          name: 'remark',
          label: intl.get('sslm.sample.view.modal.supplierBackRemark').d('退回备注'),
          type: 'string',
        },
      ],
    });
    const modal = Modal.open({
      title: intl.get('sslm.sample.view.title.supplierBackRemark').d('退回备注'),
      style: { width: 560 },
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        handleBackOk(modal, ds);
        return false;
      },
      children: (
        <Form dataSet={ds} labelLayout="float">
          <TextArea name="remark" style={{ width: '100%' }} />
        </Form>
      ),
      afterClose: () => {
        tableDs.reset();
      },
    });
    return modal;
  }, []);

  const columns = [
    {
      name: 'lineNum',
      width: 70,
    },
    {
      name: 'itemCode',
      width: 150,
    },
    {
      name: 'itemName',
      width: 160,
      tooltip: 'overflow',
    },
    {
      name: 'itemDesc',
      width: 160,
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
      width: 200,
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
      width: 200,
      editor: () => <DateTimePicker />,
    },
    {
      name: 'sendTypeCode',
      width: 140,
      editor: true,
    },
    {
      name: 'trackingNumber',
      width: 200,
      editor: record =>
        record.get('sendTypeCode') === 'EXPRESS_DELIVERY' && <TextField restrict="a-z,A-Z,0-9,-" />,
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
      width: 140,
      hidden: !['CONFIRMED', 'RETURNED'].includes(reqStatus),
    },
    {
      name: 'remark',
      width: 200,
      tooltip: 'overflow',
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
    {
      name: 'option',
      width: 300,
      lock: 'right',
      align: 'center',
      renderer: ({ record }) => {
        return (
          <Fragment>
            <Upload
              icon=""
              viewOnly
              btnText={intl.get(`sslm.sample.model.upload.checkBuyer`).d('查看采购方附件')}
              tenantId={organizationId}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="sslm-deliver"
              attachmentUUID={record.get('buyerAttachmentUuid')}
              filePreview
            />
            <a onClick={() => handleJumpDetail(record)} style={{ marginLeft: 16 }}>
              {intl.get(`sslm.sample.model.upload.supplierAttachment`).d('上传供应商附件')}
            </a>
          </Fragment>
        );
      },
    },
  ];

  const buttonShowFlag = !['PUBLISHED', 'FEEDBACKED_NEW', 'RETURNED'].includes(status);

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.sample.view.title.sampleCallback').d('送样申请反馈')}
        backPath={backPath}
      >
        <Button
          type="primary"
          color="primary"
          icon="save"
          loading={spinning}
          hidden={buttonShowFlag}
          onClick={() => saveAndSubmit(true)}
          wait={500}
          waitType="throttle"
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Button
          funcType="raised"
          icon="finished"
          loading={spinning}
          hidden={buttonShowFlag}
          onClick={() => saveAndSubmit(false)}
          wait={500}
          waitType="throttle"
        >
          {intl.get('sslm.sample.view.button.submitCallBack').d('提交反馈')}
        </Button>
        <PerButton
          loading={spinning}
          icon="arrow-left"
          hidden={buttonShowFlag}
          permissionList={[
            {
              code: `srm.partner.buyer-apply-publish.supplier-apply-callback.ps.return`,
              type: 'button',
              meaning: '送样申请反馈-供应商退回',
            },
          ]}
          onClick={handleBack}
          wait={500}
          waitType="throttle"
        >
          {intl.get('sslm.sample.view.button.supplierBack').d('供应商退回')}
        </PerButton>
      </Header>
      {remote.render('SSLM_SAMPLE_DELIVERY_FEEDBACK_DETAIL_EXTRA_NODE', null, { isPub, formDs })}
      <Content>
        <Spin spinning={spinning}>
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
                <HeaderInfo
                  formDs={formDs}
                  reqStatus={reqStatus}
                  customizeForm={customizeForm}
                  custLoading={custLoading}
                  code="SSLM.SAMPLE_DELIVERY_CALLBACK.BASIC_INFO"
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
                      {<Icon type={collapsedKeys.includes('sampleInfo') ? 'up' : 'down'} />}
                    </a>
                  </Fragment>
                }
              >
                <ComposeTable
                  isEdit
                  tableDs={tableDs}
                  columns={columns}
                  tableFormDs={formDs}
                  custLoading={custLoading}
                  customizeForm={customizeForm}
                  customizeTable={customizeTable}
                  formCode="SSLM.SAMPLE_DELIVERY_CALLBACK.LINE_FORM"
                  code="SSLM.SAMPLE_DELIVERY_CALLBACK.SAMPLE_INFO"
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
    code: ['sslm.sample'],
  }),
  WithCustomize({
    unitCode: [
      'SSLM.SAMPLE_DELIVERY_CALLBACK.SAMPLE_INFO',
      'SSLM.SAMPLE_DELIVERY_CALLBACK.BASIC_INFO',
      'SSLM.SAMPLE_DELIVERY_CALLBACK.LINE_FORM',
    ],
  }),
  remotes({
    code: 'SSLM_SAMPLE_DELIVERY_FEEDBACK_DETAIL',
    name: 'remote',
  })
)(Detail);
