/* eslint-disable react/no-danger */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/aria-role */
import React, { useMemo, useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import intl from 'utils/intl';
import { Icon, Popover, Row, Col, Tooltip } from 'choerodon-ui';

const style = {
  height: '135px',
  overflow: 'hidden',
};

const SourceBox = ({ record, children, forbidDrag, aggregation }) => {
  const [canEdit, setForbidDrag] = useState(false);

  useEffect(() => {
    setForbidDrag(forbidDrag);
  }, [forbidDrag]);

  const [{ isDragging }, drag] = useDrag({
    item: {
      ...record,
      type: record.dragType,
    },
    canDrag: canEdit,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const containerStyle = useMemo(
    () => ({
      ...style,
      border: '1px solid rgba(229,231,236,1)',
      borderRadius: '5px',
      boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.12)',
    }),
    [canEdit]
  );

  const cardListStyle = useMemo(
    () => ({
      border: '1px solid #E5E7EC',
      padding: '8px 16px',
      height: '56px',
      cursor: !canEdit ? 'default' : 'move',
    }),
    [canEdit]
  );

  const content = useMemo(() => {
    return (
      <div style={{ width: '328px' }}>
        <div
          style={{ lineHeight: '18px', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}
        >
          {record.name}
        </div>
        <div style={{ ...containerStyle, width: '320px', height: '180px', margin: '0 auto' }}>
          <img
            draggable="false"
            alt=""
            src={record.previewPictureUrl}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div style={{ lineHeight: '18px', color: '#868D9C', marginTop: '8px' }}>
          {record.remark || ''}
        </div>
      </div>
    );
  }, [record]);

  return (
    <div ref={drag} role="SourceBox">
      {!aggregation ? (
        <div style={cardListStyle}>
          <Popover content={content} title="" placement="left">
            <div>
              <div
                style={{ display: 'inline-block', width: '20px', marginTop: '10px', float: 'left' }}
              >
                <Icon type="more_vert" />
              </div>
              <div style={{ display: 'inline-block', width: '230px', overflow: 'hidden' }}>
                <div style={{ lineHeight: '18px' }}>
                  <span style={{ verticalAlign: 'middle', fontSize: '14px', marginLeft: '8px' }}>
                    {record.name}
                  </span>
                </div>
                <div
                  style={{
                    lineHeight: '18px',
                    height: '18px',
                    color: record.remark ? '#868D9C' : '#868D9C',
                    paddingLeft: '8px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <Tooltip
                    title={
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            record.remark ||
                            intl.get('sdat.reportConfig.view.message.noContent').d('暂无描述'),
                        }}
                      />
                    }
                  >
                    {record.remark ||
                      intl.get('sdat.reportConfig.view.message.noContent').d('暂无描述')}
                  </Tooltip>
                </div>
              </div>
            </div>
          </Popover>
        </div>
      ) : (
        <div style={{ padding: '12px 8px', background: '#F2F3F5', borderRadius: '5px' }}>
          <div style={{ lineHeight: '18px', fontSize: '14px' }}>{record.name}</div>
          <div
            style={{
              lineHeight: '18px',
              height: '18px',
              color: record.remark ? '#868D9C' : '#868D9C',
              marginTop: '2px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              width: '230px',
            }}
          >
            <Tooltip
              title={
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      record.remark ||
                      intl.get('sdat.reportConfig.view.message.noContent').d('暂无描述'),
                  }}
                />
              }
            >
              {record.remark || intl.get('sdat.reportConfig.view.message.noContent').d('暂无描述')}
            </Tooltip>
          </div>
          <div
            style={{ ...containerStyle, marginTop: '8px', cursor: !canEdit ? 'default' : 'move' }}
          >
            <img
              draggable="false"
              alt=""
              src={record.previewPictureUrl}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceBox;
