const log = require('single-line-log').stdout;

class ProgressBar {
  constructor (description, total, barLength) {
    this.description = description || 'Progress';
    if (!total) {
      throw new Error('total value can not be null');
    }
    this.total = total || 100;
    this.length = barLength || 25
  }
  render (current) {
    let percent = (current / this.total).toFixed(4);
    let cellNum = Math.floor(percent * this.length);
    // connect black strips
    let cell = '';
    for (let i = 0; i < cellNum; i++) {
      cell += '█'
    }
    // connect gray strips
    let empty = '';
    for (let i = 0; i < this.length - cellNum; i++) {
      empty += '░'
    }
    let text = this.description + ': ' + (100 * percent).toFixed(2) + '% ' + cell + empty + ' ' + current + '/' + this.total + '\n';
    log(text)
  }
}

module.exports = ProgressBar;
