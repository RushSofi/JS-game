// const gameLogger = window.log.getLogger('game');
// gameLogger.setLevel('debug');
const gameLogger = typeof window !== 'undefined' && window.log
  ? window.log.getLogger('game')
  : { debug: () => {}, info: () => {}, error: () => {}, warn: () => {} };

export { gameLogger };
