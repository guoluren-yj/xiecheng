/* eslint-disable no-param-reassign */
/**
 * 审核中心页面
 * @date: 2022-03-02
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Zhenyun
 */
import React, { useEffect, useState } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { DataSet, Table, useModal, Button, TextArea, CheckBox } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { queryIdpValue } from 'hzero-front/lib/services/api';

import { fetchAudit, fetchAuditLine } from '@/services/sdpsTransfer/auditCenterService';

import { TantentLovDS, AuditListDS, CheckModalListDS } from './stores/auditCenterDS';

import SearchBar from './SearchBar';
import AuditModalContent from './AuditModalContent';
import './index.less';

let rejectReason = '';
let localRecord = null;
let isChecked = false;

const checkBoxDS = new DataSet({
  autoCreate: true,
  fields: [{ name: 'bind2', type: 'boolean' }],
});

const AuditCenter = (props) => {
  const { lovDS, listDS, checkModalListDS } = props;

  const Modal = useModal();

  const [rejectWords, setWords] = useState('');
  const [statusList, setStatusList] = useState([]);

  useEffect(() => {
    queryIdpValue('SDAT.AUDIT_STATUS').then((res) => {
      if (res && res.length) {
        setStatusList(res);
      }
    });
    listDS.queryParameter = { sort: 'auditDate,asc', status: 'PENDING' };
    listDS.query();

    checkModalListDS.addEventListener('selectAll', handleLineSelectAll);
    checkModalListDS.addEventListener('unSelectAll', handleUnSelectAll);
    checkModalListDS.addEventListener('select', handleSelectItem);
    checkModalListDS.addEventListener('unSelect', handleSelectItem);

    return () => {
      checkModalListDS.removeEventListener('selectAll', handleLineSelectAll);
      checkModalListDS.removeEventListener('unSelectAll', handleUnSelectAll);
      checkModalListDS.removeEventListener('select', handleSelectItem);
      checkModalListDS.removeEventListener('unSelect', handleSelectItem);
      rejectReason = '';
      localRecord = null;
      isChecked = false;
      checkBoxDS.data = [];
      listDS.reset();
    };
  }, []);

  const setDsValue = (value) => {
    if (checkBoxDS.current) {
      checkBoxDS.current.set('bind2', value);
    }
  };

  const handleSelectItem = ({ dataSet }) => {
    isChecked = false;
    if (dataSet.selected.length === dataSet.totalCount) {
      // 全选
      isChecked = true;
    }
    setDsValue(isChecked);
  };

  const handleUnSelectAll = () => {
    isChecked = false;
    setDsValue(isChecked);
  };

  const handleLineSelectAll = () => {
    isChecked = true;
    setDsValue(isChecked);
  };

  const handleQuery = (params) => {
    listDS.queryParameter = {
      sort: 'auditDate,asc',
      status: 'PENDING',
      ...params,
    };
    listDS.query();
  };

  /**
   * 审核数据
   * @param {*} record
   */
  const handleCheck = (record) => {
    localRecord = record;
    openCheckModal(record, 'edit');
  };

  /**
   * 通过操作
   */
  const handleApprove = (callBack) => {
    if (checkModalListDS.selected.length) {
      const header = localRecord?.toData() ?? {};
      const list = checkModalListDS.selected.map((item) => item.toData());
      list.forEach((item) => {
        item.advice = '';
        item.status = 'PASS';
      });

      fetchAuditLine({
        header: {
          ...header,
          advice: '',
          status: 'PASS',
        },
        passLines: list,
      }).then((res) => {
        if (getResponse(res)) {
          isChecked = false;
          setDsValue(false);
          notification.success();
          checkModalListDS.query();
          callBack();
        }
      });
    } else {
      notification.error({
        message: intl.get('hzero.common.status.mistake').d('错误'),
        description: intl
          .get('sdps.auditCenter.view.message.selectNoData')
          .d('请选择需要操作的数据'),
      });
    }
  };

  /**
   *  驳回操作提交
   */
  const handleSubmit = (callback, callBack2) => {
    if (rejectReason) {
      const header = localRecord?.toData() ?? {};

      fetchAuditLine({
        header: {
          ...header,
          status: 'REJECT',
          advice: rejectReason,
        },
      }).then((res) => {
        if (getResponse(res)) {
          isChecked = false;
          setDsValue(false);
          notification.success();
          checkModalListDS.query();
          callback();
          callBack2();
        }
      });
    } else {
      notification.error({
        message: intl.get('hzero.common.status.mistake').d('错误'),
        description: intl.get('hzero.common.validate.notNull', {
          name: intl.get('sdps.auditCenter.view.message.rejectWords').d('驳回理由'),
        }),
      });
    }
  };

  /**
   * 输入驳回内容
   */
  const handleInput = (e) => {
    rejectReason = e?.target?.value?.trim() ?? '';
    setWords(rejectReason);
  };

  /**
   * 驳回操作
   */
  const handleReject = (callBack) => {
    if (!isChecked) {
      return;
    }

    const modal = Modal.open({
      title: intl.get('sdps.auditCenter.view.message.rejectWords').d('驳回理由'),
      drawer: true,
      closable: true,
      destroyOnClose: true,
      style: {
        width: '380px',
      },
      children: (
        <TextArea
          value={rejectWords}
          onInput={handleInput}
          placeholder={intl.get('sdps.auditCenter.view.message.inputRejectMsg').d('请输入驳回理由')}
          resize="vertical"
          cols={50}
          maxLength={255}
          required
        />
      ),
      footer: () => (
        <>
          <Button color="primary" onClick={() => handleSubmit(callBack, closeModal)}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.btn.cancel').d('取消')}</Button>
        </>
      ),
    });

    const closeModal = () => {
      setWords('');
      rejectReason = '';
      modal.close();
    };
  };

  /**
   * 打开审核弹窗
   */
  const openCheckModal = React.useCallback(
    (record, type) => {
      const title =
        type === 'edit'
          ? intl.get('sdps.auditCenter.view.title.dataAudit').d('数据订阅审核')
          : intl.get('sdps.auditCenter.view.title.viewTableData').d('查看表数据');

      const content = () => {
        return (
          <>
            <div>
              {intl
                .get('sdps.auditCenter.view.message.rejectMustSelectAll')
                .d('驳回仅支持全部数据驳回，是否全选？')}
            </div>
            <div>
              {intl.get('sdps.auditCenter.view.title.selectAll').d('全选')}
              &nbsp;&nbsp;
              <CheckBox name="bind2" dataSet={checkBoxDS} onChange={handleSelectAll} />
            </div>
          </>
        );
      };

      const handleSelectAll = (params) => {
        isChecked = params;
        if (params) {
          checkModalListDS.selectAll();
        } else {
          checkModalListDS.unSelectAll();
        }
        setDsValue(isChecked);
      };

      const modal = Modal.open({
        title,
        drawer: true,
        closable: true,
        destroyOnClose: true,
        style: {
          width: '742px',
        },
        children: <AuditModalContent localRecord={record} dataSet={checkModalListDS} />,
        afterClose: () => {
          isChecked = false;
          setDsValue(false);
        },
        footer: () => (
          <>
            {type === 'view' ? (
              <Button color="primary" onClick={closeModal}>
                {intl.get('hzero.common.status.closed').d('关闭')}
              </Button>
            ) : (
              <span>
                <Button color="green" onClick={() => handleApprove(closeModal)}>
                  {intl.get('hzero.common.button.approve').d('通过')}
                </Button>

                <Popover content={content} title="">
                  <Button color="red" onClick={() => handleReject(closeModal)}>
                    {intl.get('sdps.auditCenter.status.jumpAll').d('全部驳回')}
                  </Button>
                </Popover>

                <Button onClick={closeModal}>
                  {intl.get('hzero.common.btn.cancel').d('取消')}
                </Button>
              </span>
            )}
          </>
        ),
      });

      const closeModal = () => {
        localRecord = null;
        isChecked = false;
        setDsValue(false);
        checkModalListDS.data = [];
        checkModalListDS.reset();
        modal.close();
        listDS.query();
      };
    },
    [Modal]
  );

  /**
   * 查看表数据
   * @param {*} record
   */
  const handleViewTableData = (record) => {
    openCheckModal(record, 'view');
  };

  /**
   * 根据不同的状态显示不同的样式
   * @param {*} status
   */
  const switchStyle = (status) => {
    let clsName = '';
    switch (status) {
      case 'PASS':
        clsName = 'span-succeed';
        break;

      case 'REJECT':
        clsName = 'span-failed';
        break;

      case 'PENDING':
        clsName = 'span-wait';
        break;

      default:
        clsName = '';
    }

    return clsName;
  };

  const columns = () => {
    return [
      { name: 'objName' },
      { name: 'objNum' },
      { name: 'tenantName', width: 180 },
      { name: 'type' },
      {
        name: 'status',
        renderer: ({ text, record }) => {
          const classes = switchStyle(record.get('status'));
          return <span className={`status-span ${classes}`}>{text}</span>;
        },
      },
      { name: 'advice' },
      { name: 'submitterName' },
      { name: 'submitDate', width: 150 },
      { name: 'auditorName' },
      { name: 'auditDate', width: 150 },
      {
        name: 'operation',
        header: intl.get('hzero.common.table.column.options').d('操作'),
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              {record.get('status') === 'PENDING' ? (
                <a onClick={() => handleCheck(record)}>
                  {intl.get('sdps.auditCenter.view.btn.check').d('审核')}
                </a>
              ) : (
                <a onClick={() => handleViewTableData(record)}>
                  {intl.get('sdps.auditCenter.view.btn.viewDataTab').d('查看表数据')}
                </a>
              )}
            </span>
          );
        },
      },
    ];
  };

  /**
   * 批量拒绝 或通过
   */
  const handleApproveAmount = (type) => {
    if (listDS.selected.length) {
      const list = listDS.selected.filter((item) => item.get('status') !== 'PENDING');
      if (list.length) {
        notification.error({
          message: intl.get('hzero.common.status.mistake').d('错误'),
          description: intl
            .get('sdps.auditCenter.view.message.onlyPending')
            .d('只允许操作待审核状态的数据'),
        });
        return false;
      }

      if (type === 'no') {
        // 批量拒绝
        handleRejectBatch();
      } else {
        // 批量通过
        const paramList = listDS.selected.map((item) => item.toData());
        paramList.forEach((item) => {
          item.advice = '';
          item.status = 'PASS';
        });

        fetchAudit(paramList).then((res) => {
          if (getResponse(res)) {
            notification.success();
            listDS.query();
          }
        });
      }
    } else {
      notification.error({
        message: intl.get('hzero.common.status.mistake').d('错误'),
        description: intl
          .get('sdps.auditCenter.view.message.selectNoData')
          .d('请选择需要操作的数据'),
      });
    }
  };

  /**
   * 批量拒绝
   */
  const handleRejectBatch = () => {
    const modal = Modal.open({
      title: intl.get('sdps.auditCenter.view.message.rejectWords').d('驳回理由'),
      drawer: true,
      closable: true,
      destroyOnClose: true,
      style: {
        width: '380px',
      },
      children: (
        <TextArea
          value={rejectWords}
          onInput={handleInput}
          placeholder={intl.get('sdps.auditCenter.view.message.inputRejectMsg').d('请输入驳回理由')}
          resize="vertical"
          cols={50}
          maxLength={255}
          required
        />
      ),
      footer: () => (
        <>
          <Button color="primary" onClick={() => handleRejectContinue(closeModal)}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.btn.cancel').d('取消')}</Button>
        </>
      ),
    });

    const closeModal = () => {
      setWords('');
      rejectReason = '';
      modal.close();
      listDS.query();
    };
  };

  /**
   * 批量拒绝提交
   * @param {*} callback
   */
  const handleRejectContinue = (callback) => {
    if (rejectReason) {
      const list = listDS.selected.map((item) => item.toData());
      list.forEach((item) => {
        item.advice = rejectReason;
        item.status = 'REJECT';
      });

      fetchAudit(list).then((res) => {
        if (getResponse(res)) {
          notification.success();
          callback();
        }
      });
    } else {
      notification.error({
        message: intl.get('hzero.common.status.mistake').d('错误'),
        description: intl.get('hzero.common.validate.notNull', {
          name: intl.get('sdps.auditCenter.view.message.rejectWords').d('驳回理由'),
        }),
      });
    }
  };

  return (
    <>
      <Header title={intl.get('sdps.auditCenter.view.title.auditCenter').d('审核中心')}>
        <Button color="green" icon="check_circle" onClick={() => handleApproveAmount('ok')}>
          {intl.get('sdps.auditCenter.view.button.batchPass').d('批量通过')}
        </Button>
        <Button color="red" icon="cancel" onClick={() => handleApproveAmount('no')}>
          {intl.get('sdps.auditCenter.view.button.bulkRejection').d('批量拒绝')}
        </Button>
      </Header>
      <Content>
        <SearchBar onQuery={handleQuery} lovDS={lovDS} statusList={statusList} />
        <div
          style={{
            marginTop: '10px',
            // height: 'calc(100vh - 280px)',
          }}
        >
          <Table
            queryBar="none"
            columns={columns()}
            dataSet={listDS}
            customizable
            customizedCode="SDAT.AUDIT_CENTER_LIST"
            autoHeight={{ type: 'maxHeight', diff: 20 }}
          />
        </div>
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sdps.auditCenter', 'srm.filterBar'],
})(
  withProps(
    () => {
      const lovDS = new DataSet(TantentLovDS());
      const listDS = new DataSet(AuditListDS());
      const checkModalListDS = new DataSet(CheckModalListDS());
      return { listDS, lovDS, checkModalListDS };
    },
    { cacheState: true, keepOriginDataSet: true } // 缓存数据状态+保持原来的DataSet对象
  )(AuditCenter)
);
