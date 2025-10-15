import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);

// Получить расходы по тендеру
router.get('/tender/:tenderId', async (req: AuthRequest, res) => {
  try {
    const { tenderId } = req.params;
    const result = await query(
      'SELECT * FROM expenses WHERE tender_id = $1 ORDER BY created_at DESC',
      [tenderId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения расходов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать расход
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { tender_id, name, amount } = req.body;

    const result = await query(
      'INSERT INTO expenses (tender_id, name, amount) VALUES ($1, $2, $3) RETURNING *',
      [tender_id, name, amount]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка создания расхода:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить расход
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM expenses WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Расход не найден' });
    }

    res.json({ message: 'Расход успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления расхода:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
