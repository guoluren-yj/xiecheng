import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import { Modal, Form, Output } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { queryIdpValue } from 'services/api';

import { ReactComponent as NoContent } from '@/assets/risk/no_result.svg';
import { getResponse } from '@/utils/utils';
import { getMsgByLovCode } from '@/services/monitorStuffService'; // getMonitorStuffData
import { getNewsContent } from '@/services/eventUpdateSumService';

import style from './index.less';

const {
  options: { currentLocale, locales },
} = intl;
const intlMapObj = locales[`${currentLocale}`];

const commonFields = ['eventName', 'eventLevel', 'eventTime', 'dimension'];

const iframeKey = Modal.key();

const CommonDetail = (props) => {
  const {
    detail = {},
    dimensionCode = '',
    localRecord = {},
    showCommon = false,
    fieldWidth = '',
  } = props;

  const [codeMap, setCodeMap] = useState({});
  const [emotionMap, setEmotionMap] = useState({});
  const [categoryMap, setCategoryMap] = useState({});
  const [localFields, setLocalFields] = useState([]);
  const [roleTypeMap, setRoleTypeMap] = useState({});
  const [levelMap, setLevelMap] = useState({});

  useEffect(() => {
    queryIdpValue('SDAT.WORKBENCH_EVENT_LEVEL').then((res) => {
      if (getResponse(res) && res.length) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });

        const data = [];
        commonFields.forEach((item) => {
          data.push({
            u_id: uuid(),
            fieldName: item,
            level: String(localRecord[item]),
            label: intl.get(`sdat.riskControl.view.title.${item}`),
            value: item === 'eventLevel' ? obj[String(localRecord[item])] : localRecord[item],
          });
        });
        setLevelMap(obj);
        setLocalFields(data);
      }
    });

    // 角色类型
    queryIdpValue('SDAT.ROLE_TYPE_LIST').then((res) => {
      if (getResponse(res)) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        setRoleTypeMap(obj);
      }
    });

    // 情感类型
    queryIdpValue('SDAT.RISK_NEWS_EMOTION_TYPE').then((res) => {
      if (getResponse(res)) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        setEmotionMap(obj);
      }
    });

    // 类别
    queryIdpValue('SDAT.RISK_NEWS_CATEGORY').then((res) => {
      if (getResponse(res)) {
        const obj = {};
        res.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        setCategoryMap(obj);
      }
    });

    // 维度编码的值集
    getMsgByLovCode({ code: 'SDAT_EVENT_INDEX_PROCESS' }).then((res) => {
      const mapObj = {};
      (res || []).forEach((item) => {
        Object.assign(mapObj, { [item?.value]: { meaning: item?.meaning, tag: item?.tag } });
      });
      setCodeMap(mapObj);
    });
  }, []);

  const classMap = {
    3: style['incident-item-tag-high'],
    2: style['incident-item-tag-middle'],
    1: style['incident-item-tag-low'],
  };

  const renderTree = (details = {}, code = '') => {
    const obj = details ? { ...details } : {};

    if (code === '-1') {
      // 手工新建风险
      return renderManualNew(obj);
    }

    // 判断维度编码
    switch (String(codeMap[code]?.tag)) {
      case '1':
        return renderSeven(obj, code);
      case '2':
        return renderFive(obj, code);
      case '3':
        return renderPenals(obj, code, showCommon);
      case '4':
        return renderFour(obj, code);
      case '5':
        return renderDisaster(obj, code);
      default:
        break;
    }
  };

  // const renderTypeTag = ({ text = '', value = '' }) => {
  //   const typeColorMap = { none: '#F2F3F5', positive: 'green', negative: 'red' };
  //   return (
  //     text && (
  //       <Tag
  //         color={typeColorMap[value] || 'gray'}
  //         style={{
  //           cursor: 'default',
  //           borderColor: 'transparent',
  //           color: value === 'none' && '#4E5769',
  //         }}
  //       >
  //         {text}
  //       </Tag>
  //     )
  //   );
  // };

  const switchTitle = () => {
    switch (dimensionCode) {
      case 'docOther':
      case 'docDefendant':
      case 'docPlaintiff':
        return intl.get('sdat.riskControl.view.modalTitle.docOther').d('裁判文书详情');

      case 'announceOther':
      case 'announceDefendant':
      case 'announcePlaintiff':
        return intl.get('sdat.riskControl.view.modalTitle.announceOther').d('法院公告详情');

      case 'noticeOther':
      case 'noticeDefendant':
      case 'noticePlaintiff':
        return intl.get('sdat.riskControl.view.modalTitle.noticeOther').d('开庭公告详情');

      default:
        return '';
    }
  };

  const handleOpenIframe = (htmlContent) => {
    // const {
    //   Title: title,
    //   Source: source,
    //   PublishTime: publishTime,
    //   EmotionType: emotionType,
    //   NewsTags: newsTag,
    // } = record;

    // const emotionText = emotionMap[emotionType];
    // 处理a标签
    // const reg1 = htmlContent?.replace(/<a href="([^"]+)" target="_blank">/g, '<span>');
    const reg1 = htmlContent?.replace(/<a/g, '<span');
    const reg2 = reg1?.replace(/<\/a>/g, '</span>');

    const modalTitle = switchTitle();

    Modal.open({
      title: modalTitle,
      key: iframeKey,
      drawer: true,
      style: { width: '60%' },
      footer: (okBtn) => okBtn,
      okText: intl.get('sdat.monitorStuff.view.button.close').d('关闭'),
      closable: false,
      mask: true,
      children: (
        <>
          {/* <div className={style['title-box']}>
            <div className={style.title}>{title}</div>
            <div className={style['sub-title']}>
              <span className={style.source}>{source}</span>
              <span className={style.date}>{publishTime}</span>
            </div>
            <div className={style['tag-box']}>
              {renderTypeTag({ text: emotionText, value: emotionType })}
              {newsTag?.split(',')?.map(item => (
                <Tag color="#F2F3F5" className={style['tag-item']}>
                  {`#${item}`}
                </Tag>
              ))}
            </div>
          </div> */}
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: reg2 }} className={style['html-box']} />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 200px)',
              }}
            >
              <div style={{ textAlign: 'center', height: '40px' }}>
                <NoContent style={{ width: '40px', height: '40px' }} />
              </div>
              <div className={style['chart-no-content-message']}>
                {intl.get('hzero.common.message.data.none').d('暂无数据')}
              </div>
            </div>
          )}
        </>
      ),
    });
  };

  const openEventUrl = () => {
    if (dimensionCode && detail.Id) {
      getNewsContent({
        indexCode: dimensionCode,
        detailId: detail.Id,
      }).then((res) => {
        if (getResponse(res)) {
          handleOpenIframe(res?.content, detail);
        }
      });
    }
  };

  const switchContent = (item, type, classes) => {
    // 裁判文书 法院公告 开庭公告
    const typeArr = [
      'docOther',
      'docDefendant',
      'docPlaintiff',
      'announceOther',
      'announceDefendant',
      'announcePlaintiff',
      'noticeOther',
      'noticeDefendant',
      'noticePlaintiff',
    ];

    if (item.fieldName === 'eventLevel') {
      return <Tag className={classes}>{item?.value ?? ''}</Tag>;
    }

    if (item.fieldName === 'eventName' && typeArr.includes(type)) {
      return <a onClick={() => openEventUrl(item)}>{item?.value ?? ''}</a>;
    }

    return item?.value ?? '';
  };

  /**
   * renderPenals: 迭代生成节点
   * @param {*} obj
   * @param {*} intlPrompt
   * @returns
   */
  const renderPenals = (obj = {}, intlPrompt = '', flag) => {
    if (!obj) return;
    // 先按照值的类型进行数据项的分离
    const keys = Object.keys(obj);
    const commonArr = [];
    const arrArr = [];
    keys.forEach((item) => {
      if (obj[item] instanceof Array) {
        arrArr.push({
          key: item,
          value: obj[item],
        });
      } else if (obj[item] instanceof Object) {
        arrArr.push({
          key: item,
          value: [obj[item]],
        });
      } else {
        commonArr.push({
          key: item,
          value: obj[item],
        });
      }
    });

    // 渲染当前obj下的普通字符项
    return (
      <>
        <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
          {flag
            ? localFields.map((item) => {
                const classNames = item.fieldName === 'eventLevel' ? classMap[item.level] : '';

                const content = switchContent(item, dimensionCode, classNames);

                return <Output key={item.u_id} label={item.label} value={content} />;
              })
            : null}
        </Form>

        <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
          {commonArr.map((arrItem) => {
            // 先检查是否为id和keyNo
            if (
              /id/i.exec(arrItem?.key ?? '') ||
              /keyno/i.exec(arrItem?.key ?? '') ||
              /categoryMeaning/i.exec(arrItem?.key ?? '') ||
              /emotionMeaning/i.exec(arrItem?.key ?? '') ||
              /SaveDate/i.exec(arrItem?.key ?? '') ||
              /Url/i.exec(arrItem?.key ?? '') ||
              (arrItem?.key ?? '') === 'Content'
            ) {
              return <></>;
            }

            const titleIntl = intl
              .get(`sdat.monitorStuff.${intlPrompt}.${arrItem?.key ?? ''}`)
              .d(arrItem?.key ?? '');

            const title = renderValue(
              arrItem?.value ?? '-',
              arrItem?.key ?? '',
              intlPrompt,
              'value'
            );

            // 只有多语言存在的数据才能显示
            return intlMapObj[`sdat.monitorStuff.${intlPrompt}.${arrItem?.key ?? ''}`] &&
              !(
                ['news', 'negativeNews', 'neutralNews'].includes(intlPrompt) &&
                ['EnterpriseName', 'SocialCode'].includes(arrItem?.key ?? '')
              ) ? (
                <Output key={uuid()} label={titleIntl} value={title} />
            ) : null;
          })}
        </Form>

        {arrArr?.map((arrItem) => {
          if ((arrItem?.value ?? null) instanceof Array) {
            if (!arrItem.value.length) {
              return null;
            }

            let hidden = false;
            const para = arrItem.value && arrItem.value.length ? arrItem.value[0] : null;
            const keyList = Object.keys(para);
            if (keyList.length) {
              keyList.forEach((keyCode) => {
                if (para[keyCode] instanceof Object && Object.keys(para[keyCode]).length) {
                  hidden = true;
                }
              });
            }

            return (
              intlMapObj[`sdat.monitorStuff.${intlPrompt}.${arrItem?.key ?? ''}`] && (
                <>
                  <div
                    className={style['second-level-title']}
                    style={{ display: hidden ? 'none' : 'block' }}
                  >
                    <div className={style['second-level-title-flag']} />
                    <span>
                      {intl
                        .get(`sdat.monitorStuff.${intlPrompt}.${arrItem?.key ?? ''}`)
                        .d(arrItem?.key ?? '')}
                    </span>
                  </div>
                  {arrItem?.value?.map((arrItemItem) => {
                    return renderPenals(
                      arrItemItem ?? {},
                      `${intlPrompt}.${arrItem?.key ?? ''}`,
                      ''
                    );
                  })}
                </>
              )
            );
          }

          return (
            intlMapObj[`sdat.monitorStuff.${intlPrompt}.${arrItem?.key ?? ''}`] && (
              <>
                <div
                  className={style['second-level-title']}
                  // style={{ display: Object.keys(arrItem?.value ?? {}).length ? 'none' : 'block' }}
                >
                  <div className={style['second-level-title-flag']} />
                  <span>
                    {intl
                      .get(`sdat.monitorStuff.${intlPrompt}.${arrItem?.key ?? ''}`)
                      .d(arrItem?.key ?? '')}
                  </span>
                </div>
                {renderPenals(arrItem?.value ?? {}, `${intlPrompt}.${arrItem?.key ?? ''}`, '')}
              </>
            )
          );
        })}
      </>
    );
  };

  /**
   * renderValue: 抽象一个渲染表单值的方法
   * @param {*} value
   * @returns
   */
  const renderValue = (value, code, type, tag) => {
    if (value === 'true') return intl.get('sdat.monitorStuff.view.item.yes').d('是');
    if (value === 'false') return intl.get('sdat.monitorStuff.view.item.no').d('否');
    if (!value) return '-';

    if (code === 'EmotionType') {
      // 情感类型
      return emotionMap[value] || '';
    }

    if (code === 'Category') {
      // 类别
      return categoryMap[value] || '';
    }

    if (code === 'RoleType') {
      // 角色类型
      return roleTypeMap[value] || '';
    }

    // 裁判文书 法院公告 开庭公告
    if (
      [
        'docOther',
        'docDefendant',
        'docPlaintiff',
        'announceOther',
        'announceDefendant',
        'announcePlaintiff',
        'noticeOther',
        'noticeDefendant',
        'noticePlaintiff',
      ].includes(type) &&
      code === 'Titlexxx'
    ) {
      return tag === 'value' ? <a onClick={openEventUrl}>{value}</a> : value;
    }

    return value;
  };

  /**
   * 生成第四种详情信息
   */
  const renderFour = (obj = {}) => {
    return (
      <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
        {showCommon
          ? localFields.map((item) => {
              const classNames = item.fieldName === 'eventLevel' ? classMap[item.level] : '';

              const content =
                item.fieldName === 'eventLevel' ? (
                  <Tag className={classNames}>{item?.value ?? ''}</Tag>
                ) : (
                  item?.value ?? ''
                );

              return <Output key={item.u_id} label={item.label} value={content} />;
            })
          : null}

        <Output
          key={uuid()}
          label={intl.get('sdat.monitorStuff.view.title.result').d('计算结果')}
          value={obj?.resultValue ?? ''}
        />
      </Form>
    );
  };

  /**
   * 生成第五种详情信息
   */
  const renderFive = (obj = {}) => {
    return (
      <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
        {showCommon
          ? localFields.map((item) => {
              const classNames = item.fieldName === 'eventLevel' ? classMap[item.level] : '';
              const content =
                item.fieldName === 'eventLevel' ? (
                  <Tag className={classNames}>{item?.value ?? ''}</Tag>
                ) : (
                  item?.value ?? ''
                );

              return <Output key={item.u_id} label={item.label} value={content} />;
            })
          : null}

        <Output key={uuid()} label={obj?.type ?? ''} value={obj?.basicInfo ?? ''} />
      </Form>
    );
  };

  /**
   * 生成第七种详情信息
   */
  const renderSeven = (obj = {}) => {
    return (
      <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
        {showCommon
          ? localFields.map((item) => {
              const classNames = item.fieldName === 'eventLevel' ? classMap[item.level] : '';
              const content =
                item.fieldName === 'eventLevel' ? (
                  <Tag className={classNames}>{item?.value ?? ''}</Tag>
                ) : (
                  item?.value ?? ''
                );

              return <Output key={item.u_id} label={item.label} value={content} />;
            })
          : null}

        <Output
          key={uuid()}
          label={intl.get('sdat.monitorStuff.SCOPE_OF_BUS.beforeInfo').d('变更前')}
          value={obj?.before ?? ''}
        />

        <Output
          key={uuid()}
          label={intl.get('sdat.monitorStuff.SCOPE_OF_BUS.afterInfo').d('变更后')}
          value={obj?.after ?? ''}
        />
      </Form>
    );
  };

  /**
   * 生成灾害风险详情信息
   */
  const renderDisaster = (obj = {}) => {
    const commonField = [
      'type',
      'country',
      'province',
      'source',
      'measureValue',
      'measureUnit',
      'longitude',
      'latitude',
      'depth',
      'startDate',
      'endDate',
      'durationTime',
    ];

    return (
      <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
        {showCommon
          ? localFields.map((item) => {
              const classNames = item.fieldName === 'eventLevel' ? classMap[item.level] : '';
              const content =
                item.fieldName === 'eventLevel' ? (
                  <Tag className={classNames}>{item?.value ?? ''}</Tag>
                ) : (
                  item?.value ?? ''
                );

              return <Output key={item.u_id} label={item.label} value={content} />;
            })
          : null}

        {commonField.map((item) => {
          return obj[item] ? (
            <Output
              key={uuid()}
              label={intl.get(`sdat.monitorStuff.disasterRisk.${item}`)}
              value={obj[item]}
            />
          ) : null;
        })}
      </Form>
    );
  };

  /**
   * 手工创建风险渲染
   */
  const renderManualNew = (obj) => {
    const classNames = classMap[obj.eventLevel];

    const content = (
      <Tag className={classNames}>{obj.eventLevel ? levelMap[obj.eventLevel] : ''}</Tag>
    );

    return (
      <Form columns={fieldWidth ? 3 : 2} labelLayout="float">
        <Output
          label={intl.get(`sdat.riskDefinition.model.riskDesc`).d('风险描述')}
          value={obj?.eventName ?? ''}
          colSpan={fieldWidth ? 3 : 2}
        />
        <Output
          label={intl.get(`sdat.riskControl.view.title.riskLevelDistribution`).d('风险级别')}
          value={content}
        />
        <Output
          label={intl.get(`sdat.riskDefinition.view.title.collectionTime`).d('采集时间')}
          value={obj?.eventTime ?? ''}
        />
        <Output
          label={intl.get(`sdat.riskDefinition.model.calculationDimension`).d('计算维度')}
          value={obj?.dimension ?? ''}
        />
      </Form>
    );
  };

  return (
    <div className={style['common-fields-basic']}>
      <div>{renderTree(detail, dimensionCode)}</div>
    </div>
  );
};

export default CommonDetail;
