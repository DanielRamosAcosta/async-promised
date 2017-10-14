import filter = require('./filter');
import filterLimit = require('./filterLimit');
import filterSeries = require('./filterSeries');
import reject = require('./reject');
import rejectLimit = require('./rejectLimit');
import rejectSeries = require('./rejectSeries');

export = {
  filter,
  filterLimit,
  filterSeries,
  reject,
  rejectLimit,
  rejectSeries,
  select: filter,
  selectSeries: filterSeries
};
