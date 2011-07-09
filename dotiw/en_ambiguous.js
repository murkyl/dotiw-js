var DOTIW_EN_AMBIGUOUS = {
  'en-ambiguous': {
    pluralization: function(num) {
      switch (num) {
        case 0:
          return 'zero';
          break;
        case 1:
          return 'one';
          break;
        case 2:
          return 'two';
          break;
      }
      if (num < 5) {
        return 'few';
      }
      if (num < 7) {
        return 'many';
      }
      return 'other';
    },
    half_a_minute: 'half a minute',
    less_than_x_seconds: {
      one: 'less than 1 second',
      other: 'less than %{count} seconds'
    },
    x_seconds: {
      pluralization: function(num) {
        return(num == 1 ? 'one' : (num > 1 && num < 10 ? 'some' : 'other'));
      },
      one: '1 second',
      some: 'some seconds',
      other: '%{count} seconds'
    },
    less_than_x_minutes: {
      one: 'less than a minute',
      other: 'less than %{count} minutes'
    },
    x_minutes: {
      one: '1 minute',
      two: 'a couple minutes',
      few: 'a few minutes',
      many: 'many minutes',
      other: '%{count} minutes'
    },
    about_x_hours: {
      one: 'about 1 hour',
      other: 'about %{count} hours'
    },
    x_hours: {
      one: '1 hour',
      two: 'a couple hours',
      few: 'a few hours',
      many: 'many hours',
      other: '%{count} hours'
    },
    x_days: {
      one: '1 day',
      two: 'a couple days',
      few: 'a few days',
      many: 'many days',
      other: '%{count}  days'
    },
    x_months: {
      one: '1 month',
      two: 'a couple months',
      few: 'a few months',
      many: 'many months',
      other: '%{count} months'
    },
    about_x_months: {
      one: 'about 1 month',
      other: 'about %{count} months'
    },
    about_x_years: {
      one: 'about 1 year',
      other: 'about %{count} years'
    },
    over_x_years: {
      one: 'over 1 year',
      other: 'over %{count} years'
    },
    almost_x_years: {
      one: 'almost 1 year',
      other: 'almost %{count} years'
    },
    x_years: {
      one: '1 year',
      two: 'a couple years',
      few: 'a few years',
      many: 'many years',
      other: '%{count} years'
    },
    words_connector: ', ',
    two_words_connector: ' and ',
    last_word_connector: ', and '
  }
}
