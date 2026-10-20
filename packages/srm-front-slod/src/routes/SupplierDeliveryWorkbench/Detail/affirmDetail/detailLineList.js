import React, { Fragment, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import DynamicButtons from '_components/DynamicButtons';
import { fieldsFn } from '../../components/utils';
import columns from './columnsList';
import CustomLinkIndex from '../../../components/CustomModal';

import styles from '../index.less';

const labelLineList = forwardRef((props, ref) => {
  const {
    remote,
    lineDs,
    tplInfo,
    lineType,
    statusCode,
    btnLineFlag,
    nodeConfigId,
    customizeTable,
    nodeTemplateCode,
    customizeBtnGroup,
    lineDelete = (e) => e,
    queryList = (e) => e,
    changeStatus,
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
      const changedList =
        !isEmpty(dataSet?.selected) && dataSet.selected.map((item) => item.toJSONData());
      const changedFlag =
        changeStatus && changedList.length && changedList.some((i) => i.changedFlag === 1);
      // 在asn、plan存在changedFlag===1禁用
      const btns = [
        {
          name: 'delete',
          btnType: 'c7n-pro',
          hidden: !btnLineFlag && lineType !== 'left',
          child: (name) => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'delete_sweep',
            onClick: () => lineDelete(dataSet.selected, dataSet),
            disabled: changedFlag || isEmpty(dataSet?.selected) || lineType !== 'left',
          },
        },
      ];
      return customizeBtnGroup(
        {
          code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BTN_LINE_DETAIL_CONFIRM`,
          pro: true,
        },
        <DynamicButtons buttons={btns.filter((i) => !i.hidden)} />
      );
    });
    return [<Buttons dataSet={lineDs} />];
  };

  const colProps = {
    remote,
    tplInfo,
    lineType,
    customizeTable,
    nodeTemplateCode,
    splitLine,
    onOpenLinkChange,
    doubleUnitEnabled,
    ...props,
  };
  return (
    <Fragment>
      <div className={styles['table-list']}>
        {btnLineFlag && statusCode === 'PART_PROCESSED' && (
          <div className={styles['table-btn']}>
            <div
              onClick={() => queryList('left')}
              className={styles[lineType === 'left' ? 'table-btn-a-l-open' : 'table-btn-a-l']}
            >
              {intl.get('slod.deliveryWorkbench.model.common.untreated').d('待处理行')}
            </div>
            <div
              onClick={() => queryList('right')}
              className={styles[lineType === 'left' ? 'table-btn-a-r' : 'table-btn-a-r-open']}
            >
              {intl.get('slod.deliveryWorkbench.model.common.allList').d('全部行')}
            </div>
          </div>
        )}
        {customizeTable(
          {
            code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_LIST`,
            readOnly: lineType === 'right',
            __force_record_to_update__: true,
          },
          <FilterBarTable
            virtual
            virtualCell
            dataSet={lineDs}
            filterBarRef={(element) => {
              lineSearchRef.current = element;
            }}
            columns={columns({ ...colProps })}
            buttons={buttons()}
            style={{ maxHeight: `calc(100vh - 390px)` }}
            selectionMode={lineType === 'left' ? 'rowbox' : 'none'}
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
      </div>
    </Fragment>
  );
});

export default labelLineList;
