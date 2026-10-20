export const CalculateFileSize = (size) => {
  let sizeStr = null;
  if (size / 1024 / 1024 > 1) {
    sizeStr = `${(size / 1024 / 1024).toFixed(2)}M`;
  } else if (size / 1024 > 1) {
    sizeStr = `${(size / 1024).toFixed(2)}KB`;
  } else {
    sizeStr = `${size}B`;
  }
  return sizeStr;
};

export const isAppleDevice = () => {
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
};

export const getImageSize = (imageFile, result) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const url = event.target.result;
    const img = document.createElement('img');
    img.src = url;
    img.onload = () => {
      result({ width: img.width, height: img.height });
    };
  };
  reader.readAsDataURL(imageFile);
};

export const dateFormat = (date, format = 'YYYY-MM-dd HH:mm:ss') => {
  const year = date.getFullYear();
  const mounth = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const second = date.getSeconds();

  let result = format.replace('YYYY', year);
  result = result.replace('MM', mounth < 10 ? `0${mounth}` : mounth);
  result = result.replace('dd', day < 10 ? `0${day}` : day);
  result = result.replace('HH', hour < 10 ? `0${hour}` : hour);
  result = result.replace('mm', minutes < 10 ? `0${minutes}` : minutes);
  result = result.replace('ss', second < 10 ? `0${second}` : second);
  return result;
};
