import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { DataSet, Button, Form, Row, Col, Select, TextField, TextArea, Lov, Spin, useModal, Modal as ModalConfirm } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';

import { Header, Content } from 'hzero-front/lib/components/Page';
import notification from 'hzero-front/lib/utils/notification';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { omit } from 'lodash';
import { getResponse } from 'hzero-front/lib/utils/utils';

import {
  addEncryption,
  getEncryptionFormDetail,
  setSingleConfig,
  setBatchConfig,
  // setOffline,
  deleteApp,
  publishApp,
} from '@/services/InterfaceWorkplaceService';
// import offlineSvg from '@/assets/offline.svg';
import OperationRecord from './EncryOperationRecord';
import { detailFormDS, detailTableDS, detailModalDS } from '../EncryptionDs';
import Config from './Config';
import LineConfig from './LineConfig';

import styles from './index.less';

const Detail: React.FC<any> = (props) => {
  const { history } = props;
  const lineConfigRef = useRef();
  const Modal = useModal();
  // 详情页form表单
  const formDs = useMemo(() => new DataSet(detailFormDS()), []);
  // api信息表格
  const editHeaderId = window.location.pathname.includes('/encryption/detail') ? window.location.pathname.split('/encryption/detail/')[1] : null;
  const tableDs = useMemo(() => new DataSet(detailTableDS(editHeaderId)), []);
  // 配置弹窗form表单
  const detailModalDs = useMemo(() => new DataSet(detailModalDS()), []);
  // 行配置弹窗form表单
  const detailModalInDs = useMemo(() => new DataSet(detailModalDS()), []);
  const detailModalOutDs = useMemo(() => new DataSet(detailModalDS()), []);
  const [tipFlag, setTipFlag] = useState(true);
  const [loading, setLoading] = useState(false);
  // 状态新建值为true
  const [status, setStatus] = useState(true);
  // 批量配置弹窗数据
  const [batchInfo, setBatchInfo] = useState({});
  // 新建或编辑
  const editFlag = window.location.pathname.includes('/encryption/detail');

  // 回到列表页
  const goBack = () => {
    history.push({
      pathname: '/hitf/interface-configuration-workbench/list',
      state: {
        active: 'encryption',
      },
    });
  };

  useEffect(() => {
    if (formDs.current) {
      if (!editFlag) {
        // 新建
        formDs.current.set('status', 1);
      } else {
        // 编辑
        getDetail();
      }
    }
  }, []);

  useEffect(() => {
    const ds = [detailModalDs, detailModalInDs, detailModalOutDs];
    const fieldArr = ['encryDirection', 'encryMethod'];
    ds.forEach(item => {
      fieldArr.forEach((fieldValue) => {
        const field: any = item.getField(fieldValue);
        field.set('required', status);
      });
    });
  }, [status]);

  const getDetail = useCallback(() => {
    getEncryptionFormDetail(editHeaderId).then(res => {
      const result = getResponse(res);
      setBatchInfo(result || {});
      if (formDs.current) {
        formDs.current.set(result);
        setStatus(formDs.current.get('status') === '1');
      }
    });
  }, []);

  const formRender = useMemo(() => (
    <div className={styles['detail-form']}>
      <div className={styles['card-title']}>
        {intl.get('hzero.common.view.title.baseInfo').d('基本信息')}
      </div>
      {tipFlag && (
        <div className={styles['card-tip']}>
          <Icon type="help" />
          <div>
            {intl.get('hitf.common.encryption.basic.info.tip').d('若加密算法为非对称算法，请在接口发布前，将私钥信息保存，接口发布后，私钥信息不可见')}
          </div>
          <Icon type="close" onClick={() => { setTipFlag(false); }} />
        </div>
      )}
      <Form labelLayout={LabelLayout.float} dataSet={formDs}>
        <Row gutter={16}>
          <Col span={6}>
            <TextField name="encryCode" disabled={editFlag} restrict="a-zA-Z0-9-_./" />
          </Col>
          <Col span={6}>
            <TextField name="encryName" disabled={!status} />
          </Col>
          <Col span={6}>
            <Lov name="applicationNameLov" disabled={!status} />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Select name="status" disabled />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={18}>
            <TextArea name="remark" />
          </Col>
        </Row>
      </Form>
    </div>
  ), [formDs, tipFlag, status]);

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'interfaceCode',
      },
      {
        name: 'interfaceName',
      },
      {
        name: 'interfaceTypeMeaning',
      },
      {
        name: 'interfaceCategoryMeaning',
      },
      {
        name: 'encryLineId',
        renderer: ({ record }) => {
          return (
            <span
              className={styles['link-span']}
              onClick={() => openConfigModal({ record, batchFlag: false })}
            >
              {intl.get('hitf.common.encryption.config').d('接口加密配置维护')}
            </span>
          );
        },
      },
    ],
    [status]
  );

  // 检索
  const handleSearch = useCallback((params) => {
    let filterValues: { interfaceCode?: string } = params;
    const { interfaceCode = '' } = filterValues;
    filterValues = omit(filterValues, ['__dirty']);
    tableDs.setQueryParameter('queryParams', {
      ...filterValues,
      interfaceName: interfaceCode,
    });
    tableDs.query();
  }, [tableDs]);

  const tableRender = useMemo(() => (
    <div style={{ margin: '0.04rem' }}>
      <div className={styles['card-title']}>
        {intl.get('hitf.common.interfaceIds').d('关联接口')}
      </div>
      <SearchBarTable
        searchCode='HITF.INTERFACE_CONFIGURATION_WORKBENCH.ENCRY.DETAIL.FILTER'
        selectionMode={SelectionMode.none}
        columns={columns}
        dataSet={tableDs}
        searchBarConfig={{
          left: {
            render: (_, dataSet) => {
              return (
                <TextField
                  clearButton
                  dataSet={dataSet}
                  name="interfaceCode"
                  placeholder={intl
                    .get('hitf.interface.definition.filter.codeAndName')
                    .d('请输入接口编码、接口名称查询')}
                  prefix={<Icon type="search" />}
                  style={{ width: '280px', margin: '0 20px 4px 0', zIndex: 0 }}
                />
              );
            },
          },
          onQuery: ({ params }) => handleSearch(params),
          fieldProps: {
            tenantId: {
              lovPara: {
                tenantId: undefined,
              },
            },
          },
          closeFilterSelector: true,
          expandable: false,
        }}
      />
    </div>
  ), [tableDs, status, handleSearch]);

  const openConfigModal = useCallback(({ record, batchFlag }) => {
    let interfaceId = '';
    if (batchFlag && detailModalDs.current) {
      detailModalDs.current.set(batchInfo);
    }
    if (record) {
      const { encryDirection, encryMethod, tenantInterfaceId, publicKey, privateKey, objectVersionNumber } = record.get(['encryDirection', 'encryMethod', 'tenantInterfaceId', 'publicKey', 'privateKey', 'objectVersionNumber']);
      interfaceId = tenantInterfaceId;
      if (detailModalDs.current) {
        detailModalDs.current.set({ encryDirection, encryMethod, publicKey, privateKey, objectVersionNumber });
      }
    }
    const lineConfigProps = {
      tenantInterfaceId: interfaceId,
      editHeaderId,
      inFormDs: detailModalInDs,
      outFormDs: detailModalOutDs,
      childRef: lineConfigRef,
      appStatus: status,
    };
    // 已发布只显示关闭按钮（主按钮），其他状态显示确定和取消按钮
    const modalProps = status ? {
      onOk: () => handleOk(batchFlag, modal),
      cancelText: intl.get('hzero.common.btn.cancel').d('取消'),
    } : {
      okText: intl.get('hzero.common.btn.close').d('关闭'),
      cancelButton: false,
    };
    const modal = Modal.open({
      title: batchFlag ? intl.get('hitf.common.batch.configure').d('批量配置') : intl.get(`hitf.services.view.button.encryptConfig`).d('报文加密配置'),
      children: record ? <LineConfig {...lineConfigProps} /> : <Config formDs={detailModalDs} editHeaderId={editHeaderId} appStatus={status} />,
      drawer: true,
      maskClosable: true,
      closable: true,
      className: styles['encry-config'],
      // onOk: () => handleOk(batchFlag, modal),
      // cancelText: status ? intl.get('hzero.common.btn.cancel').d('取消') : intl.get('hzero.common.btn.close').d('关闭'),
      // okButton: status,
      ...modalProps,
    });
  }, [Modal, detailModalDs, detailModalInDs, detailModalOutDs, status, batchInfo]);

  const handleOk = useCallback(async (batchFlag, modal) => {
    const lineRef: any = lineConfigRef.current;
    const configFormDs = batchFlag ? detailModalDs : lineRef.lineTabKey === 'push' ? detailModalInDs : detailModalOutDs;
    const validateResult = await configFormDs.validate();
    if (!validateResult) {
      return false;
    }
    let formValue: any = {};
    if (configFormDs.current) {
      formValue = omit(configFormDs.current.toData(), ['__dirty', 'status']);
    }
    if (batchFlag) {
      ModalConfirm.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl.get('hitf.common.encry.modal.confirm.apply').d('请确认是否应用至全部接口')}
          </div>
        ),
      }).then((button) => {
        if (button === 'ok') {
          // 批量保存配置
          modal.close();
          setLoading(true);
          setBatchConfig({ ...formValue, encryHeaderId: editHeaderId }).then(res => {
            const result = getResponse(res);
            if (result) {
              notification.success({});
            }
          }).finally(() => {
            getDetail();
            setLoading(false);
          });
        }
      });
      return false;
    } else {
      // 单个保存配置
      setLoading(true);
      const { inStatus = false, outStatus = false } = formValue;
      let newFormValue = { ...formValue, status: lineRef.lineTabKey === 'push' ? inStatus ? 1 : 0 : outStatus ? 1 : 0 };
      newFormValue = omit(newFormValue, ['inStatus', 'outStatus']);
      setSingleConfig(newFormValue).then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success({});
        }
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [detailModalDs, detailModalInDs, detailModalOutDs]);

  // 保存
  const handleSave = useCallback(async () => {
    const validateResult = await formDs.validate();
    if (!validateResult) {
      return;
    }
    if (formDs.current) {
      let formValue = formDs.current.toData();
      formValue = omit(formValue, ['__dirty']);
      setLoading(true);
      addEncryption(formValue).then(res => {
        const result = getResponse(res);
        // 新建保存后，路由更新为带id的地址
        if (result) {
          notification.success({});
          if (!editFlag) {
            history.push({
              pathname: `/hitf/interface-configuration-workbench/encryption/detail/${result.encryHeaderId}`,
            });
          } else {
            getDetail();
          }
        }
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [formDs]);

  // 发布
  const handlePublish = useCallback(async () => {
    const validateResult = await formDs.validate();
    if (!validateResult) {
      return;
    }
    if (formDs.current) {
      let formValue = formDs.current.toData();
      formValue = omit(formValue, ['__dirty']);
      setLoading(true);
      const res = await addEncryption(formValue);
      const result = getResponse(res);
      if (result) {
        publishApp(editHeaderId).then(publishRes => {
          const publishResult = getResponse(publishRes);
          if (publishResult) {
            notification.success({});
            goBack();
          }
        }).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }
  }, [formDs]);

  // 删除
  const handleDelete = useCallback(() => {
    ModalConfirm.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <div>
          {intl.get('hzero.common.component.excelExport.v.hd.deleteTemplate.confirm').d('确认删除吗？')}
        </div>
      ),
    }).then((button) => {
      if (button === 'ok') {
        setLoading(true);
        deleteApp(editHeaderId).then(res => {
          const result = getResponse(res);
          if (result) {
            goBack();
          }
        }).finally(() => {
          setLoading(false);
        });
      }
    });
  }, []);

  // 下线
  // const handleOffline = useCallback(() => {
  //   ModalConfirm.confirm({
  //     title: intl.get('hzero.common.message.confirm.title').d('提示'),
  //     children: (
  //       <div>
  //         {intl.get('hitf.common.offline.confirm').d('确认下线吗？')}
  //       </div>
  //     ),
  //   }).then((button) => {
  //     if (button === 'ok') {
  //       setLoading(true);
  //       setOffline(editHeaderId).then(res => {
  //         const result = getResponse(res);
  //         if (result) {
  //           notification.success({});
  //           getDetail();
  //         }
  //       }).finally(() => {
  //         setLoading(false);
  //       });
  //     }
  //   });
  // }, []);

  // 操作记录
  const getOperationRecord = useCallback(() => {
    Modal.open({
      title: intl.get('hzero.common.status.historys').d('操作记录'),
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      children: <OperationRecord id={editHeaderId} />,
      cancelText: intl.get('hzero.common.btn.close').d('关闭'),
      cancelButton: false,
      className: styles['encry-operation-modal'],
    });
  }, []);

  return (
    <div className={styles['encry-spin']}>
      <Spin spinning={loading}>
        <Header
          backPath='/hitf/interface-configuration-workbench/list'
          customBack={goBack}
          title={
            <span>
              {intl.get('hitf.common.encryption.detail').d('接口加密配置详情')}
            </span>
          }
        >
          {editFlag && (
            <Button
              icon="near_me"
              color={ButtonColor.primary}
              onClick={handlePublish}
              disabled={!status}
            >
              {intl.get('hzero.common.release').d('发布')}
            </Button>
          )}
          <Button
            icon="save"
            funcType={FuncType.flat}
            onClick={handleSave}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {editFlag && (
            <>
              <Button
                icon="delete"
                funcType={FuncType.flat}
                onClick={handleDelete}
                disabled={!status}
              >
                {intl.get('hzero.common.btn.del').d('删除')}
              </Button>
              {/* <Button
                funcType={FuncType.flat}
                onClick={handleOffline}
                disabled={status}
              >
                <span style={{ marginRight: '0.05rem' }}>
                  <img src={offlineSvg} alt='' />
                </span>
                {intl.get('hzero.common.offline').d('下线')}
              </Button> */}
              <Button
                icon="operation_service_request"
                funcType={FuncType.flat}
                onClick={getOperationRecord}
              >
                {intl.get('hzero.common.status.operation').d('操作记录')}
              </Button>
              <Button
                icon="format_list_bulleted"
                funcType={FuncType.flat}
                onClick={() => openConfigModal({ batchFlag: true })}
              >
                {intl.get('hitf.common.batch.configure').d('批量配置')}
              </Button>
            </>
          )}
        </Header>
        <div className={styles['encry-detail']}>
          <Content>
            {formRender}
          </Content>
          {
            editFlag && (
              <Content>
                {tableRender}
              </Content>
            )
          }
        </div>
      </Spin>
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.interface', 'hitf.services', 'hitf.application'],
})(Detail));
