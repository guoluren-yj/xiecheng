import { DataSet, Modal, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
// import { Tag } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { isFunction } from 'lodash';
import { Button } from 'components/Permission';
import React, { Fragment, useImperativeHandle, useMemo, useRef } from 'react';
import { lineCancel } from '@/services/RequisitionPlanServices.js';
import { colorRender } from '@/routes/RequisitionPlan/util';
import { lineDs } from '../indexDS';
import Remark from './Remark';

const Index = React.forwardRef(
  (
    {
      rpHeaderId,
      commonUpdate,
      handleDetailField,
      customizeTable,
      headerInfo,
      code,
      searchCode,
      modalRpHeaderId,
      pubPathFlag,
      remote,
    },
    ref
  ) => {
    const lineRemarkRef = useRef({});
    const lineTableDs = useMemo(
      () =>
        new DataSet({
          ...lineDs({
            rpHeaderId,
            handleDetailField,
            customizeUnitCode: `${code},${searchCode}`,
            itemLimitRule: [],
            pubPathFlag,
          }),
        }),
      [rpHeaderId]
    );

    const colorFormRender = ({ record, value }) => {
      if (record?.get('rpLineStatus')) {
        const Dom = colorRender(value, record.get('rpLineStatusMeaning'));
        return Dom;
      }
      if (record?.get('syncStatus')) {
        const Dom = colorRender(value, record.get('syncStatusMeaning'));
        return Dom;
      }
    };

    const lineColumns = () => {
      const columns = [
        {
          name: 'displayLineNum',
          width: 100,
        },
        { name: 'rpLineStatus', width: 120, renderer: colorFormRender },
        {
          name: 'invOrganizationId',
          width: 180,
        },
        {
          name: 'itemCode',
          width: 150,
        },
        {
          name: 'itemName',
          width: 180,
        },
        {
          name: 'categoryId',
          width: 150,
        },
        {
          name: 'itemModel',
          width: 100,
        },
        {
          name: 'itemSpecs',
          width: 100,
        },
        {
          name: 'uomId',
          width: 120,
        },
        {
          name: 'neededDate',
          width: 150,
        },
        {
          name: 'quantity',
          width: 100,
        },
        {
          name: 'taxId',
          width: 100,
        },
        {
          name: 'taxRate',
          width: 100,
        },
        {
          name: 'taxIncludedUnitPrice',
          width: 120,
        },
        {
          name: 'unitPrice',
          width: 120,
        },
        {
          name: 'taxIncludedLineAmount',
          width: 120,
        },
        {
          name: 'lineAmount',
          width: 120,
        },
        {
          name: 'localCurrencyNoTaxSum',
          width: 120,
        },
        {
          name: 'localCurrencyNoTaxUnit',
          width: 120,
        },
        {
          name: 'localCurrencyTaxSum',
          width: 120,
        },
        {
          name: 'localCurrencyTaxUnit',
          width: 120,
        },
        {
          name: 'remark',
          width: 180,
        },
        {
          name: 'attachmentUuid',
          width: 120,
        },
      ];
      const { cuxColsFc } = remote?.props?.process ?? {};
      const cuxColsList = isFunction(cuxColsFc) ? cuxColsFc({ columns, pageForm: 'readOnly' }) : columns;
      return cuxColsList;
    };

    const loadLineDate = async (currentId) => {
      if (loadLineDate) {
        lineTableDs.setQueryParameter('currentId', currentId);
        lineTableDs.setQueryParameter('currentId', currentId);
      }
      await lineTableDs.query();
    };

    const saveCurrentData = () => {
      return lineTableDs;
    };

    // 函数组件调用到子组件的函数
    useImperativeHandle(ref, () => ({
      loadLineDate,
      saveCurrentData,
      ref: ref.current,
    }));

    const handleLineCancel = async () => {
      return Modal.open({
        key: Modal.key(),
        title: intl.get(`srpm.common.view.message.cancelReason`).d('取消原因'),
        children: (
          <Remark
            rpHeaderId={rpHeaderId}
            ref={lineRemarkRef}
            required
            remarkLabel={intl.get(`srpm.common.view.message.cancelReason`).d('取消原因')}
          />
        ),
        drawer: true,
        closable: true,
        onOk: async () => {
          const { selected } = lineTableDs;
          const cancelLines = selected.map((ele) => ele.toJSONData());
          const remarkCurrent = lineRemarkRef?.current?.saveCurrentData();
          const validateFlag = await remarkCurrent.validate();
          if (validateFlag) {
            const [{ cancelRemark }] = remarkCurrent.toJSONData();
            // setCancelLoading(true);
            const result = getResponse(await lineCancel({ cancelLines, cancelRemark }));
            if (result) {
              commonUpdate();
              notification.success();
            }
          } else {
            return false;
          }
        },
        movable: false,
        destroyOnClose: true,
        onCancel: () => { },
        style: { width: '380px' },
      });
    };

    const CancelLineBtn = observer((props) => {
      const { selected } = lineTableDs;
      return (
        <Button
          {...props}
          disabled={
            selected.length === 0 || selected.some((ele) => ele.get('rpLineStatus') !== 'APPROVED')
          }
        />
      );
    });

    const listAttributes = remote?.process('SRPM_CREATER_REQUISITION_PLAN.LINE_Attributes', {}, { currentPage: 'readOnly', lineTableDs });


    return (
      <Fragment>
        {customizeTable(
          {
            code, // 必传，和unitCode一一对应
            dataSet: lineTableDs,
            custLoading: false,
          },
          <SearchBarTable
            searchCode={searchCode}
            searchBarConfig={{
              autoQuery: false,
              expandable: !!(
                headerInfo?.cancelStatusCode !== 'CANCELLED' &&
                headerInfo?.rpStatus === 'APPROVED' &&
                !modalRpHeaderId
              ),
              closeFilterSelector: true,
            }}
            style={{ maxHeight: '450px' }}
            dataSet={lineTableDs}
            columns={lineColumns()}
            data={[]}
            selectionMode={
              headerInfo?.cancelStatusCode !== 'CANCELLED' &&
                headerInfo?.rpStatus === 'APPROVED' &&
                !modalRpHeaderId
                ? 'rowbox'
                : 'none'
            }
            buttons={
              headerInfo?.cancelStatusCode !== 'CANCELLED' &&
                headerInfo?.rpStatus === 'APPROVED' &&
                !modalRpHeaderId
                ? [
                  <Tooltip
                    placement="topLeft"
                    title={intl
                      .get('srpm.common.view.message.lineCancelRule')
                      .d('仅可取消审批行')}
                  >
                    <CancelLineBtn
                      key="cancelLine"
                      onClick={handleLineCancel}
                      permissionList={[
                        {
                          code: `hzero.srm.requirement.requisition.plan.rp-platform.ps.line.cancel`,
                          type: 'button',
                        },
                      ]}
                      icon="cancel"
                      funcType="flat"
                      type="c7n-pro"
                      color="primary"
                    >
                      {intl.get(`hzero.common.button.cancel`).d('取消')}
                    </CancelLineBtn>
                  </Tooltip>,
                ]
                : null
            }
            {...(listAttributes || {})}
          />
        )}
      </Fragment>
    );
  }
);

export default Index;
