/*
 * @Description: 发货工作台-工作流（目前仅用于唯一标签）
 * @Date: 2021-12-25 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2023, Hand
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import qs from 'querystring';
import { compose } from 'lodash';
import intl from 'hzero-front/lib/utils/intl';
import { Content } from 'components/Page';
import notification from 'utils/notification';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import OperationRecord from '_components/OperationRecord';
import { AFBasic, AFExtra } from '_components/AFCards';

import { handWorkFlowSave } from '@/services/DeliveryWorkbenchServices';
import indexDataSet, { lineDataColumns } from '@/components/CustomWrapperDs';
import {
  workflowColumns,
  fetchHeaderChange,
  fetchLineChange,
  setCustCodeFunction,
} from './methods';
import styles from './index.less';

const WorkflowComponent = (props) => {
  const {
    onLoad,
    onFormLoaded,
    customizeCommon,
    customizeTable,
    customizeBtnGroup,
    location: { search },
    workflowTemplateProps = {},
  } = props;
  const { nodeTemplateCode = null, nodeConfigId = null, headerId = null } = qs.parse(
    search.substr(1)
  );
  const [businessKey, useBusinessKey] = useState(null);
  const tplInfo = useMemo(() => ({ current: null }), []);
  const [setCustNum, setWaitCustomize] = useState(0);

  useEffect(() => {
    tplInfo.current = {
      cuszTplStageCode: 'SUBMIT',
      cuszTplPageCode: 'DELIVERY_WORKBENCH.DETAIL',
      templateCode: workflowTemplateProps?.templateCode,
      templateVersion: workflowTemplateProps?.templateVersion,
    };
    if (workflowTemplateProps?.stageCode) {
      const workflowParams = {
        stageCode: workflowTemplateProps?.stageCode,
        pageCode: workflowTemplateProps?.pageCode,
        templateCode: workflowTemplateProps?.templateCode,
        templateVersion: workflowTemplateProps?.templateVersion,
      };
      props
        .queryTemplateConfig(
          Promise.resolve({
            templateVersion: workflowTemplateProps?.templateVersion,
            templateCode: workflowTemplateProps?.templateCode,
          }),
          workflowParams
        )
        .then(() => {
          setWaitCustomize(1);
        });
    } else {
      const custCode = setCustCodeFunction();
      const unitCodes = custCode?.split(',');
      props.queryUnitConfig(undefined, null, unitCodes).then(() => {
        setWaitCustomize(1);
      });
    }
  }, [headerId]);

  const { basicColumns = [], extraColumns = [], lineColumns = [] } = workflowColumns({
    doubleUnitEnabled: null,
    customizeTable,
    tplInfo,
  });
  const basicDs = useMemo(
    () =>
      new DataSet(
        indexDataSet({
          componentData: basicColumns,
          queryParams: null,
          selection: false,
          pageSize: 20,
          paging: true,
          read: fetchHeaderChange,
        })
      ),
    [headerId]
  );
  const extraDs = useMemo(
    () =>
      new DataSet(
        indexDataSet({
          componentData: extraColumns,
          queryParams: null,
          selection: false,
          pageSize: 20,
          paging: true,
        })
      ),
    [headerId]
  );
  const lineDs = useMemo(
    () =>
      new DataSet(
        indexDataSet({
          componentData: lineColumns,
          queryParams: null,
          selection: false,
          pageSize: 20,
          paging: true,
          read: fetchLineChange,
        })
      ),
    [headerId]
  );

  useEffect(() => {
    // 使用 onLoad 函.数注册 submit 回调函数
    onLoad({
      submit: workFlowApproval,
    });
  }, [onLoad, workFlowApproval]);

  // 工作流审批通过方法
  const workFlowApproval = useCallback(() => {
    return new Promise(async (resolve, reject) => {
      const headerFlag = await basicDs.validate();
      const lineFlag = await lineDs.validate();
      const custCode = setCustCodeFunction();
      const unitCodes = custCode?.split(',')?.join(',');
      const headerInfo = {
        ...basicDs?.current?.toJSONData(),
        deliveryLineDTOList: lineDs?.toJSONData(),
      };
      const param = {
        updateType: 2,
        unitCode: unitCodes,
        nodeTemplateCode,
        data: [headerInfo],
        tplInfo: tplInfo?.current || {},
      };
      if (headerFlag && lineFlag) {
        const res = await handWorkFlowSave(param);
        if (res && res.failed) {
          notification.error({ message: res.message });
          reject();
        } else {
          resolve();
        }
      } else {
        reject();
      }
    });
  }, [workflowTemplateProps, basicDs, lineDs]);

  useEffect(() => {
    try {
      basicDs.setQueryParameter('params', {
        headerId,
        campKey: 'p',
        nodeConfigId,
        nodeTemplateCode,
        allDetailFlag: 1,
        tplInfo: tplInfo.current,
      });
      lineDs.setQueryParameter('params', {
        headerId,
        campKey: 'p',
        nodeConfigId,
        nodeTemplateCode,
        tplInfo: tplInfo.current,
      });
      basicDs.query().then((res) => {
        if (res) {
          extraDs.loadData([res]);
          useBusinessKey(res?.businessKey);
        }
      });
      lineDs.query().then(() => {
        /**
       1.onFormLoaded 方法用于控制审批按钮是否可点击，传参 true 表示可点击
        2.注册了submit回调函数的话，onFormLoaded必传
        3.onFormLoaded应在表单加载完成后调用
        4.设置了customSubmit为true时，必须要调用onFormLoaded方法！
      */
        if (onFormLoaded) {
          onFormLoaded(true);
        }
      });
    } catch (e) {
      throw e;
    }
  }, [setCustNum]);

  const contentBottomRender = useCallback(() => {
    const BtnOption = (btns) => {
      const name =
        btns?.children || intl.get('slod.deliveryWorkbench.model.view.btnOption').d('操作记录');
      return (
        <OperationRecord
          type="c7n-pro"
          btnType="button"
          color="#000"
          funcType="flat"
          icon="assignment"
          tableName="slod_label_header"
          tablePk={headerId}
          businessKey={businessKey}
          btnText={name}
          commentRecordFlag
          commentStartFlag
        />
      );
    };
    const buttons = [
      {
        name: 'operating',
        btnComp: BtnOption,
      },
    ];
    return (
      <div className="content-bottom-render">
        <div>
          {customizeBtnGroup(
            { code: `SLOD.DELIVERY__WORKBENCH_WORKFLOW.${nodeTemplateCode}.BTN`, pro: true },
            <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />
          )}
        </div>
      </div>
    );
  }, [customizeBtnGroup, businessKey]);

  return (
    <>
      <div className={styles['approval-form']}>
        {customizeCommon(
          {
            code: `SLOD.DELIVERY__WORKBENCH_WORKFLOW.${nodeTemplateCode}.BASIC`,
            processUnitTag: 'AF-BASIC',
          },
          <AFBasic
            dataSet={basicDs}
            titleField="displayLabelNum"
            tagFields={['statusCodeMeaning']}
            normalFields={['createdName', 'createCampCodeMeaning', 'creationDate']}
            // fieldsConfig={basicFieldsConfig}
            contentRemainWidth="25%"
            // contentRemainRender={contentRemainRender}
            contentBottomRender={contentBottomRender}
          />
        )}
        {customizeCommon(
          {
            code: `SLOD.DELIVERY__WORKBENCH_WORKFLOW.${nodeTemplateCode}.EXTRA`,
            processUnitTag: 'AF-EXTRA',
          },
          <AFExtra
            dataSet={extraDs}
            fields={['companyName', 'supplierCompanyName', 'purchaseRemark', 'supplierRemark']}
          />
        )}
        <Content>
          <h3>{intl.get(`slod.deliveryWorkbench.view.title.lineList`).d('明细信息')}</h3>
          {customizeTable(
            { code: `SLOD.DELIVERY__WORKBENCH_WORKFLOW.${nodeTemplateCode}.LINE` },
            <Table
              dataSet={lineDs}
              columns={lineDataColumns(lineColumns)}
              style={{ maxHeight: '550px' }}
              virtual
              virtualCell
            />
          )}
        </Content>
      </div>
    </>
  );
};

export default compose(
  // useDoubleUomConfig(),
  WithCustomize({ isTemplate: true }),
  formatterCollections({
    code: [
      'sinv.common',
      'hzero.common',
      'slod.deliveryWorkbench',
      'slod.common',
      'sinv.deliveryCreation',
      'sinv.receiptExecution',
    ],
  })
)(WorkflowComponent);
