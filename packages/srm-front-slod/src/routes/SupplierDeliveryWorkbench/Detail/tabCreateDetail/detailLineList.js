import React, { Fragment, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button, Modal, Icon } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';

import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import DynamicButtons from '_components/DynamicButtons';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';

import { TooltipButton } from '../../../components/utils/utils';
import columns from './columnsList';
import { fieldsFn } from '../../components/utils';
import CustomLinkIndex from '../../../components/CustomModal';
import ServiceData from '../../../DeliveryWorkbench/components/ServiceData';
import styles from '../index.less';

const labelLineList = forwardRef((props, ref) => {
  const {
    remote,
    lineDs,
    tplInfo,
    nodeConfigId,
    customizeForm,
    customizeTable,
    nodeTemplateCode,
    customizeBtnGroup,
    loadingFlag = (e) => e,
    lineDelete = (e) => e,
    lineBuilder = (e) => e,
    handleSaveList = (e) => e,
    doubleUnitEnabled,
  } = props;
  const batchRef = useRef({});
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
    };
    if (
      record?.get(fieldsFn('lineNum', nodeTemplateCode)) &&
      record?.get(fieldsFn('id', nodeTemplateCode))
    ) {
      Object.assign(record, { selectable: false });
    }
    lineDs.create(dataList, record.index + 1);
  };

  const onOpenLinkChange = (linesId, headersId, linkOrder = null, record, otherParams = {}) => {
    const basicProps = {
      linesId,
      tplInfo,
      headersId,
      campKey: 's',
      editor: true,
      nodeConfigId,
      nodeTemplateCode,
      type: linkOrder,
      customizeTable,
      customizeBtnGroup,
      lineRecord: record,
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

  const handleBatchMaintenance = () => {
    const batchProps = {
      lineDs,
      campKey: 's',
      loadingFlag,
      customizeForm,
      handleSaveList,
      nodeTemplateCode,
      doubleUnitEnabled,
    };
    const { selected } = lineDs;
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: '380px' },
      // bodyStyle: { padding: 0 },
      children: (
        <>
          <Alert
            className={styles['title-alert']}
            border={false}
            message={
              <div>
                <Icon type="help" />
                {!isEmpty(selected)
                  ? intl
                      .get(`slod.deliveryWorkbench.view.title.detail.batchModeHasCheck`, {
                        num: selected.length,
                      })
                      .d(`已勾选{num}条数据进行编辑`)
                  : intl
                      .get('slod.deliveryWorkbench.view.title.detail.modeEditAllData')
                      .d('针对全部数据进行批量编辑')}
              </div>
            }
            closable
          />
          <ServiceData ref={batchRef} {...batchProps} />
        </>
      ),
      title: intl.get(`sinv.receiptWorkbench.view.title.detail.modeEdit`).d('批量编辑'),
      onOk: () => batchRef.current?.handleBatchOk(),
    });
  };

  const buttons = () => {
    const Buttons = observer(({ dataSet }) => {
      const selected = dataSet.selected.map((item) => item.toData());
      const btns = [
        {
          name: 'batchEdit',
          btnComp: TooltipButton,
          child: (name) =>
            isEmpty(selected)
              ? name || intl.get(`sinv.receiptWorkbench.view.title.detail.modeEdit`).d('批量编辑')
              : name ||
                intl.get(`sinv.receiptWorkbench.view.title.detail.modeCheckEdit`).d('勾选批量编辑'),
          childFor: 'buttonText',
          btnProps: {
            tipTitle: !isEmpty(selected)
              ? intl
                  .get(`sinv.receiptWorkbench.view.title.detail.modeCheckEdit`)
                  .d('批量编辑勾选数据')
              : intl
                  .get('sinv.receiptWorkbench.view.title.detail.modeEditData')
                  .d('批量编辑全部数据'),
            btnProps: {
              funcType: 'flat',
              icon: 'mode_edit',
              color: 'primary',
              type: 'c7n-pro',
              onClick: handleBatchMaintenance,
            },
          },
        },
        {
          name: 'delete',
          btnType: 'c7n-pro',
          child: (name) => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'delete_sweep',
            onClick: () => lineDelete(dataSet.selected, dataSet),
            disabled: isEmpty(dataSet?.selected),
          },
        },
        {
          name: 'checkLabel',
          btnType: 'c7n-pro',
          hidden: nodeTemplateCode !== 'UNIQUE_LABEL',
          child: (name) =>
            name || intl.get(`slod.deliveryWorkbench.model.view.selectLabel`).d('勾选生成标签'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'add',
            onClick: () => lineBuilder(dataSet.selected, dataSet),
            disabled: isEmpty(dataSet?.selected),
          },
        },
      ];
      const button = remote
        ? remote.process('DELIVERY_WORKBENCH.DETAIL_LINE_LIST_BUTTONS', btns, {
            dataSet,
            type: 'merge', // 并单
            nodeTemplateCode,
            splitLine,
            camp: 'SUPPLIER',
          })
        : btns;
      return customizeBtnGroup(
        { code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BTN_LINE_DETAIL`, pro: true },
        <DynamicButtons buttons={button.filter((i) => !i.hidden)} />
      );
    });
    return [<Buttons dataSet={lineDs} />];
  };

  const colProps = {
    remote,
    nodeTemplateCode,
    splitLine,
    onOpenLinkChange,
    doubleUnitEnabled,
    ...props,
  };

  return (
    <Fragment>
      {customizeTable(
        {
          code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_LIST`,
          __force_record_to_update__: true,
        },
        <FilterBarTable
          virtual
          virtualCell
          dataSet={lineDs}
          buttons={buttons()}
          filterBarRef={(element) => {
            lineSearchRef.current = element;
          }}
          columns={columns({ ...colProps })}
          style={{ maxHeight: `calc(100vh - 390px)` }}
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
          filterBarConfig={{
            autoQuery: false,
            checkDataSetStatus: false,
            fields: [
              {
                name: 'itemCodeOrName',
                label: intl
                  .get('slod.deliveryWorkbench.model.common.itemCodeOrName')
                  .d('物料编码，物料名称'),
                display: true,
                merge: true,
              },
            ],
          }}
        />
      )}
    </Fragment>
  );
});

export default labelLineList;
