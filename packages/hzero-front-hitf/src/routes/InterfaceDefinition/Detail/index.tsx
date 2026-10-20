import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { isEmpty } from 'lodash';
import { Card, Tabs } from 'choerodon-ui';
import { DataSet, Button, Spin, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import PositionAnchor from 'srm-front-boot/lib/components/PositionAnchor';

import intl from 'hzero-front/lib/utils/intl';

import { Header, Content } from 'hzero-front/lib/components/Page';
import { getResponse, isTenantRoleLevel, getCurrentTenant } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';

import { detailFormDS, detailRelationTableDS, detailTableDS, paramsCreateDS, paramsTableDS, dataFormDS, dataConversionDS, dataScriptDS, dataInputDS, dataOutputDS } from '@/stores/InterfaceDefinition/InterfaceDefinitionDS';
import { queryDetail, saveDetail, publishDetail, deleteDetail } from '@/services/interfaceDefinitionService';
import OperationRecord from '@/components/OperationRecord';

import { handleRelationCheck } from '../../../utils/utils';

import BasicInfo from './BasicInfo';
import ExtendedInfo from './ExtendedInfo';
import RelationScript from './RelationScript';
import Params from './Params';
import DataConversion from './DataConversion';
import styles from './index.less';

const { Link } = PositionAnchor;
const { TabPane } = Tabs;

// 是否为租户
const isTenant = isTenantRoleLevel();

const Detail: React.FC<any> = ({ match: { params }, history: { location: { state = {} } }, history }) => {
  const { id = null } = params;
  const { selectedData = {} } = state;
  const {
    serviceCode = '',
    interfaceUrl = '',
    serviceType = '', // 服务类型二开则为外部接口，标准则为内部接口
    interfaceStandardType = '',
  } = selectedData;

  const paramsRef = useRef();
  const responseRef = useRef();
  const dataConversionRef = useRef();

  const [spinFlag, setSpinFlag] = useState(false);
  const [publishFlag, setPublishFlag] = useState(0);
  const [statusFlag, setStatusFlag] = useState(0);
  const [tabKey, setTabKey] = useState('params');

  const detailFormDs = useMemo(() => new DataSet(detailFormDS(serviceType)), []);
  const detailRelationTableDs = useMemo(() => new DataSet(detailRelationTableDS(id)), []);
  const detailTableDs = useMemo(() => new DataSet(detailTableDS(id)), []);
  const paramsCreateDs = useMemo(() => new DataSet(paramsCreateDS()), []);
  const paramsTableDs = useMemo(() => new DataSet(paramsTableDS(id, false)), []);
  const responseCreateDs = useMemo(() => new DataSet(paramsCreateDS()), []);
  const responseTableDs = useMemo(() => new DataSet(paramsTableDS(id, true)), []);
  const dataFormDs = useMemo(() => new DataSet(dataFormDS(id)), []);
  const dataConversionDs = useMemo(() => new DataSet(dataConversionDS(id)), []);
  const dataScriptDs = useMemo(() => new DataSet(dataScriptDS()), []);
  const dataInputDs = useMemo(() => new DataSet(dataInputDS(id)), []);
  const dataOutputDs = useMemo(() => new DataSet(dataOutputDS(id)), []);

  useEffect(() => {
    if (detailFormDs.current) {
      detailFormDs.current.set({
        serviceCode,
        interfaceUrl,
        serviceType,
        interfaceStandardType,
      });
    }
    if (id) {
      // 编辑查询数据
      getDetail();
    } else if (detailFormDs.current && isTenant) {
      // 租户下的新建，租户默认设置为当前租户
      const tenantInfo = getCurrentTenant();
      detailFormDs.current.set('tenantLov', tenantInfo);
    }
  }, [detailFormDs]);

  useEffect(() => {
    paramsTableDs.addEventListener('load', handleLoad);
    responseTableDs.addEventListener('load', handleLoad);
    return () => {
      paramsTableDs.removeEventListener('load', handleLoad);
      responseTableDs.removeEventListener('load', handleLoad);
    };
  }, [paramsTableDs, responseTableDs]);

  // 已发布的接口，【参数】中的表格数据不可选中删除
  const handleLoad = ({ dataSet }) => {
    dataSet.forEach((record) => {
      const isPublish = record.get('isPublish');
      // eslint-disable-next-line no-param-reassign
      record.selectable = !isPublish;
    });
  };

  const getDetail = useCallback(() => {
    setSpinFlag(true);
    queryDetail(id).then(res => {
      const result = getResponse(res);
      if (result && detailFormDs.current) {
        setPublishFlag(result.isPublish || 0);
        setStatusFlag(result.status || 0);
        detailFormDs.current.init({
          ...result,
        });
        if (detailFormDs && detailFormDs.current) {
          detailFormDs.current.status = RecordStatus.update;
        }
      }
    }).finally(() => {
      setSpinFlag(false);
    });
  }, [detailFormDs]);

  // 渲染定位轴中的link
  const linkList = [
    {
      key: 'basicInfo',
      title: intl.get('hzero.common.view.title.baseInfo').d('基本信息'),
    },
    {
      key: 'extendedInfo',
      title: intl.get('hitf.common.extended.info').d('扩展信息'),
    },
    {
      key: 'params',
      title: intl.get('hitf.common.params.maintenance').d('参数维护'),
    },
    {
      key: 'dataConversion',
      title: intl.get('hitf.common.data.conversion').d('数据转换-入参'),
    },
  ];

  const renderLinks = () => {
    return linkList.map((link) => <Link href={`#${link.key}`} title={link.title} />);
  };

  const basicInfoRender = useMemo(() => {
    return (
      <Card id="basicInfo" bordered={false}>
        <div className={styles['card-title']}>
          {intl.get('hzero.common.view.title.baseInfo').d('基本信息')}
        </div>
        <BasicInfo formDs={detailFormDs} serviceType={serviceType} editFlag={Boolean(id)} />
      </Card>
    );
  }, [detailFormDs]);

  const extendedInfoRender = useMemo(() => {
    return (
      <Card id="extendedInfo" bordered={false}>
        <div className={styles['card-title']}>
          {intl.get('hitf.common.extended.info').d('扩展信息')}
        </div>
        <ExtendedInfo formDs={detailFormDs} serviceType={serviceType} />
      </Card>
    );
  }, [detailFormDs]);

  const handleTabKey = useCallback((value) => {
    setTabKey(value);
  }, []);

  // 关联脚本
  const relationScriptRender = useMemo(() => {
    return (
      <Card id="tenant-relationScript" bordered={false}>
        <div className={styles['card-title']}>
          {intl.get('hitf.common.associated.script').d('关联脚本')}
        </div>
        <RelationScript tableDs={detailRelationTableDs} id={id} />
      </Card>
    );
  }, [detailRelationTableDs]);

  const paramsRender = useMemo(() => {
    return (
      <Card id="params" bordered={false} className={styles['params-content']}>
        <Tabs activeKey={tabKey} onChange={handleTabKey}>
          <TabPane tab={intl.get('hitf.common.params.maintenance.request').d('参数维护-请求')} key="params">
            <Params id={id} paramsCreateDs={paramsCreateDs} tableDs={paramsTableDs} childRef={paramsRef} tabKey={tabKey} />
          </TabPane>
          <TabPane tab={intl.get('hitf.common.params.maintenance.response').d('参数维护-反馈')} key="response">
            <Params id={id} paramsCreateDs={responseCreateDs} tableDs={responseTableDs} childRef={responseRef} tabKey={tabKey} />
          </TabPane>
        </Tabs>
      </Card>
    );
  }, [paramsCreateDs, paramsTableDs, responseCreateDs, responseTableDs, tabKey]);

  const dataConversionProps = useMemo(() => {
    return {
      tableDs: detailTableDs,
      dataFormDs,
      dataConversionDs,
      dataScriptDs,
      dataInputDs,
      dataOutputDs,
      id,
      childRef: dataConversionRef,
    };
  }, [detailTableDs, dataFormDs, dataConversionDs, dataScriptDs, dataInputDs, dataOutputDs]);

  const dataConversionRender = useMemo(() => {
    return (
      <Card id="dataConversion" bordered={false}>
        <div className={styles['card-title']}>
          {intl.get('hitf.common.data.conversion').d('数据转换-入参')}
        </div>
        <DataConversion {...dataConversionProps} />
      </Card>
    );
  }, [detailTableDs, dataFormDs, dataConversionDs, dataScriptDs, dataInputDs, dataOutputDs]);

  // 处理保存/发布时的【参数】数据
  const handleParamData = useCallback((paramsTree, paramsHeaderValue, type) => {
    const paramsTableData = type ? responseTableDs.toJSONData() : paramsTableDs.toJSONData();
    paramsTree.forEach((item: any) => {
      const lines = paramsTableData.filter((lineItem: any) => lineItem.interfaceParamHeaderId === item.id);
      paramsHeaderValue.push({
        id: item.id,
        paramHeaderCode: item.paramHeaderCode,
        paramHeaderName: item.paramHeaderName,
        openInterfaceParamLines: lines,
      });
      if (!isEmpty(item.openInterfaceParamHeaders)) {
        handleParamData(item.openInterfaceParamHeaders, paramsHeaderValue, type);
      }
    });
    return paramsHeaderValue;
  }, [paramsTableDs, responseTableDs]);

  // 保存或发布
  const handleAction = useCallback(async (type) => {
    const validate = await detailFormDs.validate();
    const paramsTableValidate = await paramsTableDs.validate();
    const relationTableValidate = await detailRelationTableDs.validate();
    const responseTableValidate = await responseTableDs.validate();

    // 保存时关闭排序
    const dataConversionChild: any = dataConversionRef.current;
    const { setOrderFlag } = dataConversionChild;
    setOrderFlag(false);

    // 校验参数维护-反馈是否只有一个响应标识
    const isResponseArr: string[] = [];
    responseTableDs.forEach((item) => {
      if (item.get('isResponse') === '1') {
        isResponseArr.push(item.get('isResponse'));
      }
    });
    if (isResponseArr.length > 1) {
      notification.warning({
        message: intl.get('hitf.common.isResponse.field.only').d('响应字段有且只能有一个'),
      });
    }

    if (!validate || !paramsTableValidate || !relationTableValidate || !responseTableValidate || isResponseArr.length > 1) {
      return;
    }
    // 数据转换-排序
    const interfaceConvertTnDTOS: any = [];
    detailTableDs.forEach((item, index) => {
      const { objectVersionNumber, openInterfaceConvertId } = item.get(['objectVersionNumber', 'openInterfaceConvertId']);
      interfaceConvertTnDTOS.push({ objectVersionNumber, openInterfaceConvertId, orderSeq: index + 1 });
    });
    const formValue = detailFormDs.current ? detailFormDs.current.toJSONData() : {};
    // 处理【参数】数据
    const paramsHeaderValue: Object[] = [];
    const paramsTreeValue: any = paramsRef.current;
    const { paramsTree = [] } = paramsTreeValue;
    const paramsHeaderValueAfterHandle = handleParamData(paramsTree, paramsHeaderValue, false);
    // 处理【参数维护-反馈】数据
    const responseHeaderValue: Object[] = [];
    const responseTreeValue: any = responseRef.current;
    const { paramsTree: responseTree = [] } = responseTreeValue || {};
    const responseHeaderValueAfterHandle = handleParamData(responseTree, responseHeaderValue, true);
    // 关联脚本数据
    const relationScriptData: any[] = detailRelationTableDs.toData();
    const relationValidate = handleRelationCheck(relationScriptData);
    if (!relationValidate) {
      return;
    }
    const tenantId = detailFormDs.current ? detailFormDs.current.get('tenantId') : null;
    relationScriptData.forEach(item => {
      // eslint-disable-next-line no-param-reassign
      item.interfaceId = id;
      // eslint-disable-next-line no-param-reassign
      item.tenantId = tenantId;
    });
    const paramsValue = {
      interfaceId: id,
      ...formValue,
      openInterfaceParamHeaders: paramsHeaderValueAfterHandle,
      openInterfaceResponseHeaders: responseTreeValue ? responseHeaderValueAfterHandle : null,
      openScriptList: relationScriptData,
      interfaceConvertTnDTOS,
    };
    setSpinFlag(true);
    saveDetail(paramsValue).then(res => {
      const result = getResponse(res);
      if (result) {
        if (type === 'publish') {
          publishDetail(id).then(publishRes => {
            const publishResult = getResponse(publishRes);
            if (publishResult) {
              // 发布成功后查询详情页数据
              notification.success({});
              if (isTenant) {
                history.push({
                  pathname: '/hitf/interface-configuration-workbench/list',
                  state: {
                    active: 'apiManage',
                  },
                });
              } else {
                history.push({
                  pathname: `/hitf/interface-definition/list`,
                });
              }
            }
          });
        } else {
          // 新建保存后，路由更新为带id的地址
          if (!id) {
            history.push({
              pathname: `/hitf${isTenant ? '/interface-configuration-workbench' : ''}/interface-definition/detail/${result.interfaceId}`,
              state: {
                selectedData: {
                  serviceType: result.serviceType,
                },
              },
            });
          } else {
            getDetail();
            paramsTableDs.query();
            responseTableDs.query();
            detailRelationTableDs.query();
            detailTableDs.query();
          }
          notification.success({});
        }
      }
    }).finally(() => {
      setSpinFlag(false);
    });
  }, [detailFormDs, detailTableDs, responseTableDs, paramsTableDs, detailRelationTableDs]);

  // 删除
  const handleConfirm = useCallback(() => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      maskClosable: true,
      destroyOnClose: true,
      children: <div>{intl.get('hzero.common.component.excelExport.v.hd.deleteTemplate.confirm').d('确认删除吗')}</div>,
      onOk: handleDelete,
    });
  }, []);

  const handleDelete = useCallback(() => {
    deleteDetail(id).then(res => {
      const result = getResponse(res);
      if (result) {
        notification.success({});
        // 回到列表页
        handleBack();
      }
    });
  }, []);

  // 操作记录
  const getOperationRecord = useCallback(() => {
    Modal.open({
      title: intl.get('hzero.common.status.historys').d('操作记录'),
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      children: <OperationRecord id={id} />,
      // footer: (_onOk, _, modal) => <Button onClick={() => { modal.close(); }}>{intl.get('hzero.common.btn.close').d('关闭')}</Button>,
      okText: intl.get('hzero.common.btn.close').d('关闭'),
      cancelButton: false,
      className: styles['operation-record-drawer'],
    });
  }, []);

  // 回到列表页
  const handleBack = useCallback(() => {
    if (isTenant) {
      history.push({
        pathname: '/hitf/interface-configuration-workbench/list',
        state: {
          active: 'apiManage',
        },
      });
    } else {
      history.push({
        pathname: '/hitf/interface-definition/list',
      });
    }
  }, []);

  return (
    <div className={styles['interface-definition-spin']}>
      <Spin spinning={spinFlag}>
        <Header
          backPath='/hitf/interface-definition/list'
          customBack={handleBack}
          title={intl.get('hitf.interface.definition.detail.title.header').d('接口详情')}
        >
          <Button
            icon="near_me"
            color={ButtonColor.primary}
            disabled={!id || Boolean(statusFlag)} // 新建或已发布不可发布
            onClick={() => handleAction('publish')}
          >
            {intl.get('hzero.common.button.publish').d('发布')}
          </Button>
          <Button
            icon="save"
            funcType={FuncType.flat}
            onClick={() => handleAction('save')}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="delete"
            funcType={FuncType.flat}
            disabled={!id || Boolean(publishFlag)} // 新建或已发布不可删除
            onClick={handleConfirm}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button
            icon="wysiwyg"
            funcType={FuncType.flat}
            disabled={!id}
            onClick={getOperationRecord}
          >
            {intl.get('hzero.common.button.record').d('操作记录')}
          </Button>
        </Header>
        <div
          id="interface-definition-detail"
          className={styles['interface-definition-detail']}
        >
          <Content>
            {basicInfoRender}
          </Content>
          <Content>
            {extendedInfoRender}
          </Content>
          <Content>
            {relationScriptRender}
          </Content>
          <Content>
            {paramsRender}
          </Content>
          <Content>
            {dataConversionRender}
          </Content>
          <PositionAnchor getContainer={() => document.getElementById('interface-definition-detail')}>
            {renderLinks()}
          </PositionAnchor>
        </div>
      </Spin>
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application', 'hitf.interface'],
})(Detail));
