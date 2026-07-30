import { logger } from './logger';

const marks: Record<string, number> = {};
const measures: Array<{ name: string; duration: number; timestamp: string }> = [];

export const perf = {
  mark(name: string) {
    marks[name] = performance.now();
  },

  measure(name: string, startMark: string) {
    const start = marks[startMark];
    if (start === undefined) return;
    const duration = performance.now() - start;
    measures.push({
      name,
      duration: Math.round(duration),
      timestamp: new Date().toISOString(),
    });
    logger.log('NAVIGATION', `Perf: ${name} took ${Math.round(duration)}ms`);
  },

  getMeasures() {
    return [...measures];
  },

  clear() {
    Object.keys(marks).forEach((k) => delete marks[k]);
    measures.length = 0;
  },

  report() {
    const report = measures
      .map((m) => `${m.name}: ${m.duration}ms`)
      .join('\n');
    return report || 'No performance measures recorded.';
  },
};
