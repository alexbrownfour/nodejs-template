const { promisify } = require('util');
const request = require('request');
const cheerio = require('cheerio');
const graph = require('fbgraph');
const { LastFmNode } = require('lastfm');
const GitHub = require('@octokit/rest');
const Twit = require('twit');
const Linkedin = require('node-linkedin')(process.env.LINKEDIN_ID, process.env.LINKEDIN_SECRET, process.env.LINKEDIN_CALLBACK_URL);


/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
  res.render('api/index', {
    title: 'API Examples'
  });
};

/**
 * GET /api/facebook
 * Facebook API example.
 */
exports.getFacebook = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'facebook');
  graph.setAccessToken(token.accessToken);
  graph.get(`${req.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err, profile) => {
    if (err) { return next(err); }
    res.render('api/facebook', {
      title: 'Facebook API',
      profile
    });
  });
};

/**
 * GET /api/github
 * GitHub API Example.
 */
// exports.getGithub = async (req, res, next) => {
//   const github = new GitHub();
//   try {
//     const { data: repo } = await github.repos.get({ owner: 'alexbrownfour', repo: 'cwmusic' });
//     res.render('api/github', {
//       title: 'GitHub API',
//       repo
//     });
//   } catch (error) {
//     next(error);
//   }
// };

/**
 * GET /api/lastfm
 * Last.fm API example.
 */
// exports.getLastfm = async (req, res, next) => {
//   const lastfm = new LastFmNode({
//     api_key: process.env.LASTFM_KEY,
//     secret: process.env.LASTFM_SECRET
//   });
//   const getArtistInfo = () =>
//     new Promise((resolve, reject) => {
//       lastfm.request('artist.getInfo', {
//         artist: 'Roniit',
//         handlers: {
//           success: resolve,
//           error: reject
//         }
//       });
//     });
//   const getArtistTopTracks = () =>
//     new Promise((resolve, reject) => {
//       lastfm.request('artist.getTopTracks', {
//         artist: 'Roniit',
//         handlers: {
//           success: ({ toptracks }) => {
//             resolve(toptracks.track.slice(0, 10));
//           },
//           error: reject
//         }
//       });
//     });
//   const getArtistTopAlbums = () =>
//     new Promise((resolve, reject) => {
//       lastfm.request('artist.getTopAlbums', {
//         artist: 'Roniit',
//         handlers: {
//           success: ({ topalbums }) => {
//             resolve(topalbums.album.slice(0, 3));
//           },
//           error: reject
//         }
//       });
//     });
//   try {
//     const { artist: artistInfo } = await getArtistInfo();
//     const topTracks = await getArtistTopTracks();
//     const topAlbums = await getArtistTopAlbums();
//     const artist = {
//       name: artistInfo.name,
//       image: artistInfo.image ? artistInfo.image.slice(-1)[0]['#text'] : null,
//       tags: artistInfo.tags ? artistInfo.tags.tag : [],
//       bio: artistInfo.bio ? artistInfo.bio.summary : '',
//       stats: artistInfo.stats,
//       similar: artistInfo.similar ? artistInfo.similar.artist : [],
//       topTracks,
//       topAlbums
//     };
//     res.render('api/lastfm', {
//       title: 'Last.fm API',
//       artist
//     });
//   } catch (err) {
//     next(err);
//   }
// };

/**
 * GET /api/twitter
 * Twitter API example.
 */
exports.getTwitter = async (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'twitter');
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  try {
    const { data: { statuses: tweets } } = await T.get('search/tweets', {
      q: 'nodejs since:2013-01-01',
      geocode: '40.71448,-74.00598,5mi',
      count: 10
    });
    res.render('api/twitter', {
      title: 'Twitter API',
      tweets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/twitter
 * Post a tweet.
 */
exports.postTwitter = (req, res, next) => {
  req.assert('tweet', 'Tweet cannot be empty').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/twitter');
  }

  const token = req.user.tokens.find(token => token.kind === 'twitter');
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.post('statuses/update', { status: req.body.tweet }, (err) => {
    if (err) { return next(err); }
    req.flash('success', { msg: 'Your tweet has been posted.' });
    res.redirect('/api/twitter');
  });
};

/**
 * GET /api/linkedin
 * LinkedIn API example.
 */
exports.getLinkedin = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'linkedin');
  const linkedin = Linkedin.init(token.accessToken);
  linkedin.people.me((err, $in) => {
    if (err) { return next(err); }
    res.render('api/linkedin', {
      title: 'LinkedIn API',
      profile: $in
    });
  });
};

/**
 * GET /api/upload
 * File Upload API example.
 */

exports.getFileUpload = (req, res) => {
  res.render('api/upload', {
    title: 'File Upload'
  });
};

exports.postFileUpload = (req, res) => {
  req.flash('success', { msg: 'File was uploaded successfully.' });
  res.redirect('/api/upload');
};


exports.getGoogleMaps = (req, res) => {
  res.render('api/google-maps', {
    title: 'Google Maps API',
    google_map_api_key: process.env.GOOGLE_MAP_API_KEY
  });
};
