import { db } from './db.js';

const insertStmt = db.prepare(`
  INSERT INTO events (task_id, user_id, username, title, completed_at)
  VALUES ($task_id, $user_id, $username, $title, $completed_at)
`);

const findByTaskIdStmt = db.prepare('SELECT id FROM events WHERE task_id = ?');

export function insertEvent(event) {
  const result = insertStmt.run({
    $task_id: event.task_id,
    $user_id: event.user_id,
    $username: event.username,
    $title: event.title,
    $completed_at: event.completed_at,
  });
  return result.lastInsertRowid;
}

export function findEventByTaskId(taskId) {
  return findByTaskIdStmt.get(taskId);
}

export function countCompletedToday() {
  const row = db
    .prepare(`SELECT COUNT(*) AS count FROM events WHERE date(completed_at) = date('now')`)
    .get();
  return row.count;
}

export function countByUser() {
  return db
    .prepare(`SELECT username, user_id, COUNT(*) AS count FROM events GROUP BY user_id, username ORDER BY count DESC`)
    .all();
}

export function countByDay() {
  return db
    .prepare(`SELECT date(completed_at) AS day, COUNT(*) AS count FROM events GROUP BY day ORDER BY day DESC`)
    .all();
}

export function countTotalEvents() {
  const row = db.prepare('SELECT COUNT(*) AS count FROM events').get();
  return row.count;
}
