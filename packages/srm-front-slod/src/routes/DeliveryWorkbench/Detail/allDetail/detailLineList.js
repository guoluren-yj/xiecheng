import React, { Fragment, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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
    lineDs,
    change,
    docFlow,
    tplInfo,
    headerId,
    formDs,
    lineItemDs,
    attachmentDs,
    nodeConfigId,
    sourceFromPub,
    changeMarkFlag,
    nodeTemplateCode,
    customizeTable,
    customizeBtnGroup,
    doubleUnitEnabled,
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

  useEffect(() => {
    lineDs.setQueryParameter('params', {
      headerId,
      nodeConfigId,
      nodeTemplateCode,
    });
    lineDs.query();
  }, []);

  const splitLine = (record) => {
    const dataList = {
      ...record.toData(),
      asnLineId: null,
      planLineId: null,
      labelLineId: null,
      objectVersionNumber: null,
      changeSplitLineId:
        record?.get('asnLineId') || record?.get('planLineId') || record?.get('changeSplitLineId'),
      inventoryId:
        nodeTemplateCode === 'ASN'
          ? record?.get('inventoryId')?.locationId || record?.get('inventoryId')
          : record?.get('inventoryId'),
      locationId:
        nodeTemplateCode === 'ASN'
          ? record?.get('locationId')?.locationId || record?.get('locationId')
          : record?.get('locationId'),
    };
    lineDs.create(dataList, record.index + 1);
  };

  const onOpenLinkChange = (linesId, headersId, linkOrder = null, record) => {
    const basicProps = {
      linesId,
      tplInfo,
      docFlow,
      headersId,
      editor: false,
      nodeConfigId,
      campKey: 'p',
      nodeTemplateCode,
      type: linkOrder,
      customizeTable,
      customizeBtnGroup,
      lineRecord: record,
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
    change,
    lineDs,
    formDs,
    docFlow,
    tplInfo,
    lineItemDs,
    attachmentDs,
    sourceFromPub,
    changeMarkFlag,
    customizeTable,
    nodeTemplateCode,
    doubleUnitEnabled,
    splitLine,
    onOpenLinkChange,
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
          readOnly: sourceFromPub ? false : !edit,
        },
        <FilterBarTable
          virtual
          virtualCell
          dataSet={lineDs}
          columns={columns({ ...colProps })}
          filterBarRef={(element) => {
            lineSearchRef.current = element;
          }}
          buttons={!isNil(change) && buttons()}
          style={{ maxHeight: `calc(100vh - 390px)` }}
          selectionMode={docFlow === 0 ? 'rowbox' : 'none'}
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
          filterBarConfig={{
            autoQuery: false,
            checkDataSetStatus: false,
            fields: remote
              ? remote.process('SLOD_ALL_DETAIL_REMOTE_PROCESS_QUERY_FIELDS', queryFields, {
                  nodeTemplateCode,
                })
              : queryFields,
          }}
        />
      )}
    </Fragment>
  );
});

export default labelLineList;
