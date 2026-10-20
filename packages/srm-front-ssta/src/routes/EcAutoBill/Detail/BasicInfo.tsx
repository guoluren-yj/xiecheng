import React, { useMemo, Fragment } from 'react';
import { observer } from 'mobx-react';
import type { DataSet } from 'choerodon-ui/pro';
import { Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import EditorForm from '../../Components/EditorForm';
import { statusTagRender } from '../../Components/StatusTag';
import DynamicAlertList from '../../Components/DynamicAlert/List'

interface BasicInfoProps
{
  headerDs: DataSet,
  updateFlag: boolean,
  createFlag: boolean,
  isPoAllFlag: boolean,
  isShowEditBtnFlag: boolean;
}

const BasicInfo = observer((props: BasicInfoProps) =>
{

  const {
    headerDs,
    updateFlag,
    createFlag,
    isPoAllFlag,
    isShowEditBtnFlag,
  } = props;

  const { autoCreateSrmBillFailedMsg, billStatus, autoCreateSrmBillFailedFlag } =
    headerDs?.current?.get([
      'autoCreateSrmBillFailedMsg',
      'billStatus',
      'autoCreateSrmBillFailedFlag',
    ]) || {};

  const editorColumns = useMemo(() =>
  {
    return [
      'autoBillNum',
      'companyNum',
      { name: 'companyLov', editor: Lov, disabled: updateFlag },
      'supplierCompanyNum',
      {
        name: 'supplierCompanyLov',
        editor: Lov,
        disabled: updateFlag,
        renderer: ({ record, value }) => createFlag ? value?.displaySupplierName : record?.get('supplierCompanyName'),
      },
      { name: 'currencyCode', editor: Lov, disabled: updateFlag },
      { name: 'ecBillLov', editor: Lov, disabled: updateFlag },
      {
        name: 'billStatus',
        disabled: true,
        renderer: updateFlag || createFlag ? ({ text }) => text : statusTagRender,
      },
      'ecBillDimension',
      isPoAllFlag && "billingDate",
      isPoAllFlag && "finalPayDate",
    ];
  }, [updateFlag, createFlag, isPoAllFlag]);

  return (
    <Fragment>
      <DynamicAlertList
        dataSource={[
          {
            type: 'error',
            name: 'ecAutoAlert1',
            message: autoCreateSrmBillFailedMsg,
            showFlag: billStatus === 'AUTO_BILL_SUCCESS' && Number(autoCreateSrmBillFailedFlag) === 1,
          },
          {
            type: 'info',
            name: 'ecAutoAlert2',
            message: intl
              .get('ssta.ecAutoBill.view.message.alert.ecInfoWarning')
              .d(
                '当前单据显示的对账明细信息可能已过时，您可通过点击【获取电商账单/更新对账结果】按钮获取最新自动对账匹配结果'
              ),
            // 对账记录单状态=新建/自动对账失败/对账单审批退回/账单确认失败
            showFlag: isShowEditBtnFlag && ['NEW', 'AUTO_BILL_FAIL', 'BILL_RETURN', 'BILL_CONFIRM_FAIL'].includes(
              billStatus
            ),
          },
        ]}
      />
      <EditorForm
        useWidthPercent
        columns={3}
        useColon={false}
        dataSet={headerDs}
        editorFlag={updateFlag || createFlag}
        editorColumns={editorColumns}
      />
    </Fragment>
  );
});

export default BasicInfo;