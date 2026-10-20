import React, { Fragment, useMemo, useEffect, useState } from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { compose, isEmpty, isNil } from 'lodash';
import { observer } from 'mobx-react-lite';
import { parse } from 'querystring';

import intl from 'utils/intl';
// import request from 'hzero-front/lib/utils/request';
// import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import cuxRemote from 'hzero-front/lib/utils/remote';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, getUserOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { handLink } from '@/services/ReceipWorkbenchService';

import { indexDataSet } from './indexDS';

// const STAGE_CODE = 'WORKFLOW';

const tenantId = getUserOrganizationId();
const CustomLinkIndex = (props) => {
  const {
    from,
    remote,
    // tplInfo={},
    type = null,
    header = null,
    chart = false,
    rcvStatusCode,
    returnedFlag = null, // 退货标识
    rcvTrxLineId = null,
    rcvTrxHeaderId = null,
    customizeTable,
    customizeBtnGroup,
    nodeConfigIndexAbc,
    href = '',
    externalSystem,
    workflowTemplateProps = {},
  } = props;
  const search = href.substr(href.indexOf('?'), href.length);
  const {
    edit = 0,
    type: typeOf = null,
    header: headerFlag = null, // 头行标识 0 行 1 头
    returnedFlag: lineFlag = null, // 退货标识 0 收货 1退货
    rcvTrxLineId: lineId = null, // 事务行id
    rcvTrxHeaderId: headerId = null, // 事务头id
    nodeConfigIndex = null,
  } = parse(search?.substr(1));
  const { custLoadTransformResponse } = remote?.props?.process || {};
  const custLetter = String.fromCharCode(65 + Number(nodeConfigIndex));
  const [loading, setLoading] = useState(false);
  const indexDs = useMemo(() => new DataSet(indexDataSet(custLoadTransformResponse)), []);
  // const tplInfo = useMemo(() => ({ current: null }), []);

  const columns = [];
  const { customizeCode, customizeBtn } = useMemo(() => {
    if (
      (Number(headerFlag) === 1 || header === 1) &&
      (Number(lineFlag) === 1 || returnedFlag === 1)
    ) {
      return {
        customizeCode: `SINV.RECEIPT_WORKBENCH_THING.MODAL.HD.RETURN_${Number(typeOf) || type}.${
          !isNil(nodeConfigIndex) ? custLetter : nodeConfigIndexAbc
        }`,
        customizeBtn: `SINV.RECEIPT_WORKBENCH_THING.MODAL.RETURN_HD.BTN${Number(typeOf) || type}.${
          !isNil(nodeConfigIndex) ? custLetter : nodeConfigIndexAbc
        }`,
      };
    }
    if (
      (Number(headerFlag) === 0 || header === 0) &&
      (Number(lineFlag) === 1 || returnedFlag === 1)
    ) {
      return {
        customizeCode: `SINV.RECEIPT_WORKBENCH_THING.MODAL.RETURN_${Number(typeOf) || type}.${
          !isNil(nodeConfigIndex) ? custLetter : nodeConfigIndexAbc
        }`,
        customizeBtn: `SINV.RECEIPT_WORKBENCH_THING.MODAL.RETURN_BTN${Number(typeOf) || type}.${
          !isNil(nodeConfigIndex) ? custLetter : nodeConfigIndexAbc
        }`,
      };
    }
    if (
      (Number(headerFlag) === 1 || header === 1) &&
      (Number(lineFlag) === 0 || returnedFlag === 0)
    ) {
      return {
        customizeCode: `SINV.RECEIPT_WORKBENCH_THING.MODAL.HD.DELIVERY_${Number(typeOf) || type}.${
          !isNil(nodeConfigIndex) ? custLetter : nodeConfigIndexAbc
        }`,
        customizeBtn: `SINV.RECEIPT_WORKBENCH_THING.MODAL.DELIVERY_HD.BTN${
          Number(typeOf) || type
        }.${!isNil(nodeConfigIndex) ? custLetter : nodeConfigIndexAbc}`,
      };
    }
    if (
      (Number(headerFlag) === 0 || header === 0) &&
      (Number(lineFlag) === 0 || returnedFlag === 0)
    ) {
      return {
        customizeCode: `SINV.RECEIPT_WORKBENCH_THING.MODAL.DELIVERY_${Number(typeOf) || type}.${
          !isNil(nodeConfigIndex) ? custLetter : nodeConfigIndexAbc
        }`,
        customizeBtn: `SINV.RECEIPT_WORKBENCH_THING.MODAL.DELIVERY_BTN${Number(typeOf) || type}.${
          !isNil(nodeConfigIndex) ? custLetter : nodeConfigIndexAbc
        }`,
      };
    }
  }, [type, typeOf, nodeConfigIndex, nodeConfigIndex]);

  // 手动调用个性化
  useEffect(() => {
    if (chart) {
      // const templateInfoPromise = request(`${SRM_SPUC}/v1/customize/template-cusz`, {
      //   method: 'POST',
      //   body: {
      //     templateCuszMethodCode: `SPUC_SINV_WORKSPACE_WORKFLOW_DETAIL`,
      //     businessParam: {
      //       rcvTrxHeaderId,
      //     },
      //   },
      // }).then((res) => {
      //   if (getResponse(res)) {
      //     tplInfo.current = {
      //       ...res,
      //       cuszTplStageCode: STAGE_CODE,
      //       cuszTplPageCode: 'DELIVERY_WORKBENCH.DETAIL_WORKS',
      //       templateCode: workflowTemplateProps?.templateCode || res.templateCode,
      //       templateVersion: workflowTemplateProps?.templateVersion || res.templateVersion,
      //     };
      //     if (res.useTemplateCusz) {
      //       const workflowParams = {
      //         stageCode: workflowTemplateProps?.stageCode,
      //         pageCode: workflowTemplateProps?.pageCode,
      //         templateCode: workflowTemplateProps?.templateCode,
      //         templateVersion: workflowTemplateProps?.templateVersion,
      //       };
      //       props.queryTemplateConfig(templateInfoPromise, workflowParams);
      //     } else {
      //       props.queryUnitConfig(undefined, null, [
      //         `SINV.RECEIPT_WORKBENCH_WORKFLOW.CUSZ_${Number(typeOf) || type}`,
      //         `SINV.RECEIPT_WORKBENCH_WORKFLOW.CUSZ_BTN${Number(typeOf) || type}`,
      //       ]);
      //     }
      //     return res;
      //   }
      //   return {};
      // });
      if (workflowTemplateProps) {
        const workflowParams = {
          stageCode: workflowTemplateProps?.stageCode,
          pageCode: workflowTemplateProps?.pageCode,
          templateCode: workflowTemplateProps?.templateCode,
          templateVersion: workflowTemplateProps?.templateVersion,
        };
        props.queryTemplateConfig(
          Promise.resolve({
            templateVersion: workflowTemplateProps?.templateVersion,
            templateCode: workflowTemplateProps?.templateCode,
          }),
          workflowParams
        );
      } else {
        props.queryUnitConfig(undefined, null, [
          `SINV.RECEIPT_WORKBENCH_WORKFLOW.CUSZ_${Number(typeOf) || type}`,
          `SINV.RECEIPT_WORKBENCH_WORKFLOW.CUSZ_BTN${Number(typeOf) || type}`,
        ]);
      }
    } else {
      props.queryUnitConfig(undefined, null, [customizeCode, customizeBtn]);
    }
  }, [search]);

  useEffect(() => {
    try {
      setLoading(true);
      indexDs.setQueryParameter('params', {
        type: Number(typeOf) || type,
        rcvTrxHeaderId: headerId || rcvTrxHeaderId,
        rcvTrxLineId: Number(headerFlag) === 1 || header === 1 ? null : lineId || rcvTrxLineId,
        customizeUnitCode: customizeCode,
        headerOrlineFlag: Number(headerFlag) === 1 || header === 1,
      });
      indexDs.query();
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  }, [search]);

  const onDeleteChange = (seleced, ds) => {
    const lineList = seleced.map((item) => item.toData());
    const trxExtId = lineList.some((item) => {
      if (Number(headerFlag) === 1 || header === 1) {
        return item.trxHeaderExtId;
      } else {
        return item.trxLineExtId;
      }
    });
    if (trxExtId) {
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
              methods: 'DELETE',
              data: lineList,
              customizeUnitCode: customizeCode,
              headerOrlineFlag: Number(headerFlag) === 1 || header === 1,
            });
            if (getResponse(res)) {
              indexDs.remove(seleced, true);
              notification.success();
              indexDs.query();
            } else {
              indexDs.remove(seleced, true);
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
          methods: 'POST',
          data: ds.toData(),
          customizeUnitCode: customizeCode,
          headerOrlineFlag: Number(headerFlag) === 1 || header === 1,
        });
        if (getResponse(res)) {
          notification.success();
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
    if (type === 2) {
      dataSet.create(
        {
          tenantId,
          type: Number(typeOf) || type,
          rcvTrxHeaderId: headerId || rcvTrxHeaderId,
          rcvTrxLineId: Number(headerFlag) === 1 || header === 1 ? null : lineId || rcvTrxLineId,
        },
        0
      );
    } else {
      dataSet.create(
        {
          tenantId,
          type: Number(typeOf) || type,
          rcvTrxHeaderId: headerId || rcvTrxHeaderId,
          rcvTrxLineId: Number(headerFlag) === 1 || header === 1 ? null : lineId || rcvTrxLineId,
        },
        dataSet.records.length
      );
    }
  };

  const columnList = () => {
    if (
      remote &&
      typeof remote?.props?.process?.renderLinkLineColumns === 'function' &&
      type === 1 &&
      nodeConfigIndexAbc === 'A' &&
      rcvTrxLineId
    ) {
      const { renderLinkLineColumns } = remote?.props?.process;
      return renderLinkLineColumns(columns, {
        workflowTemplateProps,
      });
    }
    return remote
      ? remote.process('SINV_LINK_ONE_REMOTE_PROCESS_COLUMN', columns, { workflowTemplateProps })
      : columns;
  };

  const LineBtn = observer(({ dataSet }) => {
    return (
      <>
        {customizeBtnGroup(
          {
            code: !chart
              ? customizeBtn
              : `SINV.RECEIPT_WORKBENCH_WORKFLOW.CUSZ_BTN${Number(typeOf) || type}`,
          },
          [
            <Button
              icon="playlist_add"
              data-name="add"
              loading={loading}
              funcType="flat"
              color="primary"
              onClick={() => onChangeAdd(dataSet)}
              disabled={
                rcvStatusCode === '20_SUBMITTED' ||
                rcvStatusCode === '35_PUBLISH' ||
                from === 'three' ||
                (!externalSystem && rcvStatusCode === '30_SUP_REJECTED')
              }
              style={{ border: 'none', color: '#29BECE' }}
            >
              {intl.get(`hzero.common.button.add`).d('新增')}
            </Button>,
            <Button
              icon="save"
              data-name="save"
              loading={loading}
              color="primary"
              funcType="flat"
              disabled={
                rcvStatusCode === '20_SUBMITTED' ||
                rcvStatusCode === '35_PUBLISH' ||
                from === 'three' ||
                (!externalSystem && rcvStatusCode === '30_SUP_REJECTED')
              }
              onClick={() => onSaveChange(dataSet)}
              style={{ border: 'none', color: '#29BECE' }}
            >
              {intl.get(`hzero.common.button.save`).d('保存')}
            </Button>,
            <Button
              icon="delete_sweep"
              data-name="delete"
              color="primary"
              funcType="flat"
              loading={loading}
              disabled={
                rcvStatusCode === '20_SUBMITTED' ||
                rcvStatusCode === '35_PUBLISH' ||
                from === 'three' ||
                (!externalSystem && rcvStatusCode === '30_SUP_REJECTED') ||
                isEmpty(dataSet?.selected)
              }
              onClick={() => onDeleteChange(dataSet.selected, dataSet)}
              style={{ border: 'none', color: '#29BECE' }}
            >
              {intl.get(`hzero.common.button.batchdelete`).d('删除')}
            </Button>,
          ]
        )}
      </>
    );
  });

  return (
    <Fragment>
      {customizeTable(
        {
          code: !chart
            ? customizeCode
            : `SINV.RECEIPT_WORKBENCH_WORKFLOW.CUSZ_${Number(typeOf) || type}`,
          __force_record_to_update__: true,
          readOnly: !isNil(nodeConfigIndex)
            ? Number(edit) === 1
            : from === 'three' ||
              (from !== 'three' && rcvStatusCode === '20_SUBMITTED') ||
              chart ||
              rcvStatusCode === '35_PUBLISH',
        },
        <Table
          virtual
          virtualCell
          dataSet={indexDs}
          columns={columnList()}
          buttons={
            remote
              ? remote.process(
                  'SINV_LINK_ONE_REMOTE_PROCESS_BTN',
                  [
                    (!chart ||
                      (!isNil(nodeConfigIndex)
                        ? Number(edit) === 0
                        : from !== 'three' && rcvStatusCode !== '20_SUBMITTED')) && (
                      <LineBtn dataSet={indexDs} />
                    ),
                  ],
                  {
                    loading,
                    onSaveChange,
                    dataSet: indexDs,
                    workflowTemplateProps,
                  }
                )
              : [
                  (!chart ||
                    (!isNil(nodeConfigIndex)
                      ? Number(edit) === 0
                      : from !== 'three' && rcvStatusCode !== '20_SUBMITTED')) && (
                    <LineBtn dataSet={indexDs} />
                  ),
                ]
          }
        />
      )}
    </Fragment>
  );
};
export default compose(
  // 手动调用个性化
  WithCustomize({ isTemplate: true }),
  formatterCollections({
    code: ['sinv.common', 'slod.deliveryWorkbench'],
  }),
  cuxRemote(
    {
      code: 'SINV_LINK_ONE_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        renderLinkLineColumns: undefined,
      },
    }
  )
)(CustomLinkIndex);
