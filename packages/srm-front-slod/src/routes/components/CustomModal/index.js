/*
 * @Description: CustomLinkIndex
 * @Date: 2022-08-09 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, useMemo, useEffect, useState } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { compose, isEmpty, isNil } from 'lodash';
import { observer } from 'mobx-react-lite';
import { parse } from 'querystring';
import cuxRemote from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { handLink } from '@/services/DeliveryWorkbenchServices';
import DynamicButtons from '_components/DynamicButtons';
import { indexDataSet } from './indexDS';

const tenantId = getCurrentOrganizationId();

/*
 * tplInfo 明细页面个性化参数对象,
 * docFlow 判断页面是否单据流进入 是 1 否 0,
 * isForm / isForms 判断页面是否是从表单进入 是 any 否 null,
 */
const CustomLinkIndex = (props) => {
  const {
    remote,
    isForm = null,
    campKey = null,
    editor = null,
    href = '',
    lineRecord = null,
    type = null,
    linesId,
    docFlow = 0,
    tplInfo = {},
    headersId,
    customizeTable,
    customizeBtnGroup,
    nodeConfigId = null,
    nodeTemplateCode = null,
    remoteNeedParams = {},
  } = props;
  const search = href.substr(href.indexOf('?'), href.length);
  const {
    edit = 0,
    lineId = null,
    isForms = null,
    headerId = null,
    type: typeOf = null,
    campKey: campKeys = null,
    nodeConfigId: nodeId = null,
    nodeTemplateCode: nodeCode = null,
  } = parse(search?.substr(1));
  const [loading, setLoading] = useState(false);
  const letter = String.fromCharCode(65 + ((Number(typeOf) || type) - 1));
  const ids = isForms || isForm ? 'deliveryHeaderExtId' : 'deliveryLineExtId';
  const _params = {
    id: ids,
    unitCode:
      isForms || isForm
        ? `SLOD.DELIVERY__WORKBENCH_${nodeCode || nodeTemplateCode}_A.MODAL_${letter}.FORM`
        : `SLOD.DELIVERY__WORKBENCH_${nodeCode || nodeTemplateCode}_A.MODAL_${letter}`,
  };
  const indexDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SLOD_LINK_ONE_REMOTE_PROCESS_DS',
              indexDataSet(_params),
              remoteNeedParams
            )
          : indexDataSet(_params)
      ),
    []
  );
  const columns = [];

  useEffect(() => {
    const name = isForms || isForm ? 'deliveryHeaderId' : 'deliveryLineId';
    try {
      setLoading(true);
      indexDs.setQueryParameter('params', {
        isForm: isForms || isForm,
        type: Number(typeOf) || type,
        campKey: campKeys || campKey,
        nodeConfigId: nodeId || nodeConfigId,
        nodeTemplateCode: nodeCode || nodeTemplateCode,
        [name]: isForms || isForm ? headerId || headersId : lineId || linesId,
      });
      indexDs.setQueryParameter('tplInfo', tplInfo);
      indexDs.clearCachedSelected();
      indexDs.unSelectAll();
      indexDs.query();
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const onDeleteChange = (seleced, ds) => {
    const lineList = seleced.map((item) => item.toData());
    const deliveryExtId = lineList.some((item) => item[ids]);
    const lineData = lineList.filter((item) => item[ids]);
    if (deliveryExtId) {
      Modal.confirm({
        contentStyle: { width: '550px' },
        title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
        children: (
          <div>
            <p>{intl.get('slod.deliveryWorkbench.view.message.orderDel').d(`确认删除选中行？`)}</p>
          </div>
        ),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: async () => {
          try {
            setLoading(true);
            const res = await handLink({
              tplInfo,
              isForm: isForms || isForm,
              campKey: campKeys || campKey,
              nodeConfigId: nodeId || nodeConfigId,
              nodeTemplateCode: nodeCode || nodeTemplateCode,
              methods: 'DELETE',
              data: lineData,
              unitCode:
                isForms || isForm
                  ? `SLOD.DELIVERY__WORKBENCH_${nodeCode ||
                      nodeTemplateCode}_A.MODAL_${letter}.FORM`
                  : `SLOD.DELIVERY__WORKBENCH_${nodeCode || nodeTemplateCode}_A.MODAL_${letter}`,
            });
            if (getResponse(res)) {
              notification.success();
              indexDs.clearCachedSelected();
              indexDs.unSelectAll();
              indexDs.query();
            }
          } catch (e) {
            throw e;
          } finally {
            setLoading(false);
          }
        },
      });
    } else {
      ds.remove(seleced);
    }
  };

  const onSaveChange = async (ds) => {
    const flag = await ds.validate();
    if (flag) {
      try {
        setLoading(true);
        const res = await handLink({
          methods: 'PUT',
          data: ds.toData(),
          tplInfo,
          isForm: isForms || isForm,
          campKey: campKeys || campKey,
          nodeConfigId: nodeId || nodeConfigId,
          nodeTemplateCode: nodeCode || nodeTemplateCode,
          unitCode:
            isForms || isForm
              ? `SLOD.DELIVERY__WORKBENCH_${nodeCode || nodeTemplateCode}_A.MODAL_${letter}.FORM`
              : `SLOD.DELIVERY__WORKBENCH_${nodeCode || nodeTemplateCode}_A.MODAL_${letter}`,
        });
        if (getResponse(res)) {
          notification.success();
          indexDs.clearCachedSelected();
          indexDs.unSelectAll();
          indexDs.query();
        }
      } catch (e) {
        throw e;
      } finally {
        setLoading(false);
      }
    }
  };

  const onChangeAdd = (dataSet) => {
    dataSet.create(
      {
        tenantId,
        type: Number(typeOf) || type,
        deliveryHeaderId: headerId || headersId,
        deliveryLineId: lineId || linesId,
      },
      0
    );
  };

  const saveHidden =
    ['LABEL', 'UNIQUE_LABEL'].includes(nodeCode || nodeTemplateCode) &&
    !(!isNil(nodeId) ? Number(edit) !== 1 : editor);

  const hiddenTableButtons = (isForms || isForm) && !editor;

  const remoteHiddenTableButtons = remote
    ? remote?.process('remoteTableButtonVisible', hiddenTableButtons, {})
    : hiddenTableButtons;

  const Buttons = observer(({ dataSet }) => {
    const btns = [
      {
        name: 'add',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.add`).d('新增'),
        hidden:
          ['LABEL', 'UNIQUE_LABEL'].includes(nodeCode || nodeTemplateCode) &&
          !(!isNil(nodeId) ? Number(edit) !== 1 : editor),
        btnProps: {
          funcType: 'flat',
          icon: 'add',
          onClick: () => onChangeAdd(dataSet),
          loading,
        },
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.save`).d('保存'),
        hidden: remote
          ? remote.process('remoteCustLinkLineButtonSaveHidden', saveHidden, {})
          : saveHidden,
        btnProps: {
          funcType: 'flat',
          icon: 'save',
          onClick: () => {
            if (remote && typeof remote?.props?.process?.custLinkLineSaveChange === 'function') {
              const { custLinkLineSaveChange } = remote?.props?.process;
              // const save = onSaveChange(dataSet);
              return custLinkLineSaveChange({ dataSet, callBack: onSaveChange });
            }
            onSaveChange(dataSet);
          },
          loading,
        },
      },
      {
        name: 'delete',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.enter').d('删除'),
        hidden:
          ['LABEL', 'UNIQUE_LABEL'].includes(nodeCode || nodeTemplateCode) &&
          !(!isNil(nodeId) ? Number(edit) !== 1 : editor),
        btnProps: {
          funcType: 'flat',
          icon: 'delete',
          onClick: () => onDeleteChange(dataSet.selected, dataSet),
          disabled: isEmpty(dataSet?.selected),
          loading,
        },
      },
    ];
    const cuxBtns = remote?.process('tableBtnRenderFn', btns, {
      type,
      isForm,
      dataSet,
      id: linesId,
      lineRecord,
      headerId,
      headersId,
      isForms,
      lineId,
      nodeCode,
      nodeTemplateCode,
    });
    return customizeBtnGroup(
      {
        code:
          isForms || isForm
            ? `SLOD.DELIVERY__WORKBENCH_${nodeCode || nodeTemplateCode}_A.MODAL.BTN_${letter}.FORM`
            : `SLOD.DELIVERY__WORKBENCH_${nodeCode || nodeTemplateCode}_A.MODAL.BTN_${letter}`,
        pro: true,
      },
      <DynamicButtons buttons={remoteHiddenTableButtons ? [] : cuxBtns} />
    );
  });

  const columnList = () => {
    if (remote && typeof remote?.props?.process?.renderLinkLineColumns === 'function') {
      const { renderLinkLineColumns } = remote?.props?.process;
      const types = (!isNil(nodeId) ? Number(edit) === 1 : !editor) ? 'readonly' : null;
      return renderLinkLineColumns(columns, types);
    }
    return columns;
  };

  const readOnly = !isNil(nodeId) ? Number(edit) === 1 : !editor;

  const remoteReadOnly = remote
    ? remote.process('remoteCustLinkLineTableReadOnly', readOnly, { nodeId, edit })
    : readOnly;
  return (
    <Fragment>
      {customizeTable(
        {
          code:
            isForms || isForm
              ? `SLOD.DELIVERY__WORKBENCH_${nodeCode || nodeTemplateCode}_A.MODAL_${letter}.FORM`
              : `SLOD.DELIVERY__WORKBENCH_${nodeCode || nodeTemplateCode}_A.MODAL_${letter}`,
          __force_record_to_update__: true,
          readOnly: remoteReadOnly,
        },
        <Table
          virtual
          virtualCell
          dataSet={indexDs}
          columns={columnList()}
          selectionMode={Number(docFlow) === 0 ? 'rowbox' : 'none'}
          buttons={[
            ['LABEL', 'UNIQUE_LABEL'].includes(nodeCode || nodeTemplateCode) &&
            Number(docFlow) === 0 ? (
              <Buttons dataSet={indexDs} />
            ) : // (!isNil(nodeId)? Number(edit) !== 1 && Number(docFlow) === 0: editor && Number(docFlow) === 0) && <Buttons dataSet={indexDs} />
            isForms || isForm ? (
              <Buttons dataSet={indexDs} />
            ) : (
              (!isNil(nodeId)
                ? Number(edit) !== 1 && Number(docFlow) === 0
                : editor && Number(docFlow) === 0) && <Buttons dataSet={indexDs} />
            ),
          ]}
        />
      )}
    </Fragment>
  );
};
export default compose(
  formatterCollections({
    code: ['slod.common'],
  }),
  cuxRemote(
    {
      code: 'SLOD_LINK_ONE_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        renderLinkLineColumns: undefined,
        tableBtnRenderFn: (btns) => btns,
      },
    }
  )
)(CustomLinkIndex);
