import React, { Fragment, useRef, forwardRef, useImperativeHandle } from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { isNil, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import DynamicButtons from '_components/DynamicButtons';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';

import columns from './columnsList';
import CustomLinkIndex from '../../../components/CustomModal';

const labelLineList = forwardRef((props, ref) => {
  const {
    edit,
    remote,
    change,
    lineDs,
    formDs,
    tplInfo,
    nodeConfigId,
    changeMarkFlag,
    nodeTemplateCode,
    customizeTable,
    doubleUnitEnabled,
    customizeBtnGroup,
  } = props;

  const lineSearchRef = useRef({});

  useImperativeHandle(ref, () => ({
    onResetLineChange,
  }));

  // 清除行查询条件
  const onResetLineChange = () => {
    if (!isEmpty(lineSearchRef?.current)) {
      // eslint-disable-next-line no-unused-expressions
      lineSearchRef?.current?.handleCleanFilter();
    }
  };

  const splitLine = (record) => {
    const dataList = {
      ...record.toData(),
      asnLineId: null,
      planLineId: null,
      labelLineId: null,
      objectVersionNumber: null,
      changeSplitLineId:
        record?.get('asnLineId') || record?.get('planLineId') || record?.get('changeSplitLineId'),
    };
    lineDs.create(dataList, record.index + 1);
  };

  const onOpenLinkChange = (linesId, headersId, linkOrder = null, otherParams = {}) => {
    const basicProps = {
      tplInfo,
      linesId,
      headersId,
      campKey: 's',
      editor: false,
      nodeConfigId,
      nodeTemplateCode,
      type: linkOrder,
      customizeTable,
      customizeBtnGroup,
      remoteNeedParams: otherParams,
    };
    const modal = Modal.open({
      drawer: true,
      style: { width: '852px' },
      children: <CustomLinkIndex {...basicProps} />,
      footer: (
        <Button color="primary" onClick={() => modal.close()}>
          {intl.get('hzero.common.status.closed').d('关闭')}
        </Button>
      ),
    });
  };

  const buttons = () => {
    const Buttons = observer(({ dataSet }) => {
      const btns = [
        {
          name: 'delete',
          btnType: 'c7n-pro',
          child: intl.get('hzero.common.button.enter').d('删除'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'delete',
            onClick: () => dataSet.remove(dataSet?.selected),
            disabled: isEmpty(dataSet?.selected),
          },
        },
      ];
      return <DynamicButtons buttons={btns.filter((i) => !i.hidden)} />;
    });
    return [<Buttons dataSet={lineDs} />];
  };

  const colProps = {
    edit,
    remote,
    lineDs,
    change,
    tplInfo,
    changeMarkFlag,
    customizeTable,
    nodeTemplateCode,
    doubleUnitEnabled,
    splitLine,
    onOpenLinkChange,
    ...props,
  };

  const queryFields = [
    {
      name: 'itemCodeOrName',
      label: intl.get('slod.deliveryWorkbench.model.common.itemCodeOrName').d('物料编码，物料名称'),
      display: true,
      merge: true,
    },
  ];

  return (
    <Fragment>
      {customizeTable(
        {
          code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_LIST`,
          __force_record_to_update__: true,
          readOnly: !edit,
        },
        <FilterBarTable
          virtual
          virtualCell
          dataSet={lineDs}
          filterBarRef={(element) => {
            lineSearchRef.current = element;
          }}
          columns={columns({ ...colProps })}
          buttons={
            remote
              ? remote.process(
                  'SLOD_DELIVERYWORKBENCH_DETAILS_ALLDETAILS_REMOTE_PROCESS_LINE_BTNS',
                  !isNil(change) && buttons(),
                  { edit, change, lineDs, formDs }
                )
              : !isNil(change) && buttons()
          }
          style={{ maxHeight: `calc(100vh - 390px)` }}
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
          filterBarConfig={{
            autoQuery: false,
            checkDataSetStatus: false,
            fields: remote
              ? remote.process(
                  'SLOD_SUPPLIER_ALL_DETAIL_REMOTE_PROCESS_QUERY_FIELDS',
                  queryFields,
                  {
                    nodeTemplateCode,
                  }
                )
              : queryFields,
          }}
        />
      )}
    </Fragment>
  );
});

export default labelLineList;
