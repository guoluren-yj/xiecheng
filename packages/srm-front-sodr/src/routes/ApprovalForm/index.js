/*
 * ApprovalForm - 订单审批表单
 * @date: 2023/09/01 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */

import React, { useEffect, useState, useMemo, useCallback, Fragment } from 'react';
import { DataSet, Modal, Icon, Tooltip } from 'choerodon-ui/pro';
import { Statistic, Alert, Spin, Tag, Radio } from 'choerodon-ui';
import { compose } from 'lodash';
import { parse } from 'querystring';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { Content } from 'components/Page';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { AFBasic, AFExtra } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import PrintProButton from '_components/PrintProButton';
import { getCurrentOrganizationId } from 'utils/utils';
import remotes from 'utils/remote';

import AttachmentInfo from '@/routes/components/AttachmentInfo';
import { basic, extra, line, attachmentInfo } from './store';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import C7nOperationApprove from '@/routes/components/C7nOperationApprove';
import { useAmountRender, priceChangeTip } from '@/routes/OrderWorkspace/hooks';
import { print } from '@/services/orderWorkspaceService';
import styles from './index.less';

const SHIED_FIELDS = [
  'unitPrice',
  'enteredTaxIncludedPrice',
  'lineAmount',
  'taxIncludedLineAmount',
];

const organizationId = getCurrentOrganizationId();

