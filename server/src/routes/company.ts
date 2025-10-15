import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken, AuthRequest, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// Получить информацию о компании
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT * FROM company_info LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Информация о компании не найдена' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения информации о компании:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить информацию о компании (только для админа)
router.put('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, inn, address } = req.body;

    // Проверяем, существует ли запись
    const existing = await query('SELECT id FROM company_info LIMIT 1');

    let result;
    if (existing.rows.length === 0) {
      // Создаем новую запись
      result = await query(
        'INSERT INTO company_info (name, inn, address) VALUES ($1, $2, $3) RETURNING *',
        [name, inn || null, address || null]
      );
    } else {
      // Обновляем существующую
      result = await query(
        `UPDATE company_info SET
          name = COALESCE($1, name),
          inn = $2,
          address = $3
         WHERE id = $4 RETURNING *`,
        [name, inn, address, existing.rows[0].id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка обновления информации о компании:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
