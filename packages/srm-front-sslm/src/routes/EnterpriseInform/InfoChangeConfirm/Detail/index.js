import React, { Fragment, useCallback, useMemo, useEffect, useState } from 'react';
import { Button, Spin, Form, Modal, Input, Row, Col } from 'hzero-ui';
import querystring from 'querystring';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/h0Customize';
import { connect } from 'dva';
import remote from 'utils/remote';

import { compose, isEmpty } from 'lodash';

import HeaderInfo from '@/routes/EnterpriseInform/Detail/HeaderInfo';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import InfoDetail from '../../infoDetail';

const FormItem = Form.Item;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const customizeUnitCode = [
  'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.HEADER',
  'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.BANK_INFO',
  'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.INVOICE_INFO',
  'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.OTHER_INFO',
  'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.CONT_INFO', // 联系人信息
  'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.ADDRESS_INFO', // 地址信息
  'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.ATT_INFO', // 附件信息
  'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.FINANCIAL_INFO', // 财务状况
  'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.SUPPLIER_CLASSIFY', // 供应商分类
  'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.REJECT_MODAL',
  'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.REGISTRATION_OVERSEAS', // 登记信息-境内外
  'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.REGISTRATION_PERSONAL', // 登记信息-个人
];

const Index = ({
  location,
  history: { push },
  form,
  dispatch,
  custLoading,
  allLoading = false,
  customizeForm,
  customizeTable,
  customizeBtnGroup,
  form: { getFieldDecorator },
  location: { pathname = '' },
  infoChangeConfirmRemote,
}) => {
  const [changeReqId, changeConfirmId, companyId, partnerTenantId] = useMemo(
    () => (pathname.split('detail/')[1] || '').split('/'),
    [pathname]
  );

  const routerParams = querystring.parse(location.search.substr(1));
  const { source, buttonDisabled, changeLevel } = routerParams;

  const [detailHeader, setDetailHeader] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [adoptFlag, setAdoptFlag] = useState(true);
  const [collapseCodeList, setCollapseCodeList] = useState([]);
  const [activeCollapseList, setActiveCollapseList] = useState([]);

  const pubFlag = !!pathname.match('/pub/');

  const buttonHidden = pubFlag || buttonDisabled === '1';

  const remoteParams = {
    changeReqId,
    partnerTenantId,
    companyId,
    detailHeader,
  };

  const changFlag =
    !['WAIT_CONFIRMED'].includes(detailHeader.reqStatus) || detailHeader.partnerTenantId === -1;
  // 待租户确认
  const isTenantConfim =
    (['CONFIRM_REJECTED', 'REJECTED@WFL'].includes(detailHeader.reqStatus) &&
      detailHeader.changeLevel === 'PLATFORM') ||
    detailHeader.reqStatus === 'WAIT_TENANT_CONFIRMED';

  // 平台确认页签
  const isAllPlatform = changeLevel === 'PLATFORM';
  const customizeHeaderCode = isAllPlatform
    ? 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.PLATFORM_HEADER'
    : 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.HEADER';
  useEffect(() => {
    // 查询采购方折叠面板个性化配置
    queryCustomize();
    if (changeReqId) {
      dispatch({
        type: 'enterpriseInform/queryApprovalDetailHeader',
        payload: {
          changeReqId,
          changeConfirmId,
          customizeUnitCode: customizeHeaderCode,
        },
      }).then(res => {
        if (res) {
          setDetailHeader(res);
        }
      });
    } else {
      notification.error({
        message: intl
          .get('sslm.enterpriseInform.view.message.paramMissing')
          .d(
            '参数不正确，企业信息变更单Id（changeReqId）不能为空。请检查配置或联系您的项目经理/运维经理处理。'
          ),
      });
    }
  }, [changeReqId]);

  /**
   * 查询个性化
   */
  const queryCustomize = useCallback(() => {
    let unitCode = 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.TENANT_COLLAPSE';
    if (changeLevel === 'PLATFORM') {
      unitCode = 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.PLATFORM_COLLAPSE';
    }
    const payload = {
      unitCode,
    };
    dispatch({
      type: 'enterpriseInform/queryCustomizePlatform',
      payload,
    }).then(res => {
      if (!isEmpty(res)) {
        if (res.collapseCodeList && res.collapseCodeList.length > 0) {
          setCollapseCodeList(res.collapseCodeList);
          setActiveCollapseList(res.activeCollapseList);
        }
      }
    });
  }, [changeLevel]);

  const approvalAdopt = useCallback(() => {
    form.validateFields((err, values) => {
      if (!err) {
        const { oldApprovalOpinion, ...others } = values;
        dispatch({
          type: 'enterpriseInform/confirm',
          payload: {
            data: [
              {
                ...detailHeader,
                ...others,
                changeConfirmId,
                // companyId,
              },
            ],
            customizeUnitCode,
          },
        }).then(res => {
          if (res) {
            notification.success();
            push('/sslm/enterprise-inform-confirm/list');
          }
        });
      }
    });
  }, [detailHeader]);

  const approveReject = useCallback(() => {
    form.validateFields({ force: true }, (err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'enterpriseInform/approveReject',
          payload: {
            data: [
              {
                changeConfirmId,
                ...fieldsValue,
                // companyId,
              },
            ],
            customizeUnitCode,
          },
        }).then(res => {
          if (res) {
            notification.success();
            push('/sslm/enterprise-inform-confirm/list');
          }
        });
      }
    });
  }, []);

  const handleDisplayModal = async flag => {
    if (flag) {
      const eventProps = {
        push,
        dispatch,
        detailHeader,
        changeConfirmId,
        customizeUnitCode,
      };
      const res = await infoChangeConfirmRemote.event.fireEvent('cuxHandleApproved', eventProps);
      if (!res) {
        return;
      }
    }
    setAdoptFlag(flag);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const handleConfirm = useCallback(async () => {
    const eventProps = {
      form,
      push,
      dispatch,
      detailHeader,
      changeConfirmId,
      customizeUnitCode: customizeHeaderCode,
    };
    const eventRes = await infoChangeConfirmRemote.event.fireEvent('cuxHandleConfirm', eventProps);
    if (!eventRes) {
      return;
    }
    form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'enterpriseInform/tenantConfirmBefore',
          payload: {
            data: [
              {
                ...detailHeader,
                ...values,
                changeConfirmId,
              },
            ],
            customizeUnitCode: customizeHeaderCode,
          },
        }).then(result => {
          if (result) {
            const { errorFlag, docmentNumList = [] } = result;
            const title = !errorFlag
              ? intl.get('sslm.enterpriseInform.view.confirm.tenantConfirmMsg').d('是否确认？')
              : intl
                  .get('sslm.enterpriseInform.view.confirm.tenantConfirmBeforeMsg', {
                    docmentNumStr: (docmentNumList || []).join('、'),
                  })
                  .d(
                    `存在历史版本的单据【${(docmentNumList || []).join(
                      '、'
                    )}】仍在审批中，继续操作将会终止原单据的审批流程，请确认是否继续？`
                  );
            Modal.confirm({
              title,
              onOk: () => {
                dispatch({
                  type: 'enterpriseInform/tenantConfirm',
                  payload: {
                    data: [
                      {
                        ...detailHeader,
                        ...values,
                        changeConfirmId,
                      },
                    ],
                    customizeUnitCode: customizeHeaderCode,
                  },
                }).then(res => {
                  if (res) {
                    notification.success();
                    push('/sslm/enterprise-inform-confirm/list');
                  }
                });
              },
            });
          }
        });
      }
    });
  }, [detailHeader]);

  // 操作记录
  const handleOperatRecord = useCallback(() => {
    if (changeLevel === 'PLATFORM') {
      operationRecordsModal({
        documentType: 'ENTERPRISE_PLATFORM_CONFIRM',
        approveDocumentType: 'ENTERPRISE_TENANT_CONFIRM',
        documentId: changeConfirmId,
      });
    } else {
      operationRecordsModal({
        documentType: 'ENTERPRISE_TENANT_CONFIRM',
        changeReqId,
        documentId: changeConfirmId,
      });
    }
  }, [changeLevel, changeConfirmId, changeReqId]);

  // 处理返回路径
  const handleBackPath = () => {
    let backPath = '/sslm/enterprise-inform-confirm/list';
    // 工作流页面||消息中心跳转过来的，没有返回箭头
    if (pubFlag || source === 'message') {
      backPath = '';
    }
    return backPath;
  };

  const modalForm = (
    <Form custLoading={custLoading}>
      <Row gutter={48} className="read-row">
        <Col span={adoptFlag ? 24 : 8}>
          <FormItem
            {...formItemLayout}
            label={intl
              .get('sslm.enterpriseInform.model.application.approvalOpinion')
              .d('审批意见')}
          >
            {getFieldDecorator('approvalOpinion', {
              initialValue: detailHeader.approvalOpinion,
            })(<TextArea rows={adoptFlag ? 2 : 16} />)}
          </FormItem>
        </Col>
      </Row>
    </Form>
  );

  return (
    <Fragment>
      <Header
        backPath={handleBackPath()}
        title={intl.get('sslm.enterpriseInform.view.title.changeConfirm').d('企业信息变更审批')}
      >
        {!buttonHidden &&
          customizeBtnGroup({ code: 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.BTN_GROUP' }, [
            <Button
              icon="file-text"
              data-name="operating"
              onClick={handleOperatRecord}
              loading={allLoading}
            >
              {intl.get('hzero.common.button.operating').d('操作记录')}
            </Button>,
            <Button
              icon="check"
              type="primary"
              data-name="approved"
              loading={allLoading}
              onClick={() => handleDisplayModal(true)}
              style={{ marginLeft: 8, display: changFlag ? 'none' : 'inline-block' }}
            >
              {intl.get(`hzero.common.view.message.title.approved`).d('审批通过')}
            </Button>,
            <Button
              icon="close"
              data-name="reject"
              loading={allLoading}
              onClick={() => handleDisplayModal(false)}
              style={{ marginLeft: 8, display: changFlag ? 'none' : 'inline-block' }}
            >
              {intl.get(`hzero.common.view.message.title.reject`).d('审批拒绝')}
            </Button>,
            <Button
              icon="check"
              type="primary"
              data-name="confirm"
              onClick={handleConfirm}
              loading={allLoading}
              style={{ display: isTenantConfim ? 'inline-block' : 'none' }}
            >
              {intl.get('hzero.common.button.confirm').d('确认')}
            </Button>,
          ])}
        {/* 按钮埋点 */}
        {infoChangeConfirmRemote &&
          infoChangeConfirmRemote.render(
            'SSLM_INFOCHANGECONFIRM_DEFINITION_CUSTOMER_BUTTONS',
            <></>,
            remoteParams
          )}
      </Header>
      <Content wrapperClassName="enterpriseConfirm">
        <Spin spinning={allLoading || false}>
          <Form className="ued-edit-form" id="scrollArea">
            <div style={{ margin: '0 16px 24px' }}>
              <HeaderInfo
                form={form}
                detailHeader={detailHeader}
                changFlag={changFlag || pubFlag}
                customizeForm={customizeForm}
                customizeUnitCode={customizeHeaderCode}
                isApprove
                platformConfimEdit={isTenantConfim}
              />
            </div>
          </Form>
          {changeReqId && (
            <InfoDetail
              changeReqId={changeReqId}
              companyId={companyId}
              partnerTenantId={partnerTenantId}
              custLoading={custLoading}
              customizeForm={customizeForm}
              customizeTable={customizeTable}
              changeLevel={detailHeader.changeLevel}
              collapseCodeList={collapseCodeList || []}
              activeCollapseList={activeCollapseList || []}
              source="enterpriseConfirm"
              detailHeader={detailHeader}
            />
          )}
        </Spin>
      </Content>
      <Modal
        width={640}
        destroyOnClose
        title={
          adoptFlag
            ? intl.get('sslm.enterpriseInform.view.confirmMsg.confirm').d('确认通过？')
            : intl.get('sslm.enterpriseInform.view.confirmMsg.reject').d('确认拒绝？')
        }
        visible={modalVisible}
        onCancel={hideModal}
        onOk={adoptFlag ? approvalAdopt : approveReject}
        confirmLoading={allLoading}
        maskClosable={false}
      >
        {adoptFlag
          ? modalForm
          : customizeForm(
              {
                form,
                dataSource: detailHeader,
                code: 'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.REJECT_MODAL',
              },
              modalForm
            )}
      </Modal>
    </Fragment>
  );
};

