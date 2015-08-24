import mutatis from './index';

let warned = false;
function warn() {
  if (warned) return;
  warned = true;
  console.warn('map(), reduce(), filter() on maps might be removed in the future. Convert to an array first using keys(), values(), or entries().');
}

function defined(val) {
  return (val !== null) && (val !== undefined);
}

export function keys() {
  return Object.keys(this);
}

export function values() {
  return Object.keys(this).map(k => this[k]);
}

export function entries() {
  return Object.keys(this).map(k => [k, this[k]]);
}

export function first() {
  return this[Object.keys(this)[0]];
}

export function last() {
  return this[Object.keys(this)[this.size - 1]];
}

export function set(key, value) {
  return setIn.call(this, key.split('.'), value);
}

export function setIn(keyPath, value) {
  if (keyPath.length === 1) return mutatis(Object.assign({}, this, {[keyPath[0]]: value}));
  return setIn.call(this, [keyPath[0]], setIn.call(this[keyPath[0]] || {}, keyPath.slice(1), value));
}

export function setDefault(key, defaultValue) {
  return setDefaultIn.call(this, key.split('.'), defaultValue);
}

export function setDefaultIn(keyPath, defaultValue) {
  return setIn.call(this, keyPath, getIn.call(this, keyPath, defaultValue));
}

export function get(key, value) {
  return getIn.call(this, key.split('.'), value);
}

export function getIn(keyPath, defaultValue) {
  if (this === undefined) return defaultValue;
  if (keyPath.length === 1) return defined(this[keyPath[0]]) ? this[keyPath[0]] : defaultValue;
  return getIn.call(this[keyPath[0]], keyPath.slice(1), defaultValue);
}

export function update(key, defaultValue, mutator) {
  return updateIn.call(this, key.split('.'), defaultValue, mutator);
}

export function updateIn(keyPath, defaultValue, mutator) {
  if (!mutator) {
    mutator = defaultValue;
    defaultValue = undefined;
  }
  return setIn.call(this, keyPath, mutator(getIn.call(this, keyPath, defaultValue)));
}

export function remove(key) {
  return removeIn.call(this, key.split('.'));
}

export function removeIn(keyPath) {
  if (keyPath.length === 1) {
    const res = Object.assign({}, this);
    delete res[keyPath[0]];
    return mutatis(res);
  }
  return setIn.call(this, [keyPath[0]], removeIn.call(this[keyPath[0]], keyPath.slice(1)));
}

export function map(f) {
  warn();
  return mutatis(Object.keys(this).map((key, i) =>
    [key, f(this[key], key, i)]
  ).reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {}));
}

export function reduce(f, initialValue) {
  warn();
  return mutatis(Object.keys(this).reduce((value, key) => {
    return f(value, this[key], key);
  }, initialValue));
}

export function filter(f) {
  warn();
  return mutatis(Object.keys(this).map((key, i) =>
    [key, f(this[key], key, i)]
  ).reduce((obj, [key, test]) => {
    if (test) obj[key] = this[key];
    return obj;
  }, {}));
}

export function forEach(f) {
  Object.keys(this).forEach((key, i) =>
    f(this[key], key, i)
  );
}

function isPlainObject(value) {
  return value && (value.constructor === Object || value.constructor === undefined) && !value._isReactElement;
}

export function mergeDeep(other) {
  if (!isPlainObject(this)) return other;
  if (!isPlainObject(other)) return other;
  return mutatis(Object.keys(other).reduce((obj, key) => {
    obj[key] = mergeDeep.call(obj[key], other[key]);
    return obj;
  }, Object.assign({}, this)));
}

export function sortBy(f) {
  const sorted = Object.keys(this).map(key => {
    return [f(this[key], key), key, this[key]];
  });
  return mutatis(sorted.sort((a, b) => {
    return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
  }).reduce((obj, [sorter, key, value]) => {
    obj[key] = value;
    return obj;
  }, {}));
}

