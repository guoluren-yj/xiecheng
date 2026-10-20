import React, { useEffect, useState, useMemo } from 'react';
import { flowRight, throttle } from 'lodash';
import qs from 'qs';
import { observer } from 'mobx-react-lite';
import { Button, DataSet, Attachment, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
// import uuidv4 from 'uuid/v4';

import { Header, Content } from 'components/Page';
import { PRIVATE_BUCKET } from '_utils/config';

import { fetchCancelApply } from '@/services/product/shelfApply';
import BaseInfo from './BaseInfo';
import LineDetail from './LineDetail';
import RecordTimeLine from './Record';
import { baseInfoDs, lineDs } from './ds';
import lineRender from './Record/agmHeader';
import { handleSave, handleSubmit, deleteApply } from './funcUtils';
import styles from '../style.less';

const lineSearchCode = 'SMPC.SHELF_APPLY.LINE.SEARCH_BAR';

const SubContent = (props) => {
  const { id, title, style, children } = props;
  return (
    <div className={styles['sub-content-container']} id={id} style={style}>
      <div className="sub-content-header">
        <span>{title}</span>
      </div>
      <div className="sub-content-body">{children}</div>
    </div>
  );
};

const ObserverBtn = observer(
  ({
    dataSet,
    children,
    disabled,
    getDisabled = () => false,
    getLoading = () => false,
    ...others
  }) => {
    const _disabled = getDisabled(dataSet) || disabled;
    const _loading = getLoading(dataSet);
    return (
      <Button {...others} disabled={_disabled} loading={_loading}>
        {children}
      </Button>
    );
  }
);

function Detail(props) {
  const {
    match: {
      params: { status = '' },
    },
    location: { search = '' },
    history: { push },
  } = props;
  const { applyHeaderId: aId } = qs.parse(search.substr(1));
  const [readOnly, setReadOnly] = useState(true);
  const [{ applyHeaderId, applyStatus, applyCode }, setInitData] = useState({
    applyHeaderId: aId,
    applyStatus: 'NEW',
  });

  useEffect(() => {
    const _readOnly = status === 'read' || applyStatus !== 'NEW';
    setReadOnly(_readOnly);
  }, [status, applyStatus]);

  const headerDs = useMemo(() => new DataSet(baseInfoDs({ applyHeaderId })), [applyHeaderId]);
  const detailDs = useMemo(() => new DataSet(lineDs(lineSearchCode)), []);
  useEffect(() => {
    initData();
    detailDs.setQueryParameter('applyHeaderId', applyHeaderId);
  }, [applyHeaderId, status]);

  async function initData() {
    // console.log('初始化');
    if (applyHeaderId) {
      const headerRes = await headerDs.query();
      if (getResponse(headerRes)) {
        setInitData((pre) => ({ ...pre, ...headerRes }));
      }
    }
    // 第一次新建， 没有uuid,
  }

  // 删除审批申请
  function handleDeleteApply() {
    // const applyCode = headerDs.current.get('applyCode');
    Modal.confirm({
      title: (
        <span style={{ fontSize: 18 }}>
          {intl
            .get('smpc.ShelfApply.view.modal.delTitle', { value: applyCode })
            .d(`删除供应商下架申请${applyCode}`)}
        </span>
      ),
      children: (
        <span style={{ fontSize: 14 }}>
          {intl.get('smpc.ShelfApply.view.modal.confirmDel').d('确定删除供应商下架申请?')}
        </span>
      ),
      onOk: () => deleteApply(headerDs, backCallBack),
    });
  }

  function viewOperate() {
    const ds = new DataSet({
      autoQuery: false,
      paging: false,
      transport: {
        read: {
          url: `/smpc/v1/${getCurrentOrganizationId()}/sku-shelve-apply-operation-records`,
          method: 'GET',
        },
      },
    });
    ds.setQueryParameter('applyHeaderId', applyHeaderId);
    ds.query();
    Modal.open({
      title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
      drawer: true,
      style: { width: 742 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
      children: <RecordTimeLine dataSet={ds} renderer={(args) => lineRender(args, applyCode)} />,
    });
  }

  async function cancelApply() {
    const res = getResponse(await fetchCancelApply(headerDs.current.toData()));
    if (res) {
      setInitData((pre) => ({ ...pre, applyStatus: res.applyStatus }));
      notification.success();
      headerDs.query();
      detailDs.query(detailDs.currentPage);
    }
  }

  function refreshCallback(data) {
    setInitData((pre) => ({ ...pre, ...data }));
    if (applyHeaderId) {
      headerDs.query();
      // if (getResponse(res)) {
      detailDs.setQueryParameter('applyHeaderId', data.applyHeaderId);
      detailDs.query();
      // }
    }
  }

  function backCallBack() {
    push(`/smpc/shelf-apply/list`);
  }

  const headerBtns = useMemo(() => {
    const btns = [
      {
        text: intl.get('hzero.common.	button.submit').d('提交'),
        show: applyStatus === 'NEW' && !readOnly,
        color: 'primary',
        icon: 'check',
        dataSet: [headerDs, detailDs],
        getDisabled: (data) => data[1].totalCount === 0,
        getLoading: (dsList) => {
          return dsList[0].getState('group_loading');
        },
        event: throttle(() => handleSubmit(headerDs, backCallBack), 1000),
      },
      {
        text: intl.get('hzero.common.button.save').d('保存'),
        show: applyStatus === 'NEW' && !readOnly,
        wait: 2,
        getLoading: (dsList) => {
          return dsList[0].getState('group_loading');
        },
        icon: 'save',
        funcType: 'flat',
        dataSet: [headerDs, detailDs],
        event: throttle(() => handleSave(headerDs, refreshCallback), 1000),
      },
      {
        text: intl.get('hzero.common.button.edit').d('编辑'),
        show: applyStatus === 'NEW' && readOnly,
        icon: 'edit',
        funcType: 'flat',
        event: () => push(`/smpc/shelf-apply/detail/edit?applyHeaderId=${applyHeaderId}`),
      },
      {
        text: intl.get('hzero.common.button.delete').d('删除'),
        show: applyStatus === 'NEW' && !!applyHeaderId,
        icon: 'delete',
        funcType: 'flat',
        event: () => handleDeleteApply(headerDs, backCallBack),
      },
      {
        text: intl.get('smpc.ShelfApply.view.btn.cancelApply').d('取消申请'),
        icon: 'cancel',
        show: applyStatus === 'APPROVING',
        funcType: 'flat',
        event: cancelApply,
      },
      {
        text: intl.get('hzero.common.button.operation').d('操作记录'),
        icon: 'operation_service_request',
        show: !!applyHeaderId,
        funcType: 'flat',
        event: viewOperate,
      },
    ];
    return btns
      .filter((i) => i.show !== false)
      .map((btn) => {
        const { text, event, ...others } = btn;
        return (
          <ObserverBtn onClick={event} {...others}>
            {text}
          </ObserverBtn>
        );
        // const Btn = dataSet ? ObserverBtn : Button;
        // return (
        //   <Btn dataSet={dataSet} onClick={event} {...others}>
        //     {text}
        //   </Btn>
        // );
      });
  }, [headerDs, detailDs, applyHeaderId, status, readOnly, applyStatus, applyCode]);

  return (
    <>
      <Header
        title={intl.get('smpc.ShelfApply.view.title.applyDetail').d('申请详情')}
        backPath="/smpc/shelf-apply/list"
      >
        {headerBtns}
      </Header>
      <Content>
        <SubContent title={intl.get('smpc.ShelfApply.view.baseInfo').d('基本信息')}>
          <BaseInfo
            readOnly={readOnly}
            dataSet={headerDs}
            // applyStatus={applyStatus}
            lineDs={detailDs}
          />
        </SubContent>
        {applyHeaderId && (
          <SubContent title={intl.get('smpc.ShelfApply.view.lineDetail').d('商品明细')}>
            <LineDetail
              dataSet={detailDs}
              applyHeaderId={applyHeaderId}
              readOnly={readOnly}
              lineSearchCode={lineSearchCode}
              headerDs={headerDs}
            />
          </SubContent>
        )}
        {applyHeaderId && (
          <SubContent
            title={intl.get('smpc.ShelfApply.view.attachment').d('附件')}
            style={{ width: '50%' }}
          >
            <Attachment
              dataSet={headerDs}
              name="attachmentUuid"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="smpc-shelf-file"
              labelLayout="float"
              accept={['.rar', '.zip', '.doc', '.docx', '.pdf', 'image/*']}
              showValidation="newLine"
              readOnly={readOnly}
            />
          </SubContent>
        )}
      </Content>
    </>
  );
}

export default flowRight(
  formatterCollections({
    code: ['sagm.common', 'smpc.ShelfApply'],
  })
)(Detail);
