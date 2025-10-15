import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// Получить всех поставщиков
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT * FROM suppliers ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения поставщиков:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать поставщика
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, phone, email, contact_person } = req.body;

    const result = await query(
      `INSERT INTO suppliers (name, phone, email, contact_person, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, phone || null, email || null, contact_person || null, req.user!.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка создания поставщика:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить поставщика
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, contact_person } = req.body;

    const result = await query(
      `UPDATE suppliers SET
        name = COALESCE($1, name),
        phone = $2,
        email = $3,
        contact_person = $4
       WHERE id = $5 RETURNING *`,
      [name, phone, email, contact_person, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Поставщик не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка обновления поставщика:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить поставщика
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Поставщик не найден' });
    }

    res.json({ message: 'Поставщик успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления поставщика:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
