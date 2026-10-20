/**
 * ProcessConfig
 * @date: 2022-07-11
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useEffect, useContext, useState, useMemo } from 'react';
import {
  Form,
  Modal,
  Table,
  Dropdown,
  Menu,
  Button,
  TextField,
  Select,
  Switch,
  Upload,
  Lov,
} from 'choerodon-ui/pro';
import { Tag, Icon, Timeline, Tooltip, Alert } from 'choerodon-ui';
import { stringify } from 'querystring';
import { observer } from 'mobx-react';

import { downloadFile } from 'hzero-front/lib/services/api';
import ExcelExportPro from 'srm-front-boot/lib/components/ExcelExportPro';
import { isEmpty, isArray, omit } from 'lodash';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { API_HOST, HZERO_HWFP } from 'utils/config';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getAccessToken,
  getCurrentLanguage,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';

import ExcelExport from '@/components/ExcelExport';
import {
  fetchDeployHistory,
  // deleteProcess,
  addProcess,
  saveProcessSetting,
  copyValue,
  // releaseProcess,
  importProcess,
  handleExport,
  // verifyReleaseProcess,
} from './processConfigurationService';
import { Context } from './store';
import styles from './index.less';

const currentTenantId = getCurrentOrganizationId();
const isSiteFlag = !isTenantRoleLevel();
const modalKey = Modal.key();
const prefix = isTenantRoleLevel()
  ? `${API_HOST}${HZERO_HWFP}/v1/${currentTenantId}`
  : `${API_HOST}${HZERO_HWFP}/v1`;
export default function ProcessDocument(props = {}) {
  const { currentNode = {} } = props;
  const { categoryId = '', categoryCode = '', documentId = '' } = currentNode;
  // const [releasing, setReleasing] = useState(false);
  // const [deployLoading, setDeployLoading] = useState(false);
  // const [currentRecord, setCurrentRecord] = useState({});
  const [exportCurrentLoading, setExportCurrentLoading] = useState(false);
  const [exportAllLoading, setExportAllLoading] = useState(false);
  const { processConfigFormDs, processConfigTableDs, processConfigImportFormDs } = useContext(
    Context
  );
  const currentLanguage = useMemo(() => {
    const language = getCurrentLanguage();
    return ['zh_CN', 'en_US', 'ja_JP'].includes(language) ? language : 'en_US';
  }, []);

  useEffect(() => {
    if (categoryId) {
      if (!isEmpty(currentNode) && currentNode.sourceParentId) {
        processConfigTableDs.setQueryParameter('parentDocumentId', currentNode.sourceParentId);
      } else {
        processConfigTableDs.setQueryParameter('parentDocumentId', null);
      }
      processConfigTableDs.setQueryParameter('category', categoryId);
      processConfigTableDs.setQueryParameter('documentId', documentId);
      processConfigTableDs.setQueryParameter('approveFlowFlag', 1);
      processConfigTableDs.query();
      processConfigFormDs.getField('defaultFormObj').setLovPara('documentId', documentId);
      processConfigImportFormDs.getField('defaultFormObj').setLovPara('documentId', documentId);
    }
  }, [categoryId, categoryCode, documentId, currentNode]);

  const checkHistoryEditor = (record = {}, row = {}) => {
    const id = record.get('id');
    const accessToken = getAccessToken();
    const urlParam = {
      modelId: id,
      tenant_id: currentTenantId,
      language: currentLanguage,
      access_token: accessToken,
      historyFlag: row.historyFlag,
      deploymentId: row.deploymentId,
      version: row.version,
    };
    const url = `${API_HOST}/hwfp/index.html?${stringify(urlParam)}`;
    window.open(url);
  };

  const getDropdownMenu = (record = {}) => {
    // const isPreDefined = currentTenantId.toString() !== record.get('tenantId').toString();
    return (
      <Menu>
        <Menu.Item key="edit">
          {/* <a
            href={`${API_HOST}/hwfp/index.html?modelId=${record.get(
              'id'
            )}&tenant_id=${currentTenantId}&isPreDefined=${
              isSiteFlag ? false : isPreDefined
            }&language=${currentLanguage}&access_token=${getAccessToken()}&disabled=true`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {!isTenantRoleLevel() || !isPreDefined
              ? intl.get('hzero.common.button.edit').d('编辑')
              : intl.get('hzero.common.button.view').d('查看')}
          </a> */}
          <a
            href={`${API_HOST}/hwfp/index.html?modelId=${record.get(
              'id'
            )}&tenant_id=${currentTenantId}&isPreDefined=true&language=${currentLanguage}&access_token=${getAccessToken()}&disabled=true`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        </Menu.Item>
        <Menu.Item key="download">
          <a onClick={() => exportOption(record)}>
            {intl.get('hzero.common.button.download').d('下载')}
          </a>
        </Menu.Item>
        {/* {isTenantRoleLevel() && !isPreDefined && (
          <Menu.Item key="setting">
            <a onClick={() => addNewProcess(record, 'setting')}>
              {intl.get('hzero.common.button.setting').d('设置')}
            </a>
          </Menu.Item>
        )} */}
        {/* {(isSiteFlag || !isPreDefined) && (
          <Menu.Item key="delete">
            <Popconfirm
              placement="topRight"
              title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
              onConfirm={() => deleteOption(record)}
            >
              <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
            </Popconfirm>
          </Menu.Item>
        )} */}
        {/* {isTenantRoleLevel() && isPreDefined && (
          <Menu.Item key="copy">
            <a onClick={() => addNewProcess(record, 'copy')}>
              {intl.get('hzero.common.button.copy').d('复制')}
            </a>
          </Menu.Item>
        )} */}
      </Menu>
    );
  };

  const deployOption = (record) => {
    const recordKey = record.get('key') || '';
    fetchDeployHistory({ modelKey: recordKey }).then((res) => {
      if (isArray(res)) {
        Modal.open({
          key: modalKey,
          title: intl.get('hwfp.common.view.message.title.deployRecord').d('发布记录'),
          children: (
            <>
              {res.length > 0 ? (
                <Timeline>
                  {res.map((n) => (
                    <Timeline.Item>
                      {`${intl.get(`hwfp.common.view.message.version`).d('版本')}：${n.version}`}{' '}
                      {`${intl.get(`hzero.common.date.releaseTime`).d('发布时间')}：${
                        n.deploymentTime
                      }`}{' '}
                      {n.publisher &&
                        `${intl.get(`hwfp.common.view.message.publisher`).d('发布人')}：${
                          n.publisher
                        }`}{' '}
                      <a rel="noopener noreferrer" onClick={() => checkHistoryEditor(record, n)}>
                        {intl.get('hzero.common.button.view').d('查看')}
                      </a>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                intl.get('hwfp.common.view.message.deployRecord.noContent').d('暂无记录')
              )}
            </>
          ),
          drawer: true,
        });
      }
    });
  };

  // const deleteOption = (record) => {
  //   const deleteData = record.toData();
  //   deleteProcess({ modelId: deleteData.id, record: deleteData }).finally(() => {
  //     const { currentPage } = processConfigTableDs;
  //     processConfigTableDs.query(currentPage);
  //   });
  // };

  const showImportWarning = (res) => {
    const warningList = [];
    const {
      ERROR_APPROVAL_CANDIDATE_RULE,
      ERROR_FORM,
      ERROR_SEQUENCE_CONDITION,
      ERROR_SERVICE_TASK,
    } = res;
    if (ERROR_APPROVAL_CANDIDATE_RULE && ERROR_APPROVAL_CANDIDATE_RULE.length) {
      warningList.push({
        name: intl.get('hwfp.processDefine.view.title.approveFRuleAndCopy').d('审批规则与自动抄送'),
        content: ERROR_APPROVAL_CANDIDATE_RULE,
      });
    }
    if (ERROR_FORM && ERROR_FORM.length) {
      warningList.push({
        name: intl.get('hwfp.common.model.approval.form').d('审批表单'),
        content: ERROR_FORM,
      });
    }
    if (ERROR_SEQUENCE_CONDITION && ERROR_SEQUENCE_CONDITION.length) {
      warningList.push({
        name: intl.get('hwfp.processDefine.view.title.sequenceCondition').d('跳转线'),
        content: ERROR_SEQUENCE_CONDITION,
      });
    }
    if (ERROR_SERVICE_TASK && ERROR_SERVICE_TASK.length) {
      warningList.push({
        name: intl.get('hwfp.processDefine.view.title.serviceTask').d('服务任务'),
        content: ERROR_SERVICE_TASK,
      });
    }
    if (warningList.length) {
      Modal.open({
        autoCenter: true,
        style: { width: '600px' },
        title: intl.get('hwfp.processDefine.message.confirm.title').d('提示'),
        children: (
          <div style={{ lineHeight: '24px' }}>
            <div>
              {intl
                .get('hwfp.processDefine.import.warning.tip1')
                .d('流程图导入完成，请检查流程图配置！')}
            </div>
            <div>
              {intl
                .get('hwfp.processDefine.import.warning.tip2')
                .d('导入文件部分服务定义不存在，以下节点服务末导入成功，请重点检查。')}
            </div>
            {warningList.map((listItem) => (
              <>
                <div>{listItem.name}:</div>
                {listItem.content.map((contentItem, index) => (
                  <div>
                    【{index + 1}】{contentItem}
                  </div>
                ))}
              </>
            ))}
          </div>
        ),
        footer: (okBtn) => okBtn,
      });
    }
  };

  /**
   * 下载
   * @param {object} record - 流程对象
   */
  const exportOption = (record) => {
    const { tenantId, id } = record.get(['tenantId', 'id']);
    const api = `${prefix}/process/models/${id}/download`;
    // 预定义额外传参defaultTenantId
    const queryParams =
      currentTenantId.toString() === tenantId.toString()
        ? [{ name: 'type', value: 'bpmn20' }]
        : [
            { name: 'type', value: 'bpmn20' },
            { name: 'defaultTenantId', value: 0 },
          ];
    downloadFile({ requestUrl: api, queryParams });
  };

  const addNewProcess = (record, type) => {
    let recordData = {};
    if (record && !isEmpty(record)) {
      recordData = record.toData();
    }
    const newRecord =
      type === 'import'
        ? processConfigImportFormDs.create(recordData, 0)
        : processConfigFormDs.create(recordData, 0);
    if (type === 'import') {
      newRecord.set('categoryId', categoryId);
    } else {
      newRecord.set('category', categoryId);
    }
    newRecord.set('documentId', documentId);
    const defaultPushMessageType = [];
    if (newRecord.get('fireMsgFlag') === 1) {
      defaultPushMessageType.push('task');
    }
    if (newRecord.get('carbonEventFlag') === 1) {
      defaultPushMessageType.push('carbon');
    }
    if (newRecord.get('commentEventFlag') === 1) {
      defaultPushMessageType.push('comment');
    }
    if (newRecord.get('remindEventFlag') === 1) {
      defaultPushMessageType.push('remindEventFlag');
    }
    newRecord.set('pushMessageType', defaultPushMessageType);
    const showKeyText = type !== 'setting';
    const showFileUpdate = type === 'import';
    Modal.open({
      title:
        type === 'setting'
          ? intl.get('hzero.common.button.setting').d('设置')
          : type === 'copy'
          ? intl.get('hzero.common.button.copy').d('复制')
          : type === 'import'
          ? intl.get('hzero.common.button.import').d('导入')
          : intl.get('hzero.common.button.create').d('新建'),
      drawer: true,
      style: {
        width: '380px',
      },
      children: (
        <EditForm newRecord={newRecord} showFileUpdate={showFileUpdate} showKeyText={showKeyText} />
      ),
      onOk: async () => {
        const formDs = type === 'import' ? processConfigImportFormDs : processConfigFormDs;
        const res = await formDs.validate();
        if (res) {
          const { pushMessageType, ...other } = newRecord.toData();
          const params = {
            ...filterNullValueObject(other),
            carbonEventFlag: pushMessageType && pushMessageType.includes('carbon') ? 1 : 0,
            commentEventFlag: pushMessageType && pushMessageType.includes('comment') ? 1 : 0,
            remindEventFlag: pushMessageType && pushMessageType.includes('remindEventFlag') ? 1 : 0,
          };
          const submitFunc = getSubmitFunc(type);
          const submitData = getSubmitData(record, other, params, type);
          const resp = await submitFunc(submitData);
          if (getResponse(resp)) {
            notification.success();
            const { currentPage } = processConfigTableDs;
            processConfigTableDs.query(currentPage);
            if (type === 'import') {
              showImportWarning(resp);
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      onClose: () => {
        if (type === 'import') {
          processConfigImportFormDs.reset(newRecord);
        } else {
          processConfigFormDs.reset(newRecord);
        }
      },
    });
  };

  const getSubmitFunc = (type) => {
    switch (type) {
      case 'setting':
        return saveProcessSetting;
      case 'copy':
        return copyValue;
      case 'import':
        return importProcess;
      default:
        return addProcess;
    }
  };

  const getSubmitData = (record, values, params, type) => {
    const tenantId = currentTenantId;
    const formData = new FormData();
    if (type === 'import') {
      for (const key of Object.keys(params)) {
        if (key === 'file') {
          formData.append(key, params[key]);
          // eslint-disable-next-line
          continue;
        }
        formData.append(key, params[key]);
      }
    }
    switch (type) {
      case 'setting':
        return {
          modelId: values.id,
          ...params,
        };
      case 'copy':
        return {
          oldKey: record.get('key'),
          newKey: values.key,
          newName: values.name,
          ...omit(params, ['key', 'name', '__dirty']),
        };
      case 'import':
        return formData;
      default:
        return {
          tenantId,
          process: { tenantId, ...params },
        };
    }
  };

  /**
   * 流程发布校验
   * @param {object} record - 流程对象
   */
  // const handleVerifyRelease = debounce((record) => {
  //   setCurrentRecord(record);
  //   setDeployLoading(true);
  //   verifyReleaseProcess({
  //     tenantId: currentTenantId,
  //     modelId: record.id,
  //   })
  //     .then((response) => {
  //       const res = getResponse(response);
  //       if (res && (!res.ERROR || !res.ERROR.length) && (!res.WARN || !res.WARN.length)) {
  //         // 校验通过，直接部署
  //         handleReleaseModel(record);
  //       } else if (res && (res.ERROR || res.WARN)) {
  //         // 校验未通过，显示报错信息
  //         Modal.open({
  //           title: intl.get('hwfp.processDefine.view.release.info').d('常见易错配置提示'),
  //           closable: true,
  //           onOk: () => handleReleaseModel(record),
  //           okText: intl.get('hwfp.processDefine.view.continue.release').d('继续部署'),
  //           okProps: {
  //             disabled: res.ERROR && res.ERROR.length > 0,
  //           },
  //           style: {
  //             width: 720,
  //           },
  //           children: (
  //             <>
  //               {res.ERROR && res.ERROR.length > 0 && (
  //                 <>
  //                   <Alert
  //                     message={intl.get('hzero.common.status.mistake').d('错误')}
  //                     type="warning"
  //                     showIcon
  //                     style={{ marginBottom: '12px' }}
  //                   />
  //                   {res.ERROR.map((item, index) => (
  //                     <p>
  //                       {index + 1}.{item}
  //                     </p>
  //                   ))}
  //                 </>
  //               )}
  //               {res.WARN && res.WARN.length > 0 && (
  //                 <>
  //                   <Alert
  //                     message={intl.get('hzero.common.warn').d('错误')}
  //                     type="error"
  //                     showIcon
  //                     style={{ marginBottom: '12px' }}
  //                   />
  //                   {res.WARN.map((item, index) => (
  //                     <p>
  //                       {index + 1}.{item}
  //                     </p>
  //                   ))}
  //                 </>
  //               )}
  //             </>
  //           ),
  //         });
  //       }
  //     })
  //     .finally(() => {
  //       setDeployLoading(false);
  //     });
  // }, 200);

  /**
   * 流程发布
   * @param {object} record - 流程对象
   */
  // const handleReleaseModel = (record) => {
  //   const tenantId = currentTenantId;
  //   setReleasing(true);
  //   // setCurrentRecord(record);
  //   releaseProcess({
  //     tenantId,
  //     modelId: record.id,
  //   })
  //     .then((res) => {
  //       if (getResponse(res)) {
  //         notification.success();
  //       }
  //     })
  //     .finally(() => {
  //       setReleasing(false);
  //       const { currentPage } = processConfigTableDs;
  //       processConfigTableDs.query(currentPage);
  //     });
  // };

  const getExportQueryParams = () => {
    const { sourceParentId = '' } = currentNode;
    let filterValues = {
      tenantId: currentTenantId,
      fileName: intl.get('hwfp.processDefine.model.export.defaultName').d('流程定义数据导出'),
      category: categoryId,
      documentId,
      parentDocumentId: sourceParentId,
      approveFlowFlag: 1,
    };
    if (processConfigTableDs.queryDataSet && processConfigTableDs.queryDataSet.current) {
      const {
        key = '',
        name = '',
        processDefineSource = '',
      } = processConfigTableDs.queryDataSet.current.toData();
      filterValues = filterNullValueObject({ ...filterValues, key, name, processDefineSource });
      if (processDefineSource === 'PREDEFINED') {
        notification.warning({
          message: intl
            .get('hwfp.processDefine.model.export.predefined.message')
            .d('不支持预定义流程的导出'),
        });
      }
    }
    return filterNullValueObject(filterValues);
  };

  /**
   * 导出
   */
  const exportList = ({ name = '', type }) => {
    if (type === 'allDetail') {
      setExportAllLoading(true);
    } else {
      setExportCurrentLoading(true);
    }
    const exportDs = processConfigTableDs;
    let emptyFlag = false; // 当前ds是否为空
    let fileName = name; // 导出文件名
    // 查询form表单
    const queryFrom =
      processConfigTableDs.queryDataSet && processConfigTableDs.queryDataSet.current
        ? processConfigTableDs.queryDataSet.current.toData()
        : {};
    emptyFlag = exportDs.length === 0;
    if (!fileName) {
      fileName = intl.get('hwfp.processDefine.model.export.defaultName').d('流程定义数据导出');
    }
    if (emptyFlag) {
      // 表格数据为0
      this.setState({
        exportLoading: false,
      });
      notification.error({
        message: intl.get('hwfp.common.view.notice.error.export').d('当前无数据可导出'),
      });
      if (type === 'allDetail') {
        setExportAllLoading(false);
      } else {
        setExportCurrentLoading(false);
      }
    } else {
      const param = {
        fileName,
        exportType: 'DATA',
        queryFrom: omit(queryFrom, ['__dirty']),
      };
      if (type === 'currentDetail') {
        param.lastVersionFlag = 1;
      }
      // 待审批导出接口
      handleExport(param)
        .then((res) => {
          getResponse(res);
        })
        .finally(() => {
          if (type === 'allDetail') {
            setExportAllLoading(false);
          } else {
            setExportCurrentLoading(false);
          }
        });
      return true;
    }
  };

  const columns = [
    {
      name: 'key',
      width: 200,
    },
    {
      name: 'name',
      minWidth: 200,
    },
    {
      name: 'fireMsgFlag',
      width: 100,
      renderer: ({ value }) => enableRender(value),
    },
    {
      name: 'batchFlag',
      width: 100,
      renderer: ({ value }) => enableRender(value),
    },
    {
      name: 'mobileMsgFlag',
      width: 100,
      renderer: ({ value }) => enableRender(value),
    },
    {
      name: 'processDefineSource',
      width: 100,
      renderer: ({ record }) =>
        currentTenantId.toString() === record.get('tenantId').toString() ? (
          <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
        ) : (
          <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
        ),
    },
    {
      name: 'latestVersion',
      width: 100,
    },
    {
      name: 'option',
      lock: 'right',
      width: !isSiteFlag ? 290 : 100,
      renderer: ({ record }) => (
        <>
          <Dropdown overlay={getDropdownMenu(record)} trigger={['click']}>
            <a>
              {intl.get('hzero.common.button.action').d('操作')} <Icon type="expand_more" />
            </a>
          </Dropdown>
          {!isSiteFlag && currentTenantId.toString() === record.get('tenantId').toString() && (
            <>
              <a onClick={() => deployOption(record)} style={{ marginLeft: 8 }}>
                {intl.get('hzero.common.button.deploy').d('部署记录')}
              </a>
              {record.get('deploymentId') && (
                <span style={{ color: '#666', marginLeft: 8 }}>
                  {intl.get('hwfp.common.view.button.deployed').d('已部署')}
                </span>
              )}
              {/* {record.get('deploymentId') ? (
                <span style={{ color: '#666', marginLeft: 8 }}>
                  {intl.get('hwfp.common.view.button.deployed').d('已部署')}
                </span>
              ) : (releasing || deployLoading) &&
                !isEmpty(currentRecord) &&
                record.get('id') === currentRecord.id ? (
                  <Spin size="small" style={{ marginLeft: 8 }} />
              ) : (
                <a onClick={() => handleVerifyRelease(record.toData())} style={{ marginLeft: 8 }}>
                  {intl.get('hwfp.common.view.button.deploy').d('部署')}
                </a>
              )} */}
            </>
          )}
        </>
      ),
    },
  ];

  const menu = (
    <Menu className={styles['export-btn-menu']}>
      <Menu.Item key="basicInfo" className={styles['export-basic-btn']}>
        <ExcelExportPro
          formData={{ async: 'true' }}
          requestUrl={`${prefix}/process/models/export`}
          queryParams={getExportQueryParams}
          buttonText={intl.get('hwfp.common.export.basic').d('导出流程定义基础信息')}
          otherButtonProps={{
            icon: '',
            style: {
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: 'normal',
              margin: 0,
            },
          }}
        />
      </Menu.Item>
      <Menu.Item key="currentDetail">
        <ExcelExport
          requestUrl={`${prefix}/process-services/service/export?exportType=COLUMN`}
          method="POST"
          handleExport={(name) => exportList({ name, type: 'currentDetail' })}
          otherButtonProps={{
            loading: exportCurrentLoading,
            icon: '',
            style: {
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: 'normal',
              margin: 0,
            },
          }}
          buttonText={intl.get('hwfp.common.export.detail.current').d('导出流程定义明细(当前版本)')}
        />
      </Menu.Item>
      <Menu.Item key="allDetail">
        <ExcelExport
          requestUrl={`${prefix}/process-services/service/export?exportType=COLUMN`}
          method="POST"
          handleExport={(name) => exportList({ name, type: 'allDetail' })}
          otherButtonProps={{
            loading: exportAllLoading,
            icon: '',
            style: {
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: 'normal',
              margin: 0,
            },
          }}
          buttonText={intl.get('hwfp.common.export.detail.all').d('导出流程定义明细(所有版本)')}
        />
      </Menu.Item>
    </Menu>
  );

  const buttons = [
    // <Button icon="playlist_add" onClick={() => addNewProcess()}>
    //   {intl.get('hwfp.processDefine.view.option.create').d('新建流程')}
    // </Button>,
    <Button icon="archive-o" onClick={() => addNewProcess({}, 'import')}>
      {intl.get('hwfp.processDefine.view.option.import').d('导入')}
    </Button>,
    <Dropdown overlay={menu}>
      <Button className={styles['export-btn']} funcType="flat" type="primary">
        <Icon type="unarchive" className={styles['export-btn-icon']} />
        {intl.get('hzero.common.button.export').d('导出')}
        <span className={styles['export-btn-tag']}>NEW</span>
      </Button>
    </Dropdown>,
  ];

  return (
    <>
      <Alert
        message={intl
          .get('hwfp.processDefine.config.info.message')
          .d('请到流程定义功能中进行流程编辑与部署')}
        type="info"
        showIcon
        style={{ marginBottom: '12px' }}
      />
      <Table dataSet={processConfigTableDs} columns={columns} buttons={buttons} />
    </>
  );
}

const EditForm = observer(({ newRecord, showFileUpdate, showKeyText }) => {
  return (
    <Form record={newRecord} labelLayout="float">
      {showFileUpdate && (
        <Upload
          multiple={false}
          accept={['.xml']}
          name="file"
          uploadImmediately={false}
          showUploadBtn={false}
          onFileChange={(fileList) => {
            if (isArray(fileList) && fileList.length > 0) {
              newRecord.set('file', fileList[0]);
            }
          }}
          onRemoveFile={() => {
            newRecord.set('file', null);
          }}
        />
      )}
      {showKeyText && <TextField name="key" />}
      <TextField name="name" />
      <Lov name="defaultFormObj" />
      <Select
        name="messageTypeList"
        label={
          <>
            {intl
              .get('hwfp.processDefine.model.processDefine.messageTypeList')
              .d('SRM消息提醒配置')}
            <Tooltip
              overlayClassName={styles['push-msg-help']}
              title={intl
                .get('hwfp.processDefine.model.processDefine.messageTypeList.help')
                .d(
                  '通过邮件、站内信、短信等方式推送待办、催办等消息提醒，可在【消息发送配置】功能里维护消息通知类型'
                )}
            >
              <Icon type="help" style={{ marginLeft: '4px', verticalAlign: 'sub' }} />
            </Tooltip>
          </>
        }
      />
      <Switch
        name="fireMsgFlag"
        label={
          <>
            {intl
              .get('hwfp.processDefine.model.processDefine.pushMessageEnabled')
              .d('待办消息推送外部系统')}
            <Tooltip
              overlayClassName={styles['push-msg-help']}
              title={
                <>
                  <p>
                    {intl
                      .get('hwfp.processDefine.model.processDefine.pushMessageType.help1')
                      .d(
                        '通过接口方式将工作流待办、已办、抄送通知推送外部系统（OA、企业、微信等），实现外部系统可收到消息提醒，并点击链接跳转到SRM进行待办审批与查看（需实现系统间单点登录）。'
                      )}
                  </p>
                  <p>
                    {intl
                      .get('hwfp.processDefine.model.processDefine.pushMessageType.help2')
                      .d('推送消息类型说明：')}
                  </p>
                  <p>
                    {intl
                      .get('hwfp.processDefine.model.processDefine.pushMessageType.help3')
                      .d(
                        '1）"待办/已办/办结"，审批人收到待办后，则给审批人推送待办消息，审批人审批后，则给审批人推送已办消息，流程审批完成后，推送办结消息给到流程发起人；'
                      )}
                  </p>
                  <p>
                    {intl
                      .get('hwfp.processDefine.model.processDefine.pushMessageType.help4')
                      .d('2)"抄送/传阅"，抄送与传阅，给被抄送人与被传阅人推送传阅消息；')}
                  </p>
                  <p>
                    {intl
                      .get('hwfp.processDefine.model.processDefine.pushMessageType.help5')
                      .d(
                        '3)"评论回复"，开启评论与回复权限后，消息推送给评论提醒人与回复给评论人的提醒'
                      )}
                  </p>
                </>
              }
            >
              <Icon type="help" style={{ marginLeft: '4px', verticalAlign: 'sub' }} />
            </Tooltip>
          </>
        }
        onChange={(v) => {
          newRecord.set('pushMessageType', v === 1 ? ['task'] : undefined);
        }}
      />
      {newRecord && newRecord.get('fireMsgFlag') === 1 && (
        <Select name="pushMessageType" clearButton={false} selectAllButton={false} reverse={false}>
          <Select.Option value="task" disabled>
            {intl.get('hwfp.processDefine.view.option.taskType').d('待办/已办/办结')}
          </Select.Option>
          <Select.Option value="carbon">
            {intl.get('hwfp.processDefine.view.option.carbonType').d('抄送/传阅')}
          </Select.Option>
          <Select.Option value="comment">
            {intl.get('hwfp.processDefine.view.option.commentType').d('评论回复')}
          </Select.Option>
          <Select.Option value="remindEventFlag">
            {intl.get('hwfp.common.view.message.remind').d('催办')}
          </Select.Option>
        </Select>
      )}
      <Switch name="mobileMsgFlag" />
      <Switch name="batchFlag" />
    </Form>
  );
});