export default compose(
  connect(({ enterpriseInform, loading }) => ({
    enterpriseInform,
    allLoading:
      loading.effects['enterpriseInform/queryInfoChangeApprovalDetail'] ||
      loading.effects['enterpriseInform/queryInvestigate'] ||
      loading.effects['enterpriseInform/approveReject'] ||
      loading.effects['enterpriseInform/confirm'] ||
      loading.effects['enterpriseInform/tenantConfirm'],
  })),
  formatterCollections({ code: ['sslm.enterpriseInform', 'sslm.common', 'sslm.supplierInform'] }),
  Form.create({ fieldNameProp: null }),
  WithCustomize({
    unitCode: [
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.PLATFORM_HEADER', // 平台确认审批头
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.HEADER', // 详情头
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.BTN_GROUP', // 折叠面板
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.BANK_INFO', // 银行信息
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.INVOICE_INFO', // 开票信息
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.OTHER_INFO', // 其它信息
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.CONT_INFO', // 联系人信息
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.ADDRESS_INFO', // 地址信息
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.ATT_INFO', // 附件信息
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.FINANCIAL_INFO', // 财务状况
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.SUPPLIER_CLASSIFY', // 供应商分类
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.PLATFORM_COLLAPSE', // 平台级变更确认-折叠面板
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.TENANT_COLLAPSE', // 租户企业信息变更审批-折叠面板
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.REJECT_MODAL',
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.REGISTRATION_OVERSEAS', // 登记信息-境内外
      'SSLM.ENTERPRISE_INFORM_CONFIRM_DETAIL.REGISTRATION_PERSONAL', // 登记信息-个人
    ],
  }),
  remote(
    {
      code: 'SSLM_INFOCHANGECONFIRM_DEFINITION', // 对应二开模块暴露的Expose的编码
      name: 'infoChangeConfirmRemote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      events: {
        cuxHandleApproved() {}, // 二开租户审批通过逻辑
        cuxHandleConfirm() {}, // 二开平台确认逻辑
      },
    }
  )
)(Index);
