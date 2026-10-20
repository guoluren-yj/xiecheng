import React, { useState, useContext, useEffect, useMemo, useCallback, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { throttle } from 'lodash';
import { Header, Content } from 'components/Page';
import { Modal, Attachment, Row, Col } from 'choerodon-ui/pro';
import { Spin, Collapse, Icon } from 'hzero-ui';
import notification from 'utils/notification';
import moment from 'moment';
import { DETAIL_DEFAULT_CLASSNAME, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import {
  formatAumont,
  handleBudgetVerification,
  queryCommonDoubleUomConfig,
} from '@/routes/components/utils';
import { addNewSubmitDetail, submitChangeOrder } from '@/services/orderCancel';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse } from 'utils/utils';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import { isEmpty } from 'choerodon-ui/dataset/utils';
import OrderLineInfoC7N from './OrderLineInfoC7N';
import OrderHeaderInfo from './OrderHeaderInfo';
import BOMModalC7N from './BOMModal';
import OperationRecord from './OperationRecord';
import { Store } from './stores';

const { Panel } = Collapse;

const OrderChange = observer((props) => {
  const {
    customizeTable,
    customizeBtnGroup,
    customizeForm,
    history,
    changeFields = [],
    remote,
  } = props;

  const {
    orderLineInfoDs,
    orderHeaderInfoDs,
    poHeaderId,
    enumMap,
    searchDs,
    BOMTableDs,
    organizationId,
  } = useContext(Store);

  const attachmentViewOnly = (name) => {
    let viewOnly = true;
    for (const item of changeFields) {
      if (item === name) {
        viewOnly = false;
        break;
      }
    }
    return viewOnly;
  };

  const headerInfoRef = useRef({});

  const [collapseKeys, setCollapseKeys] = useState(['orderHeaderInfo', 'orderLineInfo']);

  const [changeFlag, setChangeFlag] = useState(false);

  const [loading, setLoading] = useState(false);

  const [doubleUnitEnabled, setDoubleUnitEnabled] = useState(0);
  useEffect(() => {
    handleHeaderQuery();
    orderLineInfoQuery();
    fetchCfg();
  }, []);

  const fetchCfg = async () => {
    const res = await queryCommonDoubleUomConfig();
    if (res) {
      setDoubleUnitEnabled(res);
    }
  };

  useEffect(() => {
    orderLineInfoDs.setState({ loading: setLoading, doubleUnitEnabled });
  }, [orderLineInfoDs, doubleUnitEnabled, setLoading]);

  // 头查询
  const handleHeaderQuery = () => {
    setLoading(true);
    orderHeaderInfoDs.setQueryParameter('poHeaderId', poHeaderId);
    orderHeaderInfoDs
      .query()
      .then((res) => {
        if (res) {
          headerInfoRef.current = res;
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 行查询
  const orderLineInfoQuery = () => {
    orderLineInfoDs.setQueryParameter('poHeaderId', poHeaderId);
    orderLineInfoDs.query();
  };

  const onCollapseChange = (key) => {
    setCollapseKeys(key);
  };

  // 调整金额精度
  const amountFinancialPrecision = (amount, financialPrecision, poSourcePlatform) => {
    if (poSourcePlatform === 'ERP') {
      return formatAumont(amount);
    } else {
      return formatAumont(amount, financialPrecision, true);
    }
  };

  /**
   * 账户分配类别选择后，在提交前筛选出必输字段
   * 后端无法返回前端对应字段提示（提示信息不友好），因此提交异常提示在前端处理
   */
  const handleRequiredFieldNames = (values) => {
    let requiredFieldNamesArray = [];
    requiredFieldNamesArray = values.map((n) => {
      const {
        requiredFieldNames = [],
        accountAssignTypeId,
        projectCategory,
        costId,
        accountSubjectId,
        wbsCode,
        freeFlag,
      } = n;
      let requiredFieldNamesFiltered = requiredFieldNames;
      if (accountAssignTypeId) {
        requiredFieldNamesFiltered = requiredFieldNamesFiltered.filter(
          (n1) => n1 !== 'accountAssignTypeId'
        );
      }
      if (projectCategory) {
        requiredFieldNamesFiltered = requiredFieldNamesFiltered.filter(
          (n1) => n1 !== 'projectCategory'
        );
      }
      if (costId) {
        requiredFieldNamesFiltered = requiredFieldNamesFiltered.filter((n1) => n1 !== 'costId');
      }
      if (accountSubjectId) {
        requiredFieldNamesFiltered = requiredFieldNamesFiltered.filter(
          (n1) => n1 !== 'accountSubjectId'
        );
      }
      if (wbsCode) {
        requiredFieldNamesFiltered = requiredFieldNamesFiltered.filter((n1) => n1 !== 'wbsCode');
      }
      if (freeFlag) {
        requiredFieldNamesFiltered = requiredFieldNamesFiltered.filter((n1) => n1 !== 'freeFlag');
      }
      return requiredFieldNamesFiltered;
    });
    // 合并订单行必输字段
    const allRequiredFieldNames = requiredFieldNamesArray.reduce((a, b) => a.concat(b), []);
    // 去重
    const newRequiredFieldNames = Array.from(new Set(allRequiredFieldNames));
    let notice = '';
    for (let i = 0; i < newRequiredFieldNames.length; i++) {
      if (newRequiredFieldNames[i] === 'accountAssignTypeId') {
        notice = notice.concat(
          `【 ${intl
            .get('sodr.quotePurchaseRequisition.view.message.accountAssignType')
            .d('账户分配类别')}】、`
        );
      } else if (newRequiredFieldNames[i] === 'projectCategory') {
        notice = notice.concat(
          `【${intl
            .get('sodr.quotePurchaseRequisition.view.message.projectCategory')
            .d('项目类别')}】、`
        );
      } else if (newRequiredFieldNames[i] === 'costId') {
        notice = notice.concat(
          `【${intl.get('sodr.common.model.common.costName').d('成本中心')}】、`
        );
      } else if (newRequiredFieldNames[i] === 'accountSubjectId') {
        notice = notice.concat(
          `【${intl.get('sodr.workspace.model.common.accountSubjectId').d('总账科目')}】、`
        );
      } else if (newRequiredFieldNames[i] === 'wbsCode') {
        notice = notice.concat(
          `【${intl.get('sodr.quotePurchase.model.quotePurchase.wbs').d('WBS元素')}】、`
        );
      } else if (newRequiredFieldNames[i] === 'freeFlag') {
        notice = notice.concat(
          `【${intl.get('sodr.common.model.common.freeFlag').d('是否免费')}】、`
        );
      }
    }
    const newNotice = notice.substring(0, notice.length - 1);
    return newNotice;
  };

  // 提交
  const handleSubmit = throttle(
    async () => {
      const flag = await orderLineInfoDs.validate();
      if (!flag) {
        notification.warning({
          message: intl.get(`sodr.orderChange.view.message.required`).d('有必填项未填'),
        });
        return;
      }

      const onSubmit = async () => {
        if (
          orderLineInfoDs.records.every((ele) => ele.dirty === false && ele.status !== 'add') &&
          orderHeaderInfoDs.current.dirty === false &&
          !changeFlag
        ) {
          notification.warning({
            message: intl.get(`sodr.orderChange.view.message.noModifyData`).d('未修改任何数据'),
          });
        } else {
          const values = orderLineInfoDs.toData().map((ele) => ({
            ...ele,
            requiredFieldNames: ele.assignTypeRequiredFieldNames || [],
          }));
          const poLineDetailDTOs = values.map((item) => ({
            ...item,
            needByDate: item.needByDate
              ? moment(item.needByDate).format(DEFAULT_DATETIME_FORMAT)
              : undefined,
          }));
          const poHeaderDetail = isEmpty(orderHeaderInfoDs.current.toData())
            ? headerInfoRef?.current
            : orderHeaderInfoDs.current.toData();
          const ras = getResponse(
            await addNewSubmitDetail({
              poHeaderDetailDTO: {
                ...poHeaderDetail,
                changSubmitFlag: 1,
              },
              poLineDetailDTOs,
              // fieldMap,
            })
          );
          if (ras) {
            const confirmModalProps = remote.process('getConfirmModalProps', {
              data: ras,
              type: 'change-c7n',
              basicInfoDs: orderHeaderInfoDs,
            });
            if (ras.value) {
              const result = await Modal.confirm({
                title: ras.message,
                okText: intl.get('hzero.common.button.sure').d('确定'),
                cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                ...confirmModalProps,
              });
              if (result !== 'ok') {
                return;
              }
            }
            Modal.confirm({
              title: intl.get(`hzero.common.message.confirm.submit`).d('是否确认提交'),
              okText: intl.get('hzero.common.button.sure').d('确定'),
              cancelText: intl.get('hzero.common.button.cancel').d('取消'),
              onOk: throttle(
                async () => {
                  // const values = orderLineInfoDs.toData().map(ele => ({
                  //   ...ele,
                  //   requiredFieldNames: ele.assignTypeRequiredFieldNames || [],
                  // }));
                  const newNotice = handleRequiredFieldNames(values);
                  if (newNotice) {
                    notification.warning({
                      message:
                        newNotice +
                        intl
                          .get(`sodr.ordercancel.view.message.warn.requiredWarning`)
                          .d(
                            '必输，请前往配置中心修改该字段为允许变更或前往采购类型维护页面修改字段必输设置。'
                          ),
                    });
                  } else {
                    const submit = throttle(
                      async () => {
                        setLoading(true);
                        const res = getResponse(
                          await submitChangeOrder({
                            // fieldMap,
                            poHeaderId,
                            poHeaderDetailDTO: poHeaderDetail,
                            poLineDetailDTOs,
                            customizeUnitCode:
                              'SODR.ORDER_CANCEL_CHANGE.HEADER,SODR.ORDER_CANCEL_CHANGE.LIST',
                          })
                        );
                        if (res) {
                          notification.success();
                          history.push({
                            pathname: `/sodr/order-cancel/list`,
                          });
                        }
                        setLoading(false);
                      },
                      THROTTLE_TIME,
                      { trailing: false }
                    );
                    const poLineExpVOList =
                      poLineDetailDTOs &&
                      poLineDetailDTOs.map((item) => ({
                        ...item,
                        viewCode: 'CHANGE_VIEW',
                      }));
                    const data = [
                      {
                        ...poHeaderDetail,
                        poLineExpVOList,
                      },
                    ];
                    handleBudgetVerification(data, submit, {
                      loading: ({ status }) => {
                        setLoading(status);
                      },
                      key: 'status',
                    });
                  }
                },
                THROTTLE_TIME,
                { trailing: false }
              ),
            });
          }
        }
      };

      if (remote?.event) {
        await remote?.event.fireEvent('onSubmit', { onSubmit, orderHeaderInfoDs, orderLineInfoDs });
      } else {
        onSubmit();
      }
    },
    THROTTLE_TIME,
    { trailing: false }
  );

  // 外协BOM查看弹框
  const openBOMModalC7N = useCallback(
    (record) => {
      const { itemCode, itemName, poLineId, poLineLocationId } = record.get([
        'itemCode',
        'itemName',
        'poLineId',
        'poLineLocationId',
      ]);
      const modalProps = {
        itemCode,
        itemName,
        poHeaderId,
        poLineId,
        poLineLocationId,
        searchDs,
        BOMTableDs,
      };
      Modal.open({
        key: Modal.key(),
        title: intl.get('sodr.sendOrder.view.title.titleBom').d('外协BOM'),
        children: <BOMModalC7N {...modalProps} />,
        style: { width: '720px' },
        closable: true,
        footer: null,
      });
    },
    [poHeaderId, BOMTableDs, searchDs]
  );

  // 操作记录弹框
  const changeOperationRecord = useCallback(() => {
    const modalProps = {
      poHeaderId,
      organizationId,
    };
    Modal.open({
      key: Modal.key(),
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: <OperationRecord {...modalProps} />,
      style: {
        width: 1200,
        maxHeight: 600,
      },
      closable: true,
      footer: null,
    });
  }, [poHeaderId, organizationId]);

  const orderLineInfoProps = useMemo(() => {
    return {
      remote,
      doubleUnitEnabled,
      ouId: headerInfoRef?.current?.ouId,
      companyId: headerInfoRef?.current?.companyId,
      orderHeaderInfoDs,
      orderLineInfoDs,
      customizeTable,
      customizeBtnGroup,
      freeFlag: enumMap?.freeFlag,
      headerInfo: headerInfoRef?.current,
      enumMap,
      changeFields,
      openBOMModalC7N,
      amountFinancialPrecision,
      setChangeFlag,
    };
  }, [
    headerInfoRef?.current,
    doubleUnitEnabled,
    orderLineInfoDs,
    customizeTable,
    enumMap,
    openBOMModalC7N,
    amountFinancialPrecision,
  ]);

  const orderHeaderInfoProps = useMemo(() => {
    return {
      orderHeaderInfoDs,
      customizeForm,
      headerInfo: headerInfoRef?.current,
      amountFinancialPrecision,
    };
  }, [orderHeaderInfoDs, customizeForm, headerInfoRef?.current, amountFinancialPrecision]);

  const headerBtnsRender = [
    {
      name: 'submit',
      child: intl.get(`hzero.common.button.submit`).d('提交'),
      btnProps: {
        loading,
        icon: 'check',
        type: 'primary',
        onClick: handleSubmit,
        disabled:
          loading ||
          !['APPROVED', 'REJECTED', 'PUBLISHED', 'CONFIRMED', 'PART_FEED_BACK'].includes(
            orderHeaderInfoDs?.current?.get('statusCode')
          ),
      },
    },
    {
      name: 'outUuid',
      btnComp: Attachment,
      child: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
      btnProps: {
        name: 'attachmentUuid',
        dataSet: orderHeaderInfoDs,
        disabled: loading,
        viewMode: 'popup',
        color: 'default',
        icon: 'attach_file',
        funcType: 'raised',
        readOnly: attachmentViewOnly('attachmentUuid'),
        onAttachmentsChange: () => setChangeFlag(true),
      },
    },
    {
      name: 'innerUuid',
      btnComp: Attachment,
      child: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
      btnProps: {
        name: 'purchaserInnerAttachmentUuid',
        dataSet: orderHeaderInfoDs,
        disabled: loading,
        viewMode: 'popup',
        color: 'default',
        icon: 'attach_file',
        funcType: 'raised',
        readOnly: attachmentViewOnly('purchaserInnerAttachmentUuid'),
        onAttachmentsChange: () => setChangeFlag(true),
      },
    },
    {
      name: 'operation',
      child: intl.get(`sodr.common.view.button.operationRecord`).d('操作记录'),
      btnProps: {
        icon: 'clock-circle-o',
        onClick: changeOperationRecord,
      },
    },
  ];
  return (
    <React.Fragment>
      <Header
        title={intl.get(`sodr.ordercancel.view.message.titleChange`).d('订单变更')}
        backPath="/sodr/order-cancel/list"
      >
        {customizeBtnGroup(
          { code: 'SODR.ORDER_CANCEL_CHANGE.BUTTONS', pro: true },
          <DynamicButtons buttons={headerBtnsRender} />
        )}
      </Header>
      <Content>
        <Spin spinning={loading} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          <Collapse
            defaultActiveKey={collapseKeys}
            className="form-collapse"
            onChange={onCollapseChange}
          >
            <Panel
              showArrow={false}
              header={
                <React.Fragment>
                  <h3>{intl.get(`sodr.common.view.message.orderHeaderInfo`).d('订单头信息')}</h3>
                  <a>
                    {collapseKeys.includes('orderHeaderInfo')
                      ? intl.get('hzero.common.button.up').d('收起')
                      : intl.get('hzero.common.button.expand').d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                </React.Fragment>
              }
              key="orderHeaderInfo"
            >
              <Row>
                <Col span={18}>
                  <OrderHeaderInfo {...orderHeaderInfoProps} />
                </Col>
              </Row>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <React.Fragment>
                  <h3>{intl.get(`sodr.common.view.message.orderLineInfo`).d('订单行信息')}</h3>
                  <a>
                    {collapseKeys.includes('orderLineInfo')
                      ? intl.get('hzero.common.button.up').d('收起')
                      : intl.get('hzero.common.button.expand').d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('orderLineInfo') ? 'up' : 'down'} />
                </React.Fragment>
              }
              key="orderLineInfo"
            >
              <OrderLineInfoC7N {...orderLineInfoProps} />
            </Panel>
          </Collapse>
        </Spin>
      </Content>
    </React.Fragment>
  );
});

export default OrderChange;
