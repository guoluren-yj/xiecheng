/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import {
  Table,
  Radio,
  Row,
  Col,
  Button,
  TextArea,
  Tooltip,
  CheckBox,
  Modal,
  // Lov,
} from 'choerodon-ui/pro';
import { Icon, notification } from 'choerodon-ui';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getResponse } from '@/utils/utils';

import {
  fetchMatchBusiness,
  fetchAddedCount,
  fetchAddBusiness,
} from '@/services/riskBusinessService';

import { ReactExportButton } from './ReactExportButton';
import QueryBarMore from './QueryBarMore';
import './index.less';

const noResult = require('@/assets/noResult.svg');

let checkedList = [];
let selectList = []; // 缓存选择的数据
let inputCompany = '';
const { Column } = Table;

const tenantId = getCurrentOrganizationId();
const exportRequestUrl = `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/add-monitor-export`;
const { id: userId, realName, loginName } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};
const param = {
  userName: realName,
  loginName,
};

const BusinessAddModal = (props) => {
  const { businessListDS, addedListDS, onAddBusiness = () => {}, resultDetailDs } = props;

  const [radioValue, setRadioValue] = useState('A');
  const [matchList, setMatchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showAlertMsg, setShowAlert] = useState(false);
  const [okLoading, setOkLoading] = useState(false);
  const [amountFlag, setAmountFlag] = useState('added');
  const [isCheckAll, setCheckAll] = useState(false);

  useEffect(() => {
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    businessListDS.addEventListener('batchSelect', selectEvent);
    businessListDS.addEventListener('batchUnSelect', unselectEvent);
    businessListDS.addEventListener('load', handleLoadEvent);
    addedListDS.addEventListener('batchSelect', selectEvent);
    addedListDS.addEventListener('batchUnSelect', unselectEvent);
    addedListDS.addEventListener('load', handleLoadEvent);
    resultDetailDs.loadData([]);

    fetchAddedCount({}).then((res) => {
      // if (res.msg) {
      //   notification.info({
      //     message: res?.message ?? res?.msg ?? '',
      //   });
      //   return;
      // }
      if (getResponse(res)) {
        // 额度已用完,查询已添加的列表
        if (res && res.overQuota) {
          setAmountFlag('added');
          setShowAlert(true);
          setRefresh(true);
          addedListDS.query();
        } else {
          setAmountFlag('business');
          businessListDS.query();
        }
      }
    });

    return () => {
      businessListDS.removeEventListener('batchSelect', selectEvent);
      businessListDS.removeEventListener('batchUnSelect', unselectEvent);
      businessListDS.removeEventListener('load', handleLoadEvent);
      addedListDS.removeEventListener('batchSelect', selectEvent);
      addedListDS.removeEventListener('batchUnSelect', unselectEvent);
      addedListDS.removeEventListener('load', handleLoadEvent);
      businessListDS.data = [];
      addedListDS.data = [];
      businessListDS.reset();
      addedListDS.reset();
      selectList = [];
      checkedList = [];
      resultDetailDs.loadData([]);
      inputCompany = '';
    };
  }, []);

  useEffect(() => {
    const str1 = intl
      .get('sdat.monitorBusiness.view.message.addBusinessStr1')
      .d('请批量输入企业名称或简称查询，系统将自动匹配对应企业；多个企业请换行输入');
    const str2 = intl.get('sdat.monitorBusiness.view.message.eg').d('例:');
    const str3 = intl
      .get('sdat.monitorBusiness.view.message.zhenyun')
      .d('上海甄云信息科技有限公司');
    const str4 = intl
      .get('sdat.monitorBusiness.view.message.hand')
      .d('上海汉得信息技术股份有限公司');

    const placeHolder = `${str1}\n\n${str2} \n${str3}\n${str4}\n`;

    const dom = document.getElementById('monitor-business-textarea-left');

    if (dom) {
      dom.setAttribute('placeholder', placeHolder);
    }
  }, [radioValue]);

  // 监听勾选事件（表格）
  const selectEvent = ({ dataSet, records }) => {
    let count = selectList.length;

    records.forEach((rec) => {
      if (count < 20) {
        // 一定要避免重复添加，先检查一遍是否已经添加过该项
        let pointerIndex;
        // 拿到当前对象在selectList里的索引
        selectList.forEach((item, index) => {
          if (rec?.get('unifiedSocialCode') === item.unifiedSocialCode) {
            pointerIndex = index;
          }
        });
        // 移除，splice方法改变原数组
        // eslint-disable-next-line eqeqeq
        if (pointerIndex == undefined) {
          selectList.push(rec.toData());
          count++;
        }
      } else {
        // 总数达到20
        // 则多余的取消勾选
        // 取消勾选前，先检查一遍是否已经添加过，如果添加过一定切记不能取消
        let pointerIndex;
        // 拿到当前对象在selectList里的索引
        selectList.forEach((item, index) => {
          if (rec?.get('unifiedSocialCode') === item.unifiedSocialCode) {
            pointerIndex = index;
          }
        });
        // eslint-disable-next-line eqeqeq
        if (pointerIndex == undefined) {
          dataSet.unSelect(rec);
        }
      }
    });

    // 如果总数达到20，然后禁用没有被勾选的项
    dataSet.forEach((rec) => {
      const unifiedSocialCode = rec.get('unifiedSocialCode');
      // 如果这个记录并未被保存在list内，那么去掉此记录的勾选权
      if (!selectList.some((i) => i.unifiedSocialCode === unifiedSocialCode)) {
        rec.selectable = !(count === 20);
      }
    });

    setRefresh(true);
  };

  // 监听取消勾选事件（表格）
  const unselectEvent = ({ dataSet, records }) => {
    let count = selectList.length;

    // 把取消选择的对象从selectList移除
    records.forEach((rec) => {
      let pointerIndex;
      // 拿到当前对象在selectList里的索引
      selectList.forEach((item, index) => {
        if (rec?.get('unifiedSocialCode') === item.unifiedSocialCode) {
          pointerIndex = index;
        }
      });
      // 移除，splice方法改变原数组
      // eslint-disable-next-line eqeqeq
      if (pointerIndex != undefined) {
        selectList.splice(pointerIndex, 1);
        count--;
      }
    });

    // 如果总数达到20，然后禁用没有被勾选的项
    dataSet.forEach((rec) => {
      const unifiedSocialCode = rec.get('unifiedSocialCode');
      // 如果这个记录并未被保存在list内，那么去掉此记录的勾选权
      if (!selectList.some((i) => i.unifiedSocialCode === unifiedSocialCode)) {
        rec.selectable = !(count === 20);
      }
    });

    setRefresh(true);
  };

  // 监听处理数据载入（平台企业表格）（防止第一页已选满20后第二页还可以选）
  const handleLoadEvent = ({ dataSet }) => {
    if (selectList.length === 20) {
      dataSet.forEach((rec) => {
        const unifiedSocialCode = rec.get('unifiedSocialCode');
        // 如果这个记录并未被保存在list内，那么去掉此记录的勾选权
        if (!selectList.some((i) => i.unifiedSocialCode === unifiedSocialCode)) {
          rec.selectable = !(selectList.length === 20);
        }
      });
    } else {
      // 如果未满20条，那么数据都应该可选
      dataSet.forEach((rec) => {
        rec.selectable = true;
      });
    }
  };

  const columns = (type) => {
    return [
      type !== 'added' && { name: 'supplierCode' },
      { name: 'supplierName' },
      { name: 'unifiedSocialCode' },
    ].filter(Boolean);
  };

  /**
   * 删除列表中的某条数据
   */
  const handleRemoveItem = (item) => {
    if (amountFlag === 'added') {
      addedListDS.unSelect(item);
      addedListDS.forEach((rcd) => {
        if (rcd.get('unifiedSocialCode') === item.unifiedSocialCode) {
          addedListDS.unSelect(rcd);
        }
      });
      // 再遍历一遍缓存的数据
      addedListDS.cachedRecords.forEach((rcd) => {
        if (rcd.get('unifiedSocialCode') === item.unifiedSocialCode) {
          // 取消这个record的勾选
          rcd.isSelected = false;
          // 还需要去掉selectedList里的这条数据
          const inde = selectList.findIndex(
            (i) => i.unifiedSocialCode === rcd.get('unifiedSocialCode')
          );
          selectList.splice(inde, 1);
        }
      });
      handleLoadEvent({ dataSet: addedListDS });
    } else {
      businessListDS.unSelect(item);
      businessListDS.forEach((rcd) => {
        if (rcd.get('unifiedSocialCode') === item.unifiedSocialCode) {
          businessListDS.unSelect(rcd);
        }
      });
      // 再遍历一遍缓存的数据
      businessListDS.cachedRecords.forEach((rcd) => {
        if (rcd.get('unifiedSocialCode') === item.unifiedSocialCode) {
          // 取消这个record的勾选
          rcd.isSelected = false;
          // 还需要去掉selectedList里的这条数据
          const inde = selectList.findIndex(
            (i) => i.unifiedSocialCode === rcd.get('unifiedSocialCode')
          );
          selectList.splice(inde, 1);
        }
      });
      handleLoadEvent({ dataSet: businessListDS });
    }

    setRefresh(true);
  };

  /**
   * 绘制选择的数据列表
   */
  const drawSelectItem = () => {
    if (!selectList.length) {
      return (
        <div
          style={{
            lineHeight: '38px',
            color: 'rgba(0, 0, 0, 0.45)',
            textAlign: 'center',
            paddingTop: '0.2rem',
          }}
        >
          {intl.get('sdat.monitorBusiness.view.message.selectLeftList').d('请选择左侧列表数据')}
        </div>
      );
    }
    if (selectList.length) {
      return (
        <>
          <div
            style={{
              lineHeight: '38px',
              color: 'rgba(0, 0, 0, 0.45)',
              paddingLeft: '16px',
              position: 'sticky',
              top: '0',
              backgroundColor: '#fbfbfc',
              paddingTop: '0.2rem',
            }}
          >
            {intl.get('sdat.monitorBusiness.view.message.haveChecked').d('已勾选')}
            <a style={{ cursor: 'pointer', margin: '0 4px' }}>{selectList.length}</a>
            {intl.get('sdat.monitorBusiness.view.message.items').d('条数据')}
          </div>
          {selectList.map((item) => {
            return (
              <>
                <div className="select-item-row">
                  <span
                    style={{
                      display: 'inline-block',
                      width: '230px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.supplierName}
                  </span>
                  <Icon
                    type="cancel"
                    style={{
                      fontSize: '16px',
                      color: 'rgb(140, 140, 140)',
                      float: 'right',
                      marginTop: '10px',
                      marginRight: '16px',
                    }}
                    onClick={() => handleRemoveItem(item)}
                  />
                </div>
              </>
            );
          })}
        </>
      );
    }
  };

  const renderMiddleDom = () => {
    return showAlertMsg
      ? [
          // eslint-disable-next-line react/jsx-indent
          <div
            style={{
              background: 'rgba(25,132,247,0.10)',
              color: '#1984F7',
              lineHeight: '36px',
              height: '36px',
              marginBottom: '-0.1rem',
              width: '660px',
            }}
          >
            <span
              style={{ display: 'inline-block', width: '30px', textAlign: 'center' }}
              className="business-add-modal-alert-msg"
            >
              <Icon type="help" />
            </span>
            <div style={{ display: 'inline-block' }}>
              {intl
                .get('sdat.monitorBusiness.view.message.limitReached')
                .d(
                  '您所在的企业可添加监控数量已达上限，您还可以添加其他监控人员已添加监控的供应商'
                )}
            </div>
            <span style={{ float: 'right', marginRight: '10px' }}>
              <Icon onClick={() => setShowAlert(false)} type="close" />
            </span>
          </div>,
        ]
      : null;
  };

  const renderQueryBar = (prop) => {
    return <QueryBarMore {...prop} />;
  };

  const tableProps = {
    dataSet: businessListDS,
    queryFieldsLimit: 2,
    highLightRow: false,
    border: false,
    buttons: renderMiddleDom(),
    columns: columns(''),
    queryBar: renderQueryBar,
    // queryBarProps: {
    //   formProps: { labelLayout: 'float', style: { padding: '1px 0 0 8px' } },
    // },
    autoHeight: { type: 'maxHeight', diff: 40 },
  };

  const tableAddedProps = {
    dataSet: addedListDS,
    queryFieldsLimit: 2,
    highLightRow: false,
    border: false,
    buttons: renderMiddleDom(),
    columns: columns('added'),
    // queryBar: 'professionalBar',
    queryBar: renderQueryBar,
    // queryBarProps: {
    //   formProps: { labelLayout: 'float', style: { padding: '1px 0 0 8px' } },
    // },
    autoHeight: { type: 'maxHeight', diff: 40 },
  };

  const handleChange = (value) => {
    setRadioValue(value);
  };

  const handleInputCompany = (e) => {
    inputCompany = e.target.value.trim();
    setRefresh(true);
  };

  const addBusiness = () => {
    const list = [];

    if (radioValue === 'A') {
      if (selectList && selectList.length) {
        selectList.forEach((item) => {
          list.push({
            ...item,
            erpFlag: 0,
            socialCode: item.unifiedSocialCode,
            enterpriseName: item.supplierName,
            ...passParams,
          });
        });
      }
    }

    if (radioValue === 'B') {
      if (matchList.length && checkedList.length) {
        matchList.forEach((item) => {
          checkedList.forEach((item2) => {
            if (item.socialCode === item2) {
              list.push({
                ...item,
                erpFlag: 0,
                ...passParams,
              });
            }
          });
        });
      }
    }

    if (list.length > 20) {
      notification.info({
        message: intl
          .get('sdat.monitorBusiness.view.message.exceededLimit')
          .d('选择的数量超出20条限额'),
      });
      return;
    }
    if (list.length) {
      continueAddBusiness(list);
    } else {
      notification.info({
        message: intl
          .get('sdat.monitorBusiness.view.message.atLeastChoose')
          .d('请至少选择1家企业添加监控'),
      });
    }
  };

  /**
   * 添加企业
   */
  const continueAddBusiness = (codeList = []) => {
    const list = codeList.map((item) => {
      return {
        ...item,
        ...param,
      };
    });

    setOkLoading(true);
    fetchAddBusiness({ monitorList: list }).then((res) => {
      setOkLoading(false);
      if (getResponse(res)) {
        const sucMsg = intl.get('sdat.monitorBusiness.view.message.addSucceedCountOrg', {
          name: res?.successNum ?? 0,
        });
        const failedMsg = intl.get('sdat.monitorBusiness.view.message.fieldCount', {
          name: res?.failedNum ?? 0,
        });
        const failMsg = intl.get('sdat.monitorBusiness.view.message.insertFailMsgOrg', {
          name: res?.failedNum ?? 0,
        });
        const detailNode = (
          <a
            onClick={() => {
              handleResultDetail(res?.key ?? '');
            }}
          >
            {intl.get('hzero.common.view.title.detail').d('详情')}
          </a>
        );

        const { successNum = 0, failedNum = 0 } = res || {};
        // 全部添加成功，弹窗关闭
        if (successNum && !failedNum) {
          notification.success({
            message: intl.get('sdat.monitorBusiness.view.message.insertSuccess').d('添加成功'),
            description: (
              <>
                {`${sucMsg}`},&nbsp;
                {intl.get('sdat.monitorBusiness.message.check').d('点击查看')}
                {detailNode}
              </>
            ),
          });
          onAddBusiness();
          handleClose();
        }
        // 全部添加失败
        else if (!successNum && failedNum) {
          notification.info({
            message: intl.get('sdat.monitorBusiness.view.message.failInsert').d('添加失败'),
            description: (
              <>
                {`${failMsg}`},&nbsp;
                {intl.get('sdat.monitorBusiness.message.check').d('点击查看')}
                {detailNode}
              </>
            ),
          });
        }
        // 部分添加成功
        else {
          notification.open({
            message: intl.get('sdat.monitorBusiness.view.message.partlySuccess').d('部分添加成功'),
            description: (
              <>
                {`${sucMsg}${failedMsg}`},&nbsp;
                {intl.get('sdat.monitorBusiness.message.check').d('点击查看')}
                {detailNode}
              </>
            ),
            icon: <Icon type="warning" style={{ color: '#f16100' }} />,
          });
        }

        onAddBusiness();
        handleClose();
      }
    });
  };

  /**
   * 对象数组去重
   */
  const uniqueList = (arr) => {
    const result = [];
    const obj = {};
    for (let i = 0; i < arr.length; i++) {
      if (!obj[arr[i].socialCode]) {
        result.push(arr[i]);
        obj[arr[i].socialCode] = true;
      }
    }
    return result;
  };

  /**
   * 查询企业列表
   */
  const handleQueryCompany = () => {
    const companyList = inputCompany?.trim()?.split(/\n/) ?? [];
    if (companyList.length + matchList.length <= 20) {
      setLoading(true);
      fetchMatchBusiness({
        searchKeys: companyList,
      }).then((res) => {
        setLoading(false);
        if (getResponse(res)) {
          if (res.length) {
            setCheckAll(false);
          }
          checkedList = [];
          const pushArr = [...matchList, ...(res || [])].map((item) => {
            return {
              ...item,
              enterpriseCode:
                item.enterpriseCode || item.unifiedSocialCode || item.socialCode || item.creditCode,
            };
          });
          const uniqueData = uniqueList(pushArr);
          const dealSwData = uniqueData.map((item) => {
            const { searchWord } = item;
            // eslint-disable-next-line no-useless-escape
            const reg = /\[?([^\[\]]+)\]?/;
            if (reg.test(searchWord)) {
              return { ...item, searchWord: reg.exec(searchWord)[1] };
            } else return { ...item };
          });
          // const failedList = dealSwData.filter(item => !item?.successFlag);
          // const successList = dealSwData.filter(item => item?.successFlag);
          setMatchList([...dealSwData]);
          // if (failedList.length) {
          //   notification.info({
          //     message: intl.get('sdat.monitorBusiness.view.message.querySelectMuchFailed', {
          //       length: failedList.length,
          //       failedNameMsg: failedList.map(item => `【${item.searchWord}】`).join(','),
          //     }),
          //   });
          // }
          inputCompany = '';
          setRefresh(true);
        }
      });
    } else {
      notification.info({
        message: intl
          .get('sdat.monitorBusiness.view.message.querySelectMuch')
          .d('（待匹配企业总数+已匹配企业数）不得超过20家'),
      });
    }
  };

  /**
   * 切换对应的选择状态
   * @param {*} e
   * @param {*} item
   */
  const handleChangeCheckBox = (e, item) => {
    if (e) {
      checkedList.push(item);
    } else {
      const index = checkedList.indexOf(item);
      checkedList.splice(index, 1);
    }

    setRefresh(true);
  };

  /**
   * 全选操作
   * @param {*} e
   */
  const handleChangeCheckAll = (e) => {
    setCheckAll(e);
    checkedList = []; // 置空
    if (e) {
      // 全选
      matchList.forEach((item) => {
        if (!item.monitorFlag) {
          checkedList.push(item.socialCode);
        }
      });
    }
    setRefresh(true);
  };

  /**
   * 取消选择企业
   */
  const handleRemoveBusiness = (item) => {
    const list = [].concat(matchList);
    if (list.length) {
      list.forEach((result, index) => {
        if (result.socialCode === item.socialCode) {
          list.splice(index, 1);
        }
      });
    }

    setMatchList(list);
    inputCompany = `${inputCompany}${item.searchWord}\n`;
    setRefresh(true);
  };

  /**
   * 渲染匹配结果列表
   */
  const drowSelectList = () => {
    return (matchList || []).map((item) => {
      return (
        <div style={{ marginBottom: '16px' }} key={item.socialCode}>
          <CheckBox
            key={item.socialCode}
            value={item.socialCode}
            checked={checkedList.indexOf(item.socialCode) !== -1}
            disabled={item.monitorFlag}
            onChange={(e) => handleChangeCheckBox(e, item.socialCode)}
          >
            {item.enterpriseName}
          </CheckBox>
          {item.monitorFlag && (
            <span
              style={{
                color: '#4E5769',
                border: '1px solid rgba(201,205,212,1)',
                borderRadius: '2px',
                padding: '2px 4px',
                background: '#F2F3F5',
              }}
            >
              {intl.get('sdat.monitorBusiness.view.title.hadAdded').d('已添加')}
            </span>
          )}

          <Tooltip
            title={intl.get('sdat.monitorBusiness.view.title.removeResult').d('从结果中移除')}
          >
            <Icon
              type="close"
              style={{ cursor: 'pointer', float: 'right' }}
              onClick={() => handleRemoveBusiness(item)}
            />
          </Tooltip>
        </div>
      );
    });
  };

  const handleClose = () => {
    businessListDS.data = [];
    businessListDS.queryDataSet.data = [];
    addedListDS.data = [];
    addedListDS.queryDataSet.data = [];
    businessListDS.reset();
    addedListDS.reset();
    businessListDS.clearCachedRecords();
    addedListDS.clearCachedRecords();
    selectList = [];
    checkedList = [];
    inputCompany = '';
    if (props.modal) {
      props.modal.close();
    }
  };

  /**
   * handleResultDetail: 添加监控企业后点击详情展示弹窗
   * @param {*} key
   */
  const handleResultDetail = (key) => {
    resultDetailDs.setQueryParameter('key', key);
    resultDetailDs.query();
    Modal.open({
      title: intl.get('sdat.monitorBusiness.view.title.resultTip').d('结果提示'),
      closable: true,
      style: { width: '800px' },
      movable: false,
      children: (
        <div style={{ height: 'calc(100vh - 300px)' }}>
          <Table dataSet={resultDetailDs} autoHeight={{ type: 'maxHeight', diff: 40 }}>
            <Column name="number" width={70} />
            <Column name="enterpriseName" width={150} />
            <Column name="socialCode" width={150} />
            <Column
              name="result"
              renderer={({ text }) => {
                switch (text) {
                  case '1':
                    return intl
                      .get('sdat.monitorBusiness.model.error.nullSocailCode')
                      .d('添加失败!统一社会信用代码不得为空');
                  case '2':
                    return intl
                      .get('sdat.monitorBusiness.model.error.illegalRegister')
                      .d(
                        '注册地在中国香港、中国台湾以及境外的企业、社会组织、基金会、律所、学校和医院，暂不支持动态监控'
                      );
                  case '3':
                    return intl
                      .get('sdat.monitorBusiness.model.error.fakeOrg')
                      .d('添加失败!统一社会信用代码未查询到真实企业，不支持添加');
                  case '4':
                    return intl
                      .get('sdat.monitorBusiness.model.error.serviceError')
                      .d('添加失败!添加监控服务调用失败，请联系管理员处理');
                  case '5':
                    return intl
                      .get('sdat.monitorBusiness.model.error.amountOver')
                      .d('添加失败!添加监控企业数量超过租户可监控额度');
                  case '6':
                    return intl
                      .get('sdat.monitorBusiness.model.error.interfaceError')
                      .d('添加失败!数据应用接口请求响应异常，请联系管理员处理');
                  case '7':
                    return intl
                      .get('sdat.monitorBusiness.model.error.interfaceAbnormal')
                      .d('添加失败!接口请求响应异常，请联系管理员进行处理');
                  case '8':
                    return intl
                      .get('sdat.monitorBusiness.model.error.handshakeError')
                      .d('添加失败!接口请求握手失败，请联系管理员进行处理');
                  case '9':
                    return intl
                      .get('sdat.monitorBusiness.model.error.gateWayError')
                      .d('添加失败!接口请求网关异常，请联系管理员进行处理');
                  case '10':
                    return intl
                      .get('sdat.monitorBusiness.model.error.expireError')
                      .d('添加失败!客户未开通动态监控服务或服务已过期，请联系客户经理进行处理');
                  case '11':
                    return intl
                      .get('sdat.monitorBusiness.view.message.insertSuccess')
                      .d('添加成功');
                  case '12':
                    return intl.get('sdat.monitorBusiness.view.message.insertAgain').d('重复添加');
                  default:
                    return '';
                }
              }}
            />
          </Table>
        </div>
      ),
      footer: (okBtn) => (
        <>
          <ReactExportButton
            btnText={intl.get('hzero.common.button.confirm.export').d('导出')}
            exportRequestUrl={exportRequestUrl}
            funcType="flat"
            params={{ key }}
            // ds={blackListDs}
          />
          {okBtn}
        </>
      ),
    });
  };

  return (
    <div className="tenant-lov-modal">
      <div style={{ marginBottom: '8px', fontWeight: '500' }}>
        <form>
          <Radio name="radioType" value="A" checked={radioValue === 'A'} onChange={handleChange}>
            {intl.get('sdat.monitorBusiness.view.title.platformBusiness').d('平台企业')}
          </Radio>
          <Radio
            disabled={amountFlag === 'added'}
            name="radioType"
            value="B"
            checked={radioValue === 'B'}
            onChange={handleChange}
            style={{ marginLeft: '16px' }}
          >
            {intl.get('sdat.monitorBusiness.view.title.outsidePlatformBusiness').d('平台外企业')}
          </Radio>
        </form>
      </div>

      <div>
        {radioValue === 'A' ? (
          <div className="tenant-subscribe-modal-content">
            <div className="tenant-modal-left-table">
              <div className="add-subscribe-modal">
                {amountFlag === 'added' ? (
                  <Table {...tableAddedProps} />
                ) : (
                  <Table {...tableProps} />
                )}
              </div>
            </div>
            <div className="tenant-modal-select-list">{drawSelectItem()}</div>
          </div>
        ) : (
          <Row className="add-business-modal">
            <Col span={11}>
              <div className="add-business-modal-left-panel">
                <div className="add-business-modal-panel-title">
                  {intl.get('sdat.monitorBusiness.view.title.textPasteAdded').d('文本粘贴添加')}
                </div>
                <div
                  style={{ height: 'calc(100vh - 288px)', overflow: 'hidden', overflowY: 'scroll' }}
                >
                  <TextArea
                    id="monitor-business-textarea-left"
                    value={inputCompany}
                    cols={200}
                    autoSize
                    onInput={handleInputCompany}
                  />
                </div>
              </div>
            </Col>
            <Col span={2}>
              <div className="add-business-modal-center-panel">
                <Tooltip
                  title={intl.get('sdat.monitorBusiness.view.title.searchBusiness').d('查询企业')}
                >
                  <Button
                    loading={loading}
                    tooltip="none"
                    color="primary"
                    disabled={!inputCompany}
                    onClick={handleQueryCompany}
                    style={{ height: '48px' }}
                  >
                    {' '}
                    &gt;{' '}
                  </Button>
                </Tooltip>
              </div>
            </Col>
            <Col span={11}>
              <div className="add-business-modal-right-panel">
                <div className="add-business-modal-panel-title">
                  <span>
                    {intl.get('sdat.monitorBusiness.view.title.matchResult').d('匹配结果')}
                  </span>
                  &nbsp;&nbsp;
                  <span>{checkedList?.length ?? 0}/20</span>
                  <span style={{ float: 'right' }}>
                    <CheckBox checked={isCheckAll} onChange={handleChangeCheckAll}>
                      {intl.get('sdat.monitorBusiness.view.button.selectedAll').d('全选')}
                    </CheckBox>
                  </span>
                </div>
                {matchList.length ? (
                  <div className="list-container-box">{drowSelectList()}</div>
                ) : (
                  <div>
                    <div
                      style={{
                        width: '40px',
                        height: '45px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '0 auto',
                        marginTop: '200px',
                      }}
                    >
                      <img src={noResult} style={{ width: '38px' }} alt="noResult" />
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '10px', color: '#999' }}>
                      {intl.get('sdat.monitorBusiness.view.message.notDataFound').d('暂无匹配结果')}
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        )}
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: '0',
          width: '100%',
          height: '60px',
          lineHeight: '60px',
          zIndex: 100,
          background: 'transparent',
        }}
      >
        <Button color="primary" loading={okLoading} onClick={addBusiness}>
          {intl.get(`hzero.common.button.ok`).d('确定')}
        </Button>
        <Button onClick={handleClose}>{intl.get(`hzero.common.button.cancel`).d('取消')}</Button>
      </div>
    </div>
  );
};

export default BusinessAddModal;
