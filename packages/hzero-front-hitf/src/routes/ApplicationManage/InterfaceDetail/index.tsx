import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { isEmpty } from 'lodash';
import { Card, Tabs } from 'choerodon-ui';
import { DataSet, Button, Spin } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import PositionAnchor from 'srm-front-boot/lib/components/PositionAnchor';

import intl from 'hzero-front/lib/utils/intl';

import { Header, Content } from 'hzero-front/lib/components/Page';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';

import { detailFormDS, detailRelationTableDS, detailTableDS, paramsCreateDS, paramsTableDS, dataFormDS, dataConversionDS, dataScriptDS, dataInputDS, dataOutputDS } from '@/stores/ApplicationManage/InterfaceDS';
import { queryDetail, saveDetail } from '@/services/appManageInterfaceService';

import { handleRelationCheck } from '../../../utils/utils';

import BasicInfo from './BasicInfo';
import ExtendedInfo from './ExtendedInfo';
import RelationScript from './RelationScript';
import Params from './Params';
import DataConversion from './DataConversion';
import styles from './index.less';

const { Link } = PositionAnchor;
const { TabPane } = Tabs;

const Detail: React.FC<any> = ({ match: { params }, history: { location: { state: historyState = {} } } }) => {
  const { id = null } = params;
  const { serviceType } = historyState;
  if (serviceType) {
    window.sessionStorage.setItem('interfaceServiceType', serviceType);
  }
  // 考虑切换tab或者页面刷新的情况
  const serviceTypeValue = serviceType || window.sessionStorage.getItem('interfaceServiceType');
  const paramsRef = useRef();
  const responseRef = useRef();
  const dataConversionRef = useRef();

  const [state, setState] = useState({
    spinFlag: false,
    applicationHeaderId: null,
    tenantId: null,
    tabKey: 'params',
  });

  const {
    detailFormDs,
    detailRelationTableDs,
    detailTableDs,
    paramsCreateDs,
    paramsTableDs,
    responseCreateDs,
    responseTableDs,
    dataFormDs,
    dataConversionDs,
    dataScriptDs,
    dataInputDs,
    dataOutputDs,
  } = useMemo(() => {
    return {
      detailFormDs: new DataSet(detailFormDS(serviceTypeValue)),
      detailRelationTableDs: new DataSet(detailRelationTableDS(id)),
      detailTableDs: new DataSet(detailTableDS(id)),
      paramsCreateDs: new DataSet(paramsCreateDS()),
      paramsTableDs: new DataSet(paramsTableDS(id, false)),
      responseCreateDs: new DataSet(paramsCreateDS()),
      responseTableDs: new DataSet(paramsTableDS(id, true)),
      dataFormDs: new DataSet(dataFormDS(id)),
      dataConversionDs: new DataSet(dataConversionDS(id)),
      dataScriptDs: new DataSet(dataScriptDS()),
      dataInputDs: new DataSet(dataInputDS(id)),
      dataOutputDs: new DataSet(dataOutputDS(id)),
    };
  }, []);

  useEffect(() => {
    // 编辑查询数据
    getDetail();
  }, []);

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
    setState(preState => ({
      ...preState,
      spinFlag: true,
    }));
    queryDetail(id).then(res => {
      const result = getResponse(res);
      if (result && detailFormDs.current) {
        setState(preState => ({
          ...preState,
          applicationHeaderId: result.applicationHeaderId,
          tenantId: result.tenantId,
        }));
        detailFormDs.current.set(result);
      }
    }).finally(() => {
      setState(preState => ({
        ...preState,
        spinFlag: false,
      }));
    });
  }, [detailFormDs]);

  // 渲染定位轴中的link
  const linkList = [
    {
      key: 'tenant-basicInfo',
      title: intl.get('hzero.common.view.title.baseInfo').d('基本信息'),
    },
    {
      key: 'tenant-extendedInfo',
      title: intl.get('hitf.common.extended.info').d('扩展信息'),
    },
    {
      key: 'tenant-relationScript',
      title: intl.get('hitf.common.associated.script').d('关联脚本'),
    },
    {
      key: 'tenant-params',
      title: intl.get('hitf.common.params.maintenance').d('参数维护'),
    },
    {
      key: 'tenant-dataConversion',
      title: intl.get('hitf.common.data.conversion').d('数据转换-入参'),
    },
  ];

  const renderLinks = () => {
    return linkList.map((link) => <Link href={`#${link.key}`} title={link.title} />);
  };

  const basicInfoRender = useMemo(() => {
    return (
      <Card id="tenant-basicInfo" bordered={false}>
        <div className={styles['card-title']}>
          {intl.get('hzero.common.view.title.baseInfo').d('基本信息')}
        </div>
        <BasicInfo formDs={detailFormDs} serviceType={serviceTypeValue} />
      </Card>
    );
  }, [detailFormDs]);

  const extendedInfoRender = useMemo(() => {
    return (
      <Card id="tenant-extendedInfo" bordered={false}>
        <div className={styles['card-title']}>
          {intl.get('hitf.common.extended.info').d('扩展信息')}
        </div>
        <ExtendedInfo formDs={detailFormDs} serviceType={serviceTypeValue} />
      </Card>
    );
  }, [detailFormDs]);

  // 关联脚本
  const relationScriptRender = useMemo(() => {
    return (
      <Card id="tenant-relationScript" bordered={false}>
        <div className={styles['card-title']}>
          {intl.get('hitf.common.associated.script').d('关联脚本')}
        </div>
        <RelationScript tableDs={detailRelationTableDs} />
      </Card>
    );
  }, [detailRelationTableDs]);

  const handleTabKey = useCallback((value) => {
    setState(preState => ({
      ...preState,
      tabKey: value,
    }));
  }, []);
  const paramsRender = useMemo(() => {
    return (
      <Card id="tenant-params" bordered={false} className={styles['params-content']}>
        <Tabs activeKey={state.tabKey} onChange={handleTabKey}>
          <TabPane tab={intl.get('hitf.common.params.maintenance.request').d('参数维护-请求')} key="params">
            <Params id={id} paramsCreateDs={paramsCreateDs} tableDs={paramsTableDs} childRef={paramsRef} tenantId={state.tenantId} tabKey={state.tabKey} />
          </TabPane>
          <TabPane tab={intl.get('hitf.common.params.maintenance.response').d('参数维护-反馈')} key="response">
            <Params id={id} paramsCreateDs={responseCreateDs} tableDs={responseTableDs} childRef={responseRef} tenantId={state.tenantId} tabKey={state.tabKey} />
          </TabPane>
        </Tabs>
      </Card>
    );
  }, [paramsCreateDs, paramsTableDs, responseCreateDs, responseTableDs, state.tenantId, state.tabKey]);

  const dataConversionProps = useMemo(() => {
    return {
      tableDs: detailTableDs,
      dataFormDs,
      dataConversionDs,
      dataScriptDs,
      dataInputDs,
      dataOutputDs,
      id,
      tenantId: state.tenantId,
      childRef: dataConversionRef,
    };
  }, [detailTableDs, dataFormDs, dataConversionDs, dataScriptDs, dataInputDs, dataOutputDs, state.tenantId]);

  const dataConversionRender = useMemo(() => {
    return (
      <Card id="tenant-dataConversion" bordered={false}>
        <div className={styles['card-title']}>
          {intl.get('hitf.common.data.conversion').d('数据转换-入参')}
        </div>
        <DataConversion {...dataConversionProps} />
      </Card>
    );
  }, [detailTableDs, dataFormDs, dataConversionDs, dataScriptDs, dataInputDs, dataOutputDs, state.tenantId]);

  // 处理保存/发布时的【参数】数据
  const handleParamData = useCallback((paramsTree, paramsHeaderValue, type) => {
    const paramsTableData = type ? responseTableDs.toJSONData() : paramsTableDs.toJSONData();
    paramsTree.forEach((item: any) => {
      const lines = paramsTableData.filter((lineItem: any) => lineItem.interfaceParamHeaderId === item.id);
      lines.forEach((line: any) => {
        // eslint-disable-next-line no-param-reassign
        line.tenantInterfaceId = id;
      });
      paramsHeaderValue.push({
        id: item.id,
        paramHeaderCode: item.paramHeaderCode,
        paramHeaderName: item.paramHeaderName,
        objectVersionNumber: item.objectVersionNumber,
        openInterfaceParamLines: lines,
      });
      if (!isEmpty(item.openInterfaceParamHeaders)) {
        handleParamData(item.openInterfaceParamHeaders, paramsHeaderValue, type);
      }
    });
    return paramsHeaderValue;
  }, [paramsTableDs, responseTableDs]);

  // 保存
  const handleAction = useCallback(async () => {
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
      const { objectVersionNumber, openInterfaceConvertTnId } = item.get(['objectVersionNumber', 'openInterfaceConvertTnId']);
      interfaceConvertTnDTOS.push({ objectVersionNumber, openInterfaceConvertTnId, orderSeq: index + 1 });
    });
    const formValue = detailFormDs.current ? detailFormDs.current.toJSONData() : {};
    // 处理【参数】数据
    const paramsHeaderValue: Object[] = [];
    const paramsTreeValue: any = paramsRef.current;
    const { paramsTree = [], paramsTreeInit } = paramsTreeValue;
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
    relationScriptData.forEach(item => {
      // eslint-disable-next-line no-param-reassign
      item.tenantInterfaceId = id;
      // eslint-disable-next-line no-param-reassign
      item.tenantId = state.tenantId;
    });
    const paramsValue = {
      tenantInterfaceId: id,
      ...formValue,
      paramHeaderList: paramsHeaderValueAfterHandle,
      openInterfaceResponseHeaders: responseTreeValue ? responseHeaderValueAfterHandle : null,
      openScriptTnList: relationScriptData,
      interfaceConvertTnDTOS,
    };
    setState(preState => ({
      ...preState,
      spinFlag: true,
    }));
    saveDetail(paramsValue).then(res => {
      const result = getResponse(res);
      if (result) {
        getDetail();
        paramsTableDs.query();
        responseTableDs.query();
        paramsTreeInit();
        detailRelationTableDs.query();
        detailTableDs.query();
        notification.success({});
      }
    }).finally(() => {
      setState(preState => ({
        ...preState,
        spinFlag: false,
      }));
    });
  }, [detailFormDs, detailTableDs, paramsTableDs, responseTableDs, detailRelationTableDs, state.tenantId]);

  return (
    <div className={styles['app-api-detail']}>
      <Spin spinning={state.spinFlag}>
        <Header
          backPath={`/hitf${window.location.pathname.includes('interface-configuration-workbench') ? '/interface-configuration-workbench' : ''}/application-manage/detail/${state.applicationHeaderId}`}
          title={intl.get('hitf.interface.definition.detail.title.header').d('接口详情')}
        >
          <Button
            icon="save"
            color={ButtonColor.primary}
            onClick={handleAction}
          >
            {intl.get('hzero.common.button.save').d('保存')}
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
