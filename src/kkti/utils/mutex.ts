import { Mutex } from 'async-mutex';

const mutexMap = new Map<number, Mutex>();

export function getSessionMutex(sessionId: number): Mutex {
  if (!mutexMap.has(sessionId)) {
    mutexMap.set(sessionId, new Mutex());
  }
  return mutexMap.get(sessionId)!;
}
