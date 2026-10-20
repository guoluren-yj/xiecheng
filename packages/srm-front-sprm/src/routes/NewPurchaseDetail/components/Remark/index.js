/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-21 17:44:42
 * @LastEditors: yanglin
 * @LastEditTime: 2024-04-02 17:42:18
 */
import React, { useImperativeHandle } from 'react';
import { DataSet, Form, TextArea, useDataSet, Table, Modal } from 'choerodon-ui/pro';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { Card } from 'choerodon-ui';
import intl from 'utils/intl';
import classnames from 'classnames';
import { DETAIL_CARD_TABLE_CLASSNAME } from 'utils/constants';
import RemarkDs from './RemarkDs';
import ContectDoc from '../../../PurchasePlatform/AllByExecutionStatus/ContectDoc';
import styles from './remark.less';

const organizationId = getCurrentOrganizationId();
const Remark = React.forwardRef(
  (
    { required = false, remarkLabel, customizeForm, cusCode, params = {}, btnType, isOldUser },
    ref
  ) => {
    const remarkInfo = useDataSet(
      () =>
        RemarkDs({
          required,
        }),
      [required]
    );
    const closeDs = {
      autoCreate: false,
      paging: false,
      selection: false,
      autoQuery: btnType === 'closedRemark',
      fields: [
        {
          name: 'prNum',
          label: intl.get('sprm.common.closeNotice.prLineAndCode').d('单号-行号'),
        },
        {
          name: 'restSourceQuantity',
          type: 'number',
          label: intl.get('sprm.common.closeNotice.restSourceQuantity').d('寻源链路'),
        },
        {
          name: 'restPoQuantity',
          type: 'number',
          label: intl.get('sprm.common.closeNotice.restPoQuantity').d('履约链路'),
        },
        {
          name: 'restQuantity',
          type: 'number',
          label: intl.get('sprm.common.closeNotice.restQuantity').d('剩余数量'),
        },
        {
          name: 'checkContectDoc',
          label: intl.get(`sprm.common.model.common.checkContectDoc`).d('执行单据'),
        },
      ],
      transport: {
        read: {
          url: `${SRM_SPRM}/v1/${organizationId}/purchase-requests/close-before/detail`,
          method: 'POST',
          data: params,
        },
      },
    };

    const closeTableDs = new DataSet(closeDs);

    // 函数组件调用到子组件的函数
    useImperativeHandle(ref, () => ({
      loadCurrentData,
      handleGetDeatial,
      saveCurrentData,
      ref: ref.current,
    }));

    const loadCurrentData = data => {
      remarkInfo.loadData([data]);
    };

    const handleGetDeatial = detailField => remarkInfo.get(detailField);

    const saveCurrentData = () => {
      return remarkInfo;
    };

    const fetchLineDetail = record => {
      const amountActiveTab = {
        reconciliationStatus: record.get('reconciliationAmount') > 0,
        paymentStatus: record.get('paymentAmount') > 0,
      };
      const activeTab = record.get('prExecutePointVOList')
        ? record
          .get('prExecutePointVOList')
          .filter(
            ele =>
              (ele.executeStatus && ele.executeStatus !== 'NOT_STARTED') ||
              amountActiveTab[ele.executePoint]
          )
          ?.map(ele => ele.executePoint)
        : [];
      return Modal.open({
        key: Modal.key(),
        drawer: true,
        title: intl.get('sprm.common.modal.contectDoc').d('关联单据'),
        bodyStyle: { padding: 0 },
        children: (
          <ContectDoc
            {...{
              prLineId: record.get('prLineId'),
              currentRecord: record,
              record,
              activeTab,
              originPage: 'closeTab',
              priceHiddenFlag: record.get('linePriceHiddenFlag'),
            }}
          />
        ),
        closable: true,
        movable: false,
        destroyOnClose: true,
        onOk: () => { },
        okText: intl.get('hzero.common.status.closed').d('关闭'),
        footer: okBtn => okBtn,
        style: { width: '1090px' },
      });
    };

    const cols = isOldUser
      ? [
        {
          name: 'restQuantity',
          renderer: ({ record }) =>
            record.get('executionStrategyCode') === 'SOURCE'
              ? record.get('restSourceQuantity')
              : record.get('restPoQuantity'),
        },
        {
          name: 'checkContectDoc',
          width: 150,
          renderer: ({ record }) => {
            const statusList =
              record
                ?.get('prExecutePointVOList')
                ?.filter(item => item?.executeStatus !== 'NOT_STARTED') || [];
            if (
              !(
                record.get('occupiedQuantity') ||
                record.get('orderOccupiedQuantity') ||
                record.get('sourceOccupiedQuantity') ||
                statusList?.length !== 0
              )
            ) {
              return undefined;
            } else {
              return (
                <a onClick={() => fetchLineDetail(record)}>
                  {intl.get('sprm.common.modal.checkContectDoc').d('查看执行单据')}
                </a>
              );
            }
          },
        },
      ]
      : [
        { name: 'restSourceQuantity', width: 120 },
        { name: 'restPoQuantity', width: 120 },
        {
          name: 'checkContectDoc',
          width: 150,
          renderer: ({ record }) => {
            const statusList =
              record
                ?.get('prExecutePointVOList')
                ?.filter(item => item?.executeStatus !== 'NOT_STARTED') || [];
            if (
              !(
                record.get('occupiedQuantity') ||
                record.get('orderOccupiedQuantity') ||
                record.get('sourceOccupiedQuantity') ||
                statusList?.length !== 0
              )
            ) {
              return undefined;
            } else {
              return (
                <a onClick={() => fetchLineDetail(record)}>
                  {intl.get('sprm.common.modal.checkContectDoc').d('查看执行单据')}
                </a>
              );
            }
          },
        },
      ];
    return (
      <div>
        {cusCode ? (
          customizeForm(
            {
              code: cusCode,
              __force_record_to_update__: true,
              dataSet: remarkInfo,
            },
            <Form dataSet={remarkInfo} useColon={false} labelLayout="float">
              <TextArea name="cancelledRemark" label={remarkLabel} resize="verticle" />
            </Form>
          )
        ) : (
          <Form dataSet={remarkInfo} useColon={false} labelLayout="float">
            <TextArea name="cancelledRemark" label={remarkLabel} resize="verticle" />
          </Form>
        )}
        {btnType === 'closedRemark' && (
          <Card
            bordered={false}
            className={classnames(DETAIL_CARD_TABLE_CLASSNAME, styles['sprm-remark'])}
            title={intl.get(`sprm.common.model.closeInfo.title`).d('采购申请关闭提醒')}
          >
            <div>
              <span className="sprm-remark-notice">
                {intl
                  .get('sprm.common.modal.closeNotice')
                  .d('存在申请单据数量未被执行完，请确认是否执行关闭。')}
              </span>
              <Table
                dataSet={closeTableDs}
                border={false}
                style={{ maxHeight: 'calc(100vh - 350px)' }}
                customizedCode="sprm_closeLine_remark_list"
                columns={[
                  {
                    name: 'prNum',
                    width: 200,
                    renderer: ({ record }) =>
                      `${record.get('displayPrNum')}-${record.get('displayLineNum')}`,
                  },
                  ...cols,
                ]}
              />
            </div>
          </Card>
        )}
      </div>
    );
  }
);

export default Remark;
