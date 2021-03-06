const data = {};

const cache = {
  set: (bin, key, value) => {
    if (!data[bin]) {
      data[bin] = {};
    }
    data[bin][key] = value;
  },

  get: (bin, key) => data[bin]?.[key],

  remove: (bin, key) => {
    if (data[bin]) {
      delete data[bin][key];
    }
  },

  countItems: bin => {
    if (data[bin]) {
      return Object.keys(data[bin]).length;
    }
    return 0;
  },

  reset: bin => {
    data[bin] = {};
  },
};

module.exports = { cache };
