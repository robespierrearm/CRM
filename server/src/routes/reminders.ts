import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// Получить все напоминания
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT * FROM reminders ORDER BY date_time ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения напоминаний:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать напоминание
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { tender_id, type, date_time, description, completed } = req.body;

    const result = await query(
      `INSERT INTO reminders (tender_id, type, date_time, description, completed, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [tender_id, type, date_time, description || null, completed || false, req.user!.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка создания напоминания:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить напоминание
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { tender_id, type, date_time, description, completed } = req.body;

    const result = await query(
      `UPDATE reminders SET
        tender_id = COALESCE($1, tender_id),
        type = COALESCE($2, type),
        date_time = COALESCE($3, date_time),
        description = $4,
        completed = COALESCE($5, completed)
       WHERE id = $6 RETURNING *`,
      [tender_id, type, date_time, description, completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Напоминание не найдено' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка обновления напоминания:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить напоминание
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM reminders WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Напоминание не найдено' });
    }

    res.json({ message: 'Напоминание успешно удалено' });
  } catch (error) {
    console.error('Ошибка удаления напоминания:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
