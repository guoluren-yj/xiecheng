import React, { useRef, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import icons from './importImg';
import styles from './index.less';

const ImgIcon = observer(
  ({
    hoverDomRef,
    name,
    hoverName,
    size = '20px',
    hoverDelay = 300,
    style,
    _imgStyle,
    className,
    alt,
    ...props
  }) => {
    const [isHover, setIsHover] = useState(false);
    const ref = useRef();
    useEffect(() => {
      const mouseenter = () => {
        setIsHover(true);
      };
      const mouseleave = () => {
        setIsHover(false);
      };
      if (hoverName && (hoverDomRef || ref).current) {
        (hoverDomRef || ref).current.addEventListener('mouseenter', mouseenter);
        (hoverDomRef || ref).current.addEventListener('mouseleave', mouseleave);
        return () => {
          if ((hoverDomRef || ref)?.current?.removeEventListener) {
            (hoverDomRef || ref).current.removeEventListener('mouseenter', mouseenter);
            (hoverDomRef || ref).current.removeEventListener('mouseleave', mouseleave);
          }
        };
      }
    }, [hoverDomRef, hoverName, name]);

    return (
      <i
        className={`${className} ${styles.imgIcon}`}
        // @ts-ignore
        style={{ verticalAlign: 'sub', width: size, height: size, ...style }}
        hidden={props.hidden}
      >
        {name && !name?.startsWith('undefined') && (
          <img
            {...props}
            ref={ref}
            src={icons.get(name)}
            alt={alt || `${name}-icon`}
            style={{
              width: '100%',
              height: '100%',
              verticalAlign: 'sub',
              transition: `all ${hoverDelay}ms`,
              ...(_imgStyle || {}),
            }}
            className={`${isHover ? styles.opacity0 : styles.opacity1}`}
          />
        )}
        {hoverName && !hoverName?.startsWith('undefined') && (
          <img
            {...props}
            ref={ref}
            src={icons.get(hoverName)}
            alt={alt || `${hoverName}-icon`}
            style={{
              width: '100%',
              height: '100%',
              verticalAlign: 'sub',
              transition: `all ${hoverDelay}ms`,
              ...(_imgStyle || {}),
            }}
            className={`${isHover ? styles.opacity1 : styles.opacity0}`}
          />
        )}
      </i>
    );
  }
);

export default ImgIcon;
