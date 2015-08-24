import mutatis from './index';

export function first() {
  return mutatis(this[0]) ;
}

export function last() {
  return mutatis(this[this.length - 1]);
}
