/**
 *
 * @param rr The resizer handle (user provided)
 * @param re The resizable element that will response to the rr
 */
function handlelyResizable(rr, re, m = {}) {
  if (!window.HandlelyResizable) {
    window.HandlelyResizable = {
      rrdm: new WeakMap(),
      arr: null,
    };
  }

  const map = window.HandlelyResizable.rrdm;

  if (re === null) {
    map.delete(rr);

    return;
  }

  map.set(rr, {
    re,
    msx: 0,
    msy: 0,
    resw: 0,
    resh: 0,
    m: Object.assign({ x: 1, y: 1 }, m),
  });

  rr.addEventListener('mousedown', startDrag);
}

function startDrag(event) {
  const rr = event.target;
  const map = window.HandlelyResizable.rrdm;
  const rrdata = map.get(rr);

  map.set(
    rr,
    Object.assign({}, map.get(rr), {
      msx: event.clientX,
      msy: event.clientY,
      resw: parseInt(getComputedStyle(rrdata.re).width, 10),
      resh: parseInt(getComputedStyle(rrdata.re).height, 10),
    })
  );

  window.HandlelyResizable.arr = rr;

  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
}

function drag(event) {
  const rr = window.HandlelyResizable.arr;
  const map = window.HandlelyResizable.rrdm;
  const rrdata = map.get(rr);

  if (rrdata.m.x !== 0) {
    rrdata.re.style.width = `${rrdata.resw + rrdata.m.x * (event.clientX - rrdata.msx)}px`;
  }
  if (rrdata.m.y !== 0) {
    rrdata.re.style.height = `${rrdata.resh + rrdata.m.y * (event.clientY - rrdata.msy)}px`;
  }
}

function stopDrag() {
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
}

export default handlelyResizable;