const ApprovalForm = (props) => {
  const {
    code = '',
    location,
    onLoad,
    remote,
    customizeCommon,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    queryTemplateConfig,
    match: {
      params: { poHeaderId },
    },
  } = props;
  const { stageCode, templateCode, templateVersion } = useMemo(
    () => parse(location.search?.substring(1)),
    [location]
  );
  const extraDs = useMemo(() => new DataSet(extra()), []);
  const attachmentInfoDs = useMemo(() => new DataSet(attachmentInfo()), []);
  const basicDs = useMemo(() => new DataSet(basic({ poHeaderId, extraDs, attachmentInfoDs })), [
    poHeaderId,
    extraDs,
    attachmentInfoDs,
  ]);
  const basicCurrent = useMemo(() => {
    return basicDs.current;
  }, [basicDs.current]);
  const headChangeFlag = useMemo(() => basicCurrent?.get('changeFlag'), [
    basicCurrent?.get('changeFlag'),
  ]);
  const lineDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process('SODR_APPROVAL_FORM_PROCESS_DETAIL_DS', line({ poHeaderId }), {
              context: props,
              basicDs,
            })
          : line({ poHeaderId })
      ),
    [poHeaderId]
  );
  // 是否为变更审批表单标识
  const isChange = useMemo(() => code?.includes('CHANGE') || Boolean(headChangeFlag), [
    code,
    headChangeFlag,
  ]);
  // 单据样式页面编码
  const [pageCode, setPageCode] = useState(code?.includes('CHANGE') ? 'CHANGE' : 'NEW');
  // 订单明细信息单元编码
  const detailInfoCode = useMemo(
    () => (isChange ? 'SODR.WORKFLOW.DETAILINFO_CHANGE' : 'SODR.WORKFLOW.DETAILINFO'),
    [isChange]
  );
  // 变更审批表单下是否仅展示变更数据状态
  const [isShowAll, setIsShowAll] = useState(1);
  const [waitCustomize, setWaitCustomize] = useState(true);
  const cuszTplParams = useMemo(
    () => ({
      cuszTplStageCode: stageCode, // 单据样式阶段编码
      cuszTplPageCode: pageCode, // 单据样式页面编码
      cuszTplTemplateCode: templateCode, // 单据样式模板编码
      cuszTplVersion: templateVersion, // 单据样式模板版本
    }),
    [stageCode, pageCode, templateCode, templateVersion]
  );
  const basicFieldsConfig = useMemo(
    () => ({
      poTypeId: {
        render: ({ record }) => record && record.get('poTypeDesc'),
      },
      creationDate: {
        render: ({ record, name, dataSet }) =>
          record &&
          `${dataSet.getField(name).get('label') || '-'} : ${
            record.get('creationDate')?.format(DEFAULT_DATE_FORMAT) || '-'
          }`,
      },
    }),
    []
  );
  const extraFieldsConfig = useMemo(() => {
    return {
      company: {
        aggregation: true,
        aggregationFields: ['companyName'],
      },
      supplier: {
        aggregation: true,
        aggregationFields: ['supplierName'],
      },
      supplierName: {
        renderValue: ({ record }) => {
          return record && (record.get('supplierName') || record.get('supplierCompanyName'));
        },
      },
      purchaseOrgAndAgent: {
        aggregation: true,
        aggregationFields: ['purchaseOrgName', 'agentName'],
      },
      remarkInfo: {
        aggregation: true,
        aggregationFields: ['remark'],
      },
    };
  }, []);

  useEffect(() => {
    if (onLoad) {
      onLoad({
        submit: (approveResult) =>
          remote.process(
            // 工作流审批提交处理promise
            'approvalPromise',
            {
              props,
              lineDs,
              basicDs,
              extraDs,
              attachmentInfoDs,
            },
            approveResult
          ),
      });
    }
  }, []);

  // 显示变更信息提示
  const renderChangeTip = useCallback(
    (data, content) => {
      const { record, name, text } = data;
      const dom = content || text;
      // 非变更 直接返回原dom
      if (!isChange) return dom;
      const map = record.get('changeMap') || {};
      const priceShieldFlag = record.get('priceShieldFlag');
      const shieldFlag = priceShieldFlag === 1 && SHIED_FIELDS.includes(name);
      if (name in map) {
        const tipValue = map[name] || '【】';
        const tipContent = `${intl
          .get('sodr.common.model.common.beforeUpdate')
          .d('变更前')} : ${tipValue}`;
        if (shieldFlag) {
          return <span style={{ color: 'red' }}>{dom}</span>;
        } else {
          return (
            <div style={{ color: 'red' }}>
              <Tooltip
                theme="dark"
                placement="topLeft"
                title={tipContent}
                autoAdjustOverflow
                popupClassName={styles['change-tip-tooltip']}
              >
                {dom}
              </Tooltip>
            </div>
          );
        }
      }
      return dom;
    },
    [isChange]
  );

  const onCell = useCallback(
    ({ record }) => {
      if (record.get('changeFlag') === 2 && isChange) {
        return { style: { color: 'red' } };
      }
      return {};
    },
    [isChange]
  );

  const columns = useMemo(() => {
    const defaultCloumns = [
      {
        name: 'displayLineNum',
        width: 50,
      },
      {
        name: 'itemCode',
        width: 80,
        renderer: renderChangeTip,
      },
      {
        name: 'itemName',
        renderer: renderChangeTip,
      },
      {
        name: 'quantity',
        width: 70,
        renderer: renderChangeTip,
      },
      {
        name: 'uomCodeAndName',
        renderer: renderChangeTip,
      },
      {
        name: 'needByDate',
        width: 90,
        renderer: renderChangeTip,
      },
      {
        name: 'enteredTaxIncludedPrice',
        renderer: (data) => {
          const dom = priceChangeTip(data, basicCurrent);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'taxIncludedLineAmount',
        renderer: (data) => {
          const dom = useAmountRender(basicCurrent)(data);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'unitPrice',
        renderer: (data) => {
          const dom = priceChangeTip(data, basicCurrent);
          return renderChangeTip(data, dom);
        },
      },
      {
        name: 'lineAmount',
        width: 110,
        renderer: (data) => {
          const dom = useAmountRender(basicCurrent)(data);
          return renderChangeTip(data, dom);
        },
      },
    ];
    if (isChange) {
      defaultCloumns.unshift({
        name: 'changeFlagMeaning',
        renderer: ({ record, value }) => {
          const changeFlag = record.get('changeFlag');
          return (
            <Tag
              style={{ marginRight: 4, borderColor: 'transparent' }}
              color={changeFlag === 1 ? 'yellow' : changeFlag === 2 ? 'green' : 'gray'}
            >
              {value}
            </Tag>
          );
        },
      });
    }
    return remote
      ? remote.process(
          'SODR_APPROVAL_FORM_PROCESS_DETAIL_COLUMN',
          defaultCloumns.map((i) => ({ ...i, onCell })),
          { context: props, basicDs }
        )
      : defaultCloumns.map((i) => ({ ...i, onCell }));
  }, [renderChangeTip, priceChangeTip, isChange, basicCurrent, onCell]);
  useEffect(() => {
    // dataSet变更触发一次查询，如果存在轮询的query调用，先清除
    clearTimeout(executeQuery.timer);
    executeQuery();
    return () => clearTimeout(executeQuery.timer);
  }, [lineDs]);
  useEffect(() => {
    setWaitCustomize(true);
    setCuzsParams();
    basicDs.query().then((res) => {
      if (!res?.failed) {
        const { changeFlag } = res;
        const newPageCode = changeFlag ? 'CHANGE' : pageCode;
        if (changeFlag) {
          setPageCode('CHANGE');
        }
        queryTemplateConfig(
          Promise.resolve({
            templateCode,
            templateVersion,
          }),
          { stageCode, pageCode: newPageCode }
        ).then(() => {
          setWaitCustomize(false);
        });
      }
    });
    const changeEditFlag = isShowAll ? 0 : 1;
    lineDs.setQueryParameter('changeEditFlag', changeEditFlag);
    lineDs.setQueryParameter(
      'customizeUnitCode',
      `${detailInfoCode},SODR.WORKFLOW.DETAILINFO_FILTER`
    );
    lineDs.query();
  }, [cuszTplParams]);
  const setCuzsParams = useCallback(() => {
    Object.keys(cuszTplParams).forEach((i) => {
      basicDs.setQueryParameter(i, cuszTplParams[i]);
      lineDs.setQueryParameter(i, cuszTplParams[i]);
    });
  }, [basicDs, lineDs, cuszTplParams]);
  const contentRemainRender = useCallback(() => {
    if (basicCurrent) {
      const { taxIncludeAmount, currencyCode } = basicCurrent.get([
        'taxIncludeAmount',
        'currencyCode',
      ]);
      return (
        <Statistic
          valueStyle={{ fontWeight: 600 }}
          title={intl.get('sodr.approvalForm.model.common.amount').d('原币含税金额')}
          value={`${useAmountRender(basicCurrent)({
            value: taxIncludeAmount,
            name: 'taxIncludeAmount',
            record: basicCurrent,
          })} ${currencyCode}`}
        />
      );
    }
  }, [basicCurrent]);
  const executeQuery = useCallback(() => {
    // 筛选器调整：增加queryStatus
    if (lineDs.getState('queryStatus') === 'ready' && !waitCustomize) {
      lineDs.query();
    } else {
      executeQuery.timer = setTimeout(() => {
        executeQuery();
      }, 200);
    }
  }, []);
  const handlePrint = useCallback(() => {
    return print(poHeaderId).then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow && printWindow.print) {
          printWindow.print();
        }
      }
    });
  }, [poHeaderId]);
  const handleRecord = useCallback(() => {
    Modal.open({
      key: Modal.key(),
      title: intl.get(`sodr.approvalForm.view.title.operationHistory`).d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      style: { width: 748 },
      children: <C7nOperationApprove poHeaderId={poHeaderId} />,
      onOk: () => {},
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  }, [poHeaderId]);
  const handleChangeContent = useCallback(async () => {
    // changeEditFlag: 1 仅展示变更内容 ｜ 0 展示全部内容
    lineDs.setQueryParameter('changeEditFlag', isShowAll);
    const res = await lineDs.query();
    if (res && !res.failed) setIsShowAll(isShowAll ? 0 : 1);
    return res;
  }, [isShowAll, lineDs]);
  const contentBottomRender = useCallback(() => {
    const buttons = [
      {
        name: 'printNew',
        btnType: 'c7n-pro',
        childFor: 'buttonText',
        btnComp: PrintProButton,
        child: intl.get('hzero.common.button.newPrint').d('打印（新）'),
        btnProps: {
          buttonProps: {
            funcType: 'flat',
            type: 'c7n-pro',
            wait: THROTTLE_TIME,
          },
          method: 'POST',
          data: [poHeaderId],
          requestUrl: `${SRM_SPUC}/v1/${organizationId}/po-header/batch-print-token`,
        },
      },
      {
        name: 'print',
        btnType: 'c7n-pro',
        child: intl.get('sodr.approvalForm.view.button.print').d('打印'),
        btnProps: {
          icon: 'print',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          onClick: handlePrint,
        },
      },
      {
        name: 'record',
        child: intl.get('sodr.approvalForm.view.button.operationRecords').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          onClick: handleRecord,
        },
      },
    ];
    // if (isChange) {
    //   buttons.push({
    //     name: 'changeContent',
    //     child: isShowAll
    //       ? intl.get('sodr.approvalForm.view.button.hiddenAll').d('仅展示变更内容')
    //       : intl.get('sodr.approvalForm.view.button.showAll').d('展示全部内容'),
    //     btnProps: {
    //       icon: 'visibility',
    //       funcType: 'flat',
    //       onClick: handleChangeContent,
    //       wait: THROTTLE_TIME,
    //     },
    //   });
    // }
    return (
      <div className="content-bottom-render">
        <div>
          {customizeBtnGroup(
            { code: 'SODR.WORKFLOW.BUTTONS', pro: true },
            <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />
          )}
        </div>
        {isChange && (
          <Radio.Group
            disabled={lineDs.status !== 'ready'}
            onChange={handleChangeContent}
            value={isShowAll}
            className={styles['approval-radio-group']}
          >
            <Radio.Button value={1}>
              {intl.get('sodr.approvalForm.view.button.showAll').d('展示变更后单据')}
            </Radio.Button>
            <Radio.Button value={0}>
              {intl.get('sodr.approvalForm.view.button.hiddenAll').d('仅展示变更项')}
            </Radio.Button>
          </Radio.Group>
        )}
      </div>
    );
  }, [
    isShowAll,
    handlePrint,
    handleRecord,
    handleChangeContent,
    customizeBtnGroup,
    isChange,
    poHeaderId,
  ]);

  const getContent = () => {
    const tabs = remote
      ? remote.process('SODR_APPROVAL_FORM_PROCESS_CONTENT', null, {
          basicDs,
        })
      : null;
    return tabs;
  };
  return basicDs.status !== 'ready' || waitCustomize ? (
    <Spin />
  ) : (
    <div className={styles['approval-form']}>
      {isChange && (
        <Alert
          className={styles['order-top-title']}
          border={false}
          message={
            <Fragment>
              <Icon type="help" />
              {intl
                .get('sodr.approvalForm.view.alert.newChangeInfo')
                .d('单据变更的内容用红色字体标识，鼠标定位在变更处可以查看变更前的原始内容')}
            </Fragment>
          }
          closable
        />
      )}
      {customizeCommon(
        {
          code: 'SODR.WORKFLOW.AFBASIC',
          processUnitTag: 'AF-BASIC',
        },
        <AFBasic
          dataSet={basicDs}
          titleField="displayPoNum"
          tagFields={['poTypeId']}
          normalFields={['realName', 'creationDate']}
          fieldsConfig={basicFieldsConfig}
          contentRemainWidth="25%"
          contentRemainRender={contentRemainRender}
          contentBottomRender={contentBottomRender}
        />
      )}
      {customizeCommon(
        {
          code: 'SODR.WORKFLOW.AFEXTRA',
          processUnitTag: 'AF-EXTRA',
        },
        <AFExtra
          dataSet={extraDs}
          fields={['company', 'supplier', 'purchaseOrgAndAgent', 'remark']}
          fieldsConfig={extraFieldsConfig}
        />
      )}
      <Content>
        <h3>{intl.get('sodr.approvalForm.view.title.detailInfo').d('订单明细信息')}</h3>
        {customizeTable(
          { code: detailInfoCode },
          <SearchBarTable
            dataSet={lineDs}
            columns={columns}
            searchCode="SODR.WORKFLOW.DETAILINFO_FILTER"
            style={{ maxHeight: '550px' }}
            virtual
            virtualCell
            searchBarConfig={{
              autoQuery: false,
              expandable: false,
              closeFilterSelector: true,
            }}
          />
        )}
      </Content>
      {getContent()}
      {!!isShowAll && (
        <Content>
          <AttachmentInfo
            ds={attachmentInfoDs}
            customizeForm={customizeForm}
            poHeaderId={poHeaderId}
            attachmentConfig={{
              readOnly: [1, 1, 1],
            }}
            customizeCode={[
              'SODR.WORKFLOW.ATTACHMENTINFO',
              'SODR.WORKFLOW.ATTACHMENTINFO_EXTERNAL',
            ]}
          />
        </Content>
      )}
    </div>
  );
};

export default compose(
  withCustomize({ isTemplate: true }),
  formatterCollections({ code: ['sodr.approvalForm', 'sodr.workspace', 'sodr.common'] }),
  remotes(
    {
      code: 'SODR_APPROVAL_FORM',
      name: 'remote',
    },
    {
      process: {
        approvalPromise: () => {
          return new Promise((resolve) => {
            resolve();
          });
        },
      },
    }
  ),
  observer
)(ApprovalForm);
