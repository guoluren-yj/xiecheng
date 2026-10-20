/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { Table, Row, Col, Button, TextArea, Tooltip, CheckBox } from 'choerodon-ui/pro'; // Radio
import { Icon, notification } from 'choerodon-ui';

import {
  fetchMatchBusiness,
  // fetchAddedCount,
  fetchAddBusiness,
} from '@/services/supplierBlacklistService';

import styles from './index.less';

const noResult = require('@/assets/noResult.svg');

let checkedList = [];
let selectList = []; // 缓存选择的数据
let existList = []; // 非合作供应商的已经添加的企业
let inputCompany = '';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();
const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

const BusinessAddModal = (props) => {
  const { businessListDS, onAddBusiness = () => {}, type } = props;

  const [radioValue, setRadioValue] = useState('A');
  const [matchList, setMatchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showAlertMsg, setShowAlert] = useState(false);
  const [okLoading, setOkLoading] = useState(false);
  // const [amountFlag, setAmountFlag] = useState('added');
  const [isCheckAll, setCheckAll] = useState(false);
  const [isInterMediate, setInterMediate] = useState(false);
  const [repeatList, setRepeatList] = useState();

  useEffect(() => {
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    if (type === 'cooperated') {
      setRadioValue('A');
    }

    if (type === 'query') {
      setRadioValue('B');
    }
  }, [type]);

  useEffect(() => {
    businessListDS.addEventListener('batchSelect', selectEvent);
    businessListDS.addEventListener('batchUnSelect', unselectEvent);
    businessListDS.addEventListener('load', handleLoadEvent);

    // fetchAddedCount({}).then((res) => {
    //   // 额度已用完,查询已添加的列表
    //   if (res) {
    //     if (res.msg) {
    //       notification.error({
    //         message: res?.message ?? res?.msg ?? '',
    //       });
    //       return;
    //     }
    //     setAmountFlag('added');
    //     setShowAlert(true);
    //     setRefresh(true);
    //   } else {
    //     setAmountFlag('business');
    //     businessListDS.query();
    //   }
    // });
    businessListDS.query();

    return () => {
      businessListDS.removeEventListener('batchSelect', selectEvent);
      businessListDS.removeEventListener('batchUnSelect', unselectEvent);
      businessListDS.removeEventListener('load', handleLoadEvent);
      businessListDS.data = [];
      businessListDS.reset();
      selectList = [];
      checkedList = [];
      existList = [];
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

  // 监听勾选事件（平台企业表格）
  const selectEvent = ({ dataSet, records }) => {
    let count = selectList.length;

    records.forEach((rec) => {
      if (count < 20) {
        // 一定要避免重复添加，先检查一遍是否已经添加过该项
        let pointerIndex;
        // 拿到当前对象在selectList里的索引
        selectList.forEach((item, index) => {
          if (rec?.get('supplierName') === item.supplierName) {
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
          if (rec?.get('supplierName') === item.supplierName) {
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
      const supplierName = rec.get('supplierName');
      // 如果这个记录并未被保存在list内，那么去掉此记录的勾选权
      if (!selectList.some((i) => i.supplierName === supplierName)) {
        rec.selectable = !(count === 20);
      }
    });

    setRefresh(true);
  };

  // 监听取消勾选事件（平台企业表格）
  const unselectEvent = ({ dataSet, records }) => {
    let count = selectList.length;

    // 把取消选择的对象从selectList移除
    records.forEach((rec) => {
      let pointerIndex;
      // 拿到当前对象在selectList里的索引
      selectList.forEach((item, index) => {
        if (rec?.get('supplierName') === item.supplierName) {
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
      const supplierName = rec.get('supplierName');
      // 如果这个记录并未被保存在list内，那么去掉此记录的勾选权
      if (!selectList.some((i) => i.supplierName === supplierName)) {
        rec.selectable = !(count === 20);
      }
    });

    setRefresh(true);
  };

  // 监听处理数据载入（平台企业表格）（防止第一页已选满20后第二页还可以选）
  const handleLoadEvent = ({ dataSet }) => {
    if (selectList.length === 20) {
      dataSet.forEach((rec) => {
        const supplierName = rec.get('supplierName');
        // 如果这个记录并未被保存在list内，那么去掉此记录的勾选权
        if (!selectList.some((i) => i.supplierName === supplierName)) {
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

  const columns = (typef) => {
    return [
      typef !== 'added' && { name: 'supplierCode', lock: 'left' },
      { name: 'supplierName', width: 200 },
      { name: 'unifiedSocialCode', width: 200 },
      { name: 'orgNo' },
      { name: 'registrationNo', width: 200 },
      { name: 'dunsNo' },
    ].filter(Boolean);
  };

  /**
   * 删除列表中的某条数据
   */
  const handleRemoveItem = (item) => {
    businessListDS.unSelect(item);
    businessListDS.forEach((rcd) => {
      if (rcd.get('supplierName') === item.supplierName) {
        businessListDS.unSelect(rcd);
      }
    });
    // 再遍历一遍缓存的数据
    businessListDS.cachedRecords.forEach((rcd) => {
      if (rcd.get('supplierName') === item.supplierName) {
        // 取消这个record的勾选
        rcd.isSelected = false;
        // 还需要去掉selectedList里的这条数据
        const inde = selectList.findIndex((i) => i.supplierName === rcd.get('supplierName'));
        selectList.splice(inde, 1);
      }
    });
    handleLoadEvent({ dataSet: businessListDS });
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
                <div
                  className={
                    item.supplierName &&
                    repeatList &&
                    repeatList.length &&
                    repeatList.includes(item.supplierName)
                      ? styles['repeat-item-row']
                      : styles['select-item-row']
                  }
                >
                  <Tooltip title={item.supplierName}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '80%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.supplierName}
                    </span>
                  </Tooltip>
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
              className={styles['business-add-modal-alert-msg']}
            >
              <Icon type="help" />
            </span>
            <div style={{ display: 'inline-block' }}>
              {intl
                .get('sdat.monitorBusiness.view.message.limitedReached')
                .d('可添加黑名单数量已达上限')}
            </div>
            <span style={{ float: 'right', marginRight: '10px' }}>
              <Icon onClick={() => setShowAlert(false)} type="close" />
            </span>
          </div>,
        ]
      : [
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
              className={styles['business-add-modal-alert-msg']}
            >
              <Icon type="info" />
            </span>
            <div style={{ display: 'inline-block' }}>
              {intl
                .get('sdat.monitorBusiness.view.message.atMostTwentyOrgs')
                .d('最多可选择20个黑名单公司')}
            </div>
            {/* <span style={{ float: 'right', marginRight: '10px' }}>
              <Icon onClick={() => setShowAlert(false)} type="close" />
            </span> */}
          </div>,
        ];
  };

  const tableProps = {
    dataSet: businessListDS,
    queryFieldsLimit: 2,
    highLightRow: false,
    border: false,
    buttons: renderMiddleDom(),
    columns: columns(''),
    queryBar: 'professionalBar',
    queryBarProps: { formProps: { labelLayout: 'float', style: { paddingTop: '0.1rem' } } },
    autoHeight: { type: 'maxHeight', diff: 40 },
  };

  // const handleChange = value => {
  //   setRadioValue(value);
  // };

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
            if (item.enterpriseName === item2) {
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
      notification.error({
        message: intl
          .get('sdat.monitorBusiness.view.message.exceededLimited')
          .d('选择的数量超出20条限额'),
      });
      return;
    }
    if (list.length) {
      continueAddBusiness(list);
    } else {
      notification.error({
        message: intl
          .get('sdat.monitorBusiness.view.message.atLeastChooseOne')
          .d('请至少选择1家企业添加到黑名单'),
      });
    }
  };

  /**
   * 添加企业
   */
  const continueAddBusiness = (codeList = []) => {
    const list = codeList.map((item) => {
      const { dunsNo, linkMan, registrationNo, unifiedSocialCode, supplierName } = item;
      return radioValue === 'A'
        ? {
            ...item,
            dunsNumber: dunsNo,
            link: linkMan,
            socialCode: unifiedSocialCode,
            enterpriseName: supplierName,
            businessNo: registrationNo,
          }
        : { ...item };
    });
    setOkLoading(true);
    fetchAddBusiness({ infoList: list, source: radioValue === 'A' ? 0 : 1 }).then((res) => {
      setOkLoading(false);
      setRepeatList([]);
      if (getResponse(res)) {
        const sucMsg = intl.get('sdat.monitorBusiness.view.message.addSucceedCount', {
          name: res?.successNum ?? 0,
        });
        const failedMsg = intl.get('sdat.monitorBusiness.view.message.fieldCount', {
          name: res?.failedNum ?? 0,
        });
        const failMsg = intl.get('sdat.monitorBusiness.view.message.insertFailMsg', {
          name: res?.failedNum ?? 0,
        });

        // 合作供应商
        if (radioValue === 'A') {
          if (res.existFlag) {
            // 重复添加
            notification.open({
              message: intl.get('sdat.monitorBusiness.view.message.insertAgain').d('重复添加'),
              description: intl
                .get('sdat.monitorBusiness.view.message.insertAgainPro')
                .d(
                  '黑名单企业添加失败，失败原因是待添加列表中存在已添加黑名单企业，请检查企业的统一社会信用代码/组织机构代码/企业注册登记号/邓白氏编码是否唯一'
                ),
              icon: <Icon type="info" style={{ color: '#108ee9' }} />,
            });
            setRepeatList(res?.existList ?? []);
            setRefresh(true);
          } else {
            setRepeatList([]);
            notification.success({
              message: intl
                .get('sdat.monitorBusiness.view.message.businessAddedSuccess')
                .d('添加成功!'),
              description: `${sucMsg}${res.failedNum > 0 ? failedMsg : ''}`,
            });

            onAddBusiness();
            handleClose();
          }
        }
        // 如果是非合作企业
        else {
          const { successNum = 0, failedNum = 0, existFlag = false, existList: resExistList = [] } =
            res || {};
          // 多语言：另有name家供应商已在黑名单列表内，无需重复添加
          const existMsg = intl.get('sdat.monitorBusiness.view.message.sameAdded', {
            name: resExistList?.length ?? 0,
          });
          // 多语言：name家供应商已在黑名单列表内，无需重复添加
          const againMsg = intl.get('sdat.monitorBusiness.view.message.noNeedInsert', {
            name: resExistList?.length ?? 0,
          });

          // 全部添加成功，弹窗关闭
          if (successNum && !failedNum && !existFlag) {
            notification.success({
              message: intl.get('sdat.monitorBusiness.view.message.insertSuccess').d('添加成功'),
              description: sucMsg,
            });
            onAddBusiness();
            handleClose();
          }
          // 一部分成功，一部分重复
          else if (successNum && !failedNum && existFlag) {
            notification.success({
              message: intl.get('sdat.monitorBusiness.view.message.insertSuccess').d('添加成功'),
              description: `${sucMsg}${existMsg}`,
            });
            // 表明此时所有已勾选的数组数据都成功或重复，直接把勾选的数组里的数据加进existList
            checkedList.forEach((item) => {
              // item是企业名称
              // 我们需要确保这个项之前没有添加到本地数组existList
              const existObj = existList.find((i) => i === item);
              if (!existObj) existList.push(item);
            });
            checkedList = []; // 清空已经勾选的数据
            setRefresh(true);
          }
          // 全部都重复了
          else if (!successNum && !failedNum && existFlag) {
            notification.open({
              message: intl.get('sdat.monitorBusiness.view.message.insertAgain').d('重复添加'),
              description: againMsg,
              icon: <Icon type="info" style={{ color: '#108ee9' }} />,
            });
            // 把匹配结果里存在的项存入本地数组existList
            (res?.existList || []).forEach((item) => {
              // 还需要确保这个项之前没有添加到本地数组
              const existObj = existList.find((i) => i === item);
              if (!existObj) existList.push(item);
            });
            checkedList = []; // 清空已经勾选的数据
            setRefresh(true);
          }
          // 全部添加失败
          else if (!successNum && failedNum && !existFlag) {
            notification.error({
              message: intl.get('sdat.monitorBusiness.view.message.failInsert').d('添加失败'),
              description: failMsg,
            });
          }
          // 存在成功的，和失败的，不存在重复的
          else if (successNum && failedNum && !existFlag) {
            notification.open({
              message: intl
                .get('sdat.monitorBusiness.view.message.partlySuccess')
                .d('部分添加成功'),
              description: `${sucMsg}${failMsg}`,
              icon: <Icon type="warning" style={{ color: '#f16100' }} />,
            });
            // 清空勾选项
            checkedList = []; // 清空已经勾选的数据
            setRefresh(true);
          }
          // 存在成功的，失败的，重复的
          else if (successNum && failedNum && existFlag) {
            notification.open({
              message: intl
                .get('sdat.monitorBusiness.view.message.partlySuccess')
                .d('部分添加成功'),
              description: `${sucMsg}${failMsg}${existMsg}`,
              icon: <Icon type="warning" style={{ color: '#f16100' }} />,
            });
            // 把匹配结果里存在的项存入本地数组existList
            (res?.existList || []).forEach((item) => {
              // 还需要确保这个项之前没有添加到本地数组
              const existObj = existList.find((i) => i === item);
              if (!existObj) existList.push(item);
            });
            checkedList = []; // 清空已经勾选的数据
            setRefresh(true);
          }
        }
      }
    });
  };

  /**
   * 对象数组去重(企业名称enterpriseName)
   */
  const uniqueList = (arr) => {
    const result = [];
    const obj = {};
    for (let i = 0; i < arr.length; i++) {
      if (!obj[arr[i].enterpriseName]) {
        result.push(arr[i]);
        obj[arr[i].enterpriseName] = true;
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
        totalNum: companyList.length + matchList.length,
      }).then((res) => {
        setLoading(false);
        if (!res.failed) {
          if (res.length) {
            setCheckAll(false);
          }
          checkedList = [];
          const pushArr = [...matchList, ...(res || [])];
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
        } else {
          notification.error({
            message: res?.message ?? res?.msg ?? '',
          });
        }
      });
    } else {
      notification.error({
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
      // 检查是否全选
    } else {
      const index = checkedList.indexOf(item);
      checkedList.splice(index, 1);
    }
    checkSelectedStatus(); // 检查全选态
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
        if (item.enterpriseName) {
          if (existList.indexOf(item.enterpriseName) === -1) {
            checkedList.push(item.enterpriseName);
          }
        }
      });
    }
    checkSelectedStatus();
    setRefresh(true);
  };

  /**
   * 取消选择企业
   */
  const handleRemoveBusiness = (item) => {
    const list = [].concat(matchList);
    if (list.length) {
      list.forEach((result, index) => {
        if (result.enterpriseName === item.enterpriseName) {
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
  const drawSelectList = () => {
    return (matchList || []).map((item) => {
      return (
        <div style={{ marginBottom: '16px' }} key={item.enterpriseName}>
          <CheckBox
            key={item.enterpriseName}
            value={item.enterpriseName}
            checked={checkedList.indexOf(item.enterpriseName) !== -1}
            onChange={(e) => handleChangeCheckBox(e, item.enterpriseName)}
            disabled={existList.indexOf(item.enterpriseName) !== -1}
          >
            {item.enterpriseName}
          </CheckBox>
          {existList.indexOf(item.enterpriseName) !== -1 && (
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
    businessListDS.reset();
    businessListDS.clearCachedRecords();
    selectList = [];
    checkedList = [];
    inputCompany = '';
    if (props.modal) {
      props.modal.close();
    }
    if (typeof props.onClose === 'function') {
      props.onClose();
    }
  };

  /**
   * checkSelectedStatus: 获取匹配结果的选择状态
   */
  const checkSelectedStatus = () => {
    let count = 0;
    let existCount = 0;
    matchList.forEach((item) => {
      if (checkedList.indexOf(item.enterpriseName) !== -1) count++;
      if (existList.indexOf(item.enterpriseName) !== -1) existCount++;
    });
    if (count === 0) {
      setCheckAll(false);
      setInterMediate(false);
    } else if (count + existCount === matchList.length) {
      setCheckAll(true);
      setInterMediate(false);
    } else {
      setInterMediate(true);
      setCheckAll(false);
    }
  };

  return (
    <div className={styles['tenant-lov-modal']}>
      {/* <div style={{ marginBottom: '8px', fontWeight: '500' }}>
        <form>
          <Radio name="radioType" value="A" checked={radioValue === 'A'} onChange={handleChange}>
            {intl.get('sdat.monitorBusiness.view.title.cooperateSupplier').d('合作企业')}
          </Radio>
          <Radio
            disabled={amountFlag === 'added'}
            name="radioType"
            value="B"
            checked={radioValue === 'B'}
            onChange={handleChange}
            style={{ marginLeft: '16px' }}
          >
            {intl.get('sdat.monitorBusiness.view.title.incooperateSupplier').d('未合作企业')}
          </Radio>
        </form>
      </div> */}

      <div>
        {radioValue === 'A' ? (
          <div className={styles['tenant-subscribe-modal-content']}>
            <div className={styles['tenant-modal-left-table']}>
              <div className={styles['add-subscribe-modal']}>
                <Table {...tableProps} />
              </div>
            </div>
            <div className={styles['tenant-modal-select-list']}>{drawSelectItem()}</div>
          </div>
        ) : (
          <Row className={styles['add-business-modal']}>
            <Col span={11}>
              <div className={styles['add-business-modal-left-panel']}>
                <div className={styles['add-business-modal-panel-title']}>
                  {intl.get('sdat.monitorBusiness.view.title.textPasteAdded').d('文本粘贴添加')}
                </div>
                <div
                  style={{ height: 'calc(100vh - 286px)', overflow: 'hidden', overflowY: 'scroll' }}
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
              <div className={styles['add-business-modal-center-panel']}>
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
                    &gt;
                  </Button>
                </Tooltip>
              </div>
            </Col>
            <Col span={11}>
              <div className={styles['add-business-modal-right-panel']}>
                <div className={styles['add-business-modal-panel-title']}>
                  <span>
                    {intl.get('sdat.monitorBusiness.view.title.matchResult').d('匹配结果')}
                  </span>
                  &nbsp;&nbsp;
                  <span>{checkedList?.length ?? 0}/20</span>
                  <span style={{ float: 'right' }}>
                    <CheckBox
                      checked={isCheckAll}
                      onChange={handleChangeCheckAll}
                      indeterminate={isInterMediate}
                    >
                      {intl.get('sdat.monitorBusiness.view.button.selectedAll').d('全选')}
                    </CheckBox>
                  </span>
                </div>
                {matchList.length ? (
                  <div className={styles['list-container-box']}>{drawSelectList()}</div>
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
          background: 'transparent',
          zIndex: 100,
        }}
      >
        <Button color="primary" loading={okLoading} onClick={addBusiness}>
          {intl.get('hzero.common.button.ok').d('确定')}
        </Button>
        <Button onClick={handleClose}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
      </div>
    </div>
  );
};

export default BusinessAddModal;
